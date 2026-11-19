// Shared by history-extract.js and bidders-extract.js (Khoa 2026-11-13): how the goods table of a result page (kqlcnt) is read.
// Not run alone: genbid-sync.js snippet() (and bot/test/snippet.mjs) paste this file in place of the line "//@include goods-read.js"
// inside the snippet, so both read the same table the same way. Needs `kq` (the page result) from the snippet; defines num, note, audit, goodsOf, contractorsOf.
  const num = (v) => (v == null || v === "" || isNaN(Number(v)) ? null : Number(v));
  // Kiểm mẫu bảng (Khoa 2026-11-07): trường, cột hay cấu trúc chưa biết → audit [{kind, what, sample}], genbid-sync.js
  // ghi vào genbid-bot-logs\history-goods-audit.tsv và không đưa lên web. Trường đã đọc (USED), trường biết là không
  // cần (IGNORED: mã, thứ tự, tổng, thuế, cờ, nơi/thời gian giao hàng), còn lại có giá trị thì báo.
  const USED = new Set(["name", "nameGood", "goodName", "code", "codeGood", "model", "lableGood", "labelGood", "label", "manufacturer", "origin", "yearGood", "yearManufacture",
    "quantity", "qty", "unit", "uom", "priceUnit", "bidPrice", "unitPrice", "feature", "technique", "description", "otherInfo", "note", "goodDescription", "reqLabel"]);
  const IGNORED = new Set(["id", "pos", "parent", "children", "currentItemIndex", "groupCode", "groupFormula", "isGroup", "isAdminConfig", "title", "formCode", "nameTable", "lotNo", "lotName",
    "group", "bidItem", "type", "isDiscount", "costType", "taxValue", "tax", "importTax", "taxSpecial", "chiPhiNhapNgoai", "chiPhiSanXuat", "amount", "bidAmount", "amountTotal",
    "amountBeforeTax", "priceIncludeTax", "priceExcludeTax", "exwUnitPrice", "exwPrice", "cost", "investCapital", "ratedQuantity", "circulationNum", "originQty", "isAfter33936",
    "cPeriod", "place", "fromDate", "toDate", "dueDate", "cperiodText", "keKhai12b", "intoMoney", "maHS",
    "isParent", "tempParent", "lotPrice", "lotWiningPrice", "currentParentIndex", "contractorCode", "contractorName"]);
  const LC_KNOWN = new Set(["Table", "sharedFiles", "attachFiles", "amount", "intoMoney", "contingencyCost", "contingencyCostHH", "contingencyCostXL"]);
  // goodsList dạng object: dsHhKq = hàng hoá theo phần lô; còn lại là danh sách dịch vụ (gói sửa chữa, bảo dưỡng; dịch vụ liên quan).
  const GL_KNOWN = new Set(["dsHhKq", "dsDvlqKq", "dsDvKqTg", "listTG", "listKQDR", "listTLPT", "listDG", "listTTG"]);
  const WRAP_KNOWN = new Set(["dsHH", "dsDvlq", "lotNo", "lotName", "amount", "contractorCode", "contractorName"]);
  // Danh sách nhà thầu của một phần có khi lặp một nhà thầu nhiều lần, các dòng chỉ khác `id` (5 gói năm 2022;
  // IB2200019427: nhà thầu trúng ba lần, giá trúng của gói thành gấp ba): dòng y hệt trừ `id` chỉ lấy một.
  const contractorsOf = (lot) => { const seenC = new Set(); return (lot.contractorList || []).filter((c) => { const k = JSON.stringify({ ...c, id: null }); if (seenC.has(k)) return false; seenC.add(k); return true; }); };
  const audit = [], seenA = new Set();
  const filled = (v) => !(v == null || v === "" || v === 0 || v === "0" || v === false || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length));
  const note = (kind, what, sample) => { const k = kind + "|" + what; if (seenA.has(k)) return; seenA.add(k); audit.push({ kind, what, sample: (typeof sample === "string" ? sample : JSON.stringify(sample)).replace(/\s+/g, " ").slice(0, 300) }); };
  // Bảng hàng hoá: mảng hàng [{name, code, lableGood, manufacturer, origin, quantity, unit, priceUnit, yearGood}], hoặc ở
  // mẫu cũ mảng [{contractorCode, formValue: {lotContent: {Table: [...]}}}] (có khi là object nhiều danh sách).
  const goodsOf = (lot, winners) => {
    let g;
    const parse = (v) => { try { return typeof v === "string" ? JSON.parse(v || "[]") : v || []; } catch { return null; } };
    g = parse(lot.goodsList);
    if (g == null) return [];
    // Mẫu nhiều phần lô: thường chỉ phần đầu mang danh sách dsHhKq cho mọi phần; phần không có danh sách dùng danh sách đó
    // (lọc theo lotNo ở dưới). IB2400268027: phần 2, 3 trống.
    // Mẫu mảng dòng nhiều phần lô (rà soát 17/11/2026, IB2600064877): dòng của MỌI phần nằm ở phần đầu, mỗi dòng mang
    // lotNo + contractorCode, các phần sau trống → phần trống dùng mảng đó (lọc theo lotNo ở dưới).
    const tagged = (x) => Array.isArray(x) && x.some((r) => r && !r.formValue && r.lotNo);
    if (!(Array.isArray(g) ? g.length : Object.keys(g).length)) {
      const all = (kq?.lotResultDTO || []).map((l) => parse(l.goodsList));
      const shared = all.find((x) => x && !Array.isArray(x) && Array.isArray(x.dsHhKq)) || (lot.lotNo ? all.find(tagged) : null);
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
    // Dòng mang lotNo của phần khác, hoặc contractorCode của nhà thầu không trúng phần này, không phải hàng của phần này
    // (trước 17/11/2026 phần đầu nhận hàng của mọi phần, các phần sau không có dòng nào).
    let rows = arr.filter((x) => x && !x.formValue && !(x.lotNo && lot.lotNo && x.lotNo !== lot.lotNo) && !(x.lotNo && x.contractorCode && winners.length && !winners.includes(x.contractorCode)));
    // Mẫu cũ lặp bảng của nhà thầu trúng cho mọi nhà thầu: chỉ lấy bảng của nhà thầu trúng. Cả danh sách bảng có khi lặp
    // hai lần (IB2200053768: bảng A, B rồi lại A, B): bảng y hệt của cùng một nhà thầu chỉ lấy một lần. Dòng y hệt
    // TRONG một bảng thì giữ (cùng một món cho nhiều nơi nhận, IB2200100465: Σ số lượng × đơn giá = đúng giá trúng).
    const seenTab = new Set();
    for (const x of arr.filter((x) => x?.formValue)) {
      const lc = x.formValue?.lotContent;
      const tk = (x.contractorCode || "") + "|" + JSON.stringify(lc?.Table || []);
      if ((lc?.Table || []).length && seenTab.has(tk)) continue;
      seenTab.add(tk);
      if (!lc?.Table && filled(x.formValue)) note("shape", "formValue không có lotContent.Table", Object.keys(x.formValue || {}).join(",") + " / " + Object.keys(lc || {}).join(","));
      for (const k of Object.keys(lc || {})) if (!LC_KNOWN.has(k) && filled(lc[k])) note("shape", "lotContent." + k, lc[k]);
      if (!winners.length || winners.includes(x.contractorCode)) rows.push(...(lc?.Table || []));
    }
    // Trường lạ có giá trị (Khoa 2026-11-07: mẫu bảng mới thì ghi log để xử lý sau, không đoán).
    for (const r of rows) for (const [k, v] of Object.entries(r || {})) if (!USED.has(k) && !IGNORED.has(k) && filled(v)) note("field", k, v);
    // Chỉ báo khi trang có dòng hàng mà không lấy được (bảng trống / gói không có nhà thầu trúng thì không báo).
    const anyRows = arr.some((x) => x && !(x.lotNo && lot.lotNo && x.lotNo !== lot.lotNo) && (x.formValue ? (x.formValue.lotContent?.Table || []).length : Object.keys(x).length));
    if (anyRows && !rows.length) note("shape", "goodsList có dòng hàng nhưng không lấy được dòng nào", JSON.stringify(arr[0]));
    // Mẫu bảng BD.CG.02.0192 (từ ~2024, Khoa 2026-11-07): Hãng sản xuất = manufacturer, "Cấu hình, tính năng kỹ thuật
    // cơ bản" = feature (= technique), số lượng qty, đơn vị uom, đơn giá bidPrice; dòng tiêu đề nhóm ghi 0 ở mọi ô.
    // Trước đây chỉ đọc description/quantity/unit/priceUnit và cắt 300 ký tự, nên mất cấu hình chi tiết (động cơ, đầu
    // phát, bộ điều khiển kèm hãng) và số lượng, đơn giá của phần lớn gói.
    const str = (...vs) => { for (const v of vs) { if (v == null || v === 0 || v === "0") continue; const s = String(v).replace(/\s+/g, " ").trim(); if (s) return s; } return ""; };
    const pos = (...vs) => vs.map(num).find((x) => x > 0) ?? null;
    // Đơn giá (rà soát 17/11/2026, dòng thô của 81 gói): priceUnit và bidPrice luôn là đơn giá (số lượng × bidPrice =
    // amount ở 3.149 / 3.149 dòng). Mẫu hàng nhập khẩu (có priceIncludeTax / priceExcludeTax / amountBeforeTax) thì
    // trường unitPrice là THÀNH TIỀN trước thuế (= amountBeforeTax ở 334 / 334 dòng), đơn giá là priceIncludeTax
    // (số lượng × priceIncludeTax = amountBeforeTax). IB2300296794 từng ghi 100 máy × 60,9 tỷ. unitPrice chỉ dùng khi
    // dòng không có trường nào khác và nó không bằng một trường thành tiền.
    const totalOf = (r) => [r.amountBeforeTax, r.amount, r.intoMoney, r.bidAmount].map(num).filter((x) => x > 0);
    const unitOf = (r) => pos(r.priceUnit, r.bidPrice, r.priceIncludeTax, r.priceExcludeTax) ?? (pos(r.quantity, r.qty) > 1 && totalOf(r).includes(num(r.unitPrice)) ? null : pos(r.unitPrice));
    // Trần 100 dòng (trước 17/11/2026) cắt mất hàng của 15 lô (IB2300203745: 279 dòng); nay 1.000, vượt thì báo.
    if (rows.length > 1000) note("shape", "bảng hàng hoá hơn 1.000 dòng, chỉ lấy 1.000", String(rows.length));
    return rows.slice(0, 1000).map((r) => {
      const desc = [...new Set([str(r.feature), str(r.technique), str(r.description), str(r.goodDescription)].filter(Boolean))].join(" | ");
      return {
        name: str(r.name, r.nameGood, r.goodName), code: str(r.codeGood, r.code, r.model), label: str(r.lableGood, r.labelGood, /^\d{4,10}$/.test(String(r.label ?? "").trim()) ? "" : r.label), // mẫu cũ: label là mã HS (8502)
        maker: str(r.manufacturer), origin: str(r.origin), year: str(r.yearGood, r.yearManufacture), qty: pos(r.quantity, r.qty), unit: str(r.unit, r.uom),
        unitPrice: unitOf(r), desc: desc.slice(0, 8000), ...(str(r.otherInfo, r.note) ? { note: str(r.otherInfo, r.note).slice(0, 2000) } : {}),
        // reqLabel = cột "Xuất xứ" của bảng E-HSMT do bên mời thầu điền: YÊU CẦU xuất xứ của dòng (chữ tự do: "G7", "Việt Nam",
        // "Theo quy định tại Chương V"...), khác `origin` là xuất xứ nhà thầu trúng chào (Khoa 2026-11-19, rà soát 67 gói; xem
        // genbid-work\dieu-phoi\nghiem-thu\reqlabel-1.md). Chỉ có ở mẫu dsHhKq.dsHH của gói ~2024; không có thì bỏ khoá.
        ...(str(r.reqLabel) ? { reqOrigin: str(r.reqLabel).slice(0, 500) } : {}),
      };
    }).filter((r) => r.name || r.code || r.label);
  };
