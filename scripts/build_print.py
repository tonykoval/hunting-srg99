#!/usr/bin/env python3
"""Stitch every chapter into a single print_full.html for one-shot PDF export.

Reads the <main class="chapter"> block from each chapter file (in reading
order), drops the per-chapter <script src=...> / KaTeX loader tags, keeps the
inline interactive scripts, and writes print_full.html at the repo root with a
single shared set of asset includes. Open it and Ctrl+P -> Save as PDF.

Pure standard library; run from the repo root:  python scripts/build_print.py
"""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CHAPTERS = [
    "part1_problem/ch01_problem.html",
    "part1_problem/ch02_structure.html",
    "part2_hunt/ch03_symmetry.html",
    "part2_hunt/ch04_sat.html",
    "part2_hunt/ch05_spectral.html",
    "part3_frontier/ch06_frontier.html",
    "appendix/notation.html",
    "appendix/theorems.html",
    "appendix/bibliography.html",
]

MAIN_RE = re.compile(r'<main class="chapter"[^>]*>(.*?)</main>', re.DOTALL)
SCRIPT_RE = re.compile(r'<script\b([^>]*)>(.*?)</script>', re.DOTALL)
# rewrite chapter-relative asset/links so they resolve from the repo root
REL_RE = re.compile(r'(href|src)="\.\./')

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hunting SRG(99) — Full Print Edition</title>
<link rel="stylesheet" href="assets/book.css">
<link rel="stylesheet" href="assets/print.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<style>
  @media screen {
    body { background:#eee; }
    main.chapter { background:#fff; padding:3em 3em 4em; margin:1em auto; max-width:45rem; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
  }
  section.printed-chapter h1.chapter-title { page-break-before: always; }
</style>
</head>
<body>
<div class="book-title-string">Hunting SRG(99)</div>

<main class="chapter" role="main">
<section class="printed-chapter title-page" style="text-align:center; padding-top:8rem;">
  <h1 style="font-size:2.6rem; margin-bottom:0.2em; border:none;">Hunting SRG(99)</h1>
  <p style="font-size:1.15rem; color:var(--muted); margin:0;">Conway's $1000 Problem: a Strongly Regular Graph on (99, 14, 1, 2)</p>
  <p style="margin-top:4rem; font-size:1.1rem;">Tony Koval</p>
  <p style="margin-top:8rem; font-size:0.9rem; color:var(--muted);">Content © 2026 CC-BY-4.0 · Code MIT · Version 1.0</p>
</section>
"""

FOOT_TEMPLATE = """</main>

<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script src="assets/book.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
        onload="BookInit.renderMath()"></script>
{inline_scripts}
</body>
</html>
"""


def main() -> None:
    sections: list[str] = []
    inline_scripts: list[str] = []

    for rel in CHAPTERS:
        html = (ROOT / rel).read_text(encoding="utf-8")

        m = MAIN_RE.search(html)
        if not m:
            raise SystemExit(f"no <main class='chapter'> found in {rel}")
        body = m.group(1)

        # collect inline (no src) scripts, then strip ALL scripts from the body
        for attrs, code in SCRIPT_RE.findall(body):
            if "src=" not in attrs and code.strip():
                inline_scripts.append(f"<script>{code}</script>")
        body = SCRIPT_RE.sub("", body)

        # fix ../assets and ../part... references to be root-relative
        body = REL_RE.sub(r'\1="', body)

        sections.append(f'<section class="printed-chapter">{body}</section>')

    out = HEAD + "\n".join(sections) + FOOT_TEMPLATE.format(
        inline_scripts="\n".join(inline_scripts)
    )
    dest = ROOT / "print_full.html"
    dest.write_text(out, encoding="utf-8")
    print(f"wrote {dest}  ({len(sections)} chapters, {len(inline_scripts)} interactive scripts)")


if __name__ == "__main__":
    main()
