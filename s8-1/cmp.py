import json, sys
from collections import defaultdict
S = '/tmp/claude-0/-home-user-GenSet-Pro/114af494-f8d8-51ae-9478-f0f0fc2d238f/scratchpad/'
a = json.load(open(S + sys.argv[1])); b = json.load(open(S + sys.argv[2])); out = sys.argv[3]
inv = b['inv']; ainv = a['inv']
ch = [(x, y) for x, y in zip(ainv, inv) if (x['unit'], x['num']) != (y['unit'], y['num'])]
# khoá động cơ bị đụng: bản ghi engine có disp đổi
keys = sorted(set(y['key'] for x, y in ch if y['kind'] == 'engine'))
def fmt(m):
    if not m: return '-'
    return ' '.join(f"{k}:{len(v)}" for k, v in sorted(m['figs'].items()))
rows = []
for k in keys:
    A = a['maj'].get(k); B = b['maj'].get(k)
    if not A and not B: continue
    wa, wb = (A or {}).get('win'), (B or {}).get('win')
    ea, eb = (A or {}).get('exact'), (B or {}).get('exact')
    cls = []
    if wa != wb: cls.append('ĐỔI số thắng' if wa is not None and wb is not None else ('không → có số đông' if wa is None else 'MẤT số đông'))
    if ea != eb and 'ĐỔI số thắng' not in cls: cls.append('đổi dispExact')
    # mâu thuẫn: số cc sau đổi lệch số L của NCC khác (ngoài làm tròn 1%)
    figsB = {kk: v for kk, v in (B or {}).get('figs', {}).items() if kk not in ('BLOCK',)}
    ccv = set(round(y['num'], 6) for x, y in ch if y['key'] == k and y['kind'] == 'engine')
    others = [float(v) for v in figsB if v not in ('None',) and all(abs(float(v) - c) > max(0.01 * c, 1e-9) for c in ccv)]
    ccsup = set(y['sid'] for x, y in ch if y['key'] == k and y['kind'] == 'engine')
    oth_sup = set(s for v, ss in figsB.items() if v != 'None' and all(abs(float(v) - c) > max(0.01 * c, 1e-9) for c in ccv) for s in ss) - ccsup
    if oth_sup: cls.append('MÂU THUẪN nguồn L khác')
    rows.append({'key': k, 'model': (B or A)['model'], 'cc': sorted(ccv), 'ccSup': sorted(ccsup), 'winA': wa, 'winB': wb, 'exactA': ea, 'exactB': eb,
                 'votesA': (A or {}).get('votes'), 'votesB': (B or {}).get('votes'), 'figsA': fmt(A), 'figsB': fmt(B), 'cls': cls,
                 'figsBfull': (B or {}).get('figs')})
json.dump(rows, open(S + out, 'w'), ensure_ascii=False, indent=0)
from collections import Counter
print(len(keys), 'khoá động cơ bị đụng;', Counter(c for r in rows for c in r['cls']))
for r in rows:
    print(r['key'], r['model'], 'cc→', r['cc'], r['ccSup'], '| thắng', r['winA'], '→', r['winB'], '| exact', r['exactA'], '→', r['exactB'], '|', r['figsA'], '=>', r['figsB'], '|', ','.join(r['cls']))
