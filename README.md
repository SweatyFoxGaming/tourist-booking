# Tourist Booking

A full-stack tourist activities booking website built with Next.js, PostgreSQL/SQLite, Stripe, and an admin theme builder.

## Features

- **Guest checkout** — book without creating an account
- **Find booking** — look up or cancel with email + reference (`/booking/lookup`)
- **Guest reviews** — review link sent in confirmation email
- **Per-activity cancellation policies** — configurable in admin
- **Admin dashboard** — activities, slots, bookings, reviews, theme builder
- **Public pages** — Home, Activities, About, Contact, Terms, Privacy

## Quick Start (Local)

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@example.com      | admin123     |
| Customer | customer@example.com   | customer123  |

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite locally (`file:./dev.db`) or PostgreSQL in production |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Session encryption |
| `NEXT_PUBLIC_APP_URL` | Public site URL (emails, sitemap) |
| `STRIPE_*` | Payment processing |
| `RESEND_*` | Booking & contact emails |
| `CONTACT_EMAIL` | Where contact form submissions go |

## Production Deployment (Vercel + Neon)

### 1. Database

Create a free [Neon](https://neon.tech) PostgreSQL database. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run:

```bash
npx prisma db push
npm run db:seed
```

Set `DATABASE_URL` in Vercel to your Neon connection string.

### 2. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all environment variables from `.env.example` in the Vercel dashboard.

### 3. Stripe Webhooks

After deploy, add a webhook in Stripe Dashboard:

- URL: `https://your-domain.com/api/stripe/webhook`
- Events: `checkout.session.completed`
- Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

For local testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 4. Resend Email

1. Create a [Resend](https://resend.com) account
2. Verify your domain
3. Set `RESEND_FROM_EMAIL` and `RESEND_API_KEY`

Without Stripe/Resend, the app runs in **dev mode** — bookings auto-confirm and emails log to the console.

## Docker PostgreSQL (Local)

```bash
docker compose up -d
# Set DATABASE_URL=postgresql://tourist:tourist@localhost:5432/tourist_booking
# Switch schema provider to postgresql, then npm run db:push && npm run db:seed
```

## Project Structure

```
app/
  (public)/          # Home, activities, about, contact, terms, privacy
  booking/lookup/    # Guest booking lookup & cancel
  review/[token]/    # Guest review via email link
  admin/             # Admin dashboard
  api/               # REST API routes
components/          # UI, layout, admin, booking
lib/                 # Auth, db, email, stripe, booking helpers
prisma/              # Schema & seed
```

## Admin Panel

Visit `/admin` when logged in as admin:

- **Activities** — CRUD, image upload, cancellation policy
- **Slots** — availability calendar
- **Bookings** — view and cancel
- **Reviews** — moderate
- **Theme** — customize site colors, fonts, logo

## Tech Stack

Next.js 16 · React · Tailwind CSS · Prisma · NextAuth · Stripe · Resend
