// Chạy trong trang chi tiết gói thầu muasamcong (sourceUrl của yêu cầu), bằng javascript_tool.
// Cùng cách đọc với bookmarklet.js nhưng chỉ trả danh sách tệp, không tải gì và không hiện alert.
// Không tự gọi API, không đụng tới reCAPTCHA: chỉ đọc những gì trang đã tải.
// Kết quả: {notifyNo, files: [{id, name}]} (tên trùng đã được thêm "(1)", "(2)"), hoặc {error}.
await (async () => {
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const notifyNo = new URLSearchParams(location.search).get("notifyNo") || "";
  if (/recaptcha|xác minh|captcha/i.test(document.body.innerText.slice(0, 3000)) && !document.querySelector("#view-detail")) return { notifyNo, error: "muasamcong yêu cầu xác minh" };
  // Trang tải dữ liệu sau khi mở: chờ tới khi có khung chi tiết (tối đa 20 giây).
  for (let i = 0; i < 40 && !document.querySelector('a[href="#file-tender-invitation"]'); i++) await sleep(500);
  // File trong tab "Hồ sơ mời thầu" chỉ có sau khi mở tab đó.
  if (!document.getElementsByClassName("file-download-all").length) {
    const tab = document.querySelector('a[href="#file-tender-invitation"]');
    if (tab) {
      tab.click();
      for (let i = 0; i < 20 && !document.getElementsByClassName("file-download-all").length; i++) await sleep(300);
    }
  }
  const files = new Map();
  for (const el of document.getElementsByClassName("file-download-all")) {
    const i = el.id.indexOf(",");
    const id = el.id.slice(0, i), name = el.id.slice(i + 1);
    if (UUID.test(id)) files.set(id, name);
  }
  // Các file khác trang đã tải về (vd. quyết định phê duyệt HSMT): cặp xxxFileId / xxxFileName.
  const seen = new WeakSet();
  const walk = (o, depth) => {
    if (!o || typeof o !== "object" || depth > 12 || seen.has(o)) return;
    seen.add(o);
    if (o._isVue) { walk(o.$data, depth + 1); (o.$children || []).forEach((c) => walk(c, depth + 1)); return; }
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === "string") {
        if (/fileid$/i.test(k) && UUID.test(v) && !files.has(v)) {
          const nameKey = k.replace(/Id$/, "Name").replace(/ID$/, "Name");
          if (typeof o[nameKey] === "string" && o[nameKey]) files.set(v, o[nameKey]);
        } else if (/^\s*\{/.test(v) && /"fileId"/.test(v)) {
          // A webform chapter keeps its attachments in formValue, a JSON string (Chương V: fileTech, filePaint,
          // fileDesign, fileDesign1…; only some get a download button on the page).
          try { forms.push(JSON.parse(v)); } catch {}
        }
      } else walk(v, depth + 1);
    }
  };
  const forms = [];
  document.querySelectorAll("[id]").forEach((el) => { if (el.__vue__ && el.__vue__ === el.__vue__.$root) walk(el.__vue__, 0); });
  // muasamcong sometimes stores fileId "id" instead of the file's id (IB2600617248, 24/11/2026: "Ban ve Khoa Lao (1).pdf",
  // "Ban ve ha tang, CDKT, bao tri.rar"), the real ids staying in the form's sharedFiles. Those left over are given to the
  // names without an id, in order (checked: the .rar one downloads as a RAR archive).
  for (const f of forms) {
    const named = Object.values(f).filter((x) => x && typeof x === "object" && typeof x.fileName === "string" && x.fileName && "fileId" in x);
    for (const x of named) if (UUID.test(x.fileId) && !files.has(x.fileId)) files.set(x.fileId, x.fileName);
    const shared = (Array.isArray(f.sharedFiles) ? f.sharedFiles : []).filter((id) => typeof id === "string" && UUID.test(id));
    const known = new Set(named.filter((x) => UUID.test(x.fileId)).map((x) => x.fileId.toLowerCase()));
    const spare = shared.filter((id) => !known.has(id.toLowerCase()) && !files.has(id));
    const noId = named.filter((x) => !UUID.test(x.fileId));
    noId.forEach((x, i) => { if (spare[i]) files.set(spare[i], x.fileName); });
  }
  if (!files.size) return { notifyNo, files: [], error: "Không thấy tệp nào trên trang gói thầu." };
  // Tên trùng (thường gặp: "Chuong 5.pdf" ở hai chỗ) được đánh số để không ghi đè nhau.
  const used = new Map();
  const out = [...files].map(([id, name]) => {
    const n = used.get(name.toLowerCase()) || 0;
    used.set(name.toLowerCase(), n + 1);
    return { id, name: n ? name.replace(/(\.[^.]*)?$/, ` (${n})$1`) : name };
  });
  return { notifyNo, files: out };
})()
