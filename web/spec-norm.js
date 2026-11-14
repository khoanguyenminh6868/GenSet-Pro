// Lớp chuẩn hoá thông số (việc chuan-hoa-2, Khoa duyệt 14/11/2026). Nhận một thông số { key, label, value } mà
// GenbidCatalog.fromSupplier đọc từ bảng NCC, cùng ngữ cảnh của bảng (tên bảng, các dòng tiêu đề), và trả
//   { key, num | range | options | enum | dims | bore | count, op, unit, cond, missing[], raw: { label, value }, conv? }
// Bảng gốc không đổi; lớp này chỉ đọc lại. Quy tắc:
// - `raw` luôn là nguyên văn nhãn và ô giá trị; mọi số chuẩn hoá lấy từ chính ô đó.
// - Đơn vị và điều kiện (mức tải, khoảng cách đo, gross / net, trần / vỏ, chế độ, tốc độ...) chỉ đọc từ chữ có trong
//   nguồn: ô giá trị, nhãn cột, ô đơn vị của cột ở dòng tiêu đề thứ hai, tên bảng. KHÔNG đoán theo độ lớn con số, không
//   điền mặc định (không tự coi 50 Hz, cosφ 0,8, 100% tải). Thiếu thì ghi tên vào `missing`.
// - Quy đổi đơn vị chỉ bằng công thức web/conversions.js (in³ → L, hp → kW, PS → kW), và giữ cả giá trị gốc (`conv`).
//   cc, gal, cm... không có công thức ở đó thì giữ nguyên đơn vị nguồn.
// - Số có dấu phẩy và đúng 3 chữ số sau ("1,642") có thể là phần nghìn hoặc thập phân: không đọc, ghi missing "number".
// - Thang khí thải (CN / EU Stage / EPA Tier / Euro / IMO) không quy đổi lẫn nhau; "Tier 3", "T3", "Stage II" không
//   kèm EPA / EU / China thì thang để trống và ghi missing "scale".
// Dùng chung cho trang web (window.GenbidSpecNorm) và Node (suppliers/quality.mjs); nạp web/conversions.js trước.
(function (root) {
  "use strict";

  const conv = () => root.GenbidConversions;
  const KEYS = ["fuel", "fuel75", "fuel50", "noise", "dims", "weight", "disp", "bore", "cyl", "compr", "speed", "voltage", "phase", "pf", "tank", "engPower", "emission"];

  // ---- text helpers ----
  // NFKC: chữ toàn khổ （）：, số La Mã Ⅱ → II, ³ → 3. Chỉ dùng cho bản làm việc, `raw` giữ nguyên văn.
  const nf = (s) => String(s == null ? "" : s).normalize("NFKC").replace(/\s+/g, " ").trim();
  const NUM_RE = /\d+(?:[.,·]\d+)*/g;
  // One number written in the source → { n } or { amb: true } (comma + 3 digits: thousands or decimal, not read).
  function numOf(tok) {
    let t = String(tok);
    if (/,/.test(t) && /\./.test(t)) t = t.replace(/,/g, "");
    else if (/^\d{1,3}(,\d{3})+$/.test(t)) return { amb: true };
    t = t.replace(/[,·]/g, ".");
    if (!/^\d+(\.\d+)?$/.test(t)) return { amb: true };
    return { n: Number(t) };
  }
  // Numbers of a text in order, with the operator written just before the first one.
  function numsIn(s) {
    const out = [];
    for (const m of String(s).matchAll(NUM_RE)) out.push({ ...numOf(m[0]), at: m.index, tok: m[0] });
    return out;
  }
  const opOf = (s) => { const m = String(s).match(/^\s*(≤|<=|<|≥|>=|>|~|≈|约|max\.?|min\.?)/i); if (!m) return null; const o = m[1].toLowerCase(); return o === "<=" || o === "max" || o === "max." ? "≤" : o === ">=" || o === "min" || o === "min." ? "≥" : o === "约" ? "~" : o; };
  const uniq = (a) => [...new Set(a)];

  // ---- context: the unit cell of the label's column in the header (a second header line of units: "| KVA/KW | L/h") ----
  // "| a | b |" and "| a | b" (no closing bar: the last cell is kept).
  const cellsOf = (line) => {
    const s = String(line || "").trim();
    if (!s.startsWith("|")) return [s];
    const c = s.split("|").slice(1).map((x) => x.trim());
    return s.endsWith("|") ? c.slice(0, -1) : c;
  };
  const UNIT_ONLY = /^[(（]?\s*(kva|kw|kw\/kva|kva\/kw|v|hz|db\(?a?\)?|dba|l\/h|l\/hr|lt\/hr?|lph|mm|cm|m|kg|kgs|t|l|lt|ltr|rpm|r\/min|g\/kw\.?h|g\/kwh|g\/\(kw\.?h\)|%|a|m3\/h|m³\/h|cc|in3|in³|gal|kw\/rpm|kw\/hp|hp|ps)\s*[)）]?$/i;
  function headerUnit(label, header) {
    const L = nf(label).toLowerCase();
    if (!L || !header || !header.length || UNIT_ONLY.test(L.replace(/[[\]]/g, ""))) return null;
    const hs = header.map(cellsOf);
    for (let a = 0; a < hs.length; a++) {
      const i = hs[a].findIndex((c) => { const x = nf(c).toLowerCase(); return x && (x === L || L.startsWith(x + " (")); });
      if (i < 0) continue;
      for (let b = 0; b < hs.length; b++) if (b !== a && hs[b].length === hs[a].length && UNIT_ONLY.test(nf(hs[b][i]).replace(/[[\]]/g, ""))) return nf(hs[b][i]);
    }
    return null;
  }
  // A header whose title lines span columns ("| ESP | PRP | Engine type | Consumption 100% |" over "| KVA | KW | KVA | KW |
  // L/H |"): no index lines up, but when the header has one unit cell of this kind and ONE title of ANY kind that could
  // take that unit (each written once, repeats of the same text aside), that unit is the column's. compRe names every
  // such title: a lone "(mm)" under "缸径/行程" and "外形尺寸" belongs to neither as far as the source says (haifeng-taizhou,
  // vantek-jiangsu, jet-power: 355 values before 2026-11-14).
  function soleUnit(header, compRe, unitRe) {
    const cells = uniq((header || []).map((l) => nf(l))).flatMap(cellsOf).map((c) => nf(c)).filter(Boolean);
    const titles = cells.filter((c) => compRe.test(c) && !UNIT_ONLY.test(c.replace(/[[\]]/g, "")));
    const units = cells.filter((c) => UNIT_ONLY.test(c.replace(/[[\]]/g, "")) && unitRe.test(c));
    return titles.length === 1 && units.length === 1 ? units[0] : null;
  }
  // The header cells of a kind (their text names conditions: "dB(A) at 7 mt").
  const headerCells = (header, re) => uniq((header || []).flatMap(cellsOf).map((c) => nf(c)).filter((c) => re.test(c)));

  // ---- conditions shared by several keys ----
  const RATING = [[/\b(prime|prp|cop|continuous)\b|主用|常用|liên tục/i, "prime"], [/\b(standby|stand-by|esp|ltp|emergency)\b|备用|dự phòng/i, "standby"]];
  const ratingsIn = (s) => RATING.filter(([re]) => re.test(s)).map(([, r]) => r);
  // Load written as "75%", "3/4", "¾" (NFKC: "3⁄4"), "full load", "满载". Several in one text: all, in order.
  function loadsIn(s) {
    // "@25/50/75/100% load": one "%" for the whole list.
    const t = nf(s).replace(/(?<![\d.])(\d{2,3}(?:\s*\/\s*\d{2,3})+)\s*%/g, (m, list) => " " + list.split("/").map((x) => `${x.trim()}% `).join(" "))
      .replace(/(?<![\d.])3\s*[⁄/]\s*4(?![\d.])/g, " 75% ").replace(/(?<![\d.])1\s*[⁄/]\s*2(?![\d.])/g, " 50% ").replace(/(?<![\d.])1\s*[⁄/]\s*4(?![\d.])/g, " 25% ").replace(/(?<![\d.])4\s*[⁄/]\s*4(?![\d.])/g, " 100% ");
    const out = [];
    for (const m of t.matchAll(/(\d{2,3})\s*%|\b(full[\s-]*load)\b|满载|满负荷|全负荷/gi)) {
      const v = m[1] ? Number(m[1]) : 100;
      if ([10, 25, 50, 75, 100, 110].includes(v)) out.push({ v, at: m.index });
    }
    return out;
  }
  // "@ Prime power", "at prime" = the consumption at that rating's full output.
  const AT_RATING = /(@|\bat\b)\s*(the\s*)?(prime|standby|prp|esp)\b/i;
  const OPEN = /\bopen\b|open[\s-]*(type|frame|skid|set)|开架|敞开|开放式/i;
  const SILENT = /silent|soun?d?[\s-]*proof|sound[\s-]*attenuated|canopy|enclosure|enclosed|weather[\s-]*proof|container|静音|箱式|集装箱|防雨/i;
  function enclosureIn(...texts) {
    for (const s of texts) {
      if (!s) continue;
      const o = OPEN.test(s), c = SILENT.test(s);
      if (o && !c) return "open";
      if (c && !o) return "enclosed";
      if (o && c) return null;
    }
    return null;
  }
  // A table title says open / enclosed only in words about the set's build ("Ricardo Series (open type)", "HYW-13 T5
  // Soundproof", "Open Skid"); "Silent, Robust, and Reliable" on a catalog page is not about the table.
  const T_OPEN = /open[\s-]*(type|frame|skid|base)|\(open\)|开架|敞开式/i;
  const T_SILENT = /sound[\s-]*proof|silent[\s-]*(type|canopy)|super[\s-]*silent|canopy|静音(型|箱|式)|箱式|集装箱/i;
  function titleEnclosure(t) {
    const o = T_OPEN.test(t || ""), c = T_SILENT.test(t || "");
    return o && !c ? "open" : c && !o ? "enclosed" : null;
  }
  // Open / enclosed of a figure: its cell, label or unit cell; else the table title, but not when the header has columns
  // of both kinds (bobig "Open type (MM) | sounproof type (MM)" under a title "... For Home Canopy").
  function encOf(L, V, H, ctx) {
    const e = enclosureIn(L, V, H);
    if (e) return e;
    if ((OPEN.test(ctx.headerText) || T_OPEN.test(ctx.headerText)) && (SILENT.test(ctx.headerText) || T_SILENT.test(ctx.headerText))) return null;
    return titleEnclosure(ctx.title);
  }
  // A unit of shaft speed. "转" only right after a figure ("1500转"): in "转速" it is the word "speed", not a unit.
  const RPM = /rpm|r\s*\/\s*min|r\.p\.m|转\s*\/\s*分|\d\s*转(?!速)|min-1|v\/p/i;
  // A single shaft speed named in a text ("1500rpm", "1500 r/min"); two different ones → none.
  function rpmIn(s) {
    const v = uniq([...nf(s).matchAll(/(\d{3,4})\s*(rpm|r\s*\/\s*min|r\.p\.m|转)/gi)].map((m) => Number(m[1])));
    return v.length === 1 ? v[0] : null;
  }
  const freqIn = (s) => { const v = uniq([...nf(s).matchAll(/\b(50|60)\s*hz\b/gi)].map((m) => Number(m[1]))); return v.length === 1 ? v[0] : null; };

  // ---- result shape ----
  function base(spec) { return { key: spec.key, unit: null, op: null, cond: {}, missing: [], raw: { label: String(spec.label ?? ""), value: String(spec.value ?? "") } }; }
  const miss = (r, ...names) => { for (const n of names) if (!r.missing.includes(n)) r.missing.push(n); return r; };
  // The figures of a value: one number, a range "a-b" / "a~b" / "a to b", or alternatives "a/b". null when no number;
  // { amb } when a number cannot be read.
  function figures(v) {
    const ns = numsIn(v);
    if (!ns.length) return null;
    if (ns.some((x) => x.amb)) return { amb: true };
    if (ns.length === 1) return { num: ns[0].n };
    const between = String(v).slice(ns[0].at + ns[0].tok.length, ns[1].at);
    if (ns.length === 2 && /^\s*[a-zA-Z()°%]*\s*(-|–|—|~|～|to)\s*$/i.test(between)) return { range: [ns[0].n, ns[1].n] };
    return { list: ns.map((x) => x.n) };
  }

  // ---- per key ----
  const FUEL_UNITS = [
    [/g\s*\/\s*\(?\s*k\s*w\s*[.·\-]?\s*h|g\/kwh|克\/千瓦/i, "g/kWh"],
    // Nm³ (normal cubic metre, gas at reference conditions) is not m³: kept apart, no conversion.
    [/nm3\s*\/\s*k\s*w\s*[.·]?\s*h/i, "Nm³/kWh"],
    [/m3\s*\/\s*k\s*w\s*[.·]?\s*h/i, "m³/kWh"],
    [/nm3\s*\/\s*h/i, "Nm³/h"],
    [/m3\s*\/\s*h/i, "m³/h"],
    [/kg\s*\/\s*h/i, "kg/h"],
    [/gal\w*\.?\s*\/\s*h|\bgph\b/i, "gal/h"],
    [/(?<![a-z])l\s*\/\s*h|(?<![a-z])lph\b|lit(re|er)s?\s*\/\s*h|升\s*\/\s*小?时/i, "L/h"],
  ];
  const unitBy = (list, ...texts) => { for (const t of texts) { if (!t) continue; for (const [re, u] of list) if (re.test(nf(t))) return u; } return null; };

  function fuel(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "";
    if (/running\s*time|run\s*time|autonomy/i.test(L)) return miss(r, "kind");
    r.unit = unitBy(FUEL_UNITS, V, L, H);
    if (!r.unit) miss(r, "unit");
    r.op = opOf(V);
    // Load: the label names one or more; the cell names one; the key itself (fuel75 / fuel50 come from a "75%" / "50%"
    // written in the label or a cell of the row: catalog.js fromLabelTable) when the texts name none.
    const want = spec.key === "fuel75" ? 75 : spec.key === "fuel50" ? 50 : null;
    const loads = loadsIn(L), vLoads = loadsIn(V).filter((x) => !/^\s*[≤<~≈]?\s*\d[\d.,]*\s*%\s*$/.test(V));
    const f = figures(V.replace(/\d{2,3}\s*%/g, " ").replace(/@/g, " "));
    if (f?.list && loads.length === f.list.length && loads.length > 1) {
      // "Fuel L/h @75% / @100% | 11.9 / 15.8": the figure under the load the key is for (fuel: 100%).
      const w = want || 100, i = loads.findIndex((x) => x.v === w);
      if (i >= 0) { r.num = f.list[i]; r.cond.load = w; }
      else return miss(r, "ambiguous");
    } else if (f?.list) { r.options = f.list; miss(r, "ambiguous"); }
    else if (f?.amb) miss(r, "number");
    else if (f?.range) r.range = f.range;
    else if (f) r.num = f.num;
    else return miss(r, "value");
    if (r.num === 0) { delete r.num; return miss(r, "value"); }
    if (r.cond.load == null) {
      const named = uniq([...loads, ...vLoads].map((x) => x.v));
      if (named.length === 1) r.cond.load = named[0];
      else if (named.length > 1 && want && named.includes(want)) r.cond.load = want;
      else if (!named.length && want) { r.cond.load = want; r.cond.loadFrom = "key"; }
      else if (!named.length && AT_RATING.test(L)) r.cond.load = 100;
      else if (!named.length && /\bmin(imum)?\b|最低/i.test(L)) r.cond.minimum = true;
    }
    const rt = uniq(ratingsIn(L + " " + V + " " + H));
    if (rt.length === 1) r.cond.rating = rt[0];
    if (r.cond.load == null) miss(r, "load");
    return r;
  }

  function noise(spec, ctx, r) {
    // The header's noise title(s) ("dB(A) at 7 mt") name the distance of the column too.
    const HC = headerCells(ctx.header, /noise|db|噪/i).join(" ");
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "", all = `${L} ${V} ${H}`;
    r.unit = /db\s*\(\s*a\s*\)|(?<![a-z])dba\b|(?<![a-z])db\s*a\b/i.test(all) ? "dB(A)" : /(?<![a-z])db\b|分贝/i.test(all) ? "dB" : null;
    if (!r.unit) miss(r, "unit");
    r.op = opOf(V);
    if (/as\s*low\s*as/i.test(V)) r.op = "≥";
    // Figures: only what stands before "@" or "/" ambient part; the distance "7m" is not a figure.
    const vv = V.replace(/@.*$/, "").replace(/\d+(\.\d+)?\s*m\b(?!m)/gi, " ").replace(/[-+]?\d+\s*°\s*c/gi, " ").replace(/\(.*?\)/g, " ");
    const f = figures(vv);
    if (!f) return miss(r, "value");
    if (f.amb) return miss(r, "number");
    if (f.list) { r.options = f.list; miss(r, "ambiguous"); }
    else if (f.range) r.range = f.range; else r.num = f.num;
    const DIST = /(?:^|[^\w.])(\d+(?:\.\d+)?)\s*(m|mt|metres?|meters?|metri|米)(?![a-z])/gi;
    let d = [...all.matchAll(DIST)].map((m) => Number(m[1]));
    const lp = /lp\s*(\d+)\s*m/i.exec(all);
    if (lp) d.push(Number(lp[1]));
    if (!d.length && HC) { d = [...HC.matchAll(DIST)].map((m) => Number(m[1])); if (d.length) r.cond.distanceFrom = "header"; }
    const ds = uniq(d);
    if (ds.length === 1) r.cond.distance_m = ds[0];
    else if (ds.length > 1) r.cond.distances_m = ds;
    if (/\blwa\b|sound\s*power/i.test(all)) r.cond.measure = "LwA";
    else if (/\blpa\b|sound\s*pressure|\blp\s*\d/i.test(all)) r.cond.measure = "LpA";
    const ld = loadsIn(all); if (ld.length === 1) r.cond.load = ld[0].v;
    const enc = encOf(L, V, H, ctx); if (enc) r.cond.enclosure = enc;
    if (r.cond.distance_m == null && !(r.cond.measure === "LwA")) miss(r, "distance");
    return r;
  }

  const LEN_UNIT = (s) => (/\bmm\b|毫米|\(mm/i.test(s) ? "mm" : /\bcm\b|厘米/i.test(s) ? "cm" : /[(（]\s*m\s*[)）]|\d\s*m\b(?!m)|\bmeters?\b|\bmetres?\b|\(米\)|（米）/i.test(s) ? "m" : null);
  function dims(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "";
    r.unit = LEN_UNIT(V) || LEN_UNIT(L) || LEN_UNIT(H);
    if (!r.unit) miss(r, "unit");
    const ns = numsIn(V.replace(/\(.*?\)/g, " "));
    if (ns.some((x) => x.amb)) return miss(r, "number");
    if (ns.length !== 3) { if (ns.length) r.options = ns.map((x) => x.n); return miss(r, ns.length ? "ambiguous" : "value"); }
    const n = ns.map((x) => x.n);
    // Order from the letters the label writes ("L×W×H", "W x L x H", "长×宽×高"); none written → kept as written.
    const lt = nf(L + " " + H).toUpperCase().replace(/长/g, "L").replace(/宽/g, "W").replace(/高/g, "H");
    const m = lt.match(/\b([LWHM])\s*[*×X]\s*([LWHM])\s*[*×X]\s*([LWHM])\b/) || lt.match(/([LWH])\s*[*×X]\s*([LWH])\s*[*×X]\s*([LWH])/);
    const order = m ? [m[1], m[2], m[3]].map((c) => (c === "M" ? "W" : c)) : null;
    if (order && new Set(order).size === 3) { r.dims = {}; order.forEach((c, i) => (r.dims[c] = n[i])); r.cond.order = order.join("×"); }
    else { r.dims = { asWritten: n }; miss(r, "order"); }
    const enc = encOf(L, V, H, ctx); if (enc) r.cond.enclosure = enc; else miss(r, "enclosure");
    if (/no\s*fuel\s*tank|without\s*(fuel\s*)?tank|不含油箱/i.test(V + " " + L)) r.cond.tank = "excluded";
    return r;
  }

  function weight(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "", all = `${L} ${V} ${H}`;
    r.unit = /\bkgs?\b|公斤|千克|\(kg|kg\)|kg$/i.test(V) || /\bkgs?\b|公斤|千克|kg/i.test(L) || /kg/i.test(H) ? "kg" : /\btons?\b|\d\s*t\b|吨/i.test(V + " " + L) ? "t" : /\blbs?\b/i.test(V + " " + L) ? "lb" : null;
    if (!r.unit) miss(r, "unit");
    const f = figures(V.replace(/\(.*?\)/g, " "));
    if (!f) return miss(r, "value");
    if (f.amb) return miss(r, "number");
    if (f.list) { r.options = f.list; miss(r, "ambiguous"); } else if (f.range) r.range = f.range; else r.num = f.num;
    r.op = opOf(V);
    const basis = [[/gross|毛重/i, "gross"], [/\bnet\b|净重/i, "net"], [/\bdry\b|干重/i, "dry"], [/\bwet\b|operating|运行重量|湿重/i, "wet"]].filter(([re]) => re.test(all)).map(([, b]) => b);
    if (basis.length === 1) r.cond.basis = basis[0]; else miss(r, "basis");
    const enc = encOf(L, V, H, ctx); if (enc) r.cond.enclosure = enc; else miss(r, "enclosure");
    return r;
  }

  function disp(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "";
    const u = (s) => (/in3|cu\.?\s*in|cubic\s*inch/i.test(s) ? "in³" : /\bcc\b|\dcc\b|cm3|\bml\b/i.test(s) ? "cc" : /\(\s*l\s*\)|\bl\b|\bltrs?\b|\blit(re|er)s?\b|\dl$|升/i.test(s) ? "L" : null);
    r.unit = u(V) || u(L) || u(H);
    if (!r.unit) miss(r, "unit");
    const f = figures(V);
    if (!f) return miss(r, "value");
    if (f.amb) return miss(r, "number");
    if (f.list || f.range) { r.options = f.list || f.range; return miss(r, "ambiguous"); }
    r.num = f.num;
    if (r.unit === "in³" && conv()) {
      const c = conv().compute({ formula: "l_from_cuin", inputs: [{ name: "V_in3", value: r.num }] });
      if (!c.error) { r.conv = { formula: "l_from_cuin", from: { num: r.num, unit: "in³" } }; r.num = c.value; r.unit = "L"; }
    }
    return r;
  }

  function bore(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "";
    r.unit = /mm|毫米/i.test(V) || /mm|毫米/i.test(L) || /mm/i.test(H) ? "mm" : null;
    if (!r.unit) miss(r, "unit");
    const ns = numsIn(V);
    if (!ns.length) return miss(r, "value");
    if (ns.some((x) => x.amb)) return miss(r, "number");
    const hasB = /bore|缸径|cylinder\s*diameter|broke/i.test(L), hasS = /stroke|storke|strock|行程/i.test(L);
    if (ns.length === 2) {
      // Order as the label writes it ("Bore × Stroke", "缸径*行程"); a label naming stroke first swaps.
      const sFirst = hasS && hasB && L.search(/stroke|storke|strock|行程/i) < L.search(/bore|缸径|broke/i);
      r.bore = sFirst ? { bore: ns[1].n, stroke: ns[0].n } : { bore: ns[0].n, stroke: ns[1].n };
      if (!hasB && !hasS) miss(r, "order");
      return r;
    }
    if (ns.length === 1 && hasB && !hasS) { r.bore = { bore: ns[0].n }; return miss(r, "stroke"); }
    if (ns.length === 1 && hasS && !hasB) { r.bore = { stroke: ns[0].n }; return miss(r, "bore"); }
    r.options = ns.map((x) => x.n);
    return miss(r, "ambiguous");
  }

  function cyl(spec, ctx, r) {
    const V = nf(spec.value);
    const m = V.match(/\d{1,2}/);
    if (!m) return miss(r, "value");
    r.count = Number(m[0]);
    if (/\bv\b|\dv\b|v\d|\bv-?type|\bvee\b|°\s*v|v型|-v\b/i.test(V)) r.cond.layout = "V";
    else if (/\bl\b|\dl\b|l\d|\bl-|-l\b|in-?line|直列|vertical/i.test(V)) r.cond.layout = "L";
    const a = V.match(/(\d{2,3})\s*°/); if (a) r.cond.angle = Number(a[1]);
    if (!r.cond.layout) miss(r, "layout");
    return r;
  }

  function compr(spec, ctx, r) {
    const V = nf(spec.value);
    const m = V.match(/(\d+(?:[.,·]\d+)?)\s*:\s*1\b/) || V.match(/^\s*(\d+(?:[.,·]\d+)?)\s*$/);
    if (!m) return miss(r, "value");
    const n = numOf(m[1]); if (n.amb) return miss(r, "number");
    r.num = n.n; // a ratio "x : 1": no unit

    return r;
  }

  function speed(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "";
    r.unit = RPM.test(V) || RPM.test(L) || RPM.test(H) ? "rpm" : null;
    if (!r.unit) miss(r, "unit");
    // "1500rpm(50Hz)/1800rpm(60Hz)": the frequency figures are not speeds.
    const pairs = [...V.matchAll(/(\d{3,4})\s*(?:rpm|r\/min)?\s*\(\s*(50|60)\s*hz\s*\)/gi)];
    const vv = V.replace(/\d+\s*hz/gi, " ").replace(/\(.*?\)/g, " ");
    const f = figures(vv);
    if (!f) return miss(r, "value");
    if (f.amb) return miss(r, "number");
    if (f.list) { r.options = f.list; if (pairs.length === f.list.length) r.cond.freqs = pairs.map((p) => Number(p[2])); }
    else if (f.range) r.range = f.range; else r.num = f.num;
    if (/adjust/i.test(V)) r.cond.adjustable = true;
    return r;
  }

  function voltage(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "";
    if (/hz|频率|\bfre\b/i.test(L) && !/\//.test(V)) return miss(r, "kind");
    r.unit = /\d\s*v\b|\bv\b|vac|volts?\b|伏/i.test(V) || /\(\s*v\s*\)|\[\s*v\s*\]|\bv\b|volt|电压|điện áp|voltage/i.test(L) ? "V" : /\bv\b/i.test(H) ? "V" : null;
    // "voltage" in the label names the quantity, not its unit: only a "V" written counts.
    if (!/\d\s*v\b|\bv\b|vac|volts?\b|伏/i.test(V) && !/\(\s*v\s*\)|\[\s*v\s*\]|\bv\b|（v）/i.test(L) && !/\bv\b/i.test(H)) { r.unit = null; miss(r, "unit"); }
    const kv = /\d\s*kv\b/i.test(V);
    // "380V/400V/415V、10.5kv(Optional)" (superwatt-swt): V and kV in one cell, no single unit for the figures.
    if (kv && /\d\s*v\b/i.test(V.replace(/\d\s*kv\b/gi, ""))) { r.unit = null; miss(r, "unit"); }
    else if (kv) r.unit = "kV";
    // "220V / 50Hz": the frequency is not a voltage; "120V / 240V 277V" → "120/240 277" (a "/" joins, a space parts).
    const vt = V.replace(/\(.*?\)/g, " ").replace(/\d+(\.\d+)?\s*hz/gi, " ").replace(/(\d)\s*(k?v|vac|volts?)\b/gi, "$1").replace(/\s*\/\s*/g, "/").replace(/\/\s*$/, "").replace(/^\s*\//, "");
    const groups = vt.split(/[,;，、]|\bor\b|\band\b/i).map((g) => g.trim()).filter((g) => /\d/.test(g));
    const out = [];
    for (const g of groups) {
      const rg = g.match(/^(\d+)\s*v?\s*(?:-|~|～|to)\s*(\d+)\s*v?\b/i);
      if (rg) { r.range = [Number(rg[1]), Number(rg[2])]; continue; }
      // "230 400" (two figures with no "/"): two values; "400/230": one system as written.
      for (const part of g.split(/\s+/)) {
        const ns = numsIn(part);
        if (!ns.length) continue;
        if (ns.some((x) => x.amb)) return miss(r, "number");
        out.push(ns.map((x) => x.n));
      }
    }
    if (!out.length && !r.range) return miss(r, "value");
    if (out.length === 1 && out[0].length === 1 && !r.range) r.num = out[0][0];
    else if (out.length) r.options = out; // each item: the figures of one "a/b" system, in the order written
    if (/line\s*to\s*line|l-l|线电压/i.test(L)) r.cond.kind = "line-line";
    const ph = L.match(/([13])\s*-?\s*phase/i); if (ph) r.cond.phase = Number(ph[1]);
    if (/optional|available|switchable|可选/i.test(V + " " + L)) r.cond.choice = true;
    return r;
  }

  function phase(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value);
    const ph = [];
    for (const m of V.matchAll(/\b([13])\s*-?\s*(?:ph\b|phases?\b|相|p\b)|\b(three|single)\b|三相|单相/gi)) ph.push(m[1] ? Number(m[1]) : /three|三/i.test(m[0]) ? 3 : 1);
    // A bare "3" under a title about wires only ("Numbers of Wires") is not a phase count.
    if (!ph.length && /^\s*[13]\s*$/.test(V) && (/phase|相/i.test(L) || !/wire/i.test(L))) ph.push(Number(V.trim()));
    const w = [...V.matchAll(/(\d{1,2})(?:\s*or\s*(\d{1,2}))?\s*-?\s*wires?|(\d)\s*线/gi)];
    if (w.length) r.cond.wires = uniq(w.flatMap((m) => [m[1], m[2], m[3]].filter(Boolean).map(Number)));
    const fq = freqIn(V); if (fq) r.cond.freq = fq;
    const p = uniq(ph);
    if (!p.length) return miss(r, "value");
    if (p.length === 1) r.num = p[0]; else r.options = p;
    return r;
  }

  function pf(spec, ctx, r) {
    const V = nf(spec.value);
    // "1.0(0.8)", "1(0.8)" (bison, acepow, gordon): two factors, which one goes with what is not written.
    const all = uniq([...V.matchAll(/(?:^|[^\d.])(0[.,]\d+|1(?:[.,]0+)?)(?![\d.])/g)].map((m) => Number(m[1].replace(",", "."))));
    if (!all.length) return miss(r, "value");
    if (all.length > 1) { r.options = all; miss(r, "ambiguous"); } else r.num = all[0];
    if (/lag|滞后|inductive/i.test(V)) r.cond.lagging = true;
    if (/lead|超前/i.test(V)) r.cond.leading = true;
    return r;
  }

  function tank(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "";
    // "Fuel Tank running hours: 8/10/12H": a running time, not a capacity.
    if (/running\s*hours?|run\s*time|autonomy/i.test(L)) return miss(r, "kind");
    const hrs = V.match(/(\d+(?:\.\d+)?)\s*(?:[-–~]\s*(\d+(?:\.\d+)?))?\s*\+?\s*(h\b|hrs?\b|hours?\b|小时)/i);
    if (hrs) r.cond.runtime_h = hrs[2] ? [Number(hrs[1]), Number(hrs[2])] : Number(hrs[1]);
    // "4.0 GAL. (15 L.)": the litres the source writes; the gallons kept too.
    const lit = V.match(/(\d+(?:[.,]\d+)?)\s*(l|lt|ltr|litres?|liters?|升)\b\.?/i);
    const gal = V.match(/(\d+(?:[.,]\d+)?)\s*gal/i);
    const vv = V.replace(/\(.*?\)/g, " ").replace(/(\d+(?:\.\d+)?)\s*(?:[-–~]\s*\d+)?\s*\+?\s*(h\b|hrs?\b|hours?\b|小时)/gi, " ");
    if (lit) { const n = numOf(lit[1]); if (n.amb) return miss(r, "number"); r.num = n.n; r.unit = "L"; if (gal) r.cond.gal = numOf(gal[1]).n; }
    else if (gal) { const n = numOf(gal[1]); if (n.amb) return miss(r, "number"); r.num = n.n; r.unit = "gal"; }
    else {
      const cnt = vv.match(/^\s*(\d)\s*[x×*]\s*(\d+(?:[.,]\d+)?)\s*$/i);
      if (cnt) { r.cond.count = Number(cnt[1]); r.num = numOf(cnt[2]).n; }
      else {
        const f = figures(vv);
        if (!f) return miss(r, "value");
        if (f.amb) return miss(r, "number");
        if (f.list) { r.options = f.list; miss(r, "ambiguous"); } else if (f.range) r.range = f.range; else r.num = f.num;
      }
      r.unit = /\(\s*l\s*\)|\[\s*l\s*\]|\(\s*lt\s*\)|\blitres?\b|\bliters?\b|\bltr\b|升|\(l\)/i.test(L) || /^l$|^\(l\)$|^lt$|^ltr$/i.test(H) ? "L" : /gal/i.test(L) ? "gal" : null;
    }
    if (r.num == null && !r.range && !r.options) return miss(r, "value");
    if (!r.unit) miss(r, "unit");
    if (/base|integrated|底座|日用/i.test(L + " " + V)) r.cond.type = "base";
    return r;
  }

  function engPower(spec, ctx, r) {
    const L = nf(spec.label), V = nf(spec.value), H = ctx.hUnit || "";
    const lu = (L + " " + H).toLowerCase();
    // Units the label names for "a/b": "(kW/hp)", "(KW/RPM)", "kw/rpm", "kW/r".
    const slash = lu.match(/k\s*w\s*\/\s*(hp|ps|rpm|r\b|r\/min|转)/i);
    const vs = V.match(/^\s*(\d+(?:[.,]\d+)?)\s*(kw|kwm|hp|ps)?\s*\/\s*(\d+(?:[.,]\d+)?)\s*(hp|ps|rpm|r\/min|转|r)?\s*$/i);
    const vRates = [...V.matchAll(/(\d+(?:[.,]\d+)?)\s*(kwm?|hp|ps)\b\s*(prp|prime|cop|esp|standby|ltp)/gi)];
    if (vRates.length >= 2) {
      r.unit = uniq(vRates.map((m) => m[2].toLowerCase())).length === 1 ? (/^kw/i.test(vRates[0][2]) ? "kW" : vRates[0][2].toLowerCase() === "hp" ? "hp" : "PS") : null;
      r.options = vRates.map((m) => numOf(m[1]).n);
      r.cond.ratings = vRates.map((m) => ratingsIn(m[3])[0] || null);
    } else if (vs && (vs[4] || slash || vs[2])) {
      const second = (vs[4] || (slash && slash[1]) || "").toLowerCase();
      const a = numOf(vs[1]), b = numOf(vs[3]);
      if (a.amb || b.amb) return miss(r, "number");
      if (/hp|ps/.test(second)) { r.num = a.n; r.unit = "kW"; r.cond[second === "hp" ? "hp" : "PS"] = b.n; }
      else if (/rpm|r|转/.test(second)) { r.num = a.n; r.unit = "kW"; r.cond.rpm = b.n; }
      else { r.options = [a.n, b.n]; r.unit = /kw/i.test(vs[2] || "") ? "kW" : null; miss(r, "ambiguous"); }
    } else {
      const f = figures(V.replace(/\d+\s*(rpm|r\/min|转)/gi, " ").replace(/\(.*?\)/g, " "));
      if (!f) return miss(r, "value");
      if (f.amb) return miss(r, "number");
      if (f.list) { r.options = f.list; miss(r, "ambiguous"); } else if (f.range) r.range = f.range; else r.num = f.num;
      const u = (s) => (/\bkwm?\b|\dkw|千瓦|\(kw\)|kw\b/i.test(s) ? "kW" : /\bhp\b|\dhp/i.test(s) ? "hp" : /\bps\b|马力/i.test(s) ? "PS" : null);
      r.unit = u(V) || u(L) || u(H);
    }
    if (r.unit === "hp" || r.unit === "PS") {
      const f = r.unit === "hp" ? "kw_from_hp" : "kw_from_ps", name = r.unit === "hp" ? "P_hp" : "P_PS";
      if (r.num != null && conv()) { const c = conv().compute({ formula: f, inputs: [{ name, value: r.num }] }); if (!c.error) { r.conv = { formula: f, from: { num: r.num, unit: r.unit } }; r.num = c.value; r.unit = "kW"; } }
    }
    if (!r.unit) miss(r, "unit");
    if (r.cond.rpm == null) { const n = rpmIn(V) || rpmIn(L) || rpmIn(H) || rpmIn(ctx.headerText) || rpmIn(ctx.title); if (n) r.cond.rpm = n; }
    if (r.cond.rpm == null) miss(r, "speed");
    if (!r.cond.ratings) { const rt = uniq(ratingsIn(L)); if (rt.length === 1) r.cond.rating = rt[0]; }
    return r;
  }

  // Emission: levels with the scale written next to them; no conversion between scales.
  const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };
  const CN_NUM = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6 };
  const QUAL = [[/\b(epa|us)\b/i, "EPA Tier"], [/\beu\b|97-68|eu-?stage|\beuropean\b/i, "EU Stage"], [/国|\bchina\b|\bcn\b|\bgb\b|中国/i, "CN"], [/\beuro\b/i, "Euro"], [/\bimo\b/i, "IMO"]];
  function levelOf(s) {
    const t = s.trim().toUpperCase();
    let m = t.match(/^(I{1,3}V?|IV|VI?)\s*([AB])?\b/); if (m && ROMAN[m[1]]) return `${ROMAN[m[1]]}${m[2] || ""}`;
    m = t.match(/^([1-6])\s*([AB]|F\b|FINAL|I\b|INTERIM)?/); if (m) return `${m[1]}${m[2] ? (/^F/.test(m[2]) ? "F" : /^I/.test(m[2]) ? "i" : m[2]) : ""}`;
    m = s.trim().match(/^([一二三四五六])/); if (m) return String(CN_NUM[m[1]]);
    return null;
  }
  function emission(spec, ctx, r) {
    const L = nf(spec.label);
    const V = nf(spec.value).replace(/97\s*\/\s*68\s*\/\s*ec/gi, "97-68-EC");
    const labelQ = QUAL.filter(([re]) => re.test(L)).map(([, q]) => q);
    if (/exempt|non[\s-]*emission|no\s*emission|无排放/i.test(V)) r.cond.exempt = true;
    const out = [];
    for (const seg of V.split(/[/,;，]|\band\b/i)) {
      const q = QUAL.filter(([re]) => re.test(seg)).map(([, x]) => x);
      // Level tokens: "Tier 4 Final", "T3", "Stage IIIA", "国Ⅱ" (NFKC: 国II), "Euro 5", "IMO II", a bare "V".
      const toks = [];
      for (const m of seg.matchAll(/(\bepa\b|\bus\b|\beu\b|\bcn\b|\bchina\b|tier|stage|\bt(?=\s*\d)|国|euro|imo)\s*(?:(?:stage|tier)\s*)?([ivx]+\s*[ab]?|[1-6]\s*(?:[ab]\b|f\b|final\b|interim\b)?|[一二三四五六])/gi)) {
        const lv = levelOf(m[2]); if (lv) toks.push({ word: m[1].toLowerCase(), lv, text: m[0].trim() });
      }
      if (!toks.length) { const m = seg.match(/^\s*([ivx]+[ab]?|[1-6][ab]?)\s*$/i); if (m && levelOf(m[1])) toks.push({ word: "", lv: levelOf(m[1]), text: m[0].trim() }); }
      if (!toks.length && /^\s*china\s*stage\s*\d/i.test(seg)) { const lv = levelOf(seg.replace(/^\s*china\s*stage\s*/i, "")); if (lv) toks.push({ word: "stage", lv, text: seg.trim() }); }
      for (const t of toks) {
        const W = { 国: "CN", cn: "CN", china: "CN", euro: "Euro", imo: "IMO", eu: "EU Stage", epa: "EPA Tier", us: "EPA Tier" };
        let scale = W[t.word] || null;
        if (!scale) {
          const near = q.filter((x) => !["Euro", "IMO"].includes(x) || x === "IMO");
          if (near.length === 1) scale = near[0];
          else if (!near.length && labelQ.length === 1) scale = labelQ[0];
        }
        // A Stage with the EPA qualifier, or a Tier with EU, is not read as either.
        if ((scale === "EPA Tier" && t.word === "stage") || (scale === "EU Stage" && t.word === "tier")) scale = null;
        out.push({ scale, level: t.lv, text: t.text });
      }
    }
    if (!out.length && !r.cond.exempt) return miss(r, "value");
    if (out.length) r.enum = out;
    if (out.some((x) => !x.scale)) miss(r, "scale");
    return r;
  }

  // For soleUnit, per key: [the label must be a title of this kind, the unit cell, every title of any kind that could
  // take that unit]. A second title able to take the unit leaves the unit to no one.
  const COMP = {
    mm: /bore|缸径|stroke|storke|行程|diameter|dimen|size|尺寸|l\s*[x×*]\s*[wm]\s*[x×*]\s*h|长.{0,3}宽/i,
    L: /displace|排量|swept|oil|机油|润滑油|tank|油箱|coolant|冷却|water|capacity|容量|volume/i,
    kg: /weigh|重量|毛重|净重/i,
    fuel: /consum|油耗|耗油|fuel(?!\s*tank)/i,
    dB: /noise|db|噪|sound/i,
    rpm: /speed|转速|rpm|r\/min|engine\s*(power|output)|柴油机功率|发动机功率/i,
  };
  const FUEL_FAM = [/consum|油耗|耗油|fuel/i, /l\/h|l\/hr|lt\/hr|lph|g\/kw|m3\/h/i, COMP.fuel];
  const FAMILY = { fuel: FUEL_FAM, fuel75: FUEL_FAM, fuel50: FUEL_FAM, noise: [/noise|db|噪/i, /db/i, COMP.dB], dims: [/dimen|size|尺寸/i, /^\W*(mm|cm|m)\W*$/i, COMP.mm],
    weight: [/weigh|重量|毛重|净重|^kgs?$/i, /kg/i, COMP.kg], disp: [/displace|排量|swept/i, /^\W*(l|cc)\W*$/i, COMP.L], tank: [/tank|油箱/i, /^\W*(l|lt|ltr)\W*$/i, COMP.L],
    speed: [/speed|转速/i, /rpm|r\/min/i, COMP.rpm], bore: [/bore|缸径/i, /mm/i, COMP.mm] };

  const BY_KEY = { fuel, fuel75: fuel, fuel50: fuel, noise, dims, weight, disp, bore, cyl, compr, speed, voltage, phase, pf, tank, engPower, emission };

  // One spec { key, label, value } with its table's context { title, header } → the normalized form, or null for a
  // key this layer does not normalize.
  function normalize(spec, ctx = {}) {
    if (!spec || !BY_KEY[spec.key]) return null;
    const header = ctx.header || [];
    const fam = FAMILY[spec.key];
    const c = { title: nf(ctx.title || ""), headerText: nf(header.join(" ")), header, hUnit: headerUnit(spec.label, header) || (fam && fam[0].test(nf(spec.label)) ? soleUnit(header, fam[2], fam[1]) : null) };
    const r = base(spec);
    if (c.hUnit) r.cond.headerUnit = c.hUnit;
    BY_KEY[spec.key](spec, c, r);
    if (!Object.keys(r.cond).length) delete r.cond;
    return r;
  }
  // Every spec of a catalog record (GenbidCatalog.fromSupplier) with the record's table context.
  function normalizeRecord(o) {
    const ctx = { title: o.title, header: o.header || o.lines?.header || [] };
    return (o.specs || []).map((s) => normalize(s, ctx)).filter(Boolean);
  }
  // Genset power of a record as catalog.js powersIn read it: flags only, the reading is unchanged. "rating" when only an
  // unnamed ("rated") pair was read, "freq" when neither row nor table names 50 / 60 Hz.
  function powerFlags(o) {
    const missing = [];
    if (!o.power) missing.push("value");
    else if (!o.power.prime && !o.power.standby) missing.push("rating");
    if (o.freq == null) missing.push("freq");
    return { key: "power", missing };
  }
  // A normalized value has a figure (or a level for emission).
  const hasValue = (r) => r && (r.num != null || r.range || r.options || r.enum || r.dims || r.bore || r.count != null || r.cond?.exempt);

  root.GenbidSpecNorm = { KEYS, normalize, normalizeRecord, powerFlags, hasValue, headerUnit, numOf };
})(typeof window !== "undefined" ? window : globalThis);
