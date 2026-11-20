// Đọc lại bảng định mức trong datasheet hãng ĐÃ LƯU (sources/<id>/<n>.md), giữ tiêu đề cột (Khoa duyệt 2026-11-11,
// "ok, làm đi": đọc lại, không cào / tải nguồn mới). maker-datasheets.mjs lưu chữ PDF đầy đủ, nhưng các bảng specTables
// tách từ đó chỉ giữ dòng số ("| Efficiency (%) | 90.9 | 91.0 …", "| TAL-A44-J | kVA | 143 | 150 …") mà bỏ các dòng tiêu
// đề phía trên (tần số, chế độ / cấp nhiệt, điện áp, pha), nên Gợi ý cấu hình chỉ dùng được KHOẢNG mọi số. Ở đây mỗi số
// mang nhãn cột đọc từ chính tệp nguồn; mỗi mục kèm các dòng nguyên văn đã dùng (`lines`). Một khối mà số ô không
// khớp số cột (PDF làm rơi ô "N/A", dính số "104.0109.6") thì bỏ cả khối: không đoán cột.
//   Stamford / Wintpower (cùng mẫu "RATINGS … Class - Temp Rise … | 50 | Series Star (V) | …"): kVA, kW, hiệu suất theo
//     tần số × chế độ (Cont. / Standby) × độ tăng nhiệt (105/40°C …) × điện áp sao nối tiếp.
//   Leroy-Somer TAL ("Ratings 50 Hz - 1500 R.P.M." … "Duty / T°C", "Class / T°K", "Phase", "Y" …): kVA, kW theo tần số ×
//     chế độ × cấp nhiệt × pha × điện áp, từng model một dòng.
//   Cummins (Specification Sheet "1500 rpm (50 Hz Ratings)" … "Gross engine output | Net engine output"): kWm động cơ
//     gross / net theo Standby / Prime / Base ở tốc độ đó.
const num = (s) => Number(String(s).replace(",", "."));
const cells = (l) => String(l).split("|").map((c) => c.trim()).filter(Boolean);

