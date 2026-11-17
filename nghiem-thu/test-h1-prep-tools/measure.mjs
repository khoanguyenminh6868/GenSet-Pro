// Before/after proof for the H1 split: a fake web from a frozen doc-cache snapshot, then prep (CLI), findPrep, specPrep.
// node measure.mjs <worktree> <outDir>   → writes <outDir>/md5.json
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const [wt, out] = process.argv.slice(2);
const S = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const snap = (f) => JSON.parse(fs.readFileSync(path.join(S, "snap", f), "utf8")).docs;
const analysis = snap("analysis.json"), supexcl = snap("supexcl.json"), supplier = snap("supplier.json");
const RUNS = path.join(wt, "suppliers", "fixtures", "runs");
const fx = (key) => { const f = fs.readdirSync(path.join(RUNS, key)).find((f) => /^config(-1)?\.input\.json\.gz$/.test(f)); return JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(RUNS, key, f)))); };
const KEYS = ["IB2600586587", "IB2600592684", "IB2600594596", "IB2600601812", "IB2600603983"];
const hsmt = Object.fromEntries(KEYS.map((k) => [k, fx(k).hsmtText]));
const whole = (docs) => Object.entries(docs).map(([id, x]) => ({ id, data: x.d }));

const server = http.createServer((req, res) => {
  const q = new URL(req.url, "http://x").searchParams, kind = q.get("kind"), coll = q.get("coll"), id = q.get("id");
  const send = (v, code = 200) => { res.writeHead(code, { "Content-Type": "application/json", Connection: "close" }); res.end(JSON.stringify(v)); };
  if (kind === "stamps") return send({ error: "no" }, 500);
  if (kind !== "docs") return send([]);
  if (coll === "analysis") return send(analysis[id] ? [{ id, data: analysis[id].d }] : []);
  if (coll === "hsmt") return send(hsmt[id] ? [{ id, data: { textChunks: 1 } }] : []);
  if (coll === "hsmttext") { const k = id.replace(/_0$/, ""); return send(hsmt[k] ? [{ id, data: { text: hsmt[k] } }] : []); }
  if (coll === "supexcl") return send(id ? [] : whole(supexcl));
  if (coll === "supplier") return send(id ? [] : whole(supplier));
  return send([]);
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const port = server.address().port;
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(S, "token.txt"), "dummy");
const env = { ...process.env, GENBID_WEB: `http://127.0.0.1:${port}`, GENBID_INGEST_TOKEN_FILE: path.join(S, "token.txt"), GENBID_DOC_CACHE: path.join(S, "cache-" + path.basename(out)) };
Object.assign(process.env, env);
const SCRIPT = path.join(wt, "suppliers", "config-bot.mjs");
const runCli = (args, extra = {}) => new Promise((ok) => {
  // async spawn so the in-process server keeps answering
  import("node:child_process").then(({ spawn }) => {
    const p = spawn(process.execPath, [SCRIPT, ...args], { env: { ...env, ...extra }, stdio: ["ignore", "pipe", "pipe"] });
    let o = "", e = ""; p.stdout.on("data", (d) => (o += d)); p.stderr.on("data", (d) => (e += d));
    p.on("close", (code) => ok({ code, o, e }));
  });
});
const log = [];
for (const k of KEYS) {
  const r = await runCli(["prep", "--key", k, "--out", path.join(out, `prep-${k}`)], { GENBID_LOCAL_SUPPLIERS: "1" });
  log.push({ step: `prep ${k}`, code: r.code, stdout: r.o.trim(), stderr: r.e.trim().slice(0, 300) });
}
for (const n of ["1", "2"]) {
  const r = await runCli(["prep", "--key", "IB2600592684", "--size", n, "--out", path.join(out, `prep-IB2600592684-size${n}`)], { GENBID_LOCAL_SUPPLIERS: "1" });
  log.push({ step: `prep IB2600592684 --size ${n}`, code: r.code, stdout: r.o.trim(), stderr: r.e.trim().slice(0, 300) });
}
const CB = await import(pathToFileURL(SCRIPT).href);
const sups = whole(supplier).map((d) => d.data);
log.push({ step: "sizesFor IB2600592684", info: await CB.sizesFor("IB2600592684", "").catch((e) => e.message) });
log.push({ step: "doc analysis", info: await CB.doc("analysis", "IB2600592684").then((d) => Object.keys(d || {})).catch((e) => e.message) });
const find = [["IB2600586587", { bidName: "", origin: "all" }],
  ["IB2600592684", { bidName: "", origin: "all", target: { size: null, rank: 1, engine: { model: "6BTA5.9-G2", make: "Cummins" } } }],
  ["IB2600592684", { bidName: "", origin: "all", target: { size: "30 kVA", rank: 2, engine: { model: "4BTA3.9-G2", make: "Cummins" } } }]];
for (const [k, req] of find) {
  try { const info = await CB.findPrep(k, path.join(out, `find-${k}-${req.target?.size || "x"}`), req, sups); log.push({ step: `findPrep ${k}`, info }); }
  catch (e) { log.push({ step: `findPrep ${k}`, error: e.message }); }
}
for (const id of ["kaichen-jiangsu", "cps-generators"]) {
  try { await CB.specPrep(id, path.join(out, `spec-${id}`), sups); log.push({ step: `specPrep ${id}`, ok: true }); }
  catch (e) { log.push({ step: `specPrep ${id}`, error: e.message }); }
}
server.close();
const md5 = {};
const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (f.name !== "md5.json") md5[path.relative(out, p).replace(/\\/g, "/")] = crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex"); } };
walk(out);
fs.writeFileSync(path.join(out, "md5.json"), JSON.stringify({ log, md5 }, null, 1));
console.log(JSON.stringify(log.map((l) => ({ step: l.step, code: l.code, err: l.error || l.stderr }))), Object.keys(md5).length, "files");
process.exit(0);
