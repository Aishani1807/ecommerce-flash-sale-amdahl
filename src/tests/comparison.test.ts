// ─────────────────────────────────────────────────────────────────────────────
// tests/comparison.test.ts
// Phase 4: Unit tests for the Server Comparison & Recommendation Simulator.
//
// Covers:
//   - buildComparisonRow / buildComparisonTable for all configurations
//   - All three workload scenarios
//   - Efficiency and % of max speedup calculations
//   - Marginal improvement calculations
//   - isValidCostInput and calculateCostResult (valid and invalid inputs)
//   - hasSufficientCostData
//   - generateRecommendation (performance-only and cost-aware paths)
//   - Edge cases: P=0, P=1, invalid inputs, zero/negative values
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  SERVER_CORE_COUNTS,
  WORKLOAD_SCENARIOS,
  buildComparisonRow,
  buildComparisonTable,
  isValidCostInput,
  calculateCostResult,
  hasSufficientCostData,
  marginalSpeedupGain,
  generateRecommendation,
} from "../calculations/comparison";
import { calculateSpeedup, calculateMaxSpeedup } from "../calculations/amdahl";
import type { CostAssumptions } from "../types/comparison";

// ── Constants & helpers ───────────────────────────────────────────────────────

const P85 = 0.85;
const P90 = 0.90;
const P95 = 0.95;

const emptyAssumptions: CostAssumptions = {
  monthlyCostUsd:        null,
  powerWatts:            null,
  electricityUsdPerKwh:  null,
  hoursPerDay:           null,
};

const fullAssumptions: CostAssumptions = {
  monthlyCostUsd:        500,
  powerWatts:            200,
  electricityUsdPerKwh:  0.12,
  hoursPerDay:           24,
};

// ── SERVER_CORE_COUNTS & WORKLOAD_SCENARIOS ───────────────────────────────────

describe("SERVER_CORE_COUNTS", () => {
  it("contains exactly 5 configurations", () => {
    expect(SERVER_CORE_COUNTS).toHaveLength(5);
  });

  it("contains 4, 16, 32, 64, 128", () => {
    expect(Array.from(SERVER_CORE_COUNTS)).toEqual([4, 16, 32, 64, 128]);
  });
});

describe("WORKLOAD_SCENARIOS", () => {
  it("contains exactly 3 scenarios", () => {
    expect(WORKLOAD_SCENARIOS).toHaveLength(3);
  });

  it("scenarios have correct parallel fractions", () => {
    const fractions = WORKLOAD_SCENARIOS.map((s) => s.parallelFraction);
    expect(fractions).toEqual([0.85, 0.90, 0.95]);
  });

  it("serialFraction = 1 - parallelFraction for each scenario", () => {
    WORKLOAD_SCENARIOS.forEach((s) => {
      expect(s.serialFraction).toBeCloseTo(1 - s.parallelFraction, 10);
    });
  });

  it("each scenario has a non-empty id and label", () => {
    WORKLOAD_SCENARIOS.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.label).toBeTruthy();
    });
  });
});

// ── buildComparisonRow ────────────────────────────────────────────────────────

