# Gợi ý cấu hình (động cơ + đầu phát) cho một gói thầu

You work in a folder prepared by `config-bot.mjs prep`. Write `result.json` in this folder (and `newCatalog.json` only in step 4), nothing else.
Answer in Vietnamese. Khoa's rule (2026-10-28): the answer must be exactly right. Every fact comes word for word from
the files here or from a web page you saved with the save command below; `config-bot.mjs check` verifies it in code,
and anything it cannot find is marked "chưa khớp nguồn" on the web.

## Files
- `input.md`: the tender (name, capacity) and the technical requirements of the HSMT (chapter V or the parts about the
  generator set, engine and alternator), plus the analysis's technicalSpecs as a guide only.
- `hsmt.txt`: the tender's own text. Every requirement quote must be copied from here.
- `catalog.md`: the engines and alternators in the system (web/catalog.js), each with the genset table rows that name
  it, exactly as on the supplier's website, and the source `supplierId` / `n`; at the end, the suppliers in the system
  (role, status, confidence, website, Vietnam distributors) as recorded in the supplier DB.

## Steps
1. List the requirements for the engine, the alternator and the genset as a whole that a model can meet or fail:
   power (and whether prime / standby), voltage, frequency, speed, phases, power factor, engine make / origin /
   cylinders / displacement / governor / cooling / emission, alternator make / insulation class / IP / AVR / bearing,
   and so on. Each one: `item`, `requirement` (short), `quote` (exact words from hsmt.txt). Leave out what a model
   cannot decide (enclosure, ATS, delivery, warranty, documents).
2. From catalog.md, find configurations (one engine + one alternator) that meet them. Prefer an engine and an
   alternator that appear together in the same genset row (a real configuration a manufacturer sells). For every
   requirement write a check: `offered` (what the configuration gives) and `sourceQuote` (exact words from that
   catalog row or its table header), and `status`:
   - `met` only when the source states a value that meets the requirement;
   - `not_met` when the source states a value that does not;
   - `unclear` when the source does not say. Never guess a value, never take it from the model name, never assume
     prime when the row does not say prime (prime and standby are ratings, not a conversion).
   A value may be converted only with a formula from "Công thức được phép" at the end of this file (kW ↔ kVA,
   current, L/h ↔ g/kWh, hp/PS → kW, speed from poles, displacement from bore × stroke, in³ → L, °F → °C). Put it in
   the check's `conversions` (see result.json): the formula id, every input with `from`:
   - `source`: the number is in `sourceQuote`; `hsmt`: the number is in `hsmtQuote` (e.g. cosφ 0.8 or 380 V stated by
     the HSMT); `calc`: the result of an earlier conversion of this check; `standard`: only for an input the list gives
     a standard value for (diesel density), whose value the code fills in.
   - Never assume cosφ, voltage or density: take them from the source or the HSMT (density may use `standard`).
   - Fuel: `P_kW` is the power the consumption figure refers to in the same source (the engine output when g/kWh is
     per engine kW). A standard density gives a range: decide with the worst end (e.g. for "≤ 90 L/h", the higher L/h).
   - Write the converted value and the formula in `offered` (e.g. "320 kW / 0,8 = 400 kVA"). The code recomputes every
     conversion; a wrong input or result turns `met` into `unclear`.
   Keep at most 10 configurations, best first: fewest `not_met`, then a supplier that truly fits (step 3), then
   fewest `unclear`, then power closest above the requirement. A configuration with a `not_met` on power, frequency,
   a named make or origin is not a suggestion.
3. For every configuration, name the suppliers in the system that sell it (`suppliers`, at most 3, best first): only
   `supplierId`s from catalog.md, each with a row of that supplier (`n`, `line` exactly as in catalog.md) that names
   this engine and, best, this alternator at the power required. Put the supplier of the genset row first when it fits.
   Order: a row with this engine and this alternator, then confidence high > medium > low, then role genset_oem,
   then a Vietnam distributor. `why` states only facts shown in catalog.md (the row, the role, the confidence, the
   distributor). A supplier truly fits when its row names this engine and this alternator and the configuration has
   no `not_met` on power, frequency, a named make or origin.
