// Khác biệt giữa máy Windows của Khoa và sandbox Linux (Vercel Sandbox), gom một chỗ cho genbid-sync.js và ocr-pdf.js.
// Trên Windows mọi giá trị giữ đúng như trước; thêm việc gì cho Linux thì sửa ở đây, không rải `process.platform` khắp code.
// Thư mục gốc dữ liệu (ROOT) trên Linux: biến GENBID_ROOT, mặc định ~/genset-pro. Cấu trúc bên trong giống C:\Projects\GenSet Pro.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");

// GENBID_OS (windows | linux) ép hệ điều hành, để test chạy được logic Windows trên Linux (TestHelpers.ps1 đặt windows).
const IS_WIN = process.env.GENBID_OS ? process.env.GENBID_OS === "windows" : process.platform === "win32";
const HOME = os.homedir();
const ROOT = process.env.GENBID_ROOT || (IS_WIN ? "C:\\Projects\\GenSet Pro" : path.join(HOME, "genset-pro"));

// Đường dẫn của một lệnh trên PATH (null nếu không có).
function which(name) {
  const r = cp.spawnSync(IS_WIN ? "where" : "which", [name], { encoding: "utf8", windowsHide: true });
  return r.status === 0 ? (r.stdout || "").split(/\r?\n/)[0].trim() || null : null;
}

// PowerShell cho các script .ps1 của bộ công cụ: powershell.exe (5.1) trên Windows, pwsh (7+) trên Linux.
// -ExecutionPolicy chỉ có trên Windows.
const PWSH = IS_WIN ? "powershell" : "pwsh";
const psArgv = (line) => (IS_WIN ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", line] : ["-NoProfile", "-Command", line]);

// Poppler. Windows: bản winget hoặc của Git; Linux: pdftotext trên PATH.
const pdftotext = () => (IS_WIN
  ? [path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Links", "pdftotext.exe"), "C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe"].find((f) => fs.existsSync(f)) || "pdftotext"
  : "pdftotext");

// Giải nén: bsdtar (libarchive) đọc được .zip; tar của GNU thì không. Windows có sẵn System32\tar.exe là bsdtar.
const TAR = IS_WIN
  ? [path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe")].find((f) => fs.existsSync(f)) || "tar"
  : which("bsdtar") || "tar";
// UnRAR cho .rar (tar bỏ qua mục RAR5 có tên tiếng Việt). null nếu máy không có.
const UNRAR = IS_WIN
  ? [path.join(process.env.ProgramFiles || "C:\\Program Files", "WinRAR", "UnRAR.exe")].find((f) => fs.existsSync(f)) || null
  : which("unrar");

// Tesseract bản gốc (nhanh hơn tesseract.js). null nếu không có: ocr-pdf.js quay về tesseract.js.
const tesseractExe = () => (IS_WIN
  ? ["C:\\Program Files\\Tesseract-OCR\\tesseract.exe", path.join(process.env.LOCALAPPDATA || "", "Programs", "Tesseract-OCR", "tesseract.exe")].find((p) => fs.existsSync(p)) || null
  : which("tesseract"));

// Chrome cho Playwright: GENBID_CHROME, hoặc Chromium của Playwright / Chrome cài sẵn.
function chromePath() {
  if (process.env.GENBID_CHROME) return process.env.GENBID_CHROME;
  if (!IS_WIN) return ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find((f) => fs.existsSync(f)) || null;
  // Install-GenBidBot.ps1 đặt Chromium ở PLAYWRIGHT_BROWSERS_PATH (ngoài AppData: ở vài máy chrome.exe trong AppData báo
  // "side-by-side configuration is incorrect"); bản cũ vẫn ở LOCALAPPDATA.
  for (const base of [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(process.env.LOCALAPPDATA || "", "ms-playwright")]) {
    if (!base || !fs.existsSync(base)) continue;
    const dirs = fs.readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => b.split("-")[1] - a.split("-")[1]);
    for (const d of dirs) { const f = path.join(base, d, "chrome-win", "chrome.exe"); if (fs.existsSync(f)) return f; }
  }
  return null;
}
// Linux chạy Chrome trong container/VM không có user namespace: cần --no-sandbox. Cửa sổ thật chạy trên màn hình ảo (Xvfb, DISPLAY).
const chromeArgs = () => (IS_WIN ? [] : ["--no-sandbox", "--disable-dev-shm-usage"]);

// Claude Code CLI. Windows: bản đi kèm app Claude (thư mục đổi theo phiên bản); Linux: `claude` trên PATH.
function claudeExe() {
  if (process.env.GENBID_CLAUDE && fs.existsSync(process.env.GENBID_CLAUDE)) return process.env.GENBID_CLAUDE;
  if (!IS_WIN) return which("claude") || "claude";
  const base = path.join(process.env.LOCALAPPDATA || "", "Claude-Data");
  const found = [];
  const walk = (d, depth) => { if (depth > 5) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f, depth + 1); else if (e.name === "claude.exe" && /[\\/]claude-code[\\/]/.test(f)) found.push(f); } };
  if (fs.existsSync(base)) walk(base, 0);
  return found.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0] || "claude";
}