// ---------- Stamford / Wintpower ----------
const ST_LABEL = { "kVA": "kVA", "kW": "kW", "Efficiency (%)": "eff" };
export function stamfordRatings(text) {
  const L = String(text).split("\n"), out = [];
  const first = (L.find((l, i) => i > 1 && l.trim()) || "").trim().split(/\s+/)[0];
  // The model: the nearest "<model> - Winding 311" / "<model> Wdg.311" line above the block ("HCI 534D/544D - Winding 311"
  // → "HCI534D/544D", "S4L1D-D41 Wdg.311"), else the sheet's first line.
  const modelAt = (i) => {
    for (let j = i - 1; j >= 0 && j >= i - 4; j--) { const m = L[j].replace(/^\|\s*/, "").match(/^(.+?)\s*(?:-\s*Winding|Wdg\.)\s*\d+/i); if (m) return m[1].replace(/\s+/g, ""); }
    const t = L.find((l, k) => k > 1 && /(?:-\s*Winding|Wdg\.)\s*\d+/i.test(l));
    return t ? t.replace(/^\|\s*/, "").match(/^(.+?)\s*(?:-\s*Winding|Wdg\.)/i)[1].replace(/\s+/g, "") : first;
  };
  L.forEach((l, i) => {
    // "RATINGS" alone, "| 60Hz | RATINGS" (Winding 14 sheets: the frequency of the whole block on that line), or
    // "RATINGS AT 0.8 POWER FACTOR" (S-range sheets).
    if (!/^(\|\s*(50|60)\s*Hz\s*\|\s*)?RATINGS(\s+AT\s+0\.8\s+POWER\s+FACTOR)?\s*$/i.test(l.trim())) return;
    const model = modelAt(i);
    const hzHead = Number((l.match(/(50|60)\s*Hz/) || [])[1]) || null;
    // Rises in the order the header gives them, and the duty written before each (Cont. / Standby; "C | nt. H" in a
    // Wintpower sheet the PDF cut).
    let j = i + 1, head = "";
    while (j < L.length && !/Series Star/.test(L[j]) && j < i + 12) head += ` ${L[j++]}`;
    // Words the PDF cut across cells ("| St | andby", "| C | nt. H") are read with the cell bars and spaces taken out.
    const flatHead = head.replace(/[|\s]/g, "");
    const groups = [...flatHead.matchAll(/(\d{3}\/\d{2})°C/g)].map((m) => {
      const before = flatHead.slice(0, m.index), d = [...before.matchAll(/standb|cont|nt\./gi)].pop()?.[0] || "";
      return { rise: `${m[1]}°C`, duty: /standb/i.test(d) ? "Standby" : d ? "Cont." : null };
    });
    if (groups.length < 2 || groups.some((g) => !g.duty)) return;
    const headLines = L.slice(i, j);
    // Each frequency block: its Series Star line, then kVA / kW / Efficiency rows (a row may run on over "| N/A" lines).
    for (let k = j; k < L.length && k < j + 60; k++) {
      const m = L[k].match(/Series Star \(V\)/);
      if (!m) { if (/^DIMENSIONS/.test(L[k])) break; continue; }
      const hz = Number((`${L[k]} ${L[k + 1] || ""} ${L[k - 1] || ""}`.match(/\|\s*(50|60)\s*\|/) || [])[1]) || hzHead;
      const volts = cells(L[k].slice(L[k].indexOf("Series Star (V)") + 15)).map(num);
      if (!hz || !volts.length || volts.length % groups.length) continue;
      const per = volts.length / groups.length, rows = {}, used = { volts: L[k] };
      for (let r = k + 1; r < L.length && r < k + 40; r++) {
        if (/Series Star|^DIMENSIONS/.test(L[r])) break;
        const c = cells(L[r]), label = ST_LABEL[c[0]];
        if (!label) continue;
        // The row and its run-on lines (those starting with N/A) up to the next label.
        let toks = c.slice(1).flatMap((x) => x.split(/\s+/)), lines = [L[r]];
        for (let q = r + 1; q < L.length && /^\|?\s*N\/A\b/.test(L[q].trim()); q++) { toks = toks.concat(cells(L[q]).flatMap((x) => x.split(/\s+/))); lines.push(L[q]); }
        toks = toks.filter((t) => /^\d+(\.\d+)?$|^N\/A$/.test(t));
        if (toks.length === volts.length) { rows[label] = toks; used[label] = lines; }
      }
      if (!rows.kVA) continue;
      volts.forEach((v, c) => {
        const g = groups[Math.floor(c / per)], val = (k2) => (rows[k2] && rows[k2][c] !== "N/A" ? num(rows[k2][c]) : null);
        if (val("kVA") == null) return;
        out.push({ part: "alternator", model, hz, duty: g.duty, rise: g.rise, phase: 3, volt: v, kVA: val("kVA"), kW: val("kW"), eff: val("eff"), pf: 0.8,
          lines: [...headLines, used.volts, ...(used.kVA || []), ...(used.kW || []), ...(used.eff || [])] });
      });
    }
  });
  return out;
}

