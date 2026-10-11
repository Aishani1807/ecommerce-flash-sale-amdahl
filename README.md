# E-Commerce Flash Sale: Performance Analysis Using Amdahl's Law

> **Computer Organisation and Architecture (COA) Project**
> Interactive web application demonstrating Amdahl's Law on an e-commerce order-processing system.

---

## Project Objective

Model and analyse the **theoretical speedup** achievable by parallelising the order-processing
pipeline of an e-commerce platform during a flash sale, using **Amdahl's Law**.

---

## Scenario Parameters

| Parameter              | Value       |
|------------------------|-------------|
| Parallel fraction (P)  | 0.85 (85 %) |
| Serial fraction (S)    | 0.15 (15 %) |
| Core configurations    | 4, 16, 64   |

### Expected Results

| Cores (n) | Speedup    | Formula                             |
|-----------|------------|-------------------------------------|
| 4         | ~2.7586x   | 1 / (0.15 + 0.85/4)                |
| 16        | ~4.9231x   | 1 / (0.15 + 0.85/16)               |
| 64        | ~6.1244x   | 1 / (0.15 + 0.85/64)               |
| infinity  | ~6.6667x   | 1 / S = 1 / 0.15 (theoretical max) |

---

## Technology Stack

| Technology    | Purpose                          |
|---------------|----------------------------------|
| React 19      | UI component library             |
| TypeScript    | Type-safe JavaScript             |
| Vite          | Build tool and dev server        |
| Tailwind CSS 3| Utility-first styling            |
| Recharts      | Interactive charts               |
| Vitest        | Unit testing framework           |

---

## Folder Structure

```
coa/
├── index.html               # Application entry HTML
├── vite.config.ts           # Vite + Vitest configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── tsconfig.app.json        # TypeScript configuration
├── package.json             # Dependencies and scripts
└── src/
    ├── main.tsx             # React app entry point
    ├── App.tsx              # Root component + page router
    ├── index.css            # Global styles (Tailwind + custom)
    ├── types/
    │   └── amdahl.ts        # TypeScript types and interfaces
    ├── calculations/
    │   └── amdahl.ts        # Amdahl's Law calculation functions
    ├── utils/
    │   ├── constants.ts     # Scenario constants and chart colours
    │   └── formatters.ts    # Number formatting helpers
    ├── components/
    │   ├── Navbar.tsx       # Navigation bar
    │   ├── FormulaCard.tsx  # Formula display card
    │   └── ResultsTable.tsx # Results data table
    ├── pages/
    │   ├── HomePage.tsx     # Landing page and scenario overview
    │   ├── TheoryPage.tsx   # Theory explanation
    │   ├── AnalysisPage.tsx # Interactive analysis and charts
    │   └── AboutPage.tsx    # Project info and tech stack
    └── tests/
        ├── setup.ts         # Vitest global setup
        └── amdahl.test.ts   # Unit tests for calculation functions
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
cd coa
npm install
```

### Running Locally

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

### Running Tests

```bash
npm test             # Run all unit tests once
npm run test:watch   # Watch mode
npm run test:ui      # Vitest browser UI
```

---

## Amdahl's Law Formula

```
Speedup(n) = 1 / ( S + P/n )

Where:
  S = Serial fraction   = 1 - P
  P = Parallel fraction
  n = Number of processor cores

Maximum Speedup (n -> infinity) = 1 / S
```

---

## License

This project is for academic purposes only.
