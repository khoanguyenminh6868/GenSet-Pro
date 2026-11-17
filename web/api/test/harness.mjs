// Bộ giả dùng chung cho test API Vercel: Supabase trong bộ nhớ (thay globalThis.fetch), req/res giả.
// Không gọi mạng, không cần biến môi trường thật. Nhập tệp này ĐẦU TIÊN trong mỗi tệp test: nó đặt biến môi trường
// trước khi handler được nạp (các handler đọc SUPABASE_URL / khoá dịch vụ ngay lúc nạp module).
import { Writable } from "node:stream";

export const SB = "https://testref.supabase.co";
export const SERVICE = "service-role-key-for-tests";
export const ANON = "anon-key-for-tests";
export const INGEST = "ingest-token-for-tests-0123456789abcdef"; // ≥ 32 ký tự
export const GH_TOKEN = "gh-token-for-tests";
process.env.SUPABASE_URL = SB;
process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE;
process.env.SUPABASE_ANON_KEY = ANON;
process.env.INGEST_TOKEN = INGEST;
process.env.GITHUB_TOKEN = GH_TOKEN;
process.env.GITHUB_REPO = "owner/repo";

let n = 0;
// Nạp lại một handler với module-state mới (viewSkipUntil, bucketReady…) và biến môi trường chỉ định.
export async function fresh(rel, env = {}) {
  for (const [k, v] of Object.entries(env)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  return (await import(new URL(`../${rel}?t${++n}`, import.meta.url).href)).default;
}

const json = (o, status = 200, headers = {}) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", ...headers } });
const text = (t, status = 200) => new Response(t, { status });
const quoted = (s) => [...String(s).matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1].replace(/\\(.)/g, "$1"));
const inList = (v) => (v.startsWith("in.(") ? (v.includes('"') ? quoted(v) : v.slice(4, -1).split(",")) : null);
const dec = (s) => decodeURIComponent(s);

// db: { docs: Map("coll/id" -> {coll,id,data,updated_at}), activity: [{id,coll,at}], tokens, members, files, buckets, calls }
export function makeDb() {
  const db = {
    docs: new Map(), activity: [], tokens: {}, members: {}, files: new Map(), buckets: new Set(["scratch", "quote", "bcdg"]),
    calls: [], gh: { assets: {}, releases: [], blobs: {} },
    // pendingView: "auto" (tính từ docs) | số (HTTP status) | "garbage" | "throw" | "badrow"
    pendingView: "auto", liteView: 404, failDocsRead: false, failDocsWrite: false, failActivityRead: false,
    override: null, trigger: true,
    put(coll, id, data, updated_at = "2026-01-01T00:00:00.000Z") { db.docs.set(`${coll}/${id}`, { coll, id, data, updated_at }); return db; },
    get(coll, id) { return db.docs.get(`${coll}/${id}`); },
    of(coll) { return [...db.docs.values()].filter((d) => d.coll === coll); },
    where(pred) { return db.calls.filter(pred); },
    member(token, email, role) { db.tokens[token] = email; if (role) db.members[email.toLowerCase()] = role; return db; },
  };
  return db;
}

function range(req, rows) {
  const r = (req.headers.Range || req.headers.range || "").match(/^(\d+)-(\d+)$/);
  return r ? rows.slice(+r[1], +r[2] + 1) : rows;
}
function project(d, select) {
  const out = {};
  for (const tok of select.split(",")) {
    const al = tok.match(/^(\w+):data->>(\w+)$/);
    if (al) out[al[1]] = d.data?.[al[2]] ?? null;
    else if (tok === "data") out.data = d.data;
    else if (tok in d) out[tok] = d[tok];
  }
  return out;
}

export function installFetch(db) {
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const u = new URL(String(url)), method = (init.method || "GET").toUpperCase();
    const req = { url: String(url), method, headers: init.headers || {}, body: init.body, u };
    let body = null;
    if (typeof init.body === "string") { try { body = JSON.parse(init.body); } catch { body = init.body; } }
    db.calls.push({ url: String(url), path: u.pathname, search: u.search, method, headers: init.headers || {}, body, raw: init.body, redirect: init.redirect });
    if (db.override) { const o = await db.override(req, body); if (o) return o; }
    return route(db, req, body);
  };
  return () => { globalThis.fetch = real; };
}

