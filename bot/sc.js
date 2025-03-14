import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { bot } from './bot.js';

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

bot.onText(/\/sc/, async (msg) => {
    const chatId = msg.chat.id;
    const filePath = join(__dirname, "main3.js");

    if (existsSync(filePath)) {
        bot.sendDocument(chatId, filePath, {
            caption: "nih cuyy"
        }).catch(err => console.error("Gagal mengirim file:", err));
    } else {
        bot.sendMessage(chatId, "File main3.js tidak ditemukan.");
    }
});