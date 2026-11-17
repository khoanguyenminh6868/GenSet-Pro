// node dryH.cjs [bidhist-dry.json]: so TỪNG gói của lượt đọc lại thử (dry) với bản đang lưu (doc-cache/bidhist.json): mọi trường khác
// hàng hoá phải y nguyên; với hàng hoá in số dòng cũ → mới và Σ số lượng × đơn giá / giá trúng của từng nhà thầu trúng (≈ 1 là khớp).
const fs = require("fs");
const dry = JSON.parse(fs.readFileSync(process.argv[2] || "C:/Projects/GenSet Pro/genbid-work/bidhist-dry.json", "utf8"));
const J = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
if (process.argv[3] === "shape") { const k = Object.keys(dry); console.log(Array.isArray(dry) ? "array " + dry.length : "object " + k.length, k.slice(0, 5)); const v = Array.isArray(dry) ? dry[0] : dry[k[0]]; console.log(JSON.stringify(v).slice(0, 1500)); process.exit(0); }
const docs = Array.isArray(dry) ? dry : Object.entries(dry).map(([id, data]) => ({ id, data }));
const sumOf = (g) => (g && g.length && g.every((r) => r.qty > 0 && r.unitPrice > 0) ? g.reduce((a, r) => a + r.qty * r.unitPrice, 0) : null);
const rt = (s, ref) => (s == null || !ref ? "·" : (s / ref).toFixed(3));
const near = (s, ref) => s != null && ref && Math.abs(s / ref - 1) <= 0.005;
const walk = (o, f, p = "") => { if (Array.isArray(o)) o.forEach((x, i) => walk(x, f, p + "[" + i + "]")); else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, f, p + "." + k); else f(p, o); };
let better = 0, worse = 0, same = 0, other = 0; const cls = {};
for (const d of docs) {
  const id = String(d.id || d.key || "").replace(/^bidhist\//, ""), nw = d.data?.d ?? d.data ?? d.d, old = J[id]?.d ?? J[id];
  if (!old || !nw) { console.log(id, "THIẾU bản", !old ? "cũ" : "mới"); continue; }
  // trường ngoài hàng hoá
  const flat = (o) => { const m = {}; walk(o, (p, v) => { if (!/goods|updatedAt|readAt|fetchedAt|\.at$|note/i.test(p)) m[p] = v; }); return m; };
  const a = flat(old), b = flat(nw), diff = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => a[k] !== b[k]);
  if (diff.length) { other++; console.log(`${id} khác ngoài hàng hoá ×${diff.length}: ` + diff.slice(0, 6).map((k) => `${k}: ${JSON.stringify(a[k])} → ${JSON.stringify(b[k])}`).join("; ").slice(0, 500)); }
  // hàng hoá: tìm mọi mảng goods kèm giá trúng gần nhất
  const pick = (o) => { const r = []; const go = (x, p, ref) => { if (!x || typeof x !== "object") return; const won = Array.isArray(x.bidders) ? x.bidders.filter((b) => b.won && b.winPrice > 0).reduce((a, b) => a + b.winPrice, 0) : 0; const price = won || ref; for (const [k, v] of Object.entries(x)) { if (k === "goods" && Array.isArray(v)) r.push({ p, n: v.length, sum: sumOf(v), ref: price }); else go(v, p + "." + k, price); } }; go(o, "", null); return r; };
  const ga = pick(old), gb = pick(nw);
  const line = [];
  for (let i = 0; i < Math.max(ga.length, gb.length); i++) {
    const x = ga[i], y = gb[i];
    const okA = x && near(x.sum, x.ref), okB = y && near(y.sum, y.ref);
    const c = okA && okB ? "khớp→khớp" : !okA && okB ? "SAI→khớp" : okA && !okB ? "khớp→SAI (!)" : (x?.n === y?.n && x?.sum === y?.sum ? "không đổi, chưa khớp" : "đổi, chưa khớp");
    cls[c] = (cls[c] || 0) + 1; if (okA && !okB) worse++; else if (!okA && okB) better++; else same++;
    if (c !== "khớp→khớp" && !c.startsWith("không đổi")) line.push(`${(y || x).p} ${c}: dòng ${x?.n ?? "∅"}→${y?.n ?? "∅"}, Σ/giá ${rt(x?.sum, x?.ref)}→${rt(y?.sum, y?.ref)}`);
  }
  if (line.length) console.log(id + "\n   " + line.join("\n   "));
}
console.log("\n" + JSON.stringify(cls), `| gói ${docs.length} | khác ngoài hàng hoá ${other} | tốt lên ${better}, xấu đi ${worse}`);
