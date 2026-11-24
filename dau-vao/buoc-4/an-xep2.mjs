// Buoc 4 kiem ke, phan 1 (chat): xep nhan vao truong bang regex NEO DAU-CUOI tren nhan da bo ngoac / dau *.
// Doc labels.json (harvest.mjs). Chay: node an-xep2.mjs → truong-chat.tsv, truong-chat-tong.tsv
import fs from "node:fs";
import path from "node:path";

const OUT = "C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/buoc-4";
const FIELDS = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/spec-fields.json", "utf8"));
const labels = JSON.parse(fs.readFileSync(path.join(OUT, "labels.json"), "utf8"));

// nhan rut gon: bo ngoac, *, dau dau dong, so thu tu, dau hai cham
const squash = (n) => n.replace(/[(（\[【][^)）\]】]*[)）\]】]/g, " ").replace(/^[•●○▪\-–*\d.\s]+(?=[a-z\u3400-\u9fff])/i, "").replace(/[*:：]+/g, " ").replace(/\s+/g, " ").trim();

const S = {
  "genset.series": /^(series|product series|model series|range|product range|family|系列|产品系列|机组系列|系列名称|serie|reihe|dòng sản phẩm|dòng máy|series name|系列series)$/,
  "genset.brand": /^(brand|make|manufacturer|trade ?mark|品牌|机组品牌|商标|genset brand|generator brand|gen-?set make|generating set brand|thương hiệu|marke|hersteller|fabricante|marque|brand name|厂家|生产厂家|品牌brand)$/,
  "genset.made_in": /^(origin|country of origin|place of origin|made in|manufactured in|assembled in|产地|原产地|制造地|生产地|xuất xứ|nơi sản xuất|herkunft|made in country|origin of manufacture|country|original|manufacturing country|country of manufacture|brand origin|origin country)$/,
  "genset.genset_type": /^(type|genset type|generator type|generator set type|machine type|set type|unit type|型式|形式|机组类型|机组型式|机组形式|产品类型|结构形式|structure|construction|enclosure|enclosure type|canopy|housing|bauform|ausführung|product type|kiểu máy|loại máy)$/,
  "genset.overload": /^(overload|overload capability|overload capacity|overload ability|overload rating|过载能力|过载|allowed overload|overload real power|überlastfähigkeit|overload capacity time|khả năng quá tải)$/,
  "genset.load_step": /^(load acceptance|load acceptance ability|one-?step load acceptance|load step|step load|sudden load|sudden load acceptance|block load|transient load|单步加载|突加负载|一次加载|加载能力|load application|load acceptance capability|one step load|最大加载|突加载荷|load acceptance one-?step)$/,
  "genset.iso8528_class": /^(performance class|leistungsklasse|performance class acc iso-?8528\/?5?|iso ?8528(-5)? class|operating class|性能等级|性能类别|performance|iso8528 performance class|class|performance level|governing class)$/,
  "genset.ambient": /^(altitude|altitude requirements?|operating temperature|ambient temperature|ambient|ambient conditions?|operating conditions?|operating environment|working temperature|working environment|海拔|海拔要求|海拔高度|工作温度|环境温度|使用环境|operating altitude|maximum altitude|max altitude|temperature|humidity|relative humidity|高度|ambient humidity|ambient temp|temperature range|operating temperature range|umgebungstemperatur|nhiệt độ môi trường|độ cao|工作环境|使用环境温度)$/,
  "genset.breaker": /^(breaker|circuit breaker|mccb|main breaker|main circuit breaker|ac circuit breaker|breaker model|breaker type|output breaker|断路器|空开|空气开关|主断路器|circuit-breaker|output circuit breaker|breaker capacity|capacity of breaker|circuit breaker type|main line circuit breaker mccb|circuit breaker rating|mccb rating|输出断路器|áp-tô-mát|breaker rating)$/,
  "genset.battery": /^(battery|batteries|battery capacity|battery voltage|battery type|starting battery|starter battery|number of batteries|battery charger|蓄电池|电瓶|起动电池|启动电池|电池|battery size|battery charging alternator|ắc quy|accu|battery model|battery brand|battery charging|蓄电池容量|battery specification|battery spec)$/,
  "genset.standards": /^(standards?|certificat(e|ion)s?|compliance|conformity|conforms to|complies with|meets|specifications?|norm|norms|ce|标准|认证|执行标准|符合标准|tiêu chuẩn|normen|zertifizierung|approvals?|standard compliance|applicable standards?|generator standard|genset standard|production standard|certification standards?|execution standard|执行|产品标准)$/,

  "engine.power_hp": /^(hp|bhp|ps|power hp|engine hp|engine power hp|马力|horsepower|hp kw|kw hp|power kw hp|rated power hp|max power hp|cv|pk|power ps|ps hp|hp ps|engine output hp|mã lực|pferdestärke|max hp|rated hp|prime hp|standby hp|power \(hp\))$/,
  "engine.genset_power": /^(genset power|generator power|electrical power|electric power|power output kva|genset output|generator output|kwe|power kwe|electrical output|gen set power|genset rated power|电功率|发电功率|发电机功率|机组功率|genset rating|alternator power|alternator output)$/,
  "engine.fuel_system": /^(fuel injection system|fuel system|injection system|injection type|injection method|fuel injection|fuel supply system|fuel system type|injection pump|fuel pump|燃油系统|喷油方式|供油方式|燃油喷射|喷射系统|喷油泵|燃油喷射系统|fuel injection type|injection|common rail|einspritzsystem|fuel injection method|fuel injection pump|injection mode|fuel supply|供油系统|喷油系统|fuel injection equipment|injection timing|direct injection|phun nhiên liệu|hệ thống nhiên liệu)$/,
  "engine.electrical_vdc": /^(electrical system|electrical system voltage|starting system|starting system voltage|starter voltage|battery voltage|dc voltage|system voltage|dc system voltage|engine electrical system|electrical|电气系统|起动电压|启动电压|直流电压|起动系统电压|dc supply|starter|starter motor|starting voltage|starting method|start voltage|电气系统电压|启动系统|起动系统|启动方式|起动方式|electric starting|electrical start|dc electrical system|starting electrical system|charging voltage|vdc|dc|battery)$/,
  "engine.engine_type": /^(type|engine type|cycle|thermodynamic cycle|type of engine|机型|发动机型式|发动机类型|柴油机型式|型式|engine form|combustion system|combustion type|combustion chamber|burning system|燃烧室型式|燃烧方式|stroke|strokes|冲程|operating cycle|bauart|engine cycle|working cycle|kiểu động cơ|diesel engine|engine|motor type|structure|construction|形式|发动机形式|柴油机形式|engine configuration|combustion|combustion chamber type|combustion method|combustion process|engine design)$/,
  "engine.charge_cooling": /^(after-?cool(er|ing|ed)?|charge air cool(er|ing)|charge-air cooling|intercool(er|ing)|charge cooling|charge air|增压空气冷却|中冷|中冷方式|空空中冷|aftercooler|intercooled|charge air cooling system|charge air cooler|增压空气冷却方式|增压空气|air-to-air|air to air|空空|空水|ladeluftkühlung)$/,
  "engine.cooling": /^(cooling( system| method| type| mode)?|冷却方式|冷却系统|làm mát|kühlung|cooling type|water cooling|cooling circuit|冷却型式|冷却形式)$/,
  "engine.starting": /^(start|starting|starting system|starting method|起动方式|启动方式|起动|启动|起动系统|启动系统|khởi động|anlasser|starter|starter motor|start method|start system|starting type|start type)$/,
  "engine.coolant_capacity": /^(coolant|coolant capacity|cooling water|cooling water capacity|water capacity|water tank|water tank capacity|coolant volume|cooling system capacity|冷却液|冷却水|冷却液容量|冷却水容量|冷却液量|水容量|nước làm mát|kühlmittel|coolant system capacity|engine coolant capacity|coolant capacity incl radiator|radiator capacity|capacity of coolant|cooling water volume|总冷却水容量|radiator water capacity)$/,
  "engine.oil_capacity": /^(oil capacity|oil|lub oil capacity|lubricating oil capacity|lube oil capacity|oil sump capacity|oil volume|oil quantity|机油量|机油容量|机油容积|润滑油量|润滑油容量|oil system capacity|dung tích dầu|ölmenge|engine oil capacity|oil sump|oil pan capacity|oil tank|lubrication oil capacity|lube oil|lubrication system capacity|lubricating oil|总油量|sump capacity|oil system)$/,
  "engine.compression": /^(compression ratio|compression|压缩比|tỉ số nén|tỷ số nén|verdichtung|compression rate|ratio of compression|compression ratio to 1)$/,
  "engine.aspiration": /^(aspiration|air intake|intake|intake system|intake air|进气方式|进气|吸气方式|nạp khí|aspirated|air intake system|aspiration type|induction|air induction|turbo|turbocharger|turbocharged|增压方式|增压|进气型式|进气形式|air aspiration|aspiration method|air supply|charging|turbo charger)$/,
  "engine.governor": /^(governor|governing|governor type|governor system|governor model|调速|调速方式|调速器|điều tốc|regler|speed governor|governing system|governor class|governor control|speed governing|调速系统|调速器类型|调速形式|governor mode|engine governor|governing type)$/,
  "engine.emission": /^(emission|emissions|emission standard|emission level|emission standards|排放|排放标准|khí thải|abgas|emission compliance|exhaust emission|emission stage|emission regulation|emission certification|emission rating|排放等级|排放水平)$/,
  "engine.speed": /^(speed|engine speed|rated speed|rpm|r min|转速|额定转速|tốc độ|drehzahl|rated engine speed|speed rpm|operating speed|rated rpm|engine rpm)$/,
  "engine.displacement": /^(displacement|engine displacement|swept volume|displacement l|排量|dung tích xi lanh|hubraum|cylinder displacement|total displacement|piston displacement|capacity|engine capacity|volume|cylinder volume|swept|cubic capacity|气缸容积|工作容积)$/,
  "engine.cylinders": /^(cylinders?|no of cylinders|number of cylinders|cyl|cylinder number|cylinder|缸数|气缸数|气缸|số xi lanh|zylinder|cylinder arrangement|cylinder configuration|cylinders arrangement|number of cyl|no cylinders|cylinder layout|cylinder no)$/,
  "engine.bore_stroke": /^(bore|stroke|bore stroke|bore x stroke|bore and stroke|缸径|行程|缸径行程|缸径 行程|bohrung|hub|bore mm|stroke mm|cylinder bore|piston stroke|bore×stroke|bore\*stroke|cylinder diameter|cylinder bore stroke|缸径×行程|缸径x行程|bore \/ stroke|bore &stroke|bore and stroke mm)$/,

  "alternator.winding_pitch": /^(winding pitch|pitch|coil pitch|winding|绕组节距|节距|winding type|wicklung|bước quấn|winding pitch ratio|pitch factor|winding layout|winding connection|winding configuration|winding leads|绕组|绕组形式|绕组型式|winding construction|wicklungsschritt|windings)$/,
  "alternator.wires": /^(number of wires|no of wires|wires|no of leads|leads|terminals|number of leads|number of terminals|lead number|出线数|出线方式|引出线|引出线数|terminal|number of ends|ends|output terminals|leads out|no of terminals|出线|线头数|接线数|leads number|wire number|wires number|number of output leads|lead out|dây ra|number of leads out|出线端数|出线端子)$/,
  "alternator.altitude": /^(altitude|altitude requirements?|operating altitude|maximum altitude|max altitude|海拔|海拔高度|海拔要求|höhe|height above sea level|elevation|altitude above sea level|working altitude|installation altitude|altitude m|altitude up to|altitude without derating|altitude derating|altitude derate|max operating altitude)$/,
  "alternator.overspeed": /^(over ?speed|overspeed capacity|max(imum)? overspeed|过速|超速|超速能力|runaway speed|max speed|maximum speed|überdrehzahl|over-speed|overspeed rpm|over speed|overspeed capability|max over speed|maximum overspeed|overspeed 2 min|overspeed for 2 minutes|超速试验|permitted overspeed|vượt tốc|overspeed test|超速转速|max over-speed)$/,
  "alternator.air_flow": /^(air ?flow|cooling air|cooling air flow|ventilation|air volume|air flow rate|cooling air volume|风量|冷却风量|冷却空气|空气流量|luftmenge|air required|cooling air requirement|air flow requirement|cooling air required|air consumption|air delivery|air flow m3 s|air flow m3 min|ventilating air|ventilation air flow|alternator air flow|cooling flow|lưu lượng gió|空气量|冷却风|通风量|cooling airflow|cooling air quantity|airflow rate|airflow|air throughput)$/,
  "alternator.short_circuit": /^(short ?-?circuit|short circuit capacity|short circuit current|short circuit capability|short circuit ratio|short circuit sustain|sustained short circuit|sustained current|3 ?x ?in|短路电流|短路比|短路|持续短路|kurzschlussstrom|fault current|3 phase short circuit|short circuit sustained current|短路能力|sustained short circuit current|short-circuit ratio|short circuit cap|short circuit performance|sustained short-circuit|short circuit withstand|short circuit current capability|short circuit duration|short circuit time|短路持续|short circuit capacity 3 in|ngắn mạch)$/,
  "alternator.avr": /^(avr|avr type|avr model|avr brand|regulator|voltage regulator|automatic voltage regulator|调压器|调压板|励磁调节器|电压调节器|spannungsregler|avr system|regulator type|avr excitation|excitation system avr|automatic voltage regulation|regulator model|avr control|avr & excitation|avr\/excitation|自动电压调节器|电压调节|avr (default)|avr standard|voltage regulator type|avr option|avr brushless|bộ điều áp|automatic voltage control|voltage regulation device|regulator brand)$/,
  "alternator.thd_linear_load": /^(thd ?(on|with|at|under) ?(linear |non-?linear )?load|thd linear load|thd linear|thd load|thd on linear load|thd under load|total harmonic distortion (on|with|under|at) (linear )?load|线性负载谐波|谐波含量带载|thd non-?linear|thd \(linear\)|thd with load|thd on load|thd at full load|thd full load|带载谐波|带载thd|harmonic distortion on load|harmonic distortion load|distortion on load|thd linear loads?)$/,
  "alternator.tif": /^(tif|tif 1960|tif balanced|tif\/thf|thf\/tif|telephone influence factor|t i f|电话影响因数|电话干扰因数|tif value|tif and thf|telephone interference|telephone influence)$/,
  "alternator.thf": /^(thf|thf 1960|thf\/tif|tif\/thf|telephone harmonic factor|t h f|电话谐波因数|thf value|thf and tif|telephone harmonic|thf balanced|电话谐波波形因数|电话谐波因素|thf 1.5|thf < 2%|thf (balanced))$/,
  "alternator.poles": /^(poles?|number of poles|no of poles|pole number|pole|极数|polzahl|número de polos|poles number|nr of poles|poles no|pole count|no poles|poles qty|pole quantity|极对数|极数 poles|number of pole|poles (no)|số cực|pole pairs|polo|polos)$/,
  "alternator.bearing": /^(bearings?|bearing type|bearing model|bearing system|bearing arrangement|轴承|轴承型号|轴承类型|lager|number of bearings|bearing no|bearing de|bearing nde|bearing drive end|bearings de|bearing number|轴承数|轴承型式|轴承形式|bearing construction|bearing design|bearing config|bearing (de|nde)|drive end bearing|non-?drive end bearing|rodamientos|ổ bi|ổ đỡ|ổ trục|bearings type|single bearing|bearing single|double bearing|bearing double|bearing config.)$/,
  "alternator.type": /^(type|alternator type|generator type|type of alternator|machine type|alternator|结构|类型|型式|发电机型式|发电机类型|电机类型|construction|design|alternator construction|alternator design|brushless|self-?excited|bauart|alternator model|generator|形式|发电机形式|alternator version|generator construction|generator design|brushless alternator|brushless generator|type brushless|alternator type model|alternator tipo|kiểu đầu phát|generator model|alternator frame|frame|alternator series)$/,
  "alternator.cooling": /^(cooling|cooling method|cooling type|cooling system|ic ?0?\d+|冷却方式|冷却|冷却系统|ventilation|通风|air cooled|kühlung|ic code|ic class|cooling ic|cooling mode|cooling system ic|cooling air|冷却形式|冷却型式|cooling code|ventilation system|cooling arrangement|cooling method ic|cooling (ic\d+)|làm mát|air cooling|alternator cooling|self cooling|self-ventilated|ic 01|ic01|ic 0a1|ic0a1)$/,
  "alternator.standards": /^(standards?|conforms to|compliance|norm|iec|nema|vde|bs|标准|认证|执行标准|符合标准|iec 60034|standards compliance|specification|specifications|norms|standard compliance|alternator standard|generator standard|applicable standards|iec 60034 1|iec60034|nema mg1|bs 5000|vde 0530|gb 755|iec\/en 60034|iec en 60034|符合|执行|产品标准|conformity|certification|approvals|ce|iso 8528|iso8528|cumple con|đạt chuẩn|standards (iec)|iec standards|international standards|ul|csa|ul csa)$/,
  "alternator.insulation": /^(insulation( class| system| grade| level)?|绝缘等级|绝缘|绝缘等级insulation|绝缘系统|cách điện|isolierung|isolationsklasse|insulation class (h|f)|class of insulation|insulation type|insulation material|绝缘形式|insulation classification|insulation rating|绝缘级别|isolation|isolation class)$/,
  "alternator.ip": /^(protection|ip|ip rating|ip class|protection class|protection degree|protection grade|ip protection|degree of protection|防护等级|防护|schutzart|cấp bảo vệ|protection level|ip code|ip grade|enclosure protection|ingress protection|ip degree|防护等级ip|ip protection class|ip protection degree|protection rating|enclosure)$/,
  "alternator.excitation": /^(excitation|excitation system|exciter|exciter type|excitation type|excitation mode|excitation method|励磁|励磁方式|励磁系统|励磁类型|kích từ|erregung|erregersystem|excitation (system|type)|self excitation|self-excited|brushless excitation|励磁形式|excitation form|exciter system|exciting|excitation winding|excitation power|pmg|brushless)$/,
  "alternator.voltage_regulation": /^(voltage regulation|voltage regulation steady state|voltage stability|steady state voltage regulation|voltage control|voltage accuracy|调压|调压率|稳态电压调整率|稳压|稳态调压|điều chỉnh điện áp|spannungskonstanz|voltage regulation (steady)|steady-state voltage regulation|steady voltage regulation|voltage regulation accuracy|regulation|voltage regulation (static)|voltage regulation static|stationary voltage regulation|static voltage regulation|static regulation|stabilized voltage regulation|电压调整率|稳态电压偏差|steady state voltage deviation|voltage deviation|steady voltage deviation|voltage regulation with avr|voltage regulation avr|regulation avr|voltage regulation (avr)|regulation with avr|voltage regulation under avr)$/,
  "alternator.thd_no_load": /^(thd|thd no load|thd no-load|thd at no load|total harmonic distortion|harmonic distortion|thd (no load)|谐波|谐波含量|谐波畸变|thd value|thd (%)|thd %|oberschwingungsgehalt|波形畸变率|波形畸变|电压波形畸变率|waveform distortion|distortion|thd open circuit|thd (open circuit)|harmonic content|total harmonic|total harmonic content|thd on no load|thd unloaded|distorsion armonica|harmonic|wave form distortion)$/,

  "genset.frequency": /^(frequency|freq|频率|tần số|hz|frequenz|rated frequency|operating frequency|额定频率|frequency range|output frequency|frequency ?\/ ?(rpm|speed))$/,
  "genset.freq_regulation": /^(frequency (regulation|stability|control|deviation|drift|variation|fluctuation|recovery|accuracy|band)|(steady[- ]state|steady|stable) frequency( band)?|(static|steady[- ]state) frequency regulation|调频|稳频|频率(调整|稳定|波动|变化|恢复)|稳态频率|稳态频率带|freq (regulation|stability)|speed (regulation|droop|drift|stability)|steady[- ]state speed|transient frequency)$/,
  "genset.power_factor": /^(power factor|cos ?(φ|phi|fi|ø)|功率因数|hệ số công suất|leistungsfaktor|p.?f.?|pf|rated power factor|lagging power factor|power factor (cos ?φ|cos|lagging))$/,
  "genset.current": /^(rated current|current|电流|dòng điện|amps?|a|stromstärke|额定电流|rated amps|full load (current|amps)|ampere|rated amperes|amperage|rated output current|dòng điện định mức|flc|current rating)$/,
  "genset.voltage": /^(voltage|rated voltage|电压|điện áp|spannung|额定电压|output voltage|rated output voltage|voltage options?|voltage range|available voltages?|voltages|tension|line voltage|generator voltage|voltage (l-?l|line to line|line-to-line)|v)$/,
  "genset.phases": /^(phases?|number of phases|no of phases|相数|số pha|phasen|(phase|phases) ?(\/|and|&|-) ?(wires?|connection|config)|phase wire|ph|no phases|phase number|fase|phase config(uration)?|1ph|3ph|three phase|single phase)$/,
  "genset.fuel": /^(fuel|fuel type|type of fuel|燃料类型|燃油类型|fuel used|fuel grade|nhiên liệu sử dụng|nhiên liệu|kraftstoff|燃料|燃油|fuel source|energy source|kind of fuel|combustible|carburant|treibstoff|gas type|fuel gas)$/,
  "genset.tank": /^(fuel tank( capacity| volume| size| cap)?|tank( capacity| volume| size)?|油箱|油箱容量|油箱容积|bình nhiên liệu|bồn|tankinhalt|fuel capacity|(base|integral|day|daily|sub-?base) tank( capacity)?|fuel storage|capacity of fuel tank|tankvolumen|thể tích bình)$/,
  "genset.weight": /^(weights?|重量|毛重|整机重量|净重|机组重量|khối lượng|trọng lượng|kgs?|gewicht|(dry|wet|net|gross|total|operating|shipping|machine|set|unit|open|silent|canopy)( type)? weight( kgs?)?|weight (dry|wet|net|open|silent|canopy|with canopy|in kgs?|open type|silent type)|weight kgs?)$/,
  "genset.dimensions": /^(dimensions?|dimension l ?[x×*] ?w ?[x×*] ?h|dimensions l ?[x×*] ?w ?[x×*] ?h|overall dimensions?|overall size|size|l ?[x×*] ?w ?[x×*] ?h|尺寸|外形尺寸|机组尺寸|整机尺寸|长宽高|kích thước|abmessungen?|größe|(dimensions?|size) (mm|open|silent|lxwxh|l x w x h)|(open|silent)( type)? dimensions?)$/,
  "genset.noise": /^(noise|noise level|sound level|sound pressure|sound pressure level|sound power|噪音|噪声|độ ồn|db|dba|schalldruck|lärm|(noise|sound)( level)?( at| @)? ?[17] ?m|(canopy|silent)( type)? noise( level)?|noise( level)? (silent|canopy)( type)?|noise (db|dba)|sound (db|dba))$/,
  "genset.runtime": /^(run(ning)? (time|hours?)|continuous (run|work)(ing)?( time| hours)?|continuous operation|autonomy|autonomie|续航|连续运行|运行时间|工作时间|续航时间|连续工作时间|thời gian chạy|runtime|(fuel )?tank running time|operating (time|hours)|working time|hours|autonomy (hours?|hr|h)|full load autonomy)$/,
};

