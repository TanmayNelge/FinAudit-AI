# FinAudit AI

FinAudit AI is a MERN-stack application for auditing financial documents.
Analysts upload a PDF (annual reports, AML/KYC batches, vendor contracts, regulatory filings, etc.), and the backend extracts the text and sends it to
Google's Gemini API for an automated compliance review. Each document comes back with a compliance score out of 100 and a list of flagged issues
(clause, reason, and severity), which are stored and surfaced on a dashboard.

## Main Features

- **Authentication** — register/login/logout with JWT stored in an HTTP-only cookie; sessions persist across page refreshes.
- **PDF upload & AI audit pipeline** — drag-and-drop or click-to-browse upload of PDF files (up to 25 MB), text extraction via `pdf-parse`, and compliance analysis via the Gemini API.
- **Audit registry** — a table of every document you've uploaded, its
  status (`processing` / `completed` / `failed`), and its compliance score.
  Completed documents with flagged issues can be expanded to see each
  issue's clause, reason, and severity.
- **Search** — filter the audit registry by filename.
- **Dashboard analytics** — total documents audited, average compliance
  score, and count of documents with at least one high-severity issue,
  refreshed automatically.

All data is scoped per user — you only ever see documents you uploaded.

## Tech Stack

**Frontend**
- React 19 + Vite
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
      AuthPage.jsx            # Login / register screen
      dashboard/
        sidebar.jsx           # Left nav (workspace shell)
        topbar.jsx             # Search, notifications, logout
        stat-cards.jsx        # Dashboard analytics cards
        upload-zone.jsx       # Drag-and-drop PDF upload
        documents-table.jsx   # Audit registry with expandable flagged issues
      ui/button.jsx           # Shared button primitive
    lib/
      api.js                 # Centralized axios instance
      utils.js                # `cn()` classname helper
    App.jsx                   # Session check + top-level layout/routing
    main.jsx

backend/
  server.js                   # Express app entry point
  src/
    models/                   # User, Document (Mongoose schemas)
    routes/                   # auth, upload, documents, analytics
    middleware/authMiddleware.js  # JWT cookie verification
    services/aiService.js     # Gemini API integration
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
| `JWT_SECRET` | Secret used to sign auth tokens — use a long, random string |
| `GEMINI_API_KEY` | Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey)) — required for the upload/audit pipeline to work |

**`frontend/.env`** (see `frontend/.env.example`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (default `http://localhost:5000`) |

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
`http://localhost:5000` by default. Visit the frontend URL, register an
account, and start uploading PDFs.

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
| POST | `/api/upload` | Upload a PDF (`multipart/form-data`, field `file`, max 25 MB), extract text, and run the Gemini compliance audit | Yes |
| GET | `/api/documents` | List the current user's audited documents, newest first | Yes |
| GET | `/api/analytics` | Dashboard metrics: total audited, average score, critical (high-severity) alert count | Yes |

## Architecture / Flow

```
Upload PDF (frontend)
   → POST /api/upload (multer, in-memory buffer, PDF-only, ≤25MB)
   → pdf-parse extracts text
   → Document saved with status "processing"
   → aiService.analyzeFinancialText() calls Gemini with the extracted text
   → Document updated with complianceScore + flaggedIssues, status "completed"
     (or "failed" if no extractable text)
   → Frontend polls /api/documents and /api/analytics every 5s
     (and refetches immediately after its own upload completes)
     to reflect new results
```

Authentication is a standard register → login → JWT-in-cookie flow.
Protected routes require the `requireAuth` middleware, which verifies the
cookie and attaches `req.userId`. On load, the frontend calls `/api/auth/me`
to check for an existing valid session before showing the login screen.

## Known Limitations / Future Improvements

- The sidebar's secondary navigation items (Documents, Upload Queue, Flagged Items, Audit Trail, Team, Settings, Support) are visual only —
  the app is currently a single dashboard view and doesn't have separate
  routed pages for them.
- The `role` field on the User model (`analyst` / `admin`) is not yet used
  for authorization — there's no admin-only functionality.
- There's no way to delete an uploaded document from the registry.
- The notification bell is decorative; there's no notification data model.
- If the Gemini API call fails, the document is still marked `completed`
  with a fallback score of 50 and a generic flagged issue explaining the
  failure, so it's visible in the registry rather than silently lost —
  but genuinely broken/unparseable AI responses aren't retried.
