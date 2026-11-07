const mineflayer = require('mineflayer');

const SERVER_HOST = 'sahil9354.aternos.me';
const SERVER_PORT = 58762;
const BOT_NAME = 'Sahil_24_7_Bot';

console.log(`[Local 24/7 Bot] Starting connection to ${SERVER_HOST}:${SERVER_PORT} as ${BOT_NAME}...`);

let bot = null;
let reconnectTimer = null;
let afkInterval = null;

function connect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);

  try {
    bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: BOT_NAME,
      version: '26.1',
      checkTimeoutInterval: 60000,
    });
  } catch (err) {
    console.error('[Local 24/7 Bot] Create error:', err.message);
    reconnectTimer = setTimeout(connect, 5000);
    return;
  }

  bot.on('connect', () => {
    console.log('[Local 24/7 Bot] TCP Socket Connected!');
  });

  bot.on('login', () => {
    console.log(`>>> [Local 24/7 Bot] SUCCESS: LOGGED IN AS ${BOT_NAME}! <<<`);
  });

  bot.on('spawn', () => {
    console.log('>>> [Local 24/7 Bot] SPAWNED IN WORLD! Anti-AFK running! <<<');

    if (afkInterval) clearInterval(afkInterval);
    afkInterval = setInterval(() => {
      if (!bot) return;
      try {
        bot.swingArm('right');
        const yaw = Math.random() * Math.PI * 2;
        bot.look(yaw, 0, true);
      } catch (e) {}
    }, 20000);
  });

  bot.on('kicked', (reason) => {
    console.log('[Local 24/7 Bot] Kicked:', JSON.stringify(reason));
    if (afkInterval) clearInterval(afkInterval);
    reconnectTimer = setTimeout(connect, 5000);
  });

  bot.on('error', (err) => {
    console.error('[Local 24/7 Bot] Socket error:', err.message);
    if (afkInterval) clearInterval(afkInterval);
    reconnectTimer = setTimeout(connect, 5000);
  });

  bot.on('end', () => {
    console.log('[Local 24/7 Bot] Connection ended. Reconnecting in 5s...');
    if (afkInterval) clearInterval(afkInterval);
    reconnectTimer = setTimeout(connect, 5000);
  });
}

connect();
