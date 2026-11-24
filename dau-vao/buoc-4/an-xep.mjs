// Buoc 4 kiem ke, phan 1: xep nhan (labels.json) vao truong cua spec-fields.json bang tu dien regex tay.
// Chay: node an-xep.mjs  → truong-nhan.tsv (moi nhan x truong), truong-tong.tsv (tong theo truong), nhan-nhan-nham.tsv
import fs from "node:fs";
import path from "node:path";

const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
const FIELDS = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/spec-fields.json", "utf8"));
const labels = JSON.parse(fs.readFileSync(path.join(OUT, "labels.json"), "utf8"));

// gop theo nhan chuan hoa, tach bang (cn: row/col) va nguon (srcrow/srcline)
const L = new Map();
for (const e of labels) {
  let g = L.get(e.n);
  if (!g) { g = { n: e.n, raw: e.raw, sk: e.sk, tbl: { lines: 0, models: 0, nccs: new Set() }, src: { lines: 0, models: 0, nccs: new Set() }, ex: [] }; L.set(e.n, g); }
  const side = e.kind.startsWith("src") ? g.src : g.tbl;
  side.lines += e.lines; side.models += e.models; for (const c of e.nccs) side.nccs.add(c);
  for (const x of e.ex) if (g.ex.length < 8 && !g.ex.some((y) => y.ncc === x.ncc)) g.ex.push({ ...x, kind: e.kind });
}

