#!/usr/bin/env python3
"""Pack the claude.ai artifact's data and files into genbid-data.zip for the web version's /#import panel.

Usage: make-bundle.py <dump_dir> <blobs_dir> <out.zip>
<dump_dir>: ArtifactData `list ... out_dir` dumps (<dump_dir>/<collection>/<doc>.json).
<blobs_dir>: artifact assets saved by id (<id>.pdf, <id>.ttf, ...).
"""
import json, os, sys, zipfile
dump, blobs, out = sys.argv[1:4]
rows = []
for coll in sorted(os.listdir(dump)):
    d = os.path.join(dump, coll)
    if not os.path.isdir(d): continue
    for f in sorted(os.listdir(d)):
        if not f.endswith(".json"): continue
        rows.append({"coll": coll, "id": f[:-5], "data": json.load(open(os.path.join(d, f)))})
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("data.json", json.dumps(rows, ensure_ascii=False))
    files = sorted(os.listdir(blobs)) if os.path.isdir(blobs) else []
    for f in files: z.write(os.path.join(blobs, f), "blobs/" + f)
print(out, os.path.getsize(out), "bytes;", len(rows), "docs;", len(files), "files")
