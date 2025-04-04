import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import readline from "readline";

const TOKEN_FILE = "token.txt";
let TOKEN;

// Fungsi untuk meminta token dari user
function askToken() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Masukkan TOKEN bot anda: ", (inputToken) => {
    if (!inputToken.trim()) {
      console.error("TOKEN tidak boleh kosong!");
      process.exit(1);
    }

    fs.writeFileSync(TOKEN_FILE, inputToken.trim()); // Simpan ke file
    rl.close();
    startBot(inputToken.trim());
  });
}

// Fungsi untuk menjalankan bot
function startBot(token) {
  const bot = new TelegramBot(token, { polling: true });
  console.log("✅ success...");
  return bot;
}

// Cek apakah file token.txt ada
let bot;
if (fs.existsSync(TOKEN_FILE)) {
  TOKEN = fs.readFileSync(TOKEN_FILE, "utf8").trim();
  if (TOKEN) {
    bot = startBot(TOKEN);
  } else {
    console.error("TOKEN dalam file kosong! Silakan masukkan ulang.");
    askToken();
  }
} else {
  askToken();
}

// Pastikan bot hanya diekspor jika sudah dibuat
export { bot };