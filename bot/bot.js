import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import readline from "readline";

const TOKEN_FILE = "token.txt";
let TOKEN;

if (fs.existsSync(TOKEN_FILE)) {
  TOKEN = fs.readFileSync(TOKEN_FILE, "utf8").trim();
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Masukkan TOKEN bot anda: ", (inputToken) => {
    if (!inputToken) {
      console.error("TOKEN tidak boleh kosong!");
      process.exit(1);
    }

    fs.writeFileSync(TOKEN_FILE, inputToken); // Simpan TOKEN ke file
    rl.close();
    startBot(inputToken);
  });

  function startBot(token) {
    const bot = new TelegramBot(token, { polling: true });
    export default bot; // Bot berjalan setelah memasukkan TOKEN
  }
}

if (TOKEN) {
  const bot = new TelegramBot(TOKEN, { polling: true });
  export default bot;
}