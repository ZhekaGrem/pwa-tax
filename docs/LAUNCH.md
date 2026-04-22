# Запуск Protest Pilot — гайд

## 1 · Локальний старт

```bash
cd F:/Progect/2026/pwa/property-tax-dispute
npm install
cp .env.local.example .env.local        # якщо ще немає
npm run dev                              # http://localhost:3000
```

Для роботи без живого Firebase:

```bash
# у .env.local:
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
# в іншому терміналі:
npm run emulator
```

## 2 · Обов’язкові env-змінні (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

У Vercel ці ж ключі копіюються в Project → Settings → Environment Variables (усі три середовища: Development / Preview / Production).

## 3 · Quality gates перед деплоєм

```bash
npm run check           # typecheck + lint + unit
npm run test:coverage   # покриття (потрібен Java 17 для Firestore rules)
npm run e2e             # Playwright smoke
npm run build           # Webpack (Serwist ще не підтримує Turbopack у build)
npm start               # перевірка prod-білду локально
```

## 4 · Деплой на Vercel

```bash
npm i -g vercel         # CLI поки не встановлено
vercel login
vercel link             # прив’язати до проєкту
vercel env pull         # підтягнути змінні з дашборду
vercel --prod           # продакшн-деплой
```

`vercel.ts` уже налаштовано (build, `Service-Worker-Allowed` headers, cache). Після першого `vercel link` кожен push у `main` = preview/prod деплой.

## 5 · Перевірка PWA на телефоні

1. Відкрити прод-URL у Chrome (Android) або Safari (iOS).
2. «Add to Home Screen» — має з’явитися нативна іконка.
3. Вимкнути мережу → перезапустити — має працювати офлайн (shell + чернетка в IndexedDB).

---

# Чого ще не вистачає (по пріоритету)

## 🔴 Блокери продакшну

- **Реальний Firebase проєкт + security rules deploy.** `firestore.rules` існує, але `firebase deploy --only firestore:rules` треба виконати під свій `projectId`.
- **PDF шаблон `src/assets/forms/50-132.pdf`.** Route `/api/pdf` без нього впаде. Завантажити офіційну форму з сайту Texas Comptroller.
- **Google OAuth redirect URIs** у Firebase Console → Authentication → Settings → Authorized domains: додати `localhost`, `*.vercel.app` і фінальний домен.
- **Auth middleware для `(app)/*`.** Наразі не бачу guard — неавторизований юзер може зайти в `/appeal/new`. Треба middleware або `useAuth` редирект.

## 🟠 Важливо для Upwork-презентації

- **OG-image + Twitter-card** (`src/app/opengraph-image.tsx`) — зараз при шерінгу порожньо. Згенерувати через Satori/`ImageResponse` у Swiss-стилі з гігантським «Fair Appraisal. One Tap Away.»
- **Favicon + icon set.** `public/icons/` є, але перевір 192/512/maskable і `apple-touch-icon`. Для iOS splash — додати `public/splash/` або use next-pwa-splash.
- **Privacy / Terms сторінки** (`/legal/privacy`, `/legal/terms`) — Upwork-клієнти та Apple PWA install це читають.
- **Sentry / Vercel Analytics + Speed Insights.** Без них не довести «Lighthouse 100» та real-user метрики, які вказано у `StatStrip`.
- **JSON-LD (`SoftwareApplication` + `FAQPage`)** на лендингу — Google Rich Results.
- **Мобільний демо-скриншот (`/public/og/app-mock.jpg`).** Той самий промт Swiss-mockup — згенерувати у Midjourney/Flux і вставити у Hero як плаваючий mockup замість електричного радіуса.

## 🟡 Продуктові діри

- Калькулятор — **суто візуальний**: не зберігає введений assessed value у Zustand store і не прокидає його в `/appeal/new`. Треба передавати через query string або `useAppealStore.setState({ assessedValue })` при кліку «Start my appeal».
- Дані по Travis / Dallas (`typicalOvershoot`, `successRate`) — **захардкожені**. Для чесної подачі або зібрати з публічних ARB reports, або поставити пояснювальну зірочку-tooltip.
- Немає **email-capture** перед sign-in (leads для кейсу на Upwork).
- **Dark mode toggle** — токени для `.dark` уже в CSS, але не підключений ні `next-themes` Provider, ні перемикач. Це 15 хвилин роботи і помітно додає «app feel».
- **Share / install prompt** (`beforeinstallprompt`) — PWA має свою install-кнопку, але ніде не ловимо `beforeinstallprompt` івент → юзер Chrome не бачить системний банер.

## 🟢 Поліш

- `scripts/gen-icons.ts` існує — **запустити його** для генерації `public/icons/*` під новий бренд (зараз ікони ймовірно дефолтні Next).
- Серверна функція `/api/pdf` — задеплой на Fluid Compute з `runtime = 'nodejs'` (за замовчуванням) та timeout 30s (pdf-lib для багатосторінкової форми може їсти час).
- Додати `lighthouserc.json` у CI — він уже існує, треба підключити до GitHub Action.
- E2E прогнати на реальному мобільному viewport (`devices['iPhone 15 Pro']`) — зараз `playwright.config.ts` ймовірно тільки desktop.
- **Skeleton для `(app)/dashboard`** — зараз лендинг полірований, а app-shell виглядає як early MVP. Для Upwork-портфоліо треба або ховати `(app)`, або довести до того ж рівня якості.

## Мінімальний чекліст «можна показувати клієнту»

- [ ] Firebase проєкт створено, rules задеплоєно
- [ ] 50-132 PDF покладено в `src/assets/forms/`
- [ ] Auth guard на `(app)/*`
- [ ] OG-image згенеровано
- [ ] Privacy / Terms stub сторінки
- [ ] Vercel Analytics увімкнено
- [ ] Калькулятор пробрасує `assessedValue` у візард
- [ ] `vercel --prod` проходить, Lighthouse mobile ≥ 95

Далі — точковий полірінг: dark toggle, install-prompt, JSON-LD, реальні дані по округах.
