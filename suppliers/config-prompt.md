# Gợi ý cấu hình (động cơ + đầu phát) cho một gói thầu

You work in a folder prepared by `config-bot.mjs prep`. Write `result.json` in this folder (and `newCatalog.json` only in step 4), nothing else.
Answer in Vietnamese. Khoa's rule (2026-10-28): the answer must be exactly right. Every fact comes word for word from
the files here or from a web page you saved with the save command below; `config-bot.mjs check` verifies it in code,
and anything it cannot find is marked "chưa khớp nguồn" on the web.

## Files
- `input.md`: the tender (name, capacity) and the technical requirements of the HSMT (chapter V or the parts about the
  generator set, engine and alternator), plus the analysis's technicalSpecs as a guide only. Its "Xuất xứ động cơ"
  section says which engine makes may be suggested (Chinese only, makes from a G7 or G20 country, foreign only, or any): follow it in every step,
  internet search included. catalog.md already lists only engines of that origin; the code drops a configuration
  whose engine is of the other origin (under Chinese, also one whose make the source does not state), except, under
  Chinese, a foreign engine that a supplier based in China (country CN) offers in a row of its own table: keep it and
  list only those suppliers.
- `hsmt.txt`: the tender's own text. Every requirement quote must be copied from here.
- `catalog.md`, prepared and ranked by code (Khoa, 2026-11-02):
  - "Ứng viên": the best genset rows of the system for this tender, best first (power 95–140%, the HSMT's frequency,
    the engine origin asked for), each exactly as on the supplier's website with `supplierId` / `n` / `line`, the
    figures read from it, the controllers named in the row or offered by that supplier, and why it ranks there.
    The code ranks the engine model / make and the controller the HSMT names first, then engines with more sourced
    figures, then the alternator.
  - "Thông số theo model": every figure of each engine and alternator above, from ANY supplier's row or datasheet that
    names that model, each with its `factSrc`. A figure marked ⚠ is given differently by its sources.
  - "Thông số bộ điều khiển": the lines of the maker's datasheet of the controllers above (Deep Sea...), each line of
    the controller of its heading, with the `supplierId` / `n` to quote it.
  - "Nhà cung cấp khác có dòng ghi cùng động cơ": more rows naming those engines, to pick `suppliers` from.
  - "Động cơ khác trong khoảng công suất": the other engines near the power, one row each.
  - each table's header (once per `supplierId` / `n`, column titles); "Bộ điều khiển": the controllers of the suppliers
    shown, each with the line that names it (`supplierId`, `n`, `line`); at the end, those suppliers (role, status,
    confidence, website, controllers) as recorded in the supplier DB.
- `requirements.json` (only when the HSMT and Yêu cầu khác are unchanged since the last run): the requirements read
  last time. Copy them into result.json as they are and skip step 1.
- `suppliers.json`, `meta.json`: what the check command reads; do not open them.

## Working fast (a run used to take 10 minutes, Khoa 2026-10-29)
- Read input.md and catalog.md once each, in large parts; search hsmt.txt with grep for the quotes.
- Do not read the repo's source code (config-bot.mjs, verify.mjs, web/catalog.js, suppliers/) and do not write your
  own checker: run the check command in input.md once when result.json is written. It works offline, prints every
  point that does not match its source (or that none fails) and writes `result.checked.json`. Fix what it prints and
  run it again only if you changed something. A supplier you add in newCatalog.json is reported missing there; that
  is expected, the bot adds it before its own check.
- Write result.json (or a script that builds it) with the Write tool, never with a shell heredoc, and write it once:
  then change only the parts that need it with Edit.
- Keep `offered`, `note` and `gaps` short; do not repeat the requirement in them.

## Steps
1. List the requirements for the engine, the alternator and the genset as a whole that a model can meet or fail:
   power (and whether prime / standby), voltage, frequency, speed, phases, power factor, engine make / origin /
   cylinders / displacement / governor / cooling / emission, alternator make / insulation class / IP / AVR / bearing,
   the controller (make, model, AMF / auto start, paralleling, communication) and so on. Each one: `item`, `requirement` (short), `quote` (exact words from hsmt.txt),
   `part` (`engine`, `alternator`, `controller` or `genset` for the set as a whole: power, voltage, frequency, fuel
   consumption...) and `level`: `core` when it decides which engine, alternator, controller or genset model fits, or
   `option` when the supplier sets it when the order is placed without changing those models (fuel tank size,
   dimensions, weight, noise, canopy). Leave out what a model cannot decide (enclosure, ATS, delivery, warranty, documents).
   Give every requirement its own `item` name and use the same name in every check.
   When input.md has a "Yêu cầu khác" section (typed on the web, Khoa 2026-11-01), add each of its requirements too,
   with `"from": "user"`, `quote` empty, and treat it exactly like one of the HSMT: a check in every configuration
   (`hsmtQuote` empty), counted in the ranking of step 2, searched for in step 4. When it names a make or model
   (engine, alternator, controller), a configuration that does not offer it has that check `not_met` and is not a
   suggestion. When it contradicts the HSMT, follow it and say so in `notes`.
