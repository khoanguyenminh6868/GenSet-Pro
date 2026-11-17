import fs from "node:fs";
const [a,b]=process.argv.slice(2).map(f=>JSON.parse(fs.readFileSync(f)));
for(const k of ["engines","alternators"]){
 const A=new Map(a[k].map(x=>[x.key,x])),B=new Map(b[k].map(x=>[x.key,x]));
 const lost=[...A.keys()].filter(x=>!B.has(x)), gained=[...B.keys()].filter(x=>!A.has(x));
 console.log(k,"before",A.size,"after",B.size,"lost",lost.length,"gained",gained.length);
 console.log(" LOST:",lost.join(" | ")); console.log(" GAINED:",gained.join(" | "));
}
