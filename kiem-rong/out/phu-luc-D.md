# Phụ lục D: vi phạm 'trần 10 / hãng' và giới hạn mỗi động cơ / NCC (mục 2)

Mọi vi phạm đều giải thích được bằng chỗ mã cố ý bỏ qua trần: dòng giữ chỗ cho hãng tổ máy khi HSMT đòi đồng bộ (`sync`, `exempt`, tối đa SYNC_ROWS = 6), dòng của cấu hình lượt trước (`keep`), hoặc bước lấp đầy `free` khi hết hãng khác (otherLeft = 0).

| gói | cỡ | hãng | số dòng | topN | còn dòng hãng khác hợp lệ chưa chọn | sync | keep | giải thích |
|---|---|---|---|---|---|---|---|---|
| IB2600574589 | 400 kVA | Yuchai | 11 | 30 | 1038 |  | có | keep |
| IB2500152724 | 5 kW | ? | 13 | 29 | 0 |  |  | lấp đầy free (hết hãng khác) |
| IB2500597081 | 300 kVA | Cummins | 12 | 30 | 878 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2300135189 | 30 kVA | Cummins | 11 | 30 | 347 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2300343668 | 750 kVA | Cummins | 11 | 30 | 385 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2500327119 | 320 kVA | Cummins | 12 | 30 | 991 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2300371415 | 5 kW | ? | 13 | 29 | 0 |  |  | lấp đầy free (hết hãng khác) |
| IB2500189935 | 8.5 kVA | Yanmar | 11 | 30 | 0 |  |  | lấp đầy free (hết hãng khác) |
| IB2300146335 | 300 kVA | Cummins | 12 | 30 | 909 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2600490077 | 165 kVA | Perkins | 15 | 30 | 74 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2600581977 | 250 kVA | Cummins | 13 | 30 | 250 | có | có | sync: n−10 ≤ 6 dòng miễn trần |
| IB2600594596 | 300 kVA | Cummins | 11 | 30 | 894 | có | có | sync: n−10 ≤ 6 dòng miễn trần |
| IB2300111427 | 5 kW | ? | 13 | 30 | 0 |  |  | lấp đầy free (hết hãng khác) |
| IB2500287209 | 10 kVA | Perkins | 12 | 30 | 11 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2500287209 | 10 kVA | Yanmar | 11 | 30 | 11 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2600586587 | 160 kVA | Yuchai | 12 | 30 | 451 |  | có | keep |
| IB2600448676 | 300 kVA | Cummins | 12 | 30 | 439 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2300307974 | 120 kVA | Cummins | 11 | 30 | 247 | có |  | sync: n−10 ≤ 6 dòng miễn trần |
| IB2200049662 | 500 kVA | Cummins | 12 | 30 | 296 | có |  | sync: n−10 ≤ 6 dòng miễn trần |

Chưa giải thích: 0.

| gói | cỡ | loại | chi tiết |
|---|---|---|---|
| IB2600574589 | 400 kVA | perEngine | {"t":"perEngine","engine":"YC6K520D30","n":4,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600574589 | 400 kVA | perSupplier | {"t":"perSupplier","sup":"jet-power","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600574589 | 400 kVA | perSupplier | {"t":"perSupplier","sup":"eastern-lion-fuan","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600581294 | 500 kVA | perEngine | {"t":"perEngine","engine":"YC6T660D31","n":4,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600581294 | 500 kVA | perEngine | {"t":"perEngine","engine":"WP13D490E310","n":4,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600581294 | 500 kVA | perEngine | {"t":"perEngine","engine":"YC6T660LD20","n":4,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600581294 | 500 kVA | perSupplier | {"t":"perSupplier","sup":"jet-power","n":6,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600592684 | 500 kVA | perEngine | {"t":"perEngine","engine":"QSZ13G3","n":11,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600592684 | 500 kVA | perEngine | {"t":"perEngine","engine":"KTA19G3A","n":4,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600592684 | 500 kVA | perEngine | {"t":"perEngine","engine":"KTAA19G5","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600594596 | 300 kVA | perEngine | {"t":"perEngine","engine":"YC6MK420LD20","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600594596 | 300 kVA | perSupplier | {"t":"perSupplier","sup":"fdk-energy","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600602880 | 150 kVA | perEngine | {"t":"perEngine","engine":"6BTAA59G12","n":9,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600586587 | 160 kVA | perEngine | {"t":"perEngine","engine":"1106A70TAG3","n":4,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600586587 | 160 kVA | perEngine | {"t":"perEngine","engine":"YC6A245LD21","n":4,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600586587 | 160 kVA | perEngine | {"t":"perEngine","engine":"YC6A245D30","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600586587 | 160 kVA | perEngine | {"t":"perEngine","engine":"6CTA83G2","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600586587 | 160 kVA | perSupplier | {"t":"perSupplier","sup":"uleengen","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600586587 | 160 kVA | perSupplier | {"t":"perSupplier","sup":"eastern-lion-fuan","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600586587 | 160 kVA | perSupplier | {"t":"perSupplier","sup":"fdk-energy","n":5,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600603983 | 700 kVA | perEngine | {"t":"perEngine","engine":"400623TAG2A","n":4,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |
| IB2600603983 | 700 kVA | perEngine | {"t":"perEngine","engine":"400623TAG3A","n":4,"keepRun":true} (chỉ ở 12 gói có `keep` từ configmatch) |