import express from 'express';
import { bot } from './bot.js';
import path from 'path';
import { fileURLToPath } from 'url';

// === Konfigurasi dasar ===
const PORT = 8158;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json()); // Buat nerima JSON dari frontend
app.use(express.static(path.join(__dirname, 'public'))); // Serve web static

let lastChatId = null; // Simpen chatId terakhir

// === Handle command /start ===
bot.onText(/\/101001/, (msg) => {
  lastChatId = msg.chat.id;
  bot.sendMessage(lastChatId, `http://localhost:${PORT}`);
});

// === Endpoint dari web buat kirim data device ===
app.post('/send-device-data', (req, res) => {
  const data = req.body;

  if (!lastChatId) {
    return res.status(400).send(`gunakan perintah\n/101001\nlalu masuk ke halaman yang di berikan`);
  }

  const message = `
Data Device User:
- User Agent: ${data.userAgent}
- Platform: ${data.platform}
- Bahasa: ${data.language}
- Cookie Aktif: ${data.cookieEnabled}
- Ukuran Layar: ${data.screenSize}
- Ukuran Window: ${data.windowSize}
  `.trim();

  bot.sendMessage(lastChatId, message);
  res.sendStatus(200);
});

// === Route default ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`Web server aktif di http://localhost:${PORT}`);
  console.log('Bot Telegram juga lagi polling...');
});