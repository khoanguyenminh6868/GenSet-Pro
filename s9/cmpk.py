import json
a=json.load(open('base.json'));b=json.load(open('new.json'))
ka,kb=a['maj'],b['maj']
for k in sorted(set(ka)|set(kb)):
  x,y=ka.get(k),kb.get(k)
  if x!=y:
    f=lambda z: None if z is None else (z['win'],z['votes'],z['exact'],z['figs'])
    print(k,(y or x)['model'],'\n  TRƯỚC',f(x),'\n  SAU  ',f(y))
ia={(r['sid'],r['n'],r['kind'],r['model'],r['value']) for r in a['inv']}
for r in b['inv']:
  if (r['sid'],r['n'],r['kind'],r['model'],r['value']) not in ia: print('INV+',r['sid'],r['n'],r['model'],repr(r['value']),r['unit'],r['num'],r['conv'],r['missing'],r['geo'])
print(len(a['inv']),len(b['inv']))
