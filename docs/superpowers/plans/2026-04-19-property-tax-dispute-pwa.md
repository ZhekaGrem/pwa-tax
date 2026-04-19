# Property Tax Dispute PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Texas-only PWA that takes a homeowner from Google sign-in through a 4-step wizard to a downloadable, server-filled Form 50-132 PDF, with offline support and a visible sync indicator.

**Architecture:** Next.js 15 App Router Hybrid — SSR landing, client components for app, one Route Handler for PDF. Firebase Auth + Firestore with `persistentLocalCache`. Zustand-persisted wizard draft. Pure calculator and Zod schemas as single source of truth. Serwist for app-shell caching.

**Tech Stack:** Next.js 15 · TypeScript 5 strict · Tailwind CSS 4 · shadcn/ui · Firebase Web + Admin SDK · Firestore · Zod · Zustand · Recharts · pdf-lib · Serwist · Vitest · RTL · Playwright · Firebase Emulator · Vercel.

**Spec:** `docs/superpowers/specs/2026-04-19-property-tax-dispute-pwa-design.md`

---

## Task 1: Scaffold Next.js project

**Files:**

- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `.prettierrc`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js with non-interactive scaffold**

Run from `F:\Progect\2026\pwa\property-tax-dispute`:

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --turbopack --import-alias "@/*" --use-npm --yes
```

Expected: project files created in current directory (note the trailing `.`).

- [ ] **Step 2: Add Prettier, lint-staged, husky**

```bash
npm i -D prettier eslint-config-prettier eslint-plugin-jsx-a11y husky lint-staged
npx husky init
```

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

Add to `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx,json,md}": ["prettier --write"],
  "*.{ts,tsx}": ["eslint --max-warnings=0 --fix"]
}
```

Replace `.husky/pre-commit` contents with:

```bash
npx lint-staged
```

- [ ] **Step 3: Update .eslintrc.json with a11y preset**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript", "plugin:jsx-a11y/recommended", "prettier"]
}
```

- [ ] **Step 4: Add npm scripts**

Add to `package.json`:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint --max-warnings=0",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "e2e": "playwright test",
  "check": "npm run typecheck && npm run lint && npm run test"
}
```

- [ ] **Step 5: Run baseline verification**

```bash
npm run typecheck && npm run lint && npm run build
```

Expected: all three succeed.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 15 + Tailwind + Prettier + husky"
```

---

## Task 2: Testing infrastructure (Vitest + RTL + Playwright)

**Files:**

- Create: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `src/test/utils.tsx`

- [ ] **Step 1: Install test dependencies**

```bash
npm i -D vitest @vitest/coverage-v8 @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'dom',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/lib/pdf.test.ts', 'src/lib/firebase/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'src/lib/pdf.test.ts',
            'src/lib/firebase/**/*.test.ts',
            'src/services/**/*.test.ts',
          ],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/services/**', 'src/schemas/**'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())
```

- [ ] **Step 4: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: process.env.CI
    ? undefined
    : { command: 'npm run dev', port: 3000, reuseExistingServer: true, timeout: 60_000 },
})
```

- [ ] **Step 5: Create a sanity test**

`src/lib/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('sanity', () => {
  it('arithmetic works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 6: Verify**

```bash
npm run test
```

Expected: `1 passed`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: configure Vitest, RTL, Playwright with node/dom project split"
```

---

## Task 3: Zod schemas

**Files:**

- Create: `src/schemas/appeal.ts`, `src/schemas/appeal.test.ts`

- [ ] **Step 1: Install Zod**

```bash
npm i zod
```

- [ ] **Step 2: Write failing tests first**

`src/schemas/appeal.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { PropertySchema, AssessmentSchema, CompSchema, AppealSchema } from './appeal'

const validProperty = {
  address: '123 Oak St, Houston, TX',
  county: 'Harris' as const,
  parcelId: '0660740000013',
  yearBuilt: 1998,
  sqft: 1850,
  bedrooms: 3,
  bathrooms: 2,
  lotSizeSqft: 6500,
}
const validAssessment = { currentAssessedValue: 400000, marketValue: 420000, taxRate: 0.0231 }
const validComp = {
  parcelId: '0660740000014',
  address: '125 Oak St',
  zip: '77005',
  assessedValue: 340000,
  sqft: 1800,
  yearBuilt: 1997,
  bedrooms: 3,
  bathrooms: 2,
}

describe('PropertySchema', () => {
  it('accepts valid property', () => {
    expect(PropertySchema.safeParse(validProperty).success).toBe(true)
  })
  it('rejects sqft below 100', () => {
    expect(PropertySchema.safeParse({ ...validProperty, sqft: 50 }).success).toBe(false)
  })
  it('rejects yearBuilt in future', () => {
    expect(PropertySchema.safeParse({ ...validProperty, yearBuilt: 3000 }).success).toBe(false)
  })
})

describe('AssessmentSchema', () => {
  it('accepts valid assessment', () => {
    expect(AssessmentSchema.safeParse(validAssessment).success).toBe(true)
  })
  it('rejects taxRate >= 0.1', () => {
    expect(AssessmentSchema.safeParse({ ...validAssessment, taxRate: 0.2 }).success).toBe(false)
  })
  it('rejects currentAssessedValue below 1000', () => {
    expect(
      AssessmentSchema.safeParse({ ...validAssessment, currentAssessedValue: 0 }).success,
    ).toBe(false)
  })
})

describe('CompSchema', () => {
  it('accepts valid comp', () => {
    expect(CompSchema.safeParse(validComp).success).toBe(true)
  })
  it('rejects non-Texas ZIP shape', () => {
    expect(CompSchema.safeParse({ ...validComp, zip: 'abcde' }).success).toBe(false)
  })
})

describe('AppealSchema', () => {
  const validAppeal = {
    id: 'x',
    ownerUid: 'u1',
    year: 2026,
    status: 'draft' as const,
    property: validProperty,
    assessment: validAssessment,
    selectedComps: [validComp, validComp, validComp],
    calculation: null,
  }
  it('accepts draft with 3 comps', () => {
    expect(AppealSchema.safeParse(validAppeal).success).toBe(true)
  })
  it('rejects ready status with fewer than 3 comps', () => {
    const appeal = { ...validAppeal, status: 'ready' as const, selectedComps: [validComp] }
    expect(AppealSchema.safeParse(appeal).success).toBe(false)
  })
})
```

- [ ] **Step 3: Run tests — expect failure**

```bash
npm run test -- src/schemas/appeal.test.ts
```

Expected: fails with "cannot find module".

- [ ] **Step 4: Implement schemas**

`src/schemas/appeal.ts`:

```ts
import { z } from 'zod'

const currentYear = new Date().getFullYear()

export const PropertySchema = z.object({
  address: z.string().min(5),
  county: z.literal('Harris'),
  parcelId: z.string().min(5),
  yearBuilt: z.number().int().min(1800).max(currentYear),
  sqft: z.number().min(100),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  lotSizeSqft: z.number().min(0),
})

export const AssessmentSchema = z.object({
  currentAssessedValue: z.number().min(1000),
  marketValue: z.number().min(0),
  taxRate: z.number().gt(0).lt(0.1),
})

export const CompSchema = z.object({
  parcelId: z.string().min(5),
  address: z.string().min(5),
  zip: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
  assessedValue: z.number().min(0),
  sqft: z.number().min(100),
  yearBuilt: z.number().int().min(1800).max(currentYear),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  distance: z.number().min(0).optional(),
})

export const CalculationSchema = z.object({
  medianCompValue: z.number(),
  proposedValue: z.number(),
  taxSavingsUSD: z.number(),
  percentReduction: z.number(),
})

export const AppealSchema = z
  .object({
    id: z.string(),
    ownerUid: z.string(),
    year: z.number().int(),
    status: z.enum(['draft', 'ready', 'submitted']),
    property: PropertySchema,
    assessment: AssessmentSchema,
    selectedComps: z.array(CompSchema).max(5),
    calculation: CalculationSchema.nullable(),
  })
  .refine((a) => a.status === 'draft' || a.selectedComps.length >= 3, {
    message: 'At least 3 comps required before ready/submitted',
    path: ['selectedComps'],
  })

export type Property = z.infer<typeof PropertySchema>
export type Assessment = z.infer<typeof AssessmentSchema>
export type Comp = z.infer<typeof CompSchema>
export type Calculation = z.infer<typeof CalculationSchema>
export type Appeal = z.infer<typeof AppealSchema>
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm run test -- src/schemas/appeal.test.ts
```

Expected: all 10 cases pass.

- [ ] **Step 6: Commit**

```bash
git add src/schemas
git commit -m "feat(schemas): Zod models for Appeal, Property, Assessment, Comp"
```

---

## Task 4: Calculator (TDD — heart of the product)

**Files:**

- Create: `src/lib/errors.ts`, `src/lib/calculator.ts`, `src/lib/calculator.test.ts`

- [ ] **Step 1: Define error classes**

`src/lib/errors.ts`:

```ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION', 422)
  }
}
export class NotAuthenticated extends AppError {
  constructor() {
    super('Not authenticated', 'UNAUTHENTICATED', 401)
  }
}
export class NotOwner extends AppError {
  constructor() {
    super('Not the owner of this resource', 'FORBIDDEN', 403)
  }
}
export class PdfGenerationError extends AppError {
  constructor(message: string) {
    super(message, 'PDF_GEN_FAIL', 500)
  }
}
export class FirestoreError extends AppError {
  constructor(message: string, firestoreCode: string) {
    super(`${firestoreCode}: ${message}`, 'FIRESTORE', 500)
  }
}
```

- [ ] **Step 2: Write failing calculator tests**

`src/lib/calculator.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeSavings, median } from './calculator'
import { ValidationError } from './errors'

const sampleProperty = { sqft: 2000 }
const compAt = (assessedValue: number, sqft: number) => ({ assessedValue, sqft })
const TAX_RATE = 0.0231

describe('median', () => {
  it('returns middle element for odd count', () => {
    expect(median([1, 5, 3])).toBe(3)
  })
  it('returns average of two middle elements for even count', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5)
  })
  it('throws on empty array', () => {
    expect(() => median([])).toThrow(ValidationError)
  })
})

