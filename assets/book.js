/* Hunting SRGs — shared interactive helpers */

(function () {
    "use strict";

    // ---------- KaTeX auto-render ----------

    function renderMath() {
        if (typeof renderMathInElement === "function") {
            renderMathInElement(document.body, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "\\[", right: "\\]", display: true },
                    { left: "$",  right: "$",  display: false },
                    { left: "\\(", right: "\\)", display: false }
                ],
                throwOnError: false,
                strict: false
            });
        }
    }

    // ---------- Current-page highlight in sidebar ----------

    function highlightCurrentNav() {
        const here = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".nav-sidebar a").forEach(a => {
            const target = a.getAttribute("href").split("/").pop();
            if (target === here) a.classList.add("current");
        });
    }

    // ---------- SRG feasibility calculator ----------
    // Publishes window.SRG with pure-JS helpers used by chapter widgets.

    function srgDerive(n, k, lam, mu) {
        // Returns { feasible, r, s, f, g, reason } given (n, k, λ, μ).
        if (!Number.isInteger(n) || !Number.isInteger(k) ||
            !Number.isInteger(lam) || !Number.isInteger(mu)) {
            return { feasible: false, reason: "Non-integer parameter" };
        }
        if (!(0 < k && k < n - 1)) return { feasible: false, reason: "Need 0 < k < n-1" };
        if (lam < 0 || lam >= k) return { feasible: false, reason: "Need 0 ≤ λ < k" };
        if (mu <= 0 || mu > k) return { feasible: false, reason: "Need 0 < μ ≤ k" };

        // Handshake: k(k - λ - 1) = (n - k - 1) μ
        if (k * (k - lam - 1) !== (n - k - 1) * mu) {
            return { feasible: false, reason: "k(k−λ−1) ≠ (n−k−1)μ (handshake fails)" };
        }

        // Eigenvalues: x² − (λ − μ) x − (k − μ) = 0
        const b = lam - mu;
        const c = -(k - mu);
        const disc = b * b - 4 * c;
        if (disc < 0) return { feasible: false, reason: "Discriminant < 0" };
        const sqd = Math.sqrt(disc);
        const r = (b + sqd) / 2;
        const s = (b - sqd) / 2;

        // Multiplicities
        // f = ((n-1) - ((2k + (n-1)(λ−μ)) / sqrt(disc))) / 2  requires sqd ≠ 0
        let f, g;
        if (sqd === 0) {
            // conference case: λ − μ = 0, n = 4μ + 1, k = 2μ; multiplicities n−1 equally split? rare.
            f = (n - 1) / 2;
            g = (n - 1) / 2;
        } else {
            f = ((n - 1) - (2 * k + (n - 1) * (lam - mu)) / sqd) / 2;
            g = (n - 1) - f;
        }

        const mult_integer = Number.isInteger(f) && Number.isInteger(g);

        return {
            feasible: mult_integer,
            r, s, f, g,
            reason: mult_integer ? "Parameter tuple is feasible" : "Non-integer multiplicities"
        };
    }

    function srgFormat(obj) {
        if (!obj.feasible) return obj.reason;
        const rfmt = Number.isInteger(obj.r) ? obj.r : obj.r.toFixed(4);
        const sfmt = Number.isInteger(obj.s) ? obj.s : obj.s.toFixed(4);
        return `r = ${rfmt},  s = ${sfmt},  f = ${obj.f},  g = ${obj.g}`;
    }

    window.SRG = { derive: srgDerive, format: srgFormat };

    // ---------- Linear-algebra helpers (Part 0 primer) ----------
    // Small, dependency-free routines for the primer interactives.

    function trace(M) {
        let t = 0;
        for (let i = 0; i < M.length; i++) t += M[i][i];
        return t;
    }

    function matVec(M, v) {
        return M.map(row => row.reduce((s, a, j) => s + a * v[j], 0));
    }

    function matMul(A, B) {
        const n = A.length, m = B[0].length, p = B.length;
        const C = Array.from({ length: n }, () => new Array(m).fill(0));
        for (let i = 0; i < n; i++)
            for (let k = 0; k < p; k++)
                for (let j = 0; j < m; j++) C[i][j] += A[i][k] * B[k][j];
        return C;
    }

    // Cyclic Jacobi eigensolver for a real SYMMETRIC matrix (small n).
    // Returns { values: [..desc], vectors: [eigvec0, eigvec1, ...] }.
    function eigSymmetric(M) {
        const n = M.length;
        const a = M.map(r => r.slice());
        const V = Array.from({ length: n }, (_, i) =>
            Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
        for (let sweep = 0; sweep < 100; sweep++) {
            let off = 0;
            for (let p = 0; p < n; p++)
                for (let q = p + 1; q < n; q++) off += a[p][q] * a[p][q];
            if (off < 1e-20) break;
            for (let p = 0; p < n; p++) {
                for (let q = p + 1; q < n; q++) {
                    if (Math.abs(a[p][q]) < 1e-15) continue;
                    const phi = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]);
                    const c = Math.cos(phi), s = Math.sin(phi);
                    for (let i = 0; i < n; i++) {
                        const aip = a[i][p], aiq = a[i][q];
                        a[i][p] = c * aip - s * aiq;
                        a[i][q] = s * aip + c * aiq;
                    }
                    for (let i = 0; i < n; i++) {
                        const api = a[p][i], aqi = a[q][i];
                        a[p][i] = c * api - s * aqi;
                        a[q][i] = s * api + c * aqi;
                    }
                    for (let i = 0; i < n; i++) {
                        const vip = V[i][p], viq = V[i][q];
                        V[i][p] = c * vip - s * viq;
                        V[i][q] = s * vip + c * viq;
                    }
                }
            }
        }
        const raw = a.map((r, i) => r[i]);
        const idx = raw.map((_, i) => i).sort((x, y) => raw[y] - raw[x]);
        return {
            values: idx.map(i => raw[i]),
            vectors: idx.map(i => V.map(r => r[i])),
        };
    }

    // Round near-integers, group identical eigenvalues into {value, mult}.
    function spectrumSummary(values, tol = 1e-6) {
        const out = [];
        const sorted = values.slice().sort((a, b) => b - a);
        for (const v of sorted) {
            const rounded = Math.abs(v - Math.round(v)) < tol ? Math.round(v) : v;
            const last = out[out.length - 1];
            if (last && Math.abs(last.value - rounded) < tol) last.mult++;
            else out.push({ value: rounded, mult: 1 });
        }
        return out;
    }

    window.LinAlg = { trace, matVec, matMul, eigSymmetric, spectrumSummary };

    // ---------- Init ----------

    function init() {
        highlightCurrentNav();
        // KaTeX auto-render fires after the KaTeX auto-render extension has loaded;
        // the HTML pages add a <script onload> that calls window.BookInit.renderMath.
        renderMath();
    }

    window.BookInit = { init, renderMath };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
