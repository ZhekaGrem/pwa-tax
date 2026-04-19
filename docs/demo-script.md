# Loom demo script — Protest Pilot

**Target length:** ≤ 2 minutes 30 seconds

**Setup before recording:**

- Tab 1: Landing page at http://localhost:3000
- Tab 2: Vercel/GitHub repo
- Browser zoom 110% so charts/numbers read clearly
- Demo Firebase account signed out

---

## Script

**0:00 — 0:15** Landing

> "Texas homeowners overpaid an estimated $1.2 billion in property tax last year. Most don't fight back because the protest paperwork is intimidating. Protest Pilot fixes that."

Show the H1 "Stop overpaying on property tax" and click "Get started".

**0:15 — 0:30** Sign-in

> "One-click Google sign-in via Firebase Auth. Zero passwords, zero backend."

Sign in. Land on Dashboard.

**0:30 — 0:50** Dashboard + Timeline

> "Dashboard shows the Texas appeal timeline. The active phase is highlighted automatically based on the date — right now, we're in 'Notice received — time to file' which pulses to nudge you to act before the May 15 deadline."

Click "Start new appeal".

**0:50 — 1:10** Wizard Step 1: Property

> "Wizard saves to Firestore in real time. Notice the 'Saved' badge in the top-right — it goes yellow if there are pending writes, gray when offline."

Type address: "1234 Oak St, Houston TX", parcel ID, year built, sqft = 2000, bedrooms 4, bathrooms 3.

**1:10 — 1:25** Step 2: Assessment

> "Current assessed value 425,000. Tax rate is pre-filled with the Harris County 2026 rate of 2.31%."

**1:25 — 1:50** Step 3: Comparables

> "Enter ZIP 77005. The app loads neighbor properties from a curated HCAD dataset, cached for an hour by Vercel's data cache. Pick three homes assessed lower than yours — that's your evidence."

Pick three comps with values around $300-340k.

**1:50 — 2:15** Step 4: Review

> "Live preview: estimated savings of around two thousand dollars per year. The chart on the left shows current vs. proposed tax. The chart on the right is your subject property's value-per-sqft vs. the median of selected comps. Click Generate PDF."

Open the downloaded PDF. Show the data overlaid on Form 50-132.

**2:15 — 2:30** Offline + close

> "Open DevTools, go offline, refresh — still works. Service Worker caches the shell, Firestore caches data via IndexedDB."

> "Code on GitHub at github.com/<your-handle>/property-tax-dispute. Live at protest-pilot.vercel.app. Built in a weekend with Next.js 15, TypeScript, Firebase, and Tailwind. Thanks for watching."

---

## Manual verification checklist (before recording)

- [ ] Landing renders with CTA visible
- [ ] Google popup → redirect to /dashboard
- [ ] Wizard completes all 4 steps
- [ ] Generate PDF downloads a file that opens in Adobe Reader
- [ ] PDF size > 100 KB
- [ ] DevTools → Application → Manifest valid
- [ ] DevTools → Application → Service Workers active
- [ ] DevTools → Application → Storage shows IndexedDB entries (Firestore cache)
- [ ] Toggle DevTools Network offline → refresh dashboard → still loads
- [ ] Android Chrome: "Add to Home Screen" creates standalone app
