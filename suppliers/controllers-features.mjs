// Chức năng bộ điều khiển THEO TỪNG MODEL cho bản chuẩn (chuẩn hoá datasheet bước 4, PR G phần 1, điều phối 25/11/2026).
// Chỉ nhóm "đọc bằng từ khoá" của kiểm kê buoc-4-kiem-ke.md mục 5.3: các trường bool (có chức năng) + ba trường có mẫu số
// rõ trong câu (event_log "Event log (15)", max_sets "up to 16 generators", front_ip "IP65 ... front"). PR G phần 2 (Khoa
// 25/11/2026): trường chữ / bảng đọc theo NHÃN Ô của chính dòng (`TEXT_FEATURES`, `rowFeatures`): display, languages,
// measure_*, accuracy, operating_temp, dc_supply, dimensions, io, protections (bảng ANSI / nhãn dừng máy) và alarms (nhãn
// warning). Còn để sau: order_code, kind, governor_avr_control.
// Luật (Khoa + kiểm kê):
// - Dòng nguồn = dòng datasheet hãng (NCC role controller_maker) mà `controllerSheetFacts` (config-bot.mjs, cùng hàm
//   modelFacts dùng) gắn cho CHÍNH model đó. Dòng nêu mã BĐK khác: chữ khớp phải nằm sau tên model này (hoặc dòng chỉ nêu
//   model này), không thì bỏ.
// - Cụm chữ có ≠ có chức năng: dòng tuỳ chọn / mô-đun mở rộng / bên thứ ba, dòng phủ định, mục lục, nhật ký sửa đổi, dòng
//   nói về sản phẩm khác (mô-đun truyền thông, DSEWebNet...) KHÔNG cho giá trị (lý do ghi vào `skipped`).
// - Không có dòng thì để trống: không bao giờ ghi `false`. Không suy từ tên / số model, không lấy của model anh em.
// Không đổi config-bot.mjs / ctl-module.mjs: Gợi ý cấu hình vẫn chấm theo dòng datasheet như cũ.
import { controllerSheetFacts } from "./config-bot.mjs";
import { moduleIn } from "./ctl-module.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CAT = globalThis.GenbidCatalog;
const NFKC = (s) => String(s ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();

// Cặp (trường, dòng) đã SOÁT TAY và loại (PR G: soát hết mọi cặp từ khoá → dòng, không lấy mẫu): dòng chuẩn hoá NFKC nguyên
// văn + lý do. Từ khoá đúng chữ mà dòng không khẳng định chức năng của chính bộ điều khiển (mô-đun, mã đặt hàng, chân dự
// phòng, "CAN" động từ, biến thể khác...). Đổi `re` / SKIP thì phải soát lại các cặp mới sinh.
export const REVIEW_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "controllers-features-loai.json");
const DENY = (() => {
  const m = new Map();
  if (!fs.existsSync(REVIEW_FILE)) return m;
  for (const [fid, list] of Object.entries(JSON.parse(fs.readFileSync(REVIEW_FILE, "utf8")).rejects || {})) m.set(fid, new Set(list.map((x) => x.line)));
  return m;
})();
export const deniedOf = (fid, line) => !!DENY.get(fid)?.has(NFKC(line));

// ---------- Trường bool: từ khoá (re) + chữ loại trừ trên cùng dòng (not) ----------
// `re` khớp trên dòng đã NFKC; chỉ chữ khẳng định chức năng. Mỗi mục có tên trong kết quả để soát từng cặp (từ khoá → dòng).
export const BOOL_FEATURES = [
  { id: "auto_start_stop", re: /\bauto(?:matic)?[\s-]*start(?:ing)?\b|\bautomatic(?:ally)?\s+start(?:s|ing)?\s*(?:and|&|\/)\s*stop/i },
  { id: "mains_failure", re: /\bAMF\b|\bauto(?:matic)?\s+mains\s+(?:\(utility\)\s+)?failure|\bmains\s+(?:\(utility\)\s+)?failure\b|\butility\s+failure\b/i },
  { id: "remote_start", re: /\bremote[\s-]+start(?:ing)?\b/i },
  // "Scheduled Run PCT | (0-100)%" (SmartGen HGM9510) là ngưỡng % tải gọi tổ máy khác, không phải hẹn giờ chạy.
  { id: "scheduler", re: /\bscheduler\b|\bexerciser\b|\bscheduled\s+run(?:s|ning)?\b(?!\s*(?:PCT|%|percent))/i },
  { id: "prot_earth_fault", re: /\bearth[\s-]*fault\b|\bground[\s-]*fault\b/i },
  { id: "prot_reverse_power", re: /\breverse[\s-]*power\b|\b32R\b/i },
  { id: "prot_overcurrent", re: /\bover[\s-]*current\b|\bIDMT\b/i },
  { id: "prot_mains_decoupling", re: /\bROCOF\b|\bvector[\s-]*shift\b|\bmains\s+decoupling\b/i },
  { id: "emergency_stop", re: /\bemergency[\s-]*stop\b/i },
  { id: "ecu_support", re: /\bJ1939\b|\bECU\b|\bECM\b|\belectronic\s+engines?\b/i },
  { id: "usb", re: /\bUSB\b/i },
  { id: "rs232", re: /\bRS[\s-]?232\b/i },
  { id: "rs485", re: /\bRS[\s-]?485\b/i },
  { id: "ethernet", re: /\bethernet\b|\bRJ[\s-]?45\b/i },
  // Chữ hoa: "CAN" là cổng / bus, không phải động từ "can"; "HGM6110CAN" (tên model) không có ranh giới từ trước CAN.
  { id: "can", re: /\bCAN(?:\s*bus|open)?\b|\bCANbus\b/ },
  { id: "modbus_rtu", re: /\bmodbus[\s-]*RTU\b/i },
  { id: "modbus_tcp", re: /\bmodbus[\s-]*(?:RTU\s*\/\s*)?TCP\b|\bmodbus\s*\/\s*TCP\b/i },
  { id: "snmp", re: /\bSNMP\b/ },
  { id: "remote_monitoring", re: /\bremote\s+monitoring\b|\bSCADA\b/i },
  { id: "cellular_sms", re: /\bGSM\b|\bSMS\b|\bGPRS\b|\b[345]G\b|\bLTE\b/ },
  { id: "data_logging", re: /\bdata[\s-]*log(?:ging|ger)?\b|\bdatalog(?:ging|ger)?\b/i },
  // Tên công ty "Deep Sea Electronics PLC / plc" không tính (kiểm kê 5.1).
  { id: "plc", re: /(?<!(?:electronics|Electronics|ELECTRONICS)\s)\bPLC\b/ },
  { id: "synchronising", re: /\bsynchroni[sz](?:ing|ation|er|e|es|ed)\b|\bparallel(?:l)?ing\b/i },
  { id: "load_sharing", re: /\bload[\s-]*shar(?:e|ing)\b/i },
  { id: "load_demand", re: /\bload[\s-]*demand\b|\bload[\s-]*dependent\s+(?:start|stop)/i },
  { id: "dead_bus", re: /\bdead[\s-]*bus\b/i },
  { id: "ul", re: /\bUL\s?(?:listed|recogni[sz]ed|6200|508|certified)\b|\bcULus\b|\bUL\s+certification\b/ },
];

