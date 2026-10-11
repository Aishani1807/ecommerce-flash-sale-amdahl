// ─────────────────────────────────────────────────────────────────────────────
// tests/amdahl.test.ts
// Unit tests for the Amdahl's Law calculation functions.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  calculateSpeedup,
  calculateMaxSpeedup,
  runAmdahlAnalysis,
} from "../calculations/amdahl";

// ── calculateSpeedup ─────────────────────────────────────────────────────────
describe("calculateSpeedup", () => {
  const P = 0.85; // parallel fraction (85 %)

  it("returns ~2.7586 for 4 cores (project scenario)", () => {
    const result = calculateSpeedup(P, 4);
    // Formula: 1 / (0.15 + 0.85/4) = 1 / (0.15 + 0.2125) = 1 / 0.3625 ≈ 2.7586
    expect(result).toBeCloseTo(2.7586, 3);
  });

  it("returns ~4.9231 for 16 cores (project scenario)", () => {
    const result = calculateSpeedup(P, 16);
    expect(result).toBeCloseTo(4.9231, 3);
  });

  it("returns ~6.1244 for 64 cores (project scenario)", () => {
    const result = calculateSpeedup(P, 64);
    expect(result).toBeCloseTo(6.1244, 3);
  });

  it("returns 1 for 1 core (no parallelism benefit)", () => {
    const result = calculateSpeedup(P, 1);
    expect(result).toBeCloseTo(1.0, 5);
  });

  it("returns 1 when parallelFraction is 0 (fully serial)", () => {
    // S=1, so speedup = 1/(1 + 0/n) = 1 always
    expect(calculateSpeedup(0, 8)).toBeCloseTo(1.0, 5);
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

  it("speedup increases as core count increases", () => {
    const s4  = calculateSpeedup(P, 4);
    const s16 = calculateSpeedup(P, 16);
    const s64 = calculateSpeedup(P, 64);
    expect(s4).toBeLessThan(s16);
    expect(s16).toBeLessThan(s64);
  });
});

// ── calculateMaxSpeedup ──────────────────────────────────────────────────────
describe("calculateMaxSpeedup", () => {
  it("returns ~6.6667 for P=0.85 (project scenario)", () => {
    // Max speedup = 1 / S = 1 / 0.15 ≈ 6.6667
    expect(calculateMaxSpeedup(0.85)).toBeCloseTo(6.6667, 3);
  });

  it("returns Infinity when serial fraction is 0", () => {
    expect(calculateMaxSpeedup(1.0)).toBe(Infinity);
  });

  it("returns 1 when parallel fraction is 0 (fully serial)", () => {
    expect(calculateMaxSpeedup(0)).toBeCloseTo(1.0, 5);
  });

  it("throws RangeError for out-of-range fraction", () => {
    expect(() => calculateMaxSpeedup(1.5)).toThrow(RangeError);
    expect(() => calculateMaxSpeedup(-0.1)).toThrow(RangeError);
  });
});

// ── runAmdahlAnalysis ────────────────────────────────────────────────────────
describe("runAmdahlAnalysis", () => {
  const input = { parallelFraction: 0.85, cores: [4, 16, 64] };
  const analysis = runAmdahlAnalysis(input);

  it("returns correct serialFraction", () => {
    expect(analysis.serialFraction).toBeCloseTo(0.15, 5);
  });

  it("returns correct maxTheoreticalSpeedup", () => {
    expect(analysis.maxTheoreticalSpeedup).toBeCloseTo(6.6667, 3);
  });

  it("returns a result entry for every core count", () => {
    expect(analysis.results).toHaveLength(3);
    const coreCounts = analysis.results.map((r) => r.cores);
    expect(coreCounts).toEqual([4, 16, 64]);
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
