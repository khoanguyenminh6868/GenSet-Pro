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
const NEG = /không\s+(đáp\s*ứng|đạt|hợp\s*lệ|phù\s*hợp|đủ)|chưa\s+(có|đáp\s*ứng|đủ|hợp\s*lệ|được)|thiếu|bị\s+loại|không\s+có\s+(tài\s*liệu|giấy|xác\s*nhận|ủy\s*quyền)|vi\s*phạm|sai\s+khác|không\s+đồng\s*(?:bộ|độ)/i;
// Dòng mở phần của nhà thầu khác (hoặc mục mới): đoạn của mình dừng ở đó.
const NAME_WORD = "(?:nhà\\s*thầu|công\\s*ty|cty|liên\\s*danh|tnhh|ctcp|doanh\\s*nghiệp|hợp\\s*tác\\s*xã|tổng\\s*công\\s*ty|chi\\s*nhánh)";
const OTHER = new RegExp("^(?:[a-zđ](?:\\.?\\d{1,2})?[.)]\\s*|[-•+*]\\s*|\\d+(?:\\.\\d+)*[.)]?\\s*)?" + NAME_WORD + "\\s+(?!không\\b|chưa\\b|đã\\b|có\\b|đề\\s*xuất|chào|này|phải|cần|bị\\b|đáp|kê\\b|nêu|cung\\s*cấp|trên|theo)", "i");
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

// Khối "Thuyết minh các trường hợp nhà thầu không đáp ứng / không đạt / không hợp lệ ..." (Khoa, 2026-11-12, IB2400120387: bảng tổng
// hợp chỉ có "Không đạt", nội dung thật nằm ở phần thuyết minh: "1) Công ty ...:" + bảng nhận xét của chuyên gia). Tiêu đề mục mang
// tên mình → lấy tới tiêu đề nhà thầu kế tiếp hoặc mục lớn kế tiếp. Trần 3.000 ký tự, cắt trọn dòng.
const EXPL_MAX = 3000;
const EXPL_HEAD = /^(?:[-•+*]\s*|\(?[a-z]\)\s*|[a-z]\d{0,2}[.)]\s*|\d{1,2}[.)]\s*)?thuy.{1,3}t\s*m.{1,2}nh\b/i;
const EXPL_FAIL = /kh[ôo]ng\s*(?:đ[áa]p\s*[ứu]ng|đ[ạa]t|h[ợo]p\s*l[ệe])|b[ịi]\s*lo[ạa]i/i;
const EMPTY_END = /:\s*kh[ôo]ng\s*c[óo]\s*\.?$/i;
const MARK ="(?:[-•+*]\\s*|\\(?[a-z](?:\\.?\\d{1,2})?[.)]\\s*|\\d{1,2}[.)]\\s*)";
// Tiêu đề nhà thầu: "1) Công ty ...:", "b.2) Công ty ...: <lý do>", "- Công ty ...:", "Nhà thầu: Công ty ...".
const BIDDER_HEAD = new RegExp("^(?:" + MARK + NAME_WORD + "|(?:công\\s*ty|cty|liên\\s*danh)\\b)[^:]{0,170}:|^nhà\\s*thầu\\s*:\\s*\\S", "i");
// Tiêu đề không dấu ":" ("4. CÔNG TY ...", "b.1. Công ty ..."): có số/chữ đánh mục, ngắn, không kết bằng dấu câu và không phải câu có lý do.
const BIDDER_HEAD2 = new RegExp("^" + MARK + NAME_WORD + "\\s+[^.;:]{0,120}$", "i");
const HEAD2_NOT = /không|chưa|thiếu|đã\s|đề\s*xuất|có\s/i;
// Mục lớn kế tiếp: "c) ...", "c. ...", "4. Kết quả...", "IV. ...", "Bảng số", "Phần/Chương".
const MAJOR = /^(?:\(?[c-z][.)]\s+(?!công\s*ty|nhà\s*thầu|liên\s*danh)\S|\d{1,2}\.\s+(?:kết\s*quả|đánh\s*giá|xếp\s*hạng|nhận\s*xét|bảng)|[IVX]{1,4}\.\s+\S|bảng\s+số\s+\d+\b|(?:[-•+*]\s*)?(?:hl\s+|[IVX]{1,4}\.?\s+)?k[ếe]t\s*lu[ậa]n\s*v[àa]\s*ki[ếe]n|(?:[-•+*]\s*)?t[ổo]\s*chuy[êe]n\s*gia\s*n[êe]u)/i;
// Dòng bảng "lý do không đạt": "1 Công ty ...", đánh số bằng chữ số không có dấu chấm (số kèm tên công ty) và dòng đầu mục bị OCR thêm
// 1–3 ký tự rác ("eo Công ty ..."): chỉ coi là tiêu đề mục của MÌNH khi nhắc đúng tên mình (Khoa, 2026-11-12: IB2400393199, IB2600374560).
const ROWHEAD = /^\d{1,2}\s*\|?\s*(?:công\s*ty|cty|liên\s*danh)\b/i;
const OCRHEAD = /^(?:\p{L}{1,2}|[^\p{L}\d\s\-•+*]{1,2})\s+(?:c[ôo]ng\s*ty|cty)\s/iu;

