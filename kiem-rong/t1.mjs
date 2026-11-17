import * as L from "./lib.mjs";
const C=L.corpus(); const env=new L.Env(L.loadSuppliers());
const e=C.get("IB2600574589"); const cap=L.sizesOfEntry(e).runs[0].cap;
env.prep(e,cap);
for (let i=0;i<3;i++){ let t=Date.now(); const r=env.prep(e,cap); console.log("prep",Date.now()-t); }
let t=Date.now(); L.B.hintsOf(e.text,""); console.log("hintsOf",Date.now()-t);
t=Date.now(); L.B.originOfHsmt(e.parts.join("")); console.log("origin",Date.now()-t);
t=Date.now(); L.BP.brandSyncOf(e.text); console.log("sync",Date.now()-t);
process.exit(0);
