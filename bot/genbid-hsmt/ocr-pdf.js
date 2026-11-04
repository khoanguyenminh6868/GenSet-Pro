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
// find: with more scanned pages than this, only chapter V is read (0: every scanned page).
async function ocrFile(file, max = 300, find = 0) {
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
      scanned = scanned.slice(0, max);
      for (const n of scanned) {
        cp.spawnSync(exe("pdftoppm"), ["-r", "250", "-gray", "-png", "-f", String(n), "-l", String(n), plain, path.join(tmp, "p")], { timeout: 120e3 });
        const img = fs.readdirSync(tmp).find((x) => x.startsWith("p") && x.endsWith(".png"));
        if (!img) continue;
        pages[n - 1] = await ocr(path.join(tmp, img));
        fs.rmSync(path.join(tmp, img));
      }
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
    return { text: pages.join("\f"), ocr: scanned.length, pages: pages.length };
  } finally { await worker?.terminate(); }
}
module.exports = { ocrFile };

if (require.main === module) {
  const args = process.argv.slice(2), i = args.indexOf("--max"), j = args.indexOf("--find");
  ocrFile(args[0], i >= 0 ? Number(args[i + 1]) : 300, j >= 0 ? Number(args[j + 1]) : 0).then((r) => {
    process.stdout.write(r.text);
    process.stderr.write(`OCR ${r.ocr}/${r.pages}\n`);
  }, (e) => { process.stderr.write(String(e?.message || e) + "\n"); process.exit(1); });
}
