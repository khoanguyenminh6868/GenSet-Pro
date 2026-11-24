// node bang.mjs rev3.tsv > bang.md : bảng nghiệm thu từng lượt nhiều cỡ.
import fs from "node:fs";
const rows = fs.readFileSync(process.argv[2], "utf8").trim().split("\n").map((l) => l.split("\t"));
// Kết luận soát tay (đọc dòng thông số của Phân tích).
const HAND = {
  "IB2200016981#0": "đúng: dòng Phần A của máy 8 kVA ghi 1 pha (dòng chung ghi cả 8 kVA 1 pha và 40 kVA 3 pha nên đối chiếu tự động lệch)",
  "IB2400563426#0": "đúng: dòng Phần A của máy 8,5 kVA ghi 1 pha (dòng chung nêu cả hai máy)",
  "IB2600307179#0": "đúng: dòng của máy 8,5 kVA ghi số pha 1 pha (\"pha dung dịch\" ở dòng làm mát khiến đối chiếu tự động lệch)",
  "IB2300163844#1": "đúng: các dòng của máy 30/33 kVA ghi 3 pha",
  "IB2500415487#0": "đúng: đầu phát Phần A (12,5 kVA) ghi 1 pha 2 dây",
  "IB2500415487#1": "đúng: đầu phát Phần B (15 kVA) ghi 1 pha 2 dây",
  "IB2600457659#0": "đúng: Hạng mục 1 (13,5 kW) ghi 1 pha",
  "IB2600457659#2": "đúng: Hạng mục 2 (27 kW) ghi 3 pha",
  "IB2400152304#1": "không đủ căn cứ (nay không rõ): một máy 3 pha đọc thành hai cỡ 20 / 21,3 kVA, hạng mục có dòng ngả ra 230 V 1 pha; trước 3 đúng theo Phân tích, nay giữ dòng + cần xác nhận",
  "IB2600075436#1": "không đủ căn cứ (nay không rõ): cỡ 120 kVA là số dự phòng của máy 100 kVA, không dòng pha nào gắn với nó; cả gói 3 pha",
  "IB2600075436#3": "không đủ căn cứ (nay không rõ): cỡ 230 kVA là số dự phòng của máy 200 kVA; cả gói 3 pha",
  "IB2500460613#1": "không đủ căn cứ (nay không rõ): cỡ 10 kVA là số dự phòng của máy 8,5 kVA; cả gói 1 pha",
};
const out = ["| Gói | Lượt | Cỡ | Pha 47d66424 → sau | Cách gắn (sau) | Kết luận |", "|---|---|---|---|---|---|"];
let n = { dung: 0, khong: 0, sai: 0 };
for (const r of rows) {
  const [v, src, , goi, luot, co, tr, sau, how] = r;
  const k = `${goi}#${luot}`;
  let kl = HAND[k];
  if (!kl && goi === "IB2300003199") kl = luot === "2" ? "đúng; TRƯỚC SAI (1 pha của tổ máy sinh hoạt gán cho 80 kW)" : "đúng: hạng mục của cỡ này ghi " + sau + " pha";
  if (!kl && v === "khop") kl = src === "dong" ? "đúng: khớp dòng Phân tích nêu cỡ" : src === "cap" ? "đúng: khớp đoạn công suất của Phân tích" : "đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ";
  if (!kl && v.startsWith("null-vs")) kl = `không đủ căn cứ (nay không rõ): không dòng pha nào gắn với cỡ này; cả gói ${v.slice(-1)} pha`;
  if (!kl) kl = "CHƯA SOÁT";
  if (/^đúng/.test(kl)) n.dung++; else if (/^không đủ/.test(kl)) n.khong++; else n.sai++;
  out.push(`| ${goi} | ${luot} | ${co} | ${tr} → ${sau} | ${how} | ${kl} |`);
}
console.log(out.join("\n"));
console.error(JSON.stringify(n));
