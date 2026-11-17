import fs from "node:fs";
const W = "C:/Projects/GenSet Pro/genbid-work", KR = W + "/dieu-phoi/kiem-rong/data";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const texts = new Map();
for (const f of fs.readdirSync(KR + "/hc")) texts.set(f.slice(0, -5), J(KR + "/hc/" + f).text);
for (const f of fs.readdirSync(KR).filter((f) => /^hsmt-IB/.test(f))) texts.set(f.slice(5, -5), J(KR + "/" + f).text);
for (const k of fs.readdirSync(W + "/specs")) { const p = `${W}/specs/${k}/text.txt`; if (!texts.has(k) && fs.existsSync(p)) texts.set(k, fs.readFileSync(p, "utf8")); }
const hits = [];
for (const [k, t] of texts) { const L = t.normalize("NFC").split("\n"); L.forEach((l, i) => { const c = (L[i - 1] || "") + " " + l + " " + (L[i + 1] || ""); if (/dung t[íi]ch[^\n]{0,25}(xi|xy|x)[\s-]?lanh|displacement|dung t[íi]ch\s+(đ[ộo]ng c[ơo]|buồng đốt)/i.test(l) && /(?:±|\+\s?\/\s?-|\+-|sai số|dung sai)\s*\d{1,2}[.,]?\d*\s*%/i.test(l + " " + (L[i + 1] || ""))) hits.push([k, i + 1, l.replace(/\s+/g, " ").slice(0, 140)]); }); }
console.log("texts", texts.size, "hits", hits.length, "gói", new Set(hits.map((h) => h[0])).size);
for (const h of hits.slice(0, 40)) console.log(h.join(" | "));
