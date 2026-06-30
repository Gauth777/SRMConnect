# SRMConnect Backend (`projectlink-backend`)

This is the backend service foundation for SRMConnect. It is built as a standalone backend using Node.js, NestJS, TypeScript, Prisma ORM, and Supabase.

---

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **Supabase Account** (for authentication integration later)
- **PostgreSQL** (referenced by `DATABASE_URL` later)

---

## Installation

To install all dependencies, run:

```bash
cd backend
npm install
```

---

## Environment Setup

1. Copy the environment variables example file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the values. During this foundation stage, credentials can remain empty or use dummy values, but features requiring them will fail with configuration errors.

---

## Development & Production Commands

### Running Locally (Development)
To start the NestJS development server with live reload:
```bash
npm run start:dev
```

### Production Build
To compile the TypeScript project to production-ready JS inside the `dist/` directory:
```bash
npm run build
```

To run the production build:
```bash
npm run start:prod
```

### Formatting & Linting
To check and fix linting and formatting issues:
```bash
npm run lint
npm run format
```

---

## Test Commands

To run all automated tests:

### Unit Tests
```bash
npm run test
```

### End-to-End (E2E) Tests
```bash
npm run test:e2e
```

---

## API Routes & Endpoints

By default, the backend runs on **port 4000**.

- **API Base URL**: `http://localhost:4000/api/v1`
- **Swagger Documentation URL**: `http://localhost:4000/docs`

### Implemented Routes

- **Public Health Check**:
  - `GET /api/v1/health`
  - Returns service status, service name, timestamp, and uptime.
- **Protected User Profile**:
  - `GET /api/v1/auth/me`
  - Requires header: `Authorization: Bearer <supabase-access-token>`
  - Returns verified user's `id`, `email`, and `emailVerified` status.

---

## Current Architecture

The backend implements a structured design divided into feature modules:
- `config`: Handles validating and loading environment configurations via `@nestjs/config`, `class-validator`, and `class-transformer`.
- `common`: Hosts global exception filters and utilities.
- `database`: Exposes a global `PrismaService` which coordinates DB connectivity.
- `supabase`: Handles connections to the Supabase client and provides token verification methods.
- `auth`: Provides `SupabaseAuthGuard` and the identity check routes.
- `health`: Exposes the public endpoint for container health probes.
- `users`, `profiles`, `projects`, `applications`: Empty structural placeholder modules awaiting domain logic.

### Database Strategy (Why Models are Missing)
The Supabase database schema has not been finalized yet.
- **No business database tables or migrations exist.**
- **Do not run `prisma migrate dev` or create manual SQL migrations.**
- The database schema will be added later after the ER diagram is approved.
- Supabase SQL migrations will remain the database schema source of truth, and Prisma will later introspect that schema using `prisma db pull`.

### Supabase Integration & Authentication Flow
1. The frontend (located at the repository root, running on `http://localhost:3000`) will authenticate users directly with Supabase via the Supabase client SDK.
2. Upon successful authentication, the frontend obtains a JWT `access_token`.
3. For any protected API call, the frontend includes this token in the `Authorization` header as a Bearer token:
   `Authorization: Bearer <access-token>`
4. The backend's `SupabaseAuthGuard` intercepts the request, extracts the token, passes it to the `SupabaseService`, and calls `supabase.auth.getUser(token)` to verify the user.
5. If the token is valid, the guard attaches the verified user metadata to `request.user`.

> [!WARNING]
> **Security Warning about `SUPABASE_SECRET_KEY`**
> The `SUPABASE_SECRET_KEY` (service-role key) bypasses all Row Level Security (RLS) policies.
> - **NEVER** expose this key to the frontend.
> - **NEVER** commit this key or any other secrets to git.
> - Ensure the `.env` file is always kept in `.gitignore`.
