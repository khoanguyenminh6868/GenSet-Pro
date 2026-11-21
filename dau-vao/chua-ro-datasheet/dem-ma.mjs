// Đếm check chưa rõ / cần xác nhận theo mã yêu cầu trên mọi lượt trong configmatch.json (chỉ đọc).
import fs from "node:fs";
const list = JSON.parse(fs.readFileSync(new URL("./configmatch.json", import.meta.url), "utf8"));
const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
const t = {}; let cfg = 0, runs = 0, all = 0;
const srcKind = {};
for (const d of list) {
  const data = d.data || d, r = data.result || data, rq = new Map((r.requirements || []).map((q) => [norm(q.item), q]));
  if ((r.configs || []).length) runs++;
  for (const c of r.configs || []) {
    cfg++;
    for (const p of ["engine", "alternator", "controller"]) { const k = `${p}:${c[p]?.src?.kind || "-"}`; srcKind[k] = (srcKind[k] || 0) + 1; }
    for (const x of c.checks || []) {
      all++;
      if (x.status !== "unclear" && x.status !== "confirm") continue;
      const q = rq.get(norm(x.item)), k = `${x.part}|${q?.code || "(không mã)"}`;
      const e = (t[k] = t[k] || { unclear: 0, confirm: 0, items: new Set(), parts: 0 });
      e[x.status]++; e.items.add(x.item); e.parts += (x.parts || []).filter((y) => y.status === "unclear").length;
    }
  }
}
console.log(`lượt có cấu hình ${runs}/${list.length}, cấu hình ${cfg}, check ${all}`, JSON.stringify(srcKind));
for (const [k, e] of Object.entries(t).sort((a, b) => b[1].unclear + b[1].confirm - a[1].unclear - a[1].confirm)) console.log(`${k}\tchưa rõ ${e.unclear}\txác nhận ${e.confirm}\tphần ${e.parts}\t${[...e.items].slice(0, 2).join(" ; ").slice(0, 70)}`);
