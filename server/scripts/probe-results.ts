// Temporary probe: the record ids muasamcong's bid-opening tab (Biên bản mở thầu) needs in its link.
import { PORTAL_ORIGIN } from '../src/muasamcong.js';
const SEARCH = `${PORTAL_ORIGIN}/o/egp-portal-contractor-selection-v2/services/smart/search?token=`;
const H = { 'Content-Type': 'application/json', Accept: 'application/json, text/plain, */*', Origin: PORTAL_ORIGIN, Referer: `${PORTAL_ORIGIN}/web/guest/contractor-selection?render=index`, 'User-Agent': 'Mozilla/5.0 (GenBid Pro)' };
const CODES = 'IB2600320499 IB2600354007 IB2600419125 IB2600452081 IB2600452452 IB2600452648 IB2600480017 IB2600483082 IB2600512067 IB2600513216 IB2600545434 IB2600547578 IB2600549116 IB2600552343 IB2600553280 IB2600554211 IB2600554711 IB2600554767 IB2600557434 IB2600561006 IB2600561204 IB2600562009 IB2600565238 IB2600570050 IB2600570346 IB2600572156 IB2600572967 IB2600573066 IB2600573539 IB2600573599 IB2600574589 IB2600574692 IB2600575567 IB2600576085 IB2600576680 IB2600577384 IB2600581294 IB2600581344 IB2600582722 '.trim().split(/\s+/);
async function req(u: string, init?: RequestInit) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(u, { ...init, signal: AbortSignal.timeout(40_000) }); return { status: r.status, text: await r.text() }; }
    catch (e) { console.log('retry', (e as Error).message); await new Promise((r) => setTimeout(r, 4000)); }
  }
  return { status: 0, text: '' };
}
const content = (j: any) => j?.page?.content ?? (Array.isArray(j) ? j[0]?.page?.content : undefined) ?? [];
const KEEP = ['notifyNo', 'notifyVersion', 'stepCode', 'id', 'notifyId', 'inputResultId', 'bidOpenId', 'techReqId', 'bidPreNotifyResultId', 'bidPreOpenId', 'processApply', 'bidMode', 'planNo', 'pno', 'bidForm', 'isInternet', 'caseKHKQ', 'numBidderJoin', 'bidRealityOpenDate', 'status', 'statusForNotify'];
const out: any[] = [];
for (const no of CODES) {
  const r = await req(SEARCH, { method: 'POST', headers: H, body: JSON.stringify([{ pageSize: 20, pageNumber: 0, query: [{ index: 'es-contractor-selection', keyWord: no, matchType: 'all-1', matchFields: ['notifyNo'], filters: [{ fieldName: 'type', searchType: 'in', fieldValues: ['es-notify-contractor'] }] }] }]) });
  let j: any; try { j = JSON.parse(r.text); } catch { console.log('BAD', no, r.status, r.text.slice(0, 200)); continue; }
  const recs = content(j).filter((x: any) => x.notifyNo === no);
  if (recs[0]) console.log('KEYS', no, Object.keys(recs[0]).filter((k) => /id$|Id$|step|open/i.test(k)).join(','));
  for (const x of recs) { const row = Object.fromEntries(KEEP.map((k) => [k, x[k]])); out.push(row); console.log('REC', JSON.stringify(row)); }
}
console.log('=====JSON-BEGIN=====');
console.log(JSON.stringify(out));
console.log('=====JSON-END=====');
