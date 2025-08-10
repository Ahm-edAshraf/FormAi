## FormAI — AI‑Powered Form Builder

FormAI is a Next.js app for creating, publishing, and collecting responses from forms—supercharged by Google Gemini to generate form structures from plain English. It uses Supabase for auth, DB, and file storage, and Stripe for billing.

### Features
- **AI form generation**: Describe your form; Gemini returns a validated spec that you can accept and edit.
- **Drag‑and‑drop editor**: Reorder fields, tweak labels, placeholders, required flags, options.
- **Publish & share**: One‑click publish to `/f/[slug]` with static caching for fast public rendering.
- **Submissions & uploads**: Stores structured responses; file uploads go to a Supabase Storage bucket.
- **Analytics & export**: Totals for forms, submissions, and views, plus CSV export for selected or all forms.
- **Plans & quotas**: Example free‑plan limits (e.g., generations/day, forms/month, submissions/month).
- **Stripe billing (optional)**: Checkout, invoice list, billing portal, and webhook handling.

### Tech Stack
- **Next.js 14 (App Router)**, **React 18**, **TypeScript**
- **Tailwind CSS** + shadcn/ui (Radix primitives)
- **Supabase** (auth, Postgres, storage)
- **Stripe** (billing)
- **Google Gemini** via `@google/genai`

### Quick Start
1) Clone and install
- pnpm is recommended.
```bash
pnpm install
```

2) Configure env
- Copy `.env.example` to `.env.local` and fill values:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Supabase Service Role (server/webhooks)
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# Google Gemini AI API Key (server-only)
GEMINI_API_KEY=<your-google-gemini-api-key>

# Stripe (optional, enables billing)
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_PRICE_PRO_MONTHLY=<your-stripe-price-id-for-monthly-plan>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
DATABASE_URL=<your-database-direct-url>
NEXT_PUBLIC_ANALYTICS_ID=<your-analytics-id>
EMAIL_SERVER_HOST=<your-smtp-host>
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=<your-smtp-username>
EMAIL_SERVER_PASSWORD=<your-smtp-password>
EMAIL_FROM=<your-from-email-address>
```

3) Run the dev server
```bash
pnpm dev
# http://localhost:3000
```

### Supabase Setup (minimum)
- Create a Supabase project and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Create a public Storage bucket named `form-uploads`.
- Ensure tables referenced by the app exist at minimum: `profiles`, `forms`, `form_fields`, `submissions`, `form_views`, `ai_generations`. Columns used include typical IDs, ownership (`user_id`), slugs, statuses, timestamps, and JSON `data` for submissions. Adjust SQL to your needs.

### Stripe (optional, for billing)
- Set `STRIPE_SECRET_KEY` and create a Price; set `STRIPE_PRICE_PRO_MONTHLY`.
- For local webhooks:
```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
# Copy the signing secret into STRIPE_WEBHOOK_SECRET
```

### Scripts
- `pnpm dev` – start dev server
- `pnpm build` – production build
- `pnpm start` – start production server
- `pnpm lint` – lint
- `pnpm analyze` – bundle analyzer
- `pnpm lighthouse` – local performance check

### Notes
- The AI endpoint uses `gemini-2.5-flash` and validates output with Zod.
- Public form pages are statically cached and revalidated; some APIs run on the Edge where noted.
- License: MIT (see `LICENSE`).