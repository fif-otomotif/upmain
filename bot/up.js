import { bot } from './bot.js';
import fs from 'fs';
import https from 'https';

// URL raw GitHub untuk main3.js
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/fif-otomotif/upmain/main/bot/main3.js";

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    
    // Pastikan `msg.text` ada sebelum menggunakan `.trim()`
    if (!msg.text) return; 

    const text = msg.text.trim();

    if (text === "/up") {
        bot.sendMessage(chatId, "Mengunduh update terbaru, harap tunggu...");
        updateMain3(chatId);
    }
});

// Fungsi untuk mengupdate main3.js
function updateMain3(chatId) {
    https.get(GITHUB_RAW_URL, (res) => {
        if (res.statusCode !== 200) {
            bot.sendMessage(chatId, `Gagal mengunduh file! Status code: ${res.statusCode}`);
            return;
        }

        let fileData = '';
        res.on('data', (chunk) => fileData += chunk);
        res.on('end', () => {
            fs.writeFileSync('main3.js', fileData);
            bot.sendMessage(chatId, "Update berhasil! Silakan restart bot secara manual.");
        });
    }).on('error', (err) => {
        bot.sendMessage(chatId, "Terjadi kesalahan saat mengunduh file.");
        console.error("Error saat mengunduh:", err.message);
    });
}