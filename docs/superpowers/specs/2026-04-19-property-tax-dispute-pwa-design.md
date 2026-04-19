# Property Tax Dispute PWA — Design Spec

**Date:** 2026-04-19
**Status:** Draft (awaiting user review)
**Author:** @levkovych67
**Audience:** Upwork portfolio piece — Texas homeowners filing property tax appeals

---

## 1. Summary

A Progressive Web App that helps Texas homeowners generate a filled Form 50-132 "Notice of Protest" for appealing their property tax assessment. The user signs in with Google, enters property and assessment details through a 4-step wizard, selects 3-5 comparable properties from seed HCAD data, sees live savings calculations with charts, and downloads a server-generated PDF ready to submit to the appraisal district. The app works offline for viewing previously created appeals and includes a visible sync indicator.

**MVP scope (fixed):**

- **Jurisdiction:** Texas only (Harris County seed data, Form 50-132)
- **Comps source:** Mock JSON seed (~50 records across Harris County ZIP codes)
- **Output:** Filled Form 50-132 PDF, ready to submit
- **User model:** Single property per user, current year only

Features explicitly out of scope for v1: multi-property dashboard, multi-year history, real MLS/HCAD API integration, non-Texas jurisdictions.

---

## 2. Stack

| Layer      | Technology                                    | Rationale                                                       |
| ---------- | --------------------------------------------- | --------------------------------------------------------------- |
| Framework  | Next.js 15 App Router                         | SSR for landing, client components for app, API routes for PDF  |
| Language   | TypeScript 5 (strict)                         | Type safety across schemas, calculator, API contracts           |
| Runtime    | Node.js 24 on Vercel Fluid Compute            | Needed for `firebase-admin` and `pdf-lib` (not Edge-compatible) |
| Styling    | Tailwind CSS 4 + shadcn/ui primitives         | Fast, accessible, consistent UI                                 |
| Auth       | Firebase Auth (Google Sign-In)                | Zero-backend auth                                               |
| Database   | Firestore + persistent local cache            | Real-time, offline-first out of the box                         |
| State      | Zustand + `persist` middleware                | Draft wizard state survives refresh/offline                     |
| Validation | Zod                                           | Single schema for form + API                                    |
| Charts     | Recharts                                      | Lightweight, responsive, React-native                           |
| PDF        | `pdf-lib` (AcroForm fill)                     | Fills official Form 50-132 template server-side                 |
| PWA        | Serwist (next-pwa successor)                  | Workbox-based Service Worker, actively maintained               |
| Testing    | Vitest + RTL + Playwright + Firebase Emulator | Unit, component, e2e, rules                                     |
| Hosting    | Vercel (Fluid Compute default)                | Free tier, preview deploys, vercel.ts config                    |

Free-tier compliance: Firebase Spark plan (50k reads/day, 1GB storage), Vercel Hobby (100GB bandwidth), no paid APIs.

---

## 3. Architecture

**Rendering strategy:**

- `/` (marketing) — SSR, SEO-optimized
- `/app/*` (authenticated) — Client Components + Firebase Web SDK (real-time Firestore, live preview)
- `/api/pdf` — Server-side Route Handler using Firebase Admin SDK + `pdf-lib`

**Data flow:**

```
Google Sign-In (client)
  └─> Firebase Auth ID token
       └─> Firestore Web SDK (client reads/writes with rules)
       └─> Zustand persist (localStorage mirror of draft)
       └─> Fetch /api/pdf with Bearer {idToken}
            └─> Admin SDK verifies token
            └─> Reads Firestore doc (ownership check)
            └─> pdf-lib fills Form 50-132 template
            └─> Returns application/pdf stream
```

**Data tier categorization (guides where each piece of data lives):**

| Tier                | Examples                               | Storage                                                             |
| ------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| Static assets       | PDF template, PWA icons, fonts         | Server filesystem (`src/assets`), Service Worker cache              |
| Sharded static data | Comps JSON per ZIP                     | `public/data/comps/{zip}.json`, fetched on demand, SW runtime cache |
| Dynamic user data   | Appeal document, property, calculation | Firestore + IndexedDB persistence                                   |
| Ephemeral state     | Wizard step, in-progress selections    | Zustand + localStorage (`persist` middleware)                       |

