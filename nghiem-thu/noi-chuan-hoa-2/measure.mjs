// Đo PR #786 (GENBID_SPEC_NORM) trên dữ liệu thật của bản web, chỉ đọc web, không gọi agent, không ghi web.
// A. Ứng viên: prep() mỗi gói có phân tích, theo từng chế độ cờ; so danh sách model ứng viên (models.json).
// B. Kiểm: kết quả Gợi ý cấu hình đã lưu (configmatch) chạy lại `check --dir` theo từng chế độ cờ; so trạng thái từng mục.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [W, OUT] = process.argv.slice(2);
const BOT = path.join(W, "suppliers", "config-bot.mjs");
const CB = await import(new URL(`file:///${BOT.replace(/\\/g, "/")}`));
const FLAGS = ["off", "1", "fuel", "disp", "other"];
const setFlag = (f) => { if (f === "off") delete process.env.GENBID_SPEC_NORM; else process.env.GENBID_SPEC_NORM = f; };

// Đọc web một lần cho mọi chế độ cờ.
const cacheDoc = new Map(), cacheAll = new Map();
const doc = async (c, id) => { const k = `${c}/${id}`; if (!cacheDoc.has(k)) cacheDoc.set(k, await CB.doc(c, id).catch(() => null)); return cacheDoc.get(k); };
const allDocs = async (c) => { if (!cacheAll.has(c)) cacheAll.set(c, await CB.allDocs(c)); return cacheAll.get(c); };
fs.mkdirSync(OUT, { recursive: true });
const memoDir = fs.mkdtempSync(path.join(OUT, "memo-"));

const matches = (await allDocs("configmatch")).filter((d) => d.data?.result?.configs?.length);
// 1.297 gói × 5 chế độ quá lâu (~1,5 phút / gói): đo các gói có kết quả Gợi ý + N gói mới nhất có phân tích.
const N = Number(process.argv[4] || 30), want = new Set(matches.map((m) => m.id));
const allA = (await allDocs("analysis")).filter((d) => d.data?.result);
const analyses = [...allA.filter((d) => want.has(d.id)), ...allA.filter((d) => !want.has(d.id)).sort((a, b) => String(b.data?.at || b.data?.updatedAt || "").localeCompare(String(a.data?.at || a.data?.updatedAt || ""))).slice(0, N)];
// Kết quả đã lưu mang check byCode: chạy lại check không ghi đè chúng (suppliers/CLAUDE.md) → gỡ trước khi đo.
for (const m of matches) for (const c of m.data.result.configs) c.checks = (c.checks || []).filter((x) => !x.byCode);
console.log(`Gói có phân tích: ${analyses.length}; kết quả Gợi ý cấu hình có cấu hình: ${matches.length}`);

// ---------- A. Ứng viên ----------
const A = [];
for (const a of analyses) {
  const key = a.id, row = { key, models: {}, err: null };
  for (const f of FLAGS) {
    setFlag(f);
    const dir = path.join(OUT, "prep", key, f);
    try {
      const r = await CB.prep(key, dir, { bidName: a.data?.bidName || "" }, null, null, { doc, allDocs, memoDir, local: false });
      row.models[f] = JSON.parse(fs.readFileSync(path.join(dir, "models.json"), "utf8"));
      row.top = row.top || {}; row.top[f] = (r?.top || []).length ?? null;
    } catch (e) { row.err = `${f}: ${e.message}`.slice(0, 200); break; }
  }
  A.push(row);
  process.stdout.write(".");
}
setFlag("off");
console.log("");

