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
    const v = numOf(m);
    return v > 0 ? (/kw/i.test(m[2]) ? v / 0.8 : v) : null;
  }
  // The rating a power figure is given at (2026-11-06 audit: the name of a tender gives the prime power, its HSMT often the
  // standby one too, 10% apart, so 144 of 326 past tenders read 5–15% apart from their own HSMT): the words of prime or
  // standby in the same clause as the figure ("500 kVA liên tục; 550 kVA dự phòng", "Công suất định mức (Standby) 2500kVA").
  const PRIME_RE = /li[êe]n\s*t[ụu]c|\bprime\b|\bPRP\b|\bCOP\b|continuous|c[ơo]\s*b[ảa]n/i, STANDBY_RE = /d[ựu]\s*ph[òo]ng|\bstandby\b|\bESP\b|emergency|kh[ẩa]n\s*c[ấa]p/i;
  const ratingIn = (s) => { const p = PRIME_RE.test(s), b = STANDBY_RE.test(s); return p === b ? null : p ? "prime" : "standby"; };
  // "1.250" and "1,250" are 1250 (a group of three digits is thousands, as config-bot.mjs capacity reads it); "12,5" is 12.5.
  const numOf = (m) => Number(/^\d{1,3}[.,]\d{3}$/.test(m[1]) ? m[1].replace(/[.,]/, "") : m[1].replace(",", "."));
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
    const q = Math.max(0, ...goods.filter((g) => isGensetRow(g.name)).map((g) => Number(g.qty) || 0));
    if (q >= 1) return q;
    const n = String(name || "").normalize("NFC"), m = n.match(UNIT_RE) || n.match(X_RE);
    return m && Number(m[1]) >= 1 ? Number(m[1]) : 1;
  }
  // Same name rules as the bot (genbid-sync.js isGenset): a power plant's own generator is not a generator set.
  const GENSET_RE = /m[áa]y\s*ph[áa]t\s*(đi[ệe]n|[dđ]i[eê][sz][eê][ln]|dự\s*phòng)|m[áa]y\s*ph[áa]t[^,;:]{0,30}\d+\s*k[vV]?[aA]\b|\bgenset\b|\bmp[đd]\b/i;
  const PLANT_RE = /tua\s*bin|turbine|tổ\s*máy\s*(số\s*)?[HS]?\d|nhà\s*máy\s*(thủy|thuỷ|nhiệt)\s*điện/i, SET_RE = /dự\s*phòng|[dđ]i[eê][sz][eê][ln]|\d\s*kva\b/i;
  // Goods / section lines ("MPĐ diesel - Dây curoa" is a part, not a set): the rule as it was, "MPĐ" not read.
  const isGensetRow = (n) => { n = String(n || "").normalize("NFC"); return GENSET_RE.test(n) && (!PLANT_RE.test(n) || SET_RE.test(n)); };
  // Tender names: same rule in bot/genbid-hsmt/sync-pure.js (isGenset) and server/src/muasamcong.ts (isGeneratorTender),
  // keep the three alike. A name saying only "MPĐ" is a set (JS \b does not see Đ as a letter, hence the lookarounds);
  // wind / solar generators are not, unless the name also says diesel, standby or kVA.
  const MPD_RE = /(?<!\p{L})mp[đd](?!\p{L})/iu;
  // Narrow on purpose: the renewable word must touch the generator ("máy phát điện gió"), so a mixed building package
  // ("điện năng lượng mặt trời, Máy phát điện; Điều hòa…") that also buys a set stays a generator tender.
  const RENEW_RE = /máy\s*phát\s*(?:điện\s*)?(?:gió|mặt\s*trời|năng\s*lượng)|phát\s*điện\s*(?:gió|mặt\s*trời|năng\s*lượng)|điện\s*gió|năng\s*lượng\s*gió|tua\s*-?\s*bin\s*gió|pin\s*(?:năng\s*lượng\s*)?mặt\s*trời|quang\s*điện|\bsolar\b|\bwind\b/i;
  const isGensetName = (n) => { n = String(n || "").normalize("NFC"); return (GENSET_RE.test(n) || MPD_RE.test(n)) && (!PLANT_RE.test(n) || SET_RE.test(n)) && (!RENEW_RE.test(n) || SET_RE.test(n)); };
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
  const CN_WORD = /trung\s*qu[ốô]c|\bchina\b|\bPRC\b/i;
  // Countries that name themselves anywhere in the text (letters and digits around them end a word: the JS regex word boundary does not count ỹ, đ, ý as letters).
  const FOREIGN_WORD = /(?<![\p{L}\p{N}])(?:G7|G20|USA|UK|japan|germany|france|italy|korea|sweden|india|thailand|malaysia|indonesia|indonexia|singapore|taiwan|turkey|spain|portugal|czech|netherlands|switzerland|finland|denmark|canada|australia)(?![\p{L}\p{N}])|vương\s*quốc\s*anh|anh\s*quốc|hoa\s*kỳ|nhật\s*bản|hàn\s*quốc|thụy\s*điển|ấn\s*độ|châu\s*âu|bồ\s*đào\s*nha|tây\s*ban\s*nha|thổ\s*nhĩ\s*kỳ|thái\s*lan|đài\s*loan|(?:liên\s*bang|lb)\s*nga|hà\s*lan|phần\s*lan|đan\s*mạch|thụy\s*sĩ/iu;
  // Short names that are also common words or names (Anh, Ý, Mỹ "Mỹ Tho", Đức, Pháp "hợp pháp", Áo, Nga, EU; Italia, which a cabinet line "thiết bị ABB - Italia" also names): a country only as a
  // whole field ("Anh", "C18 / Mỹ / Caterpillar"), after "xuất xứ" / "made in", or ending a line in capitals ("máy phát Cummins Mỹ").
  const SHORT_NAME = /^(?:anh|mỹ|đức|pháp|ý|áo|nga|eu|italia)$/iu, SHORT_AFTER = /(?:xuất\s*xứ|nước\s*sản\s*xuất|made\s*in|origin)\s*[:\-]?\s*(?:anh|mỹ|đức|pháp|ý|áo|nga|eu|italia)(?![\p{L}\p{N}])/iu, SHORT_END = /(?:^|\s)(?:Anh|Mỹ|Đức|Pháp|Ý|Áo|Nga|EU|Italia|ANH|MỸ|ĐỨC|PHÁP|ÁO|NGA|ITALIA)\s*[.]?\s*$/mu;
  const shortForeign = (t) => SHORT_AFTER.test(t) || SHORT_END.test(t) || t.split(/[,;\/()\[\]|:\n\r"“”–—-]+/).some((p) => SHORT_NAME.test(p.trim().replace(/^[.\s]+|[.\s]+$/g, "")));
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
  const placeOf = (s) => { const t = String(s || "").normalize("NFC"); return CN_WORD.test(t) || CN_MADE.test(t) ? "cn" : FOREIGN_WORD.test(t) || shortForeign(t) ? "foreign" : null; };
  const GROUP = { cn: "Trung Quốc", cnmade: "hãng ngoài Trung Quốc, sản xuất tại Trung Quốc", foreign: "ngoài Trung Quốc" };
  // Groups that cannot price each other: a Chinese make against a foreign make made abroad; cnmade compares with both.
  const conflict = (a, b) => !!a && !!b && a !== b && a !== "cnmade" && b !== "cnmade";
  // The winning generator sets' engine origin, from the make, model and origin muasamcong lists for each (cables, ATS,
  // transformers left out): one group for all, else none.
  function goodsGroup(goods) {
    const gs = goods.filter((g) => isGensetRow(g.name) && !OTHER_LINE.test(g.name)).map((g) => profileOf(`máy phát ${[g.maker, g.origin].join(" ").replace(/\s+/g, " ")}`, g.code).group).filter(Boolean);
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
  const isSetRow = (g) => isGensetRow(g.name) || !!kvaOf(g.name);
  // A generator set made or assembled in Việt Nam among the won goods: its maker or origin says Việt Nam (Khoa,
  // 2026-11-11, IB2600603983: the 750 kVA sets of Việt Nhật and Trường Lộc won at 56-72% of the price and pulled the
  // suggestion down). Such a lot prices nothing: not alike, not in the prior pool.
  const VN_WORD = /vi[eệ]t\s*nam/i;
  const vnMadeSet = (goods) => (goods || []).some((g) => isSetRow(g) && VN_WORD.test(`${g.maker || g.label || ""} ${g.origin || ""}`));
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
    // t.group: the group asked for outright (groupPrices: the price of a configuration of another origin group).
    const tGroup = t.group || (eg === "cn" ? "cn" : eg === "other" ? (place === "cn" ? "cnmade" : "foreign") : tp.group);
    let total = 0, otherGroup = 0, vnMade = 0;
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
        if (kind === "supply" && movesOldSet(d.config?.text) && !goods.some((g) => isGensetRow(g.name))) continue;
        if (vnMadeSet(goods)) { vnMade++; continue; }
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
    return { total, tol, group: tGroup, rating: rK, place, otherGroup, vnMade, list: out.slice(0, MAX).map((s, i) => ({ id: "S" + (i + 1), ...s })), prior: prior.slice(0, 150) };
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
  // ---------- Ba mức hiệu chỉnh theo cạnh tranh dự báo (2026-11-10, thử nghiệm, TẮT mặc định) ----------
  // Hậu kiểm (bidprice-backtest.mjs --calib, chỉ dữ liệu trước ngày đóng thầu, 671 phần): khoảng [Cạnh tranh, Cao] =
  // phân vị 25/75 chỉ chứa 36% giá trúng thật, mức giữa lệch theo số nhà thầu (1 NT −4,4 điểm; ≥6 NT +11,3). Cách này cho
  // mỗi gói cũ trong pool trọng số theo xác suất nhóm số nhà thầu của gói đó ở dự báo nbForecast (bỏ nhóm 1 nhà thầu vì
  // pool chỉ có gói ≥2 nhà thầu, rồi chia lại), kéo về 1 với CALIB.lam, và lấy phân vị có trọng số CALIB.q / 0,5 / 1−q.
  // Hai tham số (lam 0,5; q 0,2), chọn trên cả giai đoạn; nửa sau (đóng sau 13/09/2024, 338 phần): phủ 38,2% → 56,8%, sai
  // số mức giữa 6,5 → 5,3 điểm, khoảng rộng 14,2 → 16,4 điểm. Không sửa được lệch của gói ≥6 nhà thầu (dự báo hiếm khi
  // thấy trước) và lệch nhóm động cơ Trung Quốc. suggest chỉ tính khi được truyền opts.fc; levels giữ nguyên.
  // Giãn s (2026-11-12, bp-bias): khoảng [thấp, cao] giãn quanh mức giữa ×s (mức giữa không đổi), cao không quá 100% giá
  // gói. Hậu kiểm 635 phần (dữ liệu 12/11): s 1,1 là mức giãn cho nhiều độ phủ nhất trên mỗi điểm độ rộng ở nửa sớm (đóng
  // trước 30/09/2024; chọn trên nửa này); nửa muộn: phủ 60,7% → ~72%, rộng 14,8 → ~16,3 điểm. Lệch mức giữa của gói từ 6
  // nhà thầu (+12,5) và gói hàng trúng động cơ Trung Quốc (+7,0) không sửa được bằng dữ liệu có trước ngày đóng thầu (đã
  // thử: trọng số dự báo mạnh hơn, lệch theo chủ đầu tư / tỉnh, trọng số cùng nhóm xuất xứ, kể cả biết nhóm hàng trúng, độ
  // mới gói cũ) — nghiệm thu genbid-work\dieu-phoi\nghiem-thu\bp-bias.md.
  const CALIB = { lam: 0.5, q: 0.2, s: 1.1 };
  function wQuantile(xs, ws, p) {
    const o = xs.map((x, i) => [x, ws[i]]).sort((a, b) => a[0] - b[0]), tot = o.reduce((s, x) => s + x[1], 0);
    let c = 0;
    for (const [x, w] of o) { if ((c + w / 2) / tot >= p) return x; c += w; }
    return o.length ? o[o.length - 1][0] : null;
  }
  function calibLevels(pool, P, fc, { lam = CALIB.lam, q = CALIB.q, s: st = CALIB.s } = {}) {
    if (!(pool.length >= 3 && P > 0) || !fc?.p) return [];
    const p = fc.p.slice(1), sp = p.reduce((a, b) => a + b, 0), share = [0, 0, 0];
    for (const s of pool) share[Math.max(1, nbBucket(nbOf(s))) - 1]++;
    const ws = pool.map((s) => { const b = Math.max(1, nbBucket(nbOf(s))) - 1; return 1 - lam + (lam * (p[b] / sp)) / (share[b] / pool.length); });
    const rs = pool.map((s) => s.ratio), round = (v) => Math.round(v / 1000) * 1000;
    const [lo, mid, hi] = [q, 0.5, 1 - q].map((pq) => wQuantile(rs, ws, pq));
    const r3 = [mid - st * (mid - lo), mid, Math.max(mid, Math.min(1, mid + st * (hi - mid)))];
    return [["low", "Cạnh tranh"], ["mid", "Trung vị"], ["high", "Cao"]].map(([id, label], i) => ({ id, label, ratio: r3[i], price: round(P * r3[i]) }));
  }
  function suggest(samples, P, K, prior = [], opts = {}) {
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
    const calib = opts.fc ? calibLevels(pool, P, opts.fc) : null;
    return { basis, n: use.length, same: same.length, close: close.length, nPrior: extra.length, pool: pool.length, enough: pool.length >= 5, levels, perKva: perKva && { value: round(perKva), price: round(perKva * K), n: withK.length }, bidders, byBidders, comps, ...(calib?.length ? { calib: { levels: calib, ...CALIB, fc: opts.fc.p.map((x) => Math.round(x * 1000) / 1000) } } : {}) };
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
                  a.push({ key, url: d.url || "", lotNo: lot.lotNo || "", lotName: lot.lotName || "", bidName: d.bidName || "", at: d.openedAt || d.bidCloseDate || "", bidder: w.name || "", bidderId: taxKey(w), item: g.name || "", maker: g.maker || "", where, word: m[1], text: t.slice(Math.max(0, m.index - 60), m.index + m[1].length + 60).replace(/\s+/g, " ").trim() });
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
  // ---------- Cạnh tranh dự báo (2026-11-10): số nhà thầu, nhà thầu quen của chủ đầu tư, xác suất thắng theo giá ----------
  // Đo trên 1.627 phần đã có kết quả (2022 → 11/2026): giá trúng / giá gói chủ yếu do số nhà thầu quyết định (1 nhà thầu:
  // trung vị 99%; từ 7: 78%), nên mức giá nên bỏ phụ thuộc trước hết vào việc gói sẽ có mấy nhà thầu.
  // nbForecast: phân bố số nhà thầu (1 / 2–3 / 4–5 / từ 6) = tỉ lệ chung × độ lệch của chủ đầu tư × của tỉnh × của lĩnh vực,
  // mỗi độ lệch kéo về tỉ lệ chung khi ít gói (K_INV, K_SEG) và giảm nửa cho tỉnh / lĩnh vực (ALPHA) vì hai thứ trùng nhau
  // một phần. Hệ số chọn bằng kiểm thử tiến dần theo thời gian (dự báo mỗi phần chỉ từ các phần đóng trước nó, 1.125 phần):
  // log loss 1,317 → 1,217, Brier 0,712 → 0,669. Giá gói, hình thức, công suất, yêu cầu G7 không giúp thêm nên không dùng.
  // Dự báo "1 nhà thầu" đúng 44% (tỉ lệ chung 32%), "từ 6" đúng 47% (tỉ lệ chung 11%): chỉ là xu hướng, không chắc chắn.
  const NB_LABELS = ["1 nhà thầu", "2–3 nhà thầu", "4–5 nhà thầu", "từ 6 nhà thầu"];
  const nbBucket = (n) => (n <= 1 ? 0 : n <= 3 ? 1 : n <= 5 ? 2 : 3);
  const K_INV = 5, K_SEG = 20, ALPHA = 0.5;
  const foldVi = (v) => String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const invKeyOf = (v) => foldVi(v).replace(/[^a-z0-9]+/g, " ").trim();
  // "Thành phố Hồ Chí Minh" = "TP. Hồ Chí Minh"; "Xã A, Huyện B, Tỉnh C" → C; nhiều tỉnh → tỉnh đầu.
  const PROV_RE = /^(tinh|thanh pho|tp\.?)\s+/;
  function provinceOf(loc) {
    const parts = String(loc || "").split(/\s*[,;]\s*/).map((x) => foldVi(x).trim()).filter(Boolean);
    const p = parts.find((x) => PROV_RE.test(x)) || parts[parts.length - 1] || "";
    return p.replace(PROV_RE, "").replace(/[^a-z0-9]+/g, " ").trim();
  }
  const timeOf = (v) => { const t = v ? Date.parse(v) : NaN; return Number.isFinite(t) ? t : null; };
  // Mỗi phần đã mở thầu của bidhist thành một dòng. Nhớ theo đối tượng docs (trang web thay cả state.bidhist khi đổi).
  const rowsMemo = new WeakMap();
  function compRows(docs) {
    if (!docs || typeof docs !== "object") return [];
    if (rowsMemo.has(docs)) return rowsMemo.get(docs);
    const out = [];
    for (const [key, d] of Object.entries(docs)) {
      if (!d?.lots?.length) continue;
      const multi = d.lots.length > 1, at = timeOf(d.bidCloseDate) ?? timeOf(d.openedAt) ?? timeOf(d.publicDate) ?? (/^IB\d\d/.test(key) ? Date.UTC(2000 + Number(key.slice(2, 4)), 0, 1) : 0);
      const inv = invKeyOf(d.investorName), prov = provinceOf(d.location), genset = isGensetName(d.bidName);
      for (const lot of d.lots) {
        const bs = lot.bidders || [];
        if (!bs.length) continue;
        const w = bs.find((b) => b.won), price = lot.price ?? (multi ? null : d.estimatedPrice), wp = w && Number(w.winPrice ?? bdPrice(w));
        const ratio = price > 0 && wp > 0 ? wp / price : null;
        out.push({ key, lotNo: lot.lotNo || "", at, nb: bs.length, b: nbBucket(bs.length), inv, investor: d.investorName || "", prov, field: d.field || "",
          win: w ? taxKey(w) : "", winName: w?.name || "", taxes: bs.map(taxKey), final: !!d.final,
          // Giá trúng so với giá gói, chỉ ở phần mua sắm máy phát (như candidates): dùng cho đường xác suất thắng.
          ratio: ratio && ratio >= 0.3 && ratio <= 1.02 && genset && bidKind((multi && lot.lotName) || d.bidName) === "supply" ? ratio : null });
      }
    }
    out.sort((a, b) => a.at - b.at);
    rowsMemo.set(docs, out);
    return out;
  }
  // Các phần dùng để dự báo cho gói t: không phải chính nó, và đóng trước khi nó đóng (gói đã đóng xem lại thì không
  // nhìn thấy tương lai của chính nó).
  function rowsBefore(t, docs) {
    const self = t.notifyNo || t._key || "", cut = timeOf(t.bidCloseDate);
    return compRows(docs).filter((r) => r.key !== self && (cut == null || r.at < cut));
  }
  const hist4 = (rows) => { const c = [0, 0, 0, 0]; for (const r of rows) c[r.b]++; return c; };
  function nbForecast(t, docs) {
    const rows = rowsBefore(t, docs), n = rows.length;
    if (n < 50) return null;
    const g = hist4(rows).map((c) => (c + 1) / (n + 4)), lp = g.map(Math.log);
    const inv = invKeyOf(t.investorName), prov = provinceOf(t.location), field = t.field || "";
    const lean = (list, k, a) => { const c = hist4(list), m = list.length; if (m) for (let j = 0; j < 4; j++) lp[j] += a * (Math.log((c[j] + k * g[j]) / (m + k)) - Math.log(g[j])); return { n: m, hist: c }; };
    const ofInv = inv ? rows.filter((r) => r.inv === inv) : [], ofProv = prov ? rows.filter((r) => r.prov === prov) : [], ofField = field ? rows.filter((r) => r.field === field) : [];
    const parts = { investor: lean(ofInv, K_INV, 1), province: { name: prov, ...lean(ofProv, K_SEG, ALPHA) }, field: { name: field, ...lean(ofField, K_SEG, ALPHA) } };
    const mx = Math.max(...lp), e = lp.map((x) => Math.exp(x - mx)), s = e.reduce((a, x) => a + x, 0), p = e.map((x) => x / s);
    return { p, base: g, top: p.indexOf(Math.max(...p)), n, parts, labels: NB_LABELS, lock: lockOf(ofInv, docs) };
  }
  // Dấu hiệu gói có thể đã có chủ, đọc từ các gói trước của cùng chủ đầu tư:
  // - quen: một nhà thầu đã trúng ≥ 2 gói và ≥ nửa số gói trước của chủ đầu tư;
  // - single: chủ đầu tư có ≥ 2 gói trước và ≥ 2/3 trong đó chỉ có 1 nhà thầu.
  // Kiểm trên lịch sử (mỗi phần chỉ nhìn các phần trước nó): gói có dấu hiệu "quen" thì nhà thầu đó trúng lại 44% (mọi gói
  // có lịch sử: 25%), có "single" thì 56% chỉ 1 nhà thầu (mọi gói: 32%); gói của chủ đầu tư có ≥ 2 gói trước mà không có
  // dấu hiệu nào chỉ 21% có 1 nhà thầu. lockStats tính lại các tỉ lệ này từ dữ liệu đang có để lời ghi trên web luôn
  // đúng với dữ liệu.
  function lockSigns(prev) {
    const n = prev.length, wins = new Map();
    for (const r of prev) if (r.win) { const w = wins.get(r.win) || { id: r.win, name: r.winName, wins: 0, bids: 0 }; w.wins++; wins.set(r.win, w); }
    for (const r of prev) for (const tx of r.taxes) if (wins.has(tx)) wins.get(tx).bids++;
    const winners = [...wins.values()].sort((a, b) => b.wins - a.wins || b.bids - a.bids), top = winners[0] || null, one = prev.filter((r) => r.nb === 1).length;
    return { n, one, winners, top, quen: n >= 2 && !!top && top.wins >= 2 && top.wins / n >= 0.5, single: n >= 2 && one / n >= 2 / 3 };
  }
  const statsMemo = new WeakMap();
  function lockStats(docs) {
    if (!docs || typeof docs !== "object") return null;
    if (statsMemo.has(docs)) return statsMemo.get(docs);
    const by = new Map(), mk = () => ({ n: 0, one: 0, again: 0 }), st = { all: mk(), quen: mk(), single: mk(), none: mk() };
    const add = (x, r, top) => { x.n++; if (r.nb === 1) x.one++; if (top && r.win === top.id) x.again++; };
    for (const r of compRows(docs)) {
      const prev = r.inv ? by.get(r.inv) || [] : [];
      if (r.final) {
        const s = lockSigns(prev);
        add(st.all, r, s.top);
        if (s.quen) add(st.quen, r, s.top);
        if (s.single) add(st.single, r, s.top);
        if (s.n >= 2 && !s.quen && !s.single) add(st.none, r, s.top);
      }
      if (r.inv) { prev.push(r); by.set(r.inv, prev); }
    }
    statsMemo.set(docs, st);
    return st;
  }
  function lockOf(ofInv, docs) {
    const s = lockSigns(ofInv);
    return { ...s, winners: s.winners.slice(0, 5), level: s.quen && s.single ? "high" : s.quen || s.single ? "some" : s.n >= 2 ? "open" : "unknown", stats: lockStats(docs) };
  }
  // Xác suất thắng ở mức giá r (so với giá gói) khi hồ sơ đạt kỹ thuật: tỉ lệ các phần mua sắm máy phát đã có kết quả mà
  // giá trúng cao hơn r, tức bỏ r thì thấp hơn người đã trúng. Tính riêng theo số nhà thầu của phần đó rồi trộn theo dự báo
  // số nhà thầu (fc.p). Kiểm thử tiến dần (712 phần): Brier ở mức 90% giá gói 0,249 (không chia theo số nhà thầu) → 0,230
  // (trộn theo dự báo); biết đúng số nhà thầu thì 0,167, nên chọn tay kịch bản khi biết gói đông hay vắng sẽ sát hơn.
  // → { grid: [r], byNb: [{ n, w: [..] }], mix: [..], all: [..], n }.
  const WIN_GRID = Array.from({ length: 41 }, (_, i) => Math.round((0.6 + i * 0.01) * 100) / 100);
  function winCurve(t, docs, fc) {
    const rows = rowsBefore(t, docs).filter((r) => r.ratio), by = [[], [], [], []];
    for (const r of rows) by[r.b].push(r.ratio);
    const share = (xs, r) => (xs.length ? xs.filter((x) => x > r + 1e-9).length / xs.length : null);
    const all = rows.map((r) => r.ratio), byNb = by.map((xs) => ({ n: xs.length, w: WIN_GRID.map((r) => share(xs, r)) }));
    const p = fc?.p || null;
    // Nhóm số nhà thầu có dưới 15 phần thì dùng đường chung cho nhóm đó.
    const mix = WIN_GRID.map((r, i) => (p ? p.reduce((a, pj, j) => a + pj * (byNb[j].n >= 15 ? byNb[j].w[i] : share(all, r) ?? 0), 0) : share(all, r)));
    return { grid: WIN_GRID, byNb, mix, all: WIN_GRID.map((r) => share(all, r)), n: all.length, labels: NB_LABELS };
  }
  // Lợi nhuận kỳ vọng ở từng mức giá: xác suất thắng × (giá bỏ − giá vốn). P: giá gói, cost: giá vốn (đồng, cùng cơ sở
  // thuế với giá dự thầu), w: một đường của winCurve (mix, all hoặc byNb[i].w). best: mức có lợi nhuận kỳ vọng cao nhất
  // trong các mức không lỗ; không có mức nào (giá vốn ≥ giá gói) thì null.
  function profitTable(P, cost, curve, w = curve.mix) {
    if (!(P > 0) || !(cost > 0)) return { rows: [], best: null, breakEven: null };
    const rows = curve.grid.map((r, i) => ({ r, price: Math.round((P * r) / 1000) * 1000, w: w[i], margin: P * r - cost, ev: w[i] == null ? null : w[i] * (P * r - cost) }));
    const ok = rows.filter((x) => x.margin > 0 && x.ev != null);
    const best = ok.length ? ok.reduce((a, x) => (x.ev > a.ev ? x : a)) : null;
    return { rows, best, breakEven: cost / P };
  }
  // ---------- Sổ báo giá nhà cung cấp (quote/<TBMT>.rows[].items[], 2026-11-10) ----------
  // Một dòng giá: { id, desc, kva, engine, alternator, controller, qty, unitPrice, currency, terms, date, note }.
  // Giá vốn của một nhà cung cấp = Σ số lượng × đơn giá × tỷ giá + các khoản thêm (cost.extras: { label, kind: "vnd" |
  // "pct", value }; pct tính trên tiền hàng đã quy đổi). Thiếu tỷ giá của một đồng tiền có trong dòng giá thì chưa tính
  // được (missing), không đoán tỷ giá.
  // Thuế GTGT (cost.vat, %; Khoa 10/11: tỷ giá và thuế GTGT lưu một lần cho mọi gói, quote/_cost): tính trên tiền hàng
  // của các dòng chưa gồm thuế (dòng có vatIncl thì đơn giá đã gồm) cộng các khoản thêm.
  const CURRENCIES = ["VND", "USD", "CNY", "EUR", "JPY"];
  // Báo giá cũ (2026-11-10): dòng giá không ghi ngày, hay ngày cách hôm nay quá STALE_DAYS, có thể đã đổi giá.
  // → null (còn dùng được) | "nodate" | "old" (kèm số ngày ở quoteCost.stale).
  const STALE_DAYS = 180;
  const dateOfQuote = (v) => {
    const s = String(v || "").trim(), m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
    const t = m ? Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : Date.parse(s);
    return Number.isFinite(t) ? t : null;
  };
  function quoteStale(item, now = Date.now()) {
    const t = dateOfQuote(item?.date);
    if (t == null) return { why: "nodate", days: null };
    const days = Math.floor((now - t) / 864e5);
    return days > STALE_DAYS ? { why: "old", days } : null;
  }
  // cost.finance: chi phí vốn (financeCost.total), cộng vào giá vốn, không tính thuế GTGT. stale: các dòng giá cũ / không ngày.
  function quoteCost(row, cost = {}, now = Date.now()) {
    const fx = { ...(cost.fx || {}), VND: 1 }, items = (row?.items || []).filter((x) => Number(x.unitPrice) > 0), missing = [];
    const vatRate = Number(cost.vat) > 0 ? Number(cost.vat) : 0, finance = Number(cost.finance) > 0 ? Number(cost.finance) : 0;
    const stale = items.map((x) => { const s = quoteStale(x, now); return s && { id: x.id || "", desc: x.desc || "", date: x.date || "", ...s }; }).filter(Boolean);
    let goods = 0, taxed = 0;
    for (const x of items) {
      const cur = x.currency || "VND", rate = Number(fx[cur]);
      if (!(rate > 0)) { if (!missing.includes(cur)) missing.push(cur); continue; }
      const v = (Number(x.qty) > 0 ? Number(x.qty) : 1) * Number(x.unitPrice) * rate;
      goods += v; if (x.vatIncl) taxed += v;
    }
    if (!items.length || missing.length) return { goods: null, extras: null, vat: null, vatRate, finance: null, total: null, missing, n: items.length, stale };
    const extras = (cost.extras || []).reduce((a, e) => a + (e.kind === "pct" ? (goods * (Number(e.value) || 0)) / 100 : Number(e.value) || 0), 0);
    const vat = ((goods - taxed + extras) * vatRate) / 100;
    return { goods, extras, vat, vatRate, finance, total: goods + extras + vat + finance, missing, n: items.length, stale };
  }
  // Mọi dòng giá của mọi gói thành một sổ: { key, rowId, supplierId, ...item, kvaNum }, mới nhất trước. kvaNum: công
  // suất ghi ở dòng, không có thì đọc từ mô tả. engineMake (để lọc theo động cơ): hãng nhận ra trong ô Động cơ
  // (catalog.js ENGINE_BRANDS), không nhận ra thì giữ nguyên chữ đã nhập, ô trống thì "".
  function quoteLedger(quotes, now = Date.now()) {
    const out = [], CAT = root.GenbidCatalog;
    for (const [key, q] of Object.entries(quotes || {})) for (const row of key.startsWith("_") ? [] : q?.rows || []) for (const x of row.items || []) {
      if (!(Number(x.unitPrice) > 0)) continue;
      const eng = String(x.engine || "").trim();
      out.push({ key, rowId: row.id, supplierId: row.supplierId || "", ...x, kvaNum: Number(x.kva) > 0 ? Number(x.kva) : kvaOf(x.desc), engineMake: (CAT && brandsIn(eng, CAT.ENGINE_BRANDS)[0]) || eng, stale: quoteStale(x, now) });
    }
    return out.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }
  // ---------- Hàng trúng thầu làm bằng chứng cho cấu hình (2026-11-10) ----------
  // Một cấu hình đã từng trúng thầu ở gói cùng cỡ là cấu hình đã qua chấm kỹ thuật ít nhất một lần. wonSets: mỗi dòng tổ
  // máy của hàng trúng ở gói mua sắm, với những gì dòng đó ghi được: công suất, hãng + mã hiệu tổ máy (cột Hãng sản xuất,
  // Ký mã hiệu, có từ mẫu 2024), model động cơ / đầu phát / bộ điều khiển (catalog.js partsIn), các hãng động cơ được
  // nhắc tới (bỏ mệnh đề "hoặc tương đương": đó là chữ chép từ HSMT, không phải hàng chào).
  // Dữ liệu mỏng (đo 10/11/2026 trên 1.097 dòng tổ máy trúng thầu): 5% ghi model động cơ, 15% ghi hãng động cơ, 56% ghi
  // hãng tổ máy, nên phần lớn cấu hình sẽ không có bằng chứng nào: không có bằng chứng không có nghĩa là cấu hình kém.
  const brandsIn = (text, list) => { const hit = []; for (const [re, name] of list || []) if (re.test(text) && !hit.includes(name)) hit.push(name); return hit; };
  const setsMemo = new WeakMap();
  function wonSets(docs) {
    if (!docs || typeof docs !== "object") return [];
    if (setsMemo.has(docs)) return setsMemo.get(docs);
    const CAT = root.GenbidCatalog, out = [];
    for (const [key, d] of Object.entries(docs)) {
      if (!isGensetName(d.bidName) || bidKind(d.bidName) !== "supply") continue;
      const multi = (d.lots || []).length > 1;
      for (const lot of d.lots || []) {
        const w = (lot.bidders || []).find((b) => b.won);
        if (!w) continue;
        for (const g of lot.goods || []) {
          if (!wonSetRow(g)) continue;
          const own = [g.name, g.maker, g.label, g.code, g.desc].filter(Boolean).join(" | ").normalize("NFC").replace(/[^.;|\n]*tương\s*đương[^.;|\n]*/gi, " ");
          const parts = CAT?.partsIn ? CAT.partsIn([g.code, g.desc].filter(Boolean).join(" | ")) : [], part = (k) => { const p = parts.find((x) => x.kind === k); return p ? { make: p.make || "", model: p.model } : null; };
          out.push({ key, lotNo: lot.lotNo || "", at: d.openedAt || d.bidCloseDate || "", inv: invKeyOf(d.investorName), investor: d.investorName || "", bidName: (multi && lot.lotName) || d.bidName || "", bidder: w.name || "", bidderId: taxKey(w),
            k: kvaOf([g.name, g.code, g.desc].join(" ")) || kvaOf(lot.lotName) || (multi ? null : kvaOf(d.bidName)), maker: String(g.maker || g.label || "").trim(), code: String(g.code || "").trim(),
            engine: part("engine"), alternator: part("alternator"), controller: part("controller"), engineMakes: CAT ? brandsIn(own, CAT.ENGINE_BRANDS) : [] });
        }
      }
    }
    setsMemo.set(docs, out);
    return out;
  }
  // Hàng trúng khớp một cấu hình c ({ engine, alternator, controller, genset }) của gói công suất kva:
  // - model: dòng ghi đúng model động cơ (một bên là phần đầu của bên kia, từ 5 ký tự: "NEF67TE8P" và "NEF67TE8P.A263");
  // - genset: dòng ghi đúng mã hiệu tổ máy tham chiếu của cấu hình;
  // - make: dòng nhắc hãng động cơ của cấu hình và công suất trong ±20%.
  // Mỗi phần của một gói tính một lần, ở mức mạnh nhất. sameInvestor: số phần trong đó của chính chủ đầu tư này.
  // score: để xếp các cấu hình bằng điểm nhau (model / tổ máy 3, cùng chủ đầu tư thêm 2, hãng 1, tối đa 5 phần mức hãng).
  const MAKE_TOL = 0.2;
  const sameModel = (a, b) => { if (!a || !b) return false; return a === b || (Math.min(a.length, b.length) >= 5 && (a.startsWith(b) || b.startsWith(a))); };
  function wonEvidence(docs, c, { kva = null, investorName = "", self = "" } = {}) {
    const CAT = root.GenbidCatalog, key = (m) => (m && CAT ? CAT.keyOf(m) : "");
    const ek = key(c?.engine?.model), gk = key(c?.genset?.model), makes = String(c?.engine?.make || "").split(" / ").map((x) => x.trim()).filter(Boolean), inv = invKeyOf(investorName);
    const best = new Map(), rank = { model: 3, genset: 2, make: 1 };
    for (const r of wonSets(docs)) {
      if (r.key === self) continue;
      const by = ek && r.engine && sameModel(key(r.engine.model), ek) ? "model" : gk && gk.length >= 4 && key(r.code) === gk ? "genset"
        : kva && r.k && makes.some((m) => r.engineMakes.includes(m)) && Math.abs(Math.log(r.k / kva)) <= Math.log(1 + MAKE_TOL) ? "make" : null;
      if (!by) continue;
      const id = `${r.key}|${r.lotNo}`, prev = best.get(id);
      if (!prev || rank[by] > rank[prev.by]) best.set(id, { by, key: r.key, lotNo: r.lotNo, at: r.at, bidName: r.bidName, bidder: r.bidder, bidderId: r.bidderId, investor: r.investor, same: !!inv && r.inv === inv, k: r.k, maker: r.maker, code: r.code, engine: r.engine });
    }
    const lots = [...best.values()].sort((a, b) => rank[b.by] - rank[a.by] || Number(b.same) - Number(a.same) || String(b.at).localeCompare(String(a.at)));
    const n = (by) => lots.filter((x) => x.by === by).length, sameInvestor = lots.filter((x) => x.same).length;
    return { model: n("model"), genset: n("genset"), make: n("make"), sameInvestor, score: 3 * (n("model") + n("genset")) + 2 * sameInvestor + Math.min(5, n("make")), lots };
  }
  // ---------- Giá theo từng cấu hình / nhóm xuất xứ (2026-11-10) ----------
  // Nhóm xuất xứ động cơ của một cấu hình, như candidates đọc cho cấu hình hạng 1: hãng Trung Quốc → cn; hãng ngoài Trung
  // Quốc → foreign, hay cnmade khi sản xuất tại Trung Quốc (place "cn": nhà cung cấp ở Trung Quốc, hay chữ DCEC, Wuxi...).
  // Không nhận ra hãng → null.
  function engineGroup(engine, place = null) {
    const C = root.GenbidCatalog;
    if (!engine || !C) return null;
    const eg = C.originIn(engine.make || "", engine.model || ""), pl = place || placeOf(`${engine.make || ""} ${engine.model || ""}`);
    return eg === "cn" ? "cn" : eg === "other" ? (pl === "cn" ? "cnmade" : "foreign") : null;
  }
  // Ba mức giá cho một cấu hình nhóm `group` khác cấu hình hạng 1: chỉ gói cũ BIẾT nhóm và không khác nhóm (conflict) —
  // không vay gói không rõ nhóm hay nhóm khác. Agent chỉ xếp mức các gói của cấu hình hạng 1 (prompt bảo khác nhóm là
  // "khác"), nên ở đây mọi gói code chọn đều tính là "gần" (basis "code", chưa qua Agent so cấu hình); quy tắc ≥ 2 nhà
  // thầu, ≥ 3 gói của suggest giữ nguyên, không đủ thì không có mức nào. Giá của cấu hình hạng 1 vẫn là suggest như cũ.
  // Kall: kVA × số máy cho giá theo kVA (một cỡ nhiều máy), mặc định K.
  function groupPrices({ t, docs, K, P, group, Kall = K, strict = true }) {
    const cand = candidates({ ...t, group }, docs, K, P), fits = (s) => (strict ? !!s.group : true) && !conflict(group, s.group);
    const list = cand.list.filter(fits).map((s) => ({ ...s, level: "close" })), prior = cand.prior.filter(fits);
    const stats = suggest(list, P, Kall, prior);
    return { group, basis: "code", stats, n: list.length, nPrior: prior.length,
      note: stats.levels.length ? "" : `Không đủ gói cũ nhóm ${GROUP[group] || group} có cạnh tranh (cần ít nhất 3, có ${stats.pool}).` };
  }

  // ---------- Khoản chi có thể phát sinh, đọc từ Phân tích (2026-11-10) ----------
  // Mỗi khoản chỉ có nhãn, loại (vnd: số tiền; pct: % tiền hàng) và câu trích nơi Phân tích nhắc tới; KHÔNG đoán giá trị —
  // người dùng điền số vào Chi phí phát sinh (quote/<key>.cost.extras). have: đã có khoản cùng tên trong extras.
  const NEG_BEFORE = /(không|ko)\s*(yêu\s*cầu|bao\s*gồm|cần|có|kèm|phải)?\s*[:\-]?\s*$/i;
  // "ATS: Không có trong tài liệu được cung cấp", "Vỏ cách âm: không yêu cầu".
  const NEG_AFTER = /^[^;.\n]{0,4}?\s*[:\-]\s*(không|ko)\b/i;
  const COST_HINTS = [
    ["ats", "ATS", "vnd", /\bATS\b|chuyển\s*(đổi\s*)?nguồn\s*tự\s*động/i],
    ["sync", "Tủ hoà đồng bộ", "vnd", /h(oà|òa)\s*đồng\s*bộ|synchroni[sz]|h(oà|òa)\s*song\s*song/i],
    ["tank", "Bồn dầu ngoài", "vnd", /(bồn|bể|téc)\s*(chứa\s*)?(dầu|nhiên\s*liệu)\s*(ngoài|rời|ngầm|riêng)/i],
    ["exhaust", "Ống khói, giảm thanh", "vnd", /ống\s*(khói|xả)|giảm\s*thanh|silencer|muffler/i],
    ["canopy", "Vỏ cách âm", "vnd", /cách\s*âm|chống\s*ồn|soundproof|canopy/i],
    ["cable", "Cáp lực", "vnd", /cáp\s*(lực|động\s*lực|điện\s*lực|đồng|nhôm|ngầm)|\bCXV\b|\bCVV\b|\bXLPE\b|cáp\s*\d+\s*[x×]\s*\d/i],
    // A factory test report ("Biên bản thử tải xuất xưởng") is the maker's, not a load bank on site.
    ["loadtest", "Thử tải giả", "vnd", /tải\s*giả|load\s*bank|thử\s*(nghiệm\s*)?(có\s*)?tải|chạy\s*thử[^.;]{0,40}(tải|Pđm)/i, (l) => l.replace(/thử\s*(nghiệm\s*)?tải\s*(tại\s*)?(nhà\s*máy\s*|xuất\s*xưởng)|xuất\s*xưởng[^;.]*/gi, " ")],
    // Not the manuals that come with the set ("Tài liệu kỹ thuật + hướng dẫn sử dụng").
    ["training", "Đào tạo, chuyển giao", "vnd", /đào\s*tạo|chuyển\s*giao\s*(công\s*nghệ|kỹ\s*thuật)|hướng\s*dẫn\s*vận\s*hành/i, (l) => l.replace(/(tài\s*liệu|sách|catalog)[^;,.]{0,40}hướng\s*dẫn[^;,.]*/gi, " ")],
    ["upkeep", "Bảo trì định kỳ", "vnd", /bảo\s*(trì|dưỡng)\s*(định\s*kỳ|miễn\s*phí)|bảo\s*(trì|dưỡng)\s*\d+\s*lần|\d+\s*lần\s*bảo\s*(trì|dưỡng)/i],
    // Not the set's own base frame ("Khung bệ máy").
    ["install", "Lắp đặt, xây móng", "vnd", /lắp\s*đặt|xây\s*(dựng\s*)?(móng|bệ)|móng\s*(máy|bê\s*tông)|bệ\s*bê\s*tông|đổ\s*bê\s*tông/i, (l) => l.replace(/(nơi|vị\s*trí|địa\s*điểm|tại|đã)\s*lắp\s*đặt/gi, " ")],
    ["remote", "Vận chuyển tới địa điểm xa", "vnd", /hải\s*đảo|(huyện|xã|thị\s*trấn|đặc\s*khu|quần)\s*đảo|trên\s*đảo|Trường\s*Sa|Hoàng\s*Sa|Côn\s*Đảo|Phú\s*Quốc|Lý\s*Sơn|Cô\s*Tô|Bạch\s*Long\s*Vĩ|Cồn\s*Cỏ|Phú\s*Quý|Vân\s*Đồn|Cát\s*Hải|Kiên\s*Hải|miền\s*núi|vùng\s*(sâu|cao)|vùng\s*xa|biên\s*giới|biên\s*phòng|nhà\s*giàn/i],
    ["inspect", "Kiểm định", "vnd", /kiểm\s*định|QUATEST|thử\s*nghiệm\s*tại\s*(đơn\s*vị|cơ\s*quan|phòng)/i],
  ];
  const OWN_ITEM = new Set(["exhaust", "install"]);
  // Months of a warranty clause: "24 tháng", "tối thiểu 730 ngày", "02 năm" (the first figure with a unit).
  function monthsIn(s) {
    const m = String(s || "").match(/(\d+(?:[.,]\d+)?)\s*(tháng|năm|ngày)/i);
    if (!m) return null;
    const v = Number(m[1].replace(",", "."));
    return /năm/i.test(m[2]) ? v * 12 : /ngày/i.test(m[2]) ? Math.round(v / 30.4) : v;
  }
  const WARRANTY_TERM = /bảo\s*hành/i, NOT_WARRANTY_TIME = /bảo\s*(đảm|lãnh)|giữ\s*lại|khắc\s*phục|sửa\s*chữa|thay\s*thế|thời\s*hạn\s*sửa/i;
  // The lines of an analysis to read, each with where it is from.
  function analysisLines(a) {
    const r = a?.result || a || {}, out = [];
    for (const s of r.technicalSpecs || []) out.push({ from: "Thông số kỹ thuật", head: String(s.item || ""), text: `${s.item || ""}: ${s.requirement || ""}` });
    for (const [k, v] of Object.entries(r.keyInfo || {})) if (v && typeof v === "string") out.push({ from: "Thông tin chính", head: k, text: v });
    for (const c of r.contractTerms || []) out.push({ from: "Điều khoản hợp đồng", head: String(c.term || ""), text: `${c.term || ""}: ${c.requirement || ""}`, quote: c.quote || "" });
    return out.map((x) => ({ ...x, text: String(x.text).normalize("NFC") }));
  }
  function costHints(analysis, extras = [], { location = "" } = {}) {
    const lines = analysisLines(analysis), out = [];
    if (location) lines.push({ from: "Địa điểm", head: "location", text: String(location).normalize("NFC") });
    const have = (label, re) => (extras || []).some((e) => e && e.label && (foldVi(e.label) === foldVi(label) || re.test(String(e.label).normalize("NFC"))));
    for (const [id, label, kind, re, clean] of COST_HINTS) {
      for (const l of lines) {
        // Lắp đặt, ống xả: only when the HSMT makes it an item of its own (điều phối 2026-11-10: "Phạm vi công việc: …
        // lắp đặt" and "Phụ kiện đi kèm: … Ống xả" come with almost every set).
        if (OWN_ITEM.has(id) && !(l.from === "Thông số kỹ thuật" && re.test(clean ? clean(l.head) : l.head))) continue;
        const s = clean ? clean(l.text) : l.text, m = s.match(re);
        if (!m || NEG_BEFORE.test(s.slice(Math.max(0, m.index - 30), m.index)) || NEG_AFTER.test(s.slice(m.index + m[0].length, m.index + m[0].length + 50))) continue;
        out.push({ id, label, kind, quote: cut(l.text, 220), from: l.from, have: have(label, re) });
        break;
      }
    }
    // Warranty longer than 12 months: the clause that gives its length (not the guarantee, not the repair time).
    const w = lines.find((l) => WARRANTY_TERM.test(l.head || l.text) && !NOT_WARRANTY_TIME.test(l.head) && monthsIn(l.text) != null) || lines.find((l) => l.head === "warranty" && monthsIn(l.text) != null);
    const months = w ? monthsIn(w.text) : null;
    if (months > 12) out.push({ id: "warranty", label: `Bảo hành ${months} tháng (dài hơn 12 tháng)`, kind: "pct", quote: cut(w.text, 220), from: w.from, months, have: have("Bảo hành", /bảo\s*hành/i) });
    return out;
  }

  // ---------- Chi phí vốn từ điều khoản hợp đồng (2026-11-10) ----------
  // Đọc contractTerms của Phân tích: % tạm ứng, hạn thanh toán (ngày), % bảo đảm thực hiện hợp đồng, % giữ lại / bảo lãnh
  // bảo hành + thời hạn bảo hành, phạt chậm (%/ngày; %/tuần chia 7) và mức phạt tối đa — chỉ khi câu ghi số. Lãi suất năm
  // (rate, %) và số ngày thực hiện (days) do người dùng nhập (quote/_cost), không có thì không tính và nói thiếu gì.
  // p: { price: giá dự thầu (cơ sở của bảo đảm, phạt), base: giá vốn (cơ sở vốn lưu động; không có thì dùng price), rate, days }.
  // Dòng: { id, label, basis (câu trích), formula, amount (đồng, null khi thiếu số), risk (không cộng vào giá vốn) }.
  const PCT_RE = /(\d+(?:[.,]\d+)?)\s*%/;
  const pctOf = (s) => { const m = String(s || "").match(PCT_RE); return m ? Number(m[1].replace(",", ".")) : null; };
  const termText = (c) => `${c.requirement || ""} ${c.quote || ""}`.normalize("NFC");
  function readTerms(terms) {
    const T = (re, not) => (terms || []).filter((c) => re.test(String(c.term || "")) && !(not && not.test(String(c.term || ""))));
    const out = { manual: [] }, manual = (c, why) => out.manual.push({ term: c.term || "", requirement: c.requirement || "", why });
    const adv = T(/tạm\s*ứng/i)[0];
    if (adv) {
      const v = pctOf(termText(adv));
      if (v != null) out.advance = { pct: v, term: adv };
      else if (/^\s*(không|ko)\b|không\s*(có\s*)?tạm\s*ứng|:\s*không\b/i.test(termText(adv))) out.advance = { pct: 0, term: adv };
      else manual(adv, "không ghi tỷ lệ tạm ứng");
    }
    const pay = T(/thanh\s*toán/i, /chứng\s*từ|hồ\s*sơ/i)[0];
    if (pay) {
      const s = termText(pay), stages = s.match(/(\d+|hai|ba|bốn)\s*đợt/i), nSt = stages ? ({ hai: 2, ba: 3, "bốn": 4 }[stages[1].toLowerCase()] || Number(stages[1])) : 1;
      const d = s.match(/(?:trong(?:\s*vòng)?|không\s*quá|chậm\s*nhất|tối\s*đa|sau)\s*(\d+)\s*ngày/i);
      if (nSt > 1) manual(pay, `thanh toán ${nSt} đợt`);
      else if (d) out.pay = { days: Number(d[1]), term: pay };
      else manual(pay, "không ghi số ngày thanh toán");
    }
    const sec = T(/bảo\s*đảm\s*thực\s*hiện/i, /hiệu\s*lực|tịch\s*thu|hoàn\s*trả/i)[0];
    if (sec) { const v = pctOf(termText(sec)); if (v != null) out.security = { pct: v, term: sec }; else manual(sec, "không ghi % bảo đảm"); }
    const ret = T(/bảo\s*(đảm|lãnh)\s*bảo\s*hành|giữ\s*lại/i)[0];
    if (ret) { const v = pctOf(termText(ret)); if (v != null) out.retention = { pct: v, term: ret }; else manual(ret, "không ghi % bảo đảm bảo hành"); }
    const war = T(/thời\s*(gian|hạn)\s*bảo\s*hành|^bảo\s*hành$/i)[0];
    if (war) { const m = monthsIn(war.requirement) ?? monthsIn(war.quote); if (m != null) out.warranty = { months: m, term: war }; else if (ret) manual(war, "không ghi thời hạn bảo hành"); }
    const pen = T(/phạt/i, /tối\s*đa/i)[0];
    if (pen) {
      const m = termText(pen).match(/(\d+(?:[.,]\d+)?)\s*%\s*\/?\s*(?:mỗi\s*|một\s*|01\s*)?(ngày|tuần)/i);
      if (m) out.penalty = { perDay: Number(m[1].replace(",", ".")) / (/tuần/i.test(m[2]) ? 7 : 1), unit: m[2], raw: Number(m[1].replace(",", ".")), term: pen };
      else manual(pen, "không ghi mức phạt theo ngày/tuần");
    }
    const pmax = T(/tối\s*đa/i).find((c) => /phạt|khấu\s*trừ/i.test(`${c.term} ${termText(c)}`)) || T(/phạt/i).find((c) => /tối\s*đa/i.test(termText(c)) && PCT_RE.test(termText(c).split(/tối\s*đa/i)[1] || ""));
    if (pmax) { const s = termText(pmax), v = pctOf(/tối\s*đa/i.test(pmax.term) ? s : s.split(/tối\s*đa/i)[1]); if (v != null) out.penaltyMax = { pct: v, term: pmax }; }
    const del = T(/thời\s*(hạn|gian)\s*(giao\s*hàng|thực\s*hiện)/i)[0];
    if (del) { const m = termText(del).match(/(\d+)\s*ngày/i); if (m) out.daysHint = Number(m[1]); }
    return out;
  }
  const vnd = (v) => Math.round(v).toLocaleString("vi-VN"), num = (v) => Number(v).toLocaleString("vi-VN", { maximumFractionDigits: 3 }), pct1 = (r) => (100 * r).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + "%";
  function financeCost(terms, p = {}) {
    const r = readTerms(terms), rate = Number(p.rate) > 0 ? Number(p.rate) : null, days = Number(p.days) > 0 ? Number(p.days) : null;
    const price = Number(p.price) > 0 ? Number(p.price) : null, base = Number(p.base) > 0 ? Number(p.base) : price, baseName = Number(p.base) > 0 ? "giá vốn" : "giá dự thầu";
    const missing = [];
    if (!rate) missing.push("lãi suất vay vốn (%/năm)");
    if (!days) missing.push(`số ngày thực hiện hợp đồng${r.daysHint ? ` (điều khoản ghi ${r.daysHint} ngày)` : ""}`);
    if (!price) missing.push("giá dự thầu");
    const ok = rate && days && price, i = (rate || 0) / 100 / 365, lines = [];
    const q = (x) => x?.term ? String(x.term.quote || x.term.requirement || "") : "";
    // Vốn lưu động: phần chưa được tạm ứng nằm trong hàng từ khi ký tới khi được trả (thực hiện + hạn thanh toán).
    if (r.pay || r.advance || r.manual.some((m) => /tạm\s*ứng|thanh\s*toán/i.test(m.term))) {
      const adv = r.advance ? r.advance.pct : null, pay = r.pay ? r.pay.days : null;
      const can = ok && adv != null && pay != null;
      lines.push({ id: "capital", label: "Vốn lưu động (chờ thanh toán)", basis: [q(r.advance), q(r.pay)].filter(Boolean).join(" · "),
        formula: `${baseName} × (1 − tạm ứng ${adv == null ? "?" : num(adv)}%) × lãi ${rate == null ? "?" : num(rate)}%/năm × (thực hiện ${days ?? "?"} + thanh toán ${pay ?? "?"} ngày) / 365`,
        amount: can ? base * (1 - adv / 100) * i * (days + pay) : null, ...(can ? {} : { lack: [adv == null && "% tạm ứng", pay == null && "hạn thanh toán"].filter(Boolean) }) });
    }
    if (r.security) lines.push({ id: "security", label: "Bảo đảm thực hiện hợp đồng", basis: q(r.security),
      formula: `giá dự thầu × ${num(r.security.pct)}% × lãi ${rate == null ? "?" : num(rate)}%/năm × ${days ?? "?"} ngày / 365`, amount: ok ? price * (r.security.pct / 100) * i * days : null });
    if (r.retention) {
      const wd = r.warranty ? Math.round(r.warranty.months * 30.4) : null;
      lines.push({ id: "retention", label: "Bảo đảm bảo hành", basis: [q(r.retention), q(r.warranty)].filter(Boolean).join(" · "),
        formula: `giá dự thầu × ${num(r.retention.pct)}% × lãi ${rate == null ? "?" : num(rate)}%/năm × bảo hành ${r.warranty ? `${r.warranty.months} tháng ≈ ${wd} ngày` : "?"} / 365`,
        amount: rate && price && wd ? price * (r.retention.pct / 100) * i * wd : null, ...(wd ? {} : { lack: ["thời hạn bảo hành"] }) });
    }
    // Phạt chậm: rủi ro, không cộng vào giá vốn.
    if (r.penalty || r.penaltyMax) lines.push({ id: "penalty", risk: true, label: "Phạt chậm giao hàng (rủi ro, không cộng vào giá vốn)", basis: [q(r.penalty), q(r.penaltyMax)].filter(Boolean).join(" · "),
      formula: `${r.penalty ? `${num(r.penalty.raw)}%/${r.penalty.unit}${r.penalty.unit === "tuần" ? ` (≈ ${num(r.penalty.perDay)}%/ngày)` : ""}` : "?"}${r.penaltyMax ? `, tối đa ${num(r.penaltyMax.pct)}% giá hợp đồng` : ""}${r.penalty && price ? `: mỗi ngày trễ ≈ ${vnd((price * r.penalty.perDay) / 100)} đ` : ""}`,
      amount: r.penaltyMax && price ? (price * r.penaltyMax.pct) / 100 : null });
    const total = lines.filter((x) => !x.risk && x.amount != null).reduce((a, x) => a + x.amount, 0);
    return { lines, total: lines.some((x) => !x.risk && x.amount != null) ? total : null, missing, manual: r.manual, read: { advance: r.advance?.pct ?? null, payDays: r.pay?.days ?? null, security: r.security?.pct ?? null, retention: r.retention?.pct ?? null, warrantyMonths: r.warranty?.months ?? null, penaltyPerDay: r.penalty?.perDay ?? null, penaltyMax: r.penaltyMax?.pct ?? null, daysHint: r.daysHint ?? null } };
  }

  // ---------- Cảnh báo giá gói không khả thi (2026-11-10) ----------
  // cost: giá vốn từ quoteCost (chỉ khi đủ báo giá khớp, do nơi gọi chọn), finance: chi phí vốn (financeCost.total).
  function feasibility({ P, cost, finance = 0, levels = [] }) {
    if (!(cost > 0)) return { flags: [], total: null };
    const total = cost + (Number(finance) || 0), flags = [], hi = (levels || []).reduce((a, l) => (l.price > (a?.price || 0) ? l : a), null);
    const fin = finance > 0 ? ` (giá vốn ${vnd(cost)} đ + chi phí vốn ${vnd(finance)} đ)` : "";
    if (P > 0 && total >= P) flags.push({ id: "over-package", text: `${finance > 0 ? "Giá vốn cộng chi phí vốn" : "Giá vốn"} ${vnd(total)} đ${fin} bằng ${pct1(total / P)} giá gói ${vnd(P)} đ: không thể bỏ giá dưới giá gói mà có lãi.` });
    else if (hi && total >= hi.price) flags.push({ id: "over-levels", text: `${finance > 0 ? "Giá vốn cộng chi phí vốn" : "Giá vốn"} ${vnd(total)} đ${fin} cao hơn mức ${hi.label} ${vnd(hi.price)} đ (${Math.round(100 * hi.ratio)}% giá gói): gói cũ tương tự hiếm khi trúng ở giá có lãi.` });
    return { flags, total };
  }

  // ---------- Hồ sơ đối thủ (2026-11-10) ----------
  // Nhà thầu đã dự các phần mua sắm máy phát (đóng trước gói này) cùng chủ đầu tư, cùng tỉnh hoặc cùng cỡ (±15% kVA): số
  // lần dự, số lần trúng, tỉ lệ giá dự / giá gói (trung vị + khoảng, chỉ khi ≥ 3 lượt có giá), hãng động cơ hay chào (từ hàng
  // trúng), số lần bị loại kỹ thuật. Chỉ thống kê mô tả. t: { notifyNo, investorName, location, kva, bidCloseDate }.
  const engineWords = (goods) => (goods || []).filter(wonSetRow)
    .map((g) => [g.name, g.desc].filter(Boolean).join(" ").normalize("NFC").replace(/[^.;|\n]*tương\s*đương[^.;|\n]*/gi, " "))
    .flatMap((s) => [...s.matchAll(/động\s*cơ|\bengine\b/gi)].map((m) => s.slice(m.index, m.index + 70))).join(" | ");
  const TECH_OUT = /kỹ\s*thuật|E-?HSĐXKT|\bYCKT\b/i, RIVAL_TOL = 0.15, RIVAL_MIN = 3;
  function rivalsOf(t, docs, { ownTax = "", limit = 12 } = {}) {
    // Phân tích ghi chủ đầu tư kèm "(MST …; địa chỉ)": chỉ lấy tên.
    const inv = invKeyOf(String(t.investorName || "").replace(/\s*\(.*$/, "")), prov = provinceOf(t.location), K = Number(t.kva) || null, cutAt = timeOf(t.bidCloseDate), self = t.notifyNo || "";
    const CAT = root.GenbidCatalog, by = new Map();
    for (const [key, d] of Object.entries(docs || {})) {
      if (key === self || !isGensetName(d.bidName)) continue;
      const at = timeOf(d.bidCloseDate) ?? timeOf(d.openedAt);
      if (cutAt != null && at != null && at >= cutAt) continue;
      const multi = (d.lots || []).length > 1;
      for (const lot of d.lots || []) {
        const name = (multi && lot.lotName) || d.bidName;
        if (bidKind(name) !== "supply" || !(lot.bidders || []).length) continue;
        const k = kvaOf(lot.lotName) || (multi ? null : kvaOf(d.bidName));
        const why = { investor: !!inv && invKeyOf(d.investorName) === inv, province: !!prov && provinceOf(d.location) === prov, size: !!(K && k) && Math.abs(Math.log(k / K)) <= Math.log(1 + RIVAL_TOL) };
        if (!why.investor && !why.province && !why.size) continue;
        const price = lot.price ?? (multi ? null : d.estimatedPrice);
        // Hãng động cơ: chỉ chữ ngay sau "động cơ" / "engine" trong dòng hàng là tổ máy (không lấy hãng tổ máy hay tên
        // công ty như "Viễn thông FPT"; điều phối 2026-11-10).
        const makes = CAT ? brandsIn(engineWords(lot.goods), CAT.ENGINE_BRANDS) : [];
        for (const b of lot.bidders) {
          const id = taxKey(b);
          if (!id) continue;
          const r = by.get(id) || { id, name: b.name || "", n: 0, wins: 0, techOut: 0, ratios: [], makes: new Map(), investor: 0, province: 0, size: 0, last: "" };
          r.n++; if (b.won) r.wins++; if (TECH_OUT.test(String(b.reason || ""))) r.techOut++;
          for (const w of ["investor", "province", "size"]) if (why[w]) r[w]++;
          const bp = Number(bdPrice(b));
          if (price > 0 && bp > 0 && bp / price >= 0.3 && bp / price <= 1.2) r.ratios.push(bp / price);
          if (b.won) for (const m of makes) r.makes.set(m, (r.makes.get(m) || 0) + 1);
          const ds = d.bidCloseDate || d.openedAt || "";
          if (ds > r.last) r.last = ds;
          by.set(id, r);
        }
      }
    }
    const own = String(ownTax || "").replace(/\D/g, "");
    const list = [...by.values()].map((r) => {
      const a = [...r.ratios].sort((x, y) => x - y);
      return { id: r.id, name: r.name, self: !!own && r.id === own, n: r.n, wins: r.wins, techOut: r.techOut, investor: r.investor, province: r.province, size: r.size, last: r.last,
        priced: a.length, ratio: a.length >= RIVAL_MIN ? { median: median(a), min: a[0], max: a[a.length - 1] } : null,
        makes: [...r.makes.entries()].sort((x, y) => y[1] - x[1]).map(([make, n]) => ({ make, n })) };
    }).sort((a, b) => b.investor - a.investor || b.n - a.n || b.wins - a.wins);
    return { list: list.slice(0, limit), total: list.length, basis: { investor: !!inv, province: prov || "", kva: K, tol: RIVAL_TOL, min: RIVAL_MIN } };
  }

  root.GenbidBidprice = { CALIB, calibLevels, wQuantile, engineWords, engineGroup, groupPrices, costHints, COST_HINTS, monthsIn, readTerms, financeCost, feasibility, rivalsOf, STALE_DAYS, quoteStale, conflict, wonSets, wonEvidence, nbForecast, winCurve, profitTable, compRows, lockStats, provinceOf, invKeyOf, nbBucket, NB_LABELS, quoteCost, quoteLedger, CURRENCIES, supWon, wonTokens, wonSetRow, SYNC_TAG, VN_WORD, vnMadeSet, brandSyncOf, familyOf, kvaOf, kvaRated, powerMatch, unitsOf, placeOf, keyText, capPick, isGensetName, isGensetRow, bidKind, movesOldSet, cfgKva, cfgPower, taxKey, bdPrice, profileOf, goodsGroup, compareCfg, candidates, sampleText, cfgLine, suggest, GROUP, LEVELS, MAX, POWER_TOL, SYNC_POWER_TOL, WIDE_TOL, STANDBY_FACTOR };
})(typeof window !== "undefined" ? window : globalThis);
