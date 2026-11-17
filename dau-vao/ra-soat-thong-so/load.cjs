const fs = require("fs"), path = require("path");
module.exports = (REPO) => {
  const m = { exports: {} };
  new Function("module", fs.readFileSync(path.join(REPO, "web/catalog.js"), "utf8"))(m);
  const dir = path.join(REPO, "suppliers/cn");
  const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  return { C: m.exports, S };
};
