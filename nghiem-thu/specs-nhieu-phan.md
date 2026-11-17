# Nghiệm thu: specs đọc Chương V dài nhiều lần rồi ghép (12/11)

PR nháp: xem cuối tệp (điền sau khi mở). Worktree `C:\Projects\GenSet Pro\wt-specs-parts`, nhánh `specs-nhieu-phan` (từ origin/main 24a4292). Không gọi Claude thật, không ghi web thật, `genbid-hsmt\` không bị đụng.

## Tệp đổi
- `bot/genbid-hsmt/genbid-sync.js` (specs-prompt.md KHÔNG đổi: dặn riêng từng phần nằm trong dòng đầu của phần, `partHead`):
  - `partsOf(t, max, overlap)`: chia thành các phần trọn dòng, cỡ gần bằng nhau, mỗi phần ≤ `SPECS_BODY_MAX` (150.000), phần sau mở đầu bằng các dòng cuối phần trước (chồng lấn `SPECS_PART_OVERLAP` = 3.000 ký tự) để dòng bảng không đứt. Dòng dài hơn nửa trần được cắt khúc (hiếm).
  - `specsMerge(vals)`: ghép bằng CODE.
    - technicalSpecs: nối; cùng trích dẫn (hoặc cùng mục + cùng yêu cầu: vùng chồng lấn) giữ một; cùng mục khác con số ở hai phần → giữ cả hai, đánh `unverified` (Gợi ý giá bỏ qua mục unverified) + ghi chú "phần i và phần j nêu khác nhau … chưa rõ"; cùng trích dẫn nhưng khác con số → giữ mục đầu, `unverified`, ghi chú.
    - generatorSets: ghép theo cỡ (cùng một công suất ở cùng trường prime/standby kVA/kW; prime 500 ≠ standby 500). Trường rỗng lấy từ phần kia; trường hai phần nói khác nhau (số lượng, kVA, kW, pha) → để null (không chọn) + ghi chú "số lượng 2 (phần 1) khác 3 (phần 2), chưa rõ".
    - generatorCapacity: các phần ghi giống nhau → giữ nguyên chữ; khác nhau → dựng từ generatorSets đã ghép; không có sets → null + ghi chú.
    - `_notes` của các phần: nối, bỏ trùng.
  - `specsFinish`: phần rỗng (`_error` hoặc không có gì) bị bỏ qua; mọi phần rỗng → "none" (kèm "cả N phần"); dựng result; `checkResult` trên TOÀN BỘ văn bản đã đọc (mọi trích dẫn, mọi con số); trích dẫn của máy ghép không thấy nguyên văn → bỏ + ghi chú. Ghi chú "Chương V dài … đọc hết bằng N lần gọi, ghép bằng mã"; không còn ghi chú "đã lược dòng" khi đã đọc hết.
  - `specsAsk`: chia → gọi tuần tự từng phần (mỗi phần vẫn có lượt hỏi lại bản ngắn khi JSON bị cắt) → ghép. Một phần lỗi / hết hạn mức → trả lỗi / limit cho cả gói, KHÔNG đăng gì (vòng specs để gói ở trạng thái chưa xong như mọi lỗi Claude trước đây). Câu trả lời các phần đã xong lưu ở `genbid-work\specs\<gói>\parts\<i>of<n>-<md5 prompt>.json` để lần sau chỉ hỏi phần còn thiếu; xoá khi đăng xong (không xoá khi `--dry`). Chương V ngắn (≤ 150.000, 1.486/1.499 văn bản) đi đúng đường một lần như cũ, prompt không đổi.
  - Trần `SPECS_PARTS_MAX` = 25 phần (≈ 3,6 triệu ký tự): quá thì lấy cửa sổ nhiều thông số nhất cỡ 25 phần (`densestCut`) và ghi "Chương V dài … quá 25 phần: đã lược dòng …" khi phần lược có thông số. Hiện không văn bản nào chạm (lớn nhất 5 phần).
  - Lệnh kiểm mới `specs-plan` (không Claude, không ghi): in cách chia; `--fake file.json` = mảng câu trả lời giả lập từng phần, in kết quả ghép.
- `suppliers/specs-parts.test.mjs` (mới, 13 test: chia, ghép, mâu thuẫn, none, checkResult toàn văn).

## Số phần mỗi gói (đo bằng `specs-plan`, văn bản `genbid-work\specs\<gói>\text.txt`)
| Gói | Chương V (ký tự) | Trước (1 lần) | Sau: số phần | Tổng ký tự gửi | Dòng mỗi phần |
|---|---|---|---|---|---|
| IB2500310648 | 173.214 | 150.000, lược 22 chỗ | **2** | 176.166 | 1–2373, 2276–5034 /5034 |
| IB2500057816 | 251.645 | 150.000, lược 11 | **2** | 254.603 | 1–7017, 6867–14813 /14813 |
| IB2200015701 | 460.561 | 150.000, lược 10 | **4** | 469.436 | 1–2257, 2209–4662, 4603–6857, 6813–9239 /9239 |
| IB2400446772 | 187.277 | 150.000, lược 1 | **2** | 190.239 | 1–2292, 2195–4362 /4362 |
| IB2400101857 | 597.398 | 150.000 | 5 | 609.275 | 1–3003 … 12876–15728 /15728 |
| IB2500240658 | 397.302 | 150.000 | 3 | 403.023 | 1–4709, 4573–10121, 9924–13935 |
| IB2500360434 | 245.023 | 150.000 | 2 | 248.014 | 1–2673, 2622–6870 /6870 |

Toàn bộ 1.499 văn bản: 1.486 một lần; 10 gói 2 phần, 1 gói 3, 1 gói 4, 1 gói 5 (không gói nào chạm trần 25). Trên đây là chạy thật `specs-plan` (đo), không phải ước tính.

## Chi phí mỗi gói (ƯỚC TÍNH, chưa đo bằng lượt thật)
Giả định ≈ 2,5 ký tự / token (tiếng Việt, như nghiệm thu cut-guard dùng ≈ 2) cộng ~1.500 token prompt mỗi lần; đầu ra mỗi phần ~5–10 nghìn token; giá Sonnet nhập 3 USD/M, xuất 15 USD/M (CHƯA kiểm với bảng giá hiện hành; bot trả bằng API key nên điều phối đối chiếu `noteApiSpend` sau lượt thật).
| Gói | Token vào | Token ra | Ước tính |
|---|---|---|---|
| IB2500310648 (2 lần) | ≈ 73 nghìn | ≈ 10–20 nghìn | ≈ 0,4–0,5 USD |
| IB2500057816 (2) | ≈ 105 nghìn | ≈ 10–20 nghìn | ≈ 0,45–0,6 USD |
| IB2200015701 (4) | ≈ 194 nghìn | ≈ 20–40 nghìn | ≈ 0,9–1,2 USD |
| IB2400446772 (2) | ≈ 79 nghìn | ≈ 10–20 nghìn | ≈ 0,4–0,5 USD |
Bốn gói ≈ 2,2–2,8 USD; trước kia mỗi gói một lần ≈ 60 nghìn token vào. Gói 5 phần (IB2400101857) ≈ 1,2–1,5 USD nhưng gói lưới điện (kết quả "none" lần trước) có thể xong sớm hơn không: vẫn phải hỏi đủ các phần mới được ghi "none".

## Lệnh kiểm đã chạy
```
node --check bot/genbid-hsmt/genbid-sync.js          -> OK
node --test suppliers/specs-parts.test.mjs            -> 13/13
node --test (toàn repo, trong worktree)               -> 395 tests, 395 pass, 0 fail  (main 382 + 13)
node genbid-test\genbid-sync.js specs-plan --key IB2200015701
  Chương V 460561 ký tự, 4 phần
    phần 1/4: dòng 1–2257 / 9239, 117582 ký tự
    phần 2/4: dòng 2209–4662 / 9239, 117583 ký tự
    phần 3/4: dòng 4603–6857 / 9239, 117580 ký tự
    phần 4/4: dòng 6813–9239 / 9239, 116691 ký tự
