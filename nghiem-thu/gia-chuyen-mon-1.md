# Nghiệm thu: Gợi ý giá đấu — logic chuyên môn (PR 1)

- PR: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/503 (DRAFT, nhánh `bidprice-expert-logic`, từ origin/main a16f9d7)
- CI: 2 đạt, 1 bỏ qua, 0 lỗi.
- Không đụng `web/index.html`, `suppliers/config-bot.mjs`, `reqcodes.mjs`, `config-prompt.md`, `web/conversions.js`, `bidprice-prompt.md` (prompt agent giữ nguyên). Không chạy agent, không ghi web, không động tới `genbid-hsmt\`.

## Tệp đã đổi
| Tệp | Nội dung |
|---|---|
| `web/bidprice.js` | `costHints`, `COST_HINTS`, `monthsIn`, `readTerms`, `financeCost`, `engineGroup`, `groupPrices`, `feasibility`, `rivalsOf`, `quoteStale`, `STALE_DAYS`; `candidates` nhận `t.group` (không truyền = như cũ); `quoteCost(row, cost, now)` thêm `stale`, `finance`; `quoteLedger(quotes, now)` thêm `stale` |
| `suppliers/bidprice-bot.mjs` | `configPrices` (export) → `samples.json.byConfig` → `result.byConfig` = [hạng 1 `main:true` (giá = `result.stats` của agent, không đổi), cấu hình gần nhất có nhóm xuất xứ khác (giá code `groupPrices`)]; `printResult` in thêm dòng đó |
| `suppliers/bidprice.test.mjs` | +8 test (có test hồi quy hạng 1) |
| `suppliers/bidprice-backtest.mjs` | mới: hậu kiểm chỉ đọc doc-cache |

## Lệnh kiểm + đầu ra thật
```
node --test suppliers/*.test.mjs
# pass 157
# fail 0
```
Test hồi quy "candidates / check: the first configuration's result is unchanged by groups and byConfig": `candidates(t)` deepEqual `candidates({...t, group: undefined})`; `check()` cho `result.stats` y hệt khi samples.json có/không có `byConfig`.

## Chỉ số nghiệm thu: hậu kiểm (ĐO THẬT, `node suppliers/bidprice-backtest.mjs`)
Dữ liệu: doc-cache bidhist 1.556 gói; 808 phần mua sắm máy phát có giá trúng + công suất. Mỗi phần chỉ dùng phần khác có kết quả công bố (resultAt/decisionDate) TRƯỚC ngày đóng thầu của nó.
**Giới hạn:** bỏ bước agent xếp mức — mọi ứng viên code chọn coi là "gần"; gói cần đo không có Gợi ý cấu hình nên nhóm theo HSMT. Số này là của lượt chọn bằng code, không phải của kết quả bot đăng.

### Trước khi sửa (cơ sở) — cách hiện nay cho hạng 1
| Nhóm | n | Giá trúng trong [thấp, cao] | \|Sai số mức giữa\| trung vị (điểm % giá gói) | Lệch trung vị | Độ rộng [thấp,cao] |
|---|---|---|---|---|---|
| Tất cả (671/808 có giá; 137 không đủ gói) | 671 | 36,4% | 6,8 | −1,0 | 12,0 |
| 1 NT | 171 | 36,8% | 5,2 | −4,4 | 12,5 |
| 2–3 NT | 250 | 35,6% | 6,6 | −2,0 | 12,1 |
| 4–5 NT | 134 | 37,3% | 7,9 | +4,1 | 11,6 |
| ≥6 NT | 116 | 36,2% | 11,4 | +11,3 | 11,4 |
| cn | 173 | 29,5% | 9,0 | +6,1 | 11,4 |
| cnmade | 39 | 51,3% | 6,1 | −3,1 | 11,2 |
| foreign | 71 | 19,7% | 6,8 | −3,9 | 11,3 |
| không rõ nhóm | 388 | 41,0% | 5,9 | −1,5 | 12,4 |

(Lệch dương = mức giữa cao hơn giá trúng thật.) Khoảng phân vị 25–75 lẽ ra chứa ~50% giá trúng; chỉ chứa 36% → khoảng hiện quá hẹp. Gói ≥6 NT bị gợi ý cao hơn thật ~11 điểm.

### Sau khi sửa
**Hạng 1 (cách chung): không đổi** — chạy lại cho đúng các số trên (671/808, 36,4%, 6,8 điểm…), khớp test hồi quy.

**Giá theo nhóm xuất xứ (mục 3, `groupPrices`)**, giả như biết trước nhóm động cơ sẽ chào = nhóm của hàng trúng thật (340 phần biết nhóm). So cặp trên cùng phần mà cả hai cách đều ra giá:

| Nhóm | n cặp | Chung: trong khoảng / sai số | Theo nhóm (chặt, mặc định): trong khoảng / sai số | Theo nhóm tốt hơn ở |
|---|---|---|---|---|
| Tất cả | 214 | 34,6% / 7,4 | 33,6% / 9,0 | 76/214 phần |
| cn | 132 | 35,6% / 8,4 | 34,8% / 12,1 | 44 |
| cnmade | 34 | 52,9% / 6,1 | 47,1% / 8,0 | 12 |
| foreign | 48 | 18,8% / 6,5 | 20,8% / 4,8 | 20 |

Phủ: cách theo nhóm chặt chỉ ra giá ở 215/340 phần (cách chung 283/340), vì chỉ lấy gói cũ biết rõ nhóm.
Biến thể `--loose` (nhận cả gói không rõ nhóm, chỉ bỏ gói khác nhóm): 276/340 có giá; cặp 273: chung 31,1% / 8,0 — theo nhóm 33,0% / 8,4 (cn 10,0 vs 8,6; foreign 6,5 vs 6,7).

**Kết luận đo:** giá riêng theo nhóm KHÔNG cải thiện tổng thể (sai số mức giữa 7,4 → 9,0 điểm); chỉ tốt hơn cho động cơ ngoài Trung Quốc (6,5 → 4,8 điểm, n=48). Vì vậy code giữ giá hạng 1 làm giá chính; giá cấu hình khác nhóm là dòng tham khảo, gắn `basis:"code"` ("chưa qua Agent so cấu hình"). Đề xuất cho PR 2: chỉ hiện dòng giá theo nhóm khi nhóm đó là `foreign`, hoặc hiện kèm số đo này — chờ phiên điều phối quyết.

Tệp số liệu thô (scratchpad, không cam kết): `C:\Users\Khoa\AppData\Local\Temp\claude\d4c88f0a2fd88962\1d9803c8-58df-48ad-a17f-2807a13ac383\scratchpad\bt-before.txt`, `bt-after.txt`, `bt-loose.txt` (+ .json).

## 3 gói mẫu đối chiếu tay (câu trích điều khoản → số tính ra)
Nguồn: `analysis.result.contractTerms` trong doc-cache (Phân tích HSMT). **Lãi suất 9%/năm, giá dự thầu 1.000.000.000 đ, 90 ngày thực hiện là số giả định chỉ để minh hoạ phép tính** — trên web là ô người dùng nhập, không có thì không tính.

### 1. IB2600586587 — Mua sắm máy phát điện, Bệnh viện Mắt Huế (160 kVA liên tục)
- "Tạm ứng: Không" → tạm ứng 0%
- "Thời hạn thanh toán không quá 15 ngày kể từ khi Nhà thầu xuất trình đầy đủ các chứng từ" → 15 ngày
- "Giá trị bảo đảm thực hiện hợp đồng: 3 % giá hợp đồng" → 3%
- "0.4%/ ngày cho đến khi nội dung công việc đó được thực hiện." + "Chủ đầu tư sẽ khấu trừ đến 8%." → 0,4%/ngày, tối đa 8%
- "Thời gian giao hàng: ≤ 90 ngày tại đơn vị sử dụng." → gợi ý số ngày 90 (chỉ hiện trong lời nhắc thiếu)
- Tính: vốn lưu động 1e9 × 1 × 9% × (90+15)/365 = **25.890.411 đ**; bảo đảm THHĐ 1e9 × 3% × 9% × 90/365 = **665.753 đ**; tổng **26.556.164 đ**. Phạt: 4.000.000 đ/ngày, tối đa 80.000.000 đ (rủi ro, không cộng).
- Cần đọc tay: "Bảo đảm bảo hành" (chỉ ghi "bảo lãnh bảo hành", không có %).
- Khoản chi gợi ý: ATS ("Tủ ATS: Tự động chuyển nguồn lưới ↔ máy phát…"), ống xả ("Phụ kiện đi kèm: Tủ ATS; Ắc quy + dây nối; Ống xả…"), vỏ cách âm, đào tạo ("Đào tạo: Đào tạo vận hành, bảo dưỡng đến khi thành thạo…"), bảo trì định kỳ ("…kế hoạch bảo dưỡng định kỳ theo nhà sản xuất; bảo trì tối thiểu 03 tháng…"), lắp đặt ("Lắp đặt, chạy thử ngay sau khi bàn giao…"). Đã bỏ: "Biên bản thử tải xuất xưởng" (thử ở nhà máy, không phải tải giả tại chỗ), "hướng dẫn sử dụng" trong tài liệu.

### 2. IB2600592684 — Tổ máy 500 kVA và 30 kVA (Quảng Trị)
- "Tạm ứng: Theo thỏa thuận giữa các bên trong quá trình hoàn thiện hợp đồng." → không có % → **cần đọc tay**; dòng vốn lưu động amount = null, thiếu "% tạm ứng"
- "chậm nhất 90 ngày kể từ ngày cuối cùng hai bên hoàn thành giao nhận…" → 90 ngày
- "Giá trị bảo đảm thực hiện hợp đồng: 3 % giá hợp đồng" → **665.753 đ**
- "1%/ tuần…" + "khấu trừ đến 12%." → 1%/tuần ≈ 0,143%/ngày ≈ 1.428.571 đ/ngày, tối đa 120.000.000 đ
- "Thời hạn bảo hành là: Theo nhà sản xuất nhưng tối thiểu là 730 ngày." → 24 tháng → khoản chi gợi ý "Bảo hành 24 tháng (dài hơn 12 tháng)" loại % 
- "Thời gian thực hiện gói thầu: 60 ngày." → gợi ý số ngày 60
- Khoản chi gợi ý khác: vỏ cách âm, kiểm định ("…chứng nhận kiểm định của cơ quan kiểm định…"). ATS bị bỏ đúng vì Phân tích ghi "ATS: Không có trong tài liệu được cung cấp".

### 3. IB2600594596 — Máy phát 400 kVA + 300 kVA, Điện nước An Giang
- "Tạm ứng: 15 % giá trị hợp đồng." → 15%
- "…thanh toán cho Nhà thầu 80% giá trị của hợp đồng (đã bao gồm thu hồi 100% giá trị đã tạm ứng)." (Phân tích: "02 đợt") → **cần đọc tay** (thanh toán 2 đợt); vốn lưu động null, thiếu "hạn thanh toán"
- "Giá trị bảo đảm thực hiện hợp đồng: 3 % giá hợp đồng" → **665.753 đ**
- "giữ lại 5% giá trị bảo hành (Sẽ không giữ lại nếu Bên B cung cấp chứng thư bảo lãnh bảo hành)." + "Thời hạn bảo hành là: 365 ngày" → 1e9 × 5% × 9% × 365/365 = **4.500.000 đ**
- "0.5%/ ngày…" + "khấu trừ đến 12%." → 5.000.000 đ/ngày, tối đa 120.000.000 đ
- Tổng tính được **5.165.753 đ** (chưa gồm vốn lưu động vì cần đọc tay).
- Khoản chi gợi ý: bồn dầu ngoài ("Bồn dầu vuông 1000 lit…"), ống khói, vỏ cách âm, đào tạo ("Tài liệu hướng dẫn & đào tạo: … chương trình đào tạo…"), lắp đặt + kiểm định ("Phạm vi công việc: Cung cấp, vận chuyển tới địa điểm; lắp đặt, kiểm định…").
- Đối thủ (`rivalsOf`, CĐT "CÔNG TY CP ĐIỆN NƯỚC AN GIANG", tỉnh An Giang, 400 kVA): 77 nhà thầu; đầu bảng: Anh Quí 11 lượt/4 trúng/2 loại KT, tỉ lệ giá dự trung vị 96,3% [86,7–118,2]; Hoàng Phúc 10/1/4 loại KT, 75,5% [53,8–88,1]; Cơ điện APS 5/1/3, 99,7%. Gói của CĐT trong bidhist: IB2300190927, IB2500597081, IB2600448676 (đối chiếu được trên muasamcong).

Số lượng dữ liệu: chỉ **7/1.287** phân tích có `contractTerms` (Phân tích mới thêm), nên chi phí vốn sẽ trống ở phần lớn gói cũ cho tới khi phân tích lại.

## Rủi ro còn lại
- `costHints` dò chữ: có thể gợi ý dư (vd "Ống xả" là phụ kiện kèm máy, "lắp đặt" có trong phạm vi hầu hết gói). Chỉ là gợi ý, không cộng tiền; người dùng bấm mới thêm.
- `financeCost` coi tiền bảo đảm/giữ lại là vốn bị giam theo lãi suất người nhập (không tính phí bảo lãnh ngân hàng riêng); thời hạn bảo đảm THHĐ = số ngày thực hiện người nhập. Thanh toán nhiều đợt chưa tự tính → cần đọc tay.
- `rivalsOf`: `invKeyOf` không gộp "CP" với "CỔ PHẦN" (cùng hạn chế với nbForecast, không sửa để khỏi đổi dự báo); tỉ lệ giá dự có thể > 100% (giá dự cao hơn giá gói, giữ nguyên để mô tả).
- Giá theo nhóm: đo tệ hơn cách chung trừ nhóm foreign (xem trên).
- `result.byConfig` là trường mới trong `bidprice/<TBMT>`; web hiện tại bỏ qua trường lạ, nên an toàn trước PR 2. Bot cần restart task sau khi merge (vòng điều phối nạp 1 lần) — nhưng bidprice-bot chạy tiến trình con mỗi lần nên nhận code mới ngay khi main được fetch.

## Quay lui
Revert squash commit của PR #503; không có dữ liệu nào bị ghi đè (`byConfig` chỉ thêm vào kết quả mới; `quote/_cost` chưa có trường mới nào được ghi vì chưa có giao diện).

## Chưa kiểm được
- Chạy bot thật / agent (không được phép trong việc này) — `configPrices` mới thử bằng test với cấu hình giả; chưa chạy `bidprice-bot.mjs try` trên gói thật.
- Giao diện (PR 2).
