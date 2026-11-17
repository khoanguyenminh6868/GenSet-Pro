// Tạo bản sao config-bot.mjs (chỉ để đo, ngoài git) với dải cũ 95-140%; mọi thứ khác y nguyên.
import fs from "node:fs";
const SUP = "C:/Projects/GenSet Pro/GenSet-Pro/suppliers";
let s = fs.readFileSync(SUP + "/config-bot.mjs", "utf8");
const n0 = s.length;
s = s.replace(/from "\.\/([\w.-]+\.mjs)"/g, (_, f) => `from "file:///${SUP.replace(/ /g, "%20")}/${f}"`);
s = s.replace(/const ROOT = path\.dirname\(fileURLToPath\(import\.meta\.url\)\);/, `const ROOT = "${SUP}";`);
s = s.replace(/const SCRIPT = fileURLToPath\(import\.meta\.url\);/, `const SCRIPT = "${SUP}/config-bot.mjs";`);
if (!/export const NEAR_LOW = 0\.995, NEAR_HIGH = 1\.2;/.test(s)) throw new Error("NEAR không thấy");
s = s.replace("export const NEAR_LOW = 0.995, NEAR_HIGH = 1.2;", "export const NEAR_LOW = 0.95, NEAR_HIGH = 1.4;");
fs.writeFileSync("old/config-bot-oldband.mjs", s);
console.log("ok", n0, s.length);

// Bản đo thứ hai: dải HIỆN TẠI nhưng engineMins / powerMins lộ danh sách giá trị thô và dòng nguồn (chỉ để soát ngưỡng).
let t = fs.readFileSync(SUP + "/config-bot.mjs", "utf8");
t = t.replace(/from "\.\/([\w.-]+\.mjs)"/g, (_, f) => `from "file:///${SUP.replace(/ /g, "%20")}/${f}"`);
t = t.replace(/const ROOT = path\.dirname\(fileURLToPath\(import\.meta\.url\)\);/, `const ROOT = "${SUP}";`);
t = t.replace(/const SCRIPT = fileURLToPath\(import\.meta\.url\);/, `const SCRIPT = "${SUP}/config-bot.mjs";`);
const rep = (a, b) => { if (!t.includes(a)) throw new Error("không thấy: " + a.slice(0, 60)); t = t.replace(a, b); };
rep(`const one = (list) => (new Set(list).size === 1 ? list[0] : null), disp = [], dmax = [], cyl = [],`, `const _src = { disp: [], dmax: [], cyl: [] }; const one = (list) => (new Set(list).size === 1 ? list[0] : null), disp = [], dmax = [], cyl = [],`);
rep(`if (m) dmax.push(Number(m[1].replace(",", ".")));`, `if (m) { dmax.push(Number(m[1].replace(",", "."))); _src.dmax.push(cell); }`);
rep(`if (d) disp.push(Number(d[1].replace(",", ".")));`, `if (d) { disp.push(Number(d[1].replace(",", "."))); _src.disp.push(cell); }`);
rep(`else if (du) disp.push(/cc|cm/i.test(du[0]) ? Number(du[1].replace(/[.,]/, "")) / 1000 : Number(du[1].replace(",", ".")));`, `else if (du) { disp.push(/cc|cm/i.test(du[0]) ? Number(du[1].replace(/[.,]/, "")) / 1000 : Number(du[1].replace(",", "."))); _src.disp.push(cell); }`);
rep(`if (c && Number(c[1]) >= 1 && Number(c[1]) <= 20) cyl.push(Number(c[1]));`, `if (c && Number(c[1]) >= 1 && Number(c[1]) <= 20) { cyl.push(Number(c[1])); _src.cyl.push(cell); }`);
rep(`return { minDisp: one(disp), maxDisp: one(dmax), minCyl: one(cyl), ...powerMins(t) };`, `return { minDisp: one(disp), maxDisp: one(dmax), minCyl: one(cyl), ...powerMins(t), _raw: { disp, dmax, cyl }, _src };`);
rep(`return { minPrime: p, maxFuel:`, `return { _prime: prime.map((v) => ({ kVA: v.kVA, kW: v.kW, sec: v.sec })), _primeKept: list.length, minPrime: p, maxFuel:`);
fs.writeFileSync("old/config-bot-instr.mjs", t);
console.log("instr ok");
