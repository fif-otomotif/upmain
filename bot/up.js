import bot from './bot.js';
import fs from 'fs';
import https from 'https';

// Objek untuk menyimpan user yang sedang dalam proses update
const updateQueue = {};

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    // Jika user mengetik /up, masukkan ke dalam updateQueue
    if (text === "/up") {
        bot.sendMessage(chatId, "Silakan kirim URL GitHub untuk `main3.js`.");
        updateQueue[chatId] = true; // Tandai user sedang dalam proses update
    } 
    // Jika user sedang dalam proses update dan mengirimkan URL
    else if (updateQueue[chatId]) {
        // Cek apakah URL sesuai dengan format yang valid
        const validUrl = /^https:\/\/github\.com\/fif-otomotif\/upmain\/blob\/main\/bot\/main3\.js$/;

        if (!validUrl.test(text)) {
            bot.sendMessage(chatId, "URL tidak valid! Kamu tidak bisa mencoba lagi.");
            delete updateQueue[chatId]; // Hapus dari daftar update (abaikan user ini)
            return;
        }

        // Ubah URL ke format "raw.githubusercontent.com"
        const rawUrl = text.replace("github.com", "raw.githubusercontent.com")
                           .replace("/blob/", "/");

        bot.sendMessage(chatId, "Mengunduh update, harap tunggu...");
        updateMain3(rawUrl, chatId); // Proses update
        delete updateQueue[chatId]; // Hapus user dari daftar update setelah proses berjalan
    }
});

// Fungsi untuk mengupdate main3.js
function updateMain3(url, chatId) {
    https.get(url, (res) => {
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