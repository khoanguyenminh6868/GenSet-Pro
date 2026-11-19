// So top 30 gốc ↔ nhánh (do-gop.mjs), giải thích MỌI dòng đổi theo lớp (không lấy mẫu).
// node --max-old-space-size=8192 cmp-top30.mjs <catalog-goc.js> <catalog-nhanh.js> <thư mục cn> <gop-goc.json> <gop-nhanh.json> <thư mục ra>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [CB_JS, CH_JS, CN, GB, GH, OUT] = process.argv.slice(2);
const load = (f) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(f, "utf8"), box); return box.GenbidCatalog; };
const CB = load(CB_JS), CH = load(CH_JS);
const K = CH.keyOf;
const textOf = (o) => o.line || (o.lines?.rows || []).join(" ");
// --- bản ghi hai bên, theo khoá dòng (NCC | động cơ | chữ dòng) ---
const recB = new Map(), recH = new Map(); // khoá dòng → [bản ghi]
const tabB = new Set(); // NCC|n|bảng có bản ghi ở gốc
const touchedE = new Map(), touchedA = new Map(); // model → lớp đổi (chỉ thay đổi bản ghi)
const pw = (p) => !p ? "∅" : ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k} ${p[k].kVA ?? "-"}kVA/${p[k].kW ?? "-"}kW`).join("; ");
const rk = (o) => `${o.supplierId}|${o.n}|${o.table}|${o.row}|${o.kind}|${o.model}`;
const recCls = new Map(); // khoá dòng → lớp của bản ghi (mới / mất / đổi)
const supsChanged = new Set();
for (const f of fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"));
  if (s.status === "incomplete") continue;
  const rb = CB.fromSupplier(s), rh = CH.fromSupplier(s);
  for (const o of rb) tabB.add(`${s.id}|${o.n}|${o.table}`);
  const add = (m, o) => { if (o.kind !== "engine") return; const k = `${s.id}|${K(o.model)}|${K(textOf(o))}`; if (!m.has(k)) m.set(k, []); m.get(k).push(o); };
  rb.forEach((o) => add(recB, o)); rh.forEach((o) => add(recH, o));
  const mb = new Map(rb.map((o) => [rk(o), o])), mh = new Map(rh.map((o) => [rk(o), o]));
  const mark = (o, c) => { const m = o.kind === "engine" ? touchedE : touchedA; const k = K(o.model); if (!m.has(k)) m.set(k, new Set()); m.get(k).add(c); supsChanged.add(s.id); };
  for (const [k, o] of mh) if (!mb.has(k)) mark(o, tabB.has(`${s.id}|${o.n}|${o.table}`) ? "mới-bảng-đang-đọc" : "mới-bảng-R1");
  for (const [k, o] of mb) if (!mh.has(k)) mark(o, (o.also === undefined && rh.some((h) => (h.also || []).some((a) => a.n === o.n && a.table === o.table && a.row === o.row))) ? "mất-gộp-also" : "mất");
  for (const [k, o] of mh) if (mb.has(k) && JSON.stringify({ ...mb.get(k), also: null }) !== JSON.stringify({ ...o, also: null })) mark(o, "đổi");
}
// lớp của một khoá dòng (bỏ trường đầu phát) theo bản ghi hai bên
const lineCls = (lk) => {
  const b = recB.get(lk) || [], h = recH.get(lk) || [];
  if (!b.length && h.length) { const o = h[0]; return tabB.has(`${o.supplierId}|${o.n}|${o.table}`) ? "A1 bản ghi mới (dòng mới ở bảng đang đọc: mã Scania / model rác được thay)" : "A2 bản ghi mới (bảng R1 nay đọc được)"; }
  if (b.length && !h.length) return "B1 bản ghi mất (model rác thay bằng mã đúng / ô hai mã)";
  if (b.length > h.length) return "B2 dòng trùng nguyên văn gộp qua also (mất một bản lặp)";
  if (b.length < h.length) return "A3 thêm bản lặp của dòng đã có";
  if (!b.length) return "?? không có bản ghi động cơ";
  const sb = JSON.stringify(b.map((o) => ({ ...o, also: null }))), sh = JSON.stringify(h.map((o) => ({ ...o, also: null })));
  return sb === sh ? null : "C bản ghi của chính dòng đổi";
};
const split = (key) => { const p = key.split("|"); return { sup: p[0], e: p[1], a: p[2], line: p.slice(3).join("|"), lk: `${p[0]}|${p[1]}|${p.slice(3).join("|")}` }; };
// lý do một dòng CŨ (bản ghi không đổi) đổi điểm / vào / ra all
const ctxCls = (key) => {
  const { e, a } = split(key);
  if (touchedE.has(e)) return `D1 bản ghi khác của cùng model động cơ đổi (${[...touchedE.get(e)].sort().join(", ")}): facts / số đông / hãng`;
  if (a && touchedA.has(a)) return `D2 bản ghi khác của cùng model đầu phát đổi (${[...touchedA.get(a)].sort().join(", ")})`;
  return null;
};
console.error("đọc gop…");
const G = JSON.parse(fs.readFileSync(GB, "utf8"));
const H = JSON.parse(fs.readFileSync(GH, "utf8"));
const ms = (all) => { const m = new Map(); for (const [k, s] of all) { if (!m.has(k)) m.set(k, []); m.get(k).push(s); } for (const v of m.values()) v.sort((x, y) => x - y); return m; };
const tally = {}, bump = (sec, cls, luot) => { tally[sec] ??= {}; tally[sec][cls] ??= { dong: 0, luot: new Set() }; tally[sec][cls].dong++; tally[sec][cls].luot.add(luot); };
const rows = ["luot\tphan\tkhoa\tdiem-goc\tdiem-nhanh\tlop"];
const luotCls = { giong: 0, top: 0, all: 0, dropped: 0 };
const unknown = [], newTop = [], pushed = [], dropRows = [];
const recOf = (lk) => (recH.get(lk) || recB.get(lk) || [])[0];
for (const id of Object.keys(G)) {
  const g = G[id], h = H[id];
  const gm = ms(g.all), hm = ms(h.all);
  const keyCls = new Map();
  const why = (key) => {
    if (keyCls.has(key)) return keyCls.get(key);
    const { lk } = split(key);
    let c = lineCls(lk) || ctxCls(key);
    if (!c) {
      // khoá đầu phát khác nhưng cùng dòng (đầu phát tra khác)
      c = null;
    }
    keyCls.set(key, c); return c;
  };
  let anyAll = false;
  for (const key of new Set([...gm.keys(), ...hm.keys()])) {
    const a = gm.get(key) || [], b = hm.get(key) || [];
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    anyAll = true;
    const sec = a.length === b.length ? "all: đổi điểm" : a.length < b.length ? "all: vào" : "all: ra";
    const c = why(key) || "?? không rõ";
    bump(sec, c, id); rows.push([id, sec, key, a.join(","), b.join(","), c].join("\t"));
    if (c.startsWith("??")) unknown.push([id, sec, key, a.join(","), b.join(",")]);
  }
  const topSame = JSON.stringify(g.top) === JSON.stringify(h.top) && JSON.stringify(g.topScore) === JSON.stringify(h.topScore);
  const dropSame = g.dropped === h.dropped && JSON.stringify(g.rowflag) === JSON.stringify(h.rowflag);
  if (!topSame) luotCls.top++; else if (anyAll) luotCls.all++; else if (!dropSame) luotCls.dropped++; else luotCls.giong++;
  if (!dropSame && !anyAll) {
    const rf = (x) => new Set(x.rowflag || []);
    const ga = rf(g), ha = rf(h);
    dropRows.push([id, `dropped ${g.dropped}→${h.dropped}`, `rowflag ra: ${[...ga].filter((x) => !ha.has(x)).join(" ; ")}`, `rowflag vào: ${[...ha].filter((x) => !ga.has(x)).join(" ; ")}`]);
  }
  if (!topSame) {
    const gt = new Set(g.top), ht = new Set(h.top);
    for (const key of h.top) if (!gt.has(key)) {
      const c = why(key) || (JSON.stringify(gm.get(key)) !== JSON.stringify(hm.get(key)) ? "?? không rõ" : "E được kéo vào top vì dòng khác ra (điểm không đổi)");
      bump("top: vào", c, id); rows.push([id, "top: vào", key, (gm.get(key) || []).join(","), h.topScore[h.top.indexOf(key)], c].join("\t"));
      if (c.startsWith("A")) { const o = recOf(split(key).lk); newTop.push({ id, key, score: h.topScore[h.top.indexOf(key)], o, top: h.top, topScore: h.topScore }); }
    }
    for (const key of g.top) if (!ht.has(key)) {
      const inAll = hm.has(key);
      const c = why(key) || (inAll ? (JSON.stringify(gm.get(key)) === JSON.stringify(hm.get(key)) ? "F bị đẩy khỏi top (điểm không đổi, dòng khác vào)" : "?? không rõ") : "?? không rõ");
      bump("top: ra", c, id); rows.push([id, "top: ra", key, g.topScore[g.top.indexOf(key)], (hm.get(key) || []).join(","), c].join("\t"));
      if (c.startsWith("F")) pushed.push({ id, key, score: g.topScore[g.top.indexOf(key)], into: h.top.filter((k) => !gt.has(k)).map((k) => `${k.slice(0, 60)} (${why(k) || "E"}) ${h.topScore[h.top.indexOf(k)]}`) });
    }
  }
}
fs.writeFileSync(path.join(OUT, "cmp-dong.tsv"), rows.join("\n") + "\n");
// (3) dòng mới vào top: thiếu prime / thiếu kVA; dải ước theo trung vị prime kVA của các dòng khác trong top (cap không có trong đầu ra)
const kvaPrime = (p) => p?.prime?.kVA ?? (p?.prime?.kW != null ? p.prime.kW / 0.8 : p?.standby?.kVA != null ? p.standby.kVA / 1.1 : p?.standby?.kW != null ? p.standby.kW / 0.8 / 1.1 : p?.rated?.kVA ?? (p?.rated?.kW != null ? p.rated.kW / 0.8 : null));
const nt = newTop.map((x) => {
  const others = x.top.filter((k) => k !== x.key).map((k) => kvaPrime(recOf(split(k).lk)?.power)).filter((v) => v != null).sort((a, b) => a - b);
  const med = others.length ? others[others.length >> 1] : null, v = kvaPrime(x.o?.power);
  const p = x.o?.power || {};
  const flags = [];
  if (!p.prime) flags.push("không prime");
  if (!["prime", "standby", "rated"].some((k) => p[k]?.kVA != null)) flags.push("không kVA");
  const off = med && v ? v / med : null;
  return { ...x, flags, med, v, off };
});
const ntFlag = nt.filter((x) => x.flags.length);
const fmt = (o) => `\`${o.id}\` ${o.key.split("|").slice(0, 2).join("|")} ${pw(o.o?.power)} điểm ${o.score}; ${o.flags.join(", ")}; prime-tương-đương ${o.v?.toFixed(0) ?? "?"} kVA / trung vị top ${o.med?.toFixed(0) ?? "?"} kVA (×${o.off?.toFixed(2) ?? "?"})`;
let md = `# So top 30 gốc d8db6166 ↔ nhánh 82587105 (mọi lượt, mọi dòng)\n\nLượt: giống ${luotCls.giong}, top đổi ${luotCls.top}, chỉ all đổi ${luotCls.all}, chỉ dropped/rowflag đổi ${luotCls.dropped}. Dòng "không rõ": ${unknown.length}.\n`;
for (const sec of Object.keys(tally).sort()) {
  md += `\n## ${sec}\n\n| lớp | dòng | lượt |\n|---|---:|---:|\n`;
  for (const [c, v] of Object.entries(tally[sec]).sort((a, b) => b[1].dong - a[1].dong)) md += `| ${c} | ${v.dong} | ${v.luot.size} |\n`;
}
md += `\n## Lượt chỉ dropped / rowflag đổi (${dropRows.length})\n\n` + dropRows.map((r) => `- ${r.join(" | ")}`).join("\n") + "\n";
md += `\n## Dòng mới vào top (${nt.length} dòng, ${new Set(nt.map((x) => x.id)).size} lượt); thiếu prime hoặc kVA: ${ntFlag.length} dòng, ${new Set(ntFlag.map((x) => x.id)).size} lượt\n\n` + ntFlag.map((x) => `- ${fmt(x)}`).join("\n") + "\n";
md += `\n### Mọi dòng mới vào top lệch trung vị top quá ±25 %\n\n` + nt.filter((x) => x.off && (x.off < 0.75 || x.off > 1.25)).map((x) => `- ${fmt(x)}`).join("\n") + "\n";
md += `\n## Dòng bị đẩy khỏi top (điểm không đổi) (${pushed.length})\n\n` + pushed.map((x) => `- \`${x.id}\` ${x.key.slice(0, 90)} điểm ${x.score} ← vào: ${x.into.join(" ; ")}`).join("\n") + "\n";
md += `\n## Không rõ (${unknown.length})\n\n` + unknown.slice(0, 300).map((r) => `- ${r.join(" | ")}`).join("\n") + "\n";
fs.writeFileSync(path.join(OUT, "cmp-top30.md"), md);
fs.writeFileSync(path.join(OUT, "cmp-moi-vao-top.tsv"), ["luot\tkhoa\tdiem\tcong-suat\tco\tprime-td\ttrung-vi-top\tti-so"].concat(nt.map((x) => [x.id, x.key, x.score, pw(x.o?.power), x.flags.join(","), x.v?.toFixed(1), x.med?.toFixed(1), x.off?.toFixed(2)].join("\t"))).join("\n") + "\n");
console.log(md.slice(0, 6000));