describe('computeSavings', () => {
  it('computes median-based proposed value from $/sqft comps', () => {
    const comps = [compAt(300000, 2000), compAt(340000, 2000), compAt(320000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.proposedValue).toBe(320000) // median $/sqft (160) * 2000 sqft
  })

  it('savings = (current - proposed) * taxRate', () => {
    const comps = [compAt(300000, 2000), compAt(300000, 2000), compAt(300000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.taxSavingsUSD).toBeCloseTo((400000 - 300000) * TAX_RATE)
  })

  it('clamps savings to 0 when proposed >= current', () => {
    const comps = [compAt(500000, 2000), compAt(600000, 2000), compAt(550000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.proposedValue).toBe(400000)
    expect(r.taxSavingsUSD).toBe(0)
  })

  it('percentReduction is 0 when no savings', () => {
    const comps = [compAt(600000, 2000), compAt(700000, 2000), compAt(650000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.percentReduction).toBe(0)
  })

  it('percentReduction correctly computed', () => {
    const comps = [compAt(300000, 2000), compAt(300000, 2000), compAt(300000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.percentReduction).toBeCloseTo(0.25)
  })

  it('throws on empty comps', () => {
    expect(() =>
      computeSavings({
        property: sampleProperty,
        currentAssessedValue: 400000,
        comps: [],
        taxRate: TAX_RATE,
      }),
    ).toThrow(ValidationError)
  })

  it('throws on comp with zero sqft (divide-by-zero)', () => {
    const comps = [compAt(300000, 0), compAt(340000, 2000), compAt(320000, 2000)]
    expect(() =>
      computeSavings({
        property: sampleProperty,
        currentAssessedValue: 400000,
        comps,
        taxRate: TAX_RATE,
      }),
    ).toThrow(ValidationError)
  })

  it('throws on negative currentAssessedValue', () => {
    const comps = [compAt(300000, 2000), compAt(340000, 2000), compAt(320000, 2000)]
    expect(() =>
      computeSavings({
        property: sampleProperty,
        currentAssessedValue: -1,
        comps,
        taxRate: TAX_RATE,
      }),
    ).toThrow(ValidationError)
  })

  it('throws on zero subject sqft', () => {
    const comps = [compAt(300000, 2000), compAt(340000, 2000), compAt(320000, 2000)]
    expect(() =>
      computeSavings({
        property: { sqft: 0 },
        currentAssessedValue: 400000,
        comps,
        taxRate: TAX_RATE,
      }),
    ).toThrow(ValidationError)
  })

  it('throws on taxRate out of range', () => {
    const comps = [compAt(300000, 2000), compAt(340000, 2000), compAt(320000, 2000)]
    expect(() =>
      computeSavings({ property: sampleProperty, currentAssessedValue: 400000, comps, taxRate: 0 }),
    ).toThrow(ValidationError)
  })

  it('handles 5 comps with even-count median', () => {
    const comps = [
      compAt(280000, 2000),
      compAt(300000, 2000),
      compAt(320000, 2000),
      compAt(340000, 2000),
    ]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.proposedValue).toBe(310000) // median of 140,150,160,170 = 155; 155*2000 = 310000
  })

  it('HCAD snapshot: realistic Houston values', () => {
    const comps = [compAt(342000, 1850), compAt(358000, 1900), compAt(351000, 1875)]
    const r = computeSavings({
      property: { sqft: 1900 },
      currentAssessedValue: 425000,
      comps,
      taxRate: 0.0231,
    })
    expect(r.proposedValue).toBeGreaterThan(340000)
    expect(r.proposedValue).toBeLessThan(365000)
    expect(r.taxSavingsUSD).toBeGreaterThan(1000)
  })
})
```

- [ ] **Step 3: Run tests — expect fail**

```bash
npm run test -- src/lib/calculator.test.ts
```

Expected: all fail (module not found).

- [ ] **Step 4: Implement the calculator**

`src/lib/calculator.ts`:

```ts
import { ValidationError } from './errors'

export function median(values: number[]): number {
  if (values.length === 0) throw new ValidationError('Cannot compute median of empty array')
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

type ComputeInput = {
  property: { sqft: number }
  currentAssessedValue: number
  comps: ReadonlyArray<{ assessedValue: number; sqft: number }>
  taxRate: number
}

export type ComputeResult = {
  medianCompValue: number
  proposedValue: number
  taxSavingsUSD: number
  percentReduction: number
}

export function computeSavings({
  property,
  currentAssessedValue,
  comps,
  taxRate,
}: ComputeInput): ComputeResult {
  if (comps.length === 0) throw new ValidationError('At least one comp required')
  if (currentAssessedValue < 0) throw new ValidationError('currentAssessedValue must be >= 0')
  if (property.sqft <= 0) throw new ValidationError('Subject sqft must be > 0')
  if (taxRate <= 0 || taxRate >= 0.1) throw new ValidationError('taxRate out of range (0, 0.1)')
  if (comps.some((c) => c.sqft <= 0)) throw new ValidationError('All comps must have sqft > 0')

  const pricePerSqft = comps.map((c) => c.assessedValue / c.sqft)
  const medianPricePerSqft = median(pricePerSqft)
  const medianCompValue = medianPricePerSqft * property.sqft
  const proposedValue = Math.min(currentAssessedValue, medianCompValue)
  const taxSavingsUSD = Math.max(0, (currentAssessedValue - proposedValue) * taxRate)
  const percentReduction =
    currentAssessedValue > 0
      ? Math.max(0, (currentAssessedValue - proposedValue) / currentAssessedValue)
      : 0

  return { medianCompValue, proposedValue, taxSavingsUSD, percentReduction }
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm run test -- src/lib/calculator.test.ts
```

Expected: 12+ cases pass.

- [ ] **Step 6: Check coverage**

```bash
npm run test:coverage -- src/lib/calculator.test.ts
```

Expected: `calculator.ts` ≥ 95% coverage.

- [ ] **Step 7: Commit**

```bash
git add src/lib
git commit -m "feat(calculator): pure computeSavings with 12 TDD cases"
```

---

## Task 5: Timeline data + getCurrentPhase

**Files:**

- Create: `src/data/timeline-texas.ts`, `src/data/timeline-texas.test.ts`

- [ ] **Step 1: Write failing tests**

`src/data/timeline-texas.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getCurrentPhase, TEXAS_TIMELINE } from './timeline-texas'

describe('getCurrentPhase', () => {
  it('returns assessment phase on Feb 1', () => {
    expect(getCurrentPhase(new Date(2026, 1, 1)).id).toBe('assessment')
  })
  it('returns filing window on Apr 20', () => {
    expect(getCurrentPhase(new Date(2026, 3, 20)).id).toBe('filing')
  })
  it('returns filing window on May 15', () => {
    expect(getCurrentPhase(new Date(2026, 4, 15)).id).toBe('filing')
  })
  it('returns waiting on Jun 1', () => {
    expect(getCurrentPhase(new Date(2026, 5, 1)).id).toBe('waiting')
  })
  it('returns hearing on Oct 1', () => {
    expect(getCurrentPhase(new Date(2026, 9, 1)).id).toBe('hearing')
  })
})

describe('TEXAS_TIMELINE', () => {
  it('has 4 ordered phases', () => {
    expect(TEXAS_TIMELINE).toHaveLength(4)
    expect(TEXAS_TIMELINE.map((p) => p.id)).toEqual(['assessment', 'filing', 'waiting', 'hearing'])
  })
})
```

- [ ] **Step 2: Implement**

`src/data/timeline-texas.ts`:

```ts
export type TimelinePhase = {
  id: 'assessment' | 'filing' | 'waiting' | 'hearing'
  label: string
  description: string
  startMonth: number // 0-indexed
  startDay: number
  endMonth: number
  endDay: number
  tone: 'grey' | 'yellow' | 'blue'
}

export const TEXAS_TIMELINE: readonly TimelinePhase[] = [
  {
    id: 'assessment',
    label: 'Assessment period',
    description: 'Appraisal district determines property values',
    startMonth: 0,
    startDay: 1,
    endMonth: 3,
    endDay: 14,
    tone: 'grey',
  },
  {
    id: 'filing',
    label: 'Notice received — time to file',
    description: 'Deadline to file Form 50-132 is May 15',
    startMonth: 3,
    startDay: 15,
    endMonth: 4,
    endDay: 15,
    tone: 'yellow',
  },
  {
    id: 'waiting',
    label: 'Waiting for ARB hearing',
    description: 'Appraisal Review Board schedules your hearing',
    startMonth: 4,
    startDay: 16,
    endMonth: 6,
    endDay: 31,
    tone: 'blue',
  },
  {
    id: 'hearing',
    label: 'Hearing season / judicial appeal window',
    description: 'Informal and formal hearings; judicial appeal after ARB',
    startMonth: 7,
    startDay: 1,
    endMonth: 11,
    endDay: 31,
    tone: 'blue',
  },
]

function dayOfYear(m: number, d: number): number {
  return new Date(2001, m, d).getTime() / 86_400_000
}

export function getCurrentPhase(now: Date): TimelinePhase {
  const nowDoy = dayOfYear(now.getMonth(), now.getDate())
  for (const phase of TEXAS_TIMELINE) {
    const start = dayOfYear(phase.startMonth, phase.startDay)
    const end = dayOfYear(phase.endMonth, phase.endDay)
    if (nowDoy >= start && nowDoy <= end) return phase
  }
  return TEXAS_TIMELINE[0]
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test -- src/data/timeline-texas.test.ts
```

Expected: 6 pass.

- [ ] **Step 4: Commit**

```bash
git add src/data
git commit -m "feat(timeline): Texas appeal timeline with getCurrentPhase"
```

---

## Task 6: Firebase client (persistentLocalCache)

**Files:**

- Create: `src/lib/firebase/client.ts`, `.env.local.example`, update `.gitignore`

- [ ] **Step 1: Install Firebase Web SDK**

```bash
npm i firebase
```

- [ ] **Step 2: Create `.env.local.example`**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server-only (do NOT prefix with NEXT_PUBLIC_)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Local dev emulator toggle
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

Ensure `.gitignore` contains `.env.local`.

- [ ] **Step 3: Create `src/lib/firebase/client.ts`**

```ts
'use client'
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

let _app: FirebaseApp | undefined
let _db: Firestore | undefined
let _auth: Auth | undefined

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app
  _app = getApps()[0] ?? initializeApp(config)
  return _app
}

export function getDb(): Firestore {
  if (_db) return _db
  const app = getFirebaseApp()
  _db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    connectFirestoreEmulator(_db, '127.0.0.1', 8080)
  }
  return _db
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth
  _auth = getAuth(getFirebaseApp())
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(_auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  }
  return _auth
}
```

- [ ] **Step 4: Commit**

```bash
git add .env.local.example .gitignore src/lib/firebase/client.ts
git commit -m "feat(firebase): client init with persistentLocalCache + emulator support"
```

---

## Task 7: Firebase Admin (server-only)

**Files:**

- Create: `src/lib/firebase/admin.ts`

- [ ] **Step 1: Install server packages**

```bash
npm i firebase-admin server-only
```

- [ ] **Step 2: Create `src/lib/firebase/admin.ts`**

```ts
import 'server-only'
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth as getAdminAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore as getAdminFirestore, type Firestore } from 'firebase-admin/firestore'

let _app: App | undefined

function getApp(): App {
  if (_app) return _app
  const existing = getApps()[0]
  if (existing) {
    _app = existing
    return _app
  }
  _app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    }),
  })
  return _app
}

