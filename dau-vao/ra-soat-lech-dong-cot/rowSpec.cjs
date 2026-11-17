// node rowSpec.cjs <repo> <id NCC> <n> <chỉ số bảng> <dòng>: in công suất + mọi thông số (khoá, nhãn, giá trị) đọc được của một dòng.
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [repo, id, n, table, row] = process.argv.slice(2);
const { C, S } = load(repo);
for (const o of C.fromSupplier(S.find((s) => s.id === id))) {
  if (String(o.n) !== n || String(o.table) !== table || String(o.row) !== row) continue;
  console.log(o.kind, o.model, JSON.stringify(o.power), "|", o.line);
  for (const s of o.specs || []) console.log("   ", s.key, "=", s.value, "|", s.label);
}
