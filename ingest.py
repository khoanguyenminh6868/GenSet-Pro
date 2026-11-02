#!/usr/bin/env python3
"""Record tender documents listed in inbox/<TBMT>/ in Supabase for GenBid Pro (web).

The Windows PC worker uploads the files downloaded through VNeGP Client Agent to the GitHub Release
"hsmt-<TBMT>" and pushes
  inbox/<TBMT>/release.json   {tag, files: [{name, size, asset, assetName}]}, and/or
  inbox/<TBMT>/error.txt      files left out (too large) or why nothing could be fetched.
The files stay on the release (the web serves them at /_gh/<asset>); only the list goes to docs hsmt/<TBMT>,
text to hsmttext/<TBMT>_<i>, and the request hsmtreq/<TBMT> is marked done (or failed).
Usage: ingest.py <TBMT> [<TBMT> ...]
(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GH_TOKEN and GH_REPO in the environment)
"""
import datetime, json, os, re, subprocess, sys, tempfile, urllib.error, urllib.parse, urllib.request, zipfile
from pathlib import Path

URL = os.environ["SUPABASE_URL"].rstrip("/")
KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
GH_TOKEN = os.environ["GH_TOKEN"]
GH_REPO = os.environ["GH_REPO"]
CHUNK = 190_000
TEXT_EXT = {".pdf", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".tif", ".tiff"}
# Scanned pages (no text layer) and pictures are read with Tesseract OCR in Vietnamese (Khoa, 2026-11-02), so the
# analysis and its quote check see them as text. A page counts as scanned below this many letters.
OCR_MIN_CHARS = 60
OCR_MAX_PAGES = 300


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


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def download_asset(asset, dest: Path):
    # The API answers 302 to a signed link that must be fetched without the GitHub token.
    req = urllib.request.Request(f"https://api.github.com/repos/{GH_REPO}/releases/assets/{asset}",
                                 headers={"Authorization": "Bearer " + GH_TOKEN, "Accept": "application/octet-stream"})
    try:
        r = urllib.request.build_opener(NoRedirect).open(req, timeout=120)
    except urllib.error.HTTPError as e:
        if e.code not in (301, 302, 307):
            raise
        r = urllib.request.urlopen(e.headers["Location"], timeout=600)
    with r, open(dest, "wb") as out:
        while b := r.read(1 << 20):
            out.write(b)


def ocr_image(img) -> str:
    r = subprocess.run(["tesseract", str(img), "-", "-l", "vie+eng", "--psm", "3"], capture_output=True, text=True, timeout=300,
                       env={**os.environ, "OMP_THREAD_LIMIT": "1"})
    return r.stdout


def ocr_pages(f: Path, pages) -> dict:
    """OCR the given 1-based pages of a PDF, four at a time; returns {page: text}."""
    from concurrent.futures import ThreadPoolExecutor

    def one(n):
        with tempfile.TemporaryDirectory() as t:
            subprocess.run(["pdftoppm", "-r", "300", "-gray", "-png", "-f", str(n), "-l", str(n), str(f), f"{t}/p"], capture_output=True, timeout=300)
            imgs = sorted(Path(t).glob("p*.png"))
            return n, ocr_image(imgs[0]) if imgs else ""

    with ThreadPoolExecutor(4) as ex:
        return dict(ex.map(one, pages))


def pdf_text(f: Path):
    """Text of a PDF page by page (pdftotext ends each page with a form feed), scanned pages through OCR.
    Returns (text, number of pages read by OCR)."""
    pages = subprocess.run(["pdftotext", "-layout", str(f), "-"], capture_output=True, text=True, timeout=300).stdout.split("\f")
    if pages and not pages[-1].strip():
        pages.pop()
    scanned = [i + 1 for i, t in enumerate(pages) if len(re.sub(r"\s", "", t)) < OCR_MIN_CHARS][:OCR_MAX_PAGES]
    if scanned:
        print(f"  {f.name}: OCR {len(scanned)}/{len(pages)} pages")
        for n, t in ocr_pages(f, scanned).items():
            pages[n - 1] = t
    return "\f".join(pages), len(scanned)


def to_text(f: Path, info=None) -> str:
    ext = f.suffix.lower()
    try:
        if ext == ".pdf":
            text, n = pdf_text(f)
            if info is not None and n:
                info["ocr"] = n
            return text
        if ext in {".jpg", ".jpeg", ".png", ".tif", ".tiff"}:
            if info is not None:
                info["ocr"] = 1
            return ocr_image(f)
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
    rel = d / "release.json"
    files = json.loads(rel.read_text(encoding="utf-8"))["files"] if rel.exists() else []
    if not files:
        reason = err.read_text(errors="replace").strip()[:500] if err.exists() else "Không có tệp nào."
        put_docs([{"coll": "hsmtreq", "id": key, "data": {**req, "doneAt": now(), "error": reason}}])
        print(f"{key}: marked failed")
        return
    recs, texts = [], []
    with tempfile.TemporaryDirectory() as tmp:
        for f in files:
            name = f["name"]
            text = ""
            if Path(name).suffix.lower() in TEXT_EXT:
                local = Path(tmp) / f["assetName"]
                download_asset(f["asset"], local)
                info = {}
                text = to_text(local, info)
                local.unlink()
            has = len(re.sub(r"\s", "", text)) > 40
            recs.append({"name": name, "size": f["size"], "hasText": has, "converted": False, "path": name, "url": f"/_gh/{f['asset']}", **info})
            if has:
                texts.append(f"--- Tệp: {name} ---\n{text.strip()}")
            print(f"  {name}: {f['size']} bytes, asset {f['asset']}, text={'yes' if has else 'no'}")
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