// ---------- Stamford Industrial Ratings Book (PR 6) ----------
// One table per pole count × phase × voltage × frequency: "4 POLE Three Phase", "Star 400V", "50Hz/1500rpm", "0.8 Power
// Factor", "TEMPERATURE RISE", "Standby Standby Continuous Continuous Continuous", "163/27 150/40 125/40 (H) 105/40 (F)
// 80/40 (B)", "Model kVA kW …", then one row per model ("HCI544C  631.0 504.8 613.0 490.4 …"; a footnote number may
// follow the model). Three-phase tables only; a row whose figures are not two per rise is left out; no efficiency here.
export function stamfordBookRatings(text) {
  const L = String(text).split("\n"), out = [];
  L.forEach((l, i) => {
    if (!/TEMPERATURE RISE/.test(l)) return;
    const back = L.slice(Math.max(0, i - 25), i);
    const sec = [...back].reverse().find((x) => /\b(Three|3|Single|1)\s+Phase\b/i.test(x)) || "";
    if (!/\b(Three|3)\s+Phase\b/i.test(sec)) return;
    const hzL = [...back].reverse().find((x) => /\b(50|60)Hz\/\d{4}\s*rpm/i.test(x)), starL = [...back].reverse().find((x) => /^\s*Star\s+\d{3}V\b/.test(x));
    if (!hzL || !starL) return;
    const hz = Number(hzL.match(/\b(50|60)Hz/)[1]), volt = Number(starL.match(/Star\s+(\d{3})V/)[1]);
    const mi = L.slice(i + 1, i + 14).findIndex((x) => /^\s*Model\s+kVA\s+kW/.test(x));
    if (mi < 0) return;
    const head = L.slice(i, i + 1 + mi + 1), between = L.slice(i + 1, i + 1 + mi).join(" ");
    const duty = [...between.matchAll(/\b(Standby|Continuous)\b/g)].map((m) => (m[1] === "Standby" ? "Standby" : "Cont."));
    const rises = [...between.matchAll(/\b(\d{2,3})\/(27|40)\b/g)].map((m) => `${m[1]}/${m[2]}°C`);
    if (!rises.length || duty.length !== rises.length) return;
    for (let r = i + 2 + mi; r < L.length && r < i + mi + 60; r++) {
      if (/TEMPERATURE RISE|^\s*1\.\s|Ratings Book/.test(L[r])) break;
      const m = L[r].match(/^([A-Z][A-Z0-9-]*\d[A-Z0-9-]*)\s+(?:(\d(?:,\d)*)\s+)?((?:[\d.]+|N\/A)(?:\s+(?:[\d.]+|N\/A))*)\s*$/);
      if (!m) continue;
      const t = m[3].trim().split(/\s+/);
      if (t.length !== rises.length * 2) continue;
      rises.forEach((rise, k) => {
        const kva = t[2 * k] === "N/A" ? null : Number(t[2 * k]), kw = t[2 * k + 1] === "N/A" ? null : Number(t[2 * k + 1]);
        if (kva == null) return;
        out.push({ part: "alternator", model: m[1], hz, duty: duty[k], rise, phase: 3, volt, kVA: kva, kW: kw, eff: null, pf: 0.8, lines: [sec, hzL, starL, ...head, L[r]] });
      });
    }
  });
  return out;
}

