// node checkH.cjs <thư mục rawH> <goods-read.js mới> [goods-read.js cũ]: chạy goodsOf trên dòng thô đã dump của TỪNG gói,
// so với bản đang lưu trong bidhist (doc-cache): số dòng, Σ số lượng × đơn giá / giá trúng, số nhà thầu trúng.
const fs = require("fs"), path = require("path");
const [dir, fNew, fOld] = process.argv.slice(2);
const J = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const mk = (f) => new Function("kq", fs.readFileSync(f, "utf8") + "\nreturn { goodsOf, audit, contractorsOf: typeof contractorsOf === 'function' ? contractorsOf : (l) => l.contractorList || [] };");
const N = mk(fNew), O = fOld ? mk(fOld) : null;
const sumOf = (g) => (g.length && g.every((r) => r.qty > 0 && r.unitPrice > 0) ? g.reduce((a, r) => a + r.qty * r.unitPrice, 0) : null);
const rt = (s, ref) => (s == null || !ref ? "  ·  " : (s / ref).toFixed(3));
let ok = 0, okOld = 0, n = 0; const cls = {};
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const id = f.replace(".json", ""), kq = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")), st = J[id]?.d;
  const api = N(kq), old = O ? O(kq) : null;
  for (const lot of kq.lotResultDTO || []) {
    const cl = api.contractorsOf(lot), win = cl.filter((c) => c.bidResult === 1), winners = win.map((c) => c.orgCode);
    const g = api.goodsOf(lot, winners), sl = (st?.lots || []).find((l) => (l.lotNo || "") === (lot.lotNo || "")) || {}, sg = sl.goods || [];
    const ref = win.reduce((a, c) => a + 0, 0) || (win[0] && (Number(win[0].bidWiningPrice) || Number(win[0].lotFinalPrice))) || null;
    const a = sumOf(sg), b = sumOf(g); n++;
    const inA = a != null && ref && Math.abs(a / ref - 1) <= 0.005, inB = b != null && ref && Math.abs(b / ref - 1) <= 0.005;
    if (inA) okOld++; if (inB) ok++;
    if (old) { const og = old.goodsOf(lot, (lot.contractorList || []).filter((c) => c.bidResult === 1).map((c) => c.orgCode)); if (JSON.stringify(og) !== JSON.stringify(sg)) console.log(`   (!) ${id} ${lot.lotNo}: mã CŨ trên dòng thô ≠ bản đang lưu (${og.length} ↔ ${sg.length} dòng): trang đã đổi hoặc bản lưu cũ hơn`); }
    const k = `${inA ? "khớp" : a == null ? "không tính được" : "lệch"} → ${inB ? "khớp" : b == null ? "không tính được" : "lệch"}`; cls[k] = (cls[k] || 0) + 1;
    console.log(`${id} ${String(lot.lotNo).padEnd(13)} dòng ${String(sg.length).padStart(4)} → ${String(g.length).padStart(4)} | Σ/trúng ${rt(a, ref)} → ${rt(b, ref)} | nhà thầu ${(lot.contractorList || []).length} → ${cl.length}, trúng ${(sl.bidders || []).filter((x) => x.won).length} → ${win.length}${g.length !== sg.length || rt(a, ref) !== rt(b, ref) ? "  ĐỔI" : ""}`);
  }
  if (api.audit.length) console.log("   audit:", JSON.stringify(api.audit).slice(0, 300));
}
console.log(`\n${n} lô | Σ khớp giá trúng ±0,5%: ${okOld} → ${ok} |`, JSON.stringify(cls));
