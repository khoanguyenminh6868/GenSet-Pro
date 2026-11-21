// So hai kết quả check-all: liệt kê MỌI check / phần đổi trạng thái, mọi đổi thứ tự / điểm. node diff.mjs <gốc> <nhánh> <out.txt>
import fs from "node:fs";
const [bf, af, out] = process.argv.slice(2), B = JSON.parse(fs.readFileSync(bf, "utf8")), A = JSON.parse(fs.readFileSync(af, "utf8"));
const L = []; let nCfg = 0, nChk = 0, nPart = 0, order = 0, score = 0, chg = 0, other = 0;
for (const k of new Set([...Object.keys(B), ...Object.keys(A)])) {
  const b = B[k] || [], a = A[k] || [];
  if (JSON.stringify(b.map((c) => c.cfg)) !== JSON.stringify(a.map((c) => c.cfg))) { order++; L.push(`${k}: THỨ TỰ / DANH SÁCH ĐỔI\n  - ${b.map((c) => c.cfg).join("; ")}\n  + ${a.map((c) => c.cfg).join("; ")}`); }
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = b[i], y = a[i]; nCfg++;
    if (JSON.stringify(x?.score) !== JSON.stringify(y?.score)) { score++; L.push(`${k} #${i + 1}: ĐIỂM ${JSON.stringify(x?.score)} -> ${JSON.stringify(y?.score)}`); }
    const bm = new Map((x?.checks || []).map((c) => [c.k, c])), am = new Map((y?.checks || []).map((c) => [c.k, c]));
    for (const n of new Set([...bm.keys(), ...am.keys()])) {
      const p = bm.get(n), q = am.get(n); nChk++;
      if (p?.s !== q?.s) { chg++; L.push(`${k} #${i + 1} ${y?.cfg} CHECK ${n}: ${p?.s} -> ${q?.s}`); }
      const pp = new Map((p?.parts || []).map((z) => [z.i, z])), qp = new Map((q?.parts || []).map((z) => [z.i, z]));
      for (const m of new Set([...pp.keys(), ...qp.keys()])) {
        nPart++;
        const u = pp.get(m), v = qp.get(m);
        if (u?.s !== v?.s) { chg++; L.push(`${k} #${i + 1} ${y?.cfg} | ${n} :: ${m}: ${u?.s} -> ${v?.s}${v?.q ? ` [${v.q}]` : ""}`); if (!(u?.s === "unclear" && v?.s === "confirm")) other++; }
      }
    }
  }
}
fs.writeFileSync(out, L.join("\n") + "\n", "utf8");
console.log(`lượt+cỡ ${new Set([...Object.keys(B), ...Object.keys(A)]).size}, cấu hình ${nCfg}, check ${nChk}, phần ${nPart}`);
console.log(`đổi trạng thái ${chg} (ngoài chưa rõ→cần xác nhận: ${other}), đổi thứ tự/danh sách ${order}, đổi điểm ${score}`);
console.log(L.join("\n").slice(0, 6000));
