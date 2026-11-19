// node do-c.mjs <worktree> <out.txt> <out.json>
// Đo phương án (c) "số đông: NCC ghi bộ số giống hệt cho cùng model chỉ tính MỘT phiếu" trên MỌI động cơ của suppliers/cn,
// cho dung tích (disp) và số xi lanh (cyl) — majorityOf dùng chung nên đổi nó là đổi cả hai.
// Đọc số y như candidates (GENBID_SPEC_NORM bật, cùng hàm đọc): mỗi dòng của động cơ, phiếu = facts của động cơ + thông số của
// chính dòng (như winDiff.mjs / below()). So giá trị thắng hiện tại (majorityOf) với ba cách gộp NCC:
//   C1 "bộ số động cơ": NCC có cùng tập {xi lanh, dung tích, đường kính × hành trình, tỉ số nén} (đọc qua lớp chuẩn hoá,
//      gộp mọi dòng / bảng của NCC đó cho model) → một phiếu.
//   C2 "bảng mẫu": như C1 VÀ có ít nhất một dòng mà các số ngoài động cơ (dầu bôi trơn, tiêu hao, kích thước, khối lượng,
//      độ ồn, bồn dầu) giống hệt chữ (bỏ dấu cách, chữ thường) → một phiếu (gộp bắc cầu).
//   C0 "chỉ số đang đếm": NCC cùng giá trị của khoá đang đếm → một phiếu (suy biến: mọi giá trị còn 1 phiếu, không ai thắng;
//      chỉ để thấy vì sao không dùng).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, OUT, OUTJ] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const roleOf = new Map(sups.map((s) => [s.id, s.role]));
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups);
const read = {
  disp: (f, ctx) => { const x = B.normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : B.BLOCK; },
  cyl: (f, ctx) => { const x = B.normFig(f, ctx, {}); return x.ok ? x.r.count ?? null : x.why.includes("value") ? null : B.BLOCK; },
};
const ENG = ["cyl", "disp", "bore", "compr"], TPL = new Set(["oil", "fuel", "dims", "weight", "noise", "tank"]);
const compact = (v) => String(v ?? "").toLowerCase().replace(/\s+/g, "");
// Giá trị chuẩn hoá của một số động cơ (để so "giống hệt"): số đọc được, không thì chữ gọn.
const canon = (f, ctx) => {
  if (f.key === "disp") { const x = read.disp(f, ctx); return x === B.BLOCK ? `?${compact(f.value)}` : x; }
  if (f.key === "cyl") { const x = read.cyl(f, ctx); return x === B.BLOCK ? `?${compact(f.value)}` : x; }
  const x = B.normFig(f, ctx, {});
  if (x.ok && x.r.bore) return `${x.r.bore.bore}x${x.r.bore.stroke}`;
  if (x.ok && x.r.num != null) return x.r.num;
  return compact(f.value);
};
const uf = () => { const p = new Map(); const find = (a) => { while (p.has(a) && p.get(a) !== a) a = p.get(a); return a; }; return { find, union: (a, b) => { const x = find(a), y = find(b); if (x !== y) p.set(x < y ? y : x, x < y ? x : y); if (!p.has(x)) p.set(x, x); if (!p.has(y)) p.set(y, y); } }; };

