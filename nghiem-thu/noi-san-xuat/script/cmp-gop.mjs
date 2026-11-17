import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
let n = 0, same = 0, order = 0, set = 0, err = 0, inT = 0, outT = 0, allChg = 0, dropChg = 0, makeChg = 0;
const ex = [];
for (const k of Object.keys(A)) {
  const a = A[k], b = B[k];
  if (!b || a.error || b.error) { err++; continue; }
  n++;
  if (a.all !== b.all) allChg++;
  if (a.dropped !== b.dropped) dropChg++;
  const ja = JSON.stringify(a.top), jb = JSON.stringify(b.top);
  if (ja === jb) { same++; if (JSON.stringify(a.topMake) !== JSON.stringify(b.topMake)) makeChg++; continue; }
  const i = b.top.filter((x) => !a.top.includes(x)), o = a.top.filter((x) => !b.top.includes(x));
  if (!i.length && !o.length) order++; else { set++; inT += i.length; outT += o.length; if (ex.length < 8) ex.push({ k, in: i.slice(0, 3), out: o.slice(0, 3) }); }
}
console.log({ runs: n, err, same, orderOnly: order, setChanged: set, rowsIn: inT, rowsOut: outT, allCountChanged: allChg, droppedCountChanged: dropChg, makeShownChanged: makeChg, onlyA: Object.keys(A).length, onlyB: Object.keys(B).length });
for (const x of ex) console.log(JSON.stringify(x));
