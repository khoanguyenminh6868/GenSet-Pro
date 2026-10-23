// Chạy trong trang Kết quả lựa chọn nhà thầu (kqlcnt) hoặc Biên bản mở thầu (kqmt) của một gói trên muasamcong
// (url do bidders-ids.js trả về), bằng javascript_tool. Đọc dữ liệu mà chính trang đã tải (Vue $data).
// Không tự gọi API, không đụng tới reCAPTCHA.
// Kết quả: tài liệu bidders/<TBMT> đúng dạng phần "Nhà thầu tham dự" của GenBid Pro:
// {list: [{rank, name, taxCode, bidPrice, discount, priceAfterDiscount, won, note}], at, source, auto, final, ...}, hoặc {error}.
await (async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const vnd = (n) => (n == null ? "" : Number(n).toLocaleString("vi-VN"));
  const tax = (code) => String(code || "").replace(/^vn/i, "");
  let root = null, kq = null, mt = null;
  for (let i = 0; i < 40; i++) {
    root = [...document.querySelectorAll("[id]")].map((e) => e.__vue__).find((v) => v && v === v.$root && v.$data && ("dtlKqlcnt" in v.$data || "dtlRoundMngRes" in v.$data));
    kq = root?.$data.dtlKqlcnt?.bideContractorInputResultDTO;
    mt = root?.$data.dtlRoundMngRes?.bidSubmissionByContractorViewResponse;
    if ((kq && (kq.lotResultDTO?.length || kq.lotOpenDetails?.length)) || mt?.bidSubmissionDTOList?.length) break;
    await sleep(500);
  }
  const notifyNo = new URLSearchParams(location.search).get("notifyNo") || "";
  const at = new Date().toISOString();
  const ranked = (list) => list
    .sort((a, b) => (b.won ? 1 : 0) - (a.won ? 1 : 0) || (a.priceAfterDiscount ?? a.bidPrice ?? 9e15) - (b.priceAfterDiscount ?? b.bidPrice ?? 9e15))
    .map((x, i) => ({ rank: i + 1, ...x }));

  if (kq && (kq.lotResultDTO?.length || kq.lotOpenDetails?.length)) {
    const multi = (kq.lotResultDTO || []).length > 1;
    const opens = kq.lotOpenDetails || [];
    const list = [];
    for (const lot of kq.lotResultDTO || []) {
      // Hàng hoá từng nhà thầu chào (hãng, model, xuất xứ), nằm trong goodsList dạng chuỗi JSON.
      let goods = [];
      try { goods = JSON.parse(lot.goodsList || "[]"); } catch { goods = []; }
      const goodsOf = (code) => {
        const g = goods.find((x) => x.contractorCode === code);
        const rows = g?.formValue?.lotContent?.Table || [];
        return rows.slice(0, 4).map((r) => [r.labelGood || r.manufacturer, r.codeGood, r.origin && `(${r.origin})`].filter(Boolean).join(" ")).filter(Boolean).join("; ");
      };
      for (const c of lot.contractorList || []) {
        const o = opens.find((x) => x.contractorCode === c.orgCode && (!x.lotNo || x.lotNo === lot.lotNo)) || {};
        const won = c.bidResult === 1;
        // muasamcong lặp bảng hàng của nhà thầu trúng cho mọi nhà thầu, nên chỉ tin bảng của nhà thầu trúng.
        const g = won ? goodsOf(c.orgCode) : "";
        const note = [multi && lot.lotName, won ? `Trúng thầu, giá trúng ${vnd(c.bidWiningPrice ?? c.lotFinalPrice)}` : c.reason ? `Không được chọn: ${c.reason}` : "", g && `Hàng chào: ${g}`].filter(Boolean).join(" · ");
        const pct = c.discountPercent ?? o.discountPercent;
        list.push({ name: c.orgFullname || o.contractorName, taxCode: c.taxCode || tax(c.orgCode), bidPrice: c.lotOpenPrice ?? o.lotPrice ?? c.lotPrice ?? null,
          discount: pct ? `${pct}%` : "", priceAfterDiscount: c.lotFinalPrice ?? o.lotFinalPrice ?? c.adjustPrice ?? null, won, note });
      }
    }
    // Kết quả chưa có danh sách nhà thầu: dùng giá mở thầu.
    if (!list.length) for (const o of opens) list.push({ name: o.contractorName, taxCode: tax(o.contractorCode), bidPrice: o.lotPrice ?? null, discount: o.discountPercent ? `${o.discountPercent}%` : "", priceAfterDiscount: o.lotFinalPrice ?? null, won: false, note: "" });
    return { notifyNo, list: ranked(list), at, source: "muasamcong (kết quả lựa chọn nhà thầu)", auto: true, final: true,
      packagePrice: kq.bidPrice ?? null, decisionNo: kq.decisionNo || "", decisionDate: kq.decisionDate || "", url: location.href };
  }
  if (mt?.bidSubmissionDTOList?.length) {
    const list = [];
    for (const s of mt.bidSubmissionDTOList) {
      const lots = s.lotNoValueDTOList?.length > 1 ? s.lotNoValueDTOList : [null];
      for (const l of lots) list.push({
        name: s.contractorName, taxCode: tax(s.contractorCode), bidPrice: (l ? l.lotPrice : s.bidPrice) ?? null,
        discount: (l ? l.saleNumber : s.saleNumber) ? String(l ? l.saleNumber : s.saleNumber) : "",
        priceAfterDiscount: (l ? l.lotFinalPrice : s.bidFinalPrice) ?? null, won: false, note: l ? l.lotName : "",
      });
    }
    return { notifyNo, list: ranked(list), at, source: "muasamcong (biên bản mở thầu)", auto: true, final: false, url: location.href };
  }
  return { notifyNo, error: "Trang chưa có biên bản mở thầu hoặc kết quả (có thể chưa mở thầu, hoặc trang đang hiện CAPTCHA)." };
})()
