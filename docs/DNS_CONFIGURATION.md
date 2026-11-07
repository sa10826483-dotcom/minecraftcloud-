# Domain & DNS Configuration Guide

This guide explains how to map your custom domain (e.g., `yourdomain.com`) to both the **Vercel Web Dashboard** and the **Persistent Cloud Minecraft Server**.

---

## 1. Architecture Domain Split

- **Web Dashboard**: `dashboard.yourdomain.com` (Hosted on Vercel)
- **Minecraft Java & Bedrock**: `play.yourdomain.com` (Hosted on Cloud Host VM)

---

## 2. DNS Records Setup (Cloudflare / Namecheap / Route53)

| Type | Name / Host | Target / Value | Port / Priority | TTL | Notes |
|---|---|---|---|---|---|
| **A** | `play` | `YOUR_VM_PUBLIC_IPV4` | - | Auto / 300s | Points to persistent cloud host VM |
| **CNAME** | `dashboard` | `cname.vercel-dns.com` | - | Auto | Points to Vercel dashboard deployment |
| **SRV** | `_minecraft._tcp.play` | `play.yourdomain.com` | Priority: `0`<br>Weight: `5`<br>Port: `25565` | Auto | Allows Java players to type just `play.yourdomain.com` |

---

## 3. Important Rules for Cloudflare Users

> [!CAUTION]
> If you are using Cloudflare DNS:
> - **Proxy status (Orange Cloud)** must be **OFF (DNS Only / Grey Cloud)** for the `play` A record.
> - Cloudflare only proxies HTTP/HTTPS traffic on ports 80/443 (unless using Cloudflare Spectrum).
> - Leaving proxy on for Minecraft raw TCP/UDP will block player connections!

---

## 4. Connecting in the Game Client

### Minecraft Java Edition
1. Open Minecraft -> Multiplayer -> Add Server.
2. Server Name: `MinecraftCloud Server`
3. Server Address: `play.yourdomain.com` (or `play.yourdomain.com:25565`)
4. Click **Done** and connect!

### Minecraft Bedrock Edition (iOS, Android, Windows 10/11, Consoles)
1. Open Minecraft -> Play -> Servers Tab -> Scroll down -> **Add Server**.
2. Server Name: `MinecraftCloud Server`
3. Server Address: `play.yourdomain.com`
4. Port: `19132` (Default Bedrock Port)
5. Click **Save** and connect!