**Key patterns:**

- **Repository layer** — `services/storage.ts` wraps all Firestore ops
- **Pure calculator** — `lib/calculator.ts` with no side effects, fully unit-tested
- **Zod as single source of truth** — schemas imported by form resolver and API route
- **Strategy Pattern hook point** — calculator and timeline data are keyed by jurisdiction string; adding a second state later means adding a new strategy, not rewriting the flow

---

## 4. Project Structure

```
/src
  /app
    /(marketing)
      page.tsx              # Landing (SSR, SEO)
      layout.tsx
    /(app)
      layout.tsx            # Auth guard + AppShell with SyncBadge
      dashboard/page.tsx    # Entry point, shows current draft
      appeal/
        new/page.tsx        # Wizard
        [id]/page.tsx       # View/edit + Generate PDF
    /api
      pdf/route.ts          # Server: verify token + fill Form 50-132
    layout.tsx              # Root (fonts, PWA meta)
    error.tsx, global-error.tsx
  /assets
    /forms
      50-132.pdf            # Private — NOT in /public
  /components
    /ui
      SyncBadge.tsx         # Reads hasPendingWrites + online state
      Button.tsx, Input.tsx, Card.tsx, Toast.tsx
    /wizard
      StepProperty.tsx
      StepAssessment.tsx
      StepComps.tsx
      StepReview.tsx
    /charts
      SavingsBarChart.tsx
      ComparisonChart.tsx
    /appeal
      CompsTable.tsx
      SavingsSummary.tsx
      TimelineDeadlines.tsx    # reads getCurrentPhase() → highlights active phase
  /lib
    /firebase
      client.ts             # Web SDK + persistentLocalCache
      admin.ts              # Admin SDK (server-only)
    calculator.ts           # Pure: computeSavings
    calculator.test.ts
    pdf.ts                  # pdf-lib form filler — import 'server-only'
    pdf-schema.ts           # PDF_FIELD_MAP (human name → AcroForm path)
  /services
    storage.ts              # Firestore CRUD (addDoc with auto-ID, updates)
    comps.ts                # Lazy ZIP loader — fetch with { next: { revalidate: 3600 } }
  /schemas
    appeal.ts               # Zod: Property, Assessment, Comp, Appeal
  /store
    useAppealStore.ts       # Zustand + persist middleware
  /data
    timeline-texas.ts       # Deadlines: Notice of Appraised Value → May 15 → ARB → Judicial
/public
  /data/comps/
    77005.json              # ~8 ZIP files, 5-8 comps each
    77006.json
    ...
  manifest.json
  /icons (192, 512, maskable)
firestore.rules
vercel.ts
```

---

## 5. Data Model

**Firestore path:** `appeals/{userId}/properties/{autoId}`

Auto-generated document ID (via `addDoc`) keeps a stable reference even if the user changes the address. Nested collection enforces isolation.

```ts
type Appeal = {
  id: string // Firestore auto-ID
  ownerUid: string // must match auth.uid
  year: number // 2026
  status: 'draft' | 'ready' | 'submitted'
  property: {
    address: string
    county: 'Harris' // MVP single county
    parcelId: string
    yearBuilt: number
    sqft: number
    bedrooms: number
    bathrooms: number
    lotSizeSqft: number
  }
  assessment: {
    currentAssessedValue: number
    marketValue: number
    taxRate: number // e.g. 0.0231 for Harris County 2026
  }
  selectedComps: Comp[] // 3-5 items
  calculation: {
    medianCompValue: number
    proposedValue: number
    taxSavingsUSD: number
    percentReduction: number
  } | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

type Comp = {
  parcelId: string
  address: string
  zip: string
  assessedValue: number
  sqft: number
  yearBuilt: number
  bedrooms: number
  bathrooms: number
  distance?: number // miles from subject property (optional)
}
```

