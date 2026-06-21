<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This is a Next.js 16 (Turbopack) + Prisma app. Local dev uses **SQLite** (`prisma/schema.prisma` provider is already `sqlite`); the Docker `postgres` service in `docker-compose.yml` is only for production-style setups and is **not** needed for local development.

Standard commands live in `package.json` and `README.md` (`npm run dev`, `npm run lint`, `npm run build`, `npm run db:push`, `npm run db:seed`). The update script already runs `npm install` (which generates the Prisma client via `postinstall`).

Non-obvious caveats:
- **`.env` and `prisma/dev.db` are gitignored.** A working `.env` (copied from `.env.example`) and a pushed/seeded `prisma/dev.db` are required for the app to function. If either is missing, run: `cp .env.example .env`, then `npm run db:push`, then `npm run db:seed`.
- **Payments / dev mode:** the default PayFast *sandbox* credentials in `.env.example` produce a `400 Bad Request — Generated signature does not match submitted signature` at checkout, so a real booking cannot complete via the gateway. To test the booking flow end-to-end, run in **dev mode** by leaving `PAYFAST_MERCHANT_ID` / `PAYFAST_MERCHANT_KEY` / `PAYFAST_PASSPHRASE` unset (commented out) in `.env` — bookings then auto-confirm and emails log to the console (see README "dev mode").
- **Seeded availability slots are date-relative:** `prisma/seed.ts` only generates slots for the 14 days following the seed run, and it skips re-creating slots if any already exist. If a persisted `prisma/dev.db` has only past-dated slots, delete `prisma/dev.db` and re-run `npm run db:push && npm run db:seed` to get fresh future slots.
- Demo logins (from seed): admin `admin@example.com` / `admin123`, customer `customer@example.com` / `customer123`.
- Changing `.env` requires restarting `npm run dev` to take effect.
