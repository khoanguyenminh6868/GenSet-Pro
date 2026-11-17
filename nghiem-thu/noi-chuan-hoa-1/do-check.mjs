// Đo bước `check` (không agent) với cờ GENBID_SPEC_NORM tắt ↔ bật, cùng một commit (wt-noi-chuan-hoa), trên:
//  - mọi configmatch trên web (bản chụp chỉ đọc genbid-test/noi-chuan-hoa/web/, lay-configmatch.mjs), NCC = bản chụp supplier.json;
//  - 6 lượt đóng băng suppliers/fixtures/runs (NCC, chữ HSMT, bảng thông số của chính lượt đó).
//   node do-check.mjs → check.json + check.tsv (một dòng mỗi tiêu chí đổi) + check-goi.tsv (một dòng mỗi gói / cỡ)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const WT = "C:/Projects/GenSet Pro/wt-noi-chuan-hoa/suppliers";
const B = await import(pathToFileURL(`${WT}/config-bot.mjs`).href);
const RQ = await import(pathToFileURL(`${WT}/reqcodes.mjs`).href);
const RG = await import(pathToFileURL(`${WT}/fixtures/runs/regress.mjs`).href);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = Object.values(J(`${SNAP}/supplier.json`).docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
const cms = J(`${SNAP}/web/configmatch.json`), texts = J(`${SNAP}/web/hsmt.json`);
delete process.env.GENBID_NAMED_SELLER;

// Every case: { src, tender, size, result, hsmtText, suppliers, origin, basis, sized, sourcesDir? }
const cases = [], skipped = [];
for (const d of cms) {
  const t = texts[d.id];
  if (!t || t.error) { skipped.push({ tender: d.id, why: t?.error || "không có chữ HSMT" }); continue; }
  const r = d.data?.result;
  if (!r) { skipped.push({ tender: d.id, why: "configmatch không có result" }); continue; }
  const list = r.sizes ? r.sizes.map((s, i) => ({ size: s.label || `cỡ ${i + 1}`, result: s.result, sized: true })) : [{ size: "", result: r, sized: false }];
  for (const x of list) {
    if (!x.result?.configs?.length) { skipped.push({ tender: d.id, size: x.size, why: x.result?.message ? `không có cấu hình (${String(x.result.message).slice(0, 80)})` : "không có cấu hình" }); continue; }
    const base = { tender: d.id, size: x.size, hsmtText: t.text, suppliers: sups, origin: x.result.origin || r.origin || "all", basis: x.result.originBasis, sized: x.sized };
    cases.push({ src: "web", ...base, result: x.result });
    // The stored result keeps the checks the code wrote then (byCode); check() does not write over a met / not met.
    // "web-go-code": those checks taken back to what the agent had (status `was`, else removed), so the code decides
    // them again under each flag. The agent's own `offered` of a check the code overwrote is lost (approximation).
    const g = structuredClone(x.result);
    for (const c of g.configs || []) c.checks = (c.checks || []).flatMap((k) => {
      if (!k.byCode) return [k];
      if (!k.was) return [];
      const { byCode, rule, was, confirm, why, note, conversions, sheetSrc, makerOver, ...rest } = k;
      return [{ ...rest, status: was }];
    });
    cases.push({ src: "web-go-code", ...base, result: g });
  }
}
for (const run of RG.runsOf("config")) {
  const b = RG.readBundle(run.input);
  cases.push({ src: "fixture", tender: run.tender, size: run.name, result: b.result, hsmtText: b.hsmtText, suppliers: b.suppliers, origin: b.meta.origin, basis: b.meta.basis, sized: !!b.meta.sized, sources: b.sources || {} });
}
const id = (c) => [c.genset?.model, c.engine?.model, c.alternator?.model, c.controller?.model].map((x) => x || "").join(" / ");
function runCheck(cs, on) {
  if (on) process.env.GENBID_SPEC_NORM = "1"; else delete process.env.GENBID_SPEC_NORM;
  let dir = null;
  try {
    if (cs.sources) { dir = fs.mkdtempSync(path.join(os.tmpdir(), "noi-chuan-hoa-")); for (const [f, text] of Object.entries(cs.sources)) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), text); } }
    const out = B.check(structuredClone(cs.result), { hsmtText: cs.hsmtText, suppliers: cs.suppliers, readWeb: () => null, origin: cs.origin, basis: cs.basis, sized: cs.sized, ...(dir ? { sourcesDir: dir } : {}) });
    B.rankConfigs(out.result);
    return out.result;
  } finally { delete process.env.GENBID_SPEC_NORM; if (dir) fs.rmSync(dir, { recursive: true, force: true }); }
}
const VI = { met: "đạt", not_met: "không đạt", unclear: "chưa rõ", confirm: "xác nhận", missing: "chưa kiểm" };
const st = (x) => (x ? (x.status === "confirm" ? `confirm:${x.confirm || ""}` : x.status) : "missing");
const out = { cases: [], skipped, changes: [] };
for (const cs of cases) {
  let A, N;
  try { A = runCheck(cs, false); N = runCheck(cs, true); }
  catch (e) { skipped.push({ tender: cs.tender, size: cs.size, why: `check lỗi: ${String(e?.message || e).slice(0, 160)}` }); continue; }
  const reqs = A.requirements || [];
  const reqCode = (item) => { const r = reqs.find((q) => (q.item || "") === item); return r?.code || RQ.codeOf(r || { item }); };
  const rec = { src: cs.src, tender: cs.tender, size: cs.size, configs: A.configs.length, rankChanged: 0, top1A: id(A.configs[0] || {}), top1N: id(N.configs[0] || {}), top1Changed: id(A.configs[0] || {}) !== id(N.configs[0] || {}), checkChanges: 0, byDir: {}, byCode: {} };
  for (const ca of A.configs) {
    const cn = N.configs.find((z) => id(z) === id(ca));
    if (!cn) { rec.rankChanged++; continue; }
    if (cn.rank !== ca.rank) rec.rankChanged++;
    const items = new Set([...(ca.checks || []), ...(cn.checks || [])].map((x) => x.item));
    for (const item of items) {
      const xa = (ca.checks || []).find((x) => x.item === item), xn = (cn.checks || []).find((x) => x.item === item);
      if (st(xa) === st(xn)) continue;
      const dir = `${st(xa)} → ${st(xn)}`, code = reqCode(item);
      rec.checkChanges++; rec.byDir[dir] = (rec.byDir[dir] || 0) + 1; rec.byCode[code] = (rec.byCode[code] || 0) + 1;
      const r = reqs.find((q) => q.item === item);
      out.changes.push({ src: cs.src, tender: cs.tender, size: cs.size, rank: ca.rank, rankN: cn.rank, config: id(ca), item, code, dir, offeredA: xa?.offered || "", offeredN: xn?.offered || "", noteN: xn?.note || "", sourceQuote: xn?.sourceQuote || xa?.sourceQuote || "", requirement: r?.requirement || "", hsmtQuote: r?.quote || xa?.hsmtQuote || "" });
    }
  }
  out.cases.push(rec);
  console.error(cs.src, cs.tender, cs.size, rec.checkChanges, "tiêu chí đổi;", rec.rankChanged, "hạng đổi; hạng 1 đổi:", rec.top1Changed);
}
fs.writeFileSync(path.join(HERE, "check.json"), JSON.stringify(out, null, 1));
const tsv = (rows, cols) => [cols.join("\t"), ...rows.map((r) => cols.map((c) => String(typeof r[c] === "object" ? JSON.stringify(r[c]) : r[c] ?? "").replace(/[\t\n]/g, " ")).join("\t"))].join("\n") + "\n";
fs.writeFileSync(path.join(HERE, "check.tsv"), tsv(out.changes, ["src", "tender", "size", "rank", "rankN", "config", "item", "code", "dir", "offeredA", "offeredN", "noteN", "requirement", "sourceQuote"]));
fs.writeFileSync(path.join(HERE, "check-goi.tsv"), tsv([...out.cases, ...skipped.map((s) => ({ ...s, configs: "KHÔNG CHẠY: " + s.why }))], ["src", "tender", "size", "configs", "checkChanges", "byDir", "byCode", "rankChanged", "top1Changed", "top1A", "top1N"]));
console.error("xong:", out.cases.length, "lượt;", skipped.length, "không chạy được;", out.changes.length, "tiêu chí đổi");
