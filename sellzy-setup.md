# Sellzy — Setup & Deployment Guide

Welcome! This document walks you through everything you need to do, from a freshly downloaded zip to a live production deployment.

> **TL;DR (already a Node/MongoDB pro?)** Skip to [§3 Quick install](#3-quick-install), [§4 Environment files](#4-environment-files), [§5 Seed demo content](#5-seed-demo-content), [§6 Run the apps](#6-run-the-apps).

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Folder layout](#2-folder-layout)
3. [Quick install](#3-quick-install)
4. [Environment files](#4-environment-files)
   - [4.1 API (`apps/api/.env`)](#41-api-apps-apienv)
   - [4.2 Web storefront (`apps/web/.env`)](#42-web-storefront-apps-webenv)
   - [4.3 Admin dashboard (`apps/admin/.env`)](#43-admin-dashboard-apps-adminenv)
5. [Seed demo content](#5-seed-demo-content)
6. [Run the apps](#6-run-the-apps)
7. [Common workflows](#7-common-workflows)
8. [External services & where to get the keys](#8-external-services--where-to-get-the-keys)
9. [Deploying with GitHub Actions](#9-deploying-with-github-actions)
10. [Manual deployment (without CI)](#10-manual-deployment-without-ci)
11. [Troubleshooting](#11-troubleshooting)
12. [Item support](#12-item-support)

---

## 1. Prerequisites

| Tool    | Minimum version | Install                                                            |
| ------- | --------------- | ------------------------------------------------------------------ |
| Node.js | 18.17           | https://nodejs.org/ (LTS recommended) or `nvm install --lts`       |
| pnpm    | 10.0            | `npm install -g pnpm` or https://pnpm.io/installation              |
| MongoDB | 6.x             | A free Atlas cluster: https://www.mongodb.com/cloud/atlas/register |
| Git     | any             | https://git-scm.com/downloads                                      |

Optional but recommended:

| Tool            | Why                                                 | Where                                    |
| --------------- | --------------------------------------------------- | ---------------------------------------- |
| Stripe CLI      | Forwards Stripe webhooks to your local API in dev   | https://stripe.com/docs/stripe-cli       |
| Vercel CLI      | Local previews + GitHub-Actions-free manual deploys | `npm i -g vercel`                        |
| MongoDB Compass | GUI to inspect collections                          | https://www.mongodb.com/products/compass |

## 2. Folder layout

```
sellzy-ecommerce/
├── apps/
│   ├── web/                    # Next.js storefront (port 3000)
│   ├── admin/                  # Vite + React admin (port 5173)
│   └── api/                    # Express + MongoDB API (port 8000)
├── packages/                   # Shared internal packages (ui, eslint, tsconfig)
├── data/seed/                  # JSON snapshot of public catalogue collections
├── documentation/              # Static online docs (HTML/CSS) for buyers
├── _example.github/            # CI + deploy pipelines (rename → .github to activate)
├── README.md                   # Project overview
├── sellzy-setup.md             # ← you are here
├── diagram.md                  # Architecture & data-flow diagrams
├── Features.md                 # Full feature list
├── Technology.md               # Stack & tooling rationale
├── package.json                # Workspace root scripts
├── pnpm-workspace.yaml         # Defines apps/* + packages/*
└── turbo.json                  # Turborepo task graph
```

## 3. Quick install

```bash
# 1. Unzip the package and cd into it
cd sellzy-ecommerce

# 2. Install every workspace's dependencies in one pass
pnpm install
```

`pnpm install` reads `pnpm-workspace.yaml`, installs every app + package, and links them via the symlinked `node_modules` store. Total install time on a clean machine: ~1–2 minutes.

## 4. Environment files

Each app has a `.env.example` template. **Copy them, never edit the templates directly:**

```bash
cp apps/api/.env.example   apps/api/.env
cp apps/web/.env.example   apps/web/.env
cp apps/admin/.env.example apps/admin/.env
```

Open each new `.env` file and replace the placeholders. **Every group of variables in the templates has a comment block above it telling you exactly which dashboard URL to grab the values from.** Below is a quick map of what each app needs.

### 4.1 API (`apps/api/.env`)

| Group                      | Required?    | Purpose                                        |
| -------------------------- | ------------ | ---------------------------------------------- |
| `MONGO_URI`                | ✅           | Atlas connection string                        |
| `JWT_SECRET`               | ✅           | Signs auth tokens (any long random string)     |
| `STRIPE_*`                 | optional     | Card checkout                                  |
| `IMAGEKIT_*`               | ✅ (default) | Media storage. ImageKit free tier is enough.   |
| `CLOUDINARY_*`             | optional     | Alternative media provider                     |
| `AWS_*`                    | optional     | Alternative media provider                     |
| `SMTP_*`                   | ✅           | Transactional e-mail (signup, order, password) |
| `SSLCOMMERZ_*`             | optional     | Bangladesh payment gateway                     |
| `FIREBASE_SERVICE_ACCOUNT` | optional     | Verifies Google OAuth tokens                   |

> Generate `JWT_SECRET` with:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

### 4.2 Web storefront (`apps/web/.env`)

| Group                    | Required? | Purpose                                 |
| ------------------------ | --------- | --------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | ✅        | Where the storefront calls the API      |
| `NEXT_PUBLIC_ADMIN_URL`  | optional  | Cross-link to admin from the storefront |
| `NEXT_PUBLIC_FIREBASE_*` | optional  | Google OAuth login on the storefront    |

### 4.3 Admin dashboard (`apps/admin/.env`)

| Group                      | Required? | Purpose                         |
| -------------------------- | --------- | ------------------------------- |
| `VITE_NEXT_PUBLIC_API_URL` | ✅        | Where the admin calls the API   |
| `VITE_FIREBASE_*`          | optional  | Google OAuth login on the admin |
| `VITE_APP_ENV`             | optional  | `development` / `production`    |

> ⚠️ **Never commit your real `.env` files.** The `.gitignore` is configured to track only `*.env.example`. If you cloned from a fork that already had real `.env`s checked in, **rotate every secret in there before going live.**

## 5. Seed demo content

The repository ships with a JSON snapshot of every public catalogue collection (products, brands, categories, banners, blog posts, configs, etc.) under `data/seed/`. Re-import it into any MongoDB target with:

```bash
pnpm seed
```

The script in [`apps/api/scripts/importSeed.ts`](./apps/api/scripts/importSeed.ts) is **upsert-only**:

- It matches each document by `_id` and `$set`s the fields. No `delete`. No `drop`.
- It explicitly **skips user-flow collections**: `users`, `orders`, `carts`, `abandonedcarts`, `addresses`, `reviews`, `customerreviews`, `notifications`, `vendors`. Even if a stale JSON for one of those exists in `data/seed/`, the importer ignores it.

You can run `pnpm seed` against a production database that already has live customers — none of their data will be touched.

To **refresh the snapshot** from your own production database (after editing catalogue content from the admin):

```bash
pnpm export-seed
```

This exports every non-user-flow collection back into `data/seed/*.json`. Commit the result and ship.

## 6. Run the apps

In one terminal, from the repository root:

```bash
pnpm dev
```

Turborepo runs all three apps in parallel:

| App        | URL                            | First-load credentials                                                                              |
| ---------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| Storefront | http://localhost:3000          | Anonymous browsing; sign up to test checkout                                                        |
| Admin      | http://localhost:5173          | Create your first admin via `apps/api/generate_token.ts` (see [§7.1](#71-creating-the-first-admin)) |
| API        | http://localhost:8000          | Health check at `/api/health`                                                                       |
| API docs   | http://localhost:8000/api/docs | Swagger UI                                                                                          |

Run a single app instead:

```bash
pnpm dev:api    # only the backend
pnpm dev:web    # only the storefront
pnpm dev:admin  # only the admin dashboard
```

## 7. Common workflows

### 7.1 Creating the first admin

After seeding, sign up a normal user from the storefront, then promote them to admin:

```bash
# Run from apps/api with your .env loaded
cd apps/api
pnpm tsx generate_token.ts admin you@example.com
```

(Inspect `apps/api/generate_token.ts` for full options — it can also create employee/vendor roles.)

### 7.2 Stripe webhooks in development

Stripe events (payment succeeded / refunded / failed) hit `POST /api/payments/webhook`. To forward your test events to localhost:

```bash
# In a separate terminal
stripe listen --forward-to localhost:8000/api/payments/webhook
```

Copy the `whsec_…` value Stripe prints into `apps/api/.env` as `STRIPE_WEBHOOK_SECRET`.

### 7.3 Switching media provider

Set `DEFAULT_UPLOAD_PROVIDER` in `apps/api/.env` to one of `imagekit`, `cloudinary`, or `s3`. Make sure the corresponding credential block is filled in.

### 7.4 Resetting demo content

```bash
pnpm seed
```

The same command is safe to run repeatedly — it upserts.

## 8. External services & where to get the keys

| Service        | Free tier?    | Where to grab keys                                                                |
| -------------- | ------------- | --------------------------------------------------------------------------------- |
| MongoDB Atlas  | ✅            | https://www.mongodb.com/cloud/atlas → Database Access + Network Access + Connect  |
| Stripe         | ✅            | https://dashboard.stripe.com/test/apikeys                                         |
| Stripe Webhook | ✅            | `stripe listen ...` for local; **Webhooks → Add endpoint** for production         |
| ImageKit       | ✅            | https://imagekit.io/dashboard/developer/api-keys                                  |
| Cloudinary     | ✅            | https://console.cloudinary.com/settings/api-keys                                  |
| AWS S3         | 12-month free | https://console.aws.amazon.com/iam/home → Users → Add user → `AmazonS3FullAccess` |
| Firebase       | ✅            | https://console.firebase.google.com/ → Project Settings → Service Accounts        |
| SMTP (Gmail)   | ✅            | https://myaccount.google.com/apppasswords (requires 2FA enabled)                  |
| SSLCommerz     | ✅ sandbox    | https://developer.sslcommerz.com/                                                 |
| Vercel         | ✅            | https://vercel.com/account/tokens                                                 |

## 9. Deploying with GitHub Actions

The deploy workflow at [`_example.github/workflows/deploy.yml`](./_example.github/workflows/deploy.yml) provisions all three apps to Vercel on every push to `main`.

It's intentionally shipped under `_example.github/` so GitHub does **not** auto-run it the moment a buyer pushes the project. Once your secrets are in place (steps below), enable both workflows with a single rename:

```bash
mv _example.github .github
git add .github && git rm -r _example.github
git commit -m "chore: enable github actions"
```

### 9.1 One-time setup

**Step 1 — Create three Vercel projects.** Easiest way:

```bash
npm i -g vercel
cd apps/web   && vercel link
cd apps/admin && vercel link
cd apps/api   && vercel link
```

Each `vercel link` writes a `.vercel/project.json` containing `orgId` and `projectId`.

**Step 2 — Collect your IDs and a token.**

| Value                     | Where to find it                                |
| ------------------------- | ----------------------------------------------- |
| `VERCEL_TOKEN`            | https://vercel.com/account/tokens (Create new)  |
| `VERCEL_ORG_ID`           | `apps/web/.vercel/project.json` → `orgId`       |
| `VERCEL_PROJECT_ID_WEB`   | `apps/web/.vercel/project.json` → `projectId`   |
| `VERCEL_PROJECT_ID_ADMIN` | `apps/admin/.vercel/project.json` → `projectId` |
| `VERCEL_PROJECT_ID_API`   | `apps/api/.vercel/project.json` → `projectId`   |

**Step 3 — Add them as GitHub Secrets.**

In your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, add each of the five values above.

**Step 4 — Add app environment variables to each Vercel project.**

Open https://vercel.com/dashboard → pick the project → **Settings → Environment Variables**. Copy every variable from the matching `.env.example` (with real values) into the **Production** environment.

**Step 5 — Push to `main`.**

That's it. The workflow:

1. Spins up an Ubuntu runner.
2. Installs pnpm + Node 20.
3. `pnpm install --frozen-lockfile`.
4. For each app in parallel: `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`.

### 9.2 What CI runs on PRs

[`_example.github/workflows/ci.yml`](./_example.github/workflows/ci.yml) runs lint + type-check on every push to a non-main branch and every PR targeting `main`. It does not deploy. The same rename activates it — both workflows live under `_example.github/workflows/` and both go live the instant the folder is renamed to `.github`.

## 10. Manual deployment (without CI)

If you'd rather avoid GitHub Actions:

```bash
npm i -g vercel
vercel login

# From each app:
cd apps/web   && vercel --prod
cd apps/admin && vercel --prod
cd apps/api   && vercel --prod
```

Vercel will detect the framework, ask for the Build Command (`pnpm build`) and Output Directory (`.next` for web, `dist` for admin, default for api), then deploy.

> The API uses `apps/api/vercel.json` to expose the Express app as a serverless function. No additional config required.

## 11. Troubleshooting

| Symptom                                          | Likely cause / fix                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `MongoServerError: bad auth`                     | Wrong username/password in `MONGO_URI`. Re-issue the password in Atlas.             |
| Storefront can't reach the API in production     | `NEXT_PUBLIC_API_URL` still points to `localhost`. Update on Vercel and redeploy.   |
| Stripe webhook 400 errors                        | `STRIPE_WEBHOOK_SECRET` mismatch or body parsed before the webhook route.           |
| Admin login redirects in a loop                  | Token stored under a different domain. Make sure admin and api share the same root. |
| `PayloadTooLargeError: request entity too large` | Large image upload. The API caps payloads at 15 MB; tune in `apps/api/server.ts`.   |
| Seed runs but nothing appears                    | You're connected to a different database than the one the apps point at.            |
| Vercel "Missing build script"                    | Confirm `pnpm install --frozen-lockfile` ran, and Build Command is `pnpm build`.    |

Still stuck? See [§12 Item support](#12-item-support).

## 12. Item support

- **ThemeForest Item Support:** included for 6 months from your purchase date (renewable). Open a request from the item page → "Get Support".
- **What support covers:** install help, environment-config issues, and bug fixes in the unmodified template.
- **What it does not cover:** custom feature work, third-party plugin integrations, or hosting administration. (Those are available as paid customisations — contact the author through the ThemeForest item page.)

Happy selling! 🚀
