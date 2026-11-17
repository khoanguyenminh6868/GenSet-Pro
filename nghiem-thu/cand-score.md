# Nghiệm thu cand-score: BẢN 2 (trần theo hãng + keep mọi gói); bản 1 ở phía dưới (đã bị thay, giữ để so)

PR #556 (nhánh `cand-score`, force-push lại từ main 174cb5a). Không chạy agent, không ghi web. Cách đo như bản 1 (`scratchpad\met.mjs`, `cmpB2b.mjs`, `cmpB2.out`; bản chụp doc-cache 12/11; configmatch d106239e…; keep = `keepOf(configmatch hiện có)` như một lượt Gợi ý lại thật). Cột: main (sau PR A, 174cb5a) / bản 1 (nhánh `cand-score-v1`, cục bộ) / bản 2 với MAKE_CAP 8, 10, 12.

## Tệp đổi
- `suppliers/config-bot.mjs`: `candidates()` (trần theo hãng `MAKE_CAP`, `keep` cho mọi gói). Cách chấm điểm và thứ tự như main (bỏ fit/data, chọn theo động cơ, chia lượt hãng).
- Test: `suppliers/cand-cap.test.mjs` (mới, 6 test), `suppliers/cand-sync.test.mjs` (các test cũ gọi với `makeCap: 0` vì chúng kiểm giữ chỗ / keep chứ không kiểm trần; thêm 1 test).

## Cách làm
1. **Trần**: hằng `MAKE_CAP = 10` (xuất `export`, tham số `makeCap` của `candidates()`; 0 = tắt). Khi HSMT không nêu hãng / model động cơ (cùng điều kiện với CN_ROWS / MAKE_ROWS: `!engineMakes.length` và không dòng named), một hãng chiếm tối đa MAKE_CAP dòng trong 30; hãng "A / B" tính cho A; hãng không rõ gom nhóm "?" cũng chịu trần. Dòng giữ chỗ sync không tính và không bị chặn (`exempt`); dòng `named` và hãng HSMT nêu: trần tắt cả. Sau trần mà chưa đủ `max` dòng thì lấp bằng các dòng điểm cao nhất còn lại bất kể trần (lượt `free`). Trần áp cả cho CN_ROWS và MAKE_ROWS (chúng đi qua cùng hàm `pick`).
2. **keep cho mọi gói**: bỏ điều kiện `sync &&`. Mỗi cặp (NCC, động cơ) của cấu hình lượt trước mà còn trong `rows` (tức qua lọc cứng: dải 100–120%, các ngưỡng HSMT) nhưng chưa có trong 30 thì dòng điểm cao nhất của cặp đó vào, thay dòng điểm thấp nhất không phải giữ chỗ sync và không phải keep; trần, PER_ENGINE, PER_SUPPLIER không chặn. Đường gọi: `prep()` đã truyền `keep: keepOf(reqData.prevResult)` cho mọi gói (config-bot.mjs ~1181; `prevResult` lấy từ configmatch hiện có theo cỡ, `run()` ~3037); trước đây `candidates()` chỉ đọc nó khi `sync`. Dòng bị lọc cứng loại (ngoài dải / dưới ngưỡng) không có trong `rows` nên không quay lại.
3. Thêm tuỳ chọn `patches` (mặc định true) chỉ để đo CN_ROWS + MAKE_ROWS có/không.

## Số đo 14 cỡ: main / bản 1 / MAKE_CAP 8, 10, 12 (keep bật)
**Số hãng động cơ trong 30 dòng**

| cỡ | main | bản 1 | cap 8 | cap 10 | cap 12 |
|---|---|---|---|---|---|
| IB2600574589 400 | 5 | 19 | 6 | 6 | 6 |
| IB2600581294 500 | 7 | 19 | 7 | 7 | 7 |
| IB2600581977 250 | 8 | 20 | 10 | 10 | 8 |
| IB2600586587 160 | 7 | 19 | 5 | 5 | 5 |
| IB2600592658 500 | 1 | 1 | 1 | 1 | 1 |
| IB2600592684 30 | 3 | 18 | 3 | 3 | 3 |
| IB2600592684 500 | 1 | 1 | 1 | 1 | 1 |
| IB2600594596 300 | 6 | 22 | 6 | 6 | 6 |
| IB2600594596 400 | 6 | 21 | 6 | 6 | 6 |
| IB2600595853 500 | 1 | 1 | 1 | 1 | 1 |
| IB2600599817 - | 5 | 19 | 5 | 5 | 5 |
| IB2600601812 100 | 11 | 19 | 11 | 11 | 11 |
| IB2600602880 150 | 1 | 10 | 1 | 1 | 1 |
| IB2600603983 700 | 6 | 7 | 5 | 5 | 5 |
| **tổng** | 68 | 196 | 68 | 68 | 66 |

**Số động cơ khác nhau trong 30 dòng**

| cỡ | main | bản 1 | cap 8 | cap 10 | cap 12 |
|---|---|---|---|---|---|
| IB2600574589 400 | 17 | 24 | 14 | 14 | 14 |
| IB2600581294 500 | 17 | 26 | 15 | 15 | 15 |
| IB2600581977 250 | 19 | 29 | 23 | 22 | 22 |
| IB2600586587 160 | 18 | 25 | 14 | 13 | 13 |
| IB2600592658 500 | 12 | 30 | 12 | 12 | 12 |
| IB2600592684 30 | 10 | 30 | 10 | 10 | 10 |
| IB2600592684 500 | 12 | 30 | 9 | 9 | 9 |
| IB2600594596 300 | 15 | 25 | 14 | 14 | 14 |
| IB2600594596 400 | 20 | 28 | 20 | 20 | 20 |
| IB2600595853 500 | 12 | 30 | 12 | 12 | 12 |
| IB2600599817 - | 18 | 26 | 19 | 19 | 18 |
| IB2600601812 100 | 23 | 28 | 23 | 23 | 23 |
| IB2600602880 150 | 12 | 30 | 12 | 12 | 12 |
| IB2600603983 700 | 22 | 30 | 11 | 12 | 12 |
| **tổng** | 227 | 391 | 208 | 207 | 206 |

**Hãng nhiều dòng nhất (số dòng)**

| cỡ | main | bản 1 | cap 8 | cap 10 | cap 12 |
|---|---|---|---|---|---|
| IB2600574589 400 | 11 | 8 | 11 | 11 | 11 |
| IB2600581294 500 | 10 | 8 | 10 | 10 | 10 |
| IB2600581977 250 | 18 | 5 | 11 | 13 | 15 |
| IB2600586587 160 | 12 | 11 | 11 | 12 | 12 |
| IB2600592658 500 | 30 | 30 | 30 | 30 | 30 |
| IB2600592684 30 | 28 | 12 | 28 | 28 | 28 |
| IB2600592684 500 | 30 | 30 | 30 | 30 | 30 |
| IB2600594596 300 | 11 | 6 | 11 | 11 | 11 |
| IB2600594596 400 | 10 | 6 | 9 | 10 | 10 |
| IB2600595853 500 | 30 | 30 | 30 | 30 | 30 |
| IB2600599817 - | 11 | 9 | 8 | 10 | 11 |
| IB2600601812 100 | 8 | 7 | 8 | 8 | 8 |
| IB2600602880 150 | 30 | 18 | 30 | 30 | 30 |
| IB2600603983 700 | 10 | 6 | 9 | 10 | 10 |
| **tổng** | 249 | 186 | 236 | 243 | 246 |

**Dòng không có đầu phát**

| cỡ | main | bản 1 | cap 8 | cap 10 | cap 12 |
|---|---|---|---|---|---|
| IB2600574589 400 | 0 | 12 | 4 | 4 | 4 |
| IB2600581294 500 | 2 | 8 | 10 | 10 | 10 |
| IB2600581977 250 | 7 | 13 | 4 | 4 | 4 |
| IB2600586587 160 | 1 | 11 | 6 | 5 | 5 |
| IB2600592658 500 | 16 | 23 | 16 | 16 | 16 |
| IB2600592684 30 | 16 | 22 | 16 | 16 | 16 |
| IB2600592684 500 | 14 | 23 | 14 | 14 | 14 |
| IB2600594596 300 | 3 | 10 | 9 | 9 | 9 |
| IB2600594596 400 | 4 | 15 | 5 | 5 | 5 |
| IB2600595853 500 | 16 | 23 | 16 | 16 | 16 |
| IB2600599817 - | 0 | 2 | 0 | 0 | 0 |
| IB2600601812 100 | 0 | 7 | 0 | 0 | 0 |
| IB2600602880 150 | 19 | 14 | 19 | 19 | 19 |
| IB2600603983 700 | 12 | 23 | 11 | 10 | 10 |
| **tổng** | 110 | 206 | 130 | 128 | 128 |

