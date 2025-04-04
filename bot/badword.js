import { bot } from './bot.js';
import fs from "fs";

// Ganti dengan ID admin yang bisa menambah kata terlarang
const ADMIN_ID = "6202819748";

// Load daftar kata terlarang dari file
let badWords = [];
const badWordsFile = 'badwords.json';

if (fs.existsSync(badWordsFile)) {
    badWords = JSON.parse(fs.readFileSync(badWordsFile));
}

// Fungsi menyimpan kata terlarang
function saveBadWords() {
    fs.writeFileSync(badWordsFile, JSON.stringify(badWords, null, 2));
}

// Perintah untuk menambah kata terlarang
bot.onText(/^\/addbadword(?:\s+(.+))?$/, (msg, match) => {
    if (!ADMIN_ID.includes(msg.from.id)) return bot.sendMessage(msg.chat.id, "❌ Kamu bukan admin!");

    // Jika admin hanya mengetik /addbadword tanpa kata tambahan
    if (!match[1]) {
        return bot.sendMessage(msg.chat.id, "⚠️ Penggunaan yang benar:\n`/addbadword <kata1>, <kata2>, ...`\nContoh: `/addbadword bodoh, kucing, anjing`", { parse_mode: "Markdown" });
    }

    let newWords = match[1].split(',').map(word => word.trim().toLowerCase());
    badWords.push(...newWords);
    badWords = [...new Set(badWords)]; // Hindari duplikasi
    saveBadWords();

    bot.sendMessage(msg.chat.id, `✅ Kata-kata terlarang berhasil ditambahkan:\n${newWords.join(', ')}`);
});

// Mendeteksi pesan yang mengandung kata kasar
bot.on('message', (msg) => {
    if (!msg.text) return;

    let messageText = msg.text.toLowerCase();
    let containsBadWord = badWords.some(word => messageText.includes(word));

    if (containsBadWord) {
        bot.deleteMessage(msg.chat.id, msg.message_id).catch(() => {});
    }
});