// Tổng hợp kết quả runall -> in số liệu cho báo cáo. node analyze.mjs  (ghi out/summary.json)
import fs from "node:fs";
import * as L from "./lib.mjs";
const R = []; for (const f of fs.readdirSync(L.HERE + "/out").filter((f) => /^run-\d+\.jsonl$/.test(f))) for (const l of fs.readFileSync(L.HERE + "/out/" + f, "utf8").split("\n")) if (l.trim()) R.push(JSON.parse(l));
const ok = R.filter((r) => !r.error && !r.noCap), err = R.filter((r) => r.error), nocap = R.filter((r) => r.noCap);
const kva = (c) => (c.unit === "kVA" ? c.value : c.value / 0.8);
const S = {};
const pr = (...a) => console.log(...a);
const bin = (n) => (n === 0 ? "0" : n < 10 ? "1-9" : n < 30 ? "10-29" : ">=30");
// 1. bao phủ
const keys = new Set(ok.map((r) => r.key));
pr("== 1. BAO PHỦ ==");
pr("lượt (gói×cỡ) chạy được:", ok.length, "| gói:", keys.size, "| lỗi chạy:", err.length, "| không đọc được cỡ:", nocap.length);
const bySrc = {}; for (const r of ok) bySrc[r.src] = (bySrc[r.src] || 0) + 1; pr("theo nguồn:", bySrc);
const pkgSrc = {}; for (const k of keys) { const r = ok.find((x) => x.key === k); pkgSrc[r.src] = (pkgSrc[r.src] || 0) + 1; } pr("gói theo nguồn:", pkgSrc);
const bk = (v) => (v <= 20 ? "<=20" : v <= 60 ? "21-60" : v <= 150 ? "61-150" : v <= 400 ? "151-400" : v <= 1000 ? "401-1000" : ">1000");
const bs = {}; for (const r of ok) bs[bk(kva(r.cap))] = (bs[bk(kva(r.cap))] || 0) + 1; pr("cỡ (kVA):", bs);
const sz = new Set(ok.map((r) => `${r.cap.value}${r.cap.unit}`)); pr("cỡ khác nhau:", sz.size, "| min", Math.min(...ok.map((r) => kva(r.cap))).toFixed(1), "max", Math.max(...ok.map((r) => kva(r.cap))).toFixed(0));
const og = {}; for (const r of ok) og[r.origin] = (og[r.origin] || 0) + 1; pr("nhóm xuất xứ:", og);
pr("đồng bộ thương hiệu: có", ok.filter((r) => r.sync).length, "không", ok.filter((r) => !r.sync).length, "| partsOnly", ok.filter((r) => r.partsOnly).length, "brand", ok.filter((r) => r.brand).length);
const multi = new Set(ok.filter((r) => r.nSizes > 1).map((r) => r.key));
pr("gói một cỡ:", [...keys].filter((k) => !multi.has(k)).length, "| gói nhiều cỡ:", multi.size, "(lượt cỡ:", ok.filter((r) => r.nSizes > 1).length + ")");
pr("có keep (configmatch):", ok.filter((r) => r.keepN).length, "| freq 50/60:", ok.filter((r) => r.freq === 50).length, ok.filter((r) => r.freq === 60).length, "| HSMT nêu hãng động cơ:", ok.filter((r) => r.engineMakes.length).length, "| capOn:", ok.filter((r) => r.capOn).length);
// 2. bất biến
pr("\n== 2. BẤT BIẾN ==");
const vt = {}; for (const r of ok) for (const v of r.viol) vt[v.t] = (vt[v.t] || 0) + 1; pr("vi phạm theo loại:", vt);
for (const r of ok) for (const v of r.viol) if (v.t !== "makeCap") pr("  VP", r.key, r.cap.value, JSON.stringify(v).slice(0, 220));
const mc = ok.flatMap((r) => r.viol.filter((v) => v.t === "makeCap").map((v) => ({ ...v, key: r.key, cap: r.cap.value })));
pr("trần hãng >10:", mc.length, "lượt; trong đó còn dòng hãng khác hợp lệ chưa chọn (otherLeft>0):", mc.filter((v) => v.otherLeft > 0).length, "| keep:", mc.filter((v) => v.keepRun).length, "| sync:", mc.filter((v) => v.sync).length);
for (const v of mc.slice(0, 40)) pr("  makeCap", v.key, v.cap, v.make, v.n, "topN", v.topN, "otherLeft", v.otherLeft, v.keepRun ? "keep" : "", v.sync ? "sync" : "");
const cp = ok.filter((r) => r.capOn); const mx = Math.max(0, ...cp.map((r) => Math.max(0, ...Object.values(r.makes)))); pr("capOn: hãng lớn nhất trong top =", mx, "| lượt capOn có topN<30:", cp.filter((r) => r.topN < 30).length);
const nc = ok.filter((r) => !r.capOn); pr("không capOn (HSMT nêu hãng/model):", nc.length, "| hãng lớn nhất >10:", nc.filter((r) => Math.max(0, ...Object.values(r.makes)) > 10).length);
// 3. thiếu ứng viên
pr("\n== 3. THIẾU ỨNG VIÊN ==");
const tab = (f) => { const t = { "0": 0, "1-9": 0, "10-29": 0, ">=30": 0 }; for (const r of ok) t[bin(f(r))]++; return t; };
pr("dòng trong dải TRƯỚC khi loại theo ngưỡng — dải cũ 95-140%:", tab((r) => r.old.nBand));
pr("dòng trong dải TRƯỚC khi loại theo ngưỡng — dải mới 99,5-120%:", tab((r) => r.nBand));
pr("dòng còn xếp hạng SAU khi loại ngưỡng (dải mới):", tab((r) => r.nRows));
pr("topN (≤30) dải mới:", tab((r) => r.topN));
const fullOld = ok.filter((r) => r.old.full); pr("lượt có chạy đầy đủ dải cũ:", fullOld.length, "| topN cũ <30:", fullOld.filter((r) => r.old.topN < 30).length, "| topN mới <30:", fullOld.filter((r) => r.topN < 30).length);
const risk = ok.filter((r) => r.old.nBand > 0 && r.nRows < 5).sort((a, b) => a.nRows - b.nRows);
pr("RỦI RO: cỡ có ứng viên ở dải cũ mà dải mới (sau khi loại) <5:", risk.length);
for (const r of risk) pr(`  ${r.key} ${r.cap.value}${r.cap.unit} [${r.src}${r.nSizes > 1 ? " " + r.nSizes + "cỡ" : ""}] cũ=${r.old.nBand} mớiTrongDải=${r.nBand} mớiSauNgưỡng=${r.nRows} top=${r.topN} loại=${JSON.stringify(r.dropBy)} gần nhất: dưới ${r.below} / trên ${r.above} | ngưỡng ${JSON.stringify(r.h1)}`);
const zero = ok.filter((r) => r.nRows === 0 || r.topN === 0); pr("cỡ có 0 dòng sau khi loại / top=0:", zero.length);
for (const r of zero) pr(`  ${r.key} ${r.cap.value}${r.cap.unit} [${r.src}] cũ=${r.old.nBand} mớiTrongDải=${r.nBand} loại=${JSON.stringify(r.dropBy)} gần nhất: dưới ${r.below} trên ${r.above} ngưỡng ${JSON.stringify(r.h1)}`);
const bandOnly = ok.filter((r) => r.nBand === 0); pr("cỡ KHÔNG có dòng nào trong dải mới (dù chưa xét ngưỡng):", bandOnly.length, "| trong đó dải cũ >0:", bandOnly.filter((r) => r.old.nBand > 0).length, "| cả hai =0:", bandOnly.filter((r) => r.old.nBand === 0).length);
const lost = ok.filter((r) => r.old.nBand > 0 && r.nBand < r.old.nBand * 0.3); pr("dải mới giữ <30% số dòng của dải cũ:", lost.length);
const dr = ok.reduce((a, r) => a + (r.old.nBand), 0), dn = ok.reduce((a, r) => a + r.nBand, 0), dk = ok.reduce((a, r) => a + r.nRows, 0); pr("tổng dòng trong dải: cũ", dr, "mới", dn, "→ sau loại", dk);
// 5. thống kê dropped
pr("\n== DROPPED ==");
const tot = { disp: 0, maxDisp: 0, cyl: 0, prime: 0 }; let any = 0, multiK = 0; for (const r of ok) { for (const k of Object.keys(tot)) tot[k] += r.dropBy[k]; any += r.nDropped; multiK += r.dropMulti; }
pr("tổng dòng bị loại:", any, "theo loại:", tot, "(nhiều lý do:", multiK + ")", "| lượt có dòng bị loại:", ok.filter((r) => r.nDropped).length, "| gói:", new Set(ok.filter((r) => r.nDropped).map((r) => r.key)).size);
const pk = {}; for (const r of ok) for (const [k, v] of Object.entries(r.ev.primeKinds)) pk[k] = (pk[k] || 0) + v; pr("dòng Prime bị loại theo kiểu công suất của dòng:", pk);
const pl = ok.reduce((a, r) => [a[0] + r.ev.primeLabelled.yes, a[1] + r.ev.primeLabelled.no], [0, 0]); pr("Prime bị loại: tiêu đề/dòng có chữ prime/liên tục (nhãn rõ):", pl[0], "| KHÔNG có chữ prime trong tiêu đề/dòng:", pl[1]);
pr("disp bị loại: đơn vị lạ", ok.reduce((a, r) => a + r.ev.dispUnitOdd, 0), "| chỉ tính từ đường kính×hành trình (không có dung tích):", ok.reduce((a, r) => a + r.ev.dispCalcOnly, 0), "| nhãn bình/dầu:", ok.reduce((a, r) => a + r.ev.dispTank, 0));
// minPrime từ alt/engine
pr("\n== minPrime chỉ có từ đầu phát/động cơ ==");
const thr = JSON.parse(fs.readFileSync(L.HERE + "/out/thr.json", "utf8")), tm = new Map(thr.map((t) => [`${t.key}|${t.i}`, t]));
const altOnly = ok.filter((r) => { const t = tm.get(`${r.key}|${r.i}`); return t && r.h1.minPrime && t.prime.length && t.prime.every((p) => p.sec !== "genset"); });
pr("lượt có minPrime mà mọi giá trị prime thô nằm ở phần alt/engine:", altOnly.length, "| trong đó dòng bị loại vì prime:", altOnly.reduce((a, r) => a + r.dropBy.prime, 0));
for (const r of altOnly.slice(0, 40)) { const t = tm.get(`${r.key}|${r.i}`); pr("  ", r.key, r.cap.value + r.cap.unit, "minPrime", JSON.stringify(r.h1.minPrime), "thô", JSON.stringify(t.prime), "loạiPrime", r.dropBy.prime, "nRows", r.nRows); }
// cỡ nhiều cỡ, ngưỡng của cỡ khác
pr("\n== gói nhiều cỡ: ảnh hưởng ==");
const sus = JSON.parse(fs.readFileSync(L.HERE + "/out/multi.json", "utf8")).filter((m) => Object.keys(m.suspect).length);
for (const m of sus) { const r = ok.find((x) => x.key === m.key && x.i === m.i); pr("  ", m.key, m.cap, JSON.stringify(m.suspect), r ? `→ nBand=${r.nBand} nRows=${r.nRows} top=${r.topN} loại=${JSON.stringify(r.dropBy)}` : "(chưa chạy)"); }
// top: hãng
pr("\n== top: nhóm xuất xứ động cơ, NCC ==");
const cc = {}; for (const r of ok) for (const x of r.top) { const k = x.ctry || "?"; cc[k] = (cc[k] || 0) + 1; } pr("quốc gia NCC của dòng trong top (tổng):", Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 8));
fs.writeFileSync(L.HERE + "/out/summary.json", JSON.stringify({ n: ok.length, keys: keys.size }));
process.exit(0);