const groups = new Map();
let models = 0, rowsSeen = 0;
for (const e of cat.engines) {
  const ef = facts.get(`engine:${e.key}`) || [];
  const uses = e.uses.filter((u) => u.line || u.lines);
  if (!uses.length) continue;
  models++;
  // Bộ số động cơ của từng NCC (mọi fact + mọi dòng của NCC cho model này), và chữ ký các dòng (số ngoài động cơ).
  const eng = new Map(), rowSig = new Map(), dwSig = new Map(), dimSig = new Map(), maker = [];
  const addEng = (sid, f, ctx) => { const m = eng.get(sid) || new Map(); const v = canon(f, ctx); if (v == null) return; m.set(f.key, new Set([...(m.get(f.key) || []), String(v)])); eng.set(sid, m); };
  for (const f of ef) if (ENG.includes(f.key)) { addEng(f.supplierId, f, undefined); if (f.sheet || roleOf.get(f.supplierId) === "engine_maker") maker.push({ sid: f.supplierId, key: f.key, value: f.value, n: f.n, read: canon(f, undefined) }); }
  for (const u of uses) {
    const ctx = B.useNormCtx(u);
    for (const f of u.specs || []) if (ENG.includes(f.key)) { addEng(u.supplierId, f, ctx); if (roleOf.get(u.supplierId) === "engine_maker") maker.push({ sid: u.supplierId, key: f.key, value: f.value, n: f.n ?? u.table, read: canon(f, ctx) }); }
    const sig = (u.specs || []).filter((f) => TPL.has(f.key)).map((f) => `${f.key}=${compact(f.value)}`).sort().join(";");
    if (sig) rowSig.set(u.supplierId, new Set([...(rowSig.get(u.supplierId) || []), sig]));
    // C3: kích thước VÀ khối lượng tổ máy của dòng giống hệt chữ (số / chữ đo, bỏ dấu cách, × = * = x).
    const dw = (k) => (u.specs || []).filter((f) => f.key === k).map((f) => compact(f.value).replace(/[×x]/g, "*")).sort().join("/");
    const d = dw("dims"), wt = dw("weight");
    if (d && wt) dwSig.set(u.supplierId, new Set([...(dwSig.get(u.supplierId) || []), `${d}|${wt}`]));
    // C4: ô kích thước tổ máy (ba số nối bằng * × x) giống hệt trong CHỮ dòng nguồn (không qua bộ đọc thông số).
    const lineText = u.line || (u.lines?.rows || []).join(" | ");
    for (const c of CAT.cellsOf(lineText)) {
      const k = compact(c).replace(/[×x]/g, "*").replace(/mm$/, "");
      if (/^\d{3,5}(\.\d+)?\*\d{3,5}(\.\d+)?\*\d{3,5}(\.\d+)?$/.test(k)) dimSig.set(u.supplierId, new Set([...(dimSig.get(u.supplierId) || []), k]));
    }
  }
  const engKey = (sid) => { const m = eng.get(sid); return m && m.size ? [...m].sort(([a], [b]) => a.localeCompare(b)).map(([k, vs]) => `${k}=${[...vs].sort().join("/")}`).join(";") : null; };
  const sids = [...new Set([...ef.map((f) => f.supplierId), ...uses.map((u) => u.supplierId)])].sort();
  const c1 = uf(), c2 = uf(), c3 = uf(), c4 = uf();
  for (let i = 0; i < sids.length; i++) for (let j = i + 1; j < sids.length; j++) {
    const a = sids[i], b = sids[j], ka = engKey(a);
    const xa = dimSig.get(a), xb = dimSig.get(b);
    if (xa && xb && [...xa].some((s) => xb.has(s))) c4.union(a, b);
    const da = dwSig.get(a), db = dwSig.get(b);
    if (da && db && [...da].some((s) => db.has(s))) c3.union(a, b);
    if (!ka || ka !== engKey(b)) continue;
    c1.union(a, b);
    const ra = rowSig.get(a), rb = rowSig.get(b);
    if (ra && rb && [...ra].some((s) => rb.has(s))) c2.union(a, b);
  }
  for (const u of uses) {
    const ctxU = B.useNormCtx(u);
    for (const key of ["disp", "cyl"]) {
      const figs = [...ef.map((f) => [f, undefined]), ...(u.specs || []).map((f) => [f, ctxU])].filter(([f]) => f.key === key).map(([f, ctx]) => ({ f, sid: f.supplierId ?? u.supplierId, x: read[key](f, ctx) }));
      if (!figs.length) continue;
      rowsSeen++;
      const base = B.majorityOf(figs.map((g) => [g.sid, g.x]));
      const m1 = B.majorityOf(figs.map((g) => [c1.find(g.sid), g.x]));
      const m2 = B.majorityOf(figs.map((g) => [c2.find(g.sid), g.x]));
      const m3 = B.majorityOf(figs.map((g) => [c3.find(g.sid), g.x]));
      const m4 = B.majorityOf(figs.map((g) => [c4.find(g.sid), g.x]));
      const m0 = B.majorityOf(figs.map((g) => [g.x === B.BLOCK ? g.sid : `v:${g.x}`, g.x]));
      const w = (m) => m?.win ?? null;
      if (w(base) === w(m1) && w(base) === w(m2) && w(base) === w(m3) && w(base) === w(m4)) continue;
      // Có đổi hành vi thật không: chỉ khi các nguồn ghi ≥ 2 giá trị (kể cả "không so được"); một giá trị thì có / không có
      // giá trị thắng cho cùng kết quả với luật "mọi nguồn".
      const distinct = new Set(figs.filter((g) => g.x != null).map((g) => (g.x === B.BLOCK ? "X" : g.x))).size;
      const gk = `${e.key}|${key}|${w(base)}|${w(m1)}|${w(m2)}|${w(m3)}|${w(m4)}`;
      const who = {}; for (const g of figs) if (g.x != null) (who[g.x === B.BLOCK ? "X" : g.x] ||= new Set()).add(g.sid);
      const grp = (c) => { const by = new Map(); for (const s of sids) { const r = c.find(s); by.set(r, [...(by.get(r) || []), s]); } return [...by.values()].filter((l) => l.length > 1 && l.some((s) => figs.some((g) => g.sid === s))); };
      const g = groups.get(gk) || {
        model: e.model, ekey: e.key, make: e.make || "", key, before: w(base), c1: w(m1), c2: w(m2), c3: w(m3), c4: w(m4), c0: w(m0), matters: distinct > 1,
        votes: { before: base?.votes ?? null, c1: m1?.votes ?? null, c2: m2?.votes ?? null, c3: m3?.votes ?? null, c4: m4?.votes ?? null },
        groupsC3: [], groupsC4: [],
        who: Object.fromEntries(Object.entries(who).map(([v, s]) => [v, [...s].sort()])),
        groupsC1: grp(c1).map((l) => ({ sids: l, eng: engKey(l[0]) })), groupsC2: grp(c2).map((l) => ({ sids: l, eng: engKey(l[0]) })),
        maker: maker.filter((m) => m.key === key || m.key === "bore" || m.key === "cyl"), engBy: Object.fromEntries(sids.map((s) => [s, engKey(s)])), rows: 0, lines: new Map(),
      };
      if (!g.rows) g.groupsC3 = grp(c3).map((l) => ({ sids: l, dw: [...(dwSig.get(l[0]) || [])].filter((s) => l.slice(1).some((t) => dwSig.get(t)?.has(s))) }));
      if (!g.rows) g.groupsC4 = grp(c4).map((l) => ({ sids: l, dims: [...(dimSig.get(l[0]) || [])].filter((s) => l.slice(1).some((t) => dimSig.get(t)?.has(s))) }));
      if (distinct > 1) g.matters = true;
      g.rows++;
      for (const f of figs) { const lk = `${f.sid}|${f.f.value}`; if (!g.lines.has(lk)) g.lines.set(lk, { sid: f.sid, n: f.f.n ?? u.table ?? null, label: f.f.label, value: f.f.value, read: f.x === B.BLOCK ? "KHÔNG SO ĐƯỢC" : f.x, line: String(f.f.line || u.line || "").slice(0, 170) }); }
      groups.set(gk, g);
    }
  }
}
const list = [...groups.values()].sort((a, b) => a.key.localeCompare(b.key) || a.make.localeCompare(b.make) || a.model.localeCompare(b.model));
const head = `Động cơ có dòng: ${models}; lượt (dòng × khoá) có số: ${rowsSeen}; nhóm model+khoá+kết quả đổi: ${list.length} (disp ${list.filter((g) => g.key === "disp").length}, cyl ${list.filter((g) => g.key === "cyl").length})`;
const lines = [head];
for (const g of list) {
  lines.push(`\n## ${g.make} ${g.model} · ${g.key} · trước ${g.before} → C1 ${g.c1} · C2 ${g.c2} · C3 ${g.c3} · C4 ${g.c4} · ${g.rows} dòng${g.matters ? " · ĐỔI HÀNH VI" : " · một giá trị (không đổi hành vi)"}`);
  lines.push(`   phiếu trước ${JSON.stringify(g.votes.before)} · C1 ${JSON.stringify(g.votes.c1)} · C2 ${JSON.stringify(g.votes.c2)} · C3 ${JSON.stringify(g.votes.c3)} · C4 ${JSON.stringify(g.votes.c4)}`);
  for (const x of g.groupsC4) lines.push(`   gộp C4: ${x.sids.join(", ")}  [ô kích thước chung: ${x.dims.join(" ; ")}]`);
  for (const x of g.groupsC3) lines.push(`   gộp C3: ${x.sids.join(", ")}  [kích thước|khối lượng chung: ${x.dw.join(" ; ")}]`);
  lines.push(`   NCC theo giá trị: ${JSON.stringify(g.who)}`);
  for (const x of g.groupsC1) lines.push(`   gộp C1: ${x.sids.join(", ")}  [${x.eng}]`);
  for (const x of g.groupsC2) lines.push(`   gộp C2: ${x.sids.join(", ")}  [${x.eng}]`);
  for (const m of g.maker) lines.push(`   NGUỒN HÃNG/DATASHEET: ${m.sid} [${m.n}] ${m.key} «${m.value}» → ${m.read}`);
  for (const o of g.lines.values()) lines.push(`   - ${o.sid} [${o.n}] «${o.label} | ${o.value}» → ${o.read}   ${o.line}`);
}
fs.writeFileSync(OUT, lines.join("\n"));
fs.writeFileSync(OUTJ, JSON.stringify(list.map((g) => ({ ...g, lines: [...g.lines.values()] })), null, 1));
console.error(head);