function explanationBlocks(L, startOf) {
  const blocks = [];
  let sec = false, cur = null;
  const close = () => { if (cur && cur.lines.length > 1) blocks.push(cur); cur = null; };
  for (let i = 0; i < L.length; i++) {
    const l = L[i];
    // Trong mục, dòng gạch đầu dòng "- / + Thuyết minh Biện pháp thi công..." là nội dung, không phải tiêu đề mục mới.
    const failHere = EXPL_FAIL.test(L.slice(i, i + 3).join(" ").slice(0, 320));
    const isHead = EXPL_HEAD.test(l) && !(sec && /^[-•+*]/.test(l) && !failHere);
    if (isHead && failHere) {
      close(); sec = true;
      // "Thuyết minh … không hợp lệ: Không có." (cả khi dòng tiêu đề bị ngắt xuống dòng kế): mục rỗng, các dòng sau không phải của mục này.
      if (EMPTY_END.test(l) || (i + 1 < L.length && EMPTY_END.test(l + " " + L[i + 1]))) { sec = false; continue; }
      // Tiêu đề mục tự nêu tên mình và chỉ mình ("... Có (Nhà thầu Công ty ... Thảo Nguyên không đạt ...)"): cả mục là của mình.
      const hl = [l]; for (let k = i + 1; k < Math.min(L.length, i + 3) && !EXPL_HEAD.test(L[k]) && !BIDDER_HEAD.test(L[k]) && !new RegExp("^(?:" + MARK + "|nhà\\s*thầu\\s*:\\s*)" + NAME_WORD, "i").test(L[k]); k++) hl.push(L[k]);
      const h = hl.join(" ");
      if ((FULL.test(h) || SHORT.test(h)) && (h.match(/c[ôo]ng\s*ty|cty|li[êe]n\s*danh/gi) || []).length <= 1) cur = { i, lines: [l], end: i + 1 };
      // "Thuyết minh ... không hợp lệ: Không có." → mục rỗng, tiếp tục (mục kế tiếp có thể có).
      continue;
    }
    if (isHead) { close(); sec = false; continue; }
    if (!sec) continue;
    // Tên nhà thầu dài bị ngắt dòng: ghép với dòng kế để thấy dấu ":".
    let head = BIDDER_HEAD.test(l) || (BIDDER_HEAD2.test(l) && !HEAD2_NOT.test(l) && /^(?:\(?[a-z](?:\.?\d{1,2})?[.)]|\d{1,2}[.)])\s/i.test(l)) ? l
      : (i + 1 < L.length && new RegExp("^" + MARK + "(?:công|cty|liên|nhà)", "i").test(l) && !/[.;]$/.test(l) && BIDDER_HEAD.test(l + " " + L[i + 1]) ? l + " " + L[i + 1] : "");
    if (head) {
      close();
      if (startOf(i) >= 0 || /4101623015/.test(head) || (head.indexOf(":") > 0 && startOf(i + 1) >= 0 && head.length > l.length)) cur = { i, lines: [l], end: i + 1 };
      continue;
    }
    // Hàng bảng "1 Công ty TNHH thiết bị | lý do ..." với phần tên kéo sang dòng sau ("kỹ thuật Thảo Nguyên | ...").
    if (ROWHEAD.test(l)) {
      close();
      if (startOf(i) >= 0 || (i + 1 < L.length && NAME_TAIL.test(L[i + 1]) && /thu.{0,2}t/i.test(L[i + 1]))) cur = { i, lines: [l], end: i + 1 };
      continue;
    }
    // Cũng đóng khối của mình ở đầu mục OCR hỏng của nhà thầu khác ("© Cong ty TNHH Hữu Toàn Group").
    if (OCRHEAD.test(l) && l.length < 140 && !HEAD2_NOT.test(l)) { close(); if (startOf(i) >= 0) cur = { i, lines: [l], end: i + 1 }; continue; }
    if (MAJOR.test(l)) { close(); sec = false; continue; }
    if (cur) { cur.lines.push(l); cur.end = i + 1; }
  }
  close();
  return blocks;
}
// Nối các khối, cắt trọn dòng ở trần EXPL_MAX.
function joinCapped(parts, max) {
  let out = "";
  for (const p of parts) {
    for (const ln of p) {
      const next = out ? out + "\n" + ln : ln;
      if (next.length > max) return out || ln.slice(0, max);
      out = next;
    }
    out += "\n…";
  }
  return out.replace(/\n…$/, "");
}

