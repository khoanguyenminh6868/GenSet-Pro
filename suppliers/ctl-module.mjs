// Bộ điều khiển + mô-đun truyền thông, PR 2 (Khoa 20/11/2026, 6 câu: nghiem-thu/bdk-mo-dun-de-xuat.md, bộ nhớ config-suggest).
// The checks of "Truyền thông, giám sát từ xa" (code ctl_comm) are scored for the PAIR controller + communication module:
//  - Q5: a part that names a function (4G, Internet, RS485, BMS...) is "met" only when its quote has that function's words; a
//    function the quote lacks may be shown by another line of the controller's own datasheet, else the part is "unclear".
//  - Q2: RS232 / RS485 / USB / BMS / Modbus / SNMP / CAN come from the controller's datasheet only; 4G / 5G / GSM / SMS /
//    Internet / Ethernet may come from a module (Ethernet: Khoa 20/11/2026 "có", with the note ETH_NOTE; only a line of the
//    module that says it has Ethernet, not an optional extension).
//  - Q3: "BMS" is met by a line that says BMS / building management, or Modbus / BACnet / SNMP (note: NCC to confirm).
//  - Q4: a module the code adds (the supplier did not offer it) makes such a part "met" (`viaModule`), always labelled
//    "Mô-đun chọn theo tài liệu hãng, NCC chưa chào". Only when the module is compatible: the controller's datasheet names it,
//    or the module's datasheet names the controller.
//  - Q1: the other controllers the supplier's line offers, each with its modules, scored by the same code reading; those with
//    no "không đạt" are listed as "Phương án khác đạt tương đương".
// Pure functions: no import of config-bot.mjs (config-bot imports this file).

// The modules (fixed list): make, name as the maker writes it, a regex for it, the order code of the maker's datasheet.
// Order codes as saved: deep-sea-electronics n1012 / n1013, comap n1014–n1016 (bdk-mo-dun PR 1, #977).
export const COMM_MODULES = [
  { key: "DSE890MKII", make: "Deep Sea", model: "DSE890 MKII", re: /\bDSE\s?890\s?MK\s?II\b/i, order: "0890-04" },
  { key: "DSE891MKII", make: "Deep Sea", model: "DSE891 MKII", re: /\bDSE\s?891\s?MK\s?II\b/i, order: "0891-04" },
  { key: "DSE855", make: "Deep Sea", model: "DSE855", re: /\bDSE\s?855\b/i, order: "" },
  { key: "CM24GGPS", make: "ComAp", model: "CM2-4G-GPS", re: /\bCM2-?4G-?GPS\b/i, order: "CM24GGPSXBX" },
  { key: "CM4GGPS", make: "ComAp", model: "CM-4G-GPS", re: /\bCM-4G-GPS\b/i, order: "CM24GGPSXBX" },
  { key: "CM3ETHERNET", make: "ComAp", model: "CM3-Ethernet", re: /\bCM3-?Ethernet\b/i, order: "CM3ETHERXBX" },
  { key: "CMRS232485", make: "ComAp", model: "CM-RS232-485", re: /\bCM-?RS232-?485\b/i, order: "CM223248XBX" },
  { key: "INTERNETBRIDGENT", make: "ComAp", model: "InternetBridge-NT", re: /\bInternetBridge-?NT\b/i, order: "" },
];
export const moduleIn = (line) => COMM_MODULES.filter((m) => m.re.test(String(line || "")));