describe("buildComparisonRow", () => {
  const speedupAt4 = calculateSpeedup(P85, 4);

  it("speedup matches calculateSpeedup for each configuration", () => {
    SERVER_CORE_COUNTS.forEach((n) => {
      const row = buildComparisonRow(n, P85, speedupAt4);
      expect(row.speedup).toBeCloseTo(calculateSpeedup(P85, n), 8);
    });
  });

  it("efficiency = speedup / cores", () => {
    SERVER_CORE_COUNTS.forEach((n) => {
      const row = buildComparisonRow(n, P85, speedupAt4);
      expect(row.efficiency).toBeCloseTo(row.speedup / n, 8);
    });
  });

  it("pctOfMax = (speedup / maxSpeedup) * 100 for P=0.85", () => {
    const max = calculateMaxSpeedup(P85);
    SERVER_CORE_COUNTS.forEach((n) => {
      const row = buildComparisonRow(n, P85, speedupAt4);
      expect(row.pctOfMax).toBeCloseTo((calculateSpeedup(P85, n) / max) * 100, 4);
    });
  });

  it("pctOfMax is between 0 and 100 (inclusive) for P < 1", () => {
    SERVER_CORE_COUNTS.forEach((n) => {
      const row = buildComparisonRow(n, P85, speedupAt4);
      expect(row.pctOfMax).toBeGreaterThan(0);
      expect(row.pctOfMax).toBeLessThanOrEqual(100.0 + 1e-6);
    });
  });

  it("relativeExecTime = (1 / speedup) * 100", () => {
    SERVER_CORE_COUNTS.forEach((n) => {
      const row = buildComparisonRow(n, P85, speedupAt4);
      expect(row.relativeExecTime).toBeCloseTo((1 / row.speedup) * 100, 6);
    });
  });

  it("relativeExecTime decreases as cores increase", () => {
    const rowList = SERVER_CORE_COUNTS.map((n) =>
      buildComparisonRow(n, P85, speedupAt4)
    );
    for (let i = 0; i < rowList.length - 1; i++) {
      expect(rowList[i].relativeExecTime).toBeGreaterThan(rowList[i + 1].relativeExecTime);
    }
  });

  it("marginalGainOver4 = 0 for the 4-core row", () => {
    const row4 = buildComparisonRow(4, P85, speedupAt4);
    expect(row4.marginalGainOver4).toBeCloseTo(0, 8);
  });

  it("marginalGainOver4 > 0 for cores > 4", () => {
    [16, 32, 64, 128].forEach((n) => {
      const row = buildComparisonRow(n, P85, speedupAt4);
      expect(row.marginalGainOver4).toBeGreaterThan(0);
    });
  });

  it("marginalGainOver4 increases as cores increase (cumulative gain vs 4-core baseline)", () => {
    // marginalGainOver4 = (speedup(N) - speedup(4)) / speedup(4) * 100
    // Since speedup increases monotonically, gains vs the 4-core baseline always grow.
    const g16  = buildComparisonRow(16,  P85, speedupAt4).marginalGainOver4;
    const g32  = buildComparisonRow(32,  P85, speedupAt4).marginalGainOver4;
    const g64  = buildComparisonRow(64,  P85, speedupAt4).marginalGainOver4;
    const g128 = buildComparisonRow(128, P85, speedupAt4).marginalGainOver4;
    expect(g32).toBeGreaterThan(g16);   // 32 cores > 16 cores vs 4-core baseline
    expect(g64).toBeGreaterThan(g32);
    expect(g128).toBeGreaterThan(g64);
  });

  it("P=1 (fully parallel): pctOfMax returns 100 (special-cased for Infinity)", () => {
    const row = buildComparisonRow(4, 1, calculateSpeedup(1, 4));
    expect(row.pctOfMax).toBeCloseTo(100, 6);
  });

  it("P=0 (fully serial): speedup = 1, efficiency = 1/N for all cores", () => {
    const s4at0 = calculateSpeedup(0, 4);
    SERVER_CORE_COUNTS.forEach((n) => {
      const row = buildComparisonRow(n, 0, s4at0);
      expect(row.speedup).toBeCloseTo(1.0, 8);
      expect(row.efficiency).toBeCloseTo(1 / n, 8);
    });
  });
});

// ── buildComparisonTable ──────────────────────────────────────────────────────

