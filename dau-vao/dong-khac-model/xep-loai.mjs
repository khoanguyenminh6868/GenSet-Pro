// node xep-loai.mjs ctx.subs.json <tsv 146 của PR 2> <out.tsv> <out.json>
// Xếp loại từng dòng (model gắn × dòng). Căn cứ = chữ dòng + 2 dòng trước / sau trong sources/<hãng>/<n>.md đã đọc (xem in-ctx.mjs).
//  a1 = gắn sai, dòng nói chức năng / số liệu CHỈ của model khác ("only X", "X: ..." mô tả riêng X): có thể làm bằng chứng cho model không có.
//  a2 = dòng mô tả / phủ định model khác ("X without", "refer to ... X", chú thích hình của X): sai chỗ nhưng không chứng minh chức năng cho model gắn.
//  b  = tham chiếu tài liệu / sản phẩm khác (danh mục, TOC, danh sách tài liệu, ghi chú "tính năng có thể đổi"): vô hại.
//  c  = họ model (series) áp thật cho model gắn.
//  d  = không rõ (không suy ra).
import fs from "node:fs";
const rows = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const old146 = fs.readFileSync(process.argv[3], "utf8").split(/\r?\n/).slice(1).filter(Boolean).map((l) => l.split("\t"));
const set146 = new Set(old146.map((x) => `${x[0]}|${x[1]}|${x[2]}`));
const SERIES = /^(HGM\d\d00(N|U|CAN|A)?|HGM9600|HGM7100N|HGM7200|EASYGEN1000)$/;
const isCan = (m) => /CAN$/.test(m);
function cls(r) {
  const { nguon: N, model: M, line: L } = r, ks = r.nameds.split(",");
  const out = (loai, cd) => ({ loai, cd });
  if (/^datakom/.test(N)) return out("a1", "Chữ dòng ghi 'applicable only to DKG-317' (mục 6.27 Password Operation; khối tham số P_115… sau dòng 'Applicable only to the DKG-317 model:'); model gắn DKG307 không phải DKG-317. Nguồn: datakom/1002.md d74, d1964.");
  if (/^deif/.test(N)) return out("b", "Dòng trong danh sách liên kết sản phẩm khác của hãng ('• | AGC-4 Mk II …' / 'AGC 150 …' kèm đường dẫn www.deif.com); không nói chức năng.");
  if (/^comap/.test(N)) return out("b", "Hàng bảng sản phẩm phụ 'InteliVision 8 … Display Unit for InteliGen NT/InteliSys NT'; tham chiếu thiết bị khác; model gắn InteliDrive là BĐK động cơ (bộ nhớ: không tính BĐK tổ máy).");
  if (/^woodward#1002/.test(N)) return out("b", "Câu về GC-3400XT ghép easYgen-3000XT / công cụ LDSS giả lập easYgen-3000XT: nêu sản phẩm khác làm đối tượng ghép / mô phỏng.");
  if (/^woodward#1001/.test(N)) return /ToolKit-SC/.test(L) ? out("b", "Câu về công cụ ToolKit-SC cấu hình easYgen-100 và -1000: tham chiếu phần mềm / dòng sản phẩm khác.") : out("c", "'easYgen-1000 Series' của tờ Woodward gồm bốn bản 1400 / 1600 / 1700 / 1800 (chính tờ ghi 'available in four versions …'); model gắn nằm trong họ.");
  if (/^deep-sea/.test(N)) {
    const n = N.split("#")[1];
    if (n === "1005" && /sharing control|Mains \(utility\) failure detection|DSE8610 MKII \| DSE8610 MKII \| DSE8610 MKII/.test(L)) return out("d", "Ô trộn cột 'Typical Applications' (DSE8610 MKII) vào dòng tính năng của tờ DSE8660 MKII (PDF lệch cột); không rõ dòng thuộc model nào, không suy ra.");
    if (n === "1010" && !/Data Sheet|Refer to/.test(L)) return out("d", "Tờ DSE8620 MKII ghi 'có thể cấu hình làm DSE8610 MKII' (dòng dòng nhiễu cột: dòng điện / tính năng khi chạy chế độ 8610); lẫn với số của chính 8620, không suy ra.");
    if (n === "1026" && /^\| (MKII|DSE8610 MKII \| DSE8610 MKII)/.test(L)) return out("d", "Ô cột trong bảng ghép DSE8680 với các bộ DSE8610 / DSE8660 MKII (PDF vỡ tên model qua ô bảng).");
    if (n === "1027" && /Com Port|Communications/.test(L)) return out("d", "Bảng cổng truyền thông CỦA tờ DSE7570 ('RS232 | DSE8610 MKII Com Port', 'DSE810 | DSE5510 / DSE7510 Com Port'): nêu model khác làm mốc, có thể là cổng của chính DSE7570; không suy ra. ctlShows nhận 'RS232' ở hai dòng này.");
    return out("b", "Hàng bảng sản phẩm liên quan / danh mục tài liệu (Related Products, Product Documentation, Installation, Data Sheet, Remote Display Module, *When used with …): tham chiếu thiết bị / tài liệu khác của hãng.");
  }
  if (/^smartgen/.test(N)) {
    const n = Number(N.split("#")[1]);
    if (/^\/?HGM\d{4}\/HGM|^NOTE: (The )?(features|functions)|Functions of mentioned|^\| Refer to/i.test(L) && !/Only/.test(L) && n !== 1001) return out("b", "Ghi chú 'features of HGM…/HGM… controllers may change, please check the corresponding user manual' (danh sách model khác, câu kết ở dòng kế).");
    if (/may change, please check|Synchronization Plan List|SYNCHRONIZATION PLAN LIST|Switch Control Procedures|^Add HGM7100A|Delete HGM7100A|controllers mentioned in this document|Page \d+ of|^\| 5\.6/i.test(L) && !/Only/.test(L)) return out("b", "Chú thích / mục lục / lịch sử sửa đổi trỏ tới tài liệu hoặc dòng sản phẩm khác ('features of … may change, please check the corresponding user manual', 'refer to … Synchronization Plan List', TOC, revision).");
    if (n === 1005) return out("a1", "Bảng chức năng đầu vào '(Only available for HGM9520N.)': chức năng chỉ của HGM9520N, dòng được gắn cho HGM9510N / HGM9530N.");
    if (n === 1011) { if (/°C|LCD Display/.test(L)) return out("a1", "Thông số môi trường (nhiệt độ làm việc / lưu kho) và màn hình của biến thể HGM9420LT, gắn cho HGM9420N (tờ ghi hai biến thể hai dòng riêng: 'HGM9420N: (-25~+70)°C' và 'HGM9420LT: (-40~+70)°C')."); return out("a2", "Hàng bảng mã đặt mô-đun 4G / băng tần của biến thể HGM9420LT-Sxx (tờ có hàng HGM9420N-Sxx tương ứng); không phải thông số của HGM9420N."); }
    if (n === 1012) {
      if (M === "HGM9310") {
        if (/\(HGM9320MPU，HGM9320CAN without\)|^HGM9320MPU\/HGM9320CAN$/.test(L)) return out("d", "Tờ chung HGM9310/9320 MPU(CAN): chữ ghi 'HGM9320MPU, HGM9320CAN without' ở dòng nút Gen Close/Open; nghĩa (cái nào không có) phụ thuộc cột bảng, không suy ra.");
        if (/Switch Control Procedures|typical application diagram/.test(L)) return /Switch Control/.test(L) ? out("b", "Mục lục trỏ tới thủ tục của HGM9320MPU(CAN).") : out("a2", "Chú thích hình sơ đồ ứng dụng của HGM9320MPU(CAN); HGM9310 có chú thích riêng.");
        return out("a1", "Trình tự chạy khi MẤT LƯỚI ('When Mains is abnormal … enters mains abnormal delay'; 'mains return normal … Normal delay') của HGM9320MPU(CAN); HGM9310 không có phần lưới (tờ ghi: 'In HGM9310MPU(CAN) controller, there are no items of mains'). Mục 'HGM9320MPU(CAN)' ở dòng gắn HGM9310.");
      }
      if (/without\)?\.?$|has no mains|there are no items of mains/.test(L)) return out("a2", "Chú thích phủ định về HGM9310MPU/CAN ('… without', 'no mains status screen', 'no items of mains') đứng ở dòng gắn HGM9320; nói HGM9310 thiếu gì, không nói HGM9320 có gì.");
      if (/typical application diagram|controller is applied/.test(L)) return out("a2", "Chú thích hình / câu chuyển cho HGM9310MPU(CAN) đứng ở dòng gắn HGM9320.");
      if (/^HGM9310MPU\/HGM9310CAN$/.test(L)) return out("d", "Ô tiêu đề cột bảng chỉ thị đèn (HGM9310MPU/CAN | HGM9320MPU/CAN); không rõ.");
      return out("a1", "Trình tự khởi động khi KHÔNG có lưới: 'HGM9310MPU(CAN): When Remote Start (on load) is active, Start Delay timer…' / 'When Remote Start signal removed, Stop Delay…' mô tả chế độ chạy của HGM9310MPU(CAN) (không AMF); gắn cho HGM9320 (có phần lưới).");
    }
    if (n === 1013) return /HGM9510’s analog/.test(L) ? out("a2", "Chú thích cảm biến của HGM9510 trong tờ HGM9520 (số cảm biến cố định / cấu hình) — mô tả model khác; HGM9520 có dòng riêng.") : out("b", "Ghi chú 'features of …/HGM9510/… may change, please check the corresponding user manual'.");
    if (n === 1001 || n === 1002 || n === 1006 || n === 1007 || n === 1008) {
      if (/Only HGM6100N has these/.test(L)) return out(isCan(M) ? "a1" : M.endsWith("NC") ? "d" : "c", isCan(M) ? "Chữ dòng 'Only HGM6100N has these' (trong ô 'shutdown alarms'): chỉ biến thể N có, không phải CAN; model gắn là biến thể CAN." : M.endsWith("NC") ? "'Only HGM6100N has these': tờ chung HGM6100N/CAN; HGM6110NC / 6120NC thuộc N hay CAN không có chữ nào nói rõ." : "'Only HGM6100N has these': biến thể N, đúng cho model gắn.");
      if (/HGM6100CAN/.test(L) && !/Number|If the HGM6100N/.test(L)) return out(isCan(M) ? "c" : "a1", isCan(M) ? "Dòng nói 'for HGM6100CAN …' (ECU, Yuchai-LMB, Custom Theme): đúng cho biến thể CAN." : "Dòng nói riêng 'for HGM6100CAN' (đèn khi chạy, ECU / Yuchai-LMB, theme) gắn cho biến thể không CAN.");
      if (/If the HGM6100N and HGM6100CAN parameter numbers/.test(L)) return out("b", "Chú thích cách đọc cột 'Number' (số tham số khác nhau giữa HGM6100N và HGM6100CAN).");
      if (/HGM6120/.test(L) && /^HGM6110/.test(M) && !/series controllers/.test(L)) return out("a1", "Chữ dòng '1) HGM6120: When mains is abnormal …' / 'Mains Normal Delay' / 'Manual Mode …': mô tả chế độ AMF (có lưới) của HGM6120; dòng gắn cho HGM6110* (bản chỉ khởi động từ xa, 'HGM6110 without' ở nhiều dòng khác).");
      if (/HGM6120 series controllers/.test(L)) return out("a1", "Phím chỉ có ở họ HGM6120 ('The key is fit for HGM6120 series controllers'); gắn cho HGM6110*.");
      if (/back panel of HGM6120/.test(L)) return out("a2", "Câu chuyển tới hình mặt sau HGM6120.");
      if (/HGM6110 series controllers/.test(L)) return out("a1", "Phím chỉ cho họ HGM6110 ('The key is fit for HGM6110 series controllers'); gắn cho HGM6120*.");
      if (/HGM6110/.test(L) && /^HGM6120/.test(M)) return /without|no items 1-5/.test(L) ? out("a2", "Phủ định về HGM6110 ('HGM6110 without', 'no items 1-5 in table 7'): nói HGM6110 thiếu, dòng đứng ở HGM6120.") : out("a1", "Chữ dòng '2) HGM6110: When remote start input is active …' / 'Stop Delay as soon as Remote Start inactive' / 'Manual Mode …': trình tự của HGM6110 (khởi động từ xa), gắn cho HGM6120*.");
      if (ks.length && ks.every((k) => SERIES.test(k))) return out("c", "Tên họ ('HGM6100N SERIES', 'HGM9600 series', 'HGM7200 series', 'HGM7100N Series' …) trong chính tờ của họ; model gắn nằm trong họ (sheet: tiêu đề tài liệu nêu cả họ).");
      if (/HGM7X20/.test(L) && /^HGM721/.test(M)) return out("a2", "Chú giải ký hiệu 'HGM7X20 = All HGM7200 series AMF controllers' (bảng lịch sử sửa đổi); HGM7210* là bản ASM, không phải AMF.");
      if (/HGM7X10/.test(L) && /^HGM722/.test(M)) return out("a2", "Chú giải ký hiệu 'HGM7X10 = All HGM7200 series ASM controllers'; HGM7220* là bản AMF.");
      if (/HGM7100A|HGM7X|HGM72X0|HGM7200/.test(L)) return out("c","Dòng của họ HGM7200 ('All HGM7200 series … controllers' bảng ký hiệu) — model gắn thuộc HGM7200.");
    }
  }
  return out("d", "Không khớp luật nào; không suy ra.");
}
const res = [];
for (const r of rows) { const c = cls(r); res.push({ ...r, loai: c.loai, canCu: c.cd, trong146: set146.has(`${r.model}|${r.nguon}|${r.line}`) }); }
const head = ["model_gan", "model_dong_neu", "nguon", "dong_nguon", "moi_hay_cu", "trong_146_cua_PR2", "loai", "ctlShows", "chu_dong", "can_cu", "ngu_canh_2_dong_truoc_sau"].join("\t");
const tsv = res.map((r) => [r.model, r.nameds, r.nguon, r.srcLine, r.moi, r.trong146 ? "co" : "", r.loai, (r.subs || []).join("/"), r.line, r.canCu, (r.ctx || []).join(" ⏎ ")].map((x) => String(x ?? "").replace(/[\t\r\n]+/g, " ")).join("\t"));
fs.writeFileSync(process.argv[4], [head, ...tsv].join("\n"), "utf8");
fs.writeFileSync(process.argv[5], JSON.stringify(res, null, 1), "utf8");
const cnt = (f) => { const m = {}; for (const r of res) { const k = f(r); m[k] = (m[k] || 0) + 1; } return m; };
console.log("tổng", res.length, "loại", JSON.stringify(cnt((r) => r.loai)));
console.log("mới", JSON.stringify(cnt((r) => (r.moi === "moi" ? r.loai : null))));
console.log("cũ", JSON.stringify(cnt((r) => (r.moi === "cu" ? r.loai : null))));
console.log("theo hãng×loại", JSON.stringify(cnt((r) => r.supplier + ":" + r.loai)));
console.log("theo nguồn×loại (a1/a2/d)", JSON.stringify(cnt((r) => (/^(a|d)/.test(r.loai) ? r.nguon + ":" + r.loai + ":" + r.moi : null))));
console.log("trong 146:", res.filter((r) => r.trong146).length, "/ 146 ; ngoài 146 mà mới:", res.filter((r) => !r.trong146 && r.moi === "moi").length);
const m146 = old146.filter((x) => !res.some((r) => `${r.model}|${r.nguon}|${r.line}` === `${x[0]}|${x[1]}|${x[2]}`));
console.log("dòng của 146 không có trong danh sách của tôi:", m146.length);
for (const x of m146.slice(0, 12)) console.log("   ", x.join(" | ").slice(0, 160));
