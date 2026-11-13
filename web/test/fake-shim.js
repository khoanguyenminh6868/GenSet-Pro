// Thay web/shim.js khi thử (web/test/serve.mjs): window.claude.use("db") trả DB giả trong bộ nhớ, cùng giao diện với
// db của shim.js (doc/collection/onSnapshot/get/set/update/delete/full/refresh), nạp dữ liệu mẫu /__test/seed.json.
// Mọi lần ghi được ghi lại ở window.__gb.writes [{ path, data, updated_at, op }] như upsert của shim.js thật đổi updated_at.
// Không gọi mạng; /api/* (genbidApi) trả lời giả và ghi vào window.__gb.api.
// Dữ liệu riêng của một ca: page.addInitScript đặt window.__gbPatch trước khi trang chạy (fixtures.mjs withPatch):
//   colls: { coll: { id: doc | null } } trộn vào dữ liệu mẫu (null = bỏ tài liệu);
//   full: { "coll/id": doc } bản đầy đủ của tài liệu rút gọn (_lite, như api/lite.js): db.full(path) thay vào như shim.js;
//   scratch: "fail" → genbidScratch ném lỗi (trang đọc chữ trong tệp bằng thư viện); mặc định trả danh sách tệp giả.
//   failSet: ["tracked", ...] → set() của các collection này ném lỗi mất kết nối, không ghi (ca "DB không ghi được").
(() => {
  const patch = window.__gbPatch || {};
  const gb = (window.__gb = { writes: [], api: [], colls: null, stamps: {}, fulls: [], scratch: [] });
  const seeded = fetch("/__test/seed.json").then((r) => r.json()).then((s) => {
    gb.colls = s.colls;
    for (const [c, docs] of Object.entries(patch.colls || {})) {
      const next = { ...(gb.colls[c] || {}) };
      for (const [id, d] of Object.entries(docs)) { if (d === null) delete next[id]; else next[id] = d; }
      gb.colls[c] = next;
    }
    for (const [c, docs] of Object.entries(gb.colls)) gb.stamps[c] = Object.fromEntries(Object.keys(docs).map((id) => [id, s.stamp]));
  });
  const listeners = {}; // coll -> Set(fn)
  const split = (p) => { const i = p.indexOf("/"); return [p.slice(0, i), p.slice(i + 1)]; };
  const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
  const snapDoc = (id, data) => ({ id, exists: data !== undefined, data: () => clone(data) });
  const notify = (c) => setTimeout(() => (listeners[c] || new Set()).forEach((fn) => fn()), 0);
  // Mốc ghi tăng dần, kể cả hai lần ghi trong cùng một mili giây.
  let last = "";
  const now = () => { let t = new Date().toISOString(); if (t <= last) t = new Date(Date.parse(last) + 1).toISOString(); return (last = t); };
  function watch(c, fn) {
    (listeners[c] ||= new Set()).add(fn);
    seeded.then(() => setTimeout(fn, 0));
    return () => listeners[c].delete(fn);
  }
  const db = {
    async refresh() {},
    // Như shim.js: chỉ đọc khi tài liệu đang giữ là bản rút gọn; xong thì báo người nghe của collection.
    async full(path) {
      await seeded;
      const [c, id] = split(path);
      if (!gb.colls[c]?.[id]?._lite) return;
      gb.fulls.push(path);
      const whole = patch.full?.[path];
      if (!whole) return;
      gb.colls[c] = { ...gb.colls[c], [id]: clone(whole) };
      notify(c);
    },
    doc(path) {
      const [c, id] = split(path);
      return {
        id,
        onSnapshot(fn) { return watch(c, () => fn(snapDoc(id, gb.colls[c]?.[id]))); },
        async get() { await seeded; await db.full(path); return snapDoc(id, gb.colls[c]?.[id]); },
        async set(data) {
          await seeded;
          if ((patch.failSet || []).includes(c)) throw { code: "unavailable", message: "Mất kết nối (server thử)" };
          const at = now();
          gb.colls[c] = { ...(gb.colls[c] || {}), [id]: clone(data) };
          (gb.stamps[c] ||= {})[id] = at;
          gb.writes.push({ op: "set", path, data: clone(data), updated_at: at });
          notify(c);
        },
        async update(patch) { const cur = (await this.get()).data() || {}; await this.set({ ...cur, ...patch }); },
        async delete() {
          await seeded;
          if (gb.colls[c]) { const next = { ...gb.colls[c] }; delete next[id]; gb.colls[c] = next; }
          if (gb.stamps[c]) delete gb.stamps[c][id];
          gb.writes.push({ op: "delete", path, updated_at: now() });
          notify(c);
        },
      };
    },
    collection(c) {
      return {
        doc: (id) => db.doc(c + "/" + id),
        onSnapshot(fn) { return watch(c, () => { const m = gb.colls[c] || {}; fn({ docs: Object.keys(m).map((id) => snapDoc(id, m[id])), size: Object.keys(m).length }); }); },
      };
    },
  };
  window.genbidWeb = true;
  window.genbidEmail = "test@example.invalid";
  window.genbidRole = "superadmin";
  window.genbidApi = async (path, body) => {
    gb.api.push({ path, body: clone(body) });
    if (path === "/api/webreq") {
      const at = now();
      return { saved: (body.items || []).map((it) => ({ key: it.key, data: { ...it, requestedAt: at, by: window.genbidEmail } })) };
    }
    return {};
  };
  window.genbidFetch = async () => { throw { message: "Không có tệp ở server thử." }; };
  // Như shim.js: mỗi tệp một đường dẫn trong bucket scratch; tên thật đi kèm yêu cầu.
  window.genbidScratch = async (key, files, dir = "hsdt") => {
    gb.scratch.push({ key, dir, names: [...files].map((f) => f.name) });
    if (patch.scratch === "fail") throw { message: "Không tải được tệp lên (server thử)" };
    return [...files].map((f, i) => ({ path: `${dir}/${key}/1/${String(i + 1).padStart(2, "0")}-${f.name}`, name: f.name, size: f.size }));
  };
  // Tải tệp về như shim.js (thẻ <a download>): Playwright bắt được sự kiện download và đọc nội dung.
  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
    },
  };
  window.claude = {
    async use(name) {
      await seeded;
      if (name === "db") return db;
      if (name === "downloads") return downloads;
      if (name === "assets") return { async upload() { throw { message: "Không tải tệp lên ở server thử." }; } };
      return null;
    },
  };
})();