**Dòng không có bộ điều khiển**

| cỡ | main | bản 1 | cap 8 | cap 10 | cap 12 |
|---|---|---|---|---|---|
| IB2600574589 400 | 0 | 1 | 0 | 0 | 0 |
| IB2600581294 500 | 2 | 3 | 4 | 4 | 4 |
| IB2600581977 250 | 1 | 4 | 1 | 1 | 1 |
| IB2600586587 160 | 0 | 3 | 0 | 0 | 0 |
| IB2600592658 500 | 0 | 1 | 0 | 0 | 0 |
| IB2600592684 30 | 0 | 4 | 0 | 0 | 0 |
| IB2600592684 500 | 0 | 1 | 0 | 0 | 0 |
| IB2600594596 300 | 2 | 5 | 2 | 2 | 2 |
| IB2600594596 400 | 2 | 2 | 2 | 2 | 2 |
| IB2600595853 500 | 0 | 1 | 0 | 0 | 0 |
| IB2600599817 - | 0 | 2 | 0 | 0 | 0 |
| IB2600601812 100 | 0 | 1 | 0 | 0 | 0 |
| IB2600602880 150 | 0 | 4 | 0 | 0 | 0 |
| IB2600603983 700 | 2 | 6 | 3 | 3 | 3 |
| **tổng** | 9 | 38 | 12 | 12 | 12 |

**Dòng có động cơ 0 thông số**

| cỡ | main | bản 1 | cap 8 | cap 10 | cap 12 |
|---|---|---|---|---|---|
| IB2600574589 400 | 0 | 2 | 0 | 0 | 0 |
| IB2600581294 500 | 0 | 4 | 0 | 0 | 0 |
| IB2600581977 250 | 1 | 10 | 7 | 5 | 3 |
| IB2600586587 160 | 0 | 2 | 0 | 0 | 0 |
| IB2600592658 500 | 0 | 0 | 0 | 0 | 0 |
| IB2600592684 30 | 0 | 11 | 0 | 0 | 0 |
| IB2600592684 500 | 0 | 0 | 0 | 0 | 0 |
| IB2600594596 300 | 0 | 5 | 0 | 0 | 0 |
| IB2600594596 400 | 1 | 3 | 1 | 1 | 1 |
| IB2600595853 500 | 0 | 0 | 0 | 0 | 0 |
| IB2600599817 - | 0 | 0 | 0 | 0 | 0 |
| IB2600601812 100 | 0 | 4 | 0 | 0 | 0 |
| IB2600602880 150 | 0 | 1 | 0 | 0 | 0 |
| IB2600603983 700 | 2 | 6 | 0 | 0 | 0 |
| **tổng** | 4 | 48 | 8 | 6 | 4 |

**catalog.md (ký tự)**

| cỡ | main | bản 1 | cap 8 | cap 10 | cap 12 |
|---|---|---|---|---|---|
| IB2600574589 400 | 151451 | 136477 | 139057 | 139057 | 139057 |
| IB2600581294 500 | 152507 | 146971 | 136001 | 136001 | 136001 |
| IB2600581977 250 | 121356 | 109754 | 108123 | 119273 | 124212 |
| IB2600586587 160 | 146268 | 128931 | 132785 | 133691 | 133729 |
| IB2600592658 500 | 135656 | 153205 | 135656 | 135656 | 135656 |
| IB2600592684 30 | 111405 | 122799 | 111405 | 111405 | 111405 |
| IB2600592684 500 | 137581 | 153111 | 129317 | 129317 | 129317 |
| IB2600594596 300 | 138839 | 128445 | 133532 | 133532 | 133532 |
| IB2600594596 400 | 155366 | 139148 | 155644 | 155544 | 155544 |
| IB2600595853 500 | 135656 | 153205 | 135656 | 135656 | 135656 |
| IB2600599817 - | 169219 | 180932 | 175850 | 178499 | 169219 |
| IB2600601812 100 | 148676 | 143017 | 148676 | 148676 | 148676 |
| IB2600602880 150 | 116197 | 160188 | 116050 | 116050 | 116050 |
| IB2600603983 700 | 140873 | 122859 | 120565 | 126957 | 126957 |
| **tổng** | 1961050 | 1979042 | 1878317 | 1899314 | 1895011 |

## Nhóm xuất xứ, giữ/ra/vào so với main, CN_ROWS / MAKE_ROWS (cap 10)
**Nhóm xuất xứ động cơ/NCC (cap 10)**

- IB2600574589 400: main TQ/TQ:12 ngoại/TQ:18 → cap10 TQ/TQ:14 ngoại/TQ:16
- IB2600581294 500: main TQ/TQ:12 ngoại/TQ:17 ngoại/ngoại:1 → cap10 TQ/TQ:22 ngoại/TQ:7 ngoại/ngoại:1
- IB2600581977 250: main TQ/TQ:7 ngoại/TQ:21 ngoại/ngoại:2 → cap10 TQ/TQ:9 ngoại/TQ:19 ngoại/ngoại:2
- IB2600586587 160: main TQ/TQ:13 ngoại/TQ:17 → cap10 TQ/TQ:15 ngoại/TQ:15
- IB2600592658 500: main ngoại/TQ:30 → cap10 ngoại/TQ:30
- IB2600592684 30: main ngoại/TQ:30 → cap10 ngoại/TQ:30
- IB2600592684 500: main ngoại/TQ:30 → cap10 ngoại/TQ:30
- IB2600594596 300: main TQ/TQ:9 ngoại/TQ:18 ngoại/ngoại:3 → cap10 TQ/TQ:11 ngoại/TQ:15 ngoại/ngoại:4
- IB2600594596 400: main TQ/TQ:8 ngoại/TQ:20 ngoại/ngoại:2 → cap10 TQ/TQ:7 ngoại/TQ:21 ngoại/ngoại:2
- IB2600595853 500: main ngoại/TQ:30 → cap10 ngoại/TQ:30
- IB2600599817 -: main TQ/TQ:12 ngoại/TQ:18 → cap10 TQ/TQ:12 ngoại/TQ:18
- IB2600601812 100: main TQ/TQ:13 ngoại/TQ:17 → cap10 TQ/TQ:13 ngoại/TQ:17
- IB2600602880 150: main ngoại/TQ:30 → cap10 ngoại/TQ:30
- IB2600603983 700: main ngoại/TQ:30 → cap10 ngoại/TQ:30

**Dòng của 30 cũ (main) còn lại ở cap 10 (giữ/ra/vào)**

- IB2600574589 400: giữ 18, ra 9, vào 10
- IB2600581294 500: giữ 15, ra 13, vào 14
- IB2600581977 250: giữ 24, ra 5, vào 5
- IB2600586587 160: giữ 18, ra 8, vào 8
- IB2600592658 500: giữ 29, ra 0, vào 0
- IB2600592684 30: giữ 28, ra 0, vào 0
- IB2600592684 500: giữ 23, ra 6, vào 6
- IB2600594596 300: giữ 21, ra 7, vào 8
- IB2600594596 400: giữ 28, ra 1, vào 1
- IB2600595853 500: giữ 29, ra 0, vào 0
- IB2600599817 -: giữ 29, ra 1, vào 1
- IB2600601812 100: giữ 28, ra 0, vào 0
- IB2600602880 150: giữ 28, ra 1, vào 1
- IB2600603983 700: giữ 20, ra 10, vào 10

**CN_ROWS / MAKE_ROWS có / không (cap 10): số dòng khác nhau trong 30**

