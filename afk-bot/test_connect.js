const mineflayer = require('mineflayer');

console.log('Testing connection to sahil9354.aternos.me:58762...');

const bot = mineflayer.createBot({
  host: 'sahil9354.aternos.me',
  port: 58762,
  username: 'TestDiagBot',
  checkTimeoutInterval: 30000,
});

bot.on('connect', () => console.log('[DIAG] TCP Socket Connected!'));
bot.on('login', () => console.log('[DIAG] Login Succeeded!'));
bot.on('spawn', () => {
  console.log('[DIAG] Bot Spawned in World!');
  setTimeout(() => {
    bot.quit();
    process.exit(0);
  }, 3000);
});
bot.on('kicked', (reason) => console.log('[DIAG] Kicked:', reason));
bot.on('error', (err) => console.log('[DIAG] Error:', err.message));
bot.on('end', () => console.log('[DIAG] End'));
