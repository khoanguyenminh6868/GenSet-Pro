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
    [/\bjohn deere\b|\bdeere\b|约翰迪尔/i, "John Deere"], [/\bdaewoo\b|大宇/i, "Daewoo"], [/\bgoogol\b/i, "Googol"],
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
  // Mã đầu phát của các dòng phổ biến: dùng để biết ô nào là đầu phát khi bảng có cả động cơ lẫn đầu phát.
  const ALT_CODE = /^(UC[DIM]{0,2}\s?\d{3}|UCI\d|HC[IKM]?\s?\d{3}|PI\s?\d{3}|PE\s?\d{3}|S[0-9][LM]\d|P[0-9]\s?\d{2,}|LV[ISM]?\d{3}|TAL[\s-]?[A-Z]?\d{2}|LSA\s?\d{2}|LL\d{4}|ECP\s?\d{2}|ECO\s?\d{2}|NPE\s?\d{2}|MP[\s-]?\d{2,}|MX[\s-]?\d{3}|EG\s?\d{3}|1FC\d|FD\d[A-Z])/i;
  const CONTROLLER = /^(DSE|HGM|IL-|IG-|AMF|COMAP|INTELI|DEEP\s?SEA|SMARTGEN|GU\d|MRS|MEBAY|LXC|BE\d{3})/i;
  const ENGINE_LBL = /engine|发动机|柴油机|引擎|motor\s*model/i;
  const ALT_LBL = /alternator|generator\s*(model|type|brand)|发电机|电球|stamford|leroy|mecc|marathon|engga|alternador/i;
  const GENSET_LBL = /genset|gen-set|generator\s*set|机组/i;
  const PRIME = /prime|\bprp\b|continuous|\bcop\b|常用|主用|liên tục/i;
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
    [/^T?AD\d{3,4}/i, "Volvo Penta"], [/^\d{1,2}V\d{4}/i, "MTU"], [/^\d{1,2}M\d{2}/i, "Baudouin"],
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
  // Country of each foreign engine make, for Xuất xứ G7 / G20 in Gợi ý cấu hình and the supplier country filter
  // (Khoa, 2026-11-02). G20 here is its member countries other than China (Khoa: "trừ Trung Quốc"), not the EU.
  const ENGINE_COUNTRY = { Cummins: "US", Perkins: "GB", Baudouin: "FR", Deutz: "DE", "Volvo Penta": "SE", MTU: "DE", Mitsubishi: "JP",
    Doosan: "KR", Hyundai: "KR", Kubota: "JP", Yanmar: "JP", Isuzu: "JP", Scania: "SE", "John Deere": "US", Daewoo: "KR", MWM: "DE",
    Kohler: "US", "Lister Petter": "GB", Honda: "JP", Caterpillar: "US", FPT: "IT", MAN: "DE", "Detroit Diesel": "US" };
  const COUNTRY_GROUP = { g7: ["US", "GB", "DE", "FR", "IT", "JP", "CA"],
    g20: ["AR", "AU", "BR", "CA", "FR", "DE", "IN", "ID", "IT", "JP", "MX", "RU", "SA", "ZA", "KR", "TR", "GB", "US"] };
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
  const N = /\d/, TXT = /[a-z一-鿿]{3}/i, BY = /\d\s*[*×xX/]\s*\d/;
  const SPECS = [
    ["tank", "genset", "Bình nhiên liệu", /fuel\s*tank|fuel\s*capacity|tank\s*capacity|油箱/i, null, N],
    ["fuel", "genset", "Tiêu hao nhiên liệu", /consum|cons\.|\bcons\b|fuel\s*(rate|usage|efficien)|油耗|耗油|燃油消耗|燃气消耗|tiêu hao/i, /lub|oil\s*consum|air\s*consum|fan/i, /^[≤<~≈]?\s*\d[\d.,\s/~-]*\s*(%|l\/h|l\/hr|g\/kw\.?h|g\/\(kw\.?h\)|g\/kwh|l|g|kg\/h|m³\/h|m3\/h|nm3\/h|nm³\/h)?\s*$/i],
    ["noise", "genset", "Độ ồn", /noise|sound\s*(level|pressure)|噪音|噪声|độ ồn|\bdb\(?a?\)?\b/i, null, /(^|\D)([4-9]\d|1[01]\d)(?!\d)/],
    ["dims", "genset", "Kích thước", /dimen|dimention|overall\s*(size|l)|\bsize\b|l\s*[x×*]\s*w\s*[x×*]\s*h|尺寸|kích thước/i, null, BY],
    ["weight", "genset", "Khối lượng", /weigh|重量|毛重|khối lượng|trọng lượng/i, null, /^[≈~]?\s*\d/],
    ["runtime", "genset", "Chạy liên tục", /continuous\s*(run|work)|run(ning)?\s*time/i, null, N],
    ["bore", "engine", "Đường kính × hành trình", /bore|stroke|storke|strock|cylinder\s*diameter|缸径|行程/i, null, /^\d+(\.\d+)?(\s*(mm)?\s*[*×xX/]\s*\d+(\.\d+)?)?\s*[(（]?(mm)?[)）]?$/i],
    ["disp", "engine", "Dung tích xi lanh", /displace|swept|\bdisp\b|排量/i, null, /^\d+([.,]\d+)?\s*(l|ltr|litres?|cc|ml)?$/i],
    ["cyl", "engine", "Số xi lanh", /cylinder|^cyl|^cil|气缸|缸数/i, /air\s*flow/i, /^(\d{1,2}|\d{1,2}\s*[-–]?\s*(l|v|in-?line|cyl\w*)\b.*|[lv]\s?-?\d{1,2}|in-?line.*|vertical.*|v-?type.*)$/i],
    ["compr", "engine", "Tỉ số nén", /compression/i, null, /\d\s*:\s*1|^\d+(\.\d+)?$/],
    ["asp", "engine", "Nạp khí", /aspirat|intake|进气/i, null, /turbo|natural|aftercool|intercool|增压|自然|ta\b|na\b/i],
    ["gov", "engine", "Điều tốc", /gov|调速/i, null, /electr|mechan|electron|ecu|governor|电子|机械|\bg[123]\b|class/i],
    ["emission", "engine", "Tiêu chuẩn khí thải", /emission|排放/i, null, /stage|tier|euro|epa|non-road|exempt|china|\bgb\b|国[一二三四五ⅡⅢⅣ]|[ⅡⅢⅣ]|\b(ii|iii|iv|v)\b/i],
    ["coolant", "engine", "Nước làm mát", /coolant|cooling\s*water|water\s*(tank|capacity)/i, /temp|温度|pressure|压力|flow/i, /^\d/],
    ["cooling", "engine", "Làm mát", /cooling\s*(system|type|method|mode)?$|冷却方式/i, /air\s*flow/i, TXT],
    ["oil", "engine", "Dầu bôi trơn", /lub|oil\s*(capacity|tank|system|sump|ststem)|机油/i, /brand|temp|温度|pressure|压力/i, N],
    ["start", "engine", "Khởi động", /start/i, null, /\d\s*v|electric|电/i],
    ["engPower", "engine", "Công suất động cơ", /(engine|gross).*(power|output)|kw\s*\/\s*rpm|kw\/hp/i, null, /^\d/],
    ["speed", "engine", "Tốc độ quay", /speed|\brpm\b|r\/min|转速/i, /regul|rate\s*\(%\)/i, /\b(1[05]00|1800|3000|3600|[12]\d{3})\b/],
    ["engType", "engine", "Kiểu động cơ", /^(diesel\s*)?engine\s*type$/i, null, /stroke|cool|line|turbo|vertical|冲程/i],
    ["eff", "alternator", "Hiệu suất đầu phát", /efficien|效率/i, /fuel/i, /\d\s*[%％]|^\d{2}(\.\d+)?$/],
    ["insul", "alternator", "Cấp cách điện", /insulat|绝缘/i, null, /\b[bfh]\b|class|级/i],
    ["ip", "alternator", "Cấp bảo vệ", /protection|\bip\b|防护/i, null, /ip\s?\d/i],
    ["excit", "alternator", "Kích từ / AVR", /excit|\bavr\b|励磁/i, null, /brush|self|pmg|shunt|aref|separately|\bavr\b|自励|永磁|无刷|有刷/i],
    ["thd", "alternator", "Méo sóng hài (THD)", /harmonic|\bthd\b|谐波/i, null, /\d\s*[%％]/],
    ["vreg", "alternator", "Ổn định điện áp", /voltage\s*(regul|stab|stead)|调压/i, /time|时间/i, /\d\s*[%％]/i],
    ["freg", "genset", "Ổn định tần số", /frequency\s*(regul|wav|recover|stab)|frequencyrecovery|smooth\s*speed/i, null, /\d\s*[%％s]/i],
    ["current", "genset", "Dòng điện định mức", /rated\s*current|电流/i, null, /^\d/],
    ["voltage", "genset", "Điện áp", /voltage|电压|điện áp/i, /dc|start|level|type|regul|stab|sudden|warp|dip|transient|drop|偏差/i, /^\D{0,3}\d{3}/],
    ["pf", "genset", "Hệ số công suất", /power\s*factor|cos|功率因数/i, null, /0[.,]\d|^1$/],
    ["phase", "genset", "Số pha", /phase|wire|相数/i, null, /^[13]$|[13]\s*-?\s*(ph|phase|相)|\d\s*-?\s*wire|three|single|三相|单相/i],
    ["controller", "genset", "Bộ điều khiển", /^(controller|control\s*(module|panel)|控制器)\s*(model|type|brand)?\s*[:：]?$/i, null, /[a-z]{2,}\s?-?\d{3,}/i],
  ];
  const SPEC = Object.fromEntries(SPECS.map(([key, scope, vi, , , ok]) => [key, { scope, vi, ok }]));
  function specKey(label) {
    const L = String(label || "").trim();
    if (!L || L.length > 70 || /\bmodel\b|型号|brand|make|品牌|厂家/i.test(L)) return null;
    // Genset power is read on its own (powersIn); an engine's own output is kept here.
    if (/power|output|capacity|rating|功率/i.test(L) && !/(engine|gross).*(power|output)|kw\s*\/\s*rpm|kw\/hp|tank|fuel/i.test(L)) return null;
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
    if ((s.match(/\s/g) || []).length > (ALT_CODE.test(s) ? 2 : 1)) return false;
    if (/[\u3000-\u9fff\uff00-\uffef]/.test(s) || /^\d+(\.\d+)?\s*k(w|va)\s*\/\s*\d/i.test(s)) return false;
    if (/\d\s*[*×xX]\s*\d+\s*[*×xX]\s*\d/.test(s)) return false;
    if (/^\d+(\.\d+)?\s*[*×xX]\s*\d+/.test(s)) return false;
    if (/^[\d.,~\-–/\s]+(hz|rpm|r\/min|v|vac|kv|l|ltr|kg|kgs|mm|kw|kva|kwe|db|dba|a|%|cc|ml|g\/kwh|g\/kw\.h|l\/h|hp|ps|nm|°c|h|hrs?)$/i.test(s) || /\d\s?cc$/i.test(s)) return false;
    if (/^(ip|class|euro|tier|stage|china|epa|gb|iso|en|iec|bs|ce|non-road|cn|eu)\b/i.test(s) || /^(ip|f|h)\d{1,2}$/i.test(s)) return false;
    if (/^\d{1,2}\s*[lv](\/|$|\s)|^[lv]\s?\d{1,2}$|^\d{1,2}[lv]\/|\/na$|^in-?line/i.test(s)) return false;
    if (/^(n\/a|na|tbd|\d+p)$/i.test(s) || CONTROLLER.test(s)) return false;
    if (/^\d+\s?(ph|phase|wire)/i.test(s) || /^(1|3)\s?phase/i.test(s)) return false;
    return true;
  }
  const brandIn = (text, list) => {
    const hit = [];
    for (const [re, name] of list) if (re.test(text) && !hit.includes(name)) hit.push(name);
    return hit;
  };
  const freqIn = (text) => {
    const f50 = /50\s?hz|1500\s?(rpm|r\/min)/i.test(text), f60 = /60\s?hz|1800\s?(rpm|r\/min)/i.test(text);
    return f50 && !f60 ? 50 : f60 && !f50 ? 60 : null;
  };
  // Genset outputs in a list of cells: pairs "a/b" in one cell, or two neighbouring numbers.
  function powersIn(cells, headerText) {
    const pairs = [];
    for (let i = 0; i < cells.length && pairs.length < 2; i++) {
      const c = cells[i];
      const m = String(c).replace(/\s+/g, "").replace(/(kva|kw)/gi, "").match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
      if (m) { const p = pairOf(+m[1], +m[2]); if (p) pairs.push(p); continue; }
      const a = num(c), b = i + 1 < cells.length ? num(cells[i + 1]) : null;
      if (a != null && b != null) { const p = pairOf(a, b); if (p) { pairs.push(p); i++; } }
    }
    if (!pairs.length) return null;
    if (pairs.length === 2) {
      const [x, y] = pairs[0].kVA >= pairs[1].kVA ? pairs : [pairs[1], pairs[0]];
      return { standby: x, prime: y };
    }
    const p = PRIME.test(headerText), s = STANDBY.test(headerText);
    return p && !s ? { prime: pairs[0] } : s && !p ? { standby: pairs[0] } : { rated: pairs[0] };
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
  function fromLabelTable(lines) {
    const cols = [];
    // The first line naming a value wins: single-model pages often list related models further down.
    const put = (j, k, v) => { const c = (cols[j] = cols[j] || {}); if (c[k] == null) c[k] = v; };
    const merge = (j, k, v) => { const c = (cols[j] = cols[j] || {}); c[k] = { ...v, ...(c[k] || {}) }; };
    // Datasheets put the engine and the alternator under their own heading ("Engine specification", then
    // "Model | 4B3.9-G11"): a bare "Model" or "Brand" line belongs to the part whose heading it is under.
    let part = null;
    for (const l of lines) {
      let c = cellsOf(l);
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
      if (part && /^(model|model\s*no\.?|type\s*model|型号)$/.test(bare)) { if (isCode(vals[0])) put(0, part === "engine" ? "engine" : "alternator", vals[0]); continue; }
      if (part && /^(brand|make|manufacturer|品牌|厂家|制造商)$/.test(bare)) { put(0, part === "engine" ? "engineBrand" : "altBrand", vals[0]); continue; }
      const sk = specKey(label);
      if (sk) {
        const sv = c.slice(1).filter((v) => v && !UNIT_CELL.test(v));
        sv.forEach((v, j) => { const val = specVal(v); if (val && specFits(sk, val)) { const col = (cols[j] = cols[j] || {}); (col.specs = col.specs || []); if (!col.specs.some((x) => x.key === sk)) col.specs.push({ key: sk, label, value: val }); } });
        // "Engine type" is the engine model on some sites: read it as before too.
        if (sk !== "engType") continue;
      }
      if (ENGINE_LBL.test(L) && /model|type|型号|^\s*(diesel\s*)?engine\s*$|发动机$|柴油机$/i.test(L) && !/brand|make|manufactur|speed|power|output|cylinder|displace|bore|governor|consum|oil|cool|start|origin|品牌|厂家/i.test(L))
        vals.forEach((v, j) => put(j, "engine", v));
      else if (ENGINE_LBL.test(L) && /brand|make|manufactur|品牌|厂家/i.test(L)) vals.forEach((v, j) => put(j, "engineBrand", v));
      else if (ALT_LBL.test(L) && /brand|make|manufactur|品牌|厂家/i.test(L)) vals.forEach((v, j) => put(j, "altBrand", v));
      else if (ALT_LBL.test(L) && !/power|output|efficien|insulat|protect|voltage|regulat|excit|bearing|winding|pitch|temp|speed|frequency|cool/i.test(L)) vals.forEach((v, j) => /\d/.test(v) && put(j, "alternator", v)); // a model has a digit: "| Alternator | Control system" is two headings
      else if (/power|output|capacity|rating|功率|công suất/i.test(L) && !/factor|engine|消耗|consum/i.test(L)) {
        const kind = PRIME.test(L) ? "prime" : STANDBY.test(L) ? "standby" : "rated";
        vals.forEach((v, j) => {
          const both = String(v).match(/(\d+(?:[.,]\d+)?)\s*(kva|kw)\s*[/／]\s*(\d+(?:[.,]\d+)?)\s*(kva|kw)/i);
          if (both) {
            const a = +both[1].replace(",", "."), b = +both[3].replace(",", ".");
            const ua = both[2].toLowerCase(), ub = both[4].toLowerCase();
            if (ua !== ub) merge(j, kind, { [ua === "kva" ? "kVA" : "kW"]: a, [ub === "kva" ? "kVA" : "kW"]: b });
            return;
          }
          const one = String(v).match(/^(\d+(?:[.,]\d+)?)\s*(kva|kw)?$/i);
          const unit = one?.[2] || unitCell || (L.match(/\((kva|kw)\)|\b(kva|kw)\b\s*$/i) || [])[1] || (L.match(/\((kva|kw)\)/i) || [])[1];
          if (one && unit) { merge(j, kind, { [unit.toLowerCase() === "kva" ? "kVA" : "kW"]: +one[1].replace(",", ".") }); return; }
          const pair = String(v).replace(/\s+/g, "").match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
          // "Rate Power(kva) (prime/standby) | 50/55": both figures in one unit, in the order the label names them.
          const order = L.match(/(prime|standby)\s*\/\s*(prime|standby)/);
          if (pair && unit && order && order[1] !== order[2]) {
            const u = unit.toLowerCase() === "kva" ? "kVA" : "kW";
            merge(j, order[1], { [u]: +pair[1] }); merge(j, order[2], { [u]: +pair[2] });
            return;
          }
          if (pair) { const p = pairOf(+pair[1], +pair[2]); if (p) merge(j, kind, p); }
        });
      } else if (/^(genset\s*)?model|机组型号|型号$/i.test(L) && !ENGINE_LBL.test(L) && !ALT_LBL.test(L)) vals.forEach((v, j) => isCode(v) && put(j, "genset", v));
    }
    return cols.filter(Boolean);
  }
  const isLabelTable = (t) => {
    if (!t.header?.length) return true;
    const h = cellsOf(t.header[0]);
    // "| Genset Model | YCM150DCM | YCM150DCE": the models run across, one per column.
    return h.length >= 2 && /model|型号/i.test(h[0]) && h.slice(1).every((x) => isCode(x)) && t.rows.every((r) => !isCode(cellsOf(r)[0]));
  };

  // Figures of a table row, by the title of their column. Only when the header lines up with the row: the same
  // number of cells, or one fewer with the genset model in front left untitled. A second header line made only of
  // units ("| KVA/KW | L/h") is added to the title.
  function rowSpecs(t, cells, at = {}) {
    const hs = (t.header || []).map(cellsOf);
    if (!hs.length) return [];
    // The figures of titles laid over cells from `shift`; null when one value has the wrong shape (the row does not
    // line up with these titles, so none of it is used).
    const lined = (titles, units, shift, kW) => {
      const out = [];
      for (let i = 0; i < titles.length; i++) {
        const ttl = titles[i], label = units[i] ? `${ttl} (${units[i]})` : ttl, key = specKey(ttl), val = specVal(cells[i + shift]);
        if (!key || !val) continue;
        if (!specFits(key, val) || (kW !== undefined && !likely(key, val, kW))) return null;
        if (!out.some((x) => x.key === key)) out.push({ key, label, value: val });
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
    if (shift != null) { const r = lined(titles, units, shift); if (r?.length) return r; }
    // A header of several lines whose second line names every column ("| | KW | kVA | KW | kVA | Cummins | ...").
    for (const h of hs.slice(1)) if (h.length === cells.length && h.some((x) => specKey(x))) { const r = lined(h, [], 0, kWOf(at.power)); if (r?.length) return r; }
    return walkedSpecs(hs, cells, at);
  }
  // A header of several lines whose titles span columns ("Standby output" over "KVA | KW", "Displacement (L)" over two
  // lines): no line has the row's width. Each line is laid over the row from the cells whose column is known: the
  // engine model under its "Engine" title, the alternator under "Alternator", the genset model under "Model" at the
  // left, the last cell under the last title. From there it goes one cell per title until a value of the wrong shape or
  // another known cell, or at the "Engine" title over any cell but the engine's (a title before it spans two cells). A
  // figure two walks put on different cells is left out (2026-11-03: 8,771 rows had a header of another width).
  const MOVING = /power|output|功率|\bkw\b|\bkva\b|brand|make|manufactur|origin|\bc\/o\b|品牌|厂家|产地/i;
  // A title over two cells shifts every column after it without a sign in the row, so each figure laid over a cell this
  // way must also be likely for its kind and for the genset's power (prime, else standby, kW): a value that is not
  // ends the walk there ("Engine power" over prime and standby put 1207 under "Fuel consumption").
  const nums = (v) => (String(v).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
  function likely(key, v, kW) {
    const n = nums(v), x = n[0];
    if (x == null) return /^(gov|asp|emission|engType|excit|controller|cooling|start|insul|ip|phase)$/.test(key);
    switch (key) {
      case "cyl": return x >= 1 && x <= 20;
      case "disp": return /cc|ml/i.test(v) ? x >= 400 && x <= 100000 : x >= 0.4 && x <= 100;
      case "bore": return n.length >= 2 && n.slice(0, 2).every((y) => y >= 50 && y <= 400);
      case "dims": return n.length >= 3 && n.slice(0, 3).every((y) => (y >= 300 && y <= 16000) || (y >= 0.3 && y <= 16));
      case "weight": return /^[≈~]?\s*\d+(?:[.,]\d+)?\s*(kg|kgs|t)?$/i.test(String(v).trim()) && x >= 30 && x <= 80000;
      case "speed": return [1000, 1200, 1500, 1800, 3000, 3600].includes(x);
      case "engPower": return !kW || (x >= kW * 0.9 && x <= kW * 1.8);
      case "fuel": return x < 1.5 || (x >= 150 && x <= 260) || (kW ? x >= kW * 0.12 && x <= kW * 0.45 : x <= 800);
      case "noise": return x >= 40 && x <= 120;
      default: return true;
    }
  }
  const kWOf = (power) => (power?.prime || power?.rated || power?.standby)?.kW || null;
  function walkedSpecs(hs, cells, { ei = -1, ai = -1, gi = -1, power = null } = {}) {
    if (ei < 0 && ai < 0) return [];
    const kW = kWOf(power);
    const engT = (x) => ENGINE_LBL.test(x) && !specKey(x) && !MOVING.test(x), altT = (x) => ALT_LBL.test(x) && !specKey(x) && !MOVING.test(x);
    const got = new Map(), bad = new Set();
    for (const h of hs) {
      const starts = [], named = h.some((x) => engT(x) || altT(x));
      h.forEach((x, j) => {
        if (ei >= 0 && engT(x)) starts.push([j, ei, 1], [j, ei, -1]);
        if (ai >= 0 && altT(x)) starts.push([j, ai, 1], [j, ai, -1]);
      });
      if (gi === 0 && /model|型号|机组/i.test(h[0] || "") && !engT(h[0]) && !altT(h[0])) starts.push([0, 0, 1]);
      starts.push([h.length - 1, cells.length - 1, -1, true]);
      for (const [j0, c0, d, edge] of starts) {
        const mine = [];
        let anchored = !edge;
        for (let j = j0, c = c0; j >= 0 && j < h.length && c >= 0 && c < cells.length; j += d, c += d) {
          const x = h[j];
          // A title of the engine or alternator over another cell: a title before it spans two cells; what came before stays.
          if ((engT(x) && c !== ei) || (altT(x) && c !== ai)) break;
          // A line that names neither ("| Model | Cylinder No. | ... | Brushless") may lay a title that is no figure over them.
          if ((c === ei && !engT(x)) || (c === ai && !altT(x))) { if (named || specKey(x)) break; }
          if (c === ei || c === ai) anchored = true;
          const key = specKey(x), val = key && specVal(cells[c]);
          if (!val) continue;
          if (!specFits(key, val) || !likely(key, val, kW)) break;
          mine.push({ key, label: x, value: val, c });
        }
        // From the last cell alone, with no known cell on the way: only when two figures or more fit.
        if (!anchored && mine.length < 2) continue;
        for (const m of mine) { const g = got.get(m.key); if (g && g.c !== m.c) bad.add(m.key); else if (!g) got.set(m.key, m); }
      }
    }
    return [...got.values()].filter((m) => !bad.has(m.key)).map(({ key, label, value }) => ({ key, label, value }));
  }

  function addMake(list, name, via) { if (name && !list.some((m) => m.name === name)) list.push({ name, via }); }

  // One supplier record → occurrences of engines and alternators. A controller maker's tables are its controllers'
  // datasheets (suppliers/maker-datasheets.mjs), read by the config bot as the controllers' figures, not as gensets.
  function fromSupplier(s) {
    const out = [];
    if (s.role === "controller_maker") return out;
    const ownBrand = (list) => brandIn([s.names?.en, ...(s.names?.brands || [])].join(" "), list);
    (s.specTables || []).forEach((t, ti) => {
      const headerText = (t.header || []).join(" ");
      const title = String(t.title || "");
      const titleHead = title.split(/\s[|–-]\s|\|/)[0];
      const tFreq = freqIn(headerText + " " + title);
      const hEng = brandIn(headerText, ENGINE_BRANDS), hAlt = brandIn(headerText, ALT_BRANDS);
      const tEng = brandIn(titleHead, ENGINE_BRANDS), tAlt = brandIn(titleHead, ALT_BRANDS);
      const base = { supplierId: s.id, n: t.n, table: ti, title };
      const makesFor = (kind, rowText, brandCell) => {
        const list = kind === "engine" ? ENGINE_BRANDS : ALT_BRANDS, makes = [];
        const cell = brandCell ? brandIn(brandCell, list) : [];
        const row = brandIn(rowText, list), hdr = kind === "engine" ? hEng : hAlt, ttl = kind === "engine" ? tEng : tAlt;
        if (cell.length === 1) addMake(makes, cell[0], "dòng bảng");
        else if (row.length === 1) addMake(makes, row[0], "dòng bảng");
        else if (hdr.length === 1) addMake(makes, hdr[0], "tiêu đề cột");
        else if (ttl.length === 1) addMake(makes, ttl[0], "tên trang");
        else if (s.role === (kind === "engine" ? "engine_maker" : "alternator_maker")) { const o = ownBrand(list); if (o.length === 1) addMake(makes, o[0], "hãng sản xuất"); }
        return makes;
      };
      if (isLabelTable(t)) {
        for (const c of fromLabelTable([...(t.header || []), ...t.rows])) {
          const power = c.prime || c.standby || c.rated ? { ...(c.prime ? { prime: c.prime } : {}), ...(c.standby ? { standby: c.standby } : {}), ...(c.rated ? { rated: c.rated } : {}) } : null;
          const rowText = [c.genset, c.engine, c.alternator].filter(Boolean).join(" ");
          if (c.engine && isCode(c.engine.replace(/^[a-z]+\s+(?=\S*\d)/i, (m) => (brandIn(m, ENGINE_BRANDS).length ? "" : m))))
            out.push({ ...base, kind: "engine", model: c.engine.replace(/^(cummins|perkins|weichai|yuchai|deutz|volvo|baudouin|mtu|doosan|mitsubishi|sdec|kubota|yanmar|isuzu|ricardo|lovol|fawde)\s+/i, ""), makes: makesFor("engine", c.engine + " " + (c.engineBrand || ""), c.engineBrand), genset: c.genset || null, power, freq: tFreq, other: c.alternator || null, specs: c.specs || [], lines: { header: t.header || [], rows: t.rows } });
          if (c.alternator && isCode(c.alternator.replace(/^[a-z-]+\s+(?=\S*\d)/i, "")))
            out.push({ ...base, kind: "alternator", model: c.alternator.replace(/^(stamford|leroy[\s-]?somer|mecc\s?alte|marathon|engga)\s+/i, ""), makes: makesFor("alternator", c.alternator + " " + (c.altBrand || ""), c.altBrand), genset: c.genset || null, power, freq: tFreq, other: c.engine || null, specs: c.specs || [], lines: { header: t.header || [], rows: t.rows } });
        }
        return;
      }
      const hasEngineCol = ENGINE_LBL.test(headerText) || hEng.length > 0 || (s.role === "engine_maker" && !GENSET_LBL.test(headerText + " " + title));
      const hasAltCol = ALT_LBL.test(headerText) || hAlt.length > 0;
      // An engine maker's own engine table: the first cell of each row is the engine.
      const engineTable = s.role === "engine_maker" && !GENSET_LBL.test(headerText) && !/genset|generator set|机组/i.test(cellsOf(t.header?.[0] || "")[0] || "");
      t.rows.forEach((line, ri) => {
        const cells = cellsOf(line);
        const codes = cells.map((c, i) => (isCode(c) ? i : -1)).filter((i) => i >= 0);
        if (!codes.length) return;
        const rowText = cells.join(" ");
        const freq = freqIn(rowText) || tFreq;
        let gi = -1, ei = -1, ai = -1;
        if (engineTable) ei = codes[0];
        else {
          gi = codes[0] === 0 || codes[0] === 1 ? codes[0] : -1;
          const rest = codes.filter((i) => i !== gi);
          const alt = rest.filter((i) => ALT_CODE.test(cells[i]));
          if (hasAltCol && alt.length) ai = alt[0];
          if (hasEngineCol) ei = rest.find((i) => i !== ai && !ALT_CODE.test(cells[i])) ?? -1;
          if (hasAltCol && ai < 0 && ei >= 0) { const after = rest.filter((i) => i > ei); if (after.length === 1) ai = after[0]; }
          if (!hasAltCol && alt.length && hasEngineCol && ei >= 0) ai = alt.find((i) => i > ei) ?? -1;
          // With no genset model in front, a lone code is taken as the engine only in a table about engines.
          if (gi < 0 && ei === codes[0] && !hasEngineCol) ei = -1;
        }
        const stop = ei >= 0 ? ei : ai >= 0 ? ai : cells.length;
        const power = engineTable ? null : powersIn(cells.slice(gi >= 0 ? gi + 1 : 0, stop), headerText + " " + title);
        const common = { ...base, row: ri, line, genset: gi >= 0 ? cells[gi] : null, power, freq, header: t.header || [], specs: rowSpecs(t, cells, { ei, ai, gi, power }) };
        if (ei >= 0) out.push({ ...common, kind: "engine", model: cells[ei], makes: makesFor("engine", rowText, null), other: ai >= 0 ? cells[ai] : null, own: engineTable });
        if (ai >= 0) out.push({ ...common, kind: "alternator", model: cells[ai], makes: makesFor("alternator", rowText, null), other: ei >= 0 ? cells[ei] : null });
      });
    });
    return out;
  }

  // The make shown: the names given by the strongest kind of evidence (a cell of the row, a column title or the
  // maker itself before a page title, which on dealer sites often lists several brands).
  const RANK = { "dòng bảng": 3, "tiêu đề cột": 2, "hãng sản xuất": 2, "tên trang": 1 };
  function makeOf(makes) {
    if (!makes.length) return null;
    const top = Math.max(...makes.map((m) => RANK[m.via] || 0));
    return [...new Set(makes.filter((m) => (RANK[m.via] || 0) === top).map((m) => m.name))].join(" / ");
  }
  const keyOf = (m) => String(m).normalize("NFKC").toUpperCase().replace(/[\s\-_.·]/g, "");

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

  // All suppliers → { engines, alternators, controllers }: one entry per model, with every row that names it.
  function build(suppliers) {
    const maps = { engine: new Map(), alternator: new Map(), controller: new Map() };
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
    for (const s of suppliers) {
      if (!s || s.status === "incomplete") continue;
      for (const c of s.controllers || []) addCtrl(s, c, { n: (c.src || [])[0], line: c.line, genset: null, power: null, other: null, specs: [] });
      if (!s.specTables?.length) continue;
      for (const o of fromSupplier(s)) {
        if (o.kind === "engine" && o.line) for (const c of controllersIn(o.line)) addCtrl(s, c, { n: o.n, line: o.line, header: o.header, genset: o.genset, power: o.power, freq: o.freq, other: o.model, specs: [] });
        const k = keyOf(o.model);
        if (k.length < 3) continue;
        const m = maps[o.kind];
        let e = m.get(k);
        if (!e) { e = { key: k, kind: o.kind, model: o.model, names: new Set(), makes: [], uses: [], suppliers: new Set(), freq: new Set() }; m.set(k, e); }
        e.names.add(o.model);
        for (const mk of o.makes) if (!e.makes.some((x) => x.name === mk.name && x.via === mk.via)) e.makes.push({ ...mk, supplierId: o.supplierId, n: o.n });
        e.uses.push(o);
        e.suppliers.add(o.supplierId);
        if (o.freq) e.freq.add(o.freq);
      }
    }
    const finish = (e) => {
      const kva = [], kw = [];
      for (const u of e.uses) for (const p of Object.values(u.power || {})) { if (p.kVA) kva.push(p.kVA); if (p.kW) kw.push(p.kW); }
      // Other figures, grouped by kind: each distinct value with how many rows give it. An alternator does not
      // show engine figures and an engine not alternator ones; genset figures (fuel, noise, size...) go with both.
      const specs = new Map();
      for (const u of e.uses) for (const sp of u.specs || []) {
        const def = SPEC[sp.key];
        if (!def || (def.scope !== "genset" && def.scope !== e.kind)) continue;
        if (!specs.has(sp.key)) specs.set(sp.key, { key: sp.key, vi: def.vi, scope: def.scope, values: new Map() });
        const vk = sp.value.toLowerCase().replace(/\s+/g, "");
        const vs = specs.get(sp.key).values;
        if (!vs.has(vk)) vs.set(vk, { value: sp.value, label: sp.label, rows: 0, suppliers: new Set() });
        const v = vs.get(vk); v.rows++; v.suppliers.add(u.supplierId);
      }
      const specList = SPECS.filter(([k]) => specs.has(k)).map(([k]) => {
        const g = specs.get(k);
        return { ...g, values: [...g.values.values()].map((v) => ({ ...v, suppliers: [...v.suppliers] })).sort((a, b) => b.suppliers.length - a.suppliers.length || b.rows - a.rows) };
      });
      return { ...e, specs: specList, names: [...e.names], suppliers: [...e.suppliers], freq: [...e.freq].sort(),
        kva: kva.length ? [Math.min(...kva), Math.max(...kva)] : null, kw: kw.length ? [Math.min(...kw), Math.max(...kw)] : null,
        make: makeOf(e.makes) };
    };
    const sort = (a, b) => b.suppliers.length - a.suppliers.length || b.uses.length - a.uses.length || a.model.localeCompare(b.model);
    return { engines: [...maps.engine.values()].map(finish).sort(sort), alternators: [...maps.alternator.values()].map(finish).sort(sort),
      controllers: [...maps.controller.values()].map(finish).sort((a, b) => a.brandOnly - b.brandOnly || sort(a, b)) };
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
    return [...new Set([...names, ...FOREIGN_MODEL.filter(([re]) => re.test(m)).map(([, n]) => n)].filter((n) => FOREIGN_ENGINE.has(n)).map((n) => ENGINE_COUNTRY[n]))];
  }
  // Whether an engine (catalog entry, or one named in a text) is of a make from a country of the group ("g7" / "g20").
  const groupOf = (e, g) => engineCountries((e.makes || []).map((m) => m.name), e.model).some((c) => COUNTRY_GROUP[g].includes(c));
  const groupIn = (text, model, g) => engineCountries(brandIn(String(text || ""), ENGINE_BRANDS), model).some((c) => COUNTRY_GROUP[g].includes(c));

  const api = { build, fromSupplier, needsOf, suggest, isCode, cellsOf, keyOf, specKey, headingOf, originOf, originIn, groupOf, groupIn, controllersIn, SPEC, ENGINE_BRANDS, ALT_BRANDS, FOREIGN_ENGINE, ENGINE_COUNTRY, COUNTRY_GROUP, CONTROLLERS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GenbidCatalog = api;
})(typeof window !== "undefined" ? window : globalThis);
