# Hunting SRG(99)

**Conway's $1000 problem: does a strongly regular graph (99, 14, 1, 2) exist?**

An interactive book on the most famous open door in the strongly-regular-graph
tables. John Conway offered **$1000** for a graph on 99 vertices in which every
edge lies in a unique triangle (λ = 1) and every non-edge in a unique
quadrilateral (μ = 2). A decade on, nobody has collected.

The parameters pass every feasibility test (integral spectrum `{14, 3⁵⁴, (−4)⁴⁴}`,
Krein, absolute bound, …) yet no graph has been built and none proved impossible.
A neighbour, `SRG(85,14,3,2)`, was *refuted* by Shpectorov–Zhao (2025); Conway's
remains open.

## What the hunt has established

- **14-regularity is forced**, and every neighbourhood is exactly **seven disjoint
  edges** (claw-free) — the local fingerprint every attack uses.
- **No automorphism of order 11 or 3**, and **no abelian Cayley graph** — exhaustive
  orbit-matrix / difference-set runs, all UNSAT.
- **SAT cannot decide it** (Keramatipour 2023) — the obstruction is the *absence of
  symmetry*, not the solver.
- **The triangle-Gram filter that settled (85,14,3,2) uniquely does *not* engage**
  here: the amenability margin is `39 − 44 = −5 < 0`. The folklore "λ = 1 is
  tractable" is, for Conway-99, false.

What remains: the famous **order-7 door** `[1, 7¹⁴]` (Cesarz–Woldar 2023; 281 M
solver nodes, not exhausted), the **involutions** (46 configurations), and the
**rigid core**. A lifted matrix wins the prize; full exhaustion refutes the graph.

## Read it

Open **`index.html`** in any browser — plain static assets, no build step. Math
renders with KaTeX; the automorphism sweep is an interactive table.

| Part | Chapters |
|------|----------|
| **I — The Problem** | 1. Conway's $1000 Problem · 2. Spectrum &amp; Local Structure |
| **II — The Hunt** | 3. Symmetry &amp; the Order-7 Door · 4. The SAT Verdict · 5. Spectral &amp; Geometric Attacks |
| **III — Frontier** | 6. Findings &amp; the Frontier |
| **Appendices** | A. Notation · B. Theorems &amp; Proofs · C. Bibliography |

## Print to PDF

```
python scripts/build_print.py     # writes print_full.html
```

## Companion code &amp; sister volumes

Search engine: [github.com/tonykoval/orbit-gen](https://github.com/tonykoval/orbit-gen).
Sister volumes:
[Hunting SRG(37)](https://github.com/tonykoval/hunting-srg37) (catalog completeness)
and [Hunting SRG(69)](https://github.com/tonykoval/hunting-srg69) (smallest open
existence question).

## Licence

Content CC-BY-4.0; code MIT.
