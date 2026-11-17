import * as L from "./lib.mjs";
const C=L.corpus(); const env=new L.Env(L.loadSuppliers());
const e=C.get("IB2600581977"); const cap=L.sizesOfEntry(e).runs[0].cap;
const r=env.prep(e,cap);
const dps=r.dropped.filter(x=>x.ruled.includes("prime"));
const kinds={};
for(const d of dps.slice(0,400)){const u=d.u; const k=Object.keys(u.power||{}).join("+"); kinds[k]=(kinds[k]||0)+1}
console.log(kinds);
for (const d of dps.filter((_,i)=>i%60==0).slice(0,6)){const u=d.u;console.log(JSON.stringify({sid:u.supplierId,kind:u.kind,header:u.header,title:u.title,line:(u.line||"").slice(0,200),power:u.power,table:u.table,row:u.row}));}
process.exit(0);