describe("buildComparisonTable", () => {
  it("returns one row per SERVER_CORE_COUNTS entry", () => {
    const rows = buildComparisonTable(P85);
    expect(rows).toHaveLength(SERVER_CORE_COUNTS.length);
    expect(rows.map((r) => r.cores)).toEqual(Array.from(SERVER_CORE_COUNTS));
  });

  it("rows are in ascending core-count order", () => {
    const rows = buildComparisonTable(P85);
    for (let i = 0; i < rows.length - 1; i++) {
      expect(rows[i].cores).toBeLessThan(rows[i + 1].cores);
    }
  });

  // All three workload scenarios
  [
    { P: P85, label: "P=0.85" },
    { P: P90, label: "P=0.90" },
    { P: P95, label: "P=0.95" },
  ].forEach(({ P, label }) => {
    describe(`scenario ${label}`, () => {
      const rows = buildComparisonTable(P);
      const max  = calculateMaxSpeedup(P);

      it(`${label}: speedup increases monotonically with core count`, () => {
        for (let i = 0; i < rows.length - 1; i++) {
          expect(rows[i].speedup).toBeLessThan(rows[i + 1].speedup);
        }
      });

      it(`${label}: efficiency decreases monotonically with core count`, () => {
        for (let i = 0; i < rows.length - 1; i++) {
          expect(rows[i].efficiency).toBeGreaterThan(rows[i + 1].efficiency);
        }
      });

      it(`${label}: pctOfMax increases monotonically with core count`, () => {
        for (let i = 0; i < rows.length - 1; i++) {
          expect(rows[i].pctOfMax).toBeLessThan(rows[i + 1].pctOfMax);
        }
      });

      it(`${label}: all speedup values below max theoretical speedup`, () => {
        rows.forEach((r) => {
          expect(r.speedup).toBeLessThanOrEqual(max + 1e-9);
        });
      });

      it(`${label}: no NaN or Infinity in any numeric field`, () => {
        rows.forEach((r) => {
          expect(Number.isNaN(r.speedup)).toBe(false);
          expect(Number.isNaN(r.efficiency)).toBe(false);
          expect(Number.isNaN(r.pctOfMax)).toBe(false);
          expect(Number.isNaN(r.relativeExecTime)).toBe(false);
          expect(Number.isNaN(r.marginalGainOver4)).toBe(false);
          expect(isFinite(r.speedup)).toBe(true);
          expect(isFinite(r.relativeExecTime)).toBe(true);
        });
      });
    });
  });

  // Reference values for P=0.85
  describe("P=0.85 reference values", () => {
    const rows = buildComparisonTable(P85);

    it("4-core speedup ≈ 2.7586", () => {
      const r4 = rows.find((r) => r.cores === 4)!;
      expect(r4.speedup).toBeCloseTo(2.7586, 3);
    });

    it("16-core speedup ≈ 4.9231", () => {
      const r16 = rows.find((r) => r.cores === 16)!;
      expect(r16.speedup).toBeCloseTo(4.9231, 3);
    });

    it("32-core speedup ≈ 5.6637", () => {
      const r32 = rows.find((r) => r.cores === 32)!;
      // 1 / (0.15 + 0.85/32) = 1 / (0.15 + 0.0265625) = 1 / 0.1765625 ≈ 5.6637
      expect(r32.speedup).toBeCloseTo(5.6637, 3);
    });

    it("64-core speedup ≈ 6.1244", () => {
      const r64 = rows.find((r) => r.cores === 64)!;
      expect(r64.speedup).toBeCloseTo(6.1244, 3);
    });

    it("128-core speedup ≈ 6.3840", () => {
      const r128 = rows.find((r) => r.cores === 128)!;
      // 1 / (0.15 + 0.85/128) = 1 / (0.15 + 0.006640625) = 1 / 0.156640625 ≈ 6.3840
      expect(r128.speedup).toBeCloseTo(6.3840, 3);
    });
  });
});

// ── isValidCostInput ──────────────────────────────────────────────────────────

