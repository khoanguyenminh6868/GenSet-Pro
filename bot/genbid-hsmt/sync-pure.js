// The pure parts of genbid-sync.js (T5, 2026-11-13): moved out of it unchanged so they can be tested in CI
// (bot/test/*.test.mjs) without a browser, Tesseract or the network. genbid-sync.js requires them back under the same names.
// What is here only computes from its arguments; the exceptions read or write files they are given: checkResult and
// checkSupplier read the request folder (dir), specsFinish writes a temporary folder of its own; histConfigOf stamps "at".
// Copy this file to C:\Projects\GenSet Pro\genbid-hsmt\ together with genbid-sync.js (one needs the other).
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const now = () => new Date().toISOString();
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8").replace(/^\uFEFF/, "")); } catch { return d; } };

async function sig(o) {
  const s = [o.bidCloseDate, o.bidOpenDate, o.notifyVersion, o.estimatedPrice, o.bidName, o.investorName, o.procuringEntityName, o.location, String(o.isInternet).toLowerCase()].map((v) => v ?? "").join("|") + (o.status === "cancelled" ? "|cancelled" : "");
  const b = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 12);
}
const isDecisionFile = (name) => {
  const nm = String(name || "").normalize("NFC");
  if (/y(ê|e)u\s*c(ầ|a)u\s*(v(ề|e)\s*)?k(ỹ|y|i)?\s*thu(ậ|a)t|(^|[^a-z])yckt([^a-z]|$)|ch(ư|u)?(ơ|o|ô)ng[\s_.-]*(v|5)(?![ivx\d])/i.test(nm) && !/^[\d\s._-]*(q(đ|d)|quy(ế|e)t[\s_]*(đ|d)(ị|i)nh|quyetdinh)/i.test(nm)) return false;
  return /^[\d\s._-]*(q(đ|d)|quy(ế|e)t[\s_]*(đ|d)(ị|i)nh|quyetdinh|ph(ê|e)[\s_]*duy(ệ|e)t)|(q(đ|d)|quy(ế|e)t[\s_]*(đ|d)(ị|i)nh)[\s_.-]*(p(đ|d)|ph(ê|e)[\s_]*duy(ệ|e)t)/i.test(nm);
};
const HIST_PREFIX = "egpportalcontractorselectionv2_WAR_egpportalcontractorselectionv2";
const has = (v) => v && v !== "undefined";
// muasamcong's search matches the words loosely ("phát thải ... Nhà máy Điện", turbine generators of power plants):
// keep only tenders whose name is about a generator set.
const GENSET_RE = /m[áa]y\s*ph[áa]t\s*(đi[ệe]n|di[eê]s[eê]l|di[eê]zen|dự\s*phòng)|m[áa]y\s*ph[áa]t[^,;:]{0,30}\d+\s*k[vV]?[aA]\b|\bgenset\b|\bmp[đd]\b/i;
// A power plant's own generator (turbine, "tổ máy số 2", thuỷ điện / nhiệt điện) is not a generator set, unless the name
// says standby, diesel or kVA.
const PLANT_RE = /tua\s*bin|turbine|tổ\s*máy\s*(số\s*)?[HS]?\d|nhà\s*máy\s*(thủy|thuỷ|nhiệt)\s*điện/i, SET_RE = /dự\s*phòng|di[eê]s[eê]l|di[eê]zen|\d\s*kva\b/i;
const isGenset = (c) => { const n = String([].concat(c.bidName || c.pname || "")[0]).normalize("NFC"); return GENSET_RE.test(n) && (!PLANT_RE.test(n) || SET_RE.test(n)); };
const vnTime = (s) => (s ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + "+07:00").toISOString() : null);
function histUrl(t) {
  const kq = has(t.inputResultId), P = HIST_PREFIX;
  const q = { p_p_id: P, p_p_lifecycle: 0, p_p_state: "normal", p_p_mode: "view", [`_${P}_render`]: "detail-v2", type: "es-notify-contractor", stepCode: kq ? "notify-contractor-step-4-kqlcnt" : "notify-contractor-step-2-kqmt",
    id: t.id, notifyId: t.notifyId || t.id, inputResultId: kq ? t.inputResultId : "undefined", bidOpenId: t.bidOpenId, techReqId: "undefined", bidPreNotifyResultId: "undefined", bidPreOpenId: "undefined",
    processApply: t.processApply, bidMode: t.bidMode, notifyNo: t.notifyNo, planNo: t.planNo, pno: "undefined", step: kq ? "kqlcnt" : "kqmt", isInternet: t.isInternet ? 1 : 0, caseKHKQ: "undefined", bidForm: t.bidForm };
  return "https://muasamcong.mof.gov.vn/web/guest/contractor-selection?" + Object.entries(q).map(([k, v]) => `${k}=${encodeURIComponent(v ?? "undefined")}`).join("&");
}
// The tender as the search lists it (one row of listResultSearch), in the shape the web reads.
function histTender(t) {
  const sum = (v) => { const a = [].concat(v ?? []).map(Number).filter((x) => !isNaN(x)); return a.length ? a.reduce((x, y) => x + y, 0) : null; };
  return {
    notifyNo: t.notifyNo, bidName: String([].concat(t.bidName || t.pname || "")[0]).replace(/\s+/g, " ").trim(), investorName: t.investorName || "",
    investorCode: String(t.investorCode || "").replace(/^vn/i, ""), procuringEntityName: t.procuringEntityName || "",
    location: (t.locations || []).map((l) => l.provName).filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(", "),
    bidForm: t.bidForm || "", field: [].concat(t.investField || t.bidField || [])[0] || "", isInternet: !!t.isInternet, isDomestic: t.isDomestic ?? null,
    publicDate: vnTime(t.publicDate), bidCloseDate: vnTime(t.bidCloseDate), openedAt: vnTime(t.bidRealityOpenDate), resultAt: vnTime(t.publicDateKqlcnt),
    estimatedPrice: sum(t.bidPrice), status: t.statusForNotify || "", stepCode: t.stepCode || "", numBidderJoin: t.numBidderJoin ?? null,
    winners: [].concat(t.winningContractorName || t.contractorName || []).filter(Boolean), winnerTax: [].concat(t.winningCode || []).map((c) => String(c).replace(/^vn/i, "")),
    winningPrice: sum(t.bidWinningPrice),
  };
}
const POWER_RE = /(\d+(?:[.,]\d+)?)\s*(kva|kw|mva)\b/gi;
// Also "Công suất liên tục (kW/kVA) ≥ 100/125": the unit pair before the value pair.
const POWER_PAIR_RE = /\(\s*kw\s*\/\s*kva\s*\)[^\d\n]{0,12}(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)/gi;
const histNum = (x) => Number(x.replace(/\.(?=\d{3}\b)/, "").replace(",", "."));
const histPower = (s) => [...[...String(s || "").matchAll(POWER_RE)].map((m) => ({ v: histNum(m[1]), u: m[2].toLowerCase() === "mva" ? "MVA" : m[2].toLowerCase() === "kw" ? "kW" : "kVA" })),
  ...[...String(s || "").matchAll(POWER_PAIR_RE)].map((m) => ({ v: histNum(m[2]), u: "kVA" }))].filter((p) => p.v > 0);
function histNeedsConfig(d) {
  // Read before OCR existed and found only a scan: read again.
  if (d.config && (d.config.kvas?.length || !/bản scan/.test(d.config.src || ""))) return false;
  const multi = (d.lots || []).length > 1;
  return (d.lots || []).some((l) => !histPower(l.lotName).length && (multi || !histPower(d.bidName).length) && !(l.goods || []).some((g) => histPower([g.name, g.code, g.desc].join(" ")).length));
}
// Lines of an HSMT that describe the equipment: power, engine, alternator, makes, controller, ATS, quantities.
// The lines kept for bidhist config.text, within CONFIG_TEXT_MAX characters: the ones that decide a comparison first
// (make, origin, quantity, power, scope), then the rest in order. 2026-11-06 audit: at 3,000 characters in order, 803 of
// 1,250 past tenders were cut before their origin / scope lines.
const CONFIG_TEXT_MAX = 6000;
const CONFIG_KEY = /h[ãa]ng|xu[ấa]t\s*x[ứu]|origin|\bATS\b|c[áa]ch\s*[âa]m|b[ồo]n|đ[ồo]ng\s*b[ộo]|s[ốo]\s*l[ưu][ợo]ng|li[êe]n\s*t[ụu]c|d[ựu]\s*ph[òo]ng|prime|standby|c[ôo]ng\s*su[ấa]t|bi[ếe]n\s*[áa]p|l[ắa]p\s*đ[ặa]t|\bc[áa]p\b|trung\s*qu[ốo]c|\bG7\b|nh[ậa]p\s*kh[ẩa]u|model|nh[ãa]n\s*hi[ệe]u/i;
function configText(lines, max = CONFIG_TEXT_MAX) {
  const uniq = lines.filter((l, i, a) => l && a.indexOf(l) === i), key = uniq.filter((l) => CONFIG_KEY.test(l)), rest = uniq.filter((l) => !CONFIG_KEY.test(l));
  const out = []; let size = 0;
  for (const l of [...key, ...rest]) { if (size + l.length + 1 > max) continue; out.push(l); size += l.length + 1; }
  return out.join("\n");
}
// The sets of an analysis as figures (specs / Phân tích "generatorSets"), kept as they are when each is an object.
const setsOf = (v) => (Array.isArray(v) ? v.filter((s) => s && typeof s === "object").map((s) => ({ qty: Number(s.qty) > 0 ? Number(s.qty) : null, primeKva: Number(s.primeKva) > 0 ? Number(s.primeKva) : null, standbyKva: Number(s.standbyKva) > 0 ? Number(s.standbyKva) : null,
  primeKw: Number(s.primeKw) > 0 ? Number(s.primeKw) : null, standbyKw: Number(s.standbyKw) > 0 ? Number(s.standbyKw) : null, phases: [1, 3].includes(Number(s.phases)) ? Number(s.phases) : null, quote: s.quote ? String(s.quote).slice(0, 300) : null })).slice(0, 8) : []);
