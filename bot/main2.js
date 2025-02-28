const TelegramBot = require("node-telegram-bot-api");
const { exec } = require("child_process");
const fs = require("fs");

const TOKEN = "7827504152:AAFR5DFPf7QY836WQOQoUgmqZf8ye7_sUcY"; // Ganti dengan token botmu
const FILE_USERS = "users.json";
const FILE_BANNED = "banned.json";
const FILE_LOG = "log.txt";
const FILE_COMMANDS = "commands.json";

const bot = new TelegramBot(TOKEN, { polling: true });
let termuxControl = false;
let adminMode = false;

let users = fs.existsSync(FILE_USERS) ? JSON.parse(fs.readFileSync(FILE_USERS, "utf8")) : {};
let banned = fs.existsSync(FILE_BANNED) ? JSON.parse(fs.readFileSync(FILE_BANNED, "utf8")) : {};
let commands = fs.existsSync(FILE_COMMANDS) ? JSON.parse(fs.readFileSync(FILE_COMMANDS, "utf8")) : {};

function simpanData() {
    fs.writeFileSync(FILE_USERS, JSON.stringify(users, null, 2));
    fs.writeFileSync(FILE_BANNED, JSON.stringify(banned, null, 2));
    fs.writeFileSync(FILE_COMMANDS, JSON.stringify(commands, null, 2));
}

function logAktivitas(chatId, username, pesan) {
    const waktu = new Date().toLocaleString();
    fs.appendFileSync(FILE_LOG, `[${waktu}] ${username} (${chatId}): ${pesan}\n`);
}

function isAdmin(chatId) {
    return users[chatId] && users[chatId].role === "admin";
}

// 🔹 Tambah Admin dengan Username Unik
bot.onText(/\/addadmin/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return bot.sendMessage(chatId, "⛔ Hanya admin yang bisa menambahkan admin!");

    const usernameBaru = `@${Math.random().toString(36).substr(2, 8)}_${Date.now().toString(36)}`;
    bot.sendMessage(chatId, `✅ Admin baru dapat menggunakan username ini:\n\n\`${usernameBaru}\``, { parse_mode: "Markdown" });
});

// 🔹 Unban User
bot.onText(/\/unban (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return bot.sendMessage(chatId, "⛔ Hanya admin yang bisa unban user!");

    const username = match[1];
    const userId = Object.keys(banned).find(id => banned[id].username === username);

    if (!userId) return bot.sendMessage(chatId, "⚠️ Username tidak ditemukan dalam daftar banned!");

    delete banned[userId];
    simpanData();
    bot.sendMessage(chatId, `✅ User *${username}* telah di-unban!`, { parse_mode: "Markdown" });
});

// 🔹 Backup & Restore Database
bot.onText(/\/backup/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return bot.sendMessage(chatId, "⛔ Hanya admin yang bisa backup database!");

    bot.sendDocument(chatId, FILE_USERS);
    bot.sendDocument(chatId, FILE_BANNED);
});

bot.on("document", (msg) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return;

    const fileId = msg.document.file_id;
    bot.getFile(fileId).then((file) => {
        const filePath = file.file_path;
        bot.downloadFile(filePath, ".").then(() => {
            bot.sendMessage(chatId, "✅ Database berhasil dipulihkan!");
            users = JSON.parse(fs.readFileSync(FILE_USERS, "utf8"));
            banned = JSON.parse(fs.readFileSync(FILE_BANNED, "utf8"));
        });
    });
});

// 🔹 Mode Hanya Admin
bot.onText(/\/adminmode (on|off)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return bot.sendMessage(chatId, "⛔ Hanya admin yang bisa mengubah mode ini!");

    adminMode = match[1] === "on";
    bot.sendMessage(chatId, `🔒 Mode hanya admin: *${adminMode ? "AKTIF" : "NONAKTIF"}*`, { parse_mode: "Markdown" });
});

// 🔹 Perintah Custom
bot.onText(/\/addcmd (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return bot.sendMessage(chatId, "⛔ Hanya admin yang bisa menambahkan perintah!");

    const cmd = match[1].toLowerCase();
    const response = match[2];
    commands[cmd] = response;
    simpanData();
    bot.sendMessage(chatId, `✅ Perintah /${cmd} telah ditambahkan!`);
});

bot.onText(/\/delcmd (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return bot.sendMessage(chatId, "⛔ Hanya admin yang bisa menghapus perintah!");

    const cmd = match[1].toLowerCase();
    if (!commands[cmd]) return bot.sendMessage(chatId, "⚠️ Perintah tidak ditemukan!");

    delete commands[cmd];
    simpanData();
    bot.sendMessage(chatId, `✅ Perintah /${cmd} telah dihapus!`);
});

// 🔹 Jalankan perintah custom jika tersedia
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    if (!users[chatId] || banned[chatId] || text.startsWith("/")) return;
    if (adminMode && !isAdmin(chatId)) return bot.sendMessage(chatId, "⚠️ Bot sedang dalam mode hanya admin!");

    if (commands[text]) return bot.sendMessage(chatId, commands[text]);

    logAktivitas(chatId, users[chatId] ? users[chatId].username : "Guest", text);
});

// 🔹 Kontrol Termux ON/OFF
bot.onText(/\/termux (on|off)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAdmin(chatId)) return bot.sendMessage(chatId, "⛔ Hanya admin yang bisa mengontrol Termux!");

    termuxControl = match[1] === "on";
    bot.sendMessage(chatId, `📟 Kontrol Termux: *${termuxControl ? "AKTIF" : "NONAKTIF"}*`, { parse_mode: "Markdown" });
});

// 🔹 Jalankan perintah Termux jika kontrol aktif
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!users[chatId] || banned[chatId] || text.startsWith("/")) return;
    if (!termuxControl) return bot.sendMessage(chatId, "❌ Remote Termux tidak aktif! Hidupkan dengan `/termux on`.");

    exec(text, (error, stdout, stderr) => {
        if (error) return bot.sendMessage(chatId, `⚠️ Error: ${error.message}`);
        if (stderr) return bot.sendMessage(chatId, `⚠️ Stderr: ${stderr}`);
        bot.sendMessage(chatId, `✅ Output:\n\`\`\`${stdout || "Perintah berhasil tanpa output"}\`\`\``, { parse_mode: "Markdown" });
    });
});

console.log("🤖 Bot berjalan...");