describe("isValidCostInput", () => {
  it("returns true for positive finite numbers", () => {
    expect(isValidCostInput(100)).toBe(true);
    expect(isValidCostInput(0.12)).toBe(true);
    expect(isValidCostInput(1)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isValidCostInput(null)).toBe(false);
  });

  it("returns false for 0", () => {
    expect(isValidCostInput(0)).toBe(false);
  });

  it("returns false for negative numbers", () => {
    expect(isValidCostInput(-1)).toBe(false);
    expect(isValidCostInput(-100)).toBe(false);
  });

  it("returns false for Infinity", () => {
    expect(isValidCostInput(Infinity)).toBe(false);
  });

  it("returns false for NaN", () => {
    expect(isValidCostInput(NaN)).toBe(false);
  });
});

// ── calculateCostResult ───────────────────────────────────────────────────────

describe("calculateCostResult", () => {
  const speedup = calculateSpeedup(P85, 4); // ~2.7586

  it("returns all nulls when assumptions are empty", () => {
    const r = calculateCostResult(speedup, emptyAssumptions);
    expect(r.monthlyCostUsd).toBeNull();
    expect(r.monthlyElectricityCost).toBeNull();
    expect(r.totalMonthlyCost).toBeNull();
    expect(r.speedupPerDollar).toBeNull();
  });

  it("calculates electricity cost correctly with all fields", () => {
    const r = calculateCostResult(speedup, fullAssumptions);
    // (200/1000) * 24 * 30 * 0.12 = 0.2 * 24 * 30 * 0.12 = 17.28
    expect(r.monthlyElectricityCost).toBeCloseTo(17.28, 4);
  });

  it("calculates total monthly cost = server + electricity", () => {
    const r = calculateCostResult(speedup, fullAssumptions);
    expect(r.totalMonthlyCost).toBeCloseTo(500 + 17.28, 2);
  });

  it("calculates speedupPerDollar = speedup / totalMonthlyCost", () => {
    const r = calculateCostResult(speedup, fullAssumptions);
    expect(r.speedupPerDollar).toBeCloseTo(speedup / (500 + 17.28), 6);
  });

  it("when only server cost is provided, totalMonthlyCost = serverCost", () => {
    const partial: CostAssumptions = { ...emptyAssumptions, monthlyCostUsd: 300 };
    const r = calculateCostResult(speedup, partial);
    expect(r.monthlyCostUsd).toBe(300);
    expect(r.monthlyElectricityCost).toBeNull();
    expect(r.totalMonthlyCost).toBe(300);
    expect(r.speedupPerDollar).toBeCloseTo(speedup / 300, 6);
  });

  it("when only electricity fields are provided, totalMonthlyCost = electricityCost", () => {
    const partial: CostAssumptions = {
      monthlyCostUsd:        null,
      powerWatts:            100,
      electricityUsdPerKwh:  0.10,
      hoursPerDay:           24,
    };
    const r = calculateCostResult(speedup, partial);
    expect(r.monthlyCostUsd).toBeNull();
    // 0.1kW * 24h * 30d * $0.10 = 7.2
    expect(r.monthlyElectricityCost).toBeCloseTo(7.2, 4);
    expect(r.totalMonthlyCost).toBeCloseTo(7.2, 4);
  });

  it("returns null speedupPerDollar when totalMonthlyCost is null", () => {
    const r = calculateCostResult(speedup, emptyAssumptions);
    expect(r.speedupPerDollar).toBeNull();
  });

  it("handles zero or negative monthlyCostUsd gracefully (treated as null)", () => {
    const bad: CostAssumptions = { ...emptyAssumptions, monthlyCostUsd: 0 };
    const r = calculateCostResult(speedup, bad);
    expect(r.monthlyCostUsd).toBeNull();
    expect(r.totalMonthlyCost).toBeNull();
  });

  it("handles zero powerWatts gracefully (electricity remains null)", () => {
    const bad: CostAssumptions = {
      monthlyCostUsd:        null,
      powerWatts:            0,
      electricityUsdPerKwh:  0.12,
      hoursPerDay:           24,
    };
    const r = calculateCostResult(speedup, bad);
    expect(r.monthlyElectricityCost).toBeNull();
  });

  it("electricity cost formula: (W/1000) * hours/day * 30 * $/kWh", () => {
    const a: CostAssumptions = {
      monthlyCostUsd:        null,
      powerWatts:            500,
      electricityUsdPerKwh:  0.15,
      hoursPerDay:           12,
    };
    const r = calculateCostResult(speedup, a);
    // (500/1000) * 12 * 30 * 0.15 = 0.5 * 12 * 30 * 0.15 = 27
    expect(r.monthlyElectricityCost).toBeCloseTo(27, 4);
  });
});