- IB2600574589 400: 2 dòng khác
- IB2600581294 500: 0 dòng khác
- IB2600581977 250: 1 dòng khác
- IB2600586587 160: 1 dòng khác
- IB2600592658 500: 0 dòng khác (catalog.md giống hệt)
- IB2600592684 30: 0 dòng khác (catalog.md giống hệt)
- IB2600592684 500: 0 dòng khác (catalog.md giống hệt)
- IB2600594596 300: 1 dòng khác
- IB2600594596 400: 1 dòng khác
- IB2600595853 500: 0 dòng khác (catalog.md giống hệt)
- IB2600599817 -: 9 dòng khác
- IB2600601812 100: 5 dòng khác
- IB2600602880 150: 0 dòng khác (catalog.md giống hệt)
- IB2600603983 700: 4 dòng khác

## Hồi quy cấu hình lượt trước (54 cấu hình ở 12 gói / 14 cỡ; 42 có dòng qua lọc cứng)
- main: 54 cấu hình (qua lọc cứng, main có dòng: 42), trong 30: 34, có dòng nhưng ngoài 30: 8; top→ngoài 30: 0 (hạng 1–3: 0); ngoài→trong 30: 0
- bản 1: 54 cấu hình (qua lọc cứng, main có dòng: 42), trong 30: 25, có dòng nhưng ngoài 30: 17; top→ngoài 30: 11 (hạng 1–3: 9); ngoài→trong 30: 2
  mất: IB2600586587 160 #4 6CTA8.3-G2 (cut); IB2600592684 30 #1 4B3.9-G12 (cut); IB2600592684 30 #2 4B3.9-G12 (cut); IB2600592684 30 #3 4B3.9-G12 (cut); IB2600592684 500 #1 QSZ13-G3 (cut); IB2600592684 500 #3 QSZ13-G3 (cut); IB2600592684 500 #6 KTAA19-G5 (cut); IB2600594596 300 #3 6LTAA9.5-G1 (cut); IB2600602880 150 #1 6BTAA5.9-G12 (cut); IB2600603983 700 #1 4006-23TAG2A (cut); IB2600603983 700 #2 QSK23-G2 (cut)
- cap 8: 54 cấu hình (qua lọc cứng, main có dòng: 42), trong 30: 42, có dòng nhưng ngoài 30: 0; top→ngoài 30: 0 (hạng 1–3: 0); ngoài→trong 30: 8
- cap 10: 54 cấu hình (qua lọc cứng, main có dòng: 42), trong 30: 42, có dòng nhưng ngoài 30: 0; top→ngoài 30: 0 (hạng 1–3: 0); ngoài→trong 30: 8
- cap 12: 54 cấu hình (qua lọc cứng, main có dòng: 42), trong 30: 42, có dòng nhưng ngoài 30: 0; top→ngoài 30: 0 (hạng 1–3: 0); ngoài→trong 30: 8
- cap 10, không keep: 54 cấu hình (qua lọc cứng, main có dòng: 42), trong 30: 31, có dòng nhưng ngoài 30: 11; top→ngoài 30: 3 (hạng 1–3: 0); ngoài→trong 30: 0
  mất: IB2600581294 500 #4 WP13D490E310 (cut); IB2600581294 500 #6 YC6T660L-D20 (cut); IB2600581294 500 #10 YC6T660L-D20 (cut)

Điều kiện merge "không mất cấu hình hạng 1–3 còn qua lọc cứng": **đạt ở cả ba MAKE_CAP (mất 0 trong 42)**; bản 1 mất 9 cấu hình hạng 1–3. Phần này chủ yếu do `keep`: chỉ riêng trần (không keep) mất 3 cấu hình (hạng 4, 6, 10 của IB2600581294 500: WP13D490E310, YC6T660L-D20 ×2), 0 cấu hình hạng 1–3; keep đem 8 cấu hình từ ngoài 30 vào trong 30 so với main.

## Kết luận số đo (để chọn MAKE_CAP)
- Trần **chỉ có tác dụng ở ít cỡ**: tổng 14 cỡ, "hãng nhiều dòng nhất" 249 → 236 / 243 / 246 (cap 8 / 10 / 12; không keep, cap 10: 241); số hãng 68 → 68 (cap 8, 10) / 66 (cap 12); động cơ khác nhau 227 → 208 / 207 / 206. Cụ thể chỉ ở IB2600574589 400 (5 → 6 hãng), IB2600581977 250 (8 → 10 hãng ở cap 8 và 10; 8 ở cap 12; Cummins 18 → 13), IB2600594596 400 và IB2600599817 (1–2 dòng). Cap 8 chặt nhất (IB2600581977 250: chỉ còn 11 động cơ), cap 12 gần như không đổi gì so với main.
- **Không thể đa dạng hoá** ở 4 cỡ chỉ có Cummins trong dải 100–120% theo G7 (IB2600592658 500, IB2600592684 500, IB2600595853 500, IB2600602880 150; thêm IB2600592684 30: 28/30 Cummins): trần không có dòng hãng khác để thay, nên lấp lại bằng Cummins (số hãng = 1 ở mọi cột của bốn cỡ đó). Bản 1 cũng vẫn 1 hãng ở ba cỡ trong số này.
- Dòng không đầu phát 110 → 130 / 128 / 128 (bản 1: 206); không bộ điều khiển 9 → 12; 0 thông số động cơ 4 → 8 / 6 / 4 (bản 1: 48). catalog.md tổng 1.961.050 → 1.878.317 / 1.899.314 / 1.895.011 (−4,2% / −3,2% / −3,4%; bản 1 +0,9%).
- keep làm danh sách bám lượt trước: so main, mỗi cỡ giữ 15–29/30 dòng cũ (hầu hết ≥ 20; thấp nhất IB2600581294 500 15/30); chỉ riêng trần đổi 13 dòng trong 420 (cap 10, không keep), thêm keep: 61 dòng. keep cũng làm số hãng ít đi ở vài cỡ (IB2600586587 160: Yuchai 12 dòng vì cấu hình lượt trước, vượt trần vì keep được miễn).
- Đề xuất: MAKE_CAP = 10 (cân giữa 8 quá chặt ở IB2600581977 250 và 12 gần như không tác dụng). Bạn chọn.

## CN_ROWS / MAKE_ROWS
Có/không (cap 10): vẫn đổi kết quả ở 8/14 cỡ (IB2600599817 9 dòng, IB2600601812 5, IB2600603983 4, còn lại 1–2); 6 cỡ giống hệt. Chưa xoá.