// ---------- Leroy-Somer TAL / LSA ----------
// Mỗi khối "Ratings 50 Hz - 1500 R.P.M." đọc bằng cách cũ (lsBlockOld, giữ y từng ký tự các khối đã đọc được trước
// 20/11/2026); khối cách cũ không cho số nào thì đọc bằng lsBlock (dau-phat-hang A, 20/11/2026): tiêu đề chế độ / cấp
// nhiệt / pha xuống dòng ("| Duty / T° C | Continuous / 40" rồi "| °C | …"), dòng "Ratings" có "|" xen giữa, bảng chỉ có
// cột 3 pha (LSA 46.3 → 52.3, TAL-A473 / A49), dòng "Y" chỉ ghi điện áp MỘT lần cho mọi nhóm (LSA 40 → 46.3), tên model
// một dòng riêng ("| LSA | 52.3 | S5" rồi "| kVA | …"), số nghìn tách bằng dấu cách hay cả "|" ("1 250", "| 1 | 315 |").
export function lsRatings(text) {
  const L = String(text).split("\n"), out = [];
  L.forEach((l, i) => {
    if (!/^Ratings (50|60) Hz\s*-\s*(\d\s?\d{3}) R\.P\.M\./.test(flatLine(l))) return;
    const old = lsBlockOld(L, i);
    out.push(...(old.length ? old : lsBlock(L, i)));
  });
  return out;
}
const flatLine = (l) => String(l).replace(/\|/g, " ").replace(/\s+/g, " ").trim();
// Số của một dòng định mức (sau chữ kVA / kW), đúng `n` số. Ô gõ liền ("103.2108.0") không là số. Thừa số thì ghép số
// nghìn: một chữ số 1–9 đứng ngay trước một nhóm đúng 3 chữ số ("1 | 315", "1 000"). Chỉ nhận khi đúng MỘT cách ghép cho
// đủ `n` số mà không còn số nào < 0,2 × số lớn nhất của dòng (chữ số "1" thừa); không thì null (không đoán cột).
export function lsFigures(s, n) {
  const toks = String(s).split(/[|\s]+/).filter(Boolean);
  if (toks.some((t) => !/^\d+(\.\d+)?$/.test(t))) return null;
  const k = toks.length - n;
  if (k < 0) return null;
  if (k === 0) return toks.map(num);
  const can = toks.map((t, j) => /^[1-9]$/.test(t) && /^\d{3}$/.test(toks[j + 1] || ""));
  const found = new Set(), pick = [];
  const ok = (vals) => { const mx = Math.max(...vals); return vals.every((v) => v >= 0.2 * mx); };
  const walk = (j, left) => {
    if (found.size > 1) return;
    if (left === 0) {
      const vals = [];
      for (let q = 0; q < toks.length; q++) { if (pick.includes(q)) { vals.push(num(toks[q] + toks[q + 1])); q++; } else vals.push(num(toks[q])); }
      if (ok(vals)) found.add(vals.join(","));
      return;
    }
    for (let q = j; q < toks.length; q++) if (can[q]) { pick.push(q); walk(q + 2, left - 1); pick.pop(); }
  };
  walk(0, k);
  return found.size === 1 ? [...found][0].split(",").map(Number) : null;
}
function lsBlock(L, i) {
  const out = [], hz = Number(flatLine(L[i]).match(/^Ratings (50|60) Hz/)[1]);
  const find = (re, from = i + 1) => { for (let j = from; j < i + 14 && j < L.length; j++) if (re.test(L[j])) return j; return -1; };
  const jd = find(/^\|\s*Duty/), jc = find(/^\|\s*Class/), jp = find(/^\|\s*Phase/), jy = find(/^\|\s*Y\s*\|/);
  if ([jd, jc, jp, jy].some((x) => x < 0) || !(jd < jc && jc < jp && jp < jy)) return out;
  const join = (a, b) => flatLine(L.slice(a, b).join(" "));
  const duties = [...join(jd, jc).matchAll(/(Continuous|Stand-?by)(?: duty)?\s*\/\s*(\d{2})\s*°\s*C/gi)].map((m) => ({ duty: /stand/i.test(m[1]) ? "Standby" : "Cont.", word: /stand/i.test(m[1]) ? "Stand-by" : "Continuous", t: m[2] }));
  const classes = [...join(jc, jp).matchAll(/\b([HF])\s*[:/]?\s*(\d{3})\s*°?\s*K\b/g)].map((m) => `${m[1]}:${m[2]}K`);
  const phases = [...join(jp, jy).matchAll(/\b([13])\s*ph\./g)].map((m) => Number(m[1]));
  const G = duties.length;
  if (G < 2 || classes.length !== G || !(phases.length === G || phases.length === 2 * G)) return out;
  const one = phases.length === 2 * G, vt = [...L[jy].matchAll(/(\d{3})\s*V(\*?)/g)].map((x) => ({ v: Number(x[1]), star: !!x[2] }));
  if (!vt.length) return out;
  const groups = duties.map((d, k) => ({ ...d, rise: `${classes[k]} ${d.word}/ ${d.t}°C` }));
  // Hai cách hiểu dòng "Y": mỗi nhóm một phần (chia đều), hoặc một danh sách chung cho mọi nhóm. Mỗi cách bỏ / giữ điện
  // áp có dấu *. Chỉ nhận dòng số khớp đúng MỘT cách.
  const layouts = [];
  for (const star of [true, false]) {
    const v = vt.filter((x) => star || !x.star).map((x) => x.v);
    if (!v.length) continue;
    if (v.length % G === 0) layouts.push(groups.flatMap((g, k) => [...v.slice(k * v.length / G, (k + 1) * v.length / G).map((x) => ({ g, phase: 3, volt: x })), ...(one ? [{ g, phase: 1, volt: null }] : [])]));
    if (G > 1) layouts.push(groups.flatMap((g) => [...v.map((x) => ({ g, phase: 3, volt: x })), ...(one ? [{ g, phase: 1, volt: null }] : [])]));
  }
  const head = L.slice(i, jy + 1);
  const fit = (s) => {
    const hits = new Map();
    for (const cols of layouts) { const f = lsFigures(s, cols.length); if (f) hits.set(`${cols.length}:${f.join(",")}`, { cols, f }); }
    // Hai cách hiểu cùng số cột cho cùng số: một cách (chọn cách đầu); khác nhau thì không đọc.
    const keys = new Set([...hits.values()].map((h) => h.cols.map((c) => `${c.g.rise}|${c.phase}|${c.volt}`).join(";")));
    return keys.size === 1 ? [...hits.values()][0] : null;
  };
  for (let r = jy + 1; r < L.length && r < jy + 40; r++) {
    // Một dòng "Y" thứ hai là bảng của cách quấn dây khác ("12 wires version winding no. 6 (option)", LSA 50.2): không đọc.
    if (/^Ratings |^Efficienc|^\| TAL[^|]*- Three-phase/.test(flatLine(L[r])) || /^\|?\s*(Duty|Y\s*\|)/.test(L[r])) break;
    let f = flatLine(L[r]), line = [L[r]], model, rest;
    const m = f.match(/^((?:TAL|LSA)\b[\w.\- ]*?)\s*kVA\b\s*(.*)$/);
    if (m) { model = m[1].trim(); rest = L[r].slice(L[r].indexOf("kVA") + 3); }
    else if (/^(?:TAL|LSA)\b[\w.\- ]*$/.test(f) && /^\|?\s*kVA\b/.test(L[r + 1] || "")) { model = f; line = [L[r], L[r + 1]]; r++; rest = L[r].slice(L[r].indexOf("kVA") + 3); }
    else continue;
    const hit = fit(rest);
    if (!hit) continue;
    const kwLine = L[r + 1] || "", kw = /^\|\s*kW\b/.test(kwLine) ? lsFigures(kwLine.slice(kwLine.indexOf("kW") + 2), hit.cols.length) : null;
    hit.cols.forEach((col, k) => out.push({ part: "alternator", model: model.replace(/\s+/g, " ").replace(/ -/g, "-"), hz, duty: col.g.duty, rise: col.g.rise, phase: col.phase, volt: col.volt, kVA: hit.f[k], kW: kw ? kw[k] : null, eff: null, pf: 0.8,
      lines: [...head, ...line, ...(kw ? [kwLine] : [])] }));
  }
  return out;
}
function lsBlockOld(L, i) {
  const out = [], l = L[i];
  {
    const m = l.match(/^Ratings (50|60) Hz - (\d{4}) R\.P\.M\./);
    if (!m) return out;
    const hz = Number(m[1]), find = (re) => { for (let j = i + 1; j < i + 10 && j < L.length; j++) if (re.test(L[j])) return j; return -1; };
    const jd = find(/^\|\s*Duty/), jc = find(/^\|\s*Class/), jp = find(/^\|\s*Phase/), jy = find(/^\|\s*Y\s*\|/);
    if ([jd, jc, jp, jy].some((x) => x < 0)) return out;
    const duty = cells(L[jd]).slice(1).map((d) => (/stand/i.test(d) ? "Standby" : /contin/i.test(d) ? "Cont." : null)), temp = cells(L[jd]).slice(1);
    const cls = cells(L[jc]).slice(1);
    const vt = [...L[jy].matchAll(/(\d{3})V(\*?)/g)].map((x) => ({ v: Number(x[1]), star: !!x[2] }));
    const G = cls.length;
    if (G < 2 || duty.length !== G || duty.some((d) => !d) || vt.length % G) return out;
    const per = vt.length / G, groups = cls.map((c, k) => ({ duty: duty[k], temp: temp[k], cls: c, v3: vt.slice(k * per, (k + 1) * per) }));
    const head = L.slice(i, jy + 1);
    for (let r = jy + 1; r < L.length && r < jy + 40; r++) {
      if (/^Ratings |^Efficiencies|^\| TAL[^|]*- Three-phase/.test(L[r])) break;
      const c = cells(L[r]), mm = (c[0] || "").match(/^((?:TAL|LSA)[-\w. ]*?)\s*(kVA)?$/);
      if (!mm) continue;
      const model = mm[1].trim(), rest = (mm[2] ? c.slice(1) : c.slice(1).filter((x, k) => !(k === 0 && x === "kVA") ))
        .flatMap((x) => x.split(/\s+/)).filter((t) => /^\d+(\.\d+)?$/.test(t)).map(num);
      if (!mm[2] && c[1] !== "kVA") continue;
      // Columns: per group its three-phase voltages (a starred one only when the row has a column for it), then 1ph.
      const withStar = rest.length === groups.reduce((n, g) => n + g.v3.length + 1, 0);
      const cols = groups.flatMap((g) => [...g.v3.filter((x) => withStar || !x.star).map((x) => ({ g, phase: 3, volt: x.v })), { g, phase: 1, volt: null }]);
      if (cols.length !== rest.length) continue;
      const kwLine = L[r + 1] || "", kw = cells(kwLine).flatMap((x) => x.split(/\s+/)).filter((t) => /^\d+(\.\d+)?$/.test(t)).map(num);
      const kwOk = /^\|\s*kW\b/.test(kwLine) && kw.length === cols.length;
      cols.forEach((col, k) => out.push({ part: "alternator", model, hz, duty: col.g.duty, rise: `${col.g.cls} ${col.g.temp}`, phase: col.phase, volt: col.volt, kVA: rest[k], kW: kwOk ? kw[k] : null, eff: null, pf: 0.8,
        lines: [...head, L[r], ...(kwOk ? [kwLine] : [])] }));
    }
  }
  return out;
}

