// ==UserScript==
// @name         muasamcong: tự chọn tab Biên bản mở thầu
// @namespace    genbid-pro
// @version      1.0
// @description  Link gói thầu ở GenBid Pro (step=kqmt) mở trang Biên bản mở thầu, nhưng cổng không đánh dấu tab nào nên trang trắng. Script chỉ bấm tab "Biên bản mở thầu" giúp bạn, một lần.
// @match        https://muasamcong.mof.gov.vn/web/guest/contractor-selection*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function () {
  "use strict";
  // Chỉ chạy với link biên bản mở thầu; trang khác của cổng không bị đụng tới.
  if (new URLSearchParams(location.search).get("step") !== "kqmt") return;
  const started = Date.now();
  const timer = setInterval(() => {
    // Tab chưa vẽ xong: chờ tiếp, tối đa 20 giây rồi thôi.
    const tab = document.querySelector('.nav-tabs a[href="#bidOpeningMinutes"]');
    if (!tab) { if (Date.now() - started > 20000) clearInterval(timer); return; }
    clearInterval(timer);
    // Cổng đã chọn sẵn tab thì không bấm lại.
    if (!tab.classList.contains("active")) tab.click();
  }, 500);
})();
