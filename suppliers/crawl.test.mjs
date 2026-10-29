// node --test suppliers/*.test.mjs  — checks for reading spec tables off product pages (crawl-specs.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { htmlToText, tablesOf } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;

// As on cameopower.com: one cell per source line, cell text in <p>, a label over two lines, "&amp;le;".
const camel = `<table class="table">
	<tbody>
		<tr>
			<td>
			<p>Model</p>
			</td>
			<td>
			<p>SC-44YC</p>
			</td>
			<td>
			<p>SC-55YC</p>
			</td>
		</tr>
		<tr>
			<td>
			<p>Rate Power(kva)</p>
			<p>(prime/standby)</p>
			</td>
			<td><p>50/55</p></td>
			<td><p>63/69</p></td>
		</tr>
		<tr>
			<td><p>Engine Model</p></td>
			<td><p>YC4D60-D21</p></td>
			<td><p>YC4D80-D34</p></td>
		</tr>
		<tr>
			<td><p>Fuel consumption<br>(g/kw.h)</p></td>
			<td><p>&amp;le;205</p></td>
			<td><p>&amp;le;215</p></td>
		</tr>
	</tbody>
</table>
<div>Model: KP-YC22P
Prime Power (kW/kVA): 17.6/22</div>`;

test("html to text: a table row is one line, whatever the source line breaks and the tags inside cells", () => {
  const t = htmlToText(camel);
  assert.deepEqual(t.split("\n").slice(0, 4), [
    "| Model | SC-44YC | SC-55YC",
    "| Rate Power(kva) (prime/standby) | 50/55 | 63/69",
    "| Engine Model | YC4D60-D21 | YC4D80-D34",
    "| Fuel consumption (g/kw.h) | ≤205 | ≤215",
  ]);
  // Outside a table a source newline still breaks the line (sites that use white-space: pre-line).
  assert.deepEqual(t.split("\n").slice(4), ["Model: KP-YC22P", "Prime Power (kW/kVA): 17.6/22"]);
});

test("models across: every line of the table is kept, and the catalog reads engine and power of each model", () => {
  const tables = tablesOf(htmlToText(camel));
  assert.equal(tables.length, 1);
  assert.ok(tables[0].rows.includes("| Engine Model | YC4D60-D21 | YC4D80-D34"));
  const o = C.fromSupplier({ id: "t", role: "engine_maker", status: "partial", names: { en: "Test Power" }, specTables: [{ n: 101, title: "50kva Diesel Generator", ...tables[0] }] });
  const e = o.filter((x) => x.kind === "engine");
  assert.deepEqual(e.map((x) => [x.genset, x.model]), [["SC-44YC", "YC4D60-D21"], ["SC-55YC", "YC4D80-D34"]]);
  assert.deepEqual(e[0].power, { prime: { kVA: 50 }, standby: { kVA: 55 } });
});
