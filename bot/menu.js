import { bot } from './bot.js';
import fs from "fs";

// File konfigurasi untuk menyimpan URL gambar
const configFile = "config.json";

// Fungsi untuk membaca konfigurasi
const getConfig = () => {
    try {
        return JSON.parse(fs.readFileSync(configFile, "utf8"));
    } catch {
        return { thumbnail: "https://files.catbox.moe/pghnyl.jpg" }; // Default thumbnail
    }
};

// Fungsi untuk menyimpan konfigurasi
const saveConfig = (config) => {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
};

bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;

    // Kirim pesan awal "Okey, wait..."
    const sentMessage = await bot.sendMessage(chatId, "Okey, wait...");

    // Animasi loading
    const progressBar = [
        "ʟᴏᴀᴅ ᴍᴇɴᴜ",
        "[░░░░░░░░░░] 0%",
        "[█░░░░░░░░░] 10%",
        "[██░░░░░░░░] 20%",
        "[███░░░░░░░] 30%",
        "[████░░░░░░] 40%",
        "[█████░░░░░] 50%",
        "[██████░░░░] 60%",
        "[███████░░░] 70%",
        "[████████░░] 80%",
        "[█████████░] 90%",
        "[██████████] 100%",
        "̠F̠̠I̠̠N̠̠I̠̠S̠̠H̠̠E̠̠D̠",
    ];

    for (let i = 0; i < progressBar.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Tunggu 300ms
        await bot.editMessageText(progressBar[i], {
            chat_id: chatId,
            message_id: sentMessage.message_id
        });
    }

    // Baca daftar informasi dari file
    let menuList;
    try {
        menuList = JSON.parse(fs.readFileSync("menu.json", "utf8"));
    } catch (error) {
        return bot.sendMessage(chatId, "Gagal membaca daftar informasi.");
    }

    // Format daftar informasi
    const menuText = "📌 *𝑴𝑬𝑵𝑼 𝑩𝑶𝑻*\n\n" + menuList.map(cmd => `/${cmd}`).join("\n");

    // Ambil URL gambar dari config.json
    const config = getConfig();
    const thumbnailUrl = config.thumbnail;

    // Kirim gambar dengan caption informasi bot
    bot.sendPhoto(chatId, thumbnailUrl, {
        caption: menuText,
        parse_mode: "Markdown"
    });
});

// Perintah untuk mengganti gambar thumbnail
bot.onText(/\/setthumb (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const newThumbnail = match[1].trim();

    // Validasi URL
    if (!newThumbnail.startsWith("http://") && !newThumbnail.startsWith("https://")) {
        return bot.sendMessage(chatId, "URL gambar tidak valid. Gunakan URL yang diawali dengan http:// atau https://");
    }

    // Simpan URL gambar ke config.json
    const config = getConfig();
    config.thumbnail = newThumbnail;
    saveConfig(config);

    bot.sendMessage(chatId, "Thumbnail berhasil diperbarui!");
});

// Tambah informasi baru ke daftar
bot.onText(/\/upmenu (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const newCommand = match[1].trim();

    // Baca daftar informasi dari file
    let menuList;
    try {
        menuList = JSON.parse(fs.readFileSync("menu.json", "utf8"));
    } catch (error) {
        return bot.sendMessage(chatId, "Gagal membaca daftar informasi.");
    }

    // Cek apakah informasi sudah ada di daftar
    if (menuList.includes(newCommand)) {
        return bot.sendMessage(chatId, `Informasi "/${newCommand}" sudah ada.`);
    }

    // Tambahkan informasi baru dan urutkan berdasarkan abjad
    menuList.push(newCommand);
    menuList.sort((a, b) => a.localeCompare(b));

    // Simpan daftar informasi yang telah diperbarui
    try {
        fs.writeFileSync("menu.json", JSON.stringify(menuList, null, 2));
        bot.sendMessage(chatId, `Informasi "/${newCommand}" berhasil ditambahkan.`);
    } catch (error) {
        bot.sendMessage(chatId, "Gagal menyimpan daftar informasi.");
    }
});