# Nghiệm thu: suy giảm công suất đầu phát theo hiện trường, PR B2, lần 1

**PR:** https://github.com/khoanguyenminh6868/GenSet-Pro/pull/997 (DRAFT, chưa merge)
- nhánh `dau-phat-b2`, commit ce39b16d;
- rebase trên main e0b64666.

**Lời Khoa 20/11/2026** (qua điều phối):
- suy giảm: "Tìm thử xem, nếu tìm không được thì để chưa rõ";
- stamford-avk-china là nhà máy Trung Quốc: "1. ok".

**Tệp đổi:**
- `suppliers/config-bot.mjs`
- `suppliers/config-prompt.md`
- `suppliers/CLAUDE.md`
- `suppliers/dau-phat-hang.test.mjs` (+3 test, sửa 2)
- `suppliers/cn/leroy-somer-fuzhou.json` (nguồn 6003)
- `suppliers/sources/leroy-somer-fuzhou/6003.md` (mới)

## 1. Nguồn hệ số (tìm được, lưu đúng quy trình)

**Stamford:** nguồn đã lưu `stamford-avk-china` 1001–1020. Mọi tờ ghi nguyên văn "3% for every 5°C by which the operational ambient temperature exceeds 40°C". Tờ 1001–1015 ghi thêm "3% for every 500 metres by which the operating altitude exceeds 1000 metres".

**Leroy-Somer:** các tờ đã lưu (1001–1014) không có hệ số theo nhiệt độ. Tài liệu chính hãng "LSA Rating Table":
- URL: https://www.leroy-somer.com/documentation_pdf/6627_en.pdf
- Lưu bằng lệnh `node suppliers/fetch-source.mjs leroy-somer-fuzhou 6003 <url>` thành `sources/leroy-somer-fuzhou/6003.md` (Accessed 2026-11-20).
- Bản ghi nguồn 6003 trích nguyên văn:
  - "Multiply nominal rating by derating factors indicated in the following table."
  - "Ambient T °C 25 40 45 50 55 60 (*)"
  - "Class H 1.076 1 0.973 0.946 0.918 0.889"
  - "Altitude (m) 1 000 … 4 000"
  - "Derating factor 1 0.975 … 0.837"
- `node suppliers/verify.mjs`: 435 bản ghi, 0 lỗi.

## 2. Code

**`makerDerate(alt, site, sourcesDir)`** đọc hệ số từ tệp nguồn lúc chạy. Không có hằng số nào gõ tay.
- Stamford: theo câu của chính tờ model. Số bước = làm tròn lên (mức HSMT − 40) / 5, tức là mốc nóng hơn.
- Leroy-Somer: chỉ model LSA (tài liệu là "LSA Rating Table"). Lấy cột bằng hoặc ngay trên mức HSMT, không nội suy.
- Có cả nhiệt độ và độ cao thì nhân hai hệ số.
- Thiếu một phần (TAL, hãng khác, > 60 °C, độ cao vượt bảng) → không có hệ số.

**Áp chỉ khi HSMT ghi hiện trường > 40 °C hoặc > 1.000 m** (`hsmtCombo().site`).

**Check "Công suất đầu phát" của đầu phát theo datasheet hãng:**
- có hệ số → **đạt / không đạt**, ghi nguồn và phép tính, có thêm trường `derate`;
- không có hệ số → **chưa rõ**, ghi đã tìm ở đâu.

**`makerAlts`:** so kVA sau suy giảm với mức HSMT. Model thiếu hệ số thì giữ số trên tờ, đưa vào `unknown` và xếp sau. Mục catalog.md ghi số sau suy giảm.

**`MAKER_PLANT`:** thêm `stamford-avk-china` → Trung Quốc, cùng luật thương hiệu / nơi sản xuất như Phúc Châu.

## 3. Kiểm chéo toàn bộ 17 lượt (không lấy mẫu)

**Lệnh:**
```
node check-all.mjs <wt-dau-phat-b2-base @ 8b5184eb> goc-b2.json
node check-all.mjs <wt-dau-phat-b2> nhanh-b2.json
node so-ab.mjs goc-b2.json nhanh-b2.json > so-ab-b2.txt
```

**Tổng:** 47 cấu hình; 0 cấu hình đổi đầu phát; 4 đổi điểm, không cấu hình nào đổi hạng; 4 check đổi trạng thái. Mọi thay đổi đều ở IB2600603983 (HSMT ghi 45 °C), đầu phát LSA 49.3 M8:

| Cấu hình | Check Công suất đầu phát | Số "chưa rõ" |
|---|---|---|
| #1 6M31G825/5 | chưa rõ → đạt | 9 → 8 |
| #3 12V2000G63 | chưa rõ → đạt | 9 → 8 |
| #5 QSK23-G2 | chưa rõ → đạt | 7 → 6 |
| #8 12V1600G11F | chưa rõ → đạt | 8 → 7 |

Phép tính trong ghi chú của check: 820 kVA × 0.973 = 797,9 kVA ≥ 750 kVA HSMT.

**stamford-avk-china → Trung Quốc:** 0 lượt đổi. Trong 17 lượt không cấu hình nào dùng đầu phát Stamford theo datasheet hãng.

**Fixture hồi quy:** không đổi. Bản đóng băng không có nguồn 6003, nên check vẫn chưa rõ như cũ.

## 4. Test

- `node --test suppliers/`: 1270 / 1270 qua, trước rebase cuối. Main kể từ 8b5184eb không đổi code `suppliers/`.
- Sau rebase: `dau-phat-hang` + `regress-config` qua 24 / 24.
- **CI #997** trên ce39b16d: xanh (server, suppliers, Vercel qua; Supabase bỏ qua).

## 5. Chưa làm, rủi ro

**Chưa làm:**
- TAL (Leroy-Somer) chưa có hệ số. Tài liệu 6627 chỉ nói về LSA, nên vẫn "chưa rõ".
- Mecc Alte (PR D) chưa có.
- `makerAltFix` chưa dùng suy giảm khi xét đầu phát NCC chào có "dưới mức" hay không. Nó vẫn so cột 40 °C, nên đầu phát NCC chào không bị thay vì nhiệt độ.

**Rủi ro:**
- Hệ số đọc từ tệp nguồn lúc chạy. Nếu tệp 6003 bị sửa hoặc xoá, check quay về "chưa rõ" (không sai, chỉ mất kết luận).
- Bảng LS nằm trong tài liệu ghi "LSA Rating Table". Tôi áp cho mọi model LSA trên tờ của leroy-somer-fuzhou.

**Quay lui:** revert squash commit của #997. Hoặc tắt toàn bộ đầu phát hãng bằng `GENBID_MAKER_ALT=0`.
