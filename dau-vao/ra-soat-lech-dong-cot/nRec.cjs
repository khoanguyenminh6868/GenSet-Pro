// node nRec.cjs <repo> <id NCC> <n>[,<n>…]: in MỌI bản ghi (loại, model, tổ máy, công suất, tần số, thông số) đọc từ các nguồn n của một NCC.
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [repo, id, ns] = process.argv.slice(2);
const { C, S } = load(repo), want = new Set(String(ns).split(","));
for (const o of C.fromSupplier(S.find((s) => s.id === id))) {
  if (!want.has(String(o.n))) continue;
  console.log(`n${o.n} b${o.table} ${o.row ?? "L"} ${o.kind} model=${o.model} genset=${o.genset ?? ""} ${JSON.stringify(o.power)} ${o.freq ?? ""} hãng=${(o.makes || []).map((m) => m.name)} | ${String(o.line || "").slice(0, 110)}`);
  console.log("      " + (o.specs || []).map((s) => `${s.key}=${s.value}`).join("; ").slice(0, 400));
}
