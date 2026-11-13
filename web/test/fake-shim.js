// Thay web/shim.js khi thử (web/test/serve.mjs): window.claude.use("db") trả DB giả trong bộ nhớ, cùng giao diện với
// db của shim.js (doc/collection/onSnapshot/get/set/update/delete/full/refresh), nạp dữ liệu mẫu /__test/seed.json.
// Mọi lần ghi được ghi lại ở window.__gb.writes [{ path, data, updated_at, op }] như upsert của shim.js thật đổi updated_at.
// Không gọi mạng; /api/* (genbidApi) trả lời giả và ghi vào window.__gb.api.
(() => {
  const gb = (window.__gb = { writes: [], api: [], colls: null, stamps: {} });
  const seeded = fetch("/__test/seed.json").then((r) => r.json()).then((s) => {
    gb.colls = s.colls;
    for (const [c, docs] of Object.entries(s.colls)) gb.stamps[c] = Object.fromEntries(Object.keys(docs).map((id) => [id, s.stamp]));
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
    async full() {},
    doc(path) {
      const [c, id] = split(path);
      return {
        id,
        onSnapshot(fn) { return watch(c, () => fn(snapDoc(id, gb.colls[c]?.[id]))); },
        async get() { await seeded; return snapDoc(id, gb.colls[c]?.[id]); },
        async set(data) {
          await seeded;
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
  window.genbidScratch = async () => [];
  window.claude = {
    async use(name) {
      await seeded;
      if (name === "db") return db;
      if (name === "downloads") return { async save() {} };
      if (name === "assets") return { async upload() { throw { message: "Không tải tệp lên ở server thử." }; } };
      return null;
    },
  };
})();