2. From catalog.md, find configurations (one engine + one alternator + a controller) that meet them, starting from
   "Ứng viên". What matters most (Khoa, 2026-11-02): the engine and the controller, then the alternator and the genset
   as a whole, then the `option` requirements. Prefer an
   engine and an alternator that appear together in the same genset row (a real configuration a manufacturer sells).
   For every requirement write a check (`item` as in requirements): `offered` (what the configuration gives) and
   `sourceQuote` (exact words from that catalog row or its table header), and `status`:
   - `met` only when the source states a value that meets the requirement;
   - `not_met` when the source states a value that does not;
   - `unclear` when the source does not say. Never guess a value, never take it from the model name, never assume
     prime when the row does not say prime (prime and standby are ratings, not a conversion).
   An engine or alternator figure (cylinders, displacement, bore, governor, aspiration, emission, insulation, IP, AVR...)
   that the configuration's own row does not give may be taken from "Thông số theo model" of that same model: copy its
   `factSrc` into the check, set `part` to `engine` or `alternator`, and quote `sourceQuote` from that factSrc line.
   Only figures of the engine or alternator itself, never a genset figure (fuel consumption, size, tank, noise) of
   another supplier's row. A figure marked ⚠ (sources disagree) is `unclear`, with the values in `note`; the code
   also turns such a "met" into "unclear".
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
   Controller (Khoa, 2026-11-01): give the configuration a `controller` when a source names one: the controller its
   genset row names (`src.kind: "catalog"`, that row), else one the supplier offers in the "Bộ điều khiển" section
   (`src.kind: "controller"`, its `supplierId`, `n`, `line` exactly as there). Prefer the make or model the HSMT asks
   for, and a supplier that offers it; a controller with "Thông số bộ điều khiển" (its maker's datasheet) before one
   without. Check the HSMT's controller requirements with `part: "controller"` and a `sourceQuote` from that line, or
   from a line of "Thông số bộ điều khiển" of that controller: then copy `factSrc` { `supplierId`, `n`, `line` (the
   whole line, word for word) } into the check. A function (AMF, paralleling, RS485, event log...) no line states is
   `unclear`, never assumed from the model name. When the heading says the datasheet is of another generation (the
   supplier writes DSE7320, the datasheet is DSE7320 MKII), the check may be `met` and the code adds that the
   generation is to be confirmed.
   Keep at most 10 configurations, best first: fewest `not_met` on the engine and the controller, then on the
   alternator and the genset, then a supplier that truly fits (step 3), then fewest `unclear` in the same order, then
   the `option` requirements, then power closest above the requirement. The code ranks them again this way. A
   configuration with a `not_met` on power, frequency, a named make or origin is not a suggestion. Give several
   different engines when the catalog has them, not ten rows of one engine.
3. For every configuration, name the suppliers in the system that sell it (`suppliers`, at most 3, best first): only
   `supplierId`s from catalog.md, each with a row of that supplier (`n`, `line` exactly as in catalog.md) that names
   this engine and, best, this alternator at the power required. Order (Khoa, 2026-11-02): a supplier that offers both
   this engine (its row) and the configuration's controller first, then the supplier of the genset row, then a row
   that also names this alternator, then confidence high > medium > low, then role genset_oem. A Vietnam distributor is
   not needed and does not count in the order. `why` states only facts shown in catalog.md (the row, the role, the
   confidence, the controller). A supplier truly fits when its row names this engine and the configuration has no
   `not_met` on power, frequency, a named make or origin.
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
   - `controllers`: `{ "brand": "Deep Sea", "model": "DSE7320", "text": "DSE7320", "line": "a whole line of the saved page", "src": [1] }`
     — only when a saved page names the controller; `text` is the name as written in `line`, `model` null for a make alone.
   The code checks it with verify.mjs, adds what passes to the catalog (web and a pull request in the repo) and drops
   what fails; nothing you write there is shown unless it is found word for word in the saved pages.
5. When neither the system nor the internet gives a configuration that meets the power, frequency and any named
   make or origin, answer with `"configs": []` and a `message` saying what was searched and what is missing.

## result.json
```json
{
  "summary": "1-2 câu",
  "requirements": [{ "item": "", "requirement": "", "quote": "", "part": "engine|alternator|genset|controller", "level": "core|option" }],
  "configs": [{
    "rank": 1,
    "engine": { "model": "", "make": "", "src": { "kind": "catalog", "supplierId": "", "n": 101, "line": "| ... |" } },
    "alternator": { "model": "", "make": "", "src": { "kind": "internet", "url": "https://...", "file": "web/1.txt", "quote": "" } },
    "genset": { "model": "", "src": { "kind": "catalog", "supplierId": "", "n": 101, "line": "| ... |" } },
    "controller": { "model": "DSE7320", "make": "Deep Sea", "src": { "kind": "controller", "supplierId": "", "n": 3001, "line": "..." } },
    "checks": [{ "item": "", "requirement": "", "hsmtQuote": "", "offered": "", "sourceQuote": "", "part": "engine|alternator|genset|controller", "status": "met|not_met|unclear", "note": "",
      "factSrc": { "supplierId": "", "n": 101, "line": "only when the figure comes from Thông số theo model" },
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
