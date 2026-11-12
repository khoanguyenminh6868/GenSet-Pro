// Một gói: tải báo cáo đánh giá E-HSDT (BCĐG), đưa lên kho, đọc chữ, trả tài liệu bcdg/<TBMT> cần ghi (Khoa, 2026-11-12).
// Tách khỏi genbid-sync.js để kiểm bằng test đơn vị (deps giả). Không tự ghi gì: trả { line, doc } (doc null = chưa có gì để ghi).
//
// Trạng thái trong bcdg/<TBMT>: { notifyNo, files:[{id,name,size,md5,path?,error?,skipped?,noText?}], reason, scan, at,
//   error?, tries, giveUp? }.
//  - tải / tải lên lỗi, không thấy tệp, tệp cắt ngắn: `error` ở cấp gói, tries+1; sau MAX_TRIES lần thì giveUp = true (không chọn nữa).
//    Get-GenBidBidderTargets.ps1 chọn lại gói có `error` khi `at` đã quá BACKOFF_HOURS[tries-1] giờ (1 giờ, rồi 6 giờ).
//  - hết giờ trước khi đọc chữ: tệp đã lên kho thì giữ, đánh dấu noText, `error` "chưa đọc chữ" nhưng KHÔNG tính vào tries
//    (lượt sau tải lại để đọc chữ, không tải lên lại).
//  - tệp quá lớn: không tải lên, ghi `skipped`; không phải lỗi.
"use strict";
const { bcdgReason } = require("./bcdg-reason.js");
const MAX_TRIES = 3, BACKOFF_HOURS = [1, 6], MAX_BYTES = 50 * 1048576, OCR_MAX_MS = 10 * 60e3;

// deps: now(), download(todo[{id,name}]) -> [{id,file,bytes,md5}] (chỉ tệp đủ), upload(file, storedName) -> path,
//       text(file, timeoutMs) -> {text, ocr, timedOut}, stored(m) -> tên lưu, log(s)
// deadline: epoch ms; quá giờ thì để lượt sau (không ghi gì).
// A failed try: tries+1, and giveUp after MAX_TRIES (the same for a page that gave no report file or nothing usable).
function failDoc(key, why, prev, at, files) {
  const t = (prev?.tries || 0) + 1, giveUp = t >= MAX_TRIES;
  return { line: `${key}: BCĐG lỗi (${why})${giveUp ? ", bỏ sau " + t + " lần" : ""}`,
    doc: { notifyNo: key, files: files || prev?.files || [], ...(prev?.reason ? { reason: prev.reason } : {}), error: String(why).slice(0, 200), tries: t, ...(giveUp ? { giveUp: true } : {}), at } };
}
async function bcdgStep({ key, b, prev, deps, deadline = Infinity, maxBytes = MAX_BYTES }) {
  const at = deps.now(), tries = prev?.tries || 0, left = () => deadline - Date.now();
  const fail = (why, files) => failDoc(key, why, prev, at, files);
  const files = b.reportFiles || [];
  if (!files.length) return fail("không thấy tệp báo cáo trên trang");
  if (left() <= 0) return { line: `${key}: BCĐG để lượt sau (hết giờ)`, doc: null };

  // Tệp đã lên kho từ lượt trước giữ nguyên; chỉ làm lại tệp chưa lên hoặc chưa đọc chữ.
  const old = new Map((prev?.files || []).map((f) => [String(f.id).toLowerCase(), f]));
  const keep = (f) => { const o = old.get(f.id.toLowerCase()); return o && (o.skipped || (o.path && !o.noText)) ? o : null; };
  const todo = files.filter((f) => !keep(f));
  if (!todo.length && prev && !prev.error) return { line: `${key}: BCĐG đã có`, doc: null };

  let got = [];
  if (todo.length) {
    try { got = await deps.download(todo); } catch (e) { return fail("tải: " + String(e.message || e).split("\n")[0]); }
  }
  const out = [], texts = [];
  let scan = !!prev?.scan, anyErr = false, anyNoText = false, ocrOut = false;
  for (const f of files) {
    const k = keep(f);
    if (k) { out.push(k); continue; }
    const m = got.find((x) => String(x.id).toLowerCase() === f.id.toLowerCase());
    const o = old.get(f.id.toLowerCase());
    const rec = { id: f.id, name: f.name || (m && m.file ? String(m.file).split(/[\\/]/).pop() : ""), ...(m ? { size: m.bytes, md5: m.md5 } : {}) };
    if (!m) { out.push({ ...rec, error: "không tải được hoặc tệp bị cắt ngắn" }); anyErr = true; continue; }
    if (m.bytes > maxBytes) { out.push({ ...rec, skipped: `tệp lớn hơn ${maxBytes / 1048576} MB, không lưu` }); continue; }
    if (o?.path) rec.path = o.path; // đã lên kho từ lượt trước, chỉ thiếu chữ
    else {
      try { rec.path = await deps.upload(m.file, deps.stored(m)); }
      catch (e) { out.push({ ...rec, error: ("tải lên: " + String(e.message || e).split("\n")[0]).slice(0, 200) }); anyErr = true; continue; } // lỗi tải lên: không đọc chữ
    }
    if (left() < 30e3) { out.push({ ...rec, noText: true }); anyNoText = true; continue; }
    const t = deps.text(m.file, Math.min(OCR_MAX_MS, left()));
    if (t.ocr) scan = true;
    if (t.timedOut) { ocrOut = true; rec.ocrTimeout = true; }
    out.push(rec);
    texts.push(t.text || "");
  }
  const reason = texts.length ? bcdgReason(texts.join("\n")) || prev?.reason || "" : prev?.reason || "";
  const doc = { notifyNo: key, files: out, reason, scan, at };
  if (anyErr) {
    const t = tries + 1, giveUp = t >= MAX_TRIES;
    doc.error = `${out.filter((f) => f.error).length}/${files.length} tệp chưa lên kho (${out.find((f) => f.error).error})`.slice(0, 200);
    doc.tries = t;
    if (giveUp) doc.giveUp = true;
  } else if (anyNoText) { doc.error = "chưa đọc chữ (hết giờ), để lượt sau"; doc.tries = tries; }
  const okN = out.filter((f) => f.path).length;
  return { line: `${key}: BCĐG ${okN}/${files.length} tệp${reason ? ", có lý do" : ", chưa trích được lý do"}${scan ? " (OCR)" : ""}${ocrOut ? ", OCR quá giờ" : ""}${doc.error ? "; " + doc.error : ""}`, doc };
}
module.exports = { bcdgStep, failDoc, MAX_TRIES, BACKOFF_HOURS, MAX_BYTES, OCR_MAX_MS };