// ── hasSufficientCostData ─────────────────────────────────────────────────────

describe("hasSufficientCostData", () => {
  it("returns false for all-null assumptions", () => {
    expect(hasSufficientCostData(emptyAssumptions)).toBe(false);
  });

  it("returns true when monthlyCostUsd is provided", () => {
    expect(hasSufficientCostData({ ...emptyAssumptions, monthlyCostUsd: 200 })).toBe(true);
  });

  it("returns true when all three electricity fields are provided", () => {
    expect(
      hasSufficientCostData({
        monthlyCostUsd:        null,
        powerWatts:            200,
        electricityUsdPerKwh:  0.12,
        hoursPerDay:           24,
      })
    ).toBe(true);
  });

  it("returns false when only some electricity fields are provided", () => {
    expect(
      hasSufficientCostData({
        monthlyCostUsd:        null,
        powerWatts:            200,
        electricityUsdPerKwh:  0.12,
        hoursPerDay:           null, // missing
      })
    ).toBe(false);
  });

  it("returns false when monthlyCostUsd is 0 (invalid)", () => {
    expect(hasSufficientCostData({ ...emptyAssumptions, monthlyCostUsd: 0 })).toBe(false);
  });
});

// ── marginalSpeedupGain ───────────────────────────────────────────────────────

describe("marginalSpeedupGain", () => {
  it("returns 0 for fromCores === toCores", () => {
    expect(marginalSpeedupGain(P85, 4, 4)).toBeCloseTo(0, 8);
  });

  it("returns positive value when toCores > fromCores", () => {
    expect(marginalSpeedupGain(P85, 4, 16)).toBeGreaterThan(0);
  });

  it("gain from 4→16 is larger than gain from 16→32 (diminishing returns)", () => {
    const g4to16  = marginalSpeedupGain(P85, 4,  16);
    const g16to32 = marginalSpeedupGain(P85, 16, 32);
    expect(g4to16).toBeGreaterThan(g16to32);
  });

  it("gain from 4→16 matches manual calculation for P=0.85", () => {
    const s4  = calculateSpeedup(P85, 4);
    const s16 = calculateSpeedup(P85, 16);
    const expected = ((s16 - s4) / s4) * 100;
    expect(marginalSpeedupGain(P85, 4, 16)).toBeCloseTo(expected, 6);
  });

  it("P=0 (fully serial): gain is always 0 regardless of core counts", () => {
    expect(marginalSpeedupGain(0, 4, 16)).toBeCloseTo(0, 8);
    expect(marginalSpeedupGain(0, 4, 128)).toBeCloseTo(0, 8);
  });

  it("higher P yields larger marginal gains", () => {
    const g85 = marginalSpeedupGain(P85, 4, 16);
    const g90 = marginalSpeedupGain(P90, 4, 16);
    const g95 = marginalSpeedupGain(P95, 4, 16);
    expect(g90).toBeGreaterThan(g85);
    expect(g95).toBeGreaterThan(g90);
  });
});

// ── generateRecommendation ────────────────────────────────────────────────────

