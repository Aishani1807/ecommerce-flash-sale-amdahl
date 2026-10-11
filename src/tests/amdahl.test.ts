// ─────────────────────────────────────────────────────────────────────────────
// tests/amdahl.test.ts
// Unit tests for the Amdahl's Law calculation functions.
// Phase 0 tests preserved; Phase 2 tests appended below.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  calculateSpeedup,
  calculateMaxSpeedup,
  calculateRelativeTime,
  runAmdahlAnalysis,
  buildCalculationSteps,
  buildResultsTable,
} from "../calculations/amdahl";

// ── calculateSpeedup ──────────────────────────────────────────────────────────
describe("calculateSpeedup", () => {
  const P = 0.85;

  it("returns ~2.75862069 for 4 cores (project scenario)", () => {
    // 1 / (0.15 + 0.85/4) = 1 / (0.15 + 0.2125) = 1 / 0.3625
    expect(calculateSpeedup(P, 4)).toBeCloseTo(2.75862069, 6);
  });

  it("returns ~4.92307692 for 16 cores (project scenario)", () => {
    expect(calculateSpeedup(P, 16)).toBeCloseTo(4.92307692, 6);
  });

  it("returns ~6.12440191 for 64 cores (project scenario)", () => {
    expect(calculateSpeedup(P, 64)).toBeCloseTo(6.12440191, 6);
  });

  it("returns exactly 1 for N = 1 (no parallelism benefit)", () => {
    // Any P, N=1: 1 / ((1-P) + P/1) = 1 / 1 = 1
    expect(calculateSpeedup(P, 1)).toBeCloseTo(1.0, 10);
    expect(calculateSpeedup(0.5, 1)).toBeCloseTo(1.0, 10);
    expect(calculateSpeedup(0,   1)).toBeCloseTo(1.0, 10);
  });

  it("returns 1 for P = 0 (fully serial) regardless of core count", () => {
    // S=1, speedup = 1/(1+0) = 1 always
    expect(calculateSpeedup(0, 1)).toBeCloseTo(1.0, 10);
    expect(calculateSpeedup(0, 4)).toBeCloseTo(1.0, 10);
    expect(calculateSpeedup(0, 64)).toBeCloseTo(1.0, 10);
    expect(calculateSpeedup(0, 256)).toBeCloseTo(1.0, 10);
  });

  it("returns N for P = 1 (fully parallel)", () => {
    // 1 / (0 + 1/N) = N
    expect(calculateSpeedup(1, 4)).toBeCloseTo(4, 10);
    expect(calculateSpeedup(1, 16)).toBeCloseTo(16, 10);
    expect(calculateSpeedup(1, 64)).toBeCloseTo(64, 10);
    expect(calculateSpeedup(1, 256)).toBeCloseTo(256, 10);
  });

  it("speedup increases monotonically as core count increases", () => {
    const s4  = calculateSpeedup(P, 4);
    const s16 = calculateSpeedup(P, 16);
    const s64 = calculateSpeedup(P, 64);
    expect(s4).toBeLessThan(s16);
    expect(s16).toBeLessThan(s64);
  });

  it("speedup never exceeds max theoretical speedup", () => {
    const max = calculateMaxSpeedup(P);
    [4, 16, 32, 64, 128, 256].forEach((n) => {
      expect(calculateSpeedup(P, n)).toBeLessThan(max + 1e-9);
    });
  });

  it("throws RangeError when parallelFraction > 1", () => {
    expect(() => calculateSpeedup(1.5, 4)).toThrow(RangeError);
  });

  it("throws RangeError when parallelFraction < 0", () => {
    expect(() => calculateSpeedup(-0.1, 4)).toThrow(RangeError);
  });

  it("throws RangeError when cores <= 0", () => {
    expect(() => calculateSpeedup(0.85, 0)).toThrow(RangeError);
    expect(() => calculateSpeedup(0.85, -2)).toThrow(RangeError);
  });

  it("throws RangeError when cores is non-finite", () => {
    expect(() => calculateSpeedup(0.85, Infinity)).toThrow(RangeError);
    expect(() => calculateSpeedup(0.85, NaN)).toThrow(RangeError);
  });
});