function histConfigOf(text, src) {
  text = String(text || "").normalize("NFC");
  const kvas = histPower(text).filter((p, i, a) => a.findIndex((q) => q.v === p.v && q.u === p.u) === i).slice(0, 20);
  const want = /kva|kw\b|công suất|động cơ|engine|đầu phát|alternator|bộ điều khiển|controller|ats|xuất xứ|hãng sản xuất|model|tần số|điện áp|vòng tua|nhiên liệu|số lượng/i;
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length > 4 && l.length < 400 && want.test(l));
  return { kvas, text: configText(lines), src, at: now() };
}
const histTbmtUrl = (u) => { const x = new URL(u); for (const [k, v] of Object.entries({ stepCode: "notify-contractor-step-1-tbmt", step: "tbmt", inputResultId: "undefined", bidOpenId: "undefined" })) x.searchParams.set(k, v); return x.toString(); };
const CFG_FILE_RE = /ch(ư|u)(ơ|o)ng[\s_.]*(v|5)(?![ivx\d])|y(ê|e)u\s*c(ầ|a)u\s*(v(ề|e)\s*)?k(ỹ|y)\s*thu(ậ|a)t|yeucau.*kythuat|ph(ạ|a)m\s*vi\s*cung\s*c(ấ|a)p|e-?hsmt|\bhsmt\b|\brfq\b|th(ô|o)ng\s*s(ố|o)\s*k(ỹ|y)\s*thu(ậ|a)t/i;
const CFG_SKIP_RE = /(^|[^a-z])q(đ|d)([^a-z]|$)|q(đ|d)pd|duy(ệ|e)t|quy(ế|e)t\s*(đ|d)(ị|i)nh|quyetdinh|\bq(đ|d)\b|ti(ê|e)u\s*chu(ẩ|a)n\s*(đ|d)(á|a)nh\s*gi(á|a)|danhgia|ch(ư|u)(ơ|o)ng[\s_.]*(i{1,3}|vii|iv|vi|[1-46-9])(?![ivx\d])|tc(đ|d)g|\bdkct\b|s(ử|u)a\s*(đ|d)(ổ|o)i/i;
// The tender's technical part. A short text goes whole. Otherwise the chapters titled as technical requirements (an HSYC
// puts them in Chương IV and the contract in Chương V; OCR drops the accents), else chapter V, else all of it.
const SPEC_TITLE_RE = /yeu cau (ve )?ky thuat|yeu cau doi voi goi thau|pham vi cung cap|thong so ky thuat|tien luong/;
const plainVi = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").toLowerCase();
function chapterV(text) {
  text = compact(text);
  if (text.length <= 80000) return text;
  const secs = splitSections(text).filter((s) => s.text.length > 300);
  const byTitle = secs.filter((s) => /^[IVX]+$/.test(s.chap) && SPEC_TITLE_RE.test(plainVi(s.title)));
  const v = byTitle.length ? byTitle : secs.filter((s) => s.chap === "V" && !/hop dong/.test(plainVi(s.title)));
  // A chapter V of a few lines is the summary at the start of the HSMT ("Chương này nêu các yêu cầu về kỹ thuật ..."),
  // not the chapter (IB2500302333): look further.
  if (v.reduce((n, s) => n + s.text.length, 0) > 3000) return v.map((s) => (s.text.startsWith("--- Tệp:") ? "" : `--- Tệp: ${s.file} ---\n`) + s.text).join("\n");
  // A text layer with a broken font ("Phân 2. YEU CAU YE 1(2 THUJT", IB2500302333) hides the titles: from the last line
  // starting "Phần 2" (the table of contents comes first) up to "Phần 3".
  const p2 = [...text.matchAll(/^[\s\W]{0,40}ph\S{0,3}n\s*(2|th\S{0,3}\s*hai)(?!\d)/gim)].pop();
  if (p2 && p2.index > text.length * 0.2) {
    const rest = text.slice(p2.index), p3 = rest.slice(500).search(/^[\s\W]{0,40}ph\S{0,3}n\s*(3|th\S{0,3}\s*ba)(?!\d)/im);
    return rest.slice(0, p3 > 0 ? p3 + 500 : 150000);
  }
  // No chapter headings at all (the bilingual HSMT of Vietsovpetro, IB2600547578: 490,000 characters, the first 150,000
  // are instructions and contract): the technical requirements are a block titled "YÊU CẦU KỸ THUẬT" in capitals on a
  // line of its own, well after the table of contents.
  const yc = [...text.matchAll(/^[^\S\n]*\|?[^\S\n]*Y[ÊE]U C[ẦA]U K[ỸY] THU[ẬA]T[^\S\n]*$/gm)].find((m) => m.index > text.length * 0.2);
  if (yc) return text.slice(Math.max(0, yc.index - 200), yc.index + 150000);
  return text;
}
// The files of a tender's notice to read for its chapter V (specs), by name: { pick, loose }. files: [{ name }]; web: the
// webform chapter V text ("" when none). Cut out of specsSource unchanged (T5, 2026-11-13).
function specsPick(files, web) {
  // With the webform chapter only the files named as technical requirements; without it the HSMT files too (E-HSMT).
  // File names often come decomposed (NFD), which the patterns would miss.
  // Short names too: "Chg 5.pdf", "YCKT.pdf", "..._HSMT.pdf" (an underscore is a word character for \b).
  // "Hồ sơ yêu cầu" (HSYC) and "Hồ sơ đăng tải" are the whole tender document too.
  // "Hồ sơ mời thầu thuê máy phát.pdf" (IB2300030459), "E-HỒ SƠ MỜI THẦU (VT-2237-25-CĐ-TTH).pdf" too (2026-11-04).
  const HSMT_NAME = /(^|[^a-z])e?-?hsmt([^a-z]|$)|h(ồ|o)\s*s(ơ|o)\s*(y(ê|e)u\s*c(ầ|a)u|(đ|d)(ă|a)ng\s*t(ả|a)i|m(ờ|o)i\s*th(ầ|a)u|ch(à|a)o\s*h(à|a)ng)|\b(hsyc|chct)\b/i, SHORT = /(^|[^a-z])ch?g?[\s_.]*0?5(?![\d,]|\.\d)|(^|[^a-z])y\s*c\s*k\s*t([^a-z]|$)|(^|[^a-z])c\s*v([^a-z]|$)|ph(ụ|u)\s*l(ụ|u)c|phuluc|ch(ư|u)?(ơ|o|ô)ng[\s_.-]*(v|5)(?![ivx\d])|ti(ê|e)u\s*chu(ẩ|a)n\s*k(ỹ|y)\s*thu(ậ|a|â)|(^|[^a-z])tckt([^a-z]|$)|(^|[^a-z])ycbg|(^|[^a-z])bycb|y(ê|e)u\s*c(ầ|a)u\s*b(á|a)o\s*gi(á|a)|ph(ầ|a)n\s*2(?!\d|[.,]\d)/i;
  // A name that says it is the technical requirements ("Chương III. Yêu cầu kỹ thuật" in a chào hàng cạnh tranh rút gọn,
  // IB2300236144) is read whatever chapter number it carries.
  // 2026-11-04 also: "3. YEU CAU KT XL-02.pdf", "Yeu cau ki thuat - MPĐ 250kva.docx", "Chỉ dẫn kỹ thuật máy phát điện.pdf",
  // "CDKT+Bản vẽ.rar", "15. QCKT MF DU PHONG.pdf", "TCKTHUAT VTTB ….rar", "Tiêu chuẩn VTTB ….zip".
  const YCKT_NAME = /y(ê|e)u\s*c(ầ|a)u\s*(v(ề|e)\s*)?(m(ặ|a)t\s*)?k(ỹ|y|i)?\s*(thu(ậ|a)t|t(?![a-z]))|(^|[^a-z])y\s*c\s*k\s*t([^a-z]|$)|ch(ỉ|i)\s*d(ẫ|a)n\s*k(ỹ|y)\s*thu(ậ|a)t|(^|[^a-z])(cdkt|qckt|tckthuat|vttb)([^a-z]|$)/i;
  // "Sửa đổi" in a name skips an amendment decision, but not the amended chapter V itself ("11. Sửa đổi Phần 2 Chương V
  // YÊU CẦU VỀ KỸ THUẬT", IB2500206907; "Chuong V - Yeu cau ky thuat_Sua doi.pdf", IB2600309163).
  // A name that says chapter V or the technical requirements is read unless it starts as a decision (2026-11-04:
  // "Yêu cầu về kỹ thuật (phê duyệt).doc", "DMHH - YCKT - TCDG - ….pdf", "…_QDPDBVTC_Chuong V.pdf", "Chương 3- Chương 5
  // (Bảo dưỡng MF5).PDF" were skipped).
  const CH5 = /ch(ư|u)?(ơ|o|ô)ng[\s_.-]*(\d\s*[,&-]\s*)?(v|5)(?![ivx\d])/i, DECISION = /^[\d\s._-]*(q(đ|d)|quy(ế|e)t\s*(đ|d)(ị|i)nh|quyetdinh|ph(ê|e)\s*duy(ệ|e)t|v(ă|a)n\s*b(ả|a)n)/i;
  const skipName = (nm) => {
    if (YCKT_NAME.test(nm) || CH5.test(nm)) return DECISION.test(nm);
    const x = CFG_FILE_RE.test(nm) || SHORT.test(nm) || HSMT_NAME.test(nm) ? nm.replace(/s(ử|u)a[\s_-]*(đ|d)(ổ|o)i/gi, " ") : nm;
    // "Phụ lục bảng giá hợp đồng.docx", "Biểu mẫu phụ lục hợp đồng.pdf", "7. BYCB gói 3 - DỰ THẢO HĐ.doc", "Báo cáo lập
    // E-HSMT ….pdf" were read in place of chapter V (2026-11-04, a dozen tenders).
    return CFG_SKIP_RE.test(x) || /h(ợ|o)p\s*(đ|d)(ồ|o)ng|(^|[^a-z])h(đ|d)([^a-z]|$)|b(ả|a)ng\s*gi(á|a)|bi(ể|e)u\s*m(ẫ|a)u|b(á|a)o\s*c(á|a)o|(^|[^a-z])bc\s*l(ậ|a)p/i.test(x);
  };
  // A name that says chapter V or the technical requirements is that chapter even with "HSMT" in it ("Chương V - TCKT -
  // HSMT MPĐ 12KVA.pdf", IB2200008717; "E-HSMT - MPD (GD3) - Yeu cau ve ky thuat.pdf", IB2200091251): before 2026-11-13
  // it counted as the whole E-HSMT, so 25 of 1,472 tenders also read the whole E-HSMT, "Mục 3", the contract (130 MB,
  // 1,510 pages), and with a webform chapter it was dropped ("Chuong 3" read in its place, IB2600588204).
  const named = (nm) => YCKT_NAME.test(nm) || CH5.test(nm), whole = (nm) => HSMT_NAME.test(nm) && !named(nm);
  const cand = files.filter((x) => { const nm = x.name.normalize("NFC"); return (CFG_FILE_RE.test(nm) || SHORT.test(nm) || named(nm) || HSMT_NAME.test(nm)) && !skipName(nm) && (!web || !whole(nm)); });
  // A file of its own for chapter V / the technical requirements: the whole E-HSMT (often a 40–100 MB scan) is not needed.
  const own = cand.filter((x) => !whole(x.name.normalize("NFC")));
  // Nothing else: in a chào hàng cạnh tranh rút gọn (HSYC) chapter III holds the technical requirements ("Chương III.pdf",
  // "Chương IV.pdf" = draft contract, "QĐ ….pdf"; IB2200044785, IB2300393435 and a dozen more).
  const ch3 = files.filter((x) => { const nm = x.name.normalize("NFC"); return /ch(ư|u)?(ơ|o|ô)ng[\s_.-]*(iii|3)(?![ivx\d])/i.test(nm) && !DECISION.test(nm) && !/h(ợ|o)p\s*(đ|d)(ồ|o)ng|tc(đ|d)g|ti(ê|e)u\s*chu(ẩ|a)n\s*(đ|d)(á|a)nh/i.test(nm); });
  const pick = (own.length ? own : cand.length ? cand : ch3).slice(0, 3);
  // Last resort (2026-11-10, specs still open in session-log): no file is recognised as the technical requirements ("Gói 22.pdf", "gói 12.pdf",
  // "Mẫu 17_0001.pdf", "1196-vtsg-dmtx.pdf"): every file that is not an approval decision, up to 4, is downloaded and read.
  const APPROVAL = /(^|[^a-z])q(đ|d)([^a-z]|$)|quy(ế|e)t\s*(đ|d)(ị|i)nh|quyetdinh|ph(ê|e)\s*duy(ệ|e)t|pheduyet|(^|[^a-z])pd(hs|yc)/i;
  const loose = files.filter((x) => !APPROVAL.test(x.name.normalize("NFC")) && /\.(pdf|docx?|xlsx?|rar|zip|7z|jpe?g|png|tiff?)$/i.test(x.name)).slice(0, 4);
  return { pick, loose };
}
function specsFinish(t, vals, body, info) {
  const key = t.notifyNo, live = vals.filter((x) => !specsEmpty(x.v));
  if (!live.length) return { none: String(vals.find((x) => x.v?._error)?.v._error || "không có thông số kỹ thuật máy phát") + (info ? ` (cả ${info.n} phần)` : "") };
  const v = info ? specsMerge(live) : live[0].v, notes = [];
  if (info) notes.push(`Chương V dài ${info.len.toLocaleString("vi-VN")} ký tự: đọc hết bằng ${info.n} lần gọi, ghép bằng mã (mỗi phần lặp lại ${SPECS_PART_OVERLAP.toLocaleString("vi-VN")} ký tự cuối phần trước).`, ...v.conflicts.slice(0, 12), ...(v.conflicts.length > 12 ? [`Còn ${v.conflicts.length - 12} chỗ các phần đọc khác nhau (chưa rõ).`] : []));
  const result = { summary: null, keyInfo: { bidName: t.bidName || null, notifyNo: key, generatorCapacity: v.generatorCapacity || null }, generatorSets: setsOf(v.generatorSets),
    technicalSpecs: v.technicalSpecs || [], qualificationRequirements: [], highlights: [], requiredDocuments: [], restrictiveClauses: [], questionsForClarification: [] };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "genbid-specs-"));
  fs.writeFileSync(path.join(tmp, "src-req.txt"), body, "utf8");
  const checked = checkResult({ kind: "analysis" }, result, tmp);
  fs.rmSync(tmp, { recursive: true, force: true });
  if (info) { // a set's quote is not in checkResult: every quote of a joined set is looked for in the whole text
    const req = sourceOf(body);
    for (const s of result.generatorSets) if (s.quote && req.usable && !found(s.quote, req)) { checked.push(`Kiểm tra tự động: trích dẫn của máy ${setLabel(s)} không thấy nguyên văn trong Chương V nên đã bỏ.`); s.quote = null; }
  }
  return { result, v: { ...v, _notes: [...notes, ...[].concat(v._notes || [])] }, checked };
}
const SERVICE_RE = /b[ảa]o\s*d[ưu][ỡo]ng|b[ảa]o\s*tr[ìi]|s[ửu]a\s*ch[ữu]a|đ[ạa]i\s*tu|(?<!(c[ăa]n\s*h[ộo]|nh[àa](\s*[ởo])?|v[ăa]n\s*ph[òo]ng|m[ặa]t\s*b[ằa]ng)\s*cho\s*)\bthu[êe](?![a-zà-ỹ])|di\s*d[ờo]i|v[ậa]t\s*t[ưu]|ph[ụu]\s*t[ùu]ng|nhi[êe]n\s*li[ệe]u|d[ầa]u\s*nh[ờo]n/i;
const BUY_SET_RE = /(\bmua(\s*s[ắa]m)?|trang\s*b[ịi](\s*m[ớo]i)?|l[ắa]p\s*đ[ặa]t|cung\s*c[ấa]p((\s*(và|,)\s*|\s*)l[ắa]p\s*đ[ặa]t)?)\s*(\d+\s*)?(\(\d+\)\s*)?(t[ổo]\s*|b[ộo]\s*|chi[ếe]c\s*)?m[áa]y\s*ph[áa]t|\bmua(\s*s[ắa]m)?\s+(?!v[ậa]t|vttb|ph[ụu]|thi[ếe]t)[^,;]{0,15},\s*m[áa]y\s*ph[áa]t/i;
function isServiceTender(name, result) {
  const n = String(name || "").normalize("NFC");
  if (/kh[ôo]ng\s*mua\s*(t[ổo]\s*)?m[áa]y/i.test(String(result?.keyInfo?.generatorCapacity || "").normalize("NFC"))) return true;
  return SERVICE_RE.test(n) && !BUY_SET_RE.test(n);
}
const NOTICE_MAX = 20000, GOODS_MAX = 30000, WEBFORM_MAX = 50000;
const KEEP = { analysis: ["II", "III", "V", "VII"], compare: ["II", "III", "V", "VII"], hsdt: ["II", "III", "IV", "V", "VII"], translation: ["V"], tlkt: ["III", "V"] };
function splitSections(text) {
  const out = []; let cur = { file: "", chap: "", title: "(đầu)", lines: [] };
  const push = () => { const t = cur.lines.join("\n"); if (t.trim()) out.push({ ...cur, text: t }); };
  for (const line of text.split("\n")) {
    const f = line.match(/^\s*---\s*Tệp:\s*(.+?)\s*---\s*$/);
    // OCR and old fonts spell the heading "CHUONG", "Chirong", "Chu'o'ng" (2026-11-04): a chapter V not found falls into
    // the chapter before it, which Phân tích drops.
    const c = line.trim().length < 120 && line.match(/^\s*(?:Chương|CHƯƠNG|Ch(?!ống)[^\s\d]{1,6}ng|CH(?!ỐNG)[^\s\d]{1,6}NG)\s*[.:]?\s+([IVX]+)\b/);
    const p = line.trim().length < 120 && line.match(/^\s*(?:Phần|PHẦN)\s+(\d+[A-Z]?)\b/);
    if (f) { push(); cur = { file: f[1], chap: "", title: "(đầu tệp)", lines: [line] }; }
    else if (c || p) { push(); cur = { file: cur.file, chap: c ? c[1].toUpperCase() : "P" + p[1].toUpperCase(), title: line.trim(), lines: [line] }; }
    else cur.lines.push(line);
  }
  push();
  return out;
}
// Đối chiếu TLKT needs only the technical criteria of chapter III (Mục 3. Tiêu chuẩn đánh giá về kỹ thuật), not
// eligibility, capability-experience or price (Khoa, 2026-10-27). Without that heading the chapter stays whole.
function technicalOfIII(text) {
  const lines = text.split("\n");
  const head = (l) => l.trim().length < 150;
  const from = lines.findIndex((l) => head(l) && /^\s*(Mục|MỤC)\s*3\b/.test(l) && /kỹ thuật|KỸ THUẬT/.test(l));
  const start = from >= 0 ? from : lines.findIndex((l) => head(l) && /tiêu chuẩn đánh giá về kỹ thuật/i.test(l));
  if (start < 0) return text;
  let end = lines.findIndex((l, i) => i > start && head(l) && /^\s*(Mục|MỤC)\s*[4-9]\b/.test(l));
  if (end < 0) end = lines.length;
  return [lines[0], ...lines.slice(start, end)].join("\n");
}
function trimHsmt(text, kind) {
  const keep = KEEP[kind], secs = splitSections(text), dropped = [];
  // The same chapter often comes twice (a .docx and the full E-HSMT PDF): keep the longest copy.
  const best = {};
  for (const s of secs) if (/^[IVX]+$/.test(s.chap) && s.text.length > 1500 && (!best[s.chap] || s.text.length > best[s.chap].text.length)) best[s.chap] = s;
  const hasKept = keep.some((k) => best[k]);
  const parts = secs.filter((s) => {
    const small = s.text.length <= 1500;
    let ok;
    if (!hasKept) ok = true;                                        // no chapter headings found: keep everything
    // Phân tích also reads the draft contract (Chương VIII of an E-HSMT, Chương IV of an HSYC: "Dự thảo hợp đồng",
    // "Biểu mẫu hợp đồng") for its penalties and payment terms (Khoa, 2026-11-04); Điều kiện chung stays out.
    else if (/^[IVX]+$/.test(s.chap)) ok = small || ((keep.includes(s.chap) || (kind === "analysis" && /hop dong/.test(plainVi(s.title)) && !/dieu kien chung|bieu mau du thau/.test(plainVi(s.title)))) && best[s.chap] === s);
    else if (/^P/.test(s.chap)) ok = small || !/^P(3B|4)$/.test(s.chap) || (kind === "analysis" && /hop dong/.test(plainVi(s.title)));
    // File starts (e.g. the approval decision, which Đối chiếu TLKT does not need).
    else ok = small || (kind !== "translation" && !(kind === "tlkt" && /QuyetDinh|PheDuyet/i.test(s.file || "")));
    if (!ok) dropped.push(`${s.file || "?"} / ${s.title.slice(0, 70)} (${s.text.length.toLocaleString("vi-VN")} ký tự)`);
    return ok;
  });
  // Re-add the file headers so each part says where it comes from.
  let lastFile = null;
  const body = parts.map((s) => {
    const head = s.file !== lastFile && !s.text.startsWith("--- Tệp:") ? `--- Tệp: ${s.file} ---\n` : "";
    lastFile = s.file;
    return head + (kind === "tlkt" && s.chap === "III" ? technicalOfIII(s.text) : s.text);
  }).join("\n");
  return { text: body, dropped };
}
// pdftotext -layout pads columns with spaces, which cost tokens: drop indentation and trailing spaces, turn wide gaps
// (table columns) into " | " and other runs into one space, and keep only the first copy of page headers/footers.
// List rows ("- Bản vẽ lắp: ...", "1. ...") are real data even when they repeat (one per item of a parts list), so they stay.
function compact(s) {
  const lines = s.split("\n").map((l) => l.replace(/\s+$/, "").replace(/^[ \t]+/, "").replace(/[ \t]{4,}/g, " | ").replace(/[ \t]{2,}/g, " "));
  const count = new Map();
  for (const l of lines) if (l.length > 20 && l.length < 120 && !l.startsWith("--- Tệp:") && !/^([-+•*–]|\d+[.)/]?\s)/.test(l)) count.set(l, (count.get(l) || 0) + 1);
  const seen = new Set();
  return lines.filter((l) => { if ((count.get(l) || 0) < 5) return true; if (seen.has(l)) return false; seen.add(l); return true; })
    .join("\n").replace(/\n{3,}/g, "\n\n");
}
// No silent cut (cut guard, điều phối 2026-11-12). A text kept to its first `max` characters, at a line end; what was left
// out named by its lines: { text, note } with note "" when it fits. The tail of a notice page (muasamcong's footer, from
// "Quay trở lại") is dropped first: links and addresses only.
const lineOf = (t, pos) => { let n = 1; for (let i = t.indexOf("\n"); i >= 0 && i < pos; i = t.indexOf("\n", i + 1)) n++; return n; };
const linesIn = (t) => lineOf(t, t.length - (t.endsWith("\n") ? 1 : 0));
function headCut(t, max) {
  t = String(t || "");
  if (t.length <= max) return { text: t, note: "" };
  let e = t.lastIndexOf("\n", max);
  if (e < max * 0.5) e = max;
  const all = linesIn(t), from = lineOf(t, e + 1);
  return { text: t.slice(0, e), note: `(dài ${t.length.toLocaleString("vi-VN")} ký tự: đã lược dòng ${from}–${all} / ${all}, phần sau không gửi kèm)`, from, all };
}
const noticeBody = (info) => String(info || "").replace(/\n[^\S\n]*Quay trở lại[^\S\n]*\n[^]*$/, "").trimEnd();
// Technical figures, read without accents (SPEC_HIT of suppliers/config-bot.mjs).
const SPEC_HIT = /kva|xi\s?lanh|xy\s?lanh|dau\s*phat|cong\s*suat\s*(lien\s*tuc|du\s*phong)|prime|standby/g;
// The `max` characters of t with the most figures, whole lines, never fewer figures than its first `max` (as densest of
// config-bot.mjs): { text, note, hits } — note names the lines left out and their figures, "" when t fits.
function densestCut(t, max) {
  t = String(t || "");
  if (t.length <= max) return { text: t, note: "", hits: 0 };
  const f = plainVi(t), hits = [...f.matchAll(SPEC_HIT)].map((m) => m.index);
  let start = 0, most = -1;
  for (let i = 0, j = 0; i < hits.length; i++) { while (hits[i] - hits[j] > max * 0.9) j++; if (i - j + 1 > most) { most = i - j + 1; start = hits[j]; } }
  start = Math.max(0, Math.min(start - max * 0.05, t.length - max));
  if (start > 0) { const nl = t.indexOf("\n", start - 1); start = nl < 0 || nl + 1 >= t.length ? 0 : nl + 1; }
  const win = (a) => { let e = Math.min(t.length, a + max); if (e < t.length) { const nl = t.lastIndexOf("\n", e - 1); if (nl > a) e = nl + 1; } return [a, e]; };
  const count = ([a, e]) => hits.filter((h) => h >= a && h < e).length;
  const w1 = win(start), w0 = win(0), [a, e] = count(w1) > count(w0) ? w1 : w0;
  const all = linesIn(t), la = lineOf(t, a), lb = lineOf(t, e - (t[e - 1] === "\n" ? 1 : 0));
  const dropped = [...(la > 1 ? [[1, la - 1]] : []), ...(lb < all ? [[lb + 1, all]] : [])];
  const lost = hits.length - count([a, e]);
  return { text: t.slice(a, e), hits: lost, dropped, all,
    note: `đã lược dòng ${dropped.map(([x, y]) => (x === y ? `${x}` : `${x}–${y}`)).join(", ")} / ${all} (giữ ${(e - a).toLocaleString("vi-VN")} ký tự liền nhau nhiều thông số nhất; phần lược có ${lost} chỗ thông số)` };
}
// ---------- specs: a Chương V longer than one call is read in parts and joined by code (Khoa, 2026-11-12) ----------
// "Sửa triệt để, cho bot đọc chương V dài nhiều lần rồi ghép lại": the parts are whole lines of about the same size, each
// at most SPECS_BODY_MAX characters, the next one starting with the last lines of the one before (SPECS_PART_OVERLAP) so a
// table row is not split. A chapter that needs more than SPECS_PARTS_MAX parts is cut to the densest window of that
// size (densestCut, the lines left out named in the notes).
const SPECS_PART_OVERLAP = 3000, SPECS_PARTS_MAX = 25;
// t in parts: [{ text, from, to, all }] (lines, 1-based, inclusive). A line longer than half of `max` is cut in pieces.
function partsOf(t, max, overlap = SPECS_PART_OVERLAP) {
  t = String(t || "");
  const all = linesIn(t);
  if (t.length <= max) return [{ text: t, from: 1, to: all, all }];
  const L = [];
  for (const l of (t.endsWith("\n") ? t.slice(0, -1) : t).split("\n")) for (let i = 0; i < Math.max(1, l.length); i += max >> 1) L.push(l.slice(i, i + (max >> 1)));
  const len = L.map((l) => l.length + 1), total = len.reduce((a, b) => a + b, 0);
  const split = (target) => {
    const out = [];
    for (let a = 0; a < L.length;) {
      let e = a, size = 0;
      while (e < L.length && (e === a || size + len[e] <= target)) size += len[e++];
      out.push([a, e]);
      if (e >= L.length) break;
      let b = e, ov = 0;
      while (b > a + 1 && ov + len[b - 1] <= overlap) ov += len[--b];
      a = b;
    }
    return out;
  };
  const n = Math.ceil((total - overlap) / (max - overlap));
  let target = Math.min(max, Math.ceil((total + (n - 1) * overlap) / n) + 200), cuts = split(target);
  while (cuts.length > n && target < max) { target = Math.min(max, Math.ceil(target * 1.02)); cuts = split(target); }
  return cuts.map(([a, e]) => ({ text: L.slice(a, e).join("\n") + (e < L.length || t.endsWith("\n") ? "\n" : ""), from: a + 1, to: e, all: L.length }));
}
const SET_FIELDS = { qty: "số lượng", primeKva: "công suất liên tục kVA", standbyKva: "công suất dự phòng kVA", primeKw: "công suất liên tục kW", standbyKw: "công suất dự phòng kW", phases: "số pha" };
const SET_POWER = ["primeKva", "standbyKva", "primeKw", "standbyKw"];
const setLabel = (s) => { const f = SET_POWER.find((k) => s[k] != null); return f ? `${s[f]} ${/Kva$/.test(f) ? "kVA" : "kW"} ${/^prime/.test(f) ? "liên tục" : "dự phòng"}` : "không rõ cỡ"; };
const numSet = (s) => [...new Set(numsOf(s))].sort().join(",");
// generatorCapacity is free text, so two parts write the same capacity in other words. Compared by FIGURES: each number with
// its unit (kVA / kW) and kind (liên tục / dự phòng); "a – b" and "từ a đến b" are ranges that cover the figures inside.
// capFig(text) -> { pts: [{ v, u, k }], ranges: [{ lo, hi, u, k }] }.
function capFig(text) {
  const t = String(text || "").normalize("NFC"), low = t.toLowerCase();
  const prime = /liên\s*tục|prime|continuous/.test(low), stand = /dự\s*phòng|standby/.test(low), kind = prime && !stand ? "p" : stand && !prime ? "s" : "";
  const toks = [...t.matchAll(/(\d+(?:[.,]\d+)*)\s*(kva|kw|mva)?/gi)].map((m) => {
    const raw = m[1], v = /^\d{1,3}([.,]\d{3})+$/.test(raw) ? Number(raw.replace(/[.,]/g, "")) : Number(raw.replace(",", "."));
    return { v, u: (m[2] || "").toLowerCase(), at: m.index, end: m.index + m[0].length };
  });
  const link = (a, b) => /^\s*(?:-|–|—|~|đến|tới)\s*$/i.test(t.slice(a.end, b.at));
  const ranges = [];
  for (let i = toks.length - 2; i >= 0; i--) if (link(toks[i], toks[i + 1])) { if (!toks[i].u) toks[i].u = toks[i + 1].u; ranges.push({ lo: toks[i].v, hi: toks[i + 1].v, u: toks[i].u, k: kind }); }
  return { pts: toks.map((x) => ({ v: x.v, u: x.u, k: kind })), ranges };
}
const capCovers = (b, p) => b.pts.some((q) => q.v === p.v && q.u === p.u && (!q.k || !p.k || q.k === p.k)) || b.ranges.some((r) => r.u === p.u && p.v >= r.lo && p.v <= r.hi && (!r.k || !p.k || r.k === p.k));
// a: text of one part, b: text of another. same: a's figures are all in b (or b's all in a); fuller: the one to keep;
// clash: both state a figure the other does not, in the same unit (two values for one quantity: not known).
function capCompare(a, b) {
  const A = capFig(a), B = capFig(b), na = A.pts.length, nb = B.pts.length;
  if (!na || !nb) return na === nb ? { clash: normTxt(a) !== normTxt(b) } : { fuller: na ? a : b };
  const ua = A.pts.filter((p) => !capCovers(B, p)), ub = B.pts.filter((p) => !capCovers(A, p));
  if (ua.length && ub.length && ua.some((p) => ub.some((q) => q.u === p.u))) return { clash: true };
  const fuller = na !== nb ? (na > nb ? a : b) : String(a).length >= String(b).length ? a : b;
  return { fuller, partial: !!(ua.length && ub.length) };
}
// A technicalSpecs entry read in two parts under other words. The same entry when the items do not tell different things
// apart (other machine size, engine vs alternator) and with the same figures in the requirement, EITHER the quotes (one holds the other, whole words, long enough to be
// specific) OR an almost identical requirement of a few words, OR the same requirement under the same item with the size left out;
// from other parts. Doubtful: kept twice.
const SPEC_COMP = [/động cơ/, /đầu phát/, /điều khiển/, /\bats\b/, /\bmdb\b/, /hòa đồng bộ/, /ống khói/, /cách âm/, /bồn/, /ắc quy/];
const specComp = (item) => SPEC_COMP.map((r, k) => (r.test(item) ? k : "")).join("");
const sameItems = (a, b) => {
  const ca = specComp(a.item), cb = specComp(b.item);
  if (ca && cb && ca !== cb) return false;
  const na = new Set(numsOf(a.s.item)), nb = new Set(numsOf(b.s.item));
  return !(na.size && nb.size && ![...na].every((x) => nb.has(x)) && ![...nb].every((x) => na.has(x)));
};
const reqNear = (a, b) => {
  if (a.length < 25 || b.length < 25) return false;
  const ta = new Set(a.split(" ")), tb = new Set(b.split(" ")), both = [...ta].filter((x) => tb.has(x)).length;
  return both / new Set([...ta, ...tb]).size >= 0.85;
};
const itemBare = (s) => normTxt(String(s).replace(/\d[\d.,/]*\s*(?:kva|kw)?/gi, " "));
function specTwin(list, c, multi) {
  for (const e of list) {
    if (e.i === c.i || !sameItems(e, c)) continue;
    const sameNum = numSet(e.s.requirement) === numSet(c.s.requirement);
    if (!sameNum) continue; // other figures: not decided here (kept twice)
    if (e.q.length >= 25 && c.q.length >= 25 && ((" " + e.q + " ").includes(" " + c.q + " ") || (" " + c.q + " ").includes(" " + e.q + " "))) return e;
    if (reqNear(e.req, c.req)) { if (!multi || (numsOf(e.s.item).length && numsOf(e.s.item).join() === numsOf(c.s.item).join())) return e; }
    // the same item once the machine size is left out (one part names it, the other does not) and the same short requirement:
    // only in a chapter with ONE machine size, else the part that does not name it may be about another size
    if (!multi && e.req === c.req && itemBare(e.s.item) === itemBare(c.s.item)) return e;
  }
  return null;
}
// The answers of the parts joined: vals = [{ i, v }] (i the part number, v the parsed answer of Claude).
// technicalSpecs: joined, an entry read twice (same quote, or same item and requirement: the overlap) kept once; two entries
//   of the same item with other figures are both kept and marked unverified, and said in the notes.
// generatorSets: joined by size (a power both name equal, in the same field); a field the parts state differently
//   (qty, kVA, kW, phases) is left null and said in the notes, never one of the two chosen.
// generatorCapacity: the text the parts all give; else made from the joined sets; else null with a note.
function specsMerge(vals) {
  const notes = [], specs = [], byQuote = new Map(), byIR = new Map(), byItem = new Map(), sets = [], caps = [], pn = [];
  const multi = new Set(vals.flatMap(({ v }) => setsOf(v.generatorSets || []).map(setLabel))).size > 1; // more than one machine size in the chapter
  for (const { i, v } of vals) {
    for (const s of Array.isArray(v.technicalSpecs) ? v.technicalSpecs : []) {
      if (!s || typeof s !== "object") continue;
      const q = s.quote ? normTxt(s.quote) : "", item = normTxt(s.item), req = normTxt(s.requirement);
      const c = { s, i, q, item, req };
      const ok = (e) => e && sameItems(e, c) ? e : null; // the same quote under another machine size or component is another entry
      const same = ok(q && byQuote.get(q)) || byIR.get(`${item}|${req}`) || specTwin(specs, c, multi);
      if (same) {
        if (same.i !== i && !same.diff && numSet(same.s.requirement) !== numSet(s.requirement)) { same.s.unverified = true; same.diff = true; notes.push(`Mục "${String(same.s.item).slice(0, 60)}": phần ${same.i} và phần ${i} đọc khác nhau ở cùng một trích dẫn, chưa rõ.`); }
        if (q.length > same.q.length) { same.s = { ...s, ...(same.s.unverified ? { unverified: true } : {}) }; same.q = q; same.req = req; same.item = item; if (q) byQuote.set(q, same); byIR.set(`${item}|${req}`, same); } // the longer quote is kept
        continue;
      }
      const e = { s: { ...s }, i, q, item, req };
      specs.push(e);
      if (q) byQuote.set(q, e);
      byIR.set(`${item}|${req}`, e);
      const o = byItem.get(item);
      if (o && o.i !== i && numSet(o.s.requirement) !== numSet(s.requirement)) {
        o.s.unverified = e.s.unverified = true;
        notes.push(`Mục "${String(s.item).slice(0, 60)}": phần ${o.i} và phần ${i} nêu khác nhau (${String(o.s.requirement).slice(0, 50)} / ${String(s.requirement).slice(0, 50)}), chưa rõ.`);
      } else if (!o) byItem.set(item, e);
    }
    for (const x of Array.isArray(v.generatorSets) ? setsOf(v.generatorSets) : []) {
      const g = sets.find((y) => SET_POWER.some((k) => x[k] != null && x[k] === y.s[k]));
      if (!g) { sets.push({ s: { ...x }, from: Object.fromEntries(Object.keys(SET_FIELDS).filter((k) => x[k] != null).map((k) => [k, i])), bad: new Set() }); continue; }
      for (const k of Object.keys(SET_FIELDS)) {
        if (x[k] == null || g.bad.has(k)) continue;
        if (g.s[k] == null) { g.s[k] = x[k]; g.from[k] = i; }
        else if (g.s[k] !== x[k]) {
          notes.push(`Máy ${setLabel(g.s)}: ${SET_FIELDS[k]} ${g.s[k]} (phần ${g.from[k]}) khác ${x[k]} (phần ${i}), chưa rõ.`);
          g.s[k] = null; g.bad.add(k);
        }
      }
      if (!g.s.quote && x.quote) g.s.quote = x.quote;
    }
    if (v.generatorCapacity) caps.push({ i, c: String(v.generatorCapacity) });
    for (const n of [].concat(v._notes || [])) if (n && !pn.includes(String(n))) pn.push(String(n));
  }
  const generatorSets = setsOf(sets.map((g) => g.s));
  // By figures (capCompare), not by words: a part whose figures are all in another part's text adds nothing, and the fuller
  // text is kept as written. Only two values for one quantity (same unit) are not known.
  let generatorCapacity = null, clash = null;
  for (const c of caps) {
    if (!generatorCapacity) { generatorCapacity = c.c; continue; }
    if (normTxt(c.c) === normTxt(generatorCapacity)) continue;
    const r = capCompare(generatorCapacity, c.c);
    if (r.clash) { clash = c; break; }
    if (r.partial) notes.push(`Công suất tổ máy: phần ${c.i} ghi thêm "${c.c.slice(0, 60)}" (khác đại lượng), giữ câu đầy đủ hơn.`);
    generatorCapacity = r.fuller;
  }
  if (clash) {
    generatorCapacity = null;
    if (generatorSets.length) generatorCapacity = generatorSets.map((s) => `${s.qty > 1 ? `${s.qty} x ` : ""}${setLabel(s)}`).join(" + ");
    else notes.push(`Công suất tổ máy: các phần ghi khác nhau (${caps.map((c) => `phần ${c.i}: ${c.c.slice(0, 40)}`).join("; ")}), chưa rõ.`);
  }
  return { technicalSpecs: specs.map((e) => e.s), generatorSets, generatorCapacity, _notes: pn, conflicts: notes };
}
// A part with no technical specification, no set and no capacity (its answer is { _error }) adds nothing.
const specsEmpty = (v) => !v || v._error || (!(v.technicalSpecs || []).length && !(v.generatorSets || []).length && !v.generatorCapacity);
// What one part of a long Chương V asks for (the one-call prompt has none).
const partHead = (p, i, n) => `(Phần ${i}/${n} của Chương V, dòng ${p.from}–${p.to} / ${p.all}${i > 1 ? "; các dòng đầu lặp lại cuối phần trước" : ""}. Chỉ liệt kê thông số, tổ máy và công suất có trong phần này, không suy từ phần khác; "quote" chép từ phần này. Phần này không có thông số máy phát thì trả {"_error": "..."}.)`;
// Why a one-call answer (claude -p --output-format json) is not whole, or "": stopped at the output limit, or a run that
// did not complete. More than one turn (maybe a continuation after max_tokens) is only logged for now (điều phối
// 2026-11-12: no real ask run has shown num_turns yet; blocking on it could send every Phân tích to the agent).
function askCut(j) {
  if (!j) return "";
  if (j.stop_reason === "max_tokens") return "stop_reason max_tokens";
  if (j.terminal_reason && j.terminal_reason !== "completed") return `terminal_reason ${j.terminal_reason}`;
  if (j.subtype && j.subtype !== "success") return j.subtype;
  return "";
}
// One short line per ask run (indented: GenBid-Bot.ps1 copies such lines into the bot log), to decide later on num_turns.
const askTrace = (j) => `  [ask] num_turns=${j?.num_turns ?? "?"} stop_reason=${j?.stop_reason ?? "?"} terminal_reason=${j?.terminal_reason ?? "?"}${Number(j?.num_turns) > 1 ? ` — ${j.num_turns} lượt, kiểm tra` : ""}`;
// A quote counts as found when 80% of its three-word runs and all of its numbers occur in the source, compared on
// letters and digits only (pdftotext columns, " | " and line breaks differ from what the model copies).
const normTxt = (s) => String(s || "").normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const numsOf = (s) => [...String(s || "").matchAll(/\d+(?:[.,]\d+)*/g)].map((m) => m[0].replace(/[.,]/g, "")).filter((n) => n.length > 1);
function sourceOf(text) {
  const norm = normTxt(text);
  return { norm, nums: new Set(numsOf(text)), usable: norm.length > 300 };
}
function found(quote, src) {
  // Several excerpts joined by "…" are checked one by one.
  return String(quote || "").split(/\s*(?:…|\.\.\.)\s*/).filter((q) => normTxt(q)).every((q) => {
    if (!numsOf(q).every((n) => src.nums.has(n))) return false;
    const w = normTxt(q).split(" ");
    if (w.length < 3) return src.norm.includes(w.join(" "));
    let hit = 0;
    for (let i = 0; i + 3 <= w.length; i++) if (src.norm.includes(w.slice(i, i + 3).join(" "))) hit++;
    return hit / (w.length - 2) >= 0.8 || nearby(w, src.norm);
  });
}
// pdftotext -layout interleaves the columns of a table, so a real quote can come out split across lines: then 90% of
// its words must occur within a short stretch of the source around its longest word.
function nearby(w, norm) {
  const key = w.reduce((a, b) => (b.length > a.length ? b : a)), span = w.join(" ").length * 3 + 300;
  for (let p = norm.indexOf(key), n = 0; p >= 0 && n < 200; p = norm.indexOf(key, p + 1), n++) {
    const win = " " + norm.slice(Math.max(0, p - span), p + span) + " ";
    if (w.filter((x) => win.includes(" " + x + " ")).length / w.length >= 0.9) return true;
  }
  return false;
}
// Score and verdict follow from the item statuses, not from the model's own estimate: critical items count twice,
// partial counts half; a critical not_met fails, any other gap is at risk.
// extra: virtual items from the bid's self-check (selfCheckItems), counted the same way but never put in result.items.
function scoreItems(items, extra = []) {
  let got = 0, all = 0;
  items = [...items, ...extra];
  for (const i of items) { const w = i.critical ? 2 : 1; all += w; got += w * (i.status === "met" ? 1 : i.status === "partial" ? 0.5 : 0); }
  const verdict = items.some((i) => i.critical && i.status === "not_met") ? "fail" : items.some((i) => i.status !== "met") ? "at_risk" : "pass";
  return { overallScore: all ? Math.round((100 * got) / all) : 0, verdict };
}
// Gợi ý nhà cung cấp: only suppliers that were given; each reason's [n] must be a source of that supplier and its figures
// must be in those quotes or in the HSMT quote it cites; each HSMT quote must be in the tender's text.
function checkSupplier(result, dir) {
  const notes = [];
  const given = new Map(readJson(path.join(dir, "suppliers.json"), []).map((s) => [s.id, s]));
  const req = sourceOf(fs.existsSync(path.join(dir, "src-req.txt")) ? fs.readFileSync(path.join(dir, "src-req.txt"), "utf8") : "");
  const dropped = [];
  let flagged = 0;
  result.top = [].concat(result.top || []).filter((x) => given.has(x?.supplierId) || (dropped.push(String(x?.supplierId || "?")), false))
    .sort((a, b) => (a.rank || 9) - (b.rank || 9)).slice(0, 3);
  result.top.forEach((x, i) => {
    const s = given.get(x.supplierId), byN = new Map((s.sources || []).map((q) => [q.n, [].concat(q.quote).join(" | ")]));
    // A model row of a spec table counts as part of its source [n].
    for (const t of s.specTables || []) byN.set(t.n, [byN.get(t.n) || "", ...(t.header || []), ...t.rows].join(" | "));
    x.rank = i + 1;
    delete x.vietnamDistributor;
    // A suggested model must be a row of this supplier's spec tables.
    if (x.model || x.modelRow) {
      const rows = (s.specTables || []).flatMap((t) => t.rows), nm = normTxt(x.model || ""), row = x.modelRow && rows.find((r) => normTxt(r) === normTxt(x.modelRow));
      if (!row || (nm && !normTxt(row).includes(nm))) { notes.push(`${s.names?.en || s.id}: model "${x.model || ""}" không khớp dòng nào trong bảng thông số của hãng, đã bỏ.`); x.model = null; x.modelRow = null; flagged++; }
    }
    for (const y of x.reasons = [].concat(x.reasons || [])) {
      const why = [];
      const src = [].concat(y.supplierSrc || []).map(Number).filter((n) => byN.has(n));
      if (src.length < [].concat(y.supplierSrc || []).length) why.push("số nguồn không có trong hồ sơ nhà cung cấp");
      y.supplierSrc = src;
      if (y.requirementQuote && req.usable && !found(y.requirementQuote, req)) { why.push("trích HSMT không thấy nguyên văn"); y.requirementQuote = null; }
      const known = new Set([...numsOf(src.map((n) => byN.get(n)).join(" ")), ...numsOf(y.requirementQuote)]);
      const miss = numsOf(y.text).filter((n) => !known.has(n));
      if (miss.length) why.push(`số ${miss.join(", ")} không có trong nguồn dẫn`);
      if (!src.length) why.push("không dẫn nguồn của nhà cung cấp");
      if (why.length) { y.unverified = true; flagged++; notes.push(`${s.names?.en || s.id}: "${String(y.text).slice(0, 80)}" – ${why.join("; ")}.`); }
    }
  });
  for (const q of [].concat(result.requirementsUsed || [])) if (q.quote && req.usable && !found(q.quote, req)) { q.quote = null; q.unverified = true; }
  if (dropped.length) notes.unshift(`Kiểm tra tự động: bỏ ${dropped.length} gợi ý không có trong danh sách nhà cung cấp: ${dropped.join(", ")}.`);
  if (!req.usable) notes.unshift("Kiểm tra tự động: HSMT chủ yếu là bản scan, chưa kiểm được trích dẫn HSMT.");
  if (flagged) notes.unshift(`Kiểm tra tự động: ${flagged} nhận định chưa khớp nguồn (đánh dấu ⚠).`);
  result.notes = [...[].concat(result.notes || []), ...notes];
  return [];
}
// Tự kiểm chéo HSDT (Đối chiếu): findings about the bid's own consistency. Each needs a quote that is really in the
// bid's text, in the file it names when that file is one of the "--- Tệp: <name> ---" sections; a "problem" without a
// verified quote is dropped (never guessed). hsmtQuote, when given, must be in the tender's text. Does not change score.
const SELF_KINDS = ["package_identity", "model_consistency", "commitment_vs_hsmt", "row_match", "catalogue_vs_offer", "supporting_docs", "adverse_wording"];
const SELF_STATUS = ["ok", "problem", "unclear"];
function subSections(text) {
  const ms = [...String(text || "").matchAll(/^--- Tệp: (.+?) ---$/gm)];
  return ms.map((m, i) => ({ name: m[1], norm: sourceOf(text.slice(m.index + m[0].length, i + 1 < ms.length ? ms[i + 1].index : undefined)) }));
}
// A verified "problem" of the self-check counts like an item (Khoa, 2026-11-12): identity/model/catalogue/row = critical not_met,
// supporting_docs = missing, adverse_wording = partial. commitment_vs_hsmt is already an item of the table: no score, but no "pass".
const SELF_AS = { package_identity: ["not_met", true], model_consistency: ["not_met", true], catalogue_vs_offer: ["not_met", true], row_match: ["not_met", true], supporting_docs: ["missing", false], adverse_wording: ["partial", false] };
function selfCheckItems(result) {
  const probs = (result.selfChecks || []).filter((c) => c.status === "problem" && c.evidence?.length);
  return { extra: probs.filter((c) => SELF_AS[c.kind]).map((c) => ({ status: SELF_AS[c.kind][0], critical: SELF_AS[c.kind][1], self: c.kind })), commit: probs.some((c) => c.kind === "commitment_vs_hsmt") };
}
function checkSelfChecks(result, req, sub, subText) {
  const notes = [], secs = subSections(subText), kept = [];
  const nameKey = (n) => normTxt(String(n || "").replace(/^.*[\\/]/, ""));
  let dropped = 0;
  for (const c of [].concat(result.selfChecks || [])) {
    if (!c || !SELF_KINDS.includes(c.kind) || !SELF_STATUS.includes(c.status) || !String(c.finding || "").trim()) { dropped++; continue; }
    const ev = [];
    for (const e of [].concat(c.evidence || [])) {
      if (!e || !String(e.quote || "").trim() || !sub.usable) continue;
      const sec = secs.find((x) => nameKey(x.name) === nameKey(e.file));
      if (sec && sec.norm.usable && found(e.quote, sec.norm)) ev.push({ file: sec.name, quote: e.quote });
      else if (found(e.quote, sub)) ev.push({ file: sec ? sec.name : "", quote: e.quote });
    }
    c.evidence = ev;
    if (c.hsmtQuote && req.usable && !found(c.hsmtQuote, req)) c.hsmtQuote = null;
    if (!ev.length) {
      if (c.status === "problem") { dropped++; continue; }
      if (c.status === "ok") { c.status = "unclear"; c.finding = `Chưa có trích dẫn kiểm được. ${c.finding}`; }
    }
    c.fix = String(c.fix || "");
    kept.push(c);
  }
  result.selfChecks = kept;
  if (dropped) notes.push(`Kiểm tra tự động: bỏ ${dropped} phát hiện của mục Tự kiểm hồ sơ vì không thấy câu trích nguyên văn trong HSDT.`);
  if (secs.length < 2 && !result.selfCheckNote) result.selfCheckNote = "Chỉ có một tệp HSDT (hoặc chữ dán): chưa kiểm chéo được giữa các tệp.";
  return notes;
}
function checkResult(meta, result, dir) {
  if (meta.kind === "supplier") return checkSupplier(result, dir);
  const kind = meta.kind;
  const unread = readJson(path.join(dir, "src-unread.json"), {});
  const read = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), "utf8") : "");
  const req = sourceOf(read("src-req.txt")), sub = sourceOf(read("src-sub.txt"));
  const where = meta.ownReq ? "YCKT rút gọn" : "HSMT";
  const notes = [];
  if (kind === "analysis") {
    if (!req.usable) return [`Không kiểm chứng tự động được: ${where} chủ yếu là bản scan (AI đọc qua ảnh), cần đối chiếu lại với tệp gốc.`];
    const badQuote = [], badNum = [];
    for (const h of result.highlights || []) if (h.quote && !found(h.quote, req)) { badQuote.push(h.title); h.quote = null; }
    for (const s of [...(result.technicalSpecs || []), ...(result.qualificationRequirements || []), ...(result.contractTerms || [])]) {
      if (s.quote && !found(s.quote, req)) { s.quote = null; s.unverified = true; }
      const miss = numsOf(s.requirement).filter((n) => !req.nums.has(n));
      if (miss.length) { s.unverified = true; badNum.push(`${s.item || s.term || String(s.requirement || "").slice(0, 40)} (${miss.join(", ")})`); }
    }
    const tail = unread.req ? " (có thể nằm trong tệp scan chưa có chữ)" : "";
    if (badQuote.length) notes.push(`Kiểm tra tự động: ${badQuote.length} trích dẫn không thấy nguyên văn trong ${where}${tail} nên đã bỏ trích dẫn: ${badQuote.join("; ")}.`);
    if (badNum.length) notes.push(`Kiểm tra tự động: ${badNum.length} mục có con số không thấy trong ${where}${tail}, cần kiểm tra lại: ${badNum.join("; ")}.`);
    return notes;
  }
  // Đối chiếu / Đối chiếu TLKT
  const items = result.items || [];
  let reqOk = 0, subN = 0, subOk = 0;
  for (const i of items) {
    const flags = [];
    if (req.usable) {
      if (found(i.requirementQuote || i.requirement, req)) reqOk++;
      else { i.unverified = true; flags.push(`Không thấy nguyên văn yêu cầu này trong ${where}${unread.req ? " (có thể nằm trong tệp scan)" : ""}, cần kiểm tra lại.`); }
    }
    if (sub.usable && i.offered) {
      subN++;
      if (found(i.offered, sub)) subOk++;
      else if (unread.sub) flags.push("Nội dung chào không thấy nguyên văn trong phần có chữ của tài liệu (có thể nằm trong tệp scan).");
      else {
        flags.push("Nội dung chào không thấy nguyên văn trong tài liệu đã nộp.");
        if (i.status === "met" || i.status === "partial") { flags.push(`Trạng thái đổi từ "${i.status}" sang "unclear".`); i.status = "unclear"; }
      }
    } else if (!i.offered && (i.status === "met" || i.status === "partial")) {
      flags.push(`Không có trích dẫn tài liệu chào để chứng minh; trạng thái đổi từ "${i.status}" sang "unclear".`); i.status = "unclear";
    }
    if (flags.length) i.note = `⚠ ${flags.join(" ")}${i.note ? " " + i.note : ""}`;
  }
  let sc = { extra: [], commit: false };
  if (kind === "compare") { notes.push(...checkSelfChecks(result, req, sub, read("src-sub.txt"))); sc = selfCheckItems(result); }
  const base = scoreItems(items);
  Object.assign(result, scoreItems(items, sc.extra));
  if (sc.commit && result.verdict === "pass") result.verdict = "at_risk";
  delete result.selfCheckImpact;
  if (sc.extra.length || sc.commit) {
    const crit = sc.extra.filter((x) => x.critical).length, other = sc.extra.length - crit;
    result.selfCheckImpact = `Tự kiểm hồ sơ: ${[crit && `${crit} lỗi nghiêm trọng (tính như mục bắt buộc không đạt)`, other && `${other} vấn đề khác (tính như mục chưa đạt)`, sc.commit && "cam kết lệch HSMT (đã nằm trong bảng, kết luận không ở mức đạt)"].filter(Boolean).join("; ")}.` + (result.verdict !== base.verdict || result.overallScore !== base.overallScore ? ` Nếu không tính tự kiểm: ${base.overallScore} điểm.` : "");
  }
  const parts = [req.usable ? `${reqOk}/${items.length} yêu cầu thấy nguyên văn trong ${where}` : `phía yêu cầu không kiểm được (${where} là bản scan)`];
  if (sub.usable) parts.push(`${subOk}/${subN} nội dung chào thấy nguyên văn trong tài liệu đã nộp`);
  else parts.push("phía tài liệu chào không kiểm được (không có chữ)");
  result.summary = `${result.summary || ""} [Kiểm tra tự động: ${parts.join("; ")}. Điểm và kết luận tính từ trạng thái từng mục.]`.trim();
  return notes;
}
// ---------- Sync: the search's answer merged into feed/current (cut out of runSync unchanged, T5 2026-11-13) ----------
// feed: tenders of feed/current; found: { count, present: [TBMT], changed: [tender] } of search-extract.js (changed = new
// or with another sig). knownElsewhere(TBMT): seen / manual / tracked / deleted. nowMs: Date.now().
// -> { next (the new feed/current tenders, null = unchanged), fresh (new tenders to fetch), amended (notifyVersion went up:
// files fetched again, Phân tích again; Khoa, 2026-10-29), summary }.
function feedMerge(feed, found, { newOnly, knownElsewhere, nowMs }) {
  const amended = [];
  let fresh, summary;
      const inFeed = new Set(feed.map((t) => t.notifyNo));
      let next;
      if (newOnly) {
        const newest = feed.map((t) => t.publicDate || "").sort().pop() || "";
        fresh = found.changed.filter((t) => !inFeed.has(t.notifyNo) && !knownElsewhere(t.notifyNo) && (t.publicDate || "") > newest);
        next = fresh.length ? [...feed, ...fresh] : null;
        summary = fresh.length ? `${fresh.length} gói mới (${fresh.map((t) => t.notifyNo).join(", ")})` : "không có gói mới";
      } else {
        const by = new Map(found.changed.map((t) => [t.notifyNo, t]));
        const present = new Set(found.present);
        const updated = [], dropped = [];
        next = [];
        for (const t of feed) {
          if (by.has(t.notifyNo)) {
            const n = by.get(t.notifyNo);
            if (Number(n.notifyVersion) > Number(t.notifyVersion)) amended.push(n);
            next.push(n); updated.push(t.notifyNo); by.delete(t.notifyNo);
          }
          else if (present.has(t.notifyNo) || (t.bidCloseDate && Date.parse(t.bidCloseDate) > nowMs)) next.push(t);
          else dropped.push(t.notifyNo);
        }
        const added = [...by.values()];
        next.push(...added);
        fresh = added.filter((t) => !knownElsewhere(t.notifyNo));
        if (!added.length && !updated.length && !dropped.length) next = null;
        summary = [`${found.count} gói đang mở`, fresh.length ? `${fresh.length} gói mới (${fresh.map((t) => t.notifyNo).join(", ")})` : "không có gói mới",
          updated.length && `${updated.length} gói đổi thông tin`, dropped.length && `${dropped.length} gói đã đóng`,
          amended.length && `${amended.length} gói có bản sửa đổi (${amended.map((t) => `${t.notifyNo} bản ${t.notifyVersion}`).join(", ")}), tải lại tệp, cần Phân tích lại`].filter(Boolean).join(", ");
      }
  return { next, fresh, amended, summary };
}

