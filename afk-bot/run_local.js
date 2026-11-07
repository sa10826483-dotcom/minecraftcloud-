const mineflayer = require('mineflayer');

const SERVER_HOST = process.env.SERVER_HOST || 'sahil9354.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '58762', 10);
const BOT_NAME = process.env.BOT_NAME || 'Sahil_24_7_Cloud';

console.log(`[Cloud 24/7 Bot] Starting dedicated cloud connection to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

let bot = null;
let reconnectTimer = null;
let afkInterval = null;

function connect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  console.log(`[Cloud 24/7 Bot] Connecting to ${SERVER_HOST}:${SERVER_PORT}...`);

  try {
    bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: '26.1',
      checkTimeoutInterval: 90 * 1000,
    });
  } catch (err) {
    console.error('[Cloud 24/7 Bot] Exception:', err.message);
    reconnectTimer = setTimeout(connect, 15000);
    return;
  }

  bot.on('connect', () => {
    console.log('[Cloud 24/7 Bot] TCP Socket Connected!');
  });

  bot.on('login', () => {
    console.log(`>>> [Cloud 24/7 Bot] SUCCESS: LOGGED IN AS ${BOT_NAME}! <<<`);
  });

  bot.on('spawn', () => {
    console.log(`>>> [Cloud 24/7 Bot] SPAWNED IN WORLD! Anti-AFK engine active. <<<`);

    if (afkInterval) clearInterval(afkInterval);

    // Safe Anti-AFK: Gentle head look and arm swing every 25 seconds
    afkInterval = setInterval(() => {
      if (!bot) return;
      try {
        bot.swingArm('right');
        const yaw = Math.random() * Math.PI * 2;
        bot.look(yaw, 0, true);
      } catch (e) {}
    }, 25000);
  });

  // AUTO-RESPAWN ON DEATH (Fixes death screen disconnect loop)
  bot.on('death', () => {
    console.log('[Cloud 24/7 Bot] Bot died in game! Auto-respawning immediately...');
    setTimeout(() => {
      try {
        if (bot) bot.respawn();
      } catch (e) {
        console.error('[Cloud 24/7 Bot] Respawn error:', e.message);
      }
    }, 1000);
  });

  bot.on('kicked', (reason) => {
    console.log('[Cloud 24/7 Bot] Kicked reason:', JSON.stringify(reason));
    if (afkInterval) clearInterval(afkInterval);
    reconnectTimer = setTimeout(connect, 15000);
  });

  bot.on('error', (err) => {
    console.error('[Cloud 24/7 Bot] Socket error:', err.message);
    if (afkInterval) clearInterval(afkInterval);
    reconnectTimer = setTimeout(connect, 15000);
  });

  bot.on('end', () => {
    console.log('[Cloud 24/7 Bot] Connection ended. Reconnecting in 15s...');
    if (afkInterval) clearInterval(afkInterval);
    reconnectTimer = setTimeout(connect, 15000);
  });
}

connect();