**Firestore Security Rules:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appeals/{uid}/properties/{propId} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null
                             && request.auth.uid == uid
                             && request.resource.data.ownerUid == uid
                             && request.resource.data.keys().size() < 20;  // free-tier abuse guard
      allow delete: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

**Seed data format (`public/data/comps/{zip}.json`):**

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
  }
]
```

Total seed: ~50 records across 5-8 Harris County ZIPs (77005, 77006, 77019, 77024, 77030, 77098, 77401). Derived from public HCAD records, not copyrighted.

---

## 6. Core Flows

### 6.1 Sign-In

- Client calls `signInWithPopup(auth, new GoogleAuthProvider())`
- Firebase issues ID token, Firestore SDK attaches it automatically
- `AppShell` wraps all `/app/*` pages, redirects unauthenticated users to `/`

### 6.2 Wizard (4 steps)

1. **StepProperty** — address, parcel ID, physical details. On "Next" → `addDoc` creates a draft with `status: 'draft'`.
2. **StepAssessment** — current assessed value, market value, tax rate (pre-filled Harris County 2026 default, editable).
3. **StepComps** — enter ZIP → lazy `fetch('/data/comps/{zip}.json', { next: { revalidate: 3600 } })` (Vercel Data Cache, 1h) → user picks 3-5 comparables.
4. **StepReview** — preview of filled values + Recharts visualizations + "Generate PDF" button.

Between steps: debounced Firestore write (500 ms). Zustand persist keeps the whole wizard state in localStorage, so a refresh or offline navigation does not lose progress.

### 6.3 Live Preview

`computeSavings(property, selectedComps, taxRate)` runs synchronously on every input change:

```ts
medianCompValue = median(selectedComps.map((c) => c.assessedValue / c.sqft)) * property.sqft
proposedValue = min(currentAssessedValue, medianCompValue)
taxSavingsUSD = (currentAssessedValue - proposedValue) * taxRate
percentReduction = (currentAssessedValue - proposedValue) / currentAssessedValue
```

Results feed `SavingsBarChart` (current tax vs. proposed tax) and `ComparisonChart` (subject property vs. median comp, $/sqft).

### 6.4 PDF Generation

1. Client: `POST /api/pdf` with `Authorization: Bearer {idToken}` + `{ appealId }`
2. Server: `admin.auth().verifyIdToken(token)` → `uid`
3. Server: `admin.firestore().doc('appeals/{uid}/properties/{appealId}').get()`, verify `ownerUid === uid`
4. Server: `safeParse(AppealSchema)` on the document
5. Server: `pdf-lib` loads `src/assets/forms/50-132.pdf`, fills AcroForm fields via `PDF_FIELD_MAP` (see §6.5), flattens (`form.flatten()`)
6. Server: returns `application/pdf` with `Content-Disposition: attachment; filename="appeal-{year}.pdf"`

### 6.5 PDF Field Mapping

Official US AcroForm fields use cryptic internal names like `topmostSubform[0].Page1[0].f1_1[0]`. A one-time discovery script enumerates them; the mapping lives in `src/lib/pdf-schema.ts` so `api/pdf/route.ts` stays readable:

```ts
// src/lib/pdf-schema.ts
export const PDF_FIELD_MAP = {
  OWNER_NAME: 'topmostSubform[0].Page1[0].f1_1[0]',
  PROPERTY_ADDRESS: 'topmostSubform[0].Page1[0].f1_2[0]',
  PARCEL_ID: 'topmostSubform[0].Page1[0].f1_3[0]',
  CURRENT_VALUE: 'topmostSubform[0].Page1[0].f1_10[0]',
  PROPOSED_VALUE: 'topmostSubform[0].Page1[0].f1_11[0]',
  // ...filled by scripts/inspect-pdf.ts
} as const
```

Discovery script: `scripts/inspect-pdf.ts` iterates `form.getFields()` and prints `{ name, type, value }` — run once per template version, commit the output as `PDF_FIELD_MAP`.

### 6.6 Server-only Module Boundary

`pdf-lib` and `firebase-admin` must never reach the client bundle. Enforce by:

- Placing them in `src/lib/pdf.ts` and `src/lib/firebase/admin.ts` with `import 'server-only'` at the top of each file (fails build if imported from a Client Component)
- Route Handler `/api/pdf/route.ts` is the only consumer
- Vitest tests for these modules run in `node` environment (`vitest.config.ts` projects)

### 6.7 Timeline Current Phase

`src/data/timeline-texas.ts` exports `getCurrentPhase(now: Date): TimelinePhase`. Logic:

| Date range      | Phase                                   | UI treatment                      |
| --------------- | --------------------------------------- | --------------------------------- |
| Jan 1 – Apr 14  | Assessment period                       | Grey, upcoming                    |
| Apr 15 – May 15 | Notice received — **time to file**      | Yellow highlight, pulse animation |
| May 16 – Jul 31 | Waiting for ARB hearing                 | Blue, informational               |
| Aug 1 – Dec 31  | Hearing season / judicial appeal window | Blue                              |

Derived from `new Date()` client-side, re-evaluated on mount and every 24h (setInterval). Sets aria-current on active phase for screen readers.

### 6.8 Offline Support

- Firestore `persistentLocalCache({ tabManager: persistentMultipleTabManager() })` — handles all user data caching, conflict resolution, retry on reconnect
- Service Worker (Serwist) caches: app shell, JS/CSS bundles, PWA icons, fonts. **Not** Firestore JSON — that is already handled by the SDK.
- Offline and uncached route → `/offline` fallback page
- Read-only banner on `/app/appeal/[id]` when `navigator.onLine === false`

### 6.9 Sync Indicator

`<SyncBadge />` in AppShell reads Firestore snapshot metadata:

```ts
onSnapshot(docRef, { includeMetadataChanges: true }, (snap) => {
  if (snap.metadata.hasPendingWrites) setState('pending')
  else if (!navigator.onLine) setState('offline')
  else setState('synced')
})
```

Three states: 🟢 Saved · 🟡 Syncing · ⚫ Saved locally (offline).

---

## 7. Validation & Error Handling

**Zod schemas (`src/schemas/appeal.ts`) — single source of truth:**

- `PropertySchema` — Texas ZIP regex, `sqft >= 100`, `yearBuilt <= currentYear`
- `AssessmentSchema` — `currentAssessedValue >= 1000`, `0 < taxRate < 0.1`
- `CompSchema` — same shape as Property essentials
- `AppealSchema` — wrapper + `refine(selectedComps.length >= 3)` before generating PDF

Client uses schemas via `react-hook-form` resolver. API route uses `safeParse` before `pdf-lib`.

**Typed error classes:**

- `NotAuthenticated` (401)
- `NotOwner` (403)
- `ValidationError` (422)
- `PdfGenerationError` (500)
- `FirestoreError` (500, with original code)

**Client UX:**

- `react-hot-toast` for non-blocking messages
- Inline field errors from `react-hook-form` state
- Firestore `permission-denied` → redirect to `/sign-in`
- Firestore `unavailable` → toast "Working offline, changes saved locally"
- Firestore `quota-exceeded` → banner warning
- PDF button shows loading state 3–10s; on failure → toast + optional Sentry event

**Error boundaries:**

- `app/error.tsx`, `app/(app)/error.tsx`, `app/global-error.tsx` with Retry button

---

## 8. Testing

**Tools:** Vitest, React Testing Library, Playwright, Firebase Emulator Suite.

**Coverage priorities:**

1. `calculator.test.ts` — ≥12 cases:
   - median with even/odd comp count
   - proposed = min(current, median)
   - savings formula
   - division by zero → `ValidationError`
   - negative inputs → `ValidationError`
   - proposed > current → savings clamped to 0
   - snapshot tests against real HCAD data
2. `storage.test.ts` — Firestore Emulator, 4-5 CRUD + security rules cases
3. `Wizard.test.tsx` — RTL: step transitions, validation blocks Next, persist retains state across unmount
4. `SyncBadge.test.tsx` — 3 states via mocked metadata
5. `api/pdf.test.ts` — 401 without token, 403 for other user, 200 + `%PDF` magic bytes for owner
6. `e2e/happy-path.spec.ts` — Playwright: Auth Emulator → wizard → download PDF, verify first bytes

**Target:** ≥80% coverage on `lib/` and `services/`.

---

## 9. Quality Gates

`npm run check`:

- `tsc --noEmit` — zero TS errors
- `eslint . --max-warnings=0` with Next, Tailwind, jsx-a11y presets
- `vitest run --coverage` — thresholds enforced in `vitest.config.ts`
- `playwright test` (headless, CI only)

**Lighthouse CI** on preview deploys:

- PWA ≥ 90
- Performance ≥ 85
- Accessibility ≥ 95

---

## 10. Deployment & Config

**Vercel:**

- Hobby plan, Fluid Compute (default)
- `vercel.ts` for headers (e.g., `Service-Worker-Allowed: /`) and cache rules
- Preview deploys per PR

**Environment variables:**

- Public (`NEXT_PUBLIC_*`): Firebase Web config (API key, project ID, etc.)
- Server-only: `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`

**CI (GitHub Actions):**

- `check.yml` — type check, lint, unit tests on every PR
- `e2e.yml` — Playwright on preview URL
- `firestore-rules.yml` — deploy rules on merge to main

**Firebase:**

- Spark (free) plan
- Preview channels per PR

---

## 11. Build Order (MVP)

1. **Scaffold** — Next.js + TypeScript + Tailwind + ESLint + Vitest
2. **Firebase setup** — client init with `persistentLocalCache`, Auth emulator for tests
3. **Calculator + tests first** — `lib/calculator.ts` with ≥12 test cases (the heart of the product; tests demonstrate responsibility on the portfolio)
4. **Schemas** — Zod models
5. **Auth + Firestore Rules** — Google Sign-In, `AppShell`, security rules, repo layer
6. **Wizard** — Zustand store, 4 steps, validation wiring
7. **Charts + Live Preview** — Recharts integration
8. **PDF API Route** — Admin SDK + `pdf-lib`, Form 50-132 field mapping
9. **PWA** — Serwist config, manifest, icons, offline page
10. **SyncBadge + polish** — sync indicator, toasts, landing SSR
11. **CI + Lighthouse** — quality gates, preview deploy
12. **Demo prep** — Loom recording script

---

## 12. Risks & Mitigations

| Risk                                            | Mitigation                                                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Firebase Admin SDK cold start on `/api/pdf`     | Fluid Compute instance reuse; accept 1-2s first-call latency                                                                  |
| Form 50-132 layout changes year-over-year       | Pin template filename (`50-132-2026.pdf`), document source URL in repo                                                        |
| HCAD tax rates drift                            | Expose `taxRate` as editable field; seed 2026 defaults only                                                                   |
| PDF template AcroForm field names undocumented  | One-time discovery script (`scripts/inspect-pdf.ts`) using `pdf-lib` field enumeration; commit mapping to `lib/pdf-fields.ts` |
| Firestore free tier quota on heavy demo traffic | Shallow queries, aggressive local cache via `persistentLocalCache`                                                            |
| Offline edits conflicting with server writes    | Firestore last-write-wins is acceptable for single-user single-property model                                                 |

---

## 13. Definition of Done (MVP)

- All unit and component tests green
- Playwright happy-path passes on preview deploy
- Lighthouse PWA ≥ 90, Performance ≥ 85, Accessibility ≥ 95
- Manual: Android Chrome "Add to Home Screen" works; offline load of previously opened appeal works
- PDF output opens in Adobe Reader and Preview; fields are filled and flattened
- Firestore rules block cross-user reads (verified via emulator test)
- Loom demo recorded showing sign-in → wizard → PDF download in < 2 minutes

---

## 14. Open Questions (deferred, not blocking MVP)

- Should the appeal document be immutable after `status === 'submitted'`? (Currently: still editable, but probably should be locked in v1.1.)
- Email notification when deadline approaches (May 15)? Requires Firebase Functions — out of MVP.
- Analytics — Vercel Analytics only, or also PostHog free tier?
