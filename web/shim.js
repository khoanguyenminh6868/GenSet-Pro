// GenBid Pro outside claude.ai: provides window.claude.use() backed by Supabase (Google sign-in,
// shared data, files) and /api/sample (Claude through the API key), so the page code is unchanged.
(() => {
  let sb, cfg, member;
  const ready = (async () => {
    cfg = await (await fetch("/api/config")).json();
    if (!cfg.url) throw new Error("Chưa cấu hình Supabase.");
    sb = supabase.createClient(cfg.url, cfg.anonKey);
    let { data: { session } } = await sb.auth.getSession();
    if (!session) { await gate("login"); return new Promise(() => {}); }
    const { data: rows } = await sb.from("members").select("email,role").eq("email", session.user.email.toLowerCase());
    member = rows?.[0];
    if (!member) { await gate("denied", session.user.email); return new Promise(() => {}); }
    accountChip(session.user);
    if (location.hash === "#import" && ["owner", "admin"].includes(member.role)) importPanel();
  })();

  // ---------- sign-in screen ----------
  function gate(kind, email) {
    const el = document.createElement("div");
    el.id = "authGate";
    el.innerHTML = `<style>#authGate{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:var(--bg,#0e1116);padding:16px}
      #authGate .box{max-width:360px;width:100%;text-align:center;font-family:Sora,system-ui,sans-serif;color:var(--fg,#e8ecf2);display:grid;gap:14px}
      #authGate h1{margin:0;font-size:24px}#authGate p{margin:0;opacity:.75;line-height:1.5}
      #authGate button{font:600 15px system-ui,sans-serif;padding:12px 16px;border-radius:10px;border:1px solid #c9d1dc;background:#fff;color:#1f2328;cursor:pointer}</style>
      <div class="box"><h1>GenBid Pro</h1>${kind === "login"
        ? `<p>Đăng nhập bằng tài khoản Google đã được cấp quyền.</p><button id="gIn">Đăng nhập bằng Google</button>`
        : `<p>Tài khoản <b></b> chưa được cấp quyền. Hãy nhờ quản trị viên thêm email này.</p><button id="gOut">Đăng xuất</button>`}</div>`;
    if (email) el.querySelector("b").textContent = email;
    document.body.appendChild(el);
    el.querySelector("#gIn")?.addEventListener("click", () => sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } }));
    el.querySelector("#gOut")?.addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });
  }
  function accountChip(user) {
    const b = document.createElement("button");
    b.title = "Đăng xuất " + user.email;
    b.textContent = (user.user_metadata?.full_name || user.email).split(" ").slice(-1)[0] + " · Đăng xuất";
    b.style.cssText = "position:fixed;left:max(12px,env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:50;font:12px system-ui,sans-serif;padding:6px 10px;border-radius:999px;border:1px solid var(--rule,#8884);background:var(--card,#fff);color:var(--fg,#222);opacity:.85;cursor:pointer";
    b.onclick = async () => { await sb.auth.signOut(); location.reload(); };
    document.body.appendChild(b);
  }

  // ---------- one-time import of the claude.ai data (owner opens /#import) ----------
  async function importPanel() {
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;inset:auto 12px 56px 12px;max-width:420px;margin:auto;z-index:60;padding:16px;border-radius:12px;background:var(--card,#fff);color:var(--fg,#222);border:1px solid var(--rule,#8884);box-shadow:0 8px 30px #0004;font:14px system-ui,sans-serif;display:grid;gap:10px";
    el.innerHTML = '<b>Nhập dữ liệu từ bản claude.ai</b><span>Chọn tệp genbid-data.zip. Dữ liệu cùng mã sẽ bị ghi đè.</span><input type="file" accept=".zip"><div id="impLog" style="opacity:.8"></div>';
    document.body.appendChild(el);
    const log = (t) => (el.querySelector("#impLog").textContent = t);
    el.querySelector("input").onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        if (!window.JSZip) await new Promise((ok, bad) => { const sc = document.createElement("script"); sc.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; sc.onload = ok; sc.onerror = bad; document.head.appendChild(sc); });
        const zip = await JSZip.loadAsync(file);
        const rows = JSON.parse(await zip.file("data.json").async("string"));
        for (let i = 0; i < rows.length; i += 100) {
          const { error } = await sb.from("docs").upsert(rows.slice(i, i + 100).map((r) => ({ ...r, updated_at: new Date().toISOString() })));
          if (error) throw error;
          log(`Dữ liệu: ${Math.min(i + 100, rows.length)}/${rows.length}`);
        }
        const blobs = Object.values(zip.files).filter((f) => !f.dir && f.name.startsWith("blobs/"));
        let done = 0, skipped = 0;
        for (const f of blobs) {
          const name = f.name.slice(6).replace(/\.[^.]+$/, "");
          const type = f.name.endsWith(".pdf") ? "application/pdf" : f.name.endsWith(".ttf") ? "font/ttf" : "application/octet-stream";
          const { error } = await sb.storage.from("blobs").upload(name, await f.async("blob"), { contentType: type });
          if (error && !/exists|duplicate/i.test(error.message)) throw error;
          if (error) skipped++; else done++;
          log(`Tệp: ${done + skipped}/${blobs.length}`);
        }
        log(`Xong: ${rows.length} bản ghi, ${done} tệp mới, ${skipped} tệp đã có. Tải lại trang để xem.`);
      } catch (err) { log("Lỗi: " + (err.message || err)); }
    };
  }

  // ---------- db (same shape as the claude.ai db capability) ----------
  const split = (path) => { const i = path.indexOf("/"); return [path.slice(0, i), path.slice(i + 1)]; };
  const cache = new Map();      // coll -> Map(id -> data)
  const listeners = new Map();  // coll -> Set(fn)
  let channel;
  const notify = (coll) => listeners.get(coll)?.forEach((fn) => fn());
  function ensureChannel() {
    if (channel) return;
    channel = sb.channel("docs").on("postgres_changes", { event: "*", schema: "public", table: "docs" }, (p) => {
      const row = p.eventType === "DELETE" ? p.old : p.new;
      const c = cache.get(row.coll);
      if (!c) return;
      if (p.eventType === "DELETE") c.delete(row.id); else c.set(row.id, row.data);
      notify(row.coll);
    }).subscribe();
  }
  async function loadColl(coll) {
    if (cache.has(coll)) return;
    const m = new Map();
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from("docs").select("id,data").eq("coll", coll).range(from, from + 999);
      if (error) throw error;
      data.forEach((r) => m.set(r.id, r.data));
      if (data.length < 1000) break;
    }
    cache.set(coll, m);
  }
  function watch(coll, fn, onErr) {
    ensureChannel();
    if (!listeners.has(coll)) listeners.set(coll, new Set());
    listeners.get(coll).add(fn);
    loadColl(coll).then(fn, (e) => onErr?.(e));
    return () => listeners.get(coll).delete(fn);
  }
  const snapDoc = (id, data) => ({ id, exists: data !== undefined, data: () => data });
  const fail = (error) => { const e = new Error(error.message); e.code = error.code === "42501" ? "permission_denied" : error.code; throw e; };
  const db = {
    doc(path) {
      const [coll, id] = split(path);
      return {
        id,
        onSnapshot(fn, onErr) { return watch(coll, () => fn(snapDoc(id, cache.get(coll).get(id))), onErr); },
        async get() {
          if (cache.has(coll)) return snapDoc(id, cache.get(coll).get(id));
          const { data, error } = await sb.from("docs").select("data").eq("coll", coll).eq("id", id).maybeSingle();
          if (error) fail(error);
          return snapDoc(id, data?.data);
        },
        async set(data) {
          const { error } = await sb.from("docs").upsert({ coll, id, data, updated_at: new Date().toISOString() });
          if (error) fail(error);
          if (cache.has(coll)) { cache.get(coll).set(id, data); notify(coll); }
        },
        async update(patch) { const cur = (await this.get()).data() || {}; await this.set({ ...cur, ...patch }); },
        async delete() {
          const { error } = await sb.from("docs").delete().eq("coll", coll).eq("id", id);
          if (error) fail(error);
          if (cache.has(coll)) { cache.get(coll).delete(id); notify(coll); }
        },
      };
    },
    collection(coll) {
      return {
        doc: (id) => db.doc(coll + "/" + id),
        onSnapshot(fn, onErr) {
          return watch(coll, () => fn({ docs: [...cache.get(coll)].map(([id, d]) => snapDoc(id, d)), size: cache.get(coll).size }), onErr);
        },
      };
    },
  };

  // ---------- sample (Claude via /api/sample) ----------
  async function call(input, opts, json) {
    const { data: { session } } = await sb.auth.getSession();
    const images = [];
    for (const blob of opts?.images || []) {
      const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await sb.storage.from("scratch").upload(path, blob, { contentType: blob.type || "image/jpeg" });
      if (error) throw { code: "error", message: error.message };
      images.push(path);
    }
    const r = await fetch("/api/sample", {
      method: "POST", signal: opts?.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ input, json, modelTier: opts?.modelTier || "default", images }),
    });
    const body = await r.json().catch(() => ({ code: "error", message: `HTTP ${r.status}` }));
    if (!r.ok) throw body;
    opts?.onText?.({ text: body.text, delta: body.text });
    return body;
  }
  const sample = Object.assign((input, opts) => call(input, opts, false).then((b) => ({ text: b.text, truncated: b.truncated })), {
    json: (input, opts) => call(input, opts, true).then((b) => b.value),
    limits: async () => ({ images: { maxCount: 20 } }),
  });

  // ---------- downloads ----------
  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data]);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    },
  };

  window.claude = {
    async use(name) {
      await ready;
      if (name === "db") return db;
      if (name === "sample") return cfg.ai ? sample : null;
      if (name === "downloads") return downloads;
      return null;
    },
  };
})();
