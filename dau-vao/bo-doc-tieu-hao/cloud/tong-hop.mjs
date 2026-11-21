// Tổng hợp giai-thich.json: dòng mất theo luật × NCC, số nguồn so với ngưỡng HSMT.
import fs from "node:fs";
const J = JSON.parse(fs.readFileSync(new URL("./giai-thich.json", import.meta.url), "utf8"));
const count = (arr, f) => { const m = new Map(); for (const x of arr) { const k = f(x); m.set(k, (m.get(k) || 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]); };
const out = [];
const p = (...a) => out.push(a.join(" "));
const rk = (x) => (x.ruled && x.ruled.length ? x.ruled.map((r) => String(r).split(":")[0]).sort().join("+") : "(không còn trong candidates / không bị loại)");

p("lost", J.lost.length, "fuelMinus", J.fuelMinus.length, "noRun", J.noRun.length, "top5", J.top5.length);
p("\n== Luật loại");
for (const [k, n] of count(J.lost, rk)) p(n, k);
p("\n== Luật × NCC");
for (const [k, n] of count(J.lost, (x) => rk(x) + " | " + x.sup)) p(n, k);
p("\n== Mẫu giá trị ruled (đầy đủ theo chuỗi, 60 nhóm đầu)");
for (const [k, n] of count(J.lost.flatMap((x) => (x.ruled || []).map((r) => ({ r: String(r) }))), (x) => x.r).slice(0, 60)) p(n, k);
p("\n== Model × số xi lanh đọc × ngưỡng xi lanh (nhóm cyl)");
const cylLost = J.lost.filter((x) => (x.ruled || []).some((r) => /cyl/i.test(String(r))));
for (const [k, n] of count(cylLost, (x) => `${x.sup} | ${x.model} | đọc ${x.cyl} | HSMT min=${x.lim?.minCyl ?? "-"} exact=${x.lim?.cylExact ?? "-"} layout=${x.lim?.cylLayout ?? "-"}`).slice(0, 80)) p(n, k);
p("\n== Nhóm tiêu hao");
const fuelLost = J.lost.filter((x) => (x.ruled || []).some((r) => /fuel/i.test(String(r))));
for (const [k, n] of count(fuelLost, (x) => `${x.sup} | ${x.model} | ${JSON.stringify(x.fuel)} | max=${x.lim?.maxFuel ?? "-"}/${x.lim?.maxFuel75 ?? "-"}/${x.lim?.maxFuel50 ?? "-"}`).slice(0, 80)) p(n, k);
p("\n== fuelMinus theo NCC / why");
for (const [k, n] of count(J.fuelMinus, (x) => `${x.sup} | ${x.why}`).slice(0, 40)) p(n, k);
p("\n== noRun");
p(JSON.stringify(J.noRun).slice(0, 600));
p("\n== Hạng 1-5 gốc ra khỏi top 30");
for (const t of J.top5) p(t.run, "#" + t.rank, t.sup, t.model, "->", t.state);
fs.writeFileSync(new URL("./tong-hop.txt", import.meta.url), out.join("\n"));
console.log(out.join("\n").slice(0, 14000));
