// #1022 đo lần 2: ngưỡng tiêu hao của mọi lượt có dòng mất mới / −300 mới ↔ chữ HSMT; trạng thái 33 dòng sizeBlocks; 2 tờ longkai mới. Chữ HSMT chỉ in ra màn hình.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const D = process.argv[2], HERE = import.meta.dirname, R = (f) => JSON.parse(fs.readFileSync(f, "utf8")), Z = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(D, f))));
const T3 = R(path.join(D, "giai-thich-3.json")), T1 = R(path.join(HERE, "giai-thich-2.json")), J = R(path.join(D, "doi-chieu-2.json")), docs = R("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs;
const byNo = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo && d.config?.text).map((d) => [d.notifyNo, d]));
const cut = (s) => { const i = s.indexOf("\t"); return s.slice(0, i + 121); }, id = (x) => `${x.run}\t${x.k}`, newSet = new Set(J.newLost.map(cut)), RF = new Set(["fuel", "fuel75", "fuel50"]);
const lim = new Map(); for (const x of T3.lost) if (newSet.has(id(x)) && x.ruled.some((r) => RF.has(r))) { const e = lim.get(x.run) || { l: x.lim, n: 0 }; e.n++; lim.set(x.run, e); }
for (const x of T3.fuelMinus) if (!lim.has(x.run)) lim.set(x.run, { l: { maxFuel: x.lim.maxFuel, maxFuel75: x.lim.maxFuel75, maxFuel50: x.lim.maxFuel50, cap: null }, n: 0, minus: true });
console.log("Lượt có ngưỡng tiêu hao cần đối chiếu:", lim.size);
const fig = (v) => (v == null ? [] : [String(v), String(v).replace(".", ",")]);
let auto = 0; const hand = [];
for (const [run, e] of lim) { const t = byNo.get(run.split("#")[0]).config.text, ok = [["maxFuel", "100"], ["maxFuel75", "75"], ["maxFuel50", "50"]].filter(([k]) => e.l[k] != null).every(([k, load]) => fig(e.l[k]).some((f) => { for (let i = t.indexOf(f); i >= 0; i = t.indexOf(f, i + 1)) { const c = t.slice(Math.max(0, i - 90), i + 45); if (/ti[êe]u\s*(hao|th[ụu])/i.test(c) && (load === "100" ? !new RegExp(`(?:75|50)\\s*%[^%]{0,12}$`).test(t.slice(Math.max(0, i - 25), i)) : new RegExp(`${load}\\s*%`).test(c))) return true; } return false; })); if (ok) auto++; else hand.push([run, e]); }
console.log("Số ngưỡng có trong câu tiêu hao đúng mức tải:", auto, "| xem tay:", hand.length);
for (const [run, e] of hand) { const t = byNo.get(run.split("#")[0]).config.text, S = []; for (const m of t.matchAll(/ti[êe]u\s*(?:hao|th[ụu])/gi)) { if (S.length < 3) S.push(t.slice(m.index, m.index + 95).replace(/\s+/g, " ")); } console.log(` ${run} (${e.n} dòng) 100%=${e.l.maxFuel ?? "-"} 75%=${e.l.maxFuel75 ?? "-"} 50%=${e.l.maxFuel50 ?? "-"}`); S.forEach((s) => console.log("    «" + s + "»")); }
const G = Z("gop-goc.json.gz"), N = Z("gop-nhanh.json.gz"), noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
console.log("\n33 dòng sizeBlocks ở đo lần 2:"); const st = new Map(); for (const x of T1.lost.filter((y) => ["IB2300260615#1", "IB2300162912#0", "IB2300046353#1"].includes(y.run) && y.ruled[0] !== "(không thấy trong dropped)")) { const has = (o) => o[x.run].all.some(([k]) => noAlt(k).slice(0, 120) === x.k), k = `${x.run} gốc ${has(G) ? "có" : "không"} / nhánh ${has(N) ? "có" : "không"}`; st.set(k, (st.get(k) || 0) + 1); } console.log(JSON.stringify([...st]));
const t = byNo.get("IB2400602840").config.text; console.log("\nIB2400602840:", [...t.matchAll(/x[iy][\s-]*lanh/gi)].slice(0, 6).map((m) => "«" + t.slice(Math.max(0, m.index - 45), m.index + 40).replace(/\s+/g, " ") + "»").join("\n  "));
const L = R("C:/Projects/GenSet Pro/wt-tieu-hao/suppliers/cn/longkai-power.json"); for (const m of ["WP13D490E310", "6M26D484E200"]) for (const b of L.specTables.filter((x) => [...(x.header || []), ...(x.rows || [])].some((r) => String(r).includes(`POWER YOUR FUTURE | ${m}`)))) console.log(`\n${m} n${b.n}:`, [...(b.header || []), ...(b.rows || [])].map(String).filter((r) => /prime|cylinder|displacement|bore|100%/i.test(r)).slice(0, 9).map((r) => r.slice(0, 70)).join(" ¦ "));