// ---------- B. Kiểm ----------
const B = [];
for (const m of matches) {
  const key = m.id, base = path.join(OUT, "prep", key, "off");
  if (!fs.existsSync(path.join(base, "hsmt.txt"))) { B.push({ key, err: "không có thư mục prep (gói chưa có phân tích?)" }); continue; }
  const row = { key, status: {}, problems: {}, err: null };
  for (const f of FLAGS) {
    const dir = path.join(OUT, "check", key, f);
    fs.mkdirSync(dir, { recursive: true });
    for (const x of fs.readdirSync(base)) if (fs.statSync(path.join(base, x)).isFile()) fs.copyFileSync(path.join(base, x), path.join(dir, x));
    fs.writeFileSync(path.join(dir, "result.json"), JSON.stringify(m.data.result), "utf8");
    try {
      const env = { ...process.env }; if (f === "off") delete env.GENBID_SPEC_NORM; else env.GENBID_SPEC_NORM = f;
      const out = execFileSync(process.execPath, [BOT, "check", "--dir", dir], { env, encoding: "utf8", maxBuffer: 64 << 20 });
      const res = JSON.parse(fs.readFileSync(path.join(dir, "result.checked.json"), "utf8"));
      row.status[f] = Object.fromEntries((res.configs || []).flatMap((c, i) => (c.checks || []).map((x) => [`#${i + 1} ${x.item}`, x.status])));
      row.problems[f] = out.split("\n")[0] === "Không có điểm nào chưa khớp nguồn." ? 0 : out.split("\n").filter((l) => l.trim()).length;
    } catch (e) { row.err = `${f}: ${String(e.stderr || e.message).split("\n").slice(-3).join(" ")}`.slice(0, 300); break; }
  }
  B.push(row);
  process.stdout.write(".");
}
console.log("");
fs.writeFileSync(path.join(OUT, "raw.json"), JSON.stringify({ A, B }, null, 1));

// ---------- Tóm tắt ----------
const lines = [];
const okA = A.filter((r) => !r.err);
lines.push(`A. Ứng viên: ${okA.length}/${A.length} gói chạy được prep${A.length - okA.length ? ` (${A.length - okA.length} lỗi)` : ""}.`);
for (const f of FLAGS.slice(1)) {
  let changed = 0, added = 0, dropped = 0; const ex = [];
  for (const r of okA) {
    const o = new Set(r.models.off.map(String)), n = new Set(r.models[f].map(String));
    const add = [...n].filter((x) => !o.has(x)), drop = [...o].filter((x) => !n.has(x));
    const orderDiff = JSON.stringify(r.models.off) !== JSON.stringify(r.models[f]);
    if (orderDiff) { changed++; added += add.length; dropped += drop.length; if (ex.length < 4) ex.push(`${r.key} (+${add.length} −${drop.length}${!add.length && !drop.length ? ", chỉ đổi thứ tự" : ""})`); }
  }
  lines.push(`  ${f}: ${changed} gói đổi danh sách ứng viên; thêm ${added}, bớt ${dropped} model. ${ex.join("; ")}`);
}
const okB = B.filter((r) => !r.err);
const total = okB.reduce((s, r) => s + Object.keys(r.status.off).length, 0);
lines.push(`B. Kiểm: ${okB.length}/${B.length} kết quả chạy được check, ${total} mục kiểm (cờ tắt).`);
for (const f of FLAGS.slice(1)) {
  const tr = {}; let n = 0; const ex = [];
  for (const r of okB) for (const [k, s0] of Object.entries(r.status.off)) {
    const s1 = r.status[f][k];
    if (s1 !== s0) { n++; const t = `${s0}→${s1}`; tr[t] = (tr[t] || 0) + 1; if (ex.length < 5) ex.push(`${r.key} ${k}: ${t}`); }
  }
  lines.push(`  ${f}: ${n} mục đổi trạng thái ${JSON.stringify(tr)}${ex.length ? `\n     vd: ${ex.join("\n         ")}` : ""}`);
}
for (const r of [...A, ...B].filter((r) => r.err)) lines.push(`  lỗi ${r.key}: ${r.err}`);
fs.writeFileSync(path.join(OUT, "summary.txt"), lines.join("\n"), "utf8");
console.log(lines.join("\n"));
