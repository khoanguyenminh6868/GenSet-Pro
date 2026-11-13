// Hai hàm nhỏ để đường dẫn / URL từ bên ngoài không thoát được khỏi chuỗi lệnh PowerShell (ocr-specs.mjs).
import path from "node:path";

// Phần mở rộng tệp của một URL ảnh: chỉ chữ và số, tối đa 5 ký tự; không thì ".png".
// `path.extname("/a.foo';calc;'png")` trả về ".foo';calc;'png" (URL không mã hoá dấu nháy đơn), nên không dùng thẳng.
export function imageExt(url) {
  let ext = "";
  try { ext = path.extname(new URL(url).pathname).toLowerCase(); } catch { /* URL hỏng: dùng .png */ }
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : ".png";
}

// Trong chuỗi nháy đơn của PowerShell, ngoài ' còn có ‘ ’ ‚ ‛ cũng là dấu nháy: nhân đôi cả bốn.
export const psQuote = (s) => String(s).replace(/['‘’‚‛]/g, (m) => m + m);