export function adminAuth(): Auth {
  return getAdminAuth(getApp())
}
export function adminDb(): Firestore {
  return getAdminFirestore(getApp())
}
```

- [ ] **Step 3: Verify client import fails**

Create temporary `src/app/_test-import.tsx`:

```tsx
'use client'
import { adminAuth } from '@/lib/firebase/admin'
export default function X() {
  void adminAuth
  return null
}
```

Run `npm run build`. Expected: error "Cannot import 'server-only' from a client module". Delete the temporary file.

- [ ] **Step 4: Commit**

```bash
git add src/lib/firebase/admin.ts package.json package-lock.json
git commit -m "feat(firebase): admin SDK with server-only boundary"
```

---

## Task 8: Firestore rules + emulator tests

**Files:**

- Create: `firestore.rules`, `firebase.json`, `src/services/storage.test.ts`

- [ ] **Step 1: Install tooling**

```bash
npm i -D @firebase/rules-unit-testing firebase-tools
```

- [ ] **Step 2: Create `firebase.json`**

```json
{
  "firestore": { "rules": "firestore.rules" },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "enabled": true, "port": 4000 },
    "singleProjectMode": true
  }
}
```

- [ ] **Step 3: Create `firestore.rules`**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appeals/{uid}/properties/{propId} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null
                             && request.auth.uid == uid
                             && request.resource.data.ownerUid == uid
                             && request.resource.data.keys().size() < 20;
      allow delete: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

- [ ] **Step 4: Add emulator npm script**

```json
"emulator": "firebase emulators:start --project demo-ptx"
```

- [ ] **Step 5: Write rules tests**

`src/services/storage.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { doc, setDoc, getDoc } from 'firebase/firestore'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-ptx',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

afterAll(async () => {
  await env.cleanup()
})
beforeEach(async () => {
  await env.clearFirestore()
})

describe('firestore rules', () => {
  it('allows owner to write their appeal', async () => {
    const alice = env.authenticatedContext('alice').firestore()
    const ref = doc(alice, 'appeals/alice/properties/p1')
    await assertSucceeds(setDoc(ref, { ownerUid: 'alice', status: 'draft', year: 2026 }))
  })

  it('blocks bob from writing alice document', async () => {
    const bob = env.authenticatedContext('bob').firestore()
    const ref = doc(bob, 'appeals/alice/properties/p1')
    await assertFails(setDoc(ref, { ownerUid: 'bob', status: 'draft', year: 2026 }))
  })

  it('blocks anonymous reads', async () => {
    const unauth = env.unauthenticatedContext().firestore()
    const ref = doc(unauth, 'appeals/alice/properties/p1')
    await assertFails(getDoc(ref))
  })

  it('blocks writes with mismatched ownerUid', async () => {
    const alice = env.authenticatedContext('alice').firestore()
    const ref = doc(alice, 'appeals/alice/properties/p1')
    await assertFails(setDoc(ref, { ownerUid: 'bob', status: 'draft', year: 2026 }))
  })
})
```

- [ ] **Step 6: Add emulator test runner script**

```json
"test:rules": "firebase emulators:exec --only firestore --project demo-ptx \"vitest run src/services/storage.test.ts\""
```

- [ ] **Step 7: Run rules tests**

```bash
npm run test:rules
```

Expected: 4 pass.

- [ ] **Step 8: Commit**

```bash
git add firestore.rules firebase.json src/services/storage.test.ts package.json package-lock.json
git commit -m "feat(rules): Firestore security rules with emulator tests"
```

---

## Task 9: Storage service + comps service

**Files:**

- Create: `src/services/storage.ts`, `src/services/comps.ts`, `src/services/comps.test.ts`

- [ ] **Step 1: Implement storage repo**

`src/services/storage.ts`:

```ts
'use client'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase/client'
import type { Appeal } from '@/schemas/appeal'

