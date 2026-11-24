// Buoc 4 kiem ke, phan 2b: nhan thong so THAT (khong phai model / gia tri) pho bien ma bo truong KHONG co. Dem tren labels.json.
// Chay: node nhan-khong-co-truong.mjs → nhan-khong-co-truong.tsv
import fs from "node:fs";
import path from "node:path";
const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
const labels = JSON.parse(fs.readFileSync(path.join(OUT, "labels.json"), "utf8"));
const squash = (n) => n.replace(/[(（\[【][^)）\]】]*[)）\]】]/g, " ").replace(/[*:：]+/g, " ").replace(/\s+/g, " ").trim();
const C = [
  ["moment of inertia / inertia", /^(moment of inertia|inertia|转动惯量|rotor inertia|wk2|j\b)/],
  ["temperature rise", /temperature rise|温升|temp\.? rise/],
  ["coupling", /^(coupling|联轴器|coupling type|flywheel coupling|coupling arrangement)$/],
  ["exhaust gas flow / temperature", /exhaust (gas )?(flow|temp)|排气(量|温度)|exhaust gas/],
  ["exhaust system / back pressure", /exhaust (system|back ?pressure)|排气背压|back ?pressure/],
  ["oil consumption", /oil consumption|机油消耗|润滑油消耗|lube oil consumption/],
  ["heat rejection / radiated heat", /heat (rejection|radiat|to)|散热|radiated heat/],
  ["combustion air / intake air flow", /combustion air|intake air|air consumption|进气量|engine air flow/],
  ["flywheel / SAE housing", /flywheel|sae|飞轮|bell ?housing/],
  ["torque", /^(torque|扭矩|max torque|peak torque)/],
  ["mean piston speed", /piston speed|活塞平均速度/],
  ["bmep", /bmep|平均有效压力/],
  ["warranty", /warranty|质保|保修/],
  ["connection (star/delta)", /^(connection|connection type|winding connection|接线方式|connections?)$/],
  ["waveform / voltage distortion (thd)", /waveform|波形畸变|distortion/],
  ["efficiency alt", /^(efficiency|效率|alternator efficiency|generator efficiency)$/],
  ["rotor / stator type", /stator|rotor|定子|转子/],
  ["rated speed alt", /^(speed|rpm|转速)$/],
  ["fuel tank autonomy duration", /autonomy|续航/],
  ["engine weight", /engine weight|dry weight|发动机重量|wet weight/],
  ["thermal efficiency / electrical efficiency", /thermal efficiency|electrical efficiency|热效率|发电效率/],
  ["lubrication system / oil pressure", /oil pressure|机油压力|lubrication/],
  ["firing order", /firing order|发火顺序|点火顺序/],
  ["rotation / direction", /rotation|旋转方向|direction of rotation/],
];
const t = ["nhom\tdong_bang\tncc_bang\tdong_nguon\tncc_nguon\tnhan_mau_thuong_gap"];
for (const [name, re] of C) {
  let tb = 0, sr = 0; const nb = new Set(), ns = new Set(), forms = new Map();
  for (const e of labels) {
    const n2 = squash(e.n);
    if (n2.length > 48 || !re.test(n2)) continue;
    if (e.kind.startsWith("src")) { sr += e.lines; for (const c of e.nccs) ns.add(c); } else { tb += e.lines; for (const c of e.nccs) nb.add(c); }
    forms.set(n2, (forms.get(n2) || 0) + e.lines);
  }
  const top = [...forms.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k}(${v})`).join("; ");
  t.push([name, tb, nb.size, sr, ns.size, top].join("\t"));
}
fs.writeFileSync(path.join(OUT, "nhan-khong-co-truong.tsv"), t.join("\n"));
console.log(t.join("\n"));
