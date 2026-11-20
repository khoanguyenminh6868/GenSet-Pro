# Nghiệm thu: đầu phát theo datasheet hãng, PR B, lần 2 (4 câu trả lời của Khoa 20/11/2026)

**PR:** https://github.com/khoanguyenminh6868/GenSet-Pro/pull/987 (DRAFT, chưa merge)
- nhánh `dau-phat-b`, đã rebase trên main e1da9414 (#957);
- lần 1: `dau-phat-hang-B-1.md`.

**Lời Khoa (qua điều phối, nguyên văn):** "1. vì sao không thể giữ lại cả 2 cấu hình nếu phù hợp? 2. ok 3. cho đạt khi có "hoặc tương đương" 4. Tìm thử xem, nếu tìm không được thì để "chưa rõ"".

## 1. Giữ cả hai cấu hình (câu 1): ĐÃ LÀM

**Luật mới trong `rankConfigs`:** hai cấu hình cùng động cơ, một bản có đầu phát NCC chào và một bản có đầu phát `fromMaker`, được tính là MỘT chỗ của trần mỗi hãng động cơ (`perMakeConfigs`).
- Cả hai cùng hiện; bản xếp sau đứng ngay dưới bản xếp trước.
- Mỗi cấu hình chỉ ghép cặp một lần.
- Trần 3 cấu hình mỗi động cơ vẫn áp dụng.
- `config-prompt.md` có cùng luật.

**MAX_CONFIGS: không thể vượt.** `check` cắt `result.configs` còn 8 (dòng `slice(0, MAX_CONFIGS)`) TRƯỚC `makerAltFix` và `rankConfigs`. Hai bước này không bao giờ thêm cấu hình: `makerAltFix` chỉ đặt hoặc thay đầu phát trên cấu hình agent đã viết. Vì vậy không cần tính cặp là một chỗ ở MAX_CONFIGS.

**Số lượt bị ảnh hưởng:**
- 17 lượt đã lưu: **0 lượt** (`so-ab.txt`: không có cấu hình thêm hay mất). Không lượt nào có cặp như vậy.
- Fixture: 1 / 8 là IB2600592684/config-1 (cỡ 30 kVA). Giờ giữ cả #1 Cummins 4B3.9-G12 + TAL-A42-E (code đặt) và #2 Cummins 4B3.9-G12 + Stamford S0L2-P1 (NCC chào); fixture có 6 cấu hình.
- Test: `rankConfigs: cùng động cơ, đầu phát NCC chào + đầu phát hãng …` trong `dau-phat-hang.test.mjs`.

## 2. Tờ nhà máy Phúc Châu → sản xuất tại Trung Quốc (câu 2): ĐÃ LÀM, không đụng `web/catalog.js`

**Hàm mới `makerMadeOf(supplierId, make, model)`** trong config-bot:
- Bảng `MAKER_PLANT`: `leroy-somer-fuzhou` → CN, lý do "tờ của nhà máy Phúc Châu".
- Ngoài bảng đó: theo `CAT.madeIn` như cũ.
- Trả kèm `brand` = nước của thương hiệu (Leroy-Somer → Pháp).

**Áp dụng:**
- `makerAlts` khi lọc theo nhóm xuất xứ: HSMT đòi nhãn hiệu thì xét nước của thương hiệu; đòi nơi sản xuất thì xét nơi sản xuất.
- `makerAltChecks`:
  - nhóm, đòi nhãn hiệu → theo thương hiệu;
  - nhóm, đòi nơi sản xuất → theo nơi sản xuất. Tờ Phúc Châu (CN) ngoài G7 → **không đạt**;
  - HSMT ghi một nước → **đạt** khi tờ nhà máy cùng nước, không thì confirm (CO).
- Mục catalog.md ghi: "nơi sản xuất: Trung Quốc (tờ của nhà máy Phúc Châu (leroy-somer-fuzhou)); thương hiệu Leroy-Somer: Pháp".

**Ảnh hưởng trên 17 lượt:**
- IB2600602880 và IB2600609805, Xuất xứ đầu phát TAL-A44-J: confirm (lần 1) → **đạt**. HSMT ghi "Trung Quốc".
- IB2600603983 không đổi. HSMT ghi "Nhà sản xuất / nhãn hiệu thuộc nhóm G7, EU"; `madeBasisOf` đọc là đòi nhãn hiệu, nên Leroy-Somer (Pháp) vẫn đạt và LSA 49.3 M8 vẫn được chọn.

**Chưa làm:** `stamford-avk-china` cũng là tờ của nhà máy Trung Quốc nhưng chưa vào `MAKER_PLANT`. Khoa chỉ duyệt Phúc Châu. Câu hỏi ở mục 6.

## 3. Model "hoặc tương đương" (câu 3): ĐÃ LÀM

Check Model đầu phát khi HSMT nêu một model mà code chọn model khác cùng hãng:
- HSMT có "tương đương" → **đạt**. Ghi chú nêu model HSMT và lý do đổi (model HSMT nêu không có trong danh sách code lọc).
- HSMT không có "tương đương" → giữ chưa rõ.

Có test riêng cho cả hai trường hợp.

**Ảnh hưởng:**
- 17 lượt: không lượt nào đổi. Hai lượt nêu model (602880 / 609805: TAL-A44-J) đã được chọn đúng model đó, vì model HSMT nêu được xếp đầu.
- Fixture IB2600592684: HSMT nêu "TAL-A42-E hoặc tương đương" và code chọn đúng TAL-A42-E.

## 4. Suy giảm theo nhiệt độ môi trường (câu 4): ĐÃ TÌM, CHƯA ÁP. Tách PR B2

**Trong nguồn đã lưu:**
- `stamford-avk-china` 1001–1020: mọi tờ đều ghi nguyên văn "3% for every 5°C by which the operational ambient temperature exceeds 40°C".
  - 1018 và 1020 ghi thêm "@ Class H temperature rise".
  - Tờ cũng có giảm theo độ cao: "3% for every 500 metres … exceeds 1000 metres"; 2001 có bảng hệ số 1500 m = 0.97 …
- `leroy-somer-fuzhou` 1001–1014: không có hệ số theo nhiệt độ. Chỉ có "Altitude ≤ 1 000 m", giảm do lọc gió (5 % / 10 %), và một số mục "derating coefficient" riêng của TAL.

**Tài liệu chính hãng Leroy-Somer** https://www.leroy-somer.com/documentation_pdf/6627_en.pdf ("LSA Rating Table"), đọc ngày 20/11/2026, có bảng:

| Ambient T °C | 25 | 40 | 45 | 50 | 55 | 60 (*) |
|---|---|---|---|---|---|---|
| Class H | 1.076 | 1 | 0.973 | 0.946 | 0.918 | 0.889 |

Tài liệu này còn có bảng độ cao.

**Chưa lưu tệp này vào `suppliers/sources/`, chưa áp vào code.** Lưu nguồn đúng quy trình (tải PDF, `maker-datasheets.mjs` hoặc tệp nguồn mới, verify) và áp hệ số là PR B2, như điều phối cho phép, để không chặn phần 1–3.

**Ước tính nếu áp** (CHƯA phải đầu ra của code): IB2600603983, M8 820 kVA × 0.973 ≈ 798 kVA ≥ 750 → đạt. Hiện check công suất vẫn **chưa rõ**.

## 5. Kiểm

**Kiểm chéo toàn bộ 17 lượt** (gốc @ b8752924 ↔ nhánh trước rebase cuối, cùng dữ liệu):
- 47 cấu hình; đổi đầu phát 6; đổi điểm 6, không đổi hạng; check đổi trạng thái 39.
- So với lần 1:
  - Xuất xứ của 602880 / 609805: confirm → đạt;
  - không cấu hình nào thêm hoặc mất.
- Chi tiết: `dau-vao\dau-phat-hang-b\so-ab.txt`.
- Lần rebase cuối chỉ kéo dữ liệu (#957 dropspec, #971 Baudouin, bộ nhớ). Chưa chạy lại kiểm chéo trên dữ liệu mới.

**Test:**
- `node --test suppliers/` trước rebase: 1257 / 1257 qua.
- Sau rebase lên e1da9414 (commit 027949c8): 1267 / 1267 qua.
- CI #987 trên 027949c8: xanh (server, suppliers, Vercel qua; Supabase bỏ qua).
- `dau-phat-hang.test.mjs`: 14 test.

## 6. Câu hỏi cho Khoa

1. **`stamford-avk-china`** (nhà máy Stamford ở Trung Quốc): có coi là sản xuất tại Trung Quốc như Phúc Châu không?
   - **Khuyến nghị:** có, nếu tờ ghi địa chỉ nhà máy ở Trung Quốc. Cần kiểm chữ tờ trước; chưa làm.
2. **PR B2 (suy giảm theo nhiệt độ):**
   - Stamford theo công thức của tờ (3 % mỗi 5 °C);
   - Leroy-Somer theo bảng 6627_en.pdf (cấp H; nhiệt độ ở giữa hai mốc thì lấy mốc nóng hơn, không nội suy).
   - **Khuyến nghị:** làm như vậy.

## Quay lui

- `GENBID_MAKER_ALT=0`: tắt đầu phát hãng; khi đó cặp cấu hình cũng không còn.
- Revert squash commit của #987.
