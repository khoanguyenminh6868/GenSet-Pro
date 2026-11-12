// Hậu kiểm Gợi ý giá đấu (2026-11-10): với mỗi phần mua sắm máy phát đã có kết quả trong bidhist, tính lại 3 mức giá
// chỉ bằng dữ liệu đã có TRƯỚC ngày đóng thầu của gói đó (phần khác có kết quả công bố trước ngày đóng thầu), rồi so với
// giá trúng thật: tỉ lệ giá trúng rơi trong [Cạnh tranh, Cao], sai số trung vị của mức Trung vị (điểm % giá gói), tách
// theo số nhà thầu và nhóm xuất xứ động cơ của hàng trúng. Chỉ đọc doc-cache, không gọi agent, không ghi gì lên web.
//   node suppliers/bidprice-backtest.mjs [--cache <thư mục doc-cache>] [--json <tệp ra>] [--limit N] [--loose] [--calib]
// --calib: thêm ba mức hiệu chỉnh theo cạnh tranh dự báo (suggest opts.fc, web/bidprice.js CALIB lam/q/s), so trên cùng
// phần; in thêm nửa sớm (nửa dùng để chọn CALIB.s) và nửa muộn (kiểm ngoài mẫu). GENBID_BIDPRICE_S=1 để đo không giãn.
// --loose: cách "theonhom" nhận cả gói cũ không rõ nhóm (chỉ bỏ gói khác nhóm), để so với cách chặt mặc định.
// GIỚI HẠN: bot thật cho agent xếp từng gói ứng viên giống/gần/khác; ở đây mọi ứng viên code chọn (candidates) đều được
// coi là "gần" (bỏ bước agent), nên số đo là của lượt chọn bằng code, không phải của kết quả bot đăng lên web.
// Gói cần đo không có Gợi ý cấu hình (cấu hình chào chưa biết): nhóm xuất xứ lấy theo HSMT, như bot khi chưa có cấu hình.
// Hai cách:
//   chung   — như bot hiện nay cho hạng 1: ứng viên + gói cùng cỡ (prior), nhóm theo HSMT.
//   theonhom — giá theo nhóm xuất xứ (groupPrices, mục 3): nhóm = nhóm động cơ của hàng trúng thật (tức giả như biết sẽ
//              chào động cơ nhóm nào), chỉ gói cũ biết rõ nhóm và cùng nhóm. Chỉ đo khi hàng trúng cho biết nhóm.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
await import(pathToFileURL(path.join(ROOT, "..", "web", "bidprice.js")).href);
const BP = globalThis.GenbidBidprice;
if (Number(process.env.GENBID_BIDPRICE_S) > 0) BP.CALIB.s = Number(process.env.GENBID_BIDPRICE_S);
const arg = (k, d = "") => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };

export function loadDocs(dir) {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, "bidhist.json"), "utf8")).docs || {};
  return Object.fromEntries(Object.entries(raw).map(([k, x]) => [x.id || k, x.d]).filter(([, d]) => d));
}
const time = (v) => { const t = v ? Date.parse(v) : NaN; return Number.isFinite(t) ? t : null; };
// When a lot's result could be known: its result date, else the decision date, else the opening.
const knownAt = (d) => time(d.resultAt) ?? time(d.decisionDate) ?? time(d.openedAt) ?? time(d.bidCloseDate);

