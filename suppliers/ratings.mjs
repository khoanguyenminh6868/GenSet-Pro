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

// ---------- Leroy-Somer TAL ----------
export function lsRatings(text) {
  const L = String(text).split("\n"), out = [];
  L.forEach((l, i) => {
    const m = l.match(/^Ratings (50|60) Hz - (\d{4}) R\.P\.M\./);
    if (!m) return;
    const hz = Number(m[1]), find = (re) => { for (let j = i + 1; j < i + 10 && j < L.length; j++) if (re.test(L[j])) return j; return -1; };
    const jd = find(/^\|\s*Duty/), jc = find(/^\|\s*Class/), jp = find(/^\|\s*Phase/), jy = find(/^\|\s*Y\s*\|/);
    if ([jd, jc, jp, jy].some((x) => x < 0)) return;
    const duty = cells(L[jd]).slice(1).map((d) => (/stand/i.test(d) ? "Standby" : /contin/i.test(d) ? "Cont." : null)), temp = cells(L[jd]).slice(1);
    const cls = cells(L[jc]).slice(1);
    const vt = [...L[jy].matchAll(/(\d{3})V(\*?)/g)].map((x) => ({ v: Number(x[1]), star: !!x[2] }));
    const G = cls.length;
    if (G < 2 || duty.length !== G || duty.some((d) => !d) || vt.length % G) return;
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
  });
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

export const ratingsOf = (text) => [...stamfordRatings(text), ...stamfordBookRatings(text), ...lsRatings(text), ...cumminsRatings(text)];
