// Builds the catalog off the page's thread (index.html catWork), so the page stays usable meanwhile.
// In: { suppliers }. Out: { cat }, or { error }. Then, only if the page takes that catalog, in: { save: { key, born } }:
// it is saved on this device (IndexedDB "genbid-catalog", the schema of index.html catStore) for the next reload.
importScripts("/catalog.js");

const save = ({ key, born }, cat) => new Promise((done) => {
  try {
    const r = indexedDB.open("genbid-catalog", 1);
    // The page creates the database before a build starts (catStore). Gone now = wiped meanwhile (shim.js, sign-in
    // failed): it is not made again. Made again by another page since: its `born` differs. Either way nothing is saved.
    r.onupgradeneeded = () => r.transaction.abort();
    r.onerror = r.onblocked = (e) => { e.preventDefault(); done(); };
    r.onsuccess = () => {
      const db = r.result;
      db.onversionchange = () => db.close();
      try {
        const t = db.transaction("built", "readwrite"), s = t.objectStore("built"), g = s.get("born");
        g.onsuccess = () => {
          if (g.result !== born) return;
          s.put(cat, "cat");
          s.put(key, "key");
        };
        t.oncomplete = t.onerror = t.onabort = () => { db.close(); done(); };
      } catch { db.close(); done(); }
    };
  } catch { done(); }
});

let built = null;
onmessage = async ({ data }) => {
  if (data.save) {
    if (built) await save(data.save, built);
    return close();
  }
  const C = self.GenbidCatalog;
  try {
    const cat = C.build(data.suppliers);
    // The brand-country and manufacturing-place filters read every row of every model (seconds): computed once, here.
    for (const e of [...cat.engines, ...cat.alternators, ...cat.controllers]) {
      const b = C.brandOf(e);
      e.origin = { brand: b.length ? b : ["?"], made: C.madeOf(e) };
    }
    built = cat;
  } catch (err) {
    postMessage({ error: String(err?.message || err) });
    return close();
  }
  postMessage({ cat: built });
};
