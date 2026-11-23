// Mọi động cơ bị nhánh "sheet" loại ở gói 50 Hz / 60 Hz: dòng của hãng làm căn cứ; và 233 dòng trái tờ hãng theo luật mới.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [root, list233] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(root, "suppliers/config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(root, "suppliers/cn");
const list = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const built = C.build(list), sup = new Map(list.map((s) => [s.id, s])), byKey = new Map(built.engines.map((e) => [e.key, e]));
const twinOf = (k) => byKey.get(k.endsWith("^") ? k.slice(0, -1) : `${k}^`)?.uses || [];

const seen = new Map();
for (const e of built.engines) for (const want of [50, 60]) {
  const hit = e.uses.filter((u) => u.line && B.freqVerdict(e, u, want, { twinUses: twinOf(e.key), sup })?.kind === "sheet");
  if (!hit.length) continue;
  const ev = [...e.uses, ...twinOf(e.key)].filter((x) => B.hzOfRow(x) && B.isEngineMakerOf(e, sup.get(x.supplierId)));
  seen.set(`${e.key}@${want}`, { rows: hit.length, ev: ev.map((x) => `${x.supplierId} n${x.n} ${B.hzOfRow(x)}Hz${x.freq ? "(ô/tiêu đề)" : "(rpm)"}`) });
}
const by = {};
for (const [k, v] of seen) { const w = k.split("@")[1]; by[w] = by[w] || { eng: 0, rows: 0 }; by[w].eng++; by[w].rows += v.rows; }
console.log("nhánh sheet:", JSON.stringify(by));
for (const [k, v] of [...seen].filter(([k]) => k.endsWith("@50"))) console.log(" ", k, "dòng", v.rows, "| căn cứ:", [...new Set(v.ev)].slice(0, 3).join("; "));

// 233 dòng: loại, khoá, Hz hãng, NCC, n, dòng. Gói cần xét = tần số TRÁI Hz của hãng (dòng đó NCC ghi tần số kia hoặc không ghi).
const res = {}, miss = [], moved = new Set(), rowIdx = new Map();
for (const e of built.engines) for (const u of e.uses) if (u.line) for (const n of [u.n, ...(u.also || []).map((a) => a.n)]) {
  const k = `${u.supplierId}|${n}|${C.keyOf(u.line)}`;
  rowIdx.set(k, [...(rowIdx.get(k) || []), { e, u }]);
}
for (const l of fs.readFileSync(list233, "utf8").split(/\r?\n/).filter(Boolean)) {
  const [, key0, hz, s, n, ...rest] = l.split("\t"), line = rest.join("\t");
  // Khoá trong tệp có thể là khoá cũ: tìm theo NCC + bảng + chữ dòng, ưu tiên đúng khoá.
  const hits = rowIdx.get(`${s}|${n}|${C.keyOf(line)}`) || [];
  // "(tờ)" = dòng tờ rời không có chữ dòng; chữ dòng trong tệp có thể bị cắt: tìm theo khoá + NCC + bảng.
  const e0 = byKey.get(key0), u0 = e0?.uses.find((x) => x.supplierId === s && (x.n === Number(n) || (x.also || []).some((a) => a.n === Number(n))));
  const hit = hits.find((x) => x.e.key === key0) || hits[0] || (u0 ? { e: e0, u: u0 } : null);
  if (!hit) { miss.push(`${key0}|${s}|${n}|${line.slice(0, 50)}`); continue; }
  if (hit.e.key !== key0) moved.add(`${key0}→${hit.e.key}`);
  const { e, u } = hit, key = e.key;
  const want = Number(hz) === 50 ? 60 : 50, v = B.freqVerdict(e, u, want, { twinUses: twinOf(key), sup });
  const st = u.freq ? (u.freq === want ? "giữ (dòng tự ghi đúng gói)" : "loại (dòng tự ghi trái gói)") : v?.out ? `loại (${v.kind})` : v?.ask ? `cần xác nhận (${v.kind})` : "giữ";
  const k = `gói ${want} Hz: ${st}`;
  res[k] = (res[k] || 0) + 1;
}
console.log("--- 233 dòng theo luật mới:");
for (const k of Object.keys(res).sort()) console.log(" ", k, res[k]);
console.log("khoá đổi so với tệp:", moved.size, [...moved].slice(0, 6).join(" "));
console.log("không tìm thấy dòng:", miss.length);
for (const m of miss.slice(0, 6)) console.log("  ", m);
