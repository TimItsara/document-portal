# Truuth — Applicant Document Submission Portal

> A full-stack monorepo for secure identity document submission and AI-powered verification, built on top of the [Truuth](https://truuth.id) document intelligence platform.

![Node](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169e1?logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)

---

## Overview

This portal allows applicants to register, upload identity documents, and receive real-time AI-powered fraud and authenticity verification results — all through a clean, guided UI backed by a secure serverless API.

Key capabilities:

- **AI Document Classification** — Truuth Classifier API validates that the uploaded image matches the expected document type before submission
- **Deep Fraud Detection** — Truuth Verify API runs 18+ forensic checks per document (deepfake analysis, C2PA, watermarks, timestamps, software fingerprints, visual anomalies, and more)
- **Polling-on-read Verification** — frontend polls GET /status every 5s; server checks Truuth live for any PROCESSING submissions, updating the DB before responding. Serverless-compatible alternative to background workers.
- **PDF Report Export** — users can download a branded multi-document verification report as a PDF
- **JWT Authentication** — stateless auth with secure token handling on both client and server

---

## Monorepo Structure

```
document-portal/
├── document-portal-api/     # Backend API (Express + Prisma + Vercel serverless)
└── document-portal-web/     # Frontend SPA (React + Vite + Tailwind)
```

---

## Architecture

```
┌─────────────────────────────┐
│      React SPA (Vite)       │  document-portal-web
│  Login · Dashboard · PDF    │
└────────────┬────────────────┘
             │ HTTPS + JWT (Bearer)
             ▼
┌─────────────────────────────┐
│   Express API (Serverless)  │  document-portal-api
│  Auth · Upload · Status     │
└──────┬──────────┬───────────┘
       │          │
       ▼          ▼
┌──────────┐  ┌─────────────────────────┐
│ Postgres │  │     Truuth APIs         │
│  (Neon)  │  │  Classifier + Verify    │
│  Prisma  │  │  (truuth.id)            │
└──────────┘  └─────────────────────────┘
```

**Data flow for a document upload:**

1. User uploads file via the React UI
2. API receives the file (multipart/form-data, max 10 MB)
3. **AU_PASSPORT** and **AU_DRIVER_LICENCE** → Truuth Classifier API validates the document type; all other documents skip classification
4. Document submitted to Truuth Verify API → returns a `documentVerifyId`
5. Record is saved to PostgreSQL with status `PROCESSING`
6. Frontend polls GET /api/documents/status every 5 seconds — server checks Truuth live for PROCESSING docs and updates DB before responding
7. Final result (fraud scores, check breakdowns) stored in DB
8. **Non-identity documents** (RESUME, BANK_STATEMENT, etc.) skip classification but are still submitted to the Truuth Verify API

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend framework | React 18 + TypeScript | Component model, strong typing |
| Build tool | Vite | Fast HMR, native ESM, minimal config |
| Styling | Tailwind CSS + CSS Variables | Utility-first with a consistent design system |
| HTTP client | Axios | Interceptors for global auth header injection |
| PDF export | jsPDF | Client-side PDF generation, no server round-trip |
| Backend framework | Express.js | Lightweight, compatible with Vercel serverless |
| ORM | Prisma | Type-safe DB access, migration management |
| Database | PostgreSQL via Neon | Serverless-friendly pooled connections |
| Auth | JWT + bcrypt | Stateless, secure, no session storage required |
| Deployment | Vercel | Zero-config CI/CD for both frontend and API |

---

## Architecture Decisions

**BFF Pattern**
Built as a dedicated Backend-for-Frontend rather than exposing Truuth APIs
directly to the browser. This keeps API credentials server-side, centralises
validation logic, and lets the frontend stay thin.

**Upsert-based document submissions**
All uploads use Prisma upsert keyed on (userId, documentType) — so re-uploads
cleanly replace the previous submission without duplicates. Every re-upload
resets all verify fields (documentVerifyId, pollCount, verifyResult) to ensure
no stale data leaks through.

**Polling-on-read verification**
Rather than a background setInterval (which does not survive Vercel serverless
cold starts), verification status is resolved lazily — when the client requests
document status via GET /api/documents/status, the server checks Truuth live
for any PROCESSING submissions, increments pollCount, and updates the DB before
responding. The frontend drives the 5-second poll frequency via setInterval,
stopping automatically once all docs reach a terminal status.

**Selective classification pipeline**
The upload pipeline applies classification selectively. Only AU_PASSPORT and
AU_DRIVER_LICENCE go through the Truuth Classifier to validate document type
and country before submission — other document types skip classification
entirely (classifierStatus = SKIPPED). All documents are then submitted to the
Truuth Verify API for fraud checks.

---

## Shortcuts Taken

- Polling is driven client-side (frontend setInterval every 5s) rather than a
  true server-side background worker (e.g. BullMQ). Vercel serverless does not
  support persistent background processes — polling-on-read is the correct
  pattern for this deployment model. In production, a dedicated worker or
  WebSockets/SSE would be used.

- File content is not persisted to object storage (S3 etc.) — only metadata is
  stored in the DB. The raw file is sent directly to Truuth APIs in memory.

- JWT tokens do not expire (no expiresIn set). In production, short-lived
  tokens with refresh token rotation would be used.

---

## Known Limitations

- No rate limiting on the upload endpoint. In production, per-user rate limits
  would be applied to prevent abuse.

- CORS is locked to a single FRONTEND_URL env var. Multi-origin support would
  require an allowlist approach.

- Neon free tier allows only 5 simultaneous connections. The DATABASE_URL is
  configured with connection_limit=1 to stay within this constraint on Vercel
  serverless.

---

## Document Types Supported

### Required (must complete onboarding)
| Code | Classifier | Verify API |
|---|---|---|
| `AU_PASSPORT` | ✅ Yes | ✅ Yes |
| `AU_DRIVER_LICENCE` | ✅ Yes | ✅ Yes |
| `RESUME` | ⬜ Skipped | ✅ Yes |

### Optional (go through Verify API)
`AU_MEDICARE_CARD` · `AU_PROOF_OF_AGE` · `PASSPORT` · `DRIVERS_LICENCE` ·
`AU_IMMI_CARD` · `AU_CITIZENSHIP_CERT` · `AU_BIRTH_CERT` · `AU_CHANGE_OF_NAME` · `AU_MARRIAGE_CERT` · `BANK_STATEMENT` · `TAX_RETURN` · `PAY_SLIP` · `EMPLOYMENT_CONTRACT` · `UTILITY_BILL` · `COUNCIL_RATES` · `PHOTO_ID` · `SELFIE` · `VISA` · `WORK_PERMIT` · `OTHER`

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL database (or [Neon](https://neon.tech) free tier)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd document-portal
```

### 2. Set up the API

```bash
cd document-portal-api
npm install
cp .env.example .env
# Fill in .env (see Environment Variables section below)
npx prisma migrate dev
npx prisma db seed
npm run dev
# API running at http://localhost:3001
```

### 3. Set up the Web

```bash
cd ../document-portal-web
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:3001
npm run dev
# Frontend running at http://localhost:5173
```

### Demo Credentials

```
Username: demo
Password: demo1234
```

---

## Environment Variables

### API (`document-portal-api/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Pooled PostgreSQL connection string |
| `DATABASE_URL_UNPOOLED` | ✅ | Direct connection (used by Prisma migrations) |
| `AUTH_SECRET` | ✅ | Long random secret for JWT signing |
| `TRUUTH_API_KEY` | ✅ | Truuth platform API key |
| `TRUUTH_API_SECRET` | ✅ | Truuth platform API secret |
| `FRONTEND_URL` | ✅ | Allowed CORS origin (your frontend URL) |

### Web (`document-portal-web/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend API base URL (no trailing slash) |

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login → returns JWT |
| `POST` | `/api/auth/signup` | Register new user (+ optional profile photo) |
| `GET` | `/api/auth/me` | Returns authenticated user info |

### Documents

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/documents/status` | All document cards + progress count |
| `POST` | `/api/documents/upload` | Upload a document (`multipart/form-data`) |
| `GET` | `/api/documents/result/:code` | Fetch verification result for a document type |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Liveness check |

---

## Database Schema

```
User
  id            UUID (PK)
  username      String (unique)
  passwordHash  String
  profilePhoto  String?
  createdAt     DateTime

DocumentType
  code              DocumentTypeCode (PK)
  displayName       String
  requiresClassifier Boolean

DocumentSubmission
  id                 UUID (PK)
  userId             FK → User
  documentType       DocumentTypeCode
  originalFilename   String
  mimeType           String
  classifierStatus   ClassifierStatus (SKIPPED | PASSED | FAILED)
  classifierResponse JSON?
  classifierError    String?
  classifiedAt       DateTime?
  documentVerifyId   String?
  verifyStatus       VerifyStatus (NOT_SUBMITTED | PROCESSING | DONE | FAILED)
  verifyResult       JSON?
  verifyError        String?
  verifySubmittedAt  DateTime?
  lastPolledAt       DateTime?
  pollCount          Int
  createdAt          DateTime

  @@unique([userId, documentType])  ← one submission per document type per user
```

---

## Verification Checks

Each document submitted to Truuth Verify runs the following forensic checks:

| Check | What it detects |
|---|---|
| `DEEPFAKE` (×7 models) | AI-generated or face-swapped images |
| `C2PA` | Content authenticity & provenance metadata |
| `ANNOTATION` | Digital annotations or markup |
| `COMPRESSION_HEATMAP` | Suspicious re-compression artefacts |
| `SOFTWARE_EDITOR` | Evidence of image editing software |
| `SOFTWARE_FINGERPRINT` | Creation tool fingerprinting |
| `VISUAL_ANOMALY` | Pixel-level anomaly detection |
| `WATERMARK_CHECK` | Hidden or removed watermarks |
| `HANDWRITING` | Handwritten alteration detection |
| `SCREENSHOT` | Screenshot-of-document detection |
| `TIMESTAMP` | Metadata timestamp inconsistency |
| `EOF_COUNT` | Multiple EOF markers (spliced files) |

---

## Frontend Features

### Login / Sign Up
- Password visibility toggle, inline validation, error messages
- Optional profile photo upload (file or live webcam capture)

### Dashboard
- Progress bar showing required document completion
- Required documents always visible; optional documents added from dropdown
- Per-card status badges: `NOT_SUBMITTED` · `PROCESSING` · `DONE` · `FAILED`
- Upload, view result, and remove actions per card

### Verification Result Modal
- Fraud score badge with pass/fail indicator
- Deepfake analysis breakdown table with per-model scores
- Full security check results (C2PA, EOF, Timestamp, Watermark, etc.)
- Raw JSON export
- Single-document PDF export

### Download Report Modal
- Select any combination of completed documents
- Select All / Deselect All
- Exports a branded multi-page PDF report

---

## Design System

Defined in `src/styles/globals.css` using CSS custom properties:

```css
--color-primary:   #7c3aed   /* Brand purple */
--color-success:   #16a34a
--color-warning:   #d97706
--color-error:     #dc2626
--text-primary:    #1a1a1a
--border-default:  #e5e7eb
```

Utility classes: `.btn` `.btn-primary` `.btn-outline` `.btn-ghost` `.badge` `.badge-processing` `.badge-failed` `.card` `.input`

---

## Deployment

Both apps deploy to [Vercel](https://vercel.com) independently with zero-config CI/CD.

### API
1. Push to GitHub, import `document-portal-api/` in Vercel
2. Set all env vars in Vercel dashboard
3. `vercel.json` handles serverless function routing automatically

### Web
1. Push to GitHub, import `document-portal-web/` in Vercel
2. Set `VITE_API_BASE_URL=https://your-api.vercel.app`
3. Vite is auto-detected — no build config needed
4. Set `FRONTEND_URL` on the API to match the deployed web URL for CORS

---

## Scripts

### API
| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled production build |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma migrate dev` | Run migrations |
| `npx prisma db seed` | Seed document types + demo user |
| `npx prisma studio` | Visual DB browser |

### Web
| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Potential Enhancements

These are natural next steps that would further strengthen this platform:

| Area | Enhancement |
|---|---|
| **Security** | Refresh token rotation, rate limiting on auth endpoints, CSRF protection |
| **Real-time Updates** | Replace client-side polling with WebSockets or SSE — server pushes status changes instead of client polling every 5s |
| **Resilience** | Retry queue for failed Truuth API calls, dead-letter store for unrecoverable submissions |
| **Testing** | Unit tests (Vitest), API integration tests (Supertest), E2E tests (Playwright) |
| **Observability** | Structured logging (Pino), error monitoring (Sentry), API metrics dashboard |
| **Multi-tenancy** | Organisation-level data isolation to support enterprise customers |
| **Admin Portal** | Internal dashboard for reviewing submissions, managing document types, and auditing fraud flags |
| **Notifications** | Email/SMS alerts to applicants when verification completes |
| **Internationalisation** | i18n support for non-English applicants and non-Australian document types |
| **Accessibility** | Full WCAG 2.1 AA audit — keyboard navigation, screen reader labels, focus management |

---

## License

MIT