// Antigravity CLI (Gemini, tuỳ chọn): máy Windows của Khoa, và sandbox Linux (~/.local/bin/agy, Khoa đăng nhập Google một lần
// trong sandbox, giữ qua snapshot; 17/11/2026). Không có / chưa đăng nhập: bản dịch quay về Claude.
const agyExe = () => {
  if (process.env.GENBID_AGY) return process.env.GENBID_AGY;
  return IS_WIN ? path.join(process.env.LOCALAPPDATA || "", "agy", "bin", "agy.exe") : path.join(HOME, ".local", "bin", "agy");
};

// VNeGP Client Agent bị treo (hay gặp): tắt hẳn để GenBid-HSMT.ps1 -StartOnly bật lại. Trên Linux Agent là bản Windows chạy dưới Wine.
function killAgent() {
  if (IS_WIN) { cp.spawnSync("taskkill", ["/F", "/IM", "egp-edoc-agent.exe"], { windowsHide: true }); return; }
  cp.spawnSync("pkill", ["-f", "egp-edoc-agent"]);
  cp.spawnSync("pkill", ["-f", "com.fis.egp.ServiceApp"]); // start-egp-agent.sh chạy thẳng Java của Agent (23/11/2026)
  cp.spawnSync("pkill", ["-f", "EGP-AGENT.*javaw"]);
  cp.spawnSync("wineserver", ["-k"]);
}

// .doc / .rtf thành chữ UTF-8. Windows: Word COM (PowerShell). Linux: antiword / catdoc / LibreOffice, cái nào có.
// Trả "" khi không đọc được (người gọi coi như tệp không có chữ).
function wordTextLinux(src, tmp) {
  const run = (cmd, args) => cp.spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 256 << 20, timeout: 180e3 });
  const isRtf = /\.rtf$/i.test(src);
  if (!isRtf && which("antiword")) { const r = run("antiword", ["-m", "UTF-8.txt", src]); if (r.status === 0 && r.stdout.trim()) return r.stdout; }
  if (!isRtf && which("catdoc")) { const r = run("catdoc", ["-d", "utf-8", src]); if (r.status === 0 && r.stdout.trim()) return r.stdout; }
  const so = which("soffice") || which("libreoffice");
  if (so) {
    run(so, ["--headless", "--convert-to", "txt:Text (encoded):UTF8", "--outdir", tmp, src]);
    const out = path.join(tmp, path.basename(src).replace(/\.[^.]+$/, "") + ".txt");
    if (fs.existsSync(out)) return fs.readFileSync(out, "utf8");
  }
  return "";
}

module.exports = { IS_WIN, HOME, ROOT, which, PWSH, psArgv, pdftotext, TAR, UNRAR, tesseractExe, chromePath, chromeArgs, claudeExe, agyExe, killAgent, wordTextLinux };
