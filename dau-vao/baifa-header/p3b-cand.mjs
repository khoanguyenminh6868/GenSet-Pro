// Điểm 3 (thêm): HSMT nêu hãng động cơ Perkins: 5 dòng baifa đứng hạng mấy, có vào top 30 không.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root] = process.argv.slice(2);
const { candidates, hintsOf } = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(root, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const built = C.build(S);
const h = hintsOf("Chương V. Yêu cầu kỹ thuật\nĐộng cơ: hãng Perkins\nTần số: 50 Hz");
console.log("engineMakes của hints:", JSON.stringify(h.engineMakes));
for (const [model, kva] of [["5006AC-E23TAG1", 750], ["5006AC-E23TAG2", 800], ["5008AC-E30TAG1", 909], ["5008AC-E30TAG2", 1011], ["5008AC-E30TAG3", 1124]]) {
  const r = candidates(built, { value: kva, unit: "kVA" }, h, { suppliers: S });
  const is = (x) => x.u.supplierId === "baifa-power" && String(x.u.line || "").includes(model);
  const a = r.all.findIndex(is), t = r.top.findIndex(is), d = r.dropped.find(is);
  console.log(`${model} ${kva} kVA: all ${r.all.length}, hạng trong all ${a + 1 || "—"} (điểm ${a >= 0 ? r.all[a].score : "—"}), hạng trong top ${t + 1 || "không vào"}, bị loại: ${d ? JSON.stringify(d.ruled) : "không"}; điểm hạng 30: ${r.top[r.top.length - 1]?.score}`);
}