// ---- tu dien: part.id → { re, not } tren nhan da chuan hoa (chu thuong) ----
const D = {
  "genset.series": { re: /(^|\b)(series|family|product series|range)\b|系列|dòng máy|serie\b/, not: /time|series\d|interval/ },
  "genset.brand": { re: /^(genset |generator |generating set |set |unit |product )?(brand|make|manufacturer|trademark|marque)$|^品牌$|^商标$|发电机组品牌|机组品牌|thương hiệu|nhãn hiệu/ },
  "genset.made_in": { re: /made in|country of (origin|manufact)|place of origin|origin|manufactured in|assembled in|产地|原产|制造地|生产地|nơi sản xuất|xuất xứ|herkunft|made-in/, not: /engine origin|origin of engine/ },
  "genset.genset_type": { re: /^(genset |generator( set)? |machine |product |unit )?(type|style|form|model type|structure|construction)$|canopy|enclosure|^housing|silent type|open type|机组类型|机组型式|机组形式|型式|结构型式|结构形式|外形结构|configuration$|trailer|^mobile|portable|container|cabinet type|ausführung|bauform/, not: /engine|alternator|fuel|cool|excit|start|governor|battery|phase|connection|aspirat|cylinder|insulation|protection/ },
  "genset.overload": { re: /overload|over-load|过载|überlast|sobrecarga|quá tải|10\s*%.*(1\s*h|hour)|110\s*%/ },
  "genset.load_step": { re: /(load|block)\s*(acceptance|step|pick-?\s*up|application|accept|impact)|sudden load|step load|one-?step|instantaneous.*load|加载|突加|一次加载|瞬态负载|aufschalt|nhận tải|cấp tải/ },
  "genset.iso8528_class": { re: /8528|performance class|class\s*g[1-4]|\bg[1-4]\b.*class|operating class|性能等级|性能类别|iso.*(class|level|grade)|leistungsklasse|cấp vận hành/ },
  "genset.ambient": { re: /ambient|altitude|elevation|环境温度|海拔|环境条件|operating (temp|environment|condition)|working (temp|condition|environment)|environmental|height above|nhiệt độ môi trường|độ cao|derat|umgebung|temperature range|适用环境|使用环境/ },
  "genset.breaker": { re: /breaker|mccb|acb\b|circuit protect|断路器|空开|空气开关|开关型号|áp.?tô.?mát|lasttrenn|main switch|output switch|输出开关/ },
  "genset.battery": { re: /batter|蓄电池|电瓶|起动电池|ắc quy|accu|starting battery|starter battery|电池/, not: /lithium energy|battery storage|ups\b/ },
  "genset.standards": { re: /\bstandards?\b|certif|conform|compl(y|iance)|^norm|^iso\b|\bce\b|符合|标准|认证|执行标准|execution standard|tiêu chuẩn|chứng nhận|normen|zertifi/, not: /emission|排放|noise|insulation|protection class|ip\d|number of|standby|prime/ },

  "engine.power_hp": { re: /\bhp\b|horse\s*-?\s*power|\bbhp\b|\bps\b|马力|\bcv\b|\bpk\b|mã lực|\bch\b|pferd|hp\s*\/|\/\s*hp|\(hp\)/ },
  "engine.genset_power": { re: /(genset|generator|electric(al)?|alternator|gen-?set)\s*(set\s*)?(rated\s*)?(power|output|rating)|kwe\b|kva.*engine|engine.*kva|power\s*\(kva\)|电功率|发电功率|输出功率\(kva\)|kva\/kw|kw\/kva/ },
  "engine.fuel_system": { re: /fuel\s*(injection|system|inject)|injection\s*(system|type|pump|method|mode|timing|pressure)|injector|喷油|燃油系统|供油|燃油喷射|喷射|common\s*rail|einspritz|phun nhiên liệu|hệ thống nhiên liệu|^fuel\s*type$.*pump/, not: /consum|油耗|tank|oil|capacity/ },
  "engine.electrical_vdc": { re: /(electrical|starting|starter|battery|dc|charging|engine|system)\s*(system\s*)?voltage|voltage\s*(of\s*)?(starting|starter|battery|dc|system)|电气系统|起动电压|启动电压|启动系统|起动系统|电压\s*\(vdc\)|vdc|v\s*dc|dc\s*v|24\s*v\b|12\s*v\b|điện áp (khởi động|hệ thống)/, not: /alternator|output|rated voltage|line|phase|regul/ },
  "engine.engine_type": { re: /engine\s*type|^type$|thermodynamic|\bcycle\b|4\s*-?\s*stroke|four\s*-?\s*stroke|冲程|机型|发动机类型|柴油机型式|kiểu động cơ|motortyp|stroke\s*type|combustion\s*(system|type)|burning|燃烧室|燃烧方式|combustion chamber|direct injection|direct-injection|^type of engine|diesel\s*engine$/, not: /fuel|oil|capacity/ },
  "engine.charge_cooling": { re: /after\s*-?cool|charge\s*(air)?\s*cool|inter\s*-?cool|charge\s*air|增压空气|中冷|空空|空水|sca\b|laf\b|ladeluft/ },
  "engine.cooling": { re: /cooling\s*(system|type|method|mode)|冷却方式|冷却系统|^cooling$|làm mát|kühlung|water.?cooled|radiator/ },
  "engine.starting": { re: /^start|starting|起动|启动|khởi động|anlass/, not: /voltage|电压|batter|电池/ },
  "engine.coolant_capacity": { re: /coolant|cooling\s*water|water\s*(tank|capacity|volume)|冷却液|冷却水|nước làm mát|kühlmittel/, not: /temp|温度|pressure|压力|flow/ },
  "engine.oil_capacity": { re: /oil\s*(capacity|volume|sump|system|tank|ststem)|lub.*(capacity|volume)|机油(量|容量|容积)|润滑油(量|容量)|dung tích dầu|ölmenge/, not: /consum|消耗|耗率|brand|temp|pressure/ },
  "engine.compression": { re: /compression|压缩比|tỉ số nén|verdichtung/ },
  "engine.aspiration": { re: /aspirat|intake|进气|吸气|nạp khí|air\s*intake|turbo|增压方式|增压/, not: /fuel|cool.*air/ },
  "engine.governor": { re: /governor|gov\b|调速|điều tốc|regler/ , not: /voltage|avr/ },
  "engine.emission": { re: /emission|排放|khí thải|abgas|tier\b|stage\b/ },
  "engine.speed": { re: /speed|\brpm\b|r\/min|转速|tốc độ|drehzahl/, not: /over\s*-?\s*speed|regul|torque|超速|wind|piston|average/ },

  "alternator.winding_pitch": { re: /winding\s*pitch|coil\s*pitch|\bpitch\b|节距|绕组节距|bước (quấn|bối)|wicklungs/ },
  "alternator.wires": { re: /(no\.?|number|qty)\s*(of)?\s*(wires|leads|terminals|ends)|\bwires\b|leads\s*(out|number)?$|出线|引出线|接线数|线头|^leads$|^terminals$|^ends$|dây ra|anzahl.*(leiter|anschl)/ },
  "alternator.altitude": { re: /altitude|elevation|海拔|höhe|độ cao|height above/ },
  "alternator.overspeed": { re: /over\s*-?\s*speed|超速|überdrehzahl|vượt tốc|runaway|max(imum)?\s*speed/ },
  "alternator.air_flow": { re: /air\s*flow|cooling\s*air|ventilation|air\s*volume|风量|冷却风|空气流量|luftmenge|lưu lượng gió|air\s*(requirement|consumption)|air\s*delivery/ },
  "alternator.short_circuit": { re: /short\s*-?\s*circuit|sustain|短路|kurzschluss|ngắn mạch|3\s*x\s*in\b|3in\b|overcurrent\s*cap|fault current/ },
  "alternator.avr": { re: /\bavr\b|automatic voltage|voltage regulator|调压器|自动电压|电压调节器|regulator\s*(type|model|brand)|spannungsregler|bộ điều áp|调压板|励磁调节器|电压调节/ },
  "alternator.thd_linear_load": { re: /thd.*(lin|load)|harmonic.*(load)|distortion.*load|谐波.*(负载|载)|(线性|带载).*谐波|total harmonic.*(load|lin)|thd\s*\(.*(non|lin)|on load/ , not: /^no.?load/ },
  "alternator.tif": { re: /\btif\b|telephone influence|电话干扰|电话影响|telephone\s*interf/ },
  "alternator.thf": { re: /\bthf\b|telephone harmonic|电话谐波|电话波形|\bthf\b|\btif\/thf/ },
  "alternator.poles": { re: /\bpoles?\b|极数|pole number|no\.? of poles|polzahl|số cực|^poles$|polos/ },
  "alternator.bearing": { re: /bearing|轴承|lager|ổ (đỡ|bi|trục)|rodamient/ },
  "alternator.type": { re: /(alternator|generator|machine|motor)\s*type|type of (alternator|generator)|brushless|self\s*-?\s*excit|无刷|有刷|电机类型|发电机类型|发电机型式|结构|alternator\s*(construction|design)|construction|design\b|bauart|kiểu đầu phát/, not: /voltage|regulat|insulation|cool|protection|engine|pitch/ },
  "alternator.cooling": { re: /\bic\s*0?\d{1,2}\b|alternator\s*cooling|cooling\s*(air|method|system|type)|冷却方式|冷却|ventilat|通风|làm mát đầu phát/, not: /engine|water|coolant|radiator|charge|after|inter/ },
  "alternator.standards": { re: /\bstandards?\b|conform|compl(y|iance)|^norm|\biec\b|\bnema\b|\bvde\b|\bbs\s*\d|符合|标准|认证|execution standard|tiêu chuẩn|normen|iso\s*8528|34-1/, not: /emission|排放|noise|ip\d|number of|standby|prime/ },
  "alternator.insulation": { re: /insulat|绝缘|cách điện|isolier/ },
  "alternator.ip": { re: /protection|\bip\s*\d|\bip\b|防护|bảo vệ cấp|schutzart/, not: /overload|short|over|earth|reverse|engine|controller|alarm|fault|low oil/ },
  "alternator.excitation": { re: /excit|\bavr\b|励磁|kích từ|erreg/ },
  "alternator.voltage_regulation": { re: /voltage\s*(regul|stab|stead|control|accur)|调压|稳压|điều chỉnh điện áp|spannungs.*(regel|konstanz)/, not: /time|时间/ },
  "alternator.thd_no_load": { re: /harmonic|\bthd\b|谐波|distortion|oberschw|^thd/ , not: /telephone|tif|thf/ },
  "alternator.efficiency": { re: /efficien|效率|hiệu suất|wirkungsgrad/, not: /fuel|thermal|overall|total|electrical|热效|综合/ },
  "genset.frequency": { re: /^frequency|^freq\b|频率|tần số|^hz$|frequenz/, not: /regul|wave|recover|stab|变化|调|response/ },
  "genset.freq_regulation": { re: /frequency\s*(regul|wav|recover|stab|control|variation|deviation|drift)|freq.*(regul|stab)|调频|稳频|频率(调整|稳定|波动|变化)|steady.?state\s*(freq|speed)|speed\s*(regulation|droop)|drift|调速率|stabil/ },
  "genset.power_factor": { re: /power\s*factor|(?<![a-z])cos\s*(φ|ø|phi|fi)?|功率因数|hệ số công suất|leistungsfaktor|p\.f\.?\b|\bpf\b/ },
  "genset.current": { re: /rated\s*current|电流|dòng điện|\bamps?\b|\(a\)|stromstärke|current\s*\(a\)/, not: /breaker|断路器|short|over|leakage|charg|starting|inrush|空开/ },
  "genset.voltage": { re: /^voltage|rated\s*voltage|电压|điện áp|spannung/, not: /dc|start|level|type|regul|stab|sudden|warp|dip|transient|drop|偏差|battery|control|auxiliary/ },
  "genset.phases": { re: /phase|wire|相数|số pha|phasen|\bphases\b/, not: /excit|pitch|sequence|rotation|regul/ },
  "genset.fuel": { re: /fuel\s*type|type of fuel|燃料类型|燃油类型|fuel\s*(used|grade)|nhiên liệu sử dụng|^fuel$|kraftstoff|diesel|gas\b|gasoline|lpg|biogas|natural gas|燃料/, not: /consum|tank|capacity|油耗|cost|system|injection|filter|pump|pressure|rate|油箱/ },
  "genset.tank": { re: /fuel\s*tank|fuel\s*capacity|tank\s*capacity|油箱|bình nhiên liệu|bồn|tankinhalt/, not: /run(ning)?\s*(time|hours?)/ },
  "genset.runtime": { re: /run(ning)?\s*(time|hours?)|continuous\s*(run|work)|autonomy|autonomie|续航|连续运行|运行时间|工作时间|thời gian chạy/ },
  "genset.weight": { re: /weigh|重量|毛重|khối lượng|trọng lượng|^kgs?\s*(\(|$)|gewicht/ },
  "genset.dimensions": { re: /dimen|overall\s*(size|l)|\bsize\b|l\s*[x×*]\s*w\s*[x×*]\s*h|尺寸|kích thước|abmessung|größe/, not: /engine\s*(size|dimen)|motor\s*(size|dimen)|发动机\s*尺寸/ },
  "genset.noise": { re: /noise|sound\s*(level|pressure|power)|噪音|噪声|độ ồn|\bdb\(?a?\)?\b|schall|lärm|\bdba\b/ },
  "genset.fuel_75": { re: /(75\s*%|3\/4)\s*(load|prime|prp|功率|负载|\(?\s*of)|@\s*75\s*%|75\s*%\s*(load|fuel|consum)/ },
  "genset.fuel_50": { re: /(50\s*%|1\/2)\s*(load|prime|prp|功率|负载|\(?\s*of)|@\s*50\s*%|50\s*%\s*(load|fuel|consum)/ },
  "genset.fuel_100": { re: /consum|cons\.|fuel\s*(rate|usage|efficien)|油耗|耗油|燃油消耗|tiêu hao|100\s*%\s*(load|prime|prp)|verbrauch|l\/h\b|\(l\/h\)|g\/kwh|g\/kw\.h/, not: /75\s*%|50\s*%|oil consum|机油|润滑油|oil/ },
};

const PARTS = ["genset", "engine", "alternator"];
const fieldInfo = {};
for (const p of PARTS) for (const f of FIELDS.parts[p]) fieldInfo[`${p}.${f.id}`] = { part: p, id: f.id, key: f.key || "", type: f.type };

const rows = []; // field, label rows
const tot = {};
for (const [fid, d] of Object.entries(D)) {
  const fi = fieldInfo[fid];
  if (!fi) { console.error("truong khong co:", fid); continue; }
  const T = (tot[fid] = { field: fid, key: fi.key, nLabels: 0, accepted: { lines: 0, models: 0, nccs: new Set(), srcLines: 0 }, missed: { lines: 0, models: 0, nccs: new Set(), srcLines: 0, nLabels: 0 }, other: { lines: 0, models: 0, nccs: new Set(), nLabels: 0 } });
  for (const g of L.values()) {
    if (!d.re.test(g.n) || (d.not && d.not.test(g.n))) continue;
    const total = g.tbl.lines + g.src.lines;
    if (total < 2) continue; // nhan chi gap mot lan: bo (nhieu tieng on)
    const status = g.sk === "" ? "chua-nhan" : g.sk === fi.key ? "da-nhan-dung" : "nhan-sang-khoa-khac";
    rows.push({ fid, status, sk: g.sk, g });
    T.nLabels++;
    const bucket = status === "da-nhan-dung" ? T.accepted : status === "chua-nhan" ? T.missed : T.other;
    bucket.lines += g.tbl.lines; bucket.models += g.tbl.models; for (const c of g.tbl.nccs) bucket.nccs.add(c);
    if ("srcLines" in bucket) bucket.srcLines += g.src.lines;
    for (const c of g.src.nccs) bucket.nccs.add(c);
    if (status !== "da-nhan-dung") bucket.nLabels++;
  }
}

const q = (s) => String(s).replace(/[\t\r\n]+/g, " ");
const t1 = ["truong\ttrang_thai\tspecKey_hien_tai\tnhan\tdong_bang\tmodel_o_bang\tncc_bang\tdong_nguon\tncc_nguon\tvi_du1\tvi_du2\tvi_du3"];
rows.sort((a, b) => a.fid.localeCompare(b.fid) || (b.g.tbl.models + b.g.src.lines) - (a.g.tbl.models + a.g.src.lines));
for (const r of rows) {
  const ex = r.g.ex.slice(0, 3).map((x) => q(`${x.ncc} #${x.src}: ${x.line}`));
  t1.push([r.fid, r.status, r.sk, q(r.g.n), r.g.tbl.lines, r.g.tbl.models, r.g.tbl.nccs.size, r.g.src.lines, r.g.src.nccs.size, ...ex, "", "", ""].slice(0, 12).join("\t"));
}
fs.writeFileSync(path.join(OUT, "truong-nhan.tsv"), t1.join("\n"));

const t2 = ["truong\tkey\tnhan_khop\tda_nhan_dong\tda_nhan_model_o\tda_nhan_ncc\tCHUA_nhan_nhan\tCHUA_nhan_dong_bang\tCHUA_nhan_model_o\tCHUA_nhan_dong_nguon\tCHUA_nhan_ncc\tnhan_sang_khoa_khac_nhan\tkhac_dong\tkhac_model_o"];
for (const T of Object.values(tot)) t2.push([T.field, T.key, T.nLabels, T.accepted.lines, T.accepted.models, T.accepted.nccs.size, T.missed.nLabels, T.missed.lines, T.missed.models, T.missed.srcLines, T.missed.nccs.size, T.other.nLabels, T.other.lines, T.other.models].join("\t"));
fs.writeFileSync(path.join(OUT, "truong-tong.tsv"), t2.join("\n"));
console.error(t2.join("\n"));
