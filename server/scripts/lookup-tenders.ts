// Looks up specific notices by number (open or closed), e.g. to add tenders already bid on.
// Run: npm run lookup:tenders -- IB2600452648-00 IB2600452081-00 [--mode=browser]
// With no numbers, reads them from scripts/lookup.txt (one per line).
import { readFileSync } from 'node:fs';
import { normalizeTender, searchRaw, type FetchMode } from '../src/muasamcong.js';

const args = process.argv.slice(2);
const mode = (args.find((a) => a.startsWith('--mode='))?.slice(7) ?? 'auto') as FetchMode;
let codes = args.filter((a) => !a.startsWith('--'));
if (!codes.length) codes = readFileSync(new URL('./lookup.txt', import.meta.url), 'utf8').split(/\s+/).filter(Boolean);

const wanted = codes.map((c) => { const [notifyNo, version] = c.toUpperCase().split('-'); return { code: c, notifyNo, version }; });
const { via, pages } = await searchRaw(wanted.map((w) => w.notifyNo), 20, mode, false);
const found = wanted.map((w, i) => {
  const all = pages[i].map((r) => normalizeTender(r)).filter((t) => t && t.notifyNo === w.notifyNo);
  const exact = all.find((t) => !w.version || t!.notifyVersion === w.version);
  return { code: w.code, tender: exact ?? null, versionsSeen: all.map((t) => t!.notifyVersion) };
});
console.log('=====LOOKUP-JSON-BEGIN=====');
console.log(JSON.stringify({ fetchedAt: new Date().toISOString(), via, found }));
console.log('=====LOOKUP-JSON-END=====');
console.error(`Found ${found.filter((f) => f.tender).length}/${found.length} notices via ${via}`);
