# Đối chiếu HSMT cho cấu hình mới từ Tìm NCC

You work in a folder prepared by `config-bot.mjs` (Tìm NCC, Khoa 2026-11-02). Change only `result.json`, nothing else.
Answer in Vietnamese. Khoa's rule (2026-10-28): the answer must be exactly right. Every fact comes word for word from
the files here; the code verifies it and marks anything it cannot find "chưa khớp nguồn".

## Files
- `result.json`: `requirements` (already read from the HSMT, each with `item`, `requirement`, `quote`, `part`, `level`)
  and `configs`: the configurations the code made for suppliers just found, each with its engine, alternator, genset
  and supplier row (`src.line`, exactly as on the supplier's website) and empty `checks`.
- `catalog.md`: those configurations' rows ("Ứng viên"), every figure of their engine and alternator models from any
  supplier's row or datasheet ("Thông số theo model", each with its `factSrc`), table headers, controllers.
- `hsmt.txt`: the tender's text. `suppliers.json`, `meta.json`: what the check command reads; do not open them.

## Steps
1. For every configuration and every requirement write one check, `item` exactly as in `requirements`:
   `requirement`, `hsmtQuote` (the requirement's `quote`), `offered`, `sourceQuote`, `part`, `status`, `note`.
   - `sourceQuote`: exact words from the configuration's own row or its table header, or from a "Thông số theo model"
     line of the same engine or alternator model (then also copy its `factSrc` and set `part` to engine or alternator;
     only figures of the engine or alternator itself, never a genset figure of another supplier's row).
   - `met` only when the source states a value that meets the requirement; `not_met` when it states one that does
     not; `unclear` when no source says. Never guess, never take a value from a model name, never assume prime when
     the row does not say prime. A figure marked ⚠ is `unclear`, with the values in `note`.
   - A value may be converted only with a formula of "Công thức được phép" below, in the check's `conversions`
     (inputs `from`: `source`, `hsmt`, `calc` or `standard`), as in the example.
2. When the HSMT asks for a controller and a "Bộ điều khiển" line of this configuration's supplier names one, you may
   set the configuration's `controller`: `{ "model": "", "make": "", "src": { "kind": "controller", "supplierId": "", "n": 3001, "line": "" } }`.
3. Do not change `rank`, `engine`, `alternator`, `genset` or `suppliers`.
4. Run `<check>` once; fix what it prints and run it again only if you changed something.

Example check:
```json
{ "item": "Công suất liên tục", "requirement": "≥ 250 kVA prime", "hsmtQuote": "...", "offered": "200 kW / 0,8 = 250 kVA (prime)",
  "sourceQuote": "| W-1 | 312.5 | 250 | 275 | 220 |", "part": "genset", "status": "met", "note": "",
  "conversions": [{ "formula": "kva_from_kw", "inputs": [{ "name": "P_kW", "value": 200, "from": "source" }, { "name": "pf", "value": 0.8, "from": "hsmt" }], "value": 250 }] }
```
