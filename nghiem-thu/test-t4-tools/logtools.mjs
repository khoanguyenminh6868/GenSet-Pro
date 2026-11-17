import fs from "node:fs";
const [file, mode] = process.argv.slice(2);
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
const events = [];
for (const l of lines) { const i = l.indexOf("{"); if (i < 0) continue; try { events.push(JSON.parse(l.slice(i))); } catch {} }
const uses = [];
for (const e of events) for (const c of e.message?.content || []) if (c.type === "tool_use") uses.push(c);
if (mode === "list") for (const u of uses) console.log(u.name, JSON.stringify(u.input).slice(0, 220));
if (mode === "write") { const w = uses.filter((u) => u.name === "Write" && /result\.json$/.test(u.input.file_path)); console.log(w.length); fs.writeFileSync(process.argv[4], w.at(-1).input.content); }