// ---------- Trường có mẫu số trong câu ----------
// event_log: số sự kiện của nhật ký; max_sets: số tổ máy hoà tối đa; front_ip: mã IP của mặt trước.
export const NUM_FEATURES = [
  { id: "event_log", read: (l) => {
    const out = [];
    for (const m of l.matchAll(/\bevent\s+log(?:ging)?\s*\((\d{1,5})\)/gi)) out.push(Number(m[1]));
    for (const m of l.matchAll(/\b(?:event|history|alarm)\s+(?:log|record|history)s?\b[^.;|]{0,40}?\bup\s+to\s+(\d{1,5})\b/gi)) out.push(Number(m[1]));
    for (const m of l.matchAll(/\b(?:up\s+to\s+)?(\d{1,5})\s+(?:events?|event\s+records?)\b[^.;|]{0,20}?\blog/gi)) out.push(Number(m[1]));
    return out;
  } },
  { id: "max_sets", read: (l) => {
    const out = [];
    // "up to 256 generators and/or bus tie breakers" đếm cả máy cắt nối thanh cái: không phải số tổ máy.
    for (const m of l.matchAll(/\bup\s+to\s+(\d{1,3})\s+(?:gen[\s-]?sets|generators|generating\s+sets|sets)\b(?!\s*(?:and\s*\/\s*or|or)\s+(?:bus|BTB))/gi)) out.push(Number(m[1]));
    return out;
  } },
  { id: "front_ip", read: (l) => {
    if (!/\bfront\b|\bfascia\b|\bgasket\b/i.test(l) || /\brear\b|\bback\b|\bterminal/i.test(l)) return [];
    return [...l.matchAll(/\bIP\s?([2-6][0-9])\b/g)].map((m) => `IP${m[1]}`);
  } },
];

// ---------- Dòng không cho giá trị ----------
// Thứ tự: lý do đầu tiên khớp được ghi lại.
const SKIP = [
  // Mục lục: hàng chấm / dấu ba chấm dẫn tới số trang.
  ["muc-luc", /\.{4,}|…{2,}|(?:\.\s){4,}|·{4,}/],
  // Nhật ký sửa đổi của tài liệu.
  ["nhat-ky-sua", /^\|?\s*(?:(?:rev(?:ision)?\.?\s*)?\d+(?:\.\d+)?\s*\|\s*)?(?:\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\s*\|\s*)?(?:added|removed|updated|amended|corrected|deleted|modified|changed|new\s+(?:feature|section|parameter))\b/i],
  // Tuỳ chọn, mô-đun mở rộng, bên thứ ba, thiết bị ngoài.
  ["tuy-chon", /\boption(?:s|al|ally)?\b|\bopt\.|\bextend|\bexpansion\b|\bextension\b|\bplug[\s-]?in\b|third[\s-]party|\bexternal\b|\badd[\s-]?on\b|\baccessor(?:y|ies)\b|\bif\s+(?:fitted|equipped|installed|available|supported)\b|\bwhen\s+(?:fitted|equipped|installed)\b|\bdepend(?:s|ing)?\s+on\b|\brequire[sd]?\b/i],
  // Phủ định.
  ["phu-dinh", /\bnot\b|\bno\b|\bnon[\s-]|\bwithout\b|\bunavailable\b|\bunsupported\b|\bdisabled?\b|\bn\/a\b|不支持|没有|无此/i],
  // Chỉ một biến thể ("Only Link LTE", "Only GC400x. CAN 1 ERR-ACTIVE", "(Only available for HGM9520N)"): không biết của model nào.
  ["chi-bien-the", /\bonly\b|\bexcept\b|仅/i],
  // Tham số tắt / không hoạt động ("0: The J1939 port is inoperative.", "168 = exerciser off", "If this parameter is 0 then ...").
  ["tham-so-tat", /\binoperative\b|\binactive\b|=\s*[\w\s]{0,20}\boff\b|\bif\s+this\s+parameter\s+is\s+0\b/i],
  // Rác bố cục: ô địa chỉ / điện thoại / tên nước dính vào dòng ("| China | Reverse Power", "| Tel.: +86 … | Earth fault"), đầu /
  // chân trang ("InteliLite 4 AMF 20 Datasheet | 2", "Page 49", "Version: 1.0"). Dòng đó không phải câu chức năng (soát PR G).
  ["bo-cuc", /\bTel\.?\s*:|\bFax\s*:|\bE-?mail\s*:|\bwww\.|\+\d{2}[\s\d-]{6,}|\|\s*(?:China|Germany|USA|Denmark|Italy|India|Japan|Turkey|United Kingdom|UK|North & Central America|South America|Europe|Asia|Middle East|Africa)\s*(?:\||$)|\bdatasheet\s*\|\s*\d{1,3}\s*$|\bPage\s+\d+\b|\bVersion\s*:|\bDate of issue\b/i],
  // Rung / va đập "3G in X, Y and Z axes": gia tốc, không phải mạng di động.
  ["khong-phai-chuc-nang", /\bvibration\b|\bshock\b|\bacceleration\b/i],
  // Sản phẩm khác: mô-đun truyền thông (danh sách ctl-module.mjs), cổng / phần mềm / dịch vụ giám sát của hãng.
  ["san-pham-khac", /\bmodule\s+(?:with|for)\b|\bInteli\s?(?:AIN|AIO|IO\d|Gateway|Vision|Monitor|ATS|Display)|\bI-(?:AIN|AIO|AOUT|CB|LB|RD)\b|DSEWebNet|WebSupervisor|InteliMonitor|InternetBridge|\bIB-?(?:NT|COM|Lite)\b|\bIG-?IB\b|\bCM-|\bCM\d-|\bDSE\s?(?:2\d{3}|8[59]\d)\b|\bconverter\b|\bgateway\b|\brouter\b|\bmodem\b|\bsmartphone\b|\bapp\b|\bSmartGen\s+(?:cloud|platform)|\bcloud\b/i],
];
// A line → the reason it gives no value, or null.
export function skipOf(line) {
  const l = NFKC(line);
  if (moduleIn(l).length) return "san-pham-khac";
  for (const [why, re] of SKIP) if (re.test(l)) return why;
  return null;
}

// ---------- Model của từng đoạn trong dòng ----------
// Tên BĐK nêu trong dòng, theo vị trí: CAT.controllersIn + dạng gộp "HGM6110N/6120N/6110NC" + "DSE6010/20 MKII" (như ctlNames
// của config-bot.mjs). Tên họ (HGM6100N SERIES, easYgen-3000 Series) không tính.
const family = (k) => /^HGM\d{2}00/.test(k) || /^EASYGEN\d000$/.test(k);
export function mentionsOf(line) {
  const l = String(line), out = [];
  for (const c of CAT.controllersIn(l).filter((x) => x.model)) {
    const k = CAT.keyOf(c.model);
    let from = 0, i;
    while ((i = l.indexOf(c.text, from)) >= 0) { out.push({ pos: i, end: i + c.text.length, keys: [k] }); from = i + c.text.length; }
  }
  for (const m of l.matchAll(/\bHGM\s?(\d{4}[A-Z]{0,4})((?:\s?\/\s?\d{4}[A-Z]{0,4})+)/gi)) out.push({ pos: m.index, end: m.index + m[0].length, keys: [m[1], ...m[2].split("/")].map((x) => x.trim()).filter(Boolean).map((c) => CAT.keyOf(`HGM${c}`)) });
  for (const m of l.matchAll(/\bDSE\s?(\d{2})(\d{2})((?:\s?\/\s?\d{2}(?!\d))+)(\s*MK\s?I{2,3})?/gi)) {
    const gen = m[4] ? m[4].replace(/\s+/g, "").toUpperCase() : "";
    out.push({ pos: m.index, end: m.index + m[0].length, keys: [m[2], ...m[3].split("/").map((x) => x.trim()).filter(Boolean)].map((c) => CAT.keyOf(`DSE${m[1]}${c}${gen}`)) });
  }
  return out.map((x) => ({ ...x, keys: x.keys.filter((k) => !family(k)) })).filter((x) => x.keys.length).sort((a, b) => a.pos - b.pos);
}
// Does a mention key name `model` (a key of the sheet)? "DSE7320" written without its generation is the sheet's DSE7320 MKII.
const names = (k, model) => k === model || new RegExp(`^${k}MK(?:II|III)$`).test(model);
// Is the text at `pos` of `line` about `model`? No model named: yes (controllerSheetFacts gave the line to it). Otherwise the
// nearest name before `pos` must be this model; text before every name only when every name of the line is this model.
export function ownerOK(line, model, pos, ms = mentionsOf(line)) {
  if (!ms.length) return true;
  const before = ms.filter((m) => m.end <= pos || m.pos <= pos).pop();
  if (before) return before.keys.some((k) => names(k, model));
  return ms.every((m) => m.keys.every((k) => names(k, model)));
}

