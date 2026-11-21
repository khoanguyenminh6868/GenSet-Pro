import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isGeneratorTender, normalizeTender, searchBody } from '../src/muasamcong.js';

const now = new Date('2026-10-20T00:00:00Z');

test('keeps generator tenders regardless of accents and case', () => {
  assert.ok(isGeneratorTender('Mua sắm MÁY PHÁT ĐIỆN dự phòng 500kVA'));
  assert.ok(isGeneratorTender('Cung cap to may phat dien diesel'));
  assert.ok(isGeneratorTender('Supply of standby GENSET'));
  assert.equal(isGeneratorTender('Mua sắm máy tính văn phòng'), false);
});

test('normalizes a portal record and marks it open when closing time is in the future', () => {
  const t = normalizeTender(
    {
      id: 'abc-123',
      notifyNo: 'IB2600012345',
      notifyVersion: '00',
      planNo: 'PL2600000001',
      bidName: ['Mua sắm máy phát điện 250kVA'],
      investorName: 'Sở Y tế',
      bidCloseDate: '2026-10-30T09:00:00',
      publicDate: '2026-10-18T08:00:00',
      isInternet: 1,
      locations: [{ provName: 'Hà Nội' }],
      bidPrice: '1500000000',
    },
    now,
  );
  assert.ok(t);
  assert.equal(t.status, 'open');
  assert.equal(t.bidName, 'Mua sắm máy phát điện 250kVA');
  assert.equal(t.bidCloseDate, '2026-10-30T02:00:00.000Z');
  assert.equal(t.location, 'Hà Nội');
  assert.equal(t.estimatedPrice, 1_500_000_000);
  assert.ok(t.sourceUrl.includes('notifyNo=IB2600012345'));
});

test('marks a tender closed once its closing time has passed', () => {
  const t = normalizeTender({ id: 'x', notifyNo: 'IB1', bidName: 'Máy phát điện', bidCloseDate: '2026-10-01T09:00:00' }, now);
  assert.equal(t?.status, 'closed');
});

test('drops records without an id, notice number or name', () => {
  assert.equal(normalizeTender({ notifyNo: 'IB1', bidName: 'x' }, now), null);
});

test('search body asks the portal for open notices only, in Vietnam time', () => {
  const [body] = searchBody('máy phát điện', 50, new Date('2026-10-20T00:00:00Z'));
  const filters = body.query[0].filters;
  assert.deepEqual(filters.find((f) => f.fieldName === 'bidCloseDate'), {
    fieldName: 'bidCloseDate',
    searchType: 'range',
    from: '2026-10-20T07:00:00.000Z',
    to: null,
  });
  assert.ok(filters.some((f) => f.fieldName === 'type' && f.fieldValues?.includes('es-notify-contractor')));
});

test('collapses line breaks in bid names and reads array prices like the live portal returns', () => {
  const t = normalizeTender(
    { id: 'x', notifyNo: 'IB1', bidName: ['Gói thầu số 09: Thi công \nxây dựng \n(bao gồm máy \nphát điện)'], bidPrice: [1429341078], bidCloseDate: '2026-10-30T09:00:00' },
    now,
  );
  assert.equal(t?.bidName, 'Gói thầu số 09: Thi công xây dựng (bao gồm máy phát điện)');
  assert.equal(t?.estimatedPrice, 1429341078);
});
