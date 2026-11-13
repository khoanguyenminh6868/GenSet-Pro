// Bộ mã yêu cầu của Gợi ý cấu hình (Khoa, 2026-11-06). Before this the agent named each requirement in its own words, so
// one tender got 12 requirements and the next 46, the same point was "Số pha" in one run and "Điện áp, số pha, tần số" in
// another, and nothing could tell which requirements a run had missed. Now every requirement carries a `code` from this
// list: the code fixes its name (`item`), its part and its level; the agent only writes what the HSMT asks (`requirement`)
// and its quote. A requirement that fits no code keeps `code: "other"` and the agent's own item name.
// `words` finds the code in a free text: an item the agent or the analysis wrote, or a line of the HSMT (missingCodes).
// Used by config-bot.mjs (prep writes the list into input.md, check normalizes by it) and shared with nothing on the web:
// the web shows `item` as before.
const R = (code, item, part, level, words, extra = {}) => ({ code, item, part, level, words, ...extra });
export const REQ_CODES = [
  // ---- genset: core ----
  R("power_prime", "Công suất liên tục", "genset", "core", /(?<!(t[ạa]i|[ởo]|theo|[ứu]ng\s*v[ớo]i)\s)c[ôo]ng\s*su[ấa]t.{0,30}(li[êe]n\s*t[ụu]c|prime|\bPRP\b|c[ơo]\s*b[ảa]n|th[ưư][ờo]ng\s*xuy[êe]n)|(prime|\bPRP\b).{0,20}(power|c[ôo]ng\s*su[ấa]t)/i),
  R("power_standby", "Công suất dự phòng", "genset", "core", /(?<!(t[ạa]i|[ởo]|theo|[ứu]ng\s*v[ớo]i)\s)c[ôo]ng\s*su[ấa]t.{0,30}(d[ựu]\s*ph[òo]ng|standby|\bESP\b)|(standby|\bESP\b).{0,20}(power|c[ôo]ng\s*su[ấa]t)/i),
  R("fuel_consumption_75", "Tiêu hao nhiên liệu 75% tải", "genset", "core", /ti[êe]u\s*(hao|th[ụu]).{0,50}75\s*%|75\s*%.{0,40}ti[êe]u\s*(hao|th[ụu])/i),
  R("fuel_consumption_50", "Tiêu hao nhiên liệu 50% tải", "genset", "core", /ti[êe]u\s*(hao|th[ụu]).{0,50}50\s*%|50\s*%.{0,40}ti[êe]u\s*(hao|th[ụu])/i),
  R("fuel_consumption", "Tiêu hao nhiên liệu 100% tải", "genset", "core", /ti[êe]u\s*(hao|th[ụu])\s*(nhi[êe]n\s*li[ệe]u|d[ầa]u)|fuel\s*consumption|\bL\s*\/\s*h\b|l[íi]t\s*\/\s*gi[ờo]/i),
  R("overload", "Khả năng quá tải", "genset", "core", /qu[áa]\s*t[ảa]i\s*(10|110)|110\s*%|overload\s*(capacity|capability)|kh[ảa]\s*n[ăa]ng\s*qu[áa]\s*t[ảa]i/i),
  R("load_step", "Nhận tải một bước", "genset", "core", /nh[ậa]n\s*t[ảa]i|load\s*(step|acceptance)|100\s*%\s*t[ảa]i\s*(trong|m[ộo]t|1)\s*(b[ưư][ớo]c|l[ầa]n)/i),
  R("iso8528_class", "Cấp vận hành ISO 8528-5 (G2/G3)", "genset", "core", /ISO\s*8528|c[ấa]p\s*(v[ậa]n\s*h[àa]nh|hi[ệe]u\s*su[ấa]t|ch[ấa]t\s*l[ưư][ợo]ng\s*đi[ệe]n)|class\s*G\s?[1-4]|\bG[1-4]\s*(class|theo)/i),
  R("standards", "Tiêu chuẩn, chứng nhận tổ máy (ISO 3046, IEC 60034, CE, ISO 9001)", "genset", "core", /ISO\s*(3046|9001|14001|45001)|IEC\s*60034|\bCE\b|ti[êe]u\s*chu[ẩa]n\s*(ch[ấa]t\s*l[ưư][ợo]ng|s[ảa]n\s*xu[ấa]t|qu[ốo]c\s*t[ếe]|[áa]p\s*d[ụu]ng)|ch[ứu]ng\s*(nh[ậa]n|ch[ỉi])\s*(ISO|CE|ch[ấa]t)/i),
  R("prototype", "Thử nghiệm mẫu (prototype test)", "genset", "core", /prototype|type\s*test|th[ửu]\s*nghi[ệe]m\s*(m[ẫa]u|đi[ểe]n\s*h[ìi]nh)/i),
  R("genset_make", "Hãng sản xuất tổ máy", "genset", "core", /(h[ãa]ng|nh[àa]\s*s[ảa]n\s*xu[ấa]t|th[ưư][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u)\s*(s[ảa]n\s*xu[ấa]t\s*)?(c[ủu]a\s*)?(t[ổo]\s*m[áa]y|m[áa]y\s*ph[áa]t)|(t[ổo]\s*m[áa]y|m[áa]y\s*ph[áa]t)[^\n]{0,30}(h[ãa]ng|th[ưư][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u)\s*(s[ảa]n\s*xu[ấa]t)?\s*:/i),
  R("genset_model", "Model tổ máy", "genset", "core", /(model|m[ãa]\s*hi[ệe]u|ki[ểe]u\s*lo[ạa]i)\s*(c[ủu]a\s*)?(t[ổo]\s*m[áa]y|m[áa]y\s*ph[áa]t)|(t[ổo]\s*m[áa]y|m[áa]y\s*ph[áa]t)[^\n]{0,20}\bmodel\b/i),
  R("genset_origin", "Xuất xứ tổ máy", "genset", "core", /(xu[ấa]t\s*x[ứu]|n[ơo]i\s*s[ảa]n\s*xu[ấa]t)[^\n]{0,25}(t[ổo]\s*m[áa]y|m[áa]y\s*ph[áa]t)|(t[ổo]\s*m[áa]y|m[áa]y\s*ph[áa]t)[^\n]{0,40}xu[ấa]t\s*x[ứu]|nguy[êe]n\s*chi[ếe]c|nh[ậa]p\s*kh[ẩa]u\s*(đ[ồo]ng\s*b[ộo]|nguy[êe]n|100)/i),
  R("brand_sync", "Đồng bộ thương hiệu", "genset", "core", /đ[ồo]ng\s*b[ộo]\s*(0?\d|hai|ba|th[ưư][ơo]ng\s*hi[ệe]u|c[ùu]ng|b[ởo]i|t[ừu]|ch[íi]nh)|c[ùu]ng\s*(m[ộo]t\s*)?(h[ãa]ng|th[ưư][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u|nh[àa]\s*s[ảa]n\s*xu[ấa]t)/i, { byCode: true }),
  R("alt_vreg", "Ổn định điện áp", "alternator", "core", /([ổo]n\s*đ[ịi]nh|bi[ếe]n\s*thi[êe]n|dao\s*đ[ộo]ng|sai\s*s[ốo]|đ[ộo]\s*ch[íi]nh\s*x[áa]c|đ[ộo]\s*đi[ềe]u\s*ch[ỉi]nh)\s*(c[ủu]a\s*)?đi[ệe]n\s*[áa]p|voltage\s*(regulation|variation|stability|accuracy)|±\s*0[.,]?\d*\s*%/i),
  R("freq_regulation", "Ổn định tần số", "genset", "core", /([ổo]n\s*đ[ịi]nh|bi[ếe]n\s*thi[êe]n|dao\s*đ[ộo]ng|sai\s*s[ốo]|đ[ộo]\s*ch[íi]nh\s*x[áa]c)\s*t[ầa]n\s*s[ốo]|frequency\s*(regulation|variation|stability)/i),
  // Not "(bộ) điều chỉnh điện áp" (the AVR, alt_avr): 352 of 355 such lines of the analyses read as the set's voltage (2026-11-13).
  R("voltage", "Điện áp", "genset", "core", /(?<!đi[ềe]u\s*ch[ỉi]nh\s*)đi[ệe]n\s*[áa]p(?![^\n]{0,20}([ắa]c\s*quy|đ[ềe]|kh[ởo]i\s*đ[ộo]ng|\bDC\b|đi[ềe]u\s*khi[ểe]n|m[ộo]t\s*chi[ềe]u))|\b(380|400|415)\s*\/\s*(220|230|240)\s*V/i),
  R("frequency", "Tần số", "genset", "core", /t[ầa]n\s*s[ốo](?![^\n]{0,20}(bi[ếe]n\s*thi[êe]n|[ổo]n\s*đ[ịi]nh|sai\s*s[ốo]|dao\s*đ[ộo]ng))|\b50\s*Hz/i),
  R("phases", "Số pha", "genset", "core", /s[ốo]\s*pha|\b3\s*pha|ba\s*pha|(^|[^\d])1\s*pha|m[ộo]t\s*pha|3\s*-?\s*phase|single\s*-?\s*phase/i),
  R("current", "Dòng điện định mức", "genset", "core", /d[òo]ng\s*đi[ệe]n\s*(đ[ịi]nh\s*m[ứu]c|danh\s*đ[ịi]nh|đ[ầa]u\s*ra|\(?\s*A\s*\))|rated\s*current|\bIn\s*[=:≥]/i),
  R("power_factor", "Hệ số công suất", "genset", "core", /h[ệe]\s*s[ốo]\s*c[ôo]ng\s*su[ấa]t|cos\s*[φϕø]|cos\s*phi|power\s*factor|\bPF\s*=?\s*0/i),
  R("ambient", "Nhiệt độ môi trường làm việc", "genset", "core", /nhi[ệe]t\s*đ[ộo]\s*(m[ôo]i\s*tr[ưư][ờo]ng|l[àa]m\s*vi[ệe]c|v[ậa]n\s*h[àa]nh)|ambient|đ[ộo]\s*cao\s*(l[ắa]p|so\s*v[ớo]i)|altitude/i),
  R("fuel", "Nhiên liệu", "genset", "core", /^(nhi[êe]n\s*li[ệe]u|lo[ạa]i\s*nhi[êe]n\s*li[ệe]u|fuel\s*type)|nhi[êe]n\s*li[ệe]u\s*(s[ửu]\s*d[ụu]ng|dùng)\s*:/i),
  // ---- genset: option ----
  R("fuel_tank", "Bồn nhiên liệu", "genset", "option", /(b[ồo]n|b[ìi]nh|th[ùu]ng|k[ée]t)\s*(ch[ứu]a\s*)?(d[ầa]u|nhi[êe]n\s*li[ệe]u)|fuel\s*tank|dung\s*t[íi]ch\s*(b[ồo]n|b[ìi]nh|th[ùu]ng)/i),
  R("noise", "Độ ồn", "genset", "option", /đ[ộo]\s*[ồo]n|dB\s*\(?A|\bdBA\b|noise/i),
  R("dimensions", "Kích thước", "genset", "option", /k[íi]ch\s*th[ưư][ớo]c|dimension|d[àa]i\s*x\s*r[ộo]ng/i),
  R("weight", "Khối lượng", "genset", "option", /kh[ốo]i\s*l[ưư][ợo]ng|tr[ọo]ng\s*l[ưư][ợo]ng|\bweight\b|t[ảa]i\s*tr[ọo]ng\s*(m[áa]y|t[ĩi]nh)/i),
  R("genset_type", "Loại tổ máy (trần / vỏ cách âm, cố định / di động)", "genset", "core", /lo[ạa]i\s*(t[ổo]\s*)?m[áa]y(?!\s*ph[áa]t)|ki[ểe]u\s*(t[ổo]\s*)?m[áa]y(?!\s*ph[áa]t)|m[áa]y\s*tr[ầa]n|open\s*type|lo[ạa]i\s*(c[ốo]\s*đ[ịi]nh|di\s*đ[ộo]ng|l[ắa]p\s*đ[ặa]t)/i),
  R("breaker", "Áp-tô-mát / MCCB đầu ra", "genset", "option", /\bMCCB\b|\bACB\b|\bMCB\b|[áa]p\s*-?\s*t[ôo]\s*-?\s*m[áa]t|aptomat|c[ầa]u\s*dao|circuit\s*breaker|t[ủu]\s*đ[óo]ng\s*c[ắa]t/i),
  R("canopy", "Vỏ cách âm", "genset", "option", /v[ỏo]\s*(c[áa]ch\s*[âa]m|ch[ốo]ng\s*[ồo]n|gi[ảa]m\s*[âa]m|gi[ảa]m\s*thanh)|soundproof|canopy|silent\s*type/i),
  R("battery", "Ắc quy", "genset", "option", /[ắa]c\s*quy|b[ìi]nh\s*đi[ệe]n|\bAh\b|battery(?!\s*(voltage|under|over|low|high|charg))/i),
  R("exhaust", "Hệ thống xả, giảm thanh, lưu lượng khí xả", "genset", "option", /[ốo]ng\s*(x[ảa]|th[oó][áa]t\s*kh[óo]i)|gi[ảa]m\s*thanh|exhaust|silencer|muffler|(l[ưư]u\s*l[ưư][ợo]ng|nhi[ệe]t\s*đ[ộo])\s*kh[íi]\s*(x[ảa]|th[ảa]i)/i),
  // ---- engine ----
  R("engine_make", "Hãng động cơ", "engine", "core", /^(đ[ộo]ng\s*c[ơo]|engine)$|(h[ãa]ng|nh[àa]\s*s[ảa]n\s*xu[ấa]t|th[ưư][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u)[^\n]{0,25}đ[ộo]ng\s*c[ơo]|đ[ộo]ng\s*c[ơo][^\n]{0,30}(h[ãa]ng|th[ưư][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u|nh[àa]\s*s[ảa]n\s*xu[ấa]t)/i),
  R("engine_model", "Model động cơ", "engine", "core", /(model|m[ãa]\s*hi[ệe]u|ki[ểe]u\s*lo[ạa]i)[^\n]{0,10}đ[ộo]ng\s*c[ơo]|đ[ộo]ng\s*c[ơo][^\n]{0,30}\b(model|m[ãa]\s*hi[ệe]u)\b/i),
  R("engine_origin", "Xuất xứ động cơ", "engine", "core", /(xu[ấa]t\s*x[ứu]|n[ơo]i\s*s[ảa]n\s*xu[ấa]t)[^\n]{0,20}đ[ộo]ng\s*c[ơo]|đ[ộo]ng\s*c[ơo][^\n]{0,40}(xu[ấa]t\s*x[ứu]|n[ưư][ớo]c\s*s[ảa]n\s*xu[ấa]t|n[ơo]i\s*s[ảa]n\s*xu[ấa]t)/i),
  R("engine_type", "Kiểu động cơ", "engine", "core", /ki[ểe]u\s*đ[ộo]ng\s*c[ơo]|lo[ạa]i\s*đ[ộo]ng\s*c[ơo]|\b4\s*(k[ỳy]|th[ìi])|4\s*-?\s*stroke|đ[ộo]ng\s*c[ơo]\s*(diesel|d[ầa]u)\s*4/i),
  R("cylinders", "Số xi lanh", "engine", "core", /s[ốo]\s*(xi|xy)\s*-?\s*lanh|\b\d{1,2}\s*(xi|xy)\s*-?\s*lanh|\bV\s?\d{1,2}\b|cylinders?/i),
  R("displacement", "Dung tích xi lanh", "engine", "core", /dung\s*t[íi]ch\s*((xi|xy)\s*-?\s*lanh|đ[ộo]ng\s*c[ơo]|c[ôo]ng\s*t[áa]c|l[àa]m\s*vi[ệe]c)|displacement/i),
  R("bore_stroke", "Đường kính × hành trình piston", "engine", "core", /đ[ưư][ờo]ng\s*k[íi]nh[^\n]{0,25}(h[àa]nh\s*tr[ìi]nh|(xi|xy)\s*-?\s*lanh|piston)|\bbore\b|\bstroke\b|h[àa]nh\s*tr[ìi]nh\s*(piston|pit\s*t[ôo]ng)/i),
  R("aspiration", "Nạp khí (tăng áp, làm mát khí nạp)", "engine", "core", /t[ăa]ng\s*[áa]p|n[ạa]p\s*kh[íi]|turbo|aspirat|intercool|l[àa]m\s*m[áa]t\s*(kh[íi]\s*n[ạa]p|trung\s*gian)/i),
  R("governor", "Bộ điều tốc", "engine", "core", /đi[ềe]u\s*t[ốo]c|governor|đi[ềe]u\s*khi[ểe]n\s*t[ốo]c\s*đ[ộo]/i),
  R("coolant_capacity", "Dung tích nước làm mát", "engine", "core", /dung\s*t[íi]ch\s*(n[ưư][ớo]c|ch[ấa]t|dung\s*d[ịi]ch)\s*l[àa]m\s*m[áa]t|coolant\s*capacity/i),
  R("oil_capacity", "Dung tích dầu bôi trơn", "engine", "core", /dung\s*t[íi]ch\s*(d[ầa]u\s*)?(b[ôo]i\s*tr[ơo]n|nh[ớo]t|d[ầa]u\s*m[áa]y)|oil\s*(capacity|sump)|(d[ầa]u\s*)?b[ôo]i\s*tr[ơo]n\s*:/i),
  R("cooling", "Hệ thống làm mát động cơ", "engine", "core", /(h[ệe]\s*th[ốo]ng\s*)?l[àa]m\s*m[áa]t(?![^\n]{0,15}(kh[íi]\s*n[ạa]p|trung\s*gian|đ[ầa]u\s*ph[áa]t))|cooling\s*(system|type)|k[ée]t\s*n[ưư][ớo]c|radiator/i),
  R("starting", "Hệ thống khởi động", "engine", "core", /(h[ệe]\s*th[ốo]ng\s*)?kh[ởo]i\s*đ[ộo]ng(?![^\n]{0,15}(t[ựu]\s*đ[ộo]ng|t[ừu]\s*xa|th[ấa]t\s*b[ạa]i|kh[ôo]ng\s*th[àa]nh|l[ỗo]i))|đ[ềe]\s*(đi[ệe]n\s*)?(12|24)\s*V|starting\s*(system|motor)|đi[ệe]n\s*[áa]p\s*(đ[ềe]|kh[ởo]i\s*đ[ộo]ng)/i),
  R("engine_power", "Công suất động cơ", "engine", "core", /c[ôo]ng\s*su[ấa]t[^\n]{0,20}đ[ộo]ng\s*c[ơo]|đ[ộo]ng\s*c[ơo][^\n]{0,30}c[ôo]ng\s*su[ấa]t|engine\s*(power|output)|\bbhp\b/i),
  R("speed", "Tốc độ quay", "engine", "core", /t[ốo]c\s*đ[ộo]\s*(quay|đ[ịi]nh\s*m[ứu]c|v[òo]ng)|v[òo]ng\s*(quay|tua|\/\s*ph[úu]t)|\brpm\b|\b1500\s*(v|r)/i),
  // "Lưu lượng / nhiệt độ khí thải" is the exhaust flow (code exhaust), not the emission standard (IB2600581977, 2026-11-12).
  R("emission", "Tiêu chuẩn khí thải", "engine", "core", /(?<!(l[ưư]u\s*l[ưư][ợo]ng|nhi[ệe]t\s*đ[ộo])\s*)kh[íi]\s*th[ảa]i|emission|\bTier\s*\d|\bStage\s*[IV]|Euro\s*[0-9IV]|\bEPA\b/i),
  R("compression", "Tỷ số nén", "engine", "core", /t[ỉỷ]\s*s[ốo]\s*n[ée]n|compression\s*ratio/i),
  R("fuel_system", "Hệ thống nhiên liệu (phun)", "engine", "core", /(h[ệe]\s*th[ốo]ng\s*)?phun\s*(nhi[êe]n\s*li[ệe]u|d[ầa]u|đi[ệe]n\s*t[ửu]|tr[ựu]c\s*ti[ếe]p)|common\s*rail|fuel\s*(injection|system)|b[ơo]m\s*cao\s*[áa]p|\bECU\b|\bEFI\b/i),
  R("air_filter", "Lọc gió, lọc dầu, lọc nhiên liệu", "engine", "option", /l[ọo]c\s*(gi[óo]|kh[íi]|d[ầa]u|nh[ớo]t|nhi[êe]n\s*li[ệe]u)|air\s*(filter|cleaner)|oil\s*filter|fuel\s*filter/i),
  // ---- alternator ----
  R("alt_make", "Hãng đầu phát", "alternator", "core", /^(đ[ầa]u|c[ủu])\s*ph[áa]t$|(h[ãa]ng|nh[àa]\s*s[ảa]n\s*xu[ấa]t|th[ưư][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u)[^\n]{0,15}(đ[ầa]u|c[ủu])\s*ph[áa]t|(đ[ầa]u|c[ủu])\s*ph[áa]t[^\n]{0,30}(h[ãa]ng|th[ưư][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u|nh[àa]\s*s[ảa]n\s*xu[ấa]t)|\b(Stamford|Leroy|Mecc\s*Alte|Marathon)\b/i),
  R("alt_model", "Model đầu phát", "alternator", "core", /(model|m[ãa]\s*hi[ệe]u)[^\n]{0,10}(đ[ầa]u|c[ủu])\s*ph[áa]t|(đ[ầa]u|c[ủu])\s*ph[áa]t[^\n]{0,30}\b(model|m[ãa]\s*hi[ệe]u)\b/i),
  R("alt_origin", "Xuất xứ đầu phát", "alternator", "core", /(xu[ấa]t\s*x[ứu]|n[ơo]i\s*s[ảa]n\s*xu[ấa]t)[^\n]{0,20}(đ[ầa]u|c[ủu])\s*ph[áa]t|(đ[ầa]u|c[ủu])\s*ph[áa]t[^\n]{0,40}(xu[ấa]t\s*x[ứu]|n[ơo]i\s*s[ảa]n\s*xu[ấa]t)/i),
  // Loại tải (2026-11-10): kích từ riêng (PMG / AREP) và dòng ngắn mạch duy trì (300% / 10 s) quyết định đầu phát chịu
  // được động cơ khởi động trực tiếp, bơm chữa cháy, UPS / biến tần, và cho bảo vệ chọn lọc làm việc. Trước alt_type,
  // whose words also take "PMG" / "excit".
  R("alt_excitation", "Kích từ đầu phát (PMG / AREP)", "alternator", "core", /\bPMG\b|\bAREP\b|nam\s*ch[âa]m\s*v[ĩi]nh\s*c[ửu]u|permanent\s*magnet|k[íi]ch\s*t[ừu]\s*(ph[ụu]|ri[êe]ng|đ[ộo]c\s*l[ậa]p|b[ằa]ng\s*m[áa]y\s*ph[áa]t\s*ph[ụu])/i),
  R("alt_short_circuit", "Dòng ngắn mạch duy trì (300% / 10 s)", "alternator", "core", /ng[ắa]n\s*m[ạa]ch\s*(duy\s*tr[ìi]|b[ềe]n\s*v[ữu]ng)|(?<!(ATS|t[ủu]|ACB|MCCB|m[áa]y\s*c[ắa]t|busway|thanh\s*c[áa]i)[^\n]{0,60})(ch[ịi]u\s*(đ[ựu]ng\s*)?(d[òo]ng\s*)?(đi[ệe]n\s*)?|duy\s*tr[ìi]\s*)ng[ắa]n\s*m[ạa]ch|sustained\s*short|short\s*-?\s*circuit\s*(current\s*)?(sustain|capab|capacity|withstand)|(300\s*%|\b3\s*x?\s*I\s*[nN]\b)[^\n]{0,40}?\b10\s*%?\s*(s\b|gi[âa]y|sec)/i),
  R("alt_type", "Kiểu đầu phát (không chổi than, tự kích)", "alternator", "core", /ki[ểe]u\s*(đ[ầa]u|c[ủu])\s*ph[áa]t|lo[ạa]i\s*(đ[ầa]u|c[ủu])\s*ph[áa]t|ch[ổo]i\s*than|brushless|t[ựu]\s*k[íi]ch|k[íi]ch\s*t[ừu]|\bPMG\b|excit|đ[ồo]ng\s*b[ộo]\s*3\s*pha|synchronous/i),
  R("alt_power", "Công suất đầu phát", "alternator", "core", /(?<!h[ệe]\s*s[ốo]\s*)c[ôo]ng\s*su[ấa]t[^\n]{0,20}(đ[ầa]u|c[ủu])\s*ph[áa]t|(đ[ầa]u|c[ủu])\s*ph[áa]t[^\n]{0,30}c[ôo]ng\s*su[ấa]t|alternator\s*(output|rating|power)/i),
  R("alt_insulation", "Cấp cách điện", "alternator", "core", /c[ấa]p\s*c[áa]ch\s*đi[ệe]n|c[ấa]p\s*(c[áa]ch|t[ăa]ng)\s*nhi[ệe]t|c[ấa]p\s*nhi[ệe]t\s*đ[ộo]\s*gi[ớo]i\s*h[ạa]n|c[áa]ch\s*đi[ệe]n\s*(c[ấa]p|lo[ạa]i|class)?\s*[FH]\b|insulation|đ[ộo]\s*t[ăa]ng\s*nhi[ệe]t|temperature\s*rise/i),
  R("alt_ip", "Cấp bảo vệ đầu phát (IP)", "alternator", "core", /c[ấa]p\s*b[ảa]o\s*v[ệe]|\bIP\s?\d\d\b|protection\s*(class|degree)/i),
  R("alt_avr", "Điều chỉnh điện áp (AVR)", "alternator", "core", /\bAVR\b|đi[ềe]u\s*ch[ỉi]nh\s*đi[ệe]n\s*[áa]p|b[ộo]\s*[ổo]n\s*[áa]p|voltage\s*regulator|\bDSR\b|\bR\s?\d{3}\b/i),
  R("alt_poles", "Số cực đầu phát", "alternator", "core", /s[ốo]\s*c[ựu]c|\b[24]\s*c[ựu]c|\b[24]\s*-?\s*poles?\b/i),
  R("alt_bearing", "Ổ đỡ đầu phát", "alternator", "core", /[ổo]\s*(đ[ỡo]|bi|tr[ụu]c|l[ăa]n)|v[òo]ng\s*bi|bearing/i),
  R("alt_pitch", "Bước quấn dây đầu phát (2/3)", "alternator", "core", /b[ưư][ớo]c\s*(d[âa]y|qu[ấa]n|c[ựu]c)|\b2\s*\/\s*3\b|winding\s*pitch/i),
  R("alt_winding", "Dây quấn đầu phát", "alternator", "core", /d[âa]y\s*qu[ấa]n|cu[ộo]n\s*d[âa]y|\bwinding\b|đ[ồo]ng\s*100\s*%|t[ẩa]m\s*s[ấa]y|impregnat/i),
  R("alt_efficiency", "Hiệu suất đầu phát", "alternator", "core", /hi[ệe]u\s*su[ấa]t(?![^\n]{0,15}c[ấa]p)|efficiency/i),
  R("alt_thd", "Méo sóng hài (THD)", "alternator", "core", /s[óo]ng\s*h[àa]i|\bTHD\b|harmonic|\bTIF\b|\bTHF\b/i),
  R("alt_cooling", "Làm mát đầu phát", "alternator", "core", /(đ[ầa]u|c[ủu])\s*ph[áa]t[^\n]{0,30}l[àa]m\s*m[áa]t|l[àa]m\s*m[áa]t[^\n]{0,20}((đ[ầa]u|c[ủu])\s*ph[áa]t|b[ằa]ng\s*qu[ạa]t)|\bIC\s?0?1\b|l[àa]m\s*m[áa]t|cooling/i),
  R("alt_standard", "Tiêu chuẩn đầu phát", "alternator", "core", /(đ[ầa]u|c[ủu])\s*ph[áa]t[^\n]{0,40}(ti[êe]u\s*chu[ẩa]n|IEC|BS\s*\d|NEMA|VDE)|ti[êe]u\s*chu[ẩa]n[^\n]{0,20}(đ[ầa]u|c[ủu])\s*ph[áa]t|(IEC\s*60034|NEMA\s*MG|BS\s*5000|VDE\s*0530)/i),
  // ---- controller ----
  R("ctl_make", "Hãng bộ điều khiển", "controller", "core", /(h[ãa]ng|th[ưư][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u|nh[àa]\s*s[ảa]n\s*xu[ấa]t)[^\n]{0,20}đi[ềe]u\s*khi[ểe]n|đi[ềe]u\s*khi[ểe]n[^\n]{0,40}(h[ãa]ng|th[ưư][ơo]ng\s*hi[ệe]u|nh[ãa]n\s*hi[ệe]u|nh[àa]\s*s[ảa]n\s*xu[ấa]t)|\b(Deep\s*-?Sea|SmartGen|ComAp|DEIF|Woodward|Datakom|PowerCommand|EMCP|Decision[\s-]*Maker)\b/i),
  R("ctl_model", "Model bộ điều khiển", "controller", "core", /(model|m[ãa]\s*hi[ệe]u)[^\n]{0,10}đi[ềe]u\s*khi[ểe]n|đi[ềe]u\s*khi[ểe]n[^\n]{0,40}\b(model|m[ãa]\s*hi[ệe]u)\b|\b(DSE|HGM|InteliLite|InteliGen|DKG)\s?-?\d{2,4}/i),
  R("ctl_origin", "Xuất xứ bộ điều khiển", "controller", "core", /xu[ấa]t\s*x[ứu][^\n]{0,20}đi[ềe]u\s*khi[ểe]n|đi[ềe]u\s*khi[ểe]n[^\n]{0,40}xu[ấa]t\s*x[ứu]/i),
  R("ctl_type", "Loại bộ điều khiển", "controller", "core", /(lo[ạa]i|ki[ểe]u)\s*(b[ộo]\s*)?đi[ềe]u\s*khi[ểe]n|b[ộo]\s*đi[ềe]u\s*khi[ểe]n\s*(k[ỹy]\s*thu[ậa]t\s*s[ốo]|vi\s*x[ửu]\s*l[ýy]|đi[ệe]n\s*t[ửu]|l[ậa]p\s*tr[ìi]nh)|microprocessor|digital\s*controller|\bPLC\b/i),
  R("ctl_start_amf", "Khởi động, dừng, tự động cấp điện (AMF)", "controller", "core", /\bAMF\b|t[ựu]\s*đ[ộo]ng\s*(kh[ởo]i\s*đ[ộo]ng|c[ấa]p\s*đi[ệe]n|chuy[ểe]n\s*ngu[ồo]n|d[ừu]ng|b[ậa]t)|m[ấa]t\s*đi[ệe]n\s*l[ưư][ớo]i|auto\s*start|ch[ếe]\s*đ[ộo]\s*(auto|manual|v[ậa]n\s*h[àa]nh|ho[ạa]t\s*đ[ộo]ng|l[àa]m\s*vi[ệe]c)|kh[ởo]i\s*đ[ộo]ng\s*(t[ừu]\s*xa|b[ằa]ng\s*tay|t[ựu]\s*đ[ộo]ng|\/\s*d[ừu]ng)|start\s*\/\s*stop|^b[ộo]\s*đi[ềe]u\s*khi[ểe]n\s*t[ựu]\s*đ[ộo]ng/i, { group: true }),
  R("ctl_protection", "Bảo vệ, dừng máy", "controller", "core", /b[ảa]o\s*v[ệe]|qu[áa]\s*[áa]p|th[ấa]p\s*[áa]p|qu[áa]\s*t[ốo]c|qu[áa]\s*d[òo]ng|ng[ắa]n\s*m[ạa]ch|[áa]p\s*(su[ấa]t|l[ựu]c)\s*(d[ầa]u|nh[ớo]t)\s*(th[ấa]p)?|nhi[ệe]t\s*đ[ộo]\s*(n[ưư][ớo]c|đ[ộo]ng\s*c[ơo])\s*(cao)?|d[ừu]ng\s*(m[áa]y\s*)?(kh[ẩa]n|b[ảa]o\s*v[ệe])|shutdown|protect|\bE-?stop\b/i, { group: true }),
  R("ctl_measure", "Đo lường, hiển thị", "controller", "core", /đo\s*(l[ưư][ờo]ng|đ[ếe]m|c[áa]c\s*th[ôo]ng\s*s[ốo])|hi[ểe]n\s*th[ịi]|m[àa]n\s*h[ìi]nh|\bLCD\b|\bLED\b|measure|display|đ[ồo]ng\s*h[ồo]\s*(đo|hi[ểe]n)|gi[ờo]\s*(ch[ạa]y|v[ậa]n\s*h[àa]nh|m[áa]y)/i, { group: true }),
  R("ctl_comm", "Truyền thông, giám sát từ xa", "controller", "core", /RS-?485|RS-?232|modbus|\bUSB\b|ethernet|\bTCP\b|\bGSM\b|\bSMS\b|\bSNMP\b|\bCAN\s*bus\b|J1939|truy[ềe]n\s*th[ôo]ng|gi[áa]m\s*s[áa]t\s*t[ừu]\s*xa|k[ếe]t\s*n[ốo]i\s*(v[ớo]i\s*)?(t[ủu]|m[áa]y\s*t[íi]nh|\bPC\b|\bATS\b|m[ạa]ng|t[ừu]\s*xa|BMS|SCADA|internet)|communication|\bIoT\b|c[ổo]ng\s*(giao\s*ti[ếe]p|truy[ềe]n)/i, { group: true }),
  R("ctl_alarm_log", "Cảnh báo, nhật ký sự kiện", "controller", "core", /c[ảa]nh\s*b[áa]o|b[áa]o\s*đ[ộo]ng|nh[ậa]t\s*k[ýy]|l[ịi]ch\s*s[ửu]\s*(s[ựu]\s*c[ốo]|v[ậa]n\s*h[àa]nh|s[ựu]\s*ki[ệe]n)|event\s*log|\balarm\b|l[ưư]u\s*(tr[ữu]\s*)?s[ựu]\s*ki[ệe]n/i, { group: true }),
  R("ctl_parallel", "Hoà đồng bộ, chia tải", "controller", "core", /h[oò][àa]\s*đ[ồo]ng\s*b[ộo]|song\s*song|parallel|synchroni[sz]|chia\s*t[ảa]i|load\s*shar/i),
  R("ctl_display_lang", "Ngôn ngữ, màn hình bộ điều khiển", "controller", "option", /ng[ôo]n\s*ng[ữu]|ti[ếe]ng\s*(Vi[ệe]t|Anh)|language/i),
];
// Loại yêu cầu (`kind`, 2026-11-10, rà soát chuyên môn máy phát). Nói nguồn không ghi điểm này thì thiếu gì:
//   model    cố hữu của model động cơ / đầu phát / BĐK / tổ máy: kiểm bằng datasheet; nguồn không ghi → "chưa rõ".
//   order    chọn khi đặt hàng mà không đổi model: nguồn không ghi → "xác nhận khi đặt hàng" (config-bot.mjs confirm).
//   document chứng từ / cam kết (chứng nhận, CO, thử nghiệm mẫu): nguồn không ghi → "cần chứng từ" (confirm).
//   site     phụ thuộc hiện trường (nhiệt độ, độ cao, độ ồn ở khoảng cách): vẫn "chưa rõ", câu hỏi riêng cho NCC.
// Mã lưỡng lự để `model` (an toàn: vẫn là "chưa rõ", vẫn bị phạt khi xếp hạng); các mã đó ghi "lưỡng lự" ở dưới.
const KIND = {
  // genset
  power_prime: "model", power_standby: "model", // định mức công suất của tổ máy (datasheet)
  fuel_consumption_75: "model", fuel_consumption_50: "model", fuel_consumption: "model", // theo động cơ + tải (datasheet)
  overload: "model", // 10% quá tải 1 h / 12 h là thuộc tính của định mức Prime theo ISO 8528-1, datasheet ghi
  load_step: "model", // nhận tải một bước do động cơ (BMEP, tăng áp) quyết định
  iso8528_class: "model", // lưỡng lự: G2/G3 là đặc tính của model nhưng thường chỉ có bằng tuyên bố / biên bản của NSX
  standards: "document", // ISO 3046 / IEC 60034 / CE / ISO 9001: chứng nhận, NCC gửi bản sao
  prototype: "document", // biên bản thử nghiệm mẫu của NSX
  genset_make: "model", genset_model: "model", // chính là cấu hình được chọn
  genset_origin: "model", // nơi lắp ráp tổ máy là nước của NCC, hệ thống đã biết; xử lý cùng thương hiệu / xuất xứ G7 (điều phối 10/11)
  brand_sync: "model", // code kiểm (byCode) theo hãng các bộ phận
  alt_vreg: "model", // ±0,5% / ±1% do đầu phát + AVR của model, datasheet đầu phát ghi
  freq_regulation: "model", // do bộ điều tốc của động cơ (isochronous / droop), datasheet ghi
  voltage: "order", // 380/400/415 V đặt bằng đấu dây / chỉnh AVR khi đặt hàng, không đổi model
  frequency: "model", // lưỡng lự: 50/60 Hz đổi tốc độ và định mức của động cơ, nhiều model chỉ có một tần số
  phases: "order", // 3 pha 4 dây / 1 pha: đầu phát 12 đầu dây đấu lại khi đặt hàng
  current: "model", // lưỡng lự: tính từ kVA và điện áp (điện áp là order) — để model
  power_factor: "model", // định mức ở cosφ 0,8 là quy ước của datasheet
  ambient: "site", // nhiệt độ môi trường / độ cao: giảm công suất theo hiện trường
  fuel: "model", // diesel
  fuel_tank: "order", // bồn tích hợp / rời, dung tích chọn khi đặt hàng
  noise: "site", // dB(A) ở khoảng cách đo, phụ thuộc vỏ và hiện trường
  dimensions: "model", weight: "model", // lưỡng lự: theo model + vỏ (vỏ là order) — để model
  genset_type: "order", // trần / vỏ cách âm, cố định / di động
  breaker: "order", canopy: "order", battery: "order", // phụ kiện chọn khi đặt hàng
  exhaust: "model", // lưỡng lự: bộ giảm thanh chọn khi đặt hàng nhưng lưu lượng / nhiệt độ khí xả là của động cơ
  // engine
  engine_make: "model", engine_model: "model",
  engine_origin: "model", // lưỡng lự: nước sản xuất động cơ theo model (DCEC / CCEC…), CO chứng minh khi giao hàng
  engine_type: "model", cylinders: "model", displacement: "model", bore_stroke: "model", aspiration: "model",
  governor: "model", coolant_capacity: "model", oil_capacity: "model", cooling: "model", engine_power: "model",
  speed: "model", emission: "model", compression: "model", fuel_system: "model",
  starting: "model", // lưỡng lự: đề 12/24 V có khi chọn khi đặt hàng — để model
  air_filter: "order", // lọc gió / lọc dầu loại nặng chọn khi đặt hàng
  // alternator
  alt_make: "model", alt_model: "model",
  alt_origin: "model", // lưỡng lự như engine_origin
  alt_excitation: "model", // PMG / AREP đổi bộ kích từ của đầu phát; có đầu phát cho chọn khi đặt hàng — lưỡng lự, để model
  alt_short_circuit: "model", // khả năng của đầu phát + kích từ, datasheet ghi (đường cong suy giảm ngắn mạch)
  alt_type: "model", // không chổi than, tự kích (PMG / AREP là tùy chọn của nhiều đầu phát — lưỡng lự, để model)
  alt_power: "model", alt_insulation: "model", alt_poles: "model", alt_bearing: "model", alt_pitch: "model",
  alt_winding: "model", alt_efficiency: "model", alt_thd: "model", alt_cooling: "model",
  alt_ip: "order", // IP21 tiêu chuẩn, IP23 / IP44 là tùy chọn khi đặt hàng
  alt_avr: "order", // model AVR (SX460 / AS440 / MX341…) chọn khi đặt hàng cùng đầu phát
  alt_standard: "document", // tuân IEC 60034 / BS 5000 / NEMA MG1: tuyên bố của NSX
  // controller
  ctl_make: "model", ctl_model: "model",
  ctl_origin: "model", // lưỡng lự như engine_origin
  ctl_type: "model", ctl_start_amf: "model", ctl_protection: "model", ctl_measure: "model", ctl_comm: "model",
  ctl_alarm_log: "model", ctl_parallel: "model",
  ctl_display_lang: "order", // ngôn ngữ hiển thị đặt khi cấu hình BĐK
};
for (const c of REQ_CODES) c.kind = KIND[c.code] || "model";
export const KINDS = ["model", "order", "document", "site"];
export const CODE_BY = new Map(REQ_CODES.map((c) => [c.code, c]));
export const OTHER = "other";
// The kind of a requirement (or check) by its code; "other" and unknown codes are "model" (stay "unclear").
export const kindOf = (r) => CODE_BY.get(r?.code)?.kind || "model";
// Some order points are an order option only for the usual values (điều phối 2026-11-10): `confirm` must not hide a
// different model. Read from the requirement's own text (requirement + quote); a figure not read keeps it "unclear".
// - voltage: low voltage only (every figure ≤ 1.000 V). 3,3 / 6,3 / 11 / 22 kV is another alternator.
// - phases: three phases only. A 1-phase set from a 3-phase alternator loses power or needs its own winding.
// - alt_ip: IP23 or below (IP21, IP22, IP23). IP44 / IP54 is not a usual order option.
export function voltsIn(text) {
  const out = [];
  const re = /((?:\d+(?:[.,]\d+)?\s*\/\s*)*\d+(?:[.,]\d+)?)\s*(kV|V)(?=AC|[^a-zA-Z]|$)/gi;
  for (const m of String(text || "").matchAll(re)) for (const n of m[1].split("/")) out.push(Number(n.trim().replace(",", ".")) * (/^k/i.test(m[2]) ? 1000 : 1));
  return out.filter((v) => Number.isFinite(v) && v > 0);
}
const THREE = /(^|[^\d])3\s*-?\s*(pha|phase|ph)\b|ba\s*pha|three\s*-?\s*phase|\b3P4W\b/i, ONE = /(^|[^\d])1\s*-?\s*(pha|phase|ph)\b|m[ộo]t\s*pha|single\s*-?\s*phase/i;
const WHEN = {
  voltage: (t) => { const v = voltsIn(t); return v.length > 0 && v.every((x) => x <= 1000); },
  phases: (t) => THREE.test(t) && !ONE.test(t),
  alt_ip: (t) => { const ip = [...t.matchAll(/\bIP\s?(\d)(\d)\b/gi)].map((m) => [Number(m[1]), Number(m[2])]); return ip.length > 0 && ip.every(([a, b]) => a <= 2 && b <= 3); },
};
const CONFIRMABLE = new Set(["order", "document"]);
// The kind a requirement is confirmed as when the sources do not state it ("order" / "document"), or null (stays unclear).
export function confirmKindOf(r) {
  const code = r?.code || codeOf(r), k = CODE_BY.get(code)?.kind;
  if (!CONFIRMABLE.has(k)) return null;
  const when = WHEN[code];
  return !when || when(normTxt(`${r?.requirement || ""} ${r?.quote || ""}`)) ? k : null;
}
const normTxt = (s) => String(s || "").normalize("NFC").replace(/\s+/g, " ").trim();
// Which codes (not byCode) a free text names, in list order. Not a text that says the HSMT does not state the point.
// A code whose words are a part of another's (alt_cooling: "làm mát") is named only when that one is not.
const SHADOW = { alt_cooling: "cooling" };
export const codesIn = (text) => {
  if (/(^|:)\s*kh[ôo]ng\s*(n[êe]u|c[óo]|ghi|y[êe]u\s*c[ầa]u)/i.test(normTxt(text))) return [];
  const hit = REQ_CODES.filter((c) => !c.byCode && c.words.test(normTxt(text)));
  return hit.filter((c) => !(SHADOW[c.code] && hit.some((o) => o.code === SHADOW[c.code])));
};
// The code of one requirement the agent (or the analysis) wrote: its own `code` when it is in the list; else the first
// code its item names, those of its part first (an "Hệ thống làm mát" under alternator is alt_cooling); else the first
// its item and requirement together name, again its part first; else "other".
const BY_ITEM = new Map(REQ_CODES.filter((c) => !c.byCode).map((c) => [normTxt(c.item).toLowerCase(), c.code]));
export function codeOf(r) {
  if (r?.code && (CODE_BY.has(r.code) || r.code === OTHER)) return r.code;
  const item = normTxt(r?.item), both = `${item}: ${normTxt(r?.requirement)}`;
  const part = r?.part, pick = (text, byPart) => REQ_CODES.find((c) => !c.byCode && (!byPart || c.part === part) && c.words.test(text))?.code;
  if (!item) return OTHER;
  // The list's own name of a code is that code ("Ngôn ngữ, màn hình bộ điều khiển" read as ctl_measure by its words:
  // a check seldom carries its code and is looked up again by the name withCode gave it, 2026-11-13).
  const own = BY_ITEM.get(item.toLowerCase());
  if (own) return own;
  return (part && pick(item, true)) || pick(item, false) || (part && pick(both, true)) || pick(both, false) || OTHER;
}
// A requirement normalized by its code: the list's item name, part and level (the agent's level stays only for "other").
export function withCode(r) {
  const code = codeOf(r), def = CODE_BY.get(code);
  if (!def) return { ...r, code: OTHER };
  return { ...r, code, item: def.item, part: def.part, level: def.level, kind: def.kind };
}
// The codes an HSMT text (its technical part) names on a line of its own that no requirement carries: for the agent to
// read again (check prints them). A line counts when it is short (a table cell or a bullet, not a paragraph) and holds a
// figure, a sign or a colon (a requirement, not a heading). At most `max` codes, each with the first such line.
// A table cell that holds a whole specification (one goods row of the notice, 7,650 characters) is cut into its
// clauses: at tabs, semicolons, " + " / " - " bullets, a full stop before a capital, and before a "Label :" of its own.
const CLAUSE = /\t|;|\s\+\s|\s-\s(?=[A-ZĐ])|\.\s+(?=[A-ZĐ])|(?<=[a-zà-ỹ\d)%])\s+(?=[A-ZĐ][a-zà-ỹ]*(\s[a-zà-ỹ]+){0,4}\s*:)/;
export const clausesOf = (text) => String(text || "").normalize("NFC").split(/\n/).flatMap((raw) => (raw.length > 240 ? raw.split(CLAUSE).filter(Boolean) : [raw]));
export function missingCodes(text, reqs, max = 15) {
  const have = new Set((reqs || []).map((r) => r.code).filter(Boolean));
  const out = new Map();
  for (const raw of clausesOf(text)) {
    const l = raw.replace(/\s+/g, " ").trim();
    if (l.length < 6 || l.length > 240 || !/[\d≥≤:≧≦>]/.test(l)) continue;
    for (const c of codesIn(l)) if (!have.has(c.code) && !out.has(c.code) && c.level === "core") out.set(c.code, l);
    if (out.size >= max) break;
  }
  return [...out].map(([code, line]) => ({ code, item: CODE_BY.get(code).item, part: CODE_BY.get(code).part, line }));
}
// The list as input.md shows it to the agent.
export const codesMd = () => ["| code | item (tên dùng trong result.json) | part | level | kind |", "|---|---|---|---|---|",
  ...REQ_CODES.filter((c) => !c.byCode).map((c) => `| ${c.code} | ${c.item} | ${c.part} | ${c.level}${c.group ? " (nhóm, có parts)" : ""} | ${c.kind} |`),
  `| ${OTHER} | (tên tự đặt) | theo HSMT | theo HSMT | model |`].join("\n");
