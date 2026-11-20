# Nghiệm thu ung-vien-ab-1: luật A + B ở bước chọn ứng viên (20/11/2026)

PR draft [#996](https://github.com/khoanguyenminh6868/GenSet-Pro/pull/996), nhánh `ung-vien-ab`, worktree `wt-ung-vien-ab`. Đã gộp origin/main sau #987 (3d7f04be; phần gộp không chạm `candidates`). CI xanh (4 qua, 1 bỏ qua). Khoa duyệt 20/11 nguyên văn "làm cả A và B". Script và bản in: `dieu-phoi\dau-vao\ung-vien-ab\`.

## Đã làm (chỉ trong `candidates`, `suppliers/config-bot.mjs`)
- **A**: +40, lý do "động cơ có datasheet hãng", khi `engineMakerSheets(e, ef, sup)` có NCC. Định nghĩa chặt (ghi trong code):
  - Fact phải mang `sheet` (của `modelFacts`, cờ Quy tắc B `makerSheetChecks` đang dùng). Đó là bảng của NCC `role: engine_maker` có tiêu đề ghi ĐÚNG MỘT mã là model đó, hoặc dòng bảng của chính NCC đó ghi đúng mã.
  - Hoặc fact mang `maker`: công suất động cơ do engine_maker ghi.
  - VÀ một hãng của `e.make` phải có trong tên / thương hiệu / id của NCC đó.
  - Không tính: bảng "Datasheet: …" của hãng tổ máy / NCC lắp ráp; tờ khung máy chia cho các model của khung; tiêu đề nêu hai model.
  - Cũng không tính NCC engine_maker ghi động cơ hãng khác, hoặc động cơ chưa rõ hãng. Trên danh mục hiện tại bị loại: sdec → Mitsubishi S12R/S16R (9 model); weichai-power, hanma-tech, ricardo-weifang, changsong-weifang → động cơ chưa rõ hãng (14 model).
  - Toàn danh mục: 390 / 6.878 động cơ có A. Nhiều nhất: weichai-power 137, wudong-wuxi 55, sdec 50, volvo-penta 25, googol 22 … dcec (Cummins) 10, perkins 6, baudouin 1.
- **B**: `pick(..., { models: true })`. Một dòng của model đã có k dòng được chọn sẽ chờ, khi cùng hãng còn dòng mở (điểm > 0, chưa vướng trần NCC / động cơ / hãng) của model có ít hơn k dòng; xét lại sau mỗi dòng chọn. Dòng không rõ hãng không xét.
  - Áp ở `MAKE_ROWS` (G7 / EU / G20, không nêu hãng). Nay xét MỌI dòng của hãng: model khác nhau trước, hãng ít model hơn 3 vẫn đủ 3 chỗ (trước: mỗi động cơ một dòng, hãng 1 model chỉ được 1 chỗ).
  - Áp ở lượt lấp chung khi có trần mỗi hãng (`capOn`: HSMT không nêu hãng / model động cơ).
  - KHÔNG áp ở `CN_ROWS`: đó là 12 chỗ của cả NHÓM hãng TQ, không phải chỗ của một hãng, và tôi không chắc → chờ Khoa (câu hỏi 1).
  - KHÔNG áp khi HSMT nêu hãng / model: không có chỗ theo hãng, model nêu đích danh được 8 dòng như cũ.
- Cờ quay lui: `GENBID_CAND_A=0` / `GENBID_CAND_B=0` (mặc định bật). Tắt cả hai thì 30 dòng IB2600603983 y hệt main (đã so cả trước và sau khi gộp).

## Test
- `suppliers/cand-ab.test.mjs`, 8 ca, fixture `country: "CN"`:
  - A: cộng đúng 40.
  - A: không tính trang lắp ráp.
  - A: không tính engine_maker khác hãng / động cơ chưa rõ hãng / fact không `sheet`.
  - A: tiêu đề hai model thì không model nào được.
  - B: model khác trước, rồi dòng thứ hai.
  - B: không áp khi HSMT nêu hãng.
  - B: chỉ đổi thứ tự, không bỏ trống chỗ.
  - B: MAKE_ROWS khi G7/EU.
- `node --test suppliers/`: trước khi gộp 1.261 / 1.261 qua. Sau khi gộp: 1 ca hỏng ở `cover-prep.test.mjs` (`ENOTEMPTY` khi xoá thư mục tạm dùng chung `%TEMP%\genbid-catalog`). Chạy lại riêng tệp: lần 1 hỏng một ca KHÁC, lần 2 qua 34 / 34 → lỗi chập chờn do thư mục tạm, không liên quan `candidates`.
- `regress-config` không đổi: test này chạy `check`, không chạy `candidates`.

## IB2600603983 (prep mới chạy 20/11, cap 700 kVA, origin g7eu)
Bản in đầy đủ: `cand-truoc.txt` / `cand-sau.txt`; 30 dòng hai bên: `ib-30b.txt`.

Lưu ý: trên main hiện tại, 6M31G825/5 voltgent n110 đã có **222 điểm, hạng #17, ĐÃ trong 30 dòng**, không phải 190 / hạng 141. Phần 32 điểm hơn đến từ 4 khoá thông số của tờ hãng `baudouin` n1021 (bore, disp, cooling, asp, compr, gov), có lẽ chưa có trong `suppliers.json` của lần đo trước.
- **Sau A + B**: 6M31G825/5 voltgent **262 điểm (222 + 40, A từ NCC `baudouin`), hạng #8**. Mục tiêu đạt mà không vá riêng cho gói.
- Dòng vào / ra (trước → sau):
  - **Do A** (+40 cho động cơ có tờ hãng: Volvo Penta TWD1645GE / TWD1744GE từ `volvo-penta`; Baudouin 6M33G825/5, 6M31G825/5, 6M31G900/5 từ `weichai-power` / `baudouin`). Vào: Volvo Penta TWD1744GE jet-power, Volvo Penta TWD1653GE rcg-power. Ra: Perkins 4006-23TAG2A koten-power và uleengen UP750GF, Perkins 4006-23TAG3A uleengen UP800GF và voltgent P900-1. Các động cơ Perkins 4006 không có tờ hãng trong `perkins`, nên tụt so với dòng +40.
  - **Do B** (Baudouin được chia theo model ở lượt lấp chung). Vào: Baudouin 6M31G900/5 voltgent, Baudouin "6M33G8D3/5 (6M33G825/5)" kaihua (mã trùng, phiên catalog đang sửa). Ra: Mitsubishi S6R2-PTAA stone-power, S6R2-PTAA-C fdk-energy.
  - **Do B** (Perkins / Cummins chia theo model). Vào: Perkins 2806A-E18TTAG5 voltgent, Cummins QSK23-G3 fdk-energy.
  - Số model khác nhau trong 30 dòng tăng.
- Baudouin trong 30 dòng: trước 3 (6M33G825/5, 6M33G750/5, 6M31G825/5); sau 5 (thêm 6M31G900/5, 6M33G8D3/5 (6M33G825/5)).

## Đo MẪU (không phải toàn bộ)
- Phạm vi: 1/10 gói máy phát trong bidhist (bản chụp 20/11 12:30; gói xếp theo số TBMT, lấy i % 20 ∈ {0, 10}), code nhánh trước khi gộp (3a16b04e, phần `candidates` giống bản sau gộp). Bốn bản trên cùng dữ liệu `suppliers/cn` của worktree: off (= main), A, B, A+B.
- Quy mô: 91 gói, 114 lượt, 0 lỗi. Khoá dòng không có đầu phát. Script `mau-ab.mjs`, tổng hợp `tong-hop.mjs` → `tong-hop.txt`.

**Kết quả:**
- Tập 30 dòng đổi ở **100 / 114 lượt** khi A+B (chỉ A: 81, chỉ B: 86). Tính cả đổi thứ tự: 107.
- Theo xuất xứ HSMT: all 86 / 95, g7eu 7 / 10, g20 5 / 5, g7 2 / 4.
- 846 dòng vào / 844 ra, trung bình ~7,4 dòng mỗi lượt.
- Dòng có "động cơ có datasheet hãng" trong top 30 sau: 757 / 3.310 (23%).
- Số model động cơ khác nhau trung bình trong 30 dòng: off 17,6 → A 17,8 → B 22,8 → A+B 22,8.
- Hãng vào nhiều nhất: Weichai 97, Cummins 92, Baudouin 83, SDEC 74, Deutz 69, Perkins 61, Ricardo 55, Doosan / Hyundai 38.
- Hãng ra nhiều nhất: Cummins 245, Perkins 241, Yangdong 65, Yanmar 59, Yuchai 58.
- Cummins và Perkins vẫn vào nhiều, nhưng là model khác: B thay dòng thứ 2–3 của cùng model bằng model khác.

**10 lượt đổi nhiều nhất** (chi tiết từng dòng trong `tong-hop.txt`):

| Lượt | Xuất xứ | Cỡ | Đổi | Chỉ A | Chỉ B |
|---|---|---|---|---|---|
| IB2500198948#0 | all | 250 kVA | 19 | 20 | 8 |
| IB2300356827#0 | all | 250 kVA | 17 | 17 | 9 |
| IB2500331496#0 | all | 250 kVA | 17 | 17 | 10 |
| IB2400064139#0 | all | 20 kVA | 15 | 11 | 10 |
| IB2400377239#0 | all | 400 kVA | 15 | 13 | 6 |
| IB2200023019#0 | all | 200 kVA | 15 | 13 | 10 |
| IB2300064290#0 | all | 160 kVA | 15 | 13 | 10 |
| IB2300190927#1 | all | 150 kVA | 15 | 9 | 10 |
| IB2400393855#0 | all | 1000 kVA | 15 | 11 | 10 |
| IB2300135189#0 | all | 30 kVA | 14 | 6 | 11 |

Giải thích chung, soát tay hai lượt đầu và lượt cuối:
- **Ở gói "all", A đưa vào động cơ TQ có trang chính hãng trong `cn/`.** Ví dụ IB2500198948 (250 kVA): SDEC SC9D340D2, Weichai WP10D264E200, YTO YM6H4LF-D, Deutz BF6M1015C, Baudouin 6M12G8D3/5, Wudong WD129TAD23 đều "+A". Đẩy ra: Cummins NT855 / 6LTAA8.9, Perkins 1206A / 1506A, Yuchai YC6MK350. Cummins chỉ có 10 động cơ có tờ hãng (`dcec`), Perkins 6, Yuchai 0. Vậy A thưởng hãng mà danh mục đã cào được trang chính hãng, không thưởng động cơ "tốt hơn".
- **B tách các dòng cùng model.** Ví dụ IB2300135189 (30 kVA): trước có Cummins 4B3.9-G1 / -G2 nhiều NCC, Yangdong Y4102D hai lần; sau có Ricardo K4100D / 495D, Deutz BFM3 / F4L912D, Kubota V3300, SDEC 4Z3.0 / 4Z3.2, các model Baudouin 4M.
- **Còn trùng model trong 12 chỗ hãng TQ** vì B không áp ở `CN_ROWS`. Ví dụ IB2500198948: SDEC SC9D340D2 vào 3 lần (fdk-energy, longkai, bobig).

## Rủi ro
- A thiên về hãng có trang chính hãng trong `cn/` (Weichai 137 động cơ, Wudong 55, SDEC 50) so với Cummins (10) / Perkins (6) / Yuchai (0). Ở gói không đòi xuất xứ, dòng TQ tăng mạnh. Đây là hệ quả của độ phủ dữ liệu, không phải chất lượng động cơ.
- `weichai-power` (role engine_maker, thương hiệu Weichai + Baudouin) được tính là "datasheet hãng" cho Baudouin, kể cả dòng ở bảng tổ máy của chính Weichai (WPG825*7 …). Theo định nghĩa đó là trang của hãng / tập đoàn động cơ, không phải NCC lắp ráp, nhưng Khoa nên biết.
- B làm hãng ít model hơn 3 ở `MAKE_ROWS` nay chiếm đủ 3 chỗ bằng dòng thứ hai / ba của cùng model (trước chỉ 1). Chỗ đó lấy từ lượt lấp chung.
- Mã trùng (vd. "6M33G8D3/5 (6M33G825/5)" ↔ 6M33G825/5) là hai model với B cho tới khi catalog gộp mã (phiên khác).
- Quay lui: đặt biến môi trường `GENBID_CAND_A=0` và / hoặc `GENBID_CAND_B=0` cho bot, không cần đổi code.

## Chưa kiểm
- Top 30 TOÀN BỘ gói lịch sử gốc ↔ nhánh: chưa đo (điều phối giao phiên cloud, `do-gop.mjs`). Số ở trên chỉ là mẫu 1/10.
- Ảnh hưởng tới cấu hình cuối (agent + `check` / `rankConfigs`): không chạy Gợi ý thật (theo yêu cầu).
- `Đồng bộ thương hiệu` (`sync`, chỗ exempt) không đổi; không có ca test riêng cho B khi có sync.

## Điểm cần Khoa quyết
1. **B có áp cho 12 chỗ hãng TQ (`CN_ROWS`) không?** Hiện KHÔNG áp, nên SDEC SC9D340D2 vẫn có thể chiếm 3 trong 12 chỗ. Khuyến nghị: **CÓ áp** (cùng tinh thần "model khác trước", trong nhóm TQ chia theo từng hãng). Việc này nhỏ: thêm `{ models: true }` vào lời gọi `pick` của `CN_ROWS` + 1 test.
2. **A có nên tính cả độ phủ không?** A làm 100 / 114 lượt mẫu đổi và đẩy Cummins / Perkins / Yuchai xuống vì thiếu tờ hãng trong `cn/`, không vì động cơ kém. Khuyến nghị: giữ A như duyệt, đồng thời bổ sung tờ hãng Cummins / Perkins / Yuchai (việc dữ liệu). Nếu Khoa thấy top 30 lệch hẳn về TQ thì tắt A bằng `GENBID_CAND_A=0` tới khi đủ dữ liệu.
3. **MAKE_ROWS: hãng chỉ có 1–2 model có nên lấy dòng thứ hai / ba của cùng model cho đủ 3 chỗ không?** Bản này: có, theo câu "hết model mới tới dòng thứ hai". Khuyến nghị: giữ.