// The lots to test: supply of a generator set, decided, a winner, ratio in the range candidates accepts, a power.
export function cases(docs) {
  const out = [];
  for (const [key, d] of Object.entries(docs)) {
    if (!d.final || !BP.isGensetName(d.bidName)) continue;
    const multi = (d.lots || []).length > 1, close = time(d.bidCloseDate) ?? time(d.openedAt);
    if (close == null) continue;
    for (const lot of d.lots || []) {
      const name = (multi && lot.lotName) || d.bidName;
      if (BP.bidKind(name) !== "supply") continue;
      const w = (lot.bidders || []).find((b) => b.won), price = lot.price ?? (multi ? null : d.estimatedPrice), wp = w && Number(w.winPrice ?? BP.bdPrice(w));
      if (!w || !(price > 0) || !(wp > 0)) continue;
      const ratio = wp / price;
      if (ratio < 0.3 || ratio > 1.02) continue;
      const goods = lot.goods || [];
      if (BP.movesOldSet(d.config?.text) && !goods.some((g) => BP.isGensetName(g.name))) continue;
      const kName = BP.kvaOf(lot.lotName) || (multi ? null : BP.kvaOf(d.bidName)), kCfg = kName ? null : BP.cfgPower(d, multi);
      const K = kName || kCfg?.kva || null;
      if (!K) continue;
      out.push({ key, lotNo: lot.lotNo || "", name, K, rating: kName ? BP.kvaRated(name)?.rating || null : kCfg?.rating || null, P: price, ratio, nb: (lot.bidders || []).length,
        group: BP.goodsGroup(goods), close, investorName: d.investorName || "", cfgText: d.config?.text || "", location: d.location || "", field: d.field || "", bidCloseDate: d.bidCloseDate || d.openedAt || "" });
    }
  }
  return out.sort((a, b) => a.close - b.close);
}

// Every candidate the code picked counts as "close" (no agent).
const asClose = (list) => list.map((s) => ({ ...s, level: "close" }));
export function run(docs, { limit = 0, calib = false } = {}) {
  const all = cases(docs), byKnown = Object.entries(docs).map(([k, d]) => [k, d, knownAt(d)]).filter(([, , t]) => t != null).sort((a, b) => a[2] - b[2]);
  const rows = [];
  let j = 0, before = {};
  for (const c of limit ? all.slice(-limit) : all) {
    // Docs whose result was out before this lot closed (byKnown is sorted, the cases too).
    while (j < byKnown.length && byKnown[j][2] < c.close) { before[byKnown[j][0]] = byKnown[j][1]; j++; }
    const docsBefore = { ...before };
    delete docsBefore[c.key];
    const t = { notifyNo: c.key, bidName: c.name, investorName: c.investorName, cfgText: c.cfgText, rating: c.rating };
    const cand = BP.candidates(t, docsBefore, c.K, c.P);
    // --calib: the competition forecast from the same data (nbForecast), for suggest's weighted levels (stats.calib).
    const fc = calib ? BP.nbForecast({ notifyNo: c.key, investorName: c.investorName, location: c.location, field: c.field, bidCloseDate: c.bidCloseDate }, docsBefore) : null;
    const st = BP.suggest(asClose(cand.list), c.P, c.K, cand.prior, fc ? { fc } : {});
    const row = { key: c.key, lotNo: c.lotNo, nb: c.nb, group: c.group, ratio: c.ratio, close: c.close, base: lv(st, c), ...(calib ? { cal: st.calib ? lv(st.calib, c) : null } : {}) };
    if (BP.groupPrices && c.group) {
      const g = BP.groupPrices({ t, docs: docsBefore, K: c.K, P: c.P, group: c.group, strict: !process.argv.includes("--loose") });
      row.grp = lv(g.stats, c);
    }
    rows.push(row);
  }
  return rows;
}
const lv = (st, c) => {
  if (!st.levels.length) return null;
  const [lo, mid, hi] = st.levels.map((l) => l.ratio);
  return { lo, mid, hi, inside: c.ratio >= lo - 1e-9 && c.ratio <= hi + 1e-9, err: mid - c.ratio, pool: st.pool };
};

