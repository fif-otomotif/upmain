import fs from "fs";
import { exec } from "child_process";
import { bot } from './bot.js';

const startTime = Date.now(); // Waktu bot mulai berjalan
const IGNORED_USER_ID = 6202819748; // ID yang tidak dihitung dalam statistik

// Fungsi membaca atau membuat stats.json jika belum ada
const loadStats = () => {
    if (!fs.existsSync('stats.json')) {
        fs.writeFileSync('stats.json', JSON.stringify({
            total_users: 0,
            total_messages: 0,
            commands_used: {}
        }, null, 2));
    }
    return JSON.parse(fs.readFileSync('stats.json'));
};

// Fungsi membaca atau membuat commands.json jika belum ada
const loadCommands = () => {
    if (!fs.existsSync('commands.json')) {
        fs.writeFileSync('commands.json', JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync('commands.json'));
};

// Fungsi memperbarui statistik & menambah command baru
const updateStats = (userId, command) => {
    if (userId === IGNORED_USER_ID) return; // Abaikan user ID yang dikecualikan

    let stats = loadStats();
    let commands = loadCommands();

    // Tambah total pesan
    stats.total_messages += 1;

    // Tambah user jika belum terdaftar
    if (!stats.users) stats.users = [];
    if (!stats.users.includes(userId)) {
        stats.users.push(userId);
        stats.total_users = stats.users.length;
    }

    // Hitung penggunaan perintah
    if (!stats.commands_used[command]) {
        stats.commands_used[command] = 1;
    } else {
        stats.commands_used[command] += 1;
    }

    // Tambahkan command baru ke commands.json jika belum ada
    if (!commands[command]) {
        commands[command] = "Perintah otomatis terdeteksi";
    }

    // Simpan perubahan ke file
    fs.writeFileSync('stats.json', JSON.stringify(stats, null, 2));
    fs.writeFileSync('commands.json', JSON.stringify(commands, null, 2));
};

// Fungsi mendapatkan penggunaan CPU & RAM (khusus Linux)
const getSystemUsage = () => {
    try {
        const cpu = execSync("top -bn1 | grep 'Cpu' | awk '{print $2}'").toString().trim();
        const ram = execSync("free -m | awk 'NR==2{printf \"%.2f%%\", $3*100/$2 }'").toString().trim();
        return `CPU: ${cpu}%\nRAM: ${ram}%`;
    } catch (err) {
        return "Tidak bisa mengambil data CPU/RAM.";
    }
};

// Fungsi menampilkan dashboard
const getDashboard = () => {
    const stats = loadStats();
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const uptimeStr = new Date(uptime * 1000).toISOString().substr(11, 8);

    let commandStats = "";
    for (const [cmd, count] of Object.entries(stats.commands_used)) {
        const percent = ((count / stats.total_messages) * 100).toFixed(2);
        commandStats += `${cmd}: ${count} kali (${percent}%)\n`;
    }

    return `📊 *DASHBOARD BOT* 📊\n\n` +
        `👥 *Total User:* ${stats.total_users}\n` +
        `📨 *Total Pesan:* ${stats.total_messages}\n` +
        `⏳ *Uptime:* ${uptimeStr}\n` +
        `🔧 *Status Server:*\n${getSystemUsage()}\n\n` +
        `📈 *Penggunaan Perintah:*\n${commandStats || "Belum ada data"}\n` +
        `🛠 *Versi Bot:* 1.0.0`;
};

// Handler untuk mencatat semua perintah
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || "";
if (text.startsWith('/')) {
        updateStats(chatId, text);
    }
});

// Handler perintah /dashboard
bot.onText(/\/dashboard/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, getDashboard(), { parse_mode: "Markdown" });
});