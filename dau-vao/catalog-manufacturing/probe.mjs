const { loadSide } = await import("file:///C:/Projects/GenSet%20Pro/wt-manufacturing/suppliers/spec-diff.mjs");
const { C, S } = loadSide("C:/Projects/GenSet Pro/wt-manufacturing");
const before = [["alternator","Stamford"],["alternator","Leroy-Somer"],["alternator","Mecc Alte"],["alternator","AvK"],["controller","Deep Sea"],["controller","DEIF"],["controller","Woodward","easYgen-3000"],["controller","Woodward","easYgen-3000XT"],["controller","Woodward","easYgen-800"],["controller","Datakom"],["controller","ComAp"],["alternator","Marathon"]];
const show = (t) => { for (const [k, m, mo] of before) console.log(t, k, m, mo || "", JSON.stringify(C.madeIn(k, [m], "| X |", mo))); };
show("chưa build");
C.build(S);
show("sau build");
C.build([S[0]]);
console.log("sau build 1 NCC", JSON.stringify(C.madeIn("alternator", ["AvK"], "|x|")));
