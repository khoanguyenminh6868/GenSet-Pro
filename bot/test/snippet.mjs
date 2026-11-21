// Runs a browser snippet of the bot kit (history-extract.js, bidders-extract.js, search-extract.js) in Node as
// genbid-sync.js snippet() runs it in the page: placeholders replaced, the leading "await (async" made an expression.
// The page is faked: document.querySelectorAll by selector, location, and a setTimeout that does not wait (the snippets
// poll up to 40 × 500 ms for the page's data).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const KIT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "genbid-hsmt");

// The root Vue component the snippets look for: an element with an id whose __vue__ is its own $root.
export function vueRoot(data, children = []) {
  const vm = { $data: data, $children: children };
  vm.$root = vm;
  return vm;
}

// page: { root, list: [elements for "*"], tables, ths, anchors, search, href }
export async function runSnippet(file, page = {}, repl = {}) {
  let code = fs.readFileSync(path.join(KIT, file), "utf8");
  for (const [k, v] of Object.entries(repl)) code = code.split(k).join(v);
  code = code.replace(/^[ \t]*\/\/@include\s+(\S+)[ \t]*$/gm, (_, f) => fs.readFileSync(path.join(KIT, f), "utf8")); // as genbid-sync.js snippet()
  code = code.replace(/^await\s+\(async/m, "(async");
  const ids = page.root ? [{ __vue__: page.root }] : [];
  const document = {
    querySelectorAll(sel) {
      if (sel === "[id]") return ids;
      if (sel === "*") return page.all || ids;
      if (sel === "table") return page.tables || [];
      if (sel === "th") return (page.tables || []).flatMap((t) => t.heads.map((h) => ({ innerText: h })));
      if (sel === "a") return page.anchors || [];
      return [];
    },
  };
  const location = { search: page.search || "", href: page.href || "https://muasamcong.mof.gov.vn/web/guest/contractor-selection" + (page.search || "") };
  const setTimeout = (f) => { page.ticks = (page.ticks || 0) + 1; if (page.onTick) page.onTick(page.ticks); return globalThis.setTimeout(f, 0); };
  const run = new Function("document", "location", "setTimeout", `return (\n${code}\n);`);
  return run(document, location, setTimeout);
}

// A table of goods as the page draws it (history-extract.js compares its column titles).
export const table = (heads) => ({ heads, querySelectorAll: () => heads.map((h) => ({ innerText: h })) });
