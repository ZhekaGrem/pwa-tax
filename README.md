# Protest Pilot — Texas Property Tax Appeal PWA

Fight inflated property tax assessments. Generate a filled Texas Form 50-132 with comparable-sales evidence in under 5 minutes.

**Live demo:** _(set after Vercel deploy)_

## Stack

Next.js 15+ App Router · TypeScript · Tailwind v4 · shadcn/ui · Firebase Auth + Firestore (with `persistentLocalCache`) · Zod · Zustand (with `persist`) · Recharts · pdf-lib · Serwist PWA · Vitest · Playwright · Firebase Emulator · Vercel.

## Features

- Google Sign-In via Firebase Auth
- 4-step wizard (Property → Assessment → Comps → Review)
- Live savings calculator (pure function, 100% test coverage)
- Recharts visualizations: tax savings + per-sqft comparison
- Texas appeal timeline with active-phase highlighting
- Server-generated PDF (overlays user data on Form 50-132)
- Offline support: app shell cached + Firestore IndexedDB persistence
- Visible sync indicator (synced / pending / offline)
- Multi-step form draft persisted in localStorage (Zustand `persist`)

## Develop

```bash
cp .env.local.example .env.local        # fill with your Firebase project values
npm install
npm run dev                             # http://localhost:3000
```

To use the local Firebase Emulator instead of a live project:

```bash
# Set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true in .env.local
npm run emulator                        # in another terminal
```

## Firebase project setup (one-time)

1. Create a Firebase project (free Spark plan).
2. Enable **Authentication → Google sign-in method**.
3. Enable **Firestore** (Native mode, region: us-central1).
4. Create a Web App in Project Settings → copy config values into `NEXT_PUBLIC_FIREBASE_*` env vars.
5. Generate a service account (Project Settings → Service accounts → Generate new private key) → copy into `FIREBASE_ADMIN_*` env vars (replace literal `\n` in the private key).
6. Deploy security rules:
   ```bash
   npx firebase deploy --only firestore:rules --project <your-project-id>
   ```

## Test

```bash
npm run check          # typecheck + lint + unit (dom + node)
npm run test:rules     # Firestore rules via emulator (requires Java 17+)
npm run e2e            # Playwright smoke (landing + sign-in)
npm run test:coverage  # generate coverage report
```

## Build

```bash
npm run build          # uses Webpack (Serwist doesn't yet support Turbopack)
npm start
```

## Deploy (Vercel)

`vercel.ts` defines build, headers (Service-Worker-Allowed), and cache rules. Set all env vars from `.env.local.example` in the Vercel project dashboard. Push to `main` → preview/production deploy.

## Project layout

```
src/
  app/
    (marketing)/      # SSR landing
    (app)/            # authenticated app shell + dashboard + wizard + appeal view
    api/pdf/          # PDF generation route handler
    sign-in/          # Google sign-in page
    manifest.ts       # PWA manifest
    sw.ts             # Service worker (Serwist)
  assets/forms/       # Form 50-132 PDF template (private)
  components/
    ui/               # shadcn primitives + SyncBadge
    wizard/           # 4 step components
    charts/           # Recharts wrappers
    appeal/           # TimelineDeadlines
    AppShell.tsx
  data/               # timeline-texas
  hooks/useAuth.ts
  lib/                # calculator, pdf, errors, firebase
  schemas/appeal.ts   # Zod single source of truth
  services/           # storage repo, comps loader
  store/              # Zustand
public/
  data/comps/         # Seed comps per ZIP (7 files, 49 records)
  icons/              # PWA icons
firestore.rules
firebase.json         # Emulator config
vercel.ts             # Vercel TypeScript config
```

## License

Project source MIT. Form 50-132 template © Texas Comptroller of Public Accounts; included as fair use for civic compliance.
