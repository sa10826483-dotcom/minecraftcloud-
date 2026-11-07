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

let botStatus = {
  connected: false,
  lastConnectedAt: null,
  reconnectAttempts: 0,
  host: SERVER_HOST,
  port: SERVER_PORT,
  botName: BOT_NAME,
  lastAction: null,
};

function scheduleReconnect() {
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

  console.log(`[Cloud Bot] Disconnected. Reconnecting in 5 seconds (Attempt #${botStatus.reconnectAttempts})...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, 5000);
}

function createBot() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  console.log(`[Cloud Bot] Connecting to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

  try {
    currentBot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: false, // auto-detect protocol version
      checkTimeoutInterval: 45 * 1000,
    });
  } catch (err) {
    console.error('[Cloud Bot] Initialization error:', err.message);
    scheduleReconnect();
    return;
  }

  currentBot.on('login', () => {
    botStatus.connected = true;
    botStatus.lastConnectedAt = new Date().toISOString();
    botStatus.reconnectAttempts = 0;
    console.log(`[Cloud Bot] Logged in successfully to ${SERVER_HOST}! Server will stay alive 24/7.`);
  });

  currentBot.on('spawn', () => {
    console.log('[Cloud Bot] Spawned in the world. Activating Anti-AFK physics engine.');

    if (afkTimer) clearInterval(afkTimer);

    // Active movement every 20 seconds to completely bypass Aternos and Paper AFK kick
    afkTimer = setInterval(() => {
      if (!currentBot || !botStatus.connected) return;

      try {
        // 1. Swing arm
        currentBot.swingArm('right');

        // 2. Physical Jump
        currentBot.setControlState('jump', true);
        setTimeout(() => {
          if (currentBot) currentBot.setControlState('jump', false);
        }, 350);

        // 3. Sneak toggle
        currentBot.setControlState('sneak', true);
        setTimeout(() => {
          if (currentBot) currentBot.setControlState('sneak', false);
        }, 700);

        // 4. Look around
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * 0.4;
        currentBot.look(yaw, pitch, true);

        botStatus.lastAction = new Date().toISOString();
      } catch (err) {
        console.warn('[Cloud Bot] Movement error:', err.message);
      }
    }, 20000);
  });

  currentBot.on('kicked', (reason) => {
    console.warn(`[Cloud Bot] Kicked from server. Reason:`, reason);
    scheduleReconnect();
  });

  currentBot.on('error', (err) => {
    console.error(`[Cloud Bot] Socket error:`, err.message);
    scheduleReconnect();
  });

  currentBot.on('end', () => {
    console.log(`[Cloud Bot] Socket closed.`);
    scheduleReconnect();
  });
}

// Start initial connection
createBot();

// Self-ping to prevent Render free instance from sleeping
setInterval(() => {
  const url = 'https://aternos-24-7-bot-gfrf.onrender.com';
  https.get(url, (res) => {
    // Keep alive ping
  }).on('error', () => {});
}, 4 * 60 * 1000); // every 4 minutes

// Express status endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Minecraft 24/7 Cloud AFK Bot',
    status: botStatus.connected ? 'ONLINE_IN_SERVER' : 'RECONNECTING',
    targetServer: `${SERVER_HOST}:${SERVER_PORT}`,
    details: botStatus,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[Cloud Bot HTTP] Service active on port ${PORT}`);
});