function route(db, req, body) {
  const { u, method } = req, p = u.pathname, q = u.searchParams;
  if (u.origin === SB) {
    if (p === "/auth/v1/user") {
      const tok = String(req.headers.Authorization || "").replace(/^Bearer\s+/i, "");
      return db.tokens[tok] ? json({ email: db.tokens[tok] }) : json({ error: "bad" }, 401);
    }
    if (p === "/rest/v1/members") {
      const e = dec(q.get("email") || "").replace(/^eq\./, "");
      return json(db.members[e] ? [{ email: e, role: db.members[e] }] : []);
    }
    if (p === "/rest/v1/pending_requests") return pendingView(db, req);
    if (p === "/rest/v1/analysis_lite") return liteView(db, req);
    if (p === "/rest/v1/activity_log") return activityLog(db, req, body);
    if (p === "/rest/v1/docs") return docsRoute(db, req, body);
    if (p.startsWith("/storage/v1/")) return storage(db, req, body);
  }
  if (u.origin === "https://api.github.com") return github(db, req);
  if (u.origin === "https://objects.example") return blobs(db, req);
  return json({ error: `fake: không biết ${method} ${req.url}` }, 599);
}

function filterDocs(db, q) {
  let rows = [...db.docs.values()];
  const c = q.get("coll");
  if (c?.startsWith("eq.")) rows = rows.filter((d) => d.coll === c.slice(3));
  else if (c?.startsWith("in.(")) { const set = c.slice(4, -1).split(","); rows = rows.filter((d) => set.includes(d.coll)); }
  const id = q.get("id");
  if (id?.startsWith("eq.")) rows = rows.filter((d) => d.id === id.slice(3));
  else if (id?.startsWith("in.(")) { const set = inList(id); rows = rows.filter((d) => set.includes(d.id)); }
  return rows.sort((a, b) => (a.coll === b.coll ? (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) : a.coll < b.coll ? -1 : 1));
}

function docsRoute(db, req, body) {
  const { u, method } = req, q = u.searchParams;
  if (method === "GET") {
    if (db.failDocsRead) return text("boom", 500);
    return json(range(req, filterDocs(db, q)).map((d) => project(d, q.get("select") || "id,data")));
  }
  if (method === "POST") {
    if (db.failDocsWrite) return text("write boom", 500);
    for (const r of body) {
      db.docs.set(`${r.coll}/${r.id}`, { coll: r.coll, id: r.id, data: r.data, updated_at: r.updated_at });
      // bộ kích hoạt của CSDL ghi nhật ký cho mỗi lần ghi docs (synclog là dấu "đã Sync hôm nay")
      if (db.trigger) db.activity.push({ id: db.activity.length + 1, coll: r.coll, at: r.updated_at });
    }
    return new Response(null, { status: 201 });
  }
  if (method === "PATCH") {
    const rows = filterDocs(db, q);
    for (const d of rows) { Object.assign(d, body); }
    return new Response(null, { status: 204 });
  }
  return text("?", 405);
}

function pendingView(db, req) {
  const m = db.pendingView;
  if (m === "throw") throw new Error("network down");
  if (typeof m === "number") return text("x", m);
  if (m === "garbage") return json({ message: "not a list" });
  if (m === "badrow") return json([{ coll: 1, id: null }]);
  const REQ = ["hsmtreq", "analysisreq", "syncreq", "translationreq", "comparereq", "hsdtreq", "tlktreq", "supplierreq", "configreq", "findreq", "bidpricereq", "specreq"];
  const rows = [...db.docs.values()].filter((d) => REQ.includes(d.coll) && ((d.coll === "syncreq" && d.id === "current") || (d.data?.requestedAt && (d.data.doneAt || "") < d.data.requestedAt)));
  rows.sort((a, b) => (a.coll === b.coll ? (a.id < b.id ? -1 : 1) : a.coll < b.coll ? -1 : 1));
  return json(rows.map((d) => ({ coll: d.coll, id: d.id, requestedAt: d.data?.requestedAt ?? null, doneAt: d.data?.doneAt ?? null, mode: d.data?.mode ?? null })));
}

