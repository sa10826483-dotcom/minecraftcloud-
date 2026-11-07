# Cloud VM & Node Agent Deployment Guide

This guide walks through configuring an **Ubuntu 22.04 or 24.04 LTS Cloud VM** (Hetzner, OVH, DigitalOcean, Linode, AWS EC2, GCP Compute Engine) for persistent, 24/7 Minecraft server hosting.

---

## 1. Recommended Host Hardware

| Server Tier | vCPUs | RAM | NVMe SSD | Network Bandwidth | Capacity |
|---|---|---|---|---|---|
| **Starter** | 4 Cores | 16 GB | 100 GB | 1 Gbps | 2–3 active servers |
| **Production** | 8 Cores | 32 GB | 250 GB | 1 Gbps | 6–8 active servers |
| **Enterprise** | 16 Cores | 64 GB | 500 GB | 1 Gbps | 15–20 active servers |

---

## 2. Server Initial Setup & Docker Installation

SSH into your Ubuntu server as `root`:

```bash
# 1. Update system packages
apt update && apt upgrade -y

# 2. Install essential dependencies
apt install -y curl wget git jq ufw build-essential tar

# 3. Install official Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Enable Docker service on boot
systemctl enable --now docker
```

---

## 3. Firewall Configuration (UFW)

Open required ports for the Node Agent, Web reverse proxy, and Minecraft TCP/UDP traffic:

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS for Nginx
ufw allow 80/tcp
ufw allow 443/tcp

# Allow MinecraftCloud Node Agent REST & WebSocket API
ufw allow 8443/tcp

# Allow Java Edition Minecraft Ports (Range: 25565 - 25600)
ufw allow 25565:25600/tcp

# Allow Bedrock Edition UDP RakNet Ports (Range: 19132 - 19160)
ufw allow 19132:19160/udp

# Enable firewall
ufw enable
```

---

## 4. Deploying the Node Agent with Docker Compose

1. Clone or upload the repository to `/opt/minecraftcloud`:

```bash
git clone https://github.com/your-org/minecraftcloud.git /opt/minecraftcloud
cd /opt/minecraftcloud
```

2. Copy the environment configuration:

```bash
cp .env.example .env
nano .env
```

Set:
- `AGENT_SECRET`: A secure token (e.g., `openssl rand -hex 32`)
- `PUBLIC_HOST`: Your server domain (e.g., `play.yourdomain.com`)
- `POSTGRES_PASSWORD`: A strong database password

3. Launch the persistent infrastructure stack:

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

4. Verify service status:

```bash
docker ps
curl http://localhost:8443/health
```

Expected output:
```json
{"status":"healthy","version":"1.0.0","platform":"linux","activeSchedules":2}
```

---

## 5. Running the Agent Directly with Systemd (Alternative to Compose)

For bare-metal or native host execution:

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Build agent
npm install
npm run build:packages

# Install systemd unit
cp infrastructure/agent/systemd/minecraftcloud-agent.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now minecraftcloud-agent
```
