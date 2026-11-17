# Nghiệm thu: ncc-cap-phep (đánh dấu `brandLicensed` cho 6 NCC nghi cấp phép)

Kết luận: KHÔNG đánh dấu hồ sơ nào, KHÔNG mở PR. Trang chính thức không có chữ nào nói "cấp phép / licensed / authorised" cho cả 6; vài trang còn nói ngược lại. Đánh dấu khi chưa có căn cứ là bịa (trái `supplier-db.md`).

Trường quy tắc dùng: `"brandLicensed": true` (schema.json dòng 48; mẫu duy nhất: `hyundai-power-products`, có câu "Licensed by HYUNDAI Corporation Holdings, Korea" ngay trên trang hãng). Chưa sửa schema / verify / hồ sơ nào. Worktree `wt-ncc-cap-phep` đã gỡ.

## Căn cứ từng hồ sơ (đọc 17/11/2026, trang chính thức của chính NCC)
| id | Trang | Điều trang nói | Có chữ cấp phép? |
|---|---|---|---|
| himoinsa-china | https://www.himoinsa.com.cn/ | "©HIMOINSA 2026"; menu "关于我们: 洋马 / YES洋马能源系统公司 / 伊蒙妮莎"; liên kết www.yanmar.com | Không. Thuộc nhóm Yanmar–Himoinsa, không nêu giấy phép |
| hipower | https://www.hipowersystems.com/eng.html | "HIPOWER SYSTEMS a Yanmar Company, Generator Sets"; "© HIMOINSA POWER SYSTEMS, INC 2026" | Không. Pháp nhân tên HIMOINSA, cùng nhóm Yanmar |
| aksa-china | https://cn.aksapowergen.com/ | "雅柯斯电力在全球布局4大生产基地（土耳其、中国、美国和西班牙）" | Không. Nhà máy của chính tập đoàn AKSA |
| agg-fuzhou | https://www.aggpower.cn/ | "AGG是一家集设计、制造和分销为一体的全球性发电设备制造商" | Không. Trang không nêu quan hệ sở hữu / giấy phép |
| cat-tianjin | https://www.cat-cn.com/company/factory-dltj.html (nguồn [1] đã có) | "是卡特彼勒全资子公司" | Không, và NGƯỢC lại: công ty con 100% |
| bruno-generators | https://www.brunogenerators.it/about-us/ | "All production processes are managed in-house. All the production plants are located in Italy." | Không, và ngược lại: tự sản xuất |

(Chưa đọc thêm trang riêng của agg-fuzhou về sở hữu: trang chủ không nói; nếu cần, tìm trang "关于我们" của aggpower.cn.)

## Số đo
Trước/sau: số hồ sơ `brandLicensed:true` = 1 (hyundai-power-products) → vẫn 1. Không đổi tệp nào nên không chạy `node --test suppliers/` và verify (không có gì để kiểm).

## Rủi ro / quay lui
Không có thay đổi. Rủi ro còn lại: NCC bán hàng mang tên hãng ngoại có thể vẫn là nhà lắp ráp theo giấy phép dù trang không nói; chỉ giấy tờ của chính hãng (CO, CQ, thư uỷ quyền) chứng minh được, không phải trang web.

## Việc chưa kiểm được
- Quan hệ sở hữu agg-fuzhou ↔ AGG (cần trang "giới thiệu công ty" hoặc hồ sơ pháp nhân từ nguồn chính thức).
- Cat Tianjin: nguồn đã có chỉ nói công ty con 100%, không đổi thành "cần xác nhận".

## Cần ghi nhớ (cho phiên điều phối)
Nếu Khoa vẫn muốn "cần xác nhận" cho nhóm này vì lý do khác (vd. hàng trúng thầu mang tên hãng nhưng do NCC TQ cấp), cần một trường / cách đánh dấu khác với `brandLicensed` (trường này nghĩa là "chỉ mang thương hiệu theo giấy phép", mà căn cứ phải là câu nguyên văn của hãng), và Khoa duyệt.