4. Only when no configuration of step 2 has a supplier that truly fits: search the internet (WebSearch) for the ONE
   best configuration and the supplier that sells it. Official pages first: a genset maker's page or datasheet that
   lists a genset with its engine and alternator, then the engine and alternator makers' datasheets. Save every page
   you rely on with `node "<script>" save --dir . --url "<url>"` (the command is in input.md); it prints the saved
   file. Quotes for internet sources must be copied from those saved files. Never use a page you did not save.
   Put that configuration first (`src.kind: "internet"`), with its checks as in step 2, and its supplier in
   `suppliers` (`supplierId` = the id you give it below, `n` and `line` = its specTables entry below).
   Then add what you found to the catalog: write `newCatalog.json`, a list of supplier records in the shape of
   suppliers/schema.json, from the saved pages only:
   - `id` (a-z 0-9 -, the company's short name; the same id as in catalog.md for a supplier already in the system, then
     give only the new `sources`, `productLines`, `specTables`), `country` (2 letters), `role`, `names`, `website`,
     `status` (`partial`), `confidence` (`low` when every source is tier C), `missing` (what the pages do not say).
   - `sources`: `{ "n": 1, "file": "web/1.txt", "tier": "A|B|C", "quote": ["exact words from that page, 8+ characters"] }`
     (A: the maker's own site or datasheet, B: fair or association, C: self-description, dealer, B2B platform).
   - `productLines`: `{ "kind": "genset", "series": "", "fuel": "diesel", "power": { "min": 400, "max": 400, "unit": "kVA",
     "rating": "prime|standby|unspecified", "src": [1] }, "src": [1] }` — min and max must be numbers in the quote of that source.
   - `specTables`: `{ "n": 1, "title": "", "header": ["| ... |"], "rows": ["| ... |"] }` — the header and each row are whole
     lines of the saved page, copied exactly, with columns that name the engine model and the alternator model.
   The code checks it with verify.mjs, adds what passes to the catalog (web and a pull request in the repo) and drops
   what fails; nothing you write there is shown unless it is found word for word in the saved pages.
5. When neither the system nor the internet gives a configuration that meets the power, frequency and any named
   make or origin, answer with `"configs": []` and a `message` saying what was searched and what is missing.

## result.json
```json
{
  "summary": "1-2 câu",
  "requirements": [{ "item": "", "requirement": "", "quote": "" }],
  "configs": [{
    "rank": 1,
    "engine": { "model": "", "make": "", "src": { "kind": "catalog", "supplierId": "", "n": 101, "line": "| ... |" } },
    "alternator": { "model": "", "make": "", "src": { "kind": "internet", "url": "https://...", "file": "web/1.txt", "quote": "" } },
    "genset": { "model": "", "src": { "kind": "catalog", "supplierId": "", "n": 101, "line": "| ... |" } },
    "checks": [{ "item": "", "requirement": "", "hsmtQuote": "", "offered": "", "sourceQuote": "", "part": "engine|alternator|genset", "status": "met|not_met|unclear", "note": "",
      "conversions": [{ "formula": "current_3ph", "inputs": [{ "name": "S_kVA", "value": 400, "from": "source" }, { "name": "U_V", "value": 380, "from": "hsmt" }], "value": 607.7 }] }],
    "suppliers": [{ "supplierId": "", "n": 101, "line": "| ... |", "why": "" }],
    "gaps": ["what to confirm with the supplier"]
  }],
  "message": "only when configs is empty",
  "notes": []
}
```
- `make`: only when a source states it (catalog.md shows the make and where it comes from); otherwise leave it empty.
- `line` is the catalog row exactly as in catalog.md. `genset` only when the engine and alternator come from one row.
- `conversions`: only when a value is converted; leave it out otherwise.
