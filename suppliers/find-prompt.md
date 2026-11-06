# Tìm NCC: tìm thêm nhà cung cấp phù hợp yêu cầu kỹ thuật của một gói thầu

You work in a folder prepared by `config-bot.mjs` for the "Tìm NCC" button of the Cấu hình gợi ý tab. Write only
`newCatalog.json` and `find.json` in this folder (and the pages saved by the save command), nothing else.
Answer in Vietnamese. Khoa's rule (2026-10-28): never invent anything about a supplier. Every fact comes word for
word from a web page you saved with the save command; the code checks it with verify.mjs and drops what it cannot
find. You run unattended: nobody answers questions.

## Goal
Find on the internet up to 3 suppliers (genset makers first, then engine or alternator makers) that sell a product
meeting the tender's main requirements: power (prime / standby as the HSMT says), frequency, voltage, any make or
origin the HSMT names, and the controller it asks for (make, model or functions; Khoa, 2026-11-01): prefer a supplier
whose own pages name that controller. Follow the "Xuất xứ động cơ" section of input.md. When input.md has a "Yêu cầu
khác" section (typed on the web, Khoa 2026-11-01), the supplier's saved pages must also meet each of those requirements
(a make or model it names must be on the supplier's own pages); skip a supplier that does not, with the reason in
`skipped`, and say in `summary` which of them each supplier meets. Prefer companies NOT in catalog.md; a
supplier already in the system counts only when you add a product line or spec table at the required power that it
does not have yet (use its id from catalog.md then).

When input.md has a section "Tìm nhà cung cấp cho MỘT cấu hình đã gợi ý" (the button of one configuration with no
supplier, Khoa 2026-11-06), the goal is only that: suppliers whose own pages offer a genset with that engine model at
the tender's power (best with the same alternator and controller), at the size it names. Search for the engine model
with "genset" / "generator" and the power, its maker's genset range, and Chinese assemblers' datasheets. Say in
`summary` which parts of the configuration each supplier offers.

## Files
- `input.md`: the tender, the power read from it, the commands, the watchlist, and the technical part of the HSMT.
- `catalog.md`: the engines, alternators and suppliers already in the system (do not suggest them again unless you
  add the missing power, see above).
- Do not read the repo's source code and do not write your own checker.

## Steps
1. Read input.md and the first lines of catalog.md. Note the power, frequency, voltage and any named make.
2. Search the internet (web search). Search the watchlist companies of input.md by their own name first, then
   searches such as "<power> kVA diesel generator set manufacturer China datasheet". Before you work on a company,
   run the "kiểm tra đã có" command of input.md with its name or website: it says if it is already in the system,
   a dealer site or a B2B platform.
3. Official pages first: the maker's own website or datasheet (PDF) that lists a genset (or engine, alternator) at
   the required power, best a table with model, power, engine and alternator. B2B platforms (made-in-china.com,
   alibaba.com...) are tier C only, never the website. Never use wikipedia, baike, zhihu, social media or company
   registries as a source.
4. Save every page you rely on with the save command of input.md; it prints the saved file (web/1.txt, web/2.txt...).
   Then read that file and copy quotes from it. Never use a page you did not save.
5. Write `newCatalog.json`: a list of supplier records in the shape of suppliers/schema.json, from the saved pages only:
   - `id` (a-z 0-9 -, the company's short name; the id of catalog.md for a supplier already in the system, then give
     only the new `sources`, `productLines`, `specTables`), `country` (2 letters), `role` (genset_oem,
     engine_maker, alternator_maker, distributor), `names` ({ "en": "", "zh": "" }), `website`, `status` (`partial`),
     `confidence` (`low` when every source is tier C, else `medium`), `missing` (what the pages do not say).
   - `sources`: `{ "n": 1, "file": "web/1.txt", "tier": "A|B|C", "quote": ["exact words from that page, 8+ characters"] }`
     (A: the maker's own site or datasheet, B: fair or association, C: self-description, dealer, B2B platform).
   - `productLines`: `{ "kind": "genset|engine|alternator", "series": "", "fuel": "diesel", "power": { "min": 400, "max": 400, "unit": "kVA",
     "rating": "prime|standby|unspecified", "src": [1] }, "src": [1] }` — min and max must be numbers in the quote
     of that source, and the range must include the tender's power (same unit as the tender when the page gives it).
   - `specTables`: `{ "n": 1, "title": "", "header": ["| ... |"], "rows": ["| ... |"] }` — the header and each row are
     whole lines of the saved page, copied exactly. Give it when the page has a table with the model at that power.
   - `controllers`: `{ "brand": "Deep Sea", "model": "DSE7320", "text": "DSE7320", "line": "a whole line of the saved page", "src": [1] }`
     for every controller a saved page of the supplier names (Deep Sea, SmartGen, ComAp, DEIF, Datakom, Woodward...);
     `text` is the name exactly as written in `line`, `model` null when the page gives only the make.
   - `strengths`, `certifications`: only with a quote of a source (`src`); leave them out when unsure.
6. Run the check command of input.md. It prints, per supplier, what verify.mjs rejects and whether a product line
   covers the tender's power ("phù hợp công suất"), and the engine rows at that power the bot can put into the
   suggested configurations ("dòng động cơ đúng công suất"). Fix what it prints (copy quotes exactly, add the power
   line) and run it again. With no engine row the supplier is added to the catalog but to no configuration: give a
   `specTables` row naming both the engine model and the power, or, for a one-model datasheet whose lines never name
   both (a two-column PDF), the genset product line with `series` the genset model, `engineModels` [the one engine],
   `power` min = max, and a `specTables` row of the same source holding that power figure. A supplier that still fails is dropped by the bot; remove it from newCatalog.json.
7. Write `find.json`:
```json
{
  "summary": "1-2 câu: tìm được ai, cho công suất nào",
  "skipped": [{ "name": "tên công ty", "reason": "vì sao bỏ (đã có trong hệ thống, không có trang chính thức, không có công suất này...)" }],
  "notes": ["điều cần Khoa lưu ý, nếu có"]
}
```
When nothing fits, write `newCatalog.json` as `[]` and say in `summary` what was searched.
