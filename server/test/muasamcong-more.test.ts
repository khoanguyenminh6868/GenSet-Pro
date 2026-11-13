// Phủ phần còn lại của server/src/muasamcong.ts — phần DUY NHẤT của server/ còn được dùng
// (scripts/lookup-tenders.ts chạy trong workflow tender-lookup.yml; export-feed / check-portal).
// Không gọi mạng: `fetch` được giả. Số mong đợi lấy từ quy tắc nghiệp vụ trong chú thích mã
// (cổng muasamcong giờ Việt Nam +07:00, chỉ gói còn mở, giữ bản thông báo mới nhất).
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  buildDetailUrl,
  CaptchaRequiredError,
  extractContent,
  fetchOpenGeneratorTenders,
  GENERATOR_KEYWORDS,
  isGeneratorTender,
  normalizeTender,
  PORTAL_ORIGIN,
  searchBody,
  searchRaw,
  stripAccents,
} from '../src/muasamcong.js';

const now = new Date('2026-10-20T00:00:00Z');
const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function fakeFetch(handler: (url: string, init: RequestInit) => unknown, status = 200) {
  const calls: { url: string; body: any }[] = [];
  globalThis.fetch = (async (url: string | URL, init: RequestInit = {}) => {
    calls.push({ url: String(url), body: init.body ? JSON.parse(String(init.body)) : undefined });
    const out = handler(String(url), init);
    return { ok: status >= 200 && status < 300, status, json: async () => out } as Response;
  }) as typeof fetch;
  return calls;
}

// ---------- stripAccents / isGeneratorTender ----------

test('bỏ dấu tiếng Việt: đ/Đ thành d, chữ hoa thành thường', () => {
  assert.equal(stripAccents('MÁY PHÁT ĐIỆN Đà Nẵng'), 'may phat dien da nang');
});

test('gói tên "Tổ máy phát điện" / "Genset" / "Generator" giữ lại; thiết bị khác bị loại', () => {
  assert.ok(isGeneratorTender('Gói thầu số 3: Tổ máy phát điện diesel 1000kVA'));
  assert.ok(isGeneratorTender('Cung cấp Generator 250kVA'));
  assert.equal(isGeneratorTender('Phát điện mặt trời áp mái'), false); // điện mặt trời / gió không phải tổ máy
  assert.equal(isGeneratorTender('Cung cấp máy phát điện gió 5kW'), false);
  assert.equal(isGeneratorTender('Bảo dưỡng tua-bin gió'), false);
  assert.ok(isGeneratorTender('Hệ thống điện mặt trời và máy phát điện diesel dự phòng 250kVA')); // có diesel / dự phòng / kVA thì giữ
  assert.ok(isGeneratorTender('Cung cấp MPĐ 100kVA'));
  assert.ok(isGeneratorTender('Mua sắm MPĐ dự phòng cho trạm BTS'));
  assert.equal(isGeneratorTender('Mua sắm xe ô tô 7 chỗ'), false);
  assert.equal(isGeneratorTender(''), false);
});

// ---------- buildDetailUrl ----------

test('link chi tiết có đủ mã thông báo, id; trường thiếu ghi "undefined" như cổng yêu cầu', () => {
  const u = new URL(buildDetailUrl({ id: 'ID1', notifyNo: 'IB2600012345' }));
  assert.equal(u.origin, PORTAL_ORIGIN);
  assert.equal(u.pathname, '/web/guest/contractor-selection');
  assert.equal(u.searchParams.get('id'), 'ID1');
  assert.equal(u.searchParams.get('notifyId'), 'ID1');
  assert.equal(u.searchParams.get('notifyNo'), 'IB2600012345');
  assert.equal(u.searchParams.get('planNo'), 'undefined');
  assert.equal(u.searchParams.get('isInternet'), 'undefined');
  assert.equal(u.searchParams.get('type'), 'es-notify-contractor');
  assert.equal(u.searchParams.has('bidForm'), false);
});

