# Nghiệm thu: tìm lại website Nhóm A (13/11/2026)

PR DRAFT: https://github.com/khoanguyenminh6868/GenSet-Pro/pull/653 (nhánh `sup/tim-web-a`)

## Kết quả
Tìm được website: **1/38**. Không tìm được: 37. Cào ra bảng: 0 dòng.

## Tệp đã đổi
- `suppliers/cn/cummins-china-investment.json` (website + nguồn 7)
- `suppliers/sources/cummins-china-investment/7.md`
Không sửa code, không sửa `spec-none.json`.

## Lệnh đã chạy
- `node suppliers/discover.mjs save cummins-china-investment https://www.cummins.com.cn/` → nguồn số 7.
- `node suppliers/crawl-specs.mjs --max 80 cummins-china-investment` → "44 trang đọc, 0 trang có bảng, 0 dòng".
- `node suppliers/merge-specs.mjs cummins-china-investment` → 0 dòng model (tệp specs rỗng, đã xoá, không commit).
- `node suppliers/verify.mjs` → `435 bản ghi, 0 có lỗi`.
Số dòng bảng trước/sau: 0 → 0 (đo). Chỉ 1 bản ghi đổi so với origin/main.

## Bảng id → kết quả
| id | kết quả |
|---|---|
| cummins-china-investment | website https://www.cummins.com.cn/, 0 dòng |
| geshin-marathon | ứng viên shmgec.com (chỉ từ craft.co, không phải nguồn hãng); trang không truy cập được (UND_ERR_CONNECT_TIMEOUT; firecrawl cũng lỗi) → chưa xác minh, KHÔNG ghi |
| kubota-wuxi | kubota.com.cn chỉ liệt kê Kubota Engine (Shanghai); không có trang riêng của pháp nhân Wuxi |
| shanghai-mhi-engine | chỉ có trang con trên mhi.com (MHIET), không có website riêng |
| xcmg-doosan-engine | không thấy website riêng (chỉ tin liên doanh 2009–2010) |
| 34 id còn lại | không tìm được website chính thức (xem dưới) |

## Không tìm được website
Lý do chung: WebSearch (tiếng Anh + tiếng Trung + tên + tỉnh) chỉ ra trang B2B (alibaba, made-in-china), danh bạ hoặc không ra gì.
derui-power, huatai-power-fujian, kema-zhejiang, pushi-power, yaohu-chongqing, zt-power, kubota-wuxi, shanghai-mhi-engine, xcmg-doosan-engine, yipu-power (chỉ có tin 36kr/pedaily, không có website), dingol, geshin-marathon (không truy cập được), nianfeng-fujian (chỉ có gian hàng alibaba), weike-wuxi, và 20 đại lý: cummins-dealer-chengdu-huida…, -chenxun-power-technology, -chongqing-kangfa…, -fujian-innovation-kinetic…, -guangzhou-city-chongkang…, -guizhou-kangcheng…, -hefei-dongneng…, -kangji-power-xiamen…, -nanjing-kanghao…, -new-chongkang…, -shandong-mingyang…, -tibet-kangchai…, -wuhan-suofuna…, -xiamen-city-mingdong…, -yongyou-generator, -zhengzhou-yukang…, gensets-fuzhou, jinghai-qixiang-hainan, kelaisi-chongqing, neway-anhui, rixin-ningbo, xuchao-shaanxi, zhongchuang-guizhou.

(Tổng danh sách 37 id này = toàn bộ Nhóm A trừ cummins-china-investment; tên đầy đủ các đại lý cummins-dealer-* lấy từ bảng Nhóm A.)

## Có website, 0 dòng
- cummins-china-investment (cummins.com.cn: trang giới thiệu tập đoàn, không có bảng thông số tổ máy; điều phối chạy Tìm Thông Số rồi mới đánh dấu).

## Mẫu đối chiếu website (chỉ 1)
- cummins-china-investment: https://www.cummins.com.cn/ — "© 1990-2025康明斯（中国）投资有限公司 公司京ICP备06027042号" (chân trang, nguồn 7.md).

## Rủi ro / quay lui
Rủi ro thấp: thay đổi 1 bản ghi. Quay lui: revert PR.
Lưu ý: công cụ tìm kiếm có sẵn kém với công ty nhỏ tiếng Trung; 37 id "không tìm được" là kết quả của công cụ, không chứng minh công ty không có website. Dùng Baidu/Qichacha/Tianyancha (không có trong session này) có thể ra thêm.

## Chưa kiểm được
- shmgec.com (geshin-marathon) có thể là website thật nhưng không truy cập được từ máy này lẫn firecrawl; thử lại sau hoặc bằng trình duyệt.

## Cần ghi nhớ
Điều phối đánh dấu 37 id vào `spec-none.json` một lần (nếu chấp nhận), trừ geshin-marathon nên thử lại shmgec.com.