// ---------- Gợi ý cấu hình tự động after Phân tích (cut out of autoConfigRow unchanged, T5 2026-11-13) ----------
// Why the automatic config request of a new tender is not sent: "power" (the analysis names no generator power), "service"
// (maintenance / repair / rent / supplies, not a purchase of sets: Khoa, 2026-11-12), or "" (send it). result null = no analysis.
function autoConfigSkip(bidName, result = null) {
  const texts = [bidName, result?.keyInfo?.generatorCapacity, ...(result?.generatorSets || []).map((s) => `${s.primeKva || s.standbyKva || 0} kVA ${s.primeKw || s.standbyKw || 0} kW`), ...(result?.technicalSpecs || []).map((x) => `${x.item || ""} ${x.requirement || ""}`)];
  if (result && !texts.some((t) => histPower(t).length)) return "power";
  if (isServiceTender(bidName, result)) return "service";
  return "";
}

// ---------- API key budget (the book .anthropic-api-spend.jsonl), cut out of apiBudget unchanged (T5 2026-11-13) ----------
// budgetText: .anthropic-api-budget.json ("" when none); spendText: the book ("" when none); at: the time (Date).
// settingsText (optional): .genbid-ai-settings.json, Cấu hình hệ thống on the web (settings/ai; Khoa 2026-11-13). Its
// switchAtUsd wins over the budget file; its spent {usd, at} (corrected by hand) replaces the book up to `at` when `at`
// is in this period: spent = usd + what the book has after `at`, and an "exhausted" before `at` no longer counts.
function apiBudgetOf(budgetText, spendText, at, settingsText = "") {
  let b = { monthlyUsd: 100, resetDay: 2, switchAtUsd: 90 };
  try { b = { ...b, ...JSON.parse(String(budgetText).replace(/^﻿/, "")) }; } catch {}
  const s = parseJson(settingsText);
  if (Number(s?.switchAtUsd) > 0) b.switchAtUsd = Number(s.switchAtUsd);
  const now = at;
  let since = new Date(now.getFullYear(), now.getMonth(), b.resetDay);
  if (now < since) since = new Date(now.getFullYear(), now.getMonth() - 1, b.resetDay);
  const fix = s?.spent && Number(s.spent.usd) >= 0 && new Date(s.spent.at) >= since && new Date(s.spent.at) <= now ? s.spent : null;
  const from = fix ? new Date(fix.at) : since;
  let spent = fix ? Number(fix.usd) : 0, exhausted = false;
  try { // a line that is not a JSON object (broken, or valid JSON such as "null") is skipped, the lines after it still count
    for (const l of String(spendText).split(/\r?\n/)) {
      let e; try { e = JSON.parse(l); } catch { continue; }
      if (!e || typeof e !== "object") continue;
      if (!(fix ? new Date(e.t) > from : new Date(e.t) >= from)) continue;
      spent += Number(e.usd) || 0; if (e.exhausted) exhausted = true;
    }
  } catch {}
  return { ...b, since, spent: Math.round(spent * 100) / 100, exhausted, ok: !exhausted && spent < b.switchAtUsd };
}
const parseJson = (t) => { try { const j = JSON.parse(String(t || "").replace(/^﻿/, "")); return j && typeof j === "object" ? j : null; } catch { return null; } };
// The task of a request kind in Cấu hình hệ thống: Phân tích, Đối chiếu hồ sơ (HSDT and TLKT); others have none.
const AI_TASK_OF = { analysis: "analysis", compare: "compare", tlkt: "compare" };
// "plan" when Cấu hình hệ thống says the task goes on the monthly plan; else "api" (the API key while the budget allows).
function aiUseOf(settingsText, task) {
  return task && parseJson(settingsText)?.use?.[task] === "plan" ? "plan" : "api";
}

