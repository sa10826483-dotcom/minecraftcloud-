const mineflayer = require('mineflayer');
const express = require('express');
const https = require('https');
const net = require('net');
const dns = require('dns');

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
  if (recentLogs.length > 100) recentLogs.shift();
}

let botStatus = {
  connected: false,
  inWorld: false,
  lastConnectedAt: null,
  reconnectAttempts: 0,
  host: SERVER_HOST,
  port: SERVER_PORT,
  botName: BOT_NAME,
  version: '26.1',
  lastKickReason: null,
  lastError: null,
};

function scheduleReconnect(delay = 5000) {
  if (reconnectTimer) return;
  botStatus.connected = false;
  botStatus.inWorld = false;
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
    startBot();
  }, delay);
}

function startBot() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  log(`[Cloud Bot] Connecting directly to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

  try {
    currentBot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: '26.1',
      checkTimeoutInterval: 60 * 1000,
    });
  } catch (err) {
    log(`[Cloud Bot] CreateBot Exception: ${err.message}`);
    botStatus.lastError = err.message;
    scheduleReconnect(6000);
    return;
  }

  currentBot.on('connect', () => {
    log(`[Cloud Bot] TCP Socket Connected to ${SERVER_HOST}:${SERVER_PORT}!`);
  });

  currentBot.on('login', () => {
    botStatus.connected = true;
    botStatus.lastConnectedAt = new Date().toISOString();
    botStatus.reconnectAttempts = 0;
    botStatus.lastKickReason = null;
    botStatus.lastError = null;
    log(`[Cloud Bot] >>> SUCCESS: LOGGED IN AS ${BOT_NAME}! SERVER IS 24/7 ONLINE! <<<`);
  });

  currentBot.on('spawn', () => {
    botStatus.inWorld = true;
    log('[Cloud Bot] >>> SPAWNED IN WORLD! Anti-AFK engine active. <<<');

    if (afkInterval) clearInterval(afkInterval);

    afkInterval = setInterval(() => {
      if (!currentBot || !botStatus.connected) return;
      try {
        currentBot.swingArm('right');
        const yaw = Math.random() * Math.PI * 2;
        currentBot.look(yaw, 0, true);
      } catch (err) {
        log(`[Cloud Bot] Anti-AFK swing: ${err.message}`);
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
    log(`[Cloud Bot] Socket Error: ${err.message}`);
    botStatus.lastError = err.message;
    scheduleReconnect(6000);
  });

  currentBot.on('end', () => {
    log('[Cloud Bot] Connection ended. Scheduling auto-reconnect...');
    scheduleReconnect(5000);
  });
}

// Start cloud bot
startBot();

// Self-ping to prevent Render sleep
setInterval(() => {
  https.get('https://aternos-24-7-bot-gfrf.onrender.com', () => {}).on('error', () => {});
}, 3 * 60 * 1000);

// Status HTTP Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Minecraft 24/7 Cloud AFK Bot',
    status: botStatus.inWorld ? 'ONLINE_IN_SERVER' : botStatus.connected ? 'LOGGED_IN' : 'CONNECTING',
    targetServer: `${SERVER_HOST}:${SERVER_PORT}`,
    details: botStatus,
    recentLogs,
    timestamp: new Date().toISOString(),
  });
});

// Diagnostic endpoint: test direct DNS & TCP socket to Aternos
app.get('/diag', (req, res) => {
  dns.lookup(SERVER_HOST, (dnsErr, address) => {
    if (dnsErr) {
      return res.json({ host: SERVER_HOST, dnsError: dnsErr.message });
    }
    const sock = new net.Socket();
    sock.setTimeout(4000);
    sock.on('connect', () => {
      sock.destroy();
      res.json({ host: SERVER_HOST, resolvedIp: address, port: SERVER_PORT, tcpSuccess: true });
    });
    sock.on('timeout', () => {
      sock.destroy();
      res.json({ host: SERVER_HOST, resolvedIp: address, port: SERVER_PORT, tcpSuccess: false, error: 'TIMEOUT (Aternos blocked Render IP)' });
    });
    sock.on('error', (err) => {
      sock.destroy();
      res.json({ host: SERVER_HOST, resolvedIp: address, port: SERVER_PORT, tcpSuccess: false, error: err.message });
    });
    sock.connect(SERVER_PORT, address);
  });
});

app.listen(PORT, () => {
  log(`[Cloud Bot HTTP] Service active on port ${PORT}`);
});
