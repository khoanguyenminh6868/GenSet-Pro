**Kết luận: Honda ghi GX390 / GX630 / GX690 chạy xăng không chì (trang hãng, 20/11/2026). ZS168FA / ZS182F / ZS190F: không tìm được trang của HÃNG; trang simpson không ghi hãng của chúng → hãng và nhiên liệu "không rõ" theo nguồn hãng (chỉ trang bán lẻ gọi là "Zongshen", máy xăng — không dùng). Trang simpson tên "SIMPSON-GasGenerators", không câu nào ghi nhiên liệu. Ghép: 7 / 14 dòng dùng động cơ Honda xăng, 3 dòng động cơ ZS, 4 dòng chỉ ghi "31HP" / "35HP".**

# simpson-power n124: nhiên liệu theo datasheet động cơ (Khoa 20/11/2026, câu 4 = C)

Chỉ đọc: không sửa mã, không ghi web.

## 1. Trang simpson ghép động cơ nào
Nguồn: `http://www.simpsonpower.cn/en/chanpinDetail/870.aspx` (lưu 13/11, `suppliers/sources/simpson-power/124.md` dòng 62–76; trang sống mở lại 20/11, tên trang vẫn "SIMPSON-GasGenerators"). Tiêu đề cột `| 机 组 型 号 | 备 用 功 率 ( kW/kVA) | 发 动 机 型 号 | 机 组 尺 寸 (mm) ( 长×宽×高) | 机 组 数 据`.

| tổ máy | standby kW/kVA | động cơ |
|---|---|---|
| SGH2200X | 2.2/2.2 | ZS168FA |
| SGH4200X | 4.2/4.2 | ZS182F |
| SGH6500E | 5.2/5.2 | GX390 |
| SGH8500E | 6.5/6.5 | ZS190F |
| SGH1110E | 10/10 | GX630 |
| SGH3135E | 10/12.5 | GX630 |
| SGH1130E | 11.5/11.5 | GX690 |
| SGH3160E | 11.5/14.37 | GX690 |
| SGH1150E | 12/12 | GX690 |
| SGH3180E | 13/16.25 | GX690 |
| SGH1160E | 15.5/15.5 | 31HP |
| SGH3200E | 16/20 | 31HP |
| SGH1180E | 17/17 | 35HP |
| SGH3300E | 18.5/23 | 35HP |

Trang không ghi hãng động cơ (menu "Engine brand" chỉ có MTU, Perkins, Mitsubishi, SME, Cummins, Deutz), không ghi nhiên liệu. Catalog hiện đọc 10 bản ghi động cơ (6 model; "31HP" / "35HP" không là mã).

## 2. Datasheet trên trang HÃNG động cơ

| động cơ | hãng (theo nguồn) | URL | trích nguyên văn (≤ 15 từ) | nhiên liệu |
|---|---|---|---|---|
| GX390 | Honda | https://engines.honda.com/models/model-detail/x-large-gx (mở 20/11) | GX390, dòng Fuel: "Unleaded 86 octane or higher" | xăng không chì |
| GX630 | Honda | https://engines.honda.com/models/model-detail/v-twin-horizontal (mở 20/11) | GX630, dòng Fuel: "Unleaded 86 octane or higher" | xăng không chì |
| GX690 | Honda | như trên (trang chung GX630/690) | GX690, dòng Fuel: "Unleaded 86 octane or higher" | xăng không chì |
| (chung Honda) | Honda | https://engines.honda.com/support-and-service/fuel-recommendations | "designed to run on regular unleaded gasoline" | xăng |
| ZS168FA | không rõ | không tìm được trang hãng | — | không rõ |
| ZS182F | không rõ | không tìm được trang hãng | — | không rõ |
| ZS190F | không rõ | không tìm được trang hãng | — | không rõ |

Đã tìm: `"ZS168FA" engine`, "ZS168FA ZS182F ZS190F gasoline engine manufacturer", "宗申 通用动力 ZS168FA 汽油机", `site:zsengine.com 168FA OR 182F OR 190F` (trang Zongshen General Power, không ra trang model). Chỉ có trang bán lẻ / phụ tùng (yandex market, sima-land, hebu-shop, bigiron…) gọi "Zongshen ZS168FA" là động cơ xăng, và engine-specs.net (bên thứ ba) gọi Zongshen 168FA / 182F / 190F là "small gasoline engine". Theo quy tắc (không lấy từ trang bán lại) → KHÔNG dùng; hãng + nhiên liệu ZS: không rõ.

## 3. Đọc kết quả (không suy thêm)
- Honda nói động cơ GX của họ chạy xăng. Trang simpson không nói tổ máy SGH dùng bản động cơ nào / có chuyển sang khí (LPG / NG) hay không, và tên trang ghi "GasGenerators". Hai điều này không mâu thuẫn được giải quyết bằng nguồn: "Gas" có thể là gasoline, có thể là bộ chuyển khí — **không rõ**.
- Điều chắc từ nguồn: không dòng nào là diesel theo hãng động cơ (7 dòng Honda xăng); 7 dòng còn lại không rõ.

## 4. Lựa chọn để Khoa quyết (một chữ)
- **X** ghi `fuel` = xăng cho 7 bản ghi dòng GX (căn cứ datasheet Honda, mức "theo hãng động cơ" — loại bằng chứng MỚI, chưa có trong luật B / T / M của #958); ZS + HP để rỗng. Với #963: 7 dòng ra khỏi gói diesel.
- **L** coi cả bảng "không phải diesel" (tên trang "Gas" + 7 / 14 dòng xăng theo Honda) → loại cả 10 bản ghi khỏi gói diesel (25 lần top / 21 gói; số trên lượt cloud 79e9b175 tính cả bảng).
- **G** giữ như cũ (rỗng).
Đề xuất của phiên con: X (chỉ phần có nguồn hãng). Tách số top (lượt cloud 79e9b175): dòng GX 5 lần / 4 lượt / 4 gói (có lần hạng 1); dòng ZS 20 lần / 20 lượt / 19 gói. Nghĩa là X chỉ bỏ 5 / 25 lần; phần lọt top nhiều nhất là ZS (không rõ).
