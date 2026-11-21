import json, sys
from collections import Counter
S = '/tmp/claude-0/-home-user-GenSet-Pro/114af494-f8d8-51ae-9478-f0f0fc2d238f/scratchpad/'
a = json.load(open(S + sys.argv[1])); b = json.load(open(S + sys.argv[2])); out = sys.argv[3]
tec = [x for x in b['inv'] if x['sid'] == 'tecnogen' and x['label'] == 'cm3' and x['kind'] == 'engine']
keys = sorted(set(x['key'] for x in tec))
def fmt(m):
    return ' '.join(f"{k}:{len(v)}" for k, v in sorted((m or {}).get('figs', {}).items())) or '-'
rows = []
for k in keys:
    A = a['maj'].get(k) or {}; B = b['maj'].get(k) or {}
    tv = sorted(set(x['num'] for x in tec if x['key'] == k))
    figsB = B.get('figs', {})
    others = {v: [s for s in ss if s != 'tecnogen'] for v, ss in figsB.items()}
    others = {v: ss for v, ss in others.items() if ss}
    only = not any(v not in ('BLOCK', 'None') for v in others)
    cls = []
    wa, wb, ea, eb = A.get('win'), B.get('win'), A.get('exact'), B.get('exact')
    if wa != wb:
        cls.append('ĐỔI số thắng' if wa is not None and wb is not None else ('không → có số đông' if wa is None else 'MẤT số đông'))
    elif ea != eb: cls.append('đổi dispExact')
    # mâu thuẫn: số L của NCC khác không tương thích làm tròn (≤1%) với số tecnogen
    def compat(x, y):
        return abs(x - y) <= 0.01 * max(x, y) + 1e-9
    conf = sorted(v for v in others if v not in ('BLOCK', 'None') and not any(compat(float(v), t) for t in tv))
    if conf: cls.append('MÂU THUẪN: ' + ', '.join(f"{v} ({','.join(others[v])})" for v in conf))
    if only: cls.append('tecnogen là nguồn disp (số) duy nhất')
    rows.append({'key': k, 'model': (B or A).get('model'), 'tec': tv, 'winA': wa, 'winB': wb, 'exactA': ea, 'exactB': eb, 'figsA': fmt(A), 'figsB': fmt(B), 'cls': cls,
                 'votesA': A.get('votes'), 'votesB': B.get('votes')})
json.dump(rows, open(S + out, 'w'), ensure_ascii=False)
c = Counter()
for r in rows:
    for x in r['cls']: c[x.split(':')[0]] += 1
print(len(keys), 'khoá;', dict(c))
for r in rows:
    if any(not x.startswith('tecnogen là') for x in r['cls']):
        print(r['key'], '| tec', r['tec'], '| thắng', r['winA'], '→', r['winB'], '| exact', r['exactA'], '→', r['exactB'], '|', r['figsA'], '=>', r['figsB'], '|', '; '.join(r['cls']))