## Test
`node --test` (suppliers/): 309 pass, 0 fail (302 của main + 6 trong cand-cap + 1 mới trong cand-sync); sau khi gộp main mới (#557, #558): 323 pass, 0 fail. `node suppliers/verify.mjs`: 0 lỗi. Test: trần đúng makeCap khi các hãng khác lấp được; lấp bất kể trần khi thiếu; tắt khi HSMT nêu hãng; "A / B" tính cho A và nhóm "?" chịu trần; giữ chỗ sync không bị chặn / không tính; keep cho gói không đòi Đồng bộ; dòng bị lọc cứng loại không quay lại bằng keep.

## Rủi ro
- Trần chỉ tác dụng khi còn dòng hãng khác trong dải; ở 5 cỡ một hãng thì không đổi gì.
- keep được miễn trần và PER_*: nếu lượt trước chọn nhiều cấu hình cùng một hãng thì hãng đó vượt trần (IB2600586587: Yuchai 12).
- keep thay các dòng điểm thấp nhất không phải giữ chỗ: dòng mới vào 30 có thể là dòng ít dữ liệu của cấu hình cũ (chỉ khi cấu hình đó từng được chọn).
- Test cũ của cand-sync phải chạy với `makeCap: 0` (giả thiết "NCC TQ chiếm hết 30 dòng" dựa trên không trần).
- Quay lui: revert PR; sau merge restart bot.

## Chưa kiểm
- Chưa chạy agent; chưa biết cấu hình agent chọn từ danh sách này có tốt hơn.
- keep chỉ mô phỏng bằng configmatch hiện có, chưa chạy "Gợi ý lại" thật.
- Số đo từ bản chụp 12/11.

---

# BẢN 1 (đã bị thay, giữ để so)

# Bản 1: điểm tách fit / data, chọn theo động cơ trước (PR B, nhánh `cand-score`)

Worktree `C:\Projects\GenSet Pro\wt-cand-score`, dựng trên main sau PR A (174cb5a; đã rebase bỏ commit cũ của cand-filter). Trước = main sau PR A (`wt-base-score`, tạm). Không chạy agent, không ghi web. Cách đo như PR A (`scratchpad\met.mjs`, `cmpB.mjs`, `cmpB.out`; bản chụp supplier doc-cache 12/11, configmatch d106239e…, có `keep` như lượt thật).

## Tệp đổi
- `suppliers/config-bot.mjs`: `candidates()` (điểm tách, chọn theo động cơ), chữ hướng dẫn thứ tự trong `catalog.md`.
- `suppliers/config-prompt.md`: câu mô tả thứ tự xếp.
- Test: `suppliers/cand-score.test.mjs` (mới, 6 test); `suppliers/cand-sync.test.mjs` (3 test sửa, xem "Rủi ro").

## Cách làm (đúng thiết kế điều phối)
- Mỗi dòng có `fit` và `data`. `fit` = model nêu tên 1000, hãng nêu tên 300, hãng TQ khi xuất xứ cn 250, bộ điều khiển HSMT nêu 200, đầu phát HSMT nêu 80, trừ nhiên liệu −300, dòng named dưới ngưỡng −600. `data` = có hãng 60, bộ điều khiển 50, bộ điều khiển có datasheet 40, 8×khoá thông số động cơ (tới 64), đầu phát 40 + 3×khoá (tới 18), độ tin cậy 30/15. `score` = fit + data − phần công suất vượt cỡ (dòng cũ, để các chỗ giữ chỗ vẫn đọc `score`).
- Chọn: mỗi động cơ có dòng đại diện tốt nhất theo (fit, gap bước 5%, data); xếp động cơ theo (fit giảm, gap tăng, data giảm); các động cơ cùng `fit` chia lượt theo hãng (vòng 1 mỗi hãng 1 động cơ tốt nhất, vòng 2 động cơ thứ hai…; hãng không rõ = một nhóm "?"). Sau khi mọi động cơ đủ điều kiện đã có 1 dòng mới thêm dòng thứ 2, 3 (NCC khác) theo cùng thứ tự; PER_ENGINE 3 / PER_NAMED_ENGINE 8 / PER_SUPPLIER 4 giữ nguyên. Giữ chỗ sync, `keep`, CN_ROWS, MAKE_ROWS giữ nguyên và chạy trước; thêm tuỳ chọn `patches` (mặc định true) chỉ để đo có/không CN_ROWS + MAKE_ROWS. Thứ tự in cuối cùng: (fit, gap, data). `why` giữ nguyên.

## Số đo 14 cỡ, trước → sau (cột "0 thông số ĐC" = dòng trong 30 mà động cơ không có khoá thông số nào từ mọi nguồn)
| cỡ | hãng ĐC (trước→sau) | động cơ khác nhau | nhóm xuất xứ ĐC/NCC (trước → sau) | không đầu phát | không bộ ĐK | 0 thông số ĐC | catalog.md ký tự |
|---|---|---|---|---|---|---|---|
| IB2600574589 400 | 5 → 19 | 17 → 24 | TQ/TQ:12 ngoại/TQ:18 → TQ/TQ:17 null/CN-sup:1 ngoại/TQ:12 | 0 → 12 | 0 → 1 | 0 → 2 | 151451 → 136477 |
| IB2600581294 500 | 7 → 19 | 17 → 26 | TQ/TQ:12 ngoại/TQ:17 ngoại/ngoại:1 → TQ/TQ:14 null/CN-sup:1 ngoại/TQ:14 ngoại/ngoại:1 | 2 → 8 | 2 → 3 | 0 → 4 | 152507 → 146971 |
| IB2600581977 250 | 8 → 20 | 19 → 29 | TQ/TQ:7 ngoại/TQ:21 ngoại/ngoại:2 → TQ/TQ:16 ngoại/TQ:11 ngoại/ngoại:3 | 7 → 13 | 1 → 4 | 1 → 10 | 121356 → 109754 |
| IB2600586587 160 | 7 → 19 | 18 → 25 | TQ/TQ:13 ngoại/TQ:17 → TQ/TQ:18 ngoại/TQ:12 | 1 → 11 | 0 → 3 | 0 → 2 | 146268 → 128931 |
| IB2600592658 500 | 1 → 1 | 12 → 30 | ngoại/TQ:30 → ngoại/TQ:30 | 16 → 23 | 0 → 1 | 0 → 0 | 135656 → 153205 |
| IB2600592684 30 | 3 → 18 | 10 → 30 | ngoại/TQ:30 → TQ/TQ:8 null/CN-sup:1 ngoại/TQ:21 | 16 → 22 | 0 → 4 | 0 → 11 | 111405 → 122799 |
| IB2600592684 500 | 1 → 1 | 12 → 30 | ngoại/TQ:30 → ngoại/TQ:30 | 14 → 23 | 0 → 1 | 0 → 0 | 137581 → 153111 |
| IB2600594596 300 | 6 → 22 | 15 → 25 | TQ/TQ:9 ngoại/TQ:18 ngoại/ngoại:3 → TQ/TQ:16 null/CN-sup:1 ngoại/TQ:10 ngoại/ngoại:3 | 3 → 10 | 2 → 5 | 0 → 5 | 138839 → 128445 |
| IB2600594596 400 | 6 → 21 | 20 → 28 | TQ/TQ:8 ngoại/TQ:20 ngoại/ngoại:2 → TQ/TQ:13 null/CN-sup:1 ngoại/TQ:14 ngoại/ngoại:2 | 4 → 15 | 2 → 2 | 1 → 3 | 155366 → 139148 |
| IB2600595853 500 | 1 → 1 | 12 → 30 | ngoại/TQ:30 → ngoại/TQ:30 | 16 → 23 | 0 → 1 | 0 → 0 | 135656 → 153205 |
| IB2600599817 - | 5 → 19 | 18 → 26 | TQ/TQ:12 ngoại/TQ:18 → TQ/TQ:17 ngoại/TQ:13 | 0 → 2 | 0 → 2 | 0 → 0 | 169219 → 180932 |
| IB2600601812 100 | 11 → 19 | 23 → 28 | TQ/TQ:13 ngoại/TQ:17 → TQ/TQ:16 ngoại/TQ:14 | 0 → 7 | 0 → 1 | 0 → 4 | 148676 → 143017 |
| IB2600602880 150 | 1 → 10 | 12 → 30 | ngoại/TQ:30 → TQ/TQ:3 ngoại/TQ:27 | 19 → 14 | 0 → 4 | 0 → 1 | 116197 → 160188 |
| IB2600603983 700 | 6 → 7 | 22 → 30 | ngoại/TQ:30 → ngoại/TQ:30 | 12 → 23 | 2 → 6 | 2 → 6 | 140873 → 122859 |

Tổng 14 cỡ: số hãng động cơ (cộng theo cỡ) 68 → 196 (trung bình 4,9 → 14 hãng/cỡ); động cơ khác nhau 227 → 391 (16 → 28/cỡ); dòng không có đầu phát 110 → 206 trên 420 dòng (26% → 49%); không có bộ điều khiển 9 → 38; động cơ 0 thông số 4 → 48; catalog.md 1.961.050 → 1.979.042 ký tự (+0,9% tổng; từng cỡ từ −12,8% (IB2600603983 700) đến +37,9% (IB2600602880 150: 116.197 → 160.188)). Nhóm xuất xứ: ở các cỡ trước chỉ có động cơ ngoài do NCC TQ chào (IB2600592684 30, IB2600602880 150), nay có thêm động cơ TQ (8 và 3 dòng). **Agent phải tra mạng nhiều hơn**: gần một nửa số dòng không có đầu phát, và 4 → 48 dòng mà động cơ không có thông số nào.

## CN_ROWS / MAKE_ROWS: có / không (số dòng khác nhau trong 30 giữa bản có và không có hai khoản vá)
- IB2600574589 400: 10 dòng khác
- IB2600581294 500: 4 dòng khác
- IB2600581977 250: 2 dòng khác
- IB2600586587 160: 10 dòng khác
- IB2600592658 500: 0 dòng khác (catalog.md giống hệt)
- IB2600592684 30: 0 dòng khác (catalog.md giống hệt)
- IB2600592684 500: 0 dòng khác (catalog.md giống hệt)
- IB2600594596 300: 4 dòng khác
- IB2600594596 400: 7 dòng khác
- IB2600595853 500: 0 dòng khác (catalog.md giống hệt)
- IB2600599817 -: 14 dòng khác
- IB2600601812 100: 7 dòng khác
- IB2600602880 150: 0 dòng khác (catalog.md giống hệt)
- IB2600603983 700: 0 dòng khác (catalog.md giống hệt)

→ Vẫn đổi kết quả ở 8/14 cỡ (đổi 2–14 dòng), nhất là IB2600599817 (14), IB2600574589 và IB2600586587 (10): với cách chọn mới hai khoản vá này vẫn kéo động cơ TQ / các hãng lên. 6 cỡ giống hệt (catalog.md trùng md5). **Chưa xoá**, chờ quyết.

## So với main (dòng của 30 cũ còn lại / ra / vào)
Mỗi cỡ giữ lại 4–21 trong 30 dòng cũ, ra 7–25: danh sách đổi nhiều vì chọn theo động cơ + chia lượt hãng thay cho điểm tổng.
- IB2600574589 400: giữ 13/30, ra 14, vào 15
- IB2600581294 500: giữ 17/30, ra 11, vào 12
- IB2600581977 250: giữ 12/30, ra 17, vào 17
- IB2600586587 160: giữ 13/30, ra 13, vào 15
- IB2600592658 500: giữ 8/30, ra 21, vào 22
- IB2600592684 30: giữ 8/30, ra 20, vào 22
- IB2600592684 500: giữ 4/30, ra 25, vào 26
- IB2600594596 300: giữ 12/30, ra 16, vào 17
- IB2600594596 400: giữ 13/30, ra 16, vào 17
- IB2600595853 500: giữ 8/30, ra 21, vào 22
- IB2600599817 -: giữ 15/30, ra 15, vào 15
- IB2600601812 100: giữ 21/30, ra 7, vào 8
- IB2600602880 150: giữ 9/30, ra 20, vào 21
- IB2600603983 700: giữ 19/30, ra 11, vào 11

## Hồi quy: cấu hình lượt trước (configmatch.json) còn dòng trong 30 không
54 cấu hình (dòng của chính các NCC của cấu hình × động cơ đó), trước → sau: top→top 23, ngoài 30→trong 30: 2, **top→ngoài 30: 11**, ngoài 30 → ngoài 30: 6, ngoài dải 120% (mất từ PR A): 6, không có dòng / không có động cơ trong catalog (như cũ): 6. Mất 11 cấu hình (dòng của NCC của cấu hình rời 30), từng cái, kèm động cơ còn không khi NCC khác chào:

| cỡ | hạng | cấu hình (NCC) | sau PR B |
|---|---|---|---|
| IB2600592684 30 | 1, 2, 3 | 4B3.9-G12 (voltgent / aosif / longkai-power, ba cấu hình cùng động cơ) | động cơ còn, dòng của fdk-energy (prime 30 = đúng cỡ) |
| IB2600592684 500 | 1 | QSZ13-G3 (uleengen, aosif, superwatt-power) | động cơ còn, dòng của bobig-power (prime 500) |
| IB2600592684 500 | 3 | QSZ13-G3 (fdk-energy, aosif, superwatt-power) | như trên |
| IB2600592684 500 | 6 | KTAA19-G5 (yongcai-elecmama, kaihua-genset, aosif) | động cơ còn, dòng của dingbo (525) |
| IB2600602880 150 | 1 | 6BTAA5.9-G12 (longkai-power, aosif, voltgent) | động cơ còn, dòng của dingbo (150) |
| IB2600603983 700 | 1 | 4006-23TAG2A (uleengen, fdk-energy, koten-power) | động cơ còn, dòng của gb-power (700 = đúng cỡ; dòng uleengen không ghi prime, koten 750) |
| IB2600603983 700 | 2 | QSK23-G2 (fdk-energy, huadong-yangzhou, yanfa-yancheng) | **động cơ không còn trong 30** |
| IB2600594596 300 | 3 | 6LTAA9.5-G1 (bobig-power, fdk-energy, victory-generator) | **động cơ không còn trong 30** |
| IB2600586587 160 | 4 | 6CTA8.3-G2 (fdk-energy, uleengen, eastern-lion-fuan) | **động cơ không còn trong 30** |

Lý do chung: động cơ chỉ cần một dòng; dòng đại diện là dòng có công suất sát cỡ nhất (gap), rồi nhiều dữ liệu, nên NCC khác thay NCC của cấu hình lượt trước (dòng không ghi prime có gap 50, đứng sau). Ba động cơ không còn là do vòng chia lượt theo hãng: ở cỡ có hơn 30 động cơ, mỗi hãng một động cơ ở vòng 1, các động cơ Cummins / Baudouin thứ n bị cắt.

**Mất cấu hình hạng 1–3: 9** (hạng 1: IB2600592684 30, IB2600592684 500, IB2600602880 150, IB2600603983 700 (4 cái); hạng 2: IB2600592684 30, IB2600603983 700 QSK23-G2; hạng 3: IB2600592684 30, IB2600592684 500, IB2600594596 300 6LTAA9.5-G1). Trong 9 cái đó 7 còn động cơ với NCC khác, 2 mất hẳn động cơ (QSK23-G2 hạng 2, 6LTAA9.5-G1 hạng 3). Được thêm: IB2600574589 hạng 9 (WP13D385E200) và IB2600594596 400 hạng 2 (P158LE aosif) từ ngoài 30 vào trong 30.

Danh sách đầy đủ trước → sau từng cấu hình: xem `scratchpad\cmpB.out`.

## Bảng 30 dòng trước / sau (cột fit, data chỉ có ở bản sau)
### IB2600594596 300 kVA: TRƯỚC (main sau PR A)
| # | NCC | động cơ | hãng | đầu phát | điểm | fit | data | công suất prime |
|---|---|---|---|---|---|---|---|---|
| 1 | yongcai-elecmama | NTA855-G1A | Cummins | HCI444D | 284 | - | - | 275 |
| 2 | uleengen | 1506A-E88TAG5 | Perkins | HCI444D | 284 | - | - | - |
| 3 | dingbo | NTA855-G1B | Cummins | HCI444ES1 | 280 | - | - | 312.5 |
| 4 | fdk-energy | YC6MK420L-D20 | Yuchai | NIANFENG NF314E | 277 | - | - | 313 |
| 5 | fdk-energy | YC6MK420-D30 | Yuchai | NIANFENG NF314E | 277 | - | - | 313 |
| 6 | yongcai-elecmama | NTA855-G1B | Cummins | HCI444ES | 277 | - | - | 312.5 |
| 7 | dingbo | TAD1351GE | Volvo Penta | LSA46.3 L10 | 277 | - | - | 312.5 |
| 8 | jet-power | TAD1351GE | Volvo Penta | HCI444ES | 277 | - | - | 313 |
| 9 | bobig-power | NTA855-G1A | Cummins | BW-314D | 269 | - | - | 300 |
| 10 | wintpower | YC6MK420L-D20 | Yuchai | WT444D | 269 | - | - | 300 |
| 11 | fdk-energy | WP10D320E200 | Weichai | NIANFENG NF314E | 269 | - | - | 313 |
| 12 | dingbo | NTA855-G1A | Cummins | HCI444D1 | 269 | - | - | 275 |
| 13 | uleengen | NTA855-G2A | Cummins | HCI444E | 267 | - | - | - |
| 14 | yongcai-elecmama | NTA855-G2A | Cummins | HCI444E | 267 | - | - | 350 |
| 15 | uleengen | 2206C-E13TAG2 | Perkins | HCI444E | 267 | - | - | - |
| 16 | jet-power | TAD1352GE | Volvo Penta | HCI444E | 267 | - | - | 350 |
| 17 | fdk-energy | YC6MK420L-D20 | Yuchai | NIANFENG NFS4-ES | 265 | - | - | 313 |
| 18 | dingbo | YC6MK420-D30 | Yuchai | TFW2-250-4A | 265 | - | - | 312.5 |
| 19 | eastern-lion-fuan | YC6MK420-D30 | Yuchai | EL 314E | 265 | - | - | 313 |
| 20 | eastern-lion-fuan | NTA855-G1B | Cummins | EL 314E | 265 | - | - | 313 |
| 21 | bobig-power | 6LTAA9.5-G1 | Cummins | BW-314DS | 265 | - | - | 313 |
| 22 | eastern-lion-fuan | 6LTAA9.5-G1 | Cummins | EL 314E | 265 | - | - | 313 |
| 23 | uleengen | WP10D320E200 | Weichai | HCI444D1 | 261 | - | - | - |
| 24 | jet-power | TAD1351GE | Volvo Penta | ECO38 2L4C | 261 | - | - | 325 |
| 25 | bobig-power | WP12D317E200 | Weichai | BW-314DS | 257 | - | - | 313 |
| 26 | jet-power | WP10D320E200 | Weichai | JET444E | 257 | - | - | 313 |
| 27 | jet-power | TAD842GE | Volvo Penta | ECO38 1L4C | 253 | - | - | 300 |
| 28 | rehlko | P126TI-II | Doosan | - | 149 | - | - | 300 |
| 29 | fg-wilson | 1506A-E88TAG5 | Perkins | - | 139 | - | - | 300 |
| 30 | cummins-inc | QSL9-G5 | Cummins | - | 123 | - | - | 300 |

### IB2600594596 300 kVA: SAU (PR B)
| # | NCC | động cơ | hãng | đầu phát | điểm | fit | data | công suất prime |
|---|---|---|---|---|---|---|---|---|
| 1 | bobig-power | NTA855-G1A | Cummins | BW-314D | 269 | 0 | 269 | 300 |
| 2 | wintpower | YC6MK420L-D20 | Yuchai | WT444D | 269 | 0 | 269 | 300 |
| 3 | jet-power | TAD842GE | Volvo Penta | ECO38 1L4C | 253 | 0 | 253 | 300 |
| 4 | jet-power | SC12E460D2 | SDEC | JET444D | 237 | 0 | 237 | 300 |
| 5 | jet-power | DP086CEV | Hyundai | TAL-A46-F | 225 | 0 | 225 | 300 |
| 6 | jet-power | 618ZLD | Huachai / Ricardo | JET444D | 221 | 0 | 221 | 300 |
| 7 | rise-power | CAT C9 | Caterpillar | LC5014L | 221 | 0 | 221 | 300 |
| 8 | rise-power | TBD234V6B | Deutz | LSA46.2L9 | 205 | 0 | 205 | 300 |
| 9 | longkai-power | YM6S4LF-D | YTO | - | 197 | 0 | 197 | 300 |
| 10 | victory-generator | 6R1600G80F | MTU | - | 181 | 0 | 181 | 300 |
| 11 | voltgent | C87TE4 | FPT | - | 165 | 0 | 165 | 300 |
| 12 | longkai-power | WP10-275DE | Kofo / Ricardo | - | 165 | 0 | 165 | 300 |
| 13 | gordon-power | 6126A-275DE | Ricardo | - | 165 | 0 | 165 | 300 |
| 14 | rehlko | P126TI-II | Doosan | - | 149 | 0 | 149 | 300 |
| 15 | voltgent | 15606A-E88AG5 | ? | FG26A250 | 145 | 0 | 145 | 300 |
| 16 | fg-wilson | 1506A-E88TAG5 | Perkins | - | 139 | 0 | 139 | 300 |
| 17 | keliang-fuan | CA6DM2J-39D | FAWDE | WT-C4D | 131 | 0 | 131 | 300 |
| 18 | cummins-inc | QSL9-G5 | Cummins | - | 123 | 0 | 123 | 300 |
| 19 | yingtai-jiangsu | WP2.1D18E2 | Weichai | - | 99 | 0 | 99 | 300 |
| 20 | fdk-energy | YC6MK420L-D20 | Yuchai | NIANFENG NF314E | 277 | 0 | 281 | 313 |
| 21 | fdk-energy | YC6MK420-D30 | Yuchai | NIANFENG NF314E | 277 | 0 | 281 | 313 |
| 22 | fdk-energy | WP10D320E200 | Weichai | NIANFENG NF314E | 269 | 0 | 273 | 313 |
| 23 | fdk-energy | YC6MK420L-D20 | Yuchai | NIANFENG NFS4-ES | 265 | 0 | 269 | 313 |
| 24 | dingbo | YC6MK420-D30 | Yuchai | TFW2-250-4A | 265 | 0 | 269 | 312.5 |
| 25 | eastern-lion-fuan | YC6MK420-D30 | Yuchai | EL 314E | 265 | 0 | 269 | 313 |
| 26 | jet-power | WP10D320E200 | Weichai | JET444E | 257 | 0 | 261 | 313 |
| 27 | longkai-power | 6M16G350/5 | Baudouin | LSA46.3 L11 | 226 | 0 | 233 | 320 |
| 28 | wintpower | WD135TAD28 | Wudong | LSA46.2VL12 | 225 | 0 | 229 | 313 |
| 29 | westinpower | E3262E302 | MAN | HCI544C | 222 | 0 | 239 | - |
| 30 | liangzi-yangzhou | NT144LU25 | Tongchai | - | 95 | 0 | 99 | - |

### IB2600594596 400 kVA: TRƯỚC (main sau PR A)
| # | NCC | động cơ | hãng | đầu phát | điểm | fit | data | công suất prime |
|---|---|---|---|---|---|---|---|---|
| 1 | fdk-energy | YC6K520-D30 | Yuchai | NIANFENG NF314H | 281 | - | - | 400 |
| 2 | fdk-energy | YC6MJ500L-D21 | Yuchai | NIANFENG NF314G | 281 | - | - | 375 |
| 3 | dingbo | TAD1352GE | Volvo Penta | LSA46.3 L11 | 281 | - | - | 375 |
| 4 | jet-power | TAD1355GE | Volvo Penta | HCI444F | 278 | - | - | 400 |
| 5 | dingbo | NTAA855-G7 | Cummins | HCI444FS1 | 278 | - | - | 375 |
| 6 | uleengen | NTAA855-G7 | Cummins | HCI444F | 278 | - | - | - |
| 7 | uleengen | 2206C-E13TAG3 | Perkins | HCI444F | 278 | - | - | - |
| 8 | uleengen | KTA19-G3 | Cummins | HCI544C | 274 | - | - | - |
| 9 | yongcai-elecmama | KTA19-G3 | Cummins | HCI544C | 274 | - | - | 450 |
| 10 | jet-power | TAD1650GE | Volvo Penta | HCI544C | 274 | - | - | 450 |
| 11 | fdk-energy | YC6K500-D31 | Yuchai | NIANFENG NF314G | 273 | - | - | 375 |
| 12 | fdk-energy | YC6MJ500-D30 | Yuchai | NIANFENG NF314G | 273 | - | - | 375 |
| 13 | yongcai-elecmama | NTAA855-G7A | Cummins | HCI444F | 270 | - | - | 400 |
| 14 | dingbo | 6ZTAA13-G3 | Cummins | HCI444FS1 | 270 | - | - | 375 |
| 15 | eastern-lion-fuan | YC6K520-D30 | Yuchai | EL 314G | 269 | - | - | 400 |
| 16 | eastern-lion-fuan | NTAA855-G7 | Cummins | EL 314F | 269 | - | - | 375 |
| 17 | dingbo | 2206C-E13TAG3 | Perkins | MP-300-4A | 269 | - | - | 375 |
| 18 | koten-power | 2206C-E13TAG3 | Perkins | 444F | 269 | - | - | 400 |
| 19 | eastern-lion-fuan | QSNT-G3 | Cummins | EL 314G | 269 | - | - | 400 |
| 20 | jet-power | TAD1352GE | Volvo Penta | ECO40 1S4C | 269 | - | - | 365 |
| 21 | jet-power | TAD1355GE | Volvo Penta | ECO40 1S4C | 269 | - | - | 400 |
| 22 | uleengen | 2506C-E15TAG1 | Perkins | S4L1D-G41 | 268 | - | - | - |
| 23 | eastern-lion-fuan | YC6K500-D31 | Yuchai | EL 314F | 261 | - | - | 380 |
| 24 | bobig-power | 6ZTAA13-G3 | Cummins | BW-314F | 261 | - | - | 375 |
| 25 | acepow-fuan | WP13D385E200 | Weichai | HC434F | 261 | - | - | 375 |
| 26 | wintpower | YC6T550L-D21 | Yuchai | WT544C | 257 | - | - | 400 |
| 27 | bobig-power | NTA855-G3 | Cummins | - | 213 | - | - | 400 |
| 28 | rehlko | P158LE | Doosan | - | 165 | - | - | 400 |
| 29 | weichai-heavy-machinery | WP13D405E200 | Weichai | - | 138 | - | - | 400 |
| 30 | fg-wilson | 2206D-E13TAG3A | Perkins | - | 75 | - | - | 400 |

### IB2600594596 400 kVA: SAU (PR B)
| # | NCC | động cơ | hãng | đầu phát | điểm | fit | data | công suất prime |
|---|---|---|---|---|---|---|---|---|
| 1 | fdk-energy | YC6K520-D30 | Yuchai | NIANFENG NF314H | 281 | 0 | 281 | 400 |
| 2 | jet-power | TAD1355GE | Volvo Penta | HCI444F | 278 | 0 | 278 | 400 |
| 3 | yongcai-elecmama | NTAA855-G7A | Cummins | HCI444F | 270 | 0 | 270 | 400 |
| 4 | eastern-lion-fuan | YC6K520-D30 | Yuchai | EL 314G | 269 | 0 | 269 | 400 |
| 5 | koten-power | 2206C-E13TAG3 | Perkins | 444F | 269 | 0 | 269 | 400 |
| 6 | jet-power | WP13D385E200 | Weichai | JET444F | 261 | 0 | 261 | 400 |
| 7 | wintpower | YC6T550L-D21 | Yuchai | WT544C | 257 | 0 | 257 | 400 |
| 8 | longkai-power | 6M21G440/5 | Baudouin | LSA47.3 S4 | 233 | 0 | 233 | 400 |
| 9 | comappower | DP126LB | Hyundai / Doosan | - | 221 | 0 | 221 | 401 |
| 10 | jet-power | 618AZLD-1 | Ricardo | JET444F | 221 | 0 | 221 | 400 |
| 11 | rise-power | CAT C13 | Caterpillar | LC6114C | 221 | 0 | 221 | 400 |
| 12 | bobig-power | NTA855-G3 | Cummins | - | 213 | 0 | 213 | 400 |
| 13 | aosif | P158LE | Doosan | - | 203 | 0 | 205 | 408 |
| 14 | longkai-power | YM6S9LF-D | YTO | - | 195 | 0 | 197 | 410 |
| 15 | kaichen-jiangsu | 6ETAA12.8-G32 | SDEC | - | 189 | 0 | 189 | 400 |
| 16 | voltgent | TCD12.1 G2 | Deutz | - | 189 | 0 | 189 | 400 |
| 17 | longkai-power | CA6DM3J-48D | FAWDE | - | 181 | 0 | 181 | 400 |
| 18 | victory-generator | 8V1600G80F | MTU | - | 181 | 0 | 181 | 400 |
| 19 | gordon-power | WT13-360DE | Kofo / Ricardo | - | 173 | 0 | 173 | 400 |
| 20 | rehlko | P158LE | Doosan | - | 165 | 0 | 165 | 400 |
| 21 | voltgent | CURSOR13TE3A.S551 | FPT | - | 165 | 0 | 165 | 400 |
| 22 | world-power-fuzhou | WD145TAD35 | Wudong | - | 157 | 0 | 157 | 400 |
| 23 | eastern-lion-fuan | KP425 | ? | EL 314G | 145 | 0 | 145 | 400 |
| 24 | weichai-heavy-machinery | WP13D405E200 | Weichai | - | 138 | 0 | 138 | 400 |
| 25 | fg-wilson | 2206D-E13TAG3A | Perkins | - | 75 | 0 | 75 | 400 |
| 26 | wintpower | S6A3-PTA | Mitsubishi | - | 171 | 0 | 181 | 440 |
| 27 | westinpower | E3268LE222 | MAN | HCI544C | 228 | 0 | 239 | - |
| 28 | fdk-energy | YC6MJ500L-D21 | Yuchai | NIANFENG NF314G | 281 | 0 | 281 | 375 |
| 29 | fdk-energy | YC6K500-D31 | Yuchai | NIANFENG NF314G | 273 | 0 | 273 | 375 |
| 30 | fdk-energy | YC6MJ500-D30 | Yuchai | NIANFENG NF314G | 273 | 0 | 273 | 375 |

### IB2600603983 700 kVA: TRƯỚC (main sau PR A)
| # | NCC | động cơ | hãng | đầu phát | điểm | fit | data | công suất prime |
|---|---|---|---|---|---|---|---|---|
| 1 | dingbo | TWD1645GE | Volvo Penta | LSA49.3 M6 | 281 | - | - | 700 |
| 2 | uleengen | KTA38-G2 | Cummins | S5L1D-H41 | 277 | - | - | - |
| 3 | uleengen | 4006-23TAG2A | Perkins | S5L1D-H41 | 277 | - | - | - |
| 4 | yongcai-elecmama | KTA38-G2 | Cummins | LVI634B | 271 | - | - | 750 |
| 5 | koten-power | 4006-23TAG2A | Perkins | LVI634B | 271 | - | - | 750 |
| 6 | uleengen | 4006-23TAG3A | Perkins | S6L1D-C41 | 270 | - | - | - |
| 7 | uleengen | KTA38-G2B | Cummins | S6L1D-C41 | 270 | - | - | - |
| 8 | yongcai-elecmama | KTA38-G2B | Cummins | LVI634C | 264 | - | - | 800 |
| 9 | bobig-power | KTA38-G2 | Cummins | BW-404B | 262 | - | - | 750 |
| 10 | fdk-energy | 4006-23TAG3A | Perkins | Stamford S5L1D-H4 | 262 | - | - | 750 |
| 11 | fdk-energy | QSK23-G2 | Cummins | Stamford S5L1D-H41 | 262 | - | - | 750 |
| 12 | voltgent | 4006-23TAG3A | Perkins | FGL70030 | 261 | - | - | 800 |
| 13 | dingbo | KTA38-G2B | Cummins | LVI634C1 | 255 | - | - | 800 |
| 14 | jet-power | TWD1744GE | Volvo Penta | ECO40 VL4C | 246 | - | - | 750 |
| 15 | longkai-power | 6M33G825/5 | Baudouin | LSA49.3 M65 | 238 | - | - | 750 |
| 16 | longkai-power | 6M33G660/6 | Baudouin | LSA49.3 M65 | 238 | - | - | 750 |
| 17 | gb-power | 4006-23TAG2A | Perkins | STAMFORD LVI634B | 229 | - | - | 700 |
| 18 | jiuan-power | KTAA19-G6A | Cummins | - | 228 | - | - | 710 |
| 19 | voltgent | 2806A-E18TTAG4 | Perkins | LL7224J | 228 | - | - | 706 |
| 20 | fdk-energy | S6R2-PTAA | Mitsubishi | Stamford S5L1D-H41 | 222 | - | - | 750 |
| 21 | comappower | KTA38-G1 | Cummins | - | 195 | - | - | 713 |
| 22 | westinpower | 12V2000G65 | MTU | - | 194 | - | - | 780 |
| 23 | voltgent | 6M31G825/5 | Baudouin | - | 190 | - | - | 750 |
| 24 | wintpower | S12A2-PTA | Mitsubishi | - | 184 | - | - | 735 |
| 25 | mingbang-mbkl | KTA38-GA | Cummins | - | 173 | - | - | 700 |
| 26 | comappower | TWD1673GE | Volvo Penta | - | 172 | - | - | 705 |
| 27 | comappower | 12V2000G45 | MTU | - | 160 | - | - | 788 |
| 28 | mecca-power | 12V1600G11F | MTU | - | 118 | - | - | 750 |
| 29 | pauway-tianjin | 2806A-E18TAG4 | Perkins | - | 74 | - | - | 706.25 |
| 30 | agg-fuzhou | S12A2-PTA2 | Mitsubishi | - | 69 | - | - | 800 |

### IB2600603983 700 kVA: SAU (PR B)
| # | NCC | động cơ | hãng | đầu phát | điểm | fit | data | công suất prime |
|---|---|---|---|---|---|---|---|---|
| 1 | dingbo | TWD1645GE | Volvo Penta | LSA49.3 M6 | 281 | 0 | 281 | 700 |
| 2 | gb-power | 4006-23TAG2A | Perkins | STAMFORD LVI634B | 229 | 0 | 229 | 700 |
| 3 | jiuan-power | KTAA19-G6A | Cummins | - | 228 | 0 | 229 | 710 |
| 4 | voltgent | 2806A-E18TTAG4 | Perkins | LL7224J | 228 | 0 | 229 | 706 |
| 5 | comappower | KTA38-G1 | Cummins | - | 195 | 0 | 197 | 713 |
| 6 | mingbang-mbkl | KTA38-GA | Cummins | - | 173 | 0 | 173 | 700 |
| 7 | comappower | TWD1673GE | Volvo Penta | - | 172 | 0 | 173 | 705 |
| 8 | runda-fujian | KT38-G1 | Cummins | - | 147 | 0 | 149 | 713 |
| 9 | yanfa-yancheng | KTA38-DM | Cummins | - | 99 | 0 | 99 | 700 |
| 10 | pauway-tianjin | KTA38-G1B | Cummins | - | 89 | 0 | 91 | 712 |
| 11 | pauway-tianjin | 2806A-E18TAG4 | Perkins | - | 74 | 0 | 75 | 706.25 |
| 12 | fdk-energy | 4006-23TAG3A | Perkins | Stamford S5L1D-H4 | 262 | 0 | 269 | 750 |
| 13 | jet-power | TWD1744GE | Volvo Penta | ECO40 VL4C | 246 | 0 | 253 | 750 |
| 14 | longkai-power | 6M33G825/5 | Baudouin | LSA49.3 M65 | 238 | 0 | 245 | 750 |
| 15 | longkai-power | 6M33G660/6 | Baudouin | LSA49.3 M65 | 238 | 0 | 245 | 750 |
| 16 | fdk-energy | S6R2-PTAA | Mitsubishi | Stamford S5L1D-H41 | 222 | 0 | 229 | 750 |
| 17 | voltgent | 6M31G825/5 | Baudouin | - | 190 | 0 | 197 | 750 |
| 18 | wintpower | S12A2-PTA | Mitsubishi | - | 184 | 0 | 189 | 735 |
| 19 | voltgent | 6M33G633/6 | Baudouin | - | 178 | 0 | 181 | 720 |
| 20 | generatordieselchina | 2806A-E18TTAG5 | Perkins | - | 167 | 0 | 174 | 750 |
| 21 | voltgent | 6M33G8D3/5 | Baudouin | - | 166 | 0 | 173 | 750 |
| 22 | mecca-power | 12V1600G11F | MTU | - | 118 | 0 | 125 | 750 |
| 23 | mecca-power | QST30-G1 | ? | - | 61 | 0 | 65 | 728 |
| 24 | mecca-power | 12V2000G16F | ? | - | 58 | 0 | 65 | 750 |
| 25 | mecca-power | QSK23-G8 | ? | - | 58 | 0 | 65 | 750 |
| 26 | huayuan-weifang | KTA50G | ? | - | 16 | 0 | 23 | 750 |
| 27 | westinpower | 12V2000G65 | MTU | - | 194 | 0 | 205 | 780 |
| 28 | comappower | 12V2000G45 | MTU | - | 160 | 0 | 173 | 788 |
| 29 | agg-fuzhou | S12A2-PTA2 | Mitsubishi | - | 69 | 0 | 83 | 800 |
| 30 | agg-fuzhou | 12V2000G26F | MTU | - | 61 | 0 | 75 | 800 |

## Ngưỡng dung tích trong HSMT nhiều cỡ (chỉ đo, không sửa; theo yêu cầu điều phối)
`engineMins` đọc ngưỡng trên toàn văn; nếu có nhiều giá trị khác nhau thì trả null (không ngưỡng nào). Trong 12 gói / 14 cỡ chỉ có **1 gói / 2 cỡ** bị null vì hai cỡ máy có ngưỡng khác nhau: **IB2600594596** (300 và 400 kVA). Đọc từ văn bản (`scratchpad\nullmin.mjs`, `nullmin.json`):

| cỡ | số xi lanh tối thiểu | dung tích tối thiểu | vị trí trong HSMT |
|---|---|---|---|
| 400 kVA (dự phòng 440 kVA) | ≥ 8 xy lanh | ≥ 14,5 L | dòng 184–185, dưới khối "440 kVA" bắt đầu dòng 134 |
| 300 kVA (dự phòng 330 kVA) | ≥ 6 xy lanh | ≥ 9 L | dòng 369–370, dưới khối "330 kVA" bắt đầu dòng 319 |

Giá trị gắn cỡ theo dòng kVA gần nhất phía trên, khớp văn bản này (khối 330 kVA đi cùng "≥ 300 kVA liên tục" ở dòng 316). Phân loại 14 cỡ theo `engineMins` (toàn văn): đọc được ngưỡng dung tích 4 cỡ (IB2600574589 400: ≥12 L, ≥6 xi lanh; IB2600581977 250: ≥11,05 L, ≥6; IB2600592684 30 và 500: ≥3,9 L, đây là dòng "Dung tích xi lanh: 3.9L" dòng 108 thuộc cỡ 30, nhưng áp cả cho 500, vô hại vì không động cơ 500 kVA nào dưới 3,9 L); chỉ đọc được số xi lanh 1 cỡ (IB2600603983 700: ≥6); **null vì nhiều cỡ khác ngưỡng: 2 cỡ (IB2600594596 300 và 400)**; HSMT không có ngưỡng dung tích / xi lanh: 7 cỡ (IB2600581294, IB2600586587, IB2600592658, IB2600595853, IB2600599817, IB2600601812, IB2600602880).

## Test
`node --test` (suppliers/): 308 pass, 0 fail (302 của main sau PR A + 6 mới; 3 test cũ sửa). `node suppliers/verify.mjs`: 0 lỗi. Test mới: động cơ trước (hãng nhiều datasheet không chiếm hết chỗ), chia lượt theo hãng, mỗi động cơ có dòng trước khi có dòng thứ hai, fit trước data, data chỉ chọn NCC và phá hoà, score = fit + data − vượt cỡ.

## Rủi ro
- Danh sách 30 đổi mạnh (giữ 4–21 dòng cũ mỗi cỡ); 9 cấu hình hạng 1–3 của lượt trước mất dòng của NCC của chính chúng (2 động cơ biến mất hẳn). `keep` chỉ có tác dụng khi HSMT đòi Đồng bộ (như cũ); muốn bảo toàn cấu hình lượt trước ở mọi gói thì cần mở rộng `keep` (chưa làm, chờ quyết).
- Dòng ít dữ liệu vào nhiều hơn: dòng không đầu phát 26% → 49%, 0 thông số động cơ 4 → 48. Động cơ "hãng không rõ" ("?") mỗi vòng một chỗ: IB2600603983 700 có 4 dòng hãng "?" (điểm 16–61) ở vị trí 23–26.
- Thứ tự in cuối là (fit, gap, data): dòng đúng cỡ lên trước dù ít dữ liệu; khác cách đọc "tốt nhất trước" trước đây.
- 3 test của cand-sync phải sửa vì giả thiết "12 NCC Trung Quốc chiếm hết 30 dòng" không còn đúng (động cơ P158LE của Rehlko khác hãng nên có chỗ ngay vòng 1). Các chỗ giữ chỗ sync / keep vẫn được kiểm bằng `max: 10`.
- Quay lui: revert PR; sau merge restart bot.

## Chưa kiểm
- Chưa chạy agent: chưa biết cấu hình agent chọn có tốt hơn; "mất cấu hình" ở trên là so với lượt trước, không phải so với đáp án đúng.
- Kích thước tổng đầu vào agent (prompt / input / hsmt) không đo, chỉ catalog.md.
- Số đo từ bản chụp 12/11; `prevResult` / `keep` lấy từ configmatch lượt trước.
