// Builds the catalog off the page's thread (index.html catWork), so the page stays usable meanwhile.
// In: { suppliers, key }. Out: { cat }, or { error }. With a key, the catalog is then saved on this device
// (IndexedDB "genbid-catalog", the schema of index.html catStore) for the next reload.
importScripts("/catalog.js");

const save = (key, cat) => new Promise((done) => {
  try {
    const r = indexedDB.open("genbid-catalog", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("built");
    r.onerror = r.onblocked = () => done();
    r.onsuccess = () => {
      const db = r.result;
      db.onversionchange = () => db.close();
      try {
        const t = db.transaction("built", "readwrite"), s = t.objectStore("built");
        s.put(cat, "cat");
        s.put(key, "key");
        t.oncomplete = t.onerror = t.onabort = () => { db.close(); done(); };
      } catch { db.close(); done(); }
    };
  } catch { done(); }
});

onmessage = async ({ data }) => {
  const C = self.GenbidCatalog;
  let cat;
  try {
    cat = C.build(data.suppliers);
    // The brand-country and manufacturing-place filters read every row of every model (seconds): computed once, here.
    for (const e of [...cat.engines, ...cat.alternators, ...cat.controllers]) {
      const b = C.brandOf(e);
      e.origin = { brand: b.length ? b : ["?"], made: C.madeOf(e) };
    }
  } catch (err) {
    postMessage({ error: String(err?.message || err) });
    return close();
  }
  postMessage({ cat });
  if (data.key) await save(data.key, cat);
  close();
};
