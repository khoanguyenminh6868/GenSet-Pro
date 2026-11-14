// Busy indicator for every action on the page: work that a click, a change, Enter, a drop or a paste starts (any fetch,
// reading its answer, or a promise passed to window.genbidBusy) and that takes longer than DELAY shows a spinner in the middle
// of the page and in the button that was pressed; both go away when the work ends. Background reads (catch-ups, realtime)
// that no action started show nothing. Loaded before supabase-js, so the client picks up the wrapped fetch.
(() => {
  const DELAY = 300, WINDOW = 1500, TAIL = 200;
  let actAt = -1e9, actEl = null, settledAt = -1e9, pending = 0, timer = 0, pill = null, held = null;
  const now = () => performance.now();
  // Work counts while an action is fresh, while other counted work runs, and right after it (the next step of a chain).
  const active = () => pending > 0 || now() - actAt < WINDOW || now() - settledAt < TAIL;

  const act = (e) => {
    if (e.type === "keydown" && e.key !== "Enter") return;
    actAt = now();
    actEl = e.target?.closest?.("button,.btn,[role=button]") || null;
    // A tab needs no spinner of its own: the one in the middle of the screen already shows its content is loading.
    if (actEl?.closest("[role=tablist]")) actEl = null;
    // Nor an icon-only button (PDF, download, add, trash): a ring beside its icon is a second spinner (Khoa, 2026-11-04).
    if (actEl && actEl.textContent.trim() === [...actEl.querySelectorAll("svg")].map((x) => x.textContent).join("").trim()) actEl = null;
  };
  for (const t of ["click", "change", "submit", "keydown", "drop", "paste"]) addEventListener(t, act, true);

  // A screen that shows its own spinner while it loads (.loading, e.g. the PDF viewer), or a progress line with one (.progress,
  // e.g. uploading a quote), gets no second one in the middle.
  const ownSpinner = () => [...document.querySelectorAll(".loading .spin, .progress .spin")].some((e) => e.getClientRects().length);
  function show() {
    timer = 0;
    if (!pending) return;
    document.documentElement.classList.add("gb-busy");
    if (ownSpinner()) { if (pill) pill.hidden = true; return; }
    if (!pill && document.body) {
      pill = document.createElement("div");
      pill.className = "busypill"; pill.setAttribute("role", "status"); pill.setAttribute("aria-label", "Đang xử lý");
      pill.innerHTML = '<span class="spin"></span>';
      document.body.appendChild(pill);
    }
    if (pill) pill.hidden = false;
    if (actEl?.isConnected && now() - actAt < WINDOW + DELAY && !held) { held = actEl; held.classList.add("is-busy"); held.setAttribute("aria-busy", "true"); }
  }
  function hide() {
    if (pending) return;
    if (timer) { clearTimeout(timer); timer = 0; }
    document.documentElement.classList.remove("gb-busy");
    if (pill) pill.hidden = true;
    if (held) { held.classList.remove("is-busy"); held.removeAttribute("aria-busy"); held = null; }
  }
  function track(p) {
    pending++;
    if (!timer && !document.documentElement.classList.contains("gb-busy")) timer = setTimeout(show, DELAY);
    const done = () => { pending--; settledAt = now(); if (!pending) setTimeout(hide, TAIL); };
    Promise.resolve(p).then(done, done);
    return p;
  }

  // Past tenders (bidhist, ~14 MB) load silently, even right after a click (Khoa, 2026-11-14).
  const quiet = (u) => /[?&]coll=eq\.bidhist(&|$)/.test(String(u || ""));
  const fetch0 = window.fetch.bind(window);
  window.fetch = (...a) => { const p = fetch0(...a); return active() && !quiet(a[0]?.url || a[0]) ? track(p) : p; };
  // A response's body can take longer than its headers (a large file): reading it counts too.
  for (const m of ["json", "text", "blob", "arrayBuffer", "formData"]) {
    const read = Response.prototype[m];
    if (read) Response.prototype[m] = function () { const p = read.call(this); return active() && !quiet(this.url) ? track(p) : p; };
  }
  // Other slow work an action waits for, counted like a fetch (loading a library, building a file): window.genbidBusy(promise) returns the promise.
  window.genbidBusy = (p) => (active() ? track(p) : p);
})();