// ---------- Cummins engine specification sheet ----------
export function cumminsRatings(text) {
  const L = String(text).split("\n"), out = [];
  const si = L.findIndex((l) => /^Specification Sheet\s*$/.test(l.trim()));
  const model = si >= 0 ? (L.slice(si + 1).find((l) => l.trim()) || "").trim() : "";
  L.forEach((l, i) => {
    // A page break (form feed) may start the line ("\f1500 rpm (50 Hz Ratings)").
    const m = l.replace(/^\f/, "").match(/^(\d{4}) rpm \((50|60) Hz Ratings\)/i); // "Hz ratings" in some sheets (KTA38-G3)
    if (!m || !model) return;
    const head = L.slice(i, i + 8).join("\n");
    // Any spacing between the words ("Net  engine output" in pdftotext -table).
    if (!/Gross\s+engine\s+output/.test(head) || !/Net\s+engine\s+output/.test(head) || !/Standby\s+Prime\s+Base/.test(head)) return;
    const vi = L.slice(i + 1, i + 10).findIndex((x) => /^\s*\d+\/\d+\s+\d+\/\d+\s+\d+\/\d+\s+\d+\/\d+/.test(x));
    if (vi < 0) return;
    const line = L[i + 1 + vi], pairs = [...line.matchAll(/(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/g)].map((p) => num(p[1]));
    if (pairs.length < 6) return;
    const rpm = Number(m[1]), hz = Number(m[2]), R = ["standby", "prime", "base"];
    R.forEach((r, k) => out.push({ part: "engine", model, hz, rpm, rating: r, gross: pairs[k], net: pairs[k + 3], lines: [l, ...L.slice(i + 1, i + 1 + vi).filter((x) => x.trim()), line] }));
  });
  return out;
}

// ---------- Thuộc tính đầu phát trên tờ TD một model (cfg-r3, điều phối 2026-11-11) ----------
// A Stamford / Wintpower technical data sheet of ONE model (the same sheets stamfordRatings reads: "UCI274H - Winding 311",
// "S5L1D-H4 Wdg.311") states, besides its ratings, the alternator's insulation class, poles, waveform distortion, maximum
// overspeed, its control systems (self excited / PMG), the bearing builds and, in the newer sheets, the 300% sustained
// short circuit. Each attribute with the line(s) of the sheet it is read from, word for word. Nothing is inferred: a sheet
// that does not write "brushless" gives no brushless, an "air flow" gives no fan. A sheet whose model is not one model
// (a ratings book, a TAL range sheet) is not read here.
export function altSheetAttrs(text) {
  const L = String(text).split("\n"), out = [];
  const add = (key, value, ...lines) => out.push({ key, value, lines: lines.filter(Boolean) });
  const label = (re) => L.find((l) => re.test(l));
  // "| INSULATION SYSTEM | CLASS H" (old sheets), "| Insulation System | H" (S-range).
  const ins = label(/^\|\s*insulation system\s*\|/i);
  const insM = ins && ins.match(/^\|\s*insulation system\s*\|\s*(?:class\s*)?([BFHC])\s*(?:\||$)/i);
  if (insM) add("insulation", insM[1].toUpperCase(), ins);
  const poles = label(/^\|\s*number of poles\s*\|/i);
  const pM = poles && poles.match(/\|\s*(\d{1,2})\s*$/);
  if (pM) add("poles", Number(pM[1]), poles);
  // "| WAVEFORM DISTORTION | NO LOAD < 1.5% NON-DISTORTING BALANCED LINEAR LOAD < 5.0%": the figure at linear load.
  const wd = label(/^\|\s*waveform distortion\s*\|/i);
  const wM = wd && wd.match(/LINEAR\s+LOAD\s*<\s*(\d+(?:\.\d+)?)\s*%/i);
  if (wM) add("thd", Number(wM[1]), wd);
  const os = label(/^\|\s*maximum overspeed\s*\|/i);
  const oM = os && os.match(/\|\s*(\d{3,5})\s*Rev\/Min/i);
  if (oM) add("overspeed", Number(oM[1]), os);
  // The control systems the sheet offers (old sheets: "| CONTROL SYSTEM | SELF EXCITED" / "| CONTROL SYSTEM | SEPARATELY
  // EXCITED BY P.M.G."; S-range: "| AVR Power | Self-Excited" then "| PMG | PMG").
  const ctl = L.filter((l) => /^\|\s*control system\s*\|/i.test(l) || /^\|\s*AVR Power\s*\|/i.test(l));
  for (const l of ctl) {
    if (/self[\s-]*excited/i.test(l)) add("self_excited", true, l);
    if (/P\.?M\.?G\.?/i.test(l)) add("pmg", true, l);
  }
  const bl = L.find((l) => /\bbrushless\b/i.test(l));
  if (bl) add("brushless", true, bl);
  const pmgRow = L.find((l) => /^\|\s*PMG\s*\|\s*PMG\s*$/i.test(l.trim()));
  if (pmgRow && ctl.some((l) => /AVR Power/i.test(l))) add("pmg", true, pmgRow);
  // "| 1 BEARING | 2 BEARING": both builds; "| 1 Bearing | 2" then "Bearing" (S-range, cut by the PDF).
  const br = L.findIndex((l) => /^\|\s*1\s*BEARING\s*\|\s*2(\s*BEARING)?\s*$/i.test(l.trim()));
  if (br >= 0) add("bearings", [1, 2], L[br], /^\s*bearing\s*$/i.test(L[br + 1] || "") ? L[br + 1] : null);
  // "This alternator is capable of achieving a balanced 300% sustained short circuit for up to 10 | seconds." (S-range).
  const sc = L.findIndex((l) => /300%\s*sustained\s*short\s*circuit\s*for\s*up\s*to\s*10\b/i.test(l));
  if (sc >= 0 && /capable of achieving a\b/i.test(L[sc - 1] || "") && /^\|?\s*seconds\b/i.test((L[sc + 1] || "").trim())) add("sc300", { pct: 300, s: 10 }, L[sc - 1], L[sc], L[sc + 1]);
  return out;
}

// ---------- Thuộc tính chung của một tờ Leroy-Somer (dau-phat-hang A, 20/11/2026) ----------
// Khối "General characteristics" của tờ TAL / LSA (một tờ = một dải, mọi model của dải): cách điện, kiểu kích từ, model
// AVR, ổn định điện áp, cấp bảo vệ, dòng ngắn mạch, quá tốc, độ cao. Mỗi mục kèm dòng nguyên văn. Tờ nhiều cột (SHUNT |
// AREP / PMG; "AVR type | R220 | D350"; "± 0.5% | ± 0.25%") KHÔNG ghép cột với kiểu kích từ (chữ PDF lệch cột): giữ danh
// sách giá trị theo thứ tự tờ ghi. Ngắn mạch: `all: false` khi cột đầu ghi "-" (kiểu kích từ đầu không có, LSA 40–47.3).
// Chưa nối vào config-bot (PR B của dau-phat-hang).
export function lsSheetAttrs(text) {
  const L = String(text).split("\n"), out = [];
  const add = (key, value, ...lines) => out.push({ key, value, lines: lines.filter(Boolean) });
  const start = L.findIndex((l) => /^General characteristics\b/i.test(l.trim()));
  if (start < 0) return out;
  let end = L.findIndex((l, j) => j > start && /^\|?\s*Ratings\s+(50|60)/.test(l));
  if (end < 0) end = Math.min(L.length, start + 40);
  const B = L.slice(start, end), at = (re) => B.findIndex((l) => re.test(l));
  const ins = at(/^\|\s*Insulation class\s*\|/i), insM = ins >= 0 && B[ins].match(/^\|\s*Insulation class\s*\|\s*([BFH])\b/i);
  if (insM) add("insulation", insM[1].toUpperCase(), B[ins]);
  const ip = at(/^\|\s*Protection\s*\|/i), ipM = ip >= 0 && B[ip].match(/\bIP\s?(\d\d)\b/);
  if (ipM) add("ip", `IP${ipM[1]}`, B[ip]);
  // Kiểu kích từ: dòng "Excitation system" và tối đa 3 dòng sau nó (chữ bị PDF xuống dòng: "| SHUNT | AREP+" rồi "/ PMG").
  const ex = B.map((l, j) => j).filter((j) => /Excitation system/i.test(B[j]));
  const kinds = [], exLines = [];
  for (const j of ex) for (let q = j; q < j + 4 && q < B.length; q++) {
    if (q > j && /^\|\s*[A-Z][a-z]/.test(B[q]) && !/^\|\s*(SHUNT|AREP|PMG|PMI)/i.test(B[q])) break;
    const hit = [...B[q].matchAll(/\b(SHUNT|AREP\+?|PMG|PMI)\b/g)].map((m) => m[1].replace("+", ""));
    if (hit.length) { exLines.push(B[q]); for (const h of hit) if (!kinds.includes(h)) kinds.push(h); }
  }
  if (kinds.length) add("excitation", kinds, ...new Set(exLines));
  const avr = at(/^\|\s*AVR type\s*\|/i);
  if (avr >= 0) { const v = [...B[avr].matchAll(/\b([RD]\d{3})\b/g)].map((m) => m[1]); if (v.length) add("avr", [...new Set(v)], B[avr]); }
  // "| Voltage regulation (*) | ± 0.8 % | ± 0.5" rồi "%" ở dòng sau: số ±, theo thứ tự cột.
  const vr = at(/^\|\s*Voltage regulation\b/i);
  if (vr >= 0) {
    const two = `${B[vr]} ${/^\s*%/.test(B[vr + 1] || "") ? B[vr + 1] : ""}`, v = [...two.matchAll(/(?:±||\s)\s*(\d+(?:\.\d+)?)\s*%?/g)].map((m) => Number(m[1])).filter((x) => x > 0 && x < 5);
    if (v.length) add("vreg", v, B[vr], /^\s*%/.test(B[vr + 1] || "") ? B[vr + 1] : null);
  }
  // "| Short-circuit current | 300% (3 IN) : 10s", "| Short-circuit current | - | 300% (3 IN): | 10" + "s".
  const sc = at(/^\|\s*Short-circuit current\s*\|/i);
  if (sc >= 0) {
    const two = `${B[sc]} ${/^\s*s\b/i.test(B[sc + 1] || "") ? B[sc + 1] : ""}`, m = two.match(/(\d{3})\s*%\s*\(\s*3\s*IN\s*\)\s*:?[\s|]*(\d+)\s*\|?\s*s/i);
    if (m) add("sc300", { pct: Number(m[1]), s: Number(m[2]), all: !/\|\s*-\s*\|/.test(B[sc]) }, B[sc], /^\s*s\b/i.test(B[sc + 1] || "") ? B[sc + 1] : null);
  }
  const os = at(/^\|\s*Overspeed\s*\|/i), osM = os >= 0 && B[os].match(/\|\s*(\d)\s?(\d{3})\s*R\.P\.M/i);
  if (osM) add("overspeed", Number(osM[1] + osM[2]), B[os]);
  const alt = at(/^\|\s*Altitude\s*\|/i), altM = alt >= 0 && B[alt].match(/≤\s*(\d)\s?(\d{3})\s*m\b/);
  if (altM) add("altitude", Number(altM[1] + altM[2]), B[alt]);
  return out;
}

export const ratingsOf = (text) =>[...stamfordRatings(text), ...stamfordBookRatings(text), ...lsRatings(text), ...cumminsRatings(text)];