// The functions a part may name. `vi`: in the HSMT's words (the part's name); `src`: in a datasheet line; `mod`: a module may
// give it (Q2). BMS: `src` says it outright, `via` through a protocol (Q3).
export const SUBS = [
  { k: "5G", vi: /\b5G\b/i, src: /\b5G\b/i, mod: true },
  { k: "4G", vi: /\b4G\b|\bLTE\b/i, src: /\b4G\b|\bLTE\b/i, mod: true },
  { k: "GSM/SMS", vi: /\bGSM\b|\bGPRS\b|\bSMS\b|\b3G\b/i, src: /\bGSM\b|\bGPRS\b|\bSMS\b|\b3G\b|cellular/i, mod: true },
  // Not "web" alone: "in built web SCADA" (DSE7420 MKII) is a local web server on its Ethernet port, not the Internet; nor
  // "DSEWebNet" / "WebSupervisor" (the maker's remote system, reached through a gateway).
  { k: "Internet", vi: /internet|\bIoT\b|cloud|đám mây/i, src: /internet|\bIoT\b|\bcloud\b/i, mod: true },
  // Ethernet from a module (Khoa 20/11/2026 "có", điều phối): the gateway's port counts, with ETH_NOTE.
  { k: "Ethernet", vi: /ethernet|\bLAN\b|\bTCP/i, src: /ethernet|\bLAN\b|\bTCP/i, mod: true, modNote: true },
  { k: "RS485", vi: /RS-?485/i, src: /RS-?485/i, mod: false },
  { k: "RS232", vi: /RS-?232/i, src: /RS-?232/i, mod: false },
  { k: "USB", vi: /\bUSB/i, src: /\bUSB/i, mod: false },
  { k: "BMS", vi: /\bBMS\b|building management|quản lý tòa nhà/i, src: /\bBMS\b|building management/i, via: /modbus|bacnet|snmp/i, mod: false },
  { k: "Modbus", vi: /modbus/i, src: /modbus/i, mod: false },
  { k: "SNMP", vi: /\bSNMP\b/i, src: /\bSNMP\b/i, mod: false },
  { k: "CAN", vi: /\bCAN\b|J1939/, src: /\bCAN(?:bus)?\b|J1939/, mod: false },
];
export const subsOf = (name) => SUBS.filter((s) => s.vi.test(String(name || "")));
export const BMS_NOTE = "BMS qua Modbus/SNMP, cần NCC xác nhận.";
export const MODULE_LABEL = "Mô-đun chọn theo tài liệu hãng, NCC chưa chào";
export const ethNote = (models) => `Ethernet nằm trên mô-đun ${models.join(", ")}, không phải trên bộ điều khiển.`;

// A line of the controller's own datasheet that shows the function: not a module's line ("| DSE890 MKII | DSEWebNet® Gateway"
// is the gateway's), not an optional extension ("Extendable options including 4G/GPS, Ethernet and RS485/RS232": the
// plug-in modules, Q2). → { line, via } or null.
const EXT = /\bextend|\boptional\b|\boptions?\b|plug-?in/i;
export function ctlShows(line, sub) {
  const l = String(line || "");
  if (!l || moduleIn(l).length || EXT.test(l)) return null;
  if (sub.src.test(l)) return { line: l, via: null };
  if (sub.via && sub.via.test(l)) return { line: l, via: l.match(sub.via)[0] };
  return null;
}
// A line of a module (its own datasheet, or its name line in a controller's datasheet) that shows the function; not one
// about another product ("If you are using the DSE891 MKII as a temporary DSE890 MKII replacement ... a third party 4G / 5G
// router": the DSE891 sheet names 4G / 5G of another device).
const OTHER_DEVICE = /third[\s-]party|replacement/i;
export function modShows(line, sub, m) {
  const l = String(line || ""), named = moduleIn(l);
  if (!sub.mod || OTHER_DEVICE.test(l) || named.some((x) => x.key !== m.key)) return null;
  // Ethernet only where the module's sheet says it has it, not an optional extension (the trap of Q2).
  if (sub.modNote && EXT.test(l)) return null;
  return sub.src.test(l) ? { line: l, via: null } : null;
}

// The facts of each module: every line of its own datasheet (a table of a controller maker whose title names it, PR 1
// "Datasheet: CM2-4G-GPS") and its name line in a controller's datasheet ("| DSE890 MKII | DSEWebNet® / IoT Gateway - 4G
// (GSM/Ethernet) | 0890-04"). key → [{ supplierId, n, line, own }].
export function moduleFacts(suppliers = []) {
  const out = new Map(), add = (m, f) => { const l = out.get(m.key) || []; if (!l.some((g) => g.supplierId === f.supplierId && g.n === f.n && g.line === f.line)) l.push(f); out.set(m.key, l); };
  for (const s of suppliers || []) {
    if (s?.role !== "controller_maker") continue;
    for (const t of s.specTables || []) {
      const own = moduleIn(t.title);
      if (own.length === 1) { for (const line of t.rows || []) add(own[0], { supplierId: s.id, n: t.n, line, own: true }); continue; }
      for (const line of t.rows || []) { const ms = moduleIn(line); if (ms.length === 1) add(ms[0], { supplierId: s.id, n: t.n, line, own: false }); }
    }
  }
  return out;
}
// The modules a controller may take: those its datasheet names (a line of its facts), or whose datasheet names it (one of
// `keys`, the controller's catalog key and the keys of its datasheets' models, through `ctlKeys` of config-bot).
export function compatModules(ctlFacts = [], keys = new Set(), modFacts = new Map(), ctlKeys = () => []) {
  const out = [];
  for (const m of COMM_MODULES) {
    const named = ctlFacts.find((f) => m.re.test(f.line));
    if (named) { out.push({ m, compat: { supplierId: named.supplierId, n: named.n, line: named.line, by: "controller" } }); continue; }
    const back = (modFacts.get(m.key) || []).find((f) => f.own && ctlKeys(f.line).some((k) => keys.has(k)));
    if (back) out.push({ m, compat: { supplierId: back.supplierId, n: back.n, line: back.line, by: "module" } });
  }
  return out;
}
// One part read by code: for each function it names, the controller's line, else (Q2) a module's line. `mods`: [{ m, facts }].
// → { subs, per: [{ sub, by: "controller" | "module" | null, line, f, m, via }] }.
export function commEval(name, ctlFacts = [], mods = []) {
  const subs = subsOf(name), per = [];
  for (const sub of subs) {
    let hit = null;
    for (const f of ctlFacts) { const r = ctlShows(f.line, sub); if (r) { hit = { sub, by: "controller", line: f.line, f, via: r.via }; break; } }
    if (!hit) for (const { m, facts } of mods) {
      for (const f of facts) { const r = modShows(f.line, sub, m); if (r) { hit = { sub, by: "module", line: f.line, f, m, via: null }; break; } }
      if (hit) break;
    }
    per.push(hit || { sub, by: null });
  }
  return { subs, per };
}

