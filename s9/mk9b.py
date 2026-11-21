import json
S = '/tmp/claude-0/-home-user-GenSet-Pro/ac33377a-8e39-516e-b2ec-979c8f8a7de9/scratchpad/'
OUT = S + 'nt9/s9/'
a = json.load(open(S + 'base.json')); b = json.load(open(S + 'new.json'))
ba = json.load(open(S + 'b0.json')); bb = json.load(open(S + 'b1.json'))
ia = {(r['sid'], r['n'], r['kind'], r['model'], r['value']) for r in a['inv']}
cl = lambda s: str('' if s is None else s).replace('\t', ' ').replace('\n', ' ')
with open(OUT + '2-ban-ghi-moi-doi.tsv', 'w', encoding='utf8') as f:
    f.write('\t'.join(['NCC', 'n', 'bảng (chỉ số)', 'mới / đổi', 'vai', 'model', 'khoá', 'tổ máy', 'công suất', 'nhãn', 'disp thô', 'disp → L', 'công thức', 'dòng mã động cơ (nguyên văn)']) + '\n')
    for r in b['inv']:
        if (r['sid'], r['n'], r['kind'], r['model'], r['value']) in ia: continue
        kind = 'đổi (bản ghi sẵn có nhận disp)' if (r['sid'], r['n']) in {('victory-generator', 123), ('winco', 1002), ('winco', 1003)} else 'mới'
        f.write('\t'.join(cl(x) for x in [r['sid'], r['n'], r['table'], kind, r['kind'], r['model'], r['key'], r['genset'], 'không (power null)', r['label'], r['value'], r['num'], json.dumps(r['conv'], ensure_ascii=False), r['line']]) + '\n')
with open(OUT + '3-khoa-dong-co.tsv', 'w', encoding='utf8') as f:
    f.write('\t'.join(['khoá', 'model', 'hãng trước', 'hãng sau', 'nguồn gốc trước', 'nguồn gốc sau', 'số lượt dùng trước → sau', 'NCC trước', 'NCC sau', 'phiếu disp trước', 'phiếu disp sau', 'số thắng trước / sau', 'dispExact trước / sau', 'kết luận']) + '\n')
    for k in sorted(set(ba['engines']) | set(bb['engines'])):
        x, y = ba['engines'].get(k), bb['engines'].get(k)
        if x == y: continue
        mx, my = a['maj'].get(k), b['maj'].get(k)
        others = sorted(set((x or {}).get('sups', [])) - {'endress-stromerzeuger', 'gillette-generators', 'winco', 'victory-generator'})
        concl = ['khoá MỚI (không NCC nào khác dùng)'] if x is None else []
        if x is not None and (x or {}).get('make', '') != (y or {}).get('make', ''): concl.append(f"HÃNG khoá đổi '{(x or {}).get('make', '')}' → '{y['make']}' (ảnh hưởng bản ghi của {', '.join(others)})")
        if others and mx is None and my is not None: concl.append(f"bản ghi mới là NGUỒN DUY NHẤT dung tích của khoá mà {', '.join(others)} dùng")
        if (mx or {}).get('win') != (my or {}).get('win'): concl.append('số thắng đổi')
        if not concl: concl.append('chỉ thêm phiếu / lượt dùng của chính NCC, không đổi số thắng')
        f.write('\t'.join(cl(v) for v in [k, (y or x)['model'], (x or {}).get('make', '—'), (y or {}).get('make', '—'), (x or {}).get('origin', '—'), (y or {}).get('origin', '—'),
            f"{(x or {}).get('uses', 0)} → {(y or {}).get('uses', 0)}", ','.join((x or {}).get('sups', [])), ','.join((y or {}).get('sups', [])),
            json.dumps((mx or {}).get('figs'), ensure_ascii=False), json.dumps((my or {}).get('figs'), ensure_ascii=False),
            f"{(mx or {}).get('win')} / {(my or {}).get('win')}", f"{(mx or {}).get('exact')} / {(my or {}).get('exact')}", '; '.join(concl)]) + '\n')
print(open(OUT + '3-khoa-dong-co.tsv').read())
