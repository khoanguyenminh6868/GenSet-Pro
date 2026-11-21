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
// A communication part that asks for remote monitoring / control and names no function ("Cổng kết nối với hệ thống kiểm soát
// từ xa"; Khoa 2026-11-21 "Có"): met when the controller has RS485 / Modbus on its own lines, or Ethernet / 4G on its lines or
// a module's. Not one tied to something else (dry contact, I/O, an app, a remote panel, a state "đang ở chế độ…").
const REMOTE_WORDS = /(?:gi[áa]m\s+s[áa]t|ki[ểe]m\s+so[áa]t|đi[ềe]u\s+khi[ểe]n)(?:\s*(?:,|v[àa])\s*(?:gi[áa]m\s+s[áa]t|ki[ểe]m\s+so[áa]t|đi[ềe]u\s+khi[ểe]n))?\s+t[ừu]\s+xa|remote\s+(?:monitoring|control)/i;
const REMOTE_OTHER = /t[ae]y\s+b[ấa]m|b[ảa]ng\s+đi[ềe]u\s+khi[ểe]n\s+t[ừu]|b[ộo]\s+đi[ềe]u\s+khi[ểe]n\s+t[ừu]|micro|nh[âa]n\s+c[ôo]ng|đi[ềe]u\s+h[òo]a|m[áa]y\s+in|remote\s+panel|d[ừu]ng\s+m[áa]y|kh[ởo]i\s+đ[ộo]ng|đ[óo]ng\s+m[ởo]|qua\s+c[ổồo]ng|th[ôo]ng\s+qua|ti[ếe]p\s+đi[ểe]m|dry\s+contact|\binput\b|\boutput\b|\bI\/O\b|smartphone|[ứu]ng\s+d[ụu]ng|ph[ầa]n\s+m[ềe]m|kh[ôo]ng\s+d[âa]y|\bHMI\b|m[àa]n\s+h[ìi]nh|(?<!\p{L})(?:đang|khi|t[ủu])(?!\p{L})|thi[ếe]t\s+b[ịi]|h[òo][àa]\s+đ[ồo]ng/iu;
export const isRemoteGeneric = (name) => !subsOf(name).length && REMOTE_WORDS.test(String(name || "")) && !REMOTE_OTHER.test(String(name || ""));
const REMOTE_PORTS = ["RS485", "Modbus", "Ethernet", "4G"].map((k) => SUBS.find((s) => s.k === k));
export const REMOTE_NOTE = "Tính đạt theo cổng kết nối (RS485 / Modbus / Ethernet / 4G), Khoa 21/11/2026.";
export const BMS_NOTE ="BMS qua Modbus/SNMP, cần NCC xác nhận.";
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
  if (isRemoteGeneric(name)) {
    // Any one of the ports is enough; the controller's own line first, then a module's (Ethernet / 4G only).
    for (const sub of REMOTE_PORTS) for (const f of ctlFacts) { const r = ctlShows(f.line, sub); if (r) return { subs: [sub], per: [{ sub, by: "controller", line: f.line, f, via: r.via }] }; }
    for (const sub of REMOTE_PORTS) for (const { m, facts } of mods) for (const f of facts) { const r = modShows(f.line, sub, m); if (r) return { subs: [sub], per: [{ sub, by: "module", line: f.line, f, m, via: null }] }; }
    return { subs: REMOTE_PORTS, per: REMOTE_PORTS.map((sub) => ({ sub, by: null })) };
  }
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
  // The same yardstick for every controller, whatever the agent wrote; a module may still turn it met (commModules).
  if (isRemoteGeneric(x.name || x.item) && x.status !== "not_met") {
    const hit = commEval(x.name || x.item, ctlFacts, []).per.find((p) => p.by);
    stash(x);
    if (hit) {
      x.status = "met"; x.offered = `Có ${hit.sub.k}`; x.sourceQuote = hit.line;
      x.factSrc = { supplierId: hit.f.supplierId, n: hit.f.n, line: hit.f.line }; x.note = REMOTE_NOTE;
    } else {
      x.status = "unclear"; x.offered = ""; delete x.sourceQuote; delete x.factSrc;
      x.note = "Datasheet bộ điều khiển không ghi RS485 / Modbus / Ethernet / 4G.";
    }
    return;
  }
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
  const open = parts.filter((x) => x.status !== "met" && (subsOf(x.name || x.item).length || isRemoteGeneric(x.name || x.item)));
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
    x.note = `${MODULE_LABEL}.${eth.length ? ` ${ethNote(eth)}` : ""}${e.per.some((p) => p.via) ? ` ${BMS_NOTE}` : ""}${isRemoteGeneric(x.name || x.item) ? ` ${REMOTE_NOTE}` : ""}`;
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
// ---------- Bộ điều khiển theo datasheet hãng, AMF, thay bộ chính (Khoa 20/11/2026, IB2600603983: "1. Có 2. Có 3. Có") ----------
// A controller the configuration's suppliers do not offer, chosen from its maker's datasheet.
export const CTL_ALT_LABEL = "Bộ điều khiển chọn theo tài liệu hãng, NCC chưa chào";
// The kind of each controller as its maker's datasheet writes it: "amf" (auto mains (utility) failure), "sync"
// (synchronising / paralleling), "start" (auto start only). Only from the lines of a controller_maker's tables, never from
// the model's name. Three ways a datasheet writes it (bdk-loai, Khoa 20/11/2026 "2. Ok làm đi"):
//  (a) the words right after a model in a line, up to the next model ("The DSE7310 MKII is an auto start control module
//      and the DSE7320 MKII is an auto mains (utility) failure control module"; Woodward "easYgen-1800, advanced AMF
//      controller"); words before the model are another's;
//  (b) a line "models: what they are" and the lines it runs on to, up to the next such line (SmartGen "HGM6110N/6110NC/
//      6110CAN: Automatic Start Module", "HGM6120N/6120NC/6120CAN: Based on HGM6110N/6110NC, it adds mains AC monitoring
//      and mains/generator automatic switching control (AMF)");
//  (c) a table of one model (its title names one): the phrases that say what the whole unit is (ComAp "3 applications in
//      1 HW: AMF (Stand-by) – default", "Comprehensive paralleling gen-set controller"; Datakom "MAINS FAILURE UNIT").
// A model read as two kinds takes amf, then sync (DSE8610 MKII "Synchronising Auto Start"; a paralleling unit with an AMF
// mode can do AMF). `modelsIn(text)` → the controller models a text names (config-bot passes catalog.js controllersIn); the
// default knows Deep Sea only. Keys: ctlKey (letters and digits, upper case, without the MK generation).
export const ctlKey = (m) => String(m || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/MK(?:I{1,3}|\d)$/, "");
const DSE_RE = /\bDSE\s?\d{4}(?:\s?MK\s?I{1,3})?\b/gi;
const dseModels = (t) => [...String(t || "").matchAll(DSE_RE)].map((h) => h[0]);
const SEG = (seg) => (/mains\W+(?:\(?utility\)?\W+)?failure|\bAMF\b|mains\/generator automatic switching/i.test(seg) ? "amf"
  : /synchroni[sz]|paralleling/i.test(seg) ? "sync" : /auto(?:matic)?\W+start/i.test(seg) ? "start" : null);