// Q5 on a part the agent marked "met": every function it names must be in its quote (as a controller line: not a module's
// line), or on another line of the controller's own datasheet (kept in `alsoQuotes`). A function missing from both → the
// part is "unclear" (a module may still make it met: commModules). A BMS met through a protocol gets the note of Q3.
export function commWords(x, ctlFacts = []) {
  if (x.status !== "met") return;
  const subs = subsOf(x.name || x.item);
  if (!subs.length) return;
  const q = String(x.sourceQuote || ""), missing = [], also = [];
  let via = null;
  for (const sub of subs) {
    const r = ctlShows(q, sub);
    if (r) { if (r.via && sub.k === "BMS") via = r.via; continue; }
    const f = ctlFacts.map((g) => ({ g, r: ctlShows(g.line, sub) })).find((y) => y.r);
    if (f) { also.push({ sub: sub.k, supplierId: f.g.supplierId, n: f.g.n, line: f.g.line }); if (f.r.via && sub.k === "BMS") via = f.r.via; continue; }
    missing.push(sub.k);
  }
  if (missing.length) {
    stash(x);
    x.status = "unclear"; x.wordsMissing = missing;
    const mod = moduleIn(q);
    x.note = [x.note, `Code: câu trích không ghi ${missing.join(", ")}${mod.length ? ` (dòng của mô-đun ${mod.map((m) => m.model).join(", ")}, không phải của bộ điều khiển)` : ""} và datasheet bộ điều khiển không có dòng nào ghi, nên chưa tính là đạt.`].filter(Boolean).join(" ");
    return;
  }
  if (also.length || via) {
    stash(x);
    if (also.length) x.alsoQuotes = also;
    if (via) { x.bmsVia = via; x.note = [x.note, BMS_NOTE].filter(Boolean).join(" "); }
  }
}
// The agent's own answer, kept once before the code changes a part; restored when check runs again (idempotent).
const CODE_FIELDS = ["status", "offered", "note", "sourceQuote", "factSrc"];
function stash(x) { if (!x.codeWas) x.codeWas = Object.fromEntries(CODE_FIELDS.map((k) => [k, x[k] ?? null])); }
export function commRestore(x) {
  if (x?.codeWas) { for (const k of CODE_FIELDS) { if (x.codeWas[k] == null) delete x[k]; else x[k] = x.codeWas[k]; } }
  for (const k of ["codeWas", "viaModule", "wordsMissing", "alsoQuotes", "bmsVia", "moduleNote"]) delete x?.[k];
}