// ---------- Tờ viết chung cho nhiều biến thể (soát PR G của điều phối, 25/11/2026) ----------
// (a) Câu phân biệt biến thể trong tờ: "HGM6110NC/6120NC has RS485 port, HGM6110N/6120N without." → chức năng đó chỉ của biến thể
//     câu nêu là có; biến thể khác (kể cả biến thể câu không nhắc) không nhận từ tờ này.
// (b) Dòng bảng so sánh ●/— ("| CAN (J1939) | ● | ●"): ô trống bị bỏ khi dàn phẳng nên chỉ định vị được cột khi số ô bằng số model
//     của dòng tiêu đề bảng gần nhất phía trên ("| Items | HGM7220 | HGM7210 | HGM7220CAN | HGM7210CAN"); khi đó lấy đúng cột của
//     model. Không có tiêu đề nêu model: chỉ nhận khi mọi ô có và số ô bằng số ô lớn nhất của bảng. Tiêu đề vỡ ("| Item | HGM"): bỏ.
// (c) Tờ mà khoá model gộp hai biến thể khác chức năng ("HGM93XX MPU(CAN)": HGM9310 là cả 9310MPU lẫn 9310CAN, chỉ bản CAN có
//     J1939): trường của chức năng đó không ghi.
const PORT_FIDS = { RS485: ["rs485"], RS232: ["rs232"], CAN: ["can", "ecu_support"], ETHERNET: ["ethernet"], USB: ["usb"], GSM: ["cellular_sms"] };
// Woodward easYgen-1000: "| … | Model | easYgen-1400 | … | easYgen-1800" stands 67 rows above "| RS485 | — | 1 | 1 | 1".
const HEADER_SPAN = 100;
const MARK = /^(?:●|○|◎|✓|√|✔|×|✗|Χ|—|–|-|\d{1,2}|Yes|No|N\/A)$/i, MARK_SYM = /[●○◎✓√✔×✗Χ—–]/, POS = /^(?:●|✓|√|✔|Yes|[1-9]\d?)$/i;
export function presenceOf(row) {
  const cells = CAT.cellsOf(row);
  if (cells.length < 2) return null;
  const marks = cells.slice(1);
  return marks.every((c) => MARK.test(c)) && marks.some((c) => MARK_SYM.test(c)) ? marks : null;
}
const keysIn = (cell) => mentionsOf(cell).flatMap((m) => m.keys);
export function sheetCtx(t, models = []) {
  const rows = t.rows || [], restrict = new Map(), block = new Set();
  const own = (k) => models.filter((m) => names(k, m));
  for (const r of rows) {
    const m = NFKC(r).match(/^(?:NOTE\s*\d*\s*:\s*)?(.+?)\s+has\s+(RS-?485|RS-?232|CAN|ETHERNET|USB|GSM)\s+port\s*,\s*(.+?)\s+without\.?$/i);
    if (!m) continue;
    const have = keysIn(m[1]).flatMap(own);
    for (const fid of PORT_FIDS[m[2].replace("-", "").toUpperCase()]) restrict.set(fid, new Set([...(restrict.get(fid) || []), ...have]));
  }
  if (/MPU\s*\(CAN\)/i.test(t.title || "")) for (const fid of PORT_FIDS.CAN) block.add(fid);
  // (d) "(controller with CAN Bus port only)" (SmartGen HGM7200, PR G phần 2 theo yêu cầu Khoa 25/11/2026): chức năng của cổng
  //     đó chỉ của biến thể mà tên model mang đúng tên cổng ở đuôi (HGM7210CAN / HGM7220CAN); biến thể khác không nhận. Chỉ áp
  //     khi tờ có cả biến thể có đuôi lẫn không đuôi.
  for (const r of rows) {
    const m = NFKC(r).match(/\(controller with (CAN\s*Bus|CANBUS|RS-?485|RS-?232|GSM|USB|Ethernet) port only\)/i);
    if (!m) continue;
    const tok = m[1].replace(/[\s-]/g, "").toUpperCase().replace("CANBUS", "CAN");
    const have = models.filter((x) => x.endsWith(tok));
    if (!have.length || have.length === models.length) continue;
    for (const fid of PORT_FIDS[tok]) restrict.set(fid, new Set([...(restrict.get(fid) || []), ...have]));
  }
  // (e) Cột "<model> Unique Features" (Woodward easYgen-1000: "| easYgen-1400 / … | easYgen-1800 | easYgen-1800 Unique Features"):
  //     các mục "✓ …" ngay dưới (kể cả dòng nối không có "|" / bullet) là của model đó MỘT mình. Mỗi mục đọc thành một câu nối
  //     (src.row … src.rowEnd); model khác không nhận gì từ các dòng này.
  const columns = [];
  rows.forEach((r, i) => {
    const cells = CAT.cellsOf(r), u = cells.findIndex((c) => /\bUnique Features$/i.test(NFKC(c)));
    if (u < 0) return;
    const owner = [...new Set(keysIn(cells[u].replace(/\s*Unique Features$/i, "")).flatMap(own))];
    if (owner.length !== 1) return;
    let cur = null;
    for (let j = i + 1; j < Math.min(rows.length, i + 40); j++) {
      const s = NFKC(rows[j]);
      if (/^(?:\|\s*)?✓/.test(s)) { cur = { owner: owner[0], from: j, to: j }; columns.push(cur); continue; }
      if (cur && cur.to === j - 1 && s && !/^[|•✓♦]/.test(s)) { cur.to = j; continue; }
      break;
    }
  });
  const columnOf = (i) => (i == null ? null : columns.find((c) => i >= c.from && i <= c.to) || null);
  const header = rows.map((r) => {
    const cells = CAT.cellsOf(r);
    const codes = cells.map((c) => { const k = keysIn(c); return k.length === 1 ? k[0] : null; });
    if (codes.filter(Boolean).length >= 2) return { codes: codes.filter(Boolean) };
    if (cells.length >= 2 && /^(?:items?|models?|module|functions?|features?)$/i.test(cells[0]) && !presenceOf(r)) return { broken: true };
    return null;
  });
  const widest = Math.max(0, ...rows.map((r) => presenceOf(r)?.length || 0));
  // A ●/— row under a header naming the sheet's models that does not say yes for every one of them ("| CAN (J1939) | ● | ●" of
  // four; "| RS485 | — | 1 | 1 | 1"): that function differs by variant, so the sheet's other lines (pin tables, "Engine type:
  // Common J1939") say nothing about which variant has it. Only the models whose own column says yes keep it (none when the
  // column cannot be found).
  rows.forEach((r, i) => {
    const marks = presenceOf(r);
    if (!marks) return;
    let h = null;
    for (let j = i - 1; j >= Math.max(0, i - HEADER_SPAN) && !h; j--) h = header[j];
    // Columns that are not models (DEIF: application / option columns of one controller): only that row is dropped (presence).
    if (!h?.codes || !h.codes.some((k) => own(k).length)) return;
    if (marks.length === h.codes.length && marks.every((x) => POS.test(x)) && models.every((m) => h.codes.some((k) => names(k, m)))) return;
    const yes = marks.length === h.codes.length ? h.codes.filter((k, c) => POS.test(marks[c])).flatMap(own) : [];
    const label = NFKC(CAT.cellsOf(r)[0]);
    for (const f of BOOL_FEATURES) if (f.re.test(label)) restrict.set(f.id, new Set([...(restrict.get(f.id) || []), ...yes]));
  });
  // → true (this model's column says yes), false (no, or the column cannot be found), null (not a ●/— row).
  const presence = (i, model) => {
    const marks = i == null ? null : presenceOf(rows[i]);
    if (!marks) return null;
    for (let j = i - 1; j >= Math.max(0, i - HEADER_SPAN); j--) {
      const h = header[j];
      if (!h) continue;
      if (h.broken || marks.length !== h.codes.length) return false;
      const c = h.codes.findIndex((k) => names(k, model));
      return c >= 0 && POS.test(marks[c]);
    }
    return marks.length === widest && marks.every((x) => POS.test(x));
  };
  // The cell of `model`'s column in row i ("| Digital Input Port | 7 | 7 | 7 | 7" under "| Items | HGM7220 | …"): undefined = no
  // header of models above (not a column row), null = header found but the column cannot be located (cell count ≠ model count).
  const colCell = (i, model) => {
    if (i == null) return undefined;
    const cells = CAT.cellsOf(rows[i]);
    for (let j = i - 1; j >= Math.max(0, i - HEADER_SPAN); j--) {
      const h = header[j];
      if (!h) continue;
      if (h.broken || !h.codes.some((k) => own(k).length)) return undefined;
      if (cells.length - 1 !== h.codes.length) return null;
      const c = h.codes.findIndex((k) => names(k, model));
      return c >= 0 ? cells[c + 1] : null;
    }
    return undefined;
  };
  return { restrict, block, presence, columns, columnOf, colCell };
}