function liteView(db, req) {
  const m = db.liteView;
  if (m === "throw") throw new Error("network down");
  if (typeof m === "number") return text("x", m);
  if (m === "notlite") return json(filterDocs(db, new URLSearchParams("coll=eq.analysis")).map((d) => ({ id: d.id, updated_at: d.updated_at, data: d.data })));
  // dạng của view: bản rút gọn tính trong Postgres (khoá _lite đứng đầu hay cuối tuỳ Postgres; ở đây đặt đầu để thử lastLite)
  const q = req.u.searchParams;
  const rows = range(req, filterDocs(db, new URLSearchParams(`coll=eq.analysis${q.get("id") ? `&id=${encodeURIComponent(q.get("id"))}` : ""}`)));
  return json(rows.map((d) => ({ id: d.id, updated_at: d.updated_at, data: { _lite: true, ...d.data } })));
}

function activityLog(db, req, body) {
  const { u, method } = req, q = u.searchParams;
  if (method === "POST") { db.activity.push({ id: db.activity.length + 1, ...body }); return new Response(null, { status: 201 }); }
  const gte = (q.get("at") || "").match(/^gte\.(.*)$/), lt = (q.getAll("at").find((x) => x.startsWith("lt.")) || "").slice(3);
  if (method === "GET") {
    if (db.failActivityRead) return text("boom", 500);
    let rows = db.activity.filter((r) => (!q.get("coll") || r.coll === q.get("coll").replace(/^eq\./, "")) && (!gte || r.at >= gte[1]));
    if (q.get("limit")) rows = rows.slice(0, +q.get("limit"));
    return json(rows.map((r) => ({ id: r.id })));
  }
  if (method === "DELETE") { db.activity = db.activity.filter((r) => !(lt && r.at < lt)); return new Response(null, { status: 204 }); }
  return text("?", 405);
}

function storage(db, req, body) {
  const { u, method } = req, p = u.pathname.replace("/storage/v1", "");
  if (p === "/bucket" && method === "POST") {
    if (db.buckets.has(body.id)) return json({ error: "Duplicate", message: "The resource already exists" }, 409);
    db.buckets.add(body.id); return json({ name: body.id });
  }
  let m;
  if ((m = p.match(/^\/object\/upload\/sign\/([^/]+)\/(.+)$/)) && method === "POST") {
    if (db.signStatus) return text("nope", db.signStatus);
    return json({ url: db.signRel ?? `/object/upload/sign/${m[1]}/${m[2]}?token=tkn` });
  }
  if ((m = p.match(/^\/object\/sign\/([^/]+)\/(.+)$/)) && method === "POST") {
    const path = decodeURIComponent(m[2]);
    if (db.signStatus) return text("nope", db.signStatus);
    if (!db.files.has(`${m[1]}/${path}`)) return json({ error: "not found" }, 400);
    return json({ signedURL: `/object/sign/${m[1]}/${m[2]}?token=sig` });
  }
  if ((m = p.match(/^\/object\/list\/([^/]+)$/)) && method === "POST") {
    const prefix = body.prefix.replace(/\/?$/, "/"), seen = new Map();
    for (const k of db.files.keys()) {
      if (!k.startsWith(`${m[1]}/${prefix}`)) continue;
      const rest = k.slice(m[1].length + 1 + prefix.length), name = rest.split("/")[0];
      seen.set(name, rest.includes("/") ? { name, id: null } : { name, id: "f-" + name });
    }
    return json([...seen.values()]);
  }
  if (p === "/object/scratch" && method === "DELETE" || p === "/object/quote" && method === "DELETE") {
    for (const x of body.prefixes) db.files.delete(`${p.split("/")[2]}/${x}`);
    return json([]);
  }
  if ((m = p.match(/^\/object\/([^/]+)\/(.+)$/))) {
    const path = decodeURIComponent(m[2]), key = `${m[1]}/${path}`;
    if (method === "GET") {
      if (db.getStatus) return text("x", db.getStatus);
      const f = db.files.get(key);
      if (!f) return json({ error: "not found" }, 404);
      return new Response(f.data, { status: 200, headers: { "content-type": f.type || "application/octet-stream", "content-length": String(f.data.length) } });
    }
    if (method === "POST") {
      if (!db.buckets.has(m[1])) return json({ error: "Bucket not found" }, 400);
      if (db.putStatus) return text("x", db.putStatus);
      db.files.set(key, { data: Buffer.from(req.body), type: req.headers["Content-Type"] });
      return json({ Key: key });
    }
  }
  return json({ error: `fake storage: ${req.method} ${p}` }, 599);
}

