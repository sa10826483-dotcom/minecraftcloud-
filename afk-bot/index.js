const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_HOST = 'sahil9354.aternos.me';
const SERVER_PORT = 58762;
const BOT_NAME = 'Sahil_24_7_Cloud';

// Render Web Service operates as a 24/7 Cloud Monitor & Webhook
// Minecraft bot runs exclusively on GitHub Actions Cloud to eliminate duplicate login collisions

app.get('/', (req, res) => {
  res.json({
    service: 'Minecraft 24/7 Cloud Dashboard & Monitor',
    status: 'ACTIVE_24_7',
    targetServer: `${SERVER_HOST}:${SERVER_PORT}`,
    cloudRunner: 'GitHub Actions (Microsoft Azure Cloud)',
    botName: BOT_NAME,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[Cloud Monitor] Service active on port ${PORT}`);
});
