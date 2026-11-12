# Gợi ý cấu hình (động cơ + đầu phát) cho một gói thầu

You work in a folder prepared by `config-bot.mjs prep`. Write `result.json` in this folder (and `newCatalog.json` only in step 4), nothing else.
Answer in Vietnamese. Khoa's rule (2026-10-28): the answer must be exactly right. Every fact comes word for word from
the files here or from a web page you saved with the save command below; `config-bot.mjs check` verifies it in code,
and anything it cannot find is marked "chưa khớp nguồn" on the web.

## Files
- `input.md`: the tender (name, capacity) and the technical requirements of the HSMT (chapter V or the parts about the
  generator set, engine and alternator), plus the analysis's technicalSpecs as a guide only. Its "Xuất xứ động cơ"
  section says which engine makes may be suggested (Chinese only, makes from a G7 or G20 country, foreign only, or any): follow it in every step,
  internet search included. A "Gói có nhiều cỡ máy" section means the tender buys gensets of several sizes and this run
  is for ONE of them (Khoa, 2026-11-04): list only the requirements for that size or for every set of the tender, and
  suggest configurations of that size only; the other sizes have runs of their own. catalog.md already lists only engines of that origin; the code drops a configuration
  whose engine is of the other origin (under Chinese, also one whose make the source does not state), except, under
  Chinese, a foreign engine that a supplier based in China (country CN) offers in a row of its own table: keep it and
  list only those suppliers. Under G7 / G20 (Khoa, 2026-11-10) the suppliers are of the group too: catalog.md lists only
  rows of suppliers based in a country of the group, and the code drops any other supplier and a configuration taken
  from its row (an assembler in China offering a Cummins engine, a Stamford alternator and a Deep Sea controller is NOT
  a suggestion for a tender that asks for G7). That holds when the HSMT asks G7 / G20 of the genset itself. When it
  asks it only of the engine / alternator / controller (their make or origin, IB2600603983; input.md then says "KHÔNG
  đòi cả tổ máy"), the suppliers are the ones based in China that offer a set built with parts of those makes: only
  engines of the group's makes are listed, and an alternator or controller of a Chinese make fails the HSMT's
  requirement for that part. When the HSMT asks for no G7 / G20 ("Tất cả"; Khoa, 2026-11-10) it is
  the other way round: suggest the suppliers based in China (country CN) that offer a fitting engine, alternator and
  controller, of a Chinese or a foreign make; catalog.md lists only their rows and the code drops a supplier based
  elsewhere, unless input.md has a "Đồng bộ thương hiệu" section (then suppliers of every country stay).
- `hsmt.txt`: the tender's own text. Every requirement quote must be copied from here.
- `catalog.md`, prepared and ranked by code (Khoa, 2026-11-02):
  - "Ứng viên": the best genset rows of the system for this tender, best first (power 100–120%, or 100–140% for a genset of 30 kVA or less, the HSMT's frequency,
    the engine origin asked for), each exactly as on the supplier's website with `supplierId` / `n` / `line`, the
    figures read from it, the controllers named in the row or offered by that supplier, and why it ranks there.
    The code ranks the engine model / make and the controller the HSMT names first, then engines with more sourced
    figures, then the alternator.
  - "Thông số theo model": every figure of each engine and alternator above, from ANY supplier's row or datasheet that
    names that model, each with its `factSrc`. A figure marked ⚠ is given differently by its sources.
  - "Thông số bộ điều khiển": the first lines of the maker's datasheet of the controllers above (Deep Sea, SmartGen),
    each line of the controller of its heading, with the `supplierId` / `n` to quote it (Deep Sea, SmartGen, ComAp). ALL the lines are in
    `controllers.md` (a datasheet runs to 250 lines, a SmartGen manual to 700): for every controller requirement
    (event log, protections, emergency stop, measurements, AMF, RS485...) search controllers.md with grep under that
    controller's heading before writing `unclear`. `ctl-lookup.md` (when the message lists it) has done the first
    search for you: for each controller function the HSMT names (F1, F2...) and each controller with a datasheet, the
    line the check's hints would name, with its factSrc, or "không thấy dòng nào". Read the line and decide yourself;
    grep controllers.md only for a function it does not find or a line that does not settle it.
    A controller of "Bộ điều khiển" marked "có datasheet hãng" has its datasheet only in controllers.md: before
    giving a configuration that controller, or writing `unclear` on its functions, grep controllers.md for its model.
  - "Nhà cung cấp khác có dòng ghi cùng động cơ": more rows naming those engines, to pick `suppliers` from.
  - "Động cơ khác trong khoảng công suất": the other engines near the power, one row each.
  - each table's header (once per `supplierId` / `n`, column titles); "Bộ điều khiển": the controllers of the suppliers
    shown, each with the line that names it (`supplierId`, `n`, `line`); at the end, those suppliers (role, status,
    confidence, website, controllers) as recorded in the supplier DB.
- `requirements.json` (only when the HSMT and Yêu cầu khác are unchanged since the last run): the requirements read
  last time. Copy them into result.json as they are and skip step 1.
- `suppliers.json`, `meta.json`: what the check command reads; do not open them.

## Working fast (a run used to take 10 minutes, Khoa 2026-10-29)
- Read the files the message lists, in that order, each once and whole (the code keeps each under the Read limit;
  catalog-N.md / input-N.md are catalog.md / input.md cut at their headings, word for word, and a `line` copied from
  them is a line of catalog.md); search hsmt.txt with grep for the quotes.
- Do not read the repo's source code (config-bot.mjs, verify.mjs, web/catalog.js, suppliers/) and do not write your
  own checker: run the check command in input.md once when result.json is written. It works offline, prints every
  point that does not match its source (or that none fails) and writes `result.checked.json`. Fix what it prints and
  run it again only if you changed something.
  Under "CÓ THỂ TRA ĐƯỢC" it then lists the `unclear` checks whose sources have a line about them (a figure of the
  model, of the configuration's row, or a line of its controller's datasheet, with the factSrc to quote it by). Read
  each line: when it states a value or function that meets the requirement (or fails it), change that check to `met`
  (`not_met`) with that line as `sourceQuote` and its factSrc; when it does not say, leave it `unclear`. Never write
  `unclear` for a figure or function before searching catalog.md and controllers.md for it (2026-11-03: a run left
  the event log of a DSE8610 `unclear` though its datasheet says "The event log records 250 events"). A supplier you add in newCatalog.json is reported missing there; that
  is expected, the bot adds it before its own check.
  Under "CÓ THỂ SÓT YÊU CẦU" it lists lines of the analysis whose topic no requirement mentions: read the HSMT for each;
  when it is a requirement on the set, engine, alternator or controller, add it (and its checks); otherwise leave it.
- Write result.json (or a script that builds it) with the Write tool, never with a shell heredoc, and write it once:
  then change only the parts that need it with Edit.
- Keep `offered`, `note` and `gaps` short; do not repeat the requirement in them.
- No citations outside the quote fields (Khoa, 2026-11-11: the screen hides quotes, so a citation written in prose
  still shows). The exact words go only in `quote`, `hsmtQuote`, `sourceQuote`, `line`, `src.quote`, `quoteA`/`quoteB`.
  `offered` gives the value offered (e.g. "13,6:1"), not the source line. `note`, `gaps`, `why`, `summary` and `notes`
  give the conclusion or what to confirm, in plain Vietnamese: never "HSMT ghi …", "nguồn ghi …", "dòng … ghi …",
  "bảng III.15 / mục B.II.1", a model row's text, a file, page or datasheet name, nor internal labels (genset_oem,
  độ tin cậy medium / high / low, supplierId, n). E.g. note "Khác 14:1 của HSMT, cần xác nhận", not "HSMT ghi 14:1,
  nguồn ghi 13,6:1"; note "Các nguồn ghi khác nhau, cần xác nhận", not "Nguồn ghi khác nhau: EU Stage II / T2".

