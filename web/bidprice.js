// Gợi ý giá đấu (Khoa, 2026-11-03: so theo cấu hình bằng AI). Dùng chung cho trang web (window.GenbidBidprice) và bot
// (suppliers/bidprice-bot.mjs). Code chọn các phần đã có kết quả gần với gói này nhất theo công suất, giá gói và cấu hình
// yêu cầu, bỏ phần khác nhóm xuất xứ động cơ (candidates), agent đọc cấu hình
// của gói này và của từng phần (hàng hoá trúng, câu HSMT) rồi xếp mỗi phần vào một mức giống, code tính giá từ các phần
// giống (suggest). Mọi con số do code tính từ giá trên muasamcong, agent không ghi số giá nào.
(function (root) {
  // Power named in a text: "500KVA", "2 x 250 kVA", "160kW" (kW read as kVA at power factor 0.8, only to find similar tenders).
  // Which figure of a text is the genset's (2026-11-04 regression over 1,241 HSMT: 30 names read the transformer):
  // one whose clause names a transformer, a UPS or a stabilizer ("Trạm biến áp 400kVA; máy phát điện 350kVA", "UPS
  // 10KVA và máy phát điện 5KVA", "TBA 400kVA, 560kVA") is another device's. When some figure is, the one after "máy
  // phát" wins, else the first of the rest; none when every figure is another device's. Gensets only: the first one.
  // `matches`: the figures of `text` (String.matchAll, with .index). Shared with suppliers/config-bot.mjs capacity().
  const OTHER_DEVICE = /bi[ếe]n [áa]p|\bTBA\b|\bMBA\b|\bUPS\b|[ổo]n [áa]p|t[ụu] b[ùu]/i, GENSET_W = /m[áa]y ph[áa]t|\bMP[ĐD]\b|genset|generator|t[ổo] m[áa]y/i;
  function capPick(text, matches) {
    const s = String(text || "");
    // "0,4kV" is not a break; a clause of figures only ("TBA 400kVA, 560kVA") belongs to the one before it.
    const clause = (m) => { const p = s.slice(0, m.index).split(/[;+(\n]|,(?!\d)|\svà\s/); let i = p.length - 1; while (i > 0 && !/[a-zà-ỹ]{2}/i.test(p[i].replace(/\d[\d.,]*\s*(kva|e?kw|mva|mw)/gi, ""))) i--; return p.slice(i).join(","); };
    const own = matches.filter((m) => !OTHER_DEVICE.test(clause(m)));
    return own.length === matches.length ? matches[0] || null : own.find((m) => GENSET_W.test(clause(m))) || own[0] || null;
  }
  function kvaOf(text) {
    const t = String(text || "").normalize("NFC"), m = capPick(t, [...t.matchAll(/(\d+(?:[.,]\d+)?)\s*(kva|kw)\b/gi)]);
    if (!m) return null;
    const v = Number(m[1].replace(/\.(?=\d{3}\b)/, "").replace(",", "."));
    return v > 0 ? (/kw/i.test(m[2]) ? v / 0.8 : v) : null;
  }
  // Same name rules as the bot (genbid-sync.js isGenset): a power plant's own generator is not a generator set.
  const GENSET_RE = /m[áa]y\s*ph[áa]t\s*(đi[ệe]n|di[eê]s[eê]l|di[eê]zen|dự\s*phòng)|m[áa]y\s*ph[áa]t[^,;:]{0,30}\d+\s*k[vV]?[aA]\b|\bgenset\b|\bmp[đd]\b/i;
  const PLANT_RE = /tua\s*bin|turbine|tổ\s*máy\s*(số\s*)?[HS]?\d|nhà\s*máy\s*(thủy|thuỷ|nhiệt)\s*điện/i, SET_RE = /dự\s*phòng|di[eê]s[eê]l|di[eê]zen|\d\s*kva\b/i;
  const isGensetName = (n) => { n = String(n || "").normalize("NFC"); return GENSET_RE.test(n) && (!PLANT_RE.test(n) || SET_RE.test(n)); };
  // Repair, upkeep, rental, parts and studies are priced differently from supplying a generator set.
  const SVC_RE = /sửa\s*chữa|bảo\s*dưỡng|bảo\s*trì|đại\s*tu|trung\s*tu|giám\s*sát\s*(thi\s*công|lắp\s*đặt)|thuê|phụ\s*tùng|vật\s*tư|chổi\s*than|thí\s*nghiệm|kiểm\s*định|tư\s*vấn|dầu\s*(nhớt|bôi\s*trơn)/i;
  // Moving or re-installing a set already owned (Khoa, 2026-11-03) is not supplying one either: "Di dời, lắp đặt máy phát
  // điện...", "Tháo dỡ, di chuyển trạm biến áp, máy phát điện...". A name that also buys ("Mua sắm và điều chuyển máy
  // phát điện") is a supply.
  const MOVE_RE = /tháo\s*dỡ|di\s*dời|di\s*chuyển|điều\s*chuyển|lắp\s*(đặt\s*)?lại|tận\s*dụng/i, BUY_RE = /mua\s*sắm|\bmua\b|trang\s*bị|đầu\s*tư/i;
  const bidKind = (n) => { n = String(n || "").normalize("NFC"); return SVC_RE.test(n) ? "svc" : MOVE_RE.test(n) && !BUY_RE.test(n) ? "move" : "supply"; };
  // An HSMT line about a set the owner already has that is to be moved or re-installed ("Máy phát điện 500 KVA do Bệnh
  // viện Bệnh Nhiệt Đới chuyển giao, cần di dời, cải tạo, lắp đặt"); a set on wheels "để di chuyển" is not one.
  const OLD_SET_RE = /hiện\s*hữu|chuyển\s*giao|đang\s*(có|sử\s*dụng)|tận\s*dụng/i, MOVE_ACT_RE = /di\s*dời|tháo\s*dỡ|lắp\s*(đặt\s*)?lại|di\s*chuyển/i;
  const movesOldSet = (text) => String(text || "").normalize("NFC").split(/\n/)
    .some((l) => /máy\s*phát|tổ\s*máy|\bmáy\b/i.test(l) && OLD_SET_RE.test(l) && MOVE_ACT_RE.test(l) && !/bánh\s*xe/i.test(l));
  // Power read by the bot from a past tender's HSMT (bidhist config.kvas): the largest set for a one-lot tender; for
  // several lots only when the HSMT names a single power, since it cannot tell which lot each one belongs to.
  function cfgKva(d, multi) {
    const ps = (d?.config?.kvas || []).map((p) => (p.u === "kW" ? p.v / 0.8 : p.u === "MVA" ? p.v * 1000 : p.v)).filter((v) => v >= 1);
    if (!ps.length) return null;
    return multi ? (new Set(ps).size === 1 ? ps[0] : null) : Math.max(...ps);
  }
  const taxKey = (x) => String(x.taxCode || "").replace(/\D/g, "") || String(x.name || "").trim().toUpperCase();
  const bdPrice = (b) => b.finalPrice ?? b.bidPrice;

  // What a text says about the configuration (Khoa, 2026-11-03: chọn gói tương tự theo cấu hình yêu cầu, không theo hình
  // thức đấu thầu hay tuổi gói). group: "cn" (only Chinese engine makes named, or Trung Quốc as the origin), "foreign" (only
  // foreign ones, or G7 / a foreign country), null (none, or both); tags: makes named and items with a price of their own.
  // Makes come from web/catalog.js (window.GenbidCatalog), loaded on the web and in the bot.
  const SCOPE = [["vỏ cách âm", /cách\s*âm|chống\s*ồn|giảm\s*âm|soundproof|silent|canopy/i], ["ATS", /\bATS\b|chuyển\s*(đổi\s*)?nguồn\s*tự\s*động/i],
    ["hoà đồng bộ", /h(oà|òa)\s*đồng\s*bộ|synchroni[sz]/i], ["bồn dầu ngoài", /(bồn|bể|téc)\s*(chứa\s*)?(dầu|nhiên\s*liệu)\s*(ngoài|rời|ngầm|riêng)/i],
    ["trạm biến áp", /trạm\s*biến\s*áp|máy\s*biến\s*áp/i], ["1 pha", /(^|[^\d])1\s*pha\b|một\s*pha/i]];
  const CN_WORD = /trung\s*quốc|\bchina\b|\bPRC\b/i;
  const FOREIGN_WORD = /\bG7\b|\bG20\b|\bmỹ\b|\bUSA\b|vương\s*quốc\s*anh|\bUK\b|nhật\s*bản|\bjapan\b|\bđức\b|\bgermany\b|\bpháp\b|\bfrance\b|\bitaly\b|hàn\s*quốc|\bkorea\b|thụy\s*điển|\bsweden\b|ấn\s*độ|\bindia\b|châu\s*âu/i;
  function profileOf(text, model = "") {
    const t = String(text || "").normalize("NFC"), C = root.GenbidCatalog, tags = [];
    const named = (list) => (list || []).filter(([re]) => re.test(t)).map(([, n]) => n);
    const engines = C ? named(C.ENGINE_BRANDS) : [];
    for (const n of engines) tags.push(`động cơ ${n}`);
    if (C) for (const n of named(C.ALT_BRANDS)) tags.push(`đầu phát ${n}`);
    if (C) for (const c of C.CONTROLLERS) if (c.word.test(t)) tags.push(`bộ điều khiển ${c.brand}`);
    for (const [n, re] of SCOPE) if (re.test(t)) tags.push(n);
    // A model code with no make named ("WP13D385E200"): its make by catalog.js. Countries count only on the lines about the
    // engine or the set: a cable from Korea or a Deep Sea controller from the UK says nothing of the engine.
    const o = C && model ? C.originIn(t, model) : null, eng = t.split(/\n/).filter((l) => ENGINE_LINE.test(l) && !OTHER_LINE.test(l)).join("\n");
    const fr = engines.some((n) => C.FOREIGN_ENGINE.has(n)) || o === "other" || FOREIGN_WORD.test(eng);
    const cn = engines.some((n) => !C.FOREIGN_ENGINE.has(n)) || o === "cn" || CN_WORD.test(eng);
    return { group: fr === cn ? null : fr ? "foreign" : "cn", tags };
  }
  const ENGINE_LINE = /động\s*cơ|engine|tổ\s*máy|máy\s*phát|genset/i, OTHER_LINE = /\bcáp\b|dây\s*(cáp|điện|tín)|\bATS\b|\btủ\b|bộ\s*điều\s*khiển|controller|đầu\s*phát|alternator|biến\s*áp/i;
  const GROUP = { cn: "Trung Quốc", foreign: "ngoài Trung Quốc" };
  // The winning generator sets' engine origin, from the make, model and origin muasamcong lists for each (cables, ATS,
  // transformers left out): one group for all, else none.
  function goodsGroup(goods) {
    const gs = goods.filter((g) => isGensetName(g.name) && !OTHER_LINE.test(g.name)).map((g) => profileOf(`máy phát ${[g.maker, g.origin].join(" ").replace(/\s+/g, " ")}`, g.code).group).filter(Boolean);
    return gs.length && gs.every((g) => g === gs[0]) ? gs[0] : null;
  }
  // How alike the configurations two texts ask for are: what both name, what only one names; sim 0..1, null when neither
  // names anything.
  function compareCfg(a, b) {
    const same = a.tags.filter((x) => b.tags.includes(x)), only = a.tags.filter((x) => !b.tags.includes(x)), other = b.tags.filter((x) => !a.tags.includes(x));
    const n = same.length + 0.5 * (only.length + other.length);
    return { sim: n ? same.length / n : null, same, diff: [...only.map((x) => `chỉ gói này: ${x}`), ...other.map((x) => `chỉ gói kia: ${x}`)] };
  }

  const MAX = 80, POWER_TOL = 0.05, LEVELS = ["same", "close", "different", "unknown"];
  const cut = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n) + "…" : s; };
  // The decided lots most like the tender, for the agent to compare. t: { notifyNo, bidName, investorName, cfgText (what
  // its HSMT asks for), engine ({ make, model } of the configuration Gợi ý cấu hình put first) }, docs: { <TBMT>: bidhist
  // document }, K: kVA, P: package price. Ranked by power, package price and how alike the configuration asked for is
  // (not by bid form or age, Khoa 2026-11-03). A lot whose winning engine (else what its HSMT asks for) is of the other
  // origin group than the engine to be offered (else than this HSMT asks for) is left out: a Chinese set is not priced
  // from Cummins lots. Only lots that supply a generator set (same kind as
  // the tender), with a winner and a price. When K is known, only lots whose power is known and within 5% of K
  // (Khoa, 2026-11-03); when it is not, a lot whose power is not known stays only when it says something about its goods
  // (won goods or the HSMT's lines), so the agent can tell what it was (a lot with nothing about its configuration
  // cannot set the price).
  function candidates(t, docs, K, P) {
    const kind = bidKind(t.bidName), out = [], tp = profileOf(`${t.bidName || ""}\n${t.cfgText || ""}`);
    const eg = t.engine && root.GenbidCatalog ? root.GenbidCatalog.originIn(t.engine.make || "", t.engine.model || "") : null;
    const tGroup = eg === "cn" ? "cn" : eg === "other" ? "foreign" : tp.group;
    let total = 0, otherGroup = 0;
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
        // A name that does not say so, but an HSMT that moves an owned set and no set among the won goods: a move.
        if (kind === "supply" && movesOldSet(d.config?.text) && !goods.some((g) => isGensetName(g.name))) continue;
        const kGoods = Math.max(0, ...goods.map((g) => kvaOf([g.name, g.code, g.desc].join(" ")) || 0)) || null;
        const kName = kvaOf(lot.lotName) || (multi ? null : kvaOf(d.bidName)), kCfg = kName || kGoods ? null : cfgKva(d, multi);
        const k = kName || kGoods || kCfg, kSrc = kName ? "tên gói" : kGoods ? "hàng chào" : kCfg ? "HSMT" : "";
        if (K && !(k && Math.abs(k - K) <= POWER_TOL * K + 1e-9)) continue;
        if (!k && !goods.length && !d.config?.text) continue;
        const lp = profileOf([(multi && lot.lotName) || d.bidName, d.config?.text, ...goods.map((g) => [g.name, g.maker, g.code, g.origin, g.desc].join(" "))].join("\n"));
        const group = goodsGroup(goods) || profileOf(d.config?.text).group;
        if (tGroup && group && group !== tGroup) { otherGroup++; continue; }
        // A lot that names nothing to compare counts as half alike.
        const cfg = compareCfg(tp, lp), dist = (K && k ? Math.abs(Math.log(K / k)) : 0.7) + (P ? 0.5 * Math.abs(Math.log(P / price)) : 0)
          + (cfg.sim == null ? 0.5 : 1 - cfg.sim) - (tGroup && group === tGroup ? 0.3 : 0) - (t.investorName && d.investorName === t.investorName ? 0.3 : 0);
        out.push({
          key, lotNo: lot.lotNo || "", name: d.bidName || "", lotName: multi ? lot.lotName || "" : "", investor: d.investorName || "", location: d.location || "",
          bidForm: d.bidForm || "", at: d.openedAt || d.bidCloseDate || "", url: d.url || "", price, wp, ratio, winner: w.name || "", k, kSrc, dist,
          goods: goods.slice(0, 8).map((g) => ({ name: cut(g.name, 300), maker: g.maker || g.label || "", code: g.code || "", origin: g.origin || "", qty: g.qty ?? null, unitPrice: g.unitPrice ?? null, desc: cut(g.desc, 200) })),
          cfgText: cut(d.config?.text, 3000),
          bidders: (lot.bidders || []).map((b) => ({ name: b.name || "", tax: String(b.taxCode || "").replace(/\D/g, ""), price: bdPrice(b) ?? null, won: !!b.won })),
          group, cfg: { sim: cfg.sim == null ? null : Math.round(cfg.sim * 100) / 100, same: cfg.same, diff: cfg.diff },
        });
      }
    }
    out.sort((a, b) => a.dist - b.dist);
    return { total, group: tGroup, otherGroup, list: out.slice(0, MAX).map((s, i) => ({ id: "S" + (i + 1), ...s })) };
  }
  // The code's comparison of one lot with the tender, shown to the agent beside the lot. Not part of sampleText: the
  // agent's quote must come from muasamcong's own words.
  function cfgLine(s) {
    const c = s.cfg || {};
    return `So cấu hình (code): nhóm xuất xứ động cơ ${s.group ? GROUP[s.group] : "không rõ"}${c.sim == null ? "; không gói nào nêu hãng hay hạng mục để so"
      : `; giống ${Math.round(100 * c.sim)}%${c.same.length ? ` (cùng: ${c.same.join(", ")})` : ""}${c.diff.length ? `; khác: ${c.diff.join(", ")}` : ""}`}`;
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
  root.GenbidBidprice = { kvaOf, capPick, isGensetName, bidKind, movesOldSet, cfgKva, taxKey, bdPrice, profileOf, goodsGroup, compareCfg, candidates, sampleText, cfgLine, suggest, GROUP, LEVELS, MAX, POWER_TOL };
})(typeof window !== "undefined" ? window : globalThis);
