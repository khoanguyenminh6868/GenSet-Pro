// node --test suppliers/*.test.mjs — catalog-a (Khoa 19/11/2026 "Làm", đề xuất của catalog-bang-r1): (a) dòng máy nằm trong
// tiêu đề (dòng tiêu đề thứ 2 trở đi) được đọc như dòng; (b) gộp mọi dấu cách giữa hai chữ Hán của tiêu đề.
// Mỗi ca là dòng thật trong suppliers/cn (NCC, số bảng n ghi cạnh).
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const recs = (s, kind, notes = []) => C.fromSupplier(s, notes).filter((r) => !kind || r.kind === kind);
const spec = (r, k) => (r.specs || []).find((x) => x.key === k)?.value;

test("(a) fdk-energy n103: dòng máy ngay dưới tiêu đề đọc như dòng, chỉ số sau các dòng sẵn có", () => {
  const s = sup("fdk-energy", [{ n: 103, title: "Diesel Generator Set (9-3250KVA) - FDK Energy", header: [
    "| | Genset Model | Standby Power | Prime Power | Engine Model | Engine Original | Alternator Model | Details | Download PDF",
    "| CG250-H1 CONTACT | 250KVA/ 200KW | 225KVA/ 180KW | QSL9-G2 | Cummins (USA) | Stamford UCDI274J | Click Here | Download",
    "| CG275-H1 CONTACT | 275KVA/ 220KW | 250KVA/ 200KW | QSL9-G3 | Cummins (USA) | Stamford UCDI274K | Click Here | Download"],
  rows: ["| CD23/H1 CONTACT | 23KVA/ 18KW | 20KVA/ 16KW | 4B3.9-G11 | Cummins (China Dongfeng) | Stamford S0L2-G1 | Click Here |"] }]);
  const e = recs(s, "engine");
  assert.deepEqual(e.map((r) => [r.row, r.genset, r.model]), [[0, "CD23/H1", "4B3.9-G11"], [1, "CG250-H1", "QSL9-G2"], [2, "CG275-H1", "QSL9-G3"]]);
  assert.deepEqual(e[1].power, { standby: { kVA: 250, kW: 200 }, prime: { kVA: 225, kW: 180 } });
  assert.equal(e[1].line, "| CG250-H1 CONTACT | 250KVA/ 200KW | 225KVA/ 180KW | QSL9-G2 | Cummins (USA) | Stamford UCDI274J | Click Here | Download");
  // tiêu đề lưu kèm bản ghi chỉ còn dòng tiêu đề thật
  assert.equal(e[0].header.length, 1);
  assert.deepEqual(recs(s, "alternator").map((r) => r.model), ["S0L2-G1", "UCDI274J", "UCDI274K"]);
});

test("(a) baifa n101: dòng tiêu đề con (Standby KVA | Prime KVA …) giữ lại, dòng máy sau nó đọc như dòng", () => {
  const s = sup("baifa-power", [{ n: 101, title: "", header: [
    "| BAIFA MODEL | POWER | DIESEL ENGINE | ALTERNATOR | Emission | ENGINE MANUFACTURER / COUNTRY",
    "| Standby KVA | Prime KVA | Brand | Model | Gov. | STAMFORD",
    "| BF-C28Q-3 | 28 | 25 | CUMMINS (CHINA) | QSB3.9-G31 | ECM | S0L2-M1 | Stage IIIA / CHINA STAGE3 | CHINA",
    "| BF-C40Q-3 | 44 | 40 | QSB3.9-G33 | ECM | S1L2-K1 | Stage IIIA / CHINA STAGE3 | CHINA"],
  rows: ["| BF-C625-3 | 625 | 569 | QSK19-G17 | | CHINA STAGE3 | CHINA"] }]);
  const e = recs(s, "engine");
  assert.deepEqual(e.map((r) => [r.row, r.genset, r.model]), [[0, "BF-C625-3", "QSK19-G17"], [1, "BF-C28Q-3", "QSB3.9-G31"], [2, "BF-C40Q-3", "QSB3.9-G33"]]);
  assert.deepEqual(e[1].power, { standby: { kVA: 28 }, prime: { kVA: 25 } });
  assert.deepEqual(e[0].power, { standby: { kVA: 625 }, prime: { kVA: 569 } });
  // dòng BF-C625-3 không ghi hãng: trước đây lấy "CUMMINS" từ dòng máy KHÁC nằm trong tiêu đề, nay không
  assert.deepEqual((e[0].makes || []).map((m) => m.name), []);
  assert.deepEqual((e[1].makes || []).map((m) => m.name), ["Cummins"]);
});

