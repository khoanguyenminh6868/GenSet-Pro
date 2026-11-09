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
  // The rating a power figure is given at (2026-11-06 audit: the name of a tender gives the prime power, its HSMT often the
  // standby one too, 10% apart, so 144 of 326 past tenders read 5–15% apart from their own HSMT): the words of prime or
  // standby in the same clause as the figure ("500 kVA liên tục; 550 kVA dự phòng", "Công suất định mức (Standby) 2500kVA").
  const PRIME_RE = /li[êe]n\s*t[ụu]c|\bprime\b|\bPRP\b|\bCOP\b|continuous|c[ơo]\s*b[ảa]n/i, STANDBY_RE = /d[ựu]\s*ph[òo]ng|\bstandby\b|\bESP\b|emergency|kh[ẩa]n\s*c[ấa]p/i;
  const ratingIn = (s) => { const p = PRIME_RE.test(s), b = STANDBY_RE.test(s); return p === b ? null : p ? "prime" : "standby"; };
  const numOf = (m) => Number(m[1].replace(/\.(?=\d{3}\b)/, "").replace(",", "."));
  function kvaRated(text) {
    const t = String(text || "").normalize("NFC"), ms = [...t.matchAll(/(\d+(?:[.,]\d+)?)\s*(kva|kw)\b/gi)], m = capPick(t, ms);
    if (!m) return null;
    const v = numOf(m);
    if (!(v > 0)) return null;
    const before = t.slice(Math.max(0, m.index - 60), m.index).split(/[;\n(]|,(?!\d)/).pop(), after = t.slice(m.index + m[0].length, m.index + m[0].length + 40).split(/[;\n)]|,(?!\d)/)[0];
    return { kva: /kw/i.test(m[2]) ? v / 0.8 : v, rating: ratingIn(`${before} ${after}`) };
  }
  const ratingOf = (text) => kvaRated(text)?.rating || null;
  // Standby is about 10% above prime (ISO 8528: the usual pairs 400/440, 500/550 kVA).
  const STANDBY_FACTOR = 1.1;
  // The readings of a lot's power k that may compare with the tender's K: when both ratings are known, k at K's rating;
  // when only K's is, k itself or k taken as the other rating (a lot named 440 kVA may be the standby figure of this
  // tender's 400 kVA prime set); when only k's is, k itself or K taken as the other rating (k moved the opposite way);
  // when neither is (two names), k alone, as names follow one convention.
  // nearest: the reading closest to K; powerMatch: that reading within tol of K.
  const toRating = (k, from, to) => (from === to ? k : to === "prime" ? k / STANDBY_FACTOR : k * STANDBY_FACTOR);
  const readings = (rK, k, rk) => (rK && rk ? [toRating(k, rk, rK)] : rK ? [k, toRating(k, rK === "prime" ? "standby" : "prime", rK)] : rk ? [k, toRating(k, rk, rk === "prime" ? "standby" : "prime")] : [k]);
  const nearest = (K, rK, k, rk) => readings(rK, k, rk).sort((a, b) => Math.abs(Math.log(a / K)) - Math.abs(Math.log(b / K)))[0];
  const powerMatch = (K, rK, k, rk, tol) => !!(K > 0 && k > 0) && Math.abs(nearest(K, rK, k, rk) - K) <= tol * K + 1e-9;
  // How many sets a lot buys: the quantity of its won generator sets, else the name ("Mua 20 bộ máy phát điện", "2 x 250 kVA"), else one.
  const UNIT_RE = /(\d{1,3})\s*(?:bộ|máy|tổ\s*máy|chiếc|cái)(?!\p{L})/iu, X_RE = /(\d{1,3})\s*[x×]\s*\d/i;
  function unitsOf(name, goods = []) {
    const q = Math.max(0, ...goods.filter((g) => isGensetName(g.name)).map((g) => Number(g.qty) || 0));
    if (q >= 1) return q;
    const n = String(name || "").normalize("NFC"), m = n.match(UNIT_RE) || n.match(X_RE);
    return m && Number(m[1]) >= 1 ? Number(m[1]) : 1;
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
  // The same with its rating: the sets the specs wrote (config.sets: qty, primeKva, standbyKva...), else the clause of
  // config.text that names prime (else standby) with a figure, else cfgKva with no rating. → { kva, rating } or null.
  function cfgPower(d, multi) {
    const one = (xs) => (xs.length && (!multi || new Set(xs).size === 1) ? Math.max(...xs) : null);
    const sets = (d?.config?.sets || []).filter((s) => s && typeof s === "object");
    const sk = (s, u) => (Number(s[u + "Kva"]) > 0 ? Number(s[u + "Kva"]) : Number(s[u + "Kw"]) > 0 ? Number(s[u + "Kw"]) / 0.8 : null);
    for (const r of ["prime", "standby"]) { const v = one(sets.map((s) => sk(s, r)).filter(Boolean)); if (v) return { kva: v, rating: r }; }
    const found = { prime: [], standby: [] };
    for (const l of String(d?.config?.text || "").normalize("NFC").split(/\n/)) {
      // An engine's own output ("Động cơ: công suất liên tục ≥ 320 kW") is not the set's.
      if (/động\s*cơ|engine/i.test(l) && !/máy\s*phát|tổ\s*máy|genset/i.test(l)) continue;
      for (const cl of l.split(/;|,(?!\d)/)) {
        const m = cl.match(/(\d+(?:[.,]\d+)?)\s*(kva|kw)\b/i), r = m && ratingIn(cl), v = m && numOf(m);
        if (r && v > 0) found[r].push(/kw/i.test(m[2]) ? v / 0.8 : v);
      }
    }
    for (const r of ["prime", "standby"]) { const v = one(found[r]); if (v) return { kva: v, rating: r }; }
    const v = cfgKva(d, multi);
    return v ? { kva: v, rating: null } : null;
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
  // "Đồng bộ thương hiệu" (Khoa, 2026-11-06, IB2600594596): the HSMT asks that the engine, the alternator and / or the
  // controller be made by the genset's own maker ("Tổ máy phải được đồng bộ 02 trong 03 bộ phận chính (động cơ, đầu
  // phát, bộ điều khiển) bởi nhà sản xuất máy phát điện", "động cơ, đầu phát, bảng điều khiển ... cùng một nhà sản
  // xuất", "Tổ máy phát điện, đầu phát điện và động cơ có cùng thương hiệu"). A set assembled from an engine, an
  // alternator and a controller of three makers fails it, and such a set is priced far above a Chinese-assembled one.
  // → { need, parts: ["engine", "alternator", "controller"], quote (one line of the text, word for word) } or null.
  // Not: "hòa đồng bộ", an ATS "đấu nối đồng bộ", "đồng bộ theo tiêu chuẩn của nhà sản xuất" (no maker named), a
  // battery charger or a tank "cùng thương hiệu với máy phát", "đồng bộ, mới 100%".
  const SYNC_PARTS = [["engine", /động\s*cơ|\bengine/i], ["alternator", /đầu\s*phát|củ\s*phát|\balternator/i], ["controller", /(bộ|bảng|hệ\s*thống|tủ|màn\s*hình)\s*(giám\s*sát\s*)?(điều\s*khiển|đk)|,\s*điều\s*khiển|\bcontroller|control\s*panel/i]];
  const SYNC_N = /đồng\s*bộ\s*(0?[123]|hai|ba)\s*(trong|\/|trên)\s*(0?3|ba)\b/i;
  const SYNC_SAME = /cùng\s*(một\s*)?(hãng|thương\s*hiệu|nhãn\s*hiệu|nhà\s*sản\s*xuất)|(từ|bởi)\s*(cùng\s*)?(một|01|1)\s*(hãng|nhà\s*sản\s*xuất)|đồng\s*bộ\s*(chính\s*hãng|thương\s*hiệu|(từ|bởi)\s*(chính\s*)?(hãng|nhà\s*sản\s*xuất))/i;
  // "trong đó 2 trong 3 bộ phận ... cùng một hãng", "2 trong 3 bộ phần chính ... cùng thương hiệu": the count without "đồng bộ" before it.
  const SYNC_COUNT = /(^|[^\d])(0?2|hai)\s*(trong|\/|trên)\s*(0?3|ba)\s*(bộ\s*ph|thành\s*ph|\()/i;
  const SYNC_NOT = /chịu\s*trách\s*nhiệm|h[oò][àa]\s*đồng\s*bộ|\bATS\b|đấu\s*nối|vật\s*liệu|bộ\s*sạc|sạc\s*ắc|bồn|téc|phụ\s*tùng|hiện\s*hữu/i;
  const NUM = { hai: 2, ba: 3 };
  function brandSyncOf(text) {
    const lines = String(text || "").normalize("NFC").split(/\n/), flat = (a, b) => lines.slice(Math.max(0, a), b).join(" ").replace(/\s+/g, " ");
    for (let i = 0; i < lines.length; i++) {
      // A clause may run over the next line (two-column tables of the HSMT): the trigger must start on this one.
      const here = flat(i, i + 1), two = flat(i, i + 2);
      for (const re of [SYNC_N, SYNC_SAME]) {
        const m = two.match(re);
        if (!m || m.index >= here.length) continue;
        const win = flat(i - 1, i + 4), at = win.indexOf(m[0]);
        // The sentence the trigger is in: from the bullet / full stop before it to the full stop after it.
        const from = Math.max(win.lastIndexOf(". ", at), win.lastIndexOf(" - ", at), win.lastIndexOf(": ", at) - 120, at - 220, 0);
        const stop = win.indexOf(". ", at + m[0].length), seg = win.slice(from, stop < 0 ? at + 260 : Math.min(stop, at + 260));
        const near = win.slice(Math.max(0, at - 60), at + m[0].length + 60);
        if (SYNC_NOT.test(near)) continue;
        let parts = SYNC_PARTS.filter(([, r]) => r.test(seg)).map(([p]) => p), need;
        if (re === SYNC_N) {
          need = Number(NUM[m[1].toLowerCase()] || m[1]);
          const after = win.slice(at, at + 200), named = SYNC_PARTS.filter(([, r]) => r.test(after)).map(([p]) => p);
          parts = named.length >= need ? named : ["engine", "alternator", "controller"];
          if (need < 2) continue;
        } else {
          if (parts.length < 2) continue;
          need = SYNC_COUNT.test(seg) ? 2 : parts.length;
        }
        const quote = lines[i].trim();
        if (quote.length < 8) continue;
        return { need: Math.min(need, parts.length), parts, quote, text: seg.trim().slice(0, 400) };
      }
    }
    return null;
  }
  // The maker family of a make or model named in a text: a genset maker's alternators and controllers carry its own
  // brand or one of its group (Stamford / AvK and PowerCommand are Cummins; Perkins, FG Wilson, Olympian and EMCP are
  // Caterpillar; SDMO and Decision-Maker are Kohler / Rehlko). null when no make is named.
  const FAMILY = [
    ["Cummins", /cummins|stamford|\bavk\b|power\s*command|\bDCEC\b|\bCCEC\b|康明斯|斯坦福/i], ["Caterpillar", /caterpillar|\bcat\b|perkins|fg\s*wilson|olympian|\bemcp\b|卡特|珀金斯/i],
    ["Kohler", /kohler|rehlko|\bsdmo\b|decision[\s-]*maker|^\s*APM\s?\d{3}|^\s*KH\d{4,5}|科勒/i], ["MTU", /\bmtu\b|rolls[\s-]*royce/i], ["Mitsubishi", /mitsubishi|三菱/i],
    ["Denyo", /denyo/i], ["Doosan", /doosan|斗山/i], ["Volvo Penta", /volvo/i], ["Weichai", /weichai|潍柴/i], ["Yuchai", /yuchai|玉柴/i],
    ["SDEC", /\bsdec\b|shangchai|上柴/i], ["Leroy-Somer", /leroy[\s-]*somer|\bleroy\b/i], ["Mecc Alte", /mecc[\s-]*alte|meccalte/i],
    ["Marathon", /marathon/i], ["Engga", /engga/i], ["Nianfeng", /nianfeng|^\s*NFS?\d/i], ["Bobig", /bobig|^\s*BW-?\d/i], ["Jet-Power", /jet[\s-]*power|^\s*JET\d/i],
    ["Wintpower", /wintpower|^\s*WT\d/i], ["Deep Sea", /deep\s*-?sea|\bDSE\s?\d/i], ["SmartGen", /smart\s*gen|\bHGM\s?\d/i], ["ComAp", /comap|inteli\s?(lite|gen|sys|compact)|\b(AMF|MRS)\s?\d/i],
    ["DEIF", /\bdeif\b/i], ["Datakom", /datakom|\bDKG/i], ["Woodward", /woodward|easy\s?gen/i], ["Harsen", /harsen/i], ["Mebay", /mebay/i], ["Lixise", /lixise/i], ["Emko", /emko/i],
  ];
  const familyOf = (...texts) => {
    for (const t of texts) { const s = String(t || ""); if (!s.trim()) continue; const f = FAMILY.find(([, re]) => re.test(s)); if (f) return f[0]; }
    const C = root.GenbidCatalog, s = texts.join(" ");
    const b = C && [...C.ENGINE_BRANDS, ...C.ALT_BRANDS].find(([re]) => re.test(s));
    return b ? b[1] : null;
  };
  function profileOf(text, model = "") {
    const t = String(text || "").normalize("NFC"), C = root.GenbidCatalog, tags = [];
    const named = (list) => (list || []).filter(([re]) => re.test(t)).map(([, n]) => n);
    const engines = C ? named(C.ENGINE_BRANDS) : [];
    for (const n of engines) tags.push(`động cơ ${n}`);
    if (C) for (const n of named(C.ALT_BRANDS)) tags.push(`đầu phát ${n}`);
    if (C) for (const c of C.CONTROLLERS) if (c.word.test(t)) tags.push(`bộ điều khiển ${c.brand}`);
    for (const [n, re] of SCOPE) if (re.test(t)) tags.push(n);
    // An HSMT that wants the engine / alternator / controller of the genset's own maker (Khoa, 2026-11-06): an OEM set.
    if (brandSyncOf(t)) tags.push(SYNC_TAG);
    // A model code with no make named ("WP13D385E200"): its make by catalog.js. Countries count only on the lines about the
    // engine or the set: a cable from Korea or a Deep Sea controller from the UK says nothing of the engine.
    const o = C && model ? C.originIn(t, model) : null, eng = t.split(/\n/).filter((l) => ENGINE_LINE.test(l) && !OTHER_LINE.test(l)).join("\n");
    // The make's group and the place of manufacture apart (2026-11-06 audit): "Cummins, xuất xứ Trung Quốc" is a foreign
    // make made in China (cnmade), priced between a Chinese make and a Cummins made abroad; the agent had to say so by
    // hand in 4 of 9 runs when the code called it foreign.
    const brFr = engines.some((n) => C.FOREIGN_ENGINE.has(n)) || o === "other", brCn = engines.some((n) => !C.FOREIGN_ENGINE.has(n)) || o === "cn";
    const place = placeOf(eng);
    return { group: brFr && brCn ? null : brFr ? (place === "cn" ? "cnmade" : "foreign") : brCn ? "cn" : place, place, tags };
  }
  const SYNC_TAG = "đồng bộ thương hiệu";
  const ENGINE_LINE = /động\s*cơ|engine|tổ\s*máy|máy\s*phát|genset/i, OTHER_LINE = /\bcáp\b|dây\s*(cáp|điện|tín)|\bATS\b|\btủ\b|bộ\s*điều\s*khiển|controller|đầu\s*phát|alternator|biến\s*áp/i;
  // Where a set or engine is made, from the words of a text: China (the country, or a Chinese plant of a foreign make:
  // DCEC / CCEC Cummins, Perkins Wuxi, MTU Yuchai, Shanghai MHI), another country, or not said.
  const CN_MADE = /\bDCEC\b|\bCCEC\b|dongfeng|chongqing|\bwuxi\b|mtu\s*yuchai|shanghai\s*(diesel|mhi)|lắp\s*ráp\s*tại\s*trung|sản\s*xuất\s*tại\s*trung|made\s*in\s*china/i;
  const placeOf = (s) => (CN_WORD.test(String(s || "")) || CN_MADE.test(String(s || "")) ? "cn" : FOREIGN_WORD.test(String(s || "")) ? "foreign" : null);
  const GROUP = { cn: "Trung Quốc", cnmade: "hãng ngoài Trung Quốc, sản xuất tại Trung Quốc", foreign: "ngoài Trung Quốc" };
  // Groups that cannot price each other: a Chinese make against a foreign make made abroad; cnmade compares with both.
  const conflict = (a, b) => !!a && !!b && a !== b && a !== "cnmade" && b !== "cnmade";
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

  // A tender that asks for đồng bộ thương hiệu: 10% (Khoa, 2026-11-06), as few past lots asked for an OEM set.
  const MAX = 80, POWER_TOL = 0.05, SYNC_POWER_TOL = 0.1, WIDE_TOL = 0.15, LEVELS = ["same", "close", "different", "unknown"];
  const cut = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n) + "…" : s; };
  // The first n characters of an HSMT's lines, then, up to 2n, the later lines that decide the comparison (make, origin,
  // scope, quantity, power): 803 of 1,250 past tenders' config.text ran past the 3,000 characters the agent was shown.
  const KEY_LINE = /h[ãa]ng|xu[ấa]t\s*x[ứu]|origin|\bATS\b|c[áa]ch\s*[âa]m|b[ồo]n|đ[ồo]ng\s*b[ộo]|s[ốo]\s*l[ưu][ợo]ng|li[êe]n\s*t[ụu]c|d[ựu]\s*ph[òo]ng|prime|standby|đ[ộo]ng\s*c[ơo]|đ[ầa]u\s*ph[áa]t|đi[ềe]u\s*khi[ểe]n|bi[ếe]n\s*[áa]p|l[ắa]p\s*đ[ặa]t|\bc[áa]p\b|trung\s*qu[ốo]c|\bG7\b|nh[ậa]p\s*kh[ẩa]u/i;
  function keyText(text, n) {
    const s = String(text || "").trim();
    if (s.length <= n) return s;
    let out = s.slice(0, n).replace(/[^\n]*$/, "").replace(/\n$/, "");
    for (const l of s.slice(out.length).split("\n")) { if (!KEY_LINE.test(l)) continue; if (out.length + l.length + 1 > 2 * n) break; out += "\n" + l.trim(); }
    return out + "\n…";
  }
  // A won generator set's "Cấu hình, tính năng kỹ thuật cơ bản" (bidhist goods.desc, up to 8,000 characters since
  // 2026-11-07; one line, clauses "* Thông số chung về Động cơ Model: … Hãng sản xuất: …" and "- …"): the clauses that
  // name the engine, alternator, controller, makes, origin, power and scope, in order, up to n characters (was the
  // first 200, which left out every component). Other goods: their first 200 characters.
  const DESC_KEY = new RegExp(KEY_LINE.source + "|model|nh[ãa]n\\s*hi[ệe]u|k[ýy]\\s*(m[ãa]\\s*)?hi[ệe]u|c[ôo]ng\\s*su[ấa]t|kva|\\bkw\\b|ti[êe]u\\s*hao|v[ỏo]\\s*(ch[ốo]ng\\s*[ồo]n|c[áa]ch)|alternator|engine|controller", "i");
  // A goods row that is a generator set: its name says so, or names a power (an old-form row "- Công suất dài hạn:
  // 240 kW / 300 kVA ..." under a heading row "Máy phát điện 300 KVA và phụ kiện:").
  const isSetRow = (g) => isGensetName(g.name) || !!kvaOf(g.name);
  function goodsDesc(desc, n) {
    const s = cut(desc, 1e6);
    if (s.length <= n) return s;
    const parts = s.split(/\s+(?=\*\s|-\s)/);
    let out = "";
    for (const [i, p] of parts.entries()) {
      if (i && !DESC_KEY.test(p)) continue;
      // The start of each clause, where its model and make are written; one that no longer fits is skipped, so the
      // controller after a long engine clause still gets in.
      const add = cut(p, 450);
      if (out && out.length + add.length + 1 > n) continue;
      out += (out ? " " : "") + add;
    }
    return cut(out, n) + (out.length < s.length ? " …" : "");
  }
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
  // t.rating: the rating K is given at (prime / standby / null); t.place: "cn" when the engine to be offered is made in
  // China (the configuration's supplier is based there). prior: the competed lots of the same size (±15%) and not of the
  // other group that are not in the list, for suggest to lean on when few lots are alike.
  function candidates(t, docs, K, P) {
    const kind = bidKind(t.bidName), out = [], prior = [], tp = profileOf(`${t.bidName || ""}\n${t.cfgText || ""}`);
    if (t.sync && !tp.tags.includes(SYNC_TAG)) tp.tags.push(SYNC_TAG);
    const tol = tp.tags.includes(SYNC_TAG) ? SYNC_POWER_TOL : POWER_TOL, rK = t.rating || null;
    const eg = t.engine && root.GenbidCatalog ? root.GenbidCatalog.originIn(t.engine.make || "", t.engine.model || "") : null;
    const place = t.place || (t.engine && placeOf(`${t.engine.make || ""} ${t.engine.model || ""}`)) || tp.place || null;
    const tGroup = eg === "cn" ? "cn" : eg === "other" ? (place === "cn" ? "cnmade" : "foreign") : tp.group;
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
        const nameOf = (multi && lot.lotName) || (multi ? "" : d.bidName);
        const kName = kvaOf(lot.lotName) || (multi ? null : kvaOf(d.bidName)), kCfg = kName || kGoods ? null : cfgPower(d, multi);
        const k = kName || kGoods || kCfg?.kva || null, kSrc = kName ? "tên gói" : kGoods ? "hàng chào" : kCfg ? "HSMT" : "";
        const rk = kName ? ratingOf(nameOf) : kGoods ? null : kCfg?.rating || null, nb = (lot.bidders || []).length;
        const units = unitsOf(nameOf, goods), group = goodsGroup(goods) || profileOf(d.config?.text).group;
        // The reading of k that compares with K (k itself when the ratings are known or the same size).
        const kEq = K && k ? nearest(K, rK, k, rk) : k;
        if (K && !powerMatch(K, rK, k, rk, tol)) {
          if (k && nb >= 2 && !conflict(tGroup, group) && Math.abs(Math.log(kEq / K)) <= Math.log(1 + WIDE_TOL)) prior.push({ key, lotNo: lot.lotNo || "", name: d.bidName || "", k, kEq, ratio, nb, price, wp, group, units });
          continue;
        }
        if (!k && !goods.length && !d.config?.text) continue;
        const lp = profileOf([(multi && lot.lotName) || d.bidName, d.config?.text, ...goods.map((g) => [g.name, g.maker, g.code, g.origin, g.desc].join(" "))].join("\n"));
        if (conflict(tGroup, group)) { otherGroup++; continue; }
        const shifted = k && kEq && Math.abs(kEq - k) > 1e-6;
        // A lot that names nothing to compare counts as half alike.
        const cfg = compareCfg(tp, lp), dist = (K && kEq ? Math.abs(Math.log(K / kEq)) : 0.7) + (P ? 0.5 * Math.abs(Math.log(P / price)) : 0)
          + (cfg.sim == null ? 0.5 : 1 - cfg.sim)
          // A tender that asks for an OEM set (đồng bộ thương hiệu) is priced from lots that asked for one too (Khoa,
          // 2026-11-06: a set assembled from three makes wins far lower).
          + (tp.tags.includes(SYNC_TAG) && !lp.tags.includes(SYNC_TAG) ? 0.6 : 0) - (tGroup && group === tGroup ? 0.3 : 0) - (t.investorName && d.investorName === t.investorName ? 0.3 : 0)
          // A lot that matches only when read at the other rating ranks after one of the same figure.
          + (shifted ? 0.25 : 0);
        out.push({
          key, lotNo: lot.lotNo || "", name: d.bidName || "", lotName: multi ? lot.lotName || "" : "", investor: d.investorName || "", location: d.location || "",
          bidForm: d.bidForm || "", at: d.openedAt || d.bidCloseDate || "", url: d.url || "", price, wp, ratio, winner: w.name || "", k, kSrc, kRating: rk, dist, units,
          kNote: shifted ? (kEq < k ? `có thể là mức dự phòng của máy ${Math.round(kEq)} kVA liên tục` : `có thể là mức liên tục của máy ${Math.round(kEq)} kVA dự phòng`) : "",
          // The generator sets first (a heading row or ten cables before them used to push them past the 8 kept), their
          // name and configuration at length (an old-form row puts the whole configuration in its name).
          goods: [...goods.filter(isSetRow), ...goods.filter((g) => !isSetRow(g))].slice(0, 10).map((g) => {
            const set = isSetRow(g);
            return { name: cut(g.name, set ? 1500 : 300), maker: g.maker || g.label || "", code: g.code || "", origin: g.origin || "", qty: g.qty ?? null, unit: g.unit || "", unitPrice: g.unitPrice ?? null, desc: set ? goodsDesc(g.desc, 2500) : cut(g.desc, 200) };
          }),
          cfgText: keyText(d.config?.text, 3000),
          bidders: (lot.bidders || []).map((b) => ({ name: b.name || "", tax: String(b.taxCode || "").replace(/\D/g, ""), price: bdPrice(b) ?? null, won: !!b.won })),
          group, cfg: { sim: cfg.sim == null ? null : Math.round(cfg.sim * 100) / 100, same: cfg.same, diff: cfg.diff },
        });
      }
    }
    out.sort((a, b) => a.dist - b.dist);
    prior.sort((a, b) => Math.abs(Math.log(a.kEq / K)) - Math.abs(Math.log(b.kEq / K)));
    return { total, tol, group: tGroup, rating: rK, place, otherGroup, list: out.slice(0, MAX).map((s, i) => ({ id: "S" + (i + 1), ...s })), prior: prior.slice(0, 150) };
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
      s.k ? `Công suất (code đọc từ ${s.kSrc}${s.kRating ? `, mức ${s.kRating === "prime" ? "liên tục" : "dự phòng"}` : ""}): ${Math.round(s.k)} kVA${s.kNote ? ` (${s.kNote})` : ""}` : "Công suất: không rõ",
      s.units > 1 ? `Số máy (code đọc): ${s.units}` : "",
      `Số nhà thầu: ${s.bidders.length}`,
      ...(s.goods.length ? ["Hàng hoá trúng thầu:", ...s.goods.map((g) => `- ${[g.name, g.maker && `hãng ${g.maker}`, g.code && `model ${g.code}`, g.origin && `xuất xứ ${g.origin}`, g.qty != null && `số lượng ${g.qty}${g.unit ? " " + g.unit : ""}`, g.unitPrice && `đơn giá ${n(g.unitPrice)} đ`, g.desc].filter(Boolean).join(" | ")}`)] : ["Hàng hoá trúng thầu: không ghi"]),
      s.cfgText ? `Trích HSMT:\n${s.cfgText}` : "",
    ].filter(Boolean).join("\n");
  }
  const quantile = (xs, p) => { const a = [...xs].sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(p * (a.length - 1)))] : null; };
  const median = (xs) => quantile(xs, 0.5);
  // Prices from the lots the agent found alike. Only lots with two or more bidders: a lone bidder's price was never
  // competed against (IB2500514971: one bidder, 99,9% of the lot price). "same" alone when there are 5 of them, else
  // "same" and "close"; under 3 lots no price is suggested. Each level's chance is the share of those lots whose
  // winning price was at least that price, over the lot price.
  // Under 5 alike lots, the competed lots of the same size and group the agent was not asked about (candidates' prior)
  // back them up, so three or four lots do not set the price alone (2026-11-06 audit: 3 of 9 runs had too few, the rest
  // 1–9). The winning share falls with the number of bidders (2 bidders: median 98% of the lot price; 6 or more: 79%),
  // so the lots' bidder counts and the share at 2–3 against 4+ bidders are given too.
  const nbOf = (s) => (Array.isArray(s.bidders) ? s.bidders.length : Number(s.nb) || 0);
  function suggest(samples, P, K, prior = []) {
    const ok = (s) => !s.unverified && nbOf(s) >= 2;
    const same = samples.filter((s) => s.level === "same" && ok(s)), close = samples.filter((s) => s.level === "close" && ok(s));
    const use = same.length >= 5 ? same : [...same, ...close], basis = same.length >= 5 ? "same" : "same+close";
    const have = new Set(use.map((s) => `${s.key}|${s.lotNo}`));
    const extra = use.length >= 5 ? [] : prior.filter((p) => ok(p) && !have.has(`${p.key}|${p.lotNo}`));
    const pool = [...use, ...extra];
    const ratios = pool.map((s) => s.ratio), round = (v) => Math.round(v / 1000) * 1000;
    const chance = (r) => (pool.length ? pool.filter((s) => s.ratio >= r - 1e-9).length / pool.length : 0);
    const levels = pool.length >= 3 && P > 0 ? [["low", "Cạnh tranh", 0.25], ["mid", "Trung vị", 0.5], ["high", "Cao", 0.75]].map(([id, label, p]) => {
      const r = quantile(ratios, p);
      return { id, label, ratio: r, price: round(P * r), chance: chance(r) };
    }) : [];
    // The winning price of one set per kVA: a lot of 20 sets is divided by its 20 sets (units).
    const perSet = (s) => (s.k ? s.wp / (s.k * (s.units || 1)) : null);
    const withK = pool.filter((s) => perSet(s)), perKva = K && withK.length >= 3 ? median(withK.map(perSet)) : null;
    const nbs = pool.map(nbOf), bidders = pool.length ? { n: pool.length, median: median(nbs), min: Math.min(...nbs), max: Math.max(...nbs) } : null;
    const byBidders = [["2–3 nhà thầu", (n) => n <= 3], ["từ 4 nhà thầu", (n) => n >= 4]].map(([label, f]) => { const xs = pool.filter((s) => f(nbOf(s))).map((s) => s.ratio); return { label, n: xs.length, ratio: median(xs) }; }).filter((x) => x.n);
    const comp = new Map();
    for (const s of use) for (const b of s.bidders) {
      const id = b.tax || b.name.trim().toUpperCase();
      if (!id) continue;
      const c = comp.get(id) || { id, name: b.name, n: 0, wins: 0, ratios: [] };
      c.n++; if (b.won) c.wins++; if (b.price > 0) c.ratios.push(b.price / s.price);
      comp.set(id, c);
    }
    const comps = [...comp.values()].sort((a, b) => b.n - a.n || b.wins - a.wins).slice(0, 8).map((c) => ({ id: c.id, name: c.name, n: c.n, wins: c.wins, ratio: median(c.ratios) }));
    return { basis, n: use.length, same: same.length, close: close.length, nPrior: extra.length, pool: pool.length, enough: pool.length >= 5, levels, perKva: perKva && { value: round(perKva), price: round(perKva * K), n: withK.length }, bidders, byBidders, comps };
  }
  // Hàng trúng thầu của nhà cung cấp (Khoa, 2026-11-09: lọc "Có hàng trúng thầu" ở màn Nhà cung cấp). Chỉ gói mua sắm
  // (bidKind supply) đã có nhà thầu trúng, chỉ dòng hàng là tổ máy (không phải lọc, phụ tùng, tủ ATS bán riêng). Một nhà
  // cung cấp khớp khi dòng hàng ghi:
  // - thương hiệu của nó (names.brands; đại lý không tính thương hiệu hãng họ bán), hoặc
  // - từ đặc trưng đầu tiên trong tên tiếng Anh (bỏ tên tỉnh / thành phố, từ chung như Power, Generator, Co):
  //   "Zhejiang Kachai Generator Co., Ltd" → Kachai; chỉ khi không nhà cung cấp nào nhận từ đó là thương hiệu.
  // Từ ≤ 3 ký tự phải viết hoa đúng như thế (MTU, AGG, FPT; không lấy "man" trong "Auto - Off - Man").
  // where: "set" = hãng / nhãn hiệu / tên / mã của tổ máy; "cfg" = trong cấu hình (động cơ, đầu phát, bộ điều khiển).
  const WON_STOP = new Set(("co ltd limited company corp corporation inc group holdings holding the and of china chinese power powers generator generators generating generation genset gensets electric electrical electro electronics electromechanical mechanical machinery machine machines technology technologies tech equipment equipments engine engines diesel motor motors industry industrial industries international energy new trading import export system systems science products product petroleum kinetic innovation development city province engineering works plant joint venture investment dealer parts component components sets set solutions solution services service manufacturing manufacture factory branch excel perfect house global general standard smart green blue gold golden star great king top best united asia pacific world heavy intelligent plus multi union supply alternator alternators gmbh construction precision automation control controls sales m&e").split(" "));
  const WON_PLACE = new Set(("beijing shanghai tianjin chongqing guangdong guangzhou shenzhen fujian fuzhou xiamen jiangsu zhejiang shandong weifang hubei hunan sichuan anhui henan hebei shaanxi shanxi yunnan guizhou guangxi hainan jiangxi liaoning jilin heilongjiang xinjiang tibet ningxia qinghai gansu inner mongolia hong kong taiwan wuxi suzhou nanjing yangzhou changzhou taizhou ningbo hangzhou fuan ningde quanzhou jinan qingdao yantai xian wuhan changsha hefei nanning liuzhou zhengzhou yinchuan zhanjiang foshan dongguan zhenjiang nantong xuzhou yulin lanxi jiangyin urumqi xining guiyang chengdu shaoxing wenzhou jinhua linyi zibo taian").split(" "));
  const SET_ROW = /m[áa]y\s*ph[áa]t|t[ổo]\s*m[áa]y|genset|generat(or|ing\s*set)|m[áa]y\s*n[ổo]/i;
  const PART_ROW = /l[ọo]c|phin|b[ơo]m|ecu|[ắa]c\s*quy|b[ìi]nh|d[ầa]u\b|m[ỡo]|gio[ăa]ng|ph[ụu]\s*t[ùu]ng|v[ậa]t\s*t[ưu]|đ[ầa]u\s*n[ốo]i|c[áa]p\b|t[ủu]\s*(ats|đi[ệe]n|h[òo]a)|b[ộo]\s*(đi[ềe]u\s*khi[ểe]n|s[ạa]c|n[ạa]p)|h[ộo]p\s*đi[ềe]u|c[ảa]m\s*bi[ếe]n|r[ơo]\s*le|s[ửu]a\s*ch[ữu]a|b[ảa]o\s*d[ưu][ỡo]ng|thay\s*th[ếe]|v[ỏo]\s*(b[ảa]o\s*v[ệe]|c[áa]ch\s*[âa]m|ch[ốo]ng\s*[ồo]n)|canopy/i;
  const WON_ACC = /[ắa]c\s*quy|acquy|battery|b[ìi]nh\b|s[ạa]c|aptomat|mccb|acb|c[áa]p\b|l[ọo]c|d[ầa]u\s*nh[ớo]t|ats\b|công\s*tắc|cầu\s*dao/i;
  const wonSetRow = (g) => { const t = String([g.name, g.code].filter(Boolean).join(" ")).normalize("NFC"), m = t.match(SET_ROW); return !!m && !PART_ROW.test(t.slice(0, m.index)); };
  function wonTokens(sups) {
    const tok = new Map(), owned = new Set(), add = (k, id) => { const a = tok.get(k) || []; if (!a.includes(id)) a.push(id); tok.set(k, a); };
    const ok = (w) => w.length >= 3 && /[a-z]/i.test(w) && !WON_STOP.has(w.toLowerCase()) && !WON_PLACE.has(w.toLowerCase());
    for (const s of sups) if (s.role !== "distributor") for (const b of s.names?.brands || []) { const w = String(b).replace(/\(.*?\)/g, "").trim(); if (ok(w)) { add(w.toLowerCase(), s.id); owned.add(w.toLowerCase()); } }
    for (const s of sups) {
      const w = String(s.names?.en || "").normalize("NFC").replace(/\(.*?\)/g, " ").split(/[^\p{L}\p{N}&]+/u).find((x) => x.length >= 4 && ok(x));
      if (w && !owned.has(w.toLowerCase())) add(w.toLowerCase(), s.id);
    }
    return tok;
  }
  function supWon(sups, docs) {
    const tok = wonTokens(sups || []), out = new Map();
    if (!tok.size) return out;
    const esc = (k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(`(?<![\\p{L}\\p{N}])(${[...tok.keys()].sort((a, b) => b.length - a.length).map(esc).join("|")})(?![\\p{L}\\p{N}])`, "giu");
    for (const [key, d] of Object.entries(docs || {})) {
      if (!isGensetName(d.bidName) || bidKind(d.bidName) !== "supply") continue;
      for (const lot of d.lots || []) {
        const w = (lot.bidders || []).find((b) => b.won);
        if (!w) continue;
        for (const g of lot.goods || []) {
          if (!wonSetRow(g)) continue;
          for (const [where, txt, own] of [["set", [g.maker, g.label], true], ["set", [g.name, g.code], false], ["cfg", [g.desc], false]]) {
            const t = txt.filter(Boolean).join(" | ").normalize("NFC");
            for (const m of t.matchAll(rx)) {
              if (m[1].length <= 3 && m[1] !== m[1].toUpperCase()) continue;
              // Tên hàng / cấu hình chép từ HSMT ("hiệu Cummins … hoặc tương đương", "tương đương máy phát HONDA"): không phải
              // hàng nhà thầu chào. Hãng của phụ kiện trong cấu hình ("Bình ắc quy hiệu Camel") cũng không tính.
              const before = t.slice(Math.max(0, m.index - 60), m.index).split(/[;|\n]/).pop(), after = t.slice(m.index, m.index + 90).split(/[;|\n]/)[0];
              if (!own && /t[ưu][ơo]ng\s*đ[ưu][ơo]ng/i.test(before + after)) continue;
              if (where === "cfg" && WON_ACC.test(before.slice(-35))) continue;
              for (const id of tok.get(m[1].toLowerCase()) || []) {
                const a = out.get(id) || [];
                if (!a.some((x) => x.key === key && x.lotNo === (lot.lotNo || "") && x.item === g.name)) {
                  a.push({ key, lotNo: lot.lotNo || "", lotName: lot.lotName || "", bidName: d.bidName || "", at: d.openedAt || d.bidCloseDate || "", bidder: w.name || "", item: g.name || "", maker: g.maker || "", where, word: m[1], text: t.slice(Math.max(0, m.index - 60), m.index + m[1].length + 60).replace(/\s+/g, " ").trim() });
                  out.set(id, a);
                } else if (where === "set") a.find((x) => x.key === key && x.lotNo === (lot.lotNo || "") && x.item === g.name).where = "set";
              }
            }
          }
        }
      }
    }
    return out;
  }
  root.GenbidBidprice = { supWon, wonTokens, wonSetRow, SYNC_TAG, brandSyncOf, familyOf, kvaOf, kvaRated, powerMatch, unitsOf, placeOf, keyText, capPick, isGensetName, bidKind, movesOldSet, cfgKva, cfgPower, taxKey, bdPrice, profileOf, goodsGroup, compareCfg, candidates, sampleText, cfgLine, suggest, GROUP, LEVELS, MAX, POWER_TOL, SYNC_POWER_TOL, WIDE_TOL, STANDBY_FACTOR };
})(typeof window !== "undefined" ? window : globalThis);
