# FinAudit AI

FinAudit AI is an AI-powered compliance & document audit SaaS built on the
MERN stack. Analysts upload a PDF (annual reports, AML/KYC batches, vendor
contracts, regulatory filings, etc.), and the backend extracts the text and
sends it to Google's Gemini API for an automated compliance review. Each
document comes back with a compliance score out of 100 and a list of flagged
issues (clause, reason, and severity), stored and surfaced across the
workspace.

Visitors first land on a marketing homepage (see below) that explains the
product before signing in; the app itself is a responsive, theme-aware
(dark/light) dashboard.

## Main Features

- **SaaS landing page** — a marketing homepage at `/` describing the product,
  its feature set and security model before visitors sign in.
- **Authentication** — register/login/logout with a JWT stored in an HTTP-only
  cookie; sessions persist across refreshes and are restored via `/api/auth/me`.
- **Upload & AI audit pipeline** — drag-and-drop PDF upload (max 25 MB) with
  live progress, then a staged pipeline (processing → extracting text →
  compliance analysis → report) with success, failure and retry states.
- **Compliance dashboard** — live stat cards (total audits, average score,
  critical alerts) plus an audit registry with expandable flagged issues.
- **Document management** — search, status filters, sortable columns and
  pagination; delete with a confirmation dialog; a detail page with
  Overview / Issues / Extracted Data / Audit Trail tabs.
- **Flagged items** — all issues across every document aggregated into one
  searchable, filterable, severity-coded table.
- **Audit history** — a chronological ledger of upload/completed/failed events
  derived from real document data.
- **Notification center** — a live bell with unread badge, mark-read actions,
  and document links; events are emitted when an analysis completes or fails.
- **Profile & settings** — real account data plus editable display name and
  notification preferences.
- **Team** — a scoped, read-only panel of the current workspace member.
- **Theme & responsive** — a dark/light theme toggle (persisted, follows the OS
  until you choose) and a mobile slide-in navigation drawer.

All data is scoped per user — you only ever see documents you uploaded.

## Tech Stack

**Frontend**
- React 19 + Vite
- react-router-dom (routing)
- Tailwind CSS v4
- axios
- lucide-react (icons)
- @base-ui/react, class-variance-authority, tailwind-merge (UI primitives)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`) for auth, `bcryptjs` for password hashing
- `multer` for file upload handling
- `pdf-parse` (v2) for PDF text extraction
- `@google/generative-ai` (Gemini `gemini-2.5-flash`) for the compliance
  analysis

**Database:** MongoDB

## Project Structure

```
frontend/
  src/
    components/
      AuthPage.jsx              # Login / register screen
      layout/DashboardLayout.jsx  # Sidebar + topbar shell (mobile drawer)
      dashboard/                # sidebar, topbar, stat-cards, upload-zone,
                                # documents-table, notification-bell
      ui/                       # button, toast, state, confirm-dialog,
                                # status-badge, compliance-score, sort-header,
                                # poll-provider, theme-provider/theme-toggle
    pages/                      # HomePage (landing), Dashboard, Documents,
                                # DocumentDetails, Upload, FlaggedItems,
                                # AuditHistory, Team, Settings, Profile, Support
    lib/
      api.js                    # Centralized axios instance
      utils.js                  # `cn()` classname helper
    App.jsx                     # Session check + top-level routing
    main.jsx

backend/
  server.js                     # Express entry; serves frontend/dist in production
  src/
    models/                     # User, Document, Notification (Mongoose schemas)
    routes/                     # auth, upload, documents, analytics, notifications
    middleware/authMiddleware.js  # JWT cookie verification
    services/aiService.js       # Gemini API integration
```

## Installation

```bash
git clone <repo-url>
cd <repo-folder>

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Environment Variables

Copy the example files and fill in real values — **never commit real
secrets or API keys.**

**`backend/.env`** (see `backend/.env.example`)

| Variable | Description |
|---|---|
| `PORT` | Port the API server listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin, used for CORS (default `http://localhost:5173`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens — use a long, random string raised to at least 32 characters; the backend refuses to start in production with a weaker secret (see `backend/.env.example`) |
| `GEMINI_API_KEY` | Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey)) — required for the upload/audit pipeline to work |

