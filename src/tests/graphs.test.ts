// ─────────────────────────────────────────────────────────────────────────────
// tests/graphs.test.ts
// Phase 3: Unit tests for chart data calculations used in PerformanceGraphs.
//
// All tests validate data that the graph component assembles from the existing
// calculation module. No chart rendering is tested here — these are pure maths
// tests against the formulas used to produce graph data points.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { calculateSpeedup, calculateMaxSpeedup } from "../calculations/amdahl";

const CHART_CORES = [1, 4, 16, 32, 64, 128, 256];

// ── Graph 1 data: Cores vs Speedup ────────────────────────────────────────────

describe("Graph 1 — chart data: Cores vs Speedup", () => {
  const P = 0.85;

  it("produces 7 data points (one per CHART_CORES entry)", () => {
    const data = CHART_CORES.map((n) => ({
      cores: n,
      speedup: calculateSpeedup(P, n),
    }));
    expect(data).toHaveLength(7);
  });

  it("speedup at N=1 is 1.0000 (baseline)", () => {
    expect(calculateSpeedup(P, 1)).toBeCloseTo(1.0, 8);
  });

  it("speedup at N=4 matches project reference (~2.7586)", () => {
    expect(calculateSpeedup(P, 4)).toBeCloseTo(2.7586, 3);
  });

  it("speedup at N=16 matches project reference (~4.9231)", () => {
    expect(calculateSpeedup(P, 16)).toBeCloseTo(4.9231, 3);
  });

  it("speedup at N=64 matches project reference (~6.1244)", () => {
    expect(calculateSpeedup(P, 64)).toBeCloseTo(6.1244, 3);
  });

  it("speedup never exceeds max theoretical speedup", () => {
    const max = calculateMaxSpeedup(P);
    CHART_CORES.forEach((n) => {
      const s = calculateSpeedup(P, n);
      expect(s).toBeLessThanOrEqual(max + 1e-9);
    });
  });

  it("speedup increases monotonically with core count", () => {
    for (let i = 0; i < CHART_CORES.length - 1; i++) {
      expect(calculateSpeedup(P, CHART_CORES[i])).toBeLessThan(
        calculateSpeedup(P, CHART_CORES[i + 1])
      );
    }
  });

  it("max theoretical speedup reference line is ~6.6667 for P=0.85", () => {
    expect(calculateMaxSpeedup(P)).toBeCloseTo(6.6667, 3);
  });

  it("no NaN values in chart data", () => {
    CHART_CORES.forEach((n) => {
      expect(Number.isNaN(calculateSpeedup(P, n))).toBe(false);
    });
  });

  it("no Infinity in chart data for P < 1", () => {
    CHART_CORES.forEach((n) => {
      expect(isFinite(calculateSpeedup(P, n))).toBe(true);
    });
  });

  it("fully serial (P=0): all speedups = 1, no variation", () => {
    CHART_CORES.forEach((n) => {
      expect(calculateSpeedup(0, n)).toBeCloseTo(1.0, 8);
    });
  });

  it("fully parallel (P=1): speedup equals core count (ideal)", () => {
    CHART_CORES.forEach((n) => {
      expect(calculateSpeedup(1, n)).toBeCloseTo(n, 8);
    });
  });
});

// ── Graph 2 data: Ideal vs Actual ─────────────────────────────────────────────

describe("Graph 2 — chart data: Ideal vs Actual Speedup", () => {
  const P = 0.85;

  it("ideal speedup equals core count for all N", () => {
    CHART_CORES.forEach((n) => {
      // ideal = N
      expect(n).toBe(n); // tautological sanity check
    });
    // More useful: actual < ideal for N > 1 when 0 < P < 1
    CHART_CORES.filter((n) => n > 1).forEach((n) => {
      expect(calculateSpeedup(P, n)).toBeLessThan(n);
    });
  });

  it("gap between ideal and actual grows as N increases", () => {
    for (let i = 0; i < CHART_CORES.length - 1; i++) {
      const n1 = CHART_CORES[i];
      const n2 = CHART_CORES[i + 1];
      const gap1 = n1 - calculateSpeedup(P, n1);
      const gap2 = n2 - calculateSpeedup(P, n2);
      expect(gap2).toBeGreaterThan(gap1);
    }
  });

  it("at N=1 both ideal and actual are 1.0", () => {
    expect(calculateSpeedup(P, 1)).toBeCloseTo(1.0, 8);
    expect(1).toBe(1); // ideal = N = 1
  });

  it("at N=256 actual is much less than ideal (demonstrates serial bottleneck)", () => {
    const actual = calculateSpeedup(P, 256);
    const ideal  = 256;
    // Actual should be less than 7× while ideal is 256×
    expect(actual).toBeLessThan(7);
    expect(ideal).toBe(256);
  });
});

// ── Graph 3 data: Serial Fraction Impact ──────────────────────────────────────

