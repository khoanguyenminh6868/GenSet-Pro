// Quy đổi thông số được phép trong "Gợi ý cấu hình" (Khoa, 2026-10-29: được quy đổi kW ↔ kVA, L/h ↔ g/kWh... bằng công thức
// khoa học đã chứng minh, không được bịa). Agent chỉ chọn một công thức trong bảng này và ghi đầu vào; config-bot.mjs check
// tự tính lại kết quả, kiểm mỗi số đầu vào có nguyên văn trong câu trích nguồn / HSMT, và hằng số chuẩn lấy từ đây chứ
// không lấy số agent ghi. Dùng chung cho Node (suppliers/config-bot.mjs) và trang web (window.GenbidConversions).
(function (root) {
  // Khối lượng riêng diesel ở 15 °C theo EN 590 (820–845 kg/m³ = g/L). Kết quả là một khoảng; agent phải xét trường hợp xấu nhất.
  const DIESEL = { min: 820, max: 845, unit: "g/L", basis: "EN 590: khối lượng riêng diesel ở 15 °C 820–845 kg/m³" };
  const F = {
    kva_from_kw: { label: "S (kVA) = P (kW) / cosφ", basis: "Định nghĩa hệ số công suất cosφ = P / S (IEC 60050-131)", inputs: ["P_kW", "pf"], unit: "kVA", calc: (x) => x.P_kW / x.pf },
    kw_from_kva: { label: "P (kW) = S (kVA) × cosφ", basis: "Định nghĩa hệ số công suất cosφ = P / S (IEC 60050-131)", inputs: ["S_kVA", "pf"], unit: "kW", calc: (x) => x.S_kVA * x.pf },
    pf_from_kw_kva: { label: "cosφ = P (kW) / S (kVA)", basis: "Định nghĩa hệ số công suất cosφ = P / S (IEC 60050-131)", inputs: ["P_kW", "S_kVA"], unit: "", calc: (x) => x.P_kW / x.S_kVA },
    current_3ph: { label: "I (A) = S (kVA) × 1000 / (√3 × U (V))", basis: "Công suất biểu kiến ba pha S = √3 · U_dây · I", inputs: ["S_kVA", "U_V"], unit: "A", calc: (x) => (x.S_kVA * 1000) / (Math.sqrt(3) * x.U_V) },
    kva_from_current_3ph: { label: "S (kVA) = √3 × U (V) × I (A) / 1000", basis: "Công suất biểu kiến ba pha S = √3 · U_dây · I", inputs: ["U_V", "I_A"], unit: "kVA", calc: (x) => (Math.sqrt(3) * x.U_V * x.I_A) / 1000 },
    lph_from_gkwh: { label: "Q (L/h) = b (g/kWh) × P (kW) / ρ (g/L)", basis: "Lưu lượng khối lượng = suất tiêu hao × công suất; thể tích = khối lượng / khối lượng riêng", inputs: ["b_gkWh", "P_kW", "rho_gL"], unit: "L/h", calc: (x) => (x.b_gkWh * x.P_kW) / x.rho_gL, standard: { rho_gL: DIESEL } },
    gkwh_from_lph: { label: "b (g/kWh) = Q (L/h) × ρ (g/L) / P (kW)", basis: "Lưu lượng khối lượng = suất tiêu hao × công suất; thể tích = khối lượng / khối lượng riêng", inputs: ["Q_Lh", "rho_gL", "P_kW"], unit: "g/kWh", calc: (x) => (x.Q_Lh * x.rho_gL) / x.P_kW, standard: { rho_gL: DIESEL } },
    kw_from_hp: { label: "P (kW) = P (hp) × 0,745700", basis: "1 hp (mã lực cơ, 550 ft·lbf/s) = 745,700 W (NIST SP 811)", inputs: ["P_hp"], unit: "kW", calc: (x) => x.P_hp * 0.7457 },
    kw_from_ps: { label: "P (kW) = P (PS) × 0,735499", basis: "1 PS (mã lực mét, 75 kgf·m/s) = 735,499 W (NIST SP 811)", inputs: ["P_PS"], unit: "kW", calc: (x) => x.P_PS * 0.73549875 },
    rpm_from_poles: { label: "n (v/p) = 120 × f (Hz) / số cực", basis: "Tốc độ đồng bộ của máy điện xoay chiều n = 120 f / p", inputs: ["f_Hz", "poles"], unit: "v/p", calc: (x) => (120 * x.f_Hz) / x.poles },
    displacement_l: { label: "V (L) = π/4 × D² × S × z / 10⁶ (D, S theo mm)", basis: "Thể tích hình trụ: đường kính xi lanh D, hành trình S, số xi lanh z", inputs: ["bore_mm", "stroke_mm", "cylinders"], unit: "L", calc: (x) => (Math.PI / 4) * x.bore_mm ** 2 * x.stroke_mm * x.cylinders / 1e6 },
    l_from_cuin: { label: "V (L) = V (in³) × 0,016387064", basis: "1 in = 25,4 mm (định nghĩa), nên 1 in³ = 0,016387064 L", inputs: ["V_in3"], unit: "L", calc: (x) => x.V_in3 * 0.016387064 },
    // Kiểm tra tổ hợp (2026-11-10): công suất điện đầu phát cho ra từ công suất cơ động cơ, và áp suất có ích trung bình.
    kwe_from_kwm: { label: "Pₑ (kWe) = Pₘ (kWm) × η (%) / 100", basis: "Hiệu suất đầu phát η = công suất điện ra / công suất cơ vào trục (IEC 60034-2-1)", inputs: ["P_kWm", "eff_pct"], unit: "kWe", calc: (x) => (x.P_kWm * x.eff_pct) / 100 },
    bmep_4s: { label: "BMEP (bar) = 1200 × P (kW) / (V (L) × n (v/p))", basis: "Động cơ 4 kỳ: một chu trình công tác mỗi 2 vòng quay, P = BMEP × V × n / 2 → BMEP[Pa] = 2P[W] / (V[m³] × n[v/s])", inputs: ["P_kW", "V_L", "n_rpm"], unit: "bar", calc: (x) => (1200 * x.P_kW) / (x.V_L * x.n_rpm) },
    c_from_f: { label: "t (°C) = (t (°F) − 32) × 5/9", basis: "Định nghĩa thang nhiệt độ Fahrenheit", inputs: ["t_F"], unit: "°C", calc: (x) => ((x.t_F - 32) * 5) / 9 },
  };

  // Inputs that cannot be (2026-11-13): a power factor over 1, an efficiency over 100 %, an odd number of poles. A
  // temperature in °F may be zero or below.
  const LIMITS = { pf: [(v) => v <= 1, "hệ số công suất không lớn hơn 1"], eff_pct: [(v) => v <= 100, "hiệu suất không lớn hơn 100%"], poles: [(v) => Number.isInteger(v) && v % 2 === 0, "số cực phải là số chẵn"] };
  const SIGNED = new Set(["t_F"]);
  // One conversion → { value: number | [min, max], error? }. `known` maps "standard" inputs to their range.
  function compute(conv) {
    const f = F[conv?.formula];
    if (!f) return { error: `công thức "${conv?.formula}" không có trong danh sách được phép` };
    const vals = {}, ranged = [];
    for (const name of f.inputs) {
      const inp = (conv.inputs || []).find((i) => i.name === name);
      if (!inp) return { error: `thiếu đầu vào ${name}` };
      if (inp.from === "standard") {
        const st = f.standard?.[name];
        if (!st) return { error: `${name} không có giá trị chuẩn, phải trích từ nguồn hoặc HSMT` };
        vals[name] = [st.min, st.max]; ranged.push(name);
      } else {
        const v = Number(inp.value);
        if (SIGNED.has(name) ? !Number.isFinite(v) : !Number.isFinite(v) || v <= 0) return { error: `đầu vào ${name} không phải số dương` };
        if (LIMITS[name] && !LIMITS[name][0](v)) return { error: `đầu vào ${name} = ${v}: ${LIMITS[name][1]}` };
        vals[name] = v;
      }
    }
    if (!ranged.length) return { value: f.calc(vals) };
    // Every input is used once, monotonically: the range ends come from the ends of the ranged input.
    const out = [0, 1].map((k) => f.calc(Object.fromEntries(Object.entries(vals).map(([n, v]) => [n, Array.isArray(v) ? v[k] : v]))));
    return { value: [Math.min(...out), Math.max(...out)] };
  }
  // The floor of 0.05 is the rounding of a figure to one decimal; a value under 2 (a power factor, a ratio) is written
  // to two decimals, where 0.05 would take 0.80 for 0.85.
  const close = (a, b) => Math.abs(a - b) <= Math.max(0.005 * Math.abs(b), Math.abs(b) < 2 ? 0.005 : 0.05);
  // A number written in the answer matches a computed value when it is that value rounded (to 0.5% or 0.05).
  const matches = (n, value) => (Array.isArray(value) ? value.some((v) => close(n, v)) : close(n, value));

  root.GenbidConversions = { FORMULAS: F, DIESEL, compute, matches };
})(typeof window !== "undefined" ? window : globalThis);
