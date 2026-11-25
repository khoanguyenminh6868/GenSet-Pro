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
// The star voltages of a frequency block: "Series Star (V)" (older sheets, anywhere in the line), or "| Star (V)" as the
// line's first cell (S6L1D / S7L1D sheets 2017–2025; "Parallel Star (V)" is another line and is not this one).
// PI7 / LVSI804 sheets (2010–2022, Winding 13 / 312 / 07 / 12): the frequency is the line's first cell ("| 50Hz | Star (V) | 380 …",
// "| 60Hz | Star (V) | 600 …"); ST_HZ_OWN reads that Hz, only on this layout (the older layouts keep their own Hz reading).
const ST_HZ_OWN = /^\|\s*(50|60)\s*Hz\s*\|\s*Star \(V\)/;
const ST_VOLTS = /Series Star \(V\)|^\|\s*Star \(V\)|^\|\s*(?:50|60)\s*Hz\s*\|\s*Star \(V\)/;
export function stamfordRatings(text) {
  const L = String(text).split("\n"), out = [];
  const first = (L.find((l, i) => i > 1 && l.trim()) || "").trim().split(/\s+/)[0];
  // The model: the nearest "<model> - Winding 311" / "<model> Wdg.311" line above the block ("HCI 534D/544D - Winding 311"
  // → "HCI534D/544D", "S4L1D-D41 Wdg.311"), else the sheet's first line.
  const modelAt = (i) => {
    for (let j = i - 1; j >= 0 && j >= i - 4; j--) { const m = L[j].replace(/^\|\s*/, "").match(/^(.+?)\s*(?:-\s*Winding|Wdg\.)\s*\d+/i); if (m) return m[1].replace(/\s+/g, ""); }
    const t = L.find((l, k) => k > 1 && /(?:-\s*Winding|Wdg\.)\s*\d+/i.test(l));
    if (t) return t.replace(/^\|\s*/, "").match(/^(.+?)\s*(?:-\s*Winding|Wdg\.)/i)[1].replace(/\s+/g, "");
    // "| PI734F - Technical Data Sheet | Winding 07", "| LV 804 S | WDG 12 - Technical Data Sheet": the model is the cells before.
    const h = L.find((l, k) => k > 1 && /Technical Data Sheet/i.test(l));
    const hm = h && h.replace(/^\|\s*/, "").match(/^(.+?)\s*(?:-\s*Technical Data Sheet|\|\s*WDG\s*\d+)/i);
    return hm ? hm[1].replace(/\s+/g, "") : first;
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
    while (j < L.length && !ST_VOLTS.test(L[j]) && j < i + 12) head += ` ${L[j++]}`;
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
      const m = L[k].match(ST_VOLTS);
      if (!m) { if (/^DIMENSIONS/.test(L[k])) break; continue; }
      // The voltages, and the run-on lines a sheet with an N/A column writes under them (S7L1D-K4: "| Star (V) | 380 | 400 |
      // 415" then "| N/A | 380 | 400 | 415" ×3 and "N/A": the 440 V column of each group is N/A). Old sheets: one line.
      let vtoks = cells(L[k].slice(m.index + m[0].length)), vEnd = k;
      for (let q = k + 1; q < L.length && /^\|?\s*N\/A\b/.test(L[q].trim()); q++) { vtoks = vtoks.concat(cells(L[q]).flatMap((x) => x.split(/\s+/))); vEnd = q; }
      const volts = vtoks.map((t) => (t === "N/A" ? null : num(t)));
      const hz = Number((`${L[k]} ${L[vEnd + 1] || ""} ${L[k - 1] || ""}`.match(/\|\s*(50|60)\s*\|/) || [])[1]) || Number((L[k].match(ST_HZ_OWN) || [])[1]) || hzHead;
      if (!hz || !volts.length || volts.length % groups.length || volts.some((v) => v !== null && !(v > 0))) continue;
      const per = volts.length / groups.length, rows = {}, used = { volts: L.slice(k, vEnd + 1) };
      for (let r = vEnd + 1; r < L.length && r < k + 40; r++) {
        if (ST_VOLTS.test(L[r]) || /^DIMENSIONS/.test(L[r])) break;
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
        if (v == null || val("kVA") == null) return;
        out.push({ part: "alternator", model, hz, duty: g.duty, rise: g.rise, phase: 3, volt: v, kVA: val("kVA"), kW: val("kW"), eff: val("eff"), pf: 0.8,
          lines: [...headLines, ...used.volts, ...(used.kVA || []), ...(used.kW || []), ...(used.eff || [])] });
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
  out.push(...lsTable6S(L));
  return out;
}
// Bảng "8.1 - Standard 6 winding" của tờ LSA Rating Table (6003, Series Star 6 dây, 1 500 R.P.M., 380 - 400 - 415 V): mỗi dòng
// "LSA 53.2 M9 - C6S/4 Option 6" + 12 số = 3 điện áp (D: 380 / 400 / 415 V) × 4 cột. Thứ tự 4 cột chỉ đọc từ dòng "Type …
// H:125K F:105K H: 150 K H: 163 K" của CHÍNH mục đó (không có thì bỏ). Chỉ lấy LSA 53.2 / 54.2: các cỡ 49.3 / 50.2 / 52.3 của cùng
// bảng đã đọc từ tờ riêng của chúng (khỏi trùng). Không đủ đúng 12 số (lsFigures) thì bỏ dòng. Tờ này không có dòng kW → kW null.
const LS6S_COLS = [["H:125K", "Cont.", "H:125K Continuous/ 40°C"], ["F:105K", "Cont.", "F:105K Continuous/ 40°C"], ["H:150K", "Standby", "H:150K Stand-by/ 40°C"], ["H:163K", "Standby", "H:163K Stand-by/ 27°C"]];
function lsTable6S(L) {
  const out = [];
  L.forEach((l, r) => {
    const m = flatLine(l).match(/^(LSA 5[34]\.2 [A-Z]+\d+)\s+(?:\*+\s+)?-\s+C6T?S\/4\s+Option 6\s+(.*)$/);
    if (!m) return;
    let h = r; while (h >= 0 && !/^\d\.\d+ - /.test(L[h].trim())) h--;
    if (h < 0 || !/^8\.1 - Standard 6 winding\b/.test(L[h].trim())) return;
    const sec = L.slice(h, r).map(flatLine).filter(Boolean);
    const type = sec.find((x) => /^Type\b.*H:\s?125\s?K F:\s?105\s?K H:\s?150\s?K H:\s?163\s?K\b/.test(x));
    const rp = sec.map((x, k) => (/^1 ?500 R\.P\.M\. - 3-phase - P\.F\. 0\.8/.test(x) ? k : -1)).filter((k) => k >= 0).pop();
    if (!type || rp == null || !/Series Star/.test(sec.slice(0, 3).join(" ")) || !/P\.F\. 0\.8 380 - 400 - 415 V$/.test(sec[rp])) return;
    const tail = sec.slice(rp).join(" ");
    if (!/6S winding/.test(tail) || !/D: 380 V.*D: 400 V.*D: 415 V/.test(tail)) return;
    const f = lsFigures(m[2], 12);
    if (!f) return;
    [380, 400, 415].forEach((volt, vi) => LS6S_COLS.forEach(([cls, duty, rise], ci) => out.push({ part: "alternator", model: m[1], hz: 50, duty, rise, phase: 3, volt, kVA: f[vi * 4 + ci], kW: null, eff: null, pf: 0.8, lines: [type, l] })));
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
  const duties = [...join(jd, jc).matchAll(/(Continuous|Stand-?by)(?: duty)?\s*\/?\s*(\d{2})\s*°\s*C/gi)].map((m) => ({ duty: /stand/i.test(m[1]) ? "Standby" : "Cont.", word: /stand/i.test(m[1]) ? "Stand-by" : "Continuous", t: m[2] }));
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
    else if (/^\d{2}\.\d\s+[A-Z]+\d+\s*kVA\b/.test(f) && L.some((x) => flatLine(x).startsWith(`LSA ${f.slice(0, 4)} `))) {
      // Tờ LSA 43.2 (1022): dòng bảng chỉ ghi "43.2 S1 | kVA | …"; chữ "LSA" lấy từ tiêu đề của chính tờ ("LSA 43.2 - 4 Pole").
      const b = f.match(/^(\d{2}\.\d)\s+([A-Z]+\d+)\s*kVA\b/);
      model = `LSA ${b[1]} ${b[2]}`; rest = L[r].slice(L[r].indexOf("kVA") + 3);
    }
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

// ---------- Mecc Alte (tờ dải ECP / ECO, meccalte.com dds/pdf; dau-phat-hang D2, 21/11/2026) ----------
// "Ratings 50Hz" → "kVA / kW @ Temp. Rise / Ambient °C - 0.8 PF" → "| STANDBY-163/27 | STANDBY-150/40 | H-125/40 |
// F-105/40 | B-80/40" → bốn dòng cách nối ("| Series Star Y | 380V | 400V …", "| Parallel Star YY | …", "| Series Delta Δ |
// …", "| Parallel Delta ΔΔ | …"; ô dính nhau "760V 800V 830V 880V" tách theo dấu cách) → mỗi model một dòng "| ECO46 1S4 A |
// kVA | …" và dòng "| kW | …" ngay sau. Số phẩy thập phân ("5,9"). Ô thiếu là "-" và PDF đẩy phần còn lại xuống các dòng
// sau ("| ECP28 1VS4 C | kVA | 8,2 | 8,2 | 8,2" rồi "| - | 7,7 | 7,7 | 7,7"): ghép các dòng bắt đầu bằng "-" cho tới đủ ô.
// Điện áp của mục = dòng SAO (Series Star Y hay Parallel Star YY) có MỌI điện áp trong 346–480 V (ECP: Series Star 380–440;
// ECO43 / ECO46: Parallel Star 380–440, Series Star 760–880): HSMT hạ thế đọc theo dòng đó; tờ không có dòng như vậy thì bỏ
// khối. Số ô của dòng kVA / kW phải bằng số điện áp, không thì bỏ model đó (không đoán cột). Chế độ: STANDBY → Standby, còn
// lại (H-125/40, F-105/40, B-80/40) → "Cont." với `rise` "125/40°C" như tờ Stamford, `cls` = chữ cấp (H / F / B).
const MA_CONN = /^\|\s*(Series Star Y|Parallel Star YY|Series Delta Δ|Parallel Delta ΔΔ)\s*\|/;
const maNum = (t) => (t === "-" ? null : Number(t.replace(",", ".")));
export function meccRatings(text) {
  const L = String(text).split("\n"), out = [];
  L.forEach((l, i) => {
    const hm = l.trim().match(/^Ratings (50|60)\s?Hz$/);
    if (!hm || !/^kVA \/ kW @ Temp\. Rise/.test((L[i + 1] || "").trim())) return;
    const gl = L[i + 2] || "";
    const groups = [...gl.matchAll(/\b(STANDBY|[HFB])-(\d{2,3})\/(\d{2})\b/g)].map((m) => ({ duty: m[1] === "STANDBY" ? "Standby" : "Cont.", rise: `${m[2]}/${m[3]}°C`, cls: m[1] === "STANDBY" ? null : m[1] }));
    if (groups.length < 2 || gl.replace(/\b(STANDBY|[HFB])-\d{2,3}\/\d{2}\b/g, "").replace(/[|\s]/g, "")) return;
    const conn = {}, connLines = [];
    let k = i + 3;
    for (; k < L.length && MA_CONN.test(L[k]); k++) {
      const name = L[k].match(MA_CONN)[1], toks = cells(L[k]).slice(1).flatMap((x) => x.split(/\s+/));
      if (!toks.every((t) => /^\d{2,4}V$/.test(t))) return;
      conn[name] = toks.map((t) => Number(t.slice(0, -1)));
      connLines.push(L[k]);
    }
    const star = ["Series Star Y", "Parallel Star YY"].find((s) => conn[s] && conn[s].every((v) => v >= 346 && v <= 480));
    if (!star) return;
    const volts = conn[star];
    if (volts.length % groups.length) return;
    const per = volts.length / groups.length, head = [l, L[i + 1], gl, ...connLines];
    // Ô của một dòng nhãn và các dòng "-" nối tiếp.
    const take = (r, first) => {
      let toks = first, lines = [L[r]], q = r + 1;
      for (; q < L.length && toks.length < volts.length && /^\|\s*-\s*(\||$)|^-$/.test(L[q].trim()); q++) { toks = toks.concat(L[q].trim() === "-" ? ["-"] : cells(L[q]).flatMap((x) => x.split(/\s+/))); lines.push(L[q]); }
      return { toks, lines, next: q };
    };
    for (let r = k; r < L.length; r++) {
      if (/^Ratings (50|60)\s?Hz$/.test(L[r].trim()) || /^Reactance/.test(L[r].trim())) break;
      const c = cells(L[r]);
      if (c.length < 3 || c[1] !== "kVA" || !/^EC[OP]\d+\b/.test(c[0])) continue;
      const kva = take(r, c.slice(2).flatMap((x) => x.split(/\s+/)));
      const kc = cells(L[kva.next] || "");
      const kw = kc[0] === "kW" ? take(kva.next, kc.slice(1).flatMap((x) => x.split(/\s+/))) : null;
      const okToks = (t) => t.length === volts.length && t.every((x) => x === "-" || /^\d+(,\d+)?$/.test(x));
      if (!okToks(kva.toks)) continue;
      const kwOk = kw && okToks(kw.toks);
      volts.forEach((v, col) => {
        const g = groups[Math.floor(col / per)], a = maNum(kva.toks[col]);
        if (a == null) return;
        out.push({ part: "alternator", model: c[0], hz: Number(hm[1]), duty: g.duty, rise: g.rise, cls: g.cls, phase: 3, volt: v, conn: star, kVA: a,
          kW: kwOk ? maNum(kw.toks[col]) : null, eff: null, pf: 0.8, lines: [...head, ...kva.lines, ...(kwOk ? kw.lines : [])] });
      });
    }
  });
  return out;
}

// Hệ số suy giảm của tờ Mecc Alte ("Derating coefficients": hàng = độ cao "≤ 1000", "> 1000 ≤ 1500" …, cột = nhiệt độ môi
// trường 25 / 40 / 45 … °C). Đọc nguyên bảng, mỗi ô kèm dòng tiêu đề + dòng của nó; số ô phải bằng số cột, không thì bỏ hàng.
export function meccDerate(text) {
  const L = String(text).split("\n");
  const i = L.findIndex((l) => /^Derating coefficients\s*$/.test(l.trim()));
  if (i < 0) return null;
  const hi = L.slice(i + 1, i + 6).findIndex((l) => /Altitude \(meters\)/.test(l));
  if (hi < 0) return null;
  const headL = L[i + 1 + hi], temps = (headL.split("Altitude (meters)")[1].match(/\d+/g) || []).map(Number);
  if (temps.length < 3) return null;
  const rows = [];
  for (let r = i + 2 + hi; r < L.length && r < i + 30; r++) {
    const t = L[r].replace(/\|/g, " ").trim();
    const m = t.match(/^(?:>\s*(\d+)\s*)?≤\s*(\d+)\s+((?:\d(?:\.\d+)?\s*)+)$/);
    if (!m) { if (rows.length && t) break; continue; }
    const f = m[3].trim().split(/\s+/).map(Number);
    if (f.length !== temps.length) continue;
    rows.push({ altFrom: m[1] ? Number(m[1]) : 0, altTo: Number(m[2]), factors: f, line: L[r] });
  }
  return rows.length ? { temps, rows, head: [L[i], headL] } : null;
}

// Thuộc tính chung của tờ dải Mecc Alte (mọi model của tờ): cách điện ("General characteristics" → "| Insulation class | H")
// và ngắn mạch duy trì ("… capable of delivering a sustained short-circuit current of >300% for" + "up to 20 seconds.").
// PMG là tuỳ chọn theo dải ("optionally available factory-fitted on ECP28, …") nên KHÔNG đọc kích từ: chưa rõ.
export function meccSheetAttrs(text) {
  const L = String(text).split("\n"), out = [];
  const g = L.findIndex((l) => /^General characteristics\s*$/.test(l.trim()));
  if (g < 0 || !/^EC[OP]\d+\b/.test((L[g - 1] || "").trim())) return out;
  const ins = L.slice(g + 1, g + 20).find((l) => /^\|\s*Insulation class\s*\|\s*[BFH]\s*$/i.test(l.trim()));
  if (ins) out.push({ key: "insulation", value: ins.trim().slice(-1).toUpperCase(), lines: [ins] });
  const i = L.findIndex((l) => /capable of delivering a sustained short-circuit current of\s*>\s*300%\s*for\s*$/i.test(l.trim()));
  const m = i >= 0 && (L[i + 1] || "").trim().match(/^up to (\d+) seconds\b/i);
  if (m) out.push({ key: "sc300", value: { pct: 300, s: Number(m[1]), all: true }, lines: [L[i], L[i + 1]] });
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
  // The AVR the sheet fits as standard ("| AS440 AVR - STANDARD", "AS480 AVR fitted as STANDARD"). Its own key: "avr" is the
  // list of a range sheet that makerAlts reads. An obsolete or optional AVR is not one.
  const avrL = L.map((l) => l.match(/^\|?\s*([A-Z]{2}\d{3})\s+AVR\s*(?:-\s*STANDARD|fitted\s+as\s+STANDARD)\b/i)).filter(Boolean);
  if (avrL.length) add("avrStd", [...new Set(avrL.map((m) => m[1].toUpperCase()))], ...new Set(avrL.map((m) => m.input)));
  return out;
}
// The codes of the standards a text names, one spelling each ("ISO 8528/3" = "ISO 8528-3", "BS 5000 Part 99" = "BS 5000-99"):
// a part is a code of its own, so "IEC 60034" does not answer "IEC 60034-1", nor "BS 5000" "BS 5514/1".
export const stdCodes = (text) => [...new Set([...String(text || "").matchAll(/\b(?:ISO\s*\d{4,5}|IEC\s*\d{5}|BS\s*\d{4}|VDE\s*\d{4}|UL\s*\d{3,4}|NEMA\s*MG\s*\d+(?:\.\d+)?)(?:\s*(?:Part\s*\d+|[-/]\s*\d+))?/gi)]
  .map((m) => m[0].toUpperCase().replace(/\s+/g, "").replace(/PART|\//g, "-").replace(/^(ISO|IEC|BS|VDE|UL)(\d)/, "$1 $2").replace(/^NEMAMG/, "NEMA MG ")))];
// The sentence of a Leroy-Somer range sheet that lists the standards the range meets, with the lines it runs over (at most 3).
export function lsStandards(text) {
  const L = String(text).split("\n"), i = L.findIndex((l) => /(meets?\s+all\s+key|in\s+compliance\s+to\s+the\s+main)\s+international\s+standards/i.test(l));
  if (i < 0) return [];
  const lines = [L[i]];
  for (let q = i + 1; q < i + 3 && q < L.length && L[q].trim() && !/\.\s*$/.test(lines[lines.length - 1]); q++) lines.push(L[q]);
  const value = stdCodes(lines.join(" "));
  return value.length ? [{ key: "standards", value, lines }] : [];
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

// ---------- Tờ hãng đầu phát dạng A / B (buoc-3-dau-phat-dinh-muc, 25/11/2026) ----------
// Dạng A: tiêu đề cột (tần số, chế độ / độ tăng nhiệt, pha, điện áp) rồi mỗi model một dòng "| <model> | kVA | …" và dòng
// kW ngay dưới (Kwise, Shangyan). Dạng B: tờ một model, mỗi cấp nhiệt một cặp dòng "| Rated Power in Class H | kVA | …" /
// "| (125°C/40°C) | kW | …" (Linz, Firstall). Luật chung (Khoa chốt): mỗi số một điện áp, kèm chế độ, độ tăng nhiệt /
// cấp, pha, tần số, hệ số công suất ĐÚNG như tờ ghi; tờ không ghi điều kiện nào thì để null (không suy, không quy đổi
// kVA ↔ kW). Một nhóm cột chỉ chia đều cho các nhóm của tiêu đề khi chính dãy điện áp xác nhận ranh giới (`splitEven`:
// trong mỗi phần điện áp tăng dần, phần sau bắt đầu thấp hơn chỗ phần trước kết thúc); không thì bỏ cả khối. Số ô của
// dòng kVA / kW phải đúng bằng số cột, không thì bỏ model đó (không đoán cột).
const RISE = (r, amb) => (amb ? `${r}/${amb}°C` : `${r}°C`);
const isNum = (t) => /^\d+(?:[.,]\d+)?$/.test(t);
// Chia `a` (số) thành k phần bằng nhau mà dãy tự xác nhận ranh giới; null khi không chắc. Mỗi phần tăng dần; mỗi ranh giới
// được xác nhận khi phần sau bắt đầu thấp hơn chỗ phần trước kết thúc, hoặc (cùng `grp`, vd. cùng tần số) hai phần giống hệt.
// Ranh giới giữa hai `grp` khác nhau mà không tự xác nhận chỉ nhận khi độ dài phần đã được xác nhận ở ranh giới khác (Shangyan:
// "380 400 415" ×3 rồi "416 440 480" ×3).
function splitEven(a, k, grp = null) {
  if (!k || a.length % k || a.some((x) => !(x > 0))) return null;
  const n = a.length / k, parts = [];
  for (let p = 0; p < k; p++) parts.push(a.slice(p * n, (p + 1) * n));
  if (parts.some((s) => s.some((x, i) => i && x <= s[i - 1]))) return null;
  let proven = false, open = false;
  for (let p = 1; p < k; p++) {
    const reset = parts[p][0] < parts[p - 1][n - 1], same = grp && grp[p] === grp[p - 1] && parts[p].join() === parts[p - 1].join();
    if (reset || same) proven = true;
    else if (grp && grp[p] !== grp[p - 1]) open = true;
    else return null;
  }
  return !open || proven ? n : null;
}
// Số của một dòng (mọi ô sau nhãn); null khi có ô không phải số.
const figs = (cs) => (cs.length && cs.every(isNum) ? cs.map(num) : null);
function pushCols(out, model, cols, kva, kw, eff, lines, extra = 0) {
  if (!kva || kva.length !== cols.length + extra || (kw && kw.length !== kva.length) || (eff && eff.length !== kva.length)) return;
  cols.forEach((c, i) => {
    if (!c || kva[i] == null) return;
    out.push({ part: "alternator", model, hz: c.hz ?? null, duty: c.duty ?? null, rise: c.rise ?? null, cls: c.cls ?? null, phase: c.phase ?? null, volt: c.volt,
      conn: c.conn ?? null, kVA: kva[i], kW: kw ? kw[i] : null, eff: eff ? eff[i] : null, pf: c.pf ?? null, lines });
  });
}
const DUTY_WORD = (w) => (/^(Cont\.?|Continuous|Common(?: use)?)$/i.test(w) ? "Cont." : /^(Standby|Stand-by|Backup|Spare)$/i.test(w) ? "Standby" : null);

// Kwise (kwise-generator 1001–1009): khối "| 50Hz/1500RPM | Standard Winding | / Power Factor 0.8" → "| Duty type/Temperature |
// Cont./125K/40℃ | Standby/163K/27℃ [| Cont./125K/40℃]" → "| Phase | 3-Phases | 3-Phases [| 1-Phase]" → "| Y | 380V | …" →
// "| KAL164A1 | kVA | …" + "| kW | …". Chỉ đọc cột 3 pha (nhóm 1 pha "220V/230V/240V" chia hai cột PF 0.8 / 1.0: không một
// điện áp, bỏ); nhóm 1 pha phải đứng cuối và dòng "YY" ghi đúng "0.8 | 1.0" thì mới biết nó chiếm 2 ô.
export function kwiseRatings(text) {
  const L = String(text).split("\n"), out = [];
  L.forEach((l, i) => {
    const hm = l.match(/^\|\s*(50|60)Hz\/(1500|1800|3000|3600)RPM\s*\|/);
    if (!hm) return;
    let j = i + 1;
    const isModel = (s) => /^\|\s*[A-Z][\w.\-/]*\s*\|\s*kVA\s*\|/.test(s);
    while (j < L.length && j < i + 14 && !isModel(L[j])) j++;
    if (!isModel(L[j] || "")) return;
    const head = L.slice(i, j), flat = head.slice(0, 3).map(flatLine).join(" ");
    const pf = (flat.match(/Power\s*Factor\s*(0\.\d+)/i) || [])[1];
    const dl = head.find((h) => /^\|\s*Duty\s*type\/Temperature\s*\|/i.test(h)), ph = head.find((h) => /^\|\s*Phase\s*\|/.test(h));
    const yl = head.find((h) => /^\|\s*(?:Voltage\s*\|\s*)?Y\s*\|/.test(h)), yy = head.find((h) => /^\|\s*YY\*?\s*\|/.test(h));
    if (!dl || !ph || !yl) return;
    const groups = cells(dl).slice(1).map((c) => c.match(/^(Cont\.|Standby)\/(\d{3})K\/(\d{2})℃$/));
    const phases = cells(ph).slice(1).map((c) => (/^3-Phases$/.test(c) ? 3 : /^1-Phase$/.test(c) ? 1 : null));
    if (!groups.length || groups.some((g) => !g) || phases.length !== groups.length || phases.some((p) => !p)) return;
    const n3 = phases.filter((p) => p === 3).length;
    if (phases.slice(0, n3).some((p) => p !== 3)) return;
    const yt = cells(yl).slice(/^\|\s*Voltage/.test(yl) ? 2 : 1), vt = yt.slice(0, yt.length - (phases.length - n3));
    if (vt.some((t) => !/^\d{3}V$/.test(t))) return;
    const volts = vt.map((t) => num(t.slice(0, -1))), per = splitEven(volts, n3);
    if (!per) return;
    let extra = 0;
    if (n3 < phases.length) { if (phases.length - n3 !== 1 || !yy || !/\|\s*0\.8\s*\|\s*1\.0\s*$/.test(yy)) return; extra = 2; }
    const cols = volts.map((v, c) => { const g = groups[Math.floor(c / per)]; return { hz: Number(hm[1]), duty: DUTY_WORD(g[1]), rise: RISE(g[2], g[3]), phase: 3, volt: v, conn: "Y", pf: pf ? num(pf) : null }; });
    for (let r = j; r < L.length && r < j + 80; r++) {
      if (/^\|\s*(50|60)Hz\/\d+RPM/.test(L[r])) break;
      if (!isModel(L[r])) continue;
      const c = cells(L[r]), kwl = /^\|\s*kW\s*\|/.test(L[r + 1] || "") ? L[r + 1] : null;
      pushCols(out, c[0], cols, figs(c.slice(2)), kwl ? figs(cells(kwl).slice(1)) : null, null, [...head, L[r], ...(kwl ? [kwl] : [])], extra);
    }
  });
  return out;
}

// Shangyan (shangyan-jiangsu 104–117): "| Model | [Frequency |] 50Hz(1500rpm) | 60Hz(1800rpm)" → [ "| Environment temperature |
// Common 40℃ | Peak 40℃ | …", "| Temperature rise | Common 125℃ | Backup 150℃ | …" ] → "| Voltage [(series connection)] | 380 | …"
// → "| GR270C | Rated capacity(KVA) | …" + "| Rated power(KW) | …" + "| Efficiency (%) | …". Có dòng độ tăng nhiệt thì mỗi
// tần số phải lặp đúng cùng dãy nhóm (Common / Backup …), mỗi ô có chữ chế độ ("105℃" trơn: bỏ khối). Không ghi pha, PF.
export function shangyanRatings(text) {
  const L = String(text).split("\n"), out = [];
  L.forEach((l, i) => {
    const hz = [...l.matchAll(/(50|60)\s*Hz\s*\((?:1500|1800|3000|3600)rpm\)/gi)].map((m) => Number(m[1]));
    if (!/^\|\s*Model\s*\|/.test(l) || hz.length < 1 || cells(l).length !== hz.length + 1 + (/\|\s*Frequency\s*\|/.test(l) ? 1 : 0)) return;
    const isModel = (s) => /^\|\s*[A-Z][\w.\-/]*\s*\|\s*Rated capacity\s*\(KVA\)\s*\|/i.test(s);
    let j = i + 1;
    while (j < L.length && j < i + 8 && !isModel(L[j])) j++;
    if (!isModel(L[j] || "")) return;
    const head = L.slice(i, j);
    const vl = head.find((h) => /^\|\s*Voltage\s*(?:\((?:series(?: connection)?)\))?\s*\|/i.test(h));
    const rl = head.find((h) => /^\|\s*Temperature rise\s*\|/i.test(h)), al = head.find((h) => /^\|\s*(?:Environment|Ambient) temperature\s*\|/i.test(h));
    if (!vl || head.some((h) => h !== vl && h !== rl && h !== al && h !== l && !/^\|\s*Voltage\s*\(parallel/i.test(h))) return;
    const vt = cells(vl).slice(1);
    if (!vt.every((t) => /^\d{3}$/.test(t))) return;
    const volts = vt.map(Number), conn = /series/i.test(vl) ? "series" : null;
    let groups = hz.map((h) => ({ hz: h }));
    if (rl) {
      const rs = cells(rl).slice(1).map((c) => c.match(/^(Common(?: use)?|Backup|Spare)\s*(\d{3})℃$/i)), as = al ? cells(al).slice(1).map((c) => c.match(/^(?:Common(?: use)?|Peak(?: value)?)\s*(\d{2})℃$/i)) : null;
      if (rs.some((r) => !r) || rs.length % hz.length || (as && (as.length !== rs.length || as.some((a) => !a)))) return;
      const per = rs.length / hz.length, sig = (p) => rs.slice(p * per, (p + 1) * per).map((r, k) => `${r[1]}${r[2]}${as ? as[p * per + k][1] : ""}`).join();
      if (hz.some((_, p) => sig(p) !== sig(0))) return;
      groups = rs.map((r, k) => ({ hz: hz[Math.floor(k / per)], duty: DUTY_WORD(r[1]), rise: RISE(r[2], as ? as[k][1] : null) }));
    }
    const n = splitEven(volts, groups.length, rl ? groups.map((g) => g.hz) : null);
    if (!n) return;
    const cols = volts.map((v, c) => ({ ...groups[Math.floor(c / n)], volt: v, conn })), blk = [];
    for (let r = j; r < L.length && r < j + 120; r++) {
      if (/^\|\s*Model\s*\|/.test(L[r])) break;
      if (!isModel(L[r])) continue;
      const c = cells(L[r]), kwl = /^\|\s*[RP]ated power\s*\(KW\)\s*\|/i.test(L[r + 1] || "") ? L[r + 1] : null;
      const efl = kwl && /^\|\s*Efficiency\s*\(%\)\s*\|/i.test(L[r + 2] || "") ? L[r + 2] : null;
      pushCols(blk, c[0], cols, figs(c.slice(2)), kwl ? figs(cells(kwl).slice(1)) : null, efl ? figs(cells(efl).slice(1)) : null, [...head, L[r], ...(kwl ? [kwl] : []), ...(efl ? [efl] : [])]);
    }
    // Một ô kW lớn hơn ô kVA cùng cột (n113: số điện áp 416 / 440 / 480 lẫn vào dòng kVA, cả dòng dưới lệch một tầng) hay
    // hiệu suất ≥ 100: bố cục khối không chắc, bỏ cả khối.
    if (!blk.some((x) => (x.kW != null && x.kW > x.kVA) || (x.eff != null && x.eff >= 100))) out.push(...blk);
  });
  return out;
}

// Ô điện áp của tờ một model: "380/220" (dây / pha) → 380; ô khác ("115/230" của Double Delta, "230", "277") giữ chỗ cột mà
// không đọc (`keep` false): không biết cách nối / số pha của cột đó.
const starCell = (t) => { const m = String(t).match(/^(\d{3})\/(\d{3})$/); return m && Number(m[1]) > Number(m[2]) ? Number(m[1]) : null; };
const firstVolt = (t) => Number((String(t).match(/^(\d{2,3})/) || [])[1]);
// Cột của tờ một model: tần số theo dòng Frequency (một tần số → mọi cột; hai → chia đều khi dãy điện áp xác nhận).
function sheetCols(hz, vtoks, base) {
  const n = hz.length === 1 ? vtoks.length : splitEven(vtoks.map(firstVolt), hz.length);
  if (!n || !vtoks.length) return null;
  return vtoks.map((t, c) => { const v = starCell(t); return v ? { ...base, hz: hz[Math.floor(c / n)], volt: v } : null; });
}

// Linz (linz-electric 1001–1033, "TECHNICAL DATA SHEET" một model): "| Frequency | 50Hz - 1500rpm [| 60Hz - 1800rpm]" → "| V |
// 380/220 | …" (hay "| Voltage Series Star | V | …"; ô dính "400/230 415/240" tách theo dấu cách) → "| Rated Power in Class H |
// kVA | …" + "| (125°C/40°C) | kW | …", "| Rated Power Standby | kVA | …" + "| (150°C/40°C) | kW | …". Dòng cấp H / F không ghi
// chế độ (duty null), dòng Standby không ghi cấp (cls null). Pha 3 khi tờ ghi "Three-Phase"; PF từ "| Rated Power Factor | 0.8".
export function linzRatings(text) {
  const L = String(text).split("\n"), out = [];
  const model = (L.map((l) => l.trim().match(/^(?:ALTERNATOR\s+)?(PRO\d+[A-Z]+\s+[A-Z]+\/\d)$/)).find(Boolean) || [])[1];
  if (!model) return out;
  const pf = (L.map((l) => l.match(/^\|\s*Rated Power Factor\s*\|\s*(0[.,]\d+)\s*$/)).find(Boolean) || [])[1];
  const three = L.some((l) => /^\|?\s*Three-Phase\b/.test(l.trim()));
  L.forEach((l, i) => {
    const fm = l.match(/^\|\s*Frequency\s*\|\s*(50|60)Hz - (?:1500|1800)rpm(?:\s*\|\s*(50|60)Hz - (?:1500|1800)rpm)?\s*$/);
    if (!fm) return;
    const hz = [fm[1], fm[2]].filter(Boolean).map(Number);
    let v = i + 1;
    while (v < L.length && v < i + 9 && !/^\|\s*(?:V|Voltage Series Star\s*\|\s*V)\s*\|/.test(L[v])) v++;
    if (v >= i + 9 || v >= L.length) return;
    const series = /Voltage Series Star/.test(L[v]);
    const vtoks = cells(L[v]).slice(series ? 2 : 1).flatMap((x) => x.split(/\s+/));
    // Một dòng điện áp mà dòng kế không phải dòng định mức (dòng điện áp thứ hai "| 190/110 | …" của cách nối khác): bỏ qua nó.
    const cols = sheetCols(hz, vtoks, { phase: three ? 3 : null, conn: series ? "Series Star" : null, pf: pf ? num(pf) : null });
    if (!cols) return;
    for (let r = v + 1; r < L.length && r < v + 16; r++) {
      if (/^\|\s*Frequency\s*\||^\|?\s*EFFICIENCY/i.test(L[r])) break;
      const m = L[r].match(/^\|\s*Rated Power (?:in Class ([HF])|Standby)\s*\|\s*kVA\s*\|/), k = L[r + 1] || "", km = k.match(/^\|\s*\((\d{3})°C\/(\d{2})°C\)\s*\|\s*kW\s*\|/);
      if (!m || !km) continue;
      const cs = cols.map((c) => c && { ...c, cls: m[1] || null, duty: m[1] ? null : "Standby", rise: RISE(km[1], km[2]) });
      pushCols(out, model, cs, figs(cells(L[r]).slice(2)), figs(cells(k).slice(2)), null, [L[i], L[v], L[r], k]);
    }
  });
  return out;
}

// Firstall (firstall-power 1001–1007, tờ một model, tên ở dòng đầu "QYI454G"): "| Frequency频率 | Hz | 50 | 60" → "| Voltage
// ( series star )电压 Y | V | 380/220 | …" → "| Rated power at Class H (125ºC) temperature rise | kVA | …" + "| 额定功率在H(125ºC)温升 |
// kW | …". Tờ không ghi chế độ, nhiệt độ môi trường của dòng đó, pha (null).
export function firstallRatings(text) {
  const L = String(text).split("\n"), out = [];
  const model = ((L.slice(2).find((l) => l.trim()) || "").trim().match(/^([A-Z]{2,4}\d{3}[A-Z]{1,2})$/) || [])[1];
  if (!model) return out;
  const pf = null; // Tờ chỉ ghi "P.F.=0.8" ở dòng hiệu suất: không gán cho kVA.
  L.forEach((l, i) => {
    const fm = l.match(/^\|\s*Frequency频率\s*\|\s*Hz\s*\|\s*(50|60)(?:\s*\|\s*(50|60))?\s*$/);
    if (!fm || !/^\|\s*Voltage \( series star \)电压 Y\s*\|\s*V\s*\|/.test(L[i + 1] || "")) return;
    const cols = sheetCols([fm[1], fm[2]].filter(Boolean).map(Number), cells(L[i + 1]).slice(2).flatMap((x) => x.split(/\s+/)), { conn: "series star", pf });
    if (!cols) return;
    for (let r = i + 2; r < L.length && r < i + 12; r++) {
      const m = L[r].match(/^\|\s*Rated power at Class ([HF]) \((\d{3})ºC\) temperature rise\s*\|\s*kVA\s*\|/), k = L[r + 1] || "";
      if (!m || !/^\|\s*额定功率在[HF]\(\d{3}ºC\)温升\s*\|\s*kW\s*\|/.test(k)) continue;
      pushCols(out, model, cols.map((c) => c && { ...c, cls: m[1], rise: RISE(m[2]) }), figs(cells(L[r]).slice(2)), figs(cells(k).slice(2)), null, [l, L[i + 1], L[r], k]);
    }
  });
  return out;
}

export const sheetRatings = (text) => [...kwiseRatings(text), ...shangyanRatings(text), ...linzRatings(text), ...firstallRatings(text)];

export const ratingsOf = (text) =>[...stamfordRatings(text), ...stamfordBookRatings(text), ...lsRatings(text), ...cumminsRatings(text), ...meccRatings(text), ...sheetRatings(text)];
