# Nghiệm thu: đầu phát theo datasheet hãng, PR B (config-bot + prompt), lần 1

**Ngày:** 20/11/2026
**PR:** https://github.com/khoanguyenminh6868/GenSet-Pro/pull/987 (DRAFT, chưa merge)
- nhánh `dau-phat-b`, commit 274504fc;
- rebase trên main b8752924 (#978).

**Tệp đổi:**
- `suppliers/config-bot.mjs`
- `suppliers/config-prompt.md`
- `suppliers/CLAUDE.md`
- `suppliers/dau-phat-hang.test.mjs` (mới, 13 test)
- fixture `suppliers/fixtures/runs/IB2600592684/config-1.expected.json`

**Script đo và kết quả thô:** `genbid-work\dieu-phoi\dau-vao\dau-phat-hang-b\`

## 1. Ca gốc IB2600603983

**Đáp án của Khoa:**
- động cơ 6M31G825/5;
- đầu phát Leroy-Somer LSA 49.3 M8 (820 kVA cấp H);
- AREP/PMG + D350;
- ngắn mạch 300 % / 10 s.

**Lệnh prep thật** (không chạy agent):

```
cd wt-dau-phat-b\suppliers
GENBID_LOCAL_SUPPLIERS=1 node config-bot.mjs prep --key IB2600603983 --out <dau-phat-hang-b>\prep-IB2600603983
```

**Đầu ra thật:**

```
{"cap":{"value":700,"unit":"kVA"},...,"makerAlts":["LSA 49.3 M8","LSA 49.3 L9"],...,"candidates":30,...}
```

**Mục mới trong catalog.md** (`prep-IB2600603983\catalog.md`, dòng 216):

```
### LSA 49.3 M8 — hãng Leroy-Somer, 820 kVA (Continuous cấp H 125 K / 40 °C, 50 Hz, 3 pha, 380 / 400 V)
- src: {"kind":"maker","supplierId":"leroy-somer-fuzhou","n":1012}
- tờ hãng ghi: cách điện cấp H; ổn định điện áp ±0,25 %; ngắn mạch 300 % / 10 s
- tuỳ chọn: Kích từ AREP / PMG; AVR D350
- nơi sản xuất mặc định của hãng: Pháp
```

**Kết luận:** code đưa ra M8, không phải M6.
- M6 730 kVA bị loại vì < 750 kVA. Mức 750 kVA lấy từ "Công suất đầu phát ≥ 750", lớn hơn mức tổ máy 700.
- TAL-A49 bị loại vì tờ ghi ngắn mạch 2,7 In / 5 s.

**`check` trên lượt đã lưu** (configmatch trên web, chép về `snap/`): 4 cấu hình chưa có đầu phát được code đặt LSA 49.3 M8:
- #1 6M31G825/5
- #3 12V2000G63
- #5 QSK23-G2
- #8 12V1600G11F

Check đầu phát của mỗi cấu hình đó:

| Check | Kết quả |
|---|---|
| Xuất xứ (thương hiệu G7/EU) | đạt |
| Cấp cách điện | đạt |
| Ổn định điện áp ±0,25 % | đạt |
| Ngắn mạch 300 % / 10 s | đạt |
| Quá tốc 2 250 v/p | đạt |
| Công suất đầu phát | **chưa rõ**: HSMT ghi nhiệt độ môi trường 45 °C, cột của tờ là 40 °C, cần hệ số suy giảm của hãng |
| Kiểu đầu phát; Kích từ | không có check, `scoreOf` tính là chưa rõ |

Hai check "không có": HSMT ghi "Xoay chiều, từ trường quay…" và "Không chổi than, tự động kích từ", không đòi PMG/AREP. Code không viết check cho các cụm chữ nó không biết. Trước đó agent cũng để hai mục này "chưa rõ".

**Chưa làm:** 6M31G825/5 chưa có trong mục Ứng viên của prep. Việc chọn động cơ không thuộc PR này.

## 2. Kiểm chéo toàn bộ (không lấy mẫu)

**Lệnh:**

```
node check-all.mjs <wt-dau-phat-b-base @ b8752924> goc.json
node check-all.mjs <wt-dau-phat-b> nhanh.json
node so-ab.mjs goc.json nhanh.json > so-ab.txt
```

**Phạm vi:** chạy lại `check` trên MỌI configmatch đã lưu: 17 lượt, 47 cấu hình.

**Kết quả** (`so-ab.txt`):
- 6 cấu hình đổi đầu phát;
- 6 cấu hình đổi điểm, **không** cấu hình nào đổi hạng;
- 39 check đổi trạng thái.

Mọi thay đổi đều nằm ở 3 lượt dưới đây. 14 lượt còn lại giống hệt.

**IB2600603983:** 4 cấu hình nêu ở mục 1.
- Đầu phát: (không) → LSA 49.3 M8, do code đặt.
- Điểm "chưa rõ" giảm 5 ở mỗi cấu hình.
- 7 check đổi trên mỗi cấu hình (28 check):

| Check | Trước | Sau |
|---|---|---|
| Xuất xứ | chưa rõ | đạt |
| Cách điện | chưa rõ | đạt |
| Ổn định U | chưa rõ | đạt |
| Ngắn mạch | chưa rõ | đạt |
| Quá tốc | chưa rõ | đạt |
| Kiểu đầu phát | chưa rõ | (không có) |
| Kích từ | chưa rõ | (không có) |

Lý do: code thay đầu phát thì bỏ check đầu phát cũ của agent rồi viết lại từ tờ hãng.

**IB2600602880**, #1 6BTAA5.9-G12: đầu phát (không) → TAL-A44-J, do code đặt.
- HSMT ghi: Hãng Leroy Somer, Model TAL-A44-J, xuất xứ "Trung Quốc", ±1 %, cấp H.
- 5 check đổi:
  - Hãng: chưa rõ → đạt;
  - Model: chưa rõ → đạt (đúng model HSMT nêu, xếp đầu danh sách);
  - Xuất xứ: chưa rõ → confirm ("cần xác nhận nơi sản xuất đầu phát", CO);
  - Ổn định U: chưa rõ → đạt;
  - Cách điện: chưa rõ → đạt.

**IB2600609805**, #1 6BTAA5.9-G12: đầu phát (không) → TAL-A44-J, do code đặt.
- Giống ca trên, thêm Công suất 150 kVA (cột liên tục cấp H, 400 V): chưa rõ → đạt.
- 6 check đổi.

**Không cấu hình nào bị code thay đầu phát NCC đã chào** (câu 1). Trong 17 lượt đã lưu, không lượt nào có đầu phát NCC chào mà tờ hãng chứng minh dưới mức. Ca này chỉ được kiểm bằng test (`makerAltFix câu 1`: M6 730 kVA → M8).

## 3. Test

**`node --test suppliers/`:** 1256 / 1256 qua, trên nhánh đã rebase.

**Hồi quy `regress-config`:** 8/8 qua sau khi cập nhật có chủ ý fixture IB2600592684/config-1. Lý do cập nhật:
- HSMT ghi "LEROY SOMER hoặc tương đương", "TAL-A42-E hoặc tương đương", cỡ 30 kVA.
- Code đặt TAL-A42-E cho 3 cấu hình không có đầu phát (FAWDE ×2, Cummins).
- Cấu hình Cummins + Stamford S0L2-P1 bị Cummins + TAL-A42-E (điểm tốt hơn) đẩy ra, do trần 1 cấu hình Cummins.
- FAWDE 4DX21 lên #3, Yuchai xuống #4.

**CI của PR #987:** xanh (4 check qua, 1 bỏ qua, 0 lỗi), mergeable CLEAN.

## 4. Chưa làm, chưa kiểm

- **Chưa chạy agent thật**, nên chưa biết agent có dùng mục mới trong catalog.md đúng như prompt viết hay không.
- **Màn hình web chưa có** (PR C): web chưa hiện cờ "đầu phát theo datasheet hãng", `was` / `wasWhy`, hay `options` kích từ / AVR.
- **RFQ gửi NCC chưa có.** Câu "cần NCC xác nhận lắp ghép" mới chỉ là chữ trong gaps của cấu hình.
- **Chưa làm Mecc Alte và Stamford > 750 kVA** (PR D). Hiện chỉ đọc được leroy-somer-fuzhou (84 model) và stamford-avk-china (114 model).
- Lấy số nhỏ nhất ở các điện áp HSMT: Stamford S5L1D-H4 bị loại ở IB2600603983 vì số 380 V thấp hơn 750, dù số 400 V đạt.
- 6M31G825/5 chưa vào Ứng viên của prep (xem mục 1).

## 5. Rủi ro

- **Điểm cấu hình tốt lên.** Check đầu phát cũ của agent bị xoá và code chỉ viết lại những check đọc được. Hai check còn lại (Kiểu, Kích từ) thành "không có", vẫn tính là chưa rõ. Nếu `scoreOf` đổi cách tính check thiếu, điểm sẽ lệch.
- **Trần mỗi hãng làm mất cấu hình** (IB2600592684): cấu hình Stamford bị cấu hình cùng động cơ Cummins mà đầu phát hãng điểm tốt hơn đẩy ra.
- **Model đọc từ tờ dải ghép dòng** ("| LSA | 52.3 | S5"): check bỏ kiểm "model không có trong nguồn" cho `fromMaker`.

## 6. Quay lui

- Tắt nhanh không cần deploy: biến môi trường `GENBID_MAKER_ALT=0` trên máy bot. Tắt cả prep lẫn `makerAltFix`; `altAttrChecks` / `lsSheetAttrs` vẫn chạy.
- Quay lui hẳn: revert squash commit của #987 (gồm cả fixture).

## 7. Câu hỏi cho Khoa (kèm khuyến nghị)

1. **Xuất xứ khi HSMT ghi một nước** (IB2600602880 / 609805 ghi "Trung Quốc").
   - Code ghi nơi sản xuất mặc định của Leroy-Somer là Pháp, nhưng dòng TAL-A44 nằm trên tờ của leroy-somer-fuzhou (Phúc Châu, Trung Quốc). Hiện code để **confirm** ("cần xác nhận nơi sản xuất đầu phát", CO).
   - **Khuyến nghị:** giữ confirm. Thêm một quy tắc riêng: tờ của nhà máy Phúc Châu → sản xuất tại Trung Quốc. Cần Khoa đồng ý vì việc này đổi `CAT.madeIn` cho mọi cấu hình.
2. **HSMT nêu model khác** (vd HSMT ghi TAL-A44-J mà model đó không đạt).
   - Code chọn model khác cùng hãng và để check Model **chưa rõ**.
   - **Khuyến nghị:** giữ chưa rõ. HSMT ghi "hoặc tương đương" thì có thể cho đạt; chờ Khoa quyết.
3. **Hiện trường 45 °C** (IB2600603983): check công suất đầu phát chưa rõ vì cột của tờ là 40 °C.
   - **Khuyến nghị:** giữ chưa rõ cho tới khi có hệ số suy giảm theo nhiệt độ của từng hãng. Chưa kiểm tờ đã lưu có ghi hệ số này hay không; đọc hệ số là việc sau, chưa làm.
