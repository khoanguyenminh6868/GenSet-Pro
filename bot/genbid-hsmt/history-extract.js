// Chạy trong trang Kết quả lựa chọn nhà thầu (kqlcnt) hoặc Biên bản mở thầu (kqmt) của một gói trên muasamcong,
// cho lịch sử gói thầu máy phát điện (genbid-sync.js history, Khoa 2026-11-02). Đọc dữ liệu mà chính trang đã tải
// (Vue $data), giống bidders-extract.js nhưng giữ từng phần (lot): giá phần, mọi nhà thầu với giá dự thầu, giá sau
// giảm giá, trúng hay không và lý do, và bảng hàng hoá trúng thầu (tên, model, nhãn hiệu, hãng, xuất xứ, số lượng, đơn giá).
// Không tự gọi API, không đụng tới reCAPTCHA.
// Kết quả: {final, lots: [{lotNo, lotName, price, estimate, bidders: [...], goods: [...]}], decisionNo, decisionDate}, hoặc {error}.
await (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const tax = (code) => String(code || "").replace(/^vn/i, "");
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
  //@include goods-read.js
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
