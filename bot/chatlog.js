import { bot } from './bot.js';
import fs from "fs";
import cron from "node-cron";

const chatLogPath = "./chat_log.txt";

// Fungsi Simpan Chat
function simpanChat(username, jenis, isi = "") {
    let waktu = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    let log = isi ? `[${waktu}] ${username}: (${jenis}) ${isi}\n` : `[${waktu}] ${username}: (${jenis})\n`;
    fs.appendFileSync(chatLogPath, log);
}

// Event Pesan
bot.on("message", (msg) => {
    let username = msg.from.username || msg.from.first_name;

    if (msg.text) {
        simpanChat(username, "Text", msg.text);
    } else if (msg.photo) {
        simpanChat(username, "Photo");
    } else if (msg.video) {
        simpanChat(username, "Video");
    } else if (msg.document) {
        simpanChat(username, "Document");
    } else if (msg.sticker) {
        simpanChat(username, "Sticker");
    } else if (msg.voice) {
        simpanChat(username, "Voice");
    } else {
        simpanChat(username, "Unknown");
    }
});

// Perintah Mengambil File
bot.onText(/\/file_chat/, (msg) => {
    const chatId = msg.chat.id;

    if (fs.existsSync(chatLogPath)) {
        bot.sendDocument(chatId, chatLogPath, { caption: "Ini file chat kamu." });
    } else {
        bot.sendMessage(chatId, "Belum ada chat yang tersimpan hari ini.");
    }
});

// Jadwal Hapus Otomatis Setiap 00:00
cron.schedule("0 0 * * *", () => {
    if (fs.existsSync(chatLogPath)) {
        fs.unlinkSync(chatLogPath);
        console.log("File chat_log.txt dihapus otomatis.");
    }
});