node bot\genbid-hsmt\genbid-sync.js specs-plan --file ...\IB2500310648\text.txt --fake fake.json
  (2 phần; phần 1 có 1 máy 2 x 500 kVA dự phòng + 1 thông số, phần 2 `_error`) -> generatorCapacity "2 x 500 kVA dự phòng",
  generatorSets 1 máy qty 2, specs 1, notes ["Chương V dài 173.214 ký tự: đọc hết bằng 2 lần gọi, ghép bằng mã (…)"]
```
Bản thử đã chép sang `C:\Projects\GenSet Pro\genbid-test\genbid-sync.js` (+ specs-prompt.md), md5 = bản trong nhánh (cdb66ec8…). `genbid-hsmt\genbid-sync.js` md5 f738469… KHÔNG đổi.

## Cách chép vào bot (điều phối, sau khi merge)
```
copy /Y "C:\Projects\GenSet Pro\genbid-hsmt\genbid-sync.js" "C:\Projects\GenSet Pro\genbid-hsmt\genbid-sync.js.bak-20261112-specsparts"
copy /Y "C:\Projects\GenSet Pro\GenSet-Pro\bot\genbid-hsmt\genbid-sync.js" "C:\Projects\GenSet Pro\genbid-hsmt\genbid-sync.js"
powershell -File "C:\Projects\GenSet Pro\GenSet-Pro\bot\Backup-GenBidBot.ps1"
```
(giả định `genbid-hsmt\genbid-sync.js` hiện bằng bản main 24a4292; đối chiếu md5 trước khi chép.) Không cần restart "GenBid Bot": genbid-sync.js chạy là tiến trình node mới mỗi lượt. Chạy thật 4 gói: lưu `.genbid-specs.json` + bản analysis cũ trước, rồi `node genbid-sync.js specs --key <gói> --profile reread` lần lượt (như lượt 07:14Z).

## Rủi ro còn lại
- Mô hình mỗi phần chỉ thấy một đoạn: mục lặp lại giữa hai phần (cùng tên khác cách viết) có thể thành hai mục; sau đó `unverified` chỉ gắn khi con số khác. Chấp nhận (thừa mục không sai).
- Cùng cỡ máy nằm ở hai lô khác nhau với số lượng khác nhau (vd 2 máy ở lô 1, 1 máy ở lô 2): bị coi là mâu thuẫn số lượng → qty null + ghi chú (đúng yêu cầu "không chọn bừa", nhưng mất số lượng).
- Một phần "không có gì" mà lẽ ra có thông số bị bỏ sót thì không phát hiện được (như một lần gọi trước đây).
- Phần chồng lấn 3.000 ký tự: bảng dài hơn 3.000 ký tự mỗi dòng-hàng hiếm khi gặp.
- Chi phí ước tính, chưa đo.

## Quay lui
Revert PR; nếu đã chép: chép lại `genbid-sync.js.bak-20261112-specsparts`. Kết quả analysis đã đăng chỉ khác ở notes / `unverified`; đọc lại gói để thay.

## Chưa kiểm
- Lượt Claude thật (đường `askPart`, bộ nhớ đệm `parts\`, hỏi lại bản ngắn theo phần): chỉ kiểm bằng đọc mã và test của phần ghép; chưa chạy `specsAsk` với `askOnce` giả.
- Cách model trả lời với dòng đầu `(Phần i/n …)`.
- Giá token thật.
