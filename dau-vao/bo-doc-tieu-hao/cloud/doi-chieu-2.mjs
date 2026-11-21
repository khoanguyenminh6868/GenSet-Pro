// #1022: đo cloud lần 2 (gốc main ↔ 669b5ae8) đối chiếu với lần 1 đã giải thích (2d2ce26d ↔ f47bedcd). Mọi dòng mất / thêm / đổi điểm. Chỉ đọc.
// node doi-chieu-2.mjs <thư mục có gop-goc.json.gz, gop-nhanh.json.gz>
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const DIR = process.argv[2], HERE = import.meta.dirname, Z = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(f)));
const noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
const best = (list) => { const m = new Map(); for (const [k, s] of list) { const x = noAlt(k); if (!m.has(x) || m.get(x) < s) m.set(x, s); } return m; };
const diff = (G, N) => { const lost = new Map(), add = new Map(), chg = new Map(), topOut = new Map(), topIn = new Map(); for (const [run, g] of Object.entries(G)) { const n = N[run]; if (!n?.all || !g?.all) continue; const a = best(g.all), b = best(n.all); for (const [k, s] of a) { const id = `${run}\t${k}`; if (!b.has(k)) lost.set(id, s); else if (b.get(k) !== s) chg.set(id, b.get(k) - s); } for (const [k, s] of b) if (!a.has(k)) add.set(`${run}\t${k}`, s); const ta = new Set(g.top.map(noAlt)), tb = new Set(n.top.map(noAlt)); for (const k of ta) if (!tb.has(k)) topOut.set(`${run}\t${k}`, g.top.map(noAlt).indexOf(k) + 1); for (const k of tb) if (!ta.has(k)) topIn.set(`${run}\t${k}`, n.top.map(noAlt).indexOf(k) + 1); } return { lost, add, chg, topOut, topIn }; };
const O = diff(Z(path.join(HERE, "goc.json.gz")), Z(path.join(HERE, "nhanh.json.gz"))), G2 = Z(path.join(DIR, "gop-goc.json.gz")), N2 = Z(path.join(DIR, "gop-nhanh.json.gz")), W = diff(G2, N2);
const T = JSON.parse(fs.readFileSync(path.join(HERE, "giai-thich-2.json"), "utf8")), fixed = new Set(T.lost.filter((x) => x.ruled[0] === "(không thấy trong dropped)").map((x) => `${x.run}\t${x.k}`.slice(0, 200)));
const out = [], p = (...a) => out.push(a.join(" ")), add = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n), top = (m, n = 25) => JSON.stringify([...m].sort((a, b) => b[1] - a[1]).slice(0, n));
const sup = (id) => id.split("\t")[1].split("|")[0], eng = (id) => id.split("\t")[1].split("|")[1];
p("Lượt lần 2:", Object.keys(N2).length, "| mất", W.lost.size, "| thêm", W.add.size, "| đổi điểm", W.chg.size, "| ra top", W.topOut.size, "| vào top", W.topIn.size);
p("Lần 1: mất", O.lost.size, "| thêm", O.add.size, "| đổi điểm", O.chg.size, "| ra top", O.topOut.size, "| vào top", O.topIn.size);
const both = [...W.lost.keys()].filter((k) => O.lost.has(k)), newLost = [...W.lost.keys()].filter((k) => !O.lost.has(k)), goneLost = [...O.lost.keys()].filter((k) => !W.lost.has(k));
p("\nMẤT: trùng lần 1", both.length, "| mới", newLost.length, "| lần 1 có, lần 2 không", goneLost.length);
const nl = new Map(), gl = new Map(); newLost.forEach((k) => add(nl, `${sup(k)} ${eng(k)}`)); goneLost.forEach((k) => add(gl, `${sup(k)} ${eng(k)}`));
p("Mất mới theo NCC + động cơ:", top(nl, 60)); p("Hết mất theo NCC + động cơ:", top(gl, 30));
const chgSame = [...W.chg].filter(([k, d]) => O.chg.get(k) === d).length, chgOther = [...W.chg].filter(([k, d]) => O.chg.has(k) && O.chg.get(k) !== d), chgNew = [...W.chg].filter(([k]) => !O.chg.has(k)), chgGone = [...O.chg.keys()].filter((k) => !W.chg.has(k));
p("\nĐỔI ĐIỂM: cùng mức lần 1", chgSame, "| khác mức", chgOther.length, "| mới", chgNew.length, "| lần 1 có, lần 2 không", chgGone.length);
const dm = new Map(), dn = new Map(), mm = new Map(); for (const [, d] of W.chg) add(dm, d); for (const [k, d] of chgNew) add(dn, d); for (const [k, d] of chgOther) add(mm, `${O.chg.get(k)}→${d}`);
p("Mức lần 2:", top(dm)); p("Mức của dòng đổi mới:", top(dn)); p("Khác mức (lần 1→lần 2):", top(mm));
const nc = new Map(); chgNew.forEach(([k]) => add(nc, sup(k))); p("Đổi mới theo NCC:", top(nc, 30));
const an = new Map(); for (const k of W.add.keys()) add(an, `${sup(k)} ${eng(k)}`); p("\nTHÊM vào all theo NCC + động cơ:", top(an, 30));
const inNew = [...W.topOut.keys()].filter((k) => !O.topOut.has(k)); p("\nRA TOP: trùng lần 1", W.topOut.size - inNew.length, "| mới", inNew.length, "| trong đó dòng mất mới", inNew.filter((k) => W.lost.has(k) && !O.lost.has(k)).length, "| dòng còn trong all", inNew.filter((k) => !W.lost.has(k)).length);
const t5 = [...W.topOut].filter(([, r]) => r <= 5); p("Hạng 1–5 ra top lần 2:", t5.length, "| không có ở lần 1:", t5.filter(([k]) => !O.topOut.has(k)).length); t5.filter(([k]) => !O.topOut.has(k)).forEach(([k, r]) => p("  ", k.replace("\t", " "), "hạng", r, W.lost.has(k) ? "MẤT" : "còn all"));
fs.writeFileSync(path.join(DIR, "doi-chieu-2.json"), JSON.stringify({ newLost, goneLost, chgNew: chgNew.map(([k, d]) => [k, d]), chgOther: chgOther.map(([k, d]) => [k, O.chg.get(k), d]), add: [...W.add], topOutNew: inNew }));
fs.writeFileSync(path.join(HERE, "doi-chieu-2.txt"), out.join("\n")); console.log(out.join("\n").slice(0, 12000));
