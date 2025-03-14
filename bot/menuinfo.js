import { bot } from './bot.js';
import fs from "fs";

const ADMIN_ID = 6202819748; // Ganti dengan ID Telegram admin

const menuFile = 'menu.json';
const infoFile = 'command_info.json';

// Membaca daftar command dari menu.js
const getMenu = () => JSON.parse(fs.readFileSync(menuFile, 'utf8'));

// Membaca atau membuat file command_info.json
if (!fs.existsSync(infoFile)) {
    fs.writeFileSync(infoFile, JSON.stringify({}, null, 2));
}

// Fungsi membaca command_info.json
const getInfo = () => JSON.parse(fs.readFileSync(infoFile, 'utf8'));

// Fungsi menulis ke command_info.json
const saveInfo = (data) => fs.writeFileSync(infoFile, JSON.stringify(data, null, 2));

// Handler untuk /info <command>
bot.onText(/\/info(?:\s+(\S+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const command = match[1];

    if (!command) {
        return bot.sendMessage(chatId, "Gunakan: `/info <command>` untuk melihat informasi perintah.", { parse_mode: "Markdown" });
    }

    const menu = getMenu();
    if (!menu.includes(command)) {
        return bot.sendMessage(chatId, `⚠️ Command \`/${command}\` tidak ditemukan dalam daftar.`, { parse_mode: "Markdown" });
    }

    const info = getInfo();
    if (info[command]) {
        bot.sendMessage(chatId, `*Informasi tentang /${command}:*\n${info[command]}`, { parse_mode: "Markdown" });
    } else {
        bot.sendMessage(chatId, `⚠️ Belum ada informasi untuk \`/${command}\`. Minta admin untuk menambahkannya.`, { parse_mode: "Markdown" });
    }
});

// Handler untuk /addinfo <command> (hanya admin)
bot.onText(/\/addinfo\s+(\S+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const command = match[1];

    // Cek apakah user adalah admin
    if (userId !== ADMIN_ID) {
        return bot.sendMessage(chatId, "⚠️ Hanya admin yang dapat menambahkan informasi.", { parse_mode: "Markdown" });
    }

    const menu = getMenu();
    if (!menu.includes(command)) {
        return bot.sendMessage(chatId, `⚠️ Command \`/${command}\` tidak ditemukan dalam daftar.`, { parse_mode: "Markdown" });
    }

    let info = getInfo();
    if (info[command]) {
        return bot.sendMessage(chatId, `⚠️ Informasi tentang \`/${command}\` sudah tersedia.`, { parse_mode: "Markdown" });
    }

    bot.sendMessage(chatId, `Silakan kirimkan informasi untuk \`/${command}\`.`, { parse_mode: "Markdown" });

    bot.once('message', (infoMsg) => {
        if (infoMsg.chat.id !== chatId || infoMsg.from.id !== ADMIN_ID) return;
        const infoText = infoMsg.text;

        info[command] = infoText;
        saveInfo(info);

        bot.sendMessage(chatId, `✅ Informasi untuk \`/${command}\` telah disimpan.`, { parse_mode: "Markdown" });
    });
});