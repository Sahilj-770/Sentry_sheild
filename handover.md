# Sentry Shield — Comprehensive Audit & Handover Document

> **Prepared for:** Next developer / AI implementation agent  
> **Project:** Sentry Shield — Network Security & Compliance Auditing Platform  
> **Repository:** `Ageiszero` (GitHub name must stay unchanged)  
> **Root path:** `C:\Users\SAHIL\OneDrive\Desktop\SIHfinal`  
> **Audit date:** 2026-09-25  
> **Scope:** Visual/design-system refinement + backend/frontend consistency pass only  
> **Hard constraint:** Do NOT rebuild, restructure, or remove any existing functionality.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Directory Map](#2-directory-map)
3. [Technology Stack](#3-technology-stack)
4. [Routing & Page Architecture](#4-routing--page-architecture)
5. [Robot Animation — Full Technical Inventory](#5-robot-animation--full-technical-inventory)
6. [Global CSS & Animation System](#6-global-css--animation-system)
7. [Tailwind Configuration](#7-tailwind-configuration)
8. [Color Palette & Current Design Tokens](#8-color-palette--current-design-tokens)
9. [Hero Section: Rainbow Gradient Issue](#9-hero-section-rainbow-gradient-issue)
10. [Hero CTAs: Start Free Audit & Live Dashboard Demo](#10-hero-ctas-start-free-audit--live-dashboard-demo)
11. [Dark Mode Architecture — Current State](#11-dark-mode-architecture--current-state)
12. [Light Mode — Current State](#12-light-mode--current-state)
13. [Frontend Inconsistencies Across User Flow](#13-frontend-inconsistencies-across-user-flow)
14. [Backend Inconsistencies & Known Issues](#14-backend-inconsistencies--known-issues)
15. [Frontend ↔ Backend Connection Map](#15-frontend--backend-connection-map)
16. [Authentication Flow — Complete Trace](#16-authentication-flow--complete-trace)
17. [Database Schema](#17-database-schema)
18. [Backend Module Inventory](#18-backend-module-inventory)
19. [Frontend Component Inventory](#19-frontend-component-inventory)
20. [localStorage Keys Catalogue](#20-localstorage-keys-catalogue)
21. [Branding & Name Consistency Audit](#21-branding--name-consistency-audit)
22. [Nothing OS Design Language Reference](#22-nothing-os-design-language-reference)
23. [Design System Implementation Plan](#23-design-system-implementation-plan)
24. [Dark Mode Implementation Guide](#24-dark-mode-implementation-guide)
25. [Items That Must NOT Change](#25-items-that-must-not-change)
26. [Prioritised Change List](#26-prioritised-change-list)
27. [Regression Requirements](#27-regression-requirements)
28. [Demo Credentials & Secrets Reference](#28-demo-credentials--secrets-reference)

---

## 1. Project Overview

**Sentry Shield** is a Smart India Hackathon (SIH) cybersecurity project. It performs automated network security configuration audits, detects compliance gaps, generates AI-assisted remediation guidance, and exports PDF audit reports. The user-facing brand name is **"Sentry Shield"**; the user-visible short name used in the current UI is **"Sentry"**. The repository name (`Ageiszero`) must not change.

### User-Facing Name Hierarchy
| Context | Name |
|---|---|
| Product name (presentations, marketing) | Sentry Shield |
| UI display name (in code today) | Sentry |
| Repository / GitHub | Ageiszero |
| Internal Python modules | do not rename |
| Internal API routes | do not rename |
| localStorage keys | do not rename (e.g., `aegisnet_token`) |
| Demo email domain | `@aegisnet-sih.gov.in` (keep as-is) |

---

## 2. Directory Map

```
SIHfinal/
├── Backend/
│   ├── main.py                   # FastAPI app, all routes (813 lines)
│   ├── auth.py                   # Argon2 + JWT auth
│   ├── database.py               # SQLAlchemy ORM, SQLite engine
│   ├── config_parser.py          # Dispatches to vendor_parser/
│   ├── vendor_parser/            # Package: base, cisco, juniper, fortinet,
│   │   ├── __init__.py           #   paloalto, huawei, arista, pfsense
│   │   ├── base.py
│   │   ├── cisco.py
│   │   ├── juniper.py
│   │   ├── fortinet.py
│   │   ├── paloalto.py
│   │   ├── huawei.py
│   │   ├── arista.py
│   │   └── pfsense.py
│   ├── security_rules.py         # Deterministic audit rules + RULE_FRAMEWORK_MAPPINGS
│   ├── risk_score.py             # Risk scoring engine
│   ├── ai_explainer.py           # Local AI explanation engine
│   ├── vendor_detector.py        # Multi-vendor auto-detection
│   ├── network_scanner.py        # Nmap integration (safe fallback)
│   ├── threat_intel.py           # Offline CVE database + optional external
│   ├── integrations.py           # SIEM/Ticketing/Slack adapters (demo stubs)
│   ├── pdf_report.py             # ReportLab PDF generation with QR
│   ├── qr_generator.py           # QR code generation
│   ├── audit_history.py          # DB read/write for audit records
│   ├── security_utils.py         # Security headers middleware, rate limiting
│   ├── network_security_auditor.db  # SQLite database (3 users, 37+ records)
│   ├── requirements.txt
│   ├── .env                      # Secrets (not committed)
│   └── .env.example
│
├── Frontend/
│   ├── index.html                # → landing.tsx (LandingPageApp)
│   ├── homepage.html             # → homepage.tsx (HomePageApp)
│   ├── dashboard.html            # → dashboard.tsx (DashboardPage)
│   ├── upload.html               # → upload.tsx (UploadPipelinePage)
│   ├── result.html               # → result.tsx (ResultPage)
│   ├── login.html                # → login.tsx (AuthPage, view=login)
│   ├── signup.html               # → signup.tsx (AuthPage, view=signup)
│   ├── src/
│   │   ├── main.tsx              # Alternative SPA entry (unused by Vite build)
│   │   ├── App.tsx               # SPA root (unused by Vite MPA build)
│   │   ├── index.css             # Global CSS + custom animations
│   │   ├── types.ts              # Shared TypeScript interfaces
│   │   ├── assets/
│   │   │   └── hero.png          # Static hero image asset (unused)
│   │   ├── pages/                # Vite MPA entry scripts (thin wrappers)
│   │   │   ├── landing.tsx       # Mounts LandingPageApp
│   │   │   ├── homepage.tsx      # Mounts HomePageView
│   │   │   ├── dashboard.tsx     # Mounts DashboardPage
│   │   │   ├── upload.tsx        # Mounts UploadPipelinePage
│   │   │   ├── result.tsx        # Mounts ResultPage
│   │   │   ├── login.tsx         # Mounts AuthPage (login)
│   │   │   └── signup.tsx        # Mounts AuthPage (signup)
│   │   ├── components/           # All React components
│   │   │   ├── RobotShieldIllustration.tsx  ← Robot animation HERE
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HomePageView.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── TopNoticeBar.tsx
│   │   │   ├── NetworkFeaturesSection.tsx
│   │   │   ├── DashboardPreview.tsx
│   │   │   ├── ContactUsSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AuthPage.tsx       # Full-page login/signup with inline SVG robot
│   │   │   ├── AuthModal.tsx      # Modal login/signup (used by App.tsx only)
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UploadPipelinePage.tsx
│   │   │   ├── ResultPage.tsx
│   │   │   └── SegmentedStatusBar.tsx
│   │   └── utils/
│   │       └── api.ts             # Centralized API client (307 lines)
│   ├── vite.config.ts             # MPA config, dev proxy
│   ├── package.json
│   ├── tailwind.config.ts         # NOT PRESENT — Tailwind v4 via @tailwindcss/vite
│   └── tsconfig.*.json
│
├── test_configs/
│   └── aegis-router-01.cfg        # Regression test config (AEGIS-ROUTER-01)
└── handover.md                    # This file
```

---

## 3. Technology Stack

### Frontend
| Item | Details |
|---|---|
| Framework | React 19.2.8 + TypeScript 6.0.2 |
| Build tool | Vite 8.2.2 (Multi-Page Application mode) |
| Styling | Tailwind CSS v4.3.3 via `@tailwindcss/vite` plugin |
| Icons | lucide-react 1.41.0 |
| Animations | Custom CSS keyframes in `index.css` + `canvas-confetti` for robot celebration |
| Router | None (hash-based navigation in `App.tsx`, full-page redirects in MPA pages) |

> **IMPORTANT:** Tailwind v4 does NOT use a `tailwind.config.js/ts` file. Configuration is done via CSS `@theme` variables and `@plugin` directives inside CSS, or via the Vite plugin. There is currently **no theme file** — Tailwind defaults are used directly.

### Backend
| Item | Details |
|---|---|
| Framework | FastAPI 0.141.1 + Uvicorn 0.52.4 |
| Auth | Argon2id (`argon2-cffi`) + PyJWT, 24h token expiry |
| Database | SQLAlchemy ORM + SQLite (`network_security_auditor.db`) |
| PDF generation | ReportLab |
| QR codes | `qrcode[pil]` |
| Config parsing | Custom modular vendor parsers in `vendor_parser/` |
| AI explanation | Local heuristic engine (no external LLM dependency) |
| External integrations | Optional SIEM/Slack/Jira stubs (all return unconfigured status) |

---

## 4. Routing & Page Architecture

### Multi-Page Application (MPA) Architecture

The Vite build generates **7 separate HTML entry points**. Each HTML page loads its own JS bundle. Navigation between pages is done via `window.location.href`.

```
index.html      → pages/landing.tsx   → mounts LandingPageApp
homepage.html   → pages/homepage.tsx  → mounts HomePageView
dashboard.html  → pages/dashboard.tsx → mounts DashboardPage
upload.html     → pages/upload.tsx    → mounts UploadPipelinePage
result.html     → pages/result.tsx    → mounts ResultPage
login.html      → pages/login.tsx     → mounts AuthPage (view=login)
signup.html     → pages/signup.tsx    → mounts AuthPage (view=signup)
```

### Dead Code: `src/main.tsx` and `src/App.tsx`
`main.tsx` renders `App.tsx` into `#root`. However, **`index.html` loads `pages/landing.tsx`**, not `main.tsx`. Therefore `App.tsx` and `main.tsx` are **dead code** in the MPA build. They contain an older SPA implementation (hash-based routing, embedded `AuthModal`). This code is safe to leave as-is since Vite's MPA build ignores it.

### Vite Dev Proxy
```
/api  → http://127.0.0.1:8000
/auth → http://127.0.0.1:8000
/audit → http://127.0.0.1:8000
/upload-config → http://127.0.0.1:8000
```
The proxy config includes `/upload-config` (legacy alias), but the primary route used by the frontend is `/api/audits/upload`.

---

## 5. Robot Animation — Full Technical Inventory

### Where it lives
**File:** `Frontend/src/components/RobotShieldIllustration.tsx` (384 lines)

### Where it is rendered
- **Landing page hero:** `HeroSection.tsx` → right column (line 120), inside a `lg:col-span-5` grid cell.
- **Auth pages:** `AuthPage.tsx` → left side column — a **separate inline SVG robot** is embedded directly (NOT `RobotShieldIllustration.tsx`), so there are two distinct robot illustrations.

### Animation library and technique
- **No animation library** (e.g., Framer Motion, GSAP) is used.
- All animation is via:
  1. **Tailwind utility classes**: `animate-float`, `animate-pulse`, `animate-ping`, `animate-spin`, `animate-bounce`
  2. **Custom CSS keyframe classes** defined in `index.css`: `animate-shield-rotate`, `animate-laser`, `animate-lock-snap`
  3. **React `useState` + `setTimeout`** orchestrates a 4-step sequence controlling opacity/scale/transform via Tailwind conditional class switching
  4. **`canvas-confetti`** fires a celebration particle burst when the lock snaps closed

### Animation sequence (state machine)
```
'shield-enter' → 'robot-enter' → 'lock-open' → 'scanning' → 'lock-closed'
     0ms           600ms           1400ms          2600ms        3800ms
```

### React state variables
| State variable | Type | Purpose |
|---|---|---|
| `animationStep` | `'shield-enter' \| 'robot-enter' \| 'lock-open' \| 'scanning' \| 'lock-closed'` | Controls which animation state all elements render in |
| `isLocked` | `boolean` | Controls color scheme (amber = unlocked/vulnerable, emerald = locked/secure) |

### Structural elements
| Element | Implementation |
|---|---|
| Shield shape | SVG `<path>` with `linearGradient id="shieldGrad"` (dark fill) + `linearGradient id="shieldBorder"` (animated border color) |
| Outer rotating ring | `<div>` with `.animate-shield-rotate` CSS class (24s full rotation) |
| Shield grid pattern | `<pattern id="shieldGrid">` inside SVG `<defs>` |
| Robot body | SVG with `linearGradient id="robotBodyGrad"` (white → slate gradient) |
| Robot visor | SVG `<rect>` with `linearGradient id="robotVisorGrad"` (dark fill) |
| Robot eyes | Conditional JSX: amber (open/alert), cyan (scanning), emerald arc (happy/locked) |
| Hover thruster | `<ellipse>` with `animate-pulse`, color changes with `isLocked` |
| Lock card | Tailwind-styled `<div>` with `backdrop-blur-xl`, amber/emerald color switching |
| Scanning laser | `<div>` with `.animate-laser` CSS class (vertical scan animation) |
| Status bar | Footer strip with state label + "Replay Sequence" button |
| Ambient glows | Two `<div>` elements with `bg-cyan-500/15` and `bg-blue-600/15`, `blur-3xl` |

### Hard-coded colors (all inline in JSX/SVG)
| Color value | Usage |
|---|---|
| `#00f2fe` (cyan neon) | Shield border (unlocked), robot antenna, robot eyes (scanning), hover thruster |
| `#10b981` (emerald-500) | Shield border (locked), robot eyes (happy), chest telemetry (locked) |
| `#3b82f6` (blue-500) | Shield border gradient stop (unlocked) |
| `#6366f1` (indigo-500) | Shield border gradient stop (unlocked) |
| `#0f172a` (slate-900) | Shield fill top |
| `#020617` (slate-950) | Shield fill bottom |
| `#f8fafc` / `#cbd5e1` / `#64748b` | Robot body gradient (white to slate) |
| `#34d399` (emerald-400) | Shield border gradient stop (locked) |
| `#059669` (emerald-600) | Shield border mid (locked) |
| `#38bdf8` (sky-400) | Side antenna dots, chest telemetry |
| `#f59e0b` (amber-400) | Robot eyes (unlocked/alert state), chest telemetry line (unlocked) |
| `#94a3b8` | Robot arms, neck connectors |
| `#334155` | Neck joint, thruster base, ear nodes |
| `#475569` | Robot arm wrist joints, ear nodes, head stroke |
| Confetti colors | `['#00f2fe', '#10b981', '#3b82f6']` |

### Interactive features
- **Click-to-toggle lock**: Clicking the padlock card toggles `isLocked` state manually.
- **"Replay Sequence" button**: Re-runs the full 4-step animation on demand.
- **`onScanCompleted` prop**: Optional callback, triggered when `lock-closed` state is reached.

### Theme-response capability
**The robot currently has no dark/light mode awareness.** It always renders on a dark background context (the background behind it is `#050814`). The robot SVG colors are hard-coded and do NOT respond to any CSS variable or Tailwind color token.

---

## 6. Global CSS & Animation System

**File:** `Frontend/src/index.css`

### Custom keyframe animations
| Class name | Keyframe | Duration (default) | Usage |
|---|---|---|---|
| `.animate-float` | Vertical bob -10px and back | 4s infinite | Robot hover in hero + AuthPage arms |
| `.animate-pulse-glow` | Opacity + scale pulse | 3s infinite | (Defined, not prominently used) |
| `.animate-shield-rotate` | Full 360° rotation | 24s linear infinite | Shield dashed outer ring + feature nodes decorative ring |
| `.animate-laser` | Vertical scan from top to bottom | 2.5s infinite | Scanning laser beam in robot lock section |
| `.animate-lock-snap` | Scale + rotate snap animation | 0.4s cubic-bezier | Lock icon + card when snapping closed |

### Utility classes
| Class | Effect |
|---|---|
| `.cyber-grid` | 40×40px cyan grid lines at 5% opacity. Used as background on: `HeroSection`, `AuthPage`, `HomePageView`, `DashboardPage`, `UploadPipelinePage`, `ResultPage`. |
| `.cyber-dot-grid` | Radial dot pattern at 15% opacity. Used in: `NetworkFeaturesSection` |
| `.text-neon-cyan` | `#00f2fe` with 12px glow shadow |
| `.text-neon-emerald` | `#10b981` with 12px glow shadow |
| `.border-neon-cyan` | Neon border + 15px shadow |
| `.border-neon-emerald` | Neon border + 15px shadow |
| `.shield-glow` | `drop-shadow(0 0 20px rgba(0, 242, 254, 0.45))` — applied to shield SVG |

### CSS custom properties (`:root`)
```css
--bg-dark: #050814
--card-dark: #0c1226
--border-dark: #1e294b
--cyan-neon: #00f2fe
--emerald-neon: #10b981
--purple-neon: #8b5cf6
```
These variables are **defined but not used** in Tailwind utility classes — they are available for direct CSS usage.

### Body defaults
```css
body {
  background-color: #060919;  /* near-black navy */
  color: #f1f5f9;              /* slate-100 */
  font-family: system-ui stack;
}
```

---

## 7. Tailwind Configuration

**Tailwind v4 is used.** There is **no `tailwind.config.ts` or `tailwind.config.js`**. Configuration is provided entirely via the `@tailwindcss/vite` Vite plugin.

This means:
- No custom `theme.extend` colors are defined.
- All color usage is via Tailwind's built-in palette (slate, cyan, emerald, blue, indigo, amber, etc.).
- Custom design tokens need to be added via `@theme` blocks inside CSS, or via `theme.extend` in a config file if v4 supports it in this version.

**To add design tokens properly in v4**, create a `tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './**/*.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sentry Shield design tokens go here
      }
    }
  },
  plugins: []
} satisfies Config
```

---

## 8. Color Palette & Current Design Tokens

All colors are currently hard-coded directly as Tailwind utility classes or inline hex values. **No design token system exists yet.**

### Background colors in use
| Hex | Context |
|---|---|
| `#050814` | Main page background (most pages) |
| `#060919` | Body CSS default |
| `#030612` | Top browser bars, darker accent bars |
| `#030712` | Slightly different dark bar shade |
| `#0a1024` | Card backgrounds (dashboard, auth form, result) |
| `#0b1228` | Feature inspector card, dashboard panel |
| `#0c132c` | Feature telemetry modal |
| `#060a1c` | Dashboard Preview section |
| `#050817` | NetworkFeaturesSection, ContactUsSection |
| `#090f24` | HomePageView logo card |
| `#0a0f24` | Mobile nav dropdown |

### Primary accent colors
| Color | Tailwind Token | Primary Use |
|---|---|---|
| Cyan (`#00f2fe`) | — (not a Tailwind default) | Neon robot glow, shield borders, interactive states |
| Cyan-400 (`#38bdf8`) | `text-cyan-400` | Primary UI accent, most buttons, interactive highlights |
| Cyan-500 (`#06b6d4`) | `bg-cyan-500` | Primary CTA buttons |
| Emerald-400 (`#34d399`) | `text-emerald-400` | Success states, compliance indicators |
| Amber-400 (`#fbbf24`) | `text-amber-400` | Warning states, open lock |
| Slate-100/200/300/400/500 | `text-slate-*` | Body text hierarchy |
| Blue-600 | `bg-blue-600` | Button gradients |

### Known issue: `#00f2fe` is NOT a standard Tailwind color
The primary neon cyan color used in SVGs and glows (`#00f2fe`) is not a Tailwind default. It's always written as a raw hex in SVG attributes or in non-Tailwind CSS. The Tailwind `cyan-400` (`#38bdf8`) and `cyan-500` (`#06b6d4`) are close but different.

---

## 9. Hero Section: Rainbow Gradient Issue

**File:** `Frontend/src/components/HeroSection.tsx`  
**Lines 43–48**

The main `<h1>` heading "Find the gaps. Secure the network." currently uses **two separate rainbow-style gradients**:

```tsx
// "gaps." — amber-rose-red gradient
<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-red-400">
  gaps.
</span>

// "Secure the network." — cyan-blue-emerald gradient
<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
  Secure the network.
</span>
```

### What the user wants
Remove the multicolor / rainbow treatment. The heading should be refined to use **either solid white, or a single disciplined 2-stop gradient** consistent with the brand palette. The user explicitly said: *"remove rainbow/multicolor visual treatment from 'Find the gaps. Secure the network.' section"*.

### Proposed implementation
```tsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
  Find the{' '}
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
    gaps.
  </span>
  <br />
  <span className="text-white">
    Secure the network.
  </span>
</h1>
```
Or alternatively, make "gaps." a solid amber accent (warning signal) without multicolor:
```tsx
<span className="text-amber-400">gaps.</span>
```
**Decision to make:** solid accent vs. 2-stop monochromatic gradient. Either is acceptable. Avoid `rose`, `red`, `indigo`, `emerald` in this headline.

---

## 10. Hero CTAs: "Start Free Audit" & "Live Dashboard Demo"

**File:** `Frontend/src/components/HeroSection.tsx`  
**Lines 61–75**

Two buttons currently exist in the hero section:

1. **"Start Free Audit"** (lines 61–67): Calls `onOpenAuth('signup')`. In `landing.tsx` this navigates to `/signup.html`.
2. **"Live Dashboard Demo"** (lines 69–75): Calls `onViewDashboard`. In `landing.tsx` this navigates to `/dashboard.html`.

### What the user wants
*"Remove 'Start Free Audit' and 'Live Dashboard Demo' hero CTAs (cleanly, not just hidden)"*

### What "cleanly remove" means
- Delete the JSX elements for both buttons, including their wrapping `<div>` if only those buttons occupy it.
- The `onOpenAuth` and `onViewDashboard` props on `HeroSection` become unused after removal.
- Remove those props from:
  - `HeroSection.tsx` interface (`HeroSectionProps`)
  - `HeroSection.tsx` destructuring
  - `pages/landing.tsx` where `<HeroSection>` is rendered (remove the prop assignments too)
  - `App.tsx` (dead code but consistent cleanup): remove the same props

The "Explore Feature Topology ↓" text button (line 77–83) should be **kept** as it scrolls to `#network-features` on the same page.

The trust metrics grid below (100%, <30s, 15+) should also be **kept**.

---

## 11. Dark Mode Architecture — Current State

### Current state: No dark mode toggle exists

The project currently uses **a single fixed dark theme** applied via Tailwind classes and CSS. There is:
- No `dark:` Tailwind variant usage anywhere in the codebase
- No `useTheme` / `ThemeContext` / `prefers-color-scheme` media query usage
- No toggle button or localStorage-persisted theme preference
- The `<html>` element has `class="dark"` set in `index.html` but Tailwind's `dark:` variant is not configured

### What the user wants
> "Professional light + dark mode. Dark mode should NOT be pure black — use charcoal/graphite/deep slate."

### Critical dark mode constraint (verbatim user requirement)
> "Do NOT make dark mode pure black. Avoid `#000000` as the main page background / pitch-black UI / extremely high-contrast neon styling. Use a dark charcoal / graphite / deep slate foundation."

### Proposed dark background palette
| Token name | Hex | Use |
|---|---|---|
| `--bg-base-dark` | `#0f1117` | Page background (current: `#050814`) |
| `--bg-surface-dark` | `#1a1f2e` | Card backgrounds (current: `#0a1024`) |
| `--bg-elevated-dark` | `#232840` | Elevated cards, modals |
| `--bg-bar-dark` | `#0d1018` | Top bars, nav (current: `#030612`) |
| `--border-dark` | `#2a3354` | Card borders |

> Note: Current `#050814` is very close to `#000000` in perceived darkness. It needs to lighten to `~#0f1117` or `~#111827` to read as charcoal, not black.

---

## 12. Light Mode — Current State

**Light mode does not exist.** All backgrounds, text, and borders are hard-coded for dark display.

To add light mode:
- Introduce a `ThemeContext` provider at the root of each page entry script
- Store preference in `localStorage.getItem('sentry_theme')` (suggest using `sentry_theme` not `aegisnet_theme`)
- Apply `class="light"` or `class="dark"` to `<html>` based on preference
- Configure Tailwind to use `class` strategy (which is Tailwind v4 default when `dark:` is present)
- Define light-mode CSS variables and `dark:` Tailwind utility overrides

---

## 13. Frontend Inconsistencies Across User Flow

### 13.1 Mock "browser bar" URLs — inconsistent branding
Every page has a fake browser address bar at the top. URLs are inconsistent:

| Page | Displayed URL | Problem |
|---|---|---|
| Landing | `sentry-sih.vercel.app` (TopNoticeBar) | OK — uses Sentry brand |
| Landing | (Navbar) | No URL bar in Navbar — OK |
| Auth (login) | `sentry.network/login` | OK |
| Auth (signup) | `sentry.network/signup` | OK |
| HomePage | `sentry.network/home` | OK |
| Dashboard | `dashboard.com/console` | ❌ Says `dashboard.com` — should be `sentry.network/dashboard` |
| Upload | (not inspected in detail) | Likely similar |
| Result | `result-page.com/security-report` | ❌ Says `result-page.com` — should be `sentry.network/results` |

**Fix:** Change `dashboard.com/console` → `sentry.network/dashboard` and `result-page.com/security-report` → `sentry.network/results` in `DashboardPage.tsx` (line 88) and `ResultPage.tsx` (line 173).

### 13.2 Email placeholder in auth form
`AuthPage.tsx` line 425: `placeholder="auditor@aegisnet-sih.gov.in"`  
`AuthPage.tsx` line 603: (forgot password modal) `placeholder="auditor@aegisnet-sih.gov.in"`

These are internal technical demo artifacts — the `@aegisnet-sih.gov.in` domain was an earlier name. Consider updating placeholders to `auditor@sentry-sih.gov.in` or `user@example.gov.in` to reflect the Sentry Shield branding, but keep the actual demo credential emails as-is for functional reasons.

### 13.3 Google Sign-In is entirely fake
`AuthPage.tsx` lines 117–129: `handleGoogleSignIn()` always resolves successfully after a 0.8s fake delay. It sets a fake user (`google.auditor@aegisnet-sih.gov.in`) without calling the backend. **This is a demo artifact**. The button should either:
- Be removed, or
- Be clearly labeled as "Not available in this demo" with `disabled` + a tooltip

**Current behavior:** Clicking "Sign in with Google" makes the user "authenticated" client-side with no real token. This user can then navigate to `/dashboard.html` but any protected API call will fail because there's no real JWT token in localStorage.

### 13.4 Forgot Password is entirely fake
`AuthPage.tsx` lines 616–619: Clicking "Send Link" just sets `forgotSubmitted = true` with no API call. No backend endpoint exists for password reset. The modal says "Recovery email dispatched!" — this is misleading.

**Recommendation:** Label the modal as "Reset links are unavailable in the SIH demo. Please use the demo credentials." or simply disable the modal's send button.

### 13.5 Contact form is entirely fake
`ContactUsSection.tsx` line 16–24: The form `handleSubmit` just sets `submitted = true` after 0.7s. No API call is made. The success message says "Transmission Dispatched!" — misleading.

**This is OK for SIH demo** — just note it clearly. No fix required unless a backend endpoint is added.

### 13.6 DashboardPreview (landing page section) — "Export PDF" button is fake
`DashboardPreview.tsx` line 124: `onClick={() => alert('Downloading Sentry SIH Executive Compliance Audit Report (PDF)...')}` — this triggers a browser alert. Replace with a no-op or disabled state.

### 13.7 ResultPage — static default data shows on first visit
`ResultPage.tsx` lines 19–35: When `localStorage.getItem('aegisnet_audit_data')` is null (fresh visit), the page shows `DEFAULT_UPLOAD_DATA` with Cisco IOS-XE 17.6, compliance score 94, and 3 vulnerabilities. These are fake defaults.

**The page should redirect to `/upload.html` if no audit data is present** or display a "No audit results yet" empty state instead.

### 13.8 `AuthModal.tsx` is dead code in the MPA build
`AuthModal.tsx` is imported only by `App.tsx` (which is dead code in the MPA build). It implements login/signup via a modal overlay and calls real API functions. It is **not rendered on any live page**. It can be safely left as-is, or archived.

### 13.9 `UploadPipelinePage.tsx` sample config embeds old hostname
Line 73: `hostname AEGIS-ROUTER-01` appears in the sample Cisco config embedded in the component. This is intentional for regression testing but references the old internal name.

### 13.10 Footer navigation — "Landing Pg 2.0 Features" label
`Footer.tsx` line 36: The section heading reads `Landing Pg 2.0 Features`. This is an internal wireframe label that leaked into production. It should be renamed to `Platform Features` or `Sentry Features`.

### 13.11 DashboardPage has no auth redirect guard
`DashboardPage.tsx` reads `getStoredUser()` from localStorage on mount but does NOT redirect to `/login.html` if unauthenticated. An unauthenticated user visiting `/dashboard.html` sees the full UI, and audit history API calls fail silently (set to empty array). A redirect guard at mount would improve security UX:
```ts
useEffect(() => {
  if (!isAuthenticated()) window.location.href = '/login.html';
}, []);
```

### 13.12 UploadPipelinePage — same auth redirect gap
Same as 13.11. No redirect to login if user is not authenticated. Upload will fail at the API level (401) but the user sees no clear indication they need to log in first.

---

## 14. Backend Inconsistencies & Known Issues

### 14.1 Duplicate route aliases (legacy compatibility shims)
Several routes are registered twice — once at the canonical `/api/...` path and once at a legacy path:

| Canonical | Legacy alias | Location |
|---|---|---|
| `POST /api/auth/register` | `POST /auth/register` | main.py L215–216 |
| `POST /api/auth/login` | `POST /auth/login` | main.py L269–270 |
| `GET /api/auth/me` | `GET /auth/me` | main.py L322–323 |
| `POST /api/auth/logout` | `POST /auth/logout` | main.py L335–336 |
| `GET /api/audits` | `GET /audit/history` | main.py L346–347 |
| `POST /api/audits` | `POST /audit` | main.py L369–370 |
| `POST /api/audits/upload` | `POST /upload-config` | main.py L422–423 |
| `POST /api/reports` | `POST /audit/report` | main.py L555–556 |

The frontend exclusively uses the `/api/...` canonical routes. The legacy aliases exist for compatibility. **These are not bugs** but add code surface area. Do not remove them yet — verify no external tools or scripts call the legacy paths first.

### 14.2 `/hello` endpoint returns personal name
`main.py` line 197–199: `GET /hello` returns `{"message": "Hello Aditi"}`. This is a debug artifact. It is harmless but should be removed before any public deployment.

### 14.3 Default JWT secret in code
`auth.py` line 17: The fallback JWT secret is `"sih_2026_aegisnet_super_secure_jwt_secret_key_change_in_prod"`. If `JWT_SECRET_KEY` is not set in `.env`, this hardcoded default is used. For demo this is acceptable; for production it must be set via environment variable.

### 14.4 `firebase-admin` in requirements but no Firebase usage in active code
`requirements.txt` includes `firebase-admin>=6.5.0`. No Firebase Admin SDK usage was found in any inspected backend module. This may be a leftover from an earlier integration plan. The installed package increases startup time and dependency surface needlessly. Verify and remove if unused.

### 14.5 `sentry-sdk` in requirements (name collision)
`requirements.txt` includes `sentry-sdk==2.68.1`. This is the **Sentry error monitoring SDK** (from getsentry.com) — unrelated to this project which is also called "Sentry". This creates a naming collision in documentation and potentially in error logs. The SDK is likely unused and should be removed unless error tracking was deliberately set up.

### 14.6 Token expiry is 24 hours (1440 minutes) — acceptable for demo
`auth.py` line 19: `ACCESS_TOKEN_EXPIRE_MINUTES = 1440`. Fine for SIH demo. For production, this should be lowered (e.g., 60 minutes) with a refresh token strategy.

### 14.7 QR code / PDF files saved to disk without cleanup
`pdf_report.py` and `qr_generator.py` save files to `reports/` and `qr_codes/` directories relative to the Backend working directory. There is no cleanup/TTL mechanism. Over time, these directories accumulate files. For production, implement file cleanup or use in-memory streaming.

### 14.8 `ai_explainer.py` — local heuristic engine only
The AI explanation is a purely local deterministic/heuristic system, not a live LLM. The `openai` package is listed in requirements but is unlikely to be actively called in the current codebase. The explanation engine works correctly — this is noted for accuracy of AI/ML claims.

### 14.9 `network_scanner.py` — requires Nmap system binary
The network scanner requires `nmap` to be installed as a system binary. If not present, `check_nmap_available()` returns `False` and the scanner endpoint returns a "not configured" status. This is correctly handled with honest fallback messaging.

---

## 15. Frontend ↔ Backend Connection Map

All frontend API calls go through `Frontend/src/utils/api.ts` → `apiFetch()` wrapper.

### Auth endpoints
| `api.ts` function | HTTP method + route | Auth required | Backend handler |
|---|---|---|---|
| `loginUser()` | `POST /api/auth/login` | No | `main.py: login()` |
| `registerUser()` | `POST /api/auth/register` | No | `main.py: register()` |
| `getCurrentUserProfile()` | `GET /api/auth/me` | Yes (Bearer) | `main.py: get_current_user_profile()` |
| `logoutUser()` | `POST /api/auth/logout` | Yes (Bearer) | `main.py: logout()` |

### Audit endpoints
| `api.ts` function | HTTP method + route | Auth required | Backend handler |
|---|---|---|---|
| `uploadAndAuditConfig()` | `POST /api/audits/upload` | Yes | `main.py: upload_config_file()` |
| `auditRawConfig()` | `POST /api/audits` | Yes | `main.py: audit_configuration()` |
| `getAuditHistory()` | `GET /api/audits[?all=true]` | Yes | `main.py: get_audit_history_list()` |
| `getAuditRecord()` | `GET /api/audits/{audit_id}` | Yes | `main.py: get_audit_by_id()` |
| `downloadAuditPdf()` | `GET /api/reports/{audit_id}` | Yes | `main.py: download_audit_report_by_id()` |
| `submitAuditFeedback()` | `POST /api/audits/{audit_id}/feedback` | Yes | `main.py: submit_audit_feedback()` |

### Architecture status endpoints
| `api.ts` function | HTTP method + route | Auth required | Backend handler |
|---|---|---|---|
| `getIntegrationsStatus()` | `GET /api/integrations/status` | Yes | `main.py: get_integrations_status()` |
| `getScannerStatus()` | `GET /api/scanner/status` | Yes | `main.py: get_scanner_status()` |

### Routes with NO frontend connection (backend-only)
| Route | Purpose |
|---|---|
| `GET /api/vendors` | Lists supported vendors — not called by any frontend component |
| `POST /api/scanner/scan` | Network scan trigger — not called from frontend |
| `POST /api/threat-intel/lookup` | Threat intel lookup — not called from frontend |
| `POST /api/integrations/test` | Integration test — not called from frontend |
| `GET /api/admin/users` | Admin user list — not called from frontend |
| `POST /api/admin/users` | Admin user create — not called from frontend |
| `GET /api/audits/{id}/results` | Alias for `get_audit_by_id` — not called from frontend |
| `GET /api/audits/{id}/remediation` | Remediation list — not called from frontend |
| `POST /api/reports` | Old report generation — not called from frontend (`downloadAuditPdf` uses `GET /api/reports/{id}`) |

### Data flow for audit results
1. `UploadPipelinePage` calls `uploadAndAuditConfig()` → receives `AuditResultData`
2. Stores enriched data in `localStorage.setItem('aegisnet_audit_data', JSON.stringify(data))`
3. Navigates to `/result.html`
4. `ResultPage` reads `localStorage.getItem('aegisnet_audit_data')` on mount
5. If `audit_id` is present, `downloadAuditPdf(audit_id)` calls backend for PDF

---

## 16. Authentication Flow — Complete Trace

```
User lands on /login.html
  → pages/login.tsx mounts AuthPage (view='login')
  → User fills email + password
  → handleSubmit() calls loginUser(email, password)
  → POST /api/auth/login (FastAPI)
     → rate limit check (15 req/min)
     → DB lookup by email
     → Argon2 verify password
     → create_access_token (JWT, 24h, HS256)
     → returns { access_token, token_type, user }
  → setToken(access_token) → localStorage.setItem('aegisnet_token', ...)
  → setStoredUser(user) → localStorage.setItem('aegisnet_user', ...)
  → onAuthSuccess() → window.location.href = '/dashboard.html'

Protected page (e.g., DashboardPage):
  → getAuditHistory() → apiFetch('/api/audits')
  → apiFetch adds: Authorization: Bearer <token>
  → FastAPI → get_current_user() dependency extracts JWT
  → Returns audit list (filtered by user.id unless admin)

Logout:
  → logoutUser() → POST /api/auth/logout (server confirms)
  → clearAuth() → removes 'aegisnet_token' + 'aegisnet_user' from localStorage
  → window.location.href = '/index.html'
```

---

## 17. Database Schema

**Engine:** SQLite — file at `Backend/network_security_auditor.db`  
**ORM:** SQLAlchemy  
**DO NOT change the schema** — any changes require a database migration.

### `users` table
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK, autoincrement, indexed |
| `email` | String(255) | Unique, indexed, not null |
| `name` | String(255) | Not null |
| `hashed_password` | String(500) | Not null (Argon2id hash) |
| `role` | String(50) | Default: `"auditor"`, not null |
| `is_active` | Boolean | Default: True |
| `created_at` | DateTime | UTC |
| `updated_at` | DateTime | UTC, auto-updated |

### `audit_records` table
| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | PK, autoincrement, indexed |
| `audit_id` | String(100) | Unique, indexed |
| `user_id` | Integer | FK → users.id (SET NULL on delete) |
| `user_email` | String(255) | Nullable |
| `timestamp` | String(100) | Not null |
| `vendor` | String(100) | Not null |
| `hostname` | String(255) | Nullable |
| `security_score` | Integer | Not null |
| `risk_level` | String(50) | Not null |
| `total_findings` | Integer | Default 0 |
| `critical_findings` | Integer | Default 0 |
| `high_findings` | Integer | Default 0 |
| `medium_findings` | Integer | Default 0 |
| `low_findings` | Integer | Default 0 |
| `filename` | String(255) | Nullable |
| `findings_json` | Text | JSON blob (full findings list) |
| `risk_data_json` | Text | JSON blob (risk + feedback data) |
| `created_at` | DateTime | UTC |

---

## 18. Backend Module Inventory

| Module | Lines | Status | Purpose |
|---|---|---|---|
| `main.py` | 813 | ✅ Working | All FastAPI routes |
| `auth.py` | 186 | ✅ Working | Argon2 hashing, JWT, RBAC dependencies |
| `database.py` | 135 | ✅ Working | SQLAlchemy ORM, User, AuditRecord models |
| `security_utils.py` | ~150 | ✅ Working | Security headers middleware, rate limiting, input validation |
| `config_parser.py` | ~80 | ✅ Working | Dispatches to `vendor_parser/` |
| `vendor_parser/__init__.py` | ~30 | ✅ Working | Package dispatcher |
| `vendor_parser/cisco.py` | ~120 | ✅ Working | Cisco IOS/IOS-XE parser |
| `vendor_parser/juniper.py` | ~80 | ✅ Working | Juniper JunOS parser |
| `vendor_parser/fortinet.py` | ~80 | ✅ Working | Fortinet FortiOS parser |
| `vendor_parser/paloalto.py` | ~70 | ✅ Working | Palo Alto PAN-OS parser |
| `vendor_parser/huawei.py` | ~70 | ✅ Working | Huawei VRP parser |
| `vendor_parser/arista.py` | ~70 | ✅ Working | Arista EOS parser |
| `vendor_parser/pfsense.py` | ~60 | ✅ Working | pfSense parser |
| `security_rules.py` | ~400 | ✅ Working | Deterministic audit rules + framework mappings |
| `risk_score.py` | ~80 | ✅ Working | Risk scoring (AEGIS-ROUTER-01 → 12/100 Critical) |
| `ai_explainer.py` | ~220 | ✅ Working | Local heuristic AI explanations (18/18 tests pass) |
| `vendor_detector.py` | ~100 | ✅ Working | Auto vendor detection |
| `network_scanner.py` | ~120 | ✅ Working | Nmap wrapper with safe fallback |
| `threat_intel.py` | ~180 | ✅ Working | Offline CVE database + optional external |
| `integrations.py` | ~200 | ✅ Working (stubs) | SIEM/Ticketing/Slack adapters |
| `pdf_report.py` | ~300 | ✅ Working | ReportLab PDF with compliance matrix |
| `qr_generator.py` | ~60 | ✅ Working | QR code generation |
| `audit_history.py` | 225 | ✅ Working | DB CRUD for audit records |
| `test_security_e2e.py` | ~300 | 18/18 passing | E2E regression test suite |
| `test_architecture_upgrades.py` | ~200 | 16/16 passing | Architecture upgrade test suite |

---

## 19. Frontend Component Inventory

| Component | File | Lines | Used In | Notes |
|---|---|---|---|---|
| `LandingPageApp` | `pages/landing.tsx` | 59 | `index.html` | Entry script — thin wrapper |
| `HomePageApp` | `pages/homepage.tsx` | 24 | `homepage.html` | Entry script |
| `DashboardPage` | `pages/dashboard.tsx` | 14 | `dashboard.html` | Entry script |
| `UploadPipelinePage` | `pages/upload.tsx` | 14 | `upload.html` | Entry script |
| `ResultPage` | `pages/result.tsx` | 14 | `result.html` | Entry script |
| `LoginPageApp` | `pages/login.tsx` | 24 | `login.html` | Entry script |
| `App` | `src/App.tsx` | 170 | `src/main.tsx` | **Dead code in MPA build** |
| `TopNoticeBar` | `components/TopNoticeBar.tsx` | 36 | Landing | Fake vercel URL bar |
| `Navbar` | `components/Navbar.tsx` | 202 | Landing | Reads real auth state |
| `HeroSection` | `components/HeroSection.tsx` | 128 | Landing | Contains rainbow text + CTAs |
| `RobotShieldIllustration` | `components/RobotShieldIllustration.tsx` | 384 | HeroSection | **Main robot animation** |
| `NetworkFeaturesSection` | `components/NetworkFeaturesSection.tsx` | 457 | Landing | Constellation diagram |
| `DashboardPreview` | `components/DashboardPreview.tsx` | 339 | Landing | Demo-only, fake data |
| `ContactUsSection` | `components/ContactUsSection.tsx` | 199 | Landing | Form submit is fake |
| `Footer` | `components/Footer.tsx` | 80 | Landing | Has "Landing Pg 2.0 Features" label |
| `HomePageView` | `components/HomePageView.tsx` | 337 | homepage.html | Stats + feature circles |
| `AuthPage` | `components/AuthPage.tsx` | 633 | login.html, signup.html | Real auth, fake Google SSO, inline robot SVG |
| `AuthModal` | `components/AuthModal.tsx` | 252 | `App.tsx` (dead code) | Modal version of auth — not rendered in MPA |
| `DashboardPage` | `components/DashboardPage.tsx` | 635 | dashboard.html | Real audit history, vendor selector |
| `UploadPipelinePage` | `components/UploadPipelinePage.tsx` | 503 | upload.html | File upload + pipeline simulation |
| `ResultPage` | `components/ResultPage.tsx` | 554 | result.html | Reads from localStorage, PDF download |
| `SegmentedStatusBar` | `components/SegmentedStatusBar.tsx` | — | UploadPipelinePage | Pipeline progress visualization |

---

## 20. localStorage Keys Catalogue

| Key | Set by | Read by | Content |
|---|---|---|---|
| `aegisnet_token` | `api.ts: setToken()` | `api.ts: getToken()` / `apiFetch()` | JWT Bearer token string |
| `aegisnet_user` | `api.ts: setStoredUser()` | `api.ts: getStoredUser()` | JSON `UserProfile` object |
| `aegisnet_audit_data` | `UploadPipelinePage.tsx` | `ResultPage.tsx` | JSON `AuditResultData` with findings |
| `aegisnet_selected_vendor` | `DashboardPage.tsx` | `UploadPipelinePage.tsx` | Vendor name string |
| `aegisnet_device_count` | `DashboardPage.tsx` | (not clearly read) | Device count number string |

**All keys use `aegisnet_` prefix** — this is an internal technical identifier from the earlier project name. **Do NOT rename these keys** — doing so would silently break active sessions without a migration strategy.

---

## 21. Branding & Name Consistency Audit

### User-visible places where "Sentry" already appears (✅ correct)
- `Navbar.tsx` line 45: `"Sentry"`
- `HomePageView.tsx` line 183: `"Sentry"`
- `DashboardPage.tsx` line 143: `"Sentry"`
- `NetworkFeaturesSection.tsx` line 213: `"Sentry AI Core"`
- `Footer.tsx` line 18: `"Sentry"`
- `TopNoticeBar.tsx` line 12: `"sentry-sih"` (in fake URL bar)
- `AuthPage.tsx` line 148: `"sentry.network/login"` / `"sentry.network/signup"`
- `HomePageView.tsx` line 135: `"sentry.network/home"`
- `ContactUsSection.tsx` line 46: `"Sentry SIH Team"`
- `main.py` line 74: FastAPI title says `"Sentry — Network Security & Compliance Auditing Platform API"`
- `main.py` line 67: Log message says "Sentry database"

### Remaining "AegisNet" / "aegisnet" references (⚠️ need assessment)
| Location | Reference | Action |
|---|---|---|
| `api.ts` line 10 | `TOKEN_STORAGE_KEY = 'aegisnet_token'` | **Keep** — technical key, changing breaks sessions |
| `api.ts` line 11 | `USER_STORAGE_KEY = 'aegisnet_user'` | **Keep** — technical key |
| `DashboardPage.tsx` line 68 | `localStorage.setItem('aegisnet_selected_vendor', ...)` | **Keep** — consistent with key catalogue |
| `DashboardPage.tsx` line 76 | Same key | **Keep** |
| `UploadPipelinePage.tsx` line 73 | `hostname AEGIS-ROUTER-01` (in sample config string) | **Keep** — regression test hostname |
| `AuthPage.tsx` line 51–55 | `email: 'auditor@aegisnet-sih.gov.in'` | **Keep** — actual demo credential email |
| `AuthPage.tsx` line 62–63 | `email: 'admin@aegisnet-sih.gov.in'` | **Keep** — actual demo credential email |
| `AuthPage.tsx` line 125 | `'google.auditor@aegisnet-sih.gov.in'` | Low priority — fake Google SSO email |
| `AuthPage.tsx` line 425 | `placeholder="auditor@aegisnet-sih.gov.in"` | Consider updating to generic placeholder |
| `AuthPage.tsx` line 603 | Same placeholder in forgot password modal | Consider updating |
| `auth.py` line 17 | `JWT_SECRET_KEY` default contains `aegisnet` | Keep — internal secret, never user-visible |
| `ResultPage.tsx` line 22 | `vendor: 'Cisco IOS-XE 17.6'` in DEFAULT_UPLOAD_DATA | This is just sample data, not a name issue |

### "Sentry Shield" vs. "Sentry" — where to use which
The user wants **"Sentry Shield"** as the **product/presentation name** (e.g., in the PPT, in headers of presentation pages). The current UI uses plain **"Sentry"**. To implement "Sentry Shield":
- Update `Navbar.tsx` brand text from `"Sentry"` to `"Sentry Shield"` (or `Sentry` / `Shield` stacked)
- Update `index.html` title from `"Sentry | Find the gaps. Secure the network."` to `"Sentry Shield | Find the gaps. Secure the network."`
- Update Footer.tsx from `"Sentry"` to `"Sentry Shield"`
- Possibly update DashboardPage header and HomePageView logo card

---

## 22. Nothing OS Design Language Reference

The user wants **design inspiration** from Nothing OS — not a copy of Nothing's branding.

### Core principles to adopt
| Principle | Implementation guidance |
|---|---|
| **Monochrome foundation** | Reduce color count. Use grays, slates, and one accent (cyan). Remove rainbow gradients. |
| **Disciplined typography** | Strong font-weight contrast. Heavy headers, light body. Mono for technical data. No decorative fonts. |
| **Restrained spacing** | More whitespace, less cramming. Consistent 8px grid. |
| **Minimal UI** | Remove decorative elements that don't communicate data. Less blur glow layers. |
| **Subtle technical details** | Thin separator lines, mono labels, quiet borders. Not heavy drop shadows. |
| **Dot matrix / grid textures** | Use `.cyber-dot-grid` more, `.cyber-grid` less aggressively. |
| **No pure black** | Dark charcoal/graphite base (as constrained by user). |

### What NOT to do (user stated explicitly)
- Do not make it a completely new website
- Do not make it a huge animated landing page  
- Do not make it an AI-themed marketing site  
- Do not use excessive glassmorphism  
- Do not go over-neon or cyberpunk  
- Do not go black-and-green "hacker" aesthetic  

---

## 23. Design System Implementation Plan

### Step 1: Create `tailwind.config.ts` (or `sentry.css` theme tokens)

Define Sentry Shield design tokens. Recommended approach with Tailwind v4:

```css
/* In index.css, add @theme block */
@theme {
  --color-surface: #0f1117;
  --color-surface-raised: #1a1f2e;
  --color-surface-elevated: #232840;
  --color-bar: #0d1018;
  --color-border: #2a3354;
  --color-border-subtle: #1e2740;
  --color-accent: #22d3ee;      /* cyan-400 */
  --color-accent-dim: #0891b2;  /* cyan-600 */
  --color-success: #34d399;     /* emerald-400 */
  --color-warning: #fbbf24;     /* amber-400 */
  --color-danger: #f87171;      /* red-400 */
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-tertiary: #64748b;
  --font-mono: ui-monospace, "SF Mono", Consolas, monospace;
}
```

### Step 2: Apply dark mode class strategy
In `vite.config.ts` or via Tailwind config, ensure `darkMode: 'class'` is set.

### Step 3: Create `ThemeContext` in `src/utils/theme.tsx`
```tsx
export const ThemeProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('sentry_theme') as 'dark' | 'light') || 'dark'
  );
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('sentry_theme', theme);
  }, [theme]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
```

### Step 4: Add toggle button to Navbar
A small sun/moon icon toggle in `Navbar.tsx` right side, persisted to localStorage.

---

## 24. Dark Mode Implementation Guide

### Background lightening (dark mode defaults)
Replace the current near-black palette with charcoal equivalents:

| Old value | New dark mode value | Token |
|---|---|---|
| `bg-[#050814]` | `bg-[#0f1117]` | `--color-surface` |
| `bg-[#030612]` | `bg-[#0d1018]` | `--color-bar` |
| `bg-[#0a1024]` | `bg-[#1a1f2e]` | `--color-surface-raised` |
| `bg-[#0b1228]` | `bg-[#1d2235]` | `--color-surface-elevated` |

### Cyber grid adjustment
The `.cyber-grid` currently uses `rgba(0, 242, 254, 0.05)` — at 5% opacity this barely registers. For dark mode, this is fine as-is or can be kept.

### Robot animation in dark vs. light mode
The robot SVG colors are hard-coded and cannot respond to CSS classes. Options:
1. Accept that the robot is always in "dark mode" style (recommended — it lives in a dark context)
2. Pass a `theme` prop to `RobotShieldIllustration` and conditionally switch some SVG fill colors

---

## 25. Items That Must NOT Change

| Item | Reason |
|---|---|
| Robot animation in `RobotShieldIllustration.tsx` | User explicitly said "an important part and MUST remain" |
| Backend audit logic (security_rules, risk_score, etc.) | Working correctly; regression tests pass |
| Database schema | Would require a migration |
| API routes and their behavior | Actively used by frontend |
| localStorage key names (`aegisnet_*`) | Changing silently breaks active sessions |
| Demo credentials | Used for evaluation demonstrations |
| AEGIS-ROUTER-01 regression test result | Must always yield 12 findings, Score 12/100, Critical |
| `vendor_parser/` package | Working correctly for all vendors |
| `threat_intel.py` CVE database | 16-entry offline DB, correct |
| Frontend build configuration (Vite MPA) | Working, 0 errors |

---

## 26. Prioritised Change List

Listed in recommended implementation order:

### Priority 1 — Visual regressions (quick wins)
1. **Remove rainbow gradients from `HeroSection.tsx` h1** — 2-line change
2. **Remove "Start Free Audit" + "Live Dashboard Demo" CTAs** from `HeroSection.tsx` — delete ~15 lines + prop cleanup
3. **Fix mock URL bars** — `dashboard.com` → `sentry.network/dashboard`, `result-page.com` → `sentry.network/results`
4. **Fix "Landing Pg 2.0 Features"** in `Footer.tsx` → `"Platform Features"`

### Priority 2 — Design system foundation
5. **Add design tokens** to `index.css` via `@theme`
6. **Lighten dark backgrounds** from near-black to charcoal across all pages (systematic find-replace of `#050814`, `#0a1024`, etc.)
7. **Reduce neon glow intensity** — reduce `blur-3xl` ambient glow elements from opacity 15% → 8%

### Priority 3 — Theme toggle
8. **Create `ThemeContext`** and `ThemeProvider`
9. **Wire theme toggle into `Navbar.tsx`**
10. **Add `dark:` and light-mode class variants** to key components

### Priority 4 — UX improvements
11. **Add auth redirect guards** to `DashboardPage.tsx` and `UploadPipelinePage.tsx`
12. **Fix `ResultPage` empty state** when no audit data in localStorage
13. **Label fake interactions** (Google SSO, Forgot Password, Contact form) as "Demo only"

### Priority 5 — Brand polish
14. **Update "Sentry" → "Sentry Shield"** in Navbar, Footer, page titles
15. **Update email placeholder** in `AuthPage.tsx` to remove `@aegisnet-sih.gov.in`

### Priority 6 — Backend cleanup (optional, low risk)
16. **Remove `/hello` debug endpoint** from `main.py`
17. **Remove unused `firebase-admin`** from requirements
18. **Remove or disable unused `sentry-sdk`** from requirements

---

## 27. Regression Requirements

These must pass after any change:

### Backend regression test (always run after backend changes)
```bash
cd Backend
python -m pytest test_security_e2e.py -v    # 18/18 must pass
python -m pytest test_architecture_upgrades.py -v  # 16/16 must pass
```

### Cisco AEGIS-ROUTER-01 audit regression
Upload `test_configs/aegis-router-01.cfg` (or paste its content) and verify:
- Total findings: **12**
- High findings: **10**
- Medium findings: **2**
- Security score: **12/100**
- Risk level: **Critical**

### Frontend build regression
```bash
cd Frontend
npm run build  # Must complete with 0 TypeScript errors
```

---

## 28. Demo Credentials & Secrets Reference

### Demo login credentials (seeded into DB on startup)
| Role | Email | Password |
|---|---|---|
| Auditor | `auditor@aegisnet-sih.gov.in` | `CyberSecurity@2025` |
| Admin | `admin@aegisnet-sih.gov.in` | `AdminSecurity@2025` |

These are seeded by `init_db(hash_func=hash_password)` in `database.py` at server startup.

### Backend `.env` variables
| Variable | Default (if not set) | Notes |
|---|---|---|
| `JWT_SECRET_KEY` | `"sih_2026_aegisnet_super_secure_jwt_secret_key_change_in_prod"` | Must be overridden in production |
| `JWT_ALGORITHM` | `"HS256"` | Standard |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (24h) | Acceptable for demo |
| `DATABASE_URL` | `"sqlite:///./network_security_auditor.db"` | SQLite relative path |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated |
| `THREAT_INTEL_API_KEY` | (not set) | Optional — enables external threat intel |
| `SIEM_WEBHOOK_URL` | (not set) | Optional — enables SIEM integration |
| `SLACK_WEBHOOK_URL` | (not set) | Optional — enables Slack alerts |
| `JIRA_API_URL` | (not set) | Optional — enables Jira ticketing |

### Developer start commands
```bash
# Backend
cd Backend
uvicorn main:app --reload --port 8000

# Frontend
cd Frontend
npm run dev
# → serves at http://localhost:5173
# → index.html = Landing page
# → login.html = Login page
# → dashboard.html = Dashboard

# Run tests
cd Backend
python -m pytest test_security_e2e.py -v
python -m pytest test_architecture_upgrades.py -v
```

---

*End of handover document. Last verified against codebase on 2026-09-25.*
