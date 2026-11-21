import json, os
S = '/tmp/claude-0/-home-user-GenSet-Pro/ac33377a-8e39-516e-b2ec-979c8f8a7de9/scratchpad/'
OUT = S + 'nt9/s9/'
os.makedirs(OUT, exist_ok=True)
src = [l.rstrip('\n').split('\t') for l in open(S + 'nt/s8-1/2-o-cc-chua-thanh-ban-ghi.tsv', encoding='utf8')]
head, rows = src[0], src[1:]
A = ('A', 'bảng không ghi mã động cơ (chỉ model tổ máy / không model): Khoa 21/11 không đọc', 'không')
CLS = {
  ('bison-zhejiang', '108', '7'): A,
  ('bison-zhejiang', '114', '16'): ('B', 'mã có nhưng bảng không ghi vai: dòng "Model" trơ (1E45F, BS156F…) dưới tên tổ máy; Khoa 21/11 (kingway n117) không lấy vai', 'không'),
  ('bison-zhejiang', '114', '17'): ('B', 'như trên (BS177F, BS188F…)', 'không'),
  ('bison-zhejiang', '114', '18'): ('B', 'như trên (BS192F, BS2V78F…)', 'không'),
  ('bison-zhejiang', '1003', '32'): ('A', 'bảng OCR không có dòng model nào (chỉ thông số theo cột)', 'không'),
  ('bison-zhejiang', '1003', '34'): ('B', '"Model | BS168F | 8S170 | 8S168F | BS170" trơ, mã OCR lỗi (8S…)', 'không'),
  ('bison-zhejiang', '1003', '36'): ('C', 'bảng OCR gộp nhiều catalog, dòng không thẳng cột, nhiều dòng "Model" (bản ghi cũ BS170F genset=1E45F của bảng này vẫn như cũ)', 'không'),
  ('byc-power', '101', '0'): ('A', 'bảng dọc: model tổ máy CKD1000E, không mã động cơ', 'không'),
  ('cameo-power', '122', '13'): A,
  ('endress-stromerzeuger', '129', '26'): ('R', '"Engine Type | Yanmar - <mã>" nhưng không có dòng "Model" tổ máy (verticalRecords cần) → ENGINE_LINES', 'ĐỌC'),
  ('endress-stromerzeuger', '130', '27'): ('R', 'như trên', 'ĐỌC'),
  ('endress-stromerzeuger', '137', '34'): ('R', 'như trên', 'ĐỌC'),
  ('frs-shenyang', '108', '7'): ('A', 'bảng tổ máy không mã động cơ; đã đọc ở gensetsOf (GENSET_TABLES frsSmall, cột "排量 （cc）"): bản ghi tổ máy, không vào động cơ, chưa nối Gợi ý', 'không (đã ở gensetsOf)'),
  ('frs-shenyang', '108', '8'): ('A', 'như trên', 'không (đã ở gensetsOf)'),
  ('gillette-generators', '101', '0'): ('R', 'ô động cơ "HONDA GX390 O.H.V. (3 YEARS)" không qua isCode; ô dung tích hai đơn vị "23.7 CU. IN. (390 CC)" → ENGINE_LINES + spec-norm sameVolume', 'ĐỌC'),
  ('gillette-generators', '102', '1'): ('R', 'như n101 (dòng nguyên văn trùng n101: mergeRepeats gộp vào bản ghi n101, also n102)', 'ĐỌC (gộp n101)'),
  ('gillette-generators', '103', '2'): ('R', 'như n101 (GX630)', 'ĐỌC'),
  ('gillette-generators', '104', '3'): ('R', 'như n103 (gộp vào bản ghi n103, also n104)', 'ĐỌC (gộp n103)'),
  ('gillette-generators', '105', '4'): ('R', 'như n101 (KOHLER KD440 …)', 'ĐỌC'),
  ('jet-power', '110', '9'): A,
  ('jet-power', '120', '17'): ('D', 'ô hai mã "GE160 (168F)" dưới "Model" trơ: không bản ghi động cơ', 'không'),
  ('kena-chongqing', '108', '2'): ('E', '"Engine Model(F) | 170 | 190 …": mã là số trơ, chữ "F" chỉ ở nhãn; ghép "170F" là suy ra', 'không (hỏi Khoa)'),
  ('slong-power', '103', '2'): ('B', 'bảng dọc: "Model" thứ hai trơ (SL460) không ghi vai động cơ', 'không'),
  ('slong-power', '108', '7'): ('B', 'như trên', 'không'),
  ('slong-power', '116', '8'): ('B', 'như trên (GB1000)', 'không'),
  ('slong-power', '144', '12'): ('B', 'như trên', 'không'),
  ('victory-generator', '123', '35'): ('R', 'bảng không phải bảng nhãn (đọc theo dòng): "Displacement (cc) | 418" không gắn được vào động cơ LA186FAG → ENGINE_LINES thêm vào bản ghi sẵn có', 'ĐỌC'),
  ('victory-generator', '124', '36'): ('F', 'LT420 ghi 418 nhưng chính victory n131 ghi 420 cho LT420 (418 là số LA186FAG ở n123): không đọc chắc', 'không'),
  ('winco', '1001', '5'): ('R', 'ô "160 CC / OHV" (OHV là kiểu xu-páp) + ô động cơ "GC160 OHC" không qua isCode → ENGINE_LINES', 'ĐỌC'),
  ('winco', '1002', '6'): ('R', 'ô "160CC/ OHV" không qua SPEC.disp.ok → ENGINE_LINES thêm vào bản ghi GC160 sẵn có', 'ĐỌC'),
  ('winco', '1003', '7'): ('R', 'ô "570CC/ OHV" như trên (bản ghi VANGUARD 3564 sẵn có)', 'ĐỌC'),
  ('zc-power', '104', '4'): A,
}
# endress "Model" trơ
for n, ti in [('123', '20'), ('126', '23'), ('127', '24'), ('128', '25'), ('135', '32'), ('142', '39'), ('143', '40'), ('145', '42'), ('146', '43')]:
    CLS[('endress-stromerzeuger', n, ti)] = ('B', 'bảng dọc "Model | <mã Perkins / Yanmar / FPT>" trơ, không ghi vai động cơ (Khoa 21/11, kingway n117); không có dòng "Engine"', 'không (hỏi Khoa)')
b = json.load(open(S + 'new.json'))
res = {}
for r in b['inv']:
    if r['conv'] and r['conv'].get('formula') == 'l_from_cc':
        res[(r['sid'], str(r['n']), r['value'].strip())] = f"{r['kind']} {r['model']}: \"{r['value']}\" → {r['num']} L"
with open(OUT + '1-phan-loai-129-o.tsv', 'w', encoding='utf8') as f:
    f.write('\t'.join(head + ['lớp', 'nguyên nhân', 'đọc được', 'kết quả nhánh cc-129']) + '\n')
    cnt = {}
    for x in rows:
        k = (x[0], x[1], x[2]); c = CLS[k]
        v = x[6].strip()
        got = res.get((x[0], x[1], v)) or res.get((x[0], x[1], v.replace('1 CYLINDER, ', '').replace('2 CYLINDER, ', ''))) or res.get((x[0], x[1], v.split('/')[0].strip()))
        if c[2].startswith('ĐỌC') and not got and x[1] in ('102', '104'): got = 'gộp vào bản ghi n%s (mergeRepeats)' % ('101' if x[1] == '102' else '103')
        f.write('\t'.join(x + [c[0], c[1], c[2], got or '']) + '\n')
        cnt[c[0]] = cnt.get(c[0], 0) + 1
print(cnt, sum(cnt.values()))