describe("Graph 3 — chart data: Serial Fraction Impact", () => {
  const SCENARIOS = [
    { P: 0.85, expectedMax: 6.6667 },
    { P: 0.90, expectedMax: 10.0   },
    { P: 0.95, expectedMax: 20.0   },
  ];

  SCENARIOS.forEach(({ P, expectedMax }) => {
    it(`P=${(P * 100).toFixed(0)}%: max speedup ≈ ${expectedMax}`, () => {
      expect(calculateMaxSpeedup(P)).toBeCloseTo(expectedMax, 2);
    });

    it(`P=${(P * 100).toFixed(0)}%: no NaN values in chart data`, () => {
      CHART_CORES.forEach((n) => {
        expect(Number.isNaN(calculateSpeedup(P, n))).toBe(false);
      });
    });

    it(`P=${(P * 100).toFixed(0)}%: all speedups are positive and finite`, () => {
      CHART_CORES.forEach((n) => {
        const s = calculateSpeedup(P, n);
        expect(s).toBeGreaterThan(0);
        expect(isFinite(s)).toBe(true);
      });
    });

    it(`P=${(P * 100).toFixed(0)}%: speedups never exceed max theoretical`, () => {
      const max = calculateMaxSpeedup(P);
      CHART_CORES.forEach((n) => {
        expect(calculateSpeedup(P, n)).toBeLessThanOrEqual(max + 1e-9);
      });
    });
  });

  it("higher parallel fraction yields higher speedup at the same core count", () => {
    CHART_CORES.filter((n) => n > 1).forEach((n) => {
      const s85 = calculateSpeedup(0.85, n);
      const s90 = calculateSpeedup(0.90, n);
      const s95 = calculateSpeedup(0.95, n);
      expect(s90).toBeGreaterThan(s85);
      expect(s95).toBeGreaterThan(s90);
    });
  });

  it("halving serial fraction from 15% to 5% triples the max speedup ceiling", () => {
    const max85 = calculateMaxSpeedup(0.85); // 1/0.15 ≈ 6.667
    const max95 = calculateMaxSpeedup(0.95); // 1/0.05 = 20
    expect(max95 / max85).toBeCloseTo(3.0, 1);
  });
});

// ── Metrics table data ────────────────────────────────────────────────────────

describe("Metrics table data", () => {
  const P = 0.85;
  const maxSpeedup = calculateMaxSpeedup(P);

  it("core efficiency at N=1 is 100%", () => {
    const s   = calculateSpeedup(P, 1);
    const eff = (s / 1) * 100;
    expect(eff).toBeCloseTo(100.0, 5);
  });

  it("core efficiency decreases monotonically as N increases", () => {
    for (let i = 0; i < CHART_CORES.length - 1; i++) {
      const e1 = calculateSpeedup(P, CHART_CORES[i])     / CHART_CORES[i];
      const e2 = calculateSpeedup(P, CHART_CORES[i + 1]) / CHART_CORES[i + 1];
      expect(e1).toBeGreaterThan(e2);
    }
  });

  it("pct of max speedup at N=1 is correct (baseline / max * 100)", () => {
    const s  = calculateSpeedup(P, 1); // = 1
    const pct = (s / maxSpeedup) * 100;
    expect(pct).toBeCloseTo(15.0, 1); // 1 / 6.667 ≈ 15%
  });

  it("pct of max speedup at N=∞ approaches 100%", () => {
    // As N→∞, speedup → maxSpeedup, so pct → 100%
    const sLarge = calculateSpeedup(P, 1_000_000);
    const pct    = (sLarge / maxSpeedup) * 100;
    expect(pct).toBeCloseTo(100, 1);
  });

  it("pct of max is always ≤ 100 for finite N", () => {
    CHART_CORES.forEach((n) => {
      const s   = calculateSpeedup(P, n);
      const pct = (s / maxSpeedup) * 100;
      expect(pct).toBeLessThanOrEqual(100.0 + 1e-6);
    });
  });
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe("Edge cases for graph data", () => {
  it("P=0 (fully serial): max speedup = 1, no improvement from cores", () => {
    expect(calculateMaxSpeedup(0)).toBeCloseTo(1.0, 8);
    CHART_CORES.forEach((n) => {
      expect(calculateSpeedup(0, n)).toBeCloseTo(1.0, 8);
    });
  });

  it("P=1 (fully parallel): max speedup = Infinity", () => {
    expect(calculateMaxSpeedup(1)).toBe(Infinity);
  });

  it("P=1 graph data: speedup equals N for all cores — no NaN or Infinity", () => {
    CHART_CORES.forEach((n) => {
      const s = calculateSpeedup(1, n);
      expect(isFinite(s)).toBe(true);
      expect(Number.isNaN(s)).toBe(false);
      expect(s).toBeCloseTo(n, 8);
    });
  });
});
