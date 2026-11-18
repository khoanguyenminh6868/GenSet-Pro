// node cmp-gop.mjs <worktree nhánh> <gop-main.json> <gop-2b.json> <out.txt>
// So MỌI lượt của do-gop-rf (gốc 3c0a49ff ↔ nhánh dac-thu-dong-co-2b): tập top 30, thứ tự, điểm của mọi dòng trong `all`,
// số dòng bị loại. Lượt đổi: in từng dòng vào / ra / đổi điểm (điểm lấy từ `all` của hai bên) và điều engine-traits đọc từ
// chính chữ của lượt đó (bidhist config.text, như do-gop), để mỗi dòng truy về một luật (1) lọc hãng, (3) tương đương
// cộng điểm, (5) bộ điều khiển +200, hoặc "bị chen / lấp chỗ".
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, FA, FB, OUT] = process.argv.slice(2);
const ET = await import(pathToFileURL(path.join(WT, "suppliers", "engine-traits.mjs")).href);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const A = J(FA), B = J(FB);
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const text = new Map(Object.values(J(`${SNAP}/bidhist.json`).docs).map((x) => x.d).filter((d) => d?.config?.text).map((d) => [d.notifyNo, d.config.text]));
const ids = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
const L = [];
let same = 0, err = 0;
const changed = [];
for (const id of ids) {
  const a = A[id], b = B[id];
  if (!a || !b || a.error || b.error) { err++; L.push(`${id}: thiếu / lỗi main=${a?.error || (a ? "-" : "không có")} 2b=${b?.error || (b ? "-" : "không có")}`); continue; }
  const sa = new Map(a.top.map((k, i) => [k, i])), sb = new Map(b.top.map((k, i) => [k, i]));
  const pa = new Map(a.all), pb = new Map(b.all);
  const out = a.top.filter((k) => !sb.has(k)), inn = b.top.filter((k) => !sa.has(k));
  const sc = [...new Set([...pa.keys(), ...pb.keys()])].filter((k) => pa.has(k) && pb.has(k) && pa.get(k) !== pb.get(k));
  const goneAll = [...pa.keys()].filter((k) => !pb.has(k)), newAll = [...pb.keys()].filter((k) => !pa.has(k));
  if (JSON.stringify(a.top) === JSON.stringify(b.top) && !sc.length && !goneAll.length && !newAll.length && a.dropped === b.dropped) { same++; continue; }
  const key = id.split("#")[0], f = ET.filterOf(text.get(key) || "");
  changed.push(key);
  L.push(`\n${id}: top ${a.top.length}→${b.top.length}; all ${a.all.length}→${b.all.length}; dropped ${a.dropped}→${b.dropped}`);
  L.push(`  engine-traits: hãng lọc ${f.engineMake || "-"}${f.engineConflict ? ` (xung đột ${f.engineConflict})` : ""}; BĐK ${f.controllers.map((c) => c.term).join(", ") || "-"}; không dùng ${f.unused.map((u) => `${u.term}@${u.at}${u.equivalent ? "/tđ" : ""}`).join(", ") || "-"}`);
  for (const c of f.controllers) L.push(`    BĐK «${c.term}»: ${c.line.slice(0, 150)}`);
  for (const t of f.engineTerms) L.push(`    động cơ «${t.term}»: ${t.line.slice(0, 150)}`);
  for (const k of out) L.push(`  RA  #${sa.get(k) + 1} ${k.slice(0, 140)} điểm ${pa.get(k)}→${pb.has(k) ? pb.get(k) : "(bị loại)"}`);
  for (const k of inn) L.push(`  VÀO #${sb.get(k) + 1} ${k.slice(0, 140)} điểm ${pa.has(k) ? pa.get(k) : "(mới)"}→${pb.get(k)}`);
  for (const k of sc.filter((k) => sa.has(k) || sb.has(k))) if (!out.includes(k) && !inn.includes(k)) L.push(`  ĐIỂM (trong top) ${k.slice(0, 140)} ${pa.get(k)}→${pb.get(k)}`);
  const scOut = sc.filter((k) => !sa.has(k) && !sb.has(k));
  if (scOut.length) L.push(`  đổi điểm ngoài top: ${scOut.length} dòng (${[...new Set(scOut.map((k) => pb.get(k) - pa.get(k)))].join(", ")})`);
  if (goneAll.length) L.push(`  bị loại khỏi all: ${goneAll.length} dòng`);
  if (newAll.length) L.push(`  mới trong all: ${newAll.length} dòng`);
}
const head = [`${ids.length} lượt; không đổi ${same}; thiếu / lỗi ${err}; đổi ${ids.length - same - err} lượt ở ${new Set(changed).size} gói: ${[...new Set(changed)].join(" ")}`];
fs.writeFileSync(OUT, [...head, ...L].join("\n"), "utf8");
console.log(head.join("\n"));
