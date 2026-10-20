// Temporary probe: which services the "Kết quả lựa chọn nhà thầu" tab calls, and whether they answer without a reCAPTCHA token.
import { PORTAL_ORIGIN } from '../src/muasamcong.js';
const UA = 'Mozilla/5.0 (GenBid Pro)';
async function req(u: string, init?: RequestInit) {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(u, { ...init, signal: AbortSignal.timeout(40_000) }); return { status: r.status, text: await r.text() }; }
    catch (e) { console.log('retry', (e as Error).message); await new Promise((r) => setTimeout(r, 3000)); }
  }
  return { status: 0, text: '' };
}
// IB2600354007 (lost, 3 bidders) and IB2600320499 (won).
const T = [
  { notifyNo: 'IB2600354007', id: '0e2930a0-29df-44e5-82e5-986ab8cd8e0f', inputResultId: '9e81f080-0f42-47c4-971c-e80f9c218d63', bidOpenId: '9cf28cdd-47d0-4fc6-b711-967efaf02b9d', planNo: 'PL2600203792', bidForm: 'CHCT' },
  { notifyNo: 'IB2600320499', id: 'dc22ceb2-2245-49d9-a13c-a10138291dbb', inputResultId: '01fe03e3-5fe0-40d8-8cbb-956a5c33eea4', bidOpenId: '4e1eb82a-22cd-4b30-b280-cd43a314a46b', planNo: 'PL2600141854', bidForm: 'CHCT' },
];
const P = 'egpportalcontractorselectionv2_WAR_egpportalcontractorselectionv2';
const t = T[0];
const url = `${PORTAL_ORIGIN}/web/guest/contractor-selection?p_p_id=${P}&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_${P}_render=detail-v2&type=es-notify-contractor&stepCode=notify-contractor-step-4-kqlcnt&id=${t.id}&notifyId=${t.id}&inputResultId=${t.inputResultId}&bidOpenId=${t.bidOpenId}&techReqId=undefined&bidPreNotifyResultId=undefined&bidPreOpenId=undefined&processApply=LDT&bidMode=1_MTHS&notifyNo=${t.notifyNo}&planNo=${t.planNo}&pno=undefined&step=kqlcnt&isInternet=1&caseKHKQ=undefined&bidForm=${t.bidForm}`;
const page = await req(url, { headers: { 'User-Agent': UA } });
const srcs = [...page.text.matchAll(/src="([^"]+\.js[^"]*)"/g)].map((m) => new URL(m[1].replace(/&amp;/g, '&'), PORTAL_ORIGIN).href).filter((u) => u.includes('contractor-selection'));
console.log('DETAIL', page.status, page.text.length, 'scripts', srcs.length);
const paths = new Set<string>();
const ctx: string[] = [];
for (const s of srcs) {
  const js = await req(s);
  for (const m of js.text.matchAll(/["'`]((?:\/o\/)?[\w-]*\/?services\/[\w\/-]+)["'`]/g)) paths.add(m[1]);
  for (const m of js.text.matchAll(/.{0,160}(?:kqlcnt|KQLCNT|inputResult|contractorList|lsContractor|bidderList).{0,160}/g)) if (ctx.length < 40) ctx.push(m[0].replace(/\s+/g, ' '));
}
console.log('PATHS\n' + [...paths].join('\n'));
console.log('CTX\n' + ctx.join('\n---\n'));
// Try the result-related services once each, without any token. Anything that wants a token is reported and left alone.
const cand = [...paths].filter((p) => /kqlcnt|result|ketqua|kq|contractor/i.test(p)).slice(0, 15);
for (const p of cand) {
  const u = new URL(p.startsWith('/o/') ? p : `/o/egp-portal-contractor-selection-v2/${p.replace(/^\//, '')}`, PORTAL_ORIGIN).href;
  for (const body of [{ id: t.inputResultId }, { id: t.id }, { notifyId: t.id, inputResultId: t.inputResultId }]) {
    const r = await req(u, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: PORTAL_ORIGIN, Referer: url, 'User-Agent': UA }, body: JSON.stringify(body) });
    console.log('TRY', p, JSON.stringify(body).slice(0, 60), r.status, r.text.slice(0, 600).replace(/\s+/g, ' '));
  }
}
