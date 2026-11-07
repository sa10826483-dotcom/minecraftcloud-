# MinecraftCloud Platform

> **Production-Ready Minecraft Cloud Hosting & Orchestration Platform**  
> Supporting Minecraft Java Edition, Bedrock Edition, and Java + Bedrock Cross-Play on persistent cloud compute.

---

## 🚀 Key Highlights

- **Vercel + Persistent Cloud Separation**: The modern Next.js 14 Web Dashboard and REST API deploy seamlessly on **Vercel**, while persistent Minecraft servers, Docker containers, and the **Node Agent** run 24/7 on persistent cloud infrastructure.
- **Java + Bedrock Cross-Play**: Automatic integration of **Paper/Purpur**, **GeyserMC**, and **Floodgate 2.x**. PC Java players (`25565/tcp`) and Bedrock players (`19132/udp` on iOS, Android, Xbox, PlayStation, Switch) play simultaneously on the same world.
- **24/7 Self-Healing Node Agent**: Automated crash detection, crash loop prevention, auto-reboot policy, and incident log generation.
- **Interactive Live Terminal**: Low-latency Minecraft console over WebSockets with command history (up/down arrow keys), log search, and execution without exposing raw host shell access.
- **Sandboxed Web File Manager**: Directory navigation, file upload/download, in-browser text editing, and strict path traversal protection.
- **Multi-Scope Backup Engine**: Full server, world-only, or config-only automated backups with checksum verification and one-click restoration.
- **Persistent Cron Scheduler**: Independent persistent job scheduler for nightly backups, automated restarts, and maintenance announcements.
- **Enterprise Security & RBAC**: PBKDF2 password hashing with unique salt, signed JWT sessions, and role tiers (`OWNER`, `ADMIN`, `MODERATOR`, `VIEWER`).

---

## 📁 Repository Structure

```
.
├── apps/
│   └── web/                                # Next.js 14 App Router Dashboard & API Gateway
│       ├── app/
│       │   ├── (auth)/                     # Login, Register, Forgot Password
│       │   ├── dashboard/                  # Server List, Creation Wizard, Metrics
│       │   │   └── servers/[id]/           # Overview, Console, Players, Files, World,
│       │   │                               # Backups, Plugins, Mods, Schedules, Network,
│       │   │                               # Performance, Settings, Logs, Security
│       │   ├── admin/                      # Global Admin Tenant & Node Governance
│       │   └── api/                        # Next.js Serverless REST API Endpoints
│       ├── components/                     # Reusable UI & Dashboard components
│       └── lib/                            # Auth, Crypto, Validations, Prisma Client
├── packages/
│   ├── database/                           # Prisma ORM Schema, Client & Seed Scripts
│   ├── minecraft/                          # RCON Client, Geyser, Floodgate, Compatibility
│   ├── auth/                               # PBKDF2 Hashing & JWT Session Management
│   ├── api/                                # Shared TypeScript API DTOs & Contracts
│   └── ui/                                 # Shared UI tokens & styling utilities
├── infrastructure/
│   ├── agent/                              # Persistent Cloud Host Agent Daemon & WebSocket Hub
│   ├── docker/                             # docker-compose.yml, Dockerfile.agent, Dockerfile.minecraft
│   ├── nginx/                              # Nginx reverse proxy configurations
│   └── monitoring/                         # Prometheus scraping configuration
├── docs/                                   # Architecture, Vercel, Cloud VM, DNS, and Security guides
├── .env.example                            # Comprehensive environment variables template
└── package.json                            # Root Monorepo configuration (npm workspaces)
```

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes, Node.js 20 LTS, Express, WebSockets (`ws`)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Minecraft Engine**: Purpur / Paper 1.21.1 with OpenJDK 21 LTS
- **Cross-Play Bridge**: GeyserMC + Floodgate 2.x
- **Container Isolation**: Docker Engine, Docker Compose, Linux cgroups

---

## ⚡ Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: v20+ LTS installed
- **npm**: v10+

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-org/minecraftcloud.git
cd minecraftcloud
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
cp .env.example apps/web/.env
```

### 4. Generate Prisma Client & Build Packages
```bash
npm run prisma:generate
npm run build:packages
```

### 5. Start the Web Dashboard
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

Demo Credentials:
- **Server Owner**: `owner@minecraftcloud.net` / `Minecraft2026!`
- **Global Admin**: `admin@minecraftcloud.net` / `AdminPass123!`

---

## 🌐 Deploying to Vercel & Cloud Infrastructure

For complete production deployment guides, see the `/docs` directory:

1. [System Architecture Guide](docs/ARCHITECTURE.md)
2. [Vercel Deployment Guide](docs/DEPLOYMENT_VERCEL.md)
3. [Cloud VM & Docker Setup Guide](docs/DEPLOYMENT_CLOUD_VM.md)
4. [Java + Bedrock Cross-Play Guide](docs/CROSSPLAY_GEYSER_SETUP.md)
5. [Domain & DNS Configuration](docs/DNS_CONFIGURATION.md)
6. [Security Hardening Checklist](docs/SECURITY_CHECKLIST.md)
7. [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

---

## 🧪 Build & Verification

To verify full monorepo type-checking, bundle creation, and compilation:

```bash
npm run build
```

Both packages, the persistent agent daemon, and the Next.js production build will compile with **0 errors**.
