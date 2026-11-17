// What a regression compares of a checked configuration result (check + rankConfigs).
const PARTS = ["genset", "engine", "alternator", "controller"], ST = ["met", "not_met", "unclear", "confirm"];
const name = (p) => (p ? [p.make || p.brand, p.model].filter(Boolean).join(" ") : null);
export function summarize({ result, problems = [] }) {
  return {
    problems: problems.length,
    requirements: (result.requirements || []).length,
    unverifiedRequirements: (result.requirements || []).filter((r) => r.unverified).length,
    brandSync: result.brandSync ? result.brandSync.need : null,
    configs: (result.configs || []).map((c) => {
      const counts = {};
      for (const part of PARTS) {
        const xs = (c.checks || []).filter((x) => (PARTS.includes(x.part) ? x.part : "genset") === part);
        if (xs.length) counts[part] = ST.map((s) => xs.filter((x) => x.status === s).length).join("/");
      }
      return {
        rank: c.rank, engine: name(c.engine), alternator: name(c.alternator), controller: name(c.controller),
        suppliers: (c.suppliers || []).map((s) => `${s.supplierId}:${s.n}${s.unverified ? "?" : ""}`),
        checks: counts, unverifiedChecks: (c.checks || []).filter((x) => x.unverified).length,
        lossWarn: (c.lossWarn || []).map((w) => `${w.code}:${w.status}`),
      };
    }),
  };
}
