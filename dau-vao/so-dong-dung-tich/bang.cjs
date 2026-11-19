// node bang.cjs do-c2.json > bang-c4.md: bảng mọi nhóm (c) theo C4 đổi giá trị thắng VÀ đổi hành vi (≥ 2 giá trị),
// kèm NCC chung bộ, đối chiếu nguồn hãng (engine_maker / datasheet hãng trong suppliers/cn) và kiểm tính đường kính × hành trình
// × số xi lanh (π/4 · D² · S · z) từ số các NCC ghi (KHÔNG phải nguồn hãng; chỉ là phép tính trên số NCC ghi).
const L = require(process.argv[2] || "./do-c2.json");
const out = ["| Khoá | Hãng | Model | Trước | Sau (C4) | Phiếu trước → sau | NCC gộp (ô kích thước chung) | Nguồn hãng / datasheet | Tính D×S×z (số NCC ghi) | Dòng |", "|---|---|---|---|---|---|---|---|---|---|"];
for (const g of L) {
  if (g.c4 === g.before || !g.matters) continue;
  const mk = [...new Set(g.maker.filter((m) => m.key === g.key || (g.key === "disp" && ["bore", "cyl"].includes(m.key))).map((m) => `${m.sid} [${m.n}] ${m.key} «${m.value}»`))].join("; ") || "không có";
  let calc = "";
  if (g.key === "disp") {
    const combos = new Map();
    for (const [sid, k] of Object.entries(g.engBy || {})) {
      if (!k) continue;
      const kv = Object.fromEntries(k.split(";").map((p) => p.split("=")));
      if (!kv.bore || !kv.cyl) continue;
      for (const b of kv.bore.split("/")) {
        const m = b.match(/^(\d+(?:\.\d+)?)[x*](\d+(?:\.\d+)?)$/); if (!m) continue;
        for (const z of kv.cyl.split("/")) {
          const l = Math.PI / 4 * (m[1] / 10) ** 2 * (m[2] / 10) * Number(z) / 1000;
          if (!Number.isFinite(l)) continue;
          const key = `${m[1]}×${m[2]}×${z}=${l.toFixed(2)} L`;
          combos.set(key, [...(combos.get(key) || []), sid]);
        }
      }
    }
    calc = [...combos].map(([k, s]) => `${k} (${s.length} NCC)`).join("; ") || "không NCC nào ghi đủ D×S và z";
  } else calc = "—";
  const grp = (g.groupsC4 || []).map((x) => `${x.sids.join(" + ")} (${x.dims.join(", ")})`).join("; ") || "—";
  out.push(`| ${g.key} | ${g.make} | ${g.model} | ${g.before} | ${g.c4} | ${JSON.stringify(g.votes.before)} → ${JSON.stringify(g.votes.c4)} | ${grp} | ${mk} | ${calc} | ${g.rows} |`);
}
console.log(out.join("\n"));
