// Điểm 3: 5 dòng Perkins 5006AC / 5008AC của baifa (không model tổ máy) có vào tập ứng viên của candidates() không.
// Gọi candidates() với TOÀN BỘ cn/ ở đúng công suất prime của từng dòng (kVA), HSMT trơn "50 Hz", không nêu hãng.
//   node p3-cand.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root] = process.argv.slice(2);
const { candidates, hintsOf } = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(root, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const built = C.build(S);
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const ROWS = [["5006AC-E23TAG1", 750], ["5006AC-E23TAG2", 800], ["5008AC-E30TAG1", 909], ["5008AC-E30TAG2", 1011], ["5008AC-E30TAG3", 1124]];
const mine = (x, model) => x?.u?.supplierId === "baifa-power" && String(x?.u?.line || "").includes(model);
for (const [model, kva] of ROWS) {
  const r = candidates(built, { value: kva, unit: "kVA" }, free("Tần số: 50 Hz"), { suppliers: S });
  console.log(`\n=== ${model}, HSMT ${kva} kVA prime | khoá kết quả: ${Object.keys(r).join(", ")} | all ${r.all?.length}, top ${r.top?.length}, dropped ${r.dropped?.length}`);
  const inAll = (r.all || []).filter((x) => mine(x, model)), inTop = (r.top || []).filter((x) => mine(x, model)), inDrop = (r.dropped || []).filter((x) => mine(x, model));
  for (const [name, l] of [["all", inAll], ["top", inTop], ["dropped", inDrop]]) for (const x of l) {
    const rank = name === "all" ? r.all.indexOf(x) + 1 : name === "top" ? r.top.indexOf(x) + 1 : null;
    const { u, e, ...rest } = x;
    console.log(`  [${name}${rank ? " hạng " + rank : ""}] điểm ${x.score ?? "—"} | động cơ ${e?.key} hãng ${(e?.makes || []).map((m) => m.name).join("/") || "—"} | tổ máy ${u.genset ?? "—"} | đầu phát ${u.other ?? "—"} | công suất ${JSON.stringify(u.power)} | tần số ${u.freq ?? "—"}`);
    console.log(`      dòng: ${u.line}`);
    console.log(`      khác: ${JSON.stringify(rest).slice(0, 600)}`);
  }
  if (!inAll.length && !inTop.length && !inDrop.length) {
    // dòng của baifa cho khoá động cơ này có trong danh mục không, và có dòng NCC khác của cùng động cơ trong all không
    const key = Object.keys(built.engines).find((k) => (built.engines[k].uses || []).some((u) => u.supplierId === "baifa-power" && String(u.line || "").includes(model)));
    console.log(`  KHÔNG có trong all / top / dropped. Khoá danh mục: ${key ?? "không thấy"}; dòng cùng động cơ của NCC khác trong all: ${(r.all || []).filter((x) => x.e?.key === key).length}`);
  }
}