test('link chi tiết: isInternet true → 1, false → 0; bidFormCode thêm tham số bidForm', () => {
  const base = { id: 'a', notifyNo: 'n' };
  assert.equal(new URL(buildDetailUrl({ ...base, isInternet: true })).searchParams.get('isInternet'), '1');
  assert.equal(new URL(buildDetailUrl({ ...base, isInternet: false })).searchParams.get('isInternet'), '0');
  assert.equal(new URL(buildDetailUrl({ ...base, bidFormCode: 'DTRR' })).searchParams.get('bidForm'), 'DTRR');
});

// ---------- normalizeTender: dữ liệu bẩn ----------

test('chuẩn hoá: dùng tên trường dự phòng (notifyId, notifyNoStand, packageName, closeDate, estimatePrice)', () => {
  const t = normalizeTender(
    { notifyId: 'N9', notifyNoStand: 'IB9', packageName: 'Máy phát điện', closeDate: '2026-11-01T10:00:00', estimatePrice: '2500000000 đ' },
    now,
  );
  assert.ok(t);
  assert.equal(t.id, 'N9');
  assert.equal(t.notifyNo, 'IB9');
  assert.equal(t.estimatedPrice, 2_500_000_000); // chữ "đ" bị bỏ
  assert.equal(t.status, 'open');
});

// asNumber: chuỗi có dấu chấm ngăn nghìn kiểu Việt phải đọc được (đã sửa).
test('giá dạng chuỗi có dấu chấm ngăn nghìn "2.500.000.000 đ" đọc được 2,5 tỷ', () => {
  const t = normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', estimatePrice: '2.500.000.000 đ' }, now);
  assert.equal(t?.estimatedPrice, 2_500_000_000);
});

test('giờ cổng không kèm múi giờ hiểu là +07:00; có Z hoặc +hh:mm thì giữ nguyên', () => {
  const mk = (d: unknown) => normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', bidCloseDate: d }, now)?.bidCloseDate;
  assert.equal(mk('2026-10-30T09:00:00'), '2026-10-30T02:00:00.000Z');
  assert.equal(mk('2026-10-30T09:00:00Z'), '2026-10-30T09:00:00.000Z');
  assert.equal(mk('2026-10-30T09:00:00+07:00'), '2026-10-30T02:00:00.000Z');
});

test('giờ dạng mili-giây (số hoặc chuỗi số dài) đọc đúng; chuỗi rác → không có ngày', () => {
  const ms = Date.UTC(2026, 9, 30, 2, 0, 0);
  const mk = (d: unknown) => normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', bidCloseDate: d }, now)?.bidCloseDate;
  assert.equal(mk(ms), '2026-10-30T02:00:00.000Z');
  assert.equal(mk(String(ms)), '2026-10-30T02:00:00.000Z');
  assert.equal(mk('không phải ngày'), undefined);
});

test('ranh giới đóng thầu: đúng bằng "bây giờ" là đã đóng; hơn 1 giây là còn mở', () => {
  const mk = (iso: string) => normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', bidCloseDate: iso }, now)?.status;
  assert.equal(mk('2026-10-20T00:00:00Z'), 'closed');
  assert.equal(mk('2026-10-20T00:00:01Z'), 'open');
});

