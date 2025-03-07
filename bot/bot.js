import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import readline from "readline";

const TOKEN_FILE = "token.txt";
let TOKEN;

// Cek apakah file token.txt ada
if (fs.existsSync(TOKEN_FILE)) {
  TOKEN = fs.readFileSync(TOKEN_FILE, "utf8").trim();
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Masukkan TOKEN bot anda: ", (inputToken) => {
    if (!inputToken.trim()) {
      console.error("TOKEN tidak boleh kosong!");
      process.exit(1);
    }

    fs.writeFileSync(TOKEN_FILE, inputToken.trim()); // Simpan TOKEN ke file
    rl.close();
    startBot(inputToken.trim());
  });

  function startBot(token) {
    const bot = new TelegramBot(token, { polling: true });
    console.log("Bot telah berjalan...");
    
    // Contoh event handler
    bot.on("message", (msg) => {
      bot.sendMessage(msg.chat.id, "Halo! Bot sudah aktif.");
    });
  }

  // Hindari eksekusi lanjut sebelum mendapatkan TOKEN
  return;
}

// Jika TOKEN sudah tersedia, jalankan bot
const bot = new TelegramBot(TOKEN, { polling: true });
console.log("Bot telah berjalan...");

bot.on("message", (msg) => {
  bot.sendMessage(msg.chat.id, "Halo! Bot sudah aktif.");
});

export default bot;