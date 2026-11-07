const mineflayer = require('mineflayer');
const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_HOST = process.env.SERVER_HOST || 'sahil9354.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '58762', 10);
const BOT_NAME = process.env.BOT_NAME || 'Sahil_24_7_Bot';

let currentBot = null;
let reconnectTimer = null;
let afkInterval = null;
let recentLogs = [];

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(line);
  recentLogs.push(line);
  if (recentLogs.length > 50) recentLogs.shift();
}

let botStatus = {
  connected: false,
  lastConnectedAt: null,
  reconnectAttempts: 0,
  host: SERVER_HOST,
  port: SERVER_PORT,
  botName: BOT_NAME,
  lastKickReason: null,
  lastError: null,
};

function scheduleReconnect(delay = 5000) {
  if (reconnectTimer) return;
  botStatus.connected = false;
  botStatus.reconnectAttempts++;

  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }

  if (currentBot) {
    try {
      currentBot.removeAllListeners();
      currentBot.quit();
    } catch {}
    currentBot = null;
  }

  log(`[Cloud Bot] Reconnecting to ${SERVER_HOST}:${SERVER_PORT} in ${delay / 1000}s (Attempt #${botStatus.reconnectAttempts})...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, delay);
}

function createBot() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  log(`[Cloud Bot] Connecting to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

  try {
    currentBot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: false, // auto-detect protocol
      checkTimeoutInterval: 60 * 1000,
    });
  } catch (err) {
    log(`[Cloud Bot] CreateBot Exception: ${err.message}`);
    botStatus.lastError = err.message;
    scheduleReconnect(6000);
    return;
  }

  currentBot.on('login', () => {
    botStatus.connected = true;
    botStatus.lastConnectedAt = new Date().toISOString();
    botStatus.reconnectAttempts = 0;
    botStatus.lastKickReason = null;
    botStatus.lastError = null;
    log(`[Cloud Bot] >>> LOGGED IN SUCCESSFULLY AS ${BOT_NAME}! SERVER IS 24/7 ONLINE! <<<`);
  });

  currentBot.on('spawn', () => {
    log('[Cloud Bot] Spawned in the world! Anti-AFK routine active.');

    if (afkInterval) clearInterval(afkInterval);

    // Gentle anti-afk: swing arm and look around (does NOT glitch physics or kick)
    afkInterval = setInterval(() => {
      if (!currentBot || !botStatus.connected) return;
      try {
        currentBot.swingArm('right');
        const yaw = Math.random() * Math.PI * 2;
        currentBot.look(yaw, 0, true);
      } catch (err) {
        log(`[Cloud Bot] Swing error: ${err.message}`);
      }
    }, 25000);
  });

  currentBot.on('kicked', (reason) => {
    const reasonStr = typeof reason === 'object' ? JSON.stringify(reason) : String(reason);
    log(`[Cloud Bot] Kicked from server. Reason: ${reasonStr}`);
    botStatus.lastKickReason = reasonStr;
    scheduleReconnect(6000);
  });

  currentBot.on('error', (err) => {
    log(`[Cloud Bot] Socket Error: ${err.message}`);
    botStatus.lastError = err.message;
    scheduleReconnect(6000);
  });

  currentBot.on('end', () => {
    log('[Cloud Bot] Connection ended. Scheduling auto-reconnect...');
    scheduleReconnect(5000);
  });
}

// Start bot
createBot();

// Self-ping to prevent Render free instance from sleeping
setInterval(() => {
  https.get('https://aternos-24-7-bot-gfrf.onrender.com', () => {}).on('error', () => {});
}, 4 * 60 * 1000);

// Status and logs endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Minecraft 24/7 Cloud AFK Bot',
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