describe("generateRecommendation — performance-only", () => {
  const rows = buildComparisonTable(P85);
  const nullCosts = rows.map(() => null);
  const rec = generateRecommendation(rows, nullCosts, P85, false);

  it("returns a recommendation with a non-empty headline", () => {
    expect(rec.headline).toBeTruthy();
    expect(rec.headline.length).toBeGreaterThan(10);
  });

  it("returns at least 3 evidence items", () => {
    expect(rec.evidence.length).toBeGreaterThanOrEqual(3);
  });

  it("returns a non-empty nextConfigNote", () => {
    expect(rec.nextConfigNote).toBeTruthy();
  });

  it("returns at least 4 deployment caveats", () => {
    expect(rec.deploymentCaveats.length).toBeGreaterThanOrEqual(4);
  });

  it("marks performanceOnly = true when no cost data", () => {
    expect(rec.performanceOnly).toBe(true);
  });

  it("recommendedCores is one of the known SERVER_CORE_COUNTS", () => {
    expect(Array.from(SERVER_CORE_COUNTS)).toContain(rec.recommendedCores);
  });

  it("does not recommend 128 cores for P=0.85 (heavy diminishing returns)", () => {
    // At P=0.85, gains drop off quickly; 128 cores should not be recommended
    // under performance-only heuristic
    expect(rec.recommendedCores).not.toBe(128);
  });
});

describe("generateRecommendation — with cost data", () => {
  const rows = buildComparisonTable(P85);
  const costs = rows.map((r) => calculateCostResult(r.speedup, fullAssumptions));
  const rec = generateRecommendation(rows, costs, P85, true);

  it("marks performanceOnly = false when cost data is present", () => {
    expect(rec.performanceOnly).toBe(false);
  });

  it("recommendedCores is one of the known SERVER_CORE_COUNTS", () => {
    expect(Array.from(SERVER_CORE_COUNTS)).toContain(rec.recommendedCores);
  });

  it("evidence includes a cost-related entry", () => {
    const hasCostEvidence = rec.evidence.some(
      (e) => e.includes("cost") || e.includes("dollar") || e.includes("$")
    );
    expect(hasCostEvidence).toBe(true);
  });
});

describe("generateRecommendation — all three workload scenarios", () => {
  [P85, P90, P95].forEach((P) => {
    it(`P=${(P * 100).toFixed(0)}%: produces a valid recommendation`, () => {
      const rows = buildComparisonTable(P);
      const nullCosts = rows.map(() => null);
      const rec = generateRecommendation(rows, nullCosts, P, false);
      expect(rec.recommendedCores).toBeGreaterThan(0);
      expect(rec.headline).toBeTruthy();
      expect(rec.evidence.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe("generateRecommendation — edge cases", () => {
  it("P=0 (fully serial): recommends 4 cores (no benefit from more)", () => {
    const rows = buildComparisonTable(0);
    const nullCosts = rows.map(() => null);
    const rec = generateRecommendation(rows, nullCosts, 0, false);
    // All speedups = 1, so marginal gain = 0 < 15 → first config recommended
    expect(rec.recommendedCores).toBe(4);
  });

  it("P=1 (fully parallel): recommendation is still a valid core count", () => {
    // P=1 is technically valid for the formula; no crash should occur
    const rows = buildComparisonTable(1);
    const nullCosts = rows.map(() => null);
    const rec = generateRecommendation(rows, nullCosts, 1, false);
    expect(Array.from(SERVER_CORE_COUNTS)).toContain(rec.recommendedCores);
  });

  it("invalid cost data (all zero) is treated as absent — performanceOnly = true", () => {
    const rows = buildComparisonTable(P85);
    const badAssumptions: CostAssumptions = {
      monthlyCostUsd:        0,   // invalid
      powerWatts:            0,   // invalid
      electricityUsdPerKwh:  0,   // invalid
      hoursPerDay:           0,   // invalid
    };
    const hasCost = hasSufficientCostData(badAssumptions);
    const costs = rows.map((r) => calculateCostResult(r.speedup, badAssumptions));
    const rec = generateRecommendation(rows, costs, P85, hasCost);
    expect(rec.performanceOnly).toBe(true);
  });
});