## Steps
1. List the requirements for the engine, the alternator and the genset as a whole that a model can meet or fail:
   power (and whether prime / standby), voltage, frequency, speed, phases, power factor, engine make / origin /
   cylinders / displacement / governor / cooling / emission, alternator make / insulation class / IP / AVR / bearing,
   the controller (make, model, AMF / auto start, paralleling, communication) and so on. Each one: `item`, `requirement` (short), `quote` (exact words from hsmt.txt),
   `part` (`engine`, `alternator`, `controller` or `genset` for the set as a whole: power, voltage, frequency, fuel
   consumption...) and `level`: `core` when it decides which engine, alternator, controller or genset model fits, or
   `option` when the supplier sets it when the order is placed without changing those models (fuel tank size,
   dimensions, weight, noise, canopy). Leave out what a model cannot decide (enclosure, ATS, delivery, warranty, documents).
   Do NOT leave out (2026-11-06 audit: each was missed by some run): the controller's whole section (its make / model,
   AMF, display, protections, event log, communication) even when the HSMT puts it under its own heading; the origin
   or make of the set as a whole ("Xuất xứ tổ máy", "nhập khẩu nguyên chiếc", "OEM"); the standards and certificates
   of the set or its parts (ISO 8528 / ISO 3046 / IEC 60034, performance class G2 / G3, CE, prototype tested) — a
   requirement the datasheet states, `part: "genset"`, even when the HSMT asks for the certificate as a document;
   the fuel tank, noise, size and weight as `option`; a model the HSMT names for the controller or the alternator.
   One line of the HSMT that holds several of them (a certificate and a make in one sentence) is several requirements.
   Requirement codes (Khoa, 2026-11-06): input.md has a table "Mã yêu cầu". Every requirement carries a `code` from it,
   and takes the table's `item`, `part` and `level` (write them as the table gives them; the code enforces them). One
   requirement per code: when the HSMT states a point in several places (the voltage in the set's table and again under
   the alternator), write one requirement with the main quote; the fuel consumption at 100 / 75 / 50 % load are three
   codes; the controller's functions go to their grouped codes (ctl_protection, ctl_measure, ctl_comm, ctl_alarm_log,
   ctl_start_amf) with `parts`. A point that fits no code gets `code: "other"` and an `item` of your own; use it rarely
   (check prints every "other" for you to look at the table again). After the check command, read its "MÃ YÊU CẦU CHƯA CÓ"
   list: codes whose words the HSMT's text holds on a line of its own but no requirement carries; read each line in
   hsmt.txt and add the requirement (and its checks) when it is one.
   Use the requirement's `item` in every check of it.
   Group the controller's functions of one kind into ONE requirement (Khoa 2026-11-03): its protections (over / under
   voltage, frequency, overload, oil pressure, coolant temperature...), its measurements and display, its
   communication (RS485, Modbus, USB, Ethernet...), its alarms / event log, its start / stop and AMF functions, with
   `parts`: one `{ "item": "Quá áp" }` per function the HSMT lists, in the HSMT's words. Its check then has the same
   `parts`, each with its own `status`, `offered`, `sourceQuote` and `factSrc` exactly as a check of its own; the
   code checks every part, and the group is met only when every part is. A requirement of a single value (make, model,
   origin) stays on its own.
   Points that lost the company a tender (Khoa 2026-11-12, from the evaluation reports): when the HSMT asks for one of
   these, write it as its own requirement with its code, and in the configurations you rank 1–3 look it up in the
   sources (catalog.md, controllers.md, datasheets) before leaving it `unclear`: the controller's short-circuit
   protection (ctl_protection, "Ngắn mạch" as a part of its own, never folded into "Quá dòng"), the alternator
   efficiency (alt_efficiency), the fuel consumption at 50 % load (fuel_consumption_50), the emission standard
   (emission: Euro / Tier / Stage / QCVN, not the exhaust flow or temperature, which is `exhaust`), the alternator
   standard (alt_standard), the alternator power (alt_power) and a Vietnamese display of the controller
   (ctl_display_lang). The code warns on every top-3 configuration where one of them is not `met`. Never write a
   figure the source does not state to make one `met`.
   When input.md has a "Yêu cầu khác" section (typed on the web, Khoa 2026-11-01), add each of its requirements too,
   with `"from": "user"`, `quote` empty, and treat it exactly like one of the HSMT: a check in every configuration
   (`hsmtQuote` empty), counted in the ranking of step 2, searched for in step 4. When it names a make or model
   (engine, alternator, controller), a configuration that does not offer it has that check `not_met` and is not a
   suggestion. When it contradicts the HSMT, follow it and say so in `notes`.
