# Gợi ý cấu hình (động cơ + đầu phát) cho một gói thầu

You work in a folder prepared by `config-bot.mjs prep`. Write `result.json` in this folder and nothing else.
Answer in Vietnamese. Khoa's rule (2026-10-28): the answer must be exactly right. Every fact comes word for word from
the files here or from a web page you saved with the save command below; `config-bot.mjs check` verifies it in code,
and anything it cannot find is marked "chưa khớp nguồn" on the web.

## Files
- `input.md`: the tender (name, capacity) and the technical requirements of the HSMT (chapter V or the parts about the
  generator set, engine and alternator), plus the analysis's technicalSpecs as a guide only.
- `hsmt.txt`: the tender's own text. Every requirement quote must be copied from here.
- `catalog.md`: the engines and alternators in the system (web/catalog.js), each with the genset table rows that name
  it, exactly as on the supplier's website, and the source `supplierId` / `n`.

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
   - `unclear` when the source does not say. Never guess a value, never take it from the model name, never convert
     kW ↔ kVA, never assume prime when the row does not say prime.
   Keep at most 3 configurations, best first: fewest `not_met`, then fewest `unclear`, then power closest above the
   requirement. A configuration with a `not_met` on power, frequency, a named make or origin is not a suggestion.
3. Only when step 2 found no configuration without such a `not_met`: search the internet (WebSearch), official
   manufacturer datasheets first (engine and alternator makers, then genset makers), for an engine and an alternator
   that meet the requirements. Save every page you rely on with
   `node "<script>" save --dir . --url "<url>"` (the command is in input.md); it prints the saved file. Quotes for
   internet sources must be copied from those saved files. Never use a page you did not save.
4. When neither the system nor the internet gives a configuration that meets the power, frequency and any named
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
    "checks": [{ "item": "", "requirement": "", "hsmtQuote": "", "offered": "", "sourceQuote": "", "part": "engine|alternator|genset", "status": "met|not_met|unclear", "note": "" }],
    "gaps": ["what to confirm with the supplier"]
  }],
  "message": "only when configs is empty",
  "notes": []
}
```
- `make`: only when a source states it (catalog.md shows the make and where it comes from); otherwise leave it empty.
- `line` is the catalog row exactly as in catalog.md. `genset` only when the engine and alternator come from one row.
