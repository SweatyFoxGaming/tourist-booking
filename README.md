# Tourist Booking

A full-stack tourist activities booking website built with Next.js, PostgreSQL/SQLite, PayFast, and an admin theme builder.

## Features

- **WhatsApp integration** — click-to-chat button, optional booking confirmations & admin alerts via Business API
- **Admin analytics** — revenue, trends, top activities, booking status breakdown
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

### Languages

The site detects the browser language automatically on each visit. Supported locales:

`en`, `af`, `fr`, `de`, `es`, `pt`, `nl`, `zh`, `ja`, `ar`

Translation files live in `messages/`. Edit `messages/en.json` as the source of truth, then update other locales or run `node scripts/generate-locales.mjs` after extending the script catalog.

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
| `PAYFAST_MERCHANT_ID` / `PAYFAST_MERCHANT_KEY` | PayFast merchant credentials |
| `PAYFAST_PASSPHRASE` | PayFast salt passphrase (required for live; set in sandbox too) |
| `PAYFAST_SANDBOX` | `true` (default) for sandbox, `false` for live |
| `NEXT_PUBLIC_CURRENCY` | Display currency (default `ZAR`) |
| `RESEND_*` | Booking & contact emails |
| `CONTACT_EMAIL` | Where contact form submissions go |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Public WhatsApp number for chat button (country code, no `+`) |
| `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | Meta WhatsApp Business Cloud API (automated messages) |
| `WHATSAPP_ADMIN_NUMBER` | Admin phone for new booking & contact alerts |

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

### 3. PayFast ITN (Instant Transaction Notification)

After deploy, PayFast will POST payment confirmations to:

- URL: `https://your-domain.com/api/payfast/notify`

Set this as the **notify URL** in your PayFast dashboard, or it is sent automatically per checkout.

For local ITN testing, expose your dev server with [ngrok](https://ngrok.com) and set `NEXT_PUBLIC_APP_URL` to the public URL.

Sandbox credentials and test cards: [PayFast Sandbox](https://sandbox.payfast.co.za)

Without PayFast/Resend configured, the app runs in **dev mode** — bookings auto-confirm and emails log to the console.

### 4. Resend Email

1. Create a [Resend](https://resend.com) account
2. Verify your domain
3. Set `RESEND_FROM_EMAIL` and `RESEND_API_KEY`

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
lib/                 # Auth, db, email, payfast, booking helpers
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

Next.js 16 · React · Tailwind CSS · Prisma · NextAuth · PayFast · Resend
