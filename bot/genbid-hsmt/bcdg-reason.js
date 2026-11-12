// Trích đoạn lý do bị loại của công ty mình từ chữ của Báo cáo đánh giá E-HSDT (BCĐG). Không dùng AI, không suy ra gì:
// chỉ lấy nguyên văn các dòng ngay sau chỗ báo cáo nhắc ĐÚNG công ty (tên đầy đủ "Thiết bị Kỹ thuật Thảo Nguyên", "Công ty/
// Nhà thầu ... Thảo Nguyên", hoặc MST 4101623015), khi đoạn đó có cụm "không đáp ứng", "không đạt", "thiếu", "chưa có",
// "bị loại"... Không chắc thì trả "" (tên người "Nguyễn Thị Thảo Nguyên", cột bảng "Thảo Nguyên", gói trúng).
//   node bcdg-reason.js <tệp .txt> [MST]   in thử kết quả.
"use strict";
const OUR_TAX = "4101623015";
// Tên đầy đủ (chịu được chữ OCR lệch dấu).
const FULL = /thi.{0,3}t\s*b.{0,3}\s*k.{0,3}\s*thu.{0,3}t\s*th.{0,3}o\s*nguy.{0,3}n/i;
// "Công ty/Cty/TNHH/Nhà thầu ... Thảo Nguyên" trong cùng một câu: không có dấu câu ngắt giữa.
const SHORT = /(?:c[ôo]ng\s*ty|cty|tnhh|nh[àa]\s*th[ầa]u)[^.:;\n]{0,50}th.{0,3}o\s*nguy.{0,3}n/i;
const NAME_TAIL = /th.{0,3}o\s*nguy.{0,3}n/i;
// Cụm báo hiệu lý do loại.
const NEG = /không\s+(đáp\s*ứng|đạt|hợp\s*lệ|phù\s*hợp|đủ)|chưa\s+(có|đáp\s*ứng|đủ|hợp\s*lệ|được)|thiếu|bị\s+loại|không\s+có\s+(tài\s*liệu|giấy|xác\s*nhận|ủy\s*quyền)|vi\s*phạm|sai\s+khác/i;
// Dòng mở phần của nhà thầu khác (hoặc mục mới): đoạn của mình dừng ở đó.
const NAME_WORD = "(?:nhà\\s*thầu|công\\s*ty|cty|liên\\s*danh|tnhh|ctcp|doanh\\s*nghiệp|hợp\\s*tác\\s*xã|tổng\\s*công\\s*ty|chi\\s*nhánh)";
const OTHER = new RegExp("^(?:[a-zđ]\\d{0,2}[.)]\\s*|[-•+*]\\s*|\\d+(?:\\.\\d+)*[.)]?\\s*)?" + NAME_WORD + "\\s+(?!không\\b|chưa\\b|đã\\b|có\\b|đề\\s*xuất|chào|này|phải|cần|bị\\b|đáp|kê\\b|nêu|cung\\s*cấp|trên|theo)", "i");
const SECTION = /^(?:\d+\.\s+[A-ZĐÀ-Ỹ]|[IVX]+\.\s+[A-ZĐÀ-Ỹ]|(?:phần|chương|mục)\s+[ivx\d]+\b|bảng\s+(?:số\s+)?\d+\b|[a-d][.)]\s+[A-ZĐÀ-Ỹ])/i;
// Dòng bảng xếp hạng của mình: "2 Công ty ... Thảo Nguyên Đạt" (không có "không/chưa" trước "đạt/hợp lệ").
const PASS = /\s(?:đạt|hợp\s*lệ)\.?$/i, FAIL_END = /(?:không|chưa)\s+(?:đạt|hợp\s*lệ)\.?$/i;
// Dòng tiêu đề bảng ("Đạt Không đạt") và câu "...: Không có." không phải lý do.
const neg = (s) => NEG.test(s.replace(/đạt\s+không\s+đạt/gi, "").replace(/:?\s*không\s+có\.?$/i, ""));
const MAX_BLOCKS = 4, MAX_LINES = 10, MAX_CHARS = 1500;

function lines(text) {
  return String(text || "").normalize("NFC").split(/\r?\n|\f/).map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}
// MST ghi liền hoặc cách nhóm số ("4101 623 015", "4101.623.015"), không dính số khác hai đầu.
const taxRe = (tax) => new RegExp("(?<!\\d)" + String(tax).split("").join("[\\s.]?") + "(?!\\d)");

function bcdgReason(text, { tax = OUR_TAX } = {}) {
  const L = lines(text), tre = tax ? taxRe(tax) : null;
  // Chỉ số dòng bắt đầu đoạn của mình nếu dòng i nhắc đúng công ty, không thì -1. Tên bị ngắt dòng
  // ("... Thiết bị Kỹ thuật" / "Thảo Nguyên") thì đoạn bắt đầu ở dòng trước.
  const startOf = (i) => {
    if (FULL.test(L[i]) || SHORT.test(L[i]) || (tre && tre.test(L[i]))) return i;
    if (i > 0 && NAME_TAIL.test(L[i]) && (FULL.test(L[i - 1] + " " + L[i]) || SHORT.test(L[i - 1] + " " + L[i]))) return i - 1;
    return -1;
  };
  const blocks = [];
  for (let i = 0; i < L.length; i++) {
    const s = startOf(i);
    if (s < 0) continue;
    if (PASS.test(L[i]) && !FAIL_END.test(L[i])) continue;
    // Dòng bảng xếp hạng ("5. Công ty ... Thảo Nguyên Không đạt"): chỉ lấy dòng đó, không kéo theo các dòng hàng dưới.
    const row = FAIL_END.test(L[i]) && /^[\s|(\[]*\d{1,3}[.)]?\s*[|(\[]?\s*(?:công|cong|cty|tnhh)/i.test(L[s]) && !/:\s*(?:không|chưa)/i.test(L[i]);
    let j = i + 1;
    for (; !row && j < L.length && j <= i + MAX_LINES; j++) {
      if (SECTION.test(L[j]) || (OTHER.test(L[j]) && startOf(j) < 0)) break;
    }
    const block = L.slice(s, j), score = block.filter(neg).length;
    if (score) blocks.push({ i: s, end: j, score, text: block.join("\n") });
  }
  // Đoạn chồng nhau: giữ đoạn nhiều cụm lý do hơn.
  const kept = [];
  for (const b of blocks.sort((a, c) => c.score - a.score || a.i - c.i)) if (!kept.some((k) => b.i < k.end && k.i < b.end)) kept.push(b);
  let out = "";
  for (const b of kept.slice(0, MAX_BLOCKS).sort((a, c) => a.i - c.i)) {
    const next = (out ? out + "\n…\n" : "") + b.text;
    if (next.length > MAX_CHARS) { out = out || b.text.slice(0, MAX_CHARS); break; }
    out = next;
  }
  return out;
}
module.exports = { bcdgReason, OUR_TAX };

if (require.main === module) {
  const fs = require("fs");
  console.log(bcdgReason(fs.readFileSync(process.argv[2], "utf8"), process.argv[3] ? { tax: process.argv[3] } : {}) || "(không trích được)");
}
