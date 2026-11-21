// Writes the open generator tenders as JSON (for the GenBid Pro artifact feed).
// Run: npm run export:feed -- [output.json] [mode]
import { writeFileSync } from 'node:fs';
import { fetchOpenGeneratorTenders, type FetchMode } from '../src/muasamcong.js';

const [out, mode] = process.argv.slice(2) as [string | undefined, FetchMode | undefined];
const tenders = await fetchOpenGeneratorTenders({ mode: mode ?? 'auto' });
const json = JSON.stringify({ fetchedAt: new Date().toISOString(), source: 'muasamcong', tenders }, null, 1);
if (out) writeFileSync(out, json);
else console.log(json);
console.error(`Exported ${tenders.length} open generator tenders`);
