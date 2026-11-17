// Mục 5: lấy mẫu dòng bị loại rải nhiều gói, đủ 4 loại. node sample.mjs [soDisp soCyl soMax soPrime soUnl soOdd]
import fs from "node:fs";
import * as L from "./lib.mjs";
const R = []; for (const f of fs.readdirSync(L.HERE + "/out").filter((f) => /^run-\d+\.jsonl$/.test(f))) for (const l of fs.readFileSync(L.HERE + "/out/" + f, "utf8").split("\n")) if (l.trim()) R.push(JSON.parse(l));
const ok = R.filter((r) => !r.error && !r.noCap && r.samples?.length);
const want = { "spread-disp": +process.argv[2] || 22, "spread-cyl": +process.argv[3] || 14, "spread-maxDisp": +process.argv[4] || 10, "spread-prime": +process.argv[5] || 22, "prime-unlabelled": +process.argv[6] || 14, "disp-odd": +process.argv[7] || 8 };
let seed = 99; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const sel = [], used = new Set();
for (const [why, n] of Object.entries(want)) {
  const pool = ok.flatMap((r) => r.samples.filter((s) => s.why === why).map((s) => ({ r, s })));
  const perPkg = new Map(); let got = 0;
  while (got < n && pool.length) {
    const i = Math.floor(rnd() * pool.length), { r, s } = pool.splice(i, 1)[0];
    if ((perPkg.get(r.key) || 0) >= 2) continue; // tối đa 2 mẫu/gói/loại
    const id = `${r.key}|${r.i}|${s.sup}|${s.ek}|${s.n}|${s.row}`; if (used.has(id)) continue; used.add(id);
    perPkg.set(r.key, (perPkg.get(r.key) || 0) + 1); got++; sel.push({ id, why, key: r.key, src: r.src, cap: r.cap, nSizes: r.nSizes, s });
  }
}
const out = [];
sel.forEach((x, n) => {
  const s = x.s, m = s.min;
  out.push(`### M${n + 1} [${x.why}] ${x.key} (${x.src}) cỡ ${x.cap.value}${x.cap.unit}${x.nSizes > 1 ? " nhiều cỡ" : ""} | ncc=${s.sup} | ${s.engine} (${s.make}) | lý do=${s.ruled.join("+")} | ngưỡng: ${JSON.stringify(Object.fromEntries(Object.entries(m).filter(([, v]) => v != null)))}`);
  out.push(`  dòng: ${s.line.slice(0, 230)}`);
  out.push(`  tiêu đề bảng: ${s.header.slice(0, 200)} ‖ nguồn: ${s.title}`);
  out.push(`  công suất đọc: ${JSON.stringify(s.power)} (nhãn prime=${s.primeLabelled}, standby=${s.standbyLabelled})`);
  if (s.ruled.includes("disp") || s.ruled.includes("maxDisp")) out.push(`  dung tích: ${s.disp.length ? s.disp.map((d) => `${d.v} [${d.label}] → ${d.litres} L (${d.sid}#${d.n}${d.own ? " dòng" : ""}) «${d.line.slice(0, 110)}»`).join(" ⏐ ") : "(không có)"}${s.calc ? ` | tính từ bore/stroke/cyl: ${JSON.stringify(s.bore)}` : ""}`);
  if (s.ruled.includes("cyl")) out.push(`  xi lanh: ${s.cyl.map((d) => `${d.v} [${d.label}] (${d.sid}#${d.n}) «${d.line.slice(0, 110)}»`).join(" ⏐ ")}`);
});
fs.writeFileSync(L.HERE + "/out/sample.json", JSON.stringify(sel));
fs.writeFileSync(L.HERE + "/out/sample.md", out.join("\n"));
const t = {}; for (const x of sel) t[x.why] = (t[x.why] || 0) + 1; console.log("mẫu", sel.length, t, "gói", new Set(sel.map((x) => x.key)).size);