// ── calculateMaxSpeedup ───────────────────────────────────────────────────────
describe("calculateMaxSpeedup", () => {
  it("returns ~6.66666667 for P = 0.85 (project scenario)", () => {
    expect(calculateMaxSpeedup(0.85)).toBeCloseTo(6.66666667, 6);
  });

  it("returns Infinity for P = 1 (fully parallel — unbounded)", () => {
    expect(calculateMaxSpeedup(1.0)).toBe(Infinity);
  });

  it("returns 1 for P = 0 (fully serial)", () => {
    expect(calculateMaxSpeedup(0)).toBeCloseTo(1.0, 10);
  });

  it("returns 2 for P = 0.5", () => {
    expect(calculateMaxSpeedup(0.5)).toBeCloseTo(2.0, 10);
  });

  it("throws RangeError for out-of-range values", () => {
    expect(() => calculateMaxSpeedup(1.5)).toThrow(RangeError);
    expect(() => calculateMaxSpeedup(-0.1)).toThrow(RangeError);
  });
});

// ── calculateRelativeTime ─────────────────────────────────────────────────────
describe("calculateRelativeTime", () => {
  it("returns 1 for N = 1 (no reduction)", () => {
    expect(calculateRelativeTime(0.85, 1)).toBeCloseTo(1.0, 10);
  });

  it("returns correct value for P = 0.85, N = 4", () => {
    // (1-0.85) + 0.85/4 = 0.15 + 0.2125 = 0.3625
    expect(calculateRelativeTime(0.85, 4)).toBeCloseTo(0.3625, 8);
  });

  it("returns serial fraction as N → large (parallel term → 0)", () => {
    expect(calculateRelativeTime(0.85, 1_000_000)).toBeCloseTo(0.15, 4);
  });

  it("throws RangeError for invalid inputs", () => {
    expect(() => calculateRelativeTime(-0.1, 4)).toThrow(RangeError);
    expect(() => calculateRelativeTime(0.85, 0)).toThrow(RangeError);
  });
});

// ── runAmdahlAnalysis ─────────────────────────────────────────────────────────
describe("runAmdahlAnalysis", () => {
  const input = { parallelFraction: 0.85, cores: [4, 16, 64] };
  const analysis = runAmdahlAnalysis(input);

  it("returns correct serialFraction", () => {
    expect(analysis.serialFraction).toBeCloseTo(0.15, 8);
  });

  it("returns ~6.6667 as maxTheoreticalSpeedup", () => {
    expect(analysis.maxTheoreticalSpeedup).toBeCloseTo(6.6667, 3);
  });

  it("returns a result entry for every core count", () => {
    expect(analysis.results).toHaveLength(3);
    expect(analysis.results.map((r) => r.cores)).toEqual([4, 16, 64]);
  });

  it("efficiency decreases as core count increases (diminishing returns)", () => {
    const [r4, r16, r64] = analysis.results;
    expect(r4.efficiency).toBeGreaterThan(r16.efficiency);
    expect(r16.efficiency).toBeGreaterThan(r64.efficiency);
  });

  it("all speedup values are positive and ≤ maxTheoreticalSpeedup", () => {
    analysis.results.forEach((r) => {
      expect(r.speedup).toBeGreaterThan(0);
      expect(r.speedup).toBeLessThanOrEqual(analysis.maxTheoreticalSpeedup + 0.001);
    });
  });
});

