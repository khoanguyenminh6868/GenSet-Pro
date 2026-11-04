// GenBid - tai HSMT: chay tren trang chi tiet goi thau cua muasamcong.mof.gov.vn.
// Lay danh sach file ma trang da hien thi, roi tai tung file qua VNeGP Client Agent
// (http://localhost:1234), giong nut tai cua chinh trang web.
(async () => {
  const AGENT = 'http://localhost:1234/api/download/file/browser/public';
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!/muasamcong\.(mof|mpi)\.gov\.vn$/.test(location.hostname)) {
    alert('GenBid: hãy mở trang chi tiết gói thầu trên muasamcong.mof.gov.vn rồi bấm lại.');
    return;
  }
  const q = new URLSearchParams(location.search);
  const notifyNo = q.get('notifyNo') || 'HSMT';
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // File trong tab "Hồ sơ mời thầu" chỉ có sau khi mở tab đó.
  if (!document.getElementsByClassName('file-download-all').length) {
    const tab = document.querySelector('a[href="#file-tender-invitation"]');
    if (tab) { tab.click(); await sleep(3000); }
  }

  const files = new Map();
  for (const el of document.getElementsByClassName('file-download-all')) {
    const i = el.id.indexOf(',');
    const id = el.id.slice(0, i), name = el.id.slice(i + 1);
    if (UUID.test(id)) files.set(id, name);
  }
  // Các file khác trang đã tải về (vd. quyết định phê duyệt HSMT): cặp xxxFileId / xxxFileName.
  const seen = new WeakSet();
  const walk = (o, depth) => {
    if (!o || typeof o !== 'object' || depth > 12 || seen.has(o)) return;
    seen.add(o);
    if (o._isVue) { walk(o.$data, depth + 1); (o.$children || []).forEach(c => walk(c, depth + 1)); return; }
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'string') {
        if (/fileid$/i.test(k) && UUID.test(v) && !files.has(v)) {
          const nameKey = k.replace(/Id$/, 'Name').replace(/ID$/, 'Name');
          if (typeof o[nameKey] === 'string' && o[nameKey]) files.set(v, o[nameKey]);
        }
      } else walk(v, depth + 1);
    }
  };
  document.querySelectorAll('[id]').forEach(el => { if (el.__vue__ && el.__vue__ === el.__vue__.$root) walk(el.__vue__, 0); });

  if (!files.size) {
    alert('GenBid: không thấy file nào trên trang này. Đợi trang tải xong (hoặc đăng nhập nếu trang yêu cầu) rồi bấm lại.');
    return;
  }

  const save = (blob, name) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  };
  const safe = s => s.replace(/[\\/:*?"<>|]+/g, '_');

  // Danh sách file: GenBid-HSMT.cmd đọc file này để tải vào thư mục riêng của gói thầu.
  const list = '# ' + notifyNo + '\n' + [...files].map(([id, n]) => id + ',' + n).join('\n') + '\n';
  save(new Blob([list], { type: 'text/plain' }), safe(notifyNo + '_danh-sach-file.txt'));

  const ok = [], fail = [];
  for (const [id, name] of files) {
    try {
      const r = await fetch(AGENT + '?fileId=' + encodeURIComponent(id));
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const blob = await r.blob();
      if (!blob.size) throw new Error('file rỗng');
      save(blob, safe(notifyNo + '_' + name));
      ok.push(name + ' (' + Math.round(blob.size / 1024) + ' KB)');
      await sleep(400);
    } catch (e) {
      if (e instanceof TypeError) {
        alert('GenBid ' + notifyNo + ': đã lưu danh sách ' + files.size + ' file, nhưng trình duyệt không gọi được VNeGP Client Agent (localhost:1234).\n' +
              'Chạy "GenBid-HSMT.cmd": nó tự bật Agent và tải các file trong danh sách vừa lưu.');
        return;
      }
      fail.push(name + ': ' + e.message);
    }
  }
  alert('GenBid ' + notifyNo + ': đã tải ' + ok.length + '/' + files.size + ' file.\n\n' + ok.join('\n') +
        (fail.length ? '\n\nLỗi:\n' + fail.join('\n') : ''));
})();