const UNIT = [["amf", /applications in 1 HW:\s*AMF\b|\bAMF\s+(?:unit|controller|genset controller)\b|mains failure unit|auto(?:matic)?\s+mains\s+(?:\(utility\)\s+)?failure\s+(?:control\s+)?(?:module|controller|unit)|automatic mains failure \(AMF\)/i],
  ["sync", /paralleling\s+(?:gen-?set\s+)?(?:controller|control unit)|common paralleling|paralleling operations|parallel operation up to|synchronising\s+(?:&\s+load sharing\s+)?(?:auto start\s+)?control module|parallel\s+(?:\(with genset\)\s+)?controller|mains parallel|island parallel/i],
  ["start", /applications in 1 HW:\s*MRS\b|automatic start module|auto start control module|remote\W+start\W+unit/i]];
// "HGM6110N/6110NC/6110CAN:" → HGM6110N, HGM6110NC, HGM6110CAN.
const COLON = /^\W*((?:HGM|DSE)\s?\d{4}[A-Z]*)((?:\/\d{4}[A-Z]*)*)\s*:\s*(.*)$/i;
export function ctlKinds(suppliers = [], { modelsIn = dseModels } = {}) {
  const votes = new Map(), vote = (m, k) => { const key = ctlKey(m); if (key && k) votes.set(key, new Set([...(votes.get(key) || []), k])); };
  for (const s of suppliers || []) {
    if (s?.role !== "controller_maker") continue;
    for (const t of s.specTables || []) {
      const rows = (t.rows || []).map((l) => String(l || "")), lines = [String(t.title || ""), ...rows], own = new Map();
      // (a)
      for (const l of lines) {
        const hits = [];
        for (const m of [...new Set(modelsIn(l))]) { let i = -1; while ((i = l.toUpperCase().indexOf(m.toUpperCase(), i + 1)) >= 0) hits.push({ m, i, e: i + m.length }); }
        hits.sort((a, b) => a.i - b.i).forEach((h, j) => { const k = SEG(l.slice(h.e, j + 1 < hits.length ? hits[j + 1].i : l.length)); if (k) own.set(ctlKey(h.m), new Set([...(own.get(ctlKey(h.m)) || []), k])); });
      }
      // (b)
      rows.forEach((l, i) => {
        const c = l.match(COLON);
        if (!c) return;
        const pre = c[1].match(/^[A-Z]+/i)[0], models = [c[1], ...(c[2] ? c[2].split("/").filter(Boolean).map((x) => pre + x) : [])];
        let seg = c[3];
        for (let j = i + 1; j < Math.min(rows.length, i + 4) && !COLON.test(rows[j]); j++) seg += ` ${rows[j]}`;
        const k = SEG(seg);
        for (const m of models) if (k) own.set(ctlKey(m), new Set([...(own.get(ctlKey(m)) || []), k]));
      });
      // (c)
      // A table whose title names several models none of the lines above tells apart (Woodward easYgen-3400XT /
      // 3500XT): the whole table's kind for each of them.
      const titled = [...new Set(modelsIn(t.title).map(ctlKey))];
      if (titled.length && titled.every((m) => !own.has(m))) {
        const ks = new Set(UNIT.filter(([, re]) => rows.some((l) => re.test(l))).map(([k]) => k));
        if (ks.size) for (const m of titled) own.set(m, ks);
      }
      for (const [m, ks] of own) for (const k of ks) vote(m, k);
    }
  }
  return new Map([...votes].map(([n, ks]) => [n, ["amf", "sync", "start"].find((k) => ks.has(k))]));
}
export const dseNum = (model) => String(model || "").match(/\bDSE\s?(\d{4})\b/i)?.[1] || null;
export const KIND_VI = { amf: "tự động khi mất lưới (AMF)", sync: "hòa đồng bộ", start: "chỉ tự khởi động" };
// The kind of `model`: its own key, else the one key it ends (a supplier's "AMF25" for ComAp's "InteliLite 4 AMF25").
export const kindOf = (kinds, model) => {
  const k = ctlKey(model);
  if (!k) return null;
  if (kinds.has(k)) return kinds.get(k);
  const ends = k.length >= 4 ? [...kinds.keys()].filter((x) => x.endsWith(k)) : [];
  return ends.length === 1 ? kinds.get(ends[0]) : null;
};
// The step of a Deep Sea controller in its maker's range, for the order of equal alternatives: the series, the first two
// digits (61xx < 73xx < 74xx < 86xx). Inferred from the maker's numbering (DSE7320 MKII / DSE7420 MKII, DSE8610 MKII), not
// written by the maker as an order; null for a controller with no such number.
// SmartGen the same way (HGM6120 61 < HGM9510 95). ComAp by family word (InteliNano < InteliLite, its "AMF9 / AMF25 / MRS"
// models < InteliGen < InteliSys): also inferred, from ComAp's own product line names. Steps compare within one make only.
const COMAP_STEP = [[/intelinano/i, 1], [/intelilite|^\s*(?:amf|mrs)\s?\d+/i, 2], [/inteligen/i, 3], [/intelisys/i, 4]];
export const ctlStep = (model) => {
  const m = String(model || ""), n = dseNum(m) || m.match(/\bHGM\s?(\d{4})/i)?.[1];
  if (n) return Math.floor(Number(n) / 100);
  return COMAP_STEP.find(([re]) => re.test(m))?.[1] ?? null;
};
// The HSMT asks the GENSET CONTROLLER to watch the mains / drive the ATS / start when the mains fail (Khoa 20/11/2026,
// "ATS: 1"; before: any ATS or "mất lưới" in the HSMT): (1) AMF / auto(matic) mains failure named outright; (2) an ATS,
// "chuyển (đổi) nguồn tự động" or "mất (điện) lưới" on the line of a mention of the genset's controller ("bộ / bảng /
// chức năng / module điều khiển", "controller"), on the line before it, or in the 8 lines after it until a numbered
// heading ("6. Tủ chuyển đổi nguồn tự động (ATS):"): the controller's block of the HSMT ("Có tính năng kết nối với ATS"
// under "Bộ điều khiển"). Not the ATS's own controller ("bộ điều khiển (của tủ) ATS"), not the controller as one item of a
// list of parts ("Động cơ, đầu phát, bộ điều khiển, tủ chuyển đổi nguồn tự động ATS: sản xuất từ năm 2023"), not a panel
// ("tủ điều khiển"). Not a tender for maintenance, repair or parts (its name in the HSMT's first lines). The abbreviations
// in capitals only.
export const AMF_RE = /chuy[ểe]n\s+(?:đổi\s+)?ngu[ồo]n\s+t[ựu]\s+đ[ộo]ng|m[ấa]t\s+(?:đi[ệe]n\s+)?l[ưu][ớo]i|mains\s+failure/i, AMF_ABBR = /\bATS\b|\bAMF\b/;
const AMF_NAMED = (l) => /\bAMF\b/.test(l) || /auto(?:matic)?\s+mains\s+(?:\(utility\)\s+)?failure/i.test(l);
const CTL_WORD = /(?<!t[ủu]\s)(?:b[ộo]|b[ảa]ng|ch[ứu]c\s+n[ăa]ng|module|m[ôo]-?đun)\s+đi[ềe]u\s+khi[ểe]n(?!\s+(?:c[ủu]a\s+)?(?:t[ủu]\s+)?(?:ATS|chuy[ểe]n))(?!\s*(?:[,;]|v[àa]\s+t[ủu]\s))|\bcontroller\b(?!\s*(?:[,;]|v[àa]\s+t[ủu]\s))/i;
const HEADING = /^\s*(?:\d+(?:\.\d+)*[.)]|[a-zđ]\)|[IVX]+\.)\s+\S/;
// The tender's name starts with the work on an existing set ("Tên gói thầu: Gói thầu số 06: Sửa chữa máy phát điện…",
// "Dịch vụ bảo trì", "Thay vật tư"); not "Mua sắm và lắp đặt máy phát điện thay thế", "Máy phát điện và thiết bị vật tư".
const MAINT_TENDER = /g[óo]i\s+th[ầa]u\s*(?:(?:s[ốo]|th[ứu])\s*)?\d*\s*:\s*(?:g[óo]i\s+th[ầa]u\s*(?:(?:s[ốo]|th[ứu])\s*)?\d*\s*:\s*)?(?:\d{3,}\/\S+\s*)?(?:thi\s+c[ôo]ng\s+x[âa]y\s+d[ựu]ng\s+c[ôo]ng\s+tr[ìi]nh\s*)?["“]?\s*(?:cung\s+c[ấa]p\s+(?:d[ịi]ch\s+v[ụu]\s+)?(?:v[àa]\s+)?)?(?:d[ịi]ch\s+v[ụu]\s+)?(?:s[ửu]a\s+ch[ữu]a|b[ảa]o\s+d[ưu][ỡo]ng|b[ảa]o\s+tr[ìi]|thay\s+th[ếe](?![,\s]+(?:l[ắa]p\s+đ[ặa]t\s+)?m[áa]y\s+ph[áa]t)|thay\s+v[ậa]t\s+t[ưu]|đ[ạa]i\s+tu)/i;
const OTHER_ITEM = /^\W*(?:\d+\W+)?(?:l[ắa]p\s+đ[ặa]t|chi\s+ph[íi]|v[ậa]n\s+chuy[ểe]n|t[ủu]\s|b[ộo]\s+s[ạa]c|d[âa]y\s|c[áa]p\s|ph[ụu]\s+ki[ệe]n|h[ưu][ớo]ng\s+d[ẫa]n|đ[àa]o\s+t[ạa]o)/i;
export function amfWhy(text, { head = "" } = {}) {
  const t = String(text || "");
  if (MAINT_TENDER.test(head || t.slice(0, 3000))) return null;
  // A table flattened into one long line holds many requirements: read it sentence by sentence (IB2600592658: "Lắp đặt máy
  // phát điện, tủ ATS" in the same line as the controller's row).
  const lines = t.split("\n").flatMap((l) => (l.length > 200 ? l.split(/\t|\s[-–•+]\s|;\s|\.\s/) : [l])), hit = (l) => AMF_RE.test(l) || AMF_ABBR.test(l);
  let ctlAt = -99;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (AMF_NAMED(l)) return { why: "named", line: l.trim() };
    // Work on the site, another item of the goods, or the ATS cabinet in a list of goods: not the controller's requirement.
    if (OTHER_ITEM.test(l) || /t[ủu]\s+ATS\s*,|\bATS\)?\s+s[ảa]n\s+xu[ấa]t|^\W*b[ộo]\s+ATS\s+\d/i.test(l)) { ctlAt = -99; continue; }
    if (CTL_WORD.test(l)) ctlAt = i;
    else if (HEADING.test(l)) ctlAt = -99;
    if (!hit(l)) continue;
    if (i - ctlAt <= 8 || CTL_WORD.test(lines[i + 1] || "")) return { why: "controller", line: l.trim() };
  }
  return null;
}
export const needsAmf = (text, opts) => !!amfWhy(text, opts);

// The line of Q1: "Phương án khác đạt tương đương: DSE7320 MKII + DSE890 MKII (đạt 5/7 ...)".
export const altLineOf = (alts = []) => (alts.length ? `Phương án khác đạt tương đương: ${alts.map((a) => `${[a.model, ...a.modules.map((m) => m.model)].join(" + ")} (${a.notOffered ? `${CTL_ALT_LABEL}; ` : a.offeredBy ? `NCC ${a.offeredBy} chào; ` : ""}${a.kind ? `${KIND_VI[a.kind]} theo datasheet hãng; ` : ""}truyền thông: code dò datasheet đạt ${a.met}/${a.total}${a.unclear.length ? `, chưa rõ: ${a.unclear.join(", ")}` : ""})`).join("; ")}` : "");
