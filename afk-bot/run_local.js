const mineflayer = require('mineflayer');

const SERVER_HOST = process.env.SERVER_HOST || 'sahil9354.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '58762', 10);
const BOT_NAME = process.env.BOT_NAME || 'Sahil_Keeper';

console.log(`[Clean Bot] Target: ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}`);

let bot = null;
let reconnectTimer = null;
let afkInterval = null;
let isConnecting = false;

function scheduleReconnect(delay = 10000) {
  // STRICT GUARD: If a reconnect is already scheduled, NEVER schedule another!
  if (reconnectTimer) return;

  isConnecting = false;
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }

  if (bot) {
    try {
      bot.removeAllListeners();
      bot.quit();
    } catch (e) {}
    bot = null;
  }

  console.log(`[Clean Bot] Reconnecting in ${delay / 1000}s...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    start();
  }, delay);
}

function start() {
  if (isConnecting || bot) return;
  isConnecting = true;

  console.log(`[Clean Bot] Initiating clean connection as ${BOT_NAME}...`);

  try {
    bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: '26.1',
      checkTimeoutInterval: 90 * 1000,
    });
  } catch (err) {
    console.error('[Clean Bot] Init error:', err.message);
    scheduleReconnect(10000);
    return;
  }

  bot.once('login', () => {
    isConnecting = false;
    console.log(`>>> [Clean Bot] SUCCESS: LOGGED IN AS ${BOT_NAME}! <<<`);
  });

  bot.once('spawn', () => {
    console.log(`>>> [Clean Bot] SPAWNED IN WORLD! Anti-AFK running. <<<`);

    if (afkInterval) clearInterval(afkInterval);
    afkInterval = setInterval(() => {
      if (!bot) return;
      try {
        bot.swingArm('right');
        const yaw = Math.random() * Math.PI * 2;
        bot.look(yaw, 0, true);
      } catch (e) {}
    }, 30000);
  });

  bot.on('death', () => {
    console.log('[Clean Bot] Death detected, respawning...');
    setTimeout(() => {
      try { if (bot) bot.respawn(); } catch (e) {}
    }, 1000);
  });

  bot.on('kicked', (reason) => {
    console.log('[Clean Bot] Kicked:', JSON.stringify(reason));
    scheduleReconnect(12000);
  });

  bot.on('error', (err) => {
    console.error('[Clean Bot] Error:', err.message);
    scheduleReconnect(12000);
  });

  bot.on('end', () => {
    console.log('[Clean Bot] End event.');
    scheduleReconnect(10000);
  });
}

start();
