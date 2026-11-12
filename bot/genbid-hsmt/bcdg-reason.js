// Trích đoạn lý do bị loại của một nhà thầu từ chữ của Báo cáo đánh giá E-HSDT (BCĐG). Không dùng AI, không suy ra gì:
// chỉ lấy nguyên văn các dòng ngay sau chỗ báo cáo nhắc tên (hoặc MST) nhà thầu, khi đoạn đó có cụm "không đáp ứng",
// "không đạt", "thiếu", "chưa có", "bị loại"... Không có đoạn nào như vậy thì trả "" (gói trúng, hoặc báo cáo chỉ có bảng).
//   node bcdg-reason.js <tệp .txt> [MST]   in thử kết quả.
"use strict";
const OUR_NAME = /th.{0,3}o\s*nguy.{0,3}n/i;
const OUR_TAX = "4101623015";
// Cụm báo hiệu lý do loại. "đạt" đứng một mình (bảng kết quả) không tính.
const NEG = /không\s+(đáp\s*ứng|đạt|hợp\s*lệ|phù\s*hợp|đủ)|chưa\s+(có|đáp\s*ứng|đủ|hợp\s*lệ|được)|thiếu|bị\s+loại|không\s+có\s+(tài\s*liệu|giấy|xác\s*nhận|ủy\s*quyền)|vi\s*phạm|sai\s+khác/i;
// Dòng mở phần của nhà thầu khác (hoặc mục mới) thì đoạn của mình dừng ở đó.
const OTHER = /^(?:[a-zđ]\d{0,2}[.)]\s*|[-•]\s*|\d+(?:\.\d+)*[.)]?\s*)?(?:công\s*ty|cty|liên\s*danh|doanh\s*nghiệp|hợp\s*tác\s*xã|tổng\s*công\s*ty|chi\s*nhánh|nhà\s*thầu\s+[^\s:]{1,20}\s*:)/i;
const SECTION = /^(?:\d+\.\s+[A-ZĐÀ-Ỹ]|[IVX]+\.\s+[A-ZĐÀ-Ỹ]|(?:phần|chương|mục)\s+[ivx\d]+\b|bảng\s+(?:số\s+)?\d+\b|[a-d][.)]\s+[A-ZĐÀ-Ỹ])/i;
// Dòng tiêu đề bảng ("Đạt Không đạt") và câu "...: Không có." không phải lý do.
const neg = (s) => NEG.test(s.replace(/đạt\s+không\s+đạt/gi, "").replace(/:?\s*không\s+có\.?$/i, ""));
const PASS = /\s(?:đạt|hợp lệ)\.?$/i; // dòng bảng xếp hạng: "2 Công ty ... Đạt"
const MAX_BLOCKS = 4, MAX_LINES = 10, MAX_CHARS = 1500;

function lines(text) {
  return String(text || "").normalize("NFC").split(/\r?\n|\f/).map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}
function bcdgReason(text, { tax = OUR_TAX, name = OUR_NAME } = {}) {
  const L = lines(text), hit = (s) => name.test(s) || (tax && s.replace(/\D/g, "").includes(tax));
  const blocks = [];
  for (let i = 0; i < L.length; i++) {
    if (!hit(L[i]) || PASS.test(L[i])) continue;
    let j = i + 1;
    // Tên bị ngắt dòng ("CÔNG TY TNHH THIẾT BỊ KỸ THUẬT" / "THẢO NGUYÊN"): dòng đầu của đoạn là dòng chứa tên.
    for (; j < L.length && j <= i + MAX_LINES; j++) {
      if (SECTION.test(L[j]) || (OTHER.test(L[j]) && !hit(L[j]))) break;
    }
    const block = L.slice(i, j);
    // Dòng bảng xếp hạng chỉ có "Đạt": không có cụm lý do thì bỏ.
    const score = block.filter(neg).length;
    if (score) blocks.push({ i, end: j, score, text: block.join("\n") });
  }
  // Đoạn chồng nhau (nhiều lần nhắc liên tiếp): giữ đoạn dài hơn.
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
module.exports = { bcdgReason };

if (require.main === module) {
  const fs = require("fs");
  console.log(bcdgReason(fs.readFileSync(process.argv[2], "utf8"), process.argv[3] ? { tax: process.argv[3] } : {}) || "(không trích được)");
}
