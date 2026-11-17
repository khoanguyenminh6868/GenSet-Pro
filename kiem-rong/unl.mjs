import fs from "node:fs";
import * as L from "./lib.mjs";
const R = []; for (const f of fs.readdirSync(L.HERE + "/out").filter((f) => /^run-\d+\.jsonl$/.test(f))) for (const l of fs.readFileSync(L.HERE + "/out/" + f, "utf8").split("\n")) if (l.trim()) R.push(JSON.parse(l));
const P2 = /p\.?\s?r\.?\s?p|prime|continuous|\bcop\b|liên tục|常用|主用|额定|rated|cơ bản|定额|持续/i;
const pool = R.flatMap((r) => (r.samples || []).filter((s) => s.why === "prime-unlabelled").map((s) => ({ key: r.key, cap: r.cap, s })));
const still = pool.filter((x) => !P2.test(x.s.header + " " + x.s.line + " " + x.s.title));
console.log("mẫu prime-unlabelled trong pool:", pool.length, "| còn không có nhãn prime/PRP/rated sau regex mở rộng:", still.length, "| nhãn 'rated/额定/基本' (quy ước ≈ prime):", pool.filter((x) => /rated|额定|cơ bản|定额/i.test(x.s.header + x.s.line) && !/prime|p\.?r\.?p|continuous|liên tục|主用/i.test(x.s.header + x.s.line)).length);
const kinds = {}; for (const x of still) kinds[x.s.powerKinds] = (kinds[x.s.powerKinds] || 0) + 1; console.log(kinds);
let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; const seen = new Set(), pick = [];
for (const x of [...still].sort(() => rnd() - 0.5)) { if (seen.has(x.key) || pick.length >= 24) continue; seen.add(x.key); pick.push(x); }
for (const x of pick) { const s = x.s; console.log(`- ${x.key} cỡ ${x.cap.value}${x.cap.unit} | ${s.sup} | ${s.engine} | min=${JSON.stringify(s.min.prime)} | power=${JSON.stringify(s.power)}\n    dòng: ${s.line.slice(0, 160)}\n    đầu bảng: ${s.header.slice(0, 200)} ‖ ${s.title.slice(0, 80)}`); }
process.exit(0);
