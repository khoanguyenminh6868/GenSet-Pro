// Saves Perkins distributor-locator results for one search as text, like fetch-source.mjs: node suppliers/perkins-locator.mjs <outFile> "<city>, China"
// The locator only answers a POST (with its session token) and lists the 9 nearest distributors; search city by city.
import fs from "node:fs";
import { htmlToText } from "./crawl-specs.mjs";
const [out, terms] = process.argv.slice(2), U = "https://distributorlocator.perkins.com/", UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0";
const r1 = await fetch(U, { headers: { "User-Agent": UA } });
const cookie = (r1.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
const html1 = await r1.text(), token = (html1.match(/name="_token" value="([^"]+)"/) || [])[1];
const r2 = await fetch(U, { method: "POST", headers: { "User-Agent": UA, Cookie: cookie, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ _token: token, terms, coordinates: "", send: "" }) });
const text = htmlToText(await r2.text());
fs.writeFileSync(out, `URL: ${U}\nAccessed: ${new Date().toISOString().slice(0, 10)}\nVia: POST search terms="${terms}"\n\n${text}\n`, "utf8");
console.log(out, (text.match(/Distributor|Dealer/g) || []).length, "mục");
