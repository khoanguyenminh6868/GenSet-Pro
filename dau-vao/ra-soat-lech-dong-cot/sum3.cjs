// node sum3.cjs: vì sao dòng ra bước dữ liệu (O→X) + bước luật (X→N) khác dòng ra gop 8 → 9 (khoá NCC | dòng, bỏ trùng):
// dòng vào ở bước dữ liệu rồi ra ở bước luật, dòng ra ở bước dữ liệu rồi vào lại ở bước luật.
const fs = require("fs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const G8 = J("gop-lech-cot-8.json"), G9 = J("gop-lech-cot-9.json"), XC = J("rowCyl-main.json"), XN = J("rowDL-moi-nocyl.json");
const lineKey = (k) => { const p = k.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const topOf = (R) => Object.entries(R.rows).filter(([, r]) => r.st === "top").map(([k]) => k);
let ON = 0, OX = 0, XN_ = 0, inThenOut = 0, outThenIn = 0, fullOut = 0;
for (const k of Object.keys(G8)) {
  const o = new Set(G8[k].top.map(lineKey)), n = new Set(G9[k].top.map(lineKey));
  const x = new Set(XC[k] ? topOf(XC[k]) : XN[k] ? topOf(XN[k]) : G9[k].top.map(lineKey));
  const d = (a, b) => [...a].filter((r) => !b.has(r));
  ON += d(o, n).length; OX += d(o, x).length; XN_ += d(x, n).length;
  inThenOut += d(x, o).filter((r) => !n.has(r)).length; outThenIn += d(o, x).filter((r) => n.has(r)).length;
  fullOut += G8[k].top.filter((r) => !G9[k].top.includes(r)).length;
}
console.log({ gopFullKey: fullOut, ON, OX, XN: XN_, "vào ở dữ liệu rồi ra ở luật": inThenOut, "ra ở dữ liệu rồi vào lại ở luật": outThenIn });