test('không có ngày đóng thầu → coi là đã đóng (không hiện trong danh sách gói còn mở)', () => {
  assert.equal(normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g' }, now)?.status, 'closed');
});

test('địa điểm: nhiều nơi nối bằng ", ", bỏ phần tử rỗng; rơi về provName khi không có mảng', () => {
  const mk = (extra: object) => normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', ...extra }, now)?.location;
  assert.equal(mk({ locations: [{ provName: 'Hà Nội' }, { districtName: 'Quận 1' }, null, {}] }), 'Hà Nội, Quận 1');
  assert.equal(mk({ locations: ['Cần Thơ'] }), 'Cần Thơ');
  assert.equal(mk({ locations: [] }), undefined);
  assert.equal(mk({ provName: 'Huế' }), 'Huế');
});

test('isInternet: 1, "1", true → true; 0, "0", false → false; vắng → undefined', () => {
  const mk = (extra: object) => normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', ...extra }, now)?.isInternet;
  assert.equal(mk({ isInternet: 1 }), true);
  assert.equal(mk({ isInternet: '1' }), true);
  assert.equal(mk({ isInternet: true }), true);
  assert.equal(mk({ isInternet: 0 }), false);
  assert.equal(mk({ isInternet: '0' }), false);
  assert.equal(mk({ isInternet: false }), false);
  assert.equal(mk({}), undefined);
});

test('số tiền: bảo đảm dự thầu đọc từ guaranteeValue/bidGuarantee; giá không phải số → undefined', () => {
  const mk = (extra: object) => normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', ...extra }, now);
  assert.equal(mk({ guaranteeValue: 45000000 })?.bidSecurity, 45_000_000);
  assert.equal(mk({ bidGuarantee: '45000000' })?.bidSecurity, 45_000_000);
});

test('số thập phân thật giữ đúng', () => {
  const p = (v: unknown) => normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', bidPrice: v }, now)?.estimatedPrice;
  assert.equal(p('1250.5'), 1250.5);
  assert.equal(p(1250.5), 1250.5);
  assert.equal(p('1.250,5'), 1250.5);
  assert.equal(p('1,250,000'), 1250000);
});

test('giá là chữ không có số ("Không công bố") phải là "không có giá", không phải 0 đồng', () => {
  assert.equal(normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', bidPrice: 'Không công bố' }, now)?.estimatedPrice, undefined);
});

test('bảo đảm dự thầu dạng chuỗi "45.000.000" đọc được 45 triệu', () => {
  assert.equal(normalizeTender({ id: 'x', notifyNo: 'n', bidName: 'g', bidGuarantee: '45.000.000' }, now)?.bidSecurity, 45_000_000);
});

test('chuẩn hoá: sourceUrl là link chi tiết của đúng thông báo', () => {
  const t = normalizeTender({ id: 'ID7', notifyNo: 'IB7', planNo: 'PL7', bidName: 'g', bidForm: 'DTRR' }, now);
  const u = new URL(t!.sourceUrl);
  assert.equal(u.searchParams.get('notifyNo'), 'IB7');
  assert.equal(u.searchParams.get('planNo'), 'PL7');
  assert.equal(u.searchParams.get('bidForm'), 'DTRR');
});

// ---------- searchBody / extractContent ----------

test('truy vấn xem cả gói đã đóng (openOnly=false): không có bộ lọc bidCloseDate', () => {
  const [body] = searchBody('IB2600452648', 20, now, false);
  const filters = body.query[0].filters;
  assert.equal(filters.some((f) => f.fieldName === 'bidCloseDate'), false);
  assert.equal(body.pageSize, 20);
  assert.equal(body.query[0].keyWord, 'IB2600452648');
});

test('truy vấn luôn loại thông báo KHKQ (caseKHKQ = 1)', () => {
  const [body] = searchBody('x', 5, now);
  assert.deepEqual(body.query[0].filters.find((f) => f.fieldName === 'caseKHKQ'), {
    fieldName: 'caseKHKQ',
    searchType: 'not_in',
    fieldValues: ['1'],
  });
});

test('đọc danh sách từ các dạng trả lời của cổng: {page.content}, [{page.content}], {content}, {data}', () => {
  const rec = [{ id: 'a' }];
  assert.deepEqual(extractContent({ page: { content: rec } }), rec);
  assert.deepEqual(extractContent([{ page: { content: rec } }]), rec);
  assert.deepEqual(extractContent({ content: rec }), rec);
  assert.deepEqual(extractContent({ data: rec }), rec);
});

test('trả lời lạ (null, số, không phải mảng) → danh sách rỗng, không ném lỗi', () => {
  assert.deepEqual(extractContent(null), []);
  assert.deepEqual(extractContent(42), []);
  assert.deepEqual(extractContent({ page: { content: 'x' } }), []);
});

// ---------- searchRaw / fetchOpenGeneratorTenders với fetch giả ----------

test('searchRaw direct: mỗi từ khoá một lượt POST, đúng URL và thân truy vấn', async () => {
  const calls = fakeFetch(() => ({ page: { content: [{ id: 'a' }] } }));
  const r = await searchRaw(['máy phát điện', 'genset'], 30, 'direct');
  assert.equal(r.via, 'direct');
  assert.equal(r.pages.length, 2);
  assert.equal(calls.length, 2);
  assert.ok(calls[0].url.startsWith(`${PORTAL_ORIGIN}/o/egp-portal-contractor-selection-v2/services/smart/search`));
  assert.equal(calls[0].body[0].query[0].keyWord, 'máy phát điện');
  assert.equal(calls[1].body[0].query[0].keyWord, 'genset');
  assert.equal(calls[0].body[0].pageSize, 30);
});

test('cổng đòi reCAPTCHA (trả về một con số) → CaptchaRequiredError, chế độ direct không thử trình duyệt', async () => {
  fakeFetch(() => 401);
  await assert.rejects(searchRaw(['x'], 10, 'direct'), (e: unknown) => e instanceof CaptchaRequiredError && /401/.test((e as Error).message));
});

test('cổng trả HTTP 503 → lỗi nêu mã HTTP', async () => {
  fakeFetch(() => ({}), 503);
  await assert.rejects(searchRaw(['x'], 10, 'direct'), /HTTP 503/);
});

test('lấy gói còn mở: loại gói đã đóng và gói không phải máy phát, gộp trùng giữ bản mới nhất, mới đăng xếp trước', async () => {
  const future = new Date(Date.now() + 5 * 86400_000).toISOString();
  const past = new Date(Date.now() - 5 * 86400_000).toISOString();
  const rec = (id: string, notifyNo: string, ver: string, name: string, pub: string, close = future) => ({
    id, notifyNo, notifyVersion: ver, bidName: name, publicDate: pub, bidCloseDate: close,
  });
  fakeFetch((_u, init) => {
    const kw = JSON.parse(String(init.body))[0].query[0].keyWord;
    const page =
      kw === 'a'
        ? [
            rec('1', 'IB1', '00', 'Máy phát điện 250kVA', '2026-10-01T08:00:00'),
            rec('2', 'IB2', '00', 'Mua máy tính', '2026-10-05T08:00:00'), // không phải máy phát
            rec('3', 'IB3', '00', 'Máy phát điện cũ', '2026-10-06T08:00:00', past), // đã đóng
          ]
        : [
            rec('1b', 'IB1', '01', 'Máy phát điện 250kVA (sửa đổi)', '2026-10-01T08:00:00'), // bản mới hơn của IB1
            rec('4', 'IB4', '00', 'Tổ máy phát điện 500kVA', '2026-10-10T08:00:00'),
          ];
    return { page: { content: page } };
  });
  const out = await fetchOpenGeneratorTenders({ keywords: ['a', 'b'], mode: 'direct' });
  assert.deepEqual(out.map((t) => t.notifyNo), ['IB4', 'IB1']); // IB4 đăng muộn hơn nên đứng trước
  assert.equal(out[1].notifyVersion, '01');
  assert.equal(out[1].id, '1b');
});

test('không truyền từ khoá → dùng bộ GENERATOR_KEYWORDS mặc định, pageSize 50', async () => {
  const calls = fakeFetch(() => ({ page: { content: [] } }));
  const out = await fetchOpenGeneratorTenders({ mode: 'direct' });
  assert.deepEqual(out, []);
  assert.deepEqual(calls.map((c) => c.body[0].query[0].keyWord), GENERATOR_KEYWORDS);
  assert.equal(calls[0].body[0].pageSize, 50);
});