test("(a) simpson n102 (tiêu đề Hán cách chữ) và penlucky n108 / elitech n1001: dòng máy trong tiêu đề", () => {
  const sp = recs(sup("simpson-power", [{ n: 102, title: "1800kW above", header: [
    "| 机 组 型 号 | 备 用 功 率 ( kW/kVA) | 发 动 机 品 牌 | 发 动 机 型 号 | 机 组 尺 寸 (mm) ( 长 × 宽 × 高 ) | 机 组 数 据",
    "| SP1800D-L | 1800/2250 | SME | S16R-PTAA2-C | 5720×2400×3436 | SP1800D-L.pdf"],
  rows: ["| SP1800D-U | 1800/2250 | MTU | 16V4000G23 | 7330×2150×2836 | SP1800D-U.pdf"] }]), "engine");
  assert.deepEqual(sp.map((r) => [r.row, r.genset, r.model]), [[0, "SP1800D-U", "16V4000G23"], [1, "SP1800D-L", "S16R-PTAA2-C"]]);
  assert.deepEqual(sp[1].power, { standby: { kW: 1800, kVA: 2250 } });
  assert.equal(spec(sp[1], "dims"), "5720×2400×3436");
  const pl = recs(sup("penlucky", [{ n: 108, title: "PLWM series models power by WEICHAI | Penlucky", header: [
    "| | Penlucky Model | Primary Powe /KW | Continuous power/ KW | Engine Model | Alternator Leroy-Somer | Mode of speed regulation | Dimension mm | Data PDF",
    "| PLWM16B1 | 16 | 16 | WP2.3CD25E200 | TAL A40 D | Electronics | 1266*760*1145 | view"],
  rows: ["| PLWM500X | 500 | 400 | X6170ZCD556-5 | LSA 50.2 M6 | Mechanical /electronic | 3728*1406*2004 | view"] }]), "engine");
  assert.deepEqual(pl.map((r) => [r.row, r.genset, r.model, JSON.stringify(r.power)]), [[0, "PLWM500X", "X6170ZCD556-5", '{"prime":{"kW":500}}'], [1, "PLWM16B1", "WP2.3CD25E200", '{"prime":{"kW":16}}']]);
  const el = recs(sup("elitech-power", [{ n: 1001, title: "Industrial Diesel Generator TDS & Technical Specs | Elitech Power", header: [
    "| | Genset Model | Engine Brand | Prime Power | Standby Power | Engine Model | Freq. | Phase | Specification Download | SEO ID",
    "| EPS18DZA-3 | Deutz | 18kVA | 20kVA | BFM3 G1 | 50Hz | 3-Phase | DOWNLOAD PDF | eps18dza-3-deutz-18kva-diesel-generator-specs"],
  rows: ["| EPS60DZA-3 | Deutz | 60kVA | 69kVA | BF4M2012 | 50Hz | 3-Phase | DOWNLOAD PDF | eps60dza-3-deutz-60kva-diesel-generator-specs"] }]), "engine");
  assert.deepEqual(el.map((r) => [r.row, r.genset, r.model, JSON.stringify(r.power)]), [[0, "EPS60DZA-3", "BF4M2012", '{"prime":{"kVA":60},"standby":{"kVA":69}}'], [1, "EPS18DZA-3", "BFM3 G1", '{"prime":{"kVA":18},"standby":{"kVA":20}}']]);
});

