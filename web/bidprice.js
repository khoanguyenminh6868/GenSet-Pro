// Gợi ý giá đấu (Khoa, 2026-11-03: so theo cấu hình bằng AI). Dùng chung cho trang web (window.GenbidBidprice) và bot
// (suppliers/bidprice-bot.mjs). Code chọn các phần đã có kết quả gần với gói này nhất (candidates), agent đọc cấu hình
// của gói này và của từng phần (hàng hoá trúng, câu HSMT) rồi xếp mỗi phần vào một mức giống, code tính giá từ các phần
// giống (suggest). Mọi con số do code tính từ giá trên muasamcong, agent không ghi số giá nào.
(function (root) {
  // Power named in a text: "500KVA", "2 x 250 kVA", "160kW" (kW read as kVA at power factor 0.8, only to find similar tenders).
  function kvaOf(text) {
    const m = String(text || "").normalize("NFC").match(/(\d+(?:[.,]\d+)?)\s*(kva|kw)\b/i);
    if (!m) return null;
    const v = Number(m[1].replace(/\.(?=\d{3}\b)/, "").replace(",", "."));
    return v > 0 ? (/kw/i.test(m[2]) ? v / 0.8 : v) : null;
  }
  // Same name rules as the bot (genbid-sync.js isGenset): a power plant's own generator is not a generator set.
  const GENSET_RE = /m[áa]y\s*ph[áa]t\s*(đi[ệe]n|di[eê]s[eê]l|di[eê]zen|dự\s*phòng)|m[áa]y\s*ph[áa]t[^,;:]{0,30}\d+\s*k[vV]?[aA]\b|\bgenset\b|\bmp[đd]\b/i;
  const PLANT_RE = /tua\s*bin|turbine|tổ\s*máy\s*(số\s*)?[HS]?\d|nhà\s*máy\s*(thủy|thuỷ|nhiệt)\s*điện/i, SET_RE = /dự\s*phòng|di[eê]s[eê]l|di[eê]zen|\d\s*kva\b/i;
  const isGensetName = (n) => { n = String(n || "").normalize("NFC"); return GENSET_RE.test(n) && (!PLANT_RE.test(n) || SET_RE.test(n)); };
  // Repair, upkeep, rental, parts and studies are priced differently from supplying a generator set.
  const SVC_RE = /sửa\s*chữa|bảo\s*dưỡng|bảo\s*trì|đại\s*tu|thuê|phụ\s*tùng|vật\s*tư|chổi\s*than|thí\s*nghiệm|kiểm\s*định|tư\s*vấn|dầu\s*(nhớt|bôi\s*trơn)/i;
  const bidKind = (n) => (SVC_RE.test(String(n || "").normalize("NFC")) ? "svc" : "supply");
  // Power read by the bot from a past tender's HSMT (bidhist config.kvas): the largest set for a one-lot tender; for
  // several lots only when the HSMT names a single power, since it cannot tell which lot each one belongs to.
  function cfgKva(d, multi) {
    const ps = (d?.config?.kvas || []).map((p) => (p.u === "kW" ? p.v / 0.8 : p.u === "MVA" ? p.v * 1000 : p.v)).filter((v) => v >= 1);
    if (!ps.length) return null;
    return multi ? (new Set(ps).size === 1 ? ps[0] : null) : Math.max(...ps);
  }
  const taxKey = (x) => String(x.taxCode || "").replace(/\D/g, "") || String(x.name || "").trim().toUpperCase();
  const bdPrice = (b) => b.finalPrice ?? b.bidPrice;

  const MAX = 80, LEVELS = ["same", "close", "different", "unknown"];
  const cut = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n) + "…" : s; };
  // The decided lots most like the tender, for the agent to compare. t: { notifyNo, bidName, bidForm, investorName },
  // docs: { <TBMT>: bidhist document }, K: kVA, P: package price. Only lots that supply a generator set (same kind as
  // the tender), with a winner and a price; a lot whose power is known must be within half to twice K; a lot whose power
  // is not known stays only when it says something about its goods (won goods or the HSMT's lines), so the agent can
  // tell what it was (Khoa, 2026-11-03: a lot with nothing about its configuration cannot set the price).
  function candidates(t, docs, K, P) {
    const kind = bidKind(t.bidName), out = [], years = (iso) => (iso ? (Date.now() - Date.parse(iso)) / (365 * 864e5) : 3);
    let total = 0;
    for (const [key, d] of Object.entries(docs)) {
      if (key === t.notifyNo || !d.final || !isGensetName(d.bidName)) continue;
      const multi = (d.lots || []).length > 1;
      for (const lot of d.lots || []) {
        const w = (lot.bidders || []).find((x) => x.won), price = lot.price ?? (multi ? null : d.estimatedPrice);
        const wp = w && Number(w.winPrice ?? bdPrice(w));
        if (!w || !(price > 0) || !(wp > 0)) continue;
        const ratio = wp / price;
        if (ratio < 0.3 || ratio > 1.02) continue;
        total++;
        if (bidKind((multi && lot.lotName) || d.bidName) !== kind) continue;
        const goods = (lot.goods || []).filter((g) => g.name || g.code || g.maker || g.label);
        const kGoods = Math.max(0, ...goods.map((g) => kvaOf([g.name, g.code, g.desc].join(" ")) || 0)) || null;
        const kName = kvaOf(lot.lotName) || (multi ? null : kvaOf(d.bidName)), kCfg = kName || kGoods ? null : cfgKva(d, multi);
        const k = kName || kGoods || kCfg, kSrc = kName ? "tên gói" : kGoods ? "hàng chào" : kCfg ? "HSMT" : "";
        if (K && k && Math.abs(Math.log(K / k)) > Math.log(2)) continue;
        if (!k && !goods.length && !d.config?.text) continue;
        const dist = (K && k ? Math.abs(Math.log(K / k)) : 0.7) + (P ? 0.5 * Math.abs(Math.log(P / price)) : 0) + (d.bidForm && d.bidForm === t.bidForm ? 0 : 0.3)
          + 0.15 * Math.min(years(d.openedAt || d.bidCloseDate), 5) - (t.investorName && d.investorName === t.investorName ? 0.3 : 0);
        out.push({
          key, lotNo: lot.lotNo || "", name: d.bidName || "", lotName: multi ? lot.lotName || "" : "", investor: d.investorName || "", location: d.location || "",
          bidForm: d.bidForm || "", at: d.openedAt || d.bidCloseDate || "", url: d.url || "", price, wp, ratio, winner: w.name || "", k, kSrc, dist,
          goods: goods.slice(0, 8).map((g) => ({ name: cut(g.name, 300), maker: g.maker || g.label || "", code: g.code || "", origin: g.origin || "", qty: g.qty ?? null, unitPrice: g.unitPrice ?? null, desc: cut(g.desc, 200) })),
          cfgText: cut(d.config?.text, 1500),
          bidders: (lot.bidders || []).map((b) => ({ name: b.name || "", tax: String(b.taxCode || "").replace(/\D/g, ""), price: bdPrice(b) ?? null, won: !!b.won })),
        });
      }
    }
    out.sort((a, b) => a.dist - b.dist);
    return { total, list: out.slice(0, MAX).map((s, i) => ({ id: "S" + (i + 1), ...s })) };
  }
  // What the agent reads about one lot, and the text its quote must come from.
  function sampleText(s) {
    const n = (v) => Number(v).toLocaleString("vi-VN");
    return [
      `Tên gói: ${s.name}`, s.lotName ? `Phần: ${s.lotName}` : "", `Chủ đầu tư: ${s.investor}${s.location ? ` (${s.location})` : ""}`,
      s.k ? `Công suất (code đọc từ ${s.kSrc}): ${Math.round(s.k)} kVA` : "Công suất: không rõ",
      `Số nhà thầu: ${s.bidders.length}`,
      ...(s.goods.length ? ["Hàng hoá trúng thầu:", ...s.goods.map((g) => `- ${[g.name, g.maker && `hãng ${g.maker}`, g.code && `model ${g.code}`, g.origin && `xuất xứ ${g.origin}`, g.qty != null && `số lượng ${g.qty}`, g.unitPrice && `đơn giá ${n(g.unitPrice)} đ`, g.desc].filter(Boolean).join(" | ")}`)] : ["Hàng hoá trúng thầu: không ghi"]),
      s.cfgText ? `Trích HSMT:\n${s.cfgText}` : "",
    ].filter(Boolean).join("\n");
  }
  const quantile = (xs, p) => { const a = [...xs].sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(p * (a.length - 1)))] : null; };
  const median = (xs) => quantile(xs, 0.5);
  // Prices from the lots the agent found alike. Only lots with two or more bidders: a lone bidder's price was never
  // competed against (IB2500514971: one bidder, 99,9% of the lot price). "same" alone when there are 5 of them, else
  // "same" and "close"; under 3 lots no price is suggested. Each level's chance is the share of those lots whose
  // winning price was at least that price, over the lot price.
  function suggest(samples, P, K) {
    const ok = (s) => !s.unverified && s.bidders.length >= 2;
    const same = samples.filter((s) => s.level === "same" && ok(s)), close = samples.filter((s) => s.level === "close" && ok(s));
    const use = same.length >= 5 ? same : [...same, ...close], basis = same.length >= 5 ? "same" : "same+close";
    const ratios = use.map((s) => s.ratio), round = (v) => Math.round(v / 1000) * 1000;
    const chance = (r) => (use.length ? use.filter((s) => s.ratio >= r - 1e-9).length / use.length : 0);
    const levels = use.length >= 3 && P > 0 ? [["low", "Cạnh tranh", 0.25], ["mid", "Trung vị", 0.5], ["high", "Cao", 0.75]].map(([id, label, p]) => {
      const r = quantile(ratios, p);
      return { id, label, ratio: r, price: round(P * r), chance: chance(r) };
    }) : [];
    const withK = use.filter((s) => s.k), perKva = K && withK.length >= 3 ? median(withK.map((s) => s.wp / s.k)) : null;
    const comp = new Map();
    for (const s of use) for (const b of s.bidders) {
      const id = b.tax || b.name.trim().toUpperCase();
      if (!id) continue;
      const c = comp.get(id) || { id, name: b.name, n: 0, wins: 0, ratios: [] };
      c.n++; if (b.won) c.wins++; if (b.price > 0) c.ratios.push(b.price / s.price);
      comp.set(id, c);
    }
    const comps = [...comp.values()].sort((a, b) => b.n - a.n || b.wins - a.wins).slice(0, 8).map((c) => ({ id: c.id, name: c.name, n: c.n, wins: c.wins, ratio: median(c.ratios) }));
    return { basis, n: use.length, same: same.length, close: close.length, enough: use.length >= 5, levels, perKva: perKva && { value: round(perKva), price: round(perKva * K), n: withK.length }, comps };
  }
  root.GenbidBidprice = { kvaOf, isGensetName, bidKind, cfgKva, taxKey, bdPrice, candidates, sampleText, suggest, LEVELS, MAX };
})(typeof window !== "undefined" ? window : globalThis);
