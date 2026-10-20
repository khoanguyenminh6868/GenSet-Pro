// Live check against muasamcong.mof.gov.vn: prints what the portal returns
// and how many open generator tenders the app would show. Run: npm run check:portal
import { GENERATOR_KEYWORDS, normalizeTender, searchRaw, type FetchMode } from '../src/muasamcong.js';

const mode = (process.argv[2] as FetchMode | undefined) ?? 'auto';
const { via, pages } = await searchRaw(GENERATOR_KEYWORDS, 50, mode);
console.log(`Fetched via: ${via}`);

let total = 0;
pages.forEach((records, i) => {
  console.log(`\nKeyword "${GENERATOR_KEYWORDS[i]}": ${records.length} raw records`);
  if (i === 0 && records[0]) {
    console.log('Fields on first record:', Object.keys(records[0]).sort().join(', '));
    const r = records[0];
    console.log('Sample:', JSON.stringify({ bidName: r.bidName, bidCloseDate: r.bidCloseDate, publicDate: r.publicDate, investorName: r.investorName, locations: r.locations, bidPrice: r.bidPrice }));
  }
  for (const raw of records.slice(0, 5)) {
    const t = normalizeTender(raw);
    if (t) console.log(` - ${t.notifyNo} [${t.status}] closes ${t.bidCloseDate} | ${t.bidName.slice(0, 90)}`);
  }
  total += records.length;
});

if (total === 0) {
  console.error('\nNo records returned: the request shape or the portal has changed.');
  process.exit(1);
}