const bcdgReason = (text, o) => bcdgReasonEx(text, o).text;
// Lõi trích: { text, source, L, startOf }; source = "thuyet-minh" (khối thuyết minh), "doan" (dự phòng: dòng bảng / đoạn lẻ), "" (không có).
function reasonCore(text, { tax = OUR_TAX } = {}) {
  const L = lines(text), tre = tax ? taxRe(tax) : null;
  // Chỉ số dòng bắt đầu đoạn của mình nếu dòng i nhắc đúng công ty, không thì -1. Tên bị ngắt dòng
  // ("... Thiết bị Kỹ thuật" / "Thảo Nguyên") thì đoạn bắt đầu ở dòng trước.
  // Mình dự thầu trong liên danh (IB2600483082: MST chỉ ở bảng mở thầu, "vn4101623015 | Liên danh TN-HA"): tên liên danh trên dòng
  // có MST cũng là tên mình ở các dòng khác của báo cáo.
  const aliases = new Set();
  if (tre) for (const l of L) if (tre.test(l)) { const m = /li[êe]n\s*danh\s+[\p{L}\d]+(?:[-–][\p{L}\d]+)*/iu.exec(l.slice(l.search(tre))); if (m) aliases.add(m[0].toLowerCase().replace(/\s+/g, " ")); }
  const isAlias = (l) => aliases.size > 0 && [...aliases].some((a) => l.toLowerCase().replace(/\s+/g, " ").includes(a));
  const startOf = (i) => {
    if (FULL.test(L[i]) || SHORT.test(L[i]) || (tre && tre.test(L[i])) || isAlias(L[i])) return i;
    if (i > 0 && NAME_TAIL.test(L[i]) && (FULL.test(L[i - 1] + " " + L[i]) || SHORT.test(L[i - 1] + " " + L[i]))) return i - 1;
    return -1;
  };
  // Ưu tiên khối thuyết minh; dòng bảng "Không đạt" / đoạn lẻ phía dưới chỉ là dự phòng khi báo cáo không có khối này.
  const expl = explanationBlocks(L, startOf);
  if (expl.length) return { text: joinCapped(expl.map((b) => b.lines), EXPL_MAX), source: "thuyet-minh", L, startOf };
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
  for (const b of blocks.sort((a, c) => c.score - a.score || a.i - c.i)) if (!kept.some((k) => (b.i < k.end && k.i < b.end) || k.text.replace(/\W+/g, "").toLowerCase() === b.text.replace(/\W+/g, "").toLowerCase())) kept.push(b);
  let out = "";
  for (const b of kept.slice(0, MAX_BLOCKS).sort((a, c) => a.i - c.i)) {
    const next = (out ? out + "\n…\n" : "") + b.text;
    if (next.length > MAX_CHARS) { out = out || b.text.slice(0, MAX_CHARS); break; }
    out = next;
  }
  return { text: out, source: out ? "doan" : "", L, startOf };
}

