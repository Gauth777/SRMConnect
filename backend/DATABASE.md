# SRM Connect database contract

## Ownership

Supabase PostgreSQL is the application database. Supabase Auth owns identities in `auth.users`. The NestJS backend owns application CRUD and connects through Prisma. The Next.js frontend must not write directly to the core application tables.

The SQL files in `/supabase/migrations` are the database source of truth. Prisma mirrors the live database schema and must not independently redesign it.

## Core schema

The first vertical slice intentionally contains only five application tables:

- `profiles`: one row per Supabase Auth user; stores role and shared profile fields.
- `students`: student-only academic, skill and link data.
- `faculty`: faculty-only academic metadata and verification state.
- `projects`: faculty-created project/hackathon/research opportunity posts.
- `applications`: one student application per project.

Secondary features such as notifications, leaderboards, reports, bookmarks and analytics are deliberately excluded until this vertical slice is functional end-to-end.

## Security boundary

All five application tables have Row Level Security enabled and direct privileges revoked from Supabase `anon` and `authenticated` roles. This is intentional: browser clients authenticate with Supabase Auth and call NestJS with the Supabase access token. NestJS validates the token and performs database operations server-side.

Never expose `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL`, or the database password to the frontend.

## Applying the schema

1. Rotate any previously exposed database/API credentials.
2. Copy `backend/.env.example` to `backend/.env` and fill in fresh credentials.
3. Apply `/supabase/migrations/20260828160000_core_schema.sql` to the shared Supabase project using the Supabase SQL editor or CLI.
4. From `/backend`, verify that Prisma sees the same live schema:

```bash
npx prisma db pull
npx prisma generate
npx prisma validate
```

Review `schema.prisma` after `db pull`. Any unexpected diff is schema drift and should be resolved against the SQL migration rather than pushed with `prisma db push`.

## Commands that are intentionally not part of this workflow

Do not use these as the source of schema changes:

```bash
npx prisma db push
npx prisma migrate dev
```

Schema changes should be reviewed as Supabase SQL migrations first, applied to the database, and then introspected into Prisma.