// ---------- Trường chữ / bảng: đọc theo nhãn ô của chính dòng (PR G phần 2, Khoa 25/11/2026) ----------
// Dòng "| Nhãn | giá trị" (hoặc "Nhãn: giá trị"): nhãn phải khớp TRỌN nhãn của trường, giá trị là ô NGAY SAU nhãn và phải có
// đúng dạng (số + đơn vị). Không đọc dòng mà nhãn và giá trị nằm khác dòng (DSE "OPERATING TEMPERATURE RANGE" rồi số ở dòng
// khác), không ghép ô của cột khác. Giá trị có điều kiện (for / when / if / only / option / SW key / tên model khác trong ô)
// hoặc dòng sau bắt đầu bằng "for …" ("-40˚C to +70˚C" + "for Low Temp. version") thì bỏ: không biết của biến thể nào.
const LANGS = "English|Chinese|Spanish|Russian|Portuguese|Turkish|Polish|French|German|Italian|Arabic|Persian|Farsi|Japanese|Korean|Vietnamese|Thai|Indonesian|Czech|Romanian|Greek|Dutch|Swedish|Finnish|Hungarian|Bulgarian|Ukrainian|Hebrew|Malay";
const LANG_LIST = new RegExp(`\\b(?:${LANGS})\\b(?:\\s*(?:,|/|、|\\band\\b|\\bor\\b)\\s*(?:\\b(?:${LANGS})\\b))+`, "i");
// Value text as the source writes it (no NFKC: "(-25~+70)ºC" stays ºC), bullets cut, a minus before a figure kept, the sentence
// after ". " ("-20 to +65 °C (-4 to +149 °F). To IEC 60068-2-1, 2") cut.
const tidy = (s) => String(s ?? "").replace(/\s+/g, " ").trim().replace(/^(?:[•♦▪>✓*]|[-–—](?!\s?\d)|\s)+/, "").split(/(?<=[A-Za-z0-9)]{2})\.\s+(?=[A-Z])/)[0].replace(/[\s;,.:]+$/, "").trim();
// A value cut by the layout: ends on a word that needs more ("±1 % of nominal from 2 to").
const DANGLING = /\b(?:to|from|and|or|of|with|in|at|the|for|by)$/i;
const balanced = (s) => (s.match(/\(/g) || []).length === (s.match(/\)/g) || []).length;
const COND = /\b(?:for|when|if|only|except|unless|option(?:al)?|with\s+option)\b|\bSW\s*key\b|\bdepend/i;
// "8 V to 35 V DC", "DC8.0V to 35.0V", "7...32 Vdc", "8-36 V DC"; or a nominal voltage ("12 V DC or 24 V DC", "12/24 V DC").
const V_RANGE = /\d+(?:[.,]\s?\d+)?\s*V?\s*(?:DC)?\s*(?:-|–|to|~|÷|…|\.{2,3})\s*(?:DC\s*)?\d+(?:[.,]\s?\d+)?\s*V|\b\d{1,2}\s*(?:V\s*DC\s*(?:or|\/)\s*\d{1,2}\s*)?V\s*DC\b/i;
const HZ_RANGE = /\d+(?:\.\d+)?\s*(?:Hz)?\s*(?:-|–|to|~|\/)\s*\d+(?:\.\d+)?\s*Hz/i;
const DIMS3 = /\d+(?:\.\d+)?\s*(?:mm)?\s*(?:\(\w\))?\s*[x×X*]\s*\d+(?:\.\d+)?\s*(?:mm)?\s*(?:\(\w\))?\s*[x×X*]\s*\d+(?:\.\d+)?\s*(?:mm)?\s*(?:\(\w\))?/;
const QTY = /^(voltage|current|frequency|power|ac[\s-]?measurement|measurement)\s+accuracy$/i;
// Section line above row i (no "|", no digit, short): DSE "Voltage Measurement", "Digital Inputs"; Datakom "Accuracy:".
export function sectionOf(rows, i, span = 12) {
  for (let j = i - 1; j >= Math.max(0, i - span); j--) {
    const s = NFKC(rows[j]);
    if (!s.includes("|") && /^[A-Za-z][A-Za-z ()/&.,'-]{2,48}:?$/.test(s) && s.split(" ").length <= 6) return { row: j, text: s.replace(/:$/, "") };
  }
  return null;
}
const IO_KIND = (s) => {
  const t = NFKC(s).toLowerCase();
  if (/^(?:number of\s+)?(?:digital|binary|configurable digital|discrete)\s+inputs?(?:\s+ports?)?$/.test(t)) return "digital_in";
  if (/^(?:number of\s+)?(?:digital|binary|relay|configurable digital)\s+outputs?(?:\s+ports?)?$/.test(t)) return "digital_out";
  if (/^(?:number of\s+)?analog(?:ue)?\s+inputs?(?:\s+ports?)?$/.test(t)) return "analogue_in";
  if (/^(?:number of\s+)?analog(?:ue)?\s+outputs?(?:\s+ports?)?$/.test(t)) return "analogue_out";
  return null;
};
// Labelled fields: label = the whole label text; val(value, { label, section }) → the value to keep or null.
export const TEXT_FEATURES = [
  { id: "dc_supply", label: /^(?:continuous voltage(?: rating)?|power supply(?: range)?|dc supply range|(?:working|operating) voltage|supply voltage(?: range)?|battery voltage range)$/i,
    val: (v) => (V_RANGE.test(v) && /DC|continuous|uninterrupt/i.test(v) && !/pk|peak|\bAC\b|VAC|mA\b/i.test(v) ? v : null) },
  { id: "operating_temp", label: /^(?:operating|working)\s+temp(?:erature|\.)?(?:\s+range)?(?:\s*\(incl\.?\s*display\)?)?$|^operating conditions?\s+temperature$/i,
    val: (v) => (/[-−]\s?\d/.test(v) && /\d\s?[^\d\s]{0,3}\s?C\b/.test(v) && /\bto\b|~|–|\d\s?-\s?\+?\d/.test(v) ? v : null) },
  { id: "dimensions", label: /^(?:(?:overall|case|outline|module|unit|external)\s+)?dimensions?(?:\s*\(W\s*x\s*H\s*x\s*D\))?$|^overall(?:\s*\(W\s*x\s*H\s*x\s*D\))?$|^size$/i,
    val: (v) => (DIMS3.test(v) && /mm/i.test(v) ? v : null) },
  { id: "display", label: /^(?:display(?:\s+type)?|lcd|screen|type|resolution)$/i,
    val: (v, { label }) => {
      if (/^resolution$/i.test(label)) return /\b\d{2,4}\s*[x×]\s*\d{2,4}\s*(?:px|pixels?)\b/i.test(v) ? v : null;
      if (/^type$/i.test(label)) return /\b(?:LCD|TFT|STN|OLED|monochrom\w*|display)\b/i.test(v) ? v : null;
      return /\b(?:LCD|TFT|STN|OLED|monochrom\w*|colou?r|graphic(?:al)?|backlight\w*|transflective|pixels?|px)\b/i.test(v) ? v : null;
    } },
  { id: "measure_voltage", label: /^(?:voltage range|(?:ac\s+)?(?:voltage\s+)?measurement range|(?:ac\s+)?voltage measurement(?: range)?|3P4W|3P3W|1P2W|2P3W|3-phase 4-wire|3-phase 3-wire|single-phase 2-wire|2-phase 3-wire)$/i,
    val: (v, { label }) => {
      if (!/\d\s*k?V(?:AC)?\b|AC\s?\d+\s?V/i.test(v) || /pk|peak|\bDC\b|VDC|mV|\d\s*A\b/i.test(v)) return null;
      return /^(?:3P4W|3P3W|1P2W|2P3W|3-phase|single-phase|2-phase)/i.test(label) ? `${label}: ${v}` : v;
    } },
  { id: "measure_current", label: /^(?:current range|(?:ac\s+)?(?:current\s+)?measurement range|(?:ac\s+)?current measurement(?: range)?|c\.?\s?t\.?\s+secondary(?:\s+(?:current|rating))?|nominal ct secondary rating)$/i,
    val: (v) => (/\d\s*A\b/.test(v) && !/mA|\bV\b|kA|\d\s*V/i.test(v) ? v : null) },
  { id: "measure_frequency", label: /^(?:frequency range|frequency measurement(?: range)?|(?:ac\s+)?(?:alternator|generator)(?: input)? frequency|alternator input range)$/i,
    val: (v, { section }) => (HZ_RANGE.test(v) && !/kHz|rpm|pk/i.test(v) && !/pick-?up|MPU|speed/i.test(section?.text || "") && Math.max(...(v.match(/\d+(?:\.\d+)?/g) || [0]).map(Number)) <= 1000 ? v : null) },
  { id: "accuracy", label: /^(?:(?:voltage|current|frequency|power|ac[\s-]?measurement|measurement)\s+)?accuracy$|^(?:voltage|current|frequency|power)$/i,
    val: (v, { label, section }) => {
      if (!/\d/.test(v) || /uA|μA|µA|Ω|ohm|rpm|^R\s*:/i.test(v) || !/±|%|\bdigit/i.test(v)) return null;
      // Another label inside the value ("| Voltage Accuracy | Humidity: max. 93%"): a cell of another column.
      if (/[A-Za-z]{3,}\s*:/.test(v.replace(/^[UI]\s*:/, ""))) return null;
      // The value names the measured quantity itself (ComAp "U: 1 % from value ±100 mV", "1 % of 277 V", "2 % of 1 A / 5 A").
      const self = /^[UI]\s*:\s*\d/.test(v) || /\bof\s+\d+(?:\.\d+)?\s*(?:V|A)\b|CT error/i.test(v);
      if (self && /^accuracy$/i.test(label)) return /^(?:voltage|current) measurement$/i.test(section?.text || "") ? `${section.text}: ${v}` : v;
      // Accuracy of an output (DEIF "Speed governor output" → "| Voltage accuracy | ±1% of setting value"): not a measurement.
      if (/governor|\bAVR\b|regulator|output|PWM|analog(?:ue)? input/i.test(section?.text || "")) return null;
      const sec = /\b(?:voltage|current|frequency)\b.*\bmeasurements?$/i.test(section?.text || "") ? section.text : null;
      if (/^(?:voltage|current|frequency|power)$/i.test(label)) return /^accuracy$/i.test(section?.text || "") ? `${label}: ${v}` : null;
      if (/^measurement accuracy$/i.test(label) && sec) return `${sec}: ${v}`;
      if (QTY.test(label)) return `${label}: ${v}`;
      if (sec && (/^±?\s?\d+(?:\.\d+)?\s?%/.test(v))) return `${sec}: ${v}`;
      if (/^[UI]\s*:\s*\d/.test(v) || /\bof\s+(?:\d+(?:\.\d+)?\s*(?:V|A)\b|nominal)|CT error/i.test(v)) return v;
      return null;
    } },
];
// ANSI device numbers of protective functions (IEEE C37.2): 12 overspeed, 14 underspeed, 21 distance, 24 V/Hz, 27 under-
// voltage, 32 power, 37 under-current / power, 40 field loss, 46 negative sequence current, 47 phase sequence / voltage
// unbalance, 49 thermal, 50 / 51 over-current, 59 over-voltage, 64 earth, 67 directional, 78 vector shift / out of step, 81
// frequency, 87 differential. Rows of a "protections" / "ANSI" table whose code is another device (1 master, 25 sync check, 30
// annunciator, 48 incomplete sequence, 52 breaker, 55 power factor, 63 pressure switch, 71 level, 79 reclosing, 83 transfer)
// are functions or events of the sequence, not protections of the set.
const ANSI_CODE = /^(?:ANSI\s*)?(\d{2}[A-Z]{0,4}(?:\s*\/\s*\d{2}[A-Z]{0,4})*)$/;
const ANSI_PROT = /^(?:12|14|21|24|27|32|37|40|46|47|49|50|51|59|64|67|78|81|87)/;
// The table must say its codes are ANSI (ComAp "Support of functions and protections as defined by ANSI", DEIF "| ANSI | Operate"):
// a number column of another table (SmartGen "| 6 | Warning | (0-60)°C | 40", Woodward "| 50 | 50 | 99") is not a code.
const PROT_TABLE = /\bANSI\b/;
const NOT_PROT = /shedding|load shed|sequence relay|master|device|\brelay\b|switch|contactor|matching|starting|check\b|regulat|communication|\bAGC\b|terminals?\b|mm2|\bAWG\b|warning|alarm|\d{8,}-\d/i;
// A protection name (not a stray cell: "| Generator | 50" is the first half of "Generator overcurrent").
const PROT_WORD = /over|under|reverse|fault|unbalance|asymmetr|sequence|loss|excitation|rocof|df\/dt|vector|overload|failure|voltage|current|frequency|power|temperature|thermal|restrain|controlled|battery|supply|speed/i;
// Datakom manual: "LOW BATTERY VOLTAGE (warning): …", "START FAIL (alarm): …", "OVERLOAD (load_dump): …". The manual defines
// ALARMS (stop the engine immediately) and LOAD_DUMPS (stop after cooldown) as fault conditions that stop the set, WARNINGS as
// indication only: (warning) → alarms, (alarm) / (load_dump) → protections. A name without a tag is not classified.
const TAGGED = /^([A-Z][A-Z0-9 /&_.-]{2,40}?)\s*\((warning|alarm|load_dump)\)\s*:/;

// Every (label, value, pos) pair of a row: consecutive cells ("| Continuous Voltage | Rating | 8 V to 35 V DC") and "label: value"
// inside one cell ("Operating temp.: -40C …", "| Supply voltage | GC315 Link: 8-32V DC").
function pairsOf(l) {
  const out = [], cells = CAT.cellsOf(l), at = (c, from) => Math.max(0, l.indexOf(c, from));
  if (!l.trim().startsWith("|")) {
    if (cells.length >= 2) out.push({ label: cells[0], value: cells[1], pos: at(cells[1]) });
    return out;
  }
  let from = 0;
  const pos = cells.map((c) => { const p = at(c, from); from = p + c.length; return p; });
  for (let v = 1; v < cells.length; v++) for (let k = Math.max(0, v - 2); k < v; k++) out.push({ label: cells.slice(k, v).join(" "), value: cells[v], pos: pos[v], first: k === 0 });
  cells.forEach((c, i) => { const m = c.match(/^([^:：]{2,60})[:：]\s*(.+)$/); if (m) out.push({ label: (i ? `${cells[i - 1]} ` : "") + m[1], value: m[2], pos: pos[i] + c.indexOf(m[2]) }, { label: m[1], value: m[2], pos: pos[i] + c.indexOf(m[2]) }); });
  return out;
}
// A value cell that starts with a model ("HGM9420N: (-25~+70)°C", "easYgen-1700/1800: 237 x 172 x 45 mm"): that prefix is cut;
// the owner check (ownerOK at the value) keeps it for that model only. Any other model named inside the value: dropped.
function ownValue(v, model) {
  const t = tidy(v), ms = mentionsOf(t);
  if (!ms.length) return t;
  const m = t.match(/^([^:]{2,40}):\s*(.+)$/);
  if (m && ms.every((x) => x.end <= m[1].length) && ms.some((x) => x.keys.some((k) => names(k, model)))) return tidy(m[2]);
  return null;
}
// One row of `model`'s sheet → [{ fid, value, kw }] for the text / table fields. rows + i give the neighbours (section line above,
// qualifier line below, column header for "| Digital Input Port | 7 | 7 | 7 | 7").
export function rowFeatures(rows, i, model, { mustName = false, ctx = null, line = null } = {}) {
  const l = String(line ?? rows[i]).replace(/\s+/g, " ").trim(), out = [];
  const why = skipOf(l);
  if (why && ["muc-luc", "nhat-ky-sua", "bo-cuc"].includes(why)) return out;
  if (ctx?.presence(i, model) === false) return out;
  const ms = mentionsOf(l);
  if (mustName && !ms.some((m) => m.keys.some((k) => names(k, model)))) return out;
  const next = line == null && i + 1 < rows.length ? NFKC(rows[i + 1]) : "";
  const qualified = /^(?:for|only|when|if|except|to|and|or|of|from)\b/i.test(next) && !next.includes("|");
  const section = line == null ? sectionOf(rows, i) : null;
  const add = (fid, value, kw, pos) => {
    if (deniedOf(fid, l) || !ownerOK(l, model, pos, ms)) return;
    if (!out.some((x) => x.fid === fid && JSON.stringify(x.value) === JSON.stringify(value))) out.push({ fid, value, kw });
  };
  const cellOK = (s) => !skipOf(s) && balanced(s) && !COND.test(s) && !DANGLING.test(s) && s.length <= 120;
  const cellList = CAT.cellsOf(l);
  for (const p of pairsOf(l)) {
    const label = tidy(p.label).replace(/\s*[:：]$/, "");
    // Text before the value naming a speed sensor / pick-up ("| Speed Sensor Voltage | Voltage Range: 1.0V - 24V (RMS)"): not the AC input.
    if (/speed|pick-?up|\bMPU\b|sensor/i.test(l.slice(0, p.pos))) continue;
    for (const f of TEXT_FEATURES) {
      if (!f.label.test(label)) continue;
      const v = ownValue(p.value, model);
      // The label may carry an unclosed note from the layout ("| Operating temperature (incl. display | -40 to +70 °C"): the
      // value is still this field's, so only the value must be a whole, unconditional cell.
      if (!v || !cellOK(v) || qualified || skipOf(label) || COND.test(label)) continue;
      let got = f.val(v, { label, section });
      // Metric part only: the source's imperial conversion after " / " ("245 mm x 184 mm x 51 mm / 9.6” x …") or in brackets
      // at the end ("-40 to +70 °C (-40 to +158 °F)") is dropped, so one temperature / size is one value however it is written.
      if (got && ["operating_temp", "dimensions"].includes(f.id)) got = got.split(/\s\/\s/)[0].replace(/\s*\([^()]*(?:°|º|o)?F\b[^()]*\)\s*$/i, "").replace(/\s*\([^()]*\bin\)\s*$/i, "").trim();
      // A unit alone on the next line ("±0.2" then "Hz"): the value is cut.
      if (got && /\d$/.test(got) && /^(?:Hz|kHz|V|A|°C|ºC|°F|mm|%)\.?$/.test(next)) continue;
      if (got) add(f.id, got, `${label} | ${v}`, p.pos);
    }
    // io: "| Digital Input Port | 7 | 7 | 7 | 7" (the model's column), "| Binary inputs | 8", "Digital Inputs" + next row "| Number | 8".
    const kind = IO_KIND(label) || (/^(?:number|quantity|qty)$/i.test(label) && section && i - section.row === 1 ? IO_KIND(section.text) : null);
    if (kind && p.first && p.pos === Math.max(0, l.indexOf(cellList[1]))) {
      const col = cellList.length >= 3 ? ctx?.colCell(i, model) : undefined;
      const raw = col === undefined ? (cellList.length === 2 ? p.value : null) : col;
      if (raw != null && /^\d{1,2}$/.test(NFKC(raw))) add("io", { kind, count: Number(NFKC(raw)) }, `${label} | ${raw}`, p.pos);
    }
  }
  // Free text: display ("480x272 LCD with backlight, …", "Enhanced 4-line text display") and languages.
  cellList.forEach((c, ci) => {
    const s = tidy(c);
    if (skipOf(s)) return;
    const d = s.match(/^(?:\d{2,4}\s*[x×]\s*\d{2,4}\s+(?:LCD|TFT)[^,;(]*|(?:enhanced\s+)?\d-line\s+(?:back-?lit\s+)?(?:LCD\s+)?text\s+display)/i);
    if (d && !COND.test(d[0])) add("display", tidy(d[0]), d[0], l.indexOf(d[0]));
    // A list cut by the layout ("| Selectable Chinese, English | and"; "…(including English," then the next line): not read.
    if (/^\d+\s*:|version|translat|manual|trademark|\bSMS\b/i.test(s) || /,$/.test(String(c).trim()) || /^(?:and|or)\b/i.test(cellList[ci + 1] || "") || !balanced(s)) return;
    const a = s.match(/\b(?:up to\s+)?\d{1,2}\s+languages\b|\bmulti(?:ple)?[\s-]?(?:display\s+)?languages?\b|\bmultilingual\b|\bmultilanguage\b|\bsupports multiple languages\b|\bconfigurable display languages\b/i);
    if (a) {
      // From the words found to the end of the cell ("Up to 5 languages in one configuration, over 20 default languages available").
      const rest = tidy(s.slice(a.index));
      add("languages", rest.length <= 100 && balanced(rest) && !DANGLING.test(rest) ? rest : tidy(a[0]), a[0], l.indexOf(a[0]));
      return;
    }
    const b = s.match(new RegExp(`${LANG_LIST.source}(?:\\s+(?:or|and)\\s+other\\s+languages)?`, "i"));
    if (b && /language|interface|optional|selectable|can be selected|available/i.test(s) && !/\b(?:or|and)\s*$/i.test(s.slice(0, b.index + b[0].length + 5))) add("languages", tidy(b[0]), b[0], l.indexOf(b[0]));
  });
  // Protections: ANSI table rows "| Reverse power | 32R", "| Over-current | 4 | 50TD | <200 ms" under a protections / ANSI title.
  const cells = CAT.cellsOf(l);
  if (l.trim().startsWith("|") && cells.length >= 2 && line == null && rows.slice(Math.max(0, i - 120), i).some((r) => PROT_TABLE.test(NFKC(r)) && !NFKC(r).includes("....."))) {
    const c = cells.findIndex((x, k) => k >= 1 && ANSI_CODE.test(NFKC(x)));
    if (c >= 1) {
      const code = NFKC(cells[c]).match(ANSI_CODE)[1].replace(/\s+/g, "");
      const name = tidy(cells.slice(0, c).filter((x) => !/^(?:x?\d{1,2}|\d+\/(?:breaker|group))$/i.test(NFKC(x))).join(" ")).replace(/\*+$/, "").replace(/\s+ANSI$/, "");
      // Lower-case start / dangling end = a name cut by the layout ("| voltage | 47", "| Voltage asymmetry and | 47").
      if (ANSI_PROT.test(code) && /^[A-Z]/.test(name) && PROT_WORD.test(name) && !NOT_PROT.test(name) && !DANGLING.test(name) && !skipOf(name) && balanced(name)) add("protections", `${name} (ANSI ${code})`, `${name} | ${code}`, 0);
    }
  }
  const tg = l.match(TAGGED);
  if (tg) add(tg[2].toLowerCase() === "warning" ? "alarms" : "protections", tg[1].trim(), tg[0], 0);
  return out;
}

// One line of `model`'s own sheet → { values: [{ fid, value, kw }], skipped: why | null, foreign: [{ fid, kw }] }.
// `kw` = the words matched (for the review of every keyword → line pair).
// A manual shared by variants that differ in what they have (Mecc Alte "GC315 (GC315Plus, GC315Link)", "GC315-GC400": GC315
// does not synchronise, only Plus has RS232, only Link has LTE / GPRS; soát PR G): a line gives a value only to a model it names.
export const sharedManual = (title) => /\bGC315\s*\(GC315Plus,\s*GC315Link\)|\bGC315-GC400\b/i.test(String(title || ""));
export function featuresOfLine(line, model, { mustName = false, ctx = null, row = null } = {}) {
  const l = NFKC(line), skip = skipOf(l), values = [], foreign = [], hits = [];
  for (const f of BOOL_FEATURES) {
    const re = new RegExp(f.re.source, f.re.flags.includes("g") ? f.re.flags : `${f.re.flags}g`);
    for (const m of l.matchAll(re)) hits.push({ fid: f.id, value: true, kw: m[0], pos: m.index });
  }
  for (const f of NUM_FEATURES) for (const v of f.read(l)) {
    const kw = f.id === "front_ip" ? v : String(v);
    hits.push({ fid: f.id, value: v, kw, pos: Math.max(0, l.indexOf(kw)) });
  }
  if (!hits.length) return { values, skipped: null, foreign };
  if (skip) return { values, skipped: skip, foreign, hits: hits.map(({ fid, kw }) => ({ fid, kw })) };
  const ms = mentionsOf(l);
  for (const h of hits) {
    if (deniedOf(h.fid, l)) { foreign.push({ fid: h.fid, kw: h.kw, denied: true }); continue; }
    if ((mustName && !ms.some((m) => m.keys.some((k) => names(k, model)))) || !ownerOK(l, model, h.pos, ms)) { foreign.push({ fid: h.fid, kw: h.kw }); continue; }
    if (ctx && (ctx.block.has(h.fid) || (ctx.restrict.has(h.fid) && !ctx.restrict.get(h.fid).has(model)) || ctx.presence(row, model) === false)) { foreign.push({ fid: h.fid, kw: h.kw, variant: true }); continue; }
    if (!values.some((x) => x.fid === h.fid && x.value === h.value)) values.push({ fid: h.fid, value: h.value, kw: h.kw });
  }
  return { values, skipped: null, foreign };
}
// Every value of `model` at row `row` of sheet t (rowEnd: a "✓" item of a "<model> Unique Features" column, read as one line
// from row to rowEnd): bool / number fields (featuresOfLine) + text / table fields (rowFeatures). A row inside such a column
// gives nothing on its own, and nothing at all to another model. Used by controllerFeatures and the cross-check alike.
export function valuesAt(t, ctx, model, row, rowEnd = null) {
  const col = ctx.columnOf(row);
  if (col && !(row === col.from && rowEnd === col.to && model === col.owner)) return { values: [], skipped: "cot-bien-the", foreign: [], line: t.rows[row] };
  const line = rowEnd == null ? t.rows[row] : t.rows.slice(row, rowEnd + 1).join(" "), mustName = sharedManual(t.title);
  const r = featuresOfLine(line, model, { mustName, ctx, row });
  return { ...r, values: [...r.values, ...rowFeatures(t.rows, row, model, { mustName, ctx, line: rowEnd == null ? null : line })], line };
}

// ---------- Vào bản chuẩn ----------
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
// The fields of a controller doc + its features: only fields with no value yet (a value of another reader is never joined or
// changed). One item per distinct value: `raw` / `src` = its first source line (sheet order), `origin: "ctl-sheet"`, `suppliers`
// = makers whose sheet says it. Keys stay sorted, as Bag.fields() gives them.
export function ctlFeatureFields(fields, items = []) {
  const out = { ...fields }, add = new Map();
  for (const it of items) {
    if (fields[it.fid]) continue;
    const k = `${it.fid}\u0000${JSON.stringify(it.value)}`;
    const e = add.get(k);
    if (e) { e.sup.add(it.src.supplierId); continue; }
    add.set(k, { fid: it.fid, it: { value: it.value, raw: it.raw, src: it.src, origin: "ctl-sheet" }, sup: new Set([it.src.supplierId]) });
  }
  for (const { fid, it, sup } of add.values()) (out[fid] ||= []).push({ ...it, suppliers: sup.size });
  for (const fid of new Set([...add.values()].map((x) => x.fid))) out[fid].sort((a, b) => b.suppliers - a.suppliers || cmp(JSON.stringify(a.value), JSON.stringify(b.value)));
  return Object.fromEntries(Object.keys(out).sort(cmp).map((k) => [k, out[k]]));
}
// Kiểm chéo (spec-standard-check.mjs, test): mọi giá trị `origin: "ctl-sheet"` của doc bộ điều khiển phải (1) có `raw` đúng là
// dòng `src.row` của bảng `src.table` của NCC `src.supplierId` (role controller_maker, cùng số nguồn `src.n`), (2) dòng đó được
// controllerSheetFacts gắn cho CHÍNH model của doc, (3) đọc lại dòng bằng featuresOfLine cho đúng trường + giá trị, (4) trường
// bool chỉ `true`. Trả về { checked, bad: [{ id, why }] }.
export function checkCtlFeatureValues(docs, suppliers = []) {
  const byId = new Map((suppliers || []).filter(Boolean).map((s) => [s.id, s])), sheetCache = new Map(), out = { checked: 0, bad: [] };
  const boolIds = new Set(BOOL_FEATURES.map((f) => f.id));
  const sheetOf = (s, ti) => {
    const k = `${s.id}|${ti}`;
    if (!sheetCache.has(k)) {
      const m = new Map(), facts = controllerSheetFacts(s, s.specTables[ti]);
      for (const { model, f } of facts) m.set(`${model}\u0000${f.line}`, true);
      sheetCache.set(k, { has: m, ctx: sheetCtx(s.specTables[ti], [...new Set(facts.map((x) => x.model))]) });
    }
    return sheetCache.get(k);
  };
  for (const d of docs || []) {
    if (d.part !== "controller") { if (d.part === "genset" ? Object.values(d.models || {}).some((m) => Object.values(m.fields).some((l) => l.some((x) => x.origin === "ctl-sheet"))) : Object.values(d.fields || {}).some((l) => l.some((x) => x.origin === "ctl-sheet"))) out.bad.push({ id: d.id, why: "giá trị ctl-sheet ngoài doc bộ điều khiển" }); continue; }
    for (const [fid, items] of Object.entries(d.fields)) for (const it of items) {
      if (it.origin !== "ctl-sheet") continue;
      out.checked++;
      const bad = (why) => out.bad.push({ id: `${d.id} ${fid}`, why });
      const s = byId.get(it.src?.supplierId), t = s?.specTables?.[it.src?.table];
      if (!s || s.role !== "controller_maker" || !t || t.n !== it.src.n) { bad("không có bảng nguồn của hãng BĐK"); continue; }
      const end = it.src.rowEnd ?? it.src.row, span = t.rows.slice(it.src.row, end + 1);
      if (!span.length || span.join(" ") !== it.raw) { bad("raw không phải dòng src.row (… rowEnd) của bảng"); continue; }
      const sh = sheetOf(s, it.src.table);
      if (otherSheet(t.title) || foreignSheet(t) || span.some((r) => !sh.has.has(`${d.key}\u0000${r}`))) { bad("dòng không thuộc datasheet của chính model"); continue; }
      if (boolIds.has(fid) && it.value !== true) bad(`trường bool phải là true, có ${JSON.stringify(it.value)}`);
      if (fid === "max_sets" && items.length > 1) bad("nhiều số tổ máy hoà cho một model");
      if (!valuesAt(t, sh.ctx, d.key, it.src.row, it.src.rowEnd ?? null).values.some((v) => v.fid === fid && JSON.stringify(v.value) === JSON.stringify(it.value))) bad("đọc lại dòng không ra giá trị này");
    }
  }
  return out;
}
// A sheet of another product that only lists the controllers it works with ("Datasheet: The DSEG0123 also allows the DSEG8600,
// ..., DSE7510 and DSE5510 controllers to be added"): controllerSheetFacts gives its lines to those controllers, but it is not
// their own datasheet.
export const otherSheet = (title) => {
  const t = String(title || "").replace(/^Datasheet:\s*/, ""), ms = mentionsOf(t);
  const head = ms.length ? t.slice(0, ms[0].pos) : t;
  return /\balso\s+allows\b|\bcompatible\s+with\b|\bfor\s+use\s+with\b|\bworks\s+with\b/i.test(head);
};
// A sheet whose OWN product is another one, though its title names a controller (maker-datasheets picked the first line naming a
// controller; PR G phần 2): Deep Sea "Part Number: 2548-01" (DSENet expansion module DSE2548 / 2157 / 2152 / 2133 / 2131) or
// "Part Number: G810-01" (DSEG810 display) under a "DSE8680" / "DSE8660 MKII" title. The part number of the first rows must
// carry the digits of a title model; no part number line → not judged here.
export const foreignSheet = (t) => {
  const keys = mentionsOf(String(t?.title || "")).flatMap((m) => m.keys);
  for (const r of (t?.rows || []).slice(0, 12)) {
    const m = NFKC(r).match(/\bPart Number\s*:?\s*([A-Z]?\d{3,4})-\d{2}\b/i);
    if (m) return keys.length > 0 && !keys.some((k) => k.includes(m[1].replace(/^[A-Z]/i, "")) && /^\d/.test(m[1]));
  }
  return false;
};
// Every controller maker's sheet → Map(model key →[{ fid, value, raw, src: { supplierId, n, table, row }, kw }]) in the order
// of the sheets, plus `audit` = every line with a hit (kept, skipped or of another model) for the review list.
export function controllerFeatures(suppliers = []) {
  const out = new Map(), audit = [];
  for (const s of suppliers || []) {
    if (s?.role !== "controller_maker") continue;
    (s.specTables || []).forEach((t, ti) => {
      if (otherSheet(t.title) || foreignSheet(t)) return;
      // controllerSheetFacts gives `line` = the row itself; the row index is the first row equal to it not used yet for the
      // same model (a row repeated in one table is one source line either way).
      const rowIdx = new Map();
      t.rows.forEach((r, i) => { if (!rowIdx.has(r)) rowIdx.set(r, i); });
      const facts = controllerSheetFacts(s, t), ctx = sheetCtx(t, [...new Set(facts.map((x) => x.model))]);
      const has = new Set(facts.map(({ model, f }) => `${model}\u0000${f.line}`));
      const take = (model, row, rowEnd = null) => {
        const r = valuesAt(t, ctx, model, row, rowEnd);
        if (!r.values.length && !r.skipped && !r.foreign.length) return;
        const src = { supplierId: s.id, n: t.n, table: ti, row, ...(rowEnd != null ? { rowEnd } : {}) };
        audit.push({ model, line: r.line, src, values: r.values, skipped: r.skipped, hits: r.hits || [], foreign: r.foreign });
        for (const v of r.values) {
          const l = out.get(model) || [];
          l.push({ fid: v.fid, value: v.value, raw: r.line, src, kw: v.kw });
          out.set(model, l);
        }
      };
      for (const { model, f } of facts) if (rowIdx.has(f.line)) take(model, rowIdx.get(f.line));
      for (const c of ctx.columns) if (t.rows.slice(c.from, c.to + 1).every((r) => has.has(`${c.owner}\u0000${r}`))) take(c.owner, c.from, c.to);
    });
  }
  // Số tổ máy hoà khác nhau cho một model (DEIF AGC-4: 32 "island power management", 127 "CANshare", từ câu điều kiện khác nhau):
  // không chọn hộ, không ghi.
  for (const [model, l] of out) if (new Set(l.filter((x) => x.fid === "max_sets").map((x) => x.value)).size > 1) out.set(model, l.filter((x) => x.fid !== "max_sets"));
  return { byModel: out, audit };
}

// node suppliers/controllers-features.mjs [--list <tệp.tsv>]: số model có giá trị theo trường và hãng; --list ghi MỌI cặp
// (model, trường, giá trị, NCC, số nguồn, dòng nguồn) để soát.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "cn");
  const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((s) => s.status !== "incomplete");
  const { byModel } = controllerFeatures(all), per = {}, rows = [];
  for (const [model, items] of [...byModel].sort(([a], [b]) => cmp(a, b))) for (const it of items) {
    ((per[it.fid] ||= {})[it.src.supplierId] ||= new Set()).add(model);
    rows.push([model, it.fid, JSON.stringify(it.value), it.src.supplierId, it.src.n, it.src.row, NFKC(it.raw)].join("\t"));
  }
  for (const f of Object.keys(per).sort()) console.log(`${f}: ${Object.entries(per[f]).map(([s, m]) => `${s} ${m.size}`).join(", ")}`);
  const i = process.argv.indexOf("--list");
  if (i > 0) { fs.writeFileSync(process.argv[i + 1], `model\ttruong\tgia_tri\tncc\tn\tdong\tdong_nguon\n${rows.join("\n")}\n`); console.log(`${rows.length} dòng → ${process.argv[i + 1]}`); }
}
