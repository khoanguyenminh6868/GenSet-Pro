---
name: config-suggest
description: "Gợi ý cấu hình (config-bot.mjs): quy tắc Khoa chốt về xếp hạng, nguồn thông số, datasheet hãng, Tìm NCC; việc còn dở"
metadata:
  node_type: memory
  type: project
  originSessionId: 93e41953-82a9-4265-a2a5-f081042fd87d
  modified: 2026-11-04T06:27:03.335Z
---

**Luồng:** web `configreq/<TBMT>` → `suppliers/config-bot.mjs run` (máy Windows, agent `claude -p` Opus theo `config-prompt.md`) → `check` kiểm bằng code → `configmatch/<TBMT>`. Mọi số/câu trích phải có nguyên văn trong nguồn; sai → "Đạt" thành "Chưa rõ". config-bot chạy tiến trình mới mỗi lượt nên sửa không cần restart bot. Lượt agent ~6–11 phút, ~$3/gói.

**Quy tắc Khoa chốt (02–03/11):**
- Xếp hạng (`rankConfigs`): số "không đạt" ở động cơ + bộ điều khiển (đếm từng chức năng BĐK) → không đạt ở đầu phát + tổ máy → có NCC phù hợp → "chưa rõ" cùng thứ tự → yêu cầu `option` (bồn dầu, kích thước, độ ồn) sau cùng. Chưa kiểm = chưa rõ. Tối đa 6 cấu hình.
- HSMT có yêu cầu BĐK mà cấu hình không có BĐK → "Bộ điều khiển của cấu hình" = Không đạt. Chức năng BĐK cùng loại gộp 1 yêu cầu có `parts`; nhóm đạt khi mọi phần đạt, phần thiếu = chưa rõ.
- NCC chào đúng CẢ động cơ và BĐK lên đầu. Đại lý tại VN KHÔNG là tiêu chí.
- Xuất xứ (mặc định cn): động cơ hãng TQ +250 điểm, đứng trước động cơ ngoại do NCC ở TQ chào (hãng HSMT nêu +300 vẫn thắng). G7/G20 theo `ENGINE_COUNTRY`/`COUNTRY_GROUP` (catalog.js), loại động cơ TQ sản xuất theo giấy phép (Weichai 6M33). Gói G7/G20 hay đòi tổ máy cùng hãng → agent tìm internet.
- Số trần trong HSMT = mức tối thiểu với thông số càng lớn càng tốt; đường kính/hành trình/kích thước khác số → chưa rõ, không "không đạt". Datasheet đời khác → chưa rõ.
- Tìm NCC CHỈ Claude (`GENBID_FIND_ENGINES` bật lại Gemini). NCC mới trùng cấu hình có sẵn (cùng động cơ, cùng đầu phát nếu cả hai ghi) → gắn vào; không trùng → cấu hình mới chỉ có NCC đó; agent nhỏ (`check-prompt.md`) đối chiếu HSMT. Không chạy lại cả Gợi ý.

**Cơ chế chính:** code xếp sẵn 30 dòng ứng viên (`candidates`: 1 dòng/NCC+động cơ+đầu phát, 3/động cơ, 8 nếu HSMT nêu, 4/NCC; `engineMins`/`powerMins`/`maxDisp` đọc ngưỡng HSMT, dưới ngưỡng −600/−300; `plausible()` bỏ ngưỡng phi lý). Thông số theo model dùng chung qua `modelFacts`/`factSrc`; nguồn ghi khác nhau → chưa rõ (`disagree` coi chênh ≤3% là làm tròn). `copyModelChecks` chép kiểm tra sang cấu hình trùng model (BĐK theo `ctlModelOf`, DSE7320 = Deepsea 7320). `reqHash` + `REQ_VERSION` dùng lại yêu cầu khi Gợi ý lại. check in `x.hint` "CÓ THỂ TRA ĐƯỢC" cho mục chưa rõ mà nguồn có dòng liên quan (code không tự đổi trạng thái). catalog.js đọc bảng tiêu đề nhiều tầng (`walkedSpecs`), bảng xếp theo cột (`columnOf`). `controllers.md` chứa mọi dòng datasheet BĐK cho agent grep (giới hạn 12 datasheet). BĐK ghi không kèm đời (DSE7320, AMF25, HGM6110, "InteliGen") → datasheet đời hiện hành + "cần xác nhận đời".

