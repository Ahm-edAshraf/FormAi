# FormAI

AI-powered form creation for people and teams that want to go from idea to live form quickly.

FormAI is a Next.js application backed by Convex, Clerk, and Groq. It turns plain-English prompts into structured form drafts, lets you refine them in a builder, publishes immutable snapshots to shareable URLs, and collects responses with lightweight analytics.

## What it does

- Generate form drafts from natural-language prompts with Groq structured outputs
- Edit forms visually in a draft builder backed by Convex
- Publish immutable snapshots to public routes at `/f/[slug]`
- Collect and review submissions in the dashboard
- Export responses as CSV
- Track views, starts, submissions, and completion rate
- Support personal and organization workspaces through Clerk

## Product flow

1. Sign in with Clerk
2. Create a blank form or generate one from an AI prompt
3. Refine fields, labels, options, help text, and required state
4. Publish the draft to a public slug
5. Share the public URL and collect responses
6. Review analytics and export responses

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Clerk
- Convex
- Groq
- Bun

## Supported field types

Current schema-backed field types:

- `text`
- `textarea`
- `select`
- `radio`
- `checkbox`
- `rating`
- `date`

## Routes

### Marketing and legal

- `/` - landing page
- `/privacy` - privacy policy
- `/terms` - terms of use
- `/cookies` - cookie policy
- `/data` - data, retention, and deletion page

### App

- `/dashboard` - workspace dashboard
- `/forms/new` - new form flow
- `/forms/[formId]/edit` - draft builder
- `/forms/[formId]/responses` - submissions browser
- `/forms/[formId]/analytics` - analytics page
- `/settings` - account and workspace settings

### Public runtime

- `/f/[slug]` - public published form

## Environment variables

### Local `.env.local`

Required for the Next.js app:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Convex deployment environment variables

Required in the Convex dashboard:

```env
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
GROQ_API_KEY=gsk_xxx
```

## Production setup with Vercel + production Clerk + dev Convex

Current recommended deployment model:

- Vercel for the Next.js frontend
- production Clerk keys for authentication
- the existing Convex dev deployment for backend/data while you are still validating the product

### Vercel environment variables

Set these in Vercel for both Preview and Production as appropriate:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CONVEX_URL=https://your-existing-dev-deployment.convex.cloud
```

### Convex dev deployment environment variables

If you switch the frontend to production Clerk, your Convex dev deployment must also validate production Clerk tokens:

```env
CLERK_JWT_ISSUER_DOMAIN=https://your-production-clerk-domain.clerk.accounts.dev
GROQ_API_KEY=gsk_xxx
```

Important:

- using production Clerk with a dev Convex deployment is acceptable for temporary rollout/testing, but both sides must point at the same Clerk instance
- after changing the Clerk issuer domain in Convex, sign out completely and sign back in so Clerk issues a fresh token
- if you later move Convex to production, update `NEXT_PUBLIC_CONVEX_URL` in Vercel to the production deployment URL

## Fair use instead of pricing

FormAI does not currently use Stripe or paid plans.

Instead, AI generation is governed by fair-use limits enforced in the backend:

- up to 5 AI generations per user per day
- up to 20 AI generations per workspace per day
- 1 AI generation per minute per user burst limit
- no pricing tiers or in-app billing flows

These limits exist to keep the product reliable and sustainable without adding subscription complexity.

## Local development

Install dependencies:

```bash
bun install
```

Run the Convex dev workflow if needed:

```bash
bunx convex dev
```

Start the app:

```bash
bun dev
```

Open `http://localhost:3000`.

## Deploying to Vercel

If you have the Vercel CLI installed and authenticated:

```bash
bunx vercel
```

For a production deployment:

```bash
bunx vercel --prod
```

Before deploying, make sure the Vercel project has the required environment variables listed above.

## Useful commands

```bash
bun dev
bun run build
bun run lint
bun run test:smoke
bunx tsc --noEmit
bunx convex codegen
```

## Notes on current implementation

- Published forms are immutable snapshots
- Drafts and live forms are intentionally separated
- The analytics system tracks views, starts, and submissions in Convex
- CSV export is currently optimized for the app's bounded owner query flow

## License and contribution policy

This repository uses a source-available license in `LICENSE`.

In short:

- you may read, inspect, fork, and modify the code only to prepare contributions back to this project
- you may submit pull requests and improvements
- you may not use, deploy, self-host, commercialize, or reuse this code for your own product or service without prior written permission from Ahmed Ashraf Yassen Aly

If you want to contribute, open an issue or submit a pull request.

## Operator

FormAI is operated by Ahmed Ashraf Yassen Aly.
