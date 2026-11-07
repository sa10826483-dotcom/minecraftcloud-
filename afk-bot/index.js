const mineflayer = require('mineflayer');
const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_HOST = process.env.SERVER_HOST || 'sahil9354.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '58762', 10);
const BOT_NAME = process.env.BOT_NAME || 'CloudAFK_24_7';

let currentBot = null;
let reconnectTimer = null;
let afkTimer = null;
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
  version: '1.21.1',
  lastAction: null,
  lastKickReason: null,
  lastError: null,
};

function scheduleReconnect(delayMs = 5000) {
  if (reconnectTimer) return;
  botStatus.connected = false;
  botStatus.reconnectAttempts++;

  if (afkTimer) {
    clearInterval(afkTimer);
    afkTimer = null;
  }

  if (currentBot) {
    try {
      currentBot.removeAllListeners();
      currentBot.end();
    } catch {}
    currentBot = null;
  }

  log(`[Cloud Bot] Reconnecting in ${delayMs / 1000}s (Attempt #${botStatus.reconnectAttempts})...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, delayMs);
}

function createBot() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  log(`[Cloud Bot] Initiating 1.21.1 connection to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

  try {
    // Explicitly pass version '1.21.1' so Mineflayer skips ping hanging
    currentBot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: '1.21.1',
      checkTimeoutInterval: 45 * 1000,
    });
  } catch (err) {
    log(`[Cloud Bot] Initialization exception: ${err.message}`);
    botStatus.lastError = err.message;
    scheduleReconnect(6000);
    return;
  }

  if (currentBot._client) {
    currentBot._client.on('connect', () => {
      log(`[Cloud Bot] TCP Socket Connected to Aternos port ${SERVER_PORT}!`);
    });
  }

  currentBot.on('login', () => {
    botStatus.connected = true;
    botStatus.lastConnectedAt = new Date().toISOString();
    botStatus.reconnectAttempts = 0;
    botStatus.lastError = null;
    botStatus.lastKickReason = null;
    log(`[Cloud Bot] >>> LOGGED IN SUCCESSFULLY TO ${SERVER_HOST}! SERVER IS 24/7 ALIVE! <<<`);
  });

  currentBot.on('spawn', () => {
    log('[Cloud Bot] Bot Spawned in World! Starting Anti-AFK engine.');

    if (afkTimer) clearInterval(afkTimer);

    // Physical anti-AFK actions
    afkTimer = setInterval(() => {
      if (!currentBot || !botStatus.connected) return;

      try {
        currentBot.swingArm('right');

        currentBot.setControlState('jump', true);
        setTimeout(() => {
          if (currentBot) currentBot.setControlState('jump', false);
        }, 350);

        currentBot.setControlState('sneak', true);
        setTimeout(() => {
          if (currentBot) currentBot.setControlState('sneak', false);
        }, 600);

        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * 0.4;
        currentBot.look(yaw, pitch, true);

        botStatus.lastAction = new Date().toISOString();
      } catch (err) {
        log(`[Cloud Bot] Movement error: ${err.message}`);
      }
    }, 20000);
  });

  currentBot.on('kicked', (reason) => {
    const reasonStr = typeof reason === 'object' ? JSON.stringify(reason) : String(reason);
    log(`[Cloud Bot] Kicked: ${reasonStr}`);
    botStatus.lastKickReason = reasonStr;
    scheduleReconnect(6000);
  });

  currentBot.on('error', (err) => {
    log(`[Cloud Bot] Error: ${err.message}`);
    botStatus.lastError = err.message;
    scheduleReconnect(6000);
  });

  currentBot.on('end', () => {
    log('[Cloud Bot] Connection ended.');
    scheduleReconnect(5000);
  });
}

// Start bot
createBot();

// Self-ping Render every 4 minutes to prevent sleep
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
