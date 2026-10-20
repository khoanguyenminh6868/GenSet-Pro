import type { Tender } from './muasamcong.js';

// Clearly labelled sample data for trying the app offline or when the portal
// is unreachable. These are NOT real notices; every record carries isSample.
export function sampleTenders(now = new Date()): Tender[] {
  const day = 24 * 3600 * 1000;
  const iso = (offsetDays: number) => new Date(now.getTime() + offsetDays * day).toISOString();
  const base = {
    status: 'open' as const,
    isSample: true,
    sourceUrl: 'https://muasamcong.mof.gov.vn/web/guest/contractor-selection?render=index',
  };
  return [
    {
      ...base,
      id: 'sample-1',
      notifyNo: 'MAU-0001',
      bidName: '[DỮ LIỆU MẪU] Mua sắm, lắp đặt máy phát điện dự phòng 500kVA cho Bệnh viện Đa khoa tỉnh',
      investorName: 'Bệnh viện Đa khoa tỉnh (mẫu)',
      procuringEntityName: 'Bệnh viện Đa khoa tỉnh (mẫu)',
      location: 'Bình Dương',
      field: 'Hàng hóa',
      bidForm: 'Đấu thầu rộng rãi',
      bidMode: '1_MTHS',
      isInternet: true,
      publicDate: iso(-3),
      bidCloseDate: iso(9),
      estimatedPrice: 3_850_000_000,
      bidSecurity: 45_000_000,
    },
    {
      ...base,
      id: 'sample-2',
      notifyNo: 'MAU-0002',
      bidName: '[DỮ LIỆU MẪU] Cung cấp tổ máy phát điện diesel 1000kVA cho Trạm bơm tiêu',
      investorName: 'Công ty TNHH MTV Khai thác Thủy lợi (mẫu)',
      location: 'Hà Nội',
      field: 'Hàng hóa',
      bidForm: 'Đấu thầu rộng rãi',
      bidMode: '1_HTS',
      isInternet: true,
      publicDate: iso(-1),
      bidCloseDate: iso(14),
      estimatedPrice: 6_200_000_000,
      bidSecurity: 90_000_000,
    },
    {
      ...base,
      id: 'sample-3',
      notifyNo: 'MAU-0003',
      bidName: '[DỮ LIỆU MẪU] Bảo dưỡng, sửa chữa máy phát điện các trạm BTS năm 2027',
      investorName: 'Viễn thông tỉnh (mẫu)',
      location: 'Đà Nẵng',
      field: 'Phi tư vấn',
      bidForm: 'Chào hàng cạnh tranh',
      bidMode: '1_MTHS',
      isInternet: true,
      publicDate: iso(-5),
      bidCloseDate: iso(3),
      estimatedPrice: 980_000_000,
    },
  ];
}
