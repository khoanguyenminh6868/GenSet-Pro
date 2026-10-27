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
    if (document.readyState === "loading") await new Promise((r) => document.addEventListener("DOMContentLoaded", r, { once: true }));
    // Sign-out button is intentionally hidden (accountChip not shown).
    if (!sessionStorage.getItem("gbLogged")) {
      sessionStorage.setItem("gbLogged", "1");
      const ua = navigator.userAgent;
      sb.rpc("log_activity", { p_action: "login", p_detail: { device: /Mobi|Android|iPhone|iPad/.test(ua) ? "Điện thoại" : "Máy tính", ua: ua.slice(0, 200) } }).then(() => {}, () => {});
    }
    if (member.role === "superadmin") logButton();
    const canImport = ["superadmin", "owner", "admin"].includes(member.role);
    if (location.hash === "#import" || sessionStorage.getItem("gbImport")) {
      sessionStorage.removeItem("gbImport");
      if (canImport) importPanel(); else toastNote(`Tài khoản ${member.email} có vai trò "${member.role}", cần "owner" hoặc "admin" để nhập dữ liệu.`);
    }
    window.addEventListener("hashchange", () => { if (location.hash === "#import" && canImport) importPanel(); });
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
    el.querySelector("#gIn")?.addEventListener("click", () => { if (location.hash === "#import") sessionStorage.setItem("gbImport", "1"); sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } }); });
    el.querySelector("#gOut")?.addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });
  }
  // Sign-out icon next to the theme button in the page banner (bottom-left pill if the banner is missing).
  function accountChip(user) {
    const b = document.createElement("button");
    b.className = "ibtn";
    b.id = "signOutBtn";
    b.title = "Đăng xuất " + user.email;
    b.setAttribute("aria-label", "Đăng xuất");
    b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h11"/></svg>';
    b.onclick = async () => { await sb.auth.signOut(); location.reload(); };
    const theme = document.getElementById("themeBtn");
    if (theme) theme.after(b);
    else {
      b.style.cssText = "position:fixed;left:max(12px,env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:50";
      document.body.appendChild(b);
    }
  }

  // ---------- activity log (superadmin only; the activity_log table is readable by superadmin only) ----------
  function logButton() {
    const b = document.createElement("button");
    b.className = "ibtn";
    b.id = "logBtn";
    b.title = "Xem nhật ký hoạt động (chỉ superadmin)";
    b.setAttribute("aria-label", "Xem log");
    b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></svg>';
    b.onclick = logPanel;
    const anchor = document.getElementById("syncNewBtn");
    if (anchor) anchor.after(b);
    else { b.style.cssText = "position:fixed;right:max(12px,env(safe-area-inset-right,0px));top:12px;z-index:50"; document.body.appendChild(b); }
  }

  const LOG_COLL = {
    tracked: "theo dõi gói thầu", manual: "gói thêm tay", deleted: "danh sách gói đã xoá", seen: "gói mới ghi nhận", feed: "danh sách gói từ muasamcong",
    notice: "thông báo mời thầu", analysis: "kết quả phân tích", analysisreq: "yêu cầu phân tích", hsmtreq: "yêu cầu tải HSMT", hsmt: "tệp HSMT",
    hsmttext: "nội dung HSMT", syncreq: "yêu cầu đồng bộ muasamcong", translationreq: "yêu cầu tạo YCKT tiếng Anh", translation: "YCKT tiếng Anh",
    comparereq: "yêu cầu đối chiếu HSDT", compare: "kết quả đối chiếu HSDT", hsdtreq: "yêu cầu tạo HSDT tham khảo", hsdt: "HSDT tham khảo",
    bidders: "nhà thầu tham dự", portalids: "mã gói trên cổng",
  };
  const LOG_OP = { insert: "Tạo", update: "Cập nhật", delete: "Xoá" };
  const LOG_STAGE = { new: "Mới", reviewing: "Đang xem", preparing: "Chuẩn bị HSDT", submitted: "Đã nộp", won: "Trúng thầu", lost: "Không trúng", dropped: "Bỏ qua" };
  const LOG_KEY = { stage: "trạng thái", prevStage: "trạng thái trước", note: "ghi chú", bidPrice: "giá dự thầu", bidPriceSrc: "nguồn giá", tender: "thông tin gói",
    requestedAt: "thời điểm yêu cầu", doneAt: "thời điểm xong", error: "lỗi", status: "tình trạng", files: "tệp", text: "nội dung", updatedAt: "thời điểm sửa" };
  const logTz = { timeZone: "Asia/Ho_Chi_Minh" };
  const logDate = new Intl.DateTimeFormat("vi-VN", { ...logTz, weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
  const logTime = new Intl.DateTimeFormat("vi-VN", { ...logTz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // [title, details] in plain Vietnamese for one log row.
  function logText(r) {
    const d = r.detail || {};
    if (r.action === "login") return ["Đăng nhập / mở ứng dụng", d.device || ""];
    if (r.action === "upload") return ["Tải tệp lên", [d.key ? `Mã: ${d.key}` : "", (d.files || []).join(", ")].filter(Boolean).join(" · ")];
    if (r.action === "ai") return [`Gọi AI (${d.tier || "default"}${d.images ? `, ${d.images} ảnh` : ""})`, d.ask ? `“${d.ask}…”` : ""];
    const what = LOG_COLL[r.coll] || r.coll;
    let title = `${LOG_OP[r.action] || r.action} ${what}`;
    const keys = d.keys || [];
    if (/req$/.test(r.coll) && r.action !== "delete") {
      if (keys.includes("doneAt") && !keys.includes("requestedAt")) title = (r.source === "worker" ? "Hoàn tất " : "Huỷ ") + what;
      else title = "Gửi " + what;
    }
    const parts = [];
    if (r.doc_id && r.doc_id !== "current") parts.push(`Mã: ${r.doc_id}`);
    if (d.name) parts.push(d.name);
    if (d.stage && (r.action === "insert" || keys.includes("stage"))) parts.push(`Trạng thái: ${d.prevStage && d.prevStage !== d.stage ? `${LOG_STAGE[d.prevStage] || d.prevStage} → ` : ""}${LOG_STAGE[d.stage] || d.stage}`);
    const changed = keys.filter((k) => k !== "stage" && k !== "prevStage" && k !== "updatedAt");
    if (changed.length) parts.push("Thay đổi: " + changed.slice(0, 8).map((k) => LOG_KEY[k] || k).join(", ") + (changed.length > 8 ? `, … (+${changed.length - 8})` : ""));
    if (d.mode === "new") parts.push("Chỉ lấy gói mới");
    return [title, parts.join(" · ")];
  }

  async function logPanel() {
    document.getElementById("gbLog")?.remove();
    const el = document.createElement("div");
    el.id = "gbLog";
    el.innerHTML = `<style>
      #gbLog{position:fixed;inset:0;z-index:90;background:rgba(5,8,18,.6);display:grid;place-items:center;padding:16px}
      #gbLog .lp{width:min(1000px,100%);max-height:calc(100dvh - 32px);display:grid;grid-template-rows:auto auto 1fr auto;background:var(--panel,#121a2e);color:var(--fg,#e6eaf5);border:1px solid var(--line,#24304d);border-radius:14px;box-shadow:0 12px 40px #0006;overflow:hidden}
      #gbLog .lh{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--line,#24304d)}
      #gbLog .lh h2{margin:0;font-size:17px;flex:1}
      #gbLog .lf{display:flex;flex-wrap:wrap;gap:8px;padding:10px 16px;border-bottom:1px solid var(--line,#24304d);align-items:center}
      #gbLog select,#gbLog input[type=date]{background:var(--panel2,#17213a);color:inherit;border:1px solid var(--line,#24304d);border-radius:8px;padding:6px 8px;font:inherit;max-width:100%}
      #gbLog label{display:inline-flex;gap:6px;align-items:center;font-size:13px;color:var(--muted,#8d98b5)}
      #gbLog .ll{overflow:auto;padding:0 16px}
      #gbLog .day{position:sticky;top:0;background:var(--panel,#121a2e);padding:10px 0 6px;font-weight:600;font-size:13px;color:var(--muted,#8d98b5);border-bottom:1px solid var(--line,#24304d)}
      #gbLog .r{display:grid;grid-template-columns:72px minmax(150px,220px) 1fr;gap:10px;padding:8px 0;border-bottom:1px solid var(--line,#24304d);font-size:13.5px;line-height:1.45}
      #gbLog .t{font-variant-numeric:tabular-nums;color:var(--muted,#8d98b5)}
      #gbLog .a{overflow-wrap:anywhere}#gbLog .a small{display:block;color:var(--dim,#5e6a88)}
      #gbLog .w b{font-weight:600}#gbLog .w div{color:var(--muted,#8d98b5);overflow-wrap:anywhere}
      #gbLog .lb{display:flex;gap:10px;align-items:center;padding:10px 16px;border-top:1px solid var(--line,#24304d);font-size:13px;color:var(--muted,#8d98b5)}
      #gbLog .lb span{flex:1}
      @media (max-width:640px){#gbLog{padding:0}#gbLog .lp{max-height:100dvh;height:100dvh;border-radius:0}#gbLog .r{grid-template-columns:64px 1fr}#gbLog .w{grid-column:1/-1}}
    </style>
    <div class="lp" role="dialog" aria-modal="true" aria-label="Nhật ký hoạt động">
      <div class="lh"><h2>Nhật ký hoạt động</h2><button class="ibtn" id="lgX" aria-label="Đóng">✕</button></div>
      <div class="lf">
        <select id="lgWho" aria-label="Người thực hiện"><option value="">Tất cả người dùng</option></select>
        <select id="lgKind" aria-label="Loại hoạt động">
          <option value="">Mọi hoạt động</option><option value="data">Thay đổi dữ liệu</option><option value="login">Đăng nhập</option>
          <option value="upload">Tải tệp lên</option><option value="ai">Gọi AI</option></select>
        <label>Ngày <input type="date" id="lgDay"></label>
        <label><input type="checkbox" id="lgNoBot" checked> Ẩn log của Máy chủ HSMT (tự động)</label>
      </div>
      <div class="ll" id="lgList"></div>
      <div class="lb"><span id="lgInfo">Đang tải...</span><button class="btn sm" id="lgMore" hidden>Tải thêm</button></div>
    </div>`;
    document.body.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const close = () => { el.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    $("#lgX").onclick = close;
    el.addEventListener("click", (e) => { if (e.target === el) close(); });

    const { data: people } = await sb.from("members").select("email").order("email");
    for (const email of [...(people || []).map((p) => p.email), "worker"]) {
      const o = document.createElement("option");
      o.value = email; o.textContent = email === "worker" ? "Máy chủ HSMT (tự động)" : email;
      $("#lgWho").appendChild(o);
    }

    const PAGE = 200;
    let rows = [], total = 0, seq = 0;
    async function load(more) {
      const my = ++seq;
      let q = sb.from("activity_log").select("*", { count: "exact" }).order("at", { ascending: false }).order("id", { ascending: false });
      const who = $("#lgWho").value, kind = $("#lgKind").value, day = $("#lgDay").value;
      if (who) q = q.eq("actor", who);
      // Picking the worker in the people filter shows its rows even with the box ticked.
      else if ($("#lgNoBot").checked) q = q.neq("actor", "worker");
      if (kind === "data") q = q.in("action", ["insert", "update", "delete"]);
      else if (kind) q = q.eq("action", kind);
      if (day) { const from = new Date(`${day}T00:00:00+07:00`); q = q.gte("at", from.toISOString()).lt("at", new Date(+from + 864e5).toISOString()); }
      $("#lgInfo").textContent = "Đang tải...";
      const { data, error, count } = await q.range(more ? rows.length : 0, (more ? rows.length : 0) + PAGE - 1);
      if (my !== seq) return;
      if (error) { $("#lgInfo").textContent = /activity_log/.test(error.message) ? "Chưa có bảng nhật ký: cần chạy lại supabase/schema.sql." : "Lỗi: " + error.message; return; }
      rows = more ? rows.concat(data) : data;
      total = count ?? rows.length;
      render();
    }
    function render() {
      let lastDay = "", html = "";
      for (const r of rows) {
        const at = new Date(r.at), day = logDate.format(at);
        if (day !== lastDay) { html += `<div class="day">${esc(day)}</div>`; lastDay = day; }
        const [title, sub] = logText(r);
        const who = r.actor === "worker" ? "Máy chủ HSMT (tự động)" : r.actor;
        const via = r.source === "worker" ? "" : r.source === "server" ? "qua máy chủ web" : "trên trang web";
        html += `<div class="r"><div class="t" title="${esc(at.toISOString())}">${esc(logTime.format(at))}</div>
          <div class="a">${esc(who)}${via ? `<small>${esc(via)}</small>` : ""}</div>
          <div class="w"><b>${esc(title)}</b>${sub ? `<div>${esc(sub)}</div>` : ""}</div></div>`;
      }
      $("#lgList").innerHTML = html || '<p class="muted" style="padding:16px 0">Không có hoạt động nào.</p>';
      $("#lgInfo").textContent = `Hiển thị ${rows.length} / ${total} hoạt động · giờ Việt Nam (GMT+7)`;
      $("#lgMore").hidden = rows.length >= total;
    }
    $("#lgMore").onclick = () => load(true);
    for (const id of ["#lgWho", "#lgKind", "#lgDay", "#lgNoBot"]) $(id).onchange = () => load(false);
    load(false);
  }

  function toastNote(text) {
    const n = document.createElement("div");
    n.textContent = text;
    n.style.cssText = "position:fixed;left:12px;right:12px;bottom:90px;max-width:420px;margin:auto;z-index:60;padding:12px;border-radius:10px;background:var(--card,#fff);color:var(--fg,#222);border:1px solid var(--rule,#8884);font:14px system-ui,sans-serif";
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 12000);
  }

  // ---------- one-time import of the claude.ai data (owner opens /#import) ----------
  async function importPanel() {
    document.getElementById("gbImportPanel")?.remove();
    const el = document.createElement("div");
    el.id = "gbImportPanel";
    el.style.cssText = "position:fixed;inset:auto 12px 56px 12px;max-width:420px;margin:auto;z-index:60;padding:16px;border-radius:12px;background:var(--card,#fff);color:var(--fg,#222);border:1px solid var(--rule,#8884);box-shadow:0 8px 30px #0004;font:14px system-ui,sans-serif;display:grid;gap:10px";
    el.innerHTML = '<b>Nhập dữ liệu từ bản cũ</b><span>Chọn tệp genbid-data.zip. Dữ liệu cùng mã sẽ bị ghi đè.</span><input type="file" accept=".zip"><div id="impLog" style="opacity:.8"></div>';
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
    channel = sb.channel("docs").on("postgres_changes", { event: "*", schema: "public", table: "docs" }, async (p) => {
      const row = p.eventType === "DELETE" ? p.old : p.new;
      const c = row && cache.get(row.coll);
      if (!c) return;
      if (p.eventType === "DELETE") { c.delete(row.id); notify(row.coll); return; }
      // Realtime can deliver a row without its data (large or unchanged values are left out of the payload):
      // read the row again instead of overwriting the cached document with nothing.
      let data = row.data;
      if (!data || typeof data !== "object" || (p.errors && p.errors.length)) {
        const { data: rows, error } = await sb.from("docs").select("data").eq("coll", row.coll).eq("id", row.id).limit(1);
        if (error || !rows?.length) return;
        data = rows[0].data;
      }
      c.set(row.id, data);
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
    // Re-read some documents ("coll/id") from the server and notify listeners of the ones that changed
    // (fallback when a realtime change does not arrive, e.g. while waiting for the worker's answer).
    async refresh(paths) {
      const changed = new Set();
      await Promise.all(paths.map(async (path) => {
        const [coll, id] = split(path);
        const c = cache.get(coll);
        if (!c) return;
        const { data, error } = await sb.from("docs").select("data").eq("coll", coll).eq("id", id).maybeSingle();
        if (error) return;
        const next = data?.data;
        if (JSON.stringify(next) === JSON.stringify(c.get(id))) return;
        if (next === undefined) c.delete(id); else c.set(id, next);
        changed.add(coll);
      }));
      changed.forEach(notify);
    },
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

  // ---------- assets (uploads to the public "blobs" bucket, served at /_blob/<id>) ----------
  const assets = {
    async upload(blob) {
      const id = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
      const contentType = blob.type || "application/octet-stream";
      const { error } = await sb.storage.from("blobs").upload(id, blob, { contentType });
      if (error) throw { code: "error", message: error.message };
      logUpload([blob.name || contentType]);
      return { id, url: "/_blob/" + id, sizeBytes: blob.size, contentType };
    },
  };

  // ---------- HSDT files for a "Đối chiếu" request: the private "scratch" bucket, read only by the worker ----------
  // Storage keys take ASCII only, so the key is a number and a plain-letters name; the real name travels in the request.
  window.genbidScratch = async (key, files) => {
    await ready;
    const base = `hsdt/${key}/${Date.now()}`;
    const out = [];
    for (const [i, f] of [...files].entries()) {
      const plain = f.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^A-Za-z0-9._-]+/g, "_").slice(-120);
      const path = `${base}/${String(i + 1).padStart(2, "0")}-${plain}`;
      const { error } = await sb.storage.from("scratch").upload(path, f, { contentType: f.type || "application/octet-stream" });
      if (error) throw { message: `Không tải được ${f.name} lên: ${error.message}` };
      out.push({ path, name: f.name, size: f.size });
    }
    if (out.length) logUpload(out.map((f) => f.name), key);
    return out;
  };
  function logUpload(files, key) {
    sb.rpc("log_activity", { p_action: "upload", p_detail: { files: files.slice(0, 50), ...(key ? { key } : {}) } }).then(() => {}, () => {});
  }

  window.genbidWeb = true; // features that need the web version (e.g. HSMT fetch requests)
  // POST to one of this site's /api endpoints as the signed-in member; resolves to the JSON body, throws { message }.
  window.genbidApi = async (path, body) => {
    await ready;
    const { data: { session } } = await sb.auth.getSession();
    const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` }, body: JSON.stringify(body) });
    const out = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
    if (!r.ok) throw { message: out.error || `HTTP ${r.status}` };
    return out;
  };
  window.claude = {
    async use(name) {
      await ready;
      if (name === "db") return db;
      if (name === "sample") return cfg.ai ? sample : null;
      if (name === "downloads") return downloads;
      if (name === "assets") return assets;
      return null;
    },
  };
})();
