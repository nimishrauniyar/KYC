# KYC Verification Platform

An incremental full-stack KYC verification project. All **five phases** are complete.

## Architecture

The project has an Express/Mongoose REST API (`src/`) and a separate Vite-powered React/Tailwind frontend (`client/`). JWT middleware authenticates requests; role middleware gates customer, verifier, and admin operations. Uploaded files are locally stored for development and checked for size, MIME type, and file signatures. A state-machine service is the single authority for document transitions.

## Included in Phase 1

- Express/MongoDB API structure
- Mongoose models: `User`, `KYCDocument`, and `VerificationLog`
- Customer signup and login with bcrypt password hashing and JWTs
- Authentication middleware and reusable role-based authorization middleware
- Protected current-user endpoint and API integration tests
- Secure document upload (PDF, JPEG, PNG; 5 MB limit plus binary-signature validation)
- Customer document list and verifier review queue
- Enforced document status state machine: `pending → approved/rejected`, `approved → expired`
- Daily expiry job, status-change email notifications, and admin audit/statistics APIs
- React + Tailwind user interfaces for customer, verifier, and admin roles

## Quick start

1. Use Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env`, then set `MONGODB_URI` and a strong `JWT_SECRET`.
3. Start the API with `npm run dev`.
4. Verify it with `npm test`.

The API is served at `http://localhost:4000/api/v1`.

Interactive Swagger documentation is available at `http://localhost:4000/api/docs` once the API is running. The source definition is [docs/openapi.json](/Users/nimishrauniyar/Documents/KYC/docs/openapi.json).

## Frontend

From `client/`, run `npm install` then `npm run dev`. Set `VITE_API_URL` when the API is not at the default local URL.

## Testing

Run `npm test` from the repository root. Tests use Jest, Supertest, and an isolated in-memory MongoDB instance. They cover signup/login protection and every allowed and disallowed status transition.

## Deployment

`render.yaml` deploys the API to Render. Create a MongoDB database (such as MongoDB Atlas), then provide `MONGODB_URI` and production SMTP values in Render's environment settings. Deploy `client/` to Vercel and set `VITE_API_URL` to the public API URL ending in `/api/v1`. The included `client/vercel.json` enables SPA routing.

> Local disk uploads are appropriate for development. For a production deployment, replace the disk storage adapter with object storage (e.g. S3 or Cloudinary) before accepting real identity documents.

## Phase 1 API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/auth/signup` | Create a customer account |
| `POST` | `/auth/login` | Obtain a JWT |
| `GET` | `/auth/me` | Return the authenticated user |
| `POST` | `/documents` | Upload a customer document (multipart field: `document`) |
| `GET` | `/documents/mine` | List the current customer's documents |
| `GET` | `/documents/review-queue` | List pending documents (verifier/admin) |
| `PATCH` | `/documents/:id/review` | Approve or reject a pending document (verifier/admin) |
| `GET` | `/admin/audit-logs?page=1&limit=20` | Paginated verification audit log (admin) |
| `GET` | `/admin/stats` | Document status summary (admin) |

Send the JWT as `Authorization: Bearer <token>`.

Account roles are `customer`, `verifier`, and `admin`. Public signup always creates a `customer`; privileged accounts should be provisioned through an admin-only workflow added in a later phase.