// vai cua tu dien: bang co phan nao la chu yeu (de bao cao)
const FI = {};
for (const p of ["genset", "engine", "alternator", "controller"]) for (const f of FIELDS.parts[p]) FI[`${p}.${f.id}`] = f;

const byLabel = new Map();
for (const e of labels) {
  const [kind, part] = e.kind.split(":");
  const n2 = squash(e.n);
  if (!n2 || n2.length > 48) continue;
  let g = byLabel.get(n2);
  if (!g) { g = { n2, forms: new Map(), sk: new Set(), tbl: { lines: 0, models: 0, nccs: new Set(), byPart: { alt: 0, eng: 0, gen: 0 } }, src: { lines: 0, nccs: new Set() }, ex: [] }; byLabel.set(n2, g); }
  g.forms.set(e.n, (g.forms.get(e.n) || 0) + e.lines);
  if (e.sk) g.sk.add(e.sk);
  if (kind.startsWith("src")) { g.src.lines += e.lines; for (const c of e.nccs) g.src.nccs.add(c); }
  else { g.tbl.lines += e.lines; g.tbl.models += e.models; for (const c of e.nccs) g.tbl.nccs.add(c); g.tbl.byPart[part] += e.lines; }
  for (const x of e.ex) if (g.ex.length < 8 && !g.ex.some((y) => y.ncc === x.ncc)) g.ex.push({ ...x, kind: e.kind });
}

