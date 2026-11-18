// node winDiff.mjs <worktree> <out.txt> [out.json]: mọi model động cơ + thông số (disp, cyl) có giá trị thắng theo số đông
// (majorityOf của config-bot.mjs, đọc số như candidates với GENBID_SPEC_NORM bật) mà ÍT NHẤT MỘT nguồn ghi khác (số khác,
// không so được, hay NCC ghi hai số). Đó là toàn bộ chỗ luật lech-cot-9 có thể đổi kết quả của candidates. Xét theo từng dòng
// (fact của động cơ + thông số của chính dòng, như candidates); gộp theo model + thông số + giá trị thắng.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, OUT, OUTJ] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups);
const read = {
  disp: (f, ctx) => { const x = B.normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : B.BLOCK; },
  cyl: (f, ctx) => { const x = B.normFig(f, ctx, {}); return x.ok ? x.r.count ?? null : x.why.includes("value") ? null : B.BLOCK; },
};
const groups = new Map();
let models = 0, withWin = 0;
for (const e of cat.engines) {
  const ef = facts.get(`engine:${e.key}`) || [];
  let any = false;
  for (const u of e.uses) {
    if (!u.line && !u.lines) continue;
    const ctxU = B.useNormCtx(u);
    for (const key of ["disp", "cyl"]) {
      const figs = [...ef.map((f) => [f, undefined]), ...(u.specs || []).map((f) => [f, ctxU])].filter(([f]) => f.key === key).map(([f, ctx]) => ({ f, sid: f.supplierId ?? u.supplierId, x: read[key](f, ctx) }));
      const mj = B.majorityOf(figs.map((g) => [g.sid, g.x]));
      if (!mj) continue;
      any = true;
      const odd = figs.filter((g) => g.x !== mj.win && g.x != null);
      if (!odd.length) continue;
      const gk = `${e.key}|${key}|${mj.win}`;
      // bdadl-shanghai, fukangsi-yangzhou, pengpai-yangzhou chép chung một bảng: giá trị thắng khi bỏ cả ba (null = hết thắng).
      const TRIO = new Set(["bdadl-shanghai", "fukangsi-yangzhou", "pengpai-yangzhou"]);
      const noTrio = B.majorityOf(figs.filter((g) => !TRIO.has(g.sid)).map((g) => [g.sid, g.x]))?.win ?? null;
      const bySid = {}; for (const g of figs) if (g.x != null) (bySid[g.x === B.BLOCK ? "X" : g.x] ||= new Set()).add(g.sid);
      const g = groups.get(gk) || { model: e.model, ekey: e.key, key, make: e.make || "", win: mj.win, votes: mj.votes, blocked: mj.blocked, noTrio, who: Object.fromEntries(Object.entries(bySid).map(([v, s]) => [v, [...s].sort()])), rows: 0, odd: new Map() };
      g.rows++;
      for (const o of odd) {
        const ok = `${o.sid}|${o.f.n ?? ""}|${o.f.value}`;
        if (!g.odd.has(ok)) g.odd.set(ok, { sid: o.sid, n: o.f.n ?? null, label: o.f.label, value: o.f.value, read: o.x === B.BLOCK ? "KHÔNG SO ĐƯỢC" : o.x, line: String(o.f.line || u.line || "").slice(0, 160) });
      }
      groups.set(gk, g);
    }
  }
  models++; if (any) withWin++;
}
const list = [...groups.values()].sort((a, b) => a.key.localeCompare(b.key) || a.model.localeCompare(b.model));
const lines = [`Động cơ: ${models}; có giá trị thắng (disp/cyl, ít nhất một dòng): ${withWin}; model + thông số có nguồn ghi khác: ${list.length}`];
for (const g of list) {
  lines.push(`\n## ${g.make} ${g.model} · ${g.key} · thắng ${g.win} · phiếu ${JSON.stringify(g.votes)}${g.blocked ? ` · ${g.blocked} NCC không so được` : ""} · ${g.rows} dòng · bỏ bộ ba bdadl/fukangsi/pengpai: ${g.noTrio ?? "KHÔNG CÒN THẮNG"}\n   NCC theo giá trị: ${JSON.stringify(g.who)}`);
  for (const o of g.odd.values()) lines.push(`   - ${o.sid} [${o.n}] «${o.label} | ${o.value}» → ${o.read}   ${o.line}`);
}
fs.writeFileSync(OUT, lines.join("\n"));
if (OUTJ) fs.writeFileSync(OUTJ, JSON.stringify(list.map((g) => ({ ...g, odd: [...g.odd.values()] })), null, 1));
console.error(lines[0]);
