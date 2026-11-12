// Chạy trong trang Kết quả lựa chọn nhà thầu (kqlcnt) hoặc Biên bản mở thầu (kqmt) của một gói trên muasamcong,
// cho lịch sử gói thầu máy phát điện (genbid-sync.js history, Khoa 2026-11-02). Đọc dữ liệu mà chính trang đã tải
// (Vue $data), giống bidders-extract.js nhưng giữ từng phần (lot): giá phần, mọi nhà thầu với giá dự thầu, giá sau
// giảm giá, trúng hay không và lý do, và bảng hàng hoá trúng thầu (tên, model, nhãn hiệu, hãng, xuất xứ, số lượng, đơn giá).
// Không tự gọi API, không đụng tới reCAPTCHA.
// Kết quả: {final, lots: [{lotNo, lotName, price, estimate, bidders: [...], goods: [...]}], decisionNo, decisionDate}, hoặc {error}.
await (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const tax = (code) => String(code || "").replace(/^vn/i, "");
  const num = (v) => (v == null || v === "" || isNaN(Number(v)) ? null : Number(v));
  let root = null, kq = null, mt = null;
  for (let i = 0; i < 40; i++) {
    root = [...document.querySelectorAll("[id]")].map((e) => e.__vue__).find((v) => v && v === v.$root && v.$data && ("dtlKqlcnt" in v.$data || "dtlRoundMngRes" in v.$data));
    kq = root?.$data.dtlKqlcnt?.bideContractorInputResultDTO;
    mt = root?.$data.dtlRoundMngRes?.bidSubmissionByContractorViewResponse;
    if ((kq && (kq.lotResultDTO?.length || kq.lotOpenDetails?.length)) || mt?.bidSubmissionDTOList?.length) break;
    // Gói chào giá trực tuyến rút gọn: trang mở ở tab TBMT, KQLCNT chỉ tải khi bấm tab "Kết quả lựa chọn nhà thầu".
    if (i === 4 && root && root.$data.isLoadedKqlcnt === false && /step=kqlcnt/.test(location.search))
      [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Kết quả lựa chọn nhà thầu")?.click();
    await sleep(500);
  }
  // Kiểm mẫu bảng (Khoa 2026-11-07): trường, cột hay cấu trúc chưa biết → audit [{kind, what, sample}], genbid-sync.js
  // ghi vào genbid-bot-logs\history-goods-audit.tsv và không đưa lên web. Trường đã đọc (USED), trường biết là không
  // cần (IGNORED: mã, thứ tự, tổng, thuế, cờ, nơi/thời gian giao hàng), còn lại có giá trị thì báo.
  const USED = new Set(["name", "nameGood", "goodName", "code", "codeGood", "model", "lableGood", "labelGood", "label", "manufacturer", "origin", "yearGood", "yearManufacture",
    "quantity", "qty", "unit", "uom", "priceUnit", "bidPrice", "unitPrice", "feature", "technique", "description", "otherInfo", "note", "goodDescription"]);
  const IGNORED = new Set(["id", "pos", "parent", "children", "currentItemIndex", "groupCode", "groupFormula", "isGroup", "isAdminConfig", "title", "formCode", "nameTable", "lotNo", "lotName",
    "group", "bidItem", "type", "isDiscount", "costType", "taxValue", "tax", "importTax", "taxSpecial", "chiPhiNhapNgoai", "chiPhiSanXuat", "amount", "bidAmount", "amountTotal",
    "amountBeforeTax", "priceIncludeTax", "priceExcludeTax", "exwUnitPrice", "exwPrice", "cost", "investCapital", "ratedQuantity", "circulationNum", "originQty", "isAfter33936",
    "cPeriod", "place", "fromDate", "toDate", "dueDate", "cperiodText", "keKhai12b", "intoMoney", "maHS",
    "isParent", "tempParent", "lotPrice", "lotWiningPrice", "currentParentIndex", "contractorCode", "contractorName"]);
  const LC_KNOWN = new Set(["Table", "sharedFiles", "attachFiles", "amount", "intoMoney", "contingencyCost", "contingencyCostHH", "contingencyCostXL"]);
  // goodsList dạng object: dsHhKq = hàng hoá theo phần lô; còn lại là danh sách dịch vụ (gói sửa chữa, bảo dưỡng; dịch vụ liên quan).
  const GL_KNOWN = new Set(["dsHhKq", "dsDvlqKq", "dsDvKqTg", "listTG", "listKQDR", "listTLPT", "listDG", "listTTG"]);
  const WRAP_KNOWN = new Set(["dsHH", "dsDvlq", "lotNo", "lotName", "amount", "contractorCode", "contractorName"]);
  const audit = [], seenA = new Set();
  const filled = (v) => !(v == null || v === "" || v === 0 || v === "0" || v === false || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length));
  const note = (kind, what, sample) => { const k = kind + "|" + what; if (seenA.has(k)) return; seenA.add(k); audit.push({ kind, what, sample: (typeof sample === "string" ? sample : JSON.stringify(sample)).replace(/\s+/g, " ").slice(0, 300) }); };
  // Tiêu đề cột của bảng hàng hoá đang hiện trên trang (bảng có cột "Danh mục hàng hóa"), so với các cột đã biết.
  const HEAD_KNOWN = [/^STT$/, /^Danh mục hàng hóa$/, /^Tên hàng hóa$/, /^Ký mã hiệu$/, /^Nhãn hiệu$/, /^Năm sản xuất$/, /^Xuất xứ/, /^Hãng sản xuất$/, /^Cấu hình, tính năng kỹ thuật cơ bản$/,
    /^Đơn vị tính$/, /^Khối lượng/, /^Số lượng$/, /^Mã HS$/, /^Đơn giá/, /^Thành tiền/, /^Thời gian giao hàng/, /^Ghi chú$/,
    /^Ký mã hiệu\/nhãn mác/, /^Mô tả hàng hóa$/, /^Thời gian thực hiện gói thầu$/,
    /^Mã phần\s*\/?\s*lô$/, /^Tên phần\s*\/?\s*lô$/, /^Nhà thầu trúng thầu$/, /^Mã định danh$/,
    // Cột giá, thuế, vận chuyển của mẫu có hàng nhập khẩu: không cần cho lịch sử.
    /^Giá EXW/, /^Giá từng hạng mục/, /^Chi phí vận chuyển/, /^Thuế/];
  const auditHeaders = () => {
    for (const tb of document.querySelectorAll("table")) {
      const heads = [...tb.querySelectorAll("thead th, tr:first-child th")].map((th) => th.innerText.replace(/\s+/g, " ").trim()).filter(Boolean);
      if (!heads.some((x) => /^(Danh mục|Tên) hàng hóa$/.test(x))) continue;
      for (const x of heads) if (!HEAD_KNOWN.some((re) => re.test(x))) note("header", x, heads.join(" | "));
    }
  };
  // Bảng hàng hoá: mảng hàng [{name, code, lableGood, manufacturer, origin, quantity, unit, priceUnit, yearGood}], hoặc ở
  // mẫu cũ mảng [{contractorCode, formValue: {lotContent: {Table: [...]}}}] (có khi là object nhiều danh sách).
  const goodsOf = (lot, winners) => {
    let g;
    const parse = (v) => { try { return typeof v === "string" ? JSON.parse(v || "[]") : v || []; } catch { return null; } };
    g = parse(lot.goodsList);
    if (g == null) return [];
    // Mẫu nhiều phần lô: thường chỉ phần đầu mang danh sách dsHhKq cho mọi phần; phần không có danh sách dùng danh sách đó
    // (lọc theo lotNo ở dưới). IB2400268027: phần 2, 3 trống.
    if (!(Array.isArray(g) ? g.length : Object.keys(g).length)) {
      const shared = (kq?.lotResultDTO || []).map((l) => parse(l.goodsList)).find((x) => x && !Array.isArray(x) && Array.isArray(x.dsHhKq));
      if (shared) g = shared;
    }
    // Object: chỉ lấy danh sách hàng (dsHhKq) và danh sách lạ; bỏ danh sách dịch vụ (GL_KNOWN trừ dsHhKq).
    const arr = Array.isArray(g) ? [...g] : g && typeof g === "object" ? Object.entries(g).filter(([k, v]) => Array.isArray(v) && (k === "dsHhKq" || !GL_KNOWN.has(k))).flatMap(([, v]) => v) : [];
    // Gói dịch vụ (sửa chữa, bảo dưỡng): object listTG/listDG/... của dịch vụ, không phải hàng hoá; mẫu nhiều phần lô:
    // object dsHhKq (đọc ở dưới). Chỉ báo object có khoá khác.
    if (g && typeof g === "object" && !Array.isArray(g) && Object.keys(g).some((k) => !GL_KNOWN.has(k))) note("shape", "goodsList là object", Object.keys(g).join(","));
    // Mẫu nhiều phần lô (Khoa 2026-11-09, vd IB2400268027 Codien): {dsHhKq: [{lotNo, lotName, contractorCode, contractorName,
    // dsHH: [hàng], dsDvlq: [dịch vụ liên quan]}]}, cùng một danh sách cho mọi phần: lấy mục của đúng phần này (lotNo) và
    // của nhà thầu trúng. Mục của danh sách là vỏ, không phải dòng hàng.
    const wraps = arr.filter((x) => x && Array.isArray(x.dsHH));
    if (wraps.length) {
      const mine = wraps.filter((x) => !x.lotNo || !lot.lotNo || x.lotNo === lot.lotNo);
      const won = mine.filter((x) => !winners.length || !x.contractorCode || winners.includes(x.contractorCode));
      for (const x of wraps) for (const k of Object.keys(x)) if (!WRAP_KNOWN.has(k) && filled(x[k])) note("shape", "dsHhKq." + k, x[k]);
      arr.splice(0, arr.length, ...(won.length ? won : mine).flatMap((x) => x.dsHH));
    }
    let rows = arr.filter((x) => x && !x.formValue);
    // Mẫu cũ lặp bảng của nhà thầu trúng cho mọi nhà thầu: chỉ lấy bảng của nhà thầu trúng.
    for (const x of arr.filter((x) => x?.formValue)) {
      const lc = x.formValue?.lotContent;
      if (!lc?.Table && filled(x.formValue)) note("shape", "formValue không có lotContent.Table", Object.keys(x.formValue || {}).join(",") + " / " + Object.keys(lc || {}).join(","));
      for (const k of Object.keys(lc || {})) if (!LC_KNOWN.has(k) && filled(lc[k])) note("shape", "lotContent." + k, lc[k]);
      if (!winners.length || winners.includes(x.contractorCode)) rows.push(...(lc?.Table || []));
    }
    // Trường lạ có giá trị (Khoa 2026-11-07: mẫu bảng mới thì ghi log để xử lý sau, không đoán).
    for (const r of rows) for (const [k, v] of Object.entries(r || {})) if (!USED.has(k) && !IGNORED.has(k) && filled(v)) note("field", k, v);
    // Chỉ báo khi trang có dòng hàng mà không lấy được (bảng trống / gói không có nhà thầu trúng thì không báo).
    const anyRows = arr.some((x) => x && (x.formValue ? (x.formValue.lotContent?.Table || []).length : Object.keys(x).length));
    if (anyRows && !rows.length) note("shape", "goodsList có dòng hàng nhưng không lấy được dòng nào", JSON.stringify(arr[0]));
    // Mẫu bảng BD.CG.02.0192 (từ ~2024, Khoa 2026-11-07): Hãng sản xuất = manufacturer, "Cấu hình, tính năng kỹ thuật
    // cơ bản" = feature (= technique), số lượng qty, đơn vị uom, đơn giá bidPrice; dòng tiêu đề nhóm ghi 0 ở mọi ô.
    // Trước đây chỉ đọc description/quantity/unit/priceUnit và cắt 300 ký tự, nên mất cấu hình chi tiết (động cơ, đầu
    // phát, bộ điều khiển kèm hãng) và số lượng, đơn giá của phần lớn gói.
    const str = (...vs) => { for (const v of vs) { if (v == null || v === 0 || v === "0") continue; const s = String(v).replace(/\s+/g, " ").trim(); if (s) return s; } return ""; };
    const pos = (...vs) => vs.map(num).find((x) => x > 0) ?? null;
    return rows.slice(0, 100).map((r) => {
      const desc = [...new Set([str(r.feature), str(r.technique), str(r.description), str(r.goodDescription)].filter(Boolean))].join(" | ");
      return {
        name: str(r.name, r.nameGood, r.goodName), code: str(r.codeGood, r.code, r.model), label: str(r.lableGood, r.labelGood, /^\d{4,10}$/.test(String(r.label ?? "").trim()) ? "" : r.label), // mẫu cũ: label là mã HS (8502)
        maker: str(r.manufacturer), origin: str(r.origin), year: str(r.yearGood, r.yearManufacture), qty: pos(r.quantity, r.qty), unit: str(r.unit, r.uom),
        unitPrice: pos(r.priceUnit, r.bidPrice, r.unitPrice), desc: desc.slice(0, 8000), ...(str(r.otherInfo, r.note) ? { note: str(r.otherInfo, r.note).slice(0, 2000) } : {}),
      };
    }).filter((r) => r.name || r.code || r.label);
  };
  if (kq && (kq.lotResultDTO?.length || kq.lotOpenDetails?.length)) {
    const opens = kq.lotOpenDetails || [];
    const lots = (kq.lotResultDTO || []).map((lot) => {
      const mine = opens.filter((o) => !o.lotNo || o.lotNo === lot.lotNo);
      const seen = new Set();
      const bidders = (lot.contractorList || []).map((c) => {
        const o = mine.find((x) => x.contractorCode === c.orgCode) || {};
        seen.add(c.orgCode);
        const pct = c.discountPercent ?? o.discountPercent;
        return { name: c.orgFullname || o.contractorName || c.newContractorName || "", taxCode: c.taxCode || tax(c.orgCode), venture: c.ventureName || o.ventureName || "",
          bidPrice: num(c.lotOpenPrice ?? o.lotPrice), discount: pct ? `${pct}%` : "", finalPrice: num(c.lotFinalPrice ?? o.lotFinalPrice ?? c.adjustPrice),
          won: c.bidResult === 1, winPrice: num(c.bidWiningPrice), reason: c.reason || o.noSuccBidderRson || o.noPassedRson || "", rank: num(o.ranking) };
      });
      // Nhà thầu có trong biên bản mở thầu nhưng không có trong danh sách kết quả.
      for (const o of mine) if (!seen.has(o.contractorCode)) bidders.push({ name: o.contractorName || "", taxCode: tax(o.contractorCode), venture: o.ventureName || "",
        bidPrice: num(o.lotPrice), discount: o.discountPercent ? `${o.discountPercent}%` : "", finalPrice: num(o.lotFinalPrice), won: o.succBidderYn === "Y",
        winPrice: num(o.succBidderPrice), reason: o.noSuccBidderRson || o.noPassedRson || "", rank: num(o.ranking) });
      const winners = (lot.contractorList || []).filter((c) => c.bidResult === 1).map((c) => c.orgCode);
      return { lotNo: lot.lotNo || "", lotName: String(lot.lotName || "").replace(/\s+/g, " ").trim(), price: num(lot.lotPrice), estimate: num(lot.lotEstimatePrice),
        status: lot.status ?? null, reason: lot.reason || "", bidders, goods: goodsOf(lot, winners) };
    });
    // Kết quả chưa có danh sách theo phần: dùng giá mở thầu.
    if (!lots.length) lots.push({ lotNo: "", lotName: "", price: num(kq.bidPrice), estimate: num(kq.bidEstimatePrice), bidders: opens.map((o) => ({ name: o.contractorName || "", taxCode: tax(o.contractorCode),
      venture: o.ventureName || "", bidPrice: num(o.lotPrice), discount: o.discountPercent ? `${o.discountPercent}%` : "", finalPrice: num(o.lotFinalPrice), won: o.succBidderYn === "Y",
      winPrice: num(o.succBidderPrice), reason: o.noSuccBidderRson || "", rank: num(o.ranking) })), goods: [] });
    // Bảng hàng hoá vẽ sau dữ liệu: chờ tối đa 3 s rồi so tiêu đề cột.
    if (lots.some((l) => l.goods.length)) {
      for (let i = 0; i < 6 && ![...document.querySelectorAll("th")].some((th) => /^(Danh mục|Tên) hàng hóa$/.test(th.innerText.trim())); i++) await sleep(500);
      auditHeaders();
    }
    return { final: true, source: "kqlcnt", ...(audit.length ? { audit } : {}), lots, packagePrice: num(kq.bidPrice), estimate: num(kq.bidEstimatePrice), decisionNo: kq.decisionNo || "", decisionDate: kq.decisionDate || "",
      cancelled: !!(kq.cancelReason || kq.cancelDate), reason: kq.reason || kq.cancelReason || "" };
  }
  if (mt?.bidSubmissionDTOList?.length) {
    const by = new Map();
    for (const s of mt.bidSubmissionDTOList) {
      const ls = s.lotNoValueDTOList?.length ? s.lotNoValueDTOList : [{ lotNo: "", lotName: "", lotPrice: s.bidPrice, lotFinalPrice: s.bidFinalPrice, saleNumber: s.saleNumber }];
      for (const l of ls) {
        const k = l.lotNo || "";
        if (!by.has(k)) by.set(k, { lotNo: k, lotName: String(l.lotName || "").replace(/\s+/g, " ").trim(), price: null, estimate: null, bidders: [], goods: [] });
        by.get(k).bidders.push({ name: s.contractorName || "", taxCode: tax(s.contractorCode), venture: s.ventureName || "", bidPrice: num(l.lotPrice), discount: l.saleNumber ? `${l.saleNumber}%` : "",
          finalPrice: num(l.lotFinalPrice), won: false, winPrice: null, reason: "", rank: null });
      }
    }
    return { final: false, source: "kqmt", lots: [...by.values()] };
  }
  return { error: "Trang chưa có biên bản mở thầu hoặc kết quả (có thể đang hiện CAPTCHA)." };
})()
