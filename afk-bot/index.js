const mc = require('minecraft-protocol');
const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_HOST = process.env.SERVER_HOST || 'sahil9354.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '58762', 10);
const BOT_NAME = process.env.BOT_NAME || 'Sahil_24_7_Bot';

let currentClient = null;
let reconnectTimer = null;
let recentLogs = [];

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(line);
  recentLogs.push(line);
  if (recentLogs.length > 60) recentLogs.shift();
}

let botStatus = {
  connected: false,
  lastConnectedAt: null,
  reconnectAttempts: 0,
  host: SERVER_HOST,
  port: SERVER_PORT,
  botName: BOT_NAME,
  lastEvent: null,
  lastError: null,
};

function scheduleReconnect(delay = 5000) {
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

  log(`[Cloud Bot] Opening direct Minecraft protocol socket to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

  try {
    currentClient = mc.createClient({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: '1.21.1',
      skipValidation: true,
      checkTimeoutInterval: 45 * 1000,
    });
  } catch (err) {
    log(`[Cloud Bot] Protocol Init Error: ${err.message}`);
    botStatus.lastError = err.message;
    scheduleReconnect(6000);
    return;
  }

  currentClient.on('connect', () => {
    log(`[Cloud Bot] TCP Handshake succeeded to Aternos port ${SERVER_PORT}!`);
    botStatus.lastEvent = 'TCP_CONNECTED';
  });

  currentClient.on('success', (packet) => {
    botStatus.connected = true;
    botStatus.lastConnectedAt = new Date().toISOString();
    botStatus.reconnectAttempts = 0;
    botStatus.lastError = null;
    botStatus.lastEvent = 'LOGIN_SUCCESS';
    log(`[Cloud Bot] >>> LOGGED IN SUCCESSFULLY AS ${BOT_NAME} (UUID: ${packet.uuid})! SERVER IS 24/7 ONLINE! <<<`);
  });

  currentClient.on('login', () => {
    botStatus.connected = true;
    botStatus.lastConnectedAt = new Date().toISOString();
    botStatus.reconnectAttempts = 0;
    botStatus.lastError = null;
    botStatus.lastEvent = 'IN_WORLD';
    log(`[Cloud Bot] >>> SPAWNED INTO WORLD AS ${BOT_NAME}! SERVER NEVER SLEEPS! <<<`);
  });

  currentClient.on('kick_disconnect', (packet) => {
    const reason = packet.reason || JSON.stringify(packet);
    log(`[Cloud Bot] Kick Disconnect: ${reason}`);
    botStatus.lastError = `Kicked: ${reason}`;
    scheduleReconnect(6000);
  });

  currentClient.on('disconnect', (packet) => {
    const reason = packet.reason || JSON.stringify(packet);
    log(`[Cloud Bot] Server Disconnect: ${reason}`);
    botStatus.lastError = `Disconnect: ${reason}`;
    scheduleReconnect(6000);
  });

  currentClient.on('error', (err) => {
    log(`[Cloud Bot] Socket Error: ${err.message}`);
    botStatus.lastError = err.message;
    scheduleReconnect(6000);
  });

  currentClient.on('end', () => {
    log('[Cloud Bot] Connection closed by server.');
    scheduleReconnect(5000);
  });
}

// Start connection
connectBot();

// Self-ping Render every 4 minutes to prevent free instance sleep
setInterval(() => {
  https.get('https://aternos-24-7-bot-gfrf.onrender.com', () => {}).on('error', () => {});
}, 4 * 60 * 1000);

// Status & diagnostics endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Minecraft 24/7 Cloud AFK Bot (Pure Protocol Edition)',
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
