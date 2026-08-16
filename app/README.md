This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Persistence

The contribution, impact, and leaderboard routes require Supabase. Without local environment variables, those routes return `503 Supabase is not configured`; there is no in-memory replacement for community data. Configure the existing Supabase project locally with the placeholder names in `.env.example`:

```bash
cp .env.example .env.local
```

Apply all files in `supabase/migrations/` in order, including `202608170001_contributor_impact.sql`, then run `supabase/seed.sql` against the project. The seed includes clearly synthetic community-trend demo clusters for local/demo environments; it is not real user-submitted data. The server-only `SUPABASE_SECRET_KEY` must never be exposed to browser code.

For a local database without deploying the Next.js app, install the Supabase CLI, run `supabase start` from `app/`, then apply migrations with `supabase db reset`. Copy the local CLI's API URL, anon key, and service-role key into `.env.local`, restart `npm run dev`, and use the local app at `http://localhost:3000`.

The migration enables row-level security for youth-owned records and creates the private `scam-evidence` storage bucket. The schema smoke checks are in `supabase/tests/phase1.sql`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
