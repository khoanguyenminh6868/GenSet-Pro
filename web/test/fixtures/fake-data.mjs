// Dữ liệu BỊA cho test giao diện (việc H2, 13/11/2026). KHÔNG phải dữ liệu thật: nhà cung cấp dùng mã NCC có sẵn trong
// seed.json (hồ sơ công khai), còn dòng giá, số tiền, ngày báo giá, tỷ giá, gói lịch sử dưới đây đều tự đặt cho dễ tính tay.
// Repo công khai: không đưa báo giá thật, giá vốn thật, token, email vào đây.
import { SEED, RICH } from "../fixtures.mjs";

// Giờ cố định của trang (page.clock.install) cho các ca phụ thuộc ngày: báo giá cũ > 180 ngày, nhịp tim bot.
export const NOW = "2026-11-13T03:00:00.000Z";
export const DAY = 864e5;
// Ngày (YYYY-MM-DD) cách NOW n ngày về trước, theo cách quoteStale đọc (Date.parse → nửa đêm UTC).
export const daysAgo = (n) => new Date(Date.UTC(2026, 10, 13) - n * DAY).toISOString().slice(0, 10);

// ---------- Lịch sử thầu BỊA: đường xác suất thắng tính được bằng tay ----------
// 60 phần mua sắm máy phát, mỗi phần 2 nhà thầu (cùng một nhóm số nhà thầu "2–3"), giá gói 1 tỷ, giá trúng 20 phần mỗi mức
// 0,80 / 0,90 / 0,98 giá gói. nbForecast cần ≥ 50 phần; mọi phần cùng một nhóm nên đường trộn (mix) = đường chung:
// w(r) = tỉ lệ phần có giá trúng > r → 1 (r < 0,80), 2/3 (0,80 ≤ r < 0,90), 1/3 (0,90 ≤ r < 0,98), 0 (r ≥ 0,98).
export const FAKE_RATIOS = [0.8, 0.9, 0.98];
export const winOf = (r) => FAKE_RATIOS.filter((x) => x > r + 1e-9).length / FAKE_RATIOS.length;
export function fakeBidhist() {
  const out = {};
  for (let i = 0; i < 60; i++) {
    const key = `IB2598${String(i).padStart(6, "0")}`, ratio = FAKE_RATIOS[i % 3], P = 1e9;
    out[key] = {
      notifyNo: key, bidName: `Mua sắm máy phát điện 100 kVA (gói BỊA ${i + 1})`, investorName: `Chủ đầu tư BỊA ${i + 1}`, location: "Tỉnh BỊA",
      publicDate: "2025-01-01T02:00:00.000Z", bidCloseDate: `2025-02-${String(1 + (i % 27)).padStart(2, "0")}T03:00:00.000Z`, estimatedPrice: P, final: true,
      lots: [{ lotNo: "", price: P, bidders: [
        { name: `Nhà thầu BỊA A${i}`, taxCode: `9${String(i).padStart(9, "0")}`, bidPrice: P * ratio, won: true, winPrice: P * ratio },
        { name: `Nhà thầu BỊA B${i}`, taxCode: `8${String(i).padStart(9, "0")}`, bidPrice: P * 0.99, won: false },
      ] }],
    };
  }
  return out;
}
// Thay toàn bộ bidhist của seed bằng lịch sử BỊA (8 gói thật của seed làm đường xác suất không còn tính tay được).
export const onlyFakeHist = () => ({ ...Object.fromEntries(Object.keys(SEED.colls.bidhist).map((k) => [k, null])), ...fakeBidhist() });

// ---------- Báo giá BỊA ----------
export const P_RICH = SEED.colls.feed.current.tenders.find((t) => t.notifyNo === RICH).estimatedPrice; // giá gói (công khai)
export const FX_USD = 25000, VAT = 10;
// Một dòng giá tổ máy (bịa): 2 máy × 12.500 USD.
export const ITEM = { id: "i1", desc: "Tổ máy 160 kVA vỏ cách âm (BỊA)", kva: 160, engine: "", alternator: "", controller: "", qty: 2, unitPrice: 12500, currency: "USD", vatIncl: false, terms: "CIF", date: daysAgo(12), note: "" };
// Chi phí phát sinh (bịa): 5 triệu đồng + 2% tiền hàng.
export const EXTRAS = [{ label: "Vận chuyển nội địa, lắp đặt", kind: "vnd", value: 5000000 }, { label: "Chi phí khác", kind: "pct", value: 2 }];
// Giá vốn tính tay theo quoteCost (web/bidprice.js): tiền hàng = Σ SL × đơn giá × tỷ giá; chi phí phát sinh = đồng + % tiền
// hàng; thuế GTGT = (tiền hàng chưa gồm thuế + chi phí phát sinh) × VAT%.
export const GOODS = 2 * 12500 * FX_USD; // 625.000.000
export const EXTRA = 5000000 + (GOODS * 2) / 100; // 17.500.000
export const VAT_AMT = ((GOODS + EXTRA) * VAT) / 100; // 64.250.000
export const COST = GOODS + EXTRA + VAT_AMT; // 706.750.000
// fmtVnd của index.html (chỉ cách in số, không phải công thức đang kiểm).
export function fmtVnd(n) {
  if (n >= 1e9) return (n / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " tỷ";
  if (n >= 1e6) return (n / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + " triệu";
  return n.toLocaleString("vi-VN");
}