// Q4: the modules that make the configuration's not-met parts met. Parts: the ctl_comm parts of one configuration (already
// verified, commWords applied). A part is made met only when every function it names is shown (by the controller or a
// module) and at least one by a module; at most 2 modules (the one that turns most parts first, then COMM_MODULES order).
// Writes c.controller.modules ([] removed) and returns them.
export function commModules(c, parts = [], ctlFacts = [], compat = [], modFacts = new Map()) {
  delete c.controller?.modules;
  if (!c.controller || !compat.length) return [];
  const cands = compat.map(({ m, compat }) => ({ m, compat, facts: modFacts.get(m.key) || [] })).filter((x) => x.facts.length);
  const open = parts.filter((x) => x.status !== "met" && subsOf(x.name || x.item).length);
  const turns = (mods) => open.filter((x) => { const e = commEval(x.name || x.item, ctlFacts, mods); return e.per.every((p) => p.by) && e.per.some((p) => p.by === "module"); });
  const chosen = [];
  for (let i = 0; i < 2; i++) {
    const base = turns(chosen).length;
    const best = cands.filter((x) => !chosen.includes(x)).map((x) => ({ x, n: turns([...chosen, x]).length - base })).filter((y) => y.n > 0).sort((a, b) => b.n - a.n)[0];
    if (!best) break;
    chosen.push(best.x);
  }
  if (!chosen.length) return [];
  const used = new Set();
  for (const x of turns(chosen)) {
    const e = commEval(x.name || x.item, ctlFacts, chosen), mods = [...new Set(e.per.filter((p) => p.by === "module").map((p) => p.m))];
    const first = e.per.find((p) => p.by === "module");
    stash(x);
    mods.forEach((m) => used.add(m.key));
    x.status = "met";
    x.viaModule = mods.map((m) => m.model);
    x.offered = `Qua mô-đun ${mods.map((m) => `${m.model}${m.order ? ` (mã ${m.order})` : ""}`).join(" + ")}: ${e.per.map((p) => `${p.sub.k} (${p.by === "module" ? p.m.model : "bộ điều khiển"})`).join(", ")}`;
    x.sourceQuote = first.line;
    x.factSrc = { supplierId: first.f.supplierId, n: first.f.n, line: first.f.line };
    x.alsoQuotes = e.per.filter((p) => p !== first).map((p) => ({ sub: p.sub.k, supplierId: p.f.supplierId, n: p.f.n, line: p.line }));
    if (!x.alsoQuotes.length) delete x.alsoQuotes;
    x.moduleNote = MODULE_LABEL;
    const eth = [...new Set(e.per.filter((p) => p.by === "module" && p.sub.modNote).map((p) => p.m.model))];
    x.note = `${MODULE_LABEL}.${eth.length ? ` ${ethNote(eth)}` : ""}${e.per.some((p) => p.via) ? ` ${BMS_NOTE}` : ""}`;
    delete x.hint; delete x.unverified; delete x.wordsMissing;
  }
  const mods = chosen.filter((x) => used.has(x.m.key)).map(({ m, compat }) => ({ model: m.model, make: m.make, ...(m.order ? { order: m.order } : {}), compat, offeredBy: null, label: MODULE_LABEL,
    why: [...new Set(parts.filter((x) => x.viaModule?.includes(m.model)).flatMap((x) => subsOf(x.name || x.item).filter((s) => s.mod).map((s) => s.k)))] }));
  if (mods.length) c.controller.modules = mods;
  return mods;
}
// A pair scored by code alone (Q1): every ctl_comm part name → "met" when each function it names is shown (controller or a
// module of the pair), else "unclear" (a datasheet that does not say a function is no proof it lacks it: never "not_met").
export function pairScore(names = [], ctlFacts = [], mods = []) {
  const res = names.map((n) => { const e = commEval(n, ctlFacts, mods); return { item: n, status: e.subs.length && e.per.every((p) => p.by) ? "met" : "unclear", modules: [...new Set(e.per.filter((p) => p.by === "module").map((p) => p.m.model))] }; });
  return { met: res.filter((r) => r.status === "met").length, total: res.length, unclear: res.filter((r) => r.status !== "met").map((r) => r.item), parts: res,
    modules: [...new Set(res.flatMap((r) => r.modules))] };
}
// The best pair of one controller: its compatible modules added one at a time (at most 2) while they turn a part met.
export function bestPair(names = [], ctlFacts = [], compat = [], modFacts = new Map()) {
  const cands = compat.map(({ m }) => ({ m, facts: modFacts.get(m.key) || [] })).filter((x) => x.facts.length), chosen = [];
  let cur = pairScore(names, ctlFacts, chosen);
  for (let i = 0; i < 2; i++) {
    const best = cands.filter((x) => !chosen.includes(x)).map((x) => ({ x, s: pairScore(names, ctlFacts, [...chosen, x]) })).filter((y) => y.s.met > cur.met).sort((a, b) => b.s.met - a.s.met)[0];
    if (!best) break;
    chosen.push(best.x); cur = best.s;
  }
  const used = new Set(cur.modules);
  return { ...cur, modules: chosen.filter((x) => used.has(x.m.model)).map((x) => ({ model: x.m.model, make: x.m.make, ...(x.m.order ? { order: x.m.order } : {}) })) };
}
// The line of Q1: "Phương án khác đạt tương đương: DSE7320 MKII + DSE890 MKII (đạt 5/7 ...)".
export const altLineOf = (alts = []) => (alts.length ? `Phương án khác đạt tương đương: ${alts.map((a) => `${[a.model, ...a.modules.map((m) => m.model)].join(" + ")} (truyền thông: code dò datasheet đạt ${a.met}/${a.total}${a.unclear.length ? `, chưa rõ: ${a.unclear.join(", ")}` : ""})`).join("; ")}` : "");
