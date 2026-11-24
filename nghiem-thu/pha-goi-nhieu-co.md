# Số pha gói nhiều cỡ (24/11/2026)

PR #1118, nhánh `fix/mot-pha-hai-tan-so`: `47d66424` → **`96e51b24`** (commit thường, đã push, KHÔNG merge).
Test `node --test suppliers/*.test.mjs`: 1.640 pass ở 96e51b24, 1.641 pass ở bb280392, 0 fail (thêm 4 test, cả 3 hỏng trên mã cũ). `verify` 0 lỗi; `quality --check` không xấu đi;
`spec-diff git:47d66424 . --gate` xanh (0 đổi, đảo vai 0 → 0). Lưu ý: dòng Co-Authored-By của commit có tên model (theo nhắc của hệ thống); không sửa được vì cấm force-push.

## 1. Gốc lỗi
`minsForSize` lấy số pha (khoá `phase`) theo KHỐI công suất (`sizeBlocks().runs`): khối của một cỡ chạy từ dòng nêu công suất cỡ đó tới dòng nêu cỡ kế tiếp.
IB2300003199: chữ HSMT xếp theo hạng mục "Tổ máy phát điện chính" (91 kW động cơ / 80 kW máy phát, 3 pha) rồi "Tổ máy phát điện sinh hoạt" (13 kW / 08 kWe, 1 pha).
Dòng "sinh hoạt … 13 kW; máy phát 08 kWe, 50Hz, 1 pha" không mở khối mới ("08 kWe" không khớp `kW\b`, "13 kW" đứng sau chữ động cơ) nên nằm trong khối 80 kW
→ lượt 80 kW `how.phase = own`, số pha 1. Khối 8 kW kéo tới cuối chữ, có cả 3 lẫn 1 pha → không rõ. (Cỡ 91 / 13 kW là công suất động cơ bị `sizesOf` đọc thành cỡ: việc khác.)

## Sửa (`phaseForSize` trong `suppliers/config-bot.mjs`, gọi cuối vòng khoá của `minsForSize`)
Mỗi dòng nêu pha gắn với các cỡ nó nói tới, theo thứ tự: (1) dòng mở bằng máy ("Máy 15 kVA 1 pha: …", `tags` ≥ 0) / "Cả N loại máy" (mọi cỡ);
(2) công suất ghi trên chính dòng khớp cỡ (±0,5 %); (3) hạng mục chung ("Chung…", "yêu cầu chung", "tất cả / cả N loại máy") → mọi cỡ;
(4) hạng mục (chữ trước dấu ":" đầu dòng) mà các dòng của nó nêu công suất của cỡ nào → các cỡ đó; (5) còn lại không gắn được.
Dòng tự nêu cả 1 lẫn 3 pha: gắn đúng một cỡ thì cỡ đó không rõ; gắn nhiều cỡ thì bỏ dòng.
Cỡ có dòng gắn: một loại → loại đó (`how = tied`), hai loại → null. Không dòng nào gắn mà gói có dòng gắn cỡ khác, hoặc gói nêu cả hai loại → null.
Gói không gắn được dòng nào và chỉ nêu một loại → giữ kết quả theo khối như cũ (`own` / `agreed` / `common`; còn 6 lượt, đều đúng).
Không suy số pha từ cỡ máy. Gói một cỡ không đổi (`phaseOf` cả chữ).

