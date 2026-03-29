# Personal Finance Planner (React + TypeScript)

A small single-page app that simulates year-by-year personal finances across life stages:
- career
- gap years
- freelance / semi-retirement
- retirement

It calculates:
- yearly net worth curve
- ending estate value
- success/failure against target estate
- required annual return (binary search solver)

## Run locally

```bash
npm install
npm run dev
```

Build production bundle:

```bash
npm run build
npm run preview
```

## Project structure

- `src/financialModel.ts`: all financial simulation and required-return solving logic (pure functions).
- `src/types.ts`: shared type models for inputs and simulation outputs.
- `src/App.tsx`: form state, validation wiring, results summary.
- `src/components/*`: reusable UI components (chart/table/sections).
- `src/defaults.ts`: default assumptions loaded at startup.
- `src/validation.ts`: guardrails for invalid age/stage combinations.

## Extend later

To add taxes, inflation-adjusted outputs, Monte Carlo simulation, or asset allocation:
1. Extend `PlannerInputs` in `src/types.ts`.
2. Add corresponding yearly math in `simulatePlan` (`src/financialModel.ts`).
3. Keep UI wiring in `src/App.tsx` and visualizations in dedicated components.
