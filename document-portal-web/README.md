# Truuth Portal — Frontend
The applicant-facing React SPA for the Truuth Document Submission Portal.
Allows users to register, log in, upload identity documents, and view verification resul
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
---
## Tech Stack
| Layer | Technology |
|--------------|-----------------------------------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + CSS Variables |
| HTTP Client | Axios |
| PDF Export | jsPDF |
| Deployment | Vercel |
---
## Local Setup
### Prerequisites
- Node.js 20+
- npm
- Backend API running at http://localhost:3001
---
### 1. Clone the repo
git clone <your-repo-url>
cd document-portal
### 2. Install dependencies
Frontend README you stuck i dont get the full
file
npm install
### 3. Configure environment variables
cp .env.example .env
Fill in .env:
VITE_API_BASE_URL="http://localhost:3001"
### 4. Start the development server
npm run dev
Frontend runs at: http://localhost:5173
---
## Environment Variables
| Variable | Required | Description |
|-------------------|----------|------------------------------------------|
| VITE_API_BASE_URL | YES | Backend API base URL (no trailing slash) |
> All frontend env vars must be prefixed with VITE_ to be exposed by Vite.
---
## Project Structure
src/
├── components/
│ ├── LoginPage.tsx # Login + Sign Up with camera/file upload
│ ├── Dashboard.tsx # Main document submission dashboard
│ ├── DocumentCard.tsx # Document card with status badge
│ ├── DocumentVerifyResult.tsx # Verification result viewer + PDF export
│ ├── UploadModal.tsx # File upload modal
│ ├── ResultModal.tsx # Verification result modal
│ ├── DownloadReportModal.tsx # Multi-document PDF export with selection
│ └── Footer.tsx # Shared footer
├── styles/
│ └── globals.css # Design system — CSS variables + utilities
├── api.ts # Axios instance + all API calls
├── types.ts # Shared TypeScript types + enums
├── App.tsx # Root component — auth state + routing
└── main.tsx # Entry point
---
## Pages and Features
### Login / Sign Up
- Username + password login with JWT auth
- Sign up with optional profile photo (file upload or live camera capture)
- Field-level validation with inline error messages
- Remember me + Forgot password UI
- Sign in as a submitter alternative access link
- Secure connection badge
### Dashboard
- Sticky navbar with user avatar, username, logout
- Document upload progress bar
- Required documents section with status badges
- Additional documents section — add from dropdown, remove before upload
- Per-card actions: Upload, View Result, Remove
- Download Results button — opens selection modal to export PDF report
### Verification Result
- Full result viewer with fraud score badge
- Deepfake analysis breakdown with per-model scores table
- Security checks: C2PA, EOF, Timestamp, Watermark, Annotation
- JSON export for raw result data
- PDF export with TRUUTH branded layout
### Download Report Modal
- Select individual documents to include
- Shows fraud score per document
- Exports all selected documents into one multi-page PDF
- Select All / Deselect All toggle
---
## Auth Flow
User submits login form
|
v
POST /api/auth/login → JWT token
|
v
Token stored in localStorage
|
v
GET /api/auth/me → username + profilePhoto
|
v
Dashboard rendered
On logout → localStorage.clear() → back to LoginPage
---
## Document Status Badges
| Status | Color | Meaning |
|---------------|--------|-------------------------------------|
| NOT_SUBMITTED | Grey | Not yet uploaded |
| UPLOADED | Blue | File received, awaiting processing |
| PROCESSING | Yellow | Verification in progress |
| DONE | Green | Verification complete |
| FAILED | Red | Verification failed — retry allowed |
---
## Design System
Global CSS variables defined in src/styles/globals.css:
--color-primary: #7c3aed (brand purple)
--color-success: #16a34a
--color-warning: #d97706
--color-error: #dc2626
--text-primary: #1a1a1a
--border-default: #e5e7eb
Reusable utility classes:
.btn .btn-primary .btn-outline .btn-ghost
.badge .badge-uploaded .badge-processing .badge-failed
.card .input
---
## Scripts
| Command | Description |
|-----------------|-----------------------------------|
| npm run dev | Start dev server with hot reload |
| npm run build | Production build to dist/ |
| npm run preview | Preview production build locally |
| npm run lint | Run ESLint |
---
## Deployment (Vercel)
1. Push repo to GitHub
2. Import project at https://vercel.com
3. Set environment variable: VITE_API_BASE_URL=https://your-backend.vercel.app
4. Deploy — Vercel auto-detects Vite and builds correctly
> Make sure CORS on the backend allows your Vercel frontend URL via the FRONTEND_URL env
---
## Demo Credentials
> For development only — do not use in production.
Username: demo
Password: demo1234