test("(a) không chắc thì để nguyên + ghi chú: dòng tiêu đề lặp lại (bản dịch) sau dòng máy (rcg n120)", () => {
  const notes = [];
  const s = sup("rcg-power", [{ n: 120, title: "R-WB 系列 (博杜安) -江苏瑞昌哥尔德发电设备股份有限公司", header: [
    "| | 型号 | 主电源 | 备用电源 | 发动机 | 交流发电机 | 下载",
    "| R-WB18D5/S | 18 kVA / 14 kW | 20 kVA / 16 kW | 潍柴博杜安 & 4M06G20/5 | 威而纳 & WR184ES | PDF",
    "| | 型号 | 主电源 | 备用电源 | 发动机 | 交流发电机 | 下载"],
  rows: ["| R-C625D5-S | 625 kVA / 500 kW | 688 kVA / 550 kW | VTA28-G5 | TAL-A473-F | PDF"] }]);
  const e = recs(s, "engine", notes);
  assert.deepEqual(e.map((r) => r.genset), ["R-C625D5-S"]);
  assert.deepEqual(notes.filter((x) => x.reason === "dòng máy lẫn với dòng tiêu đề").map((x) => [x.n, x.table, x.detail]), [[120, 0, "| R-WB18D5/S | 18 kVA / 14 kW | 20 kVA / 16 kW | 潍柴博杜安 & 4M06G20/5 | 威而纳 & WR184ES | PDF"]]);
});

test("(a) mảnh bảng nhãn (longkai n1001 '| STAMFORD | UCI224F') không là dòng máy", () => {
  const t = { n: 1001, title: "Datasheet: Download", header: ["| Rated prime power | kva | 68.75", "| Model | LONGKAI | LK224F", "| Rated standard power | kva | 75.63", "| STAMFORD | UCI224F"],
    rows: ["| Maximun sound level | dB(@7m) | ≤96", "| Engine-SDEC | Power factor | 0.8", "| Frequency | Hz | 50"] };
  const notes = [];
  recs(sup("longkai-power", [t]), null, notes);
  assert.equal(notes.filter((x) => x.reason === "dòng máy lẫn với dòng tiêu đề").length, 0);
});

test("(a) dòng trong tiêu đề trùng chữ với dòng của bảng khác: gộp vào một bản ghi (welland n104)", () => {
  const line = "| 53WC0140A00 | 150 | 3 | 50 | Cummins | 6BTAA5.9G6 | None | TROP | Stamford | UCI274E1 | View";
  const head = "| | GenName | ESP kVA | Phases | Freq | Engine Brand | Engine Model | EU Emissions Level | Radtype | Alternator Brand | Alt. Model |";
  const s = sup("welland-power", [
    { n: 103, title: "Welland Power UK Diesel Generators", header: [head], rows: [line] },
    { n: 104, title: "Welland Power UK Diesel Generators", header: [head, line], rows: ["| 53WC0720A01 | 693 | 3 | 50 | Cummins | VTA28G5 | None | TROP | Stamford | S5L1D-F41 | View"] }]);
  const e = recs(s, "engine").filter((r) => r.model === "6BTAA5.9G6");
  assert.equal(e.length, 1);
  assert.deepEqual(e[0].also.map((a) => [a.n, a.row]), [[104, 1]]);
});