module.exports = {
  feedMerge, autoConfigSkip, apiBudgetOf, aiUseOf, AI_TASK_OF,
  sig, isDecisionFile, HIST_PREFIX, has, GENSET_RE, PLANT_RE, SET_RE, isGenset, vnTime, histUrl, histTender,
  POWER_RE, POWER_PAIR_RE, histNum, histPower, histNeedsConfig, CONFIG_TEXT_MAX, CONFIG_KEY, configText, setsOf,
  histConfigOf, histTbmtUrl, CFG_FILE_RE, CFG_SKIP_RE, SPEC_TITLE_RE, plainVi, chapterV, specsPick, specsFinish,
  SERVICE_RE, BUY_SET_RE, isServiceTender, NOTICE_MAX, GOODS_MAX, WEBFORM_MAX, KEEP, splitSections,
  technicalOfIII, trimHsmt, compact, lineOf, linesIn, headCut, noticeBody, SPEC_HIT, densestCut,
  SPECS_PART_OVERLAP, SPECS_PARTS_MAX, partsOf, SET_FIELDS, SET_POWER, setLabel, numSet, capFig, capCovers,
  capCompare, SPEC_COMP, specComp, sameItems, reqNear, itemBare, specTwin, specsMerge, specsEmpty, partHead,
  askCut, askTrace, normTxt, numsOf, sourceOf, found, nearby, scoreItems, checkSupplier, SELF_KINDS,
  SELF_STATUS, subSections, SELF_AS, selfCheckItems, checkSelfChecks, checkResult,
};