**`frontend/.env`** (see `frontend/.env.example`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API. Leave unset for the default same-origin `/api` (used in dev via Vite's proxy and when the backend serves the built frontend in production). Set an absolute URL for a cross-origin deployment |

> The frontend default is now same-origin `/api`: Vite proxies `/api` to the
> backend in development, and the Express server hosts the built bundle in
> production — so no frontend env file is needed for the common single-origin
> setup.

## Running the Project

You need a running MongoDB instance (local `mongod` or a hosted cluster —
point `MONGO_URI` at it) and a valid `GEMINI_API_KEY`.

```bash
# Terminal 1 — backend
cd backend
npm run dev      # nodemon, auto-restarts on changes
# or: npm start

# Terminal 2 — frontend
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on
`http://localhost:5000` by default. Visit the frontend URL — you'll land on the
product homepage, where you can register and start uploading PDFs.

Run `npm run lint` (frontend) before pushing to catch ESLint issues.

## Production Deployment

The backend serves the built frontend from the same origin, so a single
process hosts both the API and the SPA.

```bash
# 1. Build the frontend
cd frontend
npm install
npm run build        # outputs frontend/dist

# 2. Configure the backend for production
cd ../backend
npm install
# set NODE_ENV=production, a strong JWT_SECRET, MONGO_URI, CLIENT_URL and
# GEMINI_API_KEY (see backend/.env.example)

# 3. Start — Express serves the API and the built frontend together
npm start
```

Notes:

- `NODE_ENV=production` enables the SPA fallback (deep links like
  `/documents/xyz` resolve to `index.html`), trusts one reverse-proxy hop, and
  sets secure cookies. It also refuses to start unless `JWT_SECRET` is a random
  string of 32+ characters.
- Set `CLIENT_URL` to your public origin (it defaults to `http://localhost:5173`).
  CORS is locked to that origin with credentials, so update it in production.
- Because cookies are `secure` in production, serve the app over HTTPS (put it
  behind a reverse proxy like Nginx/Caddy/Traefik or use a TLS-terminating host).
- `frontend/.env` is not needed — the client calls same-origin `/api` by default.
  Only set `VITE_API_URL` (before building) for a cross-origin deployment.

## Security Notes

- **Auth tokens**: JWT in an HTTP-only cookie (`httpOnly`, `sameSite: lax`,
  `secure` in production). Secrets are never sent to the client.
- **CORS** is locked to `CLIENT_URL` with `credentials: true` — keep it that way.
- **Input validation** is enforced server-side on register/login, profile
  updates, and uploads: email format + case normalization, password length
  (8–72 chars), name length, and sanitized/length-capped file names.
- **Ownership checks**: every document/notification route scopes queries by the
  authenticated user's id — users can only see, view, and delete their own data.
- **Hardened boot**: the backend refuses to start without a `JWT_SECRET`, and
  fails in production if it's under 32 characters. `x-powered-by` is disabled
  and JSON bodies are limited.
- **Logging**: internal error details are logged server-side only; error
  messages returned to the client stay generic (no stack traces or secrets).

## API Documentation

All endpoints are prefixed with `/api`. Authenticated routes read the JWT
from an HTTP-only `token` cookie set at login/registration.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/health` | Health check | No |
| POST | `/api/auth/register` | Create an account, sets the session cookie | No |
| POST | `/api/auth/login` | Log in, sets the session cookie | No |
| POST | `/api/auth/logout` | Clear the session cookie | No |
| GET | `/api/auth/me` | Return the current authenticated user (used to restore a session after a refresh) | Yes |
| PATCH | `/api/auth/me` | Update display name and notification preferences | Yes |
| POST | `/api/upload` | Upload a PDF (`multipart/form-data`, field `file`, max 25 MB), extract text, and run the Gemini compliance audit | Yes |
| GET | `/api/documents` | List the current user's audited documents, newest first | Yes |
| GET | `/api/documents/:id` | Return a single document with its compliance details | Yes |
| DELETE | `/api/documents/:id` | Delete an uploaded document (owner only) | Yes |
| GET | `/api/analytics` | Dashboard metrics: total audited, average score, critical (high-severity) alert count | Yes |
| GET | `/api/notifications` | List notifications plus unread count | Yes |
| PATCH | `/api/notifications/:id/read` | Mark one notification read | Yes |
| PATCH | `/api/notifications/read-all` | Mark all notifications read | Yes |

## Architecture / Flow

```
Upload PDF (frontend)
   → POST /api/upload (multer, in-memory buffer, PDF-only, ≤25MB)
   → pdf-parse extracts text
   → Document saved with status "processing"
   → aiService.analyzeFinancialText() calls Gemini with the extracted text
   → Document updated with complianceScore + flaggedIssues, status "completed"
     (or "failed" if no extractable text)
   → Frontend refetches documents, analytics and notifications from a single
     shared polling clock every 5s (and refetches immediately after an own
     upload completes) to reflect new results
```

Authentication is a standard register → login → JWT-in-cookie flow.
Protected routes require the `requireAuth` middleware, which verifies the
cookie and attaches `req.userId`. On load, the frontend calls `/api/auth/me`
to check for an existing valid session before showing the login screen.

## Known Limitations / Future Improvements

- The `role` field on the User model (`analyst` / `admin`) is not yet used
  for authorization — there's no admin-only functionality.
- Notifications are not persisted beyond a read flag — there's no in-app
  archive view.
- Uploaded PDFs are not stored or re-downloadable — only file metadata and AI
  results are persisted, and no file download endpoint exists.
- Deleting a document leaves its notifications orphaned (they point at a
  deleted `docId`; harmless since everything is ownership-scoped, but not
  cleaned up).
- If the Gemini API call fails, the document is still marked `completed`
  with a fallback score of 50 and a generic flagged issue explaining the
  failure, so it's visible in the registry rather than silently lost —
  but genuinely broken/unparseable AI responses aren't retried.
- There is no rate limiting on authentication endpoints and no CSRF token
  (mitigated by `sameSite: lax` on the session cookie) — worth adding before
  high-traffic public deploys.
