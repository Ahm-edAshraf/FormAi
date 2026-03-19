# FormAI

AI-powered form creation for teams that want to go from idea to live form quickly.

FormAI is a Next.js application that lets users describe a form in plain English, generate a structured draft with Google Gemini, refine it in a drag-and-drop editor, publish it to a shareable URL, and collect responses with analytics, CSV export, and optional Stripe-backed billing.

## What It Does

- Generate form drafts from natural-language prompts with Gemini.
- Edit forms visually with drag-and-drop field management and per-field settings.
- Publish forms to a public route at `/f/[slug]`.
- Collect submissions, including file uploads stored in Supabase Storage.
- Track views, submissions, and conversion metrics from the dashboard and analytics pages.
- Export response data as CSV for one form or all forms.
- Support free/pro-style usage flows with optional Stripe checkout, invoices, and billing portal access.

## Product Flow

1. Sign in with Supabase auth.
2. Open the dashboard and create a form.
3. Describe the form you want and let Gemini generate a draft.
4. Fine-tune fields, labels, placeholders, options, and required states in the editor.
5. Publish the form and share the generated public link.
6. Review submissions and analytics, then export data when needed.

## Key Features

### AI Form Generation

- Uses `@google/genai` to turn plain-English prompts into a validated form spec.
- Shows an inline preview before the generated structure is accepted.
- Creates an editable draft form after acceptance.

### Visual Form Builder

- Drag-and-drop editor powered by `@dnd-kit`.
- Auto-save behavior for form metadata and field changes.
- Desktop/mobile preview toggle inside the editor.
- Public-link copy flow after publishing.

### Supported Field Types

- Text
- Email
- URL
- Phone
- Textarea
- Number
- Date
- Time
- Select
- Radio
- Checkbox
- Rating
- Address
- File upload

### Analytics and Operations

- Dashboard cards for forms, submissions, views, and conversion rate.
- Per-user analytics page with CSV export.
- Public form view tracking.
- Submission browsing for published forms.

### Billing

- Optional Stripe checkout flow.
- Billing portal integration.
- Invoice listing.
- Webhook endpoint for subscription sync.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix UI
- Supabase (auth, Postgres, storage)
- Google Gemini
- Stripe
- Framer Motion

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and authentication entry |
| `/dashboard` | Form overview and creation starting point |
| `/editor/[id]` | Visual form editor |
| `/f/[slug]` | Public form page |
| `/submissions/[id]` | Submission viewer |
| `/analytics` | Metrics and export tools |
| `/billing` | Subscription management |
| `/settings` | Account and app settings |

## API Surface

Core API routes live under `app/api/` and cover:

- `app/api/ai/generate/route.ts` - AI form generation
- `app/api/forms/` - form creation, updates, publishing, uploads, submissions, and view tracking
- `app/api/analytics/export/route.ts` - CSV export
- `app/api/billing/` - Stripe checkout, portal, invoices, and sync
- `app/api/stripe/webhook/route.ts` - Stripe webhook handling
- `app/api/telemetry/web-vitals/route.ts` - web vitals collection

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Ahm-edAshraf/FormAi.git
cd FormAi
```

### 2. Install dependencies

`bun` is recommended. This repo is pinned to `Bun 1.3.9` via `packageManager` in `package.json`.

```bash
bun install
```

### 3. Create your local env file

```bash
cp .env.example .env.local
```

Then fill in the required values.

### 4. Start the development server

```bash
bun dev
```

Open `http://localhost:3000`.

## Environment Variables

The app ships with `.env.example`. These are the variables it expects:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser-safe Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side access for privileged operations and webhooks |
| `GEMINI_API_KEY` | Yes | Server-only Gemini API key for AI generation |
| `NEXT_PUBLIC_APP_URL` | Yes | Base app URL for redirects and webhooks |
| `STRIPE_SECRET_KEY` | Optional | Enables Stripe billing flows |
| `STRIPE_WEBHOOK_SECRET` | Optional | Verifies Stripe webhook calls |
| `STRIPE_PRICE_PRO_MONTHLY` | Optional | Monthly Pro plan price ID |
| `DATABASE_URL` | Optional | Direct DB connection if needed |
| `NEXT_PUBLIC_ANALYTICS_ID` | Optional | Analytics integration |
| `EMAIL_SERVER_HOST` | Optional | SMTP host |
| `EMAIL_SERVER_PORT` | Optional | SMTP port |
| `EMAIL_SERVER_USER` | Optional | SMTP username |
| `EMAIL_SERVER_PASSWORD` | Optional | SMTP password |
| `EMAIL_FROM` | Optional | Default sender address |

## Supabase Setup

Minimum setup for local development:

1. Create a Supabase project.
2. Add the three required Supabase environment variables.
3. Create a public storage bucket named `form-uploads`.
4. Make sure the following tables exist:
   - `profiles`
   - `forms`
   - `form_fields`
   - `submissions`
   - `form_views`
   - `ai_generations`
5. Ensure the app can store ownership, status, slugs, timestamps, field metadata, and JSON submission payloads.

The repo does not currently include a full database migration history, so you will need to align your schema with the app's queries and inserts.

## Stripe Setup

Stripe is optional. If you want billing flows locally:

1. Create a product and recurring price in Stripe.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_PRICE_PRO_MONTHLY`.
3. Forward local webhooks:

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

4. Copy the returned signing secret into `STRIPE_WEBHOOK_SECRET`.

## Available Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Start the dev server |
| `bun run build` | Create a production build |
| `bun run start` | Run the production server |
| `bun run lint` | Run ESLint |
| `bun run analyze` | Build with bundle analyzer enabled |
| `bun run lighthouse` | Run the local Lighthouse helper script |

## Project Structure

```text
app/          App Router pages and API routes
components/   UI building blocks and feature components
hooks/        Client hooks
lib/          Data helpers, validators, and integrations
styles/       Global styling
utils/        Supabase client/server helpers
scripts/      Local utility scripts
types/        Shared type declarations
```

## Implementation Notes

- AI generation is validated before a form draft is created.
- Public forms use static caching and revalidation for fast delivery.
- Some analytics and dashboard data paths use cached server reads.
- The editor is usable on mobile, but the product itself recommends desktop for the best editing experience.

## License

MIT. See `LICENSE`.
