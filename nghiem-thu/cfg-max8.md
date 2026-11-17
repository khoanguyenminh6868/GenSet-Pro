# cfg-max8 — đo trần 6 cấu hình (bước 1), 13/11/2026

**Kết luận: KHÔNG PR.** Lượt thử trần 10 không ra cấu hình thứ 7–8 nào: trần 6 không cắt cấu hình sạch ở gói đo.

## Chọn gói
configmatch đọc bằng `Get-GenBidRequests.ps1 -Kind docs -Coll configmatch` (13 tài liệu). Danh sách đủ 6 cấu hình (đếm "không đạt" theo item):
- IB2600586587 (160 kVA, xuất xứ all): 6 cấu hình, cả 6 không có "không đạt" nào → **chọn gói này** (một cỡ máy, không có tổ máy nêu đích danh).
- IB2600601812: 6, cả 6 sạch (có tổ máy HSMT nêu đích danh, Hyundai) — chưa đo.
- IB2600603983 (g7eu): 6, #6 Baudouin có 1 "không đạt" ngoài động cơ/BĐK — chưa đo.
- IB2600592684 cỡ 1, IB2600594596 cỡ 1: 6, #6 có "không đạt".
- IB2600581294: 8 (kết quả cũ 29/10, trước khi trần là 6).

## Cách chạy (không đăng web, không đẩy danh mục)
- Worktree `wt-cfg-max8` từ origin/main d091107; sửa TẠM (đã hoàn lại, không commit): export `prep`, `runClaude`; `MAX_CONFIGS = Number(process.env.GENBID_MAX_CONFIGS) || 6`.
- Script `genbid-test\cfg-max8-dry.mjs`: `prep` như `answer()` (kèm `prevResult` = configmatch hiện tại → `reused: true`, cùng yêu cầu), đổi `prompt.md` "Keep at most 6" → 10, MỘT lượt `runClaude`, rồi `GENBID_MAX_CONFIGS=10 node suppliers/config-bot.mjs check --dir …` (suppliers.json cục bộ). Không addToCatalog, keepFound, post, rebid.
- Thư mục lượt: `%TEMP%\claude\cfgmax8\run\` (result.json, result.checked.json, agent.log); điểm: `%TEMP%\claude\cfgmax8\score.mjs` (dùng `scoreOf` của code).

## Số đo (đo thật)
prep: 30 dòng ứng viên, origin all.

Agent trả **7 dòng**; `check` (rankConfigs gộp động cơ+đầu phát+BĐK trùng) còn **6**:

| # | Động cơ | Đầu phát | BĐK | scoreOf | NCC |
|---|---|---|---|---|---|
| 1 | Yuchai YC6A245L-D21 | NIANFENG NF274H | HGM9510 | [0,0,0,2,2,0,0] | fdk-energy, uleengen, comappower |
| 2 | Yuchai YC6A245-D30 | NIANFENG NF274H | HGM9510 | [0,0,0,2,2,0,0] | fdk-energy, comappower, westinpower |
| 3 | Cummins 6CTA8.3-G2 | UCI274H | HGM9510 | [0,0,0,2,4,0,0] | fdk-energy, uleengen, aosif |
| 4 | Perkins 1106A-70TAG3 | UCI274G | HGM6120N | [0,0,0,4,1,0,0] | jet-power, tecgen-fujian, koten-power |
| 5 | Weichai WP6D167E200 | JET274G | HGM6120N | [0,0,0,4,2,0,0] | jet-power, koten-power, longkai-power |
| 6 | Volvo Penta TAD752GE | UCI274H | HGM6120N | [0,0,0,5,2,0,0] | jet-power, rise-power, comappower |

- Dòng thứ 7 của agent = Perkins 1106A-70TAG3 + UCI274G + HGM6120N lần hai (trùng #4) → bị gộp. **Cấu hình 7–10: không có.**
- Cùng 6 động cơ như lượt 6 cấu hình trước (configmatch 12/11 15:47 UTC); khác: BĐK #1–3 đổi HGM6120CAN → HGM9510 ("chưa rõ" động cơ+BĐK 3 → 2), đổi vài NCC.
- Không có "không đạt" nào ở cả 6 (scoreOf[0] = scoreOf[1] = 0).

| | Lượt 6 (12/11, log `%TEMP%\genbid-config-IB2600586587.log`) | Lượt thử trần 10 |
|---|---|---|
| duration_ms | 389 750 | 326 433 |
| total_cost_usd | 1,617 | 2,238 (+38%) |

Lượt thử chạy bằng gói tháng (không có ANTHROPIC_API_KEY trong phiên) → không ghi vào `.anthropic-api-spend.jsonl`; số tiền là total_cost_usd giá niêm yết. Một lượt agent thì chênh chi phí giữa 2 lượt phần lớn là dao động của agent, không chắc do trần.

## Nhận định
Ở gói này thứ giới hạn số cấu hình không phải trần 6 mà là số động cơ khác nhau đủ công suất trong 30 dòng ứng viên (Perkins 1106A-70TAG2/TAG4, Cummins 6BTAA5.9-G12, Yuchai YC6B205L/YC6A205 có mặt nhưng agent không chọn) và luật 2 cấu hình/hãng. Nới trần lên 8 sẽ không đổi gì ở đây.

## Chưa kiểm
- Chỉ đo 1 gói (brief: MỘT lượt). IB2600601812 (tổ máy nêu đích danh) và IB2600603983 (g7eu) chưa đo — nếu muốn chắc hơn, đó là 2 gói tiếp theo.
- Với "không đạt" ở 3 gói trên tôi đếm theo item thô; cấu hình 6 của IB2600603983 có 1 "không đạt" nhưng không ở động cơ/BĐK.

## Quay lui
Không có thay đổi code nào được commit; worktree đã gỡ. Script thử nằm ở `genbid-test\cfg-max8-dry.mjs` (chỉ dùng cho lần đo này).
