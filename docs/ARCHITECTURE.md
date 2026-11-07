# MinecraftCloud Architecture Specification

## 1. System Overview

**MinecraftCloud** is an enterprise-grade cloud hosting and orchestration platform for Minecraft servers supporting Java Edition, Bedrock Edition, and hybrid Cross-Play on the same world instance.

### Core Architectural Separation

```
                    ┌────────────────────────────────────────┐
                    │               User Browser             │
                    └───────────────────┬────────────────────┘
                                        │ HTTPS / WSS
                                        ▼
                    ┌────────────────────────────────────────┐
                    │          Vercel / Edge Network         │
                    │   Next.js 14 Web Dashboard & REST API  │
                    └───────────┬─────────────────┬──────────┘
                                │                 │
                       Prisma   │                 │ Secure Node API (X-Agent-Secret)
                     PostgreSQL │                 │
                                ▼                 ▼
                    ┌──────────────┐     ┌───────────────────────────────────┐
                    │  Persistent  │     │   Persistent Cloud Host VM / VPS   │
                    │  PostgreSQL  │     │       (Ubuntu Linux / Systemd)    │
                    │   Database   │     │                                   │
                    └──────────────┘     │   ┌───────────────────────────┐   │
                                         │   │  MinecraftCloud Node Agent │   │
                                         │   │  (Crash Detector, RCON,   │   │
                                         │   │   Scheduler, File Sandbox) │   │
                                         │   └─────────────┬─────────────┘   │
                                         │                 │ Docker Socket   │
                                         │                 ▼                 │
                                         │   ┌───────────────────────────┐   │
                                         │   │   Docker Container Engine │   │
                                         │   └─────────────┬─────────────┘   │
                                         │                 │                 │
                                         │   ┌─────────────┴─────────────┐   │
                                         │   ▼                           ▼   │
                                         │ [mc-srv-001]             [mc-srv-002] │
                                         │ Purpur + Geyser          Paper + Java │
                                         │ Port: 25565 TCP          Port: 25566  │
                                         │ Port: 19132 UDP          Port: 19133  │
                                         └───────────────────────────────────┘
```

---

## 2. Why Minecraft Does NOT Run on Vercel

Minecraft server processes require:
1. **Persistent Execution**: Minecraft game ticks run at a constant 20.0 TPS (Ticks Per Second) 24 hours a day, 7 days a week. Serverless platforms (e.g., AWS Lambda, Vercel Serverless Functions) impose a hard 10–60 second maximum execution timeout.
2. **Stateful In-Memory World State**: Chunks, mob pathfinding, entity AI, inventory tables, and redstone ticks reside in JVM heap memory.
3. **Raw TCP and UDP Sockets**:
   - Java Edition requires a long-lived TCP connection on port `25565`.
   - Bedrock Edition requires raw UDP RakNet packets on port `19132`.
   Serverless HTTP gateways do not support raw TCP/UDP listener binding.

**The Solution:**
- **Vercel** hosts the modern Next.js 14 web dashboard, serverless REST API, user authentication, and client state.
- A **Persistent Cloud VM / VPS** runs the dedicated Docker Engine, the Minecraft containers, and the **MinecraftCloud Node Agent** daemon.

---

## 3. Java + Bedrock Cross-Play Engine

Cross-play enables Java players (PC/Mac/Linux) and Bedrock players (iOS, Android, Windows 10/11, Xbox, PlayStation, Nintendo Switch) to play simultaneously on the same world.

### Translation Flow

```
[Java Client]    ---> TCP 25565 ---> [Minecraft Java Engine (Purpur 1.21.1)]
                                                  ▲
                                                  │ Local Pipeline
[Bedrock Client] ---> UDP 19132 ---> [GeyserMC] -─┘ (Packet Translation)
                                         ▲
                                         │
                                   [Floodgate] (Skin & UUID Encryption Bridge)
```

1. **Purpur / Paper**: The high-performance Java engine that manages world logic, tick updates, and plugins.
2. **GeyserMC**: A protocol translator that converts Bedrock RakNet/UDP packets into Java Netty/TCP packets on the fly.
3. **Floodgate**: An encryption and authentication layer that allows Bedrock players to authenticate via their Microsoft/Xbox accounts without requiring a second purchased Minecraft Java Edition license.

---

## 4. Container Isolation & Security

Each Minecraft server is deployed in an isolated Docker container with:
- Dedicated CPU quota (`NanoCpus`)
- Hard RAM ceiling (`Memory` limit + G1GC JVM parameters)
- Isolated volume mounts strictly located at `/data/servers/{serverId}`
- Dedicated network port bindings
- Non-root UID/GID (`1000:1000`) execution

---

## 5. Self-Healing Crash Detection & 24/7 Uptime

The Node Agent's **CrashDetector** monitors container exit codes and health status:
- If a container exits unexpectedly (exit code != 0):
  1. Capture the last 200 console lines.
  2. Write an incident report to `/data/servers/{serverId}/crash-reports/crash-{timestamp}.txt`.
  3. Check crash count against `maxCrashRetries` (default: 3).
  4. If retries <= max, wait 10 seconds and restart the container.
  5. If crash loop detected (retries > max), halt auto-restart, set server state to `CRASHED`, and alert administrators in the dashboard.