function github(db, req) {
  const { u, method } = req, p = u.pathname;
  let m;
  if ((m = p.match(/^\/repos\/owner\/repo\/releases\/assets\/(\d+)$/))) {
    const a = db.gh.assets[m[1]];
    if (!a) return json({ message: "Not Found" }, a === undefined ? 404 : 500);
    if (a.metaStatus) return text("x", a.metaStatus);
    const accept = req.headers.Accept || "";
    if (accept.includes("octet-stream")) return a.noLocation ? text("x", 200) : new Response(null, { status: 302, headers: { location: `https://objects.example/file/${m[1]}` } });
    return json(a.meta);
  }
  if (p === "/repos/owner/repo/releases" && method === "GET") return json(u.searchParams.get("page") === "1" ? db.gh.releases : []);
  if ((m = p.match(/^\/repos\/owner\/repo\/(releases\/\d+|git\/refs\/tags\/.+)$/)) && method === "DELETE") return new Response(null, { status: 204 });
  if ((m = p.match(/^\/repos\/owner\/repo\/releases\/assets\/(\d+)$/))) return text("x", 404);
  return json({ error: "fake gh" }, 599);
}
function blobs(db, req) {
  const id = req.u.pathname.split("/").pop(), a = db.gh.assets[id];
  if (!a || a.fileStatus) return text("x", a?.fileStatus || 404);
  const r = req.headers.Range;
  if (r) return new Response(a.bytes.subarray(0, 4), { status: 206, headers: { "content-range": `bytes 0-3/${a.bytes.length}`, "content-length": "4" } });
  return new Response(a.bytes, { status: 200, headers: { "content-length": String(a.bytes.length) } });
}

// ---- req / res giả ----
export function mkReq({ method = "GET", query = {}, body, headers = {}, token, bearer } = {}) {
  const h = { ...headers };
  if (token) h.authorization = `Bearer ${token}`;
  if (bearer) h.authorization = `Bearer ${bearer}`;
  return { method, query, body, headers: h };
}
class Res extends Writable {
  constructor() { super(); this.statusCode = 200; this.headers = {}; this.chunks = []; this.piped = false; this.redirectTo = null; this.jsonBody = undefined; this.on("pipe", () => { this.piped = true; }); }
  _write(c, _e, cb) { this.chunks.push(Buffer.from(c)); cb(); }
  status(c) { this.statusCode = c; return this; }
  setHeader(k, v) { this.headers[k.toLowerCase()] = String(v); }
  json(o) { this.jsonBody = o; return this; }
  redirect(c, url) { this.statusCode = c; this.redirectTo = url; return this; }
  get bytes() { return Buffer.concat(this.chunks); }
}
// Chạy handler; nếu nó pipe luồng vào res thì chờ luồng xong.
export async function call(handler, req) {
  const res = new Res();
  await handler(req, res);
  if (res.piped && !res.writableFinished) await new Promise((ok) => res.once("finish", ok));
  return res;
}

// Thứ tự cuộc gọi: chỉ số cuộc gọi đầu tiên khớp (để kiểm "ghi sau khi dọn").
export const idxOf = (db, pred) => db.calls.findIndex(pred);
export const sbDocsWrites = (db) => db.calls.filter((c) => c.method === "POST" && c.path === "/rest/v1/docs");
