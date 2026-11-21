// Danh sách lượt cần chạy lại: có dòng mất mới, dòng thêm, hoặc đổi điểm mới / khác mức có −300.
import fs from "node:fs";
import path from "node:path";
const D = process.argv[2], J = JSON.parse(fs.readFileSync(path.join(D, "doi-chieu-2.json"), "utf8")), run = (k) => k.split("\t")[0], s = new Set();
J.newLost.forEach((k) => s.add(run(k))); J.add.forEach(([k]) => s.add(run(k))); J.chgNew.filter(([, d]) => d < 0).forEach(([k]) => s.add(run(k))); J.chgOther.filter(([, , d]) => d < 0).forEach(([k]) => s.add(run(k)));
fs.writeFileSync(path.join(D, "luot-2.json"), JSON.stringify([...s])); console.log("lượt cần chạy lại", s.size);
