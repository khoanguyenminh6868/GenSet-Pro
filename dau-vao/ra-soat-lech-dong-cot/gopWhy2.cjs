// node gopWhy2.cjs <repo cũ> <repo mới> <gop a> <gop b>: như gopWhy.cjs nhưng (1) chia dòng đổi theo CÁI GÌ đổi (công suất / động cơ /
// đầu phát / hãng / thông số), theo NCC; (2) in đủ các lượt mà không dòng vào / ra nào đổi công suất hay model, kèm thông số / hãng đổi.
const fs = require("fs");
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [RA, RB, FA, FB] = process.argv.slice(2);
const pw = (p) => (p ? ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k[0].toUpperCase()} ${p[k].kVA ?? "·"}/${p[k].kW ?? "·"}`).join(" ") : "∅");
const sp = (o) => (o.specs || []).map((s) => `${s.key}=${s.value}`).sort().join(";");
const idx = (repo) => { const { C, S } = load(repo), m = new Map(); for (const s of S) { if (s.status === "incomplete") continue; for (const o of C.fromSupplier(s)) { if (o.kind !== "engine") continue; const k = s.id + "|" + C.keyOf(o.line || (o.lines?.rows || []).join(" ")); const v = m.get(k) || []; v.push({ pw: pw(o.power), eng: o.model, alt: o.other || "", makes: (o.makes || []).join(","), specs: sp(o) }); m.set(k, v); } } return m; };
const a = idx(RA), b = idx(RB), A = JSON.parse(fs.readFileSync(FA, "utf8")), B = JSON.parse(fs.readFileSync(FB, "utf8"));
const lineOf = (rk) => { const p = rk.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const j = (l, f) => (l ? [...new Set(l.map((x) => x[f]))].sort().join(" ¦ ") : "(không có)");
const what = (r) => { const o = a.get(r), n = b.get(r); if (!o) return ["mới"]; if (!n) return ["mất"]; return ["pw", "eng", "alt", "makes", "specs"].filter((f) => j(o, f) !== j(n, f)); };
const kinds = {}, bySup = {}, quiet = [];
for (const k of Object.keys(A)) {
  const x = A[k], y = B[k]; if (!y || x.error || y.error) continue;
  const sa = new Set(x.top.map(lineOf)), sb = new Set(y.top.map(lineOf));
  const ins = [...sb].filter((r) => !sa.has(r)), outs = [...sa].filter((r) => !sb.has(r));
  if (!ins.length && !outs.length) continue;
  let hard = false; const rows = [];
  for (const [dir, list] of [["vào", ins], ["ra", outs]]) for (const r of list) {
    const w = what(r), c = `${dir}: ${w.join("+") || "không đổi"}`; kinds[c] = (kinds[c] || 0) + 1;
    if (w.some((f) => f !== "specs")) { hard = true; const s = r.split("|")[0]; (bySup[c] = bySup[c] || {})[s] = (bySup[c][s] || 0) + 1; }
    rows.push(`   ${dir} [${w.join("+") || "không đổi"}] ${r.slice(0, 110)}`);
  }
  if (!hard) quiet.push(`${k}\n${rows.join("\n")}`);
}
console.log(kinds);
for (const [c, m] of Object.entries(bySup)) console.log("\n" + c + ": " + Object.entries(m).sort((p, q) => q[1] - p[1]).map(([s, n]) => `${s} ${n}`).join(", "));
console.log(`\nLượt không có dòng vào / ra nào đổi công suất, model, hãng: ${quiet.length}`); for (const q of quiet) console.log(q);