2. From catalog.md, find configurations (one engine + one alternator + a controller) that meet them, starting from
   "Ứng viên". What matters most (Khoa, 2026-11-02): the engine and the controller, then the alternator and the genset
   as a whole, then the `option` requirements. Prefer an
   engine and an alternator that appear together in the same genset row (a real configuration a manufacturer sells).
   Write each model's checks once (Khoa 2026-11-03): in a configuration whose controller is the controller of an
   earlier configuration, leave out the controller checks; whose engine (alternator) is that of an earlier one, leave
   out the checks taken from "Thông số theo model" (`factSrc`). The code copies them from the earlier configuration
   and checks them against this one's sources. Still write every check this configuration's own row gives.
   For every requirement write a check (`item` as in requirements): `offered` (what the configuration gives) and
   `sourceQuote` (exact words from that catalog row or its table header), and `status`:
   - `met` only when the source states a value that meets the requirement;
   - `not_met` when the source states a value that does not;
   - `unclear` when the source does not say. Never guess a value, never take it from the model name, never assume
     prime when the row does not say prime (prime and standby are ratings, not a conversion).
   Write only these three. Column `kind` of the code table says what a point is: `order` (chosen when ordering: voltage,
   IP, AVR, breaker, tank...) and `document` (certificates, prototype, the set's origin) left `unclear` are turned by
   the code into "xác nhận khi đặt hàng" / "cần chứng từ" and put in the questions to the supplier; still look them up
   in the sources first (a source that states them makes them `met` / `not_met`), and never write `confirm` yourself.
   A bare figure of the HSMT (no ≥ / ≤ / "tối thiểu" / "tối đa", e.g. "Dung tích xi lanh 11.051 L") (Khoa, 2026-11-03):
   for a figure where more is better (power, displacement, cylinders, tank, battery Ah, insulation class, IP, hours...)
   it is the least accepted: a value at or above it is `met`, below it `not_met`. For a figure with no better side (bore,
   stroke, dimensions, weight, compression ratio, a speed or voltage of a design) a different value is `unclear`, with
   the offered value in `offered` and a `note` saying it differs from the HSMT, never `not_met`; the same value is `met`.
   An engine or alternator figure (cylinders, displacement, bore, governor, aspiration, emission, insulation, IP, AVR...)
   that the configuration's own row does not give may be taken from "Thông số theo model" of that same model: copy its
   `factSrc` into the check, set `part` to `engine` or `alternator`, and quote `sourceQuote` from that factSrc line.
   Only figures of the engine or alternator itself, never a genset figure (fuel consumption, size, tank, noise) of
   another supplier's row. A figure marked ⚠ (sources disagree) is `unclear`, with the values in `offered`; the code
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
   generation is to be confirmed. A controller the source writes without its series ("Smartgen 6120", "SmartGen 6110
   automatic control module") is the model catalog.md shows after "bộ điều khiển trong dòng" / "bộ điều khiển nhà cung
   cấp chào" (HGM6120, HGM6110): keep `model` as the source writes it, and its datasheet in controllers.md counts.
   When the HSMT asks for a controller, a configuration with no `controller` counts as `not_met` on the controller
   (the code adds that check, Khoa 2026-11-02): give each configuration the controller its row or its supplier offers.
   "Đồng bộ thương hiệu" (Khoa 2026-11-06): when input.md has that section, the HSMT wants at least N of the engine,
   alternator and controller made by the genset's own maker. The code adds that requirement and writes its check in
   every configuration from the makes (do not write it yourself; give each part's `make` when a source states it): a set
   assembled from three makes (Cummins / Yuchai engine + Stamford / Nianfeng alternator + SmartGen / Deep Sea, built by a
   Chinese assembler) fails it, and it ranks with the engine and the controller. Look first for a genset of a maker that
   makes the engine and the alternator or controller itself (Cummins with Stamford / PowerCommand, Caterpillar / Perkins /
   FG Wilson, Kohler / SDMO, MTU, Mitsubishi, Denyo...) with `genset.make` set; when catalog.md has none, do step 4.
   Keep at most 6 configurations, best first: fewest `not_met` on the engine and the controller, then on the
   alternator and the genset, then a supplier that truly fits (step 3), then fewest `unclear` in the same order, then
   the `option` requirements, then power closest above the requirement. The code ranks them again this way. A
   configuration with a `not_met` on power, frequency, a named make or origin is not a suggestion. Give several
   different engines when the catalog has them, not six rows of one engine.
   A genset the HSMT names (Khoa 2026-11-12; input.md "Tổ máy HSMT nêu đích danh", e.g. "Nhà sản xuất Huyndai", "Mã hiệu
   DHY110K SE"): the configuration of that model (its catalog.md row says "tổ máy đúng model HSMT nêu đích danh") comes first,
   with `genset.model` / `genset.make` as its source writes them; a configuration of another genset make / model is an
   equivalent. Still suggest equivalents as usual: the code labels each configuration (named model, named make,
   equivalent), puts the named one first and warns when the HSMT allows no equivalent; do not label them yourself, and do
   not write `not_met` on the make / model check of an equivalent only for being another make (leave it `unclear`).
   Two configurations per engine make (Khoa, 2026-11-11): when the catalog has two different engine models of one make
   that fit (Baudouin 6M33G825/5 and 6M31G825/5, Perkins 4006-23TAG2A and 4006-23TAG3A), give both, each as its own
   configuration; never more than 2 of one make (the code drops a third). Leave the second out only to make room for
   another make that meets the HSMT better.
3. For every configuration, name the suppliers in the system that sell it (`suppliers`, at most 3, best first): only
   `supplierId`s from catalog.md, each with a row of that supplier (`n`, `line` exactly as in catalog.md) that names
   this engine and, best, this alternator at the power required. Under "Đồng bộ thương hiệu", a supplier truly fits only
   when the configuration meets it too (the code's check is `met`). Order (Khoa, 2026-11-02): a supplier that offers both
   this engine (its row) and the configuration's controller first, then the supplier of the genset row, then a row
   that also names this alternator, then confidence high > medium > low, then role genset_oem. A Vietnam distributor is
   not needed and does not count in the order. `why` states only facts shown in catalog.md, in one short Vietnamese
   phrase about what the supplier offers (e.g. "Chào đúng động cơ, đầu phát và bộ điều khiển của cấu hình", "Chào đúng
   động cơ, chưa ghi đầu phát"); the row itself goes only in `line`, and the role / confidence labels never appear. A supplier truly fits when its row names this engine and the configuration has no
   `not_met` on power, frequency, a named make or origin.
4. A genset the HSMT names that catalog.md does not have: search for THAT model first, on its own brand's pages (the maker's
   site, or the company licensed to sell under that brand: both count as the maker's source, tier A / B), save them, and
   write the configuration from them with `src.tier` on every internet `src`. The rule "only suppliers based in China" of a
   tender with no G7 / G20 does not apply to this one configuration (the code keeps its supplier wherever it is based);
   the origin the HSMT asks of the set is still checked (a source that does not state it leaves the check `unclear`).
   input.md says whether a seller's page (dealer, marketplace) may stand in for it; when it may not, and the brand has no
   page, declare the search in `searched` (`what: "source"`) and the code shows "chưa có nguồn thông số" for the model.
   Then, only when no configuration of step 2 has a supplier that truly fits: search the internet (WebSearch) for the ONE
   best configuration and the supplier that sells it. Under G7 / G20 that supplier is a genset maker based in a country
   of the group (its `country` in newCatalog.json), never an assembler in China. Official pages first: a genset maker's page or datasheet that
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
     Tier is by WHO OWNS THE DOCUMENT, not by the domain: a sheet of the maker itself, downloaded from a link on the maker's own page,
     is A (or B) even when the file sits on a CDN (cdn.shopify.com, a cloud bucket); say in the notes of the result which page of the maker links to it.
     A page of a seller (a dealer, a reseller, a B2B platform) is tier C. The code does not add a tier C page that is not on the maker's own
     domain to the catalog (Khoa, 2026-11-12), and what rests on it alone with it: do not spend a save on one just for the catalog, mention it only in
     the notes of the result; a supplier whose only pages are of sellers is not added.
     The suggestion of this run may still use a tier C page you saved (config-web); only the catalog leaves it out, with the reason in `catalogAdded`.
   - `productLines`: `{ "kind": "genset", "series": "", "fuel": "diesel", "power": { "min": 400, "max": 400, "unit": "kVA",
     "rating": "prime|standby|unspecified", "src": [1] }, "src": [1] }` — min and max must be numbers in the quote of that source.
   - `specTables`: `{ "n": 1, "title": "", "header": ["| ... |"], "rows": ["| ... |"] }` — the header and each row are whole
     lines of the saved page, copied exactly, with columns that name the engine model and the alternator model.
   - `controllers`: `{ "brand": "Deep Sea", "model": "DSE7320", "text": "DSE7320", "line": "a whole line of the saved page", "src": [1] }`
     — only when a saved page names the controller; `text` is the name as written in `line`, `model` null for a make alone.
   The code checks it with verify.mjs, adds what passes to the catalog (web and a pull request in the repo) and drops
   what fails; nothing you write there is shown unless it is found word for word in the saved pages.
   - A page that answers 401 / 403 / 429 or a bot check is closed to automated download (Khoa's rule: never get
     around a block): do not try it again, do not change the User-Agent or any header, do not use another tool, a cache,
     an archive or a copy on another site to reach that same file. Declare it in `searched` (`outcome: "blocked"`)
     and use a different source you can save, if one exists.
   - Before searching, read "Đã tra trên mạng ở lượt trước" in catalog.md: a search listed there (not found, or blocked)
     is not done again at the same place; a check it was about is written as when the source is silent (`unclear`).
   - `searched` in result.json: every search of this run that did NOT find what it looked for, one entry per part,
     model and what: `{ "part": "engine|alternator|genset|controller", "model": "the model exactly as catalog.md or
     your configuration writes it", "make": "", "what": "datasheet" or a figure key of input.md's list (e.g. "fuel75"),
     "where": ["each URL you fetched or saved for it, exactly as you used it", "each WebSearch query, word for word"],
     "outcome": "not_found|blocked", "note": "1 câu" }`. `datasheet` means no datasheet of that model on those sites.
     `what: "source"` (outcome `not_found`) = you looked for a usable source (the maker's page, or a supplier that fits
     this run's origin) of a genset / engine / alternator / controller model the HSMT names and catalog.md lacks, and
     found none: declare it too (`where` = your WebSearch queries / URLs). It is kept with this run's origin and only a
     run of the same origin skips it.
     The code keeps an entry only when every `where` is in this run's log, so the next runs skip it for 90 days; write
     nothing there for a search that found what it looked for, or that you did not run.
5. When neither the system nor the internet gives a configuration that meets the power and frequency, answer with
   `"configs": []` and a `message` saying what was searched and what is missing. A genset make / model the HSMT names
   that no source gives is no reason for `configs: []`: give the equivalents (the code labels them).

## result.json
```json
{
  "summary": "1-2 câu",
  "requirements": [{ "code": "a code of input.md's Mã yêu cầu table, or other", "item": "the code's item name (own name only for other)", "requirement": "", "quote": "", "part": "engine|alternator|genset|controller", "level": "core|option", "parts": [{ "item": "only for a grouped requirement" }] }],
  "configs": [{
    "rank": 1,
    "engine": { "model": "", "make": "", "src": { "kind": "catalog", "supplierId": "", "n": 101, "line": "| ... |" } },
    "alternator": { "model": "", "make": "", "src": { "kind": "internet", "url": "https://...", "file": "web/1.txt", "quote": "", "tier": "A|B|C (as in newCatalog.json sources)" } },
    "genset": { "model": "", "src": { "kind": "catalog", "supplierId": "", "n": 101, "line": "| ... |" } },
    "controller": { "model": "DSE7320", "make": "Deep Sea", "src": { "kind": "controller", "supplierId": "", "n": 3001, "line": "..." } },
    "checks": [{ "item": "", "requirement": "", "hsmtQuote": "", "offered": "", "sourceQuote": "", "part": "engine|alternator|genset|controller", "status": "met|not_met|unclear", "note": "",
      "factSrc": { "supplierId": "", "n": 101, "line": "only when the figure comes from Thông số theo model" },
      "conversions": [{ "formula": "current_3ph", "inputs": [{ "name": "S_kVA", "value": 400, "from": "source" }, { "name": "U_V", "value": 380, "from": "hsmt" }], "value": 607.7 }],
      "parts": [{ "item": "Quá áp", "offered": "", "sourceQuote": "", "status": "met|not_met|unclear", "factSrc": {} }] }],
    "suppliers": [{ "supplierId": "", "n": 101, "line": "| ... |", "why": "" }],
    "gaps": ["what to confirm with the supplier"]
  }],
  "message": "only when configs is empty",
  "searched": [{ "part": "genset", "model": "D440", "make": "Rehlko", "what": "datasheet", "where": ["https://...", "query"], "outcome": "not_found|blocked", "note": "" }],
  "notes": [],
  "clarify": [{ "item": "Ổn định điện áp", "quoteA": "a line of hsmt.txt, word for word", "quoteB": "the other line, word for word (optional)", "why": "1 câu tiếng Việt" }]
}
```
- `clarify`: questions for the investor (câu hỏi làm rõ HSMT), not for the supplier: the HSMT states one point at two
  places with different values (±0,5% in a table, ±1,5% in a section), a value no model can meet as written (a design
  figure such as a compression ratio of exactly 14:1 that no engine in catalog.md has), a requirement that contradicts
  a standard (10% overload on the standby rating). `quoteA` / `quoteB` are copied word for word from hsmt.txt (the code
  drops an item whose quote is not found); `why` says in one sentence what differs. Leave it out when nothing needs
  asking. The code adds questions of its own too; do not change any check's status because of them.
- `make`: only when a source states it (catalog.md shows the make and where it comes from); otherwise leave it empty.
- `line` is the catalog row exactly as in catalog.md. `genset` only when the engine and alternator come from one row.
- `conversions`: only when a value is converted; leave it out otherwise.
