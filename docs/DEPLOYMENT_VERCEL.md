# Deploying MinecraftCloud Web Dashboard on Vercel

This guide outlines how to deploy the Next.js 14 Web Dashboard on Vercel.

---

## 1. Prerequisites

1. A [Vercel](https://vercel.com) account.
2. A managed PostgreSQL database (e.g., Neon, Supabase, AWS RDS, or self-hosted PostgreSQL).
3. A running **MinecraftCloud Node Agent** on your persistent Cloud VM/VPS.

---

## 2. Environment Variables Configuration

Set the following environment variables in the **Vercel Project Settings > Environment Variables**:

| Variable | Description | Example Value |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@ep-cool-db.us-east-1.aws.neon.tech/minecraftcloud?sslmode=require` |
| `AUTH_SECRET` | 32+ character random string for JWT sessions | `a8f9c2d1e0b3456789abcdef1234567890abcdef` |
| `NEXTAUTH_URL` | Public URL of your dashboard | `https://dashboard.yourdomain.com` |
| `CLOUD_API_URL` | Public endpoint of your Cloud Node Agent | `https://agent.yourdomain.com:8443` |
| `CLOUD_API_KEY` | Secret token matching your agent configuration | `your-secure-node-agent-secret-token` |
| `PUBLIC_HOST` | Hostname shown to players | `play.yourdomain.com` |
| `NODE_ENV` | Environment identifier | `production` |

---

## 3. Database Migration

Before deploying or immediately after adding the database URL:

```bash
# Push Prisma schema to your remote PostgreSQL
npx prisma db push --schema=packages/database/prisma/schema.prisma

# (Optional) Seed demo administrator and default cross-play server
node packages/database/dist/seed.js
```

---

## 4. Vercel Project Settings

In Vercel:
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

Click **Deploy**.

---

## 5. Custom Domain Configuration

1. In Vercel Project Settings, navigate to **Domains**.
2. Add your custom dashboard domain: `dashboard.yourdomain.com`.
3. Add the CNAME record in your DNS provider:
   - Type: `CNAME`
   - Name: `dashboard`
   - Value: `cname.vercel-dns.com`