const med = (xs) => { const a = [...xs].sort((x, y) => x - y); return a.length ? (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2) : null; };
const pct = (v) => (v == null ? "—" : `${(100 * v).toFixed(1)}`);
export function summarize(rows, field) {
  const has = rows.filter((r) => r[field]);
  const s = (xs) => ({ n: xs.length, inside: xs.length ? xs.filter((r) => r[field].inside).length / xs.length : null, medAbsErr: med(xs.map((r) => Math.abs(r[field].err))), medErr: med(xs.map((r) => r[field].err)), width: med(xs.map((r) => r[field].hi - r[field].lo)) });
  const nbB = [["2–3", (n) => n >= 2 && n <= 3], ["4–5", (n) => n >= 4 && n <= 5], ["≥6", (n) => n >= 6], ["1", (n) => n <= 1]];
  return { all: s(has), noPrice: rows.length - has.length, byNb: nbB.map(([l, f]) => [l, s(has.filter((r) => f(r.nb)))]), byGroup: ["cn", "cnmade", "foreign", null].map((g) => [g || "không rõ", s(has.filter((r) => r.group === g))]) };
}
function print(title, sm, total) {
  const line = (l, x) => `  ${l.padEnd(12)} n=${String(x.n).padStart(4)}  trong [thấp,cao] ${pct(x.inside).padStart(5)}%  |sai số mức giữa| trung vị ${pct(x.medAbsErr).padStart(5)} điểm  (lệch ${pct(x.medErr)})  độ rộng ${pct(x.width)}`;
  console.log(`\n== ${title}: ${sm.all.n}/${total} phần có giá gợi ý (${sm.noPrice} không đủ gói)`);
  console.log(line("tất cả", sm.all));
  for (const [l, x] of sm.byNb) if (x.n) console.log(line(`${l} NT`, x));
  for (const [l, x] of sm.byGroup) if (x.n) console.log(line(l, x));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = arg("cache", path.join(ROOT, "..", "..", "genbid-work", "doc-cache"));
  const calib = process.argv.includes("--calib");
  const started = Date.now(), docs = loadDocs(dir), rows = run(docs, { limit: Number(arg("limit")) || 0, calib });
  console.log(`Hậu kiểm Gợi ý giá đấu — ${Object.keys(docs).length} gói bidhist, ${rows.length} phần đo, ${Math.round((Date.now() - started) / 1000)} s`);
  console.log("Giới hạn: mọi ứng viên code chọn coi là \"gần\" (không có bước agent xếp mức); chỉ dùng phần có kết quả công bố trước ngày đóng thầu.");
  print("Chung (như hạng 1 hiện nay)", summarize(rows, "base"), rows.length);
  const withG = rows.filter((r) => r.group);
  print("Chung, chỉ phần biết nhóm hàng trúng", summarize(withG, "base"), withG.length);
  if (BP.groupPrices) print("Theo nhóm xuất xứ của hàng trúng (mục 3)", summarize(withG, "grp"), withG.length);
  if (calib) {
    // Same lots for both: those where both give levels; then the later half alone (no tuning on it is claimed).
    const both = rows.filter((r) => r.base && r.cal), half = both.length ? both[Math.floor(both.length / 2)].close : 0;
    print(`Hiệu chỉnh theo cạnh tranh dự báo (CALIB lam ${BP.CALIB.lam}, q ${BP.CALIB.q}, giãn s ${BP.CALIB.s}) — cùng phần`, summarize(both, "cal"), both.length);
    print("  so với: chung, cùng phần", summarize(both, "base"), both.length);
    const late = both.filter((r) => r.close >= half), early = both.filter((r) => r.close < half);
    print(`Nửa sớm (đóng trước ${new Date(half).toISOString().slice(0, 10)}, nửa chọn s): hiệu chỉnh`, summarize(early, "cal"), early.length);
    print("  so với: chung, nửa sớm", summarize(early, "base"), early.length);
    print(`Nửa sau (đóng từ ${new Date(half).toISOString().slice(0, 10)}): hiệu chỉnh`, summarize(late, "cal"), late.length);
    print("  so với: chung, nửa sau", summarize(late, "base"), late.length);
  }
  if (arg("json")) fs.writeFileSync(arg("json"), JSON.stringify(rows));
}
