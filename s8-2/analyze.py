import json, gzip, sys
from collections import Counter, defaultdict
S = '/tmp/claude-0/-home-user-GenSet-Pro/114af494-f8d8-51ae-9478-f0f0fc2d238f/scratchpad/'
ga = json.load(gzip.open(S + 'dg/gop-goc.json.gz')); gb = json.load(gzip.open(S + 'dg/gop-nhanh.json.gz'))
A = json.load(open(S + 'ex-goc.json')); Bn = json.load(open(S + sys.argv[1]))
# 1) tái lập: all của lượt chạy lại = all của tệp đo?
rep = sum(1 for k in A if [x for x, _ in A[k]['all']] == [x for x, _ in ga[k]['all']])
rep2 = sum(1 for k in Bn if [x for x, _ in Bn[k]['all']] == [x for x, _ in gb[k]['all']]) if sys.argv[1] == 'ex-1ba.json' else None
print('tái lập all: gốc', rep, '/', len(A), '| nhánh', rep2)
lost = []; gained = []
for k in A:
    ka = {x for x, _ in A[k]['all']}; kb = {x for x, _ in Bn[k]['all']}
    noalt = lambda z: '|'.join(z.split('|')[:2] + z.split('|')[3:])
    dropB = {noalt(d['k']): d for d in Bn[k]['dropped']}
    for x in sorted(ka - kb):
        if x.startswith('tecnogen|'): continue
        d = dropB.get(noalt(x))
        lost.append((k, x, d, A[k]))
    for x in sorted(kb - ka):
        if not x.startswith('tecnogen|'): gained.append((k, x))
print('mất', len(lost), 'ở', len({k for k, *_ in lost}), 'lượt; thêm', len(gained))
why = Counter(); rows = []
for k, x, d, run in lost:
    if not d: why['không có trong dropped (bị đẩy ra ngoài all?)'] += 1; rows.append((k, x, None, None, None, 'khác: không thấy trong dropped')); continue
    r = d['ruled']; src = d['src']
    if 'disp' in r:
        s = src.get('disp', {}); val = s.get('exact', s.get('win')); lim = run['minDisp']
        gap = (lim - val) / lim if val is not None and lim else None
        why['disp < minDisp'] += 1; rows.append((k, x, 'minDisp', lim, val, gap, s))
    elif 'maxDisp' in r:
        s = src.get('maxDisp', {}); val = s.get('exact', s.get('win')); lim = run['maxDisp']
        gap = (val - lim * 1.005) / lim if val is not None and lim else None
        why['disp > maxDisp'] += 1; rows.append((k, x, 'maxDisp', lim, val, gap, s))
    else:
        why['khác: ' + ','.join(r)] += 1; rows.append((k, x, ','.join(r), None, None, None, src))
print(why)
json.dump([list(r) for r in rows], open(S + 'lost-' + sys.argv[1], 'w'), ensure_ascii=False)
json.dump(gained, open(S + 'gained-' + sys.argv[1], 'w'))
