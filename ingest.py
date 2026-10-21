#!/usr/bin/env python3
"""Store tender documents dropped in inbox/<TBMT>/ into Supabase for GenBid Pro (web).

The Windows PC worker pushes either
  inbox/<TBMT>/files/<original file name>   files downloaded through VNeGP Client Agent, or
  inbox/<TBMT>/error.txt                    why the files could not be fetched.
Files go to storage "blobs/<md5>", the list to docs hsmt/<TBMT>, text to hsmttext/<TBMT>_<i>,
and the request hsmtreq/<TBMT> is marked done (or failed).
Usage: ingest.py <TBMT> [<TBMT> ...]   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment)
"""
import datetime, hashlib, json, mimetypes, os, re, subprocess, sys, urllib.parse, urllib.request, zipfile
from pathlib import Path

URL = os.environ["SUPABASE_URL"].rstrip("/")
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
CHUNK = 190_000
TEXT_EXT = {".pdf", ".docx", ".txt"}


def call(method, path, body=None, headers=None):
    h = {"apikey": KEY, "Authorization": "Bearer " + KEY, **(headers or {})}
    req = urllib.request.Request(URL + path, data=body, method=method, headers=h)
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()


def now():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def get_doc(coll, id):
    q = urllib.parse.urlencode({"coll": "eq." + coll, "id": "eq." + id, "select": "data"})
    rows = json.loads(call("GET", "/rest/v1/docs?" + q))
    return rows[0]["data"] if rows else None


def put_docs(rows):
    body = json.dumps([{**r, "updated_at": now()} for r in rows], ensure_ascii=False).encode()
    call("POST", "/rest/v1/docs", body, {"Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal"})


def to_text(f: Path) -> str:
    ext = f.suffix.lower()
    try:
        if ext == ".pdf":
            return subprocess.run(["pdftotext", "-layout", str(f), "-"], capture_output=True, text=True, timeout=300).stdout
        if ext == ".docx":
            xml = zipfile.ZipFile(f).read("word/document.xml").decode("utf8", "replace")
            xml = re.sub(r"</w:p>", "\n", xml)
            xml = re.sub(r"<w:tab/>", "\t", xml)
            return re.sub(r"<[^>]+>", "", xml).replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
        if ext == ".txt":
            return f.read_text(errors="replace")
    except Exception as e:
        print(f"  cannot read text of {f.name}: {e}")
    return ""


def chunks(text):
    out, b = [], text.encode()
    while b:
        cut = min(len(b), CHUNK)
        while cut < len(b) and (b[cut] & 0xC0) == 0x80:
            cut -= 1
        out.append(b[:cut].decode())
        b = b[cut:]
    return out


def ingest(key):
    d = Path("inbox") / key
    req = get_doc("hsmtreq", key) or {"notifyNo": key}
    err = d / "error.txt"
    files = sorted(p for p in (d / "files").glob("**/*") if p.is_file()) if (d / "files").is_dir() else []
    if err.exists() and not files:
        put_docs([{"coll": "hsmtreq", "id": key, "data": {**req, "doneAt": now(), "error": err.read_text(errors="replace").strip()[:500]}}])
        print(f"{key}: marked failed")
        return
    recs, texts = [], []
    for f in files:
        raw = f.read_bytes()
        id = hashlib.md5(raw).hexdigest()
        ctype = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
        call("POST", "/storage/v1/object/blobs/" + id, raw, {"Content-Type": ctype, "x-upsert": "true"})
        text = to_text(f) if f.suffix.lower() in TEXT_EXT else ""
        has = len(re.sub(r"\s", "", text)) > 40
        name = str(f.relative_to(d / "files"))
        recs.append({"name": name, "size": len(raw), "hasText": has, "converted": False, "path": name, "url": "/_blob/" + id})
        if has:
            texts.append(f"--- Tệp: {name} ---\n{text.strip()}")
        print(f"  {name}: {len(raw)} bytes, {ctype}, text={'yes' if has else 'no'}")
    parts = chunks("\n\n".join(texts))
    prev = get_doc("hsmt", key) or {}
    doc = {**prev, "notifyNo": key, "updatedAt": now(), "source": "muasamcong (VNeGP Agent)", "files": recs, "textChunks": len(parts)}
    rows = [{"coll": "hsmttext", "id": f"{key}_{i}", "data": {"text": t}} for i, t in enumerate(parts)]
    rows.append({"coll": "hsmt", "id": key, "data": doc})
    rows.append({"coll": "hsmtreq", "id": key, "data": {**req, "doneAt": now(), "error": ""}})
    put_docs(rows)
    print(f"{key}: {len(recs)} files, {len(parts)} text chunks")


if __name__ == "__main__":
    for k in sys.argv[1:]:
        if re.fullmatch(r"[A-Z]{2}\d{6,}", k):
            ingest(k)
