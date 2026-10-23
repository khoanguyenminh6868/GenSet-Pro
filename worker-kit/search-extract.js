// Chạy trong trang kết quả tìm kiếm muasamcong (sau khi bấm Tìm kiếm trên giao diện của trang), bằng javascript_tool.
// Đọc danh sách kết quả mà chính trang đã tải (Vue listResultSearch), đổi sang dạng feed/current của GenBid Pro.
// Không tự gọi API, không đụng tới reCAPTCHA.
// Trước khi chạy, thay __KNOWN__ bằng kết quả của: Merge-GenBidFeed.ps1 -Mode Sigs -Current <feed/current.json>
// Kết quả: {count, present: [số TBMT có trong kết quả], changed: [gói mới hoặc đổi thông tin, đủ trường]}.
await (async () => {
  const KNOWN = __KNOWN__;
  const seen = new Set(); let list = null;
  const walk = (vm, d = 0) => {
    if (!vm || seen.has(vm) || d > 30 || list) return; seen.add(vm);
    const v = vm.$data && vm.$data.listResultSearch;
    if (Array.isArray(v)) { list = v; return; }
    (vm.$children || []).forEach((c) => walk(c, d + 1));
  };
  document.querySelectorAll("*").forEach((el) => { if (el.__vue__ && !list) walk(el.__vue__.$root); });
  if (!list) return { error: "Không thấy kết quả tìm kiếm trên trang (có thể đang hiện CAPTCHA hoặc trang chưa tải xong)." };
  // Giờ trên muasamcong là giờ Việt Nam, không kèm múi giờ.
  const utc = (s) => (s ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + "+07:00").toISOString() : null);
  const P = "egpportalcontractorselectionv2_WAR_egpportalcontractorselectionv2";
  const link = (t) => {
    // Luôn trỏ tới bước TBMT như feed cũ (gói chào giá trực tuyến có stepCode khác nhưng trang TBMT vẫn mở được).
    const q = { p_p_id: P, p_p_lifecycle: 0, p_p_state: "normal", p_p_mode: "view", [`_${P}_render`]: "detail-v2", type: "es-notify-contractor", stepCode: "notify-contractor-step-1-tbmt",
      id: t.id, notifyId: t.notifyId || t.id, inputResultId: "undefined", bidOpenId: "undefined", techReqId: "undefined", bidPreNotifyResultId: "undefined", bidPreOpenId: "undefined",
      processApply: t.processApply, bidMode: t.bidMode, notifyNo: t.notifyNo, planNo: t.planNo, pno: "undefined", step: "tbmt", isInternet: t.isInternet ? 1 : 0, caseKHKQ: "undefined", bidForm: t.bidForm };
    return "https://muasamcong.mof.gov.vn/web/guest/contractor-selection?" + Object.entries(q).map(([k, v]) => `${k}=${encodeURIComponent(v ?? "undefined")}`).join("&");
  };
  // Chữ ký phải khớp hàm Sig trong Merge-GenBidFeed.ps1.
  const sig = async (o) => {
    const s = [o.bidCloseDate, o.bidOpenDate, o.notifyVersion, o.estimatedPrice, o.bidName, o.investorName, o.procuringEntityName, o.location, String(o.isInternet).toLowerCase()].map((v) => v ?? "").join("|");
    const b = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
    return [...b].map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 12);
  };
  // Chỉ lấy gói có "máy phát điện" trong tên gói thầu (tìm kiếm của trang còn trả cả gói chỉ khớp ở chỗ khác).
  const nameOf = (t) => String([].concat(t.bidName || t.pname || "")[0]).replace(/\s+/g, " ").trim();
  const tenders = list.filter((t) => nameOf(t).normalize("NFC").toLowerCase().includes("máy phát điện")).map((t) => {
    const o = {
      bidCloseDate: utc(t.bidCloseDate), bidForm: t.bidForm, bidMode: t.bidMode,
      bidName: String([].concat(t.bidName || t.pname || "")[0]).replace(/\s+/g, " ").trim(),
      bidOpenDate: utc(t.bidOpenDate), estimatedPrice: [].concat(t.bidPrice || [])[0] ?? t.priceInit ?? null,
      field: [].concat(t.investField || t.bidField || [])[0] || null, id: t.id, investorName: t.investorName || null,
      isInternet: !!t.isInternet, location: (t.locations || []).map((l) => l.provName).filter(Boolean).join(", ") || null,
      notifyNo: t.notifyNo, notifyVersion: t.notifyVersion, planNo: t.planNo, processApply: t.processApply,
      publicDate: utc(t.publicDate), sourceUrl: link(t), status: "open",
    };
    if (t.procuringEntityName) o.procuringEntityName = t.procuringEntityName;
    return o;
  });
  const changed = [];
  for (const o of tenders) if (KNOWN[o.notifyNo] !== (await sig(o))) changed.push(o);
  return { count: tenders.length, present: tenders.map((o) => o.notifyNo), changed };
})()
