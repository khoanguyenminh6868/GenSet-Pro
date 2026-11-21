import json, os, re, math
S = '/tmp/claude-0/-home-user-GenSet-Pro/114af494-f8d8-51ae-9478-f0f0fc2d238f/scratchpad/'
OUT = S + 'nt/s8-1/'
os.makedirs(OUT, exist_ok=True)
a = json.load(open(S + 'base.json')); b = json.load(open(S + 'new.json'))
raw = json.load(open(S + 'raw.json'))
cl = lambda s: str(s if s is not None else '').replace('\t', ' ').replace('\n', ' ')
def w(name, head, rows):
    with open(OUT + name, 'w') as f:
        f.write('\t'.join(head) + '\n')
        for r in rows: f.write('\t'.join(cl(x) for x in r) + '\n')
    print(name, len(rows))

# 1) 193 giá trị disp đổi cc → L (mỗi bản ghi fromSupplier một dòng)
rows = []
for x, y in zip(a['inv'], b['inv']):
    if (x['unit'], x['num']) == (y['unit'], y['num']): continue
    geo = ''
    if y['boreRaw']:
        bs = [float(t) for t in re.findall(r'\d+(?:\.\d+)?', y['boreRaw'])[:2]]
        one = math.pi / 4 * bs[0] ** 2 * bs[1] / 1e6
        r = y['num'] / one
        geo = f"1 xi lanh {one:.4f} L; tỉ số {r:.3f}" + ('' if min(abs(r - 1), abs(r - 2)) <= 0.05 else ' LỆCH (không khớp 1 hay 2 xi lanh ±5%)')
    rows.append([y['sid'], y['n'], y['table'], y['title'], y['kind'], y['model'], y['key'], y['genset'], y['label'], y['value'],
                 f"{x['num']} {x['unit']}", f"{y['num']} {y['unit']}", y['boreRaw'], y['cylRaw'], geo])
w('1-doi-cc-L.tsv', ['NCC', 'n', 'bảng (chỉ số)', 'tên bảng', 'vai', 'model', 'khoá', 'tổ máy', 'nhãn / tiêu đề cột', 'ô nguyên văn', 'trước', 'sau', 'bore×stroke của bản ghi', 'xi lanh của bản ghi', 'so hình học'], rows)

# 2) ô có chữ cc / cm3 / ml mà KHÔNG thành bản ghi (không đổi gì; liệt kê đủ)
have = set((y['sid'], y['n'], y['value'].strip()) for y in b['inv'] if y['conv'] and y['conv'].get('formula') == 'l_from_cc')
rows = []
for x in raw:
    if not x['unitCc']: continue
    if (x['sid'], x['n'], x['value'].strip()) in have: continue
    rows.append([x['sid'], x['n'], x['table'], x['title'], x['how'], x['label'], x['value']])
w('2-o-cc-chua-thanh-ban-ghi.tsv', ['NCC', 'n', 'bảng (chỉ số)', 'tên bảng', 'vị trí', 'nhãn / tiêu đề cột', 'ô nguyên văn'], rows)

# 3) số trơ / số > 100 không đơn vị L / cc trong bản ghi (không đổi): đang xử ra sao
rows = []
for y in b['inv']:
    if y['unit'] == 'cc' or (y['unit'] is None and (y['num'] or 0) > 100) or (y['unit'] is None and re.search(r'\d{3,}', y['value'] or '') and not y['num']):
        rows.append([y['sid'], y['n'], y['kind'], y['model'], y['key'], y['label'], y['value'], y['unit'], y['unitFrom'], ','.join(y['missing']), 'BLOCK (phiếu chống số thắng ở candidates) — missing unit' if y['kind'] == 'engine' else 'vai đầu phát: build() bỏ khoá disp'])
w('3-so-tro-lon.tsv', ['NCC', 'n', 'vai', 'model', 'khoá', 'nhãn', 'ô nguyên văn', 'đơn vị đọc', 'unitFrom', 'missing', 'hiện xử'], rows)

# 4) khoá động cơ bị đụng: số đông / dispExact trước → sau
k = json.load(open(S + 'keys1.json'))
rows = [[r['key'], r['model'], ' '.join(map(str, r['cc'])), ','.join(r['ccSup']), r['figsA'], r['figsB'], r['winA'], r['winB'], r['exactA'], r['exactB'], ','.join(r['cls']) or 'không đổi số thắng / dispExact (không có số đông trước và sau)'] for r in k]
w('4-khoa-dong-co.tsv', ['khoá', 'model', 'số cc → L', 'NCC ghi cc', 'phiếu trước (giá trị:số NCC)', 'phiếu sau', 'số thắng trước', 'số thắng sau', 'dispExact trước', 'dispExact sau', 'kết luận'], rows)