// Kết luận của báo cáo về MÌNH (Khoa, 2026-11-12): "fail" = có đoạn không đạt / bị loại của mình, "pass" = mình đạt mọi bước (dòng bảng
// "… Thảo Nguyên Đạt Đạt Đạt" và không có chữ không đạt nào của mình), "" = không rõ. Gói đạt: text chỉ là phần "nội dung bổ sung, làm
// rõ E-HSDT" (nếu có nội dung thật), không lấy dòng bảng.
const TOK = "(?:đạt|đat|dat|pat|không\\s*đạt|khong\\s*dat|không\\s*dat)";
const TOKS2 = new RegExp(TOK + "(?:[\\s|xX]*" + TOK + ")+", "gi"); // dãy từ 2 ô kết quả trở lên ("Đạt Không đạt Đạt"): tiêu đề / dòng bảng, không phải lý do
const TOKONLY = new RegExp("^[\\s|xX.\\-–]*(?:" + TOK + "[\\s|xX.]*)+$", "i");
const NOTPASS = /kh[ôo]ng\s*[đd][ạa]t/i;
const EXPL_EMPTY = /:\s*kh[ôo]ng\s*c[óo](?![a-zà-ỹ])/i; // không dùng \b: nó không tính "ó" là chữ
const CLAR_HEAD = /n[ộo]i\s*dung\s*b.{0,2}\s*sung.{0,12}l[àa]m\s*r[õo]/i;
const CLAR_STOP = /^(?:nhà\s*thầu\s*:|e-?hsdt\s*của|kết\s*quả\s*đánh\s*giá|stt\b)/i;
// Dòng của báo cáo có chữ "không đạt/không đáp ứng/bị loại" thật (đã bỏ tiêu đề bảng và câu "Thuyết minh …: Không có").
function strongFail(lines) {
  for (let k = 0; k < lines.length; k++) {
    const l = lines[k];
    if (TOKONLY.test(l)) continue;
    if (EXPL_HEAD.test(l) && EXPL_EMPTY.test(lines.slice(k, k + 4).join(" "))) { while (k < lines.length - 1 && !EXPL_EMPTY.test(lines[k])) k++; continue; }
    if (EXPL_FAIL.test(l.replace(TOKS2, " ").replace(/:?\s*kh[ôo]ng\s*c[óo]\.?$/i, ""))) return true;
  }
  return false;
}
function clarification(L, s, startOf) {
  for (let i = s; i < Math.min(L.length, s + 40); i++) {
    if (i > s && OTHER.test(L[i]) && startOf(i) < 0 && !/^[-•+*]/.test(L[i])) break;
    if (!CLAR_HEAD.test(L[i])) continue;
    const out = [];
    for (let j = i + 1; j < Math.min(L.length, i + 25); j++) {
      if (CLAR_STOP.test(L[j]) || (SECTION.test(L[j]) && out.length)) break;
      out.push(L[j]);
    }
    if (out.length > 1 && out[0].length < 25 && /^[a-zà-ỹ]/.test(out[0]) && !/:\s*$/.test(L[i])) out.shift(); // đuôi của dòng tiêu đề bị ngắt ("thầu:")
    // Mục chỉ có hướng dẫn mẫu + "(nếu có): Không có" thì không có nội dung làm rõ; có công văn / văn bản cụ thể thì có.
    const all = (L[i] + " " + out.join(" ")).trim();
    if (!out.length || (/kh[ôo]ng\s*c[óo]\.?$/i.test(all) && !/c[ôo]ng\s*v[ăa]n\s*(?:c[ủu]a|tr[ảa]|s[ốo])/i.test(all))) return "";
    return joinCapped([out], EXPL_MAX);
  }
  return "";
}
const PASS_END = /(?:^|[\s|])(?:đạt|đat|pat)(?:[\s|xX]+(?:đạt|đat|pat))*[\s|.]*$/i;
// { text, source, verdict }. Không chắc → verdict "" (và text như trước).
function bcdgReasonEx(text, o = {}) {
  const r = reasonCore(text, o), { L, startOf } = r;
  let verdict = "", out = r.text;
  const rows = []; // các dòng báo cáo có tên mình (kèm dòng kế, nơi tên bị ngắt)
  for (let i = 0; i < L.length; i++) {
    const s = startOf(i);
    if (s < 0 || rows.some((m) => m.s === s)) continue;
    const row = (L[s] + (s + 1 < L.length && startOf(s + 1) === s ? " " + L[s + 1] : "")).trim(), one = L[s].trim(); // tên bị ngắt dòng: nối dòng đuôi
    rows.push({ s, failEnd: FAIL_END.test(row) || FAIL_END.test(one), pass: !NOTPASS.test(row) && (PASS_END.test(one) || PASS_END.test(row)) });
  }
  const failRow = rows.some((m) => m.failEnd);
  if (r.source === "thuyet-minh") verdict = "fail";
  else if (failRow || (r.source === "doan" && strongFail(r.text.split("\n")))) verdict = "fail";
  else if (rows.some((m) => m.pass)) { verdict = "pass"; out = clarification(L, rows.find((m) => m.pass).s, startOf); }
  return { text: out, source: verdict === "pass" ? "dat" : r.source, verdict };
}
// Trang (chữ OCR nhanh, chất lượng thấp) có nhắc công ty mình không: so khớp chịu lỗi OCR, bỏ dấu. Dùng để chọn trang cần OCR kỹ
// (ocr-pdf.js --locate); thà thừa trang còn hơn sót. "Thảo Nguyên" (lệch tối đa vài ký tự), "kỹ thuật Thảo", hoặc MST (cho phép
// một ký tự lạ giữa các nhóm số, hoặc thiếu/sai một chữ số).
const plainVi = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").toLowerCase();
function mentionsUs(text, tax = OUR_TAX) {
  const p = plainVi(text);
  if (/th.{0,2}[o0]\s{0,2}ngu.{0,2}n\b/.test(p) || /thao\s*ng/.test(p) || /ky\s*thuat\s*th.{0,2}[o0]/.test(p)) return true;
  const t = String(tax);
  // MST: nhóm 4101 623 015, mỗi nhóm cách nhau tối đa 2 ký tự lạ; hoặc 10 chữ số liền sai một chữ số.
  if (new RegExp(t.slice(0, 4) + "\\D{0,2}" + t.slice(4, 7) + "\\D{0,2}" + t.slice(7)).test(p)) return true;
  for (const m of p.matchAll(/(?<!\d)\d[\d\s.]{8,13}\d(?!\d)/g)) {
    const d = m[0].replace(/\D/g, "");
    if (d.length === t.length && [...d].filter((c, i) => c !== t[i]).length <= 1) return true;
  }
  return false;
}
// Trang cần OCR kỹ cho --locate: trang nhắc mình ± 1, và khi trang đó mở khối thuyết minh của mình (tiêu đề "1) Công ty ...:") mà
// khối chạy qua nhiều trang thì thêm các trang kế tiếp tới trang có tiêu đề nhà thầu khác / mục lớn kế tiếp (trang đó cũng lấy; tối đa
// EXTEND_MAX trang thêm cho mỗi chỗ). qOf(n) = chữ OCR nhanh của trang n ("" nếu không có); chỉ trang chạy trong total.
const EXTEND_MAX = 8;
const OPENER = new RegExp("^(?:" + MARK + "|nhà\\s*thầu\\s*:\\s*)?(?:công\\s*ty|cty|liên\\s*danh|tnhh)", "i");
const ENDS_PASS = /(?:đạt|dat)\.?$/i, HEADY = /:\s*$|^\S{1,5}[.)]\s/;
function pagesToRead(hits, qOf, total, tax = OUR_TAX) {
  const want = new Set();
  const ls = (n) => lines(qOf(n) || "");
  for (const n of hits) {
    for (const d of [-1, 0, 1]) if (n + d >= 1 && n + d <= total) want.add(n + d);
    // Trang n có dòng tiêu đề/nhắc công ty mình (không phải dòng bảng xếp hạng kết bằng Đạt / Không đạt)?
    if (!ls(n).some((l) => OPENER.test(l) && mentionsUs(l, tax) && !ENDS_PASS.test(l))) continue;
    for (let p = n + 1, k = 0; p <= total && k < EXTEND_MAX; p++, k++) {
      want.add(p);
      if (ls(p).some((l) => (OPENER.test(l) && !mentionsUs(l, tax) && l.length < 160 && HEADY.test(l)) || MAJOR.test(l))) break;
    }
  }
  return want;
}
module.exports = { bcdgReason, bcdgReasonEx, mentionsUs, pagesToRead, OUR_TAX };

if (require.main === module) {
  const fs = require("fs");
  console.log(bcdgReason(fs.readFileSync(process.argv[2], "utf8"), process.argv[3] ? { tax: process.argv[3] } : {}) || "(không trích được)");
}