**Datasheet hãng:** `maker-datasheets.mjs <id> <pdf...>` → `merge-specs.mjs <id>` → `verify.mjs`. Nguồn: Wintpower WT (wintpower.com/uploads/<model>.pdf); Stamford (stamford-avk.com/alternators/stamford/<frame>, PDF INDUSTRIAL; HCI4xx đời mới ≠ HCI444); Leroy-Somer (leroy-somer.com/documentation_pdf/6608–6613_en.pdf TAL, đọc từng nửa trang; LSA hiện hành ở moen.nidec.com Catalogues); Deep Sea (<trang model>/downloads/datasheet; sổ tay cần đăng nhập 403); SmartGen (smartgen.cn/yun/data/download/<tên>_en.pdf, tìm bằng WebSearch); ComAp (/productfile/<id>, lưu link gốc; InteliLite NT không còn datasheet). Không có datasheet theo model: Jet-Power JET, Bobig BW, Acepow HC, Nianfeng NFS (đầu phát TQ không nhận Stamford từ tiêu đề trang).

**Thử / kiểm hồi quy:** `GENBID_LOCAL_SUPPLIERS=1` + script dry-run (prep → claude → check, chép `runClaude` ra `%TEMP%\dry-<K>\run.mjs`). Kiểm nhanh không tốn agent: copy w/ lượt cũ, chạy `check --dir` bằng code mới, so "chưa khớp". Log agent `%TEMP%\genbid-config-<TBMT>.log` (stream-json, mốc `[Ns]`). Khoá `genbid-config.lock` chỉ tính khi PID còn sống. Bash máy này làm mất `\` → viết script bằng Write rồi chạy node.

**Hồi quy lớn (04/11, PR #311):** tải `bidhist`/`analysis`/`supplier`/`configmatch` qua `api/requests?kind=docs&coll=…` rồi chạy `capacity`/`hintsOf`/`plausible`/`candidates` trên `genbid-work/specs/<K>/text.txt` (~1.240 gói), so với `bidhist.config.text/kvas` (AI đọc). Bộ so tự viết cũng sai (đọc "11.051 L" thành 11051, dự phòng thành Prime) → xem từng ca trước khi kết luận. candidates ~0,6 s/gói (CAT.build 6 s). Sau #311 + #313: công suất 97,8%, dung tích 61%, xi lanh 76%, Prime 59%. #313: `unflatten` (dòng > 300 ký tự tách lại hàng) + `sectionsOf` (số dưới tiêu đề đầu phát/động cơ). Bỏ sót còn lại: AI tính dung sai khác (±0,5 → code lấy số thấp), gói nhiều cỡ máy (code cố ý không đoán), OCR hỏng ký tự (≥ thành 2). Công suất tên gói bỏ số của máy biến áp/TBA/UPS (`capPick` trong web/bidprice.js, dùng chung bot + web + Gợi ý giá đấu). Chỉ có 6 configmatch trên web nên phần agent chưa hồi quy được nhiều.

**Khoa 04/11:** nguồn mâu thuẫn (kể cả 1 nguồn sai rõ ràng, 2 nguồn khác khớp nhau) vẫn để "chưa rõ", KHÔNG lấy đa số.

**Còn dở:** LSA đời ngừng chỉ có bản đăng lại ở trang đại lý (dùng hạng C?); InteliLite NT AMF20/25, MRS10 chưa có datasheet. "Chưa rõ" còn lại chủ yếu do thiếu dữ liệu (đầu phát TQ, tiêu hao/quá tải tổ máy TQ, danh mục gần như không ghi số pha nên gói 1 pha hay ra máy 3 pha) → muốn hơn phải xin catalog từ NCC. Đã hết việc tối ưu code đáng làm (03/11); configmatch trên web trước 02/11 21:26 là code cũ.

Liên quan [[supplier-db]], [[bidprice-suggest]], [[session-log]].
