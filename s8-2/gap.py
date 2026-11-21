import json, sys
from collections import Counter, defaultdict
S = '/tmp/claude-0/-home-user-GenSet-Pro/114af494-f8d8-51ae-9478-f0f0fc2d238f/scratchpad/'
L = json.load(open(S + 'lost-' + sys.argv[1]))
bucket = Counter(); small = defaultdict(list); bykey = defaultdict(lambda: Counter())
for k, x, kind, lim, val, gap, src in L:
    eng = x.split('|')[1]; sup = x.split('|')[0]
    b = 'không số' if gap is None else ('< 1 %' if gap < 0.01 else '1–5 %' if gap < 0.05 else '> 5 %')
    bucket[(kind, b)] += 1
    bykey[(eng, kind, lim, val)][k] += 1
    if b == '< 1 %': small[(eng, kind, lim, val, json.dumps(src.get('votes') if src else None), json.dumps(src.get('group') if src else None))].append((k, sup))
print(sorted(bucket.items()))
print('--- mọi ca < 1 %')
for (eng, kind, lim, val, votes, group), lst in sorted(small.items()):
    runs = sorted({k for k, _ in lst}); sups = sorted({s for _, s in lst})
    print(f'{eng} | {kind} | ngưỡng {lim} | số {val} | phiếu {votes} nhóm {group} | {len(lst)} lượt-dòng | lượt {",".join(runs)} | NCC {",".join(sups)}')
print('--- theo khoá (mọi khoảng)')
for (eng, kind, lim, val), c in sorted(bykey.items(), key=lambda t: -sum(t[1].values())):
    print(f'{eng} {kind} ngưỡng={lim} số={val} gap={(lim-val)/lim if kind=="minDisp" else (val-lim*1.005)/lim:.3%} | {sum(c.values())} dòng ở {len(c)} lượt')