## 2. Kiểm toàn bộ lượt nhiều cỡ (bidhist cục bộ `doc-cache\bidhist.json`, 1.093 lượt như do-gop)
Tập soát: MỌI lượt nhiều cỡ có pha 1 hoặc 3 ở `47d66424` hoặc sau sửa = **243 lượt**. Chứa đủ 148 lượt nhiều cỡ của `ra-le.tsv` (cột `ruled bên mới` có phase: 73 lượt 1 pha + 75 lượt 3 pha; 0 lượt thiếu).
Cách đối chiếu (độc lập với cách gắn của code): với mỗi lượt lấy các dòng `technicalSpecs` của Phân tích (`doc-cache\analysis.json`) có chữ pha mà item hoặc requirement nêu con số
của cỡ; không có thì đoạn của `keyInfo.generatorCapacity` chứa con số đó; không có thì loại pha duy nhất của cả gói. 19 lượt không khớp tự động thì đọc tay từng dòng Phân tích.
Kết quả: **đúng 232, không đủ căn cứ 11 (đều là code nay trả không rõ, giữ dòng), sai 0** sau sửa. Trước sửa sai **1** (IB2300003199#2).
- 200 khớp dòng Phân tích nêu cỡ, 1 khớp đoạn công suất, 23 khớp vì cả gói chỉ một loại pha (soát tay 7 lượt trong đó đổi từ không rõ → có pha: đều một máy đọc thành hai cỡ liên tục / dự phòng hoặc dòng "Chung"/hạng mục ghi pha), 8 soát tay đúng.
- 11 "không đủ căn cứ": trước có pha đúng theo cả gói, nay null vì không dòng pha nào gắn được với cỡ đó; 10 / 11 là cỡ ảo (số dự phòng của máy khác bị `sizesOf` tách thành cỡ: IB2600075436 120 / 230 kVA, IB2500460613 10 kVA, IB2400145438 8 / 13,7 kVA …), IB2400152304 là một máy 3 pha có ngả ra 230 V 1 pha.
Chữ đối chiếu (có trích Phân tích) để NGOÀI git: `genbid-work\tan-so-pha-2411-local\pha-goi-nhieu-co-doi-chieu.tsv`, `pha-goi-nhieu-co-rev.tsv`.

## 3. Gói một cỡ
Lượt một cỡ có cỡ > 30 kVA mà code ra 1 pha: **1 lượt**, IB2300059621 (47.000 kVA, máy phát thuỷ điện hiện hữu): **sai**. Chữ "1 pha" là của cuộn dây stator
("… 2 nhánh song song trên 1 pha"), không phải số pha của máy. Gói một cỡ: 1 pha 134, 3 pha 454, không rõ 144 lượt, không đổi ở `96e51b24`.

### Vòng 2 (điều phối 24/11/2026: sửa luôn, theo mẫu chữ): commit `bb280392`
`phasesIn` bỏ cụm mô tả cuộn dây / đại lượng theo pha TRƯỚC khi đọc: "trên / mỗi / từng / giữa (các) / cho mỗi [1|3|một|ba] pha", "per / each / between [one|three] phase(s)" (`PH_PER`).
Dòng chỉ còn cụm đó thì không có căn cứ → không rõ; dòng có cả số pha thật vẫn đọc số pha thật. Thêm test dữ liệu giả.
So lại MỌI lượt (1.093, một cỡ lẫn nhiều cỡ) `96e51b24` → `bb280392`: đổi đúng **1 lượt**: IB2300059621#0 (một cỡ, 47.000 kVA) 1 → không rõ. Không lượt nhiều cỡ nào đổi.
Một cỡ sau vòng 2: 1 pha 133, 3 pha 454, không rõ 145. Bảng mới: `pha-goi-nhieu-co/pha-luot-sau-cuon-day.tsv`. Không còn lượt một cỡ > 30 kVA ra 1 pha.

## 5. Tác động (cùng bidhist, `47d66424` → `96e51b24`)
| | 1 pha | 3 pha | không rõ |
|---|---|---|---|
| Nhiều cỡ trước | 78 | 133 | 150 |
| Nhiều cỡ sau | 81 | 151 | 129 |
| Một cỡ (không đổi) | 134 | 454 | 144 |

44 lượt / 28 gói đổi: không rõ → 1: 12; không rõ → 3: 20; 1 → 3: 1 (IB2300003199#2); 1 → không rõ: 8; 3 → không rõ: 3. Đủ từng lượt: `pha-goi-nhieu-co/luot-doi-pha.tsv`.
32 lượt mới có pha sẽ loại thêm dòng có căn cứ trái pha (chưa đo số dòng; cần đo top 30 trên cloud cùng các PR khác).
Script (tham số: worktree, bidhist, out): `pha-goi-nhieu-co/pha-luot.mjs`, `audit.mjs <truoc> <sau> <analysis.json> <out>`, `bang.mjs`, `dbg-goi.mjs <wt> <bidhist> <gói>`.

## Việc cần Khoa / điều phối quyết
- IB2300059621: ĐÃ SỬA ở vòng 2 (mục 3).
- `sizesOf` đọc công suất động cơ / số dự phòng thành cỡ riêng (IB2300003199 91 / 13 kW; 10 cỡ ảo ở mục 2): việc riêng.

## Bảng từng lượt (243 lượt; "Cách gắn" = `how.phase` sau sửa)
| Gói | Lượt | Cỡ | Pha 47d66424 → sau | Cách gắn (sau) | Kết luận |
|---|---|---|---|---|---|
| IB2200016199 | 1 | 12 kVA | 1 → 1 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2200016981 | 0 | 8 kVA | 1 → 1 | tied | đúng: dòng Phần A của máy 8 kVA ghi 1 pha (dòng chung ghi cả 8 kVA 1 pha và 40 kVA 3 pha nên đối chiếu tự động lệch) |
| IB2200022333 | 1 | 400 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200046063 | 0 | 10.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200046063 | 1 | 13.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200052056 | 0 | 8.5 kVA | 1 → 1 | own | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2200052716 | 0 | 10 kVA | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200062073 | 0 | 12.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200062073 | 1 | 30 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200066148 | 0 | 3 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200066148 | 1 | 5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200087789 | 0 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200087789 | 1 | 250 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200087789 | 2 | 400 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2200087789 | 3 | 500 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300002060 | 0 | 250 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300002060 | 1 | 500 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300003199 | 0 | 8 kW | - → 1 | tied | đúng: hạng mục của cỡ này ghi 1 pha |
| IB2300003199 | 1 | 13 kW | - → 1 | tied | đúng: hạng mục của cỡ này ghi 1 pha |
| IB2300003199 | 2 | 80 kW | 1 → 3 | tied | đúng; TRƯỚC SAI (1 pha của tổ máy sinh hoạt gán cho 80 kW) |
| IB2300003199 | 3 | 91 kW | - → 3 | tied | đúng: hạng mục của cỡ này ghi 3 pha |
| IB2300005377 | 0 | 1000 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300032777 | 0 | 10 kW | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300032777 | 1 | 11.5 kW | 1 → - | tied to another size | không đủ căn cứ (nay không rõ): không dòng pha nào gắn với cỡ này; cả gói 1 pha |
| IB2300032777 | 2 | 13 kW | 1 → 1 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300044204 | 0 | 14 kVA | - → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300044204 | 1 | 37 kVA | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300046353 | 0 | 15 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300046353 | 1 | 20 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300102941 | 0 | 15 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300102941 | 1 | 20 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300106309 | 0 | 3 kW | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300108940 | 1 | 20 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300123990 | 0 | 30 kVA | - → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300123990 | 1 | 34 kVA | - → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300133361 | 0 | 8.5 kVA | 1 → 1 | own | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300133361 | 1 | 12 kVA | 1 → 1 | agreed | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300134577 | 0 | 50 kVA | - → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300134577 | 1 | 100 kVA | - → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300134577 | 2 | 150 kVA | 3 → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300158312 | 0 | 150 kVA | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300158312 | 1 | 175 kVA | 3 → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300162912 | 1 | 2275 kVA | 3 → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300163844 | 0 | 8 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300163844 | 1 | 30 kVA | 3 → 3 | tied | đúng: các dòng của máy 30/33 kVA ghi 3 pha |
| IB2300177056 | 0 | 25 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300177056 | 1 | 58 kVA | - → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300189145 | 0 | 120 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300190927 | 0 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300190927 | 1 | 150 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300192935 | 0 | 1250 kVA | 3 → 3 | own | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300212821 | 0 | 10 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300212821 | 1 | 11.5 kVA | 1 → - | tied to another size | không đủ căn cứ (nay không rõ): không dòng pha nào gắn với cỡ này; cả gói 1 pha |
| IB2300232318 | 0 | 12 kW | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300232318 | 1 | 15.2 kW | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300232850 | 0 | 12.5 kVA | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300232850 | 1 | 27 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300236743 | 0 | 10 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300236743 | 1 | 18 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300243355 | 0 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300243355 | 1 | 450 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300245556 | 0 | 8.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300245556 | 1 | 10.5 kVA | 1 → 1 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300245556 | 2 | 12.5 kVA | 1 → - | tied to another size | không đủ căn cứ (nay không rõ): không dòng pha nào gắn với cỡ này; cả gói 1 pha |
| IB2300245748 | 0 | 8.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300245748 | 1 | 10 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300245748 | 2 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300253227 | 0 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300253227 | 1 | 150 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300260615 | 0 | 500 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300263757 | 0 | 20 kVA | - → 1 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2300263757 | 1 | 30 kVA | 1 → - | tied to another size | không đủ căn cứ (nay không rõ): không dòng pha nào gắn với cỡ này; cả gói 1 pha |
| IB2300273061 | 0 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300273061 | 1 | 160 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300273061 | 2 | 250 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300274793 | 0 | 250 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300274793 | 1 | 400 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300274793 | 2 | 500 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300293753 | 0 | 10 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300293753 | 1 | 36 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300293753 | 2 | 200 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300320688 | 0 | 5.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300320688 | 1 | 6.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300356962 | 0 | 9 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300356962 | 1 | 45 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300363458 | 0 | 13.5 kW | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300363458 | 1 | 40 kW | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300363623 | 0 | 5 kW | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300363623 | 1 | 5.8 kW | - → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300363623 | 2 | 15 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300371415 | 0 | 5 kW | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300389043 | 0 | 82.5 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2300389043 | 1 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400008052 | 1 | 90 kVA | 3 → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2400052694 | 0 | 11 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400052694 | 1 | 35 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400058723 | 0 | 630 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400058723 | 1 | 800 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400062394 | 0 | 50 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400062394 | 1 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400079896 | 1 | 90 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400114476 | 0 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400114476 | 1 | 45 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400116787 | 0 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400116787 | 1 | 40 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400125924 | 0 | 8.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400125924 | 1 | 12.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400145438 | 0 | 7 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400145438 | 1 | 8 kVA | 1 → - | tied to another size | không đủ căn cứ (nay không rõ): không dòng pha nào gắn với cỡ này; cả gói 1 pha |
| IB2400145438 | 2 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400145438 | 3 | 13.7 kVA | 1 → - | tied to another size | không đủ căn cứ (nay không rõ): không dòng pha nào gắn với cỡ này; cả gói 1 pha |
| IB2400152304 | 1 | 21.3 kVA | 3 → - | tied: disagree | không đủ căn cứ (nay không rõ): một máy 3 pha đọc thành hai cỡ 20 / 21,3 kVA, hạng mục có dòng ngả ra 230 V 1 pha; trước 3 đúng theo Phân tích, nay giữ dòng + cần xác nhận |
| IB2400186078 | 0 | 6 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400186078 | 1 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400218348 | 0 | 30 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400218348 | 1 | 250 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400236068 | 0 | 500 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400236068 | 1 | 660 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400237184 | 0 | 53 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400237184 | 1 | 405 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400238472 | 0 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400238472 | 1 | 150 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400249622 | 0 | 160 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400275648 | 0 | 30 kVA | - → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2400275648 | 1 | 60 kVA | 3 → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2400291063 | 0 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400299108 | 0 | 50 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400299108 | 1 | 60 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400299108 | 2 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400311120 | 0 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400311120 | 1 | 30 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400311120 | 2 | 45 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400313681 | 0 | 30 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400313681 | 1 | 42 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400315025 | 0 | 7 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400365165 | 0 | 7.2 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400365165 | 1 | 12.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400375383 | 0 | 150 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400375383 | 1 | 300 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400427929 | 0 | 8.5 kVA | 1 → 1 | tied | đúng: khớp đoạn công suất của Phân tích |
| IB2400427929 | 1 | 20 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400427929 | 3 | 45 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400431781 | 0 | 40 kVA | - → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2400431781 | 1 | 45 kVA | 3 → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2400433961 | 0 | 600 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400433961 | 1 | 1500 kVA | 3 → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2400438227 | 0 | 80 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400448320 | 0 | 150 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400448320 | 1 | 300 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400475145 | 0 | 8.5 kVA | - → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400475145 | 1 | 10 kVA | 1 → - | tied to another size | không đủ căn cứ (nay không rõ): không dòng pha nào gắn với cỡ này; cả gói 1 pha |
| IB2400487460 | 0 | 8.8 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400487460 | 1 | 40 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400494037 | 0 | 20 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400494037 | 1 | 50 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400495696 | 0 | 30 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400495696 | 1 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400495696 | 2 | 200 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400496799 | 1 | 250 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400497000 | 0 | 15 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400508791 | 0 | 7 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400508791 | 1 | 11 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400514548 | 0 | 6 kVA | - → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400514548 | 1 | 7 kVA | - → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400514548 | 2 | 13 kVA | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400563426 | 0 | 8.5 kVA | 1 → 1 | tied | đúng: dòng Phần A của máy 8,5 kVA ghi 1 pha (dòng chung nêu cả hai máy) |
| IB2400589278 | 0 | 300 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400589278 | 1 | 400 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400589278 | 2 | 450 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400602840 | 0 | 160 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400602840 | 1 | 800 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2400614433 | 1 | 250 kVA | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500031588 | 0 | 25 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500031588 | 1 | 50 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500039578 | 1 | 2500 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500067556 | 0 | 6 kVA | - → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500067556 | 1 | 12.5 kVA | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500089757 | 0 | 30 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500089757 | 1 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500089757 | 2 | 200 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500114642 | 0 | 8.3 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500114642 | 1 | 10.4 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500114642 | 2 | 250 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500152724 | 0 | 5 kW | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500152724 | 1 | 5.8 kW | - → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500152724 | 2 | 12.5 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500177469 | 0 | 8.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500177469 | 1 | 12.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500249901 | 0 | 1000 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500257276 | 0 | 400 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500271331 | 0 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500271331 | 1 | 30 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500280002 | 0 | 11 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500280002 | 1 | 15 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500291421 | 1 | 550 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500327119 | 0 | 82.5 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500327119 | 1 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500327119 | 2 | 125 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500327119 | 3 | 320 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500337925 | 0 | 12.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500337925 | 1 | 30 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500385135 | 1 | 20 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500386288 | 0 | 65 kW | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500386288 | 1 | 136 kW | - → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500403535 | 0 | 8.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500403535 | 1 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500410768 | 0 | 30 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500415487 | 0 | 12.5 kVA | 1 → 1 | tied | đúng: đầu phát Phần A (12,5 kVA) ghi 1 pha 2 dây |
| IB2500415487 | 1 | 15 kVA | 1 → 1 | tied | đúng: đầu phát Phần B (15 kVA) ghi 1 pha 2 dây |
| IB2500460613 | 0 | 8.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500460613 | 1 | 10 kVA | 1 → - | tied to another size | không đủ căn cứ (nay không rõ): cỡ 10 kVA là số dự phòng của máy 8,5 kVA; cả gói 1 pha |
| IB2500460613 | 2 | 12.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500500319 | 1 | 12 kVA | 1 → 1 | own | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500512614 | 1 | 40 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500531255 | 0 | 15 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500541094 | 0 | 430 kVA | 3 → 3 | own | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2500597081 | 1 | 300 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500598824 | 0 | 12 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2500598824 | 1 | 15 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600046158 | 1 | 500 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600075436 | 0 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600075436 | 1 | 120 kVA | 3 → - | tied to another size | không đủ căn cứ (nay không rõ): cỡ 120 kVA là số dự phòng của máy 100 kVA, không dòng pha nào gắn với nó; cả gói 3 pha |
| IB2600075436 | 2 | 200 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600075436 | 3 | 230 kVA | 3 → - | tied to another size | không đủ căn cứ (nay không rõ): cỡ 230 kVA là số dự phòng của máy 200 kVA; cả gói 3 pha |
| IB2600112737 | 0 | 100 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600112737 | 2 | 200 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600128010 | 0 | 250 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600128010 | 1 | 500 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600164177 | 0 | 125 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600164177 | 1 | 160 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600219527 | 0 | 75 kW | - → 3 | tied | đúng: gói chỉ nêu một loại pha, dòng gắn được với cỡ |
| IB2600245437 | 0 | 30 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600245437 | 1 | 60 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600307179 | 0 | 8.5 kVA | 1 → 1 | tied | đúng: dòng của máy 8,5 kVA ghi số pha 1 pha ("pha dung dịch" ở dòng làm mát khiến đối chiếu tự động lệch) |
| IB2600327799 | 2 | 200 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600334541 | 0 | 250 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600334541 | 1 | 500 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600457659 | 0 | 13.5 kW | - → 1 | tied | đúng: Hạng mục 1 (13,5 kW) ghi 1 pha |
| IB2600457659 | 2 | 27 kW | - → 3 | tied | đúng: Hạng mục 2 (27 kW) ghi 3 pha |
| IB2600477305 | 0 | 12.5 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600477305 | 1 | 15 kVA | 1 → 1 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600562009 | 0 | 30 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
| IB2600562009 | 1 | 50 kVA | 3 → 3 | tied | đúng: khớp dòng Phân tích nêu cỡ |
