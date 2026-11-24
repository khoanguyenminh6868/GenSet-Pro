// Danh mục động cơ và đầu phát, rút từ bảng thông số của các nhà cung cấp (supplier/<id>.specTables).
// Mỗi dòng bảng là nguyên văn trên website của hãng (suppliers/crawl-specs.mjs, kiểm bằng suppliers/verify.mjs).
// Ở đây chỉ đọc lại các dòng đó, không thêm số liệu:
// - model động cơ / đầu phát là ô chữ-số trong dòng, ở bảng có cột động cơ / đầu phát;
// - hãng chỉ ghi khi nguồn ghi rõ (trong dòng, tiêu đề cột, tên trang, hoặc chính nhà cung cấp là hãng đó),
//   không đoán từ tên model;
// - công suất là của tổ máy dùng model đó, lấy từ các số trong dòng: một cặp số mà số lớn / số nhỏ trong khoảng
//   1,15–1,35 là cặp kVA / kW (hệ số công suất 0,8); hai cặp thì cặp lớn là dự phòng (standby), cặp nhỏ là liên tục
//   (prime). Không quy đổi kW ↔ kVA.
// Dùng chung cho trang web (window.GenbidCatalog) và Node (suppliers/catalog-stats.mjs).
(function (root) {
  "use strict";

  const ENGINE_BRANDS = [
    [/\bcummins\b|康明斯/i, "Cummins"], [/\bperkins\b|珀金斯/i, "Perkins"], [/\bbaudouin\b|博杜安/i, "Baudouin"],
    [/\bweichai\b|潍柴/i, "Weichai"], [/\byuchai\b|玉柴/i, "Yuchai"], [/\b(sdec|shangchai)\b|上柴/i, "SDEC"],
    [/\bdeutz\b|道依茨/i, "Deutz"], [/\bvolvo\b|沃尔沃/i, "Volvo Penta"], [/\bmtu\b/i, "MTU"],
    [/\bmitsubishi\b|三菱/i, "Mitsubishi"], [/\bdoosan\b|斗山/i, "Doosan"], [/\bhyundai\b|现代/i, "Hyundai"],
    [/\bkubota\b|久保田/i, "Kubota"], [/\byanmar\b|洋马/i, "Yanmar"], [/\bisuzu\b|五十铃/i, "Isuzu"],
    [/\bricardo\b|里卡多/i, "Ricardo"], [/\bfawde\b|锡柴/i, "FAWDE"], [/\blovol\b|雷沃/i, "Lovol"],
    [/\byto\b|一拖/i, "YTO"], [/\byangdong\b|扬动/i, "Yangdong"], [/\bquanchai\b|全柴/i, "Quanchai"],
    [/\bjichai\b|济柴/i, "Jichai"], [/\bzichai\b|淄柴/i, "Zichai"], [/\bhuachai\b|华柴/i, "Huachai"],
    [/\bchangchai\b|常柴/i, "Changchai"], [/\bkofo\b|科孚/i, "Kofo"], [/\bscania\b|斯堪尼亚/i, "Scania"],
    [/\bjohn deere\b|\bdeere\b|约翰迪尔/i, "John Deere"], [/\bdaewoo\b|大宇/i, "Daewoo"], [/\bgoogol\b/i, "Googol"], [/\bkoop\b/i, "Koop"],
    [/\bwudong\b|无动/i, "Wudong"], [/\btongchai\b|通柴/i, "Tongchai"], [/\bxichai\b/i, "Xichai"],
    [/\bmwm\b/i, "MWM"], [/\bkohler\b|科勒/i, "Kohler"], [/\blister\b/i, "Lister Petter"], [/\bhonda\b|本田/i, "Honda"],
    [/\bcaterpillar\b|卡特彼勒/i, "Caterpillar"], [/\bfpt\b|\biveco\b|依维柯/i, "FPT"], [/\bMAN\b|曼恩/, "MAN"], [/\bdetroit\b/i, "Detroit Diesel"],
  ];
  const ALT_BRANDS = [
    [/\bstamford\b|斯坦福/i, "Stamford"], [/\bleroy[\s-]?somer\b|\bleroy\b|利莱森玛/i, "Leroy-Somer"],
    [/\bmecc[\s-]?alte\b|\bmeccalte\b|麦格特/i, "Mecc Alte"], [/\bmarathon\b|马拉松/i, "Marathon"],
    [/\bengga\b|英格/i, "Engga"], [/\bfaraday\b|法拉第/i, "Faraday"], [/\bsiemens\b|西门子/i, "Siemens"],
    [/\bavk\b/i, "AvK"], [/\blinz\b/i, "Linz Electric"], [/\bsincro\b/i, "Sincro"], [/\bweg\b/i, "WEG"],
  ];
  // Alternator code families (Khoa 23/11/2026, baifa điểm 2). This table is GENERAL KNOWLEDGE of the makers' product
  // lines, taken from NO supplier source. It is used ONLY to DETECT a code that sits under another make's column title
  // (altMakeAsk); it NEVER gives a make to a record. Every prefix in use:
  //   Leroy-Somer: "LSA" + digit ("LSA52.3 UL16", "LSA 53.2M9"), "TAL-A" / "TAL" + digit ("TAL-A44-C");
  //   Stamford: "UCI" / "UCD" / "UCM" / "UCDI" / "UCDM" + digit, "HCI" / "HCM" / "HCK" + digit, "PI" + 3 digits ("PI734E1"),
  //     "S0L"–"S9L" + digit ("S5L1D");
  //   Mecc Alte: "ECO" / "ECP" + digit.
  const ALT_CODE_FAMILY = [
    ["Leroy-Somer", /^(LSA\s?\d|TAL[\s-]?A?\d)/i],
    ["Stamford", /^(UC[DIM]{1,2}\s?\d|HC[IMK]\s?\d|PI\s?\d{3}|S\dL\d)/i],
    ["Mecc Alte", /^EC[OP]\s?\d/i],
  ];
  // A code of one family under the column title of ANOTHER make ("LSA52.3 UL16" under "STAMFORD", baifa n101; "PI734E1"
  // under "Alternator Leroy-Somer", penlucky n103): neither side is trusted (Khoa 23/11/2026). The row stays, the column's
  // make is taken off the record (it no longer votes at build()), and `makeAsk` says what to confirm with the supplier.
  // Only a make read from a column title: a make in the row's own cell or on the page title is left as it is.
  function altMakeAsk(list) {
    for (const o of list) {
      if (o.kind !== "alternator" || !o.makes?.length) continue;
      const fam = ALT_CODE_FAMILY.find(([, re]) => re.test(String(o.model || "").trim()));
      const off = fam ? o.makes.filter((m) => m.via === "tiêu đề cột" && m.name !== fam[0]) : [];
      if (!off.length) continue;
      o.makeAsk = `mã ${o.model} dưới cột ${off.map((m) => m.name).join(" / ")}`;
      o.makes = o.makes.filter((m) => !off.includes(m));
    }
    return list;
  }
  // FG Wilson as an alternator's make (genlitec: "| Alternator Make | FG Wilson", "| Alternator | FG Wilson FGL70030"). Read ONLY from
  // the alternator's own cell or its make cell, never from a page title / column header / whole row (those name the genset's
  // make), so it is not in ALT_BRANDS (which title, header and HSMT readings use).
  const FG_WILSON = [/\bfg[\s-]?wilson\b/i, "FG Wilson"];
  const ALT_CELL_BRANDS = [...ALT_BRANDS, FG_WILSON];
  // A make word at the start of an alternator cell ("Stamford S5L1D-C41", "FG Wilson FGL70030").
  const ALT_PREFIX = /^(stamford|leroy[\s-]?somer|mecc\s?alte|marathon|engga|fg\s?wilson)\s+/i, FG_PREFIX = /^fg\s?wilson\s+/i;
  // ("Leroy Somer TAL-A44-M / TAL-A46-C", one make and two models; "Stamford HCI 444D", a code with a space: other forms, not read here.)
  // Mã đầu phát của các dòng phổ biến: dùng để biết ô nào là đầu phát khi bảng có cả động cơ lẫn đầu phát.
  const ALT_CODE = /^(UC[DIM]{0,2}\s?\d{3}|UCI\d|HC[IKM]?\s?\d{3}|PI\s?\d{3}|PE\s?\d{3}|S[0-9][LM]\d|P[0-9]\s?\d{2,}|LV[ISM]?\d{3}|TAL[\s-]?[A-Z]?\d{2}|LSA\s?\d{2}|LL\d{4}|ECP\s?\d{2}|ECO\s?\d{2}|NPE\s?\d{2}|MP[\s-]?\d{2,}|MX[\s-]?\d{3}|EG\s?\d{3}|1FC\d|FD\d[A-Z]|LTP\d{3}|BW(?:C|LV|P)?-?\d|BC[IA]?\s?1[0-9]{2}[A-Z])\/?/i; // LTP / BW: landtop, bobig (alternator model right after the engine, no brand in the header); BC164 / BC184: acepow's alternator stands BEFORE the engine ("| BC184E | ISUZU | JE493DB-04", read as the engine)
  // A cell of figures with a look-alike letter ("3S0", "312.S": OCR of 350, 312.5, vantek) that is the kVA of the kW before it
  // (kVA = kW / 0.8) or the kW of the kVA before it: a figure, not a model.
  const OCR_SUB = { O: "0", S: "5", B: "8", Z: "2", I: "1", l: "1" };
  const ocrFig = (cells, i) => {
    const c = String(cells[i] || "").trim();
    if (!/^\d[\dOSBZIl.]*$/.test(c) || !/[OSBZIl]/.test(c)) return false;
    const v = Number(c.replace(/[OSBZIl]/g, (x) => OCR_SUB[x])), p = Number(String(cells[i - 1] || "").trim());
    if (!(v > 0) || !(p > 0)) return false;
    return Math.abs(p / 0.8 - v) <= 0.015 * v || Math.abs(p * 0.8 - v) <= 0.015 * v;
  };
  const BC_ALT =/^BC[IA]?\s?1\d{2}[A-Z]/i; // acepow's alternator code, specific enough to be read before the engine without a title
  // A bare frame number + letters with a 4 in the third place ("164B", "184J", "224E", "274C", "314D"): the Stamford-style frame
  // of a Chinese alternator written without its prefix (uleengen). Engine codes of that shape end in 0 / 5 / 8 ("380D", "490D").
  // Used only where the header names an alternator column (lech-cot-11).
  // A Scania engine written as the maker does, in four words ("DC09 072A 02-11", "DC13 072A 02 11", "OC16 071A 02-82" gas,
  // "DC9 65A 10-93"): a code with up to three spaces (catalog-bang-r1: agg-fuzhou, kaihua, voltgent, green-power, huadong
  // had rows whose only engine cell failed isCode, so the row gave no record).
  // "DC13 320A 02-61"; baifa's second Scania row type writes the code with the set's kVA after it: "DC13 505A 400KVA".
  const SCANIA_CODE = /^[DO]C\s?\d{1,2}\s\d{2,3}[A-Z]\s(?:\d{2}[\s-]\d{2}|\d{2,4}\s?kva)$/i;
  // Doosan DP054CC / DP086CC / DP222CC (the trailing "CC" is part of the code, not a displacement in cc): the one exception to the "<digit>CC" rule of `isCode`.
  const DOOSAN_DP = /^DP\d{3}CC$/i;
  const DOOSAN_P = /^P\d{3}(?:TI|LE)\b/i; // Doosan engines that look like an alternator's P-frame ALT_CODE
  const FRAME_ALT =/^(16|18|22|27|31|35)4[A-Z]{1,2}$/;
  // An alternator maker's own codes, only in the tables listed (catalog-nhom-con-lai, Khoa 20/11/2026 câu 1 = B: an explicit
  // list, not a rule, so not in ALT_CODE). eastern-lion writes its alternator "EL 164D" / "ELS 184F" (60 Hz) under "Alternator
  // model" and its controller "RUIFEN6120" after it: "the one code after the engine" found two codes and took none (15 tables),
  // and where the engine cell is Chinese ("D114系列WLD171", "4105ZD(小泵）") the EL code was read as the ENGINE and RUIFEN6120
  // as the alternator (n126 / n147 / n149). Matched by supplier + n + a header naming "Alternator model".
  const OWN_ALT = [
    { supplierId: "eastern-lion-fuan", n: [114, 115, 116, 117, 122, 126, 128, 129, 133, 139, 141, 142, 144, 146, 147, 149, 151, 152], code: /^ELS?\s?\d{3}[A-Z]{0,2}$/i, khoa: "Khoa 20/11/2026" },
  ];
  // An alternator maker's own range table, read as alternator records with the output the maker gives at each frequency
  // (catalog-nhom-con-lai, Khoa 20/11/2026 câu 2): an explicit list (supplier + n + the first header line word for word; a
  // re-crawl that changes the header lapses the entry, noted), each entry names its cells. Level `rated`: the maker's
  // "Output" of the alternator, neither a prime nor a standby of a set. Two records per row, one per frequency.
  const ALT_TABLES = [
    { supplierId: "eastern-lion-fuan", n: 156, header: "| | Model | 50Hz Output (kW) | 50Hz Output (kVA) | 60Hz Output (kW) | 60Hz Output (kVA) | SAE Size | Core Length (mm)",
      code: /^ELS?\s?\d{3}[A-Z]{0,2}$/i, model: 0, out: [{ freq: 50, kW: 1, kVA: 2 }, { freq: 60, kW: 3, kVA: 4 }], khoa: "Khoa 20/11/2026" },
  ];
  // Series codes of Chinese alternator makers (Nianfeng NFS, Bobig BW, Jet-Power JET, Wintpower WT): such a model is not
  // the Stamford that the column title or page title of the table names ("Stamford UCDI274J" rows above, "with stamford
  // alternator" title): 2026-11-03 regression run showed "NIANFENG NFS5-G (Stamford)", "BW-404B (Stamford)".
  const CN_ALT_CODE = /^(NIANFENG|NFS?\d|BW-?\d|JET\d|WT\d)/i;
  const CONTROLLER = /^(DSE|HGM|IL-|IG-|AMF|COMAP|INTELI|DEEP\s?SEA|SMARTGEN|GU\d|MRS|MEBAY|LXC|BE\d{3})/i;
  // "油机型号" (oil engine model, comler-power) and "动力型号" / "配套动力" (power unit model, kanpor-fuan) name the engine too.
  // "Mesin" is the engine in Indonesian ("| Model | Mesin | Prime (kVA)" over "| PJPS-750 WP2 | Perkins 4006-23TAG2A |",
  // conductorjasa n124 / n125, catalog-bang-r1). Words of a machine translation (kente "Cav Qauv", "Imodeli yeNjini") are
  // not added: those pages are copies of the English one already read.
  const ENGINE_LBL = /engine|发动机|柴油机|引擎|motor\s*model|油机|动力型号|配套动力|\bmesin\b/i;
  const ALT_LBL = /alternator|generator\s*(model|type|brand)|发电机|电球|stamford|leroy|mecc|marathon|engga|alternador/i;
  const STROKE_VAL = /\b(4|four|2|two)[\s-]*(stroke|cycle)|[四二42]\s*冲程/i;
  const GENSET_LBL =/genset|gen-set|generator\s*set|机组/i;
  const PRIME = /prime|\bprp\b|continuous|\bcop\b|常用|主用|liên tục/i;
  // The words that make a figure PRIME (PRP). Continuous / COP is another rating, neither prime nor standby (Khoa 20/11/2026,
  // the rule RATE_OTHER below already has; agg-fuzhou n115-118 "COP (kVA/kW)" and hosem-power n112 "Continuous Power" were
  // read as prime). PRIME above stays for "does the label name some rating" and for the HSMT side.
  const PRIME_RATE = /prime|\bprp\b|常用|主用/i;
  const STANDBY = /standby|stand[\s-]by|\besp\b|\bltp\b|backup|备用|dự phòng|max(imum)?\s*power/i;
  // Engine makes from outside China (Khoa, 2026-10-29: "Xuất xứ: Trung Quốc" in Gợi ý cấu hình leaves them out).
  // A foreign make built under licence in China (Dongfeng / Chongqing Cummins...) still counts as foreign.
  const FOREIGN_ENGINE = new Set(["Cummins", "Perkins", "Baudouin", "Deutz", "Volvo Penta", "MTU", "Mitsubishi", "Doosan", "Hyundai",
    "Kubota", "Yanmar", "Isuzu", "Scania", "John Deere", "Daewoo", "MWM", "Kohler", "Lister Petter", "Honda",
    "Caterpillar", "FPT", "MAN", "Detroit Diesel"]);
  // Model codes of foreign series, for a row that does not name the make.
  const FOREIGN_MODEL = [
    [/^(4BTA?|6BTA?A?|6CTA?A?|6LTAA?|NTA?A?855|KTA?A?19|KTA?38|KTA?50|QS[BKLMNTXZ]|VTA?28|[46]?B\d\.\d|L\d{1,2}(\.\d)?CS|6TAA?\d\.\d)/i, "Cummins"],
    [/^(403[A-D]?|404[A-D]?|1103[A-D]|1104[A-D]|1106[A-D]|1204[A-F]|1206[A-F]|1506[A-D]|1706[A-D]|1806[A-D]|2206[A-D]|2506[A-D]|2806[A-D]|400[68]|4012|4016)-/i, "Perkins"],
    [/^(400[68]|4012|4016)-?\d*T[A-Z]*G/i, "Perkins"],
    // Deutz / MWM designs (BF..M1015, TBD234 / 604 / 620) count as foreign even when built under licence in China.
    [/^(BF\d?[46LM]\d{3,4}|F[2-8]L\d{3}|TCD\d|TBD(234|604|620|62O|314))/i, "Deutz"],
    [/^S\d{1,2}R\d?-/i, "Mitsubishi"], [/^\d?TNV\d/i, "Yanmar"], [/^(D(1005|1105|1305|1703|2203|2403)|V(1505|2003|2203|2403|3300|3600|3800))\b/i, "Kubota"],
    // TWD too (TWD1645GE, TWD1744GE: Volvo Penta's twin-turbo gensets engines), never a bare "WD" (Weichai WD615, Wudong).
    [/^(T?AD|TWD)\d{3,4}/i, "Volvo Penta"], [/^\d{1,2}V\d{4}/i, "MTU"], [/^\d{1,2}M\d{2}/i, "Baudouin"],
    [/^D?(E|D)(08|26|28|32)\d{2}[A-Z]/, "MAN"], [/^(NEF\d|CURSOR|C(87|10|13|16)\s?TE|N(45|67)\s?[A-Z])/i, "FPT"],
    [/^(CAT\s?C\d|35(08|12|16)\b|3412\b|C(15|18|27|32)\b)/i, "Caterpillar"], [/^(DB58|P0?86TI|P1(26|58|80)|P222|DP(086|126|158|180|222))/i, "Doosan"],
    [/^(6|8|12|16)V(71|92|149)\b/i, "Detroit Diesel"],
  ];
  // Well-known model codes of Chinese engines, counted as a stated make when the row does not name it
  // (Khoa, 2026-10-29). Foreign codes win: an engine matching both counts as foreign.
  const CN_MODEL = [
    [/^YC\d/i, "Yuchai"], [/^(WP\d|WD(10|12|615)\b|WHM|CW\d{0,2}V?\d{3}Z)/i, "Weichai"],
    [/^(SC\d{1,2}[A-Z]|SC\d{2}W|[46]135|12V135|G128)/i, "SDEC"], [/^[A-Z]?\d{1,2}V190|^\d?190Z/i, "Jichai"], [/^\d300[A-Z]/i, "Zichai"],
    [/^(YND?\d{3}[A-Z]|YD\d{3,4}|Y\d{3,4}[A-Z])/i, "Yangdong"], [/^(YN\d{2}|D\d{2}TCIF)/i, "Yunnei"], [/^N4\d{3}/i, "Quanchai"],
    [/^(R[46]1\d{2}|ZH4\d{3})/i, "Ricardo"], [/^LR\d[A-Z]/i, "YTO"], [/^(FAW\s|CA\d?D[FLMN]\d|4DX2\d)/i, "FAWDE"],
    [/^HC\d{1,2}V\d{3}/i, "Henan Diesel"], [/^KH(\d|K|N)/i, "Kaihua"],
    // Generic Chinese series: 4100–6113 multi-cylinder, 485–498 small, 178F–198F single-cylinder, 2V88–2V100 twins.
    [/^[A-Z]{0,3}[46]1(00|02|05|08|10|13)[A-Z]/i, "Trung Quốc"], [/^[A-Z]{0,3}[34](80|85|90|93|95|98)[A-Z]/i, "Trung Quốc"],
    [/^[A-Z]{0,3}1[1789]\d{1,2}F/i, "Trung Quốc"], [/^[A-Z]{0,3}2V(80|88|92F|95|100)/i, "Trung Quốc"],
  ];
  // Makes never counted in a group (G7 / G20 / EU), whatever their country (Khoa, 2026-11-11: "loại Deutz ra khỏi G7";
  // the Deutz engines the suppliers offer are licence builds in China: HC12V132, TBD234, TBD620).
  const NO_GROUP = new Set(["Deutz"]);
  // Country of each foreign engine make, for Xuất xứ G7 / G20 in Gợi ý cấu hình and the supplier country filter
  // (Khoa, 2026-11-02). G20 here is its member countries other than China (Khoa: "trừ Trung Quốc"), not the EU.
  const ENGINE_COUNTRY = { Cummins: "US", Perkins: "GB", Baudouin: "FR", Deutz: "DE", "Volvo Penta": "SE", MTU: "DE", Mitsubishi: "JP",
    Doosan: "KR", Hyundai: "KR", Kubota: "JP", Yanmar: "JP", Isuzu: "JP", Scania: "SE", "John Deere": "US", Daewoo: "KR", MWM: "DE",
    Kohler: "US", "Lister Petter": "GB", Honda: "JP", Caterpillar: "US", FPT: "IT", MAN: "DE", "Detroit Diesel": "US" };
  const COUNTRY_GROUP = { g7: ["US", "GB", "DE", "FR", "IT", "JP", "CA"],
    g20: ["AR", "AU", "BR", "CA", "FR", "DE", "IN", "ID", "IT", "JP", "MX", "RU", "SA", "ZA", "KR", "TR", "GB", "US"] };
  // "G7, EU" / "G20 hoặc EU" in the HSMT (Khoa, 2026-11-10: "mở luôn cho EU nếu yêu cầu cho phép EU"): the group and
  // the 27 EU members (Volvo Penta, Scania; Himoinsa in Spain, ComAp in Czechia). Only read from the HSMT, never a
  // choice on the web.
  const EU = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"];
  for (const g of ["g7", "g20"]) COUNTRY_GROUP[g + "eu"] = [...new Set([...COUNTRY_GROUP[g], ...EU])];
  // "other" (a foreign make), "cn" (only Chinese makes) or null (the sources do not say).
  function engineOrigin(names, model) {
    const m = String(model || "").trim(), foreign = FOREIGN_MODEL.filter(([re]) => re.test(m)).map(([, n]) => n);
    const all = [...names, ...foreign, ...(foreign.length ? [] : CN_MODEL.filter(([re]) => re.test(m)).map(([, n]) => n))];
    if (all.some((n) => FOREIGN_ENGINE.has(n))) return "other";
    return all.length ? "cn" : null;
  }

  // Other figures a row gives, read by the label of its column or line. Label and value are kept as the source
  // writes them; the key only groups them. scope: what the figure is about (engine, alternator, or the genset).
  // Order matters: the first label that fits wins ("fuel tank" before "fuel", "cylinder bore" before "cylinder").
  // Each entry: key, scope, Vietnamese name, label pattern, labels to leave out, and the shape a value must have
  // (a value of another shape means the column did not line up with its title).
  // A cooling value names a medium or says "cooled" ("ATS auto load transfer screen" from a shifted column is not one).
  const COOL = /water|liquid|wasser|radiator|glycol|coolant|cool|air[\s/-]*(to|water|air)|oil\s*to\s*air|[水风油液]冷|冷却|fan\b/i;
  // A volume (oil, coolant) is not a "2920*930*1810" size: a walk along a row whose header has fewer titles than the row has cells
  // lays "Coolant capacity" over the size cell (victory-generator n112).
  const SIZE3 = "\\d\\s*[*×xX]\\s*\\d+\\s*[*×xX]\\s*\\d";
  const NO_SIZE_NUM_FIRST = new RegExp(`^(?![\\s\\S]*${SIZE3})\\d`), NO_SIZE_ANY_NUM = new RegExp(`^(?![\\s\\S]*${SIZE3})[\\s\\S]*\\d`);
  const N = /\d/, TXT = /[a-z一-鿿]{3}/i, BY = /\d\s*[*×xX/]\s*\d/;
  // A fuel figure: "35L/h", "199g/KW.h", "0.191", "31,5".
  const FUEL_OK = /^[≤<~≈]?\s*\d[\d.,\s/~-]*\s*(l\s*\/\s*h(r|our)?|lph|g\/kw\.?h|g\/\(kw\.?h\)|g\/kwh|kg\/kw\w*[·.-]?h\w*|l|g|kg\/h|m³\/h|m3\/h|nm3\/h|nm³\/h|litres?\/h(our)?|gal\/h)?\s*$/i, NOT_FUEL = /lub|oil\s*consum|air\s*consum|fan|run(ning)?\s*(time|hours?)/i;
  // `fuel` is the consumption at 100% load: a label naming another load (25%, 70%, 110%, 1/4, "25/50/75/100%") is not it.
  // 75% and 50% are the keys above.
  const OTHER_LOAD = /(?<![\d.])(?!(?:100|75|50)(?![\d.])\s*%)\d{1,3}(?:\.\d+)?\s*%|(?<![\d.])1\s*\/\s*4(?!\d)|¼|25\s*\/\s*50/;
  const NOT_FUEL_100 = new RegExp(`${NOT_FUEL.source}|${OTHER_LOAD.source}`, "i");
  const SPECS = [
    ["tank", "genset", "Bình nhiên liệu", /fuel\s*tank|fuel\s*capacity|tank\s*capacity|油箱/i, /run(ning)?\s*(time|hours?)/i, N],
    // Part loads first: "75%Prime", "75% load(Prime power)", "Fuel consumption75% (of the Prime Power)", "Fuel @75% (L/h)",
    // "75 % Load" (a column title), "75%负载油耗", "3/4 load" (2026-11-09).
    ["fuel75", "genset", "Tiêu hao nhiên liệu 75% tải", /(75\s*%|3\/4)\s*(load|prime|prp|功率|负载|\(?\s*of\s*(the\s*)?prime)|(consum|fuel|油耗|tiêu hao)[^|]{0,40}?(75\s*%|3\/4\s*(load|prp))|@\s*75\s*%/i, NOT_FUEL, FUEL_OK],
    ["fuel50", "genset", "Tiêu hao nhiên liệu 50% tải", /(50\s*%|1\/2)\s*(load|prime|prp|功率|负载|\(?\s*of\s*(the\s*)?prime)|(consum|fuel|油耗|tiêu hao)[^|]{0,40}?(50\s*%|1\/2\s*(load|prp))|@\s*50\s*%/i, NOT_FUEL, FUEL_OK],
    ["fuel", "genset", "Tiêu hao nhiên liệu", /consum|cons\.|\bcons\b|fuel\s*(rate|usage|efficien)|油耗|耗油|燃油消耗|燃油率|燃气消耗|tiêu hao|100\s*%\s*(load|prime|prp|功率|负载)/i, NOT_FUEL_100, FUEL_OK],
    ["noise", "genset", "Độ ồn", /noise|sound\s*(level|pressure)|噪音|噪声|độ ồn|\bdb\(?a?\)?\b/i, null, /(^|\D)([4-9]\d|1[01]\d)(?!\d)/],
    ["dims", "genset", "Kích thước", /dimen|dimention|overall\s*(size|l)|\bsize\b|l\s*[x×*]\s*[wm]\s*[x×*]\s*h|尺寸|kích thước/i, /engine\s*(size|dimen)|motor\s*(size|dimen)|(发动机|柴油机)\s*尺寸/i, BY],
    ["weight", "genset", "Khối lượng", /weigh|重量|毛重|khối lượng|trọng lượng|^\s*kgs?\s*(\(|$)/i, null, /^[≈~]?\s*\d/],
    ["runtime", "genset", "Chạy liên tục", /continuous\s*(run|work)|run(ning)?\s*(time|hours?)/i, null, N],
    ["bore", "engine", "Đường kính × hành trình", /bore|stroke|storke|strock|cylinder\s*diameter|缸径|行程/i, null, /^\d+(\.\d+)?(\s*(mm)?\s*[*×xX/]\s*\d+(\.\d+)?)?\s*[(（]?(mm)?[)）]?$/i],
    ["disp", "engine", "Dung tích xi lanh", /displace|swept|\bdisp\b|排量|排气量/i, null, /^\d+([.,]\d+)?\s*(l|ltr|litres?|cc|ml)?$/i],
    ["cyl", "engine", "Số xi lanh", /cylinder|^cyl|^cil|气缸|缸数/i, /air\s*flow/i, /^(\d{1,2}|\d{1,2}\s*[-–]?\s*(l|v|in\s*-?\s*line|cyl\w*)\b.*|\d{1,2}\s*缸.*|[lv]\s?-?\d{1,2}|in-?line.*|vertical.*|v-?type.*)$/i],
    // ^ "6 in line" / "6in line" (longkai, xinhengxin), "12缸V型水冷" (lees): a count before the layout (bo-doc-tieu-hao).
    ["compr", "engine", "Tỉ số nén", /compression|压缩比/i, null, /^(?!\d+\s+\.\d)(?:[\s\S]*\d\s*[:：]\s*1|\d+(\.\d+)?$)/],
    ["asp", "engine", "Nạp khí", /aspirat|intake|进气|吸气/i, null, /turbo|natural|aftercool|intercool|增压|自然|ta\b|na\b/i],
    ["gov", "engine", "Điều tốc", /gov|调速/i, null, /electr|mechan|electron|ecu|governor|电子|机械|\bg[123]\b|class/i],
    ["emission", "engine", "Tiêu chuẩn khí thải", /emission|排放/i, null, /^(?![\s\S]*stage(?:[4-9]|[1-9]\d)\b)[\s\S]*(?:stage|tier|euro|epa|non-road|exempt|china|\bgb\b|国[一二三四五ⅡⅢⅣ]|[ⅡⅢⅣ]|\b(ii|iii|iv|v)\b|\bt[1-4]\b)/i],
    // ^ "CHINA STAGE4" … "CHINA STAGE18" (baifa n101, a spreadsheet's fill run counting up from "CHINA STAGE3"): no such
    //   stage; a figure glued to "STAGE" from 4 up is not read (catalog-a; no other value in cn/ is written that way).
    ["coolant", "engine", "Nước làm mát", /coolant|cooling\s*water|water\s*(tank|capacity)/i, /temp|温度|pressure|压力|flow/i, NO_SIZE_NUM_FIRST],
    // Charge-air / piston cooling is not the engine's cooling system ("Air/Air cooling", "Aftercooling", "Charge Air Cooling").
    ["aircool", "engine", "Làm mát khí nạp / piston", /after\s*-?cool|charge\s*air|piston\s*cool|inter\s*-?cool|air\s*\/\s*(air|water)\s*cool|增压空气|活塞冷却/i, null, COOL],
    ["cooling", "engine", "Làm mát",/cooling\s*(system|type|method|mode)?$|冷却方式/i, /air\s*flow|after\s*-?cool|charge\s*air|piston|inter\s*-?cool|air\s*\/|增压空气|活塞/i, COOL],
    ["oil", "engine", "Dầu bôi trơn", /lub|oil\s*(capacity|tank|system|sump|ststem)|机油|润滑油/i, /brand|temp|温度|pressure|压力|consum|消耗|耗率|耗量/i, NO_SIZE_ANY_NUM],
    ["start", "engine", "Khởi động", /start|启动方式|起动方式/i, null, /\d\s*v|electric|电/i],
    ["engPower", "engine", "Công suất động cơ", /(engine|gross).*(power|output)|kw\s*\/\s*rpm|kw\/hp/i, null, /^\d/],
    ["speed", "engine", "Tốc độ quay", /speed|\brpm\b|r\/min|转速/i, /regul|rate\s*\(%\)|over\s*-?\s*speed|超速|torque|扭矩|\d\s*v\s*\/\s*\d+\s*hz/i, /\b(1[05]00|1800|3000|3600|[12]\d{3})\b/],
    // Label of an engine maker's sheet (nhóm A, Khoa 21/11/2026): "Thermodynamic Cycle | Diesel 4 stroke". NOT "Injection System" /
    // "Fuel System": they are COLUMNS of many tables with the maker's own codes ("EUI", "ECR", "m-FIP+e-gov."), and a new key there
    // stops the walk along the row (sdec, sr-genset, jichai lost cylinders, emission, speed). config-bot reads them from the sheet.
    ["engType", "engine", "Kiểu động cơ", /^(diesel\s*)?engine\s*type$|^thermodynamic\s*cycle$/i, null, /stroke|cool|vertical|冲程/i],
    // ^ A cell that only names the aspiration ("Turbocharged": jet-power n125, an "Engine type" title over "No. of Cylinder |
    //   Aspirated") or only the cylinders ("6 cylinder in line", yihua n106) is no engine type (L1-B4 / B5, 24/11/2026).
    ["eff", "alternator", "Hiệu suất đầu phát", /efficien|效率/i, /fuel|thermal|overall|total|electrical|热效|综合/i, /\d\s*[%％]|^\d{2}(\.\d+)?$/],
    ["insul", "alternator", "Cấp cách điện", /insulat|绝缘/i, null, /\b[bfh]\b|class|级/i],
    ["ip", "alternator", "Cấp bảo vệ", /protection|\bip\b|防护/i, null, /ip\s?\d/i],
    ["excit", "alternator", "Kích từ / AVR", /excit|\bavr\b|励磁/i, null, /brush|self|pmg|shunt|aref|separately|\bavr\b|自励|永磁|无刷|有刷/i],
    // Not "Telephone harmonic factor (THF)" / TIF: the telephone factors are another figure (all 38 values this key had were THF of shanhua; 24/11/2026).
    ["thd", "alternator", "Méo sóng hài (THD)", /harmonic|\bthd\b|谐波/i, /\bthf\b|\btif\b|telephone|电话/i, /\d\s*[%％]/],
    ["vreg", "alternator", "Ổn định điện áp", /voltage\s*(regul|stab|stead)|调压/i, /time|时间/i, /\d\s*[%％]/i],
    ["freg", "genset", "Ổn định tần số", /frequency\s*(regul|wav|recover|stab)|frequencyrecovery|smooth\s*speed/i, null, /\d\s*[%％s]/i],
    ["current", "genset", "Dòng điện định mức", /rated\s*current|电流/i, /breaker|断路器|空开/i, /^\d/],
    ["voltage", "genset", "Điện áp", /voltage|电压|điện áp/i, /dc|start|level|type|regul|stab|sudden|warp|dip|transient|drop|偏差|fre\w*\s*\/\s*volt|频率\s*\/\s*电压/i, /^\D{0,3}\d{3}/],
    ["pf", "genset", "Hệ số công suất", /power\s*factor|(?<![a-z])cos(?![a-z])|功率因数/i, null, /0[.,]\d|^1$/],
    ["phase", "genset", "Số pha", /phase|wire|相数/i, null, /^[13]$|[13]\s*-?\s*(ph|phase|相)|\d\s*-?\s*wire|three|single|三相|单相/i],
    ["controller", "genset", "Bộ điều khiển", /^(controller|control\s*(module|panel)|控制器)\s*(model|type|brand)?\s*[:：]?$/i, null, /[a-z]{2,}\s?-?\d{3,}/i],
  ];
  const SPEC = Object.fromEntries(SPECS.map(([key, scope, vi, , , ok]) => [key, { scope, vi, ok }]));
  // A label the key's pattern takes that names another property of the same thing (L1-B4, 24/11/2026): "Coolant Ratio | 50%
  // ethylene glycol" (aosif n1062 / 1078 / 1088) is the mix of the coolant, not its volume; "Type of lub-oil | KCN 7805 (sulfur
  // content<=200mg/m3)" (repower-gas n1001) is the oil's grade, not its volume. Such a label has no key.
  const NOT_OF = { coolant: /ratio|mix(ture)?\b|concentrat|配比|比例/i, oil: /\btype\b|grade|viscosit|牌号|标号|粘度/i };
  // Pure in the label and asked for every cell of every row: remembered per label (most of the time of build()).
  const specKeys = new Map();
  function specKey(label) {
    const L = String(label || "").trim();
    if (!specKeys.has(L)) { const k = specKeyOf(L); specKeys.set(L, k && NOT_OF[k]?.test(L) ? null : k); }
    return specKeys.get(L);
  }
  function specKeyOf(L) {
    if (!L || L.length > 70 || /\bmodel\b|型号|brand|make|品牌|厂家/i.test(L)) return null;
    // Genset power is read on its own (powersIn); an engine's own output is kept here.
    // "Oil capacity" / "Coolant capacity" are volumes of the engine (keys oil / coolant), not a rating; a heater, cooler or pump
    // of them, or a kW / kVA figure, stays a power label.
    const volume = /capacity/i.test(L) && /oil|lub|coolant|cooling\s*water|water\s*(tank|capacity)|机油|润滑油/i.test(L) && !/heater|cooler|pump|heat|power|output|rating|功率|\bkw|kva/i.test(L);
    if (!volume && /power|output|capacity|rating|功率/i.test(L) && !/(engine|gross).*(power|output)|kw\s*\/\s*rpm|kw\/hp|power\s*factor|功率因数|tank|fuel|consum|油耗|\d\s*%\s*(load|prime|prp|功率|负载|\(?\s*of)/i.test(L)) return null;
    for (const [key, , , re, not] of SPECS) if (re.test(L) && !(not && not.test(L))) return key;
    return null;
  }
  // "mm*mm" (kanpor "| 缸径*行程 | mm*mm | 114×135 | …"; L1-B9, 24/11/2026): the unit of a bore × stroke column. Read as a value it
  // took the first model's place and every bore moved one model to the right (NTA855-GA got 114×135 for 140×152).
  const UNIT_CELL = /^\(?(kva|kw|kw\/kva|kva\/kw|v|hz|db\(?a?\)?|l\/h|l\/hr|mm|mm\s*[*×x]\s*mm|kg|kgs|l|rpm|r\/min|g\/kw\.?h|g\/kwh|%|a|cm|m)\)?$/i;
  // A cell that is itself a label ("(瞬态电压偏差):", "Exciter Type") is not a value.
  // A cell that is only a fuel unit ("L/h", "L/hr", "L/H", "lph", "g/kWh", "gr/kWh", "g/kW.h", "升/小时"), read as written.
  const FUEL_UNIT_CELL = /^[(（]?\s*(gr?\s*\/\s*\(?\s*kw\s*[.·-]?\s*h\)?|l\s*\/\s*h(r|our)?|lph|lit(re|er)s?\s*\/\s*h(our)?|kg\s*\/\s*h|升\s*\/\s*小?时)\s*[)）]?$/i;
  const LH_CELL = /^[(（]?\s*(l\s*\/\s*h(r|our)?|lph|lit(re|er)s?\s*\/\s*h(our)?|升\s*\/\s*小?时)\s*[)）]?$/i;
  const LH_TEXT = /l\s*\/\s*h|l\/hr|lph|litres?\/h|lít/i, FUEL_UNIT_TEXT = /l\s*\/\s*h|lph|litres?\/h|lít|g\s*\/\s*\(?\s*kw|gr\s*\/\s*kw|kg\s*\/\s*h|升|克/i;
  // "342.9 / 457.1 L/h (@75% / @100%)", "58.5 / 42.8 / 29.3 L/h (100% / 75% / 50% standby)": one figure per load named in the
  // brackets, in order; the brackets hold only loads (and a rating word). → { nums, loads, unit } or null.
  function multiLoad(t) {
    const m = String(t).match(/^\s*(\d[\d.]*(?:\s*\/\s*\d[\d.]*)+)\s*([a-z/]*)\s*[(（]([^)）]*)[)）]\s*$/i);
    if (!m || !/^(\s*@?\s*\d{2,3}\s*%\s*\/?)+\s*(load|standby|prime|prp|esp)?\s*$/i.test(m[3])) return null;
    const nums = m[1].split("/").map((x) => +x.trim()), loads = [...m[3].matchAll(/(\d{2,3})\s*%/g)].map((x) => +x[1]);
    if (nums.length !== loads.length || nums.some((x) => !(x > 0))) return null;
    if (m[2] && !FUEL_UNIT_CELL.test(m[2])) return null;
    return { nums, loads, unit: m[2] || null };
  }
  const specVal = (v) => { const s = String(v || "").trim(); return s && s.length <= 80 && !/^[-–—/]+$/.test(s) && !/[:：]$/.test(s) && !/^[(（][^)）]*[一-鿿]/.test(s) ? s : null; };
  // A value fits its kind when it has the expected shape and is not a model code (a code there means a shifted column).
  const specFits = (key, v) => SPEC[key].ok.test(v) && !(isCode(v) && !/^(asp|gov|emission|engType|excit|controller|cyl)$/.test(key));

  const cellsOf = (line) => {
    const s = String(line).trim();
    if (s.startsWith("|")) return s.split("|").slice(1).map((c) => c.trim()).filter((c, i, a) => c || i < a.length - 1);
    const m = s.match(/^([^:：]{2,60})[:：]\s*(.+)$/);
    return m ? [m[1].trim(), ...m[2].split("|").map((c) => c.trim()).filter(Boolean)] : [s];
  };
  const NUM = /^\d+(?:[.,]\d+)?$/;
  const num = (c) => {
    const t = String(c).replace(/\s+/g, "").replace(/(kva|kw|kwe|kwm)$/i, "");
    return NUM.test(t) ? Number(t.replace(",", ".")) : null;
  };
  const pairOf = (a, b) => {
    if (!(a > 0 && b > 0)) return null;
    const r = Math.max(a, b) / Math.min(a, b);
    return r >= 1.15 && r <= 1.35 ? { kVA: Math.max(a, b), kW: Math.min(a, b) } : null;
  };
  // A model code: letters and digits, at most one space, not a size, unit, emission level or cylinder layout.
  function isCode(c) {
    const s = String(c || "").trim();
    if (s.length < 3 || s.length > 32 || !/[a-z]/i.test(s) || !/\d/.test(s)) return false;
    if ((s.match(/\s/g) || []).length > (ALT_CODE.test(s) ? 2 : SCANIA_CODE.test(s) ? 3 : 1)) return false;
    if (/[\u3000-\u9fff\uff00-\uffef]/.test(s) || /^\d+(\.\d+)?\s*k(w|va)\s*\/\s*\d/i.test(s)) return false;
    if (/\d\s*[*×xX]\s*\d+\s*[*×xX]\s*\d/.test(s)) return false;
    if (/^\d+(\.\d+)?\s*[*×xX]\s*\d+/.test(s)) return false;
    if (/^[\d.,~\-–/\s]+(hz|rpm|r\/min|v|vac|kv|l|ltr|kg|kgs|mm|kw|kva|kwe|db|dba|a|%|cc|ml|g\/kwh|g\/kw\.h|l\/h|hp|ps|nm|°c|h|hrs?)$/i.test(s) || (/\d\s?cc$/i.test(s) && !DOOSAN_DP.test(s))) return false;
    if (/^(ip|class|euro|tier|stage|china|epa|gb|iso|en|iec|bs|ce|non-road|cn|eu)\b/i.test(s) || /^(ip|f|h)\d{1,2}$/i.test(s)) return false;
    if (/^\d{1,2}\s*[lv](\/|$|\s)|^[lv]\s?\d{1,2}$|^\d{1,2}[lv]\/|\/na$|^in-?line/i.test(s)) return false;
    if (/^(n\/a|na|tbd|\d+p)$/i.test(s) || CONTROLLER.test(s)) return false;
    // Cells that are a duration, a pressure, a weight, a count of wheels, a rating written as a model, a standard or a
    // heading + figure (baifa "4 months" = delivery time was read as the engine of the SCANIA rows; tecgen "7 Days",
    // "1500 Hours"; wartsila "22 bar"; byc "6,500 lbs"; cameo "4 Wheels"; elitech "30kKVA"; victory "18KW22.5KVA";
    // yingtai "Tire 2" for Tier 2; camda "IEC 60034 Standard"; man-engines "Combustion 3", "Efficiency 2"). Khoa
    // 24/11/2026 (engine-key-junk): the list is closed and tested over cn/. Also a container size (longkai, previa "20FT",
    // "40HQ", "20GP") and shengfeng's frequency cell "60HZ?".
    if (/^(?:20|40|45)\s*(?:ft|gp|hq|hc)[*x]?$/i.test(s) || /^\d{2}\s*hz\?$/i.test(s)) return false;
    if (/^\d[\d.,]*\s*(?:months?|mths?|years?|yrs?|days?|weeks?|wks?|hours?|hrs?|bar|psi|lbs?|wheels?)$/i.test(s) || /^\d+(?:[.,]\d+)?\s*k\s*(?:kva|kw)$/i.test(s) || /^\d+(?:[.,]\d+)?\s*kw\s*\d+(?:[.,]\d+)?\s*kva$/i.test(s) || /^(?:tire|tier)\s?\d$/i.test(s) || /\bstandard$/i.test(s) || /^(?:combustion|efficiency|mechanical)\s\d{1,2}$/i.test(s)) return false;
    if (/^\d+[\s-]?(ph|phase|wire)/i.test(s) || /(^|[\s,-])(single|three)[\s-]?phase\b|\bphase\b/i.test(s)) return false;
    // Cells of a spec table that are a value, not a model (Khoa 2026-11-17): "≤6S", "100% copper", "800(KW)",
    // "195(g/kw.h)", "208g /kwh", "300 W", "330+250 W", "1800k W", "6-cylinder/inline", "Container 20'", "0,11 m3/s",
    // "[1/min]", "50Hz/ 400V", "700 cSt/50°C", "~14.5 gal/hr", "12 kg/h".
    if (/^[≤≥<>~]|%|[\[\]]|cylinder|\bin-?\s?line\b|container|\bm3\/s$|\bno rad\b|\bqty\b|\bcst\b|\bgal\/h/i.test(s)) return false;
    if (/^\d+(?:[.,]\d+)?\s*(?:[+/]\s*\d+(?:[.,]\d+)?\s*)*\(?\s*(k\s?w|w|g\s?\/\s?k?w\s?\.?h|kg\/h|hz|v)\s*\)?$/i.test(s) || /^\d+(?:[.,]\d+)?\s?(hz|v)\s?\//i.test(s)) return false;
    return true;
  }
  const brandIn = (text, list) => {
    const hit = [];
    for (const [re, name] of list) if (re.test(text) && !hit.includes(name)) hit.push(name);
    return hit;
  };
  const freqIn = (raw, labelOnly = false) => {
    // "1500/1800 RPM SWITCHABLE" (baifa n104, tiêu đề cột của bảng 50 Hz) nêu cả hai tốc độ: không cho tần số nào. Trước đây
    // chỉ "1800 RPM" khớp nên cả bảng thành 60 Hz và luật `freq` loại oan dòng 50 Hz của NCC khác cùng động cơ.
    // "Dual-band 50/60HZ" (awt-aiweite n102), "50/60 Hz" nêu cả hai tần số: cùng nguyên tắc, trước đây chỉ "60HZ" khớp nên thành 60 Hz.
    // Chỉ bỏ cặp, nhãn "Frequency: 50" của chính tờ vẫn đọc được. Số sát chữ / số trước nó là một phần của mã ("GB-D60-50HZ": 60 kVA, 50 Hz).
    const text = String(raw).replace(/\b(?:1500\s*\/\s*1800|1800\s*\/\s*1500)\s*(?:rpm|r\/min)/gi, " ")
      .replace(/(?<![\p{L}\p{N}.])(?:50\s*[\/／&~–-]\s*60|60\s*[\/／&~–-]\s*50)\s*hz(?![\p{L}\p{N}])/giu, " ");
    // Also a frequency LABEL right before the figure ("FREQUENCY(HZ):50" depco, "Frequency (Hz) | 50", "频率(Hz) 50", "Tần số: 50"):
    // only the figure the label stands next to (a unit in brackets or "Hz" may come between), never one further on.
    const lab = (n) => new RegExp(`(?:frequency|freq\\.?|tần\\s*số|频\\s*率)\\s*(?:[(（\\[]\\s*hz\\s*[)）\\]]|\\bhz\\b)?\\s*[:：=|]?\\s*${n}(?![\\d.,%]|\\s*(?:%|v\\b|kw|kva)|\\s*(?:hz)?\\s*(?:[|/,~–-]\\s*|(?:or|and|hoặc|và|或|和)\\s*|\\s)(?:50|60)(?!\\d))`, "i");
    const f50 = (!labelOnly && /50\s?hz|1500\s?(rpm|r\/min)/i.test(text)) || lab(50).test(text), f60 = (!labelOnly && /60\s?hz|1800\s?(rpm|r\/min)/i.test(text)) || lab(60).test(text);
    return f50 && !f60 ? 50 : f60 && !f50 ? 60 : null;
  };
  // Genset outputs in a list of cells: pairs "a/b" in one cell, or two neighbouring numbers.
  // strict (a genset row whose column titles could not be laid over it, 2026-11-17): two neighbouring cells are a kVA / kW
  // pair only when they can be one. Not two cells written with the same unit ("30KVA | 35KVA" is prime and standby), and
  // only at power factor 0.8 within rounding: "550 | 727" (two weights, frs-shenyang), "350 | 408" (genset and engine kW)
  // and "431.3 | 500" (prime and standby kVA) were read as pairs at any ratio from 1.15 to 1.35.
  const unitOfCell = (c) => { const m = String(c).replace(/\s+/g, "").match(/\d(kva|kwe?)$/i); return m ? (/kva/i.test(m[1]) ? "kVA" : "kW") : null; };
  // Within rounding: a kW written whole may be rounded by up to 1 ("13 | 10"); one written with a decimal is not rounded
  // ("5.3 | 4.5", bruno: two kVA).
  const pf08 = (kVA, kW) => Math.abs(kW - 0.8 * kVA) <= Math.max(Number.isInteger(kW) ? 1.01 : 0.11, 0.025 * kVA);
  function powersIn(cells, headerText, strict = false) {
    const pairs = [];
    for (let i = 0; i < cells.length && pairs.length < 2; i++) {
      const c = cells[i];
      const m = String(c).replace(/\s+/g, "").replace(/(kva|kw)/gi, "").match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
      // strict: "254/220" with no unit in the cell is a pair only at power factor about 0.8 (0.75 to 0.86, as fitPair).
      if (m) { const p = pairOf(+m[1], +m[2]); if (p && (!strict || pf08(p.kVA, p.kW) || (p.kW >= 0.75 * p.kVA && p.kW <= 0.86 * p.kVA) || (/kva/i.test(c) && /kw(?!a)/i.test(c)))) pairs.push(p); continue; }
      const a = num(c), b = i + 1 < cells.length ? num(cells[i + 1]) : null;
      if (a != null && b != null) {
        const ua = unitOfCell(c), ub = unitOfCell(cells[i + 1]);
        if (strict && ua && ub) {
          // Both units written: a pair when they differ, whatever the ratio; never when they are the same. More kW than
          // kVA is the two units written the wrong way round ("25kVA | 31.25kW", comappower): the larger is the kVA.
          if (ua !== ub) {
            const p = { [ua]: a, [ub]: b };
            if (p.kW <= p.kVA) pairs.push(p); else if (pf08(p.kW, p.kVA)) pairs.push({ kVA: p.kW, kW: p.kVA });
            i++;
          }
          continue;
        }
        const p = pairOf(a, b);
        if (p && (!strict || pf08(p.kVA, p.kW))) { pairs.push(p); i++; }
      }
    }
    if (!pairs.length) return null;
    if (pairs.length === 2) {
      const [x, y] = pairs[0].kVA >= pairs[1].kVA ? pairs : [pairs[1], pairs[0]];
      return { standby: x, prime: y };
    }
    const p = PRIME_RATE.test(headerText), s = STANDBY.test(headerText), o = /continuous|\bcop\b|liên tục/i.test(headerText);
    return p && !s ? { prime: pairs[0] } : s && !p && !o ? { standby: pairs[0] } : { rated: pairs[0] };
  }
  // The outputs of a genset row read by its column titles (Khoa 2026-11-17: every table checked, 574 records had a pair
  // made of two cells that are no pair). powersIn pairs neighbouring numbers by their ratio alone, so it made a kVA / kW pair of
  // prime and standby in one unit (elitech "Prime Power | Standby Power" over "30KVA | 35KVA"; lees "Standby KVA | Prime
  // KVA | Standby KW | Prime KW"), of the frequency and the first output (victory "Frequency | Prime Power …" over "60 | 50 |
  // 62.5"), of an output and the current, voltage or heat next to it (kangwo, chuangyuan, ettes), and of 50 and 60 Hz
  // columns (tecnogen). Here each output cell gets its unit and its rating from what is written: the cell's own unit
  // ("800kW"), its title ("Prime Power (kVA)"), and the line of sub-titles under a title that spans several cells
  // ("Prime Power | Standby Power" over "KW | KVA | KW | KVA"; "Kw | Kva" over "Rated | Standby | Rated | Standby").
  // Titles are laid from the left: those before the first output title cover one cell each (model, frequency, phase), so
  // the first output cell is known; a spanning title takes as many cells as it has sub-titles. Every cell of the block
  // must be a figure, and the block must end before the engine, else the titles do not fit this row.
  // Returns { power } when the titles fit (power null when they name no unit: "主用功率 | 备用功率" over "20 | 23" is
  // prime and standby in a unit nobody wrote), undefined when they do not (the caller then pairs by ratio, strictly).
  // Every header line with output titles is tried, alone and with each line of sub-titles; the reading that places the
  // most figures wins, and one the figures contradict (more kW than kVA, prime above standby) is dropped. Each change was
  // checked row by row on suppliers/cn (10,543 records); cases in suppliers/power-titles.test.mjs.
  const PW_TITLE = /power|output|capacity|rating|potenza|leistung|puissance|potencia|功率|容量|\bkva\b|\bkwe?\b|prime|st(?:an|na)d?[\s-]?y?by|\bstyb\b|\besp\b|\bprp\b|\bltp\b|主用|备用|常用/i;
  const PW_NOT = /\bcons\b|g\s*\/\s*kw|engine|motor|发动机|柴油机|alternator|发电机(?!组)|电球|heat|therm|\bkwt\b|\bkwm\b|factor|因数|consum|消耗|耗|current|电流|volt|电压|speed|rpm|转速|r\/min|tank|oil|start|charger|lamp|\bw\b|model|型号|frequen|频率|hz\b|weight|重量|dimension|尺寸/i;
  // Ratings as the sources spell them: "Stanby", "Standyby", "STNADBY", "Stand-by", "STYB" (cgm-italia), "P.R.P" /
  // "E.S.P" and "备 用" (undot). "Max power" is standby, as STANDBY above has it; continuous / COP and overload (过载) are
  // neither prime nor standby (Khoa, sheetPowerOf).
  const RATE_PR = /prime|primary|\bprp\b|常用|主用|servicio\s+principal/i, RATE_SB = /st(?:an|na)d?[\s-]?y?by|\bstyb\b|\besp\b|\bltp\b|backup|备用|emergencia|secours|max(imum)?\s*power/i;
  const RATE_OTHER = /continuous|\bcop\b|持续|连续|过载|overload/i;
  const undot = (x) => String(x || "").replace(/(?<=\b[a-z])\.(?=[a-z]\b)/gi, "").replace(/(?<=[一-鿿])\s+(?=[一-鿿])/g, "");
  // A sub-title made only of units and rating words: "KW", "(kVA)", "Standby", "Standby KVA", "COP/Prime", "主用",
  // "Prime Power (KW)", "额定功率".
  const PW_TOKEN = /^(?:[\s()（）\/.:-]*(?:kva|kwe?|st(?:an|na)d?[\s-]?y?by|styb|prime|rated|esp|prp|ltp|cop|master|backup|continuous|power|output|备用|主用|常用|额定|功率))+[\s()（）\/.:-]*$/i;
  const unitsOfTitle = (x) => {
    const s = String(x || "").replace(/g\s*\/\s*kw|kw\s*\.?\s*h|kwm|kwt/gi, " ");
    const dual = s.match(/(kva|kwe?)(?:\s*[\/／\\,-]\s*|\s+)(kva|kwe?)(?![a-z])/i);
    if (dual && /kva/i.test(dual[1]) !== /kva/i.test(dual[2])) return [/kva/i.test(dual[1]) ? "kVA" : "kW", /kva/i.test(dual[2]) ? "kVA" : "kW"];
    const a = /kva/i.test(s), w = /kwe?(?![a-z])/i.test(s);
    return a && !w ? ["kVA"] : w && !a ? ["kW"] : [];
  };
  const rateOfTitle = (x) => {
    const s = undot(x), pr = RATE_PR.test(s), sb = RATE_SB.test(s);
    return pr && !sb ? "prime" : sb && !pr ? "standby" : pr && sb ? "mixed" : RATE_OTHER.test(s) ? "other" : null;
  };
  const orderOfTitle = (x) => { const m = String(x || "").match(/(prime|主用|常用|standby|备用)\s*[\/／]\s*(prime|主用|常用|standby|备用)/i); if (!m) return null; const k = (w) => (RATE_SB.test(w) ? "standby" : "prime"); return k(m[1]) !== k(m[2]) ? [k(m[1]), k(m[2])] : null; };
  const FIG_CELL = /^\d+(?:[.,]\d+)?(?:kva|kwe?)?$/i, PAIR_CELL = /^(\d+(?:[.,]\d+)?)(kva|kwe?)?[\/／](\d+(?:[.,]\d+)?)(kva|kwe?)?$/i, NO_CELL = /^[-–—/]*$/;
  // Two figures under one title that names both units ("Prime (KVA/KW)" over "2750/2200" or over "20 | 16"): the larger
  // is the kVA whatever order the title has (sunny-weifang writes "KW/KVA" over "2750/2200"), and they are a pair only at
  // power factor about 0.8 (0.75 to 0.86: "27.5/33", xinhengxin) or 1: "250/275" under "功率 (KW/KVA)" (xingguang) is
  // prime and standby kW, so it is left out.
  const fitPair = (a, b) => { const p = a >= b ? { kVA: a, kW: b } : { kVA: b, kW: a }; return pf08(p.kVA, p.kW) || p.kVA === p.kW || (p.kW >= 0.75 * p.kVA && p.kW <= 0.86 * p.kVA) ? p : null; };
  function titledPowers(hs, cells, { gi = -1, ei = -1, ai = -1 } = {}, title = "") {
    const stop = Math.min(...[ei, ai, cells.length].filter((i) => i >= 0));
    const isPT = (x) => PW_TITLE.test(undot(x)) && !PW_NOT.test(x);
    const isTok = (x) => PW_TOKEN.test(undot(x));
    const flat = (c) => String(c ?? "").replace(/\s+/g, "");
    const val = (c) => Number(c.replace(/(kva|kwe?)$/i, "").replace(",", "."));
    const ratedWord = (x) => /rated|额定|master/i.test(undot(x));
    const sig = (x) => `${unitsOfTitle(x).join("/")}|${rateOfTitle(x) || (ratedWord(x) ? "rated" : "")}`;
    // The rating a lone figure set takes from the rest of the header: the table's title and the titles that are not about
    // the engine or another quantity ("柴油机功率（KW）主/备用" says nothing about the genset's output).
    const ctx = title + " " + hs.flat().filter((x) => !PW_NOT.test(x)).join(" ");
    // One reading: the titles PT of line h laid from cell p0, with the sub-titles sub (none: []); two = a title naming both
    // units spans two cells of bare figures. Null when the titles do not fit the row or contradict its figures.
    const read = (PT, p0, wider, sub, two, lone) => {
      const run = PT.length;
      // Cells per title: as many sub-titles as stay different from one another ("KW | KVA", "Rated | Standby"), one when
      // there is a sub-title per title ("(kW) | (kW)": units, not columns) or none.
      let k = 1;
      if (sub.length >= 2 * run) {
        k = 2;
        while ((k + 1) * run <= sub.length && new Set(sub.slice(0, k + 1).map(sig)).size === k + 1) k++;
        if (new Set(sub.slice(0, k).map(sig)).size !== k) k = 1;
      }
      const perTitle = k === 1 && sub.length === run;
      // A row wider than its titles, the titles naming no unit and no sub-title naming one: which title spans is not known.
      if (k === 1 && wider >= run && PT.every((x) => !unitsOfTitle(x).length) && !(perTitle && sub.some((x) => unitsOfTitle(x).length))) return null;
      const got = {}, clash = new Set(), bare = new Set(), at = {}, inh = new Set(), subU = new Set();
      let pos = p0, any = false, twoUsed = false, same = false, own = false, ordered = false;
      const put = (rate, unit, v, soft, key) => {
        if (!rate || rate === "other" || rate === "mixed" || !unit || !(v > 0)) return;
        const r = (got[rate] = got[rate] || {});
        if (soft && r[unit] == null) inh.add(rate + unit);
        // A second figure for one rating and unit: a title of its own (the 60 Hz columns after the 50 Hz ones) leaves the
        // first; a cell that only inherits its rating ("Standby power | /kw" over "20kW | 16kW") contradicts it; two
        // titles that name no rating ("kW/kVa | kW/kVa", sanq-power; "Pierwsza moc | Maksymalna moc", fengmao) do not say
        // which is which.
        if (r[unit] != null) { if (soft && r[unit] !== v) clash.add(rate); else if (rate === "rated" && r[unit] !== v && !/[56]0\s*hz|1[58]00\s*(rpm|r\/min)/i.test(key)) same = true; return; }
        r[unit] = v;
        at[rate] = title;
      };
      let last = null, title = 0;
      for (let j = 0; j < run; j++) {
        title = j;
        const t = PT[j], tUnits = unitsOfTitle(t), order = orderOfTitle(t);
        let tRate = rateOfTitle(t);
        // A title that is only a unit ("/kw", "KVA") carries the rating of the title before it.
        const inherits = !tRate && /^[\s()（）\/.:-]*(kva|kwe?)[\s()（）\/.:-]*$/i.test(t) && last;
        if (inherits) tRate = last; else if (tRate && tRate !== "mixed") last = tRate;
        for (let i = 0; i < k; i++) {
          const s = k > 1 ? sub[j * k + i] : perTitle ? sub[j] : "";
          const sUnits = unitsOfTitle(s), sRate = rateOfTitle(s) || (ratedWord(s) ? "rated" : null);
          const dualU = sUnits.length === 2 ? sUnits : tUnits.length === 2 && !sUnits.length ? tUnits : null;
          // The title's own rating first: a sub-title is asked only when the title names none ("Kw" over "Rated | Standby").
          const rate = (tRate && tRate !== "mixed" ? tRate : null) || (sRate && sRate !== "mixed" ? sRate : null) || "rated";
          const key = (t + "|" + s).toLowerCase().replace(/\s+/g, "");
          if (two && dualU) {
            const a = flat(cells[pos]), b = flat(cells[pos + 1]);
            pos += 2;
            if (pos > stop) return null;
            if (NO_CELL.test(a) && NO_CELL.test(b)) continue;
            if (!FIG_CELL.test(a) || !FIG_CELL.test(b)) return null;
            any = twoUsed = true;
            const ua = unitOfCell(a), ub = unitOfCell(b);
            if (ua && ub) { if (ua !== ub) { put(rate, ua, val(a), inherits, key); put(rate, ub, val(b), inherits, key); } continue; }
            const p = fitPair(val(a), val(b));
            if (p) { put(rate, "kVA", p.kVA, inherits, key); put(rate, "kW", p.kW, inherits, key); }
            continue;
          }
          const c = flat(cells[pos]);
          pos++;
          if (pos > stop) return null;
          if (NO_CELL.test(c)) continue;
          const pm = c.match(PAIR_CELL);
          if (!pm && !FIG_CELL.test(c)) return null;
          any = true;
          if (pm) {
            const a = +pm[1].replace(",", "."), b = +pm[3].replace(",", "."), ua = pm[2] && (/kva/i.test(pm[2]) ? "kVA" : "kW"), ub = pm[4] && (/kva/i.test(pm[4]) ? "kVA" : "kW");
            const ord = order || orderOfTitle(s);
            if (ua && ub) { if (ua !== ub) { put(rate, ua, a, inherits, key); put(rate, ub, b, inherits, key); } else if (ord) { put(ord[0], ua, a); put(ord[1], ua, b); } }
            // "60/70" under "输出功率 (主用/备用)" (bdadl): prime and standby in a unit nobody wrote, no kVA / kW pair.
            else if (ord) { const u = ua || ub || (tUnits.length === 1 ? tUnits[0] : sUnits.length === 1 ? sUnits[0] : null); if (!u) ordered = true; put(ord[0], u, a); put(ord[1], u, b); }
            else { const p = dualU ? fitPair(a, b) : pairOf(a, b); if (p && (dualU || pf08(p.kVA, p.kW))) { put(rate, "kVA", p.kVA, inherits, key); put(rate, "kW", p.kW, inherits, key); } }
            continue;
          }
          // The unit: the cell's own, then (a title over several cells) its sub-title, then the title.
          const tUnit = tUnits.length === 1 ? tUnits[0] : null, sUnit = sUnits.length === 1 ? sUnits[0] : null;
          const unit = unitOfCell(c) || (k > 1 ? sUnit || tUnit : tUnit || sUnit) || null;
          if (!unit && !dualU && wider <= 0 && (rate === "prime" || rate === "standby")) bare.add(rate);
          if (unitOfCell(c)) own = true;
          // the unit written in the sub-title of this very column ("Standby KVA | Prime KVA" under "POWER", baifa)
          else if (k > 1 && sUnit) subU.add(rate);
          put(rate, unit, val(c), inherits, key);
        }
      }
      if (!any || same || (two && !twoUsed)) return null;
      for (const r of clash) delete got[r];
      // A unit-only title that took the rating of the title before it ("Prime Power (kW) | Standby (kW) | kVA" over "20 | 22 |
      // 25", jinjia-power: the 25 kVA is the prime 20 kW at 0.8, not the standby 22 kW) and makes with that rating's other
      // unit no pair at power factor 0.75–0.86 (or 1): its rating is not known, the figure is left out (catalog-bang-r1).
      for (const [rt, r] of Object.entries(got)) {
        if (!(r.kVA && r.kW)) continue;
        const q = r.kW / r.kVA;
        if ((q >= 0.75 && q <= 0.86) || q === 1) continue;
        for (const u of ["kVA", "kW"]) if (inh.has(rt + u)) delete r[u];
        if (!Object.keys(r).length) delete got[rt];
      }
      // What the figures themselves rule out: more kW than kVA, a prime output above the standby one, and a "prime" that
      // is 0.8 of the "standby" in the one unit both have ("输出功率(kw)" over "主用 | 备用" over "50 | 62.5", bdadl: kW and
      // kVA under the wrong titles). A pair below power factor 0.7 is a figure typed wrong ("150 | 1187.5", gordon-power;
      // "2068 | 165", kaihua): that rating is left out.
      for (const r of Object.values(got)) if (r.kVA && r.kW && r.kW > r.kVA * 1.001) return null;
      for (const [k, r] of Object.entries(got)) if (r.kVA && r.kW && r.kW < 0.7 * r.kVA) delete got[k];
      for (const u of ["kVA", "kW"]) {
        const p = got.prime && got.prime[u], s = got.standby && got.standby[u];
        if (!p || !s) continue;
        if (p > s * 1.001) return null;
        // (the row's titles are then not trusted at all; figures that carry their own unit, "8kVA | 10kVA", or that
        // each have a title of their own, "kVA LTP | kVA PRP" over "2500 | 2000", stand; so do figures whose unit is
        // written in the sub-title of each of the two columns, "Standby KVA | Prime KVA" under one title "POWER" over
        // "2500 | 2000": the source says the unit twice (Khoa 23/11/2026; a unit in the covering title only still vetoes)
        if (!own && !(subU.has("prime") && subU.has("standby")) && at.prime === at.standby && Object.keys(got.prime).length === 1 && Object.keys(got.standby).length === 1 && Math.abs(p - 0.8 * s) <= 0.011 * s) return { veto: true };
      }
      let n = 0;
      for (const r of Object.values(got)) n += Object.keys(r).length;
      // Prime and standby titled over figures in a unit nobody wrote ("主用功率 | 备用功率" over "20 | 23", no line of
      // sub-titles, no figure after them): no output can be read, and the two cells are no kVA / kW pair either.
      if (!n && ordered) return { n: 0, got: null, end: pos };
      if (!n) return lone && bare.size === 2 && !(pos < stop && (FIG_CELL.test(flat(cells[pos])) || PAIR_CELL.test(flat(cells[pos])))) ? { n: 0, got: null, end: pos } : null;
      // One figure set with no rating word on its title: the rating the rest of the header names.
      let power = got;
      if (got.rated && !got.prime && !got.standby) {
        const p = RATE_PR.test(undot(ctx)), s = RATE_SB.test(undot(ctx));
        if (p && !s) power = { prime: got.rated }; else if (s && !p) power = { standby: got.rated };
      }
      return { n: n * 4 + (got.prime ? 1 : 0) + (got.standby ? 1 : 0), got: power, end: pos };
    };
    // Every line that has output titles is tried, with each line of sub-titles and with none; the reading that places the
    // most figures is kept (the line "Prime Power (kW) | Prime Power (kVA) | …" under "… | Prime | Standby", acepow).
    let best = null, veto = false;
    for (const h of hs) {
      const tp = h.findIndex(isPT);
      if (tp < 0) continue;
      let run = 0;
      while (tp + run < h.length && isPT(h[tp + run])) run++;
      // Where the first output cell is: the genset's model under its title, else the titles from the row's first cell (a
      // blank first title with a row one cell shorter is a stray cell), else, on a line of sub-titles that starts with the
      // outputs, right after the model.
      const tm = h.slice(0, tp).findIndex((x) => /model|型号|机组|^\s*type\s*$|set\s*type/i.test(x));
      let p0;
      // (gi > 1: the genset code is in a column after the outputs, "功率 | 备用功率 | 品牌 | 整机编号", zhengchi; they are not "right after the model")
      const subline = gi >= 0 && gi <= 1 && tm < 0 && tp === 0;
      if (gi >= 0 && tm >= 0) p0 = tp + gi - tm;
      else if (subline) p0 = gi + 1;
      else if (!h[0] && h.length === cells.length + 1) p0 = tp - 1;
      else p0 = tp;
      if (p0 < 0 || (gi >= 0 && tm < 0 && tp > 0 && p0 <= gi)) continue;
      // A figure where the model's title is (the row has no model cell, weiman "10 | 12.5 | 11 | 14"): the titles are
      // shifted by cells nobody can count.
      if (gi < 0 && tm >= 0 && FIG_CELL.test(flat(cells[tm]))) continue;
      // How many cells the row has beyond this line's titles (laid from the same first cell).
      const wider = subline ? 0 : cells.length - h.length - (p0 - tp);
      // The sub-titles of the outputs: the first run of unit / rating words on another line, where the outputs start.
      // A title followed by blank titles spans them when that line has a sub-title under each ("STANDBY POWER |  | PRIME
      // POWER | " over " | KVA | KW | KVA | KW", sunkings): each cell then has its title and its sub-title.
      const PT = h.slice(tp, tp + run), tries = [[PT, []]];
      for (const u of hs) {
        if (u === h) continue;
        const i = u.findIndex(isTok);
        if (i < 0 || ![0, tp - 1, tp, p0].includes(i)) continue;
        let n = 0;
        while (i + n < u.length && isTok(u[i + n])) n++;
        tries.push([PT, u.slice(i, i + n)]);
        if (i !== tp) continue;
        const wide = [];
        for (let t = tp; t < h.length && isTok(u[t]) && (isPT(h[t]) || (!h[t] && wide.length)); t++) wide.push(h[t] || wide[wide.length - 1]);
        if (wide.length > run) tries.push([wide, u.slice(tp, tp + wide.length)]);
      }
      for (const [titles, sub] of tries) for (const two of [false, true]) {
        const r = read(titles, p0, wider - (titles.length - run), sub, two, tries.length === 1);
        if (r && r.veto) { veto = true; continue; }
        // The cells this line's titles account for: its outputs and, on a line that goes on, the titles after them.
        if (r && (!best || r.n > best.n)) best = { ...r, start: p0, end: subline ? r.end : Math.max(r.end, p0 + h.length - tp) };
      }
    }
    if (!best || veto) return undefined;
    // The figures against the titles. Two neighbouring cells that are a kVA / kW pair at power factor 0.8 stand against
    // the reading when the titles do not account for them: a header shorter than the row ("Model | [kVA]" over "10P | 10 |
    // 8 | 11 | 8,8", cgm-italia), or two such pairs of which the titles call a kVA a kW ("功率（主用）Power(KW) | 功率（备用）
    // Power(KW)" over "250 | 313 | 275 | 344", yingtai-group). Then the titles are not trusted and the caller pairs strictly.
    // Not when such a pair starts before the outputs, on a cell with a title of its own ("Frequency | Prime Power …" over
    // "50 | 64 | 80 | 70 | 88", victory: 50 Hz and 64 kW are no pair).
    const from = gi >= 0 ? gi + 1 : 0, alt = powersIn(cells.slice(from, stop), "", true);
    if (alt) {
      const has = (c, v) => { const m = c.match(PAIR_CELL); return m ? +m[1].replace(",", ".") === v || +m[3].replace(",", ".") === v : FIG_CELL.test(c) && val(c) === v; };
      const at = (v) => { const i = cells.findIndex((c, j) => j >= from && j < stop && has(flat(c), v)); return i < 0 ? Infinity : i; };
      const figs = Object.values(alt).flatMap((p) => Object.entries(p)).map(([u, v]) => [u, v, at(v)]);
      const mine = new Map();
      for (const p of Object.values(best.got || {})) for (const [u, v] of Object.entries(p)) mine.set(v, u);
      const both = Object.values(alt).filter((p) => p.kVA && p.kW).length === 2;
      if (!figs.some(([, , i]) => i < best.start) && (figs.some(([, , i]) => i >= best.end) || (both && figs.some(([u, v]) => mine.has(v) && mine.get(v) !== u)))) return undefined;
    }
    return { power: best.got };
  }
  // Label tables ("Engine model: X", "| Prime power | 300kVA |"): one model per value column.
  // A heading line of a datasheet: "engine" / "alternator" for the part the lines below are about, null for a genset
  // section (performance, dimensions...), "keep" for a sub-heading that does not change the part ("Cooling system"),
  // undefined when the line is not a heading.
  function headingOf(text) {
    const s = String(text || "").trim().replace(/[:：]$/, "");
    if (!s || s.length > 50 || /[:：|]/.test(s) || /\d/.test(s) || !/[a-z一-鿿]{3}/i.test(s)) return undefined;
    if (/^(diesel\s+|gas\s+)?engine(\s+(specifications?|spec|data|parameters?|technical\s+(data|specifications?|parameters?)|details?|information))?$|^(发动机|柴油机)(参数|技术参数|技术规格)?$/i.test(s)) return "engine";
    if (/^(alternator|generator)(\s+(specifications?|spec|data|parameters?|technical\s+(data|specifications?|parameters?)|details?|information))?$|^(发电机|电球)(参数|技术参数|技术规格)?$/i.test(s)) return "alternator";
    if (/^(general|performance|genset|generator\s+set|dimensions?|weights?|canopy|enclosure|control|controller|standards?|package|scope|fuel\s+consumption|机组|外形|控制)/i.test(s)) return null;
    return "keep";
  }
  // bareModel: a bare "Model: X" with no part heading above it is the engine, or the alternator when X is an
  // alternator code (a page listing gensets one after the other: "Model: KTAA19-G6A" ... "Model: HC534FS").
  // engineModel: an engine maker's table (a datasheet that lists its engines side by side: "| Model | NEF45TM2A | NEF67TM3A"):
  // the bare "Model" row names the engines, one per column, not gensets.
  // Sheets of one model whose rows hold two label | value pairs, each part under a "Details" row (Depco, Kena:
  // "| Details Engine | Brand | Weichai", "| Model | WP10D238E201 | Fuel | Diesel", "| Prime output | 180kW/225kVA |
  // Standby output | 200kW/250kVA"; Khoa 16/11/2026): the "Details" cell is a heading, every pair a line of its own.
  const DETAILS = /^details\s+(\S.*)$/i;
  function unpairDetails(lines) {
    if (!lines.some((l) => DETAILS.test(cellsOf(l)[0] || ""))) return lines;
    const out = [];
    for (const l of lines) {
      let c = cellsOf(l);
      const d = (c[0] || "").match(DETAILS);
      if (d) {
        out.push(`| ${d[1].trim()}`); c = c.slice(1);
        // "| Details Genset | Model | ZSY-300" (Kena): the model of the genset section is the genset's.
        if (/genset|generator\s+set/i.test(d[1]) && /^model$/i.test(c[0] || "")) c = ["Genset Model", ...c.slice(1)];
      }
      // "| 3 phase power | Rated power | 300kw/375kva | Rated voltage | 230V/380V" (Kena): a sub-heading, then pairs.
      if (c.length >= 5 && c.length % 2 === 1) { out.push(`| ${c[0]}`); c = c.slice(1); }
      if (c.length >= 4 && c.length % 2 === 0) for (let i = 0; i < c.length; i += 2) out.push(`| ${c[i]} | ${c[i + 1]}`);
      else if (c.length) out.push(`| ${c.join(" | ")}`);
    }
    return out;
  }
  function fromLabelTable(lines0, { bareModel = false, engineModel = false, note = () => {} } = {}) {
    // "| Engine Model: | 404A-22G1 | Alternator Model: | TAL-A40-F" (acepow): two "label: | value" pairs on one line are two
    // lines; read as one, the second label and its value became more values of the first (TAL-A40-F an engine).
    const lines = unpairDetails(lines0).flatMap((l) => { const c = cellsOf(l); return l !== undefined && c.length === 4 && /[:：]$/.test(c[0]) && /[:：]$/.test(c[2]) ? [`| ${c[0]} | ${c[1]}`, `| ${c[2]} | ${c[3]}`] : [l]; });
    // A "Details" sheet names its genset in the heading row: a bare "Model" whose part heading the page lost
    // (depco "| Model | 4B3.9-G1 | Fuel | Diesel" with no "Details Engine" above) is the engine or the alternator.
    // The engine comes first on these sheets: the first bare "Model" is the engine, the next the alternator (an
    // alternator-like code is no sign here: Mitsubishi's engine "S4L2" looks like a Stamford frame).
    const details = unpairDetails(lines0) !== lines0;
    if (details) bareModel = true;
    const cols = [];
    // "3,333" is 3333 (comma and exactly three digits: thousands, Khoa 14/11/2026), unless the sheet's own lines write
    // decimal commas ("3,51 l/h", "12,5": then "3,333" stays unknown and is left out; mwm n1028 read 3.333 kW for 3333).
    const decComma = lines0.some((l) => /\d,\d{1,2}(?![\d,])/.test(l));
    const fnum = (s) => (/^\d{1,3}(,\d{3})+$/.test(s) ? (decComma ? NaN : +s.replace(/,/g, "")) : +s.replace(",", "."));
    // The first line naming a value wins: single-model pages often list related models further down.
    const put = (j, k, v) => { const c = (cols[j] = cols[j] || {}); if (c[k] == null) c[k] = v; };
    // A second line adds the other unit of a rating only when the two are one output: kW = 0,8 × kVA (rounded) or
    // kW = kVA. Else the later line is another machine's ("Prime Power: 312.5KVA" of the genset, then "Prime power |
    // KW | 280" of its engine, longkai: 312,5 kVA / 280 kW; rà soát 18/11/2026) and is left out.
    const merge = (j, k, v) => {
      const c = (cols[j] = cols[j] || {}), cur = c[k] || {}, nx = { ...v, ...cur };
      const cross = (cur.kVA != null) !== (cur.kW != null) && nx.kVA != null && nx.kW != null;
      if (cross && nx.kW !== nx.kVA && Math.abs(nx.kW - 0.8 * nx.kVA) > Math.max(0.5, 0.02 * nx.kVA)) return;
      c[k] = nx;
    };
    // Datasheets put the engine and the alternator under their own heading ("Engine specification", then
    // "Model | 4B3.9-G11"): a bare "Model" or "Brand" line belongs to the part whose heading it is under.
    let part = null, splitHead = false;
    // GFE datasheets head the sheet with "| Engine | Alternator", then "| Cummins | Stamford | GFE2200CSC" (makes and
    // the genset model) and "| QSK50-G17 | S7L1D-G41" (models): stack counts the lines read after that heading.
    let stack = 0;
    // The cells of the last line of fuel units ("| Rating | gr/kWh | L/hr"): the unit of each column of the fuel lines below.
    let fuelUnits = null;
    // Models running across line up at the right: a row with a second label cell ("| Engine | Engine Model | LPG210 |
    // LPG420 | LPG620" beside "| Frequency (Hz) | 50 | 50 | 50") has its extra cells joined to the label (2026-11-03:
    // LPG420 took the 8.5 kVA of LPG620).
    // Only a table where most rows have several values: a single-model sheet may put two pairs on one row
    // ("| Cooling Method | Water Cooling | Ambient Temp | ≤40 C").
    const all = lines.map((l) => cellsOf(l).length - 1).filter((n) => n >= 1), widths = all.filter((n) => n >= 2), count = new Map();
    for (const n of widths) count.set(n, (count.get(n) || 0) + 1);
    const W = widths.length >= all.length * 0.6 ? [...count].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] : null;
    // Engines side by side: a row that does not have exactly one value per model (cells merged over several models in
    // the source) cannot be laid over the columns, so none of it is used.
    const MODEL_ROW = /^(model|model\s*series|models?|型号)$/;
    const M = engineModel ? (lines.map((l) => cellsOf(l)).find((c) => c.length > 2 && MODEL_ROW.test(c[0].replace(/[:：\s]+$/, "").toLowerCase())) || []).slice(1).filter(Boolean).length : 0;
    // A generating set runs at 1000-1800 rpm (3000 / 3600 for two poles): a column whose rated speed is written and is another
    // (Yuchai "Rated power/Speed | 176/2200": a vehicle engine) is not read; a column with no rated speed stays.
    const badCol = new Set();
    if (M) for (const l of lines) {
      const c = cellsOf(l), lb = (c[0] || "").toLowerCase();
      if (!/(rated|power|kw)[^|]*(speed|rpm|r\/min)|rated\s*(speed|rpm)|额定转速/.test(lb) || /over|idle|max|torque/.test(lb)) continue;
      const v = c.slice(1).filter((x) => x && !UNIT_CELL.test(x));
      if (v.length !== M) continue;
      v.forEach((x, j) => { const r = Number(((/power|kw/.test(lb) && x.includes("/") ? x.split("/")[1] : x).match(/\d{3,4}/) || [])[0]); if (r && ![1000, 1200, 1500, 1800, 3000, 3600].includes(r)) badCol.add(j); });
    }
    // The label of a line ("Engine Type: 4-stroke diesel", "| Rated Engine Output | …"): what stands before the value.
    const labelOf = (x) => String(x || "").replace(/^\|\s*/, "").split(/[:：|]/)[0];
    const plainSheet = !details && lines.every((x) => !String(x).includes("|")) && lines.filter((x) => /^\s*model\s*[:：]/i.test(x)).length >= 2
      && !lines.some((x) => /(engine|alternator|generator|genset)\s*(model|ref)/i.test(labelOf(x)));
    // A line of the genset's output (its label), and the output labels naming no rating that the sheet repeats with other figures
    // while another line names prime or standby (L1-B7, 24/11/2026; endress n1017: "Prime power (PRP) [kVA/kW] | 45,5/36,4", then
    // "Power [kVA/kW] | 21,8/17,5", "| 25/20", … for the other sets of the range): those lines list other products, none is read.
    const OUT_LINE = (L) => /power|output|capacity|rating|功率|công suất/i.test(L) && !/factor|engine|消耗|consum|start|heater|charg|battery|启动|起动|加热|充电/i.test(L);
    const listedOut = new Set();
    {
      const seen = new Map();
      let named = false;
      for (const l of lines) {
        const c = cellsOf(l), L = String(c[0] || "").toLowerCase();
        if (c.length < 2 || !OUT_LINE(L)) continue;
        if (PRIME_RATE.test(L) || STANDBY.test(L)) { named = true; continue; }
        const k = L.trim(), v = c.slice(1).join("|");
        if (!seen.has(k)) seen.set(k, new Set());
        seen.get(k).add(v);
      }
      // Only a label that names the pair of units ("[kVA/kW]") written with two different figures or more (endress n1020: "Power
      // [kVA/kW] | 35,1/28,1", then "| 43/34,4", its own): a range list.
      if (named) for (const [k, vs] of seen) if (vs.size >= 2 && /kva\s*\/\s*kw|kw\s*\/\s*kva/i.test(k)) listedOut.add(k);
    }
    for (const [li, l] of lines.entries()) {
      let c = cellsOf(l);
      // Only label words are joined; numbers there are a second figure per model (50 / 60 Hz columns).
      if (W && c.length - 1 > W && c.length - 1 <= W + 2 && !c.slice(1, c.length - W).some((x) => /\d/.test(x))) c = [c.slice(0, c.length - W).filter(Boolean).join(" "), ...c.slice(c.length - W)];
      if (c.length === 2 && /^engine$/i.test(c[0]) && /^alternator$/i.test(c[1])) { stack = 1; continue; }
      if (stack === 1 && c.length >= 2 && c.length <= 3 && !c.slice(0, 2).some((x) => /\d/.test(x))) {
        put(0, "engineBrand", c[0]); put(0, "altBrand", c[1]); if (c[2] && isCode(c[2])) put(0, "genset", c[2]); stack = 2; continue;
      }
      if (stack === 2 && c.length === 2 && isCode(c[0]) && isCode(c[1])) { put(0, "engine", c[0]); put(0, "alternator", c[1]); stack = 0; continue; }
      stack = 0;
      // A two-column PDF sets a part heading in front of the other column's line ("| Engine-SDEC | Power factor | 0.8",
      // longkai): the heading starts the part, the rest is read as a line. Without it the engine's "Model" below was
      // read under "Alternator" (rà soát 18/11/2026: 136 engines read as alternators).
      const lead = c.length >= 3 && c[0].match(/^(engine|alternator)\s*[-–]\s*[a-z][a-z ]*$/i);
      if (lead) { part = lead[1].toLowerCase(); splitHead = false; c = c.slice(1); }
      // "| 发动机 | 参" / "| 发动机 | 参 数 DIESEL ENGINE SPECIFICATION" (shanhua n1024 / n1028; L1-B8, 24/11/2026): the heading
      // "发动机参数" split by the PDF into two cells, the second starting with "参" (of 参数, parameters). Read as the heading it is.
      const split = c.length === 2 && /^参/.test(c[1]) && /^(发动机|柴油机|发电机|电球)$/.test(c[0]);
      const head = c.length === 1 ? headingOf(c[0]) : split ? headingOf(c[0]) : undefined;
      if (head !== undefined) { if (head !== "keep") { part = head; splitHead = split; } continue; }
      // "| Noise(LP1m): 100dB(A)": label and value in one cell.
      if (c.length === 1) { const m = c[0].match(/^([^:：]{2,60})[:：]\s*(.+)$/); if (m) c = [m[1].trim(), m[2].trim()]; }
      if (c.length < 2) continue;
      const label = c[0];
      let vals = c.slice(1).filter((v) => v && !/^(kva|kw|kw\/kva|kva\/kw|v|hz)$/i.test(v));
      const unitCell = c.slice(1).find((v) => /^(kva|kw)$/i.test(v));
      if (!vals.length) continue;
      const L = label.toLowerCase();
      const bare = L.replace(/[:：\s]+$/, "");
      if (M && !MODEL_ROW.test(bare) && c.slice(1).filter((v) => v && !UNIT_CELL.test(v)).length !== M) continue;
      if (part && /^(model|model\s*no\.?|type\s*model|型号)$/.test(bare)) {
        // "| Model | LONGKAI | LK444E": the make, then the model (longkai datasheets).
        const mv = vals.length === 2 && !/\d/.test(vals[0]) && /^[a-z][a-z .&-]+$/i.test(vals[0]) && isCode(vals[1]) ? vals[1] : vals[0];
        if (isCode(mv)) put(0, part === "engine" ? "engine" : "alternator", mv);
        continue;
      }
      if (bareModel && !part && /^(model|model\s*no\.?|型号)$/.test(bare)) { if (isCode(vals[0])) put(0, (details ? cols[0]?.engine != null : ALT_CODE.test(vals[0])) ? "alternator" : "engine", vals[0]); continue; }
      // A sheet with no part headings (himoinsa, hipower: "Rated Engine Output: …", "Model: 4TNV88BGGEH", "Engine Type:
      // 4-stroke diesel" … "Model: S1L2.J1"): a bare "Model" beside an engine's line is the engine, not the genset;
      // a later one written as an alternator's code is the alternator (rà soát 18/11/2026: the engine was read as the
      // genset, "4-stroke diesel" as the engine).
      // Only such a sheet: every line "label: value" with no cells, two "Model" lines or more, none of them naming its part.
      if (plainSheet && !part && !bareModel && bare === "model" && c.length === 2) {
        const eng = cols[0]?.sheetEngine, code = isCode(vals[0]) && !/\s/.test(vals[0]);
        if (!eng && !code) continue;
        if (!eng && [lines[li - 1], lines[li + 1]].some((x) => ENGINE_LBL.test(labelOf(x)))) { put(0, "engine", vals[0]); cols[0].sheetEngine = true; continue; }
        if (eng && code && cols[0].alternator == null && ALT_CODE.test(vals[0])) { put(0, "alternator", vals[0]); continue; }
        // A third one (a second alternator offered, a controller) is not the genset's model.
        if (eng) continue;
      }
      if (part && /^(brand|make|manufacturer|品牌|厂家|制造商)$/.test(bare)) { put(0, part === "engine" ? "engineBrand" : "altBrand", vals[0]); continue; }
      // A line of fuel units only ("| Rating | gr/kWh | L/hr" over "| 100% PRP | 193 | 156", Baudouin 6M31G825/5 [1021]): the unit
      // of each column of the fuel lines below it with as many cells.
      if (c.length >= 3 && c.slice(1).every((x) => FUEL_UNIT_CELL.test(String(x).trim()))) fuelUnits = c.slice(1).map((x) => String(x).trim());
      const sk = specKey(label);
      if (sk && /^fuel/.test(sk) && !W) {
        const col = (cols[0] = cols[0] || {}), specs = (col.specs = col.specs || []), got = {};
        let load = sk === "fuel75" ? 75 : sk === "fuel50" ? 50 : 100;
        // The unit of a value cell (bo-doc-tieu-hao, Khoa 20/11/2026): a unit cell of the same line before it ("| 100% load(Prime
        // power) | L/h | 15", longkai; "| 100%负载油耗 | L/H | 384.05", lees), else the cell of its column in the unit line above.
        // Read as written, never by the figure. The L/h figure is taken before another unit's (the g/kWh column was read as
        // the figure); the unit cell is kept verbatim as `unitCell` for spec-norm, the value cell as written.
        const cells = c.slice(1), byLine = fuelUnits && fuelUnits.length === cells.length ? fuelUnits : null;
        let inUnit = null;
        const take = (k, val, unit) => {
          const lh = LH_TEXT.test(val) || (!!unit && LH_CELL.test(unit));
          if (got[k] && !(lh && !got[k].lh)) return;
          got[k] = { key: k, label, value: val, lh, ...(unit && !FUEL_UNIT_TEXT.test(val) ? { unitCell: unit } : {}) };
        };
        for (const [j, v] of cells.entries()) {
          const t = String(v).trim();
          if (FUEL_UNIT_CELL.test(t)) { inUnit = t; continue; }
          const unit = inUnit || (byLine && FUEL_UNIT_CELL.test(byLine[j]) ? byLine[j] : null);
          // "342.9 / 457.1 L/h (@75% / @100%)", "58.5 / 42.8 / 29.3 L/h (100% / 75% / 50% standby)": a figure per load the cell
          // names, in that order; the whole cell is the value of each key (spec-norm takes the figure at the key's load).
          const ml = multiLoad(t);
          if (ml) {
            for (const [i, ld] of ml.loads.entries()) {
              const k = ld === 75 ? "fuel75" : ld === 50 ? "fuel50" : ld === 100 ? "fuel" : null, u = ml.unit || unit;
              if (k && specVal(t) && specFits(k, `${ml.nums[i]}${u ? ` ${u}` : ""}`)) take(k, t, ml.unit ? null : unit);
            }
            continue;
          }
          const pct = String(v).match(/^\D*(\d{2,3})\s*%\s*\D*$/);
          if (pct && !/^[≤<~≈]?\s*\d[\d.,]*\s*%$/.test(t)) { load = Number(pct[1]); continue; }
          const val = specVal(v), k = load === 75 ? "fuel75" : load === 50 ? "fuel50" : load === 100 ? "fuel" : null;
          if (!k || !val || !specFits(k, val)) continue;
          take(k, val, unit);
        }
        // A key already read from a line in another unit takes the L/h figure of a later line too (generatordieselchina: "Fuel
        // Efficiency (g/kW·h) | 192" before the L/h line could be read): both stay, the L/h one after.
        const lhOf = (x) => LH_TEXT.test(x.value) || (!!x.unitCell && LH_CELL.test(x.unitCell));
        for (const g of Object.values(got)) {
          const i = specs.findIndex((x) => x.key === g.key);
          if (i < 0 || (g.lh && !specs.some((x) => x.key === g.key && lhOf(x)))) specs.push({ key: g.key, label: g.label, value: g.value, ...(g.unitCell ? { unitCell: g.unitCell } : {}) });
        }
        continue;
      }
      if (sk) {
        const sv = c.slice(1).filter((v) => v && !UNIT_CELL.test(v));
        // "| N° of Cylinders / Valves | 6 / 24" (Baudouin [1021]): the label names the order, the first figure is the count.
        const cylValves = sk === "cyl" && /cylinders?\s*\/\s*valves/i.test(label);
        sv.forEach((v, j) => { const val = specVal(v); if (val && (specFits(sk, val) || (cylValves && /^\d{1,2}\s*\/\s*\d{1,3}$/.test(val)))) { const col = (cols[j] = cols[j] || {}); (col.specs = col.specs || []); if (!col.specs.some((x) => x.key === sk)) col.specs.push({ key: sk, label, value: val }); } });
        // "Engine type" is the engine model on some sites: read it as before too.
        if (sk !== "engType") continue;
      }
      // "Engine ref." is the engine model on Kohler-SDMO sheets ("| Engine ref. | 4045TSG20 *", * = a footnote).
      // "Power model" (动力型号) is the engine on Koop pages ("| Power model | KD292F").
      if (/^engine\s+ref\.?$|^power\s+model$/.test(bare)) { vals.forEach((v, j) => isCode(v.replace(/\s*\*$/, "")) && put(j, "engine", v.replace(/\s*\*$/, ""))); continue; }
      if (ENGINE_LBL.test(L) && /model|type|型号|^\s*(diesel\s*)?engine\s*$|发动机$|柴油机$/i.test(L) && !/brand|make|manufactur|speed|power|output|cylinder|displace|bore|governor|consum|oil|cool|start|origin|品牌|厂家/i.test(L))
        vals.forEach((v, j) => !(STROKE_VAL.test(v) && !String(v).split(/[\s,]+/).some((w) => /[a-z]/i.test(w) && /\d/.test(w) && !/stroke|cycle|冲程/i.test(w))) && put(j, "engine", v)); // "Engine Type: 4-stroke diesel" names no model
      else if (ENGINE_LBL.test(L) && /brand|make|manufactur|品牌|厂家/i.test(L)) vals.forEach((v, j) => put(j, "engineBrand", v));
      else if (ALT_LBL.test(L) && /brand|make|manufactur|品牌|厂家/i.test(L)) vals.forEach((v, j) => put(j, "altBrand", v));
      else if (ALT_LBL.test(L) && !/power|output|efficien|insulat|protect|voltage|regulat|excit|bearing|winding|pitch|temp|speed|frequency|cool/i.test(L)) vals.forEach((v, j) => /\d/.test(v) && put(j, "alternator", v)); // a model has a digit: "| Alternator | Control system" is two headings
      // "Starting power: 1,4 kW" is the starter motor's, a heater's or a charger's power is its own: not the genset's.
      else if (OUT_LINE(L)) {
        const kind = PRIME_RATE.test(L) ? "prime" : STANDBY.test(L) ? "standby" : "rated";
        if (kind === "rated" && listedOut.has(L.trim())) { note("dòng công suất không ghi mức lặp lại với số khác (danh sách máy khác)", l); continue; }
        // An output in kW only, one figure, under the engine's heading recognised from a heading split in two cells ("常用功率 Base
        // Output Power (kW) | 240" under "| 发动机 | 参", shanhua; L1-B8) is the engine's, not the set's. Only after such a heading:
        // two-column PDFs set "Engine" before lines of the set ("| Stand by Power | 22KVA/18KW", aosif), so a plain heading is no sign.
        if (part === "engine" && splitHead && /\bkw\b/i.test(L) && !/kva/i.test(L + " " + vals.join(" ")) && vals.length === 1 && /^\d+(\.\d+)?$/.test(vals[0])) { note("công suất kW ghi dưới mục động cơ, không là công suất tổ máy", l); continue; }
        vals.forEach((v, j) => {
          const both = String(v).match(/(\d+(?:[.,]\d+)?)\s*(kva|kw)\s*[/／]\s*(\d+(?:[.,]\d+)?)\s*(kva|kw)/i);
          if (both) {
            const a = fnum(both[1]), b = fnum(both[3]); if (!(a > 0) || !(b > 0)) return;
            const ua = both[2].toLowerCase(), ub = both[4].toLowerCase();
            if (ua !== ub) merge(j, kind, { [ua === "kva" ? "kVA" : "kW"]: a, [ub === "kva" ? "kVA" : "kW"]: b });
            return;
          }
          const one = String(v).match(/^(\d+(?:[.,]\d+)?)\s*(kva|kw)?$/i);
          const unit = one?.[2] || unitCell || (L.match(/\((kva|kw)\)|\b(kva|kw)\b\s*$/i) || [])[1] || (L.match(/\((kva|kw)\)/i) || [])[1];
          if (one && unit) { const f = fnum(one[1]); if (f > 0) merge(j, kind, { [unit.toLowerCase() === "kva" ? "kVA" : "kW"]: f }); else note("số có dấu phẩy nghìn / thập phân không rõ", v); return; }
          // "45,5/36,4" on a sheet that writes decimal commas (endress n1017 "Prime power (PRP) [kVA/kW]"; L1-B7, 24/11/2026): one or
          // two digits after the comma are decimals there. Unread before, so a later "Power [kVA/kW] | 25/20" of another set won.
          const pm = String(v).replace(/\s+/g, "").match(/^(\d+(?:[.,]\d+)?)\/(\d+(?:[.,]\d+)?)$/);
          const pf = (s) => (/^\d+(\.\d+)?$/.test(s) ? +s : decComma && /^\d+,\d{1,2}$/.test(s) ? +s.replace(",", ".") : NaN);
          const pair = pm && pf(pm[1]) > 0 && pf(pm[2]) > 0 ? [pm[0], pf(pm[1]), pf(pm[2])] : null;
          // "Rate Power(kva) (prime/standby) | 50/55": both figures in one unit, in the order the label names them.
          const order = L.match(/(prime|standby)\s*\/\s*(prime|standby)/);
          if (pair && unit && order && order[1] !== order[2]) {
            const u = unit.toLowerCase() === "kva" ? "kVA" : "kW";
            merge(j, order[1], { [u]: +pair[1] }); merge(j, order[2], { [u]: +pair[2] });
            return;
          }
          // "a/b" with no unit is a kVA / kW pair only under a label that names a rating, a unit or an output: a label
          // that only has "power" may be a company's name on a page footer ("| GB POWER | 3/4", page 3 of 4, read as
          // 4 kVA / 3 kW on 65 gb-power records; chat-luong-3, Khoa 18/11/2026). The unit may stand in its own cell
          // ("| Power(ESP) | kVA/kw | 2500/2000", westinpower).
          if (pair) {
            const p = pairOf(+pair[1], +pair[2]);
            if (p && !/prime|standby|rated|output|kva|\bkw|capacity|rating|功率|主用|备用|常用|额定|continuous|max/i.test(L) && !PRIME.test(L) && !STANDBY.test(L) && !c.slice(1).some((x) => /^(kva|kw)/i.test(x))) { note("cặp a/b dưới nhãn không ghi mức / đơn vị", l); return; }
            if (p) merge(j, kind, p);
          }
        });
      } else if (engineModel && /^(model|model\s*series|models?|型号)$/.test(bare)) vals.forEach((v, j) => isCode(v) && !badCol.has(j) && put(j, "engine", v));
      else if (/^(genset\s*)?model|机组型号|型号$/i.test(L) && !ENGINE_LBL.test(L) && !ALT_LBL.test(L)) vals.forEach((v, j) => isCode(v) && put(j, "genset", v));
    }
    // A page that lists several products takes the first line of each label, so a rating can come from another product
    // (hosem "Buy 500kva diesel generator": "Prime Power 500kVA" with "Standby Power 22kW"). When the kVA of one rating and
    // the kW of the other do not fit one set (kW / kVA ≈ 0.8) neither is trusted: both ratings are left out.
    for (const c of cols) {
      const p = c?.prime, s = c?.standby;
      if (!p || !s) continue;
      const only = (r, u) => r[u] != null && r[u === "kVA" ? "kW" : "kVA"] == null;
      const ratio = only(p, "kVA") && only(s, "kW") ? s.kW / p.kVA : only(p, "kW") && only(s, "kVA") ? p.kW / s.kVA : null;
      if (ratio != null && (ratio < 0.5 || ratio > 1.2)) { delete c.prime; delete c.standby; }
    }
    return cols.filter(Boolean);
  }
  // A sheet in sections side by side (chat-luong-3, Khoa 18/11/2026: "giữ lại số đúng" of LROW): a one-line header of
  // 2-4 part titles, every row label | value per part ("| 发电机组参数 | 柴油机参数 | 发电机参数" over "| 机组型号 | 30GF | 型号 |
  // 4BT3.9-G2 | 型号 | 30GF", chenxing; "| Generator-set | Diesel Engine (DEUTZ) | Alternator (Stamford)" over "| Model | 30GF |
  // Model | F4L912D | Model | PI144J", huachai). Read as a label sheet, each part under its heading; ratings written in
  // the engine's or the alternator's part are theirs, not the set's, and are not read as its output. Read as a row table,
  // the genset model became the engine or the alternator. Returns the label lines, or null.
  const SEC_GENSET = /机组|gen-?set|generator[\s-]*set/i;
  const SEC_HEAD = { genset: "| Generator set", engine: "| Engine", alternator: "| Alternator" };
  function sectionSheet(t) {
    if (!(t.header || []).length) return null;
    const h = cellsOf(t.header[0]), k = h.length;
    if (k < 2 || k > 4) return null;
    const parts = h.map((x) => (SEC_GENSET.test(x) ? "genset" : ENGINE_LBL.test(x) ? "engine" : ALT_LBL.test(x) ? "alternator" : null));
    if (parts.some((p) => !p) || parts.filter((p) => p === "engine").length !== 1 || new Set(parts).size !== k) return null;
    // The crawl sometimes keeps the first pairs line in the header ("| Model | 40GF | Model | F4L912TD | Model | UCI224D", huachai n118).
    const rows = [...t.header.slice(1), ...t.rows].map(cellsOf);
    if (!rows.length || rows.filter((c) => c.length === 2 * k).length < rows.length * 0.8 || !/^(model|型号|机组型号|genset\s*model)$/i.test(rows[0][0] || "")) return null;
    const lines = [];
    parts.forEach((p, j) => {
      lines.push(SEC_HEAD[p]);
      for (const c of rows) {
        const lb = c[2 * j], v = c[2 * j + 1];
        // A part's weight or size is not the set's: huachai n117 gives no set weight, only the alternator's "130kg 、 150kg".
        // Nor the alternator's current, at its own larger rating (huachai n121 "600GF": set "Rated currency | 1082A",
        // alternator ECO43 "Rated current | 902A"); the set's part spells it "currency".
        if (!lb || !v || (p !== "genset" && /power|output|功率|capacity|weight|重量|dimension|尺寸|current|电流/i.test(lb))) continue;
        lines.push(`| ${p === "genset" ? lb.replace(/^(rated\s+)?currency$/i, "$1current") : lb} | ${v}`);
      }
    });
    return lines;
  }
  // What a table's header says, made readable before any reading (catalog-bang-r1, Khoa 19/11/2026 "làm nhóm 1"):
  // - a header written with spaces between Chinese characters ("机 组 型 号 | 发 动 机 型 号", simpson-power; "机组重 量",
  //   "排 气 量", "燃油 消耗", catalog-a): the spaces go, so the titles are known (发动机 is the engine column);
  // - a table with no header whose first row is the header and the first genset row run together ("| | Model | Prime Power
  //   (kW) | … | Dimensions (mm) | JJC-20GF | 20 | 22 | …", jinjia-power, 18 tables): split in two, only when the row is k
  //   titles (first "Model / 型号", none a figure or a code) then k cells starting with a code, and every other row has k cells.
  //   The row keeps its index (row 0), its text is the part after the titles, word for word.
  function stuckHeader(rows) {
    if (rows.length < 2) return null;
    const c = cellsOf(rows[0]);
    while (c.length && !c[0]) c.shift();
    if (!/^(model|型号|机组型号|genset\s*model)$/i.test(c[0] || "")) return null;
    const k = c.findIndex((x) => isCode(x));
    if (k < 2 || c.length !== 2 * k) return null;
    if (c.slice(0, k).some((x) => !x || /^[\d.,\s]+$/.test(x) || isCode(x))) return null;
    if (!rows.slice(1).every((r) => cellsOf(r).length === k)) return null;
    return { header: "| " + c.slice(0, k).join(" | "), row: "| " + c.slice(k).join(" | ") };
  }
  // catalog-a (Khoa 19/11/2026 "Làm", đề xuất của catalog-bang-r1): ANY space between two Chinese characters of a header
  // goes ("机组重 量", "排 气 量", "发动机 型号"): a header cell is one title, a space inside a Chinese word is layout.
  // Only the header: in rows a space may part a make from a model ("重庆 康明斯").
  const HAN_SP = /([一-鿿]) +(?=[一-鿿])/g;
  // Genset rows that the page put in the header, under the titles (catalog-a: baifa, penlucky, fdk-energy, elitech, rcg,
  // agg-fuzhou, simpson, welland: "| | Genset Model | Standby Power | … " then "| CG250-H1 CONTACT | 250KVA/ 200KW | …").
  // A header line from the second on is a genset row when its FIRST cell is a code, the table's first row also starts
  // with a code, and it has a figure; such lines must run to the end of the header (a title line after them: which is
  // a title is not known, the table is left as it was and noted). Sub-title lines before them stay ("Standby KVA |
  // Prime KVA | Brand …", baifa). The moved rows are read AFTER the table's rows, numbered from rows.length, so the rows
  // already read keep their index.
  function headerRows(t) {
    const h = t.header || [], rows = t.rows || [];
    if (h.length < 2 || !rows.length || !isCode(cellsOf(rows[0])[0])) return null;
    const data = (l) => { const c = cellsOf(l); return c.length >= 3 && isCode(c[0]) && c.slice(1).some((x) => /\d/.test(x)); };
    const at = h.findIndex((l, i) => i >= 1 && data(l));
    if (at < 0) return null;
    if (!h.slice(at).every(data)) return { mixed: true, at };
    return { at };
  }
  const GAS_WORD = /燃气|沼气|天然气|natural\s*gas|\bgas\s+(gen|engine|set)|\bbiogas\b|\bLPG\b|\bCNG\b/i;
  // ---- Fuel of a table and of its rows (may-khi-2, Khoa 20/11/2026) --------------------------------------------------
  // The catalog has no fuel in its tables: a record gets `fuel` ("gas" | "gasoline" | "dual" = gasoline + LPG / gas),
  // `fuelFrom` (the strength of the sign) and `fuelWhy` (the words read) ONLY when the page itself says it; no sign =
  // no field (empty is NOT diesel: "not written" is not "written diesel"). Signs, strongest first (may-khi-1.md section 4):
  //   B  the table itself (a fuel label cell with its value, any cell / title of the table naming a gas or gasoline word);
  //   M  the ROW's own model code ends in -NG / *7NG, together with a title or URL that says gas (agg-fuzhou, penlucky,
  //      weichai-heavy-machinery);
  //   T  the page's name (title, or URL path) says gas / gasoline for the product.
  // NOT a sign: a word of a menu or slogan (a title that names diesel AND gas: "Diesel Generator Set | Gas Generator Set",
  // "提供柴油、燃气发电机组"; the word diesel inside a company's name does not count), a unit m3/h alone (coolant flow), an
  // engine code alone (K19N, N0/5), the bare word "Gas" glued to a name (SIMPSON-GasGenerators: gasoline?), a gas STORAGE
  // tank, the company's name. A page title that says gas whose table gives the fuel use in litres is no gas set (jianghao).
  // Two kinds in the signs (gas + gasoline) = "dual"; any diesel word beside a gas / gasoline word in one source = mixed
  // = no fuel. Pure function of the table, its URL and a row: the same rule is used by gasTable (header rows of a gas table).
  const F_GAS = /燃气|燃氣|沼气|天然气|液化气|煤层气|natural[\s-]*gas|bio-?gas|\bLPG\b|\bCNG\b|\bLNG\b|landfill[\s-]gas|methane|\bmetano\b|\bGPL\b|\blp[\s-]?gas\b|syngas|khí thiên nhiên|khí tự nhiên|khí sinh học|\bgas[\s-]+(?:gen\w*|engines?|sets?\b|powered|fired)|\bgas\s*\(\s*lpg/gi;
  const F_GAS_NOT = /^\s*(?:storage|holder|tank|digester|purif|desulph|booster|membrane|pipeline)/i;
  const F_GASOLINE = /gasoline|\bpetrol\b|汽油|xăng|\bbenzina\b|gasolina/i;
  const F_DIESEL = /diesel|柴油|gasoil|gasóleo|gasolio|gazole/i;
  const F_COMPANY = /\bco\.?,?\s*ltd|\blimited\b|\bcompany\b|\bcorp(?:oration)?\b|\binc\.|有限公司|公司|集团/i;
  const F_LITRE = /fuel\s*con[a-z.]*\s*[(（\[]?\s*(?:l|lit(?:re|er)s?|升)\b|(?:l|litres?|liters?)\s*\/\s*h\b|升\s*\/\s*(?:时|小时)/i;
  const F_RANK = { B: 3, M: 2, T: 1 };
  function fuelKinds(text, { company = false } = {}) {
    const r = {};
    for (const seg of company ? String(text).split(/\s+[|–—-]\s+|\s*\|\s*|(?<=[a-z)])-(?=[A-Z])|[-－—](?=[一-鿿A-Z])/) : [String(text)]) {
      for (const m of seg.matchAll(F_GAS)) { if (!F_GAS_NOT.test(seg.slice(m.index + m[0].length, m.index + m[0].length + 20))) { r.gas = r.gas || m[0].trim(); break; } r.tank = true; }
      const g = seg.match(F_GASOLINE); if (g) r.gasoline = r.gasoline || g[0];
      const d = seg.match(F_DIESEL); if (d && !(company && F_COMPANY.test(seg))) r.diesel = r.diesel || d[0];
    }
    return r;
  }
  // "Fuel Type | Natural gas/Biogas", "燃料 | 汽油", "燃料 | NG": the fuel label's value cell(s).
  const FUEL_LABEL = /^(?:fuel(?:\s*type)?|type\s*of\s*fuel|燃料(?:种类|类型)?|燃气种类|nhiên liệu|carburante\s*fuel|combustible)\s*[:：]?$/i;
  function fuelCells(lines) {
    const r = {};
    for (const l of lines) {
      const cs = cellsOf(l);
      for (let i = 0; i + 1 < cs.length; i++) {
        if (!FUEL_LABEL.test(cs[i].trim())) continue;
        const v = cs.slice(i + 1).join(" ");
        const k = fuelKinds(v);
        if (k.gas) r.gas = r.gas || `${cs[i].trim()} | ${v.trim().slice(0, 40)}`;
        else if (/^\s*(?:NG|LNG|CNG)\s*$/.test(cs[i + 1])) r.gas = r.gas || `${cs[i].trim()} | ${cs[i + 1].trim()}`;
        if (k.gasoline) r.gasoline = r.gasoline || `${cs[i].trim()} | ${v.trim().slice(0, 40)}`;
        if (k.diesel) r.diesel = r.diesel || `${cs[i].trim()} | ${v.trim().slice(0, 40)}`;
        break;
      }
    }
    return r;
  }
  // The model code of a gas set written by the row itself: "DC260G6-NG", "PG…*7NG", "…-LPG", "…-BG1".
  const NG_MODEL = /(?:-|[0-9*])(?:NG|LPG|BG)[0-9]?$/i;
  const rowNg = (line) => { const c = cellsOf(line)[0] || ""; return NG_MODEL.test(c.trim()) && /\d/.test(c) ? c.trim() : null; };
  const urlText = (url) => String(url || "").replace(/^[a-z]+:\/\/[^/]+/i, "").replace(/[-_/.+%=&?]+/g, " ");
  // The sign of a table, before the row: { B, T, M? } each a { gas?, gasoline?, diesel? } of the words read.
  function fuelSigns(t, url) {
    const lines = [...(t.header || []), ...(t.rows || [])];
    const text = lines.join("\n");
    const body = fuelKinds(text), cells = fuelCells(lines);
    const B = { ...body };
    for (const k of ["gas", "gasoline", "diesel"]) if (cells[k]) B[k] = cells[k];
    const T = fuelKinds(String(t.title || ""), { company: true });
    const U = fuelKinds(urlText(url));
    const litre = F_LITRE.test(text);
    return { B, T, U, litre, lines };
  }
  // Combine the signs for one row (`line`; null = the table, no row): { fuel, from, why } or null.
  function fuelFrom(sg, line) {
    const src = []; // [level, kinds, words]
    const add = (level, k, label) => { if (k.gas || k.gasoline) src.push({ level, k, label }); };
    add("B", sg.B, "bảng");
    const ng = line == null ? null : rowNg(line);
    // A title about a gas STORAGE tank ("Biogas Storage Tank", kingway n117) says nothing of the table's product, nor does the URL.
    const tank = !!sg.T.tank;
    const gasPage = !tank && (sg.T.gas || sg.U.gas) && !sg.T.diesel && !sg.U.diesel;
    if (ng && gasPage) add("M", { gas: `${ng} + ${sg.U.gas ? "URL" : "tên trang"}: ${sg.T.gas || sg.U.gas}` }, "mã model");
    // title / URL (T): not when the page's own words mix diesel in, nor a gas title over a litre fuel use.
    const tk = {}, uk = {};
    for (const [k, from] of [[tk, sg.T], [uk, sg.U]]) {
      if (from.diesel) continue;
      if (from.gas && !sg.litre && !tank) k.gas = from.gas;
      if (from.gasoline) k.gasoline = from.gasoline;
    }
    add("T", tk, "tên trang"); add("T", uk, "URL");
    if (!src.length) return null;
    // diesel named beside gas / gasoline, in the same source or in another one of the page (a "Diesel Twin-cylinder" title over a
    // "Gasoline" row of another product): mixed, no fuel.
    if ([sg.B, sg.T, sg.U].some((k) => k.diesel)) return null;
    const kinds = {}; // kind -> strongest level + words
    for (const s of src) for (const kd of ["gas", "gasoline"]) if (s.k[kd] && (!kinds[kd] || F_RANK[s.level] > F_RANK[kinds[kd].level])) kinds[kd] = { level: s.level, words: s.k[kd], label: s.label };
    const ks = Object.keys(kinds);
    if (!ks.length) return null;
    const fuel = ks.length === 2 ? "dual" : ks[0];
    const from = ks.map((kd) => kinds[kd].level).sort((a, b) => F_RANK[a] - F_RANK[b])[0]; // the weakest of the kinds it rests on
    const why = ks.map((kd) => `${kinds[kd].label} ghi "${String(kinds[kd].words).slice(0, 60)}"`).join("; ");
    return { fuel, from, why };
  }
  // The fuel a PAGE states that the saved table does not carry (list written by hand, like ROW_EXCEPTIONS; only the page's
  // OWN words, read on the live page, never another supplier's page of the same look): weichai-power n125–128 are
  // "Standard Land-based Generator Set" pages of "…*7NG" rows whose title and URL say nothing of fuel; the page's breadcrumb
  // "Products & Businesses / Energy & Power / Generator Set / Overseas Gas" and its image names "16M33NG-机组燃气-1.png" do
  // (live pages read 20/11/2026, all four; also in sources/weichai-power/<n>.md). Level T: the page's category.
  // Nhiên liệu theo bảng (Khoa 20/11/2026, câu 3 / 4X / 5 của catalog-nhom-con-lai-de-xuat.md), same list:
  // - jianghao-genset n104 (b4 + b5, "JHRQ-…"): the page's note ① right under both tables says the sets run on natural gas,
  //   oil field gas, bio-gas… (sources/jianghao-genset/104.md); the "FuelCon. (L)" column and the "Gas Generator" title alone
  //   were not enough (`litre`). Level T: the page's own words outside the saved table.
  // - simpson-power n124: the page names no fuel ("SIMPSON-GasGenerators" is a name); only the rows whose ENGINE is a Honda
  //   GX390 / GX630 / GX690 get gasoline, from the engine maker's datasheet (engines.honda.com, Fuel "Unleaded 86 octane or
  //   higher", read 20/11/2026). Level D = "datasheet hãng động cơ". The ZS… and "31HP" / "35HP" rows stay without fuel.
  // - zc-power n109 b11 / b12 (GENSET_TABLES, `part: "genset"`: read by gensetsOf, not fromSupplier): page title
  //   "Gasoline Generators". The other genset tables get no fuel (gensetsOf writes none by itself).
  // `engines`: model key -> the datasheet URL (a row of another engine gets nothing); `header`: the table's first header line
  // verbatim (the source changes its header -> no fuel, like ROW_EXCEPTIONS / GENSET_TABLES).
  const HONDA_GX = 'datasheet hãng động cơ Honda %M ghi Fuel "Unleaded 86 octane or higher" (%U, đọc 20/11/2026)';
  const FUEL_PAGES = [
    { supplierId: "weichai-power", ns: [125, 126, 127, 128], fuel: "gas", why: 'trang ghi đường dẫn "Generator Set / Overseas Gas" và ảnh "机组燃气" (đọc trang sống 20/11/2026)' },
    { supplierId: "jianghao-genset", ns: [104], fuel: "gas", why: 'trang ghi ngay dưới hai bảng "①The above generators can be used natural gas, oil filed gas, bio-gas…" (tệp nguồn lưu 13–14/11/2026)' },
    { supplierId: "simpson-power", ns: [124], from: "D", fuel: "gasoline", header: "| 机 组 型 号 | 备 用 功 率 ( kW/kVA) | 发 动 机 型 号 | 机 组 尺 寸 (mm) ( 长×宽×高) | 机 组 数 据",
      engines: { GX390: "https://engines.honda.com/models/model-detail/x-large-gx", GX630: "https://engines.honda.com/models/model-detail/v-twin-horizontal", GX690: "https://engines.honda.com/models/model-detail/v-twin-horizontal" }, why: HONDA_GX,
      // The ZS168FA / ZS182F / ZS190F and "31HP" / "35HP" rows (no maker's page found, the page names no fuel): Khoa 21/11/2026
      // "Simpson: loại cả bảng" = the whole table stays out of the diesel pack. NOT a fact from a source. The catalog has no
      // "not diesel, kind unknown" value; `dual` (gasoline + gas) is the narrowest that `fuelOff` turns away from a diesel HSMT
      // and lets through a gas / gasoline one. Level K = "quyết định của Khoa" (no maker, no page); `why` says so.
      rest: { fuel: "dual", from: "K", why: "QUYẾT ĐỊNH của Khoa 21/11/2026 (không có nguồn hãng): cả bảng SIMPSON-GasGenerators không vào gói diesel; động cơ này không tìm được trang hãng nên loại nhiên liệu KHÔNG rõ, `dual` chỉ để loại khỏi HSMT diesel" } },
    // man-engines n104 (marine auxiliary table of the maker's own page, "Compact MAN diesel and gas engines as auxiliary engines"): the table
    // mixes D2676 / D2862 / D3872 (diesel) and E3262 (gas) without a fuel column. Khoa 21/11/2026 "ghi `fuel` theo hãng": each engine gets the
    // fuel its OWN maker page states, level D (read 24/11/2026). The 8 D-rows are `diesel`: the catalog now has that value ONLY from an explicit
    // page like this one (`fuelOff` of config-bot treats `diesel` as right for a diesel HSMT, wrong for a gas / gasoline one).
    { supplierId: "man-engines", ns: [104], from: "D", fuel: "gas", header: "| Output kW 1) 50 Hz / 60 Hz | Engine model | Cylinders | Model | Displacement in litres",
      engines: { E3262: "https://www.man.eu/engines/en/products/power-generation/gas/man-motor-e3262.html" }, why: 'datasheet hãng động cơ MAN %M ghi "E3262 naturally aspired engine with natural gas" (%U, đọc 21/11/2026)' },
    { supplierId: "man-engines", ns: [104], from: "D", fuel: "diesel", header: "| Output kW 1) 50 Hz / 60 Hz | Engine model | Cylinders | Model | Displacement in litres",
      engines: { D2676: "https://www.man.eu/engines/en/products/marine/engines-for-commercial-shipping/man-in-line-six-cylinder-motor.html", D2862: "https://www.man.eu/engines/en/products/power-generation/diesel/power-generation-diesel.html", D3872: "https://www.man.eu/engines/en/products/marine/engines-for-commercial-shipping/man-d3872.html" },
      why: 'trang hãng động cơ MAN của %M ("MAN diesel engines for commercial shipping" / "MAN diesel engines for … Power" cho D2862; PDF Marine-Commercial D2676: "4-stroke diesel engine") (%U, đọc 24/11/2026)' },
    // mwm n1007 / n1008 (datasheets "TCG 3016 V16", EN and CN, one engine record each; the supplier IS the engine maker): the saved table has no
    // gas word, but the sheet itself (sources/mwm/1007.md line 55 "Natural gas applications 50 | Hz", line 74 "a minimum methane number of MN 80
    // for natural gas"; 1008.md line 49 "天然气应用 50 Hz", line 68 "MN=80 的天然气"; `From:` …/gas-engine-tcg-3016/) says natural gas. Level D = the
    // engine maker's own datasheet. `header: ""`: the saved tables have no header line (điều phối 21/11/2026, nhien-lieu-tieu-de-1.md).
    { supplierId: "mwm", ns: [1007, 1008], from: "D", fuel: "gas", header: "", why: 'datasheet hãng MWM "TCG 3016 V16" ghi "Natural gas applications 50 Hz" và "a minimum methane number of MN 80 for natural gas" (n1008: "天然气应用 50 Hz"; From: mwm.net/en/gas-engines-gensets/gas-engine-tcg-3016/, tệp nguồn lưu 1007.md / 1008.md)' },
    { supplierId: "zc-power", ns: [109], part: "genset", fuel: "gasoline", why: 'tên trang "Gasoline Generators | Factory-Direct Prices | ZC Power"' },
  ];
  // The fuel of record `o` (of `fromSupplier`, or `part` "genset" = of `gensetsOf`) by FUEL_PAGES, or null.
  // `h0`: the first header line of the SAVED table (s.specTables, before tidyTable joins the spaces between Han characters).
  const fuelPage = (id, o, h0, part = "row") => {
    // Several entries may name one table with different `engines` (man-engines n104: diesel D-rows, gas E3262): the first that gives a fuel wins.
    for (const p of FUEL_PAGES.filter((x) => x.supplierId === id && x.ns.includes(+o.n) && (x.part || "row") === part)) {
      if (p.header != null && String(h0 ?? "").trim() !== p.header) continue;
      if (!p.engines) return { fuel: p.fuel, from: p.from || "T", why: p.why };
      const m = o.kind === "engine" && Object.keys(p.engines).find((k) => keyOf(k) === keyOf(o.model));
      if (m) return { fuel: p.fuel, from: p.from || "T", why: p.why.replace("%M", m).replace("%U", p.engines[m]) };
      // `rest`: the other rows of the same table, by a decision, not by a source (simpson n124, Khoa 21/11/2026 "loại cả bảng").
      if (p.rest) return { fuel: p.rest.fuel, from: p.rest.from, why: p.rest.why };
    }
    return null;
  };
  // A table's gas set (its header rows are not read): the same signs, no row, the page's URL when known.
  const gasTable = (t, lines, url) => { const f = fuelFrom(fuelSigns({ title: t.title, header: [], rows: lines }, url), null); return !!f && (f.fuel === "gas" || f.fuel === "dual") || GAS_WORD.test(`${t.title || ""} ${lines.join(" ")}`) || lines.some((l) => /-NG$/i.test(cellsOf(l)[0] || "")); };
  function tidyTable(t, note = () => {}, url = "") {
    let header = t.header || [], rows = t.rows || [], changed = false;
    if (header.some((h) => /[一-鿿] +[一-鿿]/.test(h))) { header = header.map((h) => h.replace(HAN_SP, "$1")); changed = true; }
    const st = !header.length && stuckHeader(rows);
    if (st) { header = [st.header]; rows = [st.row, ...rows.slice(1)]; changed = true; }
    const hr = !isLabelTable(t) && headerRows({ header, rows });
    if (hr?.mixed) note("dòng máy lẫn với dòng tiêu đề", header[hr.at]);
    // A gas set's table ("DC330G6-NG", agg-fuzhou n115 / n116 on the natural-gas pages): the catalog has no fuel yet, so
    // its rows in the header are not added as if diesel (điều phối 19/11/2026: "thà thiếu"; the table's own rows stay as
    // before, a fuel rule is a task of its own).
    else if (hr && gasTable(t, [...header, ...rows], url)) note("bảng máy khí: dòng máy trong tiêu đề không đọc thêm", header[hr.at]);
    else if (hr) { rows = [...rows, ...header.slice(hr.at)]; header = header.slice(0, hr.at); changed = true; }
    return changed ? { ...t, header, rows } : t;
  }
  const isLabelTable = (t) => {
    if (!t.header?.length) return true;
    const h = cellsOf(t.header[0]);
    // "| Details Generator Set | GenSet Model | DPK-DW-250 | Type | Silent": a one-model sheet of label pairs (unpairDetails).
    // Only a genset's sheet: a lighting tower's ("Details Lighting Tower") is not a generating set to offer.
    const dh = (h[0] || "").match(DETAILS);
    if (dh) return /genset|generator\s+set/i.test(dh[1]);
    // "| Genset Model | YCM150DCM | YCM150DCE": the models run across, one per column.
    return h.length >= 2 && /model|型号/i.test(h[0]) && h.slice(1).every((x) => isCode(x)) && t.rows.every((r) => !isCode(cellsOf(r)[0]));
  };

  // Figures of a table row, by the title of their column. Only when the header lines up with the row: the same
  // number of cells, or one fewer with the genset model in front left untitled. A second header line made only of
  // units ("| KVA/KW | L/h") is added to the title.
  // A current or a voltage laid over its cell by position (a header of another width, a row one cell longer) must fit
  // the row's own power (chat-luong-3, Khoa 18/11/2026; same relations as suppliers/spec-diff.mjs checkSpec): a row
  // missing a cell put "100" (kW) under the current and "110" under the voltage (power-hf "| 13 | PHF-100RX | 100 |
  // 110 | 180 | … | ● |"), a standby kW under the voltage (yingtai "| 1120GF | 1120 | 1230 | 128 |"), a kVA (sr-genset).
  // A current fits 400 / 380 / 415 / 440 / 480 V three phase, 230 V single phase, or a high-voltage set (3,3-11 kV:
  // honny "HGM1100EHV10.5" 55 A, yingtai 128 A at 6,3 kV). Its kW may also be the one in the genset's model name ("700GF":
  // huatai, whose output column holds other figures, "| 700GF | 140/165 | 1267 |"): only to keep a current, never as the
  // set's power. No power read: kept as it was. A voltage must be a standard one.
  const STD_VOLT = [110, 115, 120, 127, 208, 220, 230, 240, 380, 400, 415, 440, 480, 690, 3300, 6000, 6300, 6600, 10000, 10500, 11000];
  function posFits(key, value, power, gname) {
    if (key !== "current" && key !== "voltage") return true;
    const v = +((String(value).replace(/(\d),(\d{3})\b/g, "$1$2").match(/\d+(?:\.\d+)?/) || [])[0]);
    if (!(v > 0)) return true;
    const P = Object.values(power || {}).filter(Boolean), kvas = P.map((p) => p.kVA).filter(Boolean), kws = P.map((p) => p.kW).filter(Boolean);
    // One of the row's own outputs is no voltage ("| PHF-100RX | 100 | 110 |": the standby 110 kW, a standard voltage too).
    // Not a 380-480 V mains voltage, nor two voltages ("230/400"), which a kW figure may equal by chance (chuangyuan
    // "400 kW | 400 V", zhengchi "230KW … 230/400").
    if (key === "voltage") {
      const two = String(value).match(/^\s*(\d+)\s*[\/／]\s*(\d+)\s*v?\s*$/i);
      if (two) return STD_VOLT.includes(+two[1]) && STD_VOLT.includes(+two[2]);
      return STD_VOLT.includes(v) && (v >= 380 || ![...kvas, ...kws].includes(v));
    }
    if (!kvas.length && !kws.length) return true;
    const named = String(gname || "").match(/^(?:[a-z]{0,6}[-\s]?)?(\d+(?:\.\d+)?)\s*gf/i);
    if (named) kws.push(+named[1]);
    const near = (x, y, t) => Math.abs(x / y - 1) <= t;
    return kvas.some((k) => [1.443, 1.519, 1.39, 1.312, 1.203].some((f) => near(v, k * f, 0.04))) || kws.some((k) => [1.8, 1.9, 1.804].some((f) => near(v, k * f, 0.04)))
      || kvas.some((k) => near(v, k * 4.35, 0.05)) || kws.some((k) => near(v, k * 4.35, 0.05) || near(v, k * 4.55, 0.05))
      || [3300, 6000, 6300, 6600, 10000, 10500, 11000].some((V) => kvas.some((k) => near(v, (k * 1000) / (1.732 * V), 0.04)) || kws.some((k) => near(v, (k * 1000) / (1.732 * V * 0.8), 0.04)));
  }
  const fitRow = (specs, at, cells) => specs.filter((x) => {
    const ok = posFits(x.key, x.value, at.power, at.gi >= 0 ? cells[at.gi] : null);
    if (!ok && at.note) at.note("dòng điện / điện áp theo vị trí không khớp công suất", `${x.key}=${x.value} | ${cells.join(" | ")}`);
    return ok;
  });
  // A voltage that is one of the row's own outputs in kW / kVA and no mains voltage (yingtai n113 at 6,3 kV: the row has no
  // voltage cell, the title "额定电压" lay over the standby 1100 / 1300 kW; 400 kW | 400 V stays). Left out and noted.
  function notOutput(specs, at, cells = []) {
    const P = Object.values(at.power || {}).filter(Boolean), outs = P.flatMap((p) => [p.kW, p.kVA]).filter(Boolean);
    return specs.filter((x) => {
      // A current of digits split by a space ("5 9/54", an OCR of 59.54, zhengdian n101): no number to trust, left out.
      if (x.key === "current" && /^\d+\s+\d/.test(String(x.value).trim())) { if (at.note) at.note("ô dòng điện không đọc được thành số", `${x.key}=${x.value}`); return false; }
      // A weight or a noise level that is exactly one of the row's own outputs (cgm-italia "kg" 39,6 / 334,4 = the standby kW,
      // "dB(A)" 52,8 the same cell under another title of a pile of header lines): the cell is the output, left out.
      if (x.key === "weight" || x.key === "noise") {
        const w = +String(x.value).trim().replace(",", ".").replace(/\s*(kg|db\(a\)|db)$/i, "");
        // The same figure in a cell right of the engine / alternator (cgm-italia e63B: noise 69 at the far end, standby kVA 69 on
        // the left) is the cell of its own title, not the output laid under it: kept.
        const right = Math.max(at.ei ?? -1, at.ai ?? -1);
        const again = right >= 0 && cells.some((c, i) => i > right && +String(c).trim().replace(",", ".").replace(/\s*(kg|db\(a\)|db)$/i, "") === w);
        if (w > 0 && outs.includes(w) && !again) { if (at.note) at.note("số bằng đúng công suất của dòng, không là khối lượng / độ ồn", `${x.key}=${x.value}`); return false; }
        return true;
      }
      // A consumption whose every figure is one of the row's own outputs (L1-B6, 24/11/2026): legapower n101 "Cons 100%（L/h）" = 350
      // is the PRP kVA under "KVA" over "ESP | PRP"; wintpower n105 "Cons 100% ( L/H )" = "180/225" is the prime kW / kVA of a
      // header line that lacks the model's title. The cell is the output, left out. Not a g/kWh figure (205 g/kWh on a 205 kW
      // set is possible), and not when the same figure stands again right of the engine / alternator (its own column).
      if (/^fuel(75|50)?$/.test(x.key) && !/g\s*\/\s*\(?\s*k\s*w/i.test(`${x.value} ${x.label} ${x.unitCell || ""}`)) {
        const fs = (String(x.value).match(/\d+(?:[.,]\d+)?/g) || []).map((s) => +s.replace(",", "."));
        const right = Math.max(at.ei ?? -1, at.ai ?? -1);
        const again = right >= 0 && cells.some((c, i) => i > right && fs.includes(+String(c).trim().replace(",", ".")));
        if (fs.length && fs.every((f) => f > 0 && outs.includes(f)) && !again) { if (at.note) at.note("số bằng đúng công suất của dòng, không là tiêu hao", `${x.key}=${x.value}`); return false; }
        return true;
      }
      if (x.key !== "voltage") return true;
      const v = +String(x.value).replace(/(\d),(\d{3})\b/g, "$1$2").trim();
      if (!(v > 0) || !/^\d+(?:\.\d+)?$/.test(String(x.value).trim()) || !outs.includes(v) || (STD_VOLT.includes(v) && v >= 380)) return true;
      if (at.note) at.note("điện áp trùng công suất của dòng", `${x.key}=${x.value}`);
      return false;
    });
  }
  const rowSpecs = (t, cells, at = {}) => notOutput(rowSpecs0(t, cells, at), at, cells);
  function rowSpecs0(t, cells, at = {}) {
    const hs = (t.header || []).map(cellsOf);
    if (!hs.length) return [];
    // The figures of titles laid over cells from `shift`; null when one value has the wrong shape (the row does not
    // line up with these titles, so none of it is used).
    const lined = (titles, units, shift, kW) => {
      const out = [];
      for (let i = 0; i < titles.length; i++) {
        const ttl = titles[i], label = units[i] ? `${ttl} (${units[i]})` : ttl, key = specKey(ttl), val = specVal(cells[i + shift]);
        // The engine's (alternator's) title over another cell: a title spans two cells, the row does not line up.
        if ((at.ei >= 0 && engTitle(ttl) && i + shift !== at.ei) || (at.ai >= 0 && altTitle(ttl) && i + shift !== at.ai)) return null;
        if (!key || !val) continue;
        if (!specFits(key, val) || (kW !== undefined && !likely(key, val, kW))) return null;
        // Two engine power columns, one standby and one not ("额定功率/转速 | 备用功率/转速", dcec; nenjo "Engine prime
        // power | Engine standby power"): both, each with its title. Other keys: the first column.
        const sb = (l) => /standby|stand-by|\besp\b|备用/i.test(l);
        if (!out.some((x) => x.key === key && !(key === "engPower" && sb(x.label) !== sb(label)))) out.push({ key, label, value: val });
      }
      return out;
    };
    // A blank first title ("| | Genset Model | ...") is a stray cell when the row has one cell fewer.
    let titles = hs[0];
    if (!titles[0] && titles.length === cells.length + 1) titles = titles.slice(1);
    const units = hs[1] && hs[1].every((x) => !x || (x.length <= 12 && /^[a-z/%().·³\s0-9-]+$/i.test(x) && !isCode(x))) ? hs[1] : [];
    let shift = null;
    if (titles.length === cells.length) shift = 0;
    else if (titles.length === cells.length - 1 && isCode(cells[0]) && !/model|型号/i.test(titles[0])) shift = 1;
    if (shift != null) { const r = lined(titles, units, shift); if (r?.length) return engRatings(hs, cells, at, shift ? fitRow(r, at, cells) : r); }
    // A header of several lines whose second line names every column ("| | KW | kVA | KW | kVA | Cummins | ...").
    for (const h of hs.slice(1)) if (h.length === cells.length && h.some((x) => specKey(x))) { const r = lined(h, [], 0, kWOf(at.power)); if (r?.length) return engRatings(hs, cells, at, r); }
    return engRatings(hs, cells, at, fitRow(walkedSpecs(hs, cells, at), at, cells));
  }
  // The engine's power over two cells, its ratings on a line below (keliang "Engine power(kw)" over "Prime | Standby",
  // hanyang "Engine power" over "Rated Power (kW) | Standby Power (kW)", acepow "Rated | Standby"): one title gives one
  // figure with no rating, and a walk from the right put acepow's standby 33 under "Engine Power(KW)". Read as two when
  // the engine power title comes right after a model title, the rating subtitles of the lower line go prime-like then
  // standby, pair after pair (genset outputs first, the engine's next: the order is the same), the two cells after the
  // engine model are figures (or "—", "/" for none) and the second is 1.05–1.25 times the first. The label keeps the
  // subtitle as written ("Rated" stays "Rated"). Anything else: the figures as they were.
  const SUB_PRIME = /^\(?\s*(prime|rated|cop|continuous|prp|额定|常用|主用)/i, SUB_SB = /^\(?\s*(standby|esp|max|备用)/i;
  const NONE_CELL = /^[—–\-/]$/;
  function engRatings(hs, cells, at, specs) {
    const ei = at.ei, ep = specs.filter((x) => x.key === "engPower");
    if (!(ei >= 0) || ep.length !== 1 || /prime|standby|\bprp\b|\besp\b|\bcop\b|rated|额定|备用|常用|主用|continuous/i.test(ep[0].label)) return specs;
    let title = null;
    for (const h of hs) {
      const j = h.findIndex((x) => specKey(x) === "engPower");
      if (j > 0 && /model|型号/i.test(h[j - 1])) { title = h[j]; break; }
    }
    if (!title) return specs;
    const sub = hs.map((h) => h.filter((x) => SUB_PRIME.test(x) || SUB_SB.test(x))).find((r) => r.length >= 2);
    if (!sub || sub.length % 2 || sub.some((x, i) => !(i % 2 ? SUB_SB.test(x) && !SUB_PRIME.test(x) : SUB_PRIME.test(x)))) return specs;
    const a = String(cells[ei + 1] ?? "").trim(), b = String(cells[ei + 2] ?? "").trim();
    const na = NONE_CELL.test(a) ? null : num(a), nb = NONE_CELL.test(b) ? null : num(b);
    if ((na == null && !NONE_CELL.test(a)) || (nb == null && !NONE_CELL.test(b)) || (na == null && nb == null)) return specs;
    if (na != null && nb != null && !(nb >= na * 1.05 && nb <= na * 1.25)) return specs;
    // The walked figure must be one of the two cells (else the walk read another column: leave it).
    if (![a, b].includes(String(ep[0].value).trim())) return specs;
    const lp = sub[sub.length - 2], ls = sub[sub.length - 1], out = specs.filter((x) => x.key !== "engPower");
    if (na != null) out.push({ key: "engPower", label: `${title} ${lp}`, value: a });
    if (nb != null) out.push({ key: "engPower", label: `${title} ${ls}`, value: b });
    return out;
  }
  // A header of several lines whose titles span columns ("Standby output" over "KVA | KW", "Displacement (L)" over two
  // lines): no line has the row's width. Each line is laid over the row from the cells whose column is known: the
  // engine model under its "Engine" title, the alternator under "Alternator", the genset model under "Model" at the
  // left, the last cell under the last title. From there it goes one cell per title until a value of the wrong shape or
  // another known cell, or at the "Engine" title over any cell but the engine's (a title before it spans two cells). A
  // figure two walks put on different cells is left out (2026-11-03: 8,771 rows had a header of another width).
  const MOVING = /power|output|功率|\bkw\b|\bkva\b|brand|make|manufactur|origin|\bc\/o\b|品牌|厂家|产地/i;
  // The title of the engine (alternator) model's column: "Engine model", "柴油机型号", "Alternator" (not its power or brand).
  // Not a figure of the part ("Engine oil system capacity", "Engine type" over cylinders and governor, "Alternator efficiency").
  const PART_FIGURE = /speed|cylinder|displace|bore|stroke|governor|consum|oil|cool|start|type|efficien|insulat|protect|voltage|regulat|excit|bearing|winding|pitch|temp|frequency|emission/i;
  const engTitle = (x) => ENGINE_LBL.test(x) && /model|型号|engine\s*$|发动机$|柴油机$/i.test(x) && !specKey(x) && !MOVING.test(x) && !PART_FIGURE.test(x);
  const altTitle = (x) => ALT_LBL.test(x) && !specKey(x) && !MOVING.test(x) && !PART_FIGURE.test(x);
  // A title over two cells shifts every column after it without a sign in the row, so each figure laid over a cell this
  // way must also be likely for its kind and for the genset's power (prime, else standby, kW): a value that is not
  // ends the walk there ("Engine power" over prime and standby put 1207 under "Fuel consumption").
  const nums = (v) => (String(v).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
  // Figures of a genset's row that its own output rules out are left out (thà thiếu còn hơn giữ số sai; Khoa duyệt
  // 17/11/2026, rà soát lệch dòng cột mục A5): an engine power in kW over 3 times or under 0,9 times the set's kW
  // (eastern-lion "Engine power (kW) = 19408" on a 10 kW set), a consumption written in g/kWh outside 150-300 (taihai
  // "g/kw.h" = 62, a figure in L/h), a weight in kg under 2,5 kg per kVA (a current or a kW read as the weight).
  // Only with the unit written in the cell or its title, and only against the row's own output.
  // dropped(s): told of each figure left out (unread notes).
  function saneSpecs(specs, power, dropped) {
    const P = Object.values(power || {}).filter(Boolean), kws = P.map((p) => p.kW ?? (p.kVA != null ? p.kVA * 0.8 : null)).filter((x) => x > 0);
    if (!kws.length || !specs?.length) return specs;
    const lo = Math.min(...kws), hi = Math.max(...kws);
    const dec = (x) => +String(x).replace(",", ".");
    return specs.filter((s) => { const keep = sane(s); if (!keep && dropped) dropped(s); return keep; });
    function sane(s) {
      const v = String(s.value).replace(/(\d),(\d{3})(?!\d)/g, "$1$2"), both = v + " " + (s.label || ""); // "1,097 kWm" is 1097
      if (s.key === "engPower") {
        if (!/kw/i.test(both) || /hp|ps\b|bhp|cv\b|马力/i.test(both)) return true;
        const tagged = [...v.matchAll(/(\d+(?:[.,]\d+)?)\s*kw/gi)].map((m) => dec(m[1]));
        const n = tagged.length ? tagged : /^[≈~]?\s*\d+(?:[.,]\d+)?$/.test(v.trim()) ? [dec(v.replace(/[≈~\s]/g, ""))] : [];
        return !n.length || !(n.every((x) => x > hi * 3) || n.every((x) => x < lo * 0.9));
      }
      if (/^fuel(75|50)?$/.test(s.key)) {
        if (!/g\s*\/\s*kw/i.test(both)) return true;
        const m = v.match(/\d+(?:[.,]\d+)?/); if (!m) return true;
        const x = dec(m[0]); return x >= 150 && x <= 300;
      }
      if (s.key === "weight") {
        const m = v.replace(/(\d),(\d{3})\b/g, "$1$2").trim().match(/^[≈~]?\s*(\d+(?:\.\d+)?)\s*(kg|kgs)?$/i); if (!m) return true;
        return +m[1] / (hi / 0.8) >= 2.5;
      }
      return true;
    }
  }
  function likely(key, v, kW) {
    const n = nums(v), x = n[0];
    if (x == null) return /^(gov|asp|emission|engType|excit|controller|cooling|start|insul|ip|phase)$/.test(key);
    switch (key) {
      case "cyl": return x >= 1 && x <= 20;
      // Over 100 L only when the SET's own kW makes it plausible (0.01-0.3 L per kW, up to 300 L): a 16-cylinder 200x210 engine
      // is 105.56 L (frs, tellhow, waeta, yunding), honny QTA20V 108 L on 2,640 kW; a 108 L figure on a 250 kW set (0.43) stays out.
      case "disp": return /cc|ml/i.test(v) ? x >= 400 && x <= 100000 : x >= 0.4 && (x <= 100 || (x <= 300 && !!kW && x / kW >= 0.01 && x / kW <= 0.3));
      case "bore": return n.length >= 2 && n.slice(0, 2).every((y) => y >= 50 && y <= 400);
      case "dims": return n.length >= 3 && n.slice(0, 3).every((y) => (y >= 300 && y <= 16000) || (y >= 0.3 && y <= 16));
      case "weight": return /^[≈~]?\s*\d+(?:[.,]\d+)?\s*(kg|kgs|t)?$/i.test(String(v).trim()) && x >= 30 && x <= 80000;
      case "speed": return [1000, 1200, 1500, 1800, 3000, 3600].includes(x);
      case "engPower": return !kW || (x >= kW * 0.9 && x <= kW * 1.8);
      // g/kWh up to 300 on a set of 30 kW or less: a 10 kW set burns 264 (frs-shenyang FRS-10P), which no L/h band of
      // its power allows. Not on larger sets, where 271 is a current and 280 an engine's standby kW next to the fuel.
      case "fuel": return x < 1.5 || (x >= 150 && x <= (kW && kW <= 30 ? 300 : 260)) || (kW ? x >= kW * 0.12 && x <= kW * 0.45 : x <= 800);
      case "fuel75": return x < 1.5 || (x >= 150 && x <= (kW && kW <= 30 ? 300 : 260)) || (kW ? x >= kW * 0.09 && x <= kW * 0.36 : x <= 650);
      case "fuel50": return x < 1.5 || (x >= 150 && x <= (kW && kW <= 30 ? 300 : 280)) || (kW ? x >= kW * 0.06 && x <= kW * 0.26 : x <= 450);
      case "noise": return x >= 40 && x <= 120;
      default: return true;
    }
  }
  // A genset's power title laid over the engine's (alternator's) cell: the header has no title for that column, so every
  // title after it is one column too far left (lees-power: "Electrical Power KW" over the engine, "Gas Consumption" over the efficiency).
  const POWER_TITLE = /^(?!.*(brand|make|品牌|厂家)).*(power|output|功率)/i;
  const kWOf = (power) => (power?.prime || power?.rated || power?.standby)?.kW || null;
  function walkedSpecs(hs, cells, { ei = -1, ai = -1, gi = -1, power = null } = {}) {
    if (ei < 0 && ai < 0) return [];
    const kW = kWOf(power);
    // Two cells that hold the kVA and the kW of ONE rating read for this row (not a prime kW next to a standby kW,
    // frs-shenyang: each under a title of its own).
    const figOf = (v) => { const t = String(v ?? "").replace(/\s+/g, "").replace(/(kva|kwe?)$/i, "").replace(",", "."); return /^\d+(\.\d+)?$/.test(t) ? +t : null; };
    const onePair = (a, b) => { const x = figOf(a), y = figOf(b); return x != null && y != null && Object.values(power || {}).some((p) => p && ((p.kVA === x && p.kW === y) || (p.kVA === y && p.kW === x))); };
    const engT = engTitle, altT = altTitle;
    const got = new Map(), bad = new Set(), reads = [];
    for (const h of hs) {
      const starts = [], named = h.some((x) => engT(x) || altT(x));
      h.forEach((x, j) => {
        // "Engine | Modle" (sr-genset): the title is over the brand cell and the model has the next title; the model's cell
        // is at the next title, so the title and the cell do not line up: no walk from here (thà thiếu còn hơn đọc sai;
        // a kVA was read as the voltage, rà soát lệch cột 18/11/2026).
        const apart = /^\s*(model|modle|型号)\s*$/i.test(h[j + 1] || "") && !engT(h[j + 1]) && !altT(h[j + 1]);
        if (ei >= 0 && engT(x) && !apart) starts.push([j, ei, 1], [j, ei, -1]);
        if (ai >= 0 && altT(x) && !apart) starts.push([j, ai, 1], [j, ai, -1]);
      });
      if (gi === 0 && /model|型号|机组/i.test(h[0] || "") && !engT(h[0]) && !altT(h[0])) starts.push([0, 0, 1]);
      starts.push([h.length - 1, cells.length - 1, -1, true]);
      for (const [j0, c0, d, edge] of starts) {
        const mine = [];
        let anchored = !edge, skips = 0, keep = 0, miss = false, cut = null, lost = 0;
        for (let j = j0, c = c0; j >= 0 && j < h.length && c >= 0 && c < cells.length; j += d, c += d) {
          const x = h[j];
          // A title of the engine or alternator over another cell: a title before it spans two cells; what came before stays.
          if ((engT(x) && c !== ei) || (altT(x) && c !== ai)) break;
          // A "Max power" title (no key: an engine's own output is read elsewhere) of a lower header line over a number that is
          // no output of this set's size (yanfa n107: 1345 / 2730 under "最大功率 Max. power(kw)" for an 8 / 180 kW set): the line lies
          // off the row by the columns only the top line titles, so nothing of this walk is kept (lech-cot-11).
          if (kW && !specKey(x) && POWER_TITLE.test(x) && /max|最大/i.test(x)) { const v = nums(cells[c])[0]; if (v != null && !(v >= kW * 0.9 && v <= kW * 1.8)) { mine.length = 0; break; } }
          // A line that names neither ("| Model | Cylinder No. | ... | Brushless") may lay a title that is no figure over them.
          if ((c === ei && !engT(x)) || (c === ai && !altT(x))) { if (named || specKey(x) || POWER_TITLE.test(x) ||/^\s*l\s*[x×*]\s*l?\s*w\s*[x×*]\s*h/i.test(x)) break; }
          if (c === ei || c === ai) { anchored = true; continue; }
          const key = specKey(x), val = key && specVal(cells[c]);
          // A genset power title in a row wider than this header line spans two cells ("输出功率" over "KVA | KW",
          // "主用功率" over "KW | KVA"): every title after it lay one cell off, and a current or a standby kW was read as
          // the weight (yingtai-jiangsu "净重" = 36 on a 710 kg set; rà soát 17/11/2026). The title covers its cell and
          // the next one when both hold an output read for this row (titledPowers): the walk steps over the second.
          // Only on the walk from the genset model at the left: one from the engine's cell may start a cell off when the
          // header names the engine's make and model apart ("Engine | Model", sr-genset: a kVA was read as the voltage).
          if (!key && d === 1 && c0 === 0 && cells.length > h.length && POWER_TITLE.test(x) && !/电流|current|amp|\(A\)/i.test(x)) { if (!onePair(cells[c], cells[c + 1])) { miss = true; if (!power && ++lost >= 2 && cut == null) cut = mine.length; } else { if (!skips++) keep = mine.length; c++; } }
          if (!val) continue;
          if (!specFits(key, val) || !likely(key, val, kW)) break;
          // Two columns of one kind (open and silent size, weight): the one further left.
          const same = mine.findIndex((m) => m.key === key);
          if (same >= 0) { if (c < mine[same].c) mine[same] = { key, label: x, value: val, c }; }
          else mine.push({ key, label: x, value: val, c });
        }
        // Every power title of the line must cover such a pair: a row where one was not read (yingtai-jiangsu
        // "64 | 75 | 88 | 88", "330 | 375 | 380 | 475") is still a cell off after it, so nothing past the first pair
        // is kept (thà thiếu còn hơn đọc sai).
        // A power title not confirmed by a pair of cells (no power read for the row, or no kVA / kW pair): the cells after it
        // sit under a title count that is off by an unknown number of cells (yingtai n111 in the table with no unit line:
        // the current 115.2 read as the weight), so only what stood before that title is kept (lech-cot-11).
        if (miss) mine.length = Math.min(mine.length, cut ?? Infinity, skips ? keep : Infinity);
        // From the last cell alone, with no known cell on the way: only when two figures or more fit.
        if (!anchored && mine.length < 2) continue;
        for (const m of mine) { reads.push({ ...m, edge: !!edge }); const g = got.get(m.key); if (g && g.c !== m.c) bad.add(m.key); else if (!g) got.set(m.key, m); }
      }
    }
    // One cell read under two titles by two walks (a row with a cell left out: yingtai-jiangsu "… | 115.2 | 1200 |
    // 2.35*1.0*1.5", 1200 kg read as the speed from the left and the weight from the right): neither is known.
    // A title already read at two places says nothing about the cell.
    // A title read at two cells: when two walks that start from a known cell (engine, alternator, genset model) agree on one
    // cell and only the walk from the right edge says another, the edge walk is the one a row wider than the header throws
    // off by a cell (sanq-power n110 "Genset Weight": 3120 from three walks, 4495 from the edge): the agreed cell stands.
    for (const k of [...bad]) {
      const rs = reads.filter((r) => r.key === k), anchored = rs.filter((r) => !r.edge), cs = new Set(anchored.map((r) => r.c));
      if (anchored.length >= 2 && cs.size === 1) { got.set(k, anchored[0]); bad.delete(k); }
    }
    const at = new Map();
    for (const m of [...got.values()].filter((m) => !bad.has(m.key))) { const k = at.get(m.c); if (k && k !== m.key) { bad.add(k); bad.add(m.key); } else at.set(m.c, m.key); }
    return [...got.values()].filter((m) => !bad.has(m.key)).map(({ key, label, value }) => ({ key, label, value }));
  }

  function addMake(list, name, via) { if (name && !list.some((m) => m.name === name)) list.push({ name, via }); }

  // One supplier record → occurrences of engines and alternators. A controller maker's tables are its controllers'
  // datasheets (suppliers/maker-datasheets.mjs), read by the config bot as the controllers' figures, not as gensets.
  // notes (optional array): what this reading left out on purpose, { supplierId, n, table, title, row, reason, detail }
  // (chat-luong-3, Khoa 18/11/2026: a layout the code does not understand is left out AND listed, "thà thiếu còn hơn
  // sai"). unread() below adds the tables that gave no record at all.
  function fromSupplier(s, notes) {
    const out = [];
    if (s.role === "controller_maker") return out;
    const note = notes ? (t, ti, row, reason, detail) => notes.push({ supplierId: s.id, n: t.n, table: ti, title: String(t.title || ""), row, reason, detail: detail == null ? null : String(detail).slice(0, 200) }) : () => {};
    const ownBrand = (list) => brandIn([s.names?.en, ...(s.names?.brands || [])].join(" "), list);
    // A LOOSE_TABLES entry whose page has no table with its header any more (re-crawled, header changed): read nothing, say so.
    for (const x of LOOSE_TABLES) if (x.supplierId === s.id && !(s.specTables || []).some((t) => +t.n === x.n && String(t.header?.[0] ?? "").trim() === x.header)) {
      const ti = (s.specTables || []).findIndex((t) => +t.n === x.n);
      note(ti >= 0 ? s.specTables[ti] : { n: x.n, title: "" }, ti >= 0 ? ti : null, null, "bảng đầu phát / động cơ rời trong danh sách đổi tiêu đề: không đọc", ti >= 0 ? (s.specTables[ti].header || [])[0] : "không còn bảng nào của nguồn này");
    }
    (s.specTables || []).forEach((t0, ti) => {
      const url = ((s.sources || []).find((x) => x.n === t0.n) || {}).url || "";
      const t = tidyTable(t0, (reason, detail) => note(t0, ti, null, reason, detail), url);
      const headerText = (t.header || []).join(" ");
      const title = String(t.title || "");
      const titleHead = title.split(/\s[|–-]\s|\|/)[0];
      const tFreq = freqIn(headerText + " " + title);
      const hEng = brandIn(headerText, ENGINE_BRANDS), hAlt = brandIn(headerText, ALT_BRANDS);
      const tEng = brandIn(titleHead, ENGINE_BRANDS), tAlt = brandIn(titleHead, ALT_BRANDS);
      const base = { supplierId: s.id, n: t.n, table: ti, title };
      // A loose alternator / engine table on the list (LOOSE_TABLES, bang-roi-29): read by its entry only, then done.
      const looseT = LOOSE_TABLES.find((x) => x.supplierId === s.id && x.n === +t0.n && String(t0.header?.[0] ?? "").trim() === x.header);
      if (looseT) { out.push(...looseRows(s, looseT, t0, ti, (row, reason, detail) => note(t0, ti, row, reason, detail))); return; }
      const altT = ALT_TABLES.find((x) => x.supplierId === s.id && x.n === +t.n);
      if (altT) {
        if (String((t.header || [])[0] || "").trim() !== altT.header) { note(t, ti, null, "bảng đầu phát trong danh sách đổi tiêu đề: không đọc", (t.header || [])[0] || ""); return; }
        t.rows.forEach((line, ri) => {
          const cells = cellsOf(line), model = (cells[altT.model] || "").trim();
          if (!altT.code.test(model)) { note(t, ti, ri, "dòng bảng đầu phát không có model", line); return; }
          for (const o of altT.out) {
            const kW = +cells[o.kW], kVA = +cells[o.kVA];
            // kW / kVA of the alternator at that frequency must fit (0.75–0.86, or 0.8 rounded); otherwise left out, noted.
            const p = kW > 0 && kVA > 0 && kVA > kW ? fitPair(kVA, kW) : null;
            if (!p) { note(t, ti, ri, "công suất đầu phát không đọc được", `${o.freq} Hz: ${cells[o.kW]} / ${cells[o.kVA]}`); continue; }
            out.push({ ...base, row: ri, line, kind: "alternator", model, genset: null, power: { rated: { kW: p.kW, kVA: p.kVA } }, freq: o.freq, specs: [], makes: [], other: null, own: true, header: t.header || [] });
          }
        });
        return;
      }
      const makesFor = (kind, rowText, brandCell, model = "") => {
        const list = kind === "engine" ? ENGINE_BRANDS : ALT_BRANDS, makes = [];
        const cell = brandCell ? brandIn(brandCell, kind === "engine" ? list : ALT_CELL_BRANDS) : [];
        const row = brandIn(rowText, list), hdr = kind === "engine" ? hEng : hAlt, ttl = kind === "engine" ? tEng : tAlt;
        const own = kind === "alternator" ? brandIn(model, [FG_WILSON]) : []; // FG Wilson written in the alternator's own cell
        const rowLevel = MAKE_LEVEL_LOW.some((x) => x.supplierId === s.id && x.title.test(headerText)) ? "tên trang" : "dòng bảng";
        if (cell.length === 1) addMake(makes, cell[0], rowLevel);
        else if (row.length === 1) addMake(makes, row[0], rowLevel);
        else if (own.length === 1) addMake(makes, own[0], "dòng bảng");
        else if (kind === "alternator" && CN_ALT_CODE.test(String(model).trim())) return makes;
        else if (hdr.length === 1) addMake(makes, hdr[0], "tiêu đề cột");
        else if (ttl.length === 1) addMake(makes, ttl[0], "tên trang");
        else if (s.role === (kind === "engine" ? "engine_maker" : "alternator_maker")) { const o = ownBrand(list); if (o.length === 1) addMake(makes, o[0], "hãng sản xuất"); }
        return makes;
      };
      // An engine table on Khoa's list (ENGINE_TABLES): each row gives one engine record with the figures its entry names,
      // no genset power (so never a candidate row; its figures go with the engine's key).
      const engT = ENGINE_TABLES.find((x) => x.supplierId === s.id && x.n.includes(+t.n) && String(t0.header?.[0] ?? "").trim() === x.header);
      if (engT) {
        t.rows.forEach((line, ri) => {
          const cells = cellsOf(line);
          const brand = cells.length === engT.cells + 1 && engT.brand.test(cells[0]) ? cells.shift() : null;
          if (cells.length !== engT.cells) { note(t, ti, ri, "dòng bảng động cơ sai số ô", line); return; }
          const model = String(cells[engT.model]).trim();
          if (!isCode(model)) { note(t, ti, ri, "dòng bảng động cơ không có model", line); return; }
          const specs = [];
          for (const [key, i, label] of engT.specs) {
            const v = String(cells[i] ?? "").trim();
            if (v && SPEC[key].ok.test(v)) specs.push({ key, label, value: v });
          }
          out.push({ ...base, row: ri, line, header: t.header || [], kind: "engine", model, genset: null, power: null, freq: null, specs, makes: makesFor("engine", line, brand), other: null });
        });
        return;
      }
      const sec = isLabelTable(t) ? null : sectionSheet(t);
      if (sec || isLabelTable(t)) {
        // A page that lists several gensets one after the other ("Genset Model：SC700GFK" ... "Genset Model：SC85GFK",
        // supermaly): each "Genset Model" line starts a genset of its own.
        const starts = t.header?.length ? [] : t.rows.map((r, i) => (/^\|?\s*genset\s*model\s*[:：]/i.test(r) ? i : -1)).filter((i) => i >= 0);
        // A page that lists several ENGINES one after the other, each starting with its "Engine model" line ("Engine model :
        // QC380D / Rated power … / Engine model : QC385D …", yongcai n172): each such line starts an engine of its own, or the
        // last engine's output and speed were given to the first (QC380D 18.8 kW at 2350 rpm). Only when the sheet STARTS
        // with the engine line (keypower's blocks END with it: "Model / Prime / Fuel / Engine Model", the lines before an
        // engine line are the genset's own) and has two different models or more (lech-cot-11).
        // An engine's block is its line and the 3 after it (yongcai n170 lists unlabeled "Power output : 17kw to 19kw" lines
        // after NC485BPG's, which are no one's of that engine).
        const engLine = (r) => { const c = cellsOf(r); return c.length >= 2 && /^engine\s*model\s*[:：]?$/i.test(c[0]) && isCode(c[1]) ? keyOf(tidyModel(c[1], ENGINE_BRANDS)) : null; };
        const eStarts = sec || starts.length >= 2 || t.header?.length ? [] : t.rows.map((r, i) => (engLine(r) ? i : -1)).filter((i) => i >= 0);
        const engKinds = new Set(eStarts.map((i) => engLine(t.rows[i])));
        const engSplit = eStarts.length >= 3 && eStarts[0] === 0 && engKinds.size >= 3;
        // Two engines of different families (first three characters differ: "DP158LD" / "QSZ13G3"; a headline "4B3.9-G2" over a
        // table "4B3.9-G12", mingbang, is one engine written twice).
        const famKinds = new Set([...engKinds].map((k) => k.slice(0, 3)));
        // Two engines on one sheet whose lines cannot be told apart (hosem n134: DP158LD at line 11, QSZ13-G3 at line 19, the
        // "6 Cylinder In Line" of line 18 is the QSZ13's): the size figures of an engine (cylinders, displacement, bore,
        // compression) are left out of both.
        // A later engine line must name another engine than the ones before it and carry figure lines of its own (3 or more before
        // the next engine line or the end): the same engine named again (acepow n123 "Engine Model: | AP292F" then "Engine Model | AP292F") and the tail of
        // "Engine Model: X" lines of related products after a page's own table (acepow) has none.
        const multiEng = !engSplit && famKinds.size >= 2 && eStarts.some((i, k) => k > 0 && (eStarts[k + 1] ?? t.rows.length) - i - 1 >= 3 && !eStarts.slice(0, k).some((j) => engLine(t.rows[j]) === engLine(t.rows[i])));
        const blocks = sec ? [sec] : starts.length >= 2 ? starts.map((i, k) => t.rows.slice(i, starts[k + 1] ?? t.rows.length)) : engSplit ? eStarts.map((i, k) => t.rows.slice(i, Math.min(eStarts[k + 1] ?? t.rows.length, i + 4))) : [[...(t.header || []), ...t.rows]];
        for (const block of blocks) for (const c of fromLabelTable(block, { note: (reason, detail) => note(t, ti, null, reason, detail), bareModel: starts.length >= 2 && blocks.length > 1, engineModel: !sec && s.role === "engine_maker" && !block.some((l) => /^(engine|alternator|发动机|柴油机|发电机)\s*(model|type|ref\.?|型号)|^power\s*model|动力型号|^(diesel\s*)?engine$|^(发动机|柴油机)$|^(generator|alternator)$|power factor|excitation|voltage regulat|发电机/i.test(cellsOf(l)[0] || "")) })) {
          const power = c.prime || c.standby || c.rated ? { ...(c.prime ? { prime: c.prime } : {}), ...(c.standby ? { standby: c.standby } : {}), ...(c.rated ? { rated: c.rated } : {}) } : null;
          const rowText = [c.genset, c.engine, c.alternator].filter(Boolean).join(" ");
          // The alternator's "Model" of a section sheet repeating the genset's ("型号 | 30GF" under 发电机参数, chenxing): no alternator.
          if (sec && c.alternator && c.genset && keyOf(c.alternator) === keyOf(c.genset)) { note(t, ti, null, "mã đầu phát trùng model tổ máy", c.alternator); c.alternator = null; }
          // Two codes offered in one cell ("XN184H,XN184F", huachai n117): which one the set has is not known.
          for (const k of sec ? ["engine", "alternator"] : []) if (c[k] && /[,，、]/.test(c[k])) { note(t, ti, null, "một ô ghi hai mã", c[k]); c[k] = null; }
          c.specs = saneSpecs(c.specs, power, (x) => note(t, ti, null, "số vô lý so với công suất", `${x.key}=${x.value}`));
          if (multiEng && c.specs) c.specs = c.specs.filter((x) => {
            if (!["cyl", "disp", "bore", "compr"].includes(x.key)) return true;
            note(t, ti, null, "trang có hai động cơ: số liệu kích cỡ động cơ không rõ của động cơ nào", `${x.key}=${x.value}`);
            return false;
          });
          // A section sheet's set current must fit the set's power, as one read by position (posFits): its rows are
          // hand-typed and slip ("| Rated frequency | 415A" over "| Rated currency | 50Hz", huachai n111; 812 A for
          // "400GF", n105, whose alternator says 721 A; 540 A for "250GF", chenxing n117).
          if (sec && c.specs) c.specs = c.specs.filter((x) => {
            if (x.key !== "current" || (!/hz/i.test(x.value) && posFits("current", x.value, power, c.genset))) return true;
            note(t, ti, null, "dòng điện tổ máy không khớp công suất", `${c.genset}: ${x.value}`);
            return false;
          });
          if (c.engine && isCode(c.engine.replace(/^[a-z]+\s+(?=\S*\d)/i, (m) => (brandIn(m, ENGINE_BRANDS).length ? "" : m))))
            out.push({ ...base, kind: "engine", model: engineCode(c.engine.replace(/^(cummins|perkins|weichai|yuchai|deutz|volvo|baudouin|mtu|doosan|mitsubishi|sdec|kubota|yanmar|isuzu|ricardo|lovol|fawde)\s+/i, "")), makes: makesFor("engine", c.engine + " " + (c.engineBrand || ""), c.engineBrand), genset: c.genset || null, power, freq: tFreq || freqIn(block.join(" "), true), other: c.alternator || null, specs: c.specs || [], lines: { header: t.header || [], rows: t.rows } });
          // A cell that offers two alternators, each with its own make ("Stamford UCI274H / Leroy-Somer TAL-A44-M"): one record per
          // model, each with the make written next to it (a make is never guessed from a code, the two are not merged).
          const altSplit = splitAltCell(c.alternator);
          if (!altSplit && bareAltCodes(c.alternator)) { note(t, ti, null, "một ô ghi hai mã", c.alternator); c.alternator = null; }
          // A make then a code written with spaces ("Leroy Somer LSA 43.2 L6", gb-power n1010; catalog-b): the code alone,
          // when it is an alternator's (ALT_CODE) and the cell holds one code.
          const spaced = (ac) => { const m = ac.match(ALT_PREFIX), r = m ? ac.slice(m[0].length) : ""; return !!m && !/[/／]/.test(r) && isCode(r) && ALT_CODE.test(r); };
          // "Leroy Somer TAL-A46-F (50 Hz)" (saudi-diesel n110): the frequency is the code's, not part of it.
          const oneAlt = (x) => { const m = ALT_PREFIX.test(x) && x.match(FREQ_TAIL); return m ? { cell: x.replace(FREQ_TAIL, ""), freq: Number(m[1]) } : { cell: x, freq: null }; };
          for (const { cell: ac, freq: af } of altSplit || (c.alternator ? [oneAlt(c.alternator)] : []))
          if (isCode(ac.replace(/^[a-z-]+\s+(?=\S*\d)/i, "")) || ((altSplit || FG_PREFIX.test(ac)) && isCode(ac.replace(ALT_PREFIX, ""))) || spaced(ac))
            out.push({ ...base, kind: "alternator", model: ac.replace(ALT_PREFIX, ""), makes: altSplit ? makesFor("alternator", ac, null, ac) : makesFor("alternator", ac + " " + (c.altBrand || ""), c.altBrand, ac), genset: c.genset || null, power, freq: af || tFreq || freqIn(block.join(" "), true), other: c.engine || null, specs: c.specs || [], lines: { header: t.header || [], rows: t.rows } });
        }
        return;
      }
      const hasEngineCol = ENGINE_LBL.test(headerText) || hEng.length > 0 || (s.role === "engine_maker" && !GENSET_LBL.test(headerText + " " + title));
      const hasAltCol = ALT_LBL.test(headerText) || hAlt.length > 0;
      const ownAlt = hasAltCol && /alternator\s*model/i.test(headerText) ? OWN_ALT.find((x) => x.supplierId === s.id && x.n.includes(+t.n))?.code || null : null;
      const own = (c) => !!ownAlt && ownAlt.test(String(c).trim());
      // An engine maker's own engine table: the first cell of each row is the engine.
      const engineTable = s.role === "engine_maker" && !GENSET_LBL.test(headerText) && !/genset|generator set|机组/i.test(cellsOf(t.header?.[0] || "")[0] || "");
      const altFirst = (t.header || []).map(cellsOf).some((h) => {
        const a = h.map((x, i) => (altTitle(x) && !GENSET_LBL.test(x) ? i : -1)).filter((i) => i >= 0), e = h.map((x, i) => (engTitle(x) ? i : -1)).filter((i) => i >= 0);
        return a.length === 1 && e.length === 1 && a[0] < e[0] && a[0] > h.findIndex((x) => x);
      });
      // The one column the header titles "Engine", in a header row with as many cells as the row (laid cell for cell over
      // it): -1 when no such row, or two engine titles.
      const engCol = (n) => {
        const js = new Set();
        for (const h of (t.header || []).map(cellsOf)) if (h.length === n) h.forEach((x, i) => engTitle(x) && js.add(i));
        return js.size === 1 ? [...js][0] : -1;
      };
      // The one column the header titles as the genset's own model / number ("整机编号", "整机型号", "机组型号", "Genset model"),
      // in a header row with as many cells as the row: -1 when no such row, or two. Used only when the genset's code is the
      // row's FIRST code, in a column after the second (zhengchi n102-120: "功率 | 备用功率 | 品牌 | 整机编号 | 柴油机型号" put the
      // genset code at 3, so it was read as the engine and the real engine model (柴油机型号) was lost; catalog-b3).
      const GEN_TITLE = /^(整机|机组|发电机组|成套机组)\s*(型号|编号|代号)$|^(genset|generator\s*set)\s*model$/i;
      const gensetCol = (n) => {
        const js = new Set();
        for (const h of (t.header || []).map(cellsOf)) if (h.length === n) h.forEach((x, i) => GEN_TITLE.test(x.trim()) && js.add(i));
        return js.size === 1 ? [...js][0] : -1;
      };
      t.rows.forEach((line, ri) => {
        // A note after the code ("1104C-44TAG2 made in china", "4BTA3.9-G2 （ QC58/67E ）") makes the cell
        // fail isCode and the next code (the alternator) would be read as the engine: drop the note.
        // An engine offered in two ratings in one cell ("6BT5.9-G1(G2)", "4B3.9-G1（G2）", simpson-power): which one the set
        // has is not known, and the row gives nothing (catalog-bang-r1; the note stripping below took "4B3.9-G1", and with the
        // cell left blank the next code, the datasheet "SP0022D-C.pdf", was read as the engine).
        const twoG = cellsOf(line).filter((c) => /-G\d+\s*[(（]\s*G\d+\s*[)）]$/i.test(c));
        if (twoG.length) { note(t, ti, ri, "một ô ghi hai mã", twoG.join(", ")); return; }
        // "CG250-H1 CONTACT" (fdk-energy): the page's "Contact" link text run into the model cell (catalog-a).
        // An emission stage in ASCII brackets after the code ("TAD1351GE(欧三)", "YC6T660-D31( 国三)", bdadl / pengpai) is the same kind
        // of note: without this the cell failed isCode and the row gave no engine (doc-ma-2).
        const raw = cellsOf(line).map((c) => c.replace(/\s+made in [a-z ]+$|\s*[（][^）]*[）]\s*$|\s*\(\s*[国欧][一二三四五六]\s*\)\s*$/i, "").replace(/^(\S+)\s+CONTACT$/, "$1").trim());
        // A make in Chinese, "&", then the code ("沃尔沃 & TAD530GE", "斯坦福 & UCI224G", rcg-power n124): the code alone is the
        // cell's model; the make stays in the row's text for makesFor (catalog-bang-r1).
        const cells = raw.map((c) => c.replace(/^[一-鿿]{1,8}\s*&\s*(?=\S*\d\S*$)/, "")).map((c) => {
          // Full-width hyphen U+FF0D inside a code cell, read as "-" (catalog-b3, Khoa 20/11/2026): an explicit supplier list, and
          // only a cell that is ONE code "YC12VTD2000－D30" (letters / digits either side), nothing else of the row or table.
          if (!DASH_FIX.some((x) => x.supplierId === s.id) || !/^[A-Za-z0-9.]+－[A-Za-z0-9.]+$/.test(c)) return c;
          note(t, ti, ri, "ô mã viết dấu － toàn chiều rộng, đọc như '-'", c);
          return c.replace("－", "-");
        });
        // A set of two engines ("| 900 | 820 | VOLVO PENTA | 2*TAD1355GE | EMS2 / ECU | 2*S4L1D-F41", baifa n106 TWIN; "2 x TAD1641GE",
        // tecnogen; "2X DC13 505A AE", green-power; catalog-a): the cell is "<2-4> x <code>". The code alone is read as the cell's model
        // and the cell is remembered in `twin`: the engine record of such a row carries `units` (how many engines the set has) and NO
        // power (the row's kVA / kW is the SET's: matched against one engine it would call TAD1355GE a 900 kVA engine), and no engine-scope
        // figure (the table does not say whether a displacement / cylinder count / engine rating on the row is one engine's or the
        // set's). A twin cell that is not the engine's (the alternator "2*S4L1D-F41") gives no record.
        // A power cell written "388VA" (yanan-power n101 / n107 "| YN388C | 388VA | 310kW | 350kVA | 280kW | QSNT-G2", catalog-doc-4): the "k" of
        // kVA is missing (the page writes "388kVA" in the sibling rows of the same genset). Read as kVA only when a kW cell of the SAME row
        // is 0.8 x the figure (310 / 388 = 0.80; 286 / 358; 330 / 413): otherwise it stays as written. Without this "388VA" was taken as the
        // engine model (letters + digits) and the real engine code of the row, QSNT-G2, was never read.
        const kwOfRow = cells.map((c) => c.match(/^(\d+(?:\.\d+)?)\s*kW$/i)).filter(Boolean).map((m) => +m[1]);
        cells.forEach((c, i) => { const m = c.match(/^(\d+(?:\.\d+)?)\s*VA$/i); if (m && kwOfRow.some((k) => Math.abs(k / +m[1] - 0.8) <= 0.01)) cells[i] = `${m[1]}kVA`; });
        const twin = [], twinCell = (c) => { const m = c.match(/^([2-4])\s*[x×*]\s*(\S.*)$/i); return m && [m[2], m[2].replace(/\s+/g, ""), m[2].split(/\s+/)[0]].some(isCode) ? m : null; };
        const twinRow = cells.some((c) => twinCell(c));
        if (twinRow && TWIN_ENGINE_SUPPLIERS.includes(s.id)) cells.forEach((c, i) => { const m = twinCell(c); if (m) { twin.push({ i, units: +m[1], text: c }); cells[i] = m[2]; } });
        // A kVA / kW misread with a look-alike letter ("3S0", "312.S" in vantek) is a figure, not a model (ocrFig).
        const codes = cells.map((c, i) => (!ocrFig(cells, i) && (isCode(c) || brandedCode(c, ENGINE_BRANDS) || brandedCode(c, ALT_BRANDS)) ? i : -1)).filter((i) => i >= 0);
        if (!codes.length) return;
        // Other suppliers (tecnogen "2 x TAD1641GE", green-power "2X DC13 505A AE"): the row gives nothing, as before (tests s6-tecnogen-cyl, bang-r1).
        if (twinRow && !twin.length) { note(t, ti, ri, "tổ máy nhiều động cơ", line); return; }
        // A table of series ("| Power range | models | Engine | Alternator | Controller", eastern-lion: "Engine By Cummins | 22 –
        // 444 kW | 40 | 4BTA3.9-G2 | EL 274K"): the row is a family of 40 models over a range of outputs, the engine and the
        // alternator are one example of it, not the set's own parts (lech-cot-11).
        if (/power\s*range/i.test(headerText) && cells.some((c) => /^\d+(?:\.\d+)?\s*[–-]\s*\d+(?:\.\d+)?\s*kw$/i.test(c))) { note(t, ti, ri, "dòng tổng quan dòng máy: một dải công suất, không là một tổ máy", line); return; }
        // A row that is itself label | value pairs ("| Model | CK7000S | CK7500S …" of a sheet the reader did not take as
        // one, "| Model | 1 5 GF | Model | F3L912D |"): which code is which part is not known from a row (chat-luong-3 LROW).
        if (cells.some((c) => /^(型号|model|机组型号|type)$/i.test(c))) { note(t, ti, ri, "dòng là cặp nhãn | giá trị", line); return; }
        const rowText = raw.join(" ");
        const freq = freqIn(rowText) || tFreq;
        let gi = -1, ei = -1, ai = -1;
        if (engineTable) ei = codes[0];
        else {
          gi = codes[0] === 0 || codes[0] === 1 || (codes[0] > 1 && codes[0] === gensetCol(cells.length)) ? codes[0] : -1;
          const rest = codes.filter((i) => i !== gi);
          const alt = rest.filter((i) => ALT_CODE.test(cells[i]) || (hasAltCol && FRAME_ALT.test(cells[i].trim())) || own(cells[i]));
          if (hasAltCol && alt.length) ai = alt[0];
          if (hasEngineCol) ei = rest.find((i) => i !== ai && !ALT_CODE.test(cells[i]) && !(hasAltCol && FRAME_ALT.test(cells[i].trim())) && !own(cells[i])) ?? -1;
          // OWN_ALT tables put the engine BEFORE the alternator: a code after the maker's alternator is the controller
          // ("RUIFEN6120"), the row's engine cell was no code ("D114系列WLD171").
          if (ownAlt && ai >= 0 && ei > ai) { note(t, ti, ri, "ô động cơ không đọc được, mã ở cột khác", `${cells[ei]} sau đầu phát ${cells[ai]}`); ei = -1; }
          if (hasAltCol && ai < 0 && ei >= 0) { const after = rest.filter((i) => i > ei); if (after.length === 1) ai = after[0]; }
          // A code of the row after the genset is a Doosan "P086TI" / "P126TI II" / "P158LE" (shaped like a Stamford P-frame) and
          // nothing else was taken as the engine, under an engine title: it is the engine; another alternator-shaped code of the row
          // ("274G") is the alternator (green-power n108 "MOTORE ENGINE", the alternator makers are columns of the header; uleengen
          // n5001 "Engine model | Alternator"; lech-cot-11).
          // A table with no alternator column never set `ai` (only `hasAltCol` does), so its lone Doosan "P126TI" never reached the rule
          // below and the row had no engine record (catalog-doosan-p, Khoa 20/11/2026: 288 rows, 40 tables): one alternator-shaped code
          // of the row, Doosan-shaped, under an engine title with nothing else taken as the engine.
          if (hasEngineCol && ei < 0 && ai < 0 && alt.length === 1 && DOOSAN_P.test(cells[alt[0]].trim())) ai = alt[0];
          if (hasEngineCol && ei < 0 && ai >= 0 && DOOSAN_P.test(cells[ai].trim())) { const dp = ai; ei = dp; ai = rest.find((i) => i !== dp && (ALT_CODE.test(cells[i]) || (hasAltCol && FRAME_ALT.test(cells[i].trim())))) ?? -1; }
          if (!hasAltCol && alt.length && hasEngineCol && ei >= 0) ai = alt.find((i) => i > ei) ?? alt.find((i) => i < ei && BC_ALT.test(cells[i].trim())) ?? -1; // (acepow "| APW-10.5 | … | BC164C | 10.8 | 12 | Y480BD": no title for the alternator, its BC1xx code stands before the engine; lech-cot-8) only after the engine: one before it, under no title, may be a Doosan "P158LE" or a Mitsubishi "S4L2" (tried 18/11/2026: 6 suppliers got engines as alternators)
          // The header names both, the alternator's title before the engine's ("| Alternator | Engine model", acepow;
          // "发电机型号 | 发动机型号", cldj-fujian), and the row has just these two codes after the genset: they stand in
          // the order of the titles (rà soát 18/11/2026: "APS164B | YD380D" was read engine, then alternator). A title
          // of the genset ("发电机组型号", a "Generator Model" in the first column) is not the alternator's.
          if (altFirst && rest.length === 2 && ei === rest[0] && ai === rest[1]) { ei = rest[1]; ai = rest[0]; }
          // With no genset model in front, a lone code is taken as the engine only in a table about engines.
          if (gi < 0 && ei === codes[0] && !hasEngineCol) ei = -1;
          // The code taken as the engine stands to the RIGHT of the column titled "Engine" (header row laid cell for cell over the
          // row), whose own cell has letters and digits but was passed over: an alternator-shaped code there is the engine, a cell
          // that is no code leaves the row with no engine (catalog-b, tecnogen n2005: "S3L2 SD" (shaped like a Stamford frame) and
          // "S4S DT SD" (no code) under "Engine", "AUS7310" of the "Standard panel" column was read as the engine; bruno "KOHLER
          // KDW 702" / panel "MCP 120-80"; eastern-lion "4105ZD(小泵）" / alternator "EL 224E"). A cell that is only a figure is
          // no sign: a title over two cells ("常用功率" over "KVA | KW") shifts the columns (taihai, ettes, kangwo, xingguang).
          const ej = engCol(cells.length), ce = cells[ej] || "";
          if (ej >= 0 && ei > ej && ej !== gi && /\d/.test(ce) && /[a-z]/i.test(ce)) {
            if (isCode(ce) && ALT_CODE.test(ce)) { if (ai === ej) ai = -1; ei = ej; }
            else if (!isCode(ce)) {
              note(t, ti, ri, "ô động cơ không đọc được, mã ở cột khác", `${ce} | ${cells[ei]}`);
              // An alternator taken only as "the one code after the engine" lost what placed it (eastern-lion: the controller
              // "RUIFEN6120" after "EL 224E"); one shaped like an alternator's code stays.
              if (ai > ei && !ALT_CODE.test(cells[ai]) && !(hasAltCol && FRAME_ALT.test(cells[ai].trim())) && !own(cells[ai])) ai = -1;
              ei = -1;
            }
          }
        }
        const orEng = OR_ENGINE_CELLS.find((x) => x.supplierId === s.id && x.n.includes(+t.n) && headerText.includes(x.header) && x.code.test(String(cells[x.engCell] ?? "").trim()) && ei === x.altCell && ai < 0);
        if (orEng) { note(t, ti, ri, "một ô ghi hai mã", cells[orEng.engCell]); ai = ei; ei = -1; }
        const bareEng = BARE_ENGINE_CELLS.find((x) => x.supplierId === s.id && x.n.includes(+t.n) && headerText.includes(x.header) && x.code.test(String(cells[x.engCell] ?? "").trim()) && ei === x.altCell && ai < 0);
        if (bareEng) { ai = ei; ei = bareEng.engCell; }
        // Twin cells: only the engine's is read; with the engine not on a twin cell the row stays unread as before (which code is which is not known).
        const twinEng = twin.find((x) => x.i === ei);
        if (twin.length && !twinEng) { note(t, ti, ri, "tổ máy nhiều động cơ", line); return; }
        for (const x of twin) if (x.i === ai) { note(t, ti, ri, "đầu phát ghép đôi, không dựng bản ghi", x.text); ai = -1; }
        const stop = ei >= 0 ? ei : ai >= 0 ? ai : cells.length;
        const titled = engineTable ? null : titledPowers((t.header || []).map(cellsOf), cells, { gi, ei, ai }, title);
        const power = engineTable ? null : titled ? titled.power : powersIn(cells.slice(gi >= 0 ? gi + 1 : 0, stop), headerText + " " + title, true);
        const common = { ...base, row: ri, line, genset: gi >= 0 ? cells[gi] : null, power, freq, header: t.header || [], specs: saneSpecs(rowSpecs(t, cells, { ei, ai, gi, power, note: (reason, detail) => note(t, ti, ri, reason, detail) }), power, (x) => note(t, ti, ri, "số vô lý so với công suất", `${x.key}=${x.value}`)) };
        // "TAD1650GE(1345GE)" (TWO_CODE_CELLS): which engine the set has is not known, so no engine record; the alternator stays.
        const twoCodes = ei >= 0 && TWO_CODE_CELLS.some((x) => x.supplierId === s.id && x.n.includes(+t.n) && x.code.test(cells[ei]));
        if (twoCodes) note(t, ti, ri, "một ô ghi hai mã", cells[ei]);
        if (ei >= 0 && !twoCodes) {
          const rec = { ...common, kind: "engine", model: tidyModel(cells[ei], ENGINE_BRANDS, MARK_KEEP[s.id]), makes: bareEng ? [] : makesFor("engine", rowText, null), other: ai >= 0 ? cells[ai] : null, own: engineTable };
          if (twinEng) { rec.units = twinEng.units; rec.setPower = common.power; rec.power = null; rec.specs = common.specs.filter((x) => SPEC[x.key]?.scope !== "engine"); }
          out.push(rec);
        }
        if (ai >= 0) out.push({ ...common, kind: "alternator", model: tidyModel(cells[ai], ALT_BRANDS), makes: makesFor("alternator", rowText, null, cells[ai]), other: ei >= 0 ? cells[ei] : null });
      });
    });
    // A one-model datasheet whose table gives the power but not the engine (Rehlko D440: a two-column PDF puts "Engine
    // ref." and "P158LE" on different lines, so no line names both; IB2600594596, 2026-11-06): the product line of
    // that source naming one genset model, one engine and one power gives the engine, with the table row that
    // holds that power, word for word, as its line. Only when that source gave no engine row.
    for (const p of s.productLines || []) {
      const pw = p.power, model = (p.engineModels || [])[0];
      if (p.kind !== "genset" || (p.engineModels || []).length !== 1 || !isCode(model) || !pw || pw.min !== pw.max || !(pw.min > 0) || !/^(kVA|kW)$/.test(pw.unit)) continue;
      for (const n of p.src || []) {
        if (out.some((o) => o.n === n && o.kind === "engine")) continue;
        const ti = (s.specTables || []).findIndex((t) => t.n === n && t.rows.some((r) => numbersOf(r).includes(pw.min)));
        if (ti < 0) continue;
        const t = s.specTables[ti], line = t.rows.find((r) => numbersOf(r).includes(pw.min)), kind = pw.rating === "prime" || pw.rating === "standby" ? pw.rating : "rated";
        const makes = [];
        for (const m of p.engineMakes || []) for (const b of brandIn(m, ENGINE_BRANDS)) addMake(makes, b, "tên trang");
        // Every rating the row gives (AGG CU1250D5 "1250/1000" ESP and "1125/900" PRP), else the line's one figure.
        const ms = [p.series, ...(p.engineModels || [])], row = rowPowerOf(t, line, pw, ms);
        const both = row && Object.keys(row).length > 1 ? row : colPowerOf(t, line, pw, ms) || sheetPowerOf(t, pw, ms) || acrossPowerOf(t, pw, ms) || namedRowsPowerOf(t, pw, ms) || row;
        out.push({ supplierId: s.id, n, table: ti, title: String(t.title || ""), row: t.rows.indexOf(line), line, genset: isCode(p.series) ? p.series : null, power: both || { [kind]: { [pw.unit]: pw.min } },
          freq: freqIn((p.frequency || []).join(" ")) || freqIn(`${(t.header || []).join(" ")} ${t.title || ""}`), header: t.header || [], specs: [], kind: "engine", model: tidyModel(model, ENGINE_BRANDS), makes, other: null, fromLine: true });
        break;
      }
    }
    out.push(...listedEngineRows(s, out, note));
    out.push(...verticalRecords(s, out, note));
    out.push(...engineLines(s, out, note));
    out.push(...labelAltLines(s, out, note));
    // Fuel of each record (may-khi-2): from its table's signs and its own row; kept on the record, so it reaches `uses` of build().
    const fuelSg = new Map();
    for (const o of out) {
      if (!fuelSg.has(o.table)) { const t0 = s.specTables[o.table]; fuelSg.set(o.table, fuelSigns(t0, ((s.sources || []).find((x) => x.n === t0.n) || {}).url || "")); }
      const f = fuelFrom(fuelSg.get(o.table), o.line || `| ${o.genset || ""}`) || fuelPage(s.id, o, s.specTables[o.table]?.header?.[0]);
      if (f) { o.fuel = f.fuel; o.fuelFrom = f.from; o.fuelWhy = f.why; }
    }
    return altMakeAsk(mergeRepeats(splitEngineCells(s, namedPower(s, tableDrops(s, rowExceptions(s, columnSpecs(s, out, note), note), note), note), note)));
  }
  // Engine tables Khoa listed one by one (catalog nhóm 3, câu 6 = C, Khoa 20/11/2026): an engine maker's figures on a genset
  // supplier's page, no genset in the row. Keyed by supplier + n + the FIRST header line word for word (a re-crawl that
  // changes it lapses the entry: the table is then read the common way). `cells`: cells of a row; a row with one more cell
  // whose first cell is the brand (`brand`, only the first row: "进口 康明斯 Import Cummins") drops that cell. `specs`:
  // [key, cell, label as the source writes it]; a cell that is not a figure ("/") is left out.
  const ENGINE_TABLES = [
    { supplierId: "yingtai-jiangsu", n: [101, 2003], khoa: "Khoa 20/11/2026",
      header: "| 品 牌 Br and | 发 动 机 型 号 En g ine Ty pe | 功 率 (主用) Power (KW) | 功率 (备用) Po wer (KW) | 缸 数 No Of Cylin ders | 缸径 *行程 Bore /Strokse (MM) | 排 气 量 Exha ust Csp acity (L) | 压 缩 比 Com pression Ratio | 机 油 容 量 Lubri cating Cap acity (L) | 燃油耗 Fuel Consu mptio (G / KW.H) | 燃油消耗率 Fuel Con sum ptio (L/H) | 调 速方式 Type Of Gov ernor | 冷却液容量 Liquid coo lind ca paci ty | 排放等级 Emiss ion l eveis",
      cells: 13, brand: /康明斯|cummins/i, model: 0,
      specs: [["engPower", 1, "功率(主用) Power (KW)"], ["engPower", 2, "功率(备用) Power (KW)"], ["cyl", 3, "缸数 No Of Cylinders"], ["bore", 4, "缸径*行程 Bore/Stroke (MM)"], ["disp", 5, "排气量 Exhaust Capacity (L)"], ["compr", 6, "压缩比 Compression Ratio"]] },
  ];
  // Loose alternator and engine tables (bang-roi-29, chủ dự án 21/11/2026: "đọc cả 29 thành bản ghi đầu phát / động cơ"):
  // an alternator maker's range table, or an engine table, on a page of its own (dau-vao-bang-roi/29-bang.md, lớp A / E).
  // An explicit list checked by hand row by row, NOT a rule: supplier + n + the FIRST header line word for word (a re-crawl
  // that changes it lapses the entry, noted). Each entry names its cells (cellsOf of the row, after `lead` is dropped):
  //   kind: "alternator" | "engine"; rows: [first, last] row indexes read (a page holding two tables in one: keliang
  //     n108 / n124 rows 0–11 are an OCR'd size drawing, the figures come again, clean, below); code: the model a row must
  //     have (a garbled code like "STO7.5" / "7ZH-180AA4-7H", a repeated header line, "ST-7.5/8" two models: left out, noted).
  //   out (alternator): one record per entry { level, freq | freqCell, kW, kVA, pair }: cell indexes; kW and kVA of one
  //     record must fit (fitPair) and kW ≤ kVA, else the record is left out (noted). No kVA cell → kW only (single phase,
  //     a table giving kW only). `rated` = the maker's "Output" / "Rated power" (as ALT_TABLES); the level is prime /
  //     standby only where the header says so (nenjo "常用 Prime power" / "备用 Standby power", xinhengxin n118 "Prime").
  //   specs (engine): [key, cell, label as the source writes it]; a value not of the key's shape is left out.
  //   scope "supplier": the alternator is keyed `supplierId|keyOf(model)` in build(), so it never joins another supplier's
  //     record of the same name: "STC-10", "ST-5", "TFW2-…", "TZH-…" are series names many Chinese factories use for
  //     different machines (62 STC / ST keys already exist from 3 other suppliers). Only jet-power "JET…" and longkai
  //     "LK…" (the supplier's own code, every existing record of the key is that supplier's) and the engines (an engine
  //     maker's model: SDEC SC…, Cummins …-GM…, Changchai ZS…) join the common key.
  //   nameKw (nenjo): the model's number is its 50 Hz prime kW ("HJI-6.5 | 6.5"); a row where it is not ("HJI-1420 | 1520")
  //     is left out (which of the two is wrong is not known).
  // A model written twice in one table with other figures (lanzhou "TZH-280S4-TH" 90 / 100 kW, nenjo "HJI-200") is left
  // out both times (which row is right is not known); twice with the same figures is read twice (zhengdian variants).
  // Not read: longkai n113 rows 56–111 (the voltages 208/416…240/480 V, no frequency written), xinhengxin n108 "Rate
  // Capacity （KW）" (kVA figures under a kW title), weights / sizes / currents (genset-scope keys: they would show as the
  // set's), torque, rise-power n131 cylinders / displacement (all 20 SDEC keys already carry rise-power's and ≥ 12 other
  // suppliers' votes; "25.8" for SC27G755D2 / SC27G830D2 against 26.6 of 16 suppliers).
  const LOOSE_TABLES = (() => {
    const kw = (cell, level = "rated") => [{ level, kW: cell }];
    const two = (kW1, kVA1, kW2, kVA2, level = "rated") => [{ level, freq: 50, kW: kW1, kVA: kVA1 }, { level, freq: 60, kW: kW2, kVA: kVA2 }];
    const NJ = (n) => ({ supplierId: "nenjo-generator", n, kind: "alternator", scope: "supplier", header: "| High base | ModeL | KW | KW", lead: /中心高/, cells: [5], code: /^HJI-\d+(\.\d+)?$/, nameKw: true,
      out: [{ level: "prime", freq: 50, kW: 1 }, { level: "standby", freq: 50, kW: 2 }, { level: "prime", freq: 60, kW: 3 }, { level: "standby", freq: 60, kW: 4 }] });
    const SF = (n, header) => ({ supplierId: "shengfeng-fuan", n, kind: "alternator", scope: "supplier", header, cells: [5], code: /^TFW2-\d+$/, out: [{ level: "rated", kW: 1, kVA: 2 }] });
    const PL = (n) => ({ supplierId: "penlucky", n, kind: "engine", header: "| Model | Rated power output (kW@RPM) | Peak torque (N.m@RPM) | Cylinders | Displacement (L) | Aspiration", cells: [6],
      specs: [["engPower", 1, "Rated power output (kW@RPM)"], ["cyl", 3, "Cylinders"], ["disp", 4, "Displacement (L)"]] });
    const KJ = (n) => ({ supplierId: "kangjin-power", n, kind: "engine", header: "| | Model | Rated Power (kW@rpm) | Max Torque (N·m@rpm)", cells: [3], specs: [["engPower", 1, "Rated Power (kW@rpm)"]] });
    return [
      { supplierId: "eastern-lion-fuan", n: 154, kind: "alternator", scope: "supplier", header: "| | Model | 50Hz Output (kW) | 50Hz Output (kVA) | 60Hz Output (kW) | 60Hz Output (kVA)", cells: [5], code: /^(STC|TZH)-\d+$/, out: two(1, 2, 3, 4) },
      { supplierId: "gordon-power", n: 117, kind: "alternator", scope: "supplier", header: "| Model | Output | Current | Pole | Frq. | Speed", cells: [7], code: /^STC?-\d+(\.\d+)?$/, out: [{ level: "rated", kW: 1, kVA: 2, freqCell: 5 }] },
      { supplierId: "jet-power", n: 119, kind: "alternator", header: "| MODEL | 3-PHASE 50Hz /380V-440V | 3-PHASE 60Hz / 416V-480V | PACKAGE | WEIGHT", cells: [7], code: /^JET\d{3}[A-Z]{1,2}\d?$/, out: two(2, 1, 4, 3) },
      { supplierId: "keliang-fuan", n: 108, kind: "alternator", scope: "supplier", header: "| Model | Output | Installing dimensions | External dimensions", rows: [13, 24], code: /^STC-\d+(\.\d+)?$/, out: [{ level: "rated", kW: 1, kVA: 2 }] },
      { supplierId: "keliang-fuan", n: 124, kind: "alternator", scope: "supplier", header: "| Model | Output (kW) | Installing Dimensions | External Dimensions", rows: [9, 18], code: /^ST-\d+(\.\d+)?$/, out: kw(1) },
      { supplierId: "landtop-fuzhou", n: 114, kind: "alternator", scope: "supplier", header: "| Model | Rated Output (KW) | Current (A) | Voltage (V) | Rated Speed (r/min) | Frequency (Hz) | N,W (kg) | G.W (kg) | Size(cm) | 20″ PCS", cells: [8, 12], code: /^ST-\d+(\.\d+)?$/, out: kw(1) },
      { supplierId: "landtop-fuzhou", n: 115, kind: "alternator", scope: "supplier", header: "| Model | Rated Output (KW) | Rated Capacity (Kva) | Rated Current (A) | Rated Speed (r/min) | Rated Voltage (V) | Frequency (Hz) | N,W (kg) | G.W (kg) | Size(cm) | 20″ PCS", cells: [8, 11], code: /^STC-\d+(\.\d+)?$/, out: [{ level: "rated", kW: 1, kVA: 2 }] },
      { supplierId: "lanzhou-electric", n: 102, kind: "alternator", scope: "supplier", header: "| 型号 | 额定容量 KVA | 额定功率 KW | 额定电流 A | 额定转速 r/min | 效率 % | 重量 kg | 最大功率 KW | 型号 | 额定容量 KVA", cells: [8], code: /^TZH-\d{3}[A-Z]{1,2}\d-TH$/, out: [{ level: "rated", kW: 2, kVA: 1 }] },
      { supplierId: "longkai-power", n: 113, kind: "alternator", header: "| Model | KW/3PH/50Hz | 1PH/50Hz | Dimension(cm) | Weight(kg) | PDF", rows: [1, 55], cells: [7], code: /^LK\d{3}[A-Z]{1,2}(\/S)?$/, out: [{ level: "rated", freq: 50, kW: 2 }] },
      NJ(101), NJ(111),
      { supplierId: "shengfeng-fuan", n: 104, kind: "alternator", scope: "supplier", header: "| 型号 | 额定功率 (kW) | 额定容量 (kVA) | 额定电流 (A) | 功率因数 (cos&Phi;) | 额定转速 (r/min)", cells: [4, 6], code: /^STC-\d+(\.\d+)?$/, out: [{ level: "rated", kW: 1, kVA: 2 }] },
      SF(106, "| 型号 | 额定功率 (KW) | 额定功率 (KVA) | 频率 (HZ) | 电压 (v)"), SF(111, "| Model | Rated Power (KW) | Rated Capacity (KVA) | Fre. (HZ) | Voltage (v)"),
      { supplierId: "xinhengxin-fujian", n: 108, kind: "alternator", scope: "supplier", header: "| MODEL | Rate Power （KW） | Rate Capacity （KW） | Fre. (Hz) | Voltage (V)", cells: [5], code: /^XHX-\d+(\.\d+)?$/, out: kw(1) },
      { supplierId: "xinhengxin-fujian", n: 110, kind: "alternator", scope: "supplier", header: "| Model | Output | Current(A) | Voltage(V) | Rated P.F | No.of poles | Speed(r.p.m) | Volt.regulation", cells: [7, 11], code: /^ST-\d+(\.\d+)?$/, out: kw(1) },
      { supplierId: "xinhengxin-fujian", n: 118, kind: "alternator", scope: "supplier", header: "| Model | Prime | Voltage | Current | No.of pole | Speed | Volt.regulation", cells: [6, 8], code: /^STC-\d+(\.\d+)?$/, out: [{ level: "prime", kW: 1, kVA: 2 }] },
      { supplierId: "yihua-fujian", n: 105, kind: "alternator", scope: "supplier", header: "| Model | Rated Power (KW/KVA) | Rated Volt(V) | Rated Curr. (A) | Rated Speed (r/min) | Frequency (Hz) | Max.directly-starting Motor (kW)", cells: [7], code: /^TFX-\d+$/, out: [{ level: "rated", pair: 1, freqCell: 5 }] },
      { supplierId: "yingtai-jiangsu", n: 115, kind: "alternator", scope: "supplier", header: "| 型号 | 容量KVA | 功率KW | 电压V | 电流A | 相数 | 频率HZ | 防护等级IP | 绝缘等级 | 调压率%", cells: [10], code: /^(STC\d+(\.\d+)?|ST-\d+)$/, out: [{ level: "rated", kW: 2, kVA: 1, freqCell: 6 }] },
      { supplierId: "yingtai-jiangsu", n: 116, kind: "alternator", scope: "supplier", header: "| 型号 | 容量KVA | 功率KW | 电压V | 电流A | 相数 | 频率HZ | 防护等级IP | 绝缘等级 | 调压率%", cells: [10], code: /^YTW\d+(\.\d+)?$/, out: [{ level: "rated", kW: 2, kVA: 1, freqCell: 6 }] },
      KJ(101), KJ(102), PL(116), PL(119), PL(120),
      { supplierId: "rise-power", n: 131, kind: "engine", header: "| Model | Standby Power(kW) | Cylinders | Displacement (L) | Fuel Consumption(L/h) | Oil Consumption(g/kWh) | Lube Capacity(L) | Coolant Capacity(L) | Dimensions", cells: [10], specs: [["engPower", 1, "Standby Power(kW)"]] },
      { supplierId: "zhengdian-zhengzhou", n: 103, kind: "engine", header: "| 产品型号 | 规格 | 功率 KW | 转速 r/min", cells: [4], code: /^Z[SL]\d{3,4}[A-Z\d]*$/, specs: [["engPower", 2, "功率 KW"], ["speed", 3, "转速 r/min"]] },
    ].map((x) => ({ checked: "21/11/2026", ...x }));
  })();
  // The records of one LOOSE_TABLES table (raw rows of the stored table, as ENGINE_TABLES).
  function looseRows(s, x, t, ti, note) {
    const out = [], title = String(t.title || ""), rows = t.rows || [];
    const base = { supplierId: s.id, n: t.n, table: ti, title, header: t.header || [], genset: null, other: null };
    const tEng = brandIn(title.split(/\s[|–-]\s|\|/)[0], ENGINE_BRANDS);
    const cellsAt = (line) => { const c = cellsOf(line); if (x.lead && x.lead.test(c[0] || "")) c.shift(); return c; };
    const fig = (c) => { const v = String(c ?? "").trim(); return /^\d+(\.\d+)?$/.test(v) && +v > 0 ? +v : null; };
    const read = (line) => {
      const cells = cellsAt(line), model = String(cells[0] ?? "").trim();
      if (x.cells && !x.cells.includes(cells.length)) return { bad: "dòng không đúng bố cục cột của bảng" };
      if (x.code ? !x.code.test(model) : !isCode(model)) return { bad: "dòng không có model đọc được" };
      if (x.kind === "engine") {
        const specs = [];
        for (const [key, i, label] of x.specs) { const v = String(cells[i] ?? "").trim(); if (v && SPEC[key].ok.test(v)) specs.push({ key, label, value: v }); }
        return { model, specs, sig: specs.map((p) => `${p.key}=${p.value}`).join(";") };
      }
      if (x.nameKw && fig(cells[1]) !== +model.replace(/^\D+/, "")) return { bad: "số trong model khác công suất 50 Hz của dòng" };
      const recs = [];
      for (const o of x.out) {
        let kW = null, kVA = null;
        if (o.pair != null) { const p = String(cells[o.pair] ?? "").trim().split(/\s*\/\s*/); if (p.length === 2) { kW = fig(p[0]); kVA = fig(p[1]); } if (kW == null || kVA == null) { recs.push({ bad: String(cells[o.pair] ?? "") }); continue; } }
        else { kW = fig(cells[o.kW]); kVA = o.kVA != null ? fig(cells[o.kVA]) : null; if (kW == null || (o.kVA != null && kVA == null)) { recs.push({ bad: `${cells[o.kW] ?? ""} / ${o.kVA != null ? cells[o.kVA] ?? "" : ""}`, skip: o.level === "standby" }); continue; } }
        if (kVA != null && (kW > kVA || !fitPair(kVA, kW))) { recs.push({ bad: `${kW} kW / ${kVA} kVA` }); continue; }
        let freq = o.freq || null;
        if (o.freqCell != null) { const m = String(cells[o.freqCell] ?? "").trim().match(/^(50|60)\s*(?:hz)?$/i); freq = m ? +m[1] : null; }
        recs.push({ level: o.level, freq, p: kVA != null ? { kW, kVA } : { kW } });
      }
      return { model, recs, sig: JSON.stringify(recs) };
    };
    const [r0, r1] = x.rows || [0, rows.length - 1];
    const got = rows.map((line, ri) => (ri < r0 || ri > r1 ? null : read(line)));
    // The same model twice with other figures, or two models that keyOf makes one ("STC-7.5" / "STC-75", "HJI-12.8" /
    // "HJI-128": the dot is dropped) with other figures: neither row (they would join one record in build()).
    const sigs = new Map(), names = new Map();
    got.forEach((g) => { if (g && !g.bad) { const k = keyOf(g.model); sigs.set(k, [...(sigs.get(k) || []), g.sig]); names.set(k, new Set([...(names.get(k) || []), g.model.toUpperCase()])); } });
    got.forEach((g, ri) => {
      if (!g) return;
      const line = rows[ri];
      if (g.bad) { note(ri, g.bad, line); return; }
      if (new Set(sigs.get(keyOf(g.model))).size > 1) { note(ri, names.get(keyOf(g.model)).size > 1 ? "hai model trùng khoá (keyOf bỏ dấu chấm), số khác nhau: không đọc" : "model ghi hai lần với số khác nhau: không đọc", line); return; }
      const keyScope = x.scope === "supplier" ? { keyScope: "supplier" } : {};
      if (x.kind === "engine") {
        const makes = [];
        if (tEng.length === 1) addMake(makes, tEng[0], "tên trang");
        out.push({ ...base, row: ri, line, kind: "engine", model: g.model, power: null, freq: null, specs: g.specs, makes });
        return;
      }
      // One record per frequency; the levels of one frequency go into one record.
      const byFreq = new Map();
      for (const r of g.recs) {
        if (r.bad != null) { if (!r.skip) note(ri, "công suất đầu phát không đọc được", r.bad); continue; }
        const k = r.freq || 0;
        if (!byFreq.has(k)) byFreq.set(k, {});
        byFreq.get(k)[r.level] = r.p;
      }
      for (const [f, power] of byFreq) {
        if (power.prime && power.standby && power.prime.kW > power.standby.kW) { note(ri, "prime lớn hơn standby: để trống cả hai", line); continue; }
        out.push({ ...base, ...keyScope, row: ri, line, kind: "alternator", model: g.model, power, freq: f || null, specs: [], makes: [], own: true });
      }
    });
    return out;
  }
  // Genset power from the set's NAME, for tables Khoa listed (câu 7 = C, Khoa 20/11/2026), and the engine's output from a
  // named cell. huatai n111: "输出功率 (KW/KVA)" holds the engine's bore / stroke ("140/165"), no cell gives the set's power;
  // "200GF" … "1000GF" is the set's kW (each row's current is that kW at 400 V, cos φ 0.8; 167 / 167 "NNNGF" rows of huatai's
  // other tables read the same kW), the level is not written → `rated`. Keyed by supplier + n + first header line word for
  // word; every record of the table whose genset is "<kW>GF" and whose `engCell` is its engine model.
  const NAMED_POWER = [
    { supplierId: "huatai-yangzhou", n: 111, khoa: "Khoa 20/11/2026", name: /^(\d{2,4})GF$/i,
      header: "| 组型号Type of set | 输出功率 Power of output (KW/KVA) | 额定电流Rated current (A) | 柴油机参数 Parameters of set | 机组尺寸及重量 Size and weight of machine set",
      engCell: 3, engPower: [4, "柴油机参数 额定功率 power (KW)"] },
  ];
  function namedPower(s, list, note) {
    const ex = NAMED_POWER.filter((x) => x.supplierId === s.id);
    if (!ex.length) return list;
    return list.map((o) => {
      const x = ex.find((x) => x.n === o.n && String(o.header?.[0] ?? "").trim() === x.header);
      if (!x || o.kind !== "engine") return o;
      const m = String(o.genset || "").trim().match(x.name), cells = cellsOf(o.line || "");
      if (!m || String(cells[x.engCell] ?? "").trim() !== String(o.model).trim()) { note({ n: o.n, title: o.title }, o.table, o.row ?? null, "công suất theo tên không áp", o.genset); return o; }
      const ep = String(cells[x.engPower[0]] ?? "").trim();
      const specs = (o.specs || []).filter((sp) => sp.key !== "engPower");
      if (/^\d+(\.\d+)?$/.test(ep)) specs.push({ key: "engPower", label: x.engPower[1], value: ep });
      return { ...o, power: { rated: { kW: +m[1] } }, specs, powerFrom: "tên tổ máy" };
    });
  }
  // Figure columns of tables whose first header line has one cell fewer than the rows (S6-1, điều phối 21/11/2026), an explicit
  // list, not a rule. tecnogen n2001–n2010 (10 tables, 229 rows): "| MODEL | kVA LTP | … | | Regulator | Cylinder | cm3 | …" lost
  // one of its trailing blank cells, so neither header line lines up as a whole and only the second line's "Kg" was read. The
  // first line's cells up to "Cylinder" do line up (the second line puts "Engine" over cell 5, the engine of every record).
  // Read only for the table's engine records whose `engCell` is the record's engine, when the header cells named in `titles`
  // are word for word those (a re-crawl with another header lapses, noted) and the value has the key's shape.
  // S6-6 (Khoa 21/11/2026 "làm các cột còn lại"): "kWm 1500 rpm" / "kWm 1800 rpm" → two `engPower` figures, each with its own
  // label (spec-norm takes the speed from the label: cond.rpm 1500 / 1800), so neither overwrites the other.
  // S8-2 (Khoa 22/11/2026 "làm cc → L"): "cm3" → `disp`, label "cm3" as the header writes it; spec-norm reads the unit cc from
  // the label and turns it into litres with l_from_cc of web/conversions.js (S8-1), so the figure votes in litres. NOT read:
  // "Aspiration" (cells "N" / "T", no legend on the pages, the shape `asp` asks for is not met) and "Cons. 70%" (the catalog has
  // fuel at 100 / 75 / 50 % load only). A dash cell ("--", "- - -") is no value.
  const COLUMN_SPECS = [
    { supplierId: "tecnogen", n: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010], why: "điều phối 21/11/2026 (S6-1, S6-6); Khoa 22/11/2026 (S8-2)",
      titles: [[0, 7, "Cylinder"], [0, 8, "cm3"], [0, 9, "kWm 1500 rpm"], [0, 10, "kWm 1800 rpm"], [1, 5, "Engine"]], engCell: 5,
      specs: [["cyl", 7, "Cylinder"], ["disp", 8, "cm3"], ["engPower", 9, "kWm 1500 rpm"], ["engPower", 10, "kWm 1800 rpm"]] },
  ];
  function columnSpecs(s, list, note) {
    const ex = COLUMN_SPECS.filter((x) => x.supplierId === s.id);
    if (!ex.length) return list;
    return list.map((o) => {
      const x = ex.find((x) => x.n.includes(+o.n));
      if (!x || o.kind !== "engine") return o;
      const t = { n: o.n, title: o.title }, hs = (o.header || []).map(cellsOf), cells = cellsOf(o.line || "");
      if (!x.titles.every(([h, i, w]) => String(hs[h]?.[i] ?? "").trim() === w)) { note(t, o.table, o.row ?? null, "cột thông số theo danh sách không áp: đổi tiêu đề", String(o.header?.[0] ?? "")); return o; }
      if (String(cells[x.engCell] ?? "").trim() !== String(o.model).trim()) return o;
      const add = [];
      for (const [key, i, label] of x.specs) {
        const v = specVal(cells[i]);
        if (!v || /^[-–—\s]+$/.test(v) || [...(o.specs || []), ...add].some((sp) => sp.key === key && (key !== "engPower" || sp.label === label))) continue;
        if (!specFits(key, v)) { note(t, o.table, o.row ?? null, "thông số không đúng dạng: để trống", `${key}=${v}`); continue; }
        add.push({ key, label, value: v });
      }
      return add.length ? { ...o, specs: [...(o.specs || []), ...add] } : o;
    });
  }
  // Spec keys of a whole table form left out (catalog-b3, Khoa 20/11/2026), an explicit list, not a rule: matched by supplier
  // AND a title in the table's header. zhengchi-power's tables of "整机编号" (n102+): the "缸数 | 排量(L)" columns disagree with
  // the other suppliers' figures for the same engine (displacement 164 of 321 models, cylinders 57 of 373: WP2.3D25E200
  // "6 | 8.2" against 4 cylinders, 2.3 L), so the figures are not taken for the engine. Everything else of the rows is read
  // as before. The n101 table ("机组型号") is not listed.
  // Make written in the rows of a whole table form counts at the LOWEST level ("tên trang") instead of "dòng bảng"
  // (catalog-b3, Khoa 20/11/2026), an explicit list: matched by supplier AND a title in the table's header. zhengchi-power's
  // "整机编号" tables put the BRAND OF A WHOLE CATALOGUE CATEGORY in the "品牌" cell ("上柴" covers SDEC's own SC-series and the
  // licensed Mitsubishi S12R / S16R; "潍柴" covers WP, M26 / M33, PHF, K41xx, R61xx, D226B, 495D), so it is not the maker of
  // each engine. At row level that one vote turned Mitsubishi / Ricardo / Wudong engines of other suppliers to "chưa rõ" or to
  // another make (22 engines, 3,828 row-turns). As a page-level vote it still names the make where nothing higher exists.
  // Suppliers whose code cells may carry U+FF0D (full-width hyphen) as the hyphen (catalog-b3, Khoa 20/11/2026). Only zhengchi-power
  // (4 rows: n112 / n113 / n114 / n116 "YC12VTD…－D30"); aosif, jiangchai-xuzhou, walter-yangzhou, westinpower write the same in
  // their own codes and are NOT listed (not approved).
  const DASH_FIX = [{ supplierId: "zhengchi-power", khoa: "Khoa 20/11/2026" }];
  // An engine cell naming two codes, the second shortened ("TAD1650GE(1345GE)", sanq-power n111 / n117; Khoa 21/11/2026 "A"): the page
  // does not say what the bracket means, and other suppliers give the two codes different displacements (TAD750GE 7.15 L /
  // TAD532GE 4.76 L, TAD1650GE 16.12 L / TAD1345GE 12.78 L). An explicit list: no engine record, the row's alternator is kept.
  // eastern-lion-fuan n122 / n141 / n146 / n151 (S6-3, điều phối 21/11/2026): "(YD4KD) YD485D", one row each; the tables do not say
  // what the bracket means (YD4KD appears nowhere else on them) and the whole cell was the engine model. Same rule.
  const TWO_CODE_CELLS = [{ supplierId: "sanq-power", n: [111, 117], code: /^[A-Z]+\d+([A-Z]+)\(\d+\1\)$/, khoa: "Khoa 21/11/2026" },
    { supplierId: "eastern-lion-fuan", n: [122, 141, 146, 151], code: /^\(YD4KD\) YD485D$/, khoa: "điều phối 21/11/2026 (S6-3)" }];
  // An engine cell naming two engines joined by "或" (or): "ZS1110或295D", xingguang-jiangsu n108 (bang-roi-29, điều phối
  // 21/11/2026, same rule as TWO_CODE_CELLS). The cell failed isCode, so the alternator "STC-12" of the next cell was read as
  // the ENGINE. An explicit list (supplier + n + the cell indexes of the header "柴油机型号 | 发电机型号"): no engine record,
  // the code of `altCell` is the alternator, noted "một ô ghi hai mã". n110 writes "或" in the ALTERNATOR cell ("TZHW或TFW")
  // and reads its engine right: not listed.
  // An engine cell that is a bare number ("195", "1100", "4100"), zhengdian-zhengzhou n107 (S6-4, điều phối 21/11/2026): isCode
  // passes it over, so the alternator "STC-5-4" of the next cell was read as the ENGINE (role swap, 6 rows). An explicit list
  // (supplier + n + the header titles of the two cells): the bare number of `engCell` is the engine model as written, the code
  // of `altCell` the alternator. Khoa's rule for "ZS195 / 195": no make (none looked up), no code made up ("195" stays "195").
  const BARE_ENGINE_CELLS = [{ supplierId: "zhengdian-zhengzhou", n: [107], engCell: 3, altCell: 4, code: /^\d{3,4}$/, header: "柴油机型号 | 发电机型号", why: "điều phối 21/11/2026 (S6-4)" }];
  // Twin-engine sets read as ONE engine record carrying `units` (baifa n101–n106 TWIN, "2*TAD1355GE"; catalog-doc-4, điều phối 24/11/2026).
  // An explicit list: tecnogen and green-power still give no record for "2 x …" cells (their own tests say so).
  const TWIN_ENGINE_SUPPLIERS = ["baifa-power"];
  const OR_ENGINE_CELLS = [{ supplierId: "xingguang-jiangsu", n: [108], engCell: 2, altCell: 3, code: /^[A-Z\d]+或[A-Z\d]+$/, header: "柴油机型号Motor Type", why: "điều phối 21/11/2026" }];
  // "YD4KD(YD485D)" of comappower n113 / yanan-power n111 (S6-5, điều phối 21/11/2026; 4 rows, tables with no alternator column): the
  // pages do not say what the bracket means. Same rule as TWO_CODE_CELLS above (kept apart from its declaration on purpose).
  TWO_CODE_CELLS.push(
    { supplierId: "comappower", n: [113], code: /^YD4KD\(YD485D\)$/, khoa: "điều phối 21/11/2026 (S6-5)" },
    { supplierId: "yanan-power", n: [111], code: /^YD4KD\(YD485D\)$/, khoa: "điều phối 21/11/2026 (S6-5)" });
  // One engine cell naming several codes (ma-dong-co-trung PR 2, Khoa 20/11/2026 "1. b"): an explicit list "cell=code+code", not a
  // rule ("6M11G150/5", "4D24TG2/A", "8300D/M-2" are one code). Each code gets its own record; figures of the engine are left out
  // (`splitEngineCells`: the row does not say which code they belong to). "cell=code": the bracket is the supplier's own code that
  // no other key uses, so the code outside it stays, with its figures. Not listed (no source says what they are): "DE2V1000 (2V92)",
  // koop "X:KD156FA/XE:KD186FAE", "(M)", "(E)", a bare figure in brackets. Nor sunny-weifang "ZS1110/295D", "ZS1115/2100D": two makers
  // in one cell, and the row's one make on both records took the make off all four keys (Changchai, Ricardo).
  const ENGINE_CELL_LIST = [
    "1104A-44TG1/ 1104D-E44TG1=1104A-44TG1+1104D-E44TG1", "1104C-44TAG2/ 1104D-E44TAG2=1104C-44TAG2+1104D-E44TAG2", "1104D-44TG1/ 1103A-33TG2=1104D-44TG1+1103A-33TG2",
    "1106A-70TAG2/ 1106D-E70TAG2=1106A-70TAG2+1106D-E70TAG2", "1106A-70TG1/ 1106D-E70TAG3=1106A-70TG1+1106D-E70TAG3", "12M33G14D3/5 (12M33G1650/5)=12M33G14D3/5+12M33G1650/5",
    "2206D-E13TAG3 /2206A-E13TAG6=2206D-E13TAG3+2206A-E13TAG6", "4012-46TWG3A/ 4012-46TAG1A=4012-46TWG3A+4012-46TAG1A", "4012-46TWG4A/ 4012-46TAG2A=4012-46TWG4A+4012-46TAG2A",
    "403A-11G1/ 403D-11G=403A-11G1+403D-11G", "403A-15G1/ 403D-15G=403A-15G1+403D-15G", "404A-22G1/ 404D-22G=404A-22G1+404D-22G", "4B3.9-G1/ 4B3.9-G2=4B3.9-G1+4B3.9-G2",
    "4BT3.9-G1/ 4BT3.9-G2=4BT3.9-G1+4BT3.9-G2", "4M10G100/6 WP4.1D115E201=4M10G100/6+WP4.1D115E201", "4M10G83/6 WP4.1D95E201=4M10G83/6+WP4.1D95E201",
    "6LTAA8.9-G2/ 6LTAA8.9-G3=6LTAA8.9-G2+6LTAA8.9-G3", "6M11G110/6 WP6D132E201=6M11G110/6+WP6D132E201", "6M11G135/6 WP6D158E201=6M11G135/6+WP6D158E201",
    "6M33G8D3/5 (6M33G825/5)=6M33G8D3/5+6M33G825/5", "P126TI-II / P126TI=P126TI-II+P126TI", "S16R2-PTA/S16R2-PTAW=S16R2-PTA+S16R2-PTAW",
    "DX22 (DP222CC)=DX22+DP222CC", "DX37 (DP372CC)=DX37+DP372CC",
    "12V4000G14F(3B) 12V4000G74F(3D)=12V4000G14F+12V4000G74F", "12V4000G14S(3B) 12V4000G74S(3D)=12V4000G14S+12V4000G74S", "12V4000G24F(3B) 12V4000G84F(3D)=12V4000G24F+12V4000G84F",
    "12V4000G24S(3B) 12V4000G84S(3D)=12V4000G24S+12V4000G84S", "16V4000G14F(3B) 16V4000G74F(3D)=16V4000G14F+16V4000G74F", "16V4000G14S(3B) 16V4000G74S(3D)=16V4000G14S+16V4000G74S",
    "16V4000G24F(3B) 16V4000G84F(3D)=16V4000G24F+16V4000G84F", "20V4000G14F(3B) 20V4000G64F(3D)=20V4000G14F+20V4000G64F", "20V4000G14S(3B) 20V4000G64S(3D)=20V4000G14S+20V4000G64S",
    "20V4000G24F(3B) 20V4000G74F(3D)=20V4000G24F+20V4000G74F", "20V4000G24S(3B) 20V4000G74S(3D)=20V4000G24S+20V4000G74S", "20V4000G34F(3B) 20V4000G84F(3D)=20V4000G34F+20V4000G84F",
    "20V4000G44S(3B) 20V4000G94S(3D)=20V4000G44S+20V4000G94S",
    // The second code written short.
    "10V1600G10F/G70F=10V1600G10F+10V1600G70F", "10V1600G10S/G70S=10V1600G10S+10V1600G70S", "10V1600G20F/G80F=10V1600G20F+10V1600G80F", "10V1600G20S/G80S=10V1600G20S+10V1600G80S",
    "12V1600G10F/G70F=12V1600G10F+12V1600G70F", "12V1600G10S/G70S=12V1600G10S+12V1600G70S", "12V1600G20F/G80F=12V1600G20F+12V1600G80F", "12V1600G20S/G80S=12V1600G20S+12V1600G80S",
    "18V2000G26F/G76F=18V2000G26F+18V2000G76F", "1103D-33G3/G2=1103D-33G3+1103D-33G2", "1104D-44TG3/G2=1104D-44TG3+1104D-44TG2", "1206J-E70TTAG3/4=1206J-E70TTAG3+1206J-E70TTAG4",
    "2206A/C-E13TAG2=2206A-E13TAG2+2206C-E13TAG2", "2206A/C-E13TAG3=2206A-E13TAG3+2206C-E13TAG3", "2206C-E13TAG2/3=2206C-E13TAG2+2206C-E13TAG3", "2206C/D-E13TAG2=2206C-E13TAG2+2206D-E13TAG2",
    "2506A/C-E15TAG1=2506A-E15TAG1+2506C-E15TAG1", "2506A/C-E15TAG2=2506A-E15TAG2+2506C-E15TAG2", "2506C-E15TAG1/2=2506C-E15TAG1+2506C-E15TAG2", "2506C/D-E15TAG1=2506C-E15TAG1+2506D-E15TAG1",
    "2606A/C-E13TAG2=2606A-E13TAG2+2606C-E13TAG2", "2606A/C-E13TAG3=2606A-E13TAG3+2606C-E13TAG3", "2806A-E18TTAG4/5=2806A-E18TTAG4+2806A-E18TTAG5", "2806A/C-E18TAG1A=2806A-E18TAG1A+2806C-E18TAG1A",
    "2806A/C-E18TAG2=2806A-E18TAG2+2806C-E18TAG2", "2806A/C-E18TAG3=2806A-E18TAG3+2806C-E18TAG3", "4008-TAG2A/2=4008-TAG2A+4008-TAG2", "4008TAG1A/1=4008TAG1A+4008TAG1",
    "4B3.9-G1/G2=4B3.9-G1+4B3.9-G2", "4BT3.9-G1/G2=4BT3.9-G1+4BT3.9-G2", "4Z2.3-G11/G21=4Z2.3-G11+4Z2.3-G21", "4Z2.3-G12/21=4Z2.3-G12+4Z2.3-G21", "4Z2.7-G11/21=4Z2.7-G11+4Z2.7-G21",
    "4Z2.7-G12/21=4Z2.7-G12+4Z2.7-G21", "4Z3.0-G11/21=4Z3.0-G11+4Z3.0-G21", "4Z3.0-G12/21=4Z3.0-G12+4Z3.0-G21", "4Z3.2-G12/21=4Z3.2-G12+4Z3.2-G21", "4ZT3.2-G11/21=4ZT3.2-G11+4ZT3.2-G21",
    "4ZT3.2-G12/21=4ZT3.2-G12+4ZT3.2-G21", "6BT5.9-G1/2=6BT5.9-G1+6BT5.9-G2", "6BT5.9-G1/G2=6BT5.9-G1+6BT5.9-G2", "6CTA8.3-G1/2=6CTA8.3-G1+6CTA8.3-G2",
    "BF8M1015CP-G3/4/5=BF8M1015CP-G3+BF8M1015CP-G4+BF8M1015CP-G5", "E3262LE202/212=E3262LE202+E3262LE212", "E3262LE212/202=E3262LE212+E3262LE202", "HC12V132ZL-LAG1/2A=HC12V132ZL-LAG1+HC12V132ZL-LAG2A",
    "KTA19-G3A/G4=KTA19-G3A+KTA19-G4", "KTA19-G4/G3A=KTA19-G4+KTA19-G3A", "KTA50-GS8/G8=KTA50-GS8+KTA50-G8", "QSK38-G3/G5=QSK38-G3+QSK38-G5", "QSK50-G4/G11=QSK50-G4+QSK50-G11",
    "QSK60-G3/G7=QSK60-G3+QSK60-G7", "QSK60-G4/G11=QSK60-G4+QSK60-G11", "QSK60-G6/G7=QSK60-G6+QSK60-G7",
    // The bracket is the supplier's own code.
    "4BTA3.9-G2 (QC50/60E)=4BTA3.9-G2", "4BTA3.9-G2 (QC58/67E)=4BTA3.9-G2", "4BTA3.9-G2(G45E1)=4BTA3.9-G2", "4BTA3.9-G2(G52E1)=4BTA3.9-G2", "6BT5.9-G1(G75M1)=6BT5.9-G1",
    "6BT5.9-G2 (QC86/100E)=6BT5.9-G2", "6BT5.9-G2 (QC96/115E)=6BT5.9-G2", "6BT5.9-G2(G75E1)=6BT5.9-G2", "6BT5.9-G2(G84E1)=6BT5.9-G2", "6BTA5.9-G2(G75E1)=6BTA5.9-G2",
    "PHF4056ZD1(R1J01)=PHF4056ZD1", "PHF4075ZLD1(R4J01)=PHF4075ZLD1", "PHF6084ZD1(R1J01)=PHF6084ZD1", "PHF6100ZLD1(R1J01)=PHF6100ZLD1", "PHF6110ZLD1(R2J01)=PHF6110ZLD1", "PHF6132ZLD1(R4J01)=PHF6132ZLD1",
    // ma-dong-co-trung PR 3: one code on two keys, the bracket form and the bare form. Listed only when no figure of the two keys
    // disagrees and the row's genset power lies in the bare key's range. What "(3B)", "(3D)" mean is not read: the row keeps
    // them in its own words. Not listed: zc-power "186FA(E)", "192F(E)" (compression), "1100F(E)" (power); a bare figure in brackets.
    "12V4000G14F(3B)=12V4000G14F", "12V4000G14S(3B)=12V4000G14S", "12V4000G24F(3B)=12V4000G24F", "12V4000G24S(3B)=12V4000G24S",
    "16V4000G14F(3B)=16V4000G14F", "16V4000G14S(3B)=16V4000G14S", "16V4000G24F(3B)=16V4000G24F", "16V4000G24S(3B)=16V4000G24S",
    "20V4000G14F(3B)=20V4000G14F", "20V4000G14S(3B)=20V4000G14S", "20V4000G24F(3B)=20V4000G24F", "20V4000G24S(3B)=20V4000G24S",
    "20V4000G34F(3B)=20V4000G34F", "20V4000G44S(3B)=20V4000G44S",
    "12V4000G74F(3D)=12V4000G74F", "12V4000G74S(3D)=12V4000G74S", "12V4000G84F(3D)=12V4000G84F", "12V4000G84S(3D)=12V4000G84S",
    "16V4000G74F(3D)=16V4000G74F", "16V4000G74S(3D)=16V4000G74S", "16V4000G84F(3D)=16V4000G84F",
    "20V4000G64F(3D)=20V4000G64F", "20V4000G64S(3D)=20V4000G64S", "20V4000G74F(3D)=20V4000G74F", "20V4000G74S(3D)=20V4000G74S",
    "20V4000G84F(3D)=20V4000G84F", "20V4000G94S(3D)=20V4000G94S",
    // Khoa 24/11/2026: the six Cummins "(M)" codes (4BTA3.9-G2, 6BT5.9-G2, KTA19-G3, KTA19-G4, KTA38-G, NTA855-G2) stay on their own keys.
    // Same code written two ways (gop-trung-ma, Khoa 24/11/2026: 6 nhóm có bằng chứng, trung-ma-28.md). Explicit cells, not a rule:
    // the "-G…(M)" Cummins codes (4BTA3.9-G2(M), 6BT5.9-G2(M), KTA19-G3(M), KTA19-G4(M), KTA38-G(M), NTA855-G2(M)) stay apart.
    // 4BTA3.9-GM4/7: kangwo n108 r1 (1 row), the row above in the same table and fengfa n101 r1 (same set CCFJ40JW) write "4BTA3.9-GM47".
    // 4HTAA4.3*G34: frs-shenyang n106 r23 (1 row), 21 uses by 16 suppliers write "4HTAA4.3-G34"; the same table writes "-G34" on its 6HTAA6.5 row.
    // KTA19-D(M), KTA38-D(M), NTA855-D(M): walter-yangzhou writes both in the same sets (n116 "(M)" ↔ n114 "-DM", same kW and consumption);
    // mecca-power (KTA19, KTA38) goes with it by Khoa's choice. (YD485D): acepow-fuan n114 r19 (1 row), 6 uses by 4 suppliers write "YD485D".
    "4BTA3.9-GM4/7=4BTA3.9-GM47", "4HTAA4.3*G34=4HTAA4.3-G34", "KTA19-D(M)=KTA19-DM", "KTA38-D(M)=KTA38-DM", "NTA855-D(M)=NTA855-DM", "(YD485D)=YD485D",
  ];
  // Alternator cells written two ways for the same code (gop-trung-ma, Khoa 24/11/2026): endress "ECP 28-M/4C" (n113, n114, n1013, n1024)
  // and "ECP28 M4C" / "ECP28 M4 C" / "ECP28-M4 C" (n133, n140, n144, n148): one supplier, the same set (n114 ↔ n144 share 50 Hz, PRP 18,3/14,6 kVA/kW,
  // 2190 cc), the maker's sheet writes "ECP28 M4 C". Only this one cell; ECP28-2S/4C, ECP32-2S/4C (no shared field) stay apart.
  // UCI274C(80KW) (jinlongteng-fujian n101, 4 rows; the supplier adds "(nnKW)" to every alternator of its table) ↔ "UCI274C-80KW"
  // (yihua-fujian n106, 2 rows "Rated Output 80KW", voltage series equal to Stamford's UCI274C-311 sheet): one code with its 80 kW level,
  // written two ways (Khoa 24/11/2026, trung-ma-28.md nhóm 4). Joined with each other only, NOT to the bare "UCI274C" (150+ uses by 37
  // suppliers; the maker's sheet gives no kW). The other "(nnKW)" cells of jinlongteng (UCI224E(48KW), UCI274D(96KW), ...) are not touched.
  const ALT_CELL_LIST = ["ECP 28-M/4C=ECP28 M4C", "UCI274C(80KW)=UCI274C-80KW"];
  // The genset code of a row written two ways inside one supplier (gop-trung-ma, Khoa 24/11/2026, trung-ma-28.md nhóm 21): kaihua-genset
  // n111 r40 "KH*2000GF" (the only "*" of that table, between KH-1800GF and KH-2200GF; 2750/2500 kVA/kW as in the 5 tables that write "KH-2000GF").
  // "supplierId:cell=code"; the field `genset` of the row's records only. KH-2000GF2 (n109) is another code and stays apart.
  const GENSET_CELL_LIST = ["kaihua-genset:KH*2000GF=KH-2000GF"];
  let engineCellCodes = null, altCellCodes = null, gensetCellCodes = null; // built on first use: `keyOf` is declared further down
  function splitEngineCells(s, list, note) {
    engineCellCodes ||= new Map(ENGINE_CELL_LIST.map((x) => { const [cell, codes] = x.split("="); return [keyOf(cell), codes.split("+")]; }));
    altCellCodes ||= new Map(ALT_CELL_LIST.map((x) => { const [cell, codes] = x.split("="); return [keyOf(cell), codes.split("+")]; }));
    gensetCellCodes ||= new Map(GENSET_CELL_LIST.map((x) => { const [from, to] = x.split("="), [sid, cell] = from.split(":"); return [`${sid}:${keyOf(cell)}`, to]; }));
    const engineKeys = new Set(SPECS.filter((x) => x[1] === "engine").map((x) => x[0])), out = [];
    for (let o of list) {
      const gc = o.genset ? gensetCellCodes.get(`${s.id}:${keyOf(o.genset)}`) : null;
      if (gc) o = { ...o, genset: gc };
      const codes = o.kind === "engine" ? engineCellCodes.get(keyOf(o.model)) : o.kind === "alternator" ? altCellCodes.get(keyOf(o.model)) : null;
      if (!codes) { out.push(o); continue; }
      if (codes.length === 1) { out.push({ ...o, model: codes[0] }); continue; }
      note({ n: o.n, title: o.title }, o.table, o.row ?? null, "một ô ghi hai mã", `tách thành ${codes.join(", ")}; bỏ thông số động cơ của dòng`);
      const specs = (o.specs || []).filter((sp) => !engineKeys.has(sp.key));
      for (const model of codes) out.push({ ...o, model, specs: [...specs] });
    }
    return out;
  }
  const MAKE_LEVEL_LOW = [
    { supplierId: "zhengchi-power", title: /整机编号/, khoa: "Khoa 20/11/2026", why: "ô 品牌 là nhãn của cả danh mục (上柴 gồm SC-series lẫn S12R / S16R; 潍柴 gồm WP, M26, PHF, K41xx, R61xx...)" },
  ];
  const TABLE_DROPS = [
    { supplierId: "zhengchi-power", title: /整机编号/, keys: ["cyl", "disp"], khoa: "Khoa 20/11/2026", why: "cột 缸数 / 排量 của bảng lệch số của NCC khác cho cùng động cơ (dung tích 164 / 321 model)" },
  ];
  function tableDrops(s, list, note) {
    const ds = TABLE_DROPS.filter((x) => x.supplierId === s.id);
    if (!ds.length) return list;
    return list.map((o) => {
      const d = ds.find((x) => (o.header || []).some((h) => x.title.test(h)));
      if (!d || !(o.specs || []).some((sp) => d.keys.includes(sp.key))) return o;
      note({ n: o.n, title: o.title }, o.table, o.row ?? null, "bỏ thông số theo bảng", `${d.keys.join(", ")}: ${d.khoa}, ${d.why}`);
      return { ...o, specs: o.specs.filter((sp) => !d.keys.includes(sp.key)) };
    });
  }
  // Rows Khoa decided one by one (not a rule: no other row changes). A record is hit only when supplier, source n,
  // genset model AND the source line, word for word, all match, so an exception lapses by itself when the source is
  // re-crawled. `nopower`: the record stays, its power is left empty; `drop`: the row gives no record. Each hit is
  // written in `notes` (reason "ngoại lệ theo dòng"). Test: suppliers/bang-r1.test.mjs.
  const ROW_EXCEPTIONS = [
    // kaihua OC16 (gas): the page's Standby column holds 360/360/360/349 kVA under Prime 364/409/455/395 kVA, i.e. the
    // two ratings swapped or one of them wrong; read by size it would be a guess.
    ...["| KH-291GF | 360 | 288 | 364 | 291 | OC16 071A 02-81 | 5200*2100*2390 | 5300",
      "| KH-327GF | 360 | 288 | 409 | 327 | OC16 071A 02-82 | 5200*2100*2390 | 5300",
      "| KH-364GF | 360 | 288 | 455 | 364 | OC16 071A 02-83 | 5200*2100*2390 | 5300",
      "| KH-316GF | 349 | 279 | 395 | 316 | OC16 071A 02-91 | 5200*2100*2390 | 5300"].map((line) => (
      { supplierId: "kaihua-genset", n: 114, genset: line.split("|")[1].trim(), line, act: "nopower", khoa: "Khoa 19/11/2026", why: "nguồn ghi Standby nhỏ hơn Prime (hai mức tự mâu thuẫn): để trống công suất, không ghép theo độ lớn" })),
    // huatai-yangzhou n111 700/800/850GF ("140/165", the engine's bore / stroke under the output title, catalog-b nopower
    // 19/11/2026): the whole table now takes the set's power from its name (NAMED_POWER, Khoa 20/11/2026).
    // mpmc MS530-2: "Standby Power: 553kVA/530kW" under "Prime Power: 602kVA" and the label table's "663kVA / 530kW".
    { supplierId: "mpmc-powertech", n: 114, genset: "MS530-2", line: "Standby Power: 553kVA/530kW", act: "drop", khoa: "Khoa 19/11/2026", why: "nguồn tự mâu thuẫn (standby 553 kVA và 663 kVA, nhỏ hơn prime 602 kVA): bỏ dòng" },
    // `dropspec` (catalog-b2): the row stays, only the listed spec keys of the row are left out (the source gets ONE figure
    // wrong; the rest of the row is read as before). Not a rule: no other row changes.
    // Weight: 1,440 kg on a 1,600 kW set and 5,500 kg on a 20 kW set (the same page's 4B3.9-G2 row of the 20 kW set says 600 kg).
    // pengpai n131 repeats the LZ1750 row word for word: `mergeRepeats` would put the figure back, so it is listed too.
    ...[["bdadl-shanghai", 104, "BDA-LZ1750", "| BDA-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440"],
      ["fukangsi-yangzhou", 2009, "FKS-LZ1750", "| FKS-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440"],
      ["pengpai-yangzhou", 103, "PPDL-LZ1750", "| PPDL-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440"],
      ["pengpai-yangzhou", 131, "PPDL-LZ1750", "| PPDL-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440"],
      ["fukangsi-yangzhou", 2001, "FKS-C20", "| FKS-C20 | 20/25 | 东风康明斯 | 4B3.9-G1 | 4 | 3.92 | 9 | ≤210 | 1600*800*1300 | 5500"],
      ["pengpai-yangzhou", 125, "PPDL-C20", "| PPDL-C20 | 20/25 | 东风康明斯 | 4B3.9-G1 | 4 | 3.92 | 9 | ≤210 | 1600*800*1300 | 5500"]].map(([supplierId, n, genset, line]) => (
      { supplierId, n, genset, line, act: "dropspec", keys: ["weight"], khoa: "Khoa 19/11/2026", why: "nguồn ghi khối lượng không hợp công suất của dòng (1.440 kg cho 1.600 kW, 5.500 kg cho 20 kW): bỏ riêng khối lượng, giữ phần còn lại của dòng" })),
    // `fixspec` (dung-tich-sua-1, Khoa 20/11/2026 "nếu đã biết lý do sao sai thì sửa cho đúng"): the source lost a decimal point in ONE
    // figure. The figure is replaced only when BOTH hold: (a) bore x stroke x cylinders of the SAME row gives the corrected figure
    // within 2 %, and (b) the engine maker's document or at least two other suppliers write the same figure. `from` is the source's
    // text (it must match the spec's value word for word), `to` the corrected figure, `why` the grounds, `src` where to check them.
    // The spec keeps `fixed` and the record `fixed[]`, so the catalog shows it as corrected, never as the source's own figure.
    // A row that lacks (a) or (b) gets `dropspec` instead.
    ...[["JL-320GF", "| JL-320GF | 320 | 400 | 576 | SC15G500D2 | 6 | 135*165 | 142 | 41 | 205 | 3100*1250*1650 | 2700", "142", "14.2", "6 | 135*165 → 14.17 L (lệch 0,2 %); bdadl n127, hanyang n125, sanq n121 ghi 14.2, 12 NCC ghi 14.16", "hình học dòng: 135×165×6 xi lanh = 14.17 L"],
      ["JL-350GF", "| JL-350GF | 350 | 437.5 | 630 | sC15G500D2 | 6 | 135*165 | 142 | 41 | 205 | 3150*1250*1650 | 2800", "142", "14.2", "6 | 135*165 → 14.17 L (lệch 0,2 %); bdadl n127, hanyang n125, sanq n121 ghi 14.2, 12 NCC ghi 14.16", "hình học dòng: 135×165×6 xi lanh = 14.17 L"]]
      .map(([genset, line, from, to, why, src]) => ({ supplierId: "jlmech-wuhan", n: 102, genset, line, act: "fixspec", fixes: [{ key: "disp", from, to, why, src }], khoa: "Khoa 20/11/2026", why })),
    { supplierId: "jlmech-wuhan", n: 104, genset: "JL-30GF", line: "| JL-30GF | 30.0 | 37.5 | 54 | YC2115ZD | 2 | 115*120 | 249 | 6.5 | 225 | 1500*800*1050 | 700", act: "fixspec", khoa: "Khoa 20/11/2026",
      fixes: [{ key: "disp", from: "249", to: "2.49", why: "2 | 115*120 → 2.49 L (lệch 0,1 %); fukangsi n2002 và pengpai n129 ghi 2.49", src: "hình học dòng: 115×120×2 xi lanh = 2.49 L" }], why: "mất dấu chấm: 249 → 2.49" },
    { supplierId: "jlmech-wuhan", n: 103, genset: "JL-10GF", line: "| JL-10GF | 10 | 2.5 | 18 | 403D-15G | 3 | 84*90 | 149 | 6 | 248 | 1250*700*1100 | 350", act: "fixspec", khoa: "Khoa 20/11/2026",
      fixes: [{ key: "disp", from: "149", to: "1.496", why: "3 | 84*90 → 1.496 L (lệch 0 %); 1.496 ở depco, genlitec ×3, gb-power, weiman, wintpower (1.5 ở jianghao, mingbang, aoke, rise, waeta)", src: "hình học dòng: 84×90×3 xi lanh = 1.496 L" }], why: "mất dấu chấm: 149 → 1.496" },
    // YCD4J12D-55: 105*125, 4 cylinders gives 4.33 L, but no other supplier lists the engine and no maker document was found: (b) fails.
    { supplierId: "jlmech-wuhan", n: 104, genset: "JL-40GF", line: "| JL-40GF | 40 | 50 | 72 | YCD4J12D-55 | 4 | 105*125 | 433 | 11 | 225 | 1800*800*1100 | 800", act: "dropspec", keys: ["disp"], khoa: "Khoa 20/11/2026", why: "mất dấu chấm (433, hình học dòng 4.33 L) nhưng chưa có tài liệu hãng / NCC khác cho YCD4J12D-55: bỏ riêng dung tích" },
    // mingbang n125: every row says 4 cylinders and a 3.3-6.0 L displacement for Volvo Penta TAD13xx / TAD16xx / TWD1643GE (the table looks
    // copied from small engines). Volvo: TAD1341GE-B / TAD1345GE in-line 6, 12.8 L (131x158), TAD1642GE in-line 6, 16.12 L (144x165). The row's
    // own bore x stroke (105*127, 100*127) is wrong too, so (a) fails for both keys: `dropspec` cyl + disp (Khoa 20/11/2026 "ok bỏ").
    ...["| 8 | MB-V252 | 315 | 252 | 347 | 277 | TAD1341GE | 4 | 3.3 | 105*127 | 61.7 | 4000×1800×2300",
      "| 9 | MB-V280 | 350 | 280 | 385 | 308 | TAD1342GE | 4 | 3.3 | 105*127 | 76.9 | 4000×1800×2300",
      "| 10 | MB-V300 | 375 | 300 | 413 | 330 | TAD1343GE | 4 | 4.4 | 105*127 | 69.9 | 4000×1800×2300",
      "| 11 | MB-V320 | 400 | 320 | 440 | 352 | TAD1344GE | 4 | 4.4 | 105*127 | 76.9 | 4300×2100×2500",
      "| 12 | MB-V360 | 450 | 360 | 495 | 396 | TAD1345GE | 4 | 4.4 | 105*127 | 93.2 | 4300×2100×2500",
      "| 13 | MB-V400 | 500 | 400 | 550 | 440 | TAD1641GE | 4 | 4.4 | 105*127 | 91.9 | 4500×2100×2600",
      "| 15 | MB-V500 | 625 | 500 | 688 | 550 | TWD1643GE | 4 | 6.0 | 100*127 | 69.9 | 4700×2100×2600"].map((line) => (
      { supplierId: "mingbang-mbkl", n: 125, genset: line.split("|")[2].trim(), line, act: "dropspec", keys: ["cyl", "disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi 4 xi lanh và dung tích 3,3–6,0 L cho động cơ Volvo Penta 6 xi lanh 12,8–16,1 L (bore / stroke của dòng cũng sai nên không đủ căn cứ sửa): bỏ xi lanh và dung tích" })),
    // yingtai's Cummins engine table (ENGINE_TABLES, no genset in the row: matched by `model`), n101 and n2003 (the same rows,
    // `mergeRepeats` would put a figure back): figures Cummins' own sheets give otherwise (catalog-hy-2.md, 20/11/2026).
    // KTA19-G4: Bore / Stroke 159 / 159 mm (cummins.com KTA19-G4 Coolpac sheet); QSL9-G5: compression ratio 16.8:1 (cummins.com
    // C300D2R data sheet, engine QSL9-G5); QSL9 G7: displacement 8.9 L (cummins.com "QSL9 G7 & G2").
    ...[101, 2003].flatMap((n) => [
      ["KTA19G4", "| KTA19G4 | 448 | 504 | 6 | 159X160 | 18.9 | 13.9:1 | 72 | 213 | 107 | 电调 | 95 | N/A", ["bore"], "nguồn ghi 159X160, Cummins ghi 159 × 159 mm"],
      ["QSL9G5", "| QSL9G5 | 268 | 310 | 6 | 114X145 | 8.8 | 17.8:1 | 24 | 199 | 63 | 电喷 | 28.5 | N/A", ["compr"], "nguồn ghi 17.8:1, Cummins ghi 16.8:1"],
      ["QSL9G7", "| QSL9G7 | 271 | 300 | 6 | 114X145 | 8.8 | 16.1:1 | 24 | 214 | 70 | 电喷 | 28.5 | 国三", ["disp"], "nguồn ghi 8.8 L, Cummins ghi 8.9 L cho QSL9 G7"],
      // Khoa 20/11/2026 (catalog-hy-2.md câu 1, 2): compression ratios the Cummins sheets found do not confirm. QSL9 G2–G4:
      // 17.8:1 is the QSL9-G5 figure the source repeats down the family (G5 itself is 16.8:1); QSK60G7: 16.2:1 no Cummins sheet gives.
      ["QSL9G2", "| QSL9G2 | 206 | 239 | 6 | 114X145 | 8.8 | 17.8:1 | 24 | 220 | 62 | 电喷 | 28.5 | 国三", ["compr"], "nguồn ghi 17.8:1, sheet Cummins không xác nhận", "Khoa 20/11/2026"],
      ["QSL9G3", "| QSL9G3 | 227 | 257 | 6 | 114X145 | 8.8 | 17.8:1 | 24 | 221 | 59 | 电喷 | 28.5 | 国三", ["compr"], "nguồn ghi 17.8:1, sheet Cummins không xác nhận", "Khoa 20/11/2026"],
      ["QSL9G4", "| QSL9G4 | 245 | 279 | 6 | 114X145 | 8.8 | 17.8:1 | 24 | 214 | 61 | 电喷 | 28.5 | 国三", ["compr"], "nguồn ghi 17.8:1, sheet Cummins không xác nhận", "Khoa 20/11/2026"],
      ["QSK60G7", "| QSK60G7 | 1615 | 1790 | 16 | 159X190 | 60.2 | 16.2:1 | 280 | 197 | 380 | 电喷 | 541 | N/A", ["compr"], "nguồn ghi 16.2:1, sheet Cummins không xác nhận", "Khoa 20/11/2026"],
    ].map(([model, line, keys, why, khoa]) => ({ supplierId: "yingtai-jiangsu", n, model, line, act: "dropspec", keys, khoa: khoa || "điều phối 20/11/2026 (cách #952 / #957)", why: `${why}: bỏ riêng số đó, giữ dòng` }))),
    // tecnogen n2002 cột "cm3" (S8-2, điều phối 22/11/2026, cùng tiền lệ yingtai QSL9G7 ở trên): QSL9 G3 / G7 ghi "8800" cm³ = 8.8 L.
    // QSL9G7: Cummins ghi 8.9 L (cummins.com "QSL9 G7 & G2"). QSL9G3: 114 × 145 × 6 = 8.88 L, 8.8 là cắt cụt; phiếu này tạo số đông MỚI 8.8
    // (fdk-energy + tecnogen + yingtai ↔ aosif 8.9) làm gói đòi ≥ 8,9 L loại mọi dòng QSL9G3 của 10 NCC. QSL9G5 (8900) không đụng.
    ...[["CU275TSX**", "| CU275TSX** | 275 | 250 | 317 | 288 | QSL9G3 | E | 6 | 8800 | 217 | 248 | 44,4 | 51,5 | T | AUS7310 | ACP 7320 | 68 | 600 | 390 | 120 | 223 | 3380",
      "nguồn ghi 8800 cm³ (8.8 L) cho QSL9 G3, hình học 114 × 145 × 6 = 8.88 L (8.8 là cắt cụt) và phiếu này tạo số đông mới 8.8 loại mọi dòng QSL9G3 ở gói đòi ≥ 8,9 L"],
      ["CU331TSX**", "| CU331TSX** | 330 | 300 | 385 | 350 | QSL9G7 | E | 6 | 8800 | 260 | 300 | 50,3 | 59,7 | T | AUS7310 | ACP 7320 | 68 | 600 | 390 | 120 | 223 | 3680",
      "nguồn ghi 8800 cm³ (8.8 L), Cummins ghi 8.9 L cho QSL9 G7"]].map(([genset, line, why]) => (
      { supplierId: "tecnogen", n: 2002, genset, line, act: "dropspec", keys: ["disp"], khoa: "điều phối 22/11/2026 (S8-2)", why: `${why}: bỏ riêng dung tích, giữ dòng` })),
    // dropspec, Khoa 20/11/2026 ("9 dòng loại": the source itself writes a wrong figure; the live page was re-read the same day and
    // equals the saved page word for word, so it is the source, not the reader). No replacement figure is written: the source gives none.
    // aoke-yangzhou n129: 排量(L) "108" / "105" on 250 kW sets (the same table writes "14" and "12.88" for its other engines).
    ...[["AOKE-C280", "| AOKE-C280 | 250KW | 280KW | 重庆康明斯 | MTAA11-G3 | 6 | 108 | 39 | 200 | 3100*1300*1760 | 3200 | | 详细参数"],
      ["AOKE-M275", "| AOKE-M275 | 250KW | 275KW | 奔驰 | 6R1600G20F | 6 | 105 | 43 | 200 | 2900*1150*1650 | 2620 | | 详细参数"]].map(([genset, line]) => (
      { supplierId: "aoke-yangzhou", n: 129, genset, line, act: "dropspec", keys: ["disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi dung tích 108 / 105 L cho tổ máy 250 kW (bảng cùng trang ghi 14 và 12.88 L cho động cơ khác): bỏ riêng dung tích" })),
    // jlmech-wuhan n103 JL-1000GF: "458" L (160×190 mm × 12 xi lanh); the next row of the table, JL-1200GF, writes 45.8 for the same engine size.
    // (doosan-hau-to PR, điều phối 20/11/2026: now `fixspec` 458 → 45.8; (a) 160×190×12 = 45.84 L, (b) 4012-46TWG2A: 21 NCC khác ghi 45.8 / 45.84 / 45.842.)
    { supplierId: "jlmech-wuhan", n: 103, genset: "JL-1000GF", line: "| JL-1000GF | 1000 | 1250 | 1800 | 4012-46TWG2A | 12 | 160*190 | 458 | 177 | 212 | 4950*2200*2550 | 8500", act: "fixspec", khoa: "Khoa 20/11/2026",
      fixes: [{ key: "disp", from: "458", to: "45.8", why: "12 | 160*190 → 45.84 L (lệch 0,1 %); 4012-46TWG2A ở 21 NCC khác ghi 45.8 / 45.84 / 45.842", src: "hình học dòng: 160×190×12 xi lanh = 45.84 L" }], why: "mất dấu chấm: 458 → 45.8" },
    // jlmech-wuhan n104 JL-180GF / JL-220GF: the Size cell has lost its "*" ("30001030*1550", "31001100*1750").
    ...[["JL-180GF", "| JL-180GF | 180 | 225 | 324 | YC6MK285L-D20 | 6 | 123*145 | 10.33 | 28 | 195 | 30001030*1550 | 2600"],
      ["JL-220GF", "| JL-220GF | 220 | 275 | 396 | Y06MK350L-D20 | 6 | 123*145 | 10.33 | 28 | 195 | 31001100*1750 | 2800"]].map(([genset, line]) => (
      { supplierId: "jlmech-wuhan", n: 104, genset, line, act: "dropspec", keys: ["dims"], khoa: "Khoa 20/11/2026", why: "ô kích thước mất dấu * (30001030*1550): bỏ riêng kích thước, không tự tách số" })),
    // aosif n123 AW1000 (8M33D979E201): "12V | 31.8"; the same table writes 8V / 26.1 for 8M33D845E201 (AW875). Same figures as AW1125 (PR catalog-b2-aosif).
    // 12V1600G80F (23/11/2026): 23.88 L is the 12V2000's figure (bdadl writes it for 12V2000G65 in the same family of rows); wintpower
    // writes 21 for G80F, and G10F / G20F / G70F / G80S are 21. The row has no bore x stroke, so `dropspec`, not `fixspec`. All five copies.
    ...[["bdadl-shanghai", 112, "BDA-M580"], ["bdadl-shanghai", 135, "BDA-M580"], ["fukangsi-yangzhou", 2007, "FKS-M580"], ["pengpai-yangzhou", 111, "PPDL-M580"], ["pengpai-yangzhou", 127, "PPDL-M580"]].map(([supplierId, n, genset]) =>
      ({ supplierId, n, genset, line: `| ${genset} | 528/580 | 奔驰MTU | 12V1600G80F | 12 | 23.88 | 50 | ≤198 | 3500*1350*1850 | 4350`, act: "dropspec", keys: ["disp"], khoa: "điều phối 23/11/2026", why: "nguồn ghi 23,88 L (số của 12V2000) cho 12V1600G80F; wintpower ghi 21: bỏ riêng dung tích, giữ dòng" })),
    { supplierId: "aosif", n: 123, genset: "AW1000", line: "| AW1000 | 900/720 | 1000/800 | 8M33D979E201 | 205.4 | 12V | 31.8 |", act: "dropspec", keys: ["cyl", "disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi 12V / 31,8 L cho động cơ 8M33 (cùng bảng ghi 8V / 26,1 L cho 8M33D845E201): bỏ riêng số xi lanh và dung tích" },
    // aosif n102: "12V" for QSK19 / KTA19 (6 in line; the same 18.9 L). Too few other sources for the layout rule to overrule the cell.
    ...[["AC700-I", "| AC700-I | 625/500 | 700/560 | QSK19-G31 | 136.5 | 12V | 18.9 |"], ["AC700-II", "| AC700-II | 625/500 | 700/560 | QSK19-G35 | 138 | 12V | 18.9 |"], ["AC750-III", "| AC750-III | 681/545 | 750/600 | KTA19-G9A | 147 | 12V | 18.9 |"]].map(([genset, line]) => (
      { supplierId: "aosif", n: 102, genset, line, act: "dropspec", keys: ["cyl"], khoa: "Khoa 22/11/2026", why: "nguồn ghi 12V cho động cơ QSK19 / KTA19 dung tích 18,9 L: bỏ riêng số xi lanh, không ghi số thay" })),
    // cameo-power n107 SC-70YC (column of a table written across): Engine Power 35/41 kW under a 64/70 kW set (the two other columns repeat the set's power).
    { supplierId: "cameo-power", n: 107, genset: "SC-70YC", line: "| Engine Power(kw) (prime/standby) | 50/55 | 55/60 | 35/41", act: "dropspec", keys: ["engPower"], khoa: "Khoa 20/11/2026", why: "nguồn ghi công suất động cơ 35/41 kW nhỏ hơn tổ máy 64/70 kW: bỏ riêng công suất động cơ" },
    // jiangchai-xuzhou n107 J20B400M (6M33D506E310): current "7200" A for a 450 kVA set (neighbours: 846 A for 520 kVA).
    { supplierId: "jiangchai-xuzhou", n: 107, genset: "J20B400M", line: "| J20B400M | 400 | 450 | 潍柴博杜安 | 6M33D506E310 | 7200 | 88 | 3.673*1.5*1.95 | 4500 | 详细", act: "dropspec", keys: ["current"], khoa: "Khoa 20/11/2026", why: "nguồn ghi dòng điện 7200 A cho tổ máy 450 kVA (dòng kế 846 A cho 520 kVA): bỏ riêng dòng điện" },
    // mingbang-mbkl n125 MB-V480 (TAD1642GE): "4 | 4.4" for a 480 kW set; the table gives 4 cylinders even for its 6.0 L row (TWD1643GE, 100×127), and
    // aoke-yangzhou writes TAD1642GE as 6 cylinders / 16.12 L. Bore × stroke stays (Khoa 20/11/2026: cyl + disp only).
    { supplierId: "mingbang-mbkl", n: 125, genset: "MB-V480", line: "| 14 | MB-V480 | 600 | 480 | 660 | 528 | TAD1642GE | 4 | 4.4 | 105*127 | 118.4 | 4700×2100×2600", act: "dropspec", keys: ["cyl", "disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi 4 xi lanh / 4,4 L cho tổ máy 480 kW (nguồn khác ghi 6 / 16,12 L): bỏ riêng số xi lanh và dung tích" },
    // [NHÁNH ĐO tad1341-9-36, chưa merge] TAD1341GE / TAD1342GE / TAD1351GE "9.36 L": 9.36 L = 6 x 120 x 138 is Volvo's TAD940GE / TAD941GE (zhengdian n109 gives
    // it for those, huatai n103's own bore 120/138 too); Volvo D13 (TAD1341GE-B) is 12.8 L (TAD1345GE 12.78 L, volvopenta.com / Welland). One table copied
    // by 6 suppliers (19 rows, repeated verbatim in other tables of liangzi, so both listed). The row has no bore x stroke of the D13, so only `dropspec` disp.
    ...[["bdadl-shanghai", 118, "BDA-V250", "| BDA-V250 | 250/312.5 | 沃尔沃遍达 | TAD1341GE | 6 | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450"],
      ["bdadl-shanghai", 118, "BDA-V250", "| BDA-V250 | 250/312.5 | 沃尔沃遍达 | TAD1342GE | 6 | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450"],
      ["bdadl-shanghai", 118, "BDA-V270", "| BDA-V270 | 270/337.5 | 沃尔沃遍达 | TAD1351GE(欧三) | 6 | 9.36 | 34 | ≤192 | 2900*1100*1600 | 2400"],
      ["fukangsi-yangzhou", 2005, "FKS-V250", "| FKS-V250 | 250/312.5 | 沃尔沃遍达 | TAD1341GE | 6 | 9.36 | 34 | ≤210 | 2900*1100*1600 | 2450"],
      ["fukangsi-yangzhou", 2005, "FKS-V280", "| FKS-V280 | 280/350 | 沃尔沃遍达 | TAD1342GE | 6 | 9.36 | 34 | ≤210 | 2900*1100*1600 | 2450"],
      ["huatai-yangzhou", 103, "260GF", "| 260GF | 260 | TAD1341GE | 6L | 120/138 | 9.36 | 34 | 2450 | 2900*1100*1600"],
      ["liangzi-yangzhou", 115, "LZ- V260", "| LZ- V260 | 260/325 | 瑞典沃尔沃 | TAD1342GE | 6 L | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450 | 详细参数"],
      ["liangzi-yangzhou", 116, "LZ- V250", "| LZ- V250 | 250/312.5 | 沃尔沃遍达 | TAD1341GE | 6 L | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450 | 详细参数"],
      ["liangzi-yangzhou", 116, "LZ- V260", "| LZ- V260 | 260/325 | 沃尔沃遍达 | TAD1342GE | 6 L | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450 | 详细参数"],
      ["liangzi-yangzhou", 116, "LZ- V250", "| LZ- V250 | 250/312.5 | 沃尔沃遍达 | TAD1351GE | 6 | 9.36 | 34 | ≤192 | 2900*1100*1600 | 2450 | 详细参数"],
      ["liangzi-yangzhou", 142, "LZ- V260", "| LZ- V260 | 260/325 | 瑞典沃尔沃 | TAD1342GE | 6 L | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450 | 详细参数"],
      ["liangzi-yangzhou", 143, "LZ- V250", "| LZ- V250 | 250/312.5 | 沃尔沃遍达 | TAD1341GE | 6 L | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450 | 详细参数"],
      ["liangzi-yangzhou", 143, "LZ- V260", "| LZ- V260 | 260/325 | 沃尔沃遍达 | TAD1342GE | 6 L | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450 | 详细参数"],
      ["liangzi-yangzhou", 143, "LZ- V250", "| LZ- V250 | 250/312.5 | 沃尔沃遍达 | TAD1351GE | 6 | 9.36 | 34 | ≤192 | 2900*1100*1600 | 2450 | 详细参数"],
      ["pengpai-yangzhou", 117, "PPDL-V250", "| PPDL-V250 | 250/312.5 | 沃尔沃遍达 | TAD1341GE | 6 | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450"],
      ["pengpai-yangzhou", 117, "PPDL-V250", "| PPDL-V250 | 250/312.5 | 沃尔沃遍达 | TAD1342GE | 6 | 9.36 | 34 | ≤202 | 2900*1100*1600 | 2450"],
      ["pengpai-yangzhou", 117, "PPDL-V270", "| PPDL-V270 | 270/337.5 | 沃尔沃遍达 | TAD1351GE(欧三) | 6 | 9.36 | 34 | ≤192 | 2900*1100*1600 | 2400"],
      ["pengpai-yangzhou", 126, "PPDL-V250", "| PPDL-V250 | 250/312.5 | 沃尔沃遍达 | TAD1341GE | 6 | 9.36 | 34 | ≤210 | 2900*1100*1600 | 2450"],
      ["pengpai-yangzhou", 126, "PPDL-V280", "| PPDL-V280 | 280/350 | 沃尔沃遍达 | TAD1342GE | 6 | 9.36 | 34 | ≤210 | 2900*1100*1600 | 2450"]].map(([supplierId, n, genset, line]) => (
      { supplierId, n, genset, line, act: "dropspec", keys: ["disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi 9.36 L (dung tích TAD940GE / TAD941GE) cho động cơ Volvo Penta D13 (12,8 L): bỏ riêng dung tích" })),
    // longkai n1158 / n1159 / n1016 (bo-doc-tieu-hao): decided by the coordinator 21/11/2026, Khoa informed. Unread before "N in line"
    // was read; left unread, no figure written in its place. Still open: n1158's 19 L + 159*159 (another engine's set; the bore is still read, as zhengchi n162's).
    ...[[1158, "LG1600WP", "| No. cylinders | 6 in line", "20M33D2020E310: tờ ghi 6 xi lanh, 159*159, 19 L (6 × π/4 × 159² × 159 = 18,94 L: bộ số của động cơ khác); aosif, hanyang-weifang, yunding-jiangsu ghi 20 xi lanh, 65.4 L (20 × π/4 × 150² × 185 = 65,38 L)"],
      [1159, "LG1800WP", "| No. cylinders | 6 in line", "20M33D2210E310: tờ ghi 150*185, 65.4 L; 6 xi lanh = 19,62 L, 20 xi lanh = 65,38 L; aosif, hanyang-weifang, yunding-jiangsu ghi 20 xi lanh"],
      [1016, "LG350SC", "| No. cylinders | 12 in line", "SC25G610D2: số 12 đúng (12 × π/4 × 135² × 150 = 25,76 L) và đã đủ phiếu 12 từ NCC khác; bỏ vì KIỂU \"in line\" trái 8 NCC ghi V"]].map(([n, genset, line, why]) => (
      { supplierId: "longkai-power", n, genset, line, act: "dropspec", keys: ["cyl"], khoa: "điều phối 21/11/2026", why: `${why}: bỏ riêng xi lanh, giữ dòng` })),
    // longkai n1053 / n1069 / n1144 (bo-doc-tieu-hao-3): the sheet's title names one engine, its body is another engine's set, so its
    // fuel figures left the row out of tenders on another engine's numbers. `line` is the sheet's title: an n holds several sheets.
    ...[[1053, "LG48C", "QSB3.9-G2", ["cyl", "disp", "bore", "fuel", "fuel75", "fuel50"], "tờ QSB3.9-G2 ghi 6 in line, 5.9 L, net 96 kW, 26 L/h cho Prime 48 kW (0,54 L/kWh): bộ số của động cơ 5.9 L"],
      [1069, "LG120C", "QSB6.7-G3", ["disp", "bore", "fuel", "fuel75", "fuel50"], "tờ QSB6.7-G3 ghi 5.9 L, 102*120: bộ số của động cơ 5.9 L"],
      [1144, "LG520WP", "6M33D633E200", ["cyl", "disp", "bore", "fuel", "fuel75", "fuel50"], "tờ 6M33D633E200 (Prime 520 kW) ghi V 12, 18.9 L, 159*159, Prime 536 kW: bộ số của động cơ khác"]].map(([n, genset, model, keys, why]) => (
      { supplierId: "longkai-power", n, genset, line: `| POWER YOUR FUTURE | ${model}`, act: "dropspec", keys, khoa: "điều phối 21/11/2026", why: `${why}: bỏ các số đó, giữ dòng` })),
    // westinpower n1064 TP880L (a PDF table written down the page): "Rated rotation speed 1191 r/min"; the same PDF writes "Engine speed Rated 1500 RPM" on page 2.
    { supplierId: "westinpower", n: 1064, genset: "TP880L", line: "| Rated rotation speed | r/min | 1191", act: "dropspec", keys: ["speed"], khoa: "Khoa 20/11/2026", why: "nguồn ghi tốc độ 1191 v/p (trang 2 cùng PDF ghi 1500 RPM): bỏ riêng tốc độ, không lấy số trang 2 thay" },
    // huipu-power n105 HP-P1330 / n106 HP-V280, HP-V400 (Khoa duyệt 20/11/2026, cùng kiểu "458" của jlmech):
    // "Swept volume(L)" 458 (160×190 mm × 12 xi lanh; dòng HP-P1113 cùng bảng ghi 45.8 cho 4012-46TWG2A) và 1278 (131×158 mm × 6 xi lanh).
    // doosan-hau-to PR (điều phối 20/11/2026): `fixspec` (a) 160×190×12 = 45.84 L, 131×158×6 = 12.78 L của chính dòng; (b) 4012-46TAG2A: 20 NCC khác
    // ghi 45.8 / 45.84 / 45.842; TAD1341GE-B và TAD1345GE: Volvo Penta ghi 12.78 L (suppliers/sources/volvo-penta/1010.md, 1011.md), TAD1345GE thêm 5 NCC.
    ...[[105, "HP-P1330", "| HP-P1330 | 1200 | 1330 | 4012-46TAG2A | 12 | 160*190 | 458 | 301 | 501 | 177.1 | 4980*2200*2520 | 10200", "458", "45.8", "12 | 160*190 → 45.84 L (lệch 0,1 %); 4012-46TAG2A ở 21 NCC khác ghi 45.8 / 45.84 / 45.842", "hình học dòng: 160×190×12 xi lanh = 45.84 L"],
      [106, "HP-V280", "| HP-V280 | 280 | 280 | TAD1341GE | 6 | 131*158 | 1278 | 65.4 | 148 | 36 | 3050*1114*1391 | 2420", "1278", "12.78", "6 | 131*158 → 12.78 L (lệch 0 %); Volvo Penta bulletin TAD1341GE-B: Displacement 12.78 l", "hình học dòng: 131×158×6 xi lanh = 12.78 L; volvo-penta/1010.md"],
      [106, "HP-V400", "| HP-V400 | 360 | 400 | TAD1345GE | 6 | 131*158 | 1278 | 96.8 | 210 | 36 | 3210*1114*1600 | 2750", "1278", "12.78", "6 | 131*158 → 12.78 L (lệch 0 %); Volvo Penta bulletin TAD1344GE / TAD1345GE: 12.78 l; aoke, bdadl, fukangsi, lees, pengpai ghi 12.78", "hình học dòng: 131×158×6 xi lanh = 12.78 L; volvo-penta/1011.md"]]
      .map(([n, genset, line, from, to, why, src]) => ({ supplierId: "huipu-power", n, genset, line, act: "fixspec", fixes: [{ key: "disp", from, to, why, src }], khoa: "Khoa 20/11/2026", why: `mất dấu chấm: ${from} → ${to}` })),
    // green-power n115 (bảng bỏ sót, ENGINE_CELL_TABLES) GP1000 A/M: "12V 1600 G31F | E | 16" — "12V" is 12 cylinders (MTU 12V 1600
    // spec: "Cylinder configuration 12 V"); as the only cylinder source of 12V1600G31F, the 16 ruled out mecca / lees rows for
    // HSMTs asking 12 (top 30 cloud #967). Now `fixspec` cyl 16 → 12 (sua-so-le-1, Khoa duyệt 21/11/2026 "fix"): the MTU sheet
    // "Series 1600 Gx0 and Gx1" lists 12V 1600 G31F (806 kW, the same 806 kW the supplier's list gives) and says "Cylinder
    // configuration 12 cyl" (opened 21/11/2026). The row has no bore x stroke, so (a) is replaced by the maker's own sheet.
    { supplierId: "green-power-generators", n: 115, genset: "GP1000 A/M", line: "| GP1000 A/M | O | 910 | 1005 | 12V 1600 G31F | E | 16 | 139 | 450 | 4450 | 1910 | 2250 | 6250 | | | |", act: "fixspec", khoa: "Khoa 21/11/2026",
      fixes: [{ key: "cyl", from: "16", to: "12", why: "mã 12V 1600 G31F; tài liệu MTU Series 1600 Gx0 / Gx1 ghi 12V 1600 G31F 806 kW, Cylinder configuration 12 cyl", src: "https://www.mtu-solutions.com/content/dam/mtu/products/power-generation/powergeneration-product-list-latest/3239091_MTU_Gendrive_spec_12V1600Gx0_Gx1_3B_A2A.pdf (mở 21/11/2026)" }], why: "nguồn ghi 16 xi lanh cho MTU 12V 1600 G31F: sửa thành 12 theo tài liệu hãng" },
    // aosif n1079 (PDF datasheet "255705512637.pdf", engine QSL9-G5): the "Engine specification" block is the QSL9-G7 sheet's
    // ("Model | QSL9-G7 | No. of cylinder | 4", bore 107x124, 6.69 L), so the 4 is not the QSL9-G5's; aosif n1078 (same sheet, 6 cylinders)
    // and its AC330 / AC395 rows (6L) say 6. The whole block's figures are dropped (cyl; điều phối 21/11/2026 added bore, disp, compr
    // of the same block: 107x124 / 6.69 L / 17.3:1 are not the QSL9's 114x145 / 8.9 L); `dropspec`, no figure written.
    { supplierId: "aosif", n: 1079, model: "QSL9-G5", line: "| No. of cylinder | 4", act: "dropspec", keys: ["cyl", "bore", "disp", "compr"], khoa: "Khoa 21/11/2026", why: "datasheet QSL9-G5 chép khối \"Engine specification\" của QSL9-G7 (4 xi lanh, 107x124, 6.69 L, 17.3:1; cùng NCC ghi 6 cho QSL9-G5): bỏ xi lanh, đường kính × hành trình, dung tích, tỉ số nén của khối đó" },
    // depco n2102 P158LE-1 (DPK-DD-441): "Cylinder 6 | Displacement 11.051" are the P126TI's figures; the same row's bore x stroke 128 X 142
    // x 8 = 14.62 L, depco's own P158LE rows (n2101, n2182) say 8 / 14.618 / 14.62, and bdadl, fukangsi, jianghao, haifeng, taihai, huatai,
    // wintpower, zhengdian, legapower ... write 8 cylinders and 14.618 L for P158LE-1: both (a) and (b) hold → `fixspec`.
    { supplierId: "depco-power", n: 2102, genset: "DPK-DD-441", line: "| Governor | Electrical | Displacement(L) | 11.051", act: "fixspec", khoa: "Khoa 21/11/2026",
      fixes: [{ key: "cyl", from: "6", to: "8", why: "P158LE-1 ở bdadl n133, fukangsi n2008, jianghao n106, haifeng n2006, taihai n105, huatai n108, wintpower n146 ghi 8 xi lanh; depco n2101 / n2182 (P158LE, cùng 128 X 142) ghi 8", src: "dòng khác của chính trang depco (n2101 / n2182) và NCC khác" },
        { key: "disp", from: "11.051", to: "14.618", why: "8 | 128 X 142 → 14.62 L (lệch 0 %); P158LE-1 ghi 14.618 ở bdadl, fukangsi, jianghao, haifeng, taihai, huatai, wintpower; 11.051 là dung tích của P126TI", src: "hình học dòng: 128×142×8 xi lanh = 14.62 L" }],
      why: "nguồn ghi 6 xi lanh / 11,051 L (số của P126TI) cho P158LE-1: sửa thành 8 / 14,618" },
    // TAD1345GE "16.12" L (huatai n103 360GF also "144/165"): 16.12 L = 6 x 144 x 165 is Volvo's TAD1642GE (aoke, bdadl, fukangsi, huipu, lees, pengpai give it for that
    // engine); TAD1345GE is 131 x 158 x 6 = 12.78 L (Volvo Penta bulletin sources/volvo-penta/1011.md "12.78 liter, in-line 6 cylinder", haifeng / taihai / jianghao / huipu bore 131/158,
    // aoke / bdadl / fukangsi / pengpai / lees 12.78). Only the keys that are wrong go (the 6 cylinders are right); no figure is written.
    // liangzi repeats the row word for word in n141: `mergeRepeats` would put the figure back, so it is listed too (điều phối 21/11/2026).
    { supplierId: "huatai-yangzhou", n: 103, genset: "360GF", line: "| 360GF | 360 | TAD1345GE | 6L | 144/165 | 16.12 | 48 | 3100 | 3200*1100*1800", act: "dropspec", keys: ["bore", "disp"], khoa: "điều phối 21/11/2026", why: "nguồn ghi 144/165 và 16,12 L (số của TAD1642GE) cho Volvo Penta TAD1345GE (131×158, 12,78 L): bỏ riêng đường kính × hành trình và dung tích, giữ 6 xi lanh" },
    // bdadl n134 BDA-V360 (TAD1345GE-B): "16.1" L is the TAD1642GE's again (16.12 L); the only row of that engine in this supplier (điều phối 21/11/2026).
    { supplierId: "bdadl-shanghai", n: 134, genset: "BDA-V360", line: "| BDA-V360 | 360/400 | 沃尔沃奔达 | TAD1345GE-B | 6 | 16.1 | 35 | ≤210 | 3200*1100*1800 | 3300", act: "dropspec", keys: ["disp"], khoa: "điều phối 21/11/2026", why: "nguồn ghi 16,1 L (số của TAD1642GE) cho Volvo Penta TAD1345GE-B (12,78 L): bỏ riêng dung tích, giữ 6 xi lanh" },
    ...[[113, "瑞典沃尔沃"], [140, "沃尔沃遍达"], [141, "瑞典沃尔沃"]].map(([n, mk]) => (
      { supplierId: "liangzi-yangzhou", n, genset: "LZ- V360", line: `| LZ- V360 | 360/450 | ${mk} | TAD1345GE | 6 L | 16.12 | 48 | ≤200 | 3200*1100*1200 | 3100 | 详细参数`, act: "dropspec", keys: ["disp"], khoa: "điều phối 21/11/2026", why: "nguồn ghi 16,12 L (số của TAD1642GE) cho Volvo Penta TAD1345GE (12,78 L): bỏ riêng dung tích, giữ 6 xi lanh" })),
    // `unitspec` (kw-hp-sua, Khoa 24/11/2026 "làm như em đề xuất"): the label says "(kW/Hp)" but the cell holds ONE figure (or "507/580",
    // not an HP / kW pair), so the unit is not written by the source: the spec stays, flagged `unitMissing`; spec-norm reads it with
    // no unit (`missing: unit`), never as kW. Explicit rows, NOT a rule "kW/Hp one figure = kW" (the other 44 one-figure cells stay kW).
    ...[["20V4000G63", "ET-3750", 143, "| ET-3750 | 2200 | 2750 | 2400 | 3000 | 20V4000G63 | 3311 | 20.V | TBA | 8300*2950*2550 | 21000 |", "3311"],
      ["20V4000G63L", "ET-3250", 143, "| ET-3250 | 2400 | 3000 | 2600 | 3250 | 20V4000G63L | 2590 | 20.V | TBA | 8300*2950*2550 | 21000 |", "2590"],
      ["20V4000G63L", "ET-3438", 143, "| ET-3438 | 2400 | 3000 | 2600 | 3250 | 20V4000G63L | 2590 | 20.V | TBA | 8300*2950*2550 | 21000 |", "2590"],
      ["20V4000G63L", "ET-4000", 143, "| ET-4000 | 2400 | 3000 | 2600 | 3250 | 20V4000G63L | 3311 | 20.V | TBA | 8300*2950*2550 | 21000 |", "3311"],
      ["K19-DM", "EC-450M6", 145, "| EC-450M6 | 450 | 563 | K19-DM | 507/580 | 6.L | 19 | 3360x1100x2480 | 3520 |", "507/580"]].map(([, genset, n, line, from]) => (
      { supplierId: "ettes-power", n, genset, line, act: "unitspec", keys: ["engPower"], from, khoa: "Khoa 24/11/2026", why: "ô \"(kW/Hp)\" không ghi đơn vị của số này (không phải cặp kW / HP): đánh dấu thiếu đơn vị, cần xác nhận, không đọc là kW" })),
    // gia-tri-sai (Khoa 24/11/2026): "Đưa từng ca vào danh sách để bỏ hoặc sửa" — vi phạm "sai" của spec-value-check mà NGUỒN ghi sai
    // (biết ô nào): `dropspec` bỏ riêng thông số đó, `nopower` để trống công suất; googol "Weight (kg)" (không nói của động cơ
    // hay tổ máy) là `unsurespec`: giữ hiện, cần xác nhận, không dùng để chấm / lọc. Danh sách sinh từ soát từng ca,
    // báo cáo genbid-work\dieu-phoi\nghiem-thu\gia-tri-sai.md; test suppliers/gia-tri-sai.test.mjs.
    { supplierId: "gfe-power", n: 1023, model: "2206C-E13TAG2 L", line: "| Compression ratio | 16 3:1", act: "dropspec", keys: ["compr"], khoa: "Khoa 24/11/2026", why: "[gfe-power n1023] nguồn ghi tỉ số nén \"16 3:1\" (mất dấu chấm, không biết 16,3 hay 16): bỏ riêng tỉ số nén" },
    { supplierId: "huipu-power", n: 102, model: "PTAA1340G3", line: "| HP-K620 | 560 | 620 | PTAA1340G3 | 12 | 128*14 | 21.9 | 52.14 | 23 | 36 | 3700*1400*2080 | 4110", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[huipu-power n102] nguồn ghi đường kính × hành trình \"128*14\" (gõ sai, ngoài 50–400 mm): bỏ riêng bore" },
    { supplierId: "huipu-power", n: 102, model: "QTA4320G7", line: "| HP-K2200 | 2000 | 2200 | QTA4320G7 | 16 | 170*19 | 70.8 | 503.02 | 40 | 240 | 7000*2620*3390 | 17402", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[huipu-power n102] nguồn ghi đường kính × hành trình \"170*19\" (gõ sai, ngoài 50–400 mm): bỏ riêng bore" },
    { supplierId: "jlmech-wuhan", n: 104, model: "YC6C1320-D31", line: "| JL-880GF | 880 | 1100 | 1584 | YC6C1320-D31 | 6 | 200210 | 39.58 | 180 | 220 | 5200*2150*2600 | 8500", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[jlmech-wuhan n104] nguồn ghi đường kính × hành trình \"200210\" (gõ sai, ngoài 50–400 mm): bỏ riêng bore" },
    { supplierId: "acepow-fuan", n: 149, genset: "APX-50", line: "| PACKING SIZE(mm/Open type) | 1650x700x1100 | 190x800x1170 | 1950x860x1330 | 1950x860x1330", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[acepow-fuan n149] nguồn ghi kích thước \"190x800x1170\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "acepow-fuan", n: 149, genset: "APX-85", line: "| Fuel consumption(L/h) | 4 | 11 | 7 | ≤7", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[acepow-fuan n149] nguồn ghi tiêu hao \"≤7\" L/h không hợp công suất của dòng: bỏ riêng tiêu hao" },
    { supplierId: "aoke-yangzhou", n: 127, genset: "AOKE-V330", line: "| AOKE-V330 | 300KW | 330KW | 沃尔沃 | TAD1343GE | 6 | 12.78 | 36 | 198 | 3130*115*1850 | 3000 | | 详细参数", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[aoke-yangzhou n127] nguồn ghi kích thước \"3130*115*1850\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "aosif", n: 115, genset: "AD697", line: "| AD697 | 632/506 | 697/558 | DP158CCS | 734 | 8V | 15.1 |", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[aosif n115] nguồn ghi tiêu hao \"734\" L/h không hợp công suất của dòng: bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 117, genset: "BDA-C300", line: "| BDA-C300 | 300/375 | 东风康明斯 | 6ZTAA13-G3 | 6 | 13 | 40 | ≤205 | 3000*1150*170 | 3200", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n117] nguồn ghi kích thước \"3000*1150*170\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "bdadl-shanghai", n: 117, genset: "BDA-C310", line: "| BDA-C310 | 310/387.5 | 重庆康明斯 | NTA855-G4 | 6 | 14 | 39 | ≤206 | 3100*1050*185 | 2900", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n117] nguồn ghi kích thước \"3100*1050*185\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "bdadl-shanghai", n: 105, genset: "BDA-LZ1300", line: "| BDA-LZ1300 | 1200/1300 | 上海菱重 | S16R-PTA-C | 16 | 65.4 | 204 | ≤310 | 5382×2486×2931 | 11000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n105] cột \"燃油消耗 (g/kw.h)\" ghi \"≤310\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 129, genset: "BDA-LZ1300", line: "| BDA-LZ1300 | 1200/1300 | 上海菱重 | S16R-PTA-C | 16 | 65.4 | 204 | ≤310 | 5382×2486×2931 | 11000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n129, chép nguyên văn dòng của n105] cột \"燃油消耗 (g/kw.h)\" ghi \"≤310\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 104, genset: "BDA-LZ1600", line: "| BDA-LZ1600 | 1500/1600 | 上海菱重 | S16R-PTA2-C | 16 | 65.4 | 204 | ≤418 | 5382×2486×2931 | 12000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n104] cột \"燃油消耗 (g/kw.h)\" ghi \"≤418\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 129, genset: "BDA-LZ1600", line: "| BDA-LZ1600 | 1500/1600 | 上海菱重 | S16R-PTA2-C | 16 | 65.4 | 204 | ≤418 | 5382×2486×2931 | 12000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n129, chép nguyên văn dòng của n104] cột \"燃油消耗 (g/kw.h)\" ghi \"≤418\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 104, genset: "BDA-LZ1750", line: "| BDA-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n104] cột \"燃油消耗 (g/kw.h)\" ghi \"≤432\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 129, genset: "BDA-LZ1750", line: "| BDA-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 14400", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n129, dòng khác cùng model, cùng ô sai như n104] cột \"燃油消耗 (g/kw.h)\" ghi \"≤432\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 112, genset: "BDA-LZ550", line: "| BDA-LZ550 | 500/550 | 上海菱重 | S6R2-PTA-C | 6 | 30 | 50 | ≤139 | 3576×1614×2226 | 5100", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n112] cột \"燃油消耗 (g/kw.h)\" ghi \"≤139\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 129, genset: "BDA-LZ550", line: "| BDA-LZ550 | 500/550 | 上海菱重 | S6R2-PTA-C | 6 | 30 | 50 | ≤139 | 3576×1614×2226 | 5100", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n129, chép nguyên văn dòng của n112] cột \"燃油消耗 (g/kw.h)\" ghi \"≤139\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 119, genset: "BDA-M240", line: "| BDA-M240 | 220/240 | 奔驰MTU | 6R1600G70F | 6 | 8.2 | 28 | ≤120 | 2500*890*1350 | 2400", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n119] cột \"燃油消耗 (g/kw.h)\" ghi \"≤120\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 135, genset: "BDA-M240", line: "| BDA-M240 | 220/240 | 奔驰MTU | 6R1600G70F | 6 | 8.2 | 28 | ≤120 | 2500*890*1350 | 2400", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n135, chép nguyên văn dòng của n119] cột \"燃油消耗 (g/kw.h)\" ghi \"≤120\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 118, genset: "BDA-M275", line: "| BDA-M275 | 250/275 | 奔驰MTU | 6R1600G80F | 6 | 8.2 | 39 | ≤125 | 2500*890*1350 | 2450", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n118] cột \"燃油消耗 (g/kw.h)\" ghi \"≤125\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 135, genset: "BDA-M275", line: "| BDA-M275 | 250/275 | 奔驰MTU | 6R1600G80F | 6 | 8.2 | 39 | ≤125 | 2500*890*1350 | 2450", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n135, chép nguyên văn dòng của n118] cột \"燃油消耗 (g/kw.h)\" ghi \"≤125\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 117, genset: "BDA-M320", line: "| BDA-M320 | 300/330 | 奔驰MTU | 8V1600G70F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2500", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n117] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 135, genset: "BDA-M320", line: "| BDA-M320 | 300/330 | 奔驰MTU | 8V1600G70F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2500", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n135, chép nguyên văn dòng của n117] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 116, genset: "BDA-M360", line: "| BDA-M360 | 320/360 | 奔驰MTU | 8V1600G80F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2550", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n116] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 135, genset: "BDA-M360", line: "| BDA-M360 | 320/360 | 奔驰MTU | 8V1600G80F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2550", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n135, chép nguyên văn dòng của n116] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "bdadl-shanghai", n: 128, genset: "BDA-W180", line: "| BDA-W180 | 180/200 | 潍柴动力 | WP7D240E310 | 6 | 7.47 | 20 | ≤195 | 2500*100*1500 | 1800", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[bdadl-shanghai n128] nguồn ghi kích thước \"2500*100*1500\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "changchai", n: 2001, genset: "CC15GS", line: "| 尺寸、重量 | 机组(长X宽X高mm带万向轮) | 1400X660X8401450X660X840 | 1450X660X840 | 1450X660X900 | 1450X660X900", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[changchai n2001] nguồn ghi ô kích thước không đủ / thừa số (\"1400X660X8401450X660X840\"): bỏ riêng kích thước" },
    { supplierId: "depco-power", n: 2050, genset: "DPK-DTY-70", line: "DPK-DTY-70", act: "nopower", khoa: "Khoa 24/11/2026", why: "[depco-power n2050] nguồn ghi Standby 55kW/69kVA dưới Prime 50kW/70kVA: để trống công suất" },
    { supplierId: "depco-power", n: 2013, genset: "DPK-DYM-44", line: "DPK-DYM-44", act: "nopower", khoa: "Khoa 24/11/2026", why: "[depco-power n2013] nguồn ghi Standby \"35kW/344kVA\" (kVA gõ sai): để trống công suất" },
    { supplierId: "fukangsi-yangzhou", n: 2011, genset: "FKS-KP650M", line: "| FKS-KP650M | 580 | 650 | 凯普 | KPV660 | 1044 | 650 | 4.4*1.69*2.15 | 4500", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2011] cột \"油耗（L/H）\" của nguồn ghi \"650\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2011, genset: "FKS-KP720M", line: "| FKS-KP720M | 648 | 720 | 凯普 | KPV780 | 1166 | 720 | 4.4*1.69*2.15 | 4500", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2011] cột \"油耗（L/H）\" của nguồn ghi \"720\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2011, genset: "FKS-KP850M", line: "| FKS-KP850M | 750 | 850 | 凯普 | KPV970 | 1350 | 850 | 4.7*1.7*2.2 | 5200", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2011] cột \"油耗（L/H）\" của nguồn ghi \"850\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2009, genset: "FKS-LZ1300", line: "| FKS-LZ1300 | 1200/1300 | 上海菱重 | S16R-PTA-C | 16 | 65.4 | 204 | ≤310 | 5382×2486×2931 | 11000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2009] cột \"燃油消耗 (g/kw.h)\" ghi \"≤310\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2009, genset: "FKS-LZ1600", line: "| FKS-LZ1600 | 1500/1600 | 上海菱重 | S16R-PTA2-C | 16 | 65.4 | 204 | ≤418 | 5382×2486×2931 | 12000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2009] cột \"燃油消耗 (g/kw.h)\" ghi \"≤418\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2009, genset: "FKS-LZ1750", line: "| FKS-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2009] cột \"燃油消耗 (g/kw.h)\" ghi \"≤432\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2009, genset: "FKS-LZ550", line: "| FKS-LZ550 | 500/550 | 上海菱重 | S6R2-PTA-C | 6 | 30 | 50 | ≤139 | 3576×1614×2226 | 5100", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2009] cột \"燃油消耗 (g/kw.h)\" ghi \"≤139\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2007, genset: "FKS-M240", line: "| FKS-M240 | 220/240 | 奔驰MTU | 6R1600G70F | 6 | 8.2 | 28 | ≤120 | 2500*890*1350 | 2400", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2007] cột \"燃油消耗 (g/kw.h)\" ghi \"≤120\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2007, genset: "FKS-M275", line: "| FKS-M275 | 250/275 | 奔驰MTU | 6R1600G80F | 6 | 8.2 | 39 | ≤125 | 2500*890*1350 | 2450", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2007] cột \"燃油消耗 (g/kw.h)\" ghi \"≤125\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2007, genset: "FKS-M320", line: "| FKS-M320 | 300/330 | 奔驰MTU | 8V1600G70F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2500", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2007] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "fukangsi-yangzhou", n: 2007, genset: "FKS-M360", line: "| FKS-M360 | 320/360 | 奔驰MTU | 8V1600G80F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2550", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2007] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "huipu-power", n: 102, genset: "HP-K1000", line: "| HP-K1000 | 900 | 1000 | QTA2160G5 | 8 | 170*195 | 35.4 | 22337 | 70 | 160 | 4900*1920*2350 | 8257", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[huipu-power n102] nguồn ghi tiêu hao \"22337\" ở cột tiêu hao (gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 110, genset: "J20C100M", line: "| J20C100M | 90 | 100 | 东风康明斯 | 6BT5.9-G2 | 162 | 100 | 202*0.86*1.46 | 1260 | 详细", act: "dropspec", keys: ["dims","fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n110] nguồn ghi kích thước \"202*0.86*1.46\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước; cột \"油耗（L/H）\" của nguồn ghi \"100\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 121, genset: "J20C100M", line: "| J20C100M | 90 | 100 | 东风康明斯 | 6BT5.9-G2 | 162 | 100 | 202*0.86*1.46 | 1260 | 详细", act: "dropspec", keys: ["dims","fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n121, chép nguyên văn dòng của n110] nguồn ghi kích thước \"202*0.86*1.46\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước; cột \"油耗（L/H）\" của nguồn ghi \"100\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 110, genset: "J20C420M", line: "| J20C420M | 380 | 420 | 东风康明斯 | QSZ13-G5 | 684 | 420 | 3.4*1.25*1.97 | 3850 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n110] cột \"油耗（L/H）\" của nguồn ghi \"420\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 110, genset: "J20C88M", line: "| J20C88M | 80 | 88 | 东风康明斯 | QSB5.9-G2 | 144 | 88 | 2.2*0.86*1.46 | 1260 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n110] cột \"油耗（L/H）\" của nguồn ghi \"88\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 121, genset: "J20C88M", line: "| J20C88M | 80 | 88 | 东风康明斯 | QSB5.9-G2 | 144 | 88 | 2.2*0.86*1.46 | 1260 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n121, chép nguyên văn dòng của n110] cột \"油耗（L/H）\" của nguồn ghi \"88\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 102, genset: "J20H455M", line: "| J20H455M | 415 | 455 | 华柴道依茨 | BF8M1015CP-LAG3 | 747 | 455 | 3.5*1.5*2.25 | 3600 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n102] cột \"油耗（L/H）\" của nguồn ghi \"455\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 103, genset: "J20KP650M", line: "| J20KP650M | 580 | 650 | 凯普 | KPV660 | 1044 | 650 | 4.4*1.69*2.15 | 4500 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n103] cột \"油耗（L/H）\" của nguồn ghi \"650\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 103, genset: "J20KP720M", line: "| J20KP720M | 648 | 720 | 凯普 | KPV780 | 1166 | 720 | 4.4*1.69*2.15 | 4500 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n103] cột \"油耗（L/H）\" của nguồn ghi \"720\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 103, genset: "J20KP850M", line: "| J20KP850M | 750 | 850 | 凯普 | KPV970 | 1350 | 850 | 4.7*1.7*2.2 | 5200 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n103] cột \"油耗（L/H）\" của nguồn ghi \"850\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 105, genset: "J20P160M", line: "| J20P160M | 145 | 160 | 帕金斯 | 1106A-70TAG3 | 261 | 31 | 2.5*1*12*1.47 | 1602 | 详细", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n105] nguồn ghi ô kích thước không đủ / thừa số (\"2.5*1*12*1.47\"): bỏ riêng kích thước" },
    { supplierId: "jiangchai-xuzhou", n: 106, genset: "J20V175M", line: "| J20V175M | 160 | 175 | 沃尔沃 | TAD753GE | 288 | 175 | 2.6*1.046*1.5 | 1789 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n106] cột \"油耗（L/H）\" của nguồn ghi \"175\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 106, genset: "J20V440M", line: "| J20V440M | 400 | 440 | 沃尔沃 | TAD1651GE | 720 | 8 | 3.3*1.16*2 | 3330 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n106] cột \"油耗（L/H）\" của nguồn ghi \"8\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jiangchai-xuzhou", n: 109, genset: "J20Y90M", line: "| J20Y90M | 85 | 90 | 广西玉柴 | YCD4Y33H6-135 | 153 | 90 | 2.2*0.84*1.38 | 1150 | 详细", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[jiangchai-xuzhou n109] cột \"油耗（L/H）\" của nguồn ghi \"90\" (chép số kW dự phòng / gõ sai): bỏ riêng tiêu hao" },
    { supplierId: "jlmech-wuhan", n: 104, genset: "JL-320GF", line: "| JL-320GF | 320 | 400 | 576 | YC6MJ48DL-D20 | 6 | 131*145 | 11.73 | 28 | 215 | 200*1200*1750 | 3100", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[jlmech-wuhan n104] nguồn ghi kích thước \"200*1200*1750\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "longkai-power", n: 1085, genset: "LG288C", line: "| 100% load(Prime power) | L/h | 18.3", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1085] nguồn ghi tiêu hao \"18.3\" L/h cho tổ máy LG288C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1085, genset: "LG288C", line: "| 50% load(Prime power) | L/h | 9.1", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1085] nguồn ghi tiêu hao \"9.1\" L/h cho tổ máy LG288C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1055, genset: "LG288C", line: "| 50% load(Prime power) | L/h | 9.1", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1055, chép nguyên văn dòng của n1085] nguồn ghi tiêu hao \"9.1\" L/h cho tổ máy LG288C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1056, genset: "LG288C", line: "| 50% load(Prime power) | L/h | 9.1", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1056, chép nguyên văn dòng của n1085] nguồn ghi tiêu hao \"9.1\" L/h cho tổ máy LG288C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1085, genset: "LG288C", line: "| 75% load(Prime power) | L/h | 13.8", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1085] nguồn ghi tiêu hao \"13.8\" L/h cho tổ máy LG288C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1104, genset: "LG520C", line: "| 100% load(Prime power) | L/h | 38.4", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1104] nguồn ghi tiêu hao \"38.4\" L/h cho tổ máy LG520C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1104, genset: "LG520C", line: "| 50% load(Prime power) | L/h | 20.8", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1104] nguồn ghi tiêu hao \"20.8\" L/h cho tổ máy LG520C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1104, genset: "LG520C", line: "| 75% load(Prime power) | L/h | 29.2", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1104] nguồn ghi tiêu hao \"29.2\" L/h cho tổ máy LG520C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1107, genset: "LG600C", line: "| Displacement | Liquid | 37.8", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1107] nguồn ghi tiêu hao \"37\" L/h cho tổ máy LG600C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1107, genset: "LG600C", line: "| 50% load(Prime power) | L/h | 19.3", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1107] nguồn ghi tiêu hao \"19.3\" L/h cho tổ máy LG600C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "longkai-power", n: 1107, genset: "LG600C", line: "| 75% load(Prime power) | L/h | 27.5", act: "dropspec", keys: ["fuel","fuel75","fuel50"], khoa: "Khoa 24/11/2026", why: "[longkai-power n1107] nguồn ghi tiêu hao \"27.5\" L/h cho tổ máy LG600C (≈ 0,06 L/kWh, không hợp công suất): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 116, genset: "PPDL-C300", line: "| PPDL-C300 | 300/375 | 东风康明斯 | 6ZTAA13-G3 | 6 | 13 | 40 | ≤205 | 3000*1150*170 | 3200", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n116] nguồn ghi kích thước \"3000*1150*170\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "pengpai-yangzhou", n: 116, genset: "PPDL-C310", line: "| PPDL-C310 | 310/387.5 | 重庆康明斯 | NTA855-G4 | 6 | 14 | 39 | ≤206 | 3100*1050*185 | 2900", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n116] nguồn ghi kích thước \"3100*1050*185\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "pengpai-yangzhou", n: 104, genset: "PPDL-LZ1300", line: "| PPDL-LZ1300 | 1200/1300 | 上海菱重 | S16R-PTA-C | 16 | 65.4 | 204 | ≤310 | 5382×2486×2931 | 11000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n104] cột \"燃油消耗 (g/kw.h)\" ghi \"≤310\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 131, genset: "PPDL-LZ1300", line: "| PPDL-LZ1300 | 1200/1300 | 上海菱重 | S16R-PTA-C | 16 | 65.4 | 204 | ≤310 | 5382×2486×2931 | 11000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n131, chép nguyên văn dòng của n104] cột \"燃油消耗 (g/kw.h)\" ghi \"≤310\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 103, genset: "PPDL-LZ1600", line: "| PPDL-LZ1600 | 1500/1600 | 上海菱重 | S16R-PTA2-C | 16 | 65.4 | 204 | ≤418 | 5382×2486×2931 | 12000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n103] cột \"燃油消耗 (g/kw.h)\" ghi \"≤418\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 131, genset: "PPDL-LZ1600", line: "| PPDL-LZ1600 | 1500/1600 | 上海菱重 | S16R-PTA2-C | 16 | 65.4 | 204 | ≤418 | 5382×2486×2931 | 12000", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n131, chép nguyên văn dòng của n103] cột \"燃油消耗 (g/kw.h)\" ghi \"≤418\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 103, genset: "PPDL-LZ1750", line: "| PPDL-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n103] cột \"燃油消耗 (g/kw.h)\" ghi \"≤432\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 131, genset: "PPDL-LZ1750", line: "| PPDL-LZ1750 | 1600/1750 | 上海菱重 | S16R-PTAA2-C | 16 | 65.4 | 213 | ≤432 | 5875×2392×3453 | 1440", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n131, chép nguyên văn dòng của n103] cột \"燃油消耗 (g/kw.h)\" ghi \"≤432\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 111, genset: "PPDL-LZ550", line: "| PPDL-LZ550 | 500/550 | 上海菱重 | S6R2-PTA-C | 6 | 30 | 50 | ≤139 | 3576×1614×2226 | 5100", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n111] cột \"燃油消耗 (g/kw.h)\" ghi \"≤139\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 131, genset: "PPDL-LZ550", line: "| PPDL-LZ550 | 500/550 | 上海菱重 | S6R2-PTA-C | 6 | 30 | 50 | ≤139 | 3576×1614×2226 | 5100", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n131, chép nguyên văn dòng của n111] cột \"燃油消耗 (g/kw.h)\" ghi \"≤139\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 118, genset: "PPDL-M240", line: "| PPDL-M240 | 220/240 | 奔驰MTU | 6R1600G70F | 6 | 8.2 | 28 | ≤120 | 2500*890*1350 | 2400", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n118] cột \"燃油消耗 (g/kw.h)\" ghi \"≤120\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 127, genset: "PPDL-M240", line: "| PPDL-M240 | 220/240 | 奔驰MTU | 6R1600G70F | 6 | 8.2 | 28 | ≤120 | 2500*890*1350 | 2400", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n127, chép nguyên văn dòng của n118] cột \"燃油消耗 (g/kw.h)\" ghi \"≤120\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 117, genset: "PPDL-M275", line: "| PPDL-M275 | 250/275 | 奔驰MTU | 6R1600G80F | 6 | 8.2 | 39 | ≤125 | 2500*890*1350 | 2450", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n117] cột \"燃油消耗 (g/kw.h)\" ghi \"≤125\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 127, genset: "PPDL-M275", line: "| PPDL-M275 | 250/275 | 奔驰MTU | 6R1600G80F | 6 | 8.2 | 39 | ≤125 | 2500*890*1350 | 2450", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n127, chép nguyên văn dòng của n117] cột \"燃油消耗 (g/kw.h)\" ghi \"≤125\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 116, genset: "PPDL-M320", line: "| PPDL-M320 | 300/330 | 奔驰MTU | 8V1600G70F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2500", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n116] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 127, genset: "PPDL-M320", line: "| PPDL-M320 | 300/330 | 奔驰MTU | 8V1600G70F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2500", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n127, chép nguyên văn dòng của n116] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 115, genset: "PPDL-M360", line: "| PPDL-M360 | 320/360 | 奔驰MTU | 8V1600G80F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2550", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n115] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "pengpai-yangzhou", n: 127, genset: "PPDL-M360", line: "| PPDL-M360 | 320/360 | 奔驰MTU | 8V1600G80F | 8 | 11.6 | 39 | ≤130 | 2600*900*1500 | 2550", act: "dropspec", keys: ["fuel"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n127, chép nguyên văn dòng của n115] cột \"燃油消耗 (g/kw.h)\" ghi \"≤130\" (ngoài 150–300 g/kWh, bảng mẫu chép chung của bdadl / fukangsi / pengpai): bỏ riêng tiêu hao" },
    { supplierId: "penlucky", n: 102, genset: "PLC700V-60", line: "| PLC700V-60 | 750 | 682 | VTA28-G5 | HCI544E1 | 4000*1750*250 | ISO 20′ ft GP | view", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[penlucky n102] nguồn ghi kích thước \"4000*1750*250\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "xinzhengfa", n: 109, genset: "CCFJ50-S", line: "| CCFJ50-S | X6110CF | 50 | 1989 × 650 × 100 | 1110", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[xinzhengfa n109] nguồn ghi kích thước \"1989 × 650 × 100\" (một chiều mất chữ số / gõ sai): bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "104GF", line: "| 104GF | 104 | 130 | 113 | 141 | 187 | 203 | 1700 | 2580×1100×1666", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"2580×1100×1666\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "121GF", line: "| 121GF | 121 | 151 | 132 | 165 | 218 | 238 | 1800 | 2580×1100×1666", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"2580×1100×1666\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "123GF", line: "| 123GF | 123 | 154 | 134 | 168 | 221 | 241 | 1700 | 2580×1100×1666", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"2580×1100×1666\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "145GF", line: "| 145GF | 145 | 181 | 158 | 198 | 261 | 284 | 1860 | 2580×1100×1666", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"2580×1100×1666\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "146GF", line: "| 146GF | 146 | 183 | 159 | 199 | 263 | 286 | 1800 | 2580×1100×1666", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"2580×1100×1666\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "163GF", line: "| 163GF | 163 | 204 | 175 | 219 | 293 | 315 | 1900 | 2580×1100×1664", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"2580×1100×1664\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "164GF", line: "| 164GF | 164 | 205 | 176 | 220 | 295 | 317 | 1860 | 2580×1100×1666", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"2580×1100×1666\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "204GF", line: "| 204GF | 204 | 255 | 219 | 274 | 367 | 394 | 1950 | 2580×1100×1664", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"2580×1100×1664\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "255GF", line: "| 255GF | 255 | 319 | 272 | 340 | 459 | 490 | 2300 | 3000×1200×1675", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3000×1200×1675\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "259GF", line: "| 259GF | 259 | 324 | 279 | 349 | 466 | 502 | 3200 | 3000×1200×1675", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3000×1200×1675\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "282GF", line: "| 282GF | 282 | 353 | 303 | 379 | 508 | 545 | 3200 | 3000×1200×1675", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3000×1200×1675\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "292GF", line: "| 292GF | 292 | 365 | 314 | 393 | 526 | 565 | 3400 | 3000×1200×1675", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3000×1200×1675\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "302GF", line: "| 302GF | 302 | 378 | 325 | 406 | 544 | 585 | 3400 | 3000×1200×1675", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3000×1200×1675\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "305GF", line: "| 305GF | 305 | 381 | 328 | 410 | 549 | 590 | 3500 | 3000×1200×1675", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3000×1200×1675\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "328GF", line: "| 328GF | 328 | 410 | 334 | 418 | 590 | 601 | 3730 | 3000×1200×1675", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3000×1200×1675\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "329GF", line: "| 329GF | 329 | 411 | 354 | 443 | 592 | 637 | 3500 | 3000×1200×1675", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3000×1200×1675\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 108, genset: "350GF", line: "| 350GF | 350 | 437.5 | 380 | 475 | 630 | 684 | 3300 | 3.3*1.44*2*2.16 | BF8M1015C-LAG1A", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n108] nguồn ghi ô kích thước không đủ / thừa số (\"3.3*1.44*2*2.16\"): bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 108, genset: "360GF", line: "| 360GF | 360 | 450 | 420 | 525 | 648 | 756 | 3300 | 3.3*1.44*2*2.16 | BF8M1015C-LAG2", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n108] nguồn ghi ô kích thước không đủ / thừa số (\"3.3*1.44*2*2.16\"): bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "365GF", line: "| 365GF | 365 | 456 | 388 | 485 | 657 | 698 | 3730 | 3000×1200×1675", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3000×1200×1675\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "370GF", line: "| 370GF | 370 | 463 | 393 | 491 | 666 | 707 | 3850 | 3325×1400×1940", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3325×1400×1940\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 108, genset: "380GF", line: "| 380GF | 380 | 475 | 420 | 525 | 684 | 756 | 3300 | 3.3*1.44*2*2.16 | BF8M1015CP-LAG1A", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n108] nguồn ghi ô kích thước không đủ / thừa số (\"3.3*1.44*2*2.16\"): bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 108, genset: "400GF", line: "| 400GF | 400 | 500 | 440 | 550 | 720 | 792 | 3300 | 3.3*1.44*2*2.16 | BF8M1015CP-LAG2", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n108] nguồn ghi ô kích thước không đủ / thừa số (\"3.3*1.44*2*2.16\"): bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "404GF", line: "| 404GF | 404 | 505 | 430 | 538 | 727 | 774 | 3850 | 3325×1400×1940", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3325×1400×1940\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "404GF", line: "| 404GF | 404 | 505 | 430 | 538 | 727 | 774 | 4180 | 3325×1400×1940", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107, dòng khác cùng model, cùng ô sai như n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3325×1400×1940\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 108, genset: "410GF", line: "| 410GF | 410 | 512.5 | 450 | 562.5 | 738 | 810 | 3300 | 3.3*1.44*2*2.16 | BF8M1015CP-LAG3", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n108] nguồn ghi ô kích thước không đủ / thừa số (\"3.3*1.44*2*2.16\"): bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 108, genset: "430GF", line: "| 430GF | 430 | 537.5 | 470 | 587.5 | 774 | 846 | 3630 | 3.3*1.44*2*2.16 | BF8M1015CP-LAG4", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n108] nguồn ghi ô kích thước không đủ / thừa số (\"3.3*1.44*2*2.16\"): bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 108, genset: "450GF", line: "| 450GF | 450 | 562.5 | 480 | 600 | 810 | 864 | 3630 | 3.3*1.44*2*2.16 | BF8M1015CP-LAG5", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n108] nguồn ghi ô kích thước không đủ / thừa số (\"3.3*1.44*2*2.16\"): bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "473GF", line: "| 473GF | 473 | 591 | 503 | 538 | 851 | 774 | 4180 | 3325×1400×1940", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3325×1400×1940\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "480GF", line: "| 480GF | 480 | 600 | 505 | 631 | 864 | 909 | 4280 | 3325×1400×1940", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3325×1400×1940\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "504GF", line: "| 504GF | 504 | 630 | 536 | 629 | 907 | 905 | 4280 | 3325×1400×1940", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3325×1400×1940\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "520GF", line: "| 520GF | 520 | 650 | 547 | 684 | 936 | 985 | 4300 | 3325×1400×1940", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3325×1400×1940\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "yingtai-jiangsu", n: 107, genset: "560GF", line: "| 560GF | 560 | 700 | 595 | 744 | 1008 | 1071 | 4380 | 3425×1400×1940", act: "dropspec", keys: ["dims"], khoa: "Khoa 24/11/2026", why: "[yingtai-jiangsu n107] nguồn ghi đơn vị \"L*W*H(m)\" cho số mm (\"3425×1400×1940\"): đơn vị ở tiêu đề sai, số không có đơn vị đúng trong nguồn; bỏ riêng kích thước" },
    { supplierId: "googol", n: 117, genset: "PTAA10V-EG620C", line: "| PTAA10V-EG620C | 625 | 568 | 550/688 | 500/625 | V10 | 20.3 | 1480 | 132", act: "unsurespec", keys: ["weight"], from: "1480", khoa: "Khoa 24/11/2026", why: "[googol n117] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 117, genset: "PTAA10V-EG690C", line: "| PTAA10V-EG690C | 690 | 625 | 620/775 | 560/700 | V10 | 20.3 | 1480 | 150", act: "unsurespec", keys: ["weight"], from: "1480", khoa: "Khoa 24/11/2026", why: "[googol n117] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 116, genset: "PTAA12V-EG750C", line: "| PTAA12V-EG750C | 750 | 680 | 660/825 | 600/750 | V12 | 24.4 | 1650 | 164", act: "unsurespec", keys: ["weight"], from: "1650", khoa: "Khoa 24/11/2026", why: "[googol n116] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 116, genset: "PTAA12V-EG815C", line: "| PTAA12V-EG815C | 815 | 720 | 704/880 | 640/800 | V12 | 24.4 | 1650 | 175", act: "unsurespec", keys: ["weight"], from: "1650", khoa: "Khoa 24/11/2026", why: "[googol n116] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 107, genset: "PTAA20V-EG1120C", line: "| PTAA20V-EG1120C | 1120 | 1020 | 1000/1250 | 900/1125 | V20 | 40.7 | 2450 | 238", act: "unsurespec", keys: ["weight"], from: "2450", khoa: "Khoa 24/11/2026", why: "[googol n107] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 107, genset: "PTAA20V-EG1225C", line: "| PTAA20V-EG1225C | 1225 | 1115 | 1100/1375 | 1000/1250 | V20 | 40.7 | 2450 | 264", act: "unsurespec", keys: ["weight"], from: "2450", khoa: "Khoa 24/11/2026", why: "[googol n107] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 111, genset: "QTA16V-EG2660C", line: "| QTA16V-EG2660C | 2660 | 2440 | 2420/3025 | 2200/2750 | V16 | 86.00 | 6400 | 540", act: "unsurespec", keys: ["weight"], from: "6400", khoa: "Khoa 24/11/2026", why: "[googol n111] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 109, genset: "QTA20V-EG3100D", line: "| QTA20V-EG3100D | 3100 | 2810 | 2750/3438 | 2500/3125 | V20 | 107.5 | 7800 | 630", act: "unsurespec", keys: ["weight"], from: "7800", khoa: "Khoa 24/11/2026", why: "[googol n109] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 109, genset: "QTA20V-EG3200D", line: "| QTA20V-EG3200D | 3200 | 2900 | 2860/3575 | 2600/3250 | V20 | 107.5 | 7800 | 655", act: "unsurespec", keys: ["weight"], from: "7800", khoa: "Khoa 24/11/2026", why: "[googol n109] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 109, genset: "QTA20V-EG3330D", line: "| QTA20V-EG3330D | 3330 | 3010 | 3000/3750 | 2700/3375 | V20 | 107.5 | 7800 | 678", act: "unsurespec", keys: ["weight"], from: "7800", khoa: "Khoa 24/11/2026", why: "[googol n109] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    { supplierId: "googol", n: 109, genset: "QTA20V-EG3600C", line: "| QTA20V-EG3600C | 3600 | 3300 | 3300/4125 | 3000/3750 | V20 | 107.5 | 7800 | 758", act: "unsurespec", keys: ["weight"], from: "7800", khoa: "Khoa 24/11/2026", why: "[googol n109] cột \"Weight (kg)\" của bảng không nói là khối lượng động cơ hay tổ máy (bảng có cả công suất động cơ lẫn tổ máy): giữ hiện, đánh dấu cần xác nhận, không dùng để chấm / lọc" },
    // bo-o-lech-126 (Khoa 24/11/2026 duyệt "bỏ ô lệch, không sửa thành số khác"): 105 ca LOẠI 2 (đã có giá trị đúng từ tờ hãng hoặc ≥ 3 NCC)
    // + 21 ca nhóm L3-1 của loại 3 (nhận căn cứ 2 NCC), tổng 126 dòng, trừ 4 ca động cơ 6LTAA9.5-G1 (để nguyên, chờ tab "Giá trị nghi sai").
    // Mỗi mục: dòng hình học tự mâu thuẫn của nguồn (spec-value-check "hinh-hoc"), `dropspec` bỏ riêng ô lệch (xi lanh / đường kính × hành trình /
    // dung tích) của bản ghi động cơ, giữ dòng; báo cáo `dieu-phoi\nghiem-thu\gia-tri-nghi-sai-gom-nhom.md`; test `suppliers/bo-o-lech-126.test.mjs`.
    { supplierId: "depco-power", n: 2616, model: "1103A-33G", line: "| Governor | Mechanical | Displacement(L) | 2.216", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[depco-power n2616] nguồn tự mâu thuẫn hình học: 3 xi lanh × 105 × 127 = 3.299 L, ghi 2.216 L; ô lệch disp 2.216→3.3; giá trị đúng theo disp=3.3 [24 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2636, model: "4006-23TAG3A", line: "| Cylinder | 8L | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2636] nguồn tự mâu thuẫn hình học: 8 xi lanh × 160 × 190 = 30.561 L, ghi 22.92 L; ô lệch cyl 8→6; giá trị đúng theo cyl=6 [28 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2635, model: "4008-TAG1A", line: "| Governor | Electrical | Displacement(L) | 22.92", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[depco-power n2635] nguồn tự mâu thuẫn hình học: 8 xi lanh × 160 × 190 = 30.561 L, ghi 22.92 L; ô lệch disp 22.92→30.561; giá trị đúng theo disp=30.561 [17 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2443, model: "4016TAG1A", line: "| Governor | Electrical | Displacement(L) | 45.842", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[depco-power n2443] nguồn tự mâu thuẫn hình học: 16 xi lanh × 160 × 190 = 61.123 L, ghi 45.842 L; ô lệch disp 45.842→61.123; giá trị đúng theo disp=61.123 [21 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2644, model: "403A-15G1", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2644] nguồn tự mâu thuẫn hình học: 4 xi lanh × 84 × 90 = 1.995 L, ghi 1.496 L; ô lệch cyl 4→3; giá trị đúng theo cyl=3 [16 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2643, model: "403A-15G2", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2643] nguồn tự mâu thuẫn hình học: 4 xi lanh × 84 × 90 = 1.995 L, ghi 1.496 L; ô lệch cyl 4→3; giá trị đúng theo cyl=3 [15 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2441, model: "403D-11G", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2441] nguồn tự mâu thuẫn hình học: 4 xi lanh × 77 × 81 = 1.509 L, ghi 1.131 L; ô lệch cyl 4→3; giá trị đúng theo cyl=3 [tờ hãng perkins n2009]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2440, model: "403D-15G", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2440] nguồn tự mâu thuẫn hình học: 4 xi lanh × 84 × 90 = 1.995 L, ghi 1.496 L; ô lệch cyl 4→3; giá trị đúng theo cyl=3 [tờ hãng perkins-wuxi n2002]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2641, model: "403D-15G", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2641] nguồn tự mâu thuẫn hình học: 4 xi lanh × 84 × 90 = 1.995 L, ghi 1.496 L; ô lệch cyl 4→3; giá trị đúng theo cyl=3 [tờ hãng perkins-wuxi n2002]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2077, model: "6M33D572E200", line: "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 127 X 165", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[depco-power n2077] nguồn tự mâu thuẫn hình học: 6 xi lanh × 127 × 165 = 12.541 L, ghi 19.6 L; ô lệch bore 127→150, stroke 165→185; giá trị đúng theo bore=150 [9 NCC]; stroke=185 [9 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2385, model: "6M33G660/6", line: "| Cylinder | 12 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2385] nguồn tự mâu thuẫn hình học: 12 xi lanh × 150 × 185 = 39.231 L, ghi 19.6 L; ô lệch cyl 12→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n133]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2347, model: "BF4M2012", line: "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 98 X 105", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[depco-power n2347] nguồn tự mâu thuẫn hình học: 4 xi lanh × 98 × 105 = 3.168 L, ghi 4.04 L; ô lệch bore 98→101, stroke 105→126; giá trị đúng theo bore=101 [3 NCC]; stroke=126 [3 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2367, model: "BF6M1015C-LA G1A", line: "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 110 X 136", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[depco-power n2367] nguồn tự mâu thuẫn hình học: 6 xi lanh × 110 × 136 = 7.755 L, ghi 11.906 L; ô lệch bore 110→132, stroke 136→145; giá trị đúng theo bore=132 [3 NCC]; stroke=145 [3 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2359, model: "BF8M1015C-LA G2", line: "| Cylinder | 6 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2359] nguồn tự mâu thuẫn hình học: 6 xi lanh × 132 × 145 = 11.906 L, ghi 15.874 L; ô lệch cyl 6→8; giá trị đúng theo cyl=8 [9 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2356, model: "BF8M1015CP-LA G3", line: "| Cylinder | 6 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2356] nguồn tự mâu thuẫn hình học: 6 xi lanh × 132 × 145 = 11.906 L, ghi 15.874 L; ô lệch cyl 6→8; giá trị đúng theo cyl=8 [tờ hãng huachai-deutz n105]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2190, model: "DP086TA", line: "| Governor | Electrical | Displacement(L) | 9.1", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[depco-power n2190] nguồn tự mâu thuẫn hình học: 6 xi lanh × 111 × 139 = 8.071 L, ghi 9.1 L; ô lệch disp 9.1→8.071; giá trị đúng theo disp=8.071 [6 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2217, model: "SC10E380D2", line: "| Governor | Electrical | Displacement(L) | 11.8", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[depco-power n2217] nguồn tự mâu thuẫn hình học: 6 xi lanh × 128 × 135 = 10.423 L, ghi 11.8 L; ô lệch disp 11.8→10.4; giá trị đúng theo disp=10.4 [3 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2023, model: "WP10D238E201", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2023] nguồn tự mâu thuẫn hình học: 4 xi lanh × 126 × 130 = 6.484 L, ghi 9.726 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n113]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2022, model: "WP10D264E201", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2022] nguồn tự mâu thuẫn hình học: 4 xi lanh × 126 × 130 = 6.484 L, ghi 9.726 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n113]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2021, model: "WP10D288E201", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2021] nguồn tự mâu thuẫn hình học: 4 xi lanh × 126 × 130 = 6.484 L, ghi 9.726 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n113]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2019, model: "WP13D385E201", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2019] nguồn tự mâu thuẫn hình học: 4 xi lanh × 127 × 165 = 8.361 L, ghi 12.54 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n112]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2017, model: "WP13D510E311", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2017] nguồn tự mâu thuẫn hình học: 4 xi lanh × 127 × 165 = 8.361 L, ghi 12.54 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n112]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2018, model: "WP13D510E311", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2018] nguồn tự mâu thuẫn hình học: 4 xi lanh × 127 × 165 = 8.361 L, ghi 12.54 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n112]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2027, model: "WP6D132E201", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2027] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 130 = 4.503 L, ghi 6.75 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n114]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2026, model: "WP6D158E201", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2026] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 130 = 4.503 L, ghi 6.75 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n114]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2025, model: "WP6D180E201", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[depco-power n2025] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 130 = 4.503 L, ghi 6.75 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n114]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "haifeng-taizhou", n: 2010, model: "16M33D1580E310", line: "| HF-1400GF | 1750 | 1400 | 16M33D1580E310 | 16V | 180/215 | 65.65 | 185 | 7210*2250*2450 | 11000", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[haifeng-taizhou n2010] nguồn tự mâu thuẫn hình học: 16 xi lanh × 180 × 215 = 87.537 L, ghi 65.65 L; ô lệch bore 180→150, stroke 215→185, disp 65.65→52.3; giá trị đúng theo bore=150 [4 NCC]; stroke=185 [4 NCC]; disp=52.3 [8 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "haifeng-taizhou", n: 2010, model: "16M33D1680E310", line: "| HF-1500GF | 1875 | 1500 | 16M33D1680E310 | 16V | 180/215 | 65.65 | 185 | 7210*2250*2450 | 11000", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[haifeng-taizhou n2010] nguồn tự mâu thuẫn hình học: 16 xi lanh × 180 × 215 = 87.537 L, ghi 65.65 L; ô lệch bore 180→150, stroke 215→185, disp 65.65→52.3; giá trị đúng theo bore=150 [5 NCC]; stroke=185 [5 NCC]; disp=52.3 [10 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "haifeng-taizhou", n: 2010, model: "WP2.3D25E200", line: "| HF-20GF | 25 | 20 | WP2.3D25E200 | 4L | 90/100 | 2.3 | 235 | 1550*630*1100 | 660", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[haifeng-taizhou n2010] nguồn tự mâu thuẫn hình học: 4 xi lanh × 90 × 100 = 2.545 L, ghi 2.3 L; ô lệch bore 90→89, stroke 100→92; giá trị đúng theo bore=89 [8 NCC]; stroke=92 [8 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 125, model: "4HTAA4.3-G36", line: "| HY-120 | 4HTAA4.3-G36 | 125 | 140 | 6 | 105*124 | 4.3 | 192 | 1800*600*1200 | 1100 | T3", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[hanyang-weifang n125] nguồn tự mâu thuẫn hình học: 6 xi lanh × 105 × 124 = 6.442 L, ghi 4.3 L; ô lệch cyl 6→4; giá trị đúng theo cyl=4 [6 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 102, model: "6ZTAA13-G4", line: "| HY-400 | 6ZTAA13-G4 | 400 | 415 | 6 | 114*145 | 13 | 202 | 2900*1200*1750 | 3000 | T2", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[hanyang-weifang n102] nguồn tự mâu thuẫn hình học: 6 xi lanh × 114 × 145 = 8.88 L, ghi 13 L; ô lệch bore 114→130, stroke 145→163; giá trị đúng theo bore=130 [9 NCC]; stroke=163 [9 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 125, model: "SC15G500D2", line: "| HY-300 | SC15G500D2 | 339 | 373 | 6 | 135*150 | 14.2 | 202 | 3100*1250*1750 | 2900 | T2", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[hanyang-weifang n125] nguồn tự mâu thuẫn hình học: 6 xi lanh × 135 × 150 = 12.882 L, ghi 14.2 L; ô lệch stroke 150→165; giá trị đúng theo stroke=165 [16 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 107, model: "YC4A180L-D20", line: "| HY-100 | YC4A180L-D20 | 120 | 132 | 4 | 108*115 | 4.84 | 208 | 2300*900*1500 | 1500 | T2", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[hanyang-weifang n107] nguồn tự mâu thuẫn hình học: 4 xi lanh × 108 × 115 = 4.214 L, ghi 4.84 L; ô lệch stroke 115→132; giá trị đúng theo stroke=132 [4 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 107, model: "YC6A245L-D21", line: "| HY-150 | YC6A245L-D21 | 165 | 181 | 6 | 108*115 | 7.25 | 211 | 2300*900*1500 | 2200 | T2", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[hanyang-weifang n107] nguồn tự mâu thuẫn hình học: 6 xi lanh × 108 × 115 = 6.321 L, ghi 7.25 L; ô lệch stroke 115→132; giá trị đúng theo stroke=132 [9 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 107, model: "YC6B180L-D20", line: "| HY-120 | YC6B180L-D20 | 120 | 132 | 6 | 108*115 | 6.87 | 203 | 2300*900*1500 | 1600 | T2", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[hanyang-weifang n107] nguồn tự mâu thuẫn hình học: 6 xi lanh × 108 × 115 = 6.321 L, ghi 6.87 L; ô lệch stroke 115→125; giá trị đúng theo stroke=125 [9 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 107, model: "YC6B205L-D20", line: "| HY-120 | YC6B205L-D20 | 138 | 152 | 6 | 108*115 | 6.87 | 198 | 2300*900*1500 | 1850 | T2", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[hanyang-weifang n107] nguồn tự mâu thuẫn hình học: 6 xi lanh × 108 × 115 = 6.321 L, ghi 6.87 L; ô lệch stroke 115→125; giá trị đúng theo stroke=125 [9 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "jet-power", n: 135, model: "WP2.3D33E200", line: "| WP-28 | 27.5 | 22 | 25 | 20 | WP2.3D33E200 | 4L | Mechanical | 102×118 | 2.5 | 5 | JET184FS", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[jet-power n135] nguồn tự mâu thuẫn hình học: 4 xi lanh × 102 × 118 = 3.857 L, ghi 2.5 L; ô lệch bore 102→89, stroke 118→92, disp 2.5→2.3; giá trị đúng theo bore=89 [11 NCC]; stroke=92 [11 NCC]; disp=2.3 [9 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "jet-power", n: 135, model: "WP2.3D33E200", line: "| WP-33 | 33 | 26.4 | 30 | 24 | WP2.3D33E200 | 4L | Mechanical | 102×118 | 2.5 | 6 | JET184G", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[jet-power n135] nguồn tự mâu thuẫn hình học: 4 xi lanh × 102 × 118 = 3.857 L, ghi 2.5 L; ô lệch bore 102→89, stroke 118→92, disp 2.5→2.3; giá trị đúng theo bore=89 [11 NCC]; stroke=92 [11 NCC]; disp=2.3 [9 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "jet-power", n: 135, model: "WP2.3D40E200", line: "| WP-41 | 41 | 33 | 37.5 | 30 | WP2.3D40E200 | 4L | Mechanical | 105×125 | 2.5 | 7.5 | JET184H", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[jet-power n135] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 125 = 4.33 L, ghi 2.5 L; ô lệch bore 105→89, stroke 125→92, disp 2.5→2.3; giá trị đúng theo bore=89 [8 NCC]; stroke=92 [8 NCC]; disp=2.3 [8 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "jet-power", n: 135, model: "WP2.3D48E200", line: "| WP-50 | 50 | 40 | 45 | 36 | WP2.3D48E200 | 4L | Mechanical | 105×125 | 2.5 | 8.5 | JET224C", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[jet-power n135] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 125 = 4.33 L, ghi 2.5 L; ô lệch bore 105→89, stroke 125→92, disp 2.5→2.3; giá trị đúng theo bore=89 [10 NCC]; stroke=92 [10 NCC]; disp=2.3 [7 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "kangwo-guangdong", n: 102, model: "SC13G420D2", line: "| GKW-250GF | 250 | 375 | 450 | SC13G420D2 | 6 | 128*153 | 12.88 | 200 | 3000*1300*1800 | 2800 | 获取", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n102] nguồn tự mâu thuẫn hình học: 6 xi lanh × 128 × 153 = 11.813 L, ghi 12.88 L; ô lệch bore 128→135, stroke 153→150; giá trị đúng theo bore=135 [16 NCC]; stroke=150 [16 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "kangwo-guangdong", n: 102, model: "SC13G420D2", line: "| GKW-300GF | 300 | 375 | 540 | SC13G420D2 | 6 | 135*165 | 12.88 | 200 | 3000*1300*1800 | 2800 | 获取", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n102] nguồn tự mâu thuẫn hình học: 6 xi lanh × 128 × 153 = 11.813 L, ghi 12.88 L; ô lệch bore 128→135, stroke 153→150; giá trị đúng theo bore=135 [16 NCC]; stroke=150 [16 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "kangwo-guangdong", n: 102, model: "SC15G500D2", line: "| GKW-320GF | 320 | 400 | 576 | SC15G500D2 | 6 | 135*150 | 14.16 | 200 | 3200*1350*1950 | 3500 | 获取", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n102] nguồn tự mâu thuẫn hình học: 6 xi lanh × 135 × 150 = 12.882 L, ghi 14.16 L; ô lệch stroke 150→165; giá trị đúng theo stroke=165 [16 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "kangwo-guangdong", n: 102, model: "SC15G500D2", line: "| GKW-350GF | 350 | 437.5 | 630 | SC15G500D2 | 6 | 135*150 | 14.16 | 200 | 3200*1350*1950 | 3500 | 获取", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n102] nguồn tự mâu thuẫn hình học: 6 xi lanh × 135 × 150 = 12.882 L, ghi 14.16 L; ô lệch stroke 150→165; giá trị đúng theo stroke=165 [16 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "kangwo-guangdong", n: 102, model: "SC25G690D2", line: "| GKW-450GF | 450 | 562.5 | 810 | SC25G690D2 | 12 | 135*155 | 16.8 | 202 | 3500*1500*1950 | 4500 | 获取", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n102] nguồn tự mâu thuẫn hình học: 12 xi lanh × 135 × 155 = 26.624 L, ghi 16.8 L; ô lệch stroke 155→150, disp 16.8→25.8; giá trị đúng theo stroke=150 [15 NCC]; disp=25.8 [22 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "kangwo-guangdong", n: 102, model: "SC8D280D2", line: "| GKW-180GF | 180 | 225 | 324 | SC8D280D2 | 6 | 114*144 | 8.27 | 200 | 2600*1050*1600 | 2400 | 获取", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n102] nguồn tự mâu thuẫn hình học: 6 xi lanh × 114 × 144 = 8.819 L, ghi 8.27 L; ô lệch stroke 144→135; giá trị đúng theo stroke=135 [14 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "kangwo-guangdong", n: 102, model: "SC9D340D2", line: "| GKW-220GF | 220 | 275 | 396 | SC9D340D2 | 6 | 135*150 | 8.82 | 195 | 3000*1200*1800 | 2600 | 获取", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n102] nguồn tự mâu thuẫn hình học: 6 xi lanh × 135 × 150 = 12.882 L, ghi 8.82 L; ô lệch bore 135→114, stroke 150→144; giá trị đúng theo bore=114 [15 NCC]; stroke=144 [15 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "kangwo-guangdong", n: 103, model: "WP4D100E200", line: "| GKW-90GF | 90 | 112.5 | 162 | WP4D100E200 | 4 | 105*118 | 4.5 | 201 | 2200*800*1340 | 1250 | 获取", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n103] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 118 = 4.087 L, ghi 4.5 L; ô lệch stroke 118→130; giá trị đúng theo stroke=130 [6 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "aosif", n: 1114, model: "P086TI", line: "| No. of cylinder | 4", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[aosif n1114] nguồn tự mâu thuẫn hình học: 4 xi lanh × 111 × 139 = 5.38 L, ghi 8.071 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [tờ hãng hd-hyundai-infracore n2002]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "aosif", n: 1112, model: "P086TI-1", line: "| No. of cylinder | 4", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[aosif n1112] nguồn tự mâu thuẫn hình học: 4 xi lanh × 111 × 139 = 5.38 L, ghi 8.071 L; ô lệch cyl 4→6; giá trị đúng theo cyl=6 [10 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "cldj-fujian", n: 101, model: "SC33W990D2", line: "| CLS-825 | 660/825 | 1188 | CLG-634B | SC33W990D2 | 180*315 | 6 | 75 | 205 | 32.8 | 4100 | 3800*2000*2200", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[cldj-fujian n101] nguồn tự mâu thuẫn hình học: 6 xi lanh × 180 × 315 = 48.095 L, ghi 32.8 L; ô lệch stroke 315→215; giá trị đúng theo stroke=215 [16 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "fukangsi-yangzhou", n: 2002, model: "YC6C1070L-D20", line: "| FKS-Y700 | 700/875 | 广西玉柴股份 | YC6C1070L-D20 | 12 | 39.58 | 180 | 200*210 | 4700*1800*2100 | 7200", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2002] nguồn tự mâu thuẫn hình học: 12 xi lanh × 200 × 210 = 79.168 L, ghi 39.58 L; ô lệch cyl 12→6; giá trị đúng theo cyl=6 [11 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "fukangsi-yangzhou", n: 2002, model: "YC6K600-D30", line: "| FKS-Y350 | 350/437.5 | 广西玉柴股份 | YC6K600-D30 | 6 | 12.94 | 36 | 129*155 | 3100*1300*1900 | 3300", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[fukangsi-yangzhou n2002] nguồn tự mâu thuẫn hình học: 6 xi lanh × 129 × 155 = 12.155 L, ghi 12.94 L; ô lệch stroke 155→165; giá trị đúng theo stroke=165 [3 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "huatai-yangzhou", n: 105, model: "YC6MJ480L-D20", line: "| 300GF | 300 | YC6MJ480L-D20 | 6L | 123/145 | 11.72 | 28 | 2900 | 3050*1200*1850", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[huatai-yangzhou n105] nguồn tự mâu thuẫn hình học: 6 xi lanh × 123 × 145 = 10.338 L, ghi 11.72 L; ô lệch bore 123→131; giá trị đúng theo bore=131 [8 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "huipu-power", n: 103, model: "KTA50-G3", line: "| HP-C1100 | 1000 | 1100 | KTA50-G3 | 12 | 159*159 | 50 | 261 | 424 | 177 | 5105*2120*2260 | 9099", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[huipu-power n103] nguồn tự mâu thuẫn hình học: 12 xi lanh × 159 × 159 = 37.885 L, ghi 50 L; ô lệch cyl 12→16; giá trị đúng theo cyl=16 [32 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "huipu-power", n: 104, model: "WP4D108E200", line: "| HP-W90 | 80 | 90 | WP4D108E200 | 6 | 105*130 | 4.5 | 18.75 | 120 | 12 | 2100*920*1500 | 1195", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[huipu-power n104] nguồn tự mâu thuẫn hình học: 6 xi lanh × 105 × 130 = 6.754 L, ghi 4.5 L; ô lệch cyl 6→4; giá trị đúng theo cyl=4 [9 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "jianghao-genset", n: 101, model: "404D-22TG", line: "| JHP-25GF | 31.25 | 25 | 404D-22TG | 4 | 84*100 | 22 | 10.6 | 233 | 1550*710*1100 | 550", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[jianghao-genset n101] nguồn tự mâu thuẫn hình học: 4 xi lanh × 84 × 100 = 2.217 L, ghi 22 L; ô lệch disp 22→2.216; giá trị đúng theo disp=2.216 [11 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "jianghao-genset", n: 106, model: "DP126LB", line: "| JHD-350GF | 437.5 | 350 | DP126LB | 6L | 128*142 | 14.6 | 33 | 232 | 3100*1050*1650mm | 2700", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[jianghao-genset n106] nguồn tự mâu thuẫn hình học: 6 xi lanh × 128 × 142 = 10.964 L, ghi 14.6 L; ô lệch bore 128→123, stroke 142→155, disp 14.6→11; giá trị đúng theo bore=123 [tờ hãng hd-hyundai-infracore n2005]; stroke=155 [tờ hãng hd-hyundai-infracore n2005]; disp=11 [4 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "jlmech-wuhan", n: 101, model: "WP4D100E200", line: "| JL-90GF | 90 | 112.5 | 162 | WP4D100E200 | 4 | 105*118 | 4.5 | 13 | 201", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[jlmech-wuhan n101] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 118 = 4.087 L, ghi 4.5 L; ô lệch stroke 118→130; giá trị đúng theo stroke=130 [6 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "kanpor-fuan", n: 102, model: "6LTAA8.9-G3", line: "| 缸径*行程 | mm*mm | 114×135 | 114×135 | 140×152 | 140×152 | 125×147", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[kanpor-fuan n102] nguồn tự mâu thuẫn hình học: 6 xi lanh × 114 × 135 = 8.268 L, ghi 8.9 L; ô lệch stroke 135→145; giá trị đúng theo stroke=145 [10 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "pengpai-yangzhou", n: 129, model: "YC6C1070L-D20", line: "| PPDL-Y700 | 700/875 | 广西玉柴股份 | YC6C1070L-D20 | 12 | 39.58 | 180 | 200*210 | 4700*1800*2100 | 7200", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n129] nguồn tự mâu thuẫn hình học: 12 xi lanh × 200 × 210 = 79.168 L, ghi 39.58 L; ô lệch cyl 12→6; giá trị đúng theo cyl=6 [10 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "pengpai-yangzhou", n: 129, model: "YC6K600-D30", line: "| PPDL-Y350 | 350/437.5 | 广西玉柴股份 | YC6K600-D30 | 6 | 12.94 | 36 | 129*155 | 3100*1300*1900 | 3300", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[pengpai-yangzhou n129] nguồn tự mâu thuẫn hình học: 6 xi lanh × 129 × 155 = 12.155 L, ghi 12.94 L; ô lệch stroke 155→165; giá trị đúng theo stroke=165 [3 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "powerpack", n: 217, model: "Y4105D", line: "| Displacement | lt | 4,33", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[powerpack n217] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 118 = 4.087 L, ghi 4.33 L; ô lệch disp 4.33→4.1; giá trị đúng theo disp=4.1 [7 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "sunkings", n: 115, model: "QSK60-G3", line: "| SCF-1675 | 1350 | 1688 | 1500 | 1875 | QSK60-G3 | ≤215 | 16 | 60 | 159*159", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[sunkings n115] nguồn tự mâu thuẫn hình học: 16 xi lanh × 159 × 159 = 50.513 L, ghi 60 L; ô lệch stroke 159→190; giá trị đúng theo stroke=190 [5 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "victory-generator", n: 101, model: "4DW81-23D", line: "| V12XC | 50 | 10 | 12.5 | 12 | 15 | 4DW81-23D | 4 | Natural | Direct injection | 1.532 | 85*90 | ≤5 | ≤262 | 1700*900*1130", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[victory-generator n101] nguồn tự mâu thuẫn hình học: 4 xi lanh × 85 × 90 = 2.043 L, ghi 1.532 L; ô lệch stroke 90→100, disp 1.532→2.27; giá trị đúng theo stroke=100 [4 NCC]; disp=2.27 [5 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "victory-generator", n: 103, model: "YD480D", line: "| V15YD | 60 | 13 | 16.25 | 15 | 18.75 | YD480D | 3 | Natural | Direct injection | 1.809 | 80*90 | ≤5 | ≤249 | 2100*730*1130", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[victory-generator n103] nguồn tự mâu thuẫn hình học: 3 xi lanh × 80 × 90 = 1.357 L, ghi 1.809 L; ô lệch cyl 3→4; giá trị đúng theo cyl=4 [12 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "yongcai-elecmama", n: 126, model: "Y4105D", line: "| Bore x Stroke | 80 x 90 mm", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[yongcai-elecmama n126] nguồn tự mâu thuẫn hình học: 4 xi lanh × 80 × 90 = 1.81 L, ghi 1.357 L; ô lệch bore 80→105, stroke 90→118, disp 1.357→4.1; giá trị đúng theo bore=105 [5 NCC]; stroke=118 [5 NCC]; disp=4.1 [7 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 122, model: "6LTAA8.9-G2", line: "| 21 | MB-C180 | 225 | 180 | 248 | 198 | 6LTAA8.9-G2 | 6 | 8.9 | 114*135 | 197", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n122] nguồn tự mâu thuẫn hình học: 6 xi lanh × 114 × 135 = 8.268 L, ghi 8.9 L; ô lệch stroke 135→145; giá trị đúng theo stroke=145 [12 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 122, model: "6LTAA8.9-G2", line: "| 22 | MB-C200 | 250 | 200 | 275 | 220 | 6LTAA8.9-G2 | 6 | 8.9 | 114*135 | 197", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n122] nguồn tự mâu thuẫn hình học: 6 xi lanh × 114 × 135 = 8.268 L, ghi 8.9 L; ô lệch stroke 135→145; giá trị đúng theo stroke=145 [12 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 122, model: "NTAA855-G7A", line: "| 33 | MB-C320 | 400 | 320 | 440 | 352 | NTAA855-G7A | 6 | 14.0 | 159*159 | 205.4", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n122] nguồn tự mâu thuẫn hình học: 6 xi lanh × 159 × 159 = 18.942 L, ghi 14 L; ô lệch bore 159→140, stroke 159→152; giá trị đúng theo bore=140 [9 NCC]; stroke=152 [9 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 125, model: "TAD530GE", line: "| 1 | MB-V68 | 85 | 68 | 94 | 75 | TAD530GE | 4 | 1.1 | 77*81 | 16 | 3000×1200×1740", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n125] nguồn tự mâu thuẫn hình học: 4 xi lanh × 77 × 81 = 1.509 L, ghi 1.1 L; ô lệch bore 77→108, stroke 81→130, disp 1.1→4.76; giá trị đúng theo bore=108 [6 NCC]; stroke=130 [6 NCC]; disp=4.76 [7 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 125, model: "TAD531GE", line: "| 2 | MB-V80 | 100 | 80 | 110 | 88 | TAD531GE | 4 | 1.5 | 84*90 | 20.7 | 3000×1200×1740", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n125] nguồn tự mâu thuẫn hình học: 4 xi lanh × 84 × 90 = 1.995 L, ghi 1.5 L; ô lệch bore 84→108, stroke 90→130, disp 1.5→4.76; giá trị đúng theo bore=108 [7 NCC]; stroke=130 [7 NCC]; disp=4.76 [7 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 125, model: "TAD733GE", line: "| 6 | MB-V160 | 200 | 160 | 220 | 176 | TAD733GE | 4 | 3.3 | 105*127 | 48.5 | 3300×1400×1940", act: "dropspec", keys: ["cyl","bore","disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n125] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 127 = 4.399 L, ghi 3.3 L; ô lệch cyl 4→6, bore 105→108, stroke 127→130, disp 3.3→7.15; giá trị đúng theo cyl=6 [16 NCC]; bore=108 [8 NCC]; stroke=130 [8 NCC]; disp=7.15 [9 NCC]: bỏ riêng số xi lanh và đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 125, model: "TAD734GE", line: "| 7 | MB-V200 | 250 | 200 | 275 | 220 | TAD734GE | 4 | 3.3 | 105*127 | 48.5 | 3300×1400×1940", act: "dropspec", keys: ["cyl","bore","disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n125] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 127 = 4.399 L, ghi 3.3 L; ô lệch cyl 4→6, bore 105→108, stroke 127→130, disp 3.3→7.15; giá trị đúng theo cyl=6 [16 NCC]; bore=108 [8 NCC]; stroke=130 [8 NCC]; disp=7.15 [9 NCC]: bỏ riêng số xi lanh và đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6A245L-D21", line: "| 14 | MB-Y160 | 200 | 160 | 220 | 176 | YC6A245L-D21 | 6 | 8.4 | 108*132 | 195 | 3300×1400×1940", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 6 xi lanh × 108 × 132 = 7.255 L, ghi 8.4 L; ô lệch disp 8.4→7.255; giá trị đúng theo disp=7.255 [9 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6B180L-D20", line: "| 11 | MB-Y120 | 150 | 120 | 165 | 132 | YC6B180L-D20 | 6 | 6.9 | 108*132 | 215 | 3000×1200×1740", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 6 xi lanh × 108 × 132 = 7.255 L, ghi 6.9 L; ô lệch stroke 132→125; giá trị đúng theo stroke=125 [9 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6B205L-D20", line: "| 12 | MB-Y140 | 175 | 140 | 192.5 | 154 | YC6B205L-D20 | 6 | 7.3 | 108*125 | 215 | 3000×1200×1740", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 6 xi lanh × 108 × 125 = 6.871 L, ghi 7.3 L; ô lệch disp 7.3→6.87; giá trị đúng theo disp=6.87 [9 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6C1220L-D20", line: "| 25 | MB-Y800 | 1000 | 800 | 1100 | 880 | YC6C1220L-D20 | 6 | 79.2 | 200*210 | 195 | 6000×2300×2930", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 6 xi lanh × 200 × 210 = 39.584 L, ghi 79.2 L; ô lệch disp 79.2→39.584; giá trị đúng theo disp=39.584 [7 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6C1320L-D20", line: "| 26 | MB-Y880 | 1100 | 880 | 1210 | 968 | YC6C1320L-D20 | 6 | 79.2 | 200*210 | 195 | /", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 6 xi lanh × 200 × 210 = 39.584 L, ghi 79.2 L; ô lệch disp 79.2→39.584; giá trị đúng theo disp=39.584 [7 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6MJ480L-D20", line: "| 17 | MB-Y300 | 375 | 300 | 412.5 | 330 | YC6MJ480L-D20 | 6 | 10.3 | 131*145 | 195 | 4300×2100×2500", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 6 xi lanh × 131 × 145 = 11.726 L, ghi 10.3 L; ô lệch disp 10.3→11.76; giá trị đúng theo disp=11.76 [12 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6MK350L-D20", line: "| 15 | MB-Y220 | 275 | 220 | 302.5 | 242 | YC6MK350L-D20 | 6 | 8.4 | 120*145 | 195 | 3300×1400×1940", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 6 xi lanh × 120 × 145 = 9.839 L, ghi 8.4 L; ô lệch bore 120→123, disp 8.4→10.33; giá trị đúng theo bore=123 [11 NCC]; disp=10.33 [13 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6MK420L-D20", line: "| 16 | MB-Y250 | 312.5 | 250 | 343.75 | 275 | YC6MK420L-D20 | 6 | 9.8 | 123*145 | 195 | 4000×1800×2300", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 6 xi lanh × 123 × 145 = 10.338 L, ghi 9.8 L; ô lệch disp 9.8→10.38; giá trị đúng theo disp=10.38 [17 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6T550L-D21", line: "| 18 | MB-Y350 | 437.5 | 350 | 481.25 | 385 | YC6T550L-D21 | 12 | 16.3 | 145*165 | 195 | 4300×2100×2500", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 12 xi lanh × 145 × 165 = 32.696 L, ghi 16.3 L; ô lệch cyl 12→6; giá trị đúng theo cyl=6 [13 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 123, model: "YC6T600L-D22", line: "| 19 | MB-Y400 | 500 | 400 | 550 | 440 | YC6T600L-D22 | 12 | 16.3 | 145*165 | 195 | 4500×2100×2600", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[mingbang-mbkl n123] nguồn tự mâu thuẫn hình học: 12 xi lanh × 145 × 165 = 32.696 L, ghi 16.3 L; ô lệch cyl 12→6; giá trị đúng theo cyl=6 [20 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "taihai-taizhou", n: 101, model: "QSK78-G9", line: "| TH-2000GF | 2500 | 2000 | QSK78-G9 | 16V | 170/190 | 77.6 | 201 | 7158×2800×2900 | 24880 |", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[taihai-taizhou n101] nguồn tự mâu thuẫn hình học: 16 xi lanh × 170 × 190 = 69.002 L, ghi 77.6 L; ô lệch cyl 16→18; giá trị đúng theo cyl=18 [4 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "taihai-taizhou", n: 108, model: "SC33W990D2", line: "| TH-600GF | 600 | 750 | 1080 | SC33W990D2 | 12 | 180*215 | 32.8 | 57 | 215 | 3700*1700*1950 | 5300", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[taihai-taizhou n108] nguồn tự mâu thuẫn hình học: 12 xi lanh × 180 × 215 = 65.653 L, ghi 32.8 L; ô lệch cyl 12→6; giá trị đúng theo cyl=6 [tờ hãng sdec n2010]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "taihai-taizhou", n: 109, model: "YC2115ZD", line: "| TH-30GF | 30 | 37.5 | 54 | YC2115ZD | 2 | 108×115 | 4.214 | 12 | ≤205 | 1700*750*1000 | 900", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[taihai-taizhou n109] nguồn tự mâu thuẫn hình học: 2 xi lanh × 108 × 115 = 2.107 L, ghi 4.214 L; ô lệch bore 108→115, stroke 115→120, disp 4.214→2.49; giá trị đúng theo bore=115 [5 NCC]; stroke=120 [5 NCC]; disp=2.49 [6 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "yunding-jiangsu", n: 2002, model: "1104C-44TAG2", line: "| YDP-80GF | 80 | 100 | 144 | 1104C-44TAG2 | 4 | 100*127 | 4.41 | 8 | 208 | 1950*800*1200 | 1000", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[yunding-jiangsu n2002] nguồn tự mâu thuẫn hình học: 4 xi lanh × 100 × 127 = 3.99 L, ghi 4.41 L; ô lệch bore 100→105; giá trị đúng theo bore=105 [13 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "yunding-jiangsu", n: 2007, model: "SC4H180D2", line: "| YDS-120GF | 120 | 150 | 216 | SC4H180D2 | 4 | 135*150 | 4.3 | 15 | 198 | 2100*900*1200 | 1350", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[yunding-jiangsu n2007] nguồn tự mâu thuẫn hình học: 4 xi lanh × 135 × 150 = 8.588 L, ghi 4.3 L; ô lệch bore 135→105, stroke 150→124; giá trị đúng theo bore=105 [17 NCC]; stroke=124 [17 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "yunding-jiangsu", n: 2008, model: "WP13D440E310", line: "| YDW-400GF | 400 | 500 | 720 | WP13D440E310 | 9 | 127*165 | 12.54 | 30 | 205 | 3100*1150*1600 | 3050", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[yunding-jiangsu n2008] nguồn tự mâu thuẫn hình học: 9 xi lanh × 127 × 165 = 18.812 L, ghi 12.54 L; ô lệch cyl 9→6; giá trị đúng theo cyl=6 [8 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "yunding-jiangsu", n: 2008, model: "WP13D490E310", line: "| YDW-450GF | 450 | 562.5 | 810 | WP13D490E310 | 9 | 127*165 | 12.54 | 30 | 205 | 3260*1390*1850 | 3200", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026", why: "[yunding-jiangsu n2008] nguồn tự mâu thuẫn hình học: 9 xi lanh × 127 × 165 = 18.812 L, ghi 12.54 L; ô lệch cyl 9→6; giá trị đúng theo cyl=6 [tờ hãng weichai-power n112]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "12M33D1320E200", line: "| ZCDL-W1200 | 1100 | 1200 | 2160A | 12M33D1320E200 | 12 | 159*159 | 50L | 191g/kw.h | 5900*2270*2500 | 12000kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 12 xi lanh × 159 × 159 = 37.885 L, ghi 50 L; ô lệch bore 159→150, stroke 159→185, disp 50→39.2; giá trị đúng theo bore=150 [5 NCC]; stroke=185 [5 NCC]; disp=39.2 [9 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "12M55D2210E310", line: "| ZCDL-W2000 | 1800 | 2000 | 3600A | 12M55D2210E310 | 12 | 159*159 | 68L | 193g/kw.h | 6400×2800×3700 | 16200kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 12 xi lanh × 159 × 159 = 37.885 L, ghi 68 L; ô lệch bore 159→180, stroke 159→215, disp 68→65.7; giá trị đúng theo bore=180 [5 NCC]; stroke=215 [5 NCC]; disp=65.7 [9 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "12M55D2450E310", line: "| ZCDL-W2200 | 2000 | 2200 | 3960A | 12M55D2450E310 | 12 | 159*159 | 68L | 193g/kw.h | 6400×2800×3700 | 16200kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 12 xi lanh × 159 × 159 = 37.885 L, ghi 68 L; ô lệch bore 159→180, stroke 159→215, disp 68→65.7; giá trị đúng theo bore=180 [5 NCC]; stroke=215 [5 NCC]; disp=65.7 [9 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "12M55D2700E310", line: "| ZCDL-W2400 | 2200 | 2400 | 4320A | 12M55D2700E310 | 12 | 159*159 | 68L | 193g/kw.h | 6400×2800×3700 | 16200kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 12 xi lanh × 159 × 159 = 37.885 L, ghi 68 L; ô lệch bore 159→180, stroke 159→215, disp 68→65.7; giá trị đúng theo bore=180 [3 NCC]; stroke=215 [3 NCC]; disp=65.7 [4 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "16M33D1530E310", line: "| ZCDL-W1400 | 1250 | 1400 | 2520A | 16M33D1530E310 | 16 | 159*159 | 60L | 191g/kw.h | 6200*2300*2550 | 15800kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 16 xi lanh × 159 × 159 = 50.513 L, ghi 60 L; ô lệch bore 159→150, stroke 159→185, disp 60→52.3; giá trị đúng theo bore=150 [3 NCC]; stroke=185 [3 NCC]; disp=52.3 [8 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "16M33D1580E310", line: "| ZCDL-W1440 | 1300 | 1440 | 2592A | 16M33D1580E310 | 16 | 159*159 | 60L | 191g/kw.h | 6200*2300*2550 | 15800kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 16 xi lanh × 159 × 159 = 50.513 L, ghi 60 L; ô lệch bore 159→150, stroke 159→185, disp 60→52.3; giá trị đúng theo bore=150 [4 NCC]; stroke=185 [4 NCC]; disp=52.3 [8 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "16M33D1680E310", line: "| ZCDL-W1520 | 1400 | 1520 | 2736A | 16M33D1680E310 | 16 | 159*159 | 60L | 191g/kw.h | 6200*2300*2550 | 15800kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 16 xi lanh × 159 × 159 = 50.513 L, ghi 60 L; ô lệch bore 159→150, stroke 159→185, disp 60→52.3; giá trị đúng theo bore=150 [5 NCC]; stroke=185 [5 NCC]; disp=52.3 [10 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "16M33D1800E310", line: "| ZCDL-W1650 | 1500 | 1650 | 2970A | 16M33D1800E310 | 16 | 159*159 | 60L | 191g/kw.h | 6200*2300*2550 | 15800kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 16 xi lanh × 159 × 159 = 50.513 L, ghi 60 L; ô lệch bore 159→150, stroke 159→185, disp 60→52.3; giá trị đúng theo bore=150 [4 NCC]; stroke=185 [4 NCC]; disp=52.3 [7 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "16M55D2900E310", line: "| ZCDL-W2650 | 2400 | 2650 | 4770A | 16M55D2900E310 | 16 | 159*159 | 72L | 200g/kw.h | 6900×2900×3800 | 18900kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 16 xi lanh × 159 × 159 = 50.513 L, ghi 72 L; ô lệch bore 159→180, stroke 159→215, disp 72→87.5; giá trị đúng theo bore=180 [3 NCC]; stroke=215 [3 NCC]; disp=87.5 [5 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 161, model: "SC13G280D2", line: "| ZCDL-S190 | 170 | 190 | 306A | SC13G280D2 | 6 | 135 * 150 | 8.8L | 200g/kw.h | 2700 * 1000 *1500 | 2400kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n161] nguồn tự mâu thuẫn hình học: 6 xi lanh × 135 × 150 = 12.882 L, ghi 8.8 L; ô lệch disp 8.8→12.88; giá trị đúng theo disp=12.88 [4 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 161, model: "SC13G355D2", line: "| ZCDL-S235 | 215 | 235 | 387A | SC13G355D2 | 6 | 135 *150 | 8.82L | 200g/kw.h | 3150*1240 * 1750 | 2500kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n161] nguồn tự mâu thuẫn hình học: 6 xi lanh × 135 × 150 = 12.882 L, ghi 8.82 L; ô lệch disp 8.82→12.88; giá trị đúng theo disp=12.88 [11 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 161, model: "SC4H160D2", line: "| ZCDL-S105 | 95 | 105 | 171A | SC4H160D2 | 4 | 105* 124 | 4L | 193g/kw.h | 2500*870 * 1340 | 970kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n161] nguồn tự mâu thuẫn hình học: 4 xi lanh × 105 × 124 = 4.295 L, ghi 4 L; ô lệch disp 4→4.3; giá trị đúng theo disp=4.3 [22 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 161, model: "SC9D340D2", line: "| ZCDL-S230 | 210 | 230 | 378A | SC9D340D2 | 6 | 114*144 | 8.27L | 195g/kw.h | 3000 *1080* 1700 | 2500kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n161] nguồn tự mâu thuẫn hình học: 6 xi lanh × 114 × 144 = 8.819 L, ghi 8.27 L; ô lệch disp 8.27→8.82; giá trị đúng theo disp=8.82 [21 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 101, model: "TAD753GE", line: "| ZCDL-V175 | 160 | 175 | 288A | TAD753GE | 6 | 180*130 | 7.15L | 191g/kw.h | 2600*1046*1500 | 1789kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n101] nguồn tự mâu thuẫn hình học: 6 xi lanh × 180 × 130 = 19.849 L, ghi 7.15 L; ô lệch bore 180→108; giá trị đúng theo bore=108 [4 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "aosif", n: 1024, model: "QSB5.9-G31", line: "| Displacement | 3.9 L", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[aosif n1024] nguồn tự mâu thuẫn hình học: 6 xi lanh × 102 × 120 = 5.883 L, ghi 3.9 L; nếu nhận 2 NCC: ô lệch disp 3.9→5.9; giá trị đúng theo disp=5.9 [2 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2360, model: "BF8M1015C-LA G1A", line: "| Cylinder | 6 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[depco-power n2360] nguồn tự mâu thuẫn hình học: 6 xi lanh × 132 × 145 = 11.906 L, ghi 15.874 L; nếu nhận 2 NCC: ô lệch cyl 6→8; giá trị đúng theo cyl=8 [10 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2357, model: "BF8M1015CP-LA G2", line: "| Cylinder | 6 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[depco-power n2357] nguồn tự mâu thuẫn hình học: 6 xi lanh × 132 × 145 = 11.906 L, ghi 15.874 L; nếu nhận 2 NCC: ô lệch cyl 6→8; giá trị đúng theo cyl=8 [10 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2355, model: "BF8M1015CP-LA G4", line: "| Cylinder | 6 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[depco-power n2355] nguồn tự mâu thuẫn hình học: 6 xi lanh × 132 × 145 = 11.906 L, ghi 15.874 L; nếu nhận 2 NCC: ô lệch cyl 6→8; giá trị đúng theo cyl=8 [10 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2354, model: "BF8M1015CP-LA G5", line: "| Cylinder | 6 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[depco-power n2354] nguồn tự mâu thuẫn hình học: 6 xi lanh × 132 × 145 = 11.906 L, ghi 15.874 L; nếu nhận 2 NCC: ô lệch cyl 6→8; giá trị đúng theo cyl=8 [11 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2327, model: "CA6DF2D-14D", line: "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 110 X 125", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[depco-power n2327] nguồn tự mâu thuẫn hình học: 6 xi lanh × 110 × 125 = 7.127 L, ghi 6.5 L; nếu nhận 2 NCC: ô lệch stroke 125→115; giá trị đúng theo stroke=115 [2 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2319, model: "CA6DN1J-45D", line: "| Cylider arrangemant | IN-LINE | Bore and Stroke(mm) | 123 X 155", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[depco-power n2319] nguồn tự mâu thuẫn hình học: 6 xi lanh × 123 × 155 = 11.051 L, ghi 12.53 L; nếu nhận 2 NCC: ô lệch bore 123→131; giá trị đúng theo bore=131 [2 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "depco-power", n: 2024, model: "WP10D200E201", line: "| Cylinder | 4 | Cooling system | Water", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[depco-power n2024] nguồn tự mâu thuẫn hình học: 4 xi lanh × 126 × 130 = 6.484 L, ghi 9.726 L; nếu nhận 2 NCC: ô lệch cyl 4→6; giá trị đúng theo cyl=6 [4 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "genlitec", n: 117, model: "4Z2.3-G21", line: "| Bore x Stroke | 85 x 110 mm", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[genlitec n117] nguồn tự mâu thuẫn hình học: 4 xi lanh × 85 × 110 = 2.497 L, ghi 2.3 L; nếu nhận 2 NCC: ô lệch stroke 110→100; giá trị đúng theo stroke=100 [2 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "genlitec", n: 1010, model: "4Z2.3-G21", line: "| Bore x Stroke (mm) | 85 x110", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[genlitec n1010] nguồn tự mâu thuẫn hình học: 4 xi lanh × 85 × 110 = 2.497 L, ghi 2.3 L; nếu nhận 2 NCC: ô lệch stroke 110→100; giá trị đúng theo stroke=100 [2 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 125, model: "SC12E420D2", line: "| HY-250 | SC12E420D2 | 280 | 308 | 6 | 128*135 | 11.8 | 195 | 3100*1150*1750 | 2600 | T2", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[hanyang-weifang n125] nguồn tự mâu thuẫn hình học: 6 xi lanh × 128 × 135 = 10.423 L, ghi 11.8 L; nếu nhận 2 NCC: ô lệch stroke 135→153; giá trị đúng theo stroke=153 [2 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 107, model: "YC4A100Z-D25", line: "| HY-64 | YC4A100Z-D25 | 70 | 77 | 4 | 108*115 | 4.84 | 213 | 2300*900*1500 | 1200 | T2", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[hanyang-weifang n107] nguồn tự mâu thuẫn hình học: 4 xi lanh × 108 × 115 = 4.214 L, ghi 4.84 L; nếu nhận 2 NCC: ô lệch stroke 115→132; giá trị đúng theo stroke=132 [2 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "hanyang-weifang", n: 107, model: "YC4D155-D31", line: "| HY-100 | YC4D155-D31 | 103 | 113 | 4 | 108*115 | 4.84 | 210 | 2300*850*1500 | 1150 | T3", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[hanyang-weifang n107] nguồn tự mâu thuẫn hình học: 4 xi lanh × 108 × 115 = 4.214 L, ghi 4.84 L; nếu nhận 2 NCC: ô lệch disp 4.84→4.21; giá trị đúng theo disp=4.21 [5 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "huatai-yangzhou", n: 102, model: "TD226B-3D", line: "| 40GF | 40 | TD226B-3D | 3L | 105/120 | 4.16 | 11 | 650 | 1650*700*1290", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[huatai-yangzhou n102] nguồn tự mâu thuẫn hình học: 3 xi lanh × 105 × 120 = 3.117 L, ghi 4.16 L; nếu nhận 2 NCC: ô lệch disp 4.16→3.114; giá trị đúng theo disp=3.114 [6 NCC]: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "jet-power", n: 127, model: "S6R2-PTA-C", line: "| M-715 | 715 | 572 | 650 | 520 | S6R2-PTA-C/575KW | 6L | 170×120 | 29.96 | 124L/h | Electronic | 14.1 | HCI544F/570KVA | 3650*1600*1900 | 5620 | 4600*2000*2250 | 6620", act: "dropspec", keys: ["bore"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[jet-power n127] nguồn tự mâu thuẫn hình học: 6 xi lanh × 170 × 120 = 16.343 L, ghi 29.96 L; nếu nhận 2 NCC: ô lệch stroke 120→220; giá trị đúng theo stroke=220 [2 NCC]: bỏ riêng đường kính × hành trình, giữ dòng, không ghi số thay" },
    { supplierId: "mingbang-mbkl", n: 126, model: "1006TAG", line: "| 15 | MB-P108 | 135 | 108 | 150 | 120 | 1006TAG | 4 | 6.0 | 100*127 | 208 | 3000×1200×1740", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[mingbang-mbkl n126] nguồn tự mâu thuẫn hình học: 4 xi lanh × 100 × 127 = 3.99 L, ghi 6 L; nếu nhận 2 NCC: ô lệch cyl 4→6; giá trị đúng theo cyl=6 [3 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "yunding-jiangsu", n: 2006, model: "YC6B180L-D20", line: "| YDY-120GF | 120 | 150 | 216 | YC6B180L-D20 | 4 | 108*125 | 6.87 | 21 | 198 | 2350*950*1420 | 1450", act: "dropspec", keys: ["cyl"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[yunding-jiangsu n2006] nguồn tự mâu thuẫn hình học: 4 xi lanh × 108 × 125 = 4.58 L, ghi 6.87 L; nếu nhận 2 NCC: ô lệch cyl 4→6; giá trị đúng theo cyl=6 [21 NCC]: bỏ riêng số xi lanh, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "16M55D2750E310", line: "| ZCDL-W2500 | / | 2500 | 4500A | 16M55D2750E310 | 16 | 159*159 | 72L | 200g/kw.h | 6900×2900×3800 | 18900kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 16 xi lanh × 159 × 159 = 50.513 L, ghi 72 L; nếu nhận 2 NCC: ô lệch bore 159→180, stroke 159→215, disp 72→87.5; giá trị đúng theo bore=180 [2 NCC]; stroke=215 [2 NCC]; disp=87.5 [3 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "16M55D3300E310", line: "| ZCDL-W3000 | 2600 | 3000 | 5400A | 16M55D3300E310 | 16 | 159*159 | 72L | 200g/kw.h | 6900×2900×3800 | 18900kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 16 xi lanh × 159 × 159 = 50.513 L, ghi 72 L; nếu nhận 2 NCC: ô lệch bore 159→180, stroke 159→215, disp 72→87.5; giá trị đúng theo bore=180 [2 NCC]; stroke=215 [2 NCC]; disp=87.5 [3 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "16M55D3600E310", line: "| ZCDL-W3300 | 3000 | 3300 | 5940A | 16M55D3600E310 | 16 | 159*159 | 72L | 200g/kw.h | 6900×2900×3800 | 18900kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 16 xi lanh × 159 × 159 = 50.513 L, ghi 72 L; nếu nhận 2 NCC: ô lệch bore 159→180, stroke 159→215, disp 72→87.5; giá trị đúng theo bore=180 [2 NCC]; stroke=215 [2 NCC]; disp=87.5 [3 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "20M33D2020E310", line: "| ZCDL-W1800 | 1600 | 1800 | 3240A | 20M33D2020E310 | 20 | 159*159 | 68L | 193g/kw.h | 6400×2800×3700 | 16200kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["bore","disp"], khoa: "Khoa 24/11/2026 (nhận căn cứ 2 NCC)", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 20 xi lanh × 159 × 159 = 63.141 L, ghi 68 L; nếu nhận 2 NCC: ô lệch bore 159→150, stroke 159→185, disp 68→65.4; giá trị đúng theo bore=150 [2 NCC]; stroke=185 [2 NCC]; disp=65.4 [3 NCC]: bỏ riêng đường kính × hành trình và dung tích, giữ dòng, không ghi số thay" },
    // bo-o-lech-4 (Khoa 24/11/2026 duyệt thêm): 4 ca LOẠI 4 dung tích sai hình học, không có tờ hãng hay ≥3 NCC khác để lấy số đúng: bỏ riêng ô dung tích (disp), không ghi số thay; test `suppliers/bo-o-lech-4.test.mjs`.
    { supplierId: "kangwo-guangdong", n: 110, model: "S175M", line: "| GKW-3GF | 3 | 3.75 | 5.4 | S175M | 1 | 75/80 | 1.2 | 210 | 1000*480*800 | 300", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n110] nguồn tự mâu thuẫn hình học: 1 xi lanh × 75 × 80 = 0.353 L, ghi 1.2 L; không có tờ hãng hay ≥3 NCC khác cùng giá trị: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "kangwo-guangdong", n: 110, model: "S180M", line: "| GKW-5GF | 5 | 6.25 | 9 | S180M | 1 | 80/80 | 1.2 | 210 | 1100*600*800 | 300", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[kangwo-guangdong n110] nguồn tự mâu thuẫn hình học: 1 xi lanh × 80 × 80 = 0.402 L, ghi 1.2 L; không có tờ hãng hay ≥3 NCC khác cùng giá trị: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "zhengchi-power", n: 162, model: "12M33D1450E310", line: "| ZCDL-W1320 | 1200 | 1320 | 2376A | 12M33D1450E310 | 12 | 159*159 | 50L | g/kw.h | 5900*2270*2500 | 12000kg | 220/380 | 50Hz | 三相四线 | 详细参数", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[zhengchi-power n162] nguồn tự mâu thuẫn hình học: 12 xi lanh × 159 × 159 = 37.885 L, ghi 50 L; không có tờ hãng hay ≥3 NCC khác cùng giá trị: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
    { supplierId: "taihai-taizhou", n: 108, model: "6135AD-3", line: "| TH-100GF | 100 | 125 | 180 | 6135AD-3 | 6 | 135*150 | 8.6 | 28 | 226 | 2600*900*1600 | 2200", act: "dropspec", keys: ["disp"], khoa: "Khoa 24/11/2026", why: "[taihai-taizhou n108] nguồn tự mâu thuẫn hình học: 6 xi lanh × 135 × 150 = 12.882 L, ghi 8.6 L; không có tờ hãng hay ≥3 NCC khác cùng giá trị: bỏ riêng dung tích, giữ dòng, không ghi số thay" },
  ];
  function rowExceptions(s, list, note) {
    const ex = ROW_EXCEPTIONS.filter((x) => x.supplierId === s.id);
    if (!ex.length) return list;
    const out = [];
    for (const o of list) {
      const lines = [o.line, ...(o.lines?.header || []), ...(o.lines?.rows || [])].filter((x) => x != null).map((x) => String(x).trim());
      // Every entry that matches is applied, in list order (gia-tri-sai 24/11/2026: a row may need a second figure dropped,
      // e.g. the LZ1750 rows' weight (19/11) and fuel (24/11)); `drop` ends the row.
      const gset = o.kind === "genset" ? o.model : o.genset;
      const xs = ex.filter((x) => x.n === o.n && (x.genset ? gset && keyOf(gset) === keyOf(x.genset) : o.kind === "engine" && keyOf(o.model) === keyOf(x.model)) && lines.includes(x.line.trim()));
      if (!xs.length) { out.push(o); continue; }
      let cur = o;
      for (const x of xs) {
        note({ n: o.n, title: o.title }, o.table, o.row ?? null, "ngoại lệ theo dòng", `${x.act}: ${x.khoa}, ${x.why}`);
        cur = applyRowException(cur, x);
        if (!cur) break;
      }
      if (cur) out.push(cur);
    }
    return out;
  }
  // One ROW_EXCEPTIONS entry on one record; null = the row gives no record.
  function applyRowException(o, x) {
    {
      if (x.act === "drop") return null;
      if (x.act === "nopower") return { ...o, power: null };
      else if (x.act === "dropspec") return { ...o, specs: (o.specs || []).filter((sp) => !x.keys.includes(sp.key)) };
      else if (x.act === "unitspec") {
        // Only a spec whose value is word for word `from` (the source changed → read as before).
        const specs = (o.specs || []).map((sp) => (x.keys.includes(sp.key) && String(sp.value).trim() === x.from ? { ...sp, unitMissing: { why: x.why, khoa: x.khoa } } : sp));
        return { ...o, specs };
      } else if (x.act === "unsurespec") {
        // gia-tri-sai (Khoa 24/11/2026, googol "Weight (kg)"): the source does not say whose figure this is (engine or set).
        // The spec stays and is shown, flagged `unconfirmed`; spec-norm marks it missing "confirm", so no rule scores or
        // filters with it (config-bot NORM_GAP, row-flags absurdOf). Only a value word for word `from`.
        const specs = (o.specs || []).map((sp) => (x.keys.includes(sp.key) && String(sp.value).trim() === x.from ? { ...sp, unconfirmed: { why: x.why, khoa: x.khoa } } : sp));
        return { ...o, specs };
      } else if (x.act === "fixspec") {
        // Replace only a spec whose value is word for word the source's `from`; any other value (the source changed) is left as read.
        const fixed = [];
        const specs = (o.specs || []).map((sp) => {
          const f = x.fixes.find((y) => y.key === sp.key && String(sp.value).trim() === y.from);
          if (!f) return sp;
          fixed.push({ key: f.key, from: f.from, to: f.to, why: f.why, src: f.src });
          return { ...sp, value: f.to, fixed: { from: f.from, why: f.why, src: f.src } };
        });
        return fixed.length ? { ...o, specs, fixed: [...(o.fixed || []), ...fixed] } : o;
      }
    }
    return o;
  }
  // One row written word for word in several tables of the same supplier (a dealer's page per series that repeats the
  // same genset row, a PDF table and the page's own table; 5,250 of 64,788 records on 2026-11-16) is one record, not
  // several (Khoa 2026-11-14: "gộp", not dropped: dropping the repeats took the only make of 59 models). The first
  // record stays; the makes, figures, power, frequency and alternator of the repeats are added to it, and their sources
  // go in `also` ({ n, table, row, title }). A fromLine record (a product line's power row) is never merged, nor two
// records of different frequencies.
  function mergeRepeats(list) {
    const first = new Map(), out = [];
    for (const o of list) {
      if (!o.line || o.fromLine) { out.push(o); continue; }
      // A row in both a 50 Hz and a 60 Hz table (wintpower WT-SC138) stays twice: one record per frequency.
      const k = `${o.kind}\n${keyOf(o.model)}\n${String(o.line).trim()}`, f = first.get(k);
      if (!f || (f.freq && o.freq && f.freq !== o.freq)) { if (!f) first.set(k, o); out.push(o); continue; }
      for (const m of o.makes || []) if (!f.makes.some((x) => x.name === m.name && x.via === m.via)) f.makes.push(m);
      // A new array: the engine and alternator records of one row share theirs.
      const add = (o.specs || []).filter((sp) => !f.specs.some((x) => x.key === sp.key && x.value === sp.value));
      if (add.length) f.specs = [...f.specs, ...add];
      if (!f.power && o.power) f.power = o.power;
      if (!f.freq && o.freq) f.freq = o.freq;
      if (!f.other && o.other) f.other = o.other;
      if (o.own) f.own = true;
      if (f.fuel !== o.fuel) { delete f.fuel; delete f.fuelFrom; delete f.fuelWhy; } // the same row, two tables saying different fuels: none
      (f.also = f.also || []).push({ n: o.n, table: o.table, row: o.row, title: o.title });
    }
    return out;
  }
  // Genset tables whose engine cell IS an engine model, written so that isCode does not take it (bảng bỏ sót, Khoa duyệt
  // 20/11/2026; catalog-c-de-xuat.md 1.1 lớp X): MTU "12V 1600 G10F" (spaces), Kohler "KDW 702 (M)" / "KSD 1403 TCA", Scania
  // "OC16 071A 02 81 (E)", "MTU 8V4000 GS/L32". A list checked by hand, not a rule: a rule taking spaced codes would reach
  // every table (the 4 tables were found among 82 by hand). A table is read only when supplier, n AND its first header line,
  // word for word, match (a re-crawled page with another header lapses, noted). Each layout names the cells (cellsOf of the
  // row): model (the genset), engine, power levels { kVA | kW: cell }, specs [key, cell, label as the header writes it];
  // `freq` from the header ("kVA - 50 Hz"); `cells`: the cell counts of a row with an engine. A row of another count (the
  // silent version "GP610 SM/M | S | 370 | 5000 | …", lees' unnamed "800 | 43.0 | …" rows) names no engine: left out, noted.
  // An engine cell's trailing "(M)" / "(E)" repeats the governor column "REG" (M / E) of the same row and is not part of the
  // code; a make written before the code ("MTU 8V4000 GS/L32") is the make, not the model. No power level in the title
  // ("Electrical Power KW", lees) is "rated", as titledPowers reads one. The records are the same as a table row's (kind
  // "engine", genset, power, freq, specs, makes, other: null).
  const ENGINE_CELL_TABLES = [
    { supplierId: "green-power-generators", n: [115], header: "| | MODELLO MODEL | TIPO TYPE | POTENZA POWER | MOTORE ENGINE | SERBATOIO TANK | DIMENSIONI DIMENSIONS | PESO WEIGHT | DOWNLOAD",
      cells: [13, 16], model: 0, engine: 4, freq: 50, prime: { kVA: 2 }, standby: { kVA: 3 },
      specs: [["cyl", 6, "CIL. N."], ["fuel75", 7, "CONSUMO AL 75% PRP CONSUMPTION AT 75% PRP L/h"], ["tank", 8, "SERBATOIO TANK L"], ["weight", 12, "PESO WEIGHT kg"]] },
    { supplierId: "green-power-generators", n: [117], header: "| | MODELLO MODEL | TIPO TYPE | POTENZA POWER | MOTORE ENGINE | | SERBATOIO TANK | DIMENSIONI DIMENSIONS | PESO WEIGHT | DOWNLOAD",
      cells: [15, 18], model: 0, engine: 4, freq: 50, prime: { kVA: 2 }, standby: { kVA: 3 },
      specs: [["cyl", 6, "CIL. N."], ["fuel75", 7, "CONSUMO AL 75% PRP CONSUMPTION AT 75% PRP L/h"], ["emission", 8, "EMISSIONI EMISSIONS"], ["tank", 9, "SERBATOIO TANK DIESEL L"], ["weight", 14, "PESO WEIGHT kg"]] },
    { supplierId: "green-power-generators", n: [126], header: "| | MODELLO MODEL | TIPO TYPE | POTENZA POWER | MOTORE ENGINE | DOWNLOAD",
      cells: [10, 13], model: 0, engine: 6, freq: 50, prime: { kVA: 2 }, standby: { kVA: 3 }, specs: [["cyl", 9, "CIL. N."]] },
    { supplierId: "lees-power", n: [133], header: "| Model | Electrical Power KW | Efficiency (%) | Nox mg/m3 | Dimensions L×W×H (mm) | Weight (kg) | Specifications",
      cells: [10], model: 0, engine: 1, rated: { kW: 2 }, specs: [["dims", 7, "Dimensions L×W×H (mm)"], ["weight", 8, "Weight (kg)"]] },
  ].map((x) => ({ checked: "20/11/2026", ...x }));
  // Vertical one-genset sheets, stage 1 (bang-doc-1, "bảng dọc" V1; chủ dự án 19–21/11/2026: "làm sao để đọc được thông số
  // đúng là được, cần tìm cách ngăn chặn rủi ro"): a table of "label | value" lines about ONE genset whose own "Model" line
  // names it, and that gave no record at all the other ways. Read only when ALL of these hold, else nothing (noted):
  //   - the table gave no record (every table read before keeps what it gives: nothing of it changes);
  //   - one genset model, from the "Model" / "Genset Model" / "Model Number" lines outside the engine's and the alternator's
  //     parts (two models or more, or a "Model" line with two codes: a page of several products, left out);
  //   - the model is not shaped like an engine's or an alternator's code (ALT_CODE, DOOSAN_P, FRAME_ALT), nor the table's own
  //     engine / alternator code (suppliers/bang-doc-1.test.mjs also checks it against every engine / alternator of build());
  //   - one engine code, from the engine's own line ("Engine Model | Y495D", "Engine Brand / Model | Yuchai YC16VC3300-D31",
  //     "Model" under an "Engine" heading); brand words before it are the make. "or equivalent", "Series", "/" (choices):
  //     no engine. No engine code, no record (records are an engine's or an alternator's; the genset's own name is `genset`);
  //   - a prime or a standby output with its level written in its label, in the genset's part of the sheet (before the first
  //     engine / alternator line or heading: dingbo's "Prime Power 354kW" under the engine model is the engine's), each
  //     figure with its unit in the cell, a unit cell or the label; a level written twice with other figures (a page listing
  //     products), kW and kVA that do not fit one set, prime above standby: that level / both left out. "Rated", "Power",
  //     continuous, COP: no level, not read here. Neither level left: no record.
  // Figures (specs) by their label (specKey), the same label read twice with other values: left out; in the engine's part
  // only engine / genset figures, in the alternator's only alternator figures. Records carry `sheet: "bảng dọc"`.
  const V_MODEL = /^(genset\s*model|generator\s*set\s*model|model|models?\s*(no\.?|number|#)|model\s*型号|型号|机组型号|modelo)$/i;
  // "动力型号" (power unit model, kanpor-fuan; fromLabelTable reads it as the engine too) and "Gas Engine Model" (pulita-energy) name the engine.
  const V_ENGINE = /^(((diesel|gas)\s*)?engine(\s*(model|type|brand\s*(&|and|\/)\s*model))?|发动机型号|柴油机型号|动力型号|发动机|柴油机)$/i;
  const V_ALT = /^(alternator(\s*(model|type|brand\s*(&|and|\/)\s*model))?|generator\s*model|发电机型号)$/i;
  const V_BRAND = /^((engine|alternator)\s*)?(brand|make|manufacturer)$|^(发动机|柴油机|发电机)?(品牌|厂家)$/i;
  // Unit cells of a vertical sheet that UNIT_CELL (shared by every reader) does not know: "lt" / "lt/h" (Powerpack litres), "kWm", "VDC", "RPM / Hz.".
  const V_UNIT_MORE = /^\(?(lt|ltr|litres?|liters?|lt\/h|ltr\/h|vdc|vac|mm|bar|kpa)\)?$/i;
  const V_NOTPOW =/engine|motor|alternator|generator(?!\s*set)|gross|\bnet\b|kwm|continuous|\bcop\b|fuel|consum|current|factor|%|load|torque|speed|voltage|range|nodes/i;
  function verticalCells(l) {
    let c = cellsOf(l);
    // "| Genset Model：SP28GFS", "| Noise(LP1m): 100dB(A)": label and value in one cell.
    if (c.length === 1) { const m = c[0].match(/^([^:：]{2,60})[:：]\s*(.+)$/); if (m) c = [m[1].trim(), m[2].trim()]; }
    return [String(c[0] || "").replace(/[:：\s]+$/, "").trim(), ...c.slice(1).map((x) => String(x).trim())];
  }
  const V_CODE_BRANDS = [...ENGINE_BRANDS, ...ALT_CELL_BRANDS];
  const V_MAKE_TAIL = /^(penta|deere|somer|alte|petter|wilson|infracore)$/i;
  const V_GENERIC = /^(engine|model|brand|type|make|motor|heavy|industries|industry|power|co|ltd|corp|inc|group|company|manufacturer|by)\.?$/i;
  // CLOSED lists (điều phối 21/11/2026, PR #1058; not rules: add a word only when a real cell needs it). An ALL-CAPS word
  // after the make that names a factory / another maker (V_MAKER_ALIAS: "Cummins CCEC 6BT5.9-G2", "Mitsubishi MHI …") or a
  // country / legal form (V_PLACE: "Perkins UK 1106A-70TAG4", "Perkins EU 1104A-44TG1", "Yanmar JAPAN 3TNV88") is not part
  // of the code and goes, even before a code that starts with a digit.
  const V_MAKER_ALIAS = /^(ccec|dcec|xcec|mhi|sme)$/i;
  const V_PLACE = /^(uk|usa|us|eu|prc|japan|jp|china|germany|india|korea|italy|france|sweden|ltd|inc|co|ag|gmbh)\.?$/i;
  // A part's code in a value cell: brand words, then one code ("CCEC Cummins NTA855-G2A", "PERKINS , 1106A－70TAG4"). Full-width
  // characters are read by NFKC as keyOf does ("－" is "-"). Choices ("or equivalent", "Series", "a / b") are no code.
  const vIsCode = (x) => isCode(x) || (/^[A-Z]{2}\d{3}CC$/.test(x) && isCode(x.slice(0, -1) + "B"));
  function verticalCode(v) {
    const s = String(v || "").normalize("NFKC").trim();
    // "/" is a choice ("A / B", "6BT5.9/6CT8.3") except as a one-or-two-character suffix of one code (Baudouin "6M33G750/5", "4M06G2D0/S").
    const slash = /[/／]/.test(s) && !/^[A-Z0-9][A-Z0-9.-]*\d[A-Z0-9.-]*\/[A-Z0-9]{1,2}$/.test(s);
    if (!s || slash || /\bor\b|equiv|series|optional|select|custom|或|可选|cylinder|\bcyl\b|stroke|cool|diesel|gasoline|petrol|\bgas\b|turbo|in-?line|vertical/i.test(s)) return null;
    const words = s.split(/[\s,，]+/).filter(Boolean);
    // Letter-only words before the code. No make among them: all are passed over as before ("SGC 420" stays no code:
    // westinpower's controller). With a make (bang-doc-ma-hang, điều phối 21/11/2026), words after the last make are still
    // passed over when they cannot be part of a code: the second word of a two-word make ("Volvo Penta", "Leroy Somer"),
    // a common word ("Engine", "Model", "Heavy Industries", V_GENERIC), a word in lower / mixed case ("Shanghai") or with no
    // letter ("-", "&"). The first ALL-CAPS word left stays with the code only when the code after it starts with a digit
    // ("Kohler KDI 2504M" → "KDI 2504M", "Leroy Somer LSA 46.3", "Kubota V 2203"); before a code that starts with a letter it
    // is a series / company word and goes ("FPT NEF N67TM4" → "N67TM4", "Mitsubishi SME S6R2-PTAA-C" → "S6R2-PTAA-C").
    let run = 0, last = 0;
    while (run < words.length - 1 && /^[a-z&.-]+$/i.test(words[run])) {
      if (brandIn(words[run], V_CODE_BRANDS).length) last = run + 1;
      run++;
    }
    let i = last || run;
    if (last) while (i < run && (V_MAKE_TAIL.test(words[i]) || V_GENERIC.test(words[i]) || V_MAKER_ALIAS.test(words[i]) || V_PLACE.test(words[i]) || brandIn(words[i], V_CODE_BRANDS).length || /[a-z]/.test(words[i]) || !/[A-Z]/.test(words[i]) || !/^\d/.test(words[run]))) i++;
    const code = words.slice(i).join(" ");
    // `isCode` reads a trailing "<digit>CC" as a displacement in cc ("2500cc"), so Doosan's DP222CC / DP054CC / DP086CC were no code there (since catalog-3-loi `isCode`
    // has the narrow exception DOOSAN_DP, horizontal tables read them too). In a vertical
    // sheet the Model cell is a code: a cell of two letters, three digits and CC is read by its letters before the last C.
    return vIsCode(code) ? { code, brand: words.slice(0, i).join(" ") } : null;
  }
  // The figures of one output cell: [{ kW?, kVA? }] or null when not read.
  function verticalPower(label, vals, decComma) {
    const fnum = (x) => (/^\d{1,3}(,\d{3})+$/.test(x) ? (decComma ? NaN : +x.replace(/,/g, "")) : +String(x).replace(",", "."));
    const U = (u) => (/^kva$/i.test(u) ? "kVA" : "kW");
    const unitCells = vals.filter((x) => /^(kva|kw)$/i.test(x)), figs = vals.filter((x) => !/^(kva|kw|kva\s*[/(]\s*kw\)?|kw\s*[/(]\s*kva\)?)$/i.test(x));
    if (figs.length !== 1) return null;
    const v = figs[0].replace(/\s+/g, " ").trim(), got = {};
    const withUnit = [...v.matchAll(/(\d+(?:[.,]\d+)?)\s*(kva|kw)(?![a-z])/gi)];
    if (withUnit.length && v.replace(/(\d+(?:[.,]\d+)?)\s*(kva|kw)(?![a-z])/gi, "").replace(/[\s,/，、]+/g, "") === "") {
      for (const m of withUnit) { const u = U(m[2]), f = fnum(m[1]); if (got[u] != null || !(f > 0)) return null; got[u] = f; }
      return got;
    }
    // Units in the order of a unit cell or the label ("kVA/kw | 200/160", "(kW/kVA) | 16/20", "kVA (kW) | 11.2 (11.2)").
    const order = (unitCells.length === 1 ? unitCells[0] : "") || ((vals.find((x) => /^kva\s*[/(]\s*kw\)?$|^kw\s*[/(]\s*kva\)?$/i.test(x)) || "")) || ((label.match(/(kva|kw)\s*[/(]\s*(kva|kw)/i) || [])[0] || "");
    const two = v.match(/^(\d+(?:[.,]\d+)?)\s*(?:\/|\(\s*)(\d+(?:[.,]\d+)?)\s*\)?$/);
    const ord = order.match(/(kva|kw)\s*[/(]\s*(kva|kw)/i);
    if (two && ord && U(ord[1]) !== U(ord[2])) { const a = fnum(two[1]), b = fnum(two[2]); if (!(a > 0 && b > 0)) return null; return { [U(ord[1])]: a, [U(ord[2])]: b }; }
    const one = v.match(/^(\d+(?:[.,]\d+)?)$/);
    const units = new Set([...unitCells, ...(label.match(/\b(kva|kw)\b/gi) || [])].map(U));
    if (one && units.size === 1) { const f = fnum(one[1]); return f > 0 ? { [[...units][0]]: f } : null; }
    return null;
  }
  // The alternator line of a sheet that only its product line read (o-alternator-doc, Khoa 24/11/2026: "sửa bộ đọc cho dạng ô
  // này"). A one-model datasheet whose header is one title cell and whose lines are "LABEL:" then the value on the next line
  // ("ALTERNATOR:" / "Linz PRO18S C/4", energy-gruppi n2001–2012) or "Label: value" on one line ("Alternator Model: Stamford
  // S6L1D-H41", fudiankang-hunan n2001–2009) is no label table (isLabelTable / sectionSheet) and its rows give no record; the
  // engine came only from the product line (fromLine), with no alternator. Conditions, all of them:
  //   - the table's records so far are exactly one: the fromLine engine (any other reading of the table is left as it is);
  //   - lines with no "|" only; the label is an alternator's (V_ALT: "Alternator", "Alternator Model", "发电机型号"…);
  //   - the value STARTS with a make of ALT_CELL_BRANDS, then a space, then one code (isCode; its first word has a digit);
  //     no choice ("or", "equivalent", ","), no second make, no engine make. The make is the one the cell writes ("dòng
  //     bảng"), never guessed from the code;
  //   - exactly one such line in the table (two: nothing, noted). A make with no code ("Mecc Alte", n2013): nothing, noted.
  // The alternator record takes the engine record's genset, power and frequency (the sheet is one set), its own value line as
  // `line` / `row`; the engine record's `other` becomes the code (as a table row gives both).
  const LA_CHOICE = /\bor\b|equiv|oder|optional|[,，、;；]/i;
  function labelAltCell(v) {
    const s = String(v || "").trim(), hit = ALT_CELL_BRANDS.map(([re, name]) => [s.match(re), name]).find(([m]) => m && m.index === 0);
    if (!hit) return null;
    const after = s.slice(hit[0][0].length);
    if (!/^\s/.test(after)) return null; // "Stamford/SURIRELLA 274K" (plus-power): no make-then-code cell
    let rest = after.trim();
    const tail = rest.match(/^(\S+)\s+/);
    if (tail && V_MAKE_TAIL.test(tail[1])) rest = rest.slice(tail[0].length);
    if (!rest) return { make: hit[1], code: null };
    const ok = /^\S*\d/.test(rest) && isCode(rest) && !LA_CHOICE.test(rest) && !brandIn(rest, ALT_CELL_BRANDS).length && !brandIn(rest, ENGINE_BRANDS).length;
    return { make: hit[1], code: ok ? rest : null };
  }
  function labelAltLines(s, already, note) {
    const add = [];
    (s.specTables || []).forEach((t, ti) => {
      const mine = already.filter((o) => o.table === ti);
      if (mine.length !== 1 || mine[0].kind !== "engine" || !mine[0].fromLine) return;
      const rows = t.rows || [], found = [];
      rows.forEach((l, ri) => {
        const x = String(l);
        if (x.includes("|")) return;
        const m = x.match(/^\s*([^:：]{2,40})[:：]\s*(.*)$/);
        if (!m || !V_ALT.test(m[1].trim())) return;
        if (m[2].trim()) { found.push({ ri, value: m[2].trim() }); return; }
        const nx = rows[ri + 1];
        if (nx != null && !String(nx).includes("|") && !/[:：]\s*$/.test(String(nx))) found.push({ ri: ri + 1, value: String(nx).trim() });
      });
      const got = found.map((f) => ({ ...f, cell: labelAltCell(f.value) })).filter((f) => f.cell);
      if (!got.length) return;
      if (got.length > 1) { note(t, ti, null, "bảng dọc: hai dòng đầu phát", got.map((f) => f.value).join(" ¦ ")); return; }
      const [{ ri, cell }] = got, e = mine[0];
      if (!cell.code) { note(t, ti, ri, "ô đầu phát ghi hãng nhưng không ghi được một mã", rows[ri]); return; }
      const makes = [];
      addMake(makes, cell.make, "dòng bảng");
      if (!e.other) e.other = cell.code;
      add.push({ supplierId: s.id, n: t.n, table: ti, title: String(t.title || ""), row: ri, line: rows[ri], genset: e.genset, power: e.power, freq: e.freq, header: t.header || [], specs: [], kind: "alternator", model: cell.code, makes, other: e.model });
    });
    return add;
  }
  function verticalRecords(s, already, note) {
    const out = [], tables = s.specTables || [];
    tables.forEach((t, ti) => {
      if (!(t.rows || []).length || already.some((o) => o.table === ti)) return;
      if (GENSET_TABLES.some((x) => x.supplierId === s.id && x.n.includes(t.n))) return;
      const lines = [...(t.header || []), ...t.rows];
      const cols = columnSheets(lines);
      if (cols) {
        let src = { header: t.header || [], rows: t.rows };
        // The engine table right after it (koten), when the genset sheet has no engine line of its own.
        const nx = tables[ti + 1], nl = nx && +nx.n === +t.n ? [...(nx.header || []), ...nx.rows] : [];
        const nc = nl.length ? cellsOf(nl[0]) : [];
        if (nc.length === cols.length + 1 && V_ENGINE.test(nc[0]) && /model/i.test(nc[0]) && !cols.some((col) => col.some((l) => V_ENGINE.test(cellsOf(l)[0] || "")))) {
          const ec = columnSheets([`| Model | ${nc.slice(1).join(" | ")}`, ...nl.slice(1)]);
          const agree = ec && cols.every((col, j) => { const a = colHz(col), b = colHz(ec[j]); return a != null && a === b; });
          if (!agree) note(t, ti, null, "bảng cột: bảng động cơ liền sau không khớp tần số / tốc độ từng cột, không ghép", nl[0]);
          // Only the engine's code: the engine table's own figures are its own records' (that table is read the common way), and a
          // figure of the record must stand in the record's table (spec-standard points at `table`).
          else { cols.forEach((col, j) => col.push("| Engine", `| Model | ${nc[j + 1]}`)); src = { header: t.header || [], rows: [...t.rows, ...nl] }; }
        }
        cols.forEach((col, j) => out.push(...(verticalSheet(s, t, ti, col, (reason, detail) => note(t, ti, null, `bảng cột (cột ${j + 1}): ${reason}`, detail), { column: j, src }) || [])));
        return;
      }
      out.push(...(verticalSheet(s, t, ti, lines, (reason, detail) => note(t, ti, null, "bảng dọc: " + reason, detail)) || []));
    });
    return out;
  }
  function verticalSheet(s, t, ti, lines, say, col = null) {
    const out = [];
    {
      const cs = lines.map(verticalCells);
      // One genset down the page: most lines a label and at most two values; not the dotted "Manufacturer……CUMMINS" kind.
      if (cs.filter((c) => c.length <= 3).length < lines.length * 0.6 || lines.filter((l) => /[….]{5,}/.test(l)).length >= 3) return out;
      if (!cs.slice(0, 8).some((c) => V_MODEL.test(c[0]) && c.slice(1).some((x) => vIsCode(x)))) return out;
      const decComma = lines.some((l) => /\d,\d{1,2}(?![\d,])/.test(l));
      const models = new Map(), engines = new Map(), alts = new Map(), levels = { prime: [], standby: [] }, specs = [];
      let part = null, partSeen = false, engBrand = null, multi = null, ratingCols = null, pendBore = null;
      cs.forEach((c, li) => {
        if (c.length === 1) { const h = headingOf(c[0]); if (h !== undefined && h !== "keep") { part = h; if (h) partSeen = true; } return; }
        const label = c[0], vals = c.slice(1).filter(Boolean);
        if (!label || !vals.length) return;
        // A rating table across ("| Voltage, Frequency | Prime | Standby" then "| 400V, 50 Hz | 680 kVA / 544 kW | 750 kVA / 600 kW"): the
        // header names a level per column, the row under it gives that level's output (Powerpack). Only before any part heading.
        if (!partSeen && /^voltage/i.test(label) && vals.length >= 2 && vals.every((x) => PRIME_RATE.test(x) !== STANDBY.test(x))) { ratingCols = vals.map((x) => (PRIME_RATE.test(x) ? "prime" : "standby")); return; }
        if (ratingCols && !partSeen && /^\d{3}\s*V\b/i.test(label) && vals.length === ratingCols.length) {
          vals.forEach((x, i) => { const p = verticalPower(ratingCols[i], [x], decComma); if (!p) say("công suất có nhãn mức nhưng không đọc được số / đơn vị", lines[li]); else levels[ratingCols[i]].push({ p, line: lines[li] }); });
          return;
        }
        // "| Bore | mm | 150" then "| Stroke | mm | 185": one figure "150 × 185" (the catalog's `bore` is bore × stroke); a Stroke with no Bore line above it reads as before.
        if (part === "engine" && /^(bore|stroke)$/i.test(label)) {
          const sv = vals.filter((x) => !UNIT_CELL.test(x)), val = sv.length === 1 ? specVal(sv[0]) : null;
          if (/^bore$/i.test(label)) { pendBore = val && /^\d+(\.\d+)?$/.test(String(val)) ? val : null; if (pendBore) return; }
          else if (pendBore && val && /^\d+(\.\d+)?$/.test(String(val))) { const both = `${pendBore} × ${val}`; pendBore = null; if (specFits("bore", both)) { specs.push({ key: "bore", label: "Bore × Stroke", value: both }); return; } }
        }
        // "| Speed / Frequency | RPM / Hz. | 1500/50": two units, two figures, in order: the engine speed is the first ("1500 rpm").
        if (part === "engine" && /^speed\b/i.test(label) && vals.length === 2 && /^rpm\s*\/\s*hz\.?$/i.test(vals[0]) && /^\d{3,4}\s*\/\s*\d{2}$/.test(vals[1])) { specs.push({ key: "speed", label, value: vals[1].split("/")[0].trim() + " rpm" }); return; }
        const codes = vals.map(verticalCode).filter(Boolean);
        if (V_MODEL.test(label) && !V_ENGINE.test(label)) {
          if (codes.length > 1) { multi = lines[li]; return; }
          if (!codes.length) return;
          const to = part === "engine" ? engines : part === "alternator" ? alts : models;
          to.set(keyOf(codes[0].code), codes[0]);
          return;
        }
        // "| Engine | Specifications", "| ALTERNATOR | Specification": a heading written in two cells.
        if (V_ENGINE.test(label)) { partSeen = true; if (codes.length === 1) engines.set(keyOf(codes[0].code), codes[0]); else if (!/\d/.test(vals.join(" "))) part = "engine"; return; }
        if (V_ALT.test(label)) { partSeen = true; if (codes.length === 1) alts.set(keyOf(codes[0].code), codes[0]); else if (!/\d/.test(vals.join(" "))) part = "alternator"; return; }
        if (part === "engine" && V_BRAND.test(label)) { engBrand = vals[0]; return; }
        if (/^engine\s*(brand|make|manufacturer)$/i.test(label)) { engBrand = vals[0]; return; }
        const lv = PRIME_RATE.test(label) ? "prime" : STANDBY.test(label) ? "standby" : null;
        if (lv && !(PRIME_RATE.test(label) && STANDBY.test(label)) && !V_NOTPOW.test(label)) {
          if (part || partSeen) return; // an output in the engine's or the alternator's part is theirs
          const p = verticalPower(label, vals, decComma);
          if (!p) { say("công suất có nhãn mức nhưng không đọc được số / đơn vị", lines[li]); return; }
          levels[lv].push({ p, line: lines[li] });
          return;
        }
        const sk = specKey(label);
        if (!sk) return;
        const scope = SPEC[sk].scope;
        if (part === "alternator" ? scope !== "alternator" : part === "engine" ? scope === "alternator" : false) return;
        const sv = vals.filter((x) => !UNIT_CELL.test(x) && !V_UNIT_MORE.test(x)), val = specVal(sv[0]);
        // A unit cell only V_UNIT_MORE knows ("| Displacement | lt | 19,6") goes back after the figure ("19,6 lt"), so the figure keeps its unit.
        const mu = vals.filter((x) => V_UNIT_MORE.test(x) && !UNIT_CELL.test(x));
        const withUnit = val && mu.length === 1 && /^\d+(?:[.,]\d+)?$/.test(val) ? `${val} ${mu[0].replace(/^ltr?(?=\/|$)/i, "L")}` : null; // "lt" is the Turkish litre mark: "lt/h" is written L/h (same unit, no conversion)
        const value = withUnit && specFits(sk, withUnit) ? withUnit : val; // a key whose pattern does not take a unit (disp) keeps the bare figure
        // A table across (buoc-3-l1): "| Fuel Tank Capacity | 8hrs | 8hrs" (koten) is a running time, not a capacity: left out.
        if (col && sk === "tank" && /^\d+(?:\.\d+)?\s*(h|hrs?|hours?)$/i.test(String(value || ""))) { say("dung tích bồn ghi bằng giờ chạy, không đọc", lines[li]); return; }
        if (sv.length === 1 && value && specFits(sk, value)) specs.push({ key: sk, label, value });
      });
      const base = { supplierId: s.id, n: t.n, table: ti, title: String(t.title || "") };
      if (multi) { say("một dòng Model ghi hai mã: trang nhiều sản phẩm", multi); return; }
      // No genset model line but an engine part heading (Powerpack: the page names the genset only in its title, "Baudouin PG750-B 750 kVA
      // Diesel Generator | Powerpack Generator"): the one code of the title that is not the engine's or the alternator's is the genset.
      if (!models.size && partSeen && engines.size === 1) {
        const tcodes = [...new Set(String(t.title || "").split(/\s[|–-]\s|\|/)[0].split(/\s+/).filter((w) => /\d/.test(w) && /[a-z]/i.test(w) && isCode(w)).map(keyOf))].filter((k) => !engines.has(k) && !alts.has(k));
        if (tcodes.length === 1) { const w = String(t.title || "").split(/\s[|–-]\s|\|/)[0].split(/\s+/).find((x) => keyOf(x) === tcodes[0]); models.set(tcodes[0], { code: w, brand: "" }); }
      }
      if (models.size !== 1) { say(models.size ? "bảng ghi từ hai model tổ máy trở lên" : "không có model tổ máy", [...models.values()].map((x) => x.code).join(", ")); return; }
      const [gk, g] = [...models][0];
      if (engines.size !== 1) { say(engines.size ? "bảng ghi hai mã động cơ" : "không có mã động cơ", [...engines.values()].map((x) => x.code).join(", ")); return; }
      const [ek, e] = [...engines][0];
      const a = alts.size === 1 ? [...alts.values()][0] : null;
      if (ALT_CODE.test(g.code) || DOOSAN_P.test(g.code) || FRAME_ALT.test(g.code) || gk === ek || (a && gk === keyOf(a.code)) || V_PART_MODELS.includes(gk)) { say("model tổ máy trùng / giống mã động cơ hoặc đầu phát", g.code); return; }
      const power = {};
      for (const lv of ["prime", "standby"]) {
        const got = levels[lv];
        if (!got.length) continue;
        const same = got.every((x) => JSON.stringify(x.p) === JSON.stringify(got[0].p));
        if (!same) { say(`công suất ${lv} ghi hai lần khác số`, got.map((x) => x.line).join(" ¦ ")); continue; }
        const p = got[0].p;
        if (p.kW != null && p.kVA != null) { const f = fitPair(p.kVA, p.kW); if (!f || f.kVA !== p.kVA) { say(`kW / kVA ${lv} không khớp một tổ máy`, got[0].line); continue; } }
        power[lv] = p;
      }
      if (power.prime && power.standby && ["kW", "kVA"].some((u) => power.prime[u] != null && power.standby[u] != null && power.prime[u] > power.standby[u])) {
        say("prime lớn hơn standby", JSON.stringify(power)); delete power.prime; delete power.standby;
      }
      if (!power.prime && !power.standby) { say("không có công suất prime / standby ghi rõ ở phần tổ máy", g.code); return; }
      const seen = new Map();
      for (const x of specs) { const k = x.key; if (!seen.has(k)) seen.set(k, x); else if (seen.get(k) && seen.get(k).value !== x.value) { say("thông số ghi hai lần khác số", `${k}: ${seen.get(k).value} / ${x.value}`); seen.set(k, null); } }
      const sp = saneSpecs([...seen.values()].filter(Boolean), power, (x) => say("số vô lý so với công suất", `${x.key}=${x.value}`));
      const freq = freqIn(lines.join(" "), true);
      const titleHead = base.title.split(/\s[|–-]\s|\|/)[0];
      const makesOf = (code, list, brandCell) => {
        const ms = [], cell = brandIn(code.brand, list), b = brandIn(brandCell || "", list), ttl = brandIn(titleHead, list);
        if (cell.length === 1) addMake(ms, cell[0], "dòng bảng");
        else if (b.length === 1) addMake(ms, b[0], "dòng bảng");
        else if (b.length === 2 && b.includes("Doosan") && b.includes("Hyundai")) addMake(ms, "Doosan", "dòng bảng"); // "HYUNDAI DOOSAN" is one maker (SAME_MAKER); the catalog names it Doosan
        else if (ttl.length === 1) addMake(ms, ttl[0], "tên trang");
        return ms;
      };
      // A column of a table across (columnSheets) keeps the table's own lines (word for word) and says which column it is.
      const common = { ...base, genset: g.code, power, freq, specs: sp, lines: col ? col.src : { header: t.header || [], rows: t.rows }, sheet: "bảng dọc", ...(col ? { column: col.column } : {}) };
      out.push({ ...common, kind: "engine", model: e.code, makes: makesOf(e, ENGINE_BRANDS, engBrand), other: a ? a.code : null, specs: sp.filter((x) => SPEC[x.key].scope !== "alternator") });
      if (a && !ALT_PREFIX.test(a.code)) out.push({ ...common, kind: "alternator", model: a.code, makes: makesOf(a, ALT_BRANDS, null), other: e.code, specs: sp.filter((x) => SPEC[x.key].scope !== "engine") });
    }
    return out;
  }
  // Models across, one per column (buoc-3-l1, họ L1 of buoc-3-bo-cuc-chua-doc.md: "| Model | KW38D5 | KW45D6", then "| Frequency |
  // 50Hz | 60Hz", "| Prime Power | 30kW/38kVA | 36kW/45kVA"): verticalRecords splits the table into one "label | value" sheet per
  // column, each read by the one-genset rules of verticalSheet (genset model, ONE engine code, prime / standby with the level in the
  // label, specs by label). Recognised only when ALL of these hold, else the table is left as before:
  //   - a "Model" line (V_MODEL label, a part heading like "Genset Specification" may stand before it) within the first 8 lines whose
  //     value cells are k >= 2 codes, all different, nothing after them;
  //   - each other line is read only when its value cells are exactly the last k cells (label cells before them: words, a unit
  //     cell, a part heading; never a figure) or, for an output, 2k cells that pair up as one "kW" cell and one "kVA" cell per
  //     column, each with its unit written in the cell ("| Prime Power | 32kW | 40kVA | 36kW | 45kVA"). A line with another count
  //     of cells (a value written once for all columns, "| Phase | single/three |", "| Engine Specification | Engine Brand | YTO")
  //     gives nothing but its part heading: which columns it is meant for is not written. A line whose value is in the first
  //     column only (a merged cell) gives nothing either;
  //   - a column whose cell is empty gets no line.
  // A genset sheet with no engine line, followed in the SAME source by a table that starts "| Engine Model | c1 | … | ck" (koten:
  // the page's engine table, cut off by the crawler) takes its engine code from that table, only when the engine table's speed line
  // agrees with the genset table's frequency line column by column (1500 / 3000 rpm ↔ 50 Hz, 1800 / 3600 rpm ↔ 60 Hz).
  // (Placed after verticalSheet, not before verticalRecords, so as not to touch the lines PR #1207 adds there.)
  const C_KW = /^\d+(?:[.,]\d+)?\s*kw$/i, C_KVA = /^\d+(?:[.,]\d+)?\s*kva$/i;
  const cLabelCell = (x) => !x || UNIT_CELL.test(x) || V_UNIT_MORE.test(x) || (/[a-z一-鿿]/i.test(x) && !/^[\d.,\s]/.test(x));
  function columnSheets(lines) {
    const cs = lines.map(cellsOf);
    let k = 0, mi = -1;
    for (let i = 0; i < Math.min(8, cs.length) && mi < 0; i++) {
      const c = cs[i];
      for (let p = 1; p <= Math.min(3, c.length - 2); p++) {
        const vals = c.slice(p), lab = c.slice(0, p).filter(Boolean);
        if (vals.length < 2 || !lab.length || !V_MODEL.test(lab[lab.length - 1].replace(/[:：\s]+$/, "")) || V_ENGINE.test(lab[lab.length - 1])) continue;
        if (lab.slice(0, -1).some((x) => headingOf(x) === undefined)) continue;
        const codes = vals.map(verticalCode);
        if (codes.some((x) => !x || x.brand) || new Set(codes.map((x) => keyOf(x.code))).size !== vals.length) continue;
        k = vals.length; mi = i; break;
      }
    }
    if (mi < 0) return null;
    const cols = Array.from({ length: k }, () => []);
    const head = (h) => { for (const col of cols) col.push(`| ${h}`); };
    cs.forEach((c0) => {
      let c = c0;
      if (c.length === 1) { if (headingOf(c[0]) !== undefined && headingOf(c[0]) !== "keep") head(c[0]); return; }
      // A part heading in the first cell ("| Engine Specification | Model | …", "| Alternator Specification | Alternator Brand | …").
      const h = headingOf(c[0]);
      // Only when the next cell is a label too ("| Engine Specification | Engine Brand | YTO": heading, label, ONE value) or the cells
      // after it are still a label and k values: "| Engine | KTA50-G16A | 4016TAG1A" is a label line.
      const labelish = (x) => !!x && !/^\d/.test(x) && !verticalCode(x) && (V_BRAND.test(x) || V_MODEL.test(x) || V_ENGINE.test(x) || V_ALT.test(x) || PRIME_RATE.test(x) || STANDBY.test(x) || !!specKey(x));
      // The next cell must be a label itself: "| 机组型号 | | KPFD40 | …" is a model line ("机组" reads as a heading word).
      const nextLabel = !!c[1] && /[a-z一-鿿]/i.test(c[1]) && !/^\d/.test(c[1]) && !verticalCode(c[1]);
      if (h !== undefined && h !== "keep" && nextLabel && (c.length > k + 1 || labelish(c[1]))) { head(c[0]); c = c.slice(1); if (c.length < k + 1) return; }
      let vals = null, lab = null;
      const n = c.length;
      if (n >= 2 * k + 1) {
        const tail = c.slice(n - 2 * k), pairs = [];
        for (let j = 0; j < k; j++) { const a = tail[2 * j], b = tail[2 * j + 1]; if ((C_KW.test(a) && C_KVA.test(b)) || (C_KVA.test(a) && C_KW.test(b))) pairs.push(`${a} / ${b}`); }
        if (pairs.length === k) { vals = pairs; lab = c.slice(0, n - 2 * k); }
      }
      if (!vals && n >= k + 1) { vals = c.slice(n - k); lab = c.slice(0, n - k); }
      if (!vals || !lab.some(Boolean) || !lab.every(cLabelCell)) return;
      if (vals.slice(1).every((x) => !x) && vals[0]) return; // one value written for all columns (a merged cell)
      vals.forEach((v, j) => { if (v) cols[j].push(`| ${lab.filter(Boolean).join(" | ")} | ${v}`); });
    });
    return cols;
  }
  // Column j's frequency (50 / 60) from a "Frequency" line, or from a speed line in rpm; null when not written that way.
  const colHz = (col) => {
    for (const l of col) {
      const c = cellsOf(l);
      if (/frequen|频率/i.test(c[0] || "")) { const m = c.slice(1).join(" ").match(/^(50|60)\s*hz$/i); if (m) return +m[1]; }
      if (/speed|转速/i.test(c[0] || "")) { const m = c.slice(1).join(" ").match(/^(1500|1800|3000|3600)\s*(rpm|r\/min)$/i); if (m) return /^(1500|3000)$/.test(m[1]) ? 50 : 60; }
    }
    return null;
  };
  // Engine lines of label sheets, an explicit list (S9 cc-129, Khoa 22/11/2026: read the 129 displacement cells written in cc that
  // gave no figure; not a rule). Each entry names the table by supplier + n and its lines WORD FOR WORD (a re-crawl that changes
  // one lapses the entry, noted): `engine` = [line, code]: the line names the ENGINE role ("Engine Type", "ENGINE MODEL") and the
  // code is the part of its value cell that is the model; `make` = the line whose value cell writes the make (true: the engine
  // line; none: no make); `specs` = [key, line, value]: the value is the part of the line's value cell taken, the label is the
  // line's first cell. The table's own engine record of that model gets the figures it lacks (victory n123, winco n1002 / n1003);
  // none → a new engine record, no genset, no power (as ENGINE_TABLES: not a candidate; endress writes "Continuous Power" only,
  // gillette / winco n1001 are read for the engine's figures, the set's line is not touched).
  //   endress n129 / n130 / n137: "Engine Type | Yanmar - 3TNV80-FPGE" (no "Model" line, so verticalRecords skips the sheet), "Displacement [ccm]".
  //   gillette n101–n105: "ENGINE MODEL (WARRANTY) | HONDA GX390 O.H.V. (3 YEARS)" is no code for isCode; the set's "GENERATOR MODEL"
  //     line was read as an alternator before this list (not changed here). "1 CYLINDER, 23.7 CU. IN. (390 CC)": the value taken is
  //     "23.7 CU. IN. (390 CC)", read by spec-norm only when the two figures are one displacement (see spec-norm `disp`).
  //   victory n123: "Displacement (cc) | 418" of a table read row by row (not a label sheet), so the figure was never its engine's.
  //     n124 is NOT listed: it writes 418 for LT420 where victory's own n131 writes 420 (418 is n123's LA186FAG figure).
  //   winco n1001–n1003: "DISPLACEMENT/TYPE | 160 CC / OHV" (OHV is the valve type, not a second figure); n1001's model cell
  //     "GC160 OHC" is no code for isCode (OHC: overhead cam), the code is "GC160", the make "ENGINE BRAND | HONDA".
  // A bare "Model | <code>" line (no engine role written) right over engine figures (Khoa 22/11/2026: "có cho ngoại lệ"), listed table
  // by table, only where the code is CHECKED as an engine's: the same code is already an engine key of ANOTHER supplier in cn/ (a make
  // written in the table would do too; none of these writes one, so `make` is left out):
  //   endress n123 / n135 "Model | 1103A-33TG2" (Perkins key of 83 suppliers on 2aa92830), n126 "F34TEVP01" (FPT, green-power n121), n145
  //   "4TNV98CT-IYE" (Yanmar, cgm / stephill / voltgent), n146 "4TNV98C-IYE" (Yanmar, cgm / voltgent); the lines under it are
  //   "Displacement [ccm]", "Engine output (PRP) [kW]", "RPM": the engine's. Only the displacement is read, as above.
  // Left out (cc-129-model-tro): endress n127 "3TNV88F-UGPGE", n128 "3TNV80F-NGPGE", n142 "4TNV98CT-IPGE", n143 "4TNV98C-IPGE" (no
  // supplier has the key, no make written: "TNV" is Yanmar only by a pattern, not by the table); bison n114 ("Model | 1E45F |
  // BS156F …": Bison's own codes, no other supplier has them, no engine make written), bison n1003 b34 (OCR "8S170"), slong n103 /
  // n108 / n116 / n144 (second "Model | SL460" / "GB1000": keys of slong itself only).
  const ENGINE_LINES = (() => {
    const EN = (n, code, disp) => ({ supplierId: "endress-stromerzeuger", n, engine: [`| Engine Type | Yanmar - ${code}`, code], make: true, specs: [["disp", `| Displacement [ccm] | ${disp}`, disp]] });
    const EM = (n, code, disp) => ({ supplierId: "endress-stromerzeuger", n, engine: [`| Model | ${code}`, code], specs: [["disp", `| Displacement [ccm] | ${disp}`, disp]], why: "Khoa 22/11/2026 (cc-129-model-tro)" });
    const GI = (n, line, code, disp) => ({ supplierId: "gillette-generators", n, engine: [line, code], make: true, specs: [["disp", `| ENGINE DISPLACEMENT | ${disp}`, disp.replace(/^\d CYLINDER, /, "")]] });
    const GX390 = "| ENGINE MODEL (WARRANTY) | HONDA GX390 O.H.V. (3 YEARS)", GX630 = "| ENGINE MODEL (WARRANTY) | HONDA GX630 V-TWIN O.H.V. (3 YEARS)";
    return [
      EN(129, "3TNV80-FPGE", "1267"), EN(130, "3TNM74F", "993"), EN(137, "2TNV70-APGE", "570"),
      EM(123, "1103A-33TG2", "3300"), EM(135, "1103A-33TG2", "3300"), EM(126, "F34TEVP01", "3400"), EM(145, "4TNV98CT-IYE", "3319"), EM(146, "4TNV98C-IYE", "3319"),
      GI(101, GX390, "GX390", "1 CYLINDER, 23.7 CU. IN. (390 CC)"), GI(102, GX390, "GX390", "1 CYLINDER, 23.7 CU. IN. (390 CC)"),
      GI(103, GX630, "GX630", "2 CYLINDER, 41.97 CU. IN. (688 CC)"), GI(104, GX630, "GX630", "2 CYLINDER, 41.97 CU. IN. (688 CC)"),
      GI(105, "| ENGINE MODEL | KOHLER KD440 EPA/CARB TIER IV CERT. & 3 YEAR LIMITED WARRANTY", "KD440", "1 CYLINDER, 26.9 CU. IN. (440 CC)"),
      { supplierId: "victory-generator", n: 123, engine: ["| Engine | Model | LA186FAG", "LA186FAG"], specs: [["disp", "| Displacement (cc) | 418", "418"]] },
      { supplierId: "winco", n: 1001, engine: ["| ENGINE MODEL | GC160 OHC", "GC160"], make: "| ENGINE BRAND | HONDA", specs: [["disp", "| DISPLACEMENT/TYPE | 160 CC / OHV", "160 CC"]] },
      { supplierId: "winco", n: 1002, engine: ["| ENGINE MODEL | GC160", "GC160"], specs: [["disp", "| DISPLACEMENT/TYPE | 160CC/ OHV", "160CC"]] },
      { supplierId: "winco", n: 1003, engine: ["| ENGINE MODEL | VANGUARD 3564", "VANGUARD 3564"], specs: [["disp", "| DISPLACEMENT/TYPE | 570CC/ OHV", "570CC"]] },
      // kingway n117 (Khoa 22/11/2026: "coi lại vụ kingway nếu data hợp lý thì lấy luôn", replaces the 21/11 refusal of S6-2): the
      // block "| Model | SC9D340D2" names no role, but the same page's other tables write "SDEC Engine Model : SC9D340D2" for the same
      // set KGD250B (n109 / n124 / n125 / n128), SC9D340D2 is the SDEC engine key of 60+ suppliers, and the block's figures fit:
      // 6 cylinders (25 suppliers), 114x144 (13 suppliers; 6 × π/4 × 114² × 144 = 8.82 L), 8.9 L (4 suppliers write 8.9, 12 write
      // 8.82: within 1 % of the geometry). `set`: the record takes the genset, power and frequency of the table's alternator record
      // of that model (the block's own set KGD250B, 250 kVA / 200 kW prime) and names it as `other`. No make (the table writes
      // none). NOT read: "Rated /Standby Power(KW) | 228/255" ("Rated" is no prime here; spec-norm reads the pair as ambiguous),
      // "Rated speed (RPM) | 1500/1800" (two speeds).
      { supplierId: "kingway-power", n: 117, engine: ["| Model | SC9D340D2", "SC9D340D2"], set: "Kingway KAI250", why: "Khoa 22/11/2026 (kingway-n117)",
        specs: [["cyl", "| Cylinder Number | 6", "6"], ["bore", "| Bore x Stroke (mm) | 114x144", "114x144"], ["disp", "| Displacement (L) | 8.9", "8.9"]] },
    ].map((x) => ({ why: "S9 cc-129, Khoa 22/11/2026", ...x }));
  })();
  // New records of ENGINE_LINES; the table's own engine record of the listed model gets its missing figures in place (`out`).
  function engineLines(s, out, note) {
    const add = [], tables = s.specTables || [];
    for (const x of ENGINE_LINES.filter((x) => x.supplierId === s.id)) {
      const [eLine, code] = x.engine, makeLine = typeof x.make === "string" ? x.make : x.make ? eLine : "";
      const lines = [eLine, ...(makeLine ? [makeLine] : []), ...x.specs.map((p) => p[1])];
      const ti = tables.findIndex((t) => t.n === x.n && lines.every((l) => (t.rows || []).includes(l)));
      if (ti < 0) {
        const tj = tables.findIndex((t) => t.n === x.n);
        note(tj >= 0 ? tables[tj] : { n: x.n, title: "" }, tj >= 0 ? tj : null, null, "dòng động cơ trong danh sách đổi chữ: không đọc", eLine);
        continue;
      }
      const t = tables[ti], value = (line) => cellsOf(line).slice(1).join(" | ");
      if (!value(eLine).includes(code)) { note(t, ti, null, "mã trong danh sách không có ở dòng động cơ: không đọc", eLine); continue; }
      const specs = [];
      for (const [key, line, v] of x.specs) {
        if (!value(line).includes(v)) { note(t, ti, null, "số trong danh sách không có ở dòng: không đọc", line); continue; }
        specs.push({ key, label: cellsOf(line)[0], value: v });
      }
      const i = out.findIndex((o) => o.table === ti && o.kind === "engine" && keyOf(o.model) === keyOf(code));
      if (i >= 0) {
        const o = out[i], more = specs.filter((p) => !(o.specs || []).some((q) => q.key === p.key));
        for (const p of specs) if (!more.includes(p)) note(t, ti, o.row ?? null, "bản ghi đã có thông số này: giữ số cũ", `${p.key}=${p.value}`);
        if (more.length) out[i] = { ...o, specs: [...(o.specs || []), ...more] };
        continue;
      }
      const mk = brandIn(makeLine, ENGINE_BRANDS), makes = [];
      if (mk.length === 1) addMake(makes, mk[0], "dòng bảng");
      // `set`: the genset of the table's alternator record of that model (none found → the entry lapses, noted).
      const g = x.set ? out.find((o) => o.table === ti && o.kind === "alternator" && o.model === x.set && o.genset) : null;
      if (x.set && !g) { note(t, ti, null, "tổ máy trong danh sách không còn bản ghi đầu phát: không đọc", x.set); continue; }
      add.push({ supplierId: s.id, n: t.n, table: ti, title: String(t.title || ""), row: t.rows.indexOf(eLine), line: eLine, header: t.header || [], kind: "engine", model: code,
        genset: g ? g.genset : null, power: g?.power ? JSON.parse(JSON.stringify(g.power)) : null, freq: g ? g.freq : null, specs, makes, other: g ? g.model : null, own: false });
    }
    return add;
  }
  // Genset models of vertical sheets that are an engine's or an alternator's code elsewhere in the catalog (bang-doc-1: the
  // test checks every vertical record against build(); a model found there goes on this list).
  const V_PART_MODELS = [];
  function listedEngineRows(s, already, note) {
    const lays = ENGINE_CELL_TABLES.filter((x) => x.supplierId === s.id), out = [];
    if (!lays.length) return out;
    const tables = s.specTables || [];
    for (const x of lays) for (const n of x.n) if (!tables.some((t) => t.n === n && String((t.header || [])[0] ?? "") === x.header)) {
      const ti = tables.findIndex((t) => t.n === n);
      note(ti >= 0 ? tables[ti] : { n, title: "" }, ti >= 0 ? ti : null, null, "bảng có mã động cơ trong danh sách đổi tiêu đề: không đọc", ti >= 0 ? (tables[ti].header || [])[0] : "không còn bảng nào của nguồn này");
    }
    const ownBrand = brandIn([s.names?.en, ...(s.names?.brands || [])].join(" "), ENGINE_BRANDS);
    tables.forEach((t, ti) => {
      const lay = lays.find((x) => x.n.includes(t.n) && String((t.header || [])[0] ?? "") === x.header);
      if (!lay) return;
      // The table read by the general way after all (a later change of isCode): it is not read twice.
      if (already.some((o) => o.n === t.n && o.table === ti)) { note(t, ti, null, "bảng có mã động cơ trong danh sách đã được đọc chung: bỏ danh sách", null); return; }
      const title = String(t.title || ""), headerText = (t.header || []).join(" ");
      const hEng = brandIn(headerText, ENGINE_BRANDS), tEng = brandIn(title.split(/\s[|–-]\s|\|/)[0], ENGINE_BRANDS);
      (t.rows || []).forEach((line, ri) => {
        const cells = cellsOf(line);
        if (!lay.cells.includes(cells.length)) { note(t, ti, ri, "dòng không ghi động cơ (bảng có mã động cơ trong danh sách): không đọc", line); return; }
        const genset = String(cells[lay.model] || "").trim(), cell = String(cells[lay.engine] || "").trim();
        const code = cell.replace(/\s*\([A-Z]\)$/, "");
        const lead = brandIn(code.split(/\s+/)[0], ENGINE_BRANDS);
        const model = lead.length === 1 && /\s/.test(code) ? code.replace(/^\S+\s+/, "") : code;
        if (!/\d/.test(model) || !/\d/.test(genset) || keyOf(model).length < 3) { note(t, ti, ri, "ô động cơ / model không đọc được (bảng có mã động cơ trong danh sách)", line); return; }
        const power = {};
        for (const lv of ["prime", "standby", "rated"]) for (const [u, i] of Object.entries(lay[lv] || {})) {
          const c = String(cells[i] ?? "").trim();
          if (/^(?:|[-–—/]+|n\.?a\.?)$/i.test(c)) continue;
          if (!/^\d+(?:\.\d+)?$/.test(c)) { note(t, ti, ri, `công suất ${lv} không đọc được: để trống`, c); continue; }
          (power[lv] ||= {})[u] = Number(c);
        }
        if (power.prime && power.standby && Object.keys(power.prime).some((u) => power.standby[u] != null && power.prime[u] > power.standby[u])) {
          note(t, ti, ri, "prime lớn hơn standby: để trống cả hai", line); delete power.prime; delete power.standby;
        }
        const specs = [];
        for (const [key, i, label] of lay.specs || []) {
          const v = specVal(cells[i]);
          if (!v || /^(?:[-–—/]+|n\.?a\.?)$/i.test(v)) continue;
          if (!specFits(key, v)) { note(t, ti, ri, "thông số không đúng dạng: để trống", `${key}=${v}`); continue; }
          specs.push({ key, label, value: v });
        }
        const makes = [], row = brandIn(line, ENGINE_BRANDS);
        if (row.length === 1) addMake(makes, row[0], "dòng bảng");
        else if (hEng.length === 1) addMake(makes, hEng[0], "tiêu đề cột");
        else if (tEng.length === 1) addMake(makes, tEng[0], "tên trang");
        else if (s.role === "engine_maker" && ownBrand.length === 1) addMake(makes, ownBrand[0], "hãng sản xuất");
        out.push({ supplierId: s.id, n: t.n, table: ti, title, row: ri, line, genset, power: Object.keys(power).length ? power : null, freq: lay.freq || null, header: t.header || [],
          specs: saneSpecs(specs, Object.keys(power).length ? power : null, (x) => note(t, ti, ri, "số vô lý so với công suất", `${x.key}=${x.value}`)), kind: "engine", model, makes, other: null, own: false });
      });
    });
    return out;
  }
  const numbersOf = (s) => (String(s).replace(/(\d),(\d)/g, "$1.$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
  // A table saved one cell per line (Tìm NCC from a page whose text puts each cell on its own line: AGG "Generator Model",
  // "ESP (kVA/kW)", "PRP (kVA/kW)", "Engine Model" over "AGG CU1250D5", "1250/1000", "1125/900", "KTA38G9"): one record,
  // as many lines as column titles, no cell bars, no runs of spaces (a pdftotext row), no "label: value".
  const cellPerLine = (t) => (t.header || []).length > 1 && t.rows.length === t.header.length
    && [...t.header, ...t.rows].every((l) => !/\||\s{2,}|[:：]/.test(String(l).trim()));
  // The ratings a table row gives for a product line of one power (min = max), read as powersIn reads a genset row:
  // two kVA / kW pairs are standby (larger) and prime (smaller), one pair takes the rating the header names. Kept only
  // when the line's own figure is among them in its unit, and under the rating the line gives (unspecified: any).
  // Returns { prime?, standby?, rated? } or null.
  function rowPowerOf(t, line, pw, models0) {
    if (!t || !pw || pw.min !== pw.max || !/^(kVA|kW)$/.test(pw.unit)) return null;
    // A row without cell bars (pdftotext "570   712   627    784 …") is read word by word.
    let cells = cellPerLine(t) ? t.rows : line != null ? cellsOf(line) : null;
    if (!cells) return null;
    if (cells.length === 1) cells = String(cells[0]).split(/\s{2,}|\s(?=\d)/).filter(Boolean);
    const head = `${(t.header || []).join(" ")} ${t.title || ""}`, p = powersIn(cells, head);
    if (!p) return null;
    // Two pairs are read as standby and prime only when the column titles name both ratings and the row (or the titles of a
    // one-model sheet) names this line's model: a row of several models ("(kVA) Standby 55 66 88 110", denyo) or of
    // engine kWm next to kWe ("11 12 10 11.1 8 10", lister-petter) would pair figures of different columns.
    if (p.standby && p.prime) {
      const models = (models0 || []).filter(isCode).map(keyOf);
      const named = cellPerLine(t) || models.some((k) => keyOf(`${line || ""}`).includes(k) || keyOf(head).includes(k));
      if (!(PRIME_RATE.test(head) && STANDBY.test(head) && named)) return null;
    }
    const hit = Object.entries(p).filter(([, v]) => v[pw.unit] === pw.min).map(([k]) => k);
    return hit.length && (pw.rating === "unspecified" || hit.includes(pw.rating)) ? p : null;
  }
  // The prime and standby figures of a one-model datasheet that gives each on its own labelled line ("Prime Power Rating |
  // 300 kVA / 240 kW", "Standby Power Rating | 330 kVA / 264 kW"; "Potenza PRP (kVA) | 500", "Potenza ESP (kVA) | 550";
  // "Prime output | 400kW/500kVA | Standby output | 440kW/550kVA"). A figure counts only with its unit written next to
  // it (or a "(kVA)" just before it) and after a rating word of its own cell or an earlier cell of the line. Only the
  // words prime/PRP/主用/常用/servicio principal and standby/ESP/LTP/备用/emergencia/secours: "continuous", "COP" and
  // "max power" are other ratings and stop the reading, as does a cell about the engine (gross kWm). Kept only when the
  // table names the line's model, each rating has one value per unit (a table of several models gives several),
  // standby is above prime by at most 30%, and the line's own figure is the one of its rating in its unit.
  const SHEET_PR = /prime|\bprp\b|常用|主用|servicio\s+principal/i;
  const SHEET_SB = /standby|stand[\s-]by|\besp\b|\bltp\b|备用|emergencia|secours/i;
  const SHEET_OTHER = /continuous|\bcop\b|\bmax(imum)?\s*power|持续|连续/i;
  const SHEET_ENG = /engine|gross|lorda|motor|发动机|柴油机|机械|mechanical|\bkwm\b/i;
  function sheetPowerOf(t, pw, models0) {
    if (!t || !pw || pw.min !== pw.max || !/^(kVA|kW)$/.test(pw.unit)) return null;
    const models = (models0 || []).filter(isCode).map(keyOf);
    const head = keyOf(`${t.title || ""} ${(t.header || []).join(" ")}`);
    if (!models.some((k) => head.includes(k))) return null;
    const got = { prime: { kVA: new Set(), kW: new Set() }, standby: { kVA: new Set(), kW: new Set() } };
    const TOK = /(prime|\bprp\b|常用|主用|servicio\s+principal)|(standby|stand[\s-]by|\besp\b|\bltp\b|备用|emergencia|secours)|(continuous|\bcop\b|\bmax(?:imum)?\s*power|持续|连续)|\(\s*(kva|kw)\s*\)|(\d+(?:[.,]\d+)?)\s*(kva|kwe|kw)(?![a-z])|(\d+(?:[.,]\d+)?)/gi;
    for (const line of [...(t.header || []), ...(t.rows || [])]) {
      // A line of one figure and one rating word after it, nothing else ("450 Kva Prime Power", cps AP450S): the word can
      // only name that figure.
      const lone = String(line).replace(/\|/g, " ").trim().match(/^(\d+(?:[.,]\d+)?)\s*(kva|kw)\s+(prime|standby)(?:\s+(?:power|output|rating))?$/i);
      if (lone) { got[lone[3].toLowerCase()][/kva/i.test(lone[2]) ? "kVA" : "kW"].add(Number(lone[1].replace(",", "."))); continue; }
      let rate = null, unit = null, postfix = false, fig = false;
      const figs = [];
      for (const c of cellsOf(line)) {
        if (SHEET_ENG.test(c)) { rate = null; unit = null; continue; }
        // A "(kVA)" title holds for the bare figures of the cells right after it: a row of several models ("Leistung ESP (kVA) |
        // 715 | 880 | …") then gives several figures and is left out; a cell of words ends it.
        if (!/^[\d.,\s]+$/.test(c)) unit = null;
        let end = -1;
        for (const m of String(c).matchAll(TOK)) {
          // A rating word right after a figure ("1100KW/1375KVA Prime, 1200KW/1500KVA Standby") names the figure before
          // it, which this reading would give to the next rating: the whole line is left out.
          if ((m[1] || m[2]) && end >= 0 && /^[\s,]*$/.test(String(c).slice(end, m.index))) postfix = true;
          // A second rating word with no figure since the first ("Prime/Standby Power") names neither.
          const word = m[1] ? "prime" : m[2] ? "standby" : null;
          if (word) { rate = rate && rate !== word && !fig ? "mixed" : word; unit = null; fig = false; }
          else if (m[3]) { rate = null; unit = null; }
          else if (m[4]) unit = /kva/i.test(m[4]) ? "kVA" : "kW";
          else {
            const v = Number((m[5] || m[7]).replace(",", ".")), u = m[6] ? (/kva/i.test(m[6]) ? "kVA" : "kW") : m[7] ? unit : null;
            if (u) { end = m.index + m[0].length; fig = true; }
            if (u && got[rate]) figs.push([rate, u, v]);
            // "Prime/Standby Power: 60/66": two rating words with no figure between them name no one figure.
            if (rate === "mixed") rate = null;
          }
        }
      }
      if (!postfix) for (const [k, u, v] of figs) got[k][u].add(v);
    }
    const out = {};
    for (const k of ["prime", "standby"]) {
      for (const u of ["kVA", "kW"]) {
        const vs = [...got[k][u]];
        if (vs.length > 1) return null;
        if (vs.length) (out[k] ||= {})[u] = vs[0];
      }
    }
    const pr = out.prime?.[pw.unit], sb = out.standby?.[pw.unit];
    if (!(pr > 0 && sb > 0) || !(sb > pr && sb <= pr * 1.3)) return null;
    if (pw.rating === "unspecified" ? pr !== pw.min && sb !== pw.min : out[pw.rating]?.[pw.unit] !== pw.min) return null;
    return out;
  }
  // The prime and standby figures of a row under column titles that name each rating ("kVA" over "Standby  Prime  Model
  // Engine", Cat "| 9.5 | 8.5 | DE9.5E3 | C1.1 |"): only when a title line has as many titles as the row has cells, so
  // each title sits over its cell, the row names the line's model, and the unit is the one the titles (or the cell)
  // give. Same checks on the figures as sheetPowerOf.
  function colPowerOf(t, line, pw, models0) {
    if (!t || line == null || !pw || pw.min !== pw.max || !/^(kVA|kW)$/.test(pw.unit)) return null;
    let cells = cellsOf(line);
    if (cells.length === 1) cells = String(cells[0]).trim().split(/\s{2,}/);
    const models = (models0 || []).filter(isCode).map(keyOf);
    if (!cells.some((c) => models.includes(keyOf(c)))) return null;
    const words = `${t.title || ""} ${(t.header || []).join(" ")}`;
    const tUnit = /kva/i.test(words) && !/\bkw/i.test(words) ? "kVA" : /\bkw/i.test(words) && !/kva/i.test(words) ? "kW" : null;
    for (const h of t.header || []) {
      const titles = String(h).trim().startsWith("|") ? cellsOf(h) : String(h).trim().split(/\s{2,}/);
      if (titles.length !== cells.length) continue;
      const at = (re, no) => titles.findIndex((x) => re.test(x) && !no.test(x) && !SHEET_OTHER.test(x) && !SHEET_ENG.test(x));
      const ip = at(SHEET_PR, SHEET_SB), is = at(SHEET_SB, SHEET_PR);
      if (ip < 0 || is < 0) continue;
      const val = (c) => { const u = /kva/i.test(c) ? "kVA" : /kw/i.test(c) ? "kW" : tUnit; return u === pw.unit ? num(c) : null; };
      const pr = val(cells[ip]), sb = val(cells[is]);
      if (!(pr > 0 && sb > 0) || !(sb > pr && sb <= pr * 1.3)) return null;
      const out = { prime: { [pw.unit]: pr }, standby: { [pw.unit]: sb } };
      if (pw.rating === "unspecified" ? pr !== pw.min && sb !== pw.min : out[pw.rating]?.[pw.unit] !== pw.min) return null;
      return out;
    }
    return null;
  }
  const splitCells = (l) => { const c = cellsOf(l); return c.length > 1 ? c : String(l).trim().split(/\s{2,}/); };
  const ratingOf = (x) => (SHEET_OTHER.test(x) || SHEET_ENG.test(x) ? null : SHEET_PR.test(x) && !SHEET_SB.test(x) ? "prime" : SHEET_SB.test(x) && !SHEET_PR.test(x) ? "standby" : null);
  const checked = (out, pw) => {
    const pr = out.prime?.[pw.unit], sb = out.standby?.[pw.unit];
    if (!(pr > 0 && sb > 0) || !(sb > pr && sb <= pr * 1.3)) return null;
    if (pw.rating === "unspecified" ? pr !== pw.min && sb !== pw.min : out[pw.rating]?.[pw.unit] !== pw.min) return null;
    return out;
  };
  // A table of several models side by side, one line per rating (airman "GENERATOR SPECIFICATIONS  SDG13LAX-8E1 …
  // SDG400S-8E1" over "PRIME POWER  12.5kVA / 10kW … 400kVA / 320kW"): the line's model is the j-th of the title line, and
  // its figures the j-th "kVA / kW" pair of a line whose label names one rating. Only when the title line is a label and
  // models only, and that line holds exactly one pair per model (a pair split off or missing would shift the columns).
  function acrossPowerOf(t, pw, models0) {
    if (!t || !pw || pw.min !== pw.max || !/^(kVA|kW)$/.test(pw.unit)) return null;
    const models = (models0 || []).filter(isCode).map(keyOf);
    for (const h of [...(t.header || []), ...(t.rows || [])]) {
      const cells = splitCells(h).slice(1);
      if (cells.length < 2 || !cells.every(isCode)) continue;
      // The model may head several columns (powerlink: one per voltage); they must all give the same pair, and a pair must
      // be a kVA / kW pair (powerlink VR200XS "220kVA / 9176kW" next to "220kVA / 176kW": a typo of the source, left out).
      const js = cells.map((c, i) => (models.includes(keyOf(c)) ? i : -1)).filter((i) => i >= 0);
      if (!js.length) continue;
      const got = {};
      for (const r of t.rows || []) {
        const lbl = String(r).replace(/^\s*\|?\s*/, "").split(/\d/)[0], k = ratingOf(lbl);
        if (!k) continue;
        const pairs = [...String(r).matchAll(/(\d+(?:\.\d+)?)\s*kva\s*\|?\s*\/\s*\|?\s*(\d+(?:\.\d+)?)\s*kw(?![a-z])/gi)];
        if (pairs.length !== cells.length) continue;
        for (const j of js) {
          const v = { kVA: Number(pairs[j][1]), kW: Number(pairs[j][2]) }, p = pairOf(v.kVA, v.kW);
          if (!p || p.kVA !== v.kVA || (got[k] && (got[k].kVA !== v.kVA || got[k].kW !== v.kW))) return null;
          got[k] = v;
        }
      }
      return checked(got, pw);
    }
    return null;
  }
  // One row per model and rating, the rating in the row's name, figures under "KVA | KW" titles of each frequency (powerco
  // "PCS65P (PRIME) | 1104A-44TG1 | 65 | 52 | 74 | 59.2" and "PCS65P (STANDBY) | … | 72 | 57.6 | 81 | 64.8" under "… | 50hz |
  // 480v | 60hz" and "Generating Set Model | Engine Model | KVA | KW | KVA | KW"). The pair is the column whose title line
  // has as many titles as the row has cells and whose frequency line names one frequency over it; the line's figure picks
  // the column, and the other rating is read in that same column.
  function namedRowsPowerOf(t, pw, models0) {
    if (!t || !pw || pw.min !== pw.max || !/^(kVA|kW)$/.test(pw.unit)) return null;
    const models = (models0 || []).filter(isCode).map(keyOf);
    const rows = {};
    for (const r of t.rows || []) {
      const cells = splitCells(r), k = ratingOf(cells[0] || "");
      if (!k || !models.includes(keyOf(String(cells[0]).replace(/\(?\s*(prime|standby|prp|esp)\s*\)?/i, "")))) continue;
      if (rows[k]) return null;
      rows[k] = cells;
    }
    if (!rows.prime || !rows.standby || rows.prime.length !== rows.standby.length) return null;
    const n = rows.prime.length, hs = (t.header || []).map(splitCells).filter((h) => h.length === n);
    const titles = hs.find((h) => h.some((x) => /^kva$/i.test(x))), freqs = hs.find((h) => h.some((x) => /^\d{2}\s*hz$/i.test(x)));
    if (!titles || !freqs) return null;
    const cols = [];
    for (let i = 0; i + 1 < n; i++) {
      if (!/^kva$/i.test(titles[i]) || !/^kw$/i.test(titles[i + 1])) continue;
      const hz = [freqs[i], freqs[i + 1]].filter((x) => /^\d{2}\s*hz$/i.test(x));
      if (hz.length === 1) cols.push(i);
    }
    const pick = (i) => ({ prime: { kVA: num(rows.prime[i]), kW: num(rows.prime[i + 1]) }, standby: { kVA: num(rows.standby[i]), kW: num(rows.standby[i + 1]) } });
    const hits = cols.map(pick).filter((o) => checked(o, pw));
    return hits.length === 1 ? hits[0] : null;
  }
  // The ratings shown for a supplier's product line of one power: the row of a table of its source holding that figure,
  // else the labelled prime and standby lines of a one-model datasheet of its source.
  function linePower(s, p) {
    const pw = p?.power;
    if (!pw || pw.min !== pw.max) return null;
    const ns = new Set([...(pw.src || []), ...(p.src || [])]), models = [p.series, ...(p.engineModels || [])];
    let one = null;
    for (const t of s?.specTables || []) {
      if (!ns.has(t.n)) continue;
      const rows = cellPerLine(t) ? [null] : t.rows.filter((r) => numbersOf(r).includes(pw.min));
      for (const r of rows) {
        const x = rowPowerOf(t, r, pw, models);
        if (x && Object.keys(x).length > 1) return x;
        one ||= x;
        const y = colPowerOf(t, r, pw, models);
        if (y) return y;
      }
    }
    for (const t of s?.specTables || []) {
      if (!ns.has(t.n)) continue;
      const x = sheetPowerOf(t, pw, models) || acrossPowerOf(t, pw, models) || namedRowsPowerOf(t, pw, models);
      if (x) return x;
    }
    return one;
  }

  // The make shown: the names given by the strongest kind of evidence (a cell of the row, a column title or the
  // maker itself before a page title, which on dealer sites often lists several brands).
  const RANK = { "dòng bảng": 3, "tiêu đề cột": 2, "hãng sản xuất": 2, "tên trang": 1, "tờ hãng": 1 };
  // Alternator codes with no make in any supplier row, whose make is the maker's OWN datasheet (Khoa duyệt 24/11/2026,
  // nghiem-thu/dau-phat-khong-hang-trung-ma.md). A closed list of one: not a rule over every maker sheet. The make is
  // given ONLY when the entry has none (never overrides a supplier's), as via "tờ hãng" (not "dòng bảng"), with the sheet as
  // source, so a page / the proposal never says the supplier wrote it.
  //   LVSI804W: meao-jiangsu lists the code with no make; the Stamford sheet stamford-avk-china n1068 titles it "LVSI804W"
  //   (its table: "LV 804 W | WDG 12 - Technical Data Sheet").
  const SHEET_MAKE = { LVSI804W: { name: "Stamford", supplierId: "stamford-avk-china", n: 1068 } };
  function makeOf(makes) {
    if (!makes.length) return null;
    const top = Math.max(...makes.map((m) => RANK[m.via] || 0));
    return [...new Set(makes.filter((m) => (RANK[m.via] || 0) === top).map((m) => m.name))].join(" / ");
  }
  // Names that are one engine maker, both right (Khoa 2026-11-16): Doosan Infracore, before that Daewoo, now HD Hyundai;
  // Weichai builds Deutz 226B (WP4 / WP6) and Baudouin under licence; Kofo builds the Ricardo-type 4105 / 6105; Xichai
  // (锡柴) is FAW's diesel works. Only these pairs; Weichai's two do not make Deutz / Baudouin one.
  const SAME_MAKER = [["Doosan", "Hyundai"], ["Doosan", "Daewoo"], ["Hyundai", "Daewoo"], ["Weichai", "Deutz"], ["Kofo", "Ricardo"], ["Baudouin", "Weichai"], ["FAWDE", "Xichai"]];
  const sameMaker = (a, b) => a === b || SAME_MAKER.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  // The makes an engine / alternator keeps (Khoa 2026-11-14 / 16), read from its rows:
  // 1. Only the names of the strongest kind of evidence (a row cell > a column title or the maker itself > a page
  //    title): a dealer page "Cummins Perkins Weichai generators" no longer adds Weichai to a Cummins row.
  // 2. Two names or more there that are not one maker (SAME_MAKER): the one that 3 suppliers or more give, 3 times or
  //    more as many as each other name, is kept (with the names that are the same maker as it); else no make
  //    ("chưa rõ hãng", not guessed). Returns { makes, conflict } (conflict: the names left out undecided, or null).
  function keptMakes(e) {
    if (!e.makes.length) return { makes: e.makes, conflict: null };
    const top = Math.max(...e.makes.map((m) => RANK[m.via] || 0));
    const best = e.makes.filter((m) => (RANK[m.via] || 0) === top), names = [...new Set(best.map((m) => m.name))];
    if (names.every((a) => names.every((b) => sameMaker(a, b)))) return { makes: best, conflict: null };
    const sups = new Map(names.map((n) => [n, new Set()]));
    for (const u of e.uses) for (const m of u.makes || []) if ((RANK[m.via] || 0) === top && sups.has(m.name)) sups.get(m.name).add(u.supplierId);
    const count = (n) => sups.get(n).size, lead = [...names].sort((a, b) => count(b) - count(a))[0];
    const win = count(lead) >= 3 && names.every((n) => sameMaker(lead, n) || count(lead) >= 3 * count(n));
    if (win) return { makes: best.filter((m) => sameMaker(lead, m.name)), conflict: null };
    return { makes: [], conflict: names.map((n) => ({ name: n, suppliers: count(n) })) };
  }
  // A trailing "*" / "†" / "×" is a footnote mark, not part of the model ("QSK19-G4*", tellhow "KTA50-G15×"), and an en / em
  // dash is a hyphen ("KTA50–G3", "4135D—1"): the model left alone stood apart from the same model of other suppliers and
  // missed the majority rule (catalog-b). "★" is dropped by tidyModel, where the supplier is known (MARK_KEEP). O/0 and I/1
  // are NOT merged.
  // "^" STAYS in the key (Khoa 21/11/2026 "tách ra", doc-ma-2): on Baudouin / Weichai codes (baifa, aosif, mecca, landtop,
  // Weichai's own sheets…). Baudouin's sheets (sources/baudouin/1015, 1017–1020) footnote it "^ Primarily for ESP applications",
  // so "X^" is not the same offer as X. The merge of catalog-b also brought
  // one supplier's wrong figures to the others' rows: aosif "8M33D1012E311^" 12V / 31,8 L against 8 cyl / 26,14 L.
  // Doosan P-engine only (DOOSAN_P: P126TI / P222LE…): the suffix "II" typed "11" or "Il" ("P126TI-11", "P222LE-11", "P126TI-Il")
  // is the same engine as "-II" (Khoa duyệt 20/11/2026). NFKC already makes "-Ⅰ" / "-Ⅱ" "-I" / "-II". "-1" / "-2" stay apart
  // ("P222LE-2", "P126TI-2" of huatai n108 are not "-II"); no other maker's code is touched.
  const DOOSAN_II = /^(P\d{3}(?:TI|LE))(?:11|IL)$/;
  const keyOf = (m) => String(m).normalize("NFKC").toUpperCase().replace(/[\s\-_.·–—]/g, "").replace(/[*†‡×]+$/, "").replace(DOOSAN_II, "$1II");
  const MARK_TAIL = /\s*[*＊†‡★☆×]+$/;
  // A mark a supplier's note gives a meaning that tells the model apart (catalog-b, not merged with the bare model): ettes-power
  // n146 "Models with mark of "★" means the engine made by Perkins China, other models are made in UK" (the place of
  // manufacture, which the row's own words do not say). Other suppliers' "★" (tellhow-power: "optional engines provided with
  // the national stage-III emission report") is only a note.
  const MARK_KEEP = { "ettes-power": "★" };
  // The model a row of a horizontal table names: footnote mark and a make written before it ("PERKINS 1103A-33G")
  // left out, only when what remains is still a model code. `keep`: a mark (MARK_KEEP) that stays at the end.
  const tidyModel = (cell, list, keep = "") => {
    const raw = String(cell || "").trim(), kept = keep && raw.endsWith(keep) ? keep : "";
    let s = raw.replace(MARK_TAIL, "").replace(/[–—]/g, "-");
    const m = s.match(/^(\S+)\s+(?:penta\s+)?(?=\S*\d)/i);
    if (m && brandIn(m[1], list).length && isCode(s.slice(m[0].length))) s = s.slice(m[0].length);
    else { const w = brandedCode(s, list); if (w) s = w; }
    return (list === ENGINE_BRANDS ? engineCode(s) : s) + kept;
  };
  // An engine cell with words or figures written next to the code (ma-dong-co-trung PR 1, Khoa 20/11/2026: one engine stood
  // under two keys and took two places of the top 30). Each part goes only when what remains is still a code; the row's own
  // line keeps every word (madeAt, makesFor read the line, not the model).
  //   the genset's power after the code: jet-power "YD385D/11KW", weiman "8M33D890E200/815/890KW", jinlongteng "(360KW)";
  //   a figure of the next cell run in: eastern-lion "WD129TAD23/1500" (speed), nenjo "4006-23TAG3A 1800", cgm-italia
  //     "1320 4012-46TAG2A" / "119,2 1106A-70TG1" (the kW cell before);
  //   the place of manufacture: kaihua "India 4006-23TAG2A" / "UK …", landtop "1103A-33G(India)", "(UK/EP)", "(USA/EU)",
  //     sr-genset "1104D-44TG2 EU", superwatt "S16R2-PTAW-C SME";
  //   a make or plant: "FAW CA6DL2-27D", "Mistubishi S16R-PTA2-C" (stone), "DCEC QSZ13-G10", "6ZTAA13-G2 (DCEC)", after the code
  //     ("QSK38-G5 cummins", superwatt), before a "/" (kc-generatorset "Chongkang/KTA38-G1B", "Dongfeng Cummins/4BT3.9-G2");
  //   nenjo "4006-23TAG2A Switchable" (its column "转速可调 Switchable": speed can be switched), aj-power "403D-11G Derate",
  //     "403D-11G commodity" (Khoa 20/11/2026: merged with the code).
  // NOT here: Perkins "… L" (no source says what L is; Khoa: kept apart), "3512B HD" (another displacement), codes written two
  // in one cell (PR 2), "(M)" / "(E)" (PR 3), a bare figure in brackets (elitech "4BTA3.9-G13(40)" / "(50)" for sets of 85 / 90
  // kVA: no source says what it is; bobig "6BT5.9-G2(115)").
  const MAKE_WORD = /^(faw|dcec|mistubishi)$/i;
  const PLANT_SLASH = /^(chongkang|shigeyasu|pangu\s+power|dongfeng\s+cummins|guangxi\s+yuchai)\s*\/\s*/i;
  const engineMakeWord = (w) => MAKE_WORD.test(w) || brandIn(w, ENGINE_BRANDS).length > 0;
  const ENGINE_TRIM = [
    (s) => s.replace(/\s+(switchable|derate|commodity)$/i, ""),
    (s) => s.replace(/^(india|uk)\s+/i, "").replace(/\s*\(\s*(india|uk|uk\s*\/\s*ep|usa\s*\/\s*eu)\s*\)$/i, "").replace(/\s+(EU|SME)$/, ""),
    (s) => s.replace(/\s*(?:\/\s*\d+(?:[.,]\d+)?\s*)?\/\s*\d+(?:[.,]\d+)?\s*k(?:w|va)$/i, "").replace(/\s*\(\s*\d+(?:[.,]\d+)?\s*k(?:w|va)\s*\)$/i, ""),
    // A leading figure only before a code that starts with a digit and has a hyphen and a letter ("1106A-70TG1"): a code written
    // with a space stays whole ("4006 23TAG2A", Jichai "6190 TL-2", "4190 ZLT1-2", Mahindra "3285 GM-C2", JCB "444 G-TCA-100").
    (s) => s.replace(/\s*\/\s*(1500|1800)$/, "").replace(/\s+(1500|1800)$/, "").replace(/^\d{3,4}(?:,\d+)?\s+(?=\d[\dA-Z.]*-\S*[A-Z])/i, ""),
    (s) => s.replace(PLANT_SLASH, ""),
    // Scania code + the kVA of the set ("DC13 505A 400KVA", baifa): the figure is a rating, not part of the code.
    (s) => s.replace(/^([DO]C\s?\d{1,2}\s\d{2,3}[A-Z])\s\d{2,4}\s?kva$/i, "$1"),
    (s) => { const m = s.match(/^([a-z]+)\s+(?=\S*\d)/i); return m && engineMakeWord(m[1]) ? s.slice(m[0].length) : s; },
    (s) => { const m = s.match(/\s+\(?([a-z]+)\)?$/i); return m && engineMakeWord(m[1]) ? s.slice(0, m.index) : s; },
  ];
  const engineCode = (cell) => {
    let s = String(cell || "");
    for (let again = true; again;) {
      again = false;
      for (const f of ENGINE_TRIM) { const t = f(s).trim(); if (t !== s && isCode(t) && keyOf(t).length >= 3) { s = t; again = true; } }
    }
    return s;
  };
  // "Volvo Penta TAD734GE", "Hyundai Infracore DM01VP", "Weichai Power WP13D490E310": a make of two words before the code
  // (isCode allows one space). Returns the code, or null. The second word must be part of a make's name, not a series
  // ("FPT NEF N67 TEVP05.00" names the series NEF, which stays out of this).
  const brandedCode = (cell, list) => {
    const m = String(cell || "").trim().replace(MARK_TAIL, "").match(/^([a-z]+)\s+(penta|infracore|heavy|power|diesel|engines?)\s+(\S.*)$/i);
    return m && brandIn(m[1], list).length && isCode(m[3]) ? m[3] : null;
  };

  // "Stamford UCI274H / Leroy-Somer TAL-A44-M": two alternators offered in one cell, each part a make word and a model code.
  // All or nothing: one part that is not "make + code" (a list of makes, a code with no make) leaves the cell as one (null).
  // One make written once before several codes ("Leroy Somer TAL-A44-M / TAL-A46-C", saudi-diesel n109; catalog-b): the make
  // stands for each code, which must be an alternator's (ALT_CODE). A frequency in brackets after a code ("TAL-A47-D (50 Hz) /
  // TAL-A47-F (60 Hz)", n115 / n117) is that code's. Returns [{ cell: "make code", freq }], or null.
  const FREQ_TAIL = /\s*[(（]\s*(50|60)\s*hz\s*[)）]$/i;
  const splitAltCell = (cell) => {
    const parts = String(cell || "").split(/\s*[/／]\s*/).map((p) => p.trim());
    if (parts.length < 2) return null;
    const fq = parts.map((p) => { const m = p.match(FREQ_TAIL); return m ? Number(m[1]) : null; }), bare = parts.map((p) => p.replace(FREQ_TAIL, ""));
    if (bare.every((p) => { const m = p.match(ALT_PREFIX); return m && isCode(p.slice(m[0].length)); })) return bare.map((p, i) => ({ cell: p, freq: fq[i] }));
    const m0 = bare[0].match(ALT_PREFIX);
    if (!m0 || !isCode(bare[0].slice(m0[0].length)) || !ALT_CODE.test(bare[0].slice(m0[0].length))) return null;
    if (!bare.slice(1).every((p) => !ALT_PREFIX.test(p) && isCode(p) && ALT_CODE.test(p))) return null;
    return bare.map((p, i) => ({ cell: i ? m0[0] + p : p, freq: fq[i] }));
  };
  // Two or more codes with no make, each an alternator's ("UC274D / UCI274D", acepow-fuan n127): which one the set has is not
  // known and no make tells them apart (catalog-b; before, the cell was one model "UC274D/UCI274D").
  const bareAltCodes = (cell) => {
    const parts = String(cell || "").split(/\s*[/／]\s*/).map((p) => p.trim());
    return parts.length >= 2 && parts.every((p) => !ALT_PREFIX.test(p) && isCode(p) && ALT_CODE.test(p));
  };

  // Bộ điều khiển (Khoa, 2026-11-01): make and model read from one line of a saved page or a table row, word for word.
  // A model code is taken where it is written (DSE7320, HGM6120N, InteliLite NT AMF25, DKG-309, easYgen-3000...); a
  // code that other things also use (AMF25, D-500, AGC-4) only on a line that names the make. A make with no model
  // counts only on a line about a controller ("Controller: Deepsea / Smartgen"). Deep Sea 2xxx / 9xxx are expansion
  // modules and battery chargers, not controllers. `text` is the part of the line that names it, as written.
  const CTRL_LINE = /controller|control\s?(panel|system|module|unit|box)|控制器|控制屏|控制系统/i;
  const up = (s) => s.toUpperCase().replace(/\s+/g, "");
  const CONTROLLERS = [
    { brand: "Deep Sea", word: /\bdeep\s?-?sea\b|深海/i, models: [
      // MKIII is its own generation (DSE6120 MKIII), not MKII.
      [/\bDSE\s?-?([3-8]\d{3})(\s?-?MK\s?(?:III|II|3|2)\b)?(?![\d])/gi, (m) => `DSE${m[1]}${m[2] ? (/III|3/i.test(m[2]) ? " MKIII" : " MKII") : ""}`],
      [/\bdeep\s?-?sea\s?(?:DSE)?\s?-?([3-8]\d{3})(?![\d])/gi, (m) => `DSE${m[1]}`]] },
    { brand: "SmartGen", word: /\bsmart\s?gen\b|众智/i, models: [
      [/\bHGM\s?-?(\d{4}[A-Z]{0,4}(?:-4G)?)(?![\dA-Z])/gi, (m) => `HGM${up(m[1])}`],
      // bdk-ten-tat: the only three-digit models SmartGen's own datasheet names (HGM410_HGM420_en.pdf, [smartgen 1010]). A closed list,
      // not \d{3}: Honny writes its gensets HGM550E / HGM625E / HGM1000E, and "HGM400" is the name of the series.
      [/\bHGM\s?-?(4(?:10|20))(?![\dA-Z])/gi, (m) => `HGM${m[1]}`],
      [/\bsmart\s?gen\s?(?:HGM)?\s?-?(\d{4}[A-Z]{0,3})(?![\dA-Z])/gi, (m) => `HGM${up(m[1])}`]] },
    { brand: "ComAp", word: /\bcomap\b/i, models: [
      // "InteliSys Gas" is a model of its own (bdk-ds-4: its datasheet is ComAp's). InteliDrive DCU (Marine / Industrial) is an ENGINE
      // controller, not a genset one: no model of its own, so its datasheet is attached to no model (điều phối 22/11/2026).
      [/\bInteli\s?(Lite|Gen|Sys|Compact|Drive|Mains|Nano)\s?(NTC|NT|4|500|1000|200|Gas\b)?\s?(?:(?:IL-?NT\s?)?(AMF|MRS)\s?-?(\d{1,2}))?(?![\w])/gi, (m) => ["Inteli" + m[1].replace(/^./, (c) => c.toUpperCase()), m[2] ? (/^(NTC|NT|\d+)$/i.test(m[2]) ? m[2].toUpperCase() : m[2][0].toUpperCase() + m[2].slice(1).toLowerCase()) : "", m[3] ? up(m[3]) + m[4] : ""].filter(Boolean).join(" ")],
      // ComAp order codes of InteliGen NT / NTC (IG-NT GC, IG-NTC-BB...).
      [/\bIG-?(NTC?)(?![\w])/gi, (m) => `InteliGen ${m[1].toUpperCase()}`],
      [/\bIL-?NT\s?(AMF|MRS)\s?-?(\d{1,2})(?![\w])/gi, (m) => `InteliLite NT ${up(m[1])}${m[2]}`],
      [/\b(AMF|MRS)\s?-?(20|25|9|8|10|11|15|16|18|19|5)(?![\w])/gi, (m) => `${up(m[1])}${m[2]}`, true]] },
    { brand: "DEIF", word: /\bdeif\b/i, models: [[/\b(AGC|SGC|GC|PPU|GPC|PPM)[\s-]?(\d{1,3}[A-Z]?|1F)(?![\w])/g, (m) => `${m[1]}-${m[2]}`, true]] },
    { brand: "Datakom", word: /\bdatakom\b/i, models: [
      [/\bDKG[\s-]?(\d{3})(?![\d])/gi, (m) => `DKG-${m[1]}`],
      [/\bD-?(\d{3,4})(?![\w])/g, (m) => `D-${m[1]}`, true]] },
    { brand: "Woodward", word: /\bwoodward\b/i, models: [[/\beasy\s?gen[\s-]?(\d{3,4})(?![\d])/gi, (m) => `easYgen-${m[1]}`]] },
    // bdk-ten-tat: SICES controllers (since the controller business went to Mecc Alte the datasheets are meccalte.com's). Only the models a saved
    // datasheet names ([sices 1001-1004]: GC315 / GC315Plus / GC315Link, GC400 / GC400Link / GC400Mains, GC600 / GC600Mains, DST4602 Evolution);
    // GC310, GC350 and GC500Plus have no sheet and are not read. "GC600" alone is also a genset's name (agestar GC-600(S)), so the make
    // comes first: "SICES" or "Mecc Alte" directly before the model, not "Mecc Alte, Stamford alternator ... controller" (no bare make here).
    { brand: "SICES", word: /\bsices\b|\bmecc\s?-?alte\s+(?=(?:GC\s?-?\d{3}|DST\s?-?4602))/i, models: [
      [/\bGC\s?-?(315|400|600)(Plus|Link|Mains)?(?![\w])/gi, (m) => `GC${m[1]}${m[2] ? m[2][0].toUpperCase() + m[2].slice(1).toLowerCase() : ""}`, true],
      [/\bDST\s?-?4602\s?Evolution(?![\w])/gi, () => "DST4602Evolution", true]] },
    { brand: "Harsen", word: /\bharsen\b/i, models: [] },
    { brand: "Mebay", word: /\bmebay\b/i, models: [] },
    { brand: "Lixise", word: /\blixise\b/i, models: [] },
    { brand: "Emko", word: /\bemko\b/i, models: [] },
  ];
  function controllersIn(line) {
    const s = String(line || ""), out = [];
    for (const c of CONTROLLERS) {
      const named = c.word.test(s) || (c.brand === "ComAp" && /\binteli\s?(lite|gen|sys|compact)/i.test(s)), found = new Set();
      for (const [re, canon, needsMake] of c.models) {
        if (needsMake && !named) continue;
        for (const m of s.matchAll(re)) {
          const model = canon(m), k = keyOf(model);
          if (found.has(k) || [...found].some((x) => x.includes(k))) continue;
          found.add(k);
          out.push({ brand: c.brand, model, text: m[0].trim() });
        }
      }
      if (!found.size && named && CTRL_LINE.test(s)) out.push({ brand: c.brand, model: null, text: s.match(c.word)[0] });
    }
    return out;
  }

  // Genset tables that name no engine model (việc C, PR 1; Khoa 20/11/2026 "PA1 trước": kept and shown on the supplier's
  // page, NOT read by the Gợi ý: suppliers/config-bot.mjs does not read `gensets`). The 46 tables were checked by hand one
  // by one (dieu-phoi/nghiem-thu/catalog-c-de-xuat.md, 1.1): a list, not a rule (a rule tried there chose 30 of 46 and 7
  // wrong tables). A table is read only when supplier, source n AND its first header line, word for word, all match: a
  // re-crawled page whose header changed lapses by itself (note "bảng trong danh sách tổ máy đổi tiêu đề").
  // Each layout says which cell is which (cell indexes of cellsOf(row)), the reading guesses nothing:
  //   cells: the cell counts a row of the table has; a row with another count is not one of its gensets and is left out
  //     with a note (yingtai n109: the googol ENGINE rows of 12 cells under the gensets' 9 / 10; acepow: the 6-cell size
  //     rows "APX-200 | 2800 | 1100 | …" under the 3-cell genset row).
  //   prime / standby / rated: { kW, kVA } cell indexes, or { pair, order } for one cell "a/b" ("800/1000"),
  //     units in the cell win, else `order`; `rated` = figures with no prime / standby level, as fromSupplier's `rated`
  //     ("Rated Power"; "Continuous Power" is no level, web/CLAUDE.md; "电能 (kWe)"; "功率 KW KVA"; điều phối 20/11/2026:
  //     one convention, no separate `unrated`).
  //   freq: the cell of the frequency ("50", "60Hz"; "50/60Hz" gives none); specs: [key, cell, label as the header writes it].
  // A cell "/", "TBA", "N/A", "0" or empty gives nothing (teksan's gas sets write "0" / "TBA" under Prime). The engine's
  // make: as fromSupplier's makesFor (row > header > page title > the maker itself).
  const GENSET_TABLES = (() => {
    const pairs = (order) => ({ prime: { pair: 1 }, standby: { pair: 2 }, order });
    const L = {
      acepow: { cells: [3], model: 0, ...pairs(null) },
      frsGas: { cells: [9], model: 0, prime: { kW: 1 }, specs: [["cyl", 3, "气缸数"], ["disp", 4, "排量"], ["compr", 6, "压缩比"], ["dims", 7, "机组尺寸 - 开架 (mm)"], ["weight", 8, "机组重量 - 开架 (kg)"]] },
      frsSmall: { cells: [9], model: 0, prime: { kW: 1, kVA: 2 }, specs: [["phase", 3, "相数"], ["pf", 4, "功率因数"], ["bore", 5, "缸径*行程 （mm）"], ["disp", 6, "排量 （cc）"], ["dims", 7, "尺寸 （mm）"], ["weight", 8, "重量 （kg）"]] },
      googolGas: { cells: [6], model: 1, rated: { pair: 2 }, order: ["kW", "kVA"], freq: 3, specs: [["voltage", 4, "Voltage (V)"]] },
      // "Engine (Output Power)" Standby | Prime (cells 1, 2) is the ENGINE's kW, not the set's: only "Genset (Typical
      // Generation Output Power)" Standby | Prime (kW/kVA), cells 3 and 4, is read (catalog-c-de-xuat 1.4.1).
      googolV: { cells: [9], model: 0, standby: { pair: 3 }, prime: { pair: 4 }, order: ["kW", "kVA"], specs: [["cyl", 5, "No. of Cylinders"], ["disp", 6, "Displacement (L)"], ["weight", 7, "Weight (kg)"], ["fuel", 8, "Full Load Consumption (L/h)"]] },
      greenPower: { cells: [8], model: 0, decComma: true, prime: { kVA: 1 }, standby: { kVA: 2 }, specs: [["fuel", 4, "CONSUMO CONSUMPTION (l/h)"], ["tank", 5, "SERBATOIO TANK (l)"], ["dims", 6, "DIMENSIONI (LxLxA) DIMENSIONS (LxWxH) (mm)"], ["weight", 7, "PESO WEIGHT (kg)"]] },
      interpower: { cells: [4], model: 0, prime: { kVA: 1 }, standby: { kVA: 2 } },
      // The size column is titled "（cm）" over figures in mm ("4900X1800X2500"): left out.
      kangwo: { cells: [4], model: 0, rated: { pair: 1, sep: " " }, order: ["kW", "kVA"], specs: [["weight", 3, "重量（kg）"]] },
      swtKubota: { cells: [6], model: 0, freq: 1, prime: { pair: 3 }, standby: { pair: 4 }, specs: [["speed", 5, "Rated Speed"]] },
      swtCummins: { cells: [7], model: 0, ...pairs(null), freq: 3, specs: [["speed", 4, "Rated Speed"], ["voltage", 5, "Voltage"], ["pf", 6, "Power Factor"]] },
      teksan: { cells: [9, 10], model: 1, standby: { kVA: 4, kW: 5 }, prime: { kVA: 6, kW: 7 }, freq: 3, specs: [["phase", 2, "Phase"], ["voltage", 8, "Voltage"]] },
      vpower: { cells: [6], model: 0, rated: { kW: 1 } },
      westin: { cells: [9], model: 1, rated: { kW: 2, kVA: 3 }, specs: [["cyl", 5, "Cylinder"], ["bore", 6, "Bore*Stroke (mm)"], ["disp", 7, "Displacement (L)"], ["dims", 8, "Dimensions L*W*H (mm)"]] },
      // A row of 8 cells (yingtai n104 "| 12GF | 12 | 15 | 13 | 16.25 | 21.6 | 23.4 | 1.32* 0.552* 1.18": the weight cell is
      // missing): the model, power and currents (cells 0–6) stand where the header says; which later cell is missing is
      // not known, so the weight and size are left out (`short`).
      yingtai: (cells, i = "电流（主用） Power(A)", w = "净重 Net Weight (kg)", d = "外形尺寸 Overall Dimensions L*W*H(m)") => ({ cells: [8, ...cells], model: 0, prime: { kW: 1, kVA: 2 }, standby: { kW: 3, kVA: 4 }, specs: [["current", 5, i], ["weight", 7, w], ["dims", 8, d]], short: { 8: [["current", 5, i]] } }),
      zcGF: { cells: [11], model: 0, rated: { kW: 1 }, standby: { kW: 2 }, freq: 4, specs: [["voltage", 3, "Voltage"], ["tank", 6, "Fuel Tank"], ["runtime", 7, "Runtime (50%)"], ["noise", 8, "Noise (7m)"], ["start", 9, "Start"], ["weight", 10, "Weight"]] },
      zcGS: { cells: [10], model: 0, rated: { kW: 1 }, standby: { kW: 2 }, freq: 4, specs: [["voltage", 3, "Voltage"], ["noise", 5, "Noise (7m)"], ["tank", 6, "Fuel Tank"], ["runtime", 7, "Runtime (50%)"], ["start", 8, "Start"], ["weight", 9, "Weight"]] },
    };
    const YT = "| 机组型号 Genset Model | 功率（主用） | 功率（备用） | 电流（主用） Power(A) | 电流（备用） Power(A) | 净重 Net Weight (kg) | 外形尺寸 Overall Dimensions L*W*H(m)";
    const TK = "| | COMPARE | Model | Phase | Hz | Power 9 - 45 kVA 46 - 110 kVA 111 - 179 kVA 180 - 300 kVA 301 - 499 kVA 500 - 749 kVA 750 - 999 kVA 1000 - 1499 kVA 1500 - 2500 kVA 2501 - 4500 kVA | Voltage | Engine | ALL";
    const GV = "| Model | Engine (Output Power) | Genset (Typical Generation Output Power) | No. of Cylinders | Displacement (L) | Weight (kg) | Full Load Consumption (L/h)";
    const GG = "| No. | Gas Genset Model | Continuous Power（kW/kVA) | Frequency（Hz） | Voltage (V) | Generator Efficiency";
    return [
      { supplierId: "acepow-fuan", n: [103, 105, 106, 107, 110, 117, 140, 143, 144, 145, 148, 150, 152], header: "| Generating Set Model | Prime | Standby", ...L.acepow },
      { supplierId: "frs-shenyang", n: [107], header: "| 机组型号 | 机组主用功率 （kW） | 控制器型号 | 气缸数 | 排量 | 缸数/排列 (mm) | 压缩比 | 机组尺寸 - 开架 (mm) | 机组重量 - 开架 (kg)", ...L.frsGas },
      { supplierId: "frs-shenyang", n: [108], header: "| 型号 | 主用功率 （kW） | 主用功率 （kVA） | 相数 | 功率因数 | 缸径*行程 （mm） | 排量 （cc） | 尺寸 （mm） | 重量 （kg）", ...L.frsSmall },
      { supplierId: "googol", n: [101, 102], header: GG, ...L.googolGas },
      { supplierId: "googol", n: [107, 109, 111, 113, 115, 116, 117], header: GV, ...L.googolV },
      { supplierId: "green-power-generators", n: [130], header: "| | MODELLO MODEL | POTENZA POWER (PRP kVA) | POTENZA POWER (LTP kVA) | MOTORE ENGINE | CONSUMO CONSUMPTION (l/h) | SERBATOIO TANK (l) | DIMENSIONI (LxLxA) DIMENSIONS (LxWxH) (mm) | PESO WEIGHT (kg)", ...L.greenPower },
      { supplierId: "interpower-international", n: [2002], header: "| Genset Model | Prime kVA | Standby kVA | Data Sheet", ...L.interpower },
      { supplierId: "kangwo-xiamen", n: [101], header: "| 机组型号 | 功率 KW KVA | 长X宽X高（cm） | 重量（kg）", ...L.kangwo },
      { supplierId: "superwatt-swt", n: [102], header: "| Model | Frequency | Phase / Voltage | Prime Power | Standby Power | Rated Speed", ...L.swtKubota },
      { supplierId: "superwatt-swt", n: [123], header: "| Model | Prime Power | Standby Power | Frequency | Rated Speed | Voltage | Power Factor", ...L.swtCummins },
      { supplierId: "teksan", n: [101, 102, 104, 106], header: TK, ...L.teksan },
      { supplierId: "vpower-hk", n: [101, 102], header: "| | 输出 | 效率 |", ...L.vpower },
      { supplierId: "westinpower", n: [113], header: "| N0. | Genset Model | Rated Power | Engine Model | Cylinder | Bore*Stroke (mm) | Displacement (L) | Dimensions", ...L.westin },
      { supplierId: "yingtai-jiangsu", n: [101], header: YT, ...L.yingtai([9]) },
      { supplierId: "yingtai-jiangsu", n: [104], header: "| 机组型号 Genset Model | 主用功率（主用） | 备用功率（备用） | 电流（主用） Power(A) | 电流（备用） Power(A) | 净重 Net Weight (kg) | 外形尺寸 Overall Dimensions L*W*H(m) | 品牌 Brand", ...L.yingtai([9, 10]) },
      { supplierId: "yingtai-jiangsu", n: [105, 107, 118], header: `${YT} | 品牌 Brand`, ...L.yingtai([9, 10]) },
      { supplierId: "yingtai-jiangsu", n: [109], header: "| 机组型号 | 功率（主用） | 功率（主用） | 功率（备用） | 功率（备用） | 电流（主用） | 电流（备用） | 净重 | 外形尺寸 | 品牌", ...L.yingtai([9, 10], "电流（主用） A", "净重 kg", "外形尺寸 m*m*m") },
      { supplierId: "yingtai-jiangsu", n: [112], header: "| 机组型号 Engine Type | 功率（主用） | 功率（备用） | 电流（主用） Power(A) | 电流（备用） Power(A) | 净重 Net Weight (kg) | 外形尺寸 Overall Dimensions L*W*H(m)", ...L.yingtai([9]) },
      { supplierId: "zc-power", n: [109], header: "| | Model | Rated Power | Max Power | Voltage | Frequency | Engine | Fuel Tank | Runtime (50%) | Noise (7m) | Start | Weight", ...L.zcGF },
      { supplierId: "zc-power", n: [109], header: "| | Model | Rated Power | Max Power | Voltage | Frequency | Noise (7m) | Fuel Tank | Runtime (50%) | Start | Weight", ...L.zcGS },
    ].map((x) => ({ checked: "20/11/2026", ...x }));
  })();
  const NONE_FIG = /^(?:|[-–—/]+|tba|n\/a|0)$/i;
  // One figure of a cell: a number, the unit the cell writes (kW / kVA / kWe) if any. undefined: the cell holds nothing;
  // null: the cell holds something else (noted).
  const figOf = (c, decComma) => {
    const s = String(c ?? "").trim();
    if (NONE_FIG.test(s)) return undefined;
    const m = s.match(/^(\d+(?:[.,]\d+)?)\s*(kva|kwe?)?$/i);
    if (!m || (m[1].includes(",") && !decComma)) return null;
    return { v: Number(m[1].replace(",", ".")), unit: m[2] ? (/kva/i.test(m[2]) ? "kVA" : "kW") : null };
  };
  // One level of power from its layout; { level, bad } where bad says why the cells gave no level.
  function gensetLevel(lay, at, cells, order, decComma) {
    const p = {};
    if (at.pair != null) {
      const c = String(cells[at.pair] ?? "").trim();
      if (NONE_FIG.test(c)) return {};
      const parts = c.split(at.sep === " " ? /\s+/ : /\s*[\/／]\s*/);
      const fs = parts.map((x) => figOf(x, decComma));
      if (fs.length !== 2 || fs.some((f) => !f)) return { bad: c };
      const units = fs.every((f) => f.unit) ? fs.map((f) => f.unit) : fs.some((f) => f.unit) ? null : order;
      if (!units || units[0] === units[1]) return { bad: c };
      fs.forEach((f, i) => (p[units[i]] = f.v));
    } else for (const u of ["kW", "kVA"]) {
      if (at[u] == null) continue;
      const f = figOf(cells[at[u]], decComma);
      if (f === undefined) continue;
      if (!f || (f.unit && f.unit !== u)) return { bad: cells[at[u]] };
      p[u] = f.v;
    }
    if (!Object.keys(p).length) return {};
    // kW and kVA of one level must fit one set (fitPair: power factor 0.8 within rounding, 0.75–0.86, or 1): yingtai n109
    // "800GF | 8020 | 1000" (8020 kW for 1000 kVA), "900GF … | 990 | 1089" are typing slips of the source, the level is left out.
    if (p.kW != null && p.kVA != null && !fitPair(p.kVA, p.kW)) return { bad: `${p.kW} kW / ${p.kVA} kVA` };
    if (p.kW != null && p.kVA != null && p.kW > p.kVA) return { bad: `${p.kW} kW / ${p.kVA} kVA` };
    return { level: p };
  }
  function gensetsOf(s, notes) {
    const out = [];
    const lays = GENSET_TABLES.filter((x) => x.supplierId === s?.id);
    if (!lays.length || s.role === "controller_maker") return out;
    const note = notes ? (t, ti, row, reason, detail) => notes.push({ supplierId: s.id, n: t.n, table: ti, title: String(t.title || ""), row, reason, detail: detail == null ? null : String(detail).slice(0, 200) }) : () => {};
    const ownBrand = brandIn([s.names?.en, ...(s.names?.brands || [])].join(" "), ENGINE_BRANDS);
    const tables = s.specTables || [];
    // An entry whose page has no table with its header any more (re-crawled, header changed): read nothing, say so. Another
    // table of the same page (yingtai n101 b1 is an engine table) is simply not one of the list.
    for (const x of lays) for (const n of x.n) if (!tables.some((t) => t.n === n && String((t.header || [])[0] ?? "") === x.header)) {
      const ti = tables.findIndex((t) => t.n === n);
      note(ti >= 0 ? tables[ti] : { n, title: "" }, ti >= 0 ? ti : null, null, "bảng trong danh sách tổ máy đổi tiêu đề: không đọc", ti >= 0 ? (tables[ti].header || [])[0] : "không còn bảng nào của nguồn này");
    }
    tables.forEach((t, ti) => {
      const lay = lays.find((x) => x.n.includes(t.n) && String((t.header || [])[0] ?? "") === x.header);
      if (!lay) return;
      const title = String(t.title || ""), headerText = (t.header || []).join(" ");
      const hEng = brandIn(headerText, ENGINE_BRANDS), tEng = brandIn(title.split(/\s[|–-]\s|\|/)[0], ENGINE_BRANDS);
      (t.rows || []).forEach((line, ri) => {
        const cells = cellsOf(line);
        if (!lay.cells.includes(cells.length)) { note(t, ti, ri, "dòng không đúng bố cục cột của bảng tổ máy: không đọc", line); return; }
        const model = String(cells[lay.model] || "").trim();
        if (!/\d/.test(model) || keyOf(model).length < 3) { note(t, ti, ri, "dòng bảng tổ máy không có model", line); return; }
        const power = {};
        for (const lv of ["prime", "standby", "rated"]) {
          if (!lay[lv]) continue;
          const { level, bad } = gensetLevel(lay, lay[lv], cells, lay.order, lay.decComma);
          if (bad != null) note(t, ti, ri, `công suất ${lv} không đọc được: để trống`, bad);
          if (level) power[lv] = level;
        }
        // Prime above standby (either unit): which of the two is wrong is not known, both are left out.
        const top = power.standby;
        for (const lv of ["prime", "rated"]) {
          const p = power[lv];
          if (p && top && ((p.kW != null && top.kW != null && p.kW > top.kW) || (p.kVA != null && top.kVA != null && p.kVA > top.kVA))) {
            note(t, ti, ri, `${lv} lớn hơn standby: để trống cả hai`, line); delete power[lv]; delete power.standby;
          }
        }
        let freq = null;
        if (lay.freq != null) {
          const c = String(cells[lay.freq] || "").trim(), m = c.match(/^(50|60)\s*(?:hz)?$/i);
          if (m) freq = Number(m[1]);
          else if (c && !/^50\s*(?:hz)?\s*[\/／]\s*60\s*(?:hz)?$/i.test(c)) note(t, ti, ri, "tần số không đọc được", c);
        }
        const specs = [];
        for (const [key, i, label] of lay.short?.[cells.length] || lay.specs || []) {
          const v = specVal(cells[i]);
          if (!v || NONE_FIG.test(v)) continue;
          if (!specFits(key, v)) { note(t, ti, ri, "thông số không đúng dạng: để trống", `${key}=${v}`); continue; }
          specs.push({ key, label, value: v });
        }
        const makes = [], row = brandIn(line, ENGINE_BRANDS);
        if (row.length === 1) addMake(makes, row[0], "dòng bảng");
        else if (hEng.length === 1) addMake(makes, hEng[0], "tiêu đề cột");
        else if (tEng.length === 1) addMake(makes, tEng[0], "tên trang");
        else if (s.role === "engine_maker" && ownBrand.length === 1) addMake(makes, ownBrand[0], "hãng sản xuất");
        const o = { supplierId: s.id, n: t.n, table: ti, title, row: ri, line, header: t.header || [], kind: "genset", model, power: Object.keys(power).length ? power : null, freq, specs, makes };
        // Fuel only from the FUEL_PAGES list (zc-power n109): a genset table's own signs are not read here.
        const f = fuelPage(s.id, o, s.specTables[ti]?.header?.[0], "genset");
        if (f) { o.fuel = f.fuel; o.fuelFrom = f.from; o.fuelWhy = f.why; }
        out.push(o);
      });
    });
    // ROW_EXCEPTIONS apply to these set rows too (gia-tri-sai 24/11/2026: googol "Weight (kg)" `unsurespec`); they match by the
    // set model (`genset` of the entry) and the line word for word, like the rows of fromSupplier.
    return rowExceptions(s, out, note);
  }

  // fromSupplier() of a supplier record and the controllers named in its engine rows, kept while that record object is
  // unchanged (the web builds again on every change of state.supplier, which keeps the objects of the suppliers that did
  // not change).
  const rowsMemo = new WeakMap();
  const rowsOf = (s) => {
    if (!rowsMemo.has(s)) {
      const rows = fromSupplier(s);
      rowsMemo.set(s, { rows, ctrls: rows.map((o) => (o.kind === "engine" && o.line ? controllersIn(o.line) : [])), gensets: gensetsOf(s) });
    }
    return rowsMemo.get(s);
  };
  // All suppliers → { engines, alternators, controllers }: one entry per model, with every row that names it.
  // What the catalog does not read (chat-luong-3, Khoa 18/11/2026): every note of fromSupplier (a row, figure or value
  // left out by a guard, with its reason) and every table with rows that gave no record at all (a layout not understood,
  // or a table that is no genset's: accessories, lighting towers). Same suppliers as build(): not "incomplete", not a
  // controller maker. suppliers/unread-tables.mjs prints and saves it; spec-diff --md counts it before / after.
  function unread(suppliers) {
    const notes = [];
    for (const s of suppliers || []) {
      if (!s || s.status === "incomplete" || s.role === "controller_maker") continue;
      const recs = fromSupplier(s, notes), used = new Set();
      for (const o of recs) { used.add(o.table); for (const a of o.also || []) used.add(a.table); }
      // The genset tables of GENSET_TABLES (gensetsOf) are read too, with their own notes.
      for (const o of gensetsOf(s, notes)) used.add(o.table);
      (s.specTables || []).forEach((t, ti) => {
        if ((t.rows || []).length && !used.has(ti)) notes.push({ supplierId: s.id, n: t.n, table: ti, title: String(t.title || ""), row: null, reason: "bảng không cho bản ghi nào", detail: String((t.header || [])[0] || t.rows[0] || "").slice(0, 200) });
      });
    }
    return notes;
  }
  function build(suppliers) {
    const b = builder(suppliers);
    b.step();
    return b.result();
  }
  // build() in small steps, so a page can spread it over idle time: step(timeLeft) works until timeLeft() (ms) is 4 or
  // less, at least one supplier or model a call, and returns true once done; result() is then what build() returns.
  function builder(suppliers) {
    useManufacturing(suppliers);
    // `genset`: the rows of gensetsOf (genset tables naming no engine model), one entry per supplier + model (a genset's
    // name is its supplier's own: "200GF" is many suppliers' sets), keyed `supplierId|keyOf(model)`.
    const maps = { engine: new Map(), alternator: new Map(), controller: new Map(), genset: new Map() };
    // A controller: from the supplier's `controllers` (suppliers/controllers.mjs, each with its source line) and from
    // the genset rows of its tables that name one (then with that row's genset, power and engine).
    const addCtrl = (s, c, u) => {
      const k = c.model ? keyOf(c.model) : `BRAND:${keyOf(c.brand)}`, m = maps.controller;
      let e = m.get(k);
      if (!e) { e = { key: k, kind: "controller", model: c.model || `${c.brand} (không ghi model)`, brandOnly: !c.model, names: new Set(), makes: [], uses: [], suppliers: new Set(), freq: new Set() }; m.set(k, e); }
      if (e.uses.some((x) => x.supplierId === s.id && x.line === u.line)) return;
      e.names.add(e.model);
      if (!e.makes.some((x) => x.name === c.brand)) e.makes.push({ name: c.brand, via: "trang nguồn", supplierId: s.id, n: u.n });
      e.uses.push({ supplierId: s.id, text: c.text, ...u });
      e.suppliers.add(s.id);
      if (u.freq) e.freq.add(u.freq);
    };
    const addSupplier = (s) => {
      if (!s || s.status === "incomplete") return;
      for (const c of s.controllers || []) addCtrl(s, c, { n: (c.src || [])[0], line: c.line, genset: null, power: null, other: null, specs: [] });
      if (!s.specTables?.length) return;
      const { rows, ctrls, gensets } = rowsOf(s);
      for (const o of gensets) {
        const k = `${s.id}|${keyOf(o.model)}`, m = maps.genset;
        let e = m.get(k);
        if (!e) { e = { key: k, kind: "genset", model: o.model, names: new Set(), makes: [], uses: [], suppliers: new Set(), freq: new Set() }; m.set(k, e); }
        e.names.add(o.model);
        for (const mk of o.makes) if (!e.makes.some((x) => x.name === mk.name && x.via === mk.via)) e.makes.push({ ...mk, supplierId: o.supplierId, n: o.n });
        e.uses.push(o);
        e.suppliers.add(o.supplierId);
        if (o.freq) e.freq.add(o.freq);
      }
      rows.forEach((o, i) => {
        for (const c of ctrls[i]) addCtrl(s, c, { n: o.n, line: o.line, header: o.header, genset: o.genset, power: o.power, freq: o.freq, other: o.model, specs: [] });
        const k0 = keyOf(o.model);
        if (k0.length < 3) return;
        // A series name many factories use ("STC-10", LOOSE_TABLES scope "supplier"): keyed per supplier, never joined.
        const k = o.keyScope === "supplier" ? `${o.supplierId}|${k0}` : k0;
        const m = maps[o.kind];
        let e = m.get(k);
        if (!e) { e = { key: k, kind: o.kind, model: o.model, names: new Set(), makes: [], uses: [], suppliers: new Set(), freq: new Set() }; m.set(k, e); }
        e.names.add(o.model);
        for (const mk of o.makes) if (!e.makes.some((x) => x.name === mk.name && x.via === mk.via)) e.makes.push({ ...mk, supplierId: o.supplierId, n: o.n });
        e.uses.push(o);
        e.suppliers.add(o.supplierId);
        if (o.freq) e.freq.add(o.freq);
      });
    };
    const finish = (e) => {
      const kva = [], kw = [];
      for (const u of e.uses) for (const p of Object.values(u.power || {})) { if (p.kVA) kva.push(p.kVA); if (p.kW) kw.push(p.kW); }
      // Other figures, grouped by kind: each distinct value with how many rows give it. An alternator does not
      // show engine figures and an engine not alternator ones; genset figures (fuel, noise, size...) go with both.
      const specs = new Map();
      for (const u of e.uses) for (const sp of u.specs || []) {
        const def = SPEC[sp.key];
        // A genset row of a table naming no engine model gives the figures of its unnamed engine too (cylinders, displacement).
        if (!def || (def.scope !== "genset" && def.scope !== e.kind && !(e.kind === "genset" && def.scope === "engine"))) continue;
        if (!specs.has(sp.key)) specs.set(sp.key, { key: sp.key, vi: def.vi, scope: def.scope, values: new Map() });
        const vk = sp.value.toLowerCase().replace(/\s+/g, "");
        const vs = specs.get(sp.key).values;
        if (!vs.has(vk)) vs.set(vk, { value: sp.value, label: sp.label, rows: 0, suppliers: new Set() });
        const v = vs.get(vk); v.rows++; v.suppliers.add(u.supplierId);
      }
      const specList = SPECS.filter(([k]) => specs.has(k)).map(([k]) => {
        const g = specs.get(k);
        // Engine constants: one vote per supplier, and the value that wins by the majority rule (see `tally`). `values`
        // keeps every value as written; `votes` is per value (vk), `win` its key or null.
        if (e.kind === "engine" && VOTE_KEYS.has(k)) {
          const by = new Map();
          for (const [vk, v] of g.values) for (const s of v.suppliers) by.set(s, [...(by.get(s) || []), vk]);
          const t = tally(by);
          return { ...g, win: t.win, votes: Object.fromEntries([...t.votes].map(([vk, ss]) => [vk, ss.length])), values: [...g.values.values()].map((v) => ({ ...v, suppliers: [...v.suppliers] })).sort((a, b) => b.suppliers.length - a.suppliers.length || b.rows - a.rows) };
        }
        return { ...g, values: [...g.values.values()].map((v) => ({ ...v, suppliers: [...v.suppliers] })).sort((a, b) => b.suppliers.length - a.suppliers.length || b.rows - a.rows) };
      });
      // `makes`: the makes kept (keptMakes), which make, origin and group are read from; every make a source gave stays in
      // `makesAll`; `makeConflict`: the names the sources disagree on when none is kept.
      const sheet = e.kind === "alternator" && !e.makes.length ? SHEET_MAKE[e.key] : null;
      if (sheet) e.makes.push({ name: sheet.name, via: "tờ hãng", supplierId: sheet.supplierId, n: sheet.n });
      const kept = e.kind === "controller" ? { makes: e.makes, conflict: null } : keptMakes(e);
      return { ...e, specs: specList, names: [...e.names], suppliers: [...e.suppliers], freq: [...e.freq].sort(),
        kva: kva.length ? [Math.min(...kva), Math.max(...kva)] : null, kw: kw.length ? [Math.min(...kw), Math.max(...kw)] : null,
        makesAll: e.makes, makes: kept.makes, makeConflict: kept.conflict, make: makeOf(kept.makes) };
    };
    const sort = (a, b) => b.suppliers.length - a.suppliers.length || b.uses.length - a.uses.length || a.model.localeCompare(b.model);
    // Suppliers one by one, then the models of each kind one by one (in the order they were met), then the sort.
    const list = [...(suppliers || [])], kinds = ["engine", "alternator", "controller", "genset"], done = { engine: [], alternator: [], controller: [], genset: [] };
    let si = 0, ki = 0, todo = null, out = null;
    function unit() {
      if (si < list.length) return addSupplier(list[si++]);
      while (ki < kinds.length) {
        todo ||= [...maps[kinds[ki]].values()];
        if (done[kinds[ki]].length < todo.length) return done[kinds[ki]].push(finish(todo[done[kinds[ki]].length]));
        ki++; todo = null;
      }
      out = { engines: done.engine.sort(sort), alternators: done.alternator.sort(sort),
        controllers: done.controller.sort((a, b) => a.brandOnly - b.brandOnly || sort(a, b)),
        gensets: done.genset.sort((a, b) => a.suppliers[0].localeCompare(b.suppliers[0]) || a.model.localeCompare(b.model)) };
    }
    return {
      step(left = () => Infinity) {
        while (!out) { unit(); if (!out && left() <= 4) return false; }
        return true;
      },
      result: () => out,
    };
  }

  // Tender needs read from the analysis (technicalSpecs, keyInfo) and the HSMT text: power, rating, frequency and
  // the brands it names for the engine and the alternator. Each need keeps the words it was read from.
  function needsOf(texts) {
    const need = { kVA: null, kW: null, rating: null, freq: null, engineBrands: [], altBrands: [], quotes: [] };
    for (const t of texts) {
      const s = String(t?.text || t || ""), item = String(t?.item || "");
      const all = item + " " + s;
      if (!s) continue;
      const isAlt = /đầu phát|alternator|máy phát xoay chiều|phần phát/i.test(item) || (/^\s*(đầu phát|alternator)/i.test(s));
      const isEng = /động cơ|engine/i.test(item) || /^\s*(động cơ|engine)/i.test(s);
      if (isEng || (!isAlt && /động cơ|engine/i.test(s))) for (const b of brandIn(s, ENGINE_BRANDS)) if (!need.engineBrands.includes(b)) { need.engineBrands.push(b); need.quotes.push({ what: "Hãng động cơ", text: all.trim().slice(0, 240) }); }
      if (isAlt || /đầu phát|alternator/i.test(s)) for (const b of brandIn(s, ALT_BRANDS)) if (!need.altBrands.includes(b)) { need.altBrands.push(b); need.quotes.push({ what: "Hãng đầu phát", text: all.trim().slice(0, 240) }); }
      if (!need.freq) { const f = /(\b50\s?hz\b)/i.test(s) && !/60\s?hz/i.test(s) ? 50 : /(\b60\s?hz\b)/i.test(s) && !/50\s?hz/i.test(s) ? 60 : null; if (f) need.freq = f; }
      if (isEng && !isAlt) continue;
      if (/công suất|capacity|power|output|kva|kw/i.test(all) && !/động cơ|engine|tiêu hao|consum|ắc quy|battery|sạc|charg|quạt|fan|đèn|light|ups|bơm|pump|tủ ats|ats/i.test(item)) {
        for (const m of s.matchAll(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(kva|kw)\b/gi)) {
          let v = m[1];
          v = /^\d{1,3}([.,]\d{3})+$/.test(v) ? v.replace(/[.,]/g, "") : v.replace(",", ".");
          const n = Number(v), u = m[2].toLowerCase() === "kva" ? "kVA" : "kW";
          if (!(n >= 1 && n <= 20000) || need[u]) continue;
          need[u] = n;
          const ctx = s.slice(Math.max(0, m.index - 80), m.index + m[0].length + 40);
          if (!need.rating) need.rating = PRIME.test(ctx) || /thường xuyên/i.test(ctx) ? "prime" : STANDBY.test(ctx) ? "standby" : PRIME.test(item) && !STANDBY.test(item) ? "prime" : STANDBY.test(item) && !PRIME.test(item) ? "standby" : null;
          need.quotes.push({ what: "Công suất", text: all.trim().slice(0, 240) });
        }
      }
    }
    return need;
  }

  // Top engines / alternators for a need. A model is a candidate when a genset row that uses it gives the needed
  // power in the same unit (kVA with kVA, kW with kW) with the needed rating when the tender names one; the
  // closest power at or above the need ranks first (up to 35% over). Then: a brand the tender names, frequency, how
  // many suppliers list it, and the make being stated by a source.
  function suggest(cat, need, kind, limit = 3) {
    const list = kind === "engine" ? cat.engines : cat.alternators;
    const brands = kind === "engine" ? need.engineBrands : need.altBrands;
    const unit = need.kVA ? "kVA" : need.kW ? "kW" : null, want = unit ? need[unit] : null;
    const scored = [];
    for (const e of list) {
      let best = null;
      for (const u of e.uses) {
        if (!u.power) continue;
        const ratings = need.rating ? [need.rating, "rated"] : ["prime", "rated", "standby"];
        for (const r of ratings) {
          const p = u.power[r];
          if (!p || !want || p[unit] == null) continue;
          const over = p[unit] / want;
          if (over < 1 || over > 1.35) continue;
          // Unknown rating: a prime figure is the safer reading, then an unlabelled one, then standby.
          const sc = (need.rating ? (r === need.rating ? 0 : 0.04) : r === "prime" ? 0 : r === "rated" ? 0.03 : 0.05) + (over - 1);
          if (!best || sc < best.sc) best = { sc, use: u, rating: r, value: p[unit], over };
        }
      }
      if (want && !best) continue;
      const brandHit = brands.length ? e.makes.some((m) => brands.includes(m.name)) : null;
      if (brands.length && !brandHit && !(want && best)) continue;
      const freqOk = need.freq ? (e.freq.length ? e.freq.includes(need.freq) : null) : null;
      let score = 100;
      if (best) score -= best.sc * 100;
      if (brandHit === true) score += 25; else if (brandHit === false) score -= 30;
      if (freqOk === false) score -= 20;
      score += Math.min(e.suppliers.length, 6) * 2 + (e.makes.length ? 4 : 0);
      if (!want && !brands.length) continue;
      scored.push({ entry: e, score, best, brandHit, freqOk });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // The origin of a catalog engine (an entry of build().engines), from the makes its rows give and its model code.
  const originOf = (e) => engineOrigin((e.makes || []).map((m) => m.name), e.model);
  // The origin of an engine named in a text (a make, a model, a row).
  const originIn = (text, model) => engineOrigin(brandIn(String(text || ""), ENGINE_BRANDS), model);
  // The countries of an engine's makes: CN for a Chinese make, the make's country for a foreign one; [] when unknown.
  function engineCountries(names, model) {
    const o = engineOrigin(names, model), m = String(model || "").trim();
    if (o !== "other") return o === "cn" ? ["CN"] : [];
    return [...new Set([...names, ...FOREIGN_MODEL.filter(([re]) => re.test(m)).map(([, n]) => n)].filter((n) => FOREIGN_ENGINE.has(n) && !NO_GROUP.has(n)).map((n) => ENGINE_COUNTRY[n]))];
  }
  // Whether an engine (catalog entry, or one named in a text) is of a make from a country of the group ("g7" / "g20").
  // A Chinese make the sources name is a licence build ("6M33D670E200 | WEICHAI (China)", a Baudouin design): not of the
  // group, as config-prompt.md says ("kể cả loại sản xuất theo giấy phép"); for Xuất xứ Trung Quốc it stays foreign.
  const cnMade = (names) => names.some((n) => !FOREIGN_ENGINE.has(n));
  const groupOf = (e, g) => { const names = (e.makes || []).map((m) => m.name); return !cnMade(names) && engineCountries(names, e.model).some((c) => COUNTRY_GROUP[g].includes(c)); };
  const groupIn = (text, model, g) => engineCountries(brandIn(String(text || ""), ENGINE_BRANDS), model).some((c) => COUNTRY_GROUP[g].includes(c));

  // Thương hiệu and Nơi sản xuất of a catalog entry, apart (Khoa, 2026-11-16: "nên phân biệt rõ thương hiệu và nơi sản
  // xuất"; filters of Thông số cấu hình 2026-11-17). Brand: the country the make comes from. Place: China when the make
  // is Chinese or a row names a Chinese plant of a foreign make; for the alternator / controller makes Khoa settled on
  // 2026-11-16 (makers' pages), their own country; else not known (an engine of a foreign make: the rows mostly do not
  // say, and the model is not guessed from).
  const ALT_COUNTRY = { Stamford: "GB", "Leroy-Somer": "FR", "Mecc Alte": "IT", Marathon: "US", Engga: "CN", Faraday: "CN", Siemens: "DE",
    AvK: "DE", "Linz Electric": "IT", Sincro: "IT", WEG: "BR" };
  const CTRL_COUNTRY = { "Deep Sea": "GB", SmartGen: "CN", ComAp: "CZ", DEIF: "DK", Datakom: "TR", Woodward: "US", Harsen: "CN",
    Mebay: "CN", Lixise: "CN", Emko: "TR" };
  // Fallback only (catalog-manufacturing, Khoa 19/11/2026): the place of a make's own plant now comes from the
  // `manufacturing[]` of the maker's record (suppliers/cn, PR #862 / #866; `madeFrom` below). This table answers only for a
  // make whose record is not among the suppliers given to build() / builder() (a partial list, a test), or whose record
  // gives no place for it: nothing is guessed beyond what it said before.
  const MADE_DEFAULT = { Stamford: "GB", "Leroy-Somer": "FR", "Mecc Alte": "IT", AvK: "RO", "Deep Sea": "GB", DEIF: "DK", Woodward: "PL",
    Datakom: "TR", ComAp: "CZ" };
  // manufacturing[] of the maker records → the place of a make's own plant: Map make → { at, why } | { models: [[token, at, why]] }.
  // Rules (suppliers/CLAUDE.md, manufacturing[]; Khoa's answers 16/11/2026 in config-suggest / supplier-db memory; no rule of its own):
  // - only `scope: "manufacture"` entries count; `scope: "design"` (ComAp Praha, SICES Italy) is not a place of manufacture;
  // - the entry `khoa` without `src` ("Khoa chốt dd/mm/yyyy", no `products`) is the place Khoa settled for the record's first
  //   make (Stamford → GB, Leroy-Somer → FR, Mecc Alte → IT, ComAp → CZ, Datakom → TR);
  // - a sourced entry for "All products" (DSE, DEIF) is the place of every make of the record, "<make> (all)" (AvK) of that make;
  // - a sourced entry listing products only ("easYgen-1500/2000/3000/3000XT, LS5, …", Woodward) is the place of those models and
  //   of no other model of the make; used only when the make has no entry of the kinds above (Stamford's "S4, S5, S6, S7" is
  //   not: the Khoa default stands); an entry that names no products and has no `khoa` (Datakom Istanbul, Mecc Alte's four
  //   plants) says nothing of which products and is left out; two different places among the entries of one make → no place.
  const madeFrom = new Map();
  const productTokens = (products) => String(products || "").split(/[,;]/).flatMap((part) => {
    const p = part.trim(), [first, ...rest] = p.split("/");
    if (!rest.length) return [p];
    const pre = first.replace(/[0-9A-Za-z]+$/, "");
    return [first, ...rest.map((x) => pre + x.trim())];
  }).map((x) => x.toLowerCase().replace(/[^a-z0-9]/g, "")).filter((x) => x.length >= 3);
  function useManufacturing(suppliers) {
    const recs = (suppliers || []).filter((s) => s && Array.isArray(s.manufacturing) && s.manufacturing.length);
    // A list with no maker record (one supplier given to build()) leaves what an earlier list gave.
    if (!recs.length) return;
    madeFrom.clear();
    const makeOf = (b) => [...brandIn(String(b || ""), ALT_BRANDS), ...brandIn(String(b || ""), CONTROLLERS.map((c) => [c.word, c.brand]))];
    for (const s of recs) {
      const makes = [...new Set((s.brands || s.names?.brands || []).flatMap(makeOf))];
      if (!makes.length) continue;
      const places = new Map(), lists = new Map();
      const put = (m, at, why) => { const o = places.get(m); if (!o) places.set(m, { at, why }); else if (o.at !== at) o.conflict = true; };
      for (const e of s.manufacturing) {
        if (e.scope !== "manufacture" || !e.country) continue;
        const pr = String(e.products || "").trim();
        if (e.khoa && !pr && !e.src) put(makes[0], e.country, `mặc định theo hãng (${e.khoa})`);
        else if (e.src && /^all(\s+products)?$/i.test(pr)) for (const m of makes) put(m, e.country, `hãng ghi nơi sản xuất — hồ sơ hãng, nguồn ${[].concat(e.src).join("/")} (${e.city || e.country}, mọi sản phẩm)`);
        else if (e.src && /\(all\)\s*$/i.test(pr)) for (const m of makeOf(pr)) put(m, e.country, `hãng ghi nơi sản xuất — hồ sơ hãng, nguồn ${[].concat(e.src).join("/")} (${e.city || e.country}, ${pr})`);
        else if (e.src && pr) for (const m of makes) lists.set(m, [...(lists.get(m) || []), ...productTokens(pr).map((t) => [t, e.country, `hãng ghi nơi sản xuất — hồ sơ hãng, nguồn ${[].concat(e.src).join("/")} (${e.city || e.country}: ${pr})`])]);
      }
      for (const [m, p] of places) if (!p.conflict && !madeFrom.has(m)) madeFrom.set(m, { at: p.at, why: p.why });
      for (const [m, l] of lists) if (!places.has(m) && !madeFrom.has(m)) madeFrom.set(m, { models: l });
    }
  }
  // Nơi sản xuất of one row (Khoa, 2026-11-16/17, việc "thương hiệu ≠ nơi sản xuất"): what the row, its column titles
  // and the page title say of the make, never guessed from the model.
  // - A Chinese plant of the make (CN_PLANT: DCEC / CCEC, Perkins Wuxi, SME, MTU Yuchai, 潍柴博杜安, 无锡斯坦福,
  //   福州利莱森玛…), "合资 / 国产 <make>", or China written beside the make ("Perkins China", "Stamford (China)"): CN.
  // - Imported ("进口康明斯", "Imported Cummins Series": the make's own country) or a country written beside the make
  //   ("UK Perkins", "日本三菱", "德国MTU", "瑞典沃尔沃", "Cummins India"): that country.
  // - Both kinds, or two countries ("进口康明斯系列_..._合资康明斯系列", sanq-power's page title): not known.
  // - Nothing written: China for a Chinese make, the country Khoa settled on for the make (MADE_DEFAULT), else not known.
  // { at: "CN" | "GB" | … | "?", why: the words read (or how it was decided), null when nothing tells }.
  const CN_PLANT = {
    Cummins: /\b[DCX]CEC\b|(dong\s?feng|chong\s?qing|xi'?an)[\s-]*cummins|(东风|重庆|西安)康明斯/i,
    Perkins: /wuxi[\s-]*perkins|perkins[\s-]*wuxi|无锡(珀|帕)金斯/i,
    Mitsubishi: /\bSME\b|上海菱重|上海三菱|shanghai[\s-]*(mhi|mitsubishi)/i,
    MTU: /mtu[\s-]*(yuchai|yc)\b|yuchai[\s-]*mtu|玉柴\s*mtu/i,
    Baudouin: /weichai[\s-]*baudouin|潍柴\s*博杜安/i,
    Doosan: /烟台\s*斗山|doosan[\s-]*yantai/i,
    Stamford: /wuxi[\s-]*stamford|stamford[\s-]*wuxi|无锡\s*斯坦福/i,
    "Leroy-Somer": /fuzhou[\s-]*leroy|leroy[\s-]?somer[\s-]*\(?\s*fuzhou|福州\s*利莱森玛/i,
  };
  // Names of a make in a row beyond the catalog's own (ENGINE_BRANDS / ALT_BRANDS / CONTROLLERS).
  const MAKE_ALSO = { Perkins: "帕金斯", Mitsubishi: "菱重" };
  // China only right after the make, in brackets or not followed by a trader's words: "China Perkins Series Diesel
  // Generator factory and manufacturers" (mamo-power), "Powered by Kubota China Manufacturers" (superwatt-power) are page
  // titles of a seller in China, not of a plant.
  const CN_AFTER = "[\\s-]*[(（]\\s*(china|p\\.?r\\.?c\\.?|中国)|[\\s-]+china(?![a-z])(?![\\s-]*(manufactur|supplier|factor|export|wholesal|compan|co\\b|co\\.|ltd|price|quot|dealer|seller|brand))";
  const COUNTRY_WORD = [["GB", "uk|u\\.k\\.?|england|britain|英国"], ["US", "usa|u\\.s\\.a\\.?|america|美国"],
    ["JP", "japan|日本"], ["DE", "germany|德国"], ["FR", "france|法国"], ["IT", "italy|意大利"], ["SE", "sweden|瑞典"], ["KR", "korea|韩国"],
    ["IN", "india|印度"]];
  const makeWord = (kind, n) => {
    const list = kind === "engine" ? ENGINE_BRANDS : kind === "alternator" ? ALT_BRANDS : CONTROLLERS.map((c) => [c.word, c.brand]);
    const src = list.filter(([, b]) => b === n).map(([re]) => re.source);
    return src.length ? `(?:${[...src, MAKE_ALSO[n]].filter(Boolean).join("|")})` : null;
  };
  const madeRe = new Map();
  // The signs of one make: [[place ("CN", a country, or "home" for imported), RegExp], …].
  function madeSigns(kind, n) {
    const k = `${kind}|${n}`;
    if (madeRe.has(k)) return madeRe.get(k);
    const mk = makeWord(kind, n), out = [];
    if (CN_PLANT[n]) out.push(["CN", CN_PLANT[n]]);
    if (mk) {
      out.push(["CN", new RegExp(`(合资|国产)\\s*${mk}`, "i")]);
      out.push(["home", new RegExp(`(进口|imported\\s*)${mk}|${mk}\\s*(diesel\\s*)?(engines?\\s*)?[-(（]?\\s*(进口|imported\\b)`, "i")]);
      out.push(["CN", new RegExp(`${mk}(${CN_AFTER})`, "i")]);
      for (const [c, w] of COUNTRY_WORD) out.push([c, new RegExp(`(?<![a-z])(${w})(?![a-z])\\s*[-(（]?\\s*${mk}|${mk}\\s*[-(（]?\\s*(made\\s*in\\s*)?(${w})(?![a-z])`, "i")]);
    }
    madeRe.set(k, out);
    return out;
  }
  // The signs in one text: [{ at, why }].
  const signsIn = (kind, list, t) => {
    const hits = [];
    for (const n of list) for (const [p, re] of madeSigns(kind, n)) {
      const m = t.match(re);
      if (m) hits.push({ at: p === "home" ? makeCountry(kind, n) || "?" : p, why: m[0].trim() });
    }
    return hits;
  };
  const entryMakes = (e) => String(e.make || "").split(" / ").filter(Boolean);
  const makeCountry = (kind, n) => (kind === "engine" ? (FOREIGN_ENGINE.has(n) ? ENGINE_COUNTRY[n] : "CN") : (kind === "alternator" ? ALT_COUNTRY : CTRL_COUNTRY)[n]) || null;
  // Woodward: Kraków makes the easYgen-1500 / 2000 / 3000 / 3000XT; the easYgen-800 may be made in China (not checked).
  // { at, why } | null. The maker's record (madeFrom) first; without it the old table.
  const madeDefault = (n, model) => {
    const f = madeFrom.get(n);
    if (f?.at) return { at: f.at, why: f.why };
    if (f?.models) {
      const m = String(model || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const hit = m && f.models.find(([t]) => m.includes(t));
      return hit ? { at: hit[1], why: hit[2] } : null;
    }
    const at = n === "Woodward" ? (/easy\s?gen\s?-?(1500|2000|3000)/i.test(String(model || "")) ? "PL" : null) : MADE_DEFAULT[n] || null;
    return at ? { at, why: "mặc định theo hãng (Khoa chốt 16/11/2026)" } : null;
  };
  // `text`: one text, or the texts from the nearest to the farthest (the row, its column titles, the page title): the
  // nearest that tells decides ("Cummins (USA)" on fdk-energy's row under a page title naming CCEC and Cummins India).
  function madeIn(kind, makes, text, model) {
    const levels = [].concat(text ?? "").map((x) => String(x || "").normalize("NFC")).filter(Boolean), list = (makes || []).filter(Boolean);
    // No make the sources agree on: only a Chinese plant (which names its make) tells.
    if (!list.length) {
      for (const t of levels) for (const [n, re] of Object.entries(CN_PLANT)) { const m = t.match(re); if (m && makeWord(kind, n)) return { at: "CN", why: m[0] }; }
      return { at: "?", why: null };
    }
    for (const t of levels) {
      const hits = signsIn(kind, list, t), at = [...new Set(hits.map((h) => h.at))];
      if (!hits.length) continue;
      if (at.length === 1 && at[0] !== "?") return { at: at[0], why: hits.map((h) => h.why).join("; ") };
      return { at: "?", why: `nguồn ghi nhiều nơi: ${hits.map((h) => h.why).join("; ")}` };
    }
    const cnMake = list.find((n) => makeCountry(kind, n) === "CN");
    if (cnMake) return { at: "CN", why: `hãng Trung Quốc (${cnMake})` };
    const ds = list.map((n) => madeDefault(n, model)), d = [...new Set(ds.map((x) => x?.at || null))];
    if (d.length === 1 && d[0]) return { at: d[0], why: ds[0].why };
    return { at: "?", why: null };
  }
  // The text of one row of an entry that may tell the place: the row, its column titles, the table / page title.
  const useText = (u) => [[u.line, u.text, ...(u.lines?.rows || [])], [...(u.header || []), ...(u.lines?.header || [])], [u.title]].map((l) => l.filter(Boolean).join(" \n "));
  // Place of manufacture of one row of a catalog entry.
  const madeAt = (e, u) => madeIn(e.kind, entryMakes(e), useText(u || {}), e.model);
  // Countries of the brand; [] when no source names the make.
  const brandOf = (e) => [...new Set(entryMakes(e).map((n) => makeCountry(e.kind, n)).filter(Boolean))];
  // Places of manufacture over the rows of the entry ("?" for a row that does not tell).
  const madeOf = (e) => [...new Set((e.uses.length ? e.uses : [{}]).map((u) => madeAt(e, u).at))];

  // Động cơ, đầu phát, bộ điều khiển named in a won goods row (bidhist goods: "Cấu hình, tính năng kỹ thuật cơ bản",
  // Khoa 2026-11-09): after each label ("Động cơ:", "Đầu phát:", "Bộ điều khiển:", "Engine", "Alternator"...) up to the
  // next label, the make (ENGINE_BRANDS / ALT_BRANDS, or any word after "hãng" / "thương hiệu" / "nhà sản xuất") and the
  // model, as written: the code after "model" / "mã hiệu" / "kiểu", else the first code of the part. A controller is
  // read by controllersIn, else the same way. Only codes (isCode) count, never voltages, powers, ratings or sizes, so a
  // part that names no code is left out. `text` is the part of the row it was read from.
  const PART_LBL = [
    ["engine", /(?:động|đông|dộng)\s*cơ(?!\s*(?:và|\+|,|\/)\s*(?:đầu|máy))|\bengine\b(?!\s*(?:speed|oil|and))|发动机|柴油机/gi],
    ["alternator", /(?:đầu|củ|phần)\s*(?:máy\s*)?phát(?:\s*điện)?|\balternator\b|generator\s*end|máy\s*phát\s*điện\s*xoay\s*chiều|发电机/gi],
    ["controller", /(?:bộ|bảng|tủ|màn\s*hình)\s*điều\s*khiển(?:\s*(?:tự\s*động|kỹ\s*thuật\s*số|trung\s*tâm))?|\bcontroll?er\b|control\s*(?:panel|module)|控制器/gi],
  ];
  const PART_STOP = /^(?:DC|AC)\d|^\d+(?:v|mm|db|kg)(?![a-z\d])|^\d+(?:m|cm3|lits?|ma|kwm|bkw|ekw|vdc|vac|ai|ao)$|^DN\d|kwm\/|\d+-\d+ma$|^\d+D[IO]\b|^\d+P-|^\d+x\d|\d(?:k?w|kva|v|vac|hz|rpm|a|ah|l|mm|kg|db|%)$|\d(?:kw|kva|hz|rpm)\b|\/\d*(?:hz|v|pha|ph)\b|^(?:IP|IEC|ISO|TCVN|EN|BS|EURO|TIER|STAGE|CLASS|G7|G20|MKI*|MK\d|RS\d{3}|USB\d?|CAN|J1939|AVR|ATS|ACB|MCCB|SX\d{3}|AS\d{3}|MX\d{3}|R\d{3}|DVR\d*)$/i;
  // Series prefixes written apart from the code ("TAL A44K", "UCI 274", "ECP 34"): taken together with the next word.
  const PART_PREFIX = /^(TAL|LSA|UC[DIM]{0,2}|HC[IKM]?|PI|PE|S\d?|LL|ECP|ECO|NPE|MP|MX|LV[ISM]?|DSE|HGM|AMF|DKG|QS[BKLMNTXZ]|KTA?A?|NTA?A?|VTA?|TAD|TWD|BF\d?M|SY\d+)$/i;
  const partCode = (w) => isCode(w) && w.split(" ").every((x) => !PART_STOP.test(x) && /^[A-Z0-9][A-Z0-9.\-/+]*$/i.test(x)) && !/^cm\d$/i.test(w);
  function partModel(seg) {
    const words = seg.replace(/[,;()"“”|]/g, " ").split(/\s+/).map((w) => w.replace(/^[:：\-–.]+|[:：.,\-–]+$/g, "")).filter(Boolean);
    // A series word written apart ("KYO 164D", "SMF 180E", "TAL A44K") goes with the code after it. A bare short code
    // (digits and one or two letters: "184G") counts only right after "model", never met in passing.
    const at = (i, named) => {
      const w = words[i] || "", n = words[i + 1] || "";
      if (n.length >= 3 && /\d/.test(n) && (PART_PREFIX.test(w) || (/^[A-Z]{2,5}$/.test(w) && /^\d/.test(n) && !/^(AC|DC|IP|ISO)$/.test(w)
        && !brandIn(w, [...ENGINE_BRANDS, ...ALT_BRANDS]).length)) && partCode(`${w} ${n}`)) return `${w} ${n}`;
      return partCode(w) && (named || !/^\d+[A-Z]{1,2}$/i.test(w)) ? w : null;
    };
    // "Model: X", "model X", "Mã hiệu: X", "kiểu X", "type X" first.
    for (let i = 0; i < words.length - 1; i++) if (/^(model|mã|mã\s*hiệu|hiệu|kiểu|type|loại)$/i.test(words[i]) || /^model[:：]/i.test(words[i])) {
      const inl = words[i].match(/^model[:：](.+)$/i);
      if (inl && partCode(inl[1])) return inl[1];
      for (let j = i + 1; j < Math.min(words.length, i + 3); j++) { const m = at(j, true); if (m) return m; }
    }
    for (let i = 0; i < words.length; i++) { const m = at(i); if (m) return m; }
    return null;
  }
  function partsIn(text) {
    // "Ðộng cơ" written with the Icelandic Ð (U+00D0) on some rows.
    const s = String(text || "").normalize("NFC").replace(/Ð/g, "Đ").replace(/ð/g, "đ"), hits = [];
    for (const [kind, re] of PART_LBL) for (const m of s.matchAll(re)) hits.push({ kind, at: m.index, end: m.index + m[0].length });
    hits.sort((a, b) => a.at - b.at);
    const out = [];
    hits.forEach((h, i) => {
      if (i && hits[i - 1].end > h.at) return;
      const stop = hits.slice(i + 1).find((x) => x.at >= h.end);
      const seg = s.slice(h.end, Math.min(stop ? stop.at : s.length, h.end + 200));
      let make = null, model = null;
      if (h.kind === "controller") {
        const c = controllersIn(seg)[0] || controllersIn(s.slice(h.at, h.end) + seg)[0];
        if (c) { make = c.brand; model = c.model; }
      }
      if (!model) model = partModel(seg);
      if (!model) return;
      if (!make) make = brandIn(seg, h.kind === "engine" ? ENGINE_BRANDS : h.kind === "alternator" ? ALT_BRANDS : CONTROLLERS.map((c) => [c.word, c.brand]))[0]
        || (seg.match(/(?:hãng|thương\s*hiệu|nhãn\s*hiệu|nhà\s*sản\s*xuất|hiệu)\s*[:：]?\s*([A-Za-zÀ-ỹ][\wÀ-ỹ&.\- ]{1,24}?)(?=\s*[-,;+|(•]|\s+(?:model|mã|ký|xuất|sản|hãng|nhà|-)|$)/i) || [])[1]?.trim() || null;
      const k = keyOf(model);
      if (out.some((o) => o.kind === h.kind && keyOf(o.model) === k)) return;
      out.push({ kind: h.kind, make, model, text: (s.slice(h.at, h.end) + seg).replace(/\s+/g, " ").trim().slice(0, 160) });
    });
    return out;
  }

  const VOTE_KEYS = new Set(["cyl", "disp", "bore", "compr"]);
  // One supplier, one vote per figure (depco-sua, Khoa 17/11/2026; majority rule of 16/11: a value wins with 3 suppliers
  // or more and 3 times as many as each other value). `bySup`: Map supplierId → the values that supplier gives for one
  // model and one key. A supplier giving two different values (two tables of one model) votes for the one that the
  // others' majority has; with no such majority, or without that value among its own, it gives no vote.
  // → { votes: Map value → [supplierId], win: value | null, split: [supplierId] (suppliers giving two values),
  //     dropped: [supplierId] (no vote) }.
  function tally(bySup) {
    const sups = [...bySup].map(([s, vs]) => [s, [...new Set((vs || []).filter((v) => v != null))]]).filter(([, vs]) => vs.length);
    const support = new Map();
    for (const [, vs] of sups) for (const v of vs) support.set(v, (support.get(v) || 0) + 1);
    const each = sups;
    const winOf = (m) => {
      const e = [...m].sort((a, b) => b[1] - a[1]);
      return e.length && e[0][1] >= 3 && e.slice(1).every(([, c]) => e[0][1] >= 3 * c) ? e[0][0] : null;
    };
    const single = new Map();
    for (const [, vs] of each) if (vs.length === 1) single.set(vs[0], (single.get(vs[0]) || 0) + 1);
    const win0 = winOf(single), votes = new Map(), split = [], dropped = [];
    const vote = (v, s) => votes.set(v, [...(votes.get(v) || []), s]);
    for (const [s, vs] of each) {
      if (vs.length === 1) { vote(vs[0], s); continue; }
      split.push(s);
      if (win0 != null && vs.includes(win0)) vote(win0, s); else dropped.push(s);
    }
    return { votes, win: winOf(new Map([...votes].map(([v, ss]) => [v, ss.length]))), split, dropped };
  }

  // fuelOf(table, url, line?): { fuel, from, why } or null (the rule of the section "Fuel of a table and of its rows").
  const fuelOf = (t, url, line = null) => fuelFrom(fuelSigns(t, url), line);
  const api = { build, builder, fuelOf, tally, partsIn, fromSupplier, gensetsOf, GENSET_TABLES, unread, linePower,prime: (s) => { if (s && typeof s === "object") rowsOf(s); }, needsOf, suggest, isCode, powersIn, cellsOf, keyOf, specKey, headingOf, originOf, originIn, groupOf, groupIn, brandOf, madeOf, madeAt, madeIn, useManufacturing, controllersIn, SPEC, ENGINE_BRANDS, ALT_BRANDS, FOREIGN_ENGINE, ENGINE_COUNTRY, NO_GROUP, COUNTRY_GROUP, CONTROLLERS, columnSheets };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GenbidCatalog = api;
})(typeof window !== "undefined" ? window : globalThis);
