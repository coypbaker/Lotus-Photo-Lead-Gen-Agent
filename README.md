# PhotoLeadAgent

🤖 Autonomous AI lead generation for wedding & portrait photographers.

## Features

- **🔍 Automated Lead Discovery** - Finds venues, planners, and event businesses via Google Places API
- **📊 Lead Scoring** - Rule-based scoring system prioritizes high-quality leads
- **✉️ Email Outreach** - Personalized outreach emails via SendGrid
- **🤖 Autonomous Mode** - Daily cron job auto-finds and contacts leads
- **💳 Subscription Plans** - Free, Pro ($29/mo), Premium ($79/mo) via Stripe
- **📱 Mobile Responsive** - Works great on all devices

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe Subscriptions
- **Email**: SendGrid
- **Lead Data**: Google Places API
- **Deployment**: Vercel (with Cron)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

```bash
cp env.template .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for cron jobs)
- `STRIPE_SECRET_KEY` / `STRIPE_PRO_PRICE_ID` / `STRIPE_PREMIUM_PRICE_ID`
- `GOOGLE_PLACES_API_KEY`
- `SENDGRID_API_KEY` / `SENDGRID_FROM_EMAIL`
- `CRON_SECRET` (random string for securing cron endpoint)

### 3. Supabase Setup

Run these migrations in Supabase SQL Editor:
- `supabase/migrations/001_create_user_settings.sql`
- `supabase/migrations/002_add_subscription_fields.sql`
- `supabase/migrations/003_create_leads_table.sql`
- `supabase/migrations/004_add_autonomous_mode.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── cron/daily-leads/   # Daily autonomous cron job
│   │   ├── leads/generate/     # Manual lead generation
│   │   ├── leads/send-outreach/# Send outreach emails
│   │   └── stripe/             # Stripe checkout/webhook/portal
│   ├── dashboard/
│   │   ├── billing/            # Subscription management
│   │   └── settings/           # User preferences
│   ├── login/ & signup/        # Auth pages
│   └── page.tsx                # Marketing home
├── components/
│   ├── LeadsPanel.tsx          # Leads table with sorting/filtering
│   └── Navbar.tsx              # Navigation
└── lib/
    ├── emailTemplates.ts       # Outreach email templates
    ├── leadScoring.ts          # Lead scoring engine
    ├── plans.ts                # Subscription plans config
    ├── stripe.ts               # Stripe client
    └── supabase/               # Supabase clients
```

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

The `vercel.json` configures a daily cron job at 9 AM UTC for autonomous mode.

## Subscription Plans

| Plan | Price | Leads/Month | Features |
|------|-------|-------------|----------|
| Free | $0 | 10 | Basic scoring, Email notifications |
| Pro | $29 | 200 | Priority scanning, Outreach templates |
| Premium | $79 | Unlimited | Multi-location, Priority support |

## License

MIT
