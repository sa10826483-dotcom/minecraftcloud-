const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_HOST = process.env.SERVER_HOST || 'sahilsmp.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '25565', 10);
const BOT_NAME = process.env.BOT_NAME || 'CloudAFK_24_7';

let botStatus = {
  connected: false,
  lastConnectedAt: null,
  reconnectAttempts: 0,
  host: SERVER_HOST,
  port: SERVER_PORT,
  botName: BOT_NAME,
};

function createBot() {
  console.log(`[Cloud Bot] Connecting to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: false, // auto-detect server version
    checkTimeoutInterval: 60 * 1000,
  });

  bot.on('login', () => {
    botStatus.connected = true;
    botStatus.lastConnectedAt = new Date().toISOString();
    botStatus.reconnectAttempts = 0;
    console.log(`[Cloud Bot] Successfully logged into ${SERVER_HOST}! Server is now KEPT ALIVE 24/7.`);
  });

  bot.on('spawn', () => {
    console.log('[Cloud Bot] Bot spawned in the world. Initializing Anti-AFK routine.');

    // Anti-AFK Routine: swing arm and look around every 30 seconds
    const afkInterval = setInterval(() => {
      if (!bot || !botStatus.connected) {
        clearInterval(afkInterval);
        return;
      }
      try {
        bot.swingArm('right');
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * 0.5;
        bot.look(yaw, pitch, true);
      } catch (err) {
        console.warn('[Cloud Bot] Anti-AFK action skipped:', err.message);
      }
    }, 30000);
  });

  bot.on('kicked', (reason) => {
    botStatus.connected = false;
    console.log(`[Cloud Bot] Kicked from server. Reason:`, reason);
  });

  bot.on('error', (err) => {
    botStatus.connected = false;
    console.log(`[Cloud Bot] Error encountered:`, err.message);
  });

  bot.on('end', () => {
    botStatus.connected = false;
    botStatus.reconnectAttempts++;
    console.log(`[Cloud Bot] Disconnected. Reconnecting in 10 seconds (Attempt #${botStatus.reconnectAttempts})...`);
    setTimeout(createBot, 10000);
  });
}

// Start bot
createBot();

// Cloud Health Check Endpoint for 24/7 Hosting (Render, Koyeb, UptimeRobot)
app.get('/', (req, res) => {
  res.json({
    service: 'Minecraft 24/7 Cloud AFK Bot',
    status: botStatus.connected ? 'ONLINE_IN_SERVER' : 'CONNECTING',
    targetServer: `${SERVER_HOST}:${SERVER_PORT}`,
    details: botStatus,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[Cloud Bot HTTP] Keep-alive endpoint listening on port ${PORT}`);
});