const rows = [], tot = {};
const q = (s) => String(s).replace(/[\t\r\n]+/g, " ");
for (const [fid, re] of Object.entries(S)) {
  const fi = FI[fid];
  if (!fi) { console.error("khong co truong", fid); continue; }
  const T = (tot[fid] = { fid, key: fi.key || "", ok: { labels: 0, lines: 0, models: 0, nccs: new Set(), src: 0, srcN: new Set() }, miss: { labels: 0, lines: 0, models: 0, nccs: new Set(), src: 0, srcN: new Set() }, wrong: { labels: 0, lines: 0, models: 0, nccs: new Set(), src: 0, srcN: new Set() } });
  for (const g of byLabel.values()) {
    if (!re.test(g.n2)) continue;
    // nhan do specKey: dung khi MOI dang viet cua nhan deu ra key cua truong; "" = khong nhan; con lai = nhan sang khoa khac
    const sks = [...g.sk];
    const status = !sks.length ? "chua-nhan" : sks.every((k) => k === fi.key) ? "da-nhan-dung" : "nhan-sang-khoa-khac";
    const B = status === "da-nhan-dung" ? T.ok : status === "chua-nhan" ? T.miss : T.wrong;
    B.labels++; B.lines += g.tbl.lines; B.models += g.tbl.models; for (const c of g.tbl.nccs) B.nccs.add(c); B.src += g.src.lines; for (const c of g.src.nccs) B.srcN.add(c);
    rows.push({ fid, status, g, sks });
  }
}
rows.sort((a, b) => a.fid.localeCompare(b.fid) || (b.g.tbl.models + b.g.src.lines) - (a.g.tbl.models + a.g.src.lines));
const t1 = ["truong\ttrang_thai\tspecKey\tnhan\tdang_viet_phu_bien_nhat\tdong_bang\tmodel_o_bang\tncc_bang\tdong_alt\tdong_eng\tdong_gen\tdong_nguon\tncc_nguon\tvi_du_1\tvi_du_2\tvi_du_3"];
for (const r of rows) {
  const g = r.g, top = [...g.forms.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const ex = g.ex.slice(0, 3).map((x) => q(`${x.ncc} #${x.src} (${x.kind}): ${x.line}`));
  t1.push([r.fid, r.status, r.sks.join(","), g.n2, top, g.tbl.lines, g.tbl.models, g.tbl.nccs.size, g.tbl.byPart.alt, g.tbl.byPart.eng, g.tbl.byPart.gen, g.src.lines, g.src.nccs.size, ex[0] || "", ex[1] || "", ex[2] || ""].join("\t"));
}
fs.writeFileSync(path.join(OUT, "truong-chat.tsv"), t1.join("\n"));
const t2 = ["truong\tkey\tOK_nhan\tOK_dong\tOK_model_o\tOK_ncc\tCHUA_nhan\tCHUA_dong\tCHUA_model_o\tCHUA_ncc\tCHUA_dong_nguon\tCHUA_ncc_nguon\tKHAC_nhan\tKHAC_dong\tKHAC_model_o"];
for (const T of Object.values(tot)) {
  const nccU = new Set([...T.miss.nccs, ...T.miss.srcN]);
  t2.push([T.fid, T.key, T.ok.labels, T.ok.lines, T.ok.models, T.ok.nccs.size, T.miss.labels, T.miss.lines, T.miss.models, nccU.size, T.miss.src, T.miss.srcN.size, T.wrong.labels, T.wrong.lines, T.wrong.models].join("\t"));
}
fs.writeFileSync(path.join(OUT, "truong-chat-tong.tsv"), t2.join("\n"));
console.log(t2.join("\n"));
