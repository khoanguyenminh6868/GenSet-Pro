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
  const SCANIA_CODE = /^[DO]C\s?\d{1,2}\s\d{2,3}[A-Z]\s\d{2}[\s-]\d{2}$/i;
  const DOOSAN_P = /^P\d{3}(?:TI|LE)\b/i; // Doosan engines that look like an alternator's P-frame ALT_CODE
  const FRAME_ALT =/^(16|18|22|27|31|35)4[A-Z]{1,2}$/;
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
    ["disp", "engine", "Dung tích xi lanh", /displace|swept|\bdisp\b|排量/i, null, /^\d+([.,]\d+)?\s*(l|ltr|litres?|cc|ml)?$/i],
    ["cyl", "engine", "Số xi lanh", /cylinder|^cyl|^cil|气缸|缸数/i, /air\s*flow/i, /^(\d{1,2}|\d{1,2}\s*[-–]?\s*(l|v|in-?line|cyl\w*)\b.*|[lv]\s?-?\d{1,2}|in-?line.*|vertical.*|v-?type.*)$/i],
    ["compr", "engine", "Tỉ số nén", /compression/i, null, /\d\s*:\s*1|^\d+(\.\d+)?$/],
    ["asp", "engine", "Nạp khí", /aspirat|intake|进气|吸气/i, null, /turbo|natural|aftercool|intercool|增压|自然|ta\b|na\b/i],
    ["gov", "engine", "Điều tốc", /gov|调速/i, null, /electr|mechan|electron|ecu|governor|电子|机械|\bg[123]\b|class/i],
    ["emission", "engine", "Tiêu chuẩn khí thải", /emission|排放/i, null, /^(?![\s\S]*stage(?:[4-9]|[1-9]\d)\b)[\s\S]*(?:stage|tier|euro|epa|non-road|exempt|china|\bgb\b|国[一二三四五ⅡⅢⅣ]|[ⅡⅢⅣ]|\b(ii|iii|iv|v)\b|\bt[1-4]\b)/i],
    // ^ "CHINA STAGE4" … "CHINA STAGE18" (baifa n101, a spreadsheet's fill run counting up from "CHINA STAGE3"): no such
    //   stage; a figure glued to "STAGE" from 4 up is not read (catalog-a; no other value in cn/ is written that way).
    ["coolant", "engine", "Nước làm mát", /coolant|cooling\s*water|water\s*(tank|capacity)/i, /temp|温度|pressure|压力|flow/i, /^\d/],
    // Charge-air / piston cooling is not the engine's cooling system ("Air/Air cooling", "Aftercooling", "Charge Air Cooling").
    ["aircool", "engine", "Làm mát khí nạp / piston", /after\s*-?cool|charge\s*air|piston\s*cool|inter\s*-?cool|air\s*\/\s*(air|water)\s*cool|增压空气|活塞冷却/i, null, COOL],
    ["cooling", "engine", "Làm mát",/cooling\s*(system|type|method|mode)?$|冷却方式/i, /air\s*flow|after\s*-?cool|charge\s*air|piston|inter\s*-?cool|air\s*\/|增压空气|活塞/i, COOL],
    ["oil", "engine", "Dầu bôi trơn", /lub|oil\s*(capacity|tank|system|sump|ststem)|机油|润滑油/i, /brand|temp|温度|pressure|压力|consum|消耗|耗率|耗量/i, N],
    ["start", "engine", "Khởi động", /start/i, null, /\d\s*v|electric|电/i],
    ["engPower", "engine", "Công suất động cơ", /(engine|gross).*(power|output)|kw\s*\/\s*rpm|kw\/hp/i, null, /^\d/],
    ["speed", "engine", "Tốc độ quay", /speed|\brpm\b|r\/min|转速/i, /regul|rate\s*\(%\)|over\s*-?\s*speed|超速|torque|扭矩|\d\s*v\s*\/\s*\d+\s*hz/i, /\b(1[05]00|1800|3000|3600|[12]\d{3})\b/],
    ["engType", "engine", "Kiểu động cơ", /^(diesel\s*)?engine\s*type$/i, null, /stroke|cool|line|turbo|vertical|冲程/i],
    ["eff", "alternator", "Hiệu suất đầu phát", /efficien|效率/i, /fuel|thermal|overall|total|electrical|热效|综合/i, /\d\s*[%％]|^\d{2}(\.\d+)?$/],
    ["insul", "alternator", "Cấp cách điện", /insulat|绝缘/i, null, /\b[bfh]\b|class|级/i],
    ["ip", "alternator", "Cấp bảo vệ", /protection|\bip\b|防护/i, null, /ip\s?\d/i],
    ["excit", "alternator", "Kích từ / AVR", /excit|\bavr\b|励磁/i, null, /brush|self|pmg|shunt|aref|separately|\bavr\b|自励|永磁|无刷|有刷/i],
    ["thd", "alternator", "Méo sóng hài (THD)", /harmonic|\bthd\b|谐波/i, null, /\d\s*[%％]/],
    ["vreg", "alternator", "Ổn định điện áp", /voltage\s*(regul|stab|stead)|调压/i, /time|时间/i, /\d\s*[%％]/i],
    ["freg", "genset", "Ổn định tần số", /frequency\s*(regul|wav|recover|stab)|frequencyrecovery|smooth\s*speed/i, null, /\d\s*[%％s]/i],
    ["current", "genset", "Dòng điện định mức", /rated\s*current|电流/i, /breaker|断路器|空开/i, /^\d/],
    ["voltage", "genset", "Điện áp", /voltage|电压|điện áp/i, /dc|start|level|type|regul|stab|sudden|warp|dip|transient|drop|偏差|fre\w*\s*\/\s*volt|频率\s*\/\s*电压/i, /^\D{0,3}\d{3}/],
    ["pf", "genset", "Hệ số công suất", /power\s*factor|(?<![a-z])cos(?![a-z])|功率因数/i, null, /0[.,]\d|^1$/],
    ["phase", "genset", "Số pha", /phase|wire|相数/i, null, /^[13]$|[13]\s*-?\s*(ph|phase|相)|\d\s*-?\s*wire|three|single|三相|单相/i],
    ["controller", "genset", "Bộ điều khiển", /^(controller|control\s*(module|panel)|控制器)\s*(model|type|brand)?\s*[:：]?$/i, null, /[a-z]{2,}\s?-?\d{3,}/i],
  ];
  const SPEC = Object.fromEntries(SPECS.map(([key, scope, vi, , , ok]) => [key, { scope, vi, ok }]));
  // Pure in the label and asked for every cell of every row: remembered per label (most of the time of build()).
  const specKeys = new Map();
  function specKey(label) {
    const L = String(label || "").trim();
    if (!specKeys.has(L)) specKeys.set(L, specKeyOf(L));
    return specKeys.get(L);
  }
  function specKeyOf(L) {
    if (!L || L.length > 70 || /\bmodel\b|型号|brand|make|品牌|厂家/i.test(L)) return null;
    // Genset power is read on its own (powersIn); an engine's own output is kept here.
    if (/power|output|capacity|rating|功率/i.test(L) && !/(engine|gross).*(power|output)|kw\s*\/\s*rpm|kw\/hp|power\s*factor|功率因数|tank|fuel|consum|油耗|\d\s*%\s*(load|prime|prp|功率|负载|\(?\s*of)/i.test(L)) return null;
    for (const [key, , , re, not] of SPECS) if (re.test(L) && !(not && not.test(L))) return key;
    return null;
  }
  const UNIT_CELL = /^\(?(kva|kw|kw\/kva|kva\/kw|v|hz|db\(?a?\)?|l\/h|l\/hr|mm|kg|kgs|l|rpm|r\/min|g\/kw\.?h|g\/kwh|%|a|cm|m)\)?$/i;
  // A cell that is itself a label ("(瞬态电压偏差):", "Exciter Type") is not a value.
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
    if (/^[\d.,~\-–/\s]+(hz|rpm|r\/min|v|vac|kv|l|ltr|kg|kgs|mm|kw|kva|kwe|db|dba|a|%|cc|ml|g\/kwh|g\/kw\.h|l\/h|hp|ps|nm|°c|h|hrs?)$/i.test(s) || /\d\s?cc$/i.test(s)) return false;
    if (/^(ip|class|euro|tier|stage|china|epa|gb|iso|en|iec|bs|ce|non-road|cn|eu)\b/i.test(s) || /^(ip|f|h)\d{1,2}$/i.test(s)) return false;
    if (/^\d{1,2}\s*[lv](\/|$|\s)|^[lv]\s?\d{1,2}$|^\d{1,2}[lv]\/|\/na$|^in-?line/i.test(s)) return false;
    if (/^(n\/a|na|tbd|\d+p)$/i.test(s) || CONTROLLER.test(s)) return false;
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
  const freqIn = (text, labelOnly = false) => {
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
      const got = {}, clash = new Set(), bare = new Set(), at = {}, inh = new Set();
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
        // each have a title of their own, "kVA LTP | kVA PRP" over "2500 | 2000", stand)
        if (!own && at.prime === at.standby && Object.keys(got.prime).length === 1 && Object.keys(got.standby).length === 1 && Math.abs(p - 0.8 * s) <= 0.011 * s) return { veto: true };
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
      const subline = gi >= 0 && tm < 0 && tp === 0;
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
    let part = null;
    // GFE datasheets head the sheet with "| Engine | Alternator", then "| Cummins | Stamford | GFE2200CSC" (makes and
    // the genset model) and "| QSK50-G17 | S7L1D-G41" (models): stack counts the lines read after that heading.
    let stack = 0;
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
      if (lead) { part = lead[1].toLowerCase(); c = c.slice(1); }
      const head = c.length === 1 ? headingOf(c[0]) : undefined;
      if (head !== undefined) { if (head !== "keep") part = head; continue; }
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
      const sk = specKey(label);
      if (sk && /^fuel/.test(sk) && !W) {
        const col = (cols[0] = cols[0] || {}), specs = (col.specs = col.specs || []), got = {};
        let load = sk === "fuel75" ? 75 : sk === "fuel50" ? 50 : 100;
        for (const v of c.slice(1)) {
          const pct = String(v).match(/^\D*(\d{2,3})\s*%\s*\D*$/);
          if (pct && !/^[≤<~≈]?\s*\d[\d.,]*\s*%$/.test(String(v).trim())) { load = Number(pct[1]); continue; }
          const val = specVal(v), k = load === 75 ? "fuel75" : load === 50 ? "fuel50" : load === 100 ? "fuel" : null;
          if (!k || !val || !specFits(k, val)) continue;
          const lh = /l\s*\/\s*h|l\/hr|lph|litres?\/h|lít/i.test(val);
          if (got[k] && !(lh && !got[k].lh)) continue;
          got[k] = { key: k, label, value: val, lh };
        }
        for (const g of Object.values(got)) { const i = specs.findIndex((x) => x.key === g.key); if (i < 0) specs.push({ key: g.key, label: g.label, value: g.value }); }
        continue;
      }
      if (sk) {
        const sv = c.slice(1).filter((v) => v && !UNIT_CELL.test(v));
        sv.forEach((v, j) => { const val = specVal(v); if (val && specFits(sk, val)) { const col = (cols[j] = cols[j] || {}); (col.specs = col.specs || []); if (!col.specs.some((x) => x.key === sk)) col.specs.push({ key: sk, label, value: val }); } });
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
      else if (/power|output|capacity|rating|功率|công suất/i.test(L) && !/factor|engine|消耗|consum|start|heater|charg|battery|启动|起动|加热|充电/i.test(L)) {
        const kind = PRIME_RATE.test(L) ? "prime" : STANDBY.test(L) ? "standby" : "rated";
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
          const pair = String(v).replace(/\s+/g, "").match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
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
      engines: { GX390: "https://engines.honda.com/models/model-detail/x-large-gx", GX630: "https://engines.honda.com/models/model-detail/v-twin-horizontal", GX690: "https://engines.honda.com/models/model-detail/v-twin-horizontal" }, why: HONDA_GX },
    { supplierId: "zc-power", ns: [109], part: "genset", fuel: "gasoline", why: 'tên trang "Gasoline Generators | Factory-Direct Prices | ZC Power"' },
  ];
  // The fuel of record `o` (of `fromSupplier`, or `part` "genset" = of `gensetsOf`) by FUEL_PAGES, or null.
  // `h0`: the first header line of the SAVED table (s.specTables, before tidyTable joins the spaces between Han characters).
  const fuelPage = (id, o, h0, part = "row") => {
    const p = FUEL_PAGES.find((x) => x.supplierId === id && x.ns.includes(+o.n) && (x.part || "row") === part);
    if (!p) return null;
    if (p.header != null && String(h0 ?? "").trim() !== p.header) return null;
    if (!p.engines) return { fuel: p.fuel, from: p.from || "T", why: p.why };
    const m = o.kind === "engine" && Object.keys(p.engines).find((k) => keyOf(k) === keyOf(o.model));
    return m ? { fuel: p.fuel, from: p.from || "T", why: p.why.replace("%M", m).replace("%U", p.engines[m]) } : null;
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
      const makesFor = (kind, rowText, brandCell, model = "") => {
        const list = kind === "engine" ? ENGINE_BRANDS : ALT_BRANDS, makes = [];
        const cell = brandCell ? brandIn(brandCell, kind === "engine" ? list : ALT_CELL_BRANDS) : [];
        const row = brandIn(rowText, list), hdr = kind === "engine" ? hEng : hAlt, ttl = kind === "engine" ? tEng : tAlt;
        const own = kind === "alternator" ? brandIn(model, [FG_WILSON]) : []; // FG Wilson written in the alternator's own cell
        if (cell.length === 1) addMake(makes, cell[0], "dòng bảng");
        else if (row.length === 1) addMake(makes, row[0], "dòng bảng");
        else if (own.length === 1) addMake(makes, own[0], "dòng bảng");
        else if (kind === "alternator" && CN_ALT_CODE.test(String(model).trim())) return makes;
        else if (hdr.length === 1) addMake(makes, hdr[0], "tiêu đề cột");
        else if (ttl.length === 1) addMake(makes, ttl[0], "tên trang");
        else if (s.role === (kind === "engine" ? "engine_maker" : "alternator_maker")) { const o = ownBrand(list); if (o.length === 1) addMake(makes, o[0], "hãng sản xuất"); }
        return makes;
      };
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
            out.push({ ...base, kind: "engine", model: c.engine.replace(/^(cummins|perkins|weichai|yuchai|deutz|volvo|baudouin|mtu|doosan|mitsubishi|sdec|kubota|yanmar|isuzu|ricardo|lovol|fawde)\s+/i, ""), makes: makesFor("engine", c.engine + " " + (c.engineBrand || ""), c.engineBrand), genset: c.genset || null, power, freq: tFreq || freqIn(block.join(" "), true), other: c.alternator || null, specs: c.specs || [], lines: { header: t.header || [], rows: t.rows } });
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
      t.rows.forEach((line, ri) => {
        // A note after the code ("1104C-44TAG2 made in china", "4BTA3.9-G2 （ QC58/67E ）") makes the cell
        // fail isCode and the next code (the alternator) would be read as the engine: drop the note.
        // An engine offered in two ratings in one cell ("6BT5.9-G1(G2)", "4B3.9-G1（G2）", simpson-power): which one the set
        // has is not known, and the row gives nothing (catalog-bang-r1; the note stripping below took "4B3.9-G1", and with the
        // cell left blank the next code, the datasheet "SP0022D-C.pdf", was read as the engine).
        const twoG = cellsOf(line).filter((c) => /-G\d+\s*[(（]\s*G\d+\s*[)）]$/i.test(c));
        if (twoG.length) { note(t, ti, ri, "một ô ghi hai mã", twoG.join(", ")); return; }
        // "CG250-H1 CONTACT" (fdk-energy): the page's "Contact" link text run into the model cell (catalog-a).
        const raw = cellsOf(line).map((c) => c.replace(/\s+made in [a-z ]+$|\s*[（][^）]*[）]\s*$/i, "").replace(/^(\S+)\s+CONTACT$/, "$1").trim());
        // A make in Chinese, "&", then the code ("沃尔沃 & TAD530GE", "斯坦福 & UCI224G", rcg-power n124): the code alone is the
        // cell's model; the make stays in the row's text for makesFor (catalog-bang-r1).
        const cells = raw.map((c) => c.replace(/^[一-鿿]{1,8}\s*&\s*(?=\S*\d\S*$)/, ""));
        // A kVA / kW misread with a look-alike letter ("3S0", "312.S" in vantek) is a figure, not a model (ocrFig).
        const codes = cells.map((c, i) => (!ocrFig(cells, i) && (isCode(c) || brandedCode(c, ENGINE_BRANDS) || brandedCode(c, ALT_BRANDS)) ? i : -1)).filter((i) => i >= 0);
        if (!codes.length) return;
        // A set of two engines ("| 1100 | 1000 | … | 2 x TAD1641GE | … | SCP8610", tecnogen): the cell is no code, the
        // controller was read as the engine. The set's output is not one engine's: the row gives no engine at all.
        // The code may be written with spaces ("2 x DC13 072A 02 14", Scania): whole, joined, or its first word.
        if (cells.some((c) => { const m = c.match(/^[2-4]\s*[x×*]\s*(\S.*)$/i); /* "2*TWD1645GE" (baifa n106 TWIN, catalog-a) */ return m && [m[1], m[1].replace(/\s+/g, ""), m[1].split(/\s+/)[0]].some(isCode); })) { note(t, ti, ri, "tổ máy nhiều động cơ", line); return; }
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
          gi = codes[0] === 0 || codes[0] === 1 ? codes[0] : -1;
          const rest = codes.filter((i) => i !== gi);
          const alt = rest.filter((i) => ALT_CODE.test(cells[i]) || (hasAltCol && FRAME_ALT.test(cells[i].trim())));
          if (hasAltCol && alt.length) ai = alt[0];
          if (hasEngineCol) ei = rest.find((i) => i !== ai && !ALT_CODE.test(cells[i]) && !(hasAltCol && FRAME_ALT.test(cells[i].trim()))) ?? -1;
          if (hasAltCol && ai < 0 && ei >= 0) { const after = rest.filter((i) => i > ei); if (after.length === 1) ai = after[0]; }
          // A code of the row after the genset is a Doosan "P086TI" / "P126TI II" / "P158LE" (shaped like a Stamford P-frame) and
          // nothing else was taken as the engine, under an engine title: it is the engine; another alternator-shaped code of the row
          // ("274G") is the alternator (green-power n108 "MOTORE ENGINE", the alternator makers are columns of the header; uleengen
          // n5001 "Engine model | Alternator"; lech-cot-11).
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
              if (ai > ei && !ALT_CODE.test(cells[ai]) && !(hasAltCol && FRAME_ALT.test(cells[ai].trim()))) ai = -1;
              ei = -1;
            }
          }
        }
        const stop = ei >= 0 ? ei : ai >= 0 ? ai : cells.length;
        const titled = engineTable ? null : titledPowers((t.header || []).map(cellsOf), cells, { gi, ei, ai }, title);
        const power = engineTable ? null : titled ? titled.power : powersIn(cells.slice(gi >= 0 ? gi + 1 : 0, stop), headerText + " " + title, true);
        const common = { ...base, row: ri, line, genset: gi >= 0 ? cells[gi] : null, power, freq, header: t.header || [], specs: saneSpecs(rowSpecs(t, cells, { ei, ai, gi, power, note: (reason, detail) => note(t, ti, ri, reason, detail) }), power, (x) => note(t, ti, ri, "số vô lý so với công suất", `${x.key}=${x.value}`)) };
        if (ei >= 0) out.push({ ...common, kind: "engine", model: tidyModel(cells[ei], ENGINE_BRANDS, MARK_KEEP[s.id]), makes: makesFor("engine", rowText, null), other: ai >= 0 ? cells[ai] : null, own: engineTable });
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
    // Fuel of each record (may-khi-2): from its table's signs and its own row; kept on the record, so it reaches `uses` of build().
    const fuelSg = new Map();
    for (const o of out) {
      if (!fuelSg.has(o.table)) { const t0 = s.specTables[o.table]; fuelSg.set(o.table, fuelSigns(t0, ((s.sources || []).find((x) => x.n === t0.n) || {}).url || "")); }
      const f = fuelFrom(fuelSg.get(o.table), o.line || `| ${o.genset || ""}`) || fuelPage(s.id, o, s.specTables[o.table]?.header?.[0]);
      if (f) { o.fuel = f.fuel; o.fuelFrom = f.from; o.fuelWhy = f.why; }
    }
    return mergeRepeats(rowExceptions(s, out, note));
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
    // huatai-yangzhou n111 (catalog-b): the page puts "140/165" under "输出功率 Power of output (KW/KVA)"; it is the engine's bore /
    // stroke in mm (wudong-wuxi gives 145×165 for WD327TAD78 / 82), not the set's kW / kVA (the row's 1267–1538.5 A is a 700–850 kW
    // set). The other 14 rows of the table ("138/150", "145/165"…) already give no power (the pair fails kW / kVA).
    ...["| 700GF | 140/165 | 1267 | WD305TAD68 | 750 | 12缸V型 | 196 | 55 | 3800×1800×2100 | 4550",
      "| 800GF | 140/165 | 1448 | WD327TAD78 | 858 | 12缸V型 | 196 | 60 | 3900×1850×2100 | 5000",
      "| 850GF | 140/165 | 1538.5 | WD327TAD82 | 902 | 12缸V型 | 196 | 60 | 3900×1850×2100 | 5000"].map((line) => (
      { supplierId: "huatai-yangzhou", n: 111, genset: line.split("|")[1].trim(), line, act: "nopower", khoa: "Khoa 19/11/2026", why: "nguồn ghi đường kính / hành trình xi lanh (140/165 mm) dưới nhãn công suất: để trống công suất" })),
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
    // dropspec, Khoa 20/11/2026 ("9 dòng loại": the source itself writes a wrong figure; the live page was re-read the same day and
    // equals the saved page word for word, so it is the source, not the reader). No replacement figure is written: the source gives none.
    // aoke-yangzhou n129: 排量(L) "108" / "105" on 250 kW sets (the same table writes "14" and "12.88" for its other engines).
    ...[["AOKE-C280", "| AOKE-C280 | 250KW | 280KW | 重庆康明斯 | MTAA11-G3 | 6 | 108 | 39 | 200 | 3100*1300*1760 | 3200 | | 详细参数"],
      ["AOKE-M275", "| AOKE-M275 | 250KW | 275KW | 奔驰 | 6R1600G20F | 6 | 105 | 43 | 200 | 2900*1150*1650 | 2620 | | 详细参数"]].map(([genset, line]) => (
      { supplierId: "aoke-yangzhou", n: 129, genset, line, act: "dropspec", keys: ["disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi dung tích 108 / 105 L cho tổ máy 250 kW (bảng cùng trang ghi 14 và 12.88 L cho động cơ khác): bỏ riêng dung tích" })),
    // jlmech-wuhan n103 JL-1000GF: "458" L (160×190 mm × 12 xi lanh); the next row of the table, JL-1200GF, writes 45.8 for the same engine size.
    { supplierId: "jlmech-wuhan", n: 103, genset: "JL-1000GF", line: "| JL-1000GF | 1000 | 1250 | 1800 | 4012-46TWG2A | 12 | 160*190 | 458 | 177 | 212 | 4950*2200*2550 | 8500", act: "dropspec", keys: ["disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi dung tích 458 L (dòng kế ghi 45.8 L cho cùng cỡ động cơ): bỏ riêng dung tích, không đọc là 45.8" },
    // jlmech-wuhan n104 JL-180GF / JL-220GF: the Size cell has lost its "*" ("30001030*1550", "31001100*1750").
    ...[["JL-180GF", "| JL-180GF | 180 | 225 | 324 | YC6MK285L-D20 | 6 | 123*145 | 10.33 | 28 | 195 | 30001030*1550 | 2600"],
      ["JL-220GF", "| JL-220GF | 220 | 275 | 396 | Y06MK350L-D20 | 6 | 123*145 | 10.33 | 28 | 195 | 31001100*1750 | 2800"]].map(([genset, line]) => (
      { supplierId: "jlmech-wuhan", n: 104, genset, line, act: "dropspec", keys: ["dims"], khoa: "Khoa 20/11/2026", why: "ô kích thước mất dấu * (30001030*1550): bỏ riêng kích thước, không tự tách số" })),
    // aosif n123 AW1000 (8M33D979E201): "12V | 31.8"; the same table writes 8V / 26.1 for 8M33D845E201 (AW875). Same figures as AW1125 (PR catalog-b2-aosif).
    { supplierId: "aosif", n: 123, genset: "AW1000", line: "| AW1000 | 900/720 | 1000/800 | 8M33D979E201 | 205.4 | 12V | 31.8 |", act: "dropspec", keys: ["cyl", "disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi 12V / 31,8 L cho động cơ 8M33 (cùng bảng ghi 8V / 26,1 L cho 8M33D845E201): bỏ riêng số xi lanh và dung tích" },
    // cameo-power n107 SC-70YC (column of a table written across): Engine Power 35/41 kW under a 64/70 kW set (the two other columns repeat the set's power).
    { supplierId: "cameo-power", n: 107, genset: "SC-70YC", line: "| Engine Power(kw) (prime/standby) | 50/55 | 55/60 | 35/41", act: "dropspec", keys: ["engPower"], khoa: "Khoa 20/11/2026", why: "nguồn ghi công suất động cơ 35/41 kW nhỏ hơn tổ máy 64/70 kW: bỏ riêng công suất động cơ" },
    // jiangchai-xuzhou n107 J20B400M (6M33D506E310): current "7200" A for a 450 kVA set (neighbours: 846 A for 520 kVA).
    { supplierId: "jiangchai-xuzhou", n: 107, genset: "J20B400M", line: "| J20B400M | 400 | 450 | 潍柴博杜安 | 6M33D506E310 | 7200 | 88 | 3.673*1.5*1.95 | 4500 | 详细", act: "dropspec", keys: ["current"], khoa: "Khoa 20/11/2026", why: "nguồn ghi dòng điện 7200 A cho tổ máy 450 kVA (dòng kế 846 A cho 520 kVA): bỏ riêng dòng điện" },
    // mingbang-mbkl n125 MB-V480 (TAD1642GE): "4 | 4.4" for a 480 kW set; the table gives 4 cylinders even for its 6.0 L row (TWD1643GE, 100×127), and
    // aoke-yangzhou writes TAD1642GE as 6 cylinders / 16.12 L. Bore × stroke stays (Khoa 20/11/2026: cyl + disp only).
    { supplierId: "mingbang-mbkl", n: 125, genset: "MB-V480", line: "| 14 | MB-V480 | 600 | 480 | 660 | 528 | TAD1642GE | 4 | 4.4 | 105*127 | 118.4 | 4700×2100×2600", act: "dropspec", keys: ["cyl", "disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi 4 xi lanh / 4,4 L cho tổ máy 480 kW (nguồn khác ghi 6 / 16,12 L): bỏ riêng số xi lanh và dung tích" },
    // westinpower n1064 TP880L (a PDF table written down the page): "Rated rotation speed 1191 r/min"; the same PDF writes "Engine speed Rated 1500 RPM" on page 2.
    { supplierId: "westinpower", n: 1064, genset: "TP880L", line: "| Rated rotation speed | r/min | 1191", act: "dropspec", keys: ["speed"], khoa: "Khoa 20/11/2026", why: "nguồn ghi tốc độ 1191 v/p (trang 2 cùng PDF ghi 1500 RPM): bỏ riêng tốc độ, không lấy số trang 2 thay" },
    // huipu-power n105 HP-P1330 / n106 HP-V280, HP-V400 (Khoa duyệt 20/11/2026, cùng kiểu "458" của jlmech):
    // "Swept volume(L)" 458 (160×190 mm × 12 xi lanh; dòng HP-P1113 cùng bảng ghi 45.8 cho 4012-46TWG2A) và 1278 (131×158 mm × 6 xi lanh).
    ...[[105, "HP-P1330", "| HP-P1330 | 1200 | 1330 | 4012-46TAG2A | 12 | 160*190 | 458 | 301 | 501 | 177.1 | 4980*2200*2520 | 10200"],
      [106, "HP-V280", "| HP-V280 | 280 | 280 | TAD1341GE | 6 | 131*158 | 1278 | 65.4 | 148 | 36 | 3050*1114*1391 | 2420"],
      [106, "HP-V400", "| HP-V400 | 360 | 400 | TAD1345GE | 6 | 131*158 | 1278 | 96.8 | 210 | 36 | 3210*1114*1600 | 2750"]].map(([n, genset, line]) => (
      { supplierId: "huipu-power", n, genset, line, act: "dropspec", keys: ["disp"], khoa: "Khoa 20/11/2026", why: "nguồn ghi dung tích 458 / 1278 L (cùng cỡ động cơ ở dòng khác của trang ghi 45.8): bỏ riêng dung tích" })),
  ];
  function rowExceptions(s, list, note) {
    const ex = ROW_EXCEPTIONS.filter((x) => x.supplierId === s.id);
    if (!ex.length) return list;
    const out = [];
    for (const o of list) {
      const lines = [o.line, ...(o.lines?.header || []), ...(o.lines?.rows || [])].filter((x) => x != null).map((x) => String(x).trim());
      const x = ex.find((x) => x.n === o.n && o.genset && keyOf(o.genset) === keyOf(x.genset) && lines.includes(x.line.trim()));
      if (!x) { out.push(o); continue; }
      note({ n: o.n, title: o.title }, o.table, o.row ?? null, "ngoại lệ theo dòng", `${x.act}: ${x.khoa}, ${x.why}`);
      if (x.act === "nopower") out.push({ ...o, power: null });
      else if (x.act === "dropspec") out.push({ ...o, specs: (o.specs || []).filter((sp) => !x.keys.includes(sp.key)) });
      else if (x.act === "fixspec") {
        // Replace only a spec whose value is word for word the source's `from`; any other value (the source changed) is left as read.
        const fixed = [];
        const specs = (o.specs || []).map((sp) => {
          const f = x.fixes.find((y) => y.key === sp.key && String(sp.value).trim() === y.from);
          if (!f) return sp;
          fixed.push({ key: f.key, from: f.from, to: f.to, why: f.why, src: f.src });
          return { ...sp, value: f.to, fixed: { from: f.from, why: f.why, src: f.src } };
        });
        out.push(fixed.length ? { ...o, specs, fixed } : o);
      }
    }
    return out;
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
  const RANK = { "dòng bảng": 3, "tiêu đề cột": 2, "hãng sản xuất": 2, "tên trang": 1 };
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
  // A trailing "*" / "†" / "^" / "×" is a footnote mark, not part of the model ("QSK19-G4*", baifa "20M33G4D3/5^", tellhow
  // "KTA50-G15×"), and an en / em dash is a hyphen ("KTA50–G3", "4135D—1"): the model left alone stood apart from the same
  // model of other suppliers and missed the majority rule (catalog-b). "★" is dropped by tidyModel, where the supplier is
  // known (MARK_KEEP). O/0 and I/1 are NOT merged.
  // "^" (baifa, aosif, mecca, landtop, Weichai's own sheets…): no source found says what it means. Khoa 19/11/2026 did not
  // know either and kept the merge; it rests on no source. Merging also brings one supplier's wrong figures to the others'
  // rows: aosif "8M33D1012E311^" 12V / 31,8 L against 8 cyl / 26,14 L (waeta, wiseke) → no majority (catalog-b-1.md).
  const keyOf = (m) => String(m).normalize("NFKC").toUpperCase().replace(/[\s\-_.·–—]/g, "").replace(/[*†‡^×]+$/, "");
  const MARK_TAIL = /\s*[*＊†‡★☆^×]+$/;
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
    return s + kept;
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
      [/\bsmart\s?gen\s?(?:HGM)?\s?-?(\d{4}[A-Z]{0,3})(?![\dA-Z])/gi, (m) => `HGM${up(m[1])}`]] },
    { brand: "ComAp", word: /\bcomap\b/i, models: [
      [/\bInteli\s?(Lite|Gen|Sys|Compact|Drive|Mains)\s?(NTC|NT|4|500|1000|200)?\s?(?:(?:IL-?NT\s?)?(AMF|MRS)\s?-?(\d{1,2}))?(?![\w])/gi, (m) => ["Inteli" + m[1].replace(/^./, (c) => c.toUpperCase()), m[2] ? m[2].toUpperCase() : "", m[3] ? up(m[3]) + m[4] : ""].filter(Boolean).join(" ")],
      // ComAp order codes of InteliGen NT / NTC (IG-NT GC, IG-NTC-BB...).
      [/\bIG-?(NTC?)(?![\w])/gi, (m) => `InteliGen ${m[1].toUpperCase()}`],
      [/\bIL-?NT\s?(AMF|MRS)\s?-?(\d{1,2})(?![\w])/gi, (m) => `InteliLite NT ${up(m[1])}${m[2]}`],
      [/\b(AMF|MRS)\s?-?(20|25|9|8|10|11|15|16|18|19)(?![\w])/gi, (m) => `${up(m[1])}${m[2]}`, true]] },
    { brand: "DEIF", word: /\bdeif\b/i, models: [[/\b(AGC|SGC|GC|PPU|GPC|PPM)[\s-]?(\d{1,3}[A-Z]?|1F)(?![\w])/g, (m) => `${m[1]}-${m[2]}`, true]] },
    { brand: "Datakom", word: /\bdatakom\b/i, models: [
      [/\bDKG[\s-]?(\d{3})(?![\d])/gi, (m) => `DKG-${m[1]}`],
      [/\bD-?(\d{3,4})(?![\w])/g, (m) => `D-${m[1]}`, true]] },
    { brand: "Woodward", word: /\bwoodward\b/i, models: [[/\beasy\s?gen[\s-]?(\d{3,4})(?![\d])/gi, (m) => `easYgen-${m[1]}`]] },
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
    return out;
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
        const k = keyOf(o.model);
        if (k.length < 3) return;
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
  const api = { build, builder, fuelOf, tally, partsIn, fromSupplier, gensetsOf, GENSET_TABLES, unread, linePower,prime: (s) => { if (s && typeof s === "object") rowsOf(s); }, needsOf, suggest, isCode, powersIn, cellsOf, keyOf, specKey, headingOf, originOf, originIn, groupOf, groupIn, brandOf, madeOf, madeAt, madeIn, useManufacturing, controllersIn, SPEC, ENGINE_BRANDS, ALT_BRANDS, FOREIGN_ENGINE, ENGINE_COUNTRY, NO_GROUP, COUNTRY_GROUP, CONTROLLERS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GenbidCatalog = api;
})(typeof window !== "undefined" ? window : globalThis);