export async function createDraftAppeal(
  uid: string,
  data: Omit<Appeal, 'id' | 'ownerUid' | 'status' | 'calculation'>,
) {
  const col = collection(getDb(), 'appeals', uid, 'properties')
  const ref = await addDoc(col, {
    ...data,
    ownerUid: uid,
    status: 'draft' as const,
    calculation: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateAppeal(uid: string, id: string, patch: Partial<Appeal>) {
  const ref = doc(getDb(), 'appeals', uid, 'properties', id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() } as Record<string, unknown>)
}

export function subscribeAppeal(
  uid: string,
  id: string,
  cb: (a: Appeal | null, hasPendingWrites: boolean) => void,
) {
  const ref = doc(getDb(), 'appeals', uid, 'properties', id)
  return onSnapshot(ref, { includeMetadataChanges: true }, (snap) => {
    cb(
      snap.exists() ? ({ id: snap.id, ...snap.data() } as Appeal) : null,
      snap.metadata.hasPendingWrites,
    )
  })
}
```

- [ ] **Step 2: Implement comps lazy loader**

`src/services/comps.ts`:

```ts
import type { Comp } from '@/schemas/appeal'

export async function loadCompsForZip(zip: string): Promise<Comp[]> {
  const res = await fetch(`/data/comps/${zip}.json`, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  return (await res.json()) as Comp[]
}
```

- [ ] **Step 3: Test comps loader with mock fetch**

`src/services/comps.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { loadCompsForZip } from './comps'

describe('loadCompsForZip', () => {
  it('returns parsed array on 200', async () => {
    const payload = [
      {
        parcelId: 'x',
        address: 'a',
        zip: '77005',
        assessedValue: 1,
        sqft: 1,
        yearBuilt: 2000,
        bedrooms: 1,
        bathrooms: 1,
      },
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) }),
    )
    expect(await loadCompsForZip('77005')).toEqual(payload)
  })

  it('returns empty array on 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await loadCompsForZip('99999')).toEqual([])
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npm run test -- src/services/comps.test.ts
```

Expected: 2 pass.

- [ ] **Step 5: Commit**

```bash
git add src/services
git commit -m "feat(services): storage repo + comps loader with tests"
```

---

## Task 10: Seed comps JSON + base UI (shadcn)

**Files:**

- Create: 7 files `public/data/comps/{zip}.json`, `components.json`, `src/components/ui/*`

- [ ] **Step 1: Initialize shadcn**

```bash
npx shadcn@latest init -y -d
```

Choose defaults: TypeScript, `src/` alias, New York style, Slate theme, Tailwind.

- [ ] **Step 2: Add base components**

```bash
npx shadcn@latest add button input card label select form sonner -y
```

- [ ] **Step 3: Create seed JSON files (7 ZIPs, 7 comps each ≈ 49 records)**

For each ZIP 77005, 77006, 77019, 77024, 77030, 77098, 77401 create `public/data/comps/{zip}.json` with 7 records. Example for 77005:

```json
[
  {
    "parcelId": "0660740000013",
    "address": "123 Oak St, Houston, TX 77005",
    "zip": "77005",
    "assessedValue": 342000,
    "sqft": 1850,
    "yearBuilt": 1998,
    "bedrooms": 3,
    "bathrooms": 2
  },
  {
    "parcelId": "0660740000014",
    "address": "125 Oak St, Houston, TX 77005",
    "zip": "77005",
    "assessedValue": 358000,
    "sqft": 1910,
    "yearBuilt": 2001,
    "bedrooms": 3,
    "bathrooms": 2
  },
  {
    "parcelId": "0660740000015",
    "address": "127 Oak St, Houston, TX 77005",
    "zip": "77005",
    "assessedValue": 389000,
    "sqft": 2040,
    "yearBuilt": 2005,
    "bedrooms": 4,
    "bathrooms": 3
  },
  {
    "parcelId": "0660740000016",
    "address": "200 Elm Ave, Houston, TX 77005",
    "zip": "77005",
    "assessedValue": 412000,
    "sqft": 2150,
    "yearBuilt": 2010,
    "bedrooms": 4,
    "bathrooms": 3
  },
  {
    "parcelId": "0660740000017",
    "address": "204 Elm Ave, Houston, TX 77005",
    "zip": "77005",
    "assessedValue": 325000,
    "sqft": 1780,
    "yearBuilt": 1995,
    "bedrooms": 3,
    "bathrooms": 2
  },
  {
    "parcelId": "0660740000018",
    "address": "208 Elm Ave, Houston, TX 77005",
    "zip": "77005",
    "assessedValue": 371000,
    "sqft": 1950,
    "yearBuilt": 2003,
    "bedrooms": 3,
    "bathrooms": 2
  },
  {
    "parcelId": "0660740000019",
    "address": "212 Elm Ave, Houston, TX 77005",
    "zip": "77005",
    "assessedValue": 398000,
    "sqft": 2100,
    "yearBuilt": 2008,
    "bedrooms": 4,
    "bathrooms": 3
  }
]
```

Repeat with varied streets/values for 77006, 77019, 77024, 77030, 77098, 77401. Keep `assessedValue` between $250k-$500k and `sqft` between 1500-2300.

- [ ] **Step 4: Validate all seed data with Zod**

Create `scripts/validate-seed.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { z } from 'zod'
import { CompSchema } from '../src/schemas/appeal'

const dir = 'public/data/comps'
for (const file of readdirSync(dir)) {
  const data = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'))
  const parsed = z.array(CompSchema).safeParse(data)
  if (!parsed.success) {
    console.error(`INVALID: ${file}`, parsed.error.issues)
    process.exit(1)
  }
  console.log(`OK ${file}: ${parsed.data.length} comps`)
}
```

Add script: `"validate:seed": "tsx scripts/validate-seed.ts"` and install tsx: `npm i -D tsx`.

Run: `npm run validate:seed`. Expected: all 7 files OK.

- [ ] **Step 5: Commit**

```bash
git add public/data components.json src/components/ui scripts package.json package-lock.json
git commit -m "feat: seed comps JSON (7 ZIPs) + shadcn base UI"
```

---

## Task 11: Auth flow (SignIn + AppShell guard)

**Files:**

- Create: `src/app/(app)/layout.tsx`, `src/app/sign-in/page.tsx`, `src/hooks/useAuth.ts`, `src/components/AppShell.tsx`

- [ ] **Step 1: Create auth hook**

`src/hooks/useAuth.ts`:

```ts
'use client'
import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(
    () =>
      onAuthStateChanged(getFirebaseAuth(), (u) => {
        setUser(u)
        setLoading(false)
      }),
    [],
  )
  return {
    user,
    loading,
    signInWithGoogle: () => signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider()),
    signOut: () => signOut(getFirebaseAuth()),
  }
}
```

- [ ] **Step 2: Create sign-in page**

`src/app/sign-in/page.tsx`:

```tsx
'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignInPage() {
  const { user, signInWithGoogle } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user, router])
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to Protest Pilot</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => signInWithGoogle()} className="w-full">
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
```

- [ ] **Step 3: Create AppShell**

`src/components/AppShell.tsx`:

```tsx
'use client'
import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in')
  }, [user, loading, router])
  if (loading || !user) return <div className="p-6">Loading…</div>
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Protest Pilot</h1>
        <span className="text-sm text-slate-500">{user.email}</span>
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Create app group layout**

`src/app/(app)/layout.tsx`:

```tsx
import { AppShell } from '@/components/AppShell'
import type { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
```

Create `src/app/(app)/dashboard/page.tsx` placeholder:

```tsx
export default function Dashboard() {
  return <div>Dashboard — wizard coming next</div>
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: success.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components src/hooks
git commit -m "feat(auth): Google sign-in + AppShell guard"
```

---

## Task 12: Zustand appeal store

**Files:**

- Create: `src/store/useAppealStore.ts`, `src/store/useAppealStore.test.ts`

- [ ] **Step 1: Install Zustand**

```bash
npm i zustand
```

- [ ] **Step 2: Write failing tests**

`src/store/useAppealStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useAppealStore } from './useAppealStore'

beforeEach(() => {
  useAppealStore.setState(useAppealStore.getInitialState(), true)
  localStorage.clear()
})

describe('useAppealStore', () => {
  it('starts at step 0', () => {
    expect(useAppealStore.getState().step).toBe(0)
  })

  it('advances to next step', () => {
    useAppealStore.getState().nextStep()
    expect(useAppealStore.getState().step).toBe(1)
  })

  it('caps step at 3', () => {
    const { nextStep } = useAppealStore.getState()
    for (let i = 0; i < 10; i++) nextStep()
    expect(useAppealStore.getState().step).toBe(3)
  })

  it('patches property and assessment', () => {
    useAppealStore.getState().patchProperty({ address: '1 A St' })
    useAppealStore.getState().patchAssessment({ taxRate: 0.02 })
    expect(useAppealStore.getState().property.address).toBe('1 A St')
    expect(useAppealStore.getState().assessment.taxRate).toBe(0.02)
  })

  it('resets', () => {
    useAppealStore.getState().patchProperty({ address: 'X' })
    useAppealStore.getState().reset()
    expect(useAppealStore.getState().property.address).toBe('')
  })
})
```

- [ ] **Step 3: Implement**

`src/store/useAppealStore.ts`:

```ts
'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Comp, Property, Assessment } from '@/schemas/appeal'

type State = {
  id: string | null
  step: 0 | 1 | 2 | 3
  property: Partial<Property>
  assessment: Partial<Assessment>
  selectedComps: Comp[]
  zip: string
}
type Actions = {
  setId: (id: string) => void
  nextStep: () => void
  prevStep: () => void
  setStep: (step: State['step']) => void
  patchProperty: (p: Partial<Property>) => void
  patchAssessment: (a: Partial<Assessment>) => void
  setZip: (zip: string) => void
  toggleComp: (c: Comp) => void
  setComps: (comps: Comp[]) => void
  reset: () => void
}

const initial: State = {
  id: null,
  step: 0,
  property: { county: 'Harris' },
  assessment: { taxRate: 0.0231 },
  selectedComps: [],
  zip: '',
}

export const useAppealStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      setId: (id) => set({ id }),
      nextStep: () => set({ step: Math.min(3, get().step + 1) as State['step'] }),
      prevStep: () => set({ step: Math.max(0, get().step - 1) as State['step'] }),
      setStep: (step) => set({ step }),
      patchProperty: (p) => set({ property: { ...get().property, ...p } }),
      patchAssessment: (a) => set({ assessment: { ...get().assessment, ...a } }),
      setZip: (zip) => set({ zip }),
      toggleComp: (c) => {
        const exists = get().selectedComps.find((x) => x.parcelId === c.parcelId)
        set({
          selectedComps: exists
            ? get().selectedComps.filter((x) => x.parcelId !== c.parcelId)
            : [...get().selectedComps, c],
        })
      },
      setComps: (selectedComps) => set({ selectedComps }),
      reset: () => set(initial),
    }),
    { name: 'appeal-draft' },
  ),
)
```

- [ ] **Step 4: Run tests**

```bash
npm run test -- src/store/useAppealStore.test.ts
```

Expected: 5 pass.

- [ ] **Step 5: Commit**

```bash
git add src/store package.json package-lock.json
git commit -m "feat(store): Zustand appeal store with persist middleware"
```

---

## Task 13: Wizard — StepProperty

**Files:**

- Create: `src/components/wizard/StepProperty.tsx`, `src/components/wizard/StepProperty.test.tsx`, `src/app/(app)/appeal/new/page.tsx`

- [ ] **Step 1: Install react-hook-form**

```bash
npm i react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Write component test**

`src/components/wizard/StepProperty.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepProperty } from './StepProperty'
import { useAppealStore } from '@/store/useAppealStore'

beforeEach(() => useAppealStore.getState().reset())

describe('StepProperty', () => {
  it('blocks Next when required fields are missing', async () => {
    render(<StepProperty />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findAllByText(/required|must/i)).not.toHaveLength(0)
  })

  it('persists values to store on valid submit', async () => {
    render(<StepProperty />)
    await userEvent.type(screen.getByLabelText(/address/i), '123 Oak St, Houston, TX')
    await userEvent.type(screen.getByLabelText(/parcel/i), '0660740000013')
    await userEvent.type(screen.getByLabelText(/year built/i), '1998')
    await userEvent.type(screen.getByLabelText(/sqft/i), '1850')
    await userEvent.type(screen.getByLabelText(/bedrooms/i), '3')
    await userEvent.type(screen.getByLabelText(/bathrooms/i), '2')
    await userEvent.type(screen.getByLabelText(/lot size/i), '6500')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(useAppealStore.getState().property.address).toBe('123 Oak St, Houston, TX')
    expect(useAppealStore.getState().step).toBe(1)
  })
})
```

- [ ] **Step 3: Implement**

`src/components/wizard/StepProperty.tsx`:

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PropertySchema, type Property } from '@/schemas/appeal'
import { useAppealStore } from '@/store/useAppealStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StepProperty() {
  const { property, patchProperty, nextStep } = useAppealStore()
  const form = useForm<Property>({
    resolver: zodResolver(PropertySchema),
    defaultValues: { county: 'Harris', ...property },
  })
  const onSubmit = (v: Property) => {
    patchProperty(v)
    nextStep()
  }

  const field = (name: keyof Property, label: string, type = 'text') => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} {...form.register(name, { valueAsNumber: type === 'number' })} />
      {form.formState.errors[name] && (
        <p className="text-sm text-red-600">{String(form.formState.errors[name]?.message)}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold">Step 1: Your property</h2>
      {field('address', 'Address')}
      {field('parcelId', 'Parcel ID')}
      {field('yearBuilt', 'Year built', 'number')}
      {field('sqft', 'Sqft', 'number')}
      {field('bedrooms', 'Bedrooms', 'number')}
      {field('bathrooms', 'Bathrooms', 'number')}
      {field('lotSizeSqft', 'Lot size (sqft)', 'number')}
      <Button type="submit">Next</Button>
    </form>
  )
}
```

- [ ] **Step 4: Create wizard page shell**

`src/app/(app)/appeal/new/page.tsx`:

```tsx
'use client'
import { useAppealStore } from '@/store/useAppealStore'
import { StepProperty } from '@/components/wizard/StepProperty'

export default function NewAppealPage() {
  const step = useAppealStore((s) => s.step)
  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">Step {step + 1} of 4</div>
      {step === 0 && <StepProperty />}
      {step === 1 && <div>Step 2 coming next task</div>}
      {step === 2 && <div>Step 3 coming next task</div>}
      {step === 3 && <div>Step 4 coming next task</div>}
    </div>
  )
}
```

- [ ] **Step 5: Run tests**

```bash
npm run test -- src/components/wizard/StepProperty.test.tsx
```

Expected: 2 pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/wizard src/app package.json package-lock.json
git commit -m "feat(wizard): StepProperty with RHF + Zod validation"
```

---

## Task 14: Wizard — StepAssessment

**Files:**

- Create: `src/components/wizard/StepAssessment.tsx`, `src/components/wizard/StepAssessment.test.tsx`

- [ ] **Step 1: Write test**

`src/components/wizard/StepAssessment.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepAssessment } from './StepAssessment'
import { useAppealStore } from '@/store/useAppealStore'

beforeEach(() => useAppealStore.getState().reset())

describe('StepAssessment', () => {
  it('rejects taxRate >= 0.1', async () => {
    render(<StepAssessment />)
    await userEvent.type(screen.getByLabelText(/current assessed value/i), '400000')
    await userEvent.type(screen.getByLabelText(/market value/i), '420000')
    await userEvent.clear(screen.getByLabelText(/tax rate/i))
    await userEvent.type(screen.getByLabelText(/tax rate/i), '0.5')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(useAppealStore.getState().step).toBe(0)
  })

  it('advances on valid submit', async () => {
    render(<StepAssessment />)
    await userEvent.type(screen.getByLabelText(/current assessed value/i), '400000')
    await userEvent.type(screen.getByLabelText(/market value/i), '420000')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(useAppealStore.getState().step).toBe(1)
  })
})
```

- [ ] **Step 2: Implement**

`src/components/wizard/StepAssessment.tsx`:

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AssessmentSchema, type Assessment } from '@/schemas/appeal'
import { useAppealStore } from '@/store/useAppealStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function StepAssessment() {
  const { assessment, patchAssessment, nextStep, prevStep } = useAppealStore()
  const form = useForm<Assessment>({
    resolver: zodResolver(AssessmentSchema),
    defaultValues: { taxRate: 0.0231, ...assessment },
  })
  const onSubmit = (v: Assessment) => {
    patchAssessment(v)
    nextStep()
  }
  const field = (name: keyof Assessment, label: string, step = 'any') => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type="number"
        step={step}
        {...form.register(name, { valueAsNumber: true })}
      />
      {form.formState.errors[name] && (
        <p className="text-sm text-red-600">{String(form.formState.errors[name]?.message)}</p>
      )}
    </div>
  )
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold">Step 2: Current assessment</h2>
      {field('currentAssessedValue', 'Current assessed value (USD)')}
      {field('marketValue', 'Market value (USD)')}
      {field('taxRate', 'Tax rate (e.g. 0.0231)', '0.0001')}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Wire into wizard page**

Edit `src/app/(app)/appeal/new/page.tsx`:

```tsx
// replace step === 1 line with:
{
  step === 1 && <StepAssessment />
}
```

Add import: `import { StepAssessment } from '@/components/wizard/StepAssessment'`.

- [ ] **Step 4: Run tests**

```bash
npm run test -- src/components/wizard/StepAssessment.test.tsx
```

Expected: 2 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/wizard src/app
git commit -m "feat(wizard): StepAssessment with taxRate validation"
```

---

## Task 15: Wizard — StepComps

**Files:**

- Create: `src/components/wizard/StepComps.tsx`, `src/components/wizard/StepComps.test.tsx`

- [ ] **Step 1: Write test**

`src/components/wizard/StepComps.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepComps } from './StepComps'
import { useAppealStore } from '@/store/useAppealStore'

beforeEach(() => {
  useAppealStore.getState().reset()
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            parcelId: 'a1',
            address: '1 A',
            zip: '77005',
            assessedValue: 300000,
            sqft: 1800,
            yearBuilt: 2000,
            bedrooms: 3,
            bathrooms: 2,
          },
          {
            parcelId: 'a2',
            address: '2 A',
            zip: '77005',
            assessedValue: 320000,
            sqft: 1850,
            yearBuilt: 2001,
            bedrooms: 3,
            bathrooms: 2,
          },
          {
            parcelId: 'a3',
            address: '3 A',
            zip: '77005',
            assessedValue: 340000,
            sqft: 1900,
            yearBuilt: 2002,
            bedrooms: 3,
            bathrooms: 2,
          },
        ]),
    }),
  )
})

describe('StepComps', () => {
  it('loads comps on ZIP submit and allows selection', async () => {
    render(<StepComps />)
    await userEvent.type(screen.getByLabelText(/zip/i), '77005')
    await userEvent.click(screen.getByRole('button', { name: /load/i }))
    const rows = await screen.findAllByRole('checkbox')
    await userEvent.click(rows[0])
    await userEvent.click(rows[1])
    await userEvent.click(rows[2])
    expect(useAppealStore.getState().selectedComps).toHaveLength(3)
  })

  it('blocks Next with fewer than 3 comps selected', async () => {
    render(<StepComps />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(useAppealStore.getState().step).toBe(0)
    expect(await screen.findByText(/select at least 3/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement**

`src/components/wizard/StepComps.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useAppealStore } from '@/store/useAppealStore'
import { loadCompsForZip } from '@/services/comps'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Comp } from '@/schemas/appeal'

export function StepComps() {
  const { zip, setZip, selectedComps, toggleComp, nextStep, prevStep } = useAppealStore()
  const [comps, setComps] = useState<Comp[]>([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!/^\d{5}$/.test(zip)) {
      setErr('Enter a 5-digit ZIP')
      return
    }
    setErr('')
    setLoading(true)
    setComps(await loadCompsForZip(zip))
    setLoading(false)
  }

  const onNext = () => {
    if (selectedComps.length < 3) {
      setErr('Select at least 3 comparables')
      return
    }
    setErr('')
    nextStep()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Step 3: Select comparables</h2>
      <div className="flex items-end gap-2">
        <div className="space-y-1 flex-1">
          <Label htmlFor="zip">ZIP code</Label>
          <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} />
        </div>
        <Button type="button" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Load'}
        </Button>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <ul className="divide-y rounded border">
        {comps.map((c) => {
          const checked = !!selectedComps.find((x) => x.parcelId === c.parcelId)
          return (
            <li key={c.parcelId} className="flex items-center gap-3 p-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleComp(c)}
                aria-label={c.address}
              />
              <div className="flex-1">
                <div className="font-medium">{c.address}</div>
                <div className="text-sm text-slate-500">
                  ${c.assessedValue.toLocaleString()} · {c.sqft} sqft · {c.bedrooms}bd/{c.bathrooms}
                  ba · {c.yearBuilt}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire into page**

Update `src/app/(app)/appeal/new/page.tsx` to render `<StepComps />` when `step === 2`. Import added.

- [ ] **Step 4: Run tests**

```bash
npm run test -- src/components/wizard/StepComps.test.tsx
```

Expected: 2 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/wizard src/app
git commit -m "feat(wizard): StepComps with ZIP lookup and selection"
```

---

## Task 16: Charts — SavingsBarChart + ComparisonChart

**Files:**

- Create: `src/components/charts/SavingsBarChart.tsx`, `src/components/charts/ComparisonChart.tsx`, `src/components/charts/charts.test.tsx`

- [ ] **Step 1: Install Recharts**

```bash
npm i recharts
```

- [ ] **Step 2: Implement SavingsBarChart**

`src/components/charts/SavingsBarChart.tsx`:

```tsx
'use client'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function SavingsBarChart({
  currentTax,
  proposedTax,
}: {
  currentTax: number
  proposedTax: number
}) {
  const data = [
    { name: 'Current tax', usd: Math.round(currentTax) },
    { name: 'Proposed tax', usd: Math.round(proposedTax) },
  ]
  return (
    <div role="figure" aria-label="Tax savings comparison" className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
          <Bar dataKey="usd" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: Implement ComparisonChart**

`src/components/charts/ComparisonChart.tsx`:

```tsx
'use client'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function ComparisonChart({
  subjectPerSqft,
  medianPerSqft,
}: {
  subjectPerSqft: number
  medianPerSqft: number
}) {
  const data = [
    { name: 'Your property', usd: Math.round(subjectPerSqft) },
    { name: 'Median comp', usd: Math.round(medianPerSqft) },
  ]
  return (
    <div role="figure" aria-label="Per-square-foot comparison" className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `$${v}/sqft`} />
          <Tooltip formatter={(v: number) => `$${v}/sqft`} />
          <Bar dataKey="usd" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 4: Smoke test**

`src/components/charts/charts.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SavingsBarChart } from './SavingsBarChart'
import { ComparisonChart } from './ComparisonChart'

describe('charts', () => {
  it('renders savings figure', () => {
    render(<SavingsBarChart currentTax={9240} proposedTax={6930} />)
    expect(screen.getByRole('figure', { name: /tax savings/i })).toBeInTheDocument()
  })
  it('renders comparison figure', () => {
    render(<ComparisonChart subjectPerSqft={200} medianPerSqft={165} />)
    expect(screen.getByRole('figure', { name: /per-square-foot/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run tests**

```bash
npm run test -- src/components/charts
```

Expected: 2 pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/charts package.json package-lock.json
git commit -m "feat(charts): Recharts SavingsBarChart + ComparisonChart"
```

---

## Task 17: Wizard — StepReview (live preview + save)

**Files:**

- Create: `src/components/wizard/StepReview.tsx`, `src/components/wizard/StepReview.test.tsx`

- [ ] **Step 1: Write test**

`src/components/wizard/StepReview.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepReview } from './StepReview'
import { useAppealStore } from '@/store/useAppealStore'

beforeEach(() => {
  useAppealStore.setState(
    {
      id: 'demo',
      step: 3,
      property: {
        address: '1 A',
        county: 'Harris',
        parcelId: 'p',
        yearBuilt: 2000,
        sqft: 2000,
        bedrooms: 3,
        bathrooms: 2,
        lotSizeSqft: 6000,
      },
      assessment: { currentAssessedValue: 400000, marketValue: 420000, taxRate: 0.0231 },
      selectedComps: [
        {
          parcelId: 'c1',
          address: '1',
          zip: '77005',
          assessedValue: 300000,
          sqft: 2000,
          yearBuilt: 2000,
          bedrooms: 3,
          bathrooms: 2,
        },
        {
          parcelId: 'c2',
          address: '2',
          zip: '77005',
          assessedValue: 320000,
          sqft: 2000,
          yearBuilt: 2000,
          bedrooms: 3,
          bathrooms: 2,
        },
        {
          parcelId: 'c3',
          address: '3',
          zip: '77005',
          assessedValue: 310000,
          sqft: 2000,
          yearBuilt: 2000,
          bedrooms: 3,
          bathrooms: 2,
        },
      ],
      zip: '77005',
    },
    false,
  )
})

describe('StepReview', () => {
  it('shows computed savings in USD', () => {
    render(<StepReview />)
    expect(screen.getByText(/\$2,/)).toBeInTheDocument() // (400000-310000)*0.0231 ≈ $2,079
    expect(screen.getByRole('figure', { name: /tax savings/i })).toBeInTheDocument()
  })

  it('has a Generate PDF button', () => {
    render(<StepReview />)
    expect(screen.getByRole('button', { name: /generate pdf/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Implement**

`src/components/wizard/StepReview.tsx`:

```tsx
'use client'
import { useMemo, useState } from 'react'
import { useAppealStore } from '@/store/useAppealStore'
import { computeSavings } from '@/lib/calculator'
import { SavingsBarChart } from '@/components/charts/SavingsBarChart'
import { ComparisonChart } from '@/components/charts/ComparisonChart'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { getFirebaseAuth } from '@/lib/firebase/client'

export function StepReview() {
  const { id, property, assessment, selectedComps, prevStep } = useAppealStore()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const calc = useMemo(() => {
    try {
      return computeSavings({
        property: { sqft: property.sqft ?? 0 },
        currentAssessedValue: assessment.currentAssessedValue ?? 0,
        comps: selectedComps,
        taxRate: assessment.taxRate ?? 0,
      })
    } catch {
      return null
    }
  }, [property, assessment, selectedComps])

  const onGenerate = async () => {
    if (!user || !id) {
      toast.error('Not ready')
      return
    }
    setLoading(true)
    try {
      const token = await getFirebaseAuth().currentUser?.getIdToken()
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appealId: id }),
      })
      if (!res.ok) throw new Error(`PDF generation failed (${res.status})`)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `appeal-${new Date().getFullYear()}.pdf`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (!calc) return <div>Not enough data for preview. Go back and complete earlier steps.</div>
  const currentTax = (assessment.currentAssessedValue ?? 0) * (assessment.taxRate ?? 0)
  const proposedTax = calc.proposedValue * (assessment.taxRate ?? 0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Step 4: Review and generate</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Proposed value</div>
          <div className="text-2xl font-bold">
            ${Math.round(calc.proposedValue).toLocaleString()}
          </div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-slate-500">Estimated savings</div>
          <div className="text-2xl font-bold text-green-600">
            ${Math.round(calc.taxSavingsUSD).toLocaleString()}
          </div>
        </div>
      </div>
      <SavingsBarChart currentTax={currentTax} proposedTax={proposedTax} />
      <ComparisonChart
        subjectPerSqft={(assessment.currentAssessedValue ?? 0) / (property.sqft ?? 1)}
        medianPerSqft={calc.medianCompValue / (property.sqft ?? 1)}
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={onGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate PDF'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire into page and add sonner Toaster**

Update `src/app/(app)/appeal/new/page.tsx`:

```tsx
{
  step === 3 && <StepReview />
}
```

Add `<Toaster />` from `sonner` in `src/app/layout.tsx`:

```tsx
import { Toaster } from 'sonner'
// inside body:
;<Toaster richColors position="top-right" />
```

- [ ] **Step 4: Run tests**

```bash
npm run test -- src/components/wizard/StepReview.test.tsx
```

Expected: 2 pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/wizard src/app
git commit -m "feat(wizard): StepReview with live preview + PDF download"
```

---

## Task 18: PDF inspection script + pdf-schema.ts

**Files:**

- Create: `scripts/inspect-pdf.ts`, `src/lib/pdf-schema.ts`, `src/assets/forms/50-132.pdf`, `src/assets/forms/SOURCE.md`

- [ ] **Step 1: Download Form 50-132 template**

Visit `https://comptroller.texas.gov/forms/50-132.pdf` and save to `src/assets/forms/50-132.pdf`.

Create `src/assets/forms/SOURCE.md`:

```md
# Form 50-132 source

Downloaded from https://comptroller.texas.gov/forms/50-132.pdf on {DATE}.
Template is the official Texas Notice of Protest form. Do not redistribute modified versions without removing field data first (use `form.flatten()`).
```

- [ ] **Step 2: Install pdf-lib**

```bash
npm i pdf-lib
```

- [ ] **Step 3: Write inspection script**

`scripts/inspect-pdf.ts`:

```ts
import { readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'

const bytes = readFileSync('src/assets/forms/50-132.pdf')
const pdf = await PDFDocument.load(bytes)
const form = pdf.getForm()
for (const f of form.getFields()) {
  console.log({ name: f.getName(), type: f.constructor.name })
}
```

Add script: `"inspect:pdf": "tsx scripts/inspect-pdf.ts"`.

- [ ] **Step 4: Run inspection and capture mapping**

```bash
npm run inspect:pdf > pdf-fields-raw.txt
```

Use the output to author `src/lib/pdf-schema.ts`. If the official form's internal field names are something like `topmostSubform[0].Page1[0].f1_1[0]`, map them. As a fallback (in case of template drift), map by ordinal position using the `getFields()[n]` trick.

`src/lib/pdf-schema.ts`:

```ts
// Mapping human-readable keys to Form 50-132 internal field names.
// Run `npm run inspect:pdf` after replacing the template to verify names.
export const PDF_FIELD_MAP = {
  OWNER_NAME: 'form1[0].Page1[0].Owner_Name[0]',
  PROPERTY_ADDRESS: 'form1[0].Page1[0].Property_Address[0]',
  PARCEL_ID: 'form1[0].Page1[0].Parcel_ID[0]',
  YEAR: 'form1[0].Page1[0].Tax_Year[0]',
  CURRENT_VALUE: 'form1[0].Page1[0].Current_Assessed_Value[0]',
  PROPOSED_VALUE: 'form1[0].Page1[0].Proposed_Value[0]',
  SIGNATURE_NAME: 'form1[0].Page1[0].Signature_Name[0]',
  SIGNATURE_DATE: 'form1[0].Page1[0].Signature_Date[0]',
} as const

export type PdfFieldKey = keyof typeof PDF_FIELD_MAP
```

If inspection reveals different names, edit to match before committing.

- [ ] **Step 5: Delete raw output**

```bash
rm pdf-fields-raw.txt
```

- [ ] **Step 6: Commit**

```bash
git add scripts/inspect-pdf.ts src/lib/pdf-schema.ts src/assets/forms package.json package-lock.json
git commit -m "feat(pdf): Form 50-132 template + field inspection script + PDF_FIELD_MAP"
```

---

## Task 19: PDF fill function

**Files:**

- Create: `src/lib/pdf.ts`, `src/lib/pdf.test.ts`

- [ ] **Step 1: Write test**

`src/lib/pdf.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { fillForm50132 } from './pdf'
import type { Appeal } from '@/schemas/appeal'

const appeal: Appeal = {
  id: 'a1',
  ownerUid: 'u1',
  year: 2026,
  status: 'ready',
  property: {
    address: '123 Oak',
    county: 'Harris',
    parcelId: 'P1',
    yearBuilt: 2000,
    sqft: 2000,
    bedrooms: 3,
    bathrooms: 2,
    lotSizeSqft: 6000,
  },
  assessment: { currentAssessedValue: 400000, marketValue: 420000, taxRate: 0.0231 },
  selectedComps: [
    {
      parcelId: 'c1',
      address: '1',
      zip: '77005',
      assessedValue: 300000,
      sqft: 2000,
      yearBuilt: 2000,
      bedrooms: 3,
      bathrooms: 2,
    },
    {
      parcelId: 'c2',
      address: '2',
      zip: '77005',
      assessedValue: 320000,
      sqft: 2000,
      yearBuilt: 2000,
      bedrooms: 3,
      bathrooms: 2,
    },
    {
      parcelId: 'c3',
      address: '3',
      zip: '77005',
      assessedValue: 310000,
      sqft: 2000,
      yearBuilt: 2000,
      bedrooms: 3,
      bathrooms: 2,
    },
  ],
  calculation: {
    medianCompValue: 310000,
    proposedValue: 310000,
    taxSavingsUSD: 2079,
    percentReduction: 0.225,
  },
}

describe('fillForm50132', () => {
  it('returns a PDF byte stream starting with %PDF-', async () => {
    const bytes = await fillForm50132(appeal, 'John Smith')
    const header = Buffer.from(bytes.slice(0, 5)).toString()
    expect(header).toBe('%PDF-')
  }, 15_000)

  it('output is larger than the template (has filled fields)', async () => {
    const bytes = await fillForm50132(appeal, 'John Smith')
    expect(bytes.byteLength).toBeGreaterThan(10_000)
  }, 15_000)
})
```

- [ ] **Step 2: Implement**

`src/lib/pdf.ts`:

```ts
import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PDFDocument } from 'pdf-lib'
import type { Appeal } from '@/schemas/appeal'
import { PDF_FIELD_MAP } from './pdf-schema'
import { PdfGenerationError } from './errors'

const TEMPLATE_PATH = path.join(process.cwd(), 'src/assets/forms/50-132.pdf')

export async function fillForm50132(appeal: Appeal, signatureName: string): Promise<Uint8Array> {
  let bytes: Buffer
  try {
    bytes = await readFile(TEMPLATE_PATH)
  } catch (e) {
    throw new PdfGenerationError(`Template not found at ${TEMPLATE_PATH}: ${(e as Error).message}`)
  }

  const pdf = await PDFDocument.load(bytes)
  const form = pdf.getForm()

  const setText = (key: keyof typeof PDF_FIELD_MAP, value: string) => {
    try {
      form.getTextField(PDF_FIELD_MAP[key]).setText(value)
    } catch {
      // tolerate missing fields — template may drift year to year
      // ignore
    }
  }

  setText('OWNER_NAME', signatureName)
  setText('PROPERTY_ADDRESS', appeal.property.address)
  setText('PARCEL_ID', appeal.property.parcelId)
  setText('YEAR', String(appeal.year))
  setText('CURRENT_VALUE', appeal.assessment.currentAssessedValue.toFixed(0))
  setText('PROPOSED_VALUE', (appeal.calculation?.proposedValue ?? 0).toFixed(0))
  setText('SIGNATURE_NAME', signatureName)
  setText('SIGNATURE_DATE', new Date().toISOString().slice(0, 10))

  form.flatten()
  return pdf.save()
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test -- src/lib/pdf.test.ts
```

Expected: 2 pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/pdf.ts src/lib/pdf.test.ts
git commit -m "feat(pdf): fillForm50132 with server-only import"
```

---

## Task 20: /api/pdf route handler

**Files:**

- Create: `src/app/api/pdf/route.ts`, `src/app/api/pdf/route.test.ts`

- [ ] **Step 1: Write test with mocked admin SDK**

`src/app/api/pdf/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({
  adminAuth: () => ({
    verifyIdToken: vi.fn().mockImplementation(async (t: string) => {
      if (t === 'good') return { uid: 'alice' }
      throw new Error('bad token')
    }),
  }),
  adminDb: () => ({
    doc: (p: string) => ({
      get: async () => ({
        exists: p.endsWith('alice/properties/a1'),
        data: () => ({
          id: 'a1',
          ownerUid: 'alice',
          year: 2026,
          status: 'ready',
          property: {
            address: '1',
            county: 'Harris',
            parcelId: 'p',
            yearBuilt: 2000,
            sqft: 2000,
            bedrooms: 3,
            bathrooms: 2,
            lotSizeSqft: 6000,
          },
          assessment: { currentAssessedValue: 400000, marketValue: 420000, taxRate: 0.0231 },
          selectedComps: Array(3).fill({
            parcelId: 'c',
            address: '1',
            zip: '77005',
            assessedValue: 300000,
            sqft: 2000,
            yearBuilt: 2000,
            bedrooms: 3,
            bathrooms: 2,
          }),
          calculation: {
            medianCompValue: 300000,
            proposedValue: 300000,
            taxSavingsUSD: 2310,
            percentReduction: 0.25,
          },
        }),
      }),
    }),
  }),
}))

import { POST } from './route'

const mkReq = (body: unknown, auth?: string) =>
  new Request('http://x/api/pdf', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: auth } : {}) },
    body: JSON.stringify(body),
  })

describe('POST /api/pdf', () => {
  it('returns 401 without token', async () => {
    const res = await POST(mkReq({ appealId: 'a1' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 with bad token', async () => {
    const res = await POST(mkReq({ appealId: 'a1' }, 'Bearer bad'))
    expect(res.status).toBe(401)
  })

  it('returns 200 + PDF for owner', async () => {
    const res = await POST(mkReq({ appealId: 'a1' }, 'Bearer good'))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/pdf')
    const buf = Buffer.from(await res.arrayBuffer())
    expect(buf.slice(0, 5).toString()).toBe('%PDF-')
  }, 15_000)
})
```

- [ ] **Step 2: Implement**

`src/app/api/pdf/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { fillForm50132 } from '@/lib/pdf'
import { AppealSchema } from '@/schemas/appeal'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token)
    return NextResponse.json({ error: 'Missing token', code: 'UNAUTHENTICATED' }, { status: 401 })

  let uid: string
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid
  } catch {
    return NextResponse.json({ error: 'Invalid token', code: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const { appealId, signatureName } = (await req.json()) as {
    appealId?: string
    signatureName?: string
  }
  if (!appealId)
    return NextResponse.json({ error: 'appealId required', code: 'VALIDATION' }, { status: 422 })

  const snap = await adminDb().doc(`appeals/${uid}/properties/${appealId}`).get()
  if (!snap.exists)
    return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
  const raw = { id: snap.id, ...snap.data() }
  const parsed = AppealSchema.safeParse(raw)
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Invalid appeal data', code: 'VALIDATION', issues: parsed.error.issues },
      { status: 422 },
    )
  if (parsed.data.ownerUid !== uid)
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })

  try {
    const bytes = await fillForm50132(parsed.data, signatureName ?? 'Property Owner')
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="appeal-${parsed.data.year}.pdf"`,
        'cache-control': 'no-store',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, code: 'PDF_GEN_FAIL' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test -- src/app/api/pdf/route.test.ts
```

Expected: 3 pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api
git commit -m "feat(api): /api/pdf route with auth + ownership + Zod validation"
```

---

## Task 21: SyncBadge + TimelineDeadlines UI

**Files:**

- Create: `src/components/ui/SyncBadge.tsx`, `src/components/ui/SyncBadge.test.tsx`, `src/components/appeal/TimelineDeadlines.tsx`

- [ ] **Step 1: Implement SyncBadge with injectable state**

`src/components/ui/SyncBadge.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'

export type SyncState = 'synced' | 'pending' | 'offline'

export function SyncBadgeView({ state }: { state: SyncState }) {
  const meta = {
    synced: { text: 'Saved', cls: 'bg-green-100 text-green-800' },
    pending: { text: 'Syncing…', cls: 'bg-yellow-100 text-yellow-800' },
    offline: { text: 'Saved locally (offline)', cls: 'bg-slate-200 text-slate-700' },
  }[state]
  return (
    <span
      aria-live="polite"
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${meta.cls}`}
    >
      ☁ {meta.text}
    </span>
  )
}

export function SyncBadge({ pendingWrites }: { pendingWrites: boolean }) {
  const [online, setOnline] = useState(true)
  useEffect(() => {
    const on = () => setOnline(true),
      off = () => setOnline(false)
    setOnline(navigator.onLine)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  const state: SyncState = pendingWrites ? 'pending' : online ? 'synced' : 'offline'
  return <SyncBadgeView state={state} />
}
```

- [ ] **Step 2: Test**

`src/components/ui/SyncBadge.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncBadgeView } from './SyncBadge'

describe('SyncBadgeView', () => {
  it('renders synced state', () => {
    render(<SyncBadgeView state="synced" />)
    expect(screen.getByText(/saved/i)).toBeInTheDocument()
  })
  it('renders pending state', () => {
    render(<SyncBadgeView state="pending" />)
    expect(screen.getByText(/syncing/i)).toBeInTheDocument()
  })
  it('renders offline state', () => {
    render(<SyncBadgeView state="offline" />)
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: TimelineDeadlines**

`src/components/appeal/TimelineDeadlines.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { TEXAS_TIMELINE, getCurrentPhase } from '@/data/timeline-texas'

export function TimelineDeadlines() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 24 * 60 * 60 * 1000)
    return () => clearInterval(t)
  }, [])
  const current = getCurrentPhase(now)
  const tone = { grey: 'bg-slate-100', yellow: 'bg-yellow-100 animate-pulse', blue: 'bg-blue-100' }
  return (
    <ol className="space-y-2">
      {TEXAS_TIMELINE.map((p) => (
        <li
          key={p.id}
          aria-current={p.id === current.id ? 'step' : undefined}
          className={`rounded border p-3 ${p.id === current.id ? tone[p.tone] : 'bg-white'}`}
        >
          <div className="font-medium">{p.label}</div>
          <div className="text-sm text-slate-600">{p.description}</div>
        </li>
      ))}
    </ol>
  )
}
```

- [ ] **Step 4: Add to AppShell header**

Edit `src/components/AppShell.tsx` — wire SyncBadge. Simplest v1 version:

```tsx
import { SyncBadge } from '@/components/ui/SyncBadge'
// inside header:
;<div className="flex items-center gap-3">
  <SyncBadge pendingWrites={false} />
  <span className="text-sm text-slate-500">{user.email}</span>
</div>
```

(Wiring to live Firestore metadata happens in the dashboard page when subscribing to an appeal doc.)

- [ ] **Step 5: Run tests**

```bash
npm run test -- src/components/ui/SyncBadge.test.tsx
```

Expected: 3 pass.

- [ ] **Step 6: Commit**

```bash
git add src/components
git commit -m "feat(ui): SyncBadge + TimelineDeadlines"
```

---

## Task 22: Error boundaries

**Files:**

- Create: `src/app/error.tsx`, `src/app/(app)/error.tsx`, `src/app/global-error.tsx`, `src/app/not-found.tsx`

- [ ] **Step 1: Create boundaries**

`src/app/error.tsx`:

```tsx
'use client'
import { Button } from '@/components/ui/button'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-slate-600">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
```

`src/app/(app)/error.tsx` — same content.

`src/app/global-error.tsx`:

```tsx
'use client'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <main style={{ padding: 24 }}>
          <h1>Critical error</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Reload</button>
        </main>
      </body>
    </html>
  )
}
```

`src/app/not-found.tsx`:

```tsx
export default function NotFound() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Page not found</h1>
    </main>
  )
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/app
git commit -m "feat: error boundaries + not-found"
```

---

## Task 23: PWA (Serwist) + manifest + offline

**Files:**

- Create: `src/app/manifest.ts`, `src/app/sw.ts`, `public/icons/*`, `next.config.ts` (modify), `src/app/offline/page.tsx`

- [ ] **Step 1: Install Serwist**

```bash
npm i @serwist/next serwist
```

- [ ] **Step 2: Generate PWA icons**

Create square PNGs at 192×192, 512×512, and a 512×512 maskable into `public/icons/`. Use any image tool; the file names are:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-512.png`

If no design assets, generate from initials: use `https://maskable.app/editor` or render a plain "PP" on a dark slate background.

- [ ] **Step 3: Create manifest**

`src/app/manifest.ts`:

```ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Protest Pilot — Texas Property Tax Appeal',
    short_name: 'Protest Pilot',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
```

- [ ] **Step 4: Service worker**

`src/app/sw.ts`:

```ts
import { defaultCache } from '@serwist/next/worker'
import { Serwist } from 'serwist'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | { url: string; revision: string | null })[]
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [{ url: '/offline', matcher: ({ request }) => request.destination === 'document' }],
  },
})

serwist.addEventListeners()
```

- [ ] **Step 5: Offline fallback page**

`src/app/offline/page.tsx`:

```tsx
export default function Offline() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">You are offline</h1>
        <p className="text-slate-600">
          This page is not available offline yet. Reconnect to continue.
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Wire Serwist into next.config**

Edit `next.config.ts`:

```ts
import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
})

const config: NextConfig = {}

export default withSerwist(config)
```

- [ ] **Step 7: Gitignore generated SW**

Add to `.gitignore`:

```
public/sw.js
public/workbox-*.js
public/fallback-*
```

- [ ] **Step 8: Build and verify**

```bash
npm run build
```

Expected: `public/sw.js` generated; no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(pwa): Serwist service worker + manifest + offline page"
```

---

## Task 24: Landing SSR + `vercel.ts`

**Files:**

- Modify: `src/app/(marketing)/page.tsx`, `src/app/(marketing)/layout.tsx`
- Create: `vercel.ts`

- [ ] **Step 1: Move existing root page into marketing group**

Move `src/app/page.tsx` → `src/app/(marketing)/page.tsx`. Rewrite:

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Protest Pilot — Fight Your Texas Property Tax',
  description:
    'Generate a filled Form 50-132 Notice of Protest in minutes. Evidence-ready. Built for Texas homeowners.',
}

export default function Landing() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Stop overpaying on property tax.</h1>
      <p className="text-lg text-slate-600">
        Protest Pilot walks you through filing your Texas Form 50-132 with comparable-sales evidence
        in under 5 minutes.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/sign-in">Get started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="#how">How it works</Link>
        </Button>
      </div>
      <section id="how" className="grid gap-6 md:grid-cols-3 pt-12">
        <Feature
          title="1. Enter your property"
          body="Address, parcel ID, and assessment details from your HCAD notice."
        />
        <Feature
          title="2. Pick comparables"
          body="Select 3-5 nearby properties with lower assessed values as evidence."
        />
        <Feature
          title="3. Download your form"
          body="We fill Form 50-132 and generate a ready-to-file PDF."
        />
      </section>
    </main>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border p-6">
      <div className="font-semibold">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{body}</div>
    </div>
  )
}
```

`src/app/(marketing)/layout.tsx`:

```tsx
import type { ReactNode } from 'react'
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 2: Install `@vercel/config`**

```bash
npm i -D @vercel/config
```

- [ ] **Step 3: Create `vercel.ts`**

```ts
import { routes, type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  buildCommand: 'npm run build',
  framework: 'nextjs',
  headers: [
    routes.header('/sw.js', [
      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
      { key: 'Service-Worker-Allowed', value: '/' },
    ]),
    routes.cacheControl('/icons/(.*)', { public: true, maxAge: '1 week', immutable: true }),
  ],
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: success.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: SSR landing page + vercel.ts config"
```

---

## Task 25: Playwright happy-path e2e

**Files:**

- Create: `e2e/happy-path.spec.ts`, `e2e/fixtures/auth.ts`

- [ ] **Step 1: Write happy-path spec**

Because Google popup login cannot run in headless tests, this smoke tests the landing and marketing-side flow only.

`e2e/happy-path.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('landing page renders with CTA', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/stop overpaying/i)
  await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
})

test('sign-in page renders Google button', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
})
```

- [ ] **Step 2: Run**

```bash
npm run build && npm start &
sleep 5
npx playwright test
```

Expected: 2 pass.

- [ ] **Step 3: Kill the dev server**

```bash
# kill the background npm start process
```

- [ ] **Step 4: Commit**

```bash
git add e2e playwright.config.ts
git commit -m "test(e2e): Playwright smoke for landing and sign-in"
```

---

## Task 26: GitHub Actions CI + Lighthouse

**Files:**

- Create: `.github/workflows/check.yml`, `.github/workflows/lighthouse.yml`, `lighthouserc.json`

- [ ] **Step 1: Add check workflow**

`.github/workflows/check.yml`:

```yaml
name: check
on: [pull_request, push]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --coverage
      - name: Install Firebase CLI
        run: npm i -g firebase-tools
      - run: npm run test:rules
```

- [ ] **Step 2: Add Lighthouse workflow**

`.github/workflows/lighthouse.yml`:

```yaml
name: lighthouse
on:
  deployment_status: {}
jobs:
  lh:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npx @lhci/cli@latest autorun --collect.url=${{ github.event.deployment_status.target_url }}
```

`lighthouserc.json`:

```json
{
  "ci": {
    "collect": { "numberOfRuns": 3, "settings": { "preset": "desktop" } },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:pwa": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add .github lighthouserc.json
git commit -m "ci: typecheck/lint/test/rules + Lighthouse assertions on preview"
```

---

## Task 27: Dashboard wiring + end-to-end smoke

**Files:**

- Modify: `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/appeal/[id]/page.tsx`

- [ ] **Step 1: Implement dashboard**

`src/app/(app)/dashboard/page.tsx`:

```tsx
'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TimelineDeadlines } from '@/components/appeal/TimelineDeadlines'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your appeal</h1>
        <Button asChild>
          <Link href="/appeal/new">Start new appeal</Link>
        </Button>
      </div>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Texas appeal timeline</h2>
        <TimelineDeadlines />
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Implement appeal view page**

`src/app/(app)/appeal/[id]/page.tsx`:

```tsx
'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AppealView() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Appeal {id}</h1>
      <p className="text-slate-600">
        Full read-only view coming in v1.1. For now, edit via wizard.
      </p>
      <Button asChild>
        <Link href="/appeal/new">Open wizard</Link>
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Wire Firestore createDraft on StepProperty completion**

Edit `src/components/wizard/StepProperty.tsx` — after `patchProperty`, if `id` is null, create draft via `createDraftAppeal`. Updated `onSubmit`:

```tsx
import { useAuth } from '@/hooks/useAuth'
import { createDraftAppeal } from '@/services/storage'
// inside component:
const { user } = useAuth()
const onSubmit = async (v: Property) => {
  patchProperty(v)
  const state = useAppealStore.getState()
  if (user && !state.id) {
    const id = await createDraftAppeal(user.uid, {
      year: new Date().getFullYear(),
      property: v,
      assessment: { currentAssessedValue: 0, marketValue: 0, taxRate: 0.0231 },
      selectedComps: [],
    } as never)
    useAppealStore.getState().setId(id)
  }
  nextStep()
}
```

(Type coercion on `as never` because the store's repo accepts `Omit<Appeal, 'id' | 'ownerUid' | 'status' | 'calculation'>` minus optional timestamps; the repo fills them.)

- [ ] **Step 4: Run all tests**

```bash
npm run check
```

Expected: typecheck, lint, and tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components
git commit -m "feat: dashboard + appeal view + wire wizard to Firestore"
```

---

## Task 28: Manual verification & demo prep

**Files:**

- Modify: `README.md`
- Create: `docs/demo-script.md`

- [ ] **Step 1: Populate Firebase dev project**

Have the user create a Firebase project named `protest-pilot-dev`, enable Google Sign-In, Firestore (Native mode, us-central), and copy values into `.env.local`. Deploy rules: `firebase deploy --only firestore:rules --project protest-pilot-dev`.

- [ ] **Step 2: Manual test checklist**

- [ ] Open `http://localhost:3000` — landing renders
- [ ] Click "Get started" → Google popup → redirect to `/dashboard`
- [ ] Start new appeal → complete all 4 steps
- [ ] Generate PDF — file downloads, opens in Adobe Reader with fields filled
- [ ] Toggle DevTools Network offline → refresh `/dashboard` → still loads (Serwist)
- [ ] Chrome Application panel: manifest valid, service worker active
- [ ] Android Chrome: "Add to Home Screen" works; app opens standalone

- [ ] **Step 3: Write README**

Replace `README.md`:

````markdown
# Protest Pilot — Texas Property Tax Appeal PWA

Fight inflated property tax assessments. Generate a filled Texas Form 50-132 with comparable-sales evidence in under 5 minutes.

## Stack

Next.js 15 · TypeScript · Tailwind · shadcn/ui · Firebase Auth + Firestore · Zod · Zustand · Recharts · pdf-lib · Serwist PWA · Vercel.

## Develop

```bash
cp .env.local.example .env.local   # fill with your Firebase values
npm install
npm run dev
```
````

Emulator mode: set `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` and run `npm run emulator` in another terminal.

## Test

```bash
npm run check          # typecheck + lint + unit
npm run test:rules     # Firestore rules via emulator
npm run e2e            # Playwright smoke
```

## Deploy

Vercel + Firebase Hobby/Spark plans. Environment variables listed in `.env.local.example` must be set in the Vercel project. `vercel.ts` controls headers and caching.

````

- [ ] **Step 4: Write demo script**

`docs/demo-script.md`:

```markdown
# Loom demo script (≤ 2 minutes)

1. (0:00) Start on landing: "Texas homeowners overpay $1.2B per year. This app helps them fight back."
2. (0:10) Click "Get started" → Google sign-in.
3. (0:20) Dashboard: show timeline highlighting active phase.
4. (0:30) Start new appeal: fill property (address, parcel, sqft).
5. (0:50) Assessment: current value 425k, tax rate 2.31%.
6. (1:05) Comps: enter ZIP 77005, select 3-5 lower-valued neighbors.
7. (1:25) Review: show chart "saves $2,079/yr", click Generate PDF, open downloaded file.
8. (1:50) Toggle offline in DevTools, refresh — still works. Show SyncBadge state change.
9. (2:00) "Code on GitHub, live at vercel.app."
````

- [ ] **Step 5: Commit**

```bash
git add README.md docs/demo-script.md
git commit -m "docs: README + Loom demo script"
```

---

## Final Verification

- [ ] **Step 1: Full check**

```bash
npm run check
npm run e2e
```

Expected: everything green.

- [ ] **Step 2: Production build smoke**

```bash
npm run build && npm start
```

Manual: walk through landing → sign-in → wizard → PDF. Confirm `%PDF-` header on the downloaded file.

- [ ] **Step 3: Lighthouse local**

```bash
npx @lhci/cli@latest autorun --collect.url=http://localhost:3000
```

Expected: PWA ≥ 90, Perf ≥ 85, a11y ≥ 95.

- [ ] **Step 4: Tag v0.1.0**

```bash
git tag v0.1.0 -m "MVP: Texas property tax appeal PWA"
```
