// CTL_WORDS (config-bot.mjs): the word boundaries of its regexes are real `\b`, not a backspace character (U+0008).
// Six of them were typed as the control character, so the branches for voltage lines (VL-L, CT), the LCD never matched.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC = fs.readFileSync(path.join(DIR, "config-bot.mjs"), "utf8");
// CTL_WORDS is not exported: its literal is read from the source and evaluated alone.
const WORDS = new Function(`return ${SRC.slice(SRC.indexOf("const CTL_WORDS = [") + "const CTL_WORDS = ".length, SRC.indexOf("\n];", SRC.indexOf("const CTL_WORDS")) + 3)}`)();
const BS = String.fromCharCode(8);
const wordOf = (vi) => WORDS.find(([re]) => re.test(vi));

test("no backspace character in the code of suppliers/ and web/", () => {
  const files = [
    ...fs.readdirSync(DIR).filter((f) => /\.(mjs|js)$/.test(f)).map((f) => path.join(DIR, f)),
    ...fs.readdirSync(path.join(DIR, "..", "web")).filter((f) => f.endsWith(".js")).map((f) => path.join(DIR, "..", "web", f)),
  ];
  assert.ok(files.length > 20);
  for (const f of files) assert.ok(!fs.readFileSync(f, "utf8").includes(BS), `${path.basename(f)} has U+0008`);
});

test("CTL_WORDS: the source regexes of every word hold no control character", () => {
  assert.ok(WORDS.length > 30);
  for (const [vi, en] of WORDS) for (const re of [vi, en]) assert.ok(!re.source.includes(BS), String(re));
});

test("điện áp: line-to-line / line-to-neutral labels of a datasheet", () => {
  const en = wordOf("Đo điện áp")[1];
  for (const line of ["Generator VL-L and VL-N measurement", "VLL 380 V", "Vph-ph", "Vph-n (Phase-Neutral)"]) assert.ok(en.test(line), line);
  assert.ok(en.test("Generator Voltage 0 - 15 kV"), "generator voltage still matches");
  // a letter before V, or after the label, is another word
  for (const line of ["DEVLL display", "KVLLX stage", "RSVL-L1"]) assert.ok(!en.test(line), line);
});

test("dòng điện: CT as a word", () => {
  const en = wordOf("Đo dòng điện")[1];
  for (const line of ["CT ratio 10:5000 A", "Current inputs from external CT", "Single CT, 5 A secondary"]) assert.ok(en.test(line), line);
  for (const line of ["Factory settings", "ACTION on alarm", "Contact output 8 A", "Protection (SECTION 4)"]) assert.ok(!en.test(line), line);
});

test("LCD / màn hình: LCD as a word", () => {
  const en = wordOf("màn hình LCD")[1];
  assert.ok(en.test("4-line LCD with backlight") && en.test("Backlit LCD, 128 x 64"));
  assert.ok(en.test("Graphic display 240 x 128") && en.test("display type: TFT"), "other forms of the branch still match");
  for (const line of ["SOLCDATA table", "ALCDE"]) assert.ok(!en.test(line), line);
});

test("the Vietnamese side of the six branches reads an HSMT sentence", () => {
  assert.ok(wordOf("Hiển thị điện áp máy phát"));
  assert.ok(wordOf("Đo dòng điện ba pha"));
  assert.ok(wordOf("Màn hình LCD hiển thị tiếng Việt"));
});
