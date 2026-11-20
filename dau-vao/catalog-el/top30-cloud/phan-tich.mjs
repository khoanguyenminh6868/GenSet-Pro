// #969 top 30 cloud: giải thích đủ khác biệt gốc (1e712e19) ↔ nhánh (da6879e9), so đa tập, không lấy mẫu.
// node phan-tich.mjs > phan-tich.txt
import fs from "node:fs";
import zlib from "node:zlib";
const rd = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL(f, import.meta.url))));
const A = rd("gop-goc.json.gz"), B = rd("gop-nhanh.json.gz");
const EL = "eastern-lion-fuan";
const sup = (k) => k.split("|")[0];
// khoá = NCC|động cơ|đầu phát||phần dòng; bỏ trường đầu phát để ghép cặp
const noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
const ms = (arr) => { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; };
const out = [];
const P = (...a) => out.push(a.join(" "));
const runs = Object.keys(A);
// (1) cặp EL: cùng dòng, chỉ khác đầu phát; điểm trước / sau
const pairScore = new Map(); // noAltKey → {n, same, up, down, deltas:Map}
const allLeft = new Map(), allIn = new Map(); // khoá rời / vào all (đếm lượt)
const topOut = new Map(), topIn = new Map();
const nonEl = { allLeft: new Map(), allIn: new Map(), topOut: new Map(), topIn: new Map() };
let elTopA = 0, elTopB = 0, dupRuns = 0;
const replacedBy = new Map(); // NCC ra top → số lần
const enterers = new Map();
const outReason = { elPushed: 0, other: 0 };
for (const id of runs) {
  const a = A[id], b = B[id];
  if (!b) continue;
  const aAll = a.all || [], bAll = b.all || [];
  // điểm theo khoá (đa tập: giữ danh sách điểm)
  const sc = (all) => { const m = new Map(); for (const [k, s] of all) m.set(k, [...(m.get(k) || []), s]); return m; };
  const sa = sc(aAll), sb = sc(bAll);
  // ghép EL theo noAlt
  const elA = new Map(), elB = new Map();
  for (const [k, ss] of sa) if (sup(k) === EL) elA.set(noAlt(k), [...(elA.get(noAlt(k)) || []), ...ss.map((s) => [k, s])]);
  for (const [k, ss] of sb) if (sup(k) === EL) elB.set(noAlt(k), [...(elB.get(noAlt(k)) || []), ...ss.map((s) => [k, s])]);
  for (const [nk, la] of elA) {
    const lb = elB.get(nk);
    if (!lb) continue;
    const e = pairScore.get(nk) || { n: 0, same: 0, up: 0, down: 0, cnt: 0, deltas: new Map(), multi: 0 };
    e.n++;
    if (la.length !== lb.length) e.cnt++;
    if (la.length > 1 || lb.length > 1) e.multi++;
    const da = la.map((x) => x[1]).sort((x, y) => x - y), db = lb.map((x) => x[1]).sort((x, y) => x - y);
    for (let i = 0; i < Math.min(da.length, db.length); i++) {
      const d = db[i] - da[i];
      e.deltas.set(d, (e.deltas.get(d) || 0) + 1);
      if (d === 0) e.same++; else if (d > 0) e.up++; else e.down++;
    }
    pairScore.set(nk, e);
  }
  // rời / vào all, ra / vào top (đa tập)
  const mA = ms(aAll.map((x) => x[0])), mB = ms(bAll.map((x) => x[0]));
  for (const [k, c] of mA) if ((mB.get(k) || 0) < c) { allLeft.set(k, (allLeft.get(k) || 0) + 1); if (sup(k) !== EL) nonEl.allLeft.set(k, [...(nonEl.allLeft.get(k) || []), id]); }
  for (const [k, c] of mB) if ((mA.get(k) || 0) < c) { allIn.set(k, (allIn.get(k) || 0) + 1); if (sup(k) !== EL) nonEl.allIn.set(k, [...(nonEl.allIn.get(k) || []), id]); }
  const tA = ms(a.top), tB = ms(b.top);
  const elInA = a.top.filter((k) => sup(k) === EL).length, elInB = b.top.filter((k) => sup(k) === EL).length;
  elTopA += elInA; elTopB += elInB;
  let outs = 0;
  for (const [k, c] of tA) if ((tB.get(k) || 0) < c) {
    topOut.set(k, (topOut.get(k) || 0) + 1);
    if (sup(k) !== EL) { outs++; replacedBy.set(sup(k), (replacedBy.get(sup(k)) || 0) + 1); nonEl.topOut.set(k, (nonEl.topOut.get(k) || 0) + 1); }
  }
  for (const [k, c] of tB) if ((tA.get(k) || 0) < c) { topIn.set(k, (topIn.get(k) || 0) + 1); enterers.set(sup(k), (enterers.get(sup(k)) || 0) + 1); if (sup(k) !== EL) nonEl.topIn.set(k, (nonEl.topIn.get(k) || 0) + 1); }
  if (outs) { if (elInB > elInA) outReason.elPushed++; else outReason.other++; }
}
// (1)
const pairs = [...pairScore.values()];
const sum = (f) => pairs.reduce((s, e) => s + f(e), 0);
P(`(1) cặp EL (cùng dòng, khác trường đầu phát): ${pairScore.size} khoá-dòng; lượt-cặp ${sum((e) => e.n)}; điểm bằng ${sum((e) => e.same)}, tăng ${sum((e) => e.up)}, giảm ${sum((e) => e.down)}; lượt số bản khác ${sum((e) => e.cnt)}; lượt có >1 bản ${sum((e) => e.multi)}`);
const dAll = new Map(); for (const e of pairs) for (const [d, c] of e.deltas) dAll.set(d, (dAll.get(d) || 0) + c);
P("    phân bố chênh điểm (mới − cũ):", JSON.stringify([...dAll].sort((x, y) => y[1] - x[1])));
// (2) khoá rời không có khoá mới tương ứng
const leftKeys = [...allLeft.keys()], inKeys = new Set([...allIn.keys()].map(noAlt));
const unpaired = leftKeys.filter((k) => !inKeys.has(noAlt(k)));
P(`(2) rời all ${allLeft.size} khoá, vào all ${allIn.size}; rời không có khoá vào cùng dòng: ${unpaired.length}`);
for (const k of unpaired) P(`    ${allLeft.get(k)}× ${k.slice(0, 200)}`);
const inUnpaired = [...allIn.keys()].filter((k) => !new Set(leftKeys.map(noAlt)).has(noAlt(k)));
P(`    vào không có khoá rời cùng dòng: ${inUnpaired.length}`);
for (const k of inUnpaired) P(`    ${allIn.get(k)}× ${k.slice(0, 200)}`);
// (3)
P(`(3) ra top ${topOut.size} khoá, vào top ${topIn.size}; dòng EL trong top: gốc ${elTopA} → nhánh ${elTopB} (tổng mọi lượt)`);
P(`    lượt có khoá NCC khác ra top: EL vào thêm ${outReason.elPushed}, không ${outReason.other}`);
P("    NCC ra top (lượt-khoá):", JSON.stringify([...replacedBy].sort((x, y) => y[1] - x[1])));
P("    NCC vào top (lượt-khoá):", JSON.stringify([...enterers].sort((x, y) => y[1] - x[1])));
const elOut = [...topOut.keys()].filter((k) => sup(k) === EL), elOutPaired = elOut.filter((k) => [...topIn.keys()].some((x) => noAlt(x) === noAlt(k)));
P(`    khoá EL ra top ${elOut.length}, trong đó có cặp (cùng dòng, đầu phát mới) vào top: ${elOutPaired.length}`);
// (4)
P(`(4) khoá NCC khác rời all: ${nonEl.allLeft.size}, vào all: ${nonEl.allIn.size}`);
for (const [k, ids] of nonEl.allLeft) P(`    RỜI ${ids.length}× ${k.slice(0, 180)} | ${ids.slice(0, 4).join(",")}`);
for (const [k, ids] of nonEl.allIn) P(`    VÀO ${ids.length}× ${k.slice(0, 180)} | ${ids.slice(0, 4).join(",")}`);
P(`    khoá NCC khác ra top ${nonEl.topOut.size} (lượt ${[...nonEl.topOut.values()].reduce((s, x) => s + x, 0)}), vào top ${nonEl.topIn.size} (lượt ${[...nonEl.topIn.values()].reduce((s, x) => s + x, 0)})`);
console.log(out.join("\n"));