// ── buildCalculationSteps ─────────────────────────────────────────────────────
describe("buildCalculationSteps", () => {
  const steps = buildCalculationSteps(0.85, 4);

  it("returns exactly 5 steps", () => {
    expect(steps).toHaveLength(5);
  });

  it("step 1 result is P = 0.85", () => {
    expect(parseFloat(steps[0].result)).toBeCloseTo(0.85, 8);
  });

  it("step 2 result is serial fraction = 0.15", () => {
    expect(parseFloat(steps[1].result)).toBeCloseTo(0.15, 8);
  });

  it("step 3 result is P/N = 0.85/4 = 0.2125", () => {
    expect(parseFloat(steps[2].result)).toBeCloseTo(0.2125, 8);
  });

  it("step 4 result is total time = 0.3625", () => {
    expect(parseFloat(steps[3].result)).toBeCloseTo(0.3625, 8);
  });

  it("step 5 result contains the speedup ≈ 2.75862069", () => {
    const numericPart = parseFloat(steps[4].result.replace("×", ""));
    expect(numericPart).toBeCloseTo(2.75862069, 6);
  });

  it("works correctly for N = 1 (speedup must be 1)", () => {
    const s1 = buildCalculationSteps(0.85, 1);
    const numericPart = parseFloat(s1[4].result.replace("×", ""));
    expect(numericPart).toBeCloseTo(1.0, 8);
  });

  it("works correctly for P = 0 (fully serial — speedup always 1)", () => {
    const s0 = buildCalculationSteps(0, 16);
    const numericPart = parseFloat(s0[4].result.replace("×", ""));
    expect(numericPart).toBeCloseTo(1.0, 8);
  });
});

// ── buildResultsTable ─────────────────────────────────────────────────────────
describe("buildResultsTable", () => {
  const cores = [1, 4, 16, 32, 64, 128, 256];
  const rows  = buildResultsTable(0.85, cores);

  it("returns one row per core count", () => {
    expect(rows).toHaveLength(cores.length);
    expect(rows.map((r) => r.cores)).toEqual(cores);
  });

  it("serialTime is the same (= 0.15) for every row", () => {
    rows.forEach((r) => expect(r.serialTime).toBeCloseTo(0.15, 10));
  });

  it("parallelTime = P / N for each row", () => {
    rows.forEach((r) => {
      expect(r.parallelTime).toBeCloseTo(0.85 / r.cores, 10);
    });
  });

  it("totalTime = serialTime + parallelTime", () => {
    rows.forEach((r) => {
      expect(r.totalTime).toBeCloseTo(r.serialTime + r.parallelTime, 10);
    });
  });

  it("speedup = 1 / totalTime", () => {
    rows.forEach((r) => {
      expect(r.speedup).toBeCloseTo(1 / r.totalTime, 10);
    });
  });

  it("efficiency = speedup / cores", () => {
    rows.forEach((r) => {
      expect(r.efficiency).toBeCloseTo(r.speedup / r.cores, 10);
    });
  });

  it("speedup for N=1 is exactly 1", () => {
    const row1 = rows.find((r) => r.cores === 1)!;
    expect(row1.speedup).toBeCloseTo(1.0, 10);
  });

  it("reference values match the problem statement", () => {
    const r4  = rows.find((r) => r.cores === 4)!;
    const r16 = rows.find((r) => r.cores === 16)!;
    const r64 = rows.find((r) => r.cores === 64)!;
    expect(r4.speedup).toBeCloseTo(2.75862069, 6);
    expect(r16.speedup).toBeCloseTo(4.92307692, 6);
    expect(r64.speedup).toBeCloseTo(6.12440191, 6);
  });

  it("efficiency decreases as cores increase", () => {
    for (let i = 0; i < rows.length - 1; i++) {
      expect(rows[i].efficiency).toBeGreaterThan(rows[i + 1].efficiency);
    }
  });

  it("P = 0 rows: speedup = 1 for all core counts", () => {
    const serialRows = buildResultsTable(0, [1, 4, 16, 64]);
    serialRows.forEach((r) => expect(r.speedup).toBeCloseTo(1.0, 8));
  });

  it("P = 1 rows: speedup = N for each core count", () => {
    const parallelRows = buildResultsTable(1, [1, 4, 16, 64]);
    parallelRows.forEach((r) => expect(r.speedup).toBeCloseTo(r.cores, 8));
  });
});
