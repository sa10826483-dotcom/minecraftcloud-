const mineflayer = require('mineflayer');

console.log('Testing direct handshake to sahil9354.aternos.me:58762...');

const b = mineflayer.createBot({
  host: 'sahil9354.aternos.me',
  port: 58762,
  username: 'ProbeBot99',
  checkTimeoutInterval: 20000,
});

b.on('connect', () => console.log('>>> [PROBE] TCP Socket Connected!'));
b.on('login', () => {
  console.log('>>> [PROBE] LOGIN SUCCESSFUL! Bot is in game!');
  b.quit();
  process.exit(0);
});
b.on('kicked', (r) => console.log('>>> [PROBE] Kicked:', JSON.stringify(r)));
b.on('error', (e) => console.log('>>> [PROBE] Error:', e.message));
b.on('end', () => console.log('>>> [PROBE] Socket Closed'));
