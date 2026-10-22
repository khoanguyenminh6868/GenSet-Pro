#!/usr/bin/env python3
"""Turn the claude.ai artifact page (genbid-pro.html) into web/index.html for Vercel.

Usage: build-from-artifact.py <genbid-pro.html> <web/index.html>
Wraps the page in a full document and loads supabase-js + shim.js first, so the page's
window.claude.use("db" | "sample" | "downloads") calls are served by Supabase and /api/sample.
"""
import sys
src, out = sys.argv[1:3]
head = ('<!doctype html><html lang="vi"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
        '<link rel="icon" type="image/svg+xml" href="/favicon.svg">'
        '<link rel="apple-touch-icon" href="/favicon.svg">'
        '<meta name="theme-color" content="#14171c">'
        '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>'
        '<script src="/shim.js"></script>'
        '</head><body>')
import re
# The artifact file carries its own document skeleton; keep only what is inside its <body>.
page = open(src, encoding="utf-8").read()
page = re.sub(r"^<!doctype html><html><head>.*?</head><body>\n?", "", page, flags=re.S)
page = re.sub(r"\n?</body></html>\s*$", "", page)
open(out, "w", encoding="utf-8").write(head + page + "\n</body></html>")
print("wrote", out)
