import fs from "node:fs";
const SC = "C:/Users/Khoa/AppData/Local/Temp/claude/d4c88f0a2fd88962/12cf46c0-582e-4b82-a872-97d5283432ea/scratchpad";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/kw-hp";
fs.mkdirSync(OUT, { recursive: true });
const mix = JSON.parse(fs.readFileSync(SC + "/mix.json", "utf8"));
const kwonly = JSON.parse(fs.readFileSync(SC + "/kwonly.json", "utf8"));
const K = 1.341; // 1 kW = 1.341 HP (metric PS = 1.360): checked with tolerance
const nums = (s) => (String(s).match(/\d+(?:[.,]\d+)?/g) || []).map((x) => Number(x.replace(",", ".")));
const near = (a, b, tol) => Math.abs(a - b) <= tol * b;
const rows = [];
for (const r of mix) {
  const v = nums(r.sp.value), pw = r.u.power || {};
  const kws = Object.values(pw).map((p) => p.kW).filter((x) => x != null);
  const maxKw = kws.length ? Math.max(...kws) : null;
  const hdr = (r.u.header || []).join(" // ").replace(/\s+/g, " ");
  let kind, a = v[0], b = v[1], concl, basis = [], aTest = "", bTest = "";
  // (a) the row's own figures
  if (v.length >= 2) {
    kind = v.length === 3 ? "cap-3-so" : "cap-2-so";
    const ratio = b / a;
    if (near(ratio, K, 0.025) || (ratio > 1.30 && ratio < 1.37)) { aTest = `cap ${a}/${b}: ${b}/${a}=${ratio.toFixed(3)} ~ 1,341 -> so 1 la kW, so 2 la HP`; concl = "kW"; }
    else if (near(1 / ratio, K, 0.025)) { aTest = `cap ${a}/${b}: dao thu tu (${a}/${b}=${(a / b).toFixed(3)} ~ 1,341) -> so 1 la HP`; concl = "HP"; }
    else { aTest = `cap ${a}/${b}: ty so ${ratio.toFixed(3)} khong khop 1,341`; concl = "khong xac dinh"; }
    if (maxKw != null) { const q = a / maxKw; aTest += `; so 1 / kW tổ máy cao nhất cùng dòng (${maxKw}) = ${q.toFixed(3)}`; }
  } else {
    kind = "1-so";
    if (maxKw == null) { aTest = "dong khong co kW to may de doi chieu"; concl = "khong xac dinh"; }
    else {
      const q = a / maxKw;
      aTest = `${a} / kW to may cao nhat cung dong (${maxKw}) = ${q.toFixed(3)}; neu la HP thi kW = ${(a / K).toFixed(0)} = ${(a / K / maxKw).toFixed(3)} x kW to may`;
      if (q >= 1.0 && q <= 1.25) concl = "kW";
      else if (q / K >= 1.0 && q / K <= 1.25) concl = "HP";
      else concl = "khong xac dinh";
    }
  }
  // (b) same engine model, kW-labelled elsewhere
  const others = (kwonly[r.key] || []).filter((o) => !(o.s === r.u.supplierId && o.tbl === r.u.table && o.row === r.u.row));
  const set = [...new Set(others.map((o) => o.v))].sort((x, y) => x - y);
  let bConcl = "";
  if (set.length) {
    const asKw = set.filter((x) => near(a, x, 0.005));
    const asHp = set.filter((x) => near(a, x * K, 0.003));
    bTest = `cung model ${r.key}, kW ghi ro don vi o NCC khac: [${set.join(",")}]; khop ${a} nhu kW: ${asKw.length ? asKw.join(",") : "khong"}; khop nhu HP (x1,341): ${asHp.length ? asHp.join(",") : "khong"}`;
    if (asKw.length && !asHp.length) bConcl = "kW"; else if (asHp.length && !asKw.length) bConcl = "HP"; else if (asKw.length && asHp.length) bConcl = "mau thuan"; else bConcl = "khong khop";
  } else bTest = "khong co kW ghi ro cho cung model ngoai dong nay";
  let final = concl;
  const basisParts = [];
  if (concl === "kW" || concl === "HP") basisParts.push("(a) " + aTest);
  if (bConcl === "kW" || bConcl === "HP") basisParts.push("(b) " + bTest);
  if (concl === "khong xac dinh" && (bConcl === "kW" || bConcl === "HP")) final = bConcl;
  else if (kind === "1-so" && (concl === "kW" || concl === "HP") && (bConcl === "kW" || bConcl === "HP") && concl !== bConcl) final = "mau thuan";
  rows.push({ sup: r.u.supplierId, src: r.u.n, table: r.u.table, row: r.u.row, label: r.sp.label, hdr, model: r.key, genset: r.u.genset ?? "", kind, cell: r.sp.value, read: r.n?.num ?? "", hpcond: r.n?.cond?.hp ?? "", standbyOrMaxKw: maxKw ?? "", a: aTest, b: bTest, bConcl, concl: final, basis: basisParts.join(" | ") || aTest, line: (r.u.line || "").replace(/\s+/g, " ") });
}
const cols = ["sup", "src", "table", "row", "label", "hdr", "model", "genset", "kind", "cell", "read", "hpcond", "standbyOrMaxKw", "concl", "a", "b", "line"];
const hdrNames = ["NCC", "so_nguon", "bang", "dong", "nhan", "tieu_de_cot", "model_dong_co", "model_to_may", "dang_o", "o_nguyen_van", "so_doc_la_kW", "so_HP_ghi_kem", "kW_to_may_cao_nhat", "ket_luan", "doi_chieu_a_trong_dong", "doi_chieu_b_cung_model", "dong_nguon"];
const tsv = [hdrNames.join("\t"), ...rows.map((r) => cols.map((c) => String(r[c] ?? "").replace(/[\t\r\n]+/g, " ")).join("\t"))].join("\n");
fs.writeFileSync(OUT + "/kw-hp-275.tsv", tsv + "\n", "utf8");
const cnt = (f) => rows.reduce((m, r) => { const k = f(r); m[k] = (m[k] || 0) + 1; return m; }, {});
console.log("rows", rows.length);
console.log("ket luan x NCC x dang", JSON.stringify(cnt((r) => `${r.sup} | ${r.kind} | ${r.concl}`), null, 1));
console.log("b-check", JSON.stringify(cnt((r) => `${r.kind} | b=${r.bConcl || "khong co"} | a=${r.concl}`), null, 1));
for (const r of rows.filter((r) => r.concl !== "kW")) console.log(JSON.stringify({ s: r.sup, t: r.table, r: r.row, m: r.model, cell: r.cell, concl: r.concl, a: r.a, b: r.b, line: r.line }));