test("(b) tiêu đề Hán có dấu cách giữa hai chữ: 机组重 量 / 机组 重量 → khối lượng (bdadl n104, xingguang n101)", () => {
  const b = recs(sup("bdadl-shanghai", [{ n: 104, title: "1500KW-上海博杜安动力科技有限公司",
    header: ["| | 机组型号 | 输出功率 (KW/KVA) | 柴油机品牌 | 柴油机型号 | 缸数 | 排量 (L) | 润滑油 容量(L) | 燃油消耗 (g/kw.h) | 外形尺寸(L×W×H) | 机组重 量(KG)"],
    rows: ["| BDA-C1500 | 1500/1875 | 重庆康明斯 | KTA50-G15 | 16 | 50 | 177 | ≤209 | 5700*2200*2700 | 13000"] }]), "engine")[0];
  assert.equal(spec(b, "weight"), "13000");
  assert.equal(spec(b, "oil"), "177");
  const x = recs(sup("xingguang-jiangsu", [{ n: 101, title: "重庆|东风康明斯柴油发电机组系列 - 江苏星光动力集团",
    header: ["| 重庆康明斯 机组型号 | 机组输出 功率 (KW/KVA) | 柴油机 型号 | 柴油机功率（ KW ） 主 / 备用 | 缸数 | 机油 容量 （ L ） | 燃油 消耗 g/kw.h | 排放 | 开架机组 外形尺寸 L × W × H(mm) | 机组 重量 (kg)"],
    rows: ["| XG-220GF | 200/220 | NT855-GA | 231/254 | 6 | 39 | ≤191 | 国 II | 3000×1040×1655 | 2800"] }]), "engine")[0];
  assert.equal(spec(x, "fuel"), "≤191");
});

test("(b) 燃油 消耗 (honny n101), 电 流 / 排 气 量 (yunding n2001), 缸 数 (zhengdian n104)", () => {
  const h = recs(sup("honny-dongguan", [{ n: 101, title: "低压柴油发电机组-产品中心", header: [
    "| | 机组技术参数 | 发动机技术参数 | 机组尺寸与重量",
    "| 机组 型号 | 备用 容量 (kVA) | 常用 容量 (kVA) | 备用 功率 (kW) | 常用 功率 (kW) | 燃油 消耗 (L) | 额定 电流 (A) | 发动机 型号 | 备用 功率 (kW) | 常用 功率 (kW) | 缸数 | 缸径 | 行程 | 排量 (A) | 压缩比 | 发电机 型号 | 机组尺寸(mm) | 重量",
    "| 长 | 宽 | 高 | (kg)"],
  rows: ["| HGM550E | 550 | 500 | 440 | 400 | 109 | 722 | PTAA6L-EG490 | 490 | 445 | L6 | 135 | 166 | 14 | 15.5:1 | GP500-4P | 3400 | 1300 | 1650 | 3400"] }]), "engine")[0];
  assert.equal(spec(h, "fuel"), "109");
  const y = recs(sup("yunding-jiangsu", [{ n: 2001, title: "重庆康明斯柴油发电机组 重庆康明斯(国二)系列", header: [
    "| 机组型号 Model | 功率Power | 电 流 A Current | 发动机型号 Engine model | 缸 数 Cylinder | 缸径*行程 Bore*Stroke D | 排 气 量 L isplacemen | 机油容量L t Lube oil | 油耗g/kw .h Consumption | 尺寸mm Size | 重量Kg Weight",
    "| KW | KVA", "| 重庆康明斯(国二)系列"],
  rows: ["| YDK-200GF | 200 | 250 | 360 | NT855-GA | 6 | 140*152 | 14 | 38 | 191 | 3000*1050*1800 | 2550"] }]), "engine")[0];
  assert.equal(spec(y, "current"), "360");
  assert.equal(spec(y, "weight"), "2550");
  const z = recs(sup("zhengdian-zhengzhou", [{ n: 104, title: "济柴", header: [
    "| | 机组型号 | 机组功率 （ kw ） | 电流Ａ | 柴油机型号 | 品牌 | 柴油机功率k W | 缸 数 | 机油 容量 L | 机组重量 kg | 机组外型尺寸 mm×mm×mm", "| 备用 | 额定"],
  rows: ["| 1000GF | 1100 | 1000 | 1985/1805 | A12V190ZL | 济柴 | 1200 | 12 | 200 | 12000 | 6200 × 1950 ×3 000"] }]), "engine")[0];
  assert.equal(spec(z, "cyl"), "12");
  assert.equal(spec(z, "weight"), "12000");
});

