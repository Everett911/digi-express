# Digi-Express

A full-stack fashion and homeware store built with the Next.js App Router.
Shoppers can browse and search the catalogue, pay with Stripe and track
their orders. Admins manage products, orders and customers from a dashboard.

## Features

- **Catalogue and search**: filter by size, colour, brand, price and
  department, sort results, and get spelling-tolerant search ("snekers" finds
  sneakers). Filter options and counts come from the database.
- **Accounts**: email and password sign-up with email verification, plus
  Google and GitHub sign-in (Better Auth).
- **Cart and checkout**: one cart line per product variant (size and colour),
  a delivery option per line, and payment with Stripe Payment Elements. Totals
  are always calculated on the server from database prices.
- **Orders**: a Stripe webhook creates the order and emails a confirmation
  (Resend). Customers can view their orders and their status, and buy an item
  again.
- **Admin dashboard** (`/admin`): sales overview, product create, edit and
  hide (photos stored in Vercel Blob), order status updates and customer
  management. Every admin server action checks the session's role itself.

## Tech stack

Next.js 16 (App Router, React 19, React Compiler) · TypeScript · PostgreSQL
with Prisma 7 · Better Auth · Stripe · Resend · Zod · Radix Themes ·
Vitest

## Getting started

Requires Node.js 20+ and a PostgreSQL database.

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npx prisma db push           # create the tables
npx prisma db seed           # add the delivery options
npm run dev
```

Open <http://localhost:3000>.

To try the admin dashboard, sign up, then set your user's `role` to `admin` in
the database. The role can't be set through the app.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret used to sign sessions |
| `BETTER_AUTH_URL` | Site URL, for example `http://localhost:3000` |
| `NEXT_PUBLIC_SERVER_URL` | Site URL Stripe returns to after payment |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub sign-in |
| `STRIPE_SECRET_KEY` | Stripe API key (use a test key) |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET_KEY` | Signing secret for `/api/webhooks/stripe` |
| `RESEND_API_KEY` | Sends verification and order emails (optional locally: emails are skipped) |
| `EMAIL_FROM` | Sender address, for example `Digi Express <orders@example.com>` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store for product photos uploaded in the admin |

To receive Stripe webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Pay with the test card `4242 4242 4242 4242` and any future expiry date and CVC.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run lint` | Run ESLint |
| `npm test` | Run the unit tests (Vitest) |

## Project structure

```
lib/                 server code: auth, Prisma, Stripe, email, data access
  db/                queries and server actions (cart, products, orders)
  checkout.ts        cart totals and order line building
prisma/              schema and seed script
src/app/(main)/      storefront: home, products, checkout, orders, sign-in
src/app/admin/       admin dashboard and its server actions
src/app/api/         Better Auth routes and the Stripe webhook
src/components/      shared UI
src/schemas/         Zod schemas and shared types
```
