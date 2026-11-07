const mc = require('minecraft-protocol');
const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_HOST = process.env.SERVER_HOST || 'loosejaw.aternos.host';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '58762', 10);
const BOT_NAME = process.env.BOT_NAME || 'Sahil_24_7_Bot';

const VERSIONS_TO_TRY = ['1.20.4', '1.21.1', '1.20.2', '1.19.4'];
let currentVersionIndex = 0;

let currentClient = null;
let reconnectTimer = null;
let recentLogs = [];

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(line);
  recentLogs.push(line);
  if (recentLogs.length > 80) recentLogs.shift();
}

let botStatus = {
  connected: false,
  lastConnectedAt: null,
  reconnectAttempts: 0,
  host: SERVER_HOST,
  port: SERVER_PORT,
  botName: BOT_NAME,
  activeVersion: VERSIONS_TO_TRY[currentVersionIndex],
  lastEvent: null,
  lastError: null,
};

function scheduleReconnect(delay = 4000) {
  if (reconnectTimer) return;
  botStatus.connected = false;
  botStatus.reconnectAttempts++;

  if (currentClient) {
    try {
      currentClient.removeAllListeners();
      currentClient.end();
    } catch {}
    currentClient = null;
  }

  log(`[Cloud Bot] Reconnecting to ${SERVER_HOST}:${SERVER_PORT} in ${delay / 1000}s (Attempt #${botStatus.reconnectAttempts})...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectBot();
  }, delay);
}

function connectBot() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  const versionToUse = VERSIONS_TO_TRY[currentVersionIndex];
  botStatus.activeVersion = versionToUse;

  log(`[Cloud Bot] Direct TCP Handshake -> ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME} (Protocol Version: ${versionToUse})...`);

  try {
    currentClient = mc.createClient({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: versionToUse,
      skipValidation: true,
      checkTimeoutInterval: 40 * 1000,
    });
  } catch (err) {
    log(`[Cloud Bot] Client creation error: ${err.message}`);
    botStatus.lastError = err.message;
    // Rotate version on error
    currentVersionIndex = (currentVersionIndex + 1) % VERSIONS_TO_TRY.length;
    scheduleReconnect(5000);
    return;
  }

  currentClient.on('connect', () => {
    log(`[Cloud Bot] TCP Socket Connected to ${SERVER_HOST}:${SERVER_PORT}!`);
    botStatus.lastEvent = 'TCP_CONNECTED';
  });

  currentClient.on('success', (packet) => {
    botStatus.connected = true;
    botStatus.lastConnectedAt = new Date().toISOString();
    botStatus.reconnectAttempts = 0;
    botStatus.lastError = null;
    botStatus.lastEvent = 'LOGIN_SUCCESS';
    log(`[Cloud Bot] >>> SUCCESS: LOGGED IN AS ${BOT_NAME}! SERVER IS KEPT ALIVE 24/7! <<<`);
  });

  currentClient.on('login', () => {
    botStatus.connected = true;
    botStatus.lastConnectedAt = new Date().toISOString();
    botStatus.reconnectAttempts = 0;
    botStatus.lastError = null;
    botStatus.lastEvent = 'IN_WORLD';
    log(`[Cloud Bot] >>> SPAWNED IN WORLD! 24/7 PERMANENT ACTIVE! <<<`);
  });

  currentClient.on('kick_disconnect', (packet) => {
    const reason = typeof packet.reason === 'object' ? JSON.stringify(packet.reason) : String(packet.reason || JSON.stringify(packet));
    log(`[Cloud Bot] Kicked: ${reason}`);
    botStatus.lastError = `Kicked: ${reason}`;
    // If version mismatch kick, rotate to next version
    if (reason.toLowerCase().includes('version') || reason.toLowerCase().includes('outdated')) {
      currentVersionIndex = (currentVersionIndex + 1) % VERSIONS_TO_TRY.length;
      log(`[Cloud Bot] Version mismatch detected. Switching to protocol: ${VERSIONS_TO_TRY[currentVersionIndex]}`);
    }
    scheduleReconnect(5000);
  });

  currentClient.on('disconnect', (packet) => {
    const reason = typeof packet.reason === 'object' ? JSON.stringify(packet.reason) : String(packet.reason || JSON.stringify(packet));
    log(`[Cloud Bot] Disconnect: ${reason}`);
    botStatus.lastError = `Disconnect: ${reason}`;
    scheduleReconnect(5000);
  });

  currentClient.on('error', (err) => {
    log(`[Cloud Bot] Socket Error: ${err.message}`);
    botStatus.lastError = err.message;
    scheduleReconnect(5000);
  });

  currentClient.on('end', () => {
    log('[Cloud Bot] Socket closed by server.');
    scheduleReconnect(4000);
  });
}

// Start bot
connectBot();

// Self-ping Render every 4 minutes to prevent free instance sleep
setInterval(() => {
  https.get('https://aternos-24-7-bot-gfrf.onrender.com', () => {}).on('error', () => {});
}, 4 * 60 * 1000);

// Status & diagnostics endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Minecraft 24/7 Cloud AFK Bot (Multi-Version Protocol Engine)',
    status: botStatus.connected ? 'ONLINE_IN_SERVER' : 'CONNECTING',
    targetServer: `${SERVER_HOST}:${SERVER_PORT}`,
    details: botStatus,
    recentLogs,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  log(`[Cloud Bot HTTP] Service active on port ${PORT}`);
});