test("soát của điều phối: 'CONTACT' (chữ liên kết của fdk) không thuộc model tổ máy; '2*' (TWIN, baifa n106) không cho bản ghi; 'CHINA STAGE16' không là khí thải", () => {
  const f = recs(sup("fdk-energy", [{ n: 103, title: "Diesel Generator Set (9-3250KVA) - FDK Energy", header: [
    "| | Genset Model | Standby Power | Prime Power | Engine Model | Engine Original | Alternator Model | Details | Download PDF"],
  rows: ["| CD23/H1 CONTACT | 23KVA/ 18KW | 20KVA/ 16KW | 4B3.9-G11 | Cummins (China Dongfeng) | Stamford S0L2-G1 | Click Here |"] }]), "engine");
  assert.equal(f[0].genset, "CD23/H1");
  const notes = [];
  const b = recs(sup("baifa-power", [{ n: 106, title: "", header: [
    "| BAIFA MODEL | POWER | DIESEL ENGINE | ALTERNATOR | Emission | ENGINE MANUFACTURER / COUNTRY",
    "| Standby KVA | Prime KVA | Brand | Model | Gov. | STAMFORD",
    "| BF-V900TWIN-T2 | 900 | 820 | VOLVO PENTA | 2*TAD1344GE | EMS2 / ECU | 2*S4L1D-F41 | ISO 20'ft HC"],
  rows: ["| BF-C625-3 | 625 | 569 | QSK19-G17 | | CHINA STAGE3 | CHINA"] }]), null, notes);
  assert.deepEqual(b.map((r) => r.genset), ["BF-C625-3"]);
  assert.equal(notes.filter((x) => x.reason === "tổ máy nhiều động cơ").length, 1);
  const head = ["| BAIFA MODEL | POWER | DIESEL ENGINE | ALTERNATOR | Emission | ENGINE MANUFACTURER / COUNTRY", "| Standby KVA | Prime KVA | Brand | Model | Gov. | STAMFORD"];
  const e = recs(sup("baifa-power", [{ n: 101, title: "", header: head, rows: [
    "| BF-C28Q-3 | 28 | 25 | CUMMINS (CHINA) | QSB3.9-G31 | ECM | S0L2-M1 | Stage IIIA / CHINA STAGE3 | CHINA",
    "| BF-C200Q-3 | 200 | 180 | CUMMINS (CHINA) | QSL9-G5 | ECM | S1L2-K1 | Stage IIIA / CHINA STAGE16 | CHINA"] }]), "engine");
  assert.equal(spec(e[0], "emission"), "Stage IIIA / CHINA STAGE3");
  assert.equal(spec(e[1], "emission"), undefined);
});

test("bảng máy khí (agg-fuzhou n116, model đuôi -NG): dòng máy trong tiêu đề KHÔNG đọc thêm, dòng của bảng như cũ (điều phối 19/11)", () => {
  const notes = [];
  const r = recs(sup("agg-fuzhou", [{ n: 116, title: "康明斯-德塔", header: [
    "| | 发电机型号 | COP (kVA/kW) | 发动机型号 | 品牌",
    "| CU1375G6-NG | 1375/1100 | K50N-G11SH | Cummins"],
  rows: ["| CU1250G6-NG | 1250/1000 | K50N-G10S | Cummins"] }]), "engine", notes);
  assert.deepEqual(r.map((o) => o.genset), ["CU1250G6-NG"]);
  assert.deepEqual(notes.filter((x) => /bảng máy khí/.test(x.reason)).map((x) => x.detail), ["| CU1375G6-NG | 1375/1100 | K50N-G11SH | Cummins"]);
});
