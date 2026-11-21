import json
from collections import Counter, defaultdict
S = '/tmp/claude-0/-home-user-GenSet-Pro/114af494-f8d8-51ae-9478-f0f0fc2d238f/scratchpad/'
A = json.load(open(S + 'ex-goc-all.json')); M = json.load(open(S + 'm5.json'))['maj']
buck = Counter(); agg = defaultdict(lambda: {'rows': 0, 'runs': set(), 'sups': set()})
runs_lt1 = set()
for k, run in A.items():
    for d in run['dropped']:
        r = d['ruled']; src = d['src']
        kind = 'minDisp' if 'disp' in r else 'maxDisp' if 'maxDisp' in r else None
        if not kind: continue
        eng = d['k'].split('|')[1]; lim = run[kind]; s = src.get('disp' if kind == 'minDisp' else 'maxDisp') or {}
        val = s.get('exact', s.get('win')); path = 'số đông'
        if val is None:
            nums = [float(v) for v in (M.get(eng, {}).get('figs') or {}) if v not in ('BLOCK', 'None')]
            if not nums or lim is None: buck[(kind, '? (không số / ngưỡng)')] += 1; continue
            val = max(nums) if kind == 'minDisp' else min(nums); path = 'mọi nguồn'
        if lim is None: buck[(kind, '? ngưỡng')] += 1; continue
        gap = (lim - val) / lim if kind == 'minDisp' else (val - lim * 1.005) / lim
        b = '< 1 %' if gap < 0.01 else '1–5 %' if gap < 0.05 else '> 5 %'
        buck[(kind, b)] += 1
        if b == '< 1 %':
            runs_lt1.add(k)
            a = agg[(eng, kind, lim, val, path, json.dumps(M.get(eng, {}).get('figs'), ensure_ascii=False))]
            a['rows'] += 1; a['runs'].add(k); a['sups'].add(d['k'].split('|')[0]); a['gap'] = gap
print('main, toàn tập', len(A), 'lượt:', sorted(buck.items()))
print('lượt có dòng bị loại vì kém ngưỡng < 1 %:', len(runs_lt1), '| dòng:', sum(a['rows'] for a in agg.values()), '| khoá:', len({x[0] for x in agg}))
for (eng, kind, lim, val, path, figs), a in sorted(agg.items(), key=lambda t: (t[1]['gap'], t[0][0])):
    print(f"{a['gap']:.2%}\t{eng}\t{kind} {lim}\tsố {val} ({path})\t{a['rows']} dòng / {len(a['runs'])} lượt\tphiếu {figs}")
