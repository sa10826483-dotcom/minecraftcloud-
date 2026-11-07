# Troubleshooting & Diagnostic Guide

## 1. Bedrock Players Cannot Connect

### Symptoms
Bedrock client shows *"Unable to connect to world"* or *"Server not responding"*.

### Diagnostics
1. Check if the server software is Purpur or Paper and GeyserMC is enabled.
2. Confirm Bedrock port `19132` is open for **UDP** traffic:
   ```bash
   sudo ufw status | grep 19132
   ```
   If not allowed:
   ```bash
   sudo ufw allow 19132/udp
   ```
3. Verify GeyserMC status in the server console:
   ```
   /geyser version
   ```
4. If behind Cloudflare DNS, verify the `play` A record has Proxy Status set to **DNS Only (Grey Cloud)**.

---

## 2. Server Stuck in "CRASHED" State (Crash Loop)

### Symptoms
Dashboard status shows `CRASHED` and halts auto-restarts.

### Cause
Minecraft threw an unrecoverable exception (e.g., incompatible plugin, corrupt chunk, or Out Of Memory `OutOfMemoryError`) and exceeded the `maxCrashRetries` threshold (default 3 retries).

### Solution
1. Open **Files > crash-reports** in the dashboard.
2. Inspect the latest `crash-YYYY-MM-DD.txt` log.
3. Common fixes:
   - If Out Of Memory: Increase RAM allocation in Server Settings or remove heavy entity farms.
   - If Plugin Error: Go to **Plugins** and disable the offending `.jar` file.
4. Once resolved, click **START** in the dashboard to reset the crash retry counter.

---

## 3. RCON Connection Refused

### Symptoms
Commands sent via the web terminal return *"RCON connection failed"*.

### Cause
Minecraft server is still in the startup phase generating world chunks, or `enable-rcon` is set to false in `server.properties`.

### Solution
1. Ensure the server status has reached `ONLINE`.
2. Check `server.properties` in File Manager:
   ```properties
   enable-rcon=true
   rcon.port=25575
   rcon.password=mc-cloud-secure-rcon
   ```
3. Restart the server container.

---

## 4. Web Dashboard Cannot Connect to Node Agent

### Symptoms
Dashboard shows error *"Failed to fetch agent telemetry"*.

### Diagnostics
1. Check if the Node Agent daemon is running on the host VM:
   ```bash
   curl http://localhost:8443/health
   ```
2. Verify `CLOUD_API_URL` and `CLOUD_API_KEY` match in your Vercel or `.env` configuration.
3. Ensure port `8443` is permitted through the host firewall:
   ```bash
   sudo ufw allow 8443/tcp
   ```
