// Text of a PDF or picture with OCR for scanned pages (Khoa, 2026-11-02): pdftotext page by page, and every page with
// almost no text (a scan) read again with Tesseract (tesseract.js, Vietnamese + English) from a 250 dpi greyscale image
// (Poppler's pdftoppm). Pictures (.jpg, .png, .tif) are read with Tesseract directly.
//   node ocr-pdf.js <file> [--max <pages>] [--find <pages>]   prints the text (pages separated by a form feed) and, on stderr, "OCR <n>/<pages>"
// The Vietnamese language data is downloaded once into C:\Projects\GenSet Pro\.genbid-ocr.
// Native Tesseract first (Khoa, 2026-11-03): Tesseract 5.4 (UB-Mannheim, winget) with tessdata_best vie+eng in
// C:\Projects\GenSet Pro\.genbid-tessdata-best, --psm 4: 8 s a page against 14 s for tesseract.js on this PC, same
// accents, lines in order. tesseract.js stays as the fallback when it is missing or fails.
"use strict";
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const os = require("os");

const MIN_CHARS = 60; // a page with fewer letters than this is taken for a scan
const CACHE = "C:\\Projects\\GenSet Pro\\.genbid-ocr";
const TESSDATA = "C:\\Projects\\GenSet Pro\\.genbid-tessdata-best";
const NATIVE = ["C:\\Program Files\\Tesseract-OCR\\tesseract.exe", path.join(process.env.LOCALAPPDATA || "", "Programs", "Tesseract-OCR", "tesseract.exe")]
  .find((f) => fs.existsSync(f) && fs.existsSync(path.join(TESSDATA, "vie.traineddata")));
const popplerBin = () => {
  const links = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Links");
  if (fs.existsSync(path.join(links, "pdftoppm.exe"))) return links;
  const pk = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages");
  for (const d of fs.existsSync(pk) ? fs.readdirSync(pk).filter((x) => /poppler/i.test(x)) : []) {
    for (const v of fs.readdirSync(path.join(pk, d))) { const b = path.join(pk, d, v, "Library", "bin"); if (fs.existsSync(path.join(b, "pdftoppm.exe"))) return b; }
  }
  return "";
};

