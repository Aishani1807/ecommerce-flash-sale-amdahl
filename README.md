# E-Commerce Flash Sale: Performance Analysis Using Amdahl's Law

> **Computer Organisation and Architecture (COA) Project**
> Interactive web application demonstrating Amdahl's Law applied to an e-commerce order-processing system.

---

## Project Objective

Model and analyse the **theoretical speedup** achievable by parallelising the order-processing pipeline of an e-commerce platform during a flash sale, using **Amdahl's Law**.

This is a **theoretical performance model**. All results are computed from the formula, not measured on real hardware.

---

## The Problem

During a flash sale, an e-commerce platform must process thousands of concurrent orders per second. The order-processing pipeline has two categories of work:

| Category | Fraction | Examples |
|---|---|---|
| Parallelisable | 85% | Inventory lookup, payment validation, fraud detection, fulfilment routing |
| Serial (sequential) | 15% | Final order confirmation, sequential database commit, order ID generation, audit log write |

The central question: **how much faster can the system run if we add more CPU cores?**

---

## Amdahl's Law Formula

```
S(N) = 1 / ( (1 − P) + P/N )

Where:
  S(N) = Theoretical speedup with N cores
  P    = Parallel fraction of the workload  (0 ≤ P ≤ 1)
  N    = Number of CPU cores
  1−P  = Serial fraction — the bottleneck

Maximum theoretical speedup (as N → ∞):
  S_max = 1 / (1 − P)
```

---

## Reference Results (P = 0.85)

| Cores (N) | Speedup S(N) | Formula |
|---:|---:|---|
| 1 | 1.0000× | baseline |
| 4 | 2.7586× | 1 / (0.15 + 0.85/4) |
| 16 | 4.9231× | 1 / (0.15 + 0.85/16) |
| 32 | 5.6637× | 1 / (0.15 + 0.85/32) |
| 64 | 6.1244× | 1 / (0.15 + 0.85/64) |
| 128 | 6.3840× | 1 / (0.15 + 0.85/128) |
| ∞ | 6.6667× | 1 / 0.15 — theoretical maximum |

Small differences due to rounding are expected. The serial 15% fraction hard-limits the ceiling regardless of core count.

---

## Application Sections

| Section | Description |
|---|---|
| **Overview** | Project introduction, Amdahl's Law explanation, computed results summary |
| **Speedup Calculator** | Interactive slider and core input — calculates S(N) step by step |
| **Performance Graphs** | Three Recharts visualisations: Cores vs Speedup, Ideal vs Actual, Serial Fraction Impact |
| **Server Comparison** | CTO decision-support tool: compares 4/16/32/64/128-core configurations with optional cost analysis |
| **About** | Project objectives, scenario parameters, technology stack |

---

## Key Metrics Explained

| Metric | Formula | Meaning |
|---|---|---|
| Speedup S(N) | 1 / ((1−P) + P/N) | How many times faster than single-core |
| Parallel efficiency | S(N) / N × 100% | How well each core is utilised |
| % of max speedup | S(N) / S_max × 100% | How close to the theoretical ceiling |
| Relative exec time | (1 / S(N)) × 100% | Execution time as % of single-core baseline |
| Marginal gain vs 4-core | (S(N) − S(4)) / S(4) × 100% | Additional speedup over the 4-core configuration |

---

## Technology Stack

| Library / Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI component library |
| TypeScript | ~6.0 | Type-safe JavaScript |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS | 3 | Utility-first CSS (shared with global custom CSS) |
| Recharts | 3 | Interactive charts |
| Vitest | 5 | Unit testing framework |

---

## Project Structure

```
coa/
├── index.html                    # Application entry HTML
├── vite.config.ts                # Vite + Vitest configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── package.json                  # Dependencies and scripts
└── src/
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # Root component + state-based router
    ├── index.css                 # Global styles and design tokens
    ├── types/
    │   ├── amdahl.ts             # Core TypeScript types (AmdahlInput, TableRow, …)
    │   └── comparison.ts         # Phase 4 types (ComparisonRow, CostAssumptions, …)
    ├── calculations/
    │   ├── amdahl.ts             # Amdahl's Law functions (calculateSpeedup, …)
    │   └── comparison.ts         # Server comparison functions (buildComparisonTable, …)
    ├── utils/
    │   ├── constants.ts          # Scenario constants and chart colours
    │   └── formatters.ts         # Number formatting helpers
    ├── components/
    │   ├── Navbar.tsx            # Sticky top navigation bar
    │   ├── FormulaCard.tsx       # Formula display card
    │   ├── ResultsTable.tsx      # Results data table
    │   └── PerformanceGraphs.tsx # Recharts graph components (Graphs page)
    ├── pages/
    │   ├── OverviewPage.tsx      # Overview: intro, scenario, formula, results summary
    │   ├── CalculatorPage.tsx    # Interactive Amdahl's Law calculator
    │   ├── GraphsPage.tsx        # Performance graphs with shared parallel fraction
    │   ├── ComparisonPage.tsx    # Server comparison and recommendation simulator
    │   └── AboutPage.tsx         # Project info and technology stack
    └── tests/
        ├── setup.ts              # Vitest global setup
        ├── amdahl.test.ts        # Unit tests for core calculation functions (49 tests)
        ├── graphs.test.ts        # Unit tests for graph data calculations (38 tests)
        └── comparison.test.ts    # Unit tests for server comparison and recommendation (82 tests)
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
cd coa
npm install
```

### Running Locally (Development)

```bash
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

### Running Tests

```bash
npm test              # Run all 169 unit tests once
npm run test:watch    # Watch mode (re-runs on file changes)
npm run test:ui       # Vitest browser UI
```

### Type-Check and Build Validation

```bash
npm run build         # Runs tsc -b then vite build; both must pass
```

---

## Shared State Architecture

The **parallel fraction P** is lifted to App-level state (`useState` in `App.tsx`). It is passed as a prop to the Calculator, Graphs, and Server Comparison pages so that all three sections stay consistent when P changes. No external state library is used.

---

## Assumptions and Limitations

| Assumption | Detail |
|---|---|
| Parallel fraction | Fixed at P = 0.85 as the default scenario. User can adjust it in the Calculator and Graphs pages. |
| Core configurations | Server Comparison evaluates 4, 16, 32, 64, and 128 cores. |
| Cost data | All cost inputs are user-supplied assumptions. No real market prices are included. |
| Electricity formula | Monthly electricity cost = (Watts ÷ 1000) × hours/day × 30 × USD/kWh |
| Theoretical model | Amdahl's Law does not account for memory bandwidth, cache contention, inter-core communication, OS scheduling overhead, or I/O latency. |

---

## Why Theoretical Speedup ≠ Measured Performance

Amdahl's Law assumes:
- The parallel fraction P is perfectly parallelisable with zero overhead.
- Cores do not interfere with each other (no cache coherence cost, no lock contention).
- Memory bandwidth is unlimited.
- The serial fraction is truly sequential and cannot be further optimised.

Real server performance depends on all of these factors. Amdahl's Law identifies an **upper bound**. Actual throughput will always be lower. Profiling, benchmarking, and load testing under realistic flash-sale conditions are required before making a production hardware decision.

---

## License

This project is for academic purposes only.
