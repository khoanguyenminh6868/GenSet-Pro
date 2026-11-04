// Chạy trong trang kết quả tìm kiếm muasamcong sau khi tìm theo số TBMT (ô "Nhập số TBMT/Tên gói thầu",
// KHÔNG tick "chưa đóng thầu"), bằng javascript_tool. Thay __NOTIFY__ bằng số TBMT, ví dụ "IB2600354007".
// Đọc kết quả mà chính trang đã tải (Vue listResultSearch). Không tự gọi API, không đụng tới reCAPTCHA.
// Kết quả: {notifyNo, found, portal (ghi vào portalids/<TBMT>), url (trang cần mở tiếp: Kết quả LCNT nếu
// đã có, không thì Biên bản mở thầu; null khi chưa mở thầu)}, hoặc {error}.
await (async () => {
  const NOTIFY = __NOTIFY__;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let list = null;
  for (let i = 0; i < 20 && !list; i++) {
    const seen = new Set();
    const walk = (vm, d = 0) => {
      if (!vm || seen.has(vm) || d > 30 || list) return; seen.add(vm);
      const v = vm.$data && vm.$data.listResultSearch;
      if (Array.isArray(v) && v.length) { list = v; return; }
      (vm.$children || []).forEach((c) => walk(c, d + 1));
    };
    document.querySelectorAll("*").forEach((el) => { if (el.__vue__ && !list) walk(el.__vue__.$root); });
    if (!list) await sleep(500);
  }
  if (!list) return { notifyNo: NOTIFY, error: "Không thấy kết quả tìm kiếm (có thể đang hiện CAPTCHA hoặc không có gói này)." };
  const t = list.find((x) => x.notifyNo === NOTIFY);
  if (!t) return { notifyNo: NOTIFY, found: false };
  const has = (v) => v && v !== "undefined";
  const utc = (s) => (s ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + "+07:00").toISOString() : null);
  const portal = {
    id: t.id, notifyId: t.notifyId || t.id, bidOpenId: has(t.bidOpenId) ? t.bidOpenId : null, inputResultId: has(t.inputResultId) ? t.inputResultId : null,
    processApply: t.processApply, bidMode: t.bidMode, bidForm: t.bidForm, planNo: t.planNo, isInternet: t.isInternet ? 1 : 0,
    stepCode: t.stepCode || null, numBidderJoin: t.numBidderJoin ?? null, openedAt: utc(t.bidRealityOpenDate), kqlcntAt: utc(t.publicDateKqlcnt),
    winners: [].concat(t.winningContractorName || t.contractorName || []).filter(Boolean),
    winningPrice: [].concat(t.bidWinningPrice || [])[0] ?? null, checkedAt: new Date().toISOString(),
  };
  const P = "egpportalcontractorselectionv2_WAR_egpportalcontractorselectionv2";
  const link = (kq) => {
    const q = { p_p_id: P, p_p_lifecycle: 0, p_p_state: "normal", p_p_mode: "view", [`_${P}_render`]: "detail-v2", type: "es-notify-contractor", stepCode: kq ? "notify-contractor-step-4-kqlcnt" : "notify-contractor-step-2-kqmt",
      id: portal.id, notifyId: portal.notifyId, inputResultId: portal.inputResultId || "undefined", bidOpenId: portal.bidOpenId, techReqId: "undefined", bidPreNotifyResultId: "undefined", bidPreOpenId: "undefined",
      processApply: portal.processApply, bidMode: portal.bidMode, notifyNo: NOTIFY, planNo: portal.planNo, pno: "undefined", step: kq ? "kqlcnt" : "kqmt", isInternet: portal.isInternet, caseKHKQ: "undefined", bidForm: portal.bidForm };
    return "https://muasamcong.mof.gov.vn/web/guest/contractor-selection?" + Object.entries(q).map(([k, v]) => `${k}=${encodeURIComponent(v ?? "undefined")}`).join("&");
  };
  const url = portal.inputResultId && portal.bidOpenId ? link(true) : portal.bidOpenId ? link(false) : null;
  return { notifyNo: NOTIFY, found: true, portal, url };
})()