// A text layer that is not readable Vietnamese (Khoa, 2026-11-04: 17 of 969 PDFs): a broken font ("3456ÿ89ÿ ÿ",
// IB2500127205), an old TCVN3/VNI font ("Yªu cÇu kü thuËt") or mangled letters ("Phân 2. YEU CAU YE 1(2 THUJT",
// IB2500302333). Such a page has almost none of the common Vietnamese words, with or without their marks; it is read
// with OCR like a scan. Vietnamese text is ASCII plus combining marks (after NFD), đ, Cyrillic (the Vietnamese-Russian
// HSMT of Vietsovpetro, IB2600015031) and some punctuation: a page with
// more than 5% of other characters (ÿ, ª, Ç, ü, Ë, ...) is taken for a broken font. (A word list flagged a good page of
// a table of upper-case items, IB2600011106.)
const ODD = /[^\x20-\x7E\s̀-ͯđĐЀ-ӿ‐-‧‰-›°±×÷·€§©®™√≤≥≈∑∆Ωµ←→↑↓•▪●■□◦○◆✓✔]/gu;
function garbled(t) {
  const s = t.replace(/\s/g, "").normalize("NFD");
  return s.length >= 300 && (s.match(ODD) || []).length / s.length > 0.05;
}
// A page scanned sideways or upside down (2026-11-10, specs still open in session-log: IB2300094137, IB2300018261, IB2200069185, IB2500049415, tables
// printed landscape and scanned in portrait) comes out of OCR as short scraps ("œ | |g", "2 3 Š |2"). Such a page is
// rendered again as a greyscale PGM, its orientation read with Tesseract OSD (--psm 0, osd.traineddata of the install),
// rotated and read again; the better of the two readings is kept.
const OSD_DIR = NATIVE && [path.join(path.dirname(NATIVE), "tessdata"), TESSDATA].find((d) => fs.existsSync(path.join(d, "osd.traineddata")));
// Share of the characters that sit in words of 3+ letters: a readable page has most, a sideways one very few.
function legible(t) {
  const s = t.replace(/\s/g, "");
  if (!s.length) return 0;
  return (t.match(/\p{L}{3,}/gu) || []).join("").length / s.length;
}
const BAD_PAGE = 0.5;
// Binary PGM (P5, 8 bit) turned clockwise by deg (90, 180, 270).
function rotatePgm(file, out, deg) {
  const b = fs.readFileSync(file);
  let p = 0; const tok = () => { while (b[p] <= 32 || b[p] === 35) { if (b[p] === 35) while (b[p] !== 10) p++; p++; } let s = p; while (b[p] > 32) p++; return b.toString("latin1", s, p); };
  if (tok() !== "P5") throw new Error("not a P5 PGM");
  const w = +tok(), h = +tok(); tok(); p++;
  const src = b.subarray(p, p + w * h), dst = Buffer.alloc(w * h);
  const [nw, nh] = deg === 180 ? [w, h] : [h, w];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const nx = deg === 90 ? h - 1 - y : deg === 270 ? y : w - 1 - x, ny = deg === 90 ? x : deg === 270 ? w - 1 - x : h - 1 - y;
    dst[ny * nw + nx] = src[y * w + x];
  }
  fs.writeFileSync(out, Buffer.concat([Buffer.from(`P5\n${nw} ${nh}\n255\n`, "latin1"), dst]));
}
// find: with more scanned pages than this, only chapter V is read (0: every scanned page).
// opts (only the BCĐG flow, bcdg-step.js; every other caller passes none and gets the old behaviour):
//   locate: more than 3 scanned pages → every scanned page is read quickly (150 dpi, ~2 s) and only the pages that name our company
//           (bcdg-reason.js mentionsUs) ±1 are read in full; none found → those pages stay empty.
//   cache:  directory with one file per page (f<n>.txt quick, p<n>.txt full) so a later run goes on where this one stopped.
//   deadline: epoch ms; when reached the pages read so far are returned with partial = true.
async function ocrFile(file, max = 300, find = 0, opts = {}) {
  const bin = popplerBin(), exe = (n) => (bin ? path.join(bin, n + ".exe") : n);
  const ext = path.extname(file).toLowerCase();
  const { createWorker } = require(path.join(__dirname, "node_modules", "tesseract.js"));
  let worker = null;
  const ocrJs = async (img) => { worker ||= await createWorker("vie+eng", 1, { cachePath: CACHE }); return (await worker.recognize(img)).data.text; };
  const ocr = async (img) => {
    if (NATIVE) {
      // Two OCR runs share the 4 cores: two threads each.
      const r = cp.spawnSync(NATIVE, [img, "stdout", "-l", "vie+eng", "--oem", "1", "--psm", "4", "--tessdata-dir", TESSDATA],
        { encoding: "utf8", maxBuffer: 64 << 20, timeout: 300e3, env: { ...process.env, OMP_THREAD_LIMIT: "2" }, windowsHide: true });
      if (r.status === 0 && (r.stdout || "").trim()) return r.stdout;
    }
    return ocrJs(img);
  };
  try {
    if ([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".bmp"].includes(ext)) {
      // A copy under a plain name, for a path with Vietnamese letters.
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "genbid-ocr-")), plain = path.join(tmp, "in" + ext);
      fs.copyFileSync(file, plain);
      try { return { text: await ocr(plain), ocr: 1, pages: 1 }; } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
    }
    const pages = (cp.spawnSync(exe("pdftotext"), ["-layout", "-enc", "UTF-8", file, "-"], { encoding: "utf8", maxBuffer: 256 << 20 }).stdout || "").split("\f");
    if (pages.length && !pages[pages.length - 1].trim()) pages.pop();
    let scanned = pages.map((t, i) => (t.replace(/\s/g, "").length < MIN_CHARS || garbled(t) ? i + 1 : 0)).filter(Boolean);
    let partial = false;
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "genbid-ocr-"));
    try {
      // Windows tools cannot always open a path with Vietnamese letters: work on a copy under a plain name.
      const plain = path.join(tmp, "in.pdf");
      fs.copyFileSync(file, plain);
      // A whole scanned HSMT with more scanned pages than max (Khoa, 2026-11-04, IB2300030459): the top of each page is
      // read at 150 dpi (about 2 s a page) to find where chapter V (or the "Yêu cầu kỹ thuật" chapter of an HSYC) starts
      // and where chapter VI / Phần 3 begins, and only those pages are read in full. IB2400056128: Chương V on pages 85–96
      // of 114, which the first 40 pages missed. The chapter is read whole, however long (Khoa, 2026-11-04: no 40-page
      // limit); not found: every scanned page (up to max).
      if (find && scanned.length > find) {
        const plainVi = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").toLowerCase().replace(/\s+/g, " ");
        const START = /chuong\s*v(?![ivx])|chuong\s*[ivx]+\W{0,3}\s*(yeu cau (ve )?(ky thuat|pham vi)|pham vi cung cap)|phan\s*(2|thu hai)\W{0,3}\s*yeu cau/;
        const END = /chuong\s*(vi|vii|viii)(?![ivx])|phan\s*(3|thu ba)\b|bieu mau hop dong/;
        const head = (n) => {
          cp.spawnSync(exe("pdftoppm"), ["-r", "150", "-gray", "-png", "-f", String(n), "-l", String(n), "-x", "0", "-y", "0", "-W", "1400", "-H", "560", plain, path.join(tmp, "h")], { timeout: 60e3 });
          const img = fs.readdirSync(tmp).find((x) => x.startsWith("h") && x.endsWith(".png"));
          if (!img) return "";
          const r = NATIVE ? cp.spawnSync(NATIVE, [path.join(tmp, img), "stdout", "-l", "vie", "--oem", "1", "--psm", "4", "--tessdata-dir", TESSDATA],
            { encoding: "utf8", timeout: 60e3, env: { ...process.env, OMP_THREAD_LIMIT: "2" }, windowsHide: true }).stdout || "" : "";
          fs.rmSync(path.join(tmp, img));
          return plainVi(r).slice(0, 300);
        };
        let from = 0, to = 0;
        if (NATIVE) for (const n of scanned) {
          const h = head(n);
          // The table of contents and the summary page name every chapter.
          if (/muc luc/.test(h) || (h.match(/chuong/g) || []).length >= 3) continue;
          // A heading starts the page; "... mô tả trong Phần 2 - Yêu cầu về phạm vi cung cấp" in Chương I does not (page 5
          // of IB2400056128).
          const at = (re) => { const m = re.exec(h); return m && m.index < 80; };
          if (!from) { if (at(START)) from = n; continue; }
          if (at(END)) { to = n - 1; break; }
        }
        if (from) { to ||= pages.length; scanned = scanned.filter((n) => n >= from && n <= to); process.stderr.write(`CHUONG5 ${from}-${to}\n`); }
      }
      scanned = scanned.slice(0, find || !opts.locate ? max : scanned.length);
      process.stderr.write(`SCAN ${scanned.length}/${pages.length}\n`); // early: a killed run still tells it is a scan
      const cacheF = (pre, n) => (opts.cache ? path.join(opts.cache, `${pre}${n}.txt`) : "");
      const cached = (pre, n) => { const f = cacheF(pre, n); return f && fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null; };
      const store = (pre, n, t) => { const f = cacheF(pre, n); if (f) { fs.mkdirSync(opts.cache, { recursive: true }); fs.writeFileSync(f, t, "utf8"); } };
      const late = () => opts.deadline && Date.now() > opts.deadline;
      if (opts.locate && NATIVE && scanned.length > 3) {
        const { mentionsUs, pagesToRead } = require("./bcdg-reason.js");
        const hits = [], qs = {};
        for (const n of scanned) {
          let q = cached("f", n);
          if (q === null) {
            if (late()) { partial = true; break; }
            // Pages are rendered 6 at a time: a big scan costs seconds to open for every pdftoppm call.
            const imgOf = () => fs.readdirSync(tmp).find((x) => new RegExp(`^q-0*${n}\\.png$`).test(x));
            if (!imgOf()) cp.spawnSync(exe("pdftoppm"), ["-r", "150", "-gray", "-png", "-f", String(n), "-l", String(Math.min(n + 5, pages.length)), plain, path.join(tmp, "q")], { timeout: 180e3 });
            const img = imgOf();
            if (!img) continue;
            q = cp.spawnSync(NATIVE, [path.join(tmp, img), "stdout", "-l", "vie", "--oem", "1", "--psm", "4", "--tessdata-dir", TESSDATA],
              { encoding: "utf8", maxBuffer: 64 << 20, timeout: 60e3, env: { ...process.env, OMP_THREAD_LIMIT: "2" }, windowsHide: true }).stdout || "";
            fs.rmSync(path.join(tmp, img));
            store("f", n, q);
          }
          qs[n] = q;
          if (mentionsUs(q)) hits.push(n);
        }
        // Pages with our name ±1, plus the following pages of a multi-page "Thuyết minh ... không đáp ứng" block of ours.
        const want = pagesToRead(hits, (n) => qs[n] || pages[n - 1] || "", pages.length);
        process.stderr.write(`LOCATE ${hits.join(",") || "-"}${partial ? " (chưa xong)" : ""}\n`);
        scanned = scanned.filter((n) => want.has(n)).slice(0, max);
        for (const n of scanned) pages[n - 1] = "";
      }
      let osdTries = 0, osdRotated = 0;
      for (const n of scanned) {
        const c = cached("p", n);
        if (c !== null) { pages[n - 1] = c; continue; }
        if (late()) { partial = true; break; }
        cp.spawnSync(exe("pdftoppm"), ["-r", "250", "-gray", "-png", "-f", String(n), "-l", String(n), plain, path.join(tmp, "p")], { timeout: 120e3 });
        const img = fs.readdirSync(tmp).find((x) => x.startsWith("p") && x.endsWith(".png"));
        if (!img) continue;
        let text = await ocr(path.join(tmp, img));
        fs.rmSync(path.join(tmp, img));
        // At most 60 tries per file, and none after 8 tries that found no rotation (an upright table of figures also reads
        // as "not legible": it must not cost a second render and an OSD run on every page).
        if (OSD_DIR && osdTries < 60 && !(osdTries >= 8 && !osdRotated) && text.replace(/\s/g, "").length > 20 && legible(text) < BAD_PAGE) {
          osdTries++;
          try {
            cp.spawnSync(exe("pdftoppm"), ["-r", "250", "-gray", "-f", String(n), "-l", String(n), plain, path.join(tmp, "o")], { timeout: 120e3 });
            const pgm = fs.readdirSync(tmp).find((x) => x.startsWith("o") && x.endsWith(".pgm"));
            if (pgm) {
              const src = path.join(tmp, pgm);
              const osd = cp.spawnSync(NATIVE, [src, "stdout", "--psm", "0", "--tessdata-dir", OSD_DIR], { encoding: "utf8", timeout: 60e3, windowsHide: true }).stdout || "";
              const deg = Number((osd.match(/Rotate:\s*(\d+)/) || [])[1] || 0);
              if (deg) {
                const rot = path.join(tmp, "r.pgm");
                rotatePgm(src, rot, deg);
                const t2 = await ocr(rot);
                fs.rmSync(rot, { force: true });
                if (legible(t2) > legible(text)) { text = t2; osdRotated++; process.stderr.write(`ROTATE ${n} ${deg}\n`); }
              }
              fs.rmSync(src, { force: true });
            }
          } catch (e) { process.stderr.write(`ROTATE lỗi trang ${n}: ${e.message}\n`); }
        }
        pages[n - 1] = text;
        store("p", n, text);
      }
      if (osdTries) process.stderr.write(`OSD ${osdTries} rotated ${osdRotated}\n`);
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
    return { text: pages.join("\f"), ocr: scanned.length, pages: pages.length, partial };
  } finally { await worker?.terminate(); }
}
module.exports = { ocrFile };

if (require.main === module) {
  const args = process.argv.slice(2), val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  const opts = args.includes("--locate") ? { locate: true, cache: val("--cache"), deadline: val("--deadline") ? Number(val("--deadline")) : 0 } : {};
  ocrFile(args[0], val("--max") ? Number(val("--max")) : 300, val("--find") ? Number(val("--find")) : 0, opts).then((r) => {
    process.stdout.write(r.text);
    if (r.partial) process.stderr.write("PARTIAL\n");
    process.stderr.write(`OCR ${r.ocr}/${r.pages}\n`);
  }, (e) => { process.stderr.write(String(e?.message || e) + "\n"); process.exit(1); });
}
