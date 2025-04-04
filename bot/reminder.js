import { bot } from './bot.js';
import fs from "fs";

const TOKEN = "7827504152:AAG8mfWl81w2n5E7NWCJlaEwLyQrd8KKqfM";

const reminderFile = "reminders.json";
let reminders = loadReminders(); // Load data pengingat saat bot dimulai

// Fungsi untuk membaca pengingat dari file
function loadReminders() {
    if (fs.existsSync(reminderFile)) {
        return JSON.parse(fs.readFileSync(reminderFile));
    }
    return {};
}

// Fungsi untuk menyimpan pengingat ke file
function saveReminders() {
    fs.writeFileSync(reminderFile, JSON.stringify(reminders, null, 2));
}

// Fungsi untuk menampilkan format waktu
function parseTime(input) {
    const match = input.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return null;
    
    let value = parseInt(match[1]);
    let unit = match[2];

    switch (unit) {
        case "s": return value * 1000; // detik ke milidetik
        case "m": return value * 60 * 1000; // menit ke milidetik
        case "h": return value * 60 * 60 * 1000; // jam ke milidetik
        case "d": return value * 24 * 60 * 60 * 1000; // hari ke milidetik
        default: return null;
    }
}

// Fungsi untuk menampilkan cara penggunaan
function showUsage(chatId) {
    bot.sendMessage(chatId, "🕰️ *Cara menggunakan reminders:*\n\n" +
        "1️⃣ Tambah pengingat:\n" +
        "`/reminders <waktu> <pesan>`\n" +
        "Contoh: `/reminders 10m Minum air`\n\n" +
        "📌 *Format waktu yang didukung:*\n" +
        "- `10s` → 10 detik\n" +
        "- `5m` → 5 menit\n" +
        "- `2h` → 2 jam\n" +
        "- `1d` → 1 hari\n\n" +
        "2️⃣ Lihat daftar pengingat:\n`/reminders list`\n\n" +
        "3️⃣ Hapus pengingat berdasarkan ID:\n`/reminders delete <ID>`\n" +
        "Contoh: `/reminders delete 2`\n\n" +
        "4️⃣ Hapus semua pengingat:\n`/reminders clear`\n",
        { parse_mode: "Markdown" }
    );
}

// Menangani perintah `/reminder`
bot.onText(/^\/reminders(?:\s(.+))?$/, (msg, match) => {
    const chatId = msg.chat.id;
    const args = match[1];

    if (!args) {
        showUsage(chatId);
        return;
    }

    const words = args.split(" ");
    if (words[0] === "list") {
        if (!reminders[chatId] || reminders[chatId].length === 0) {
            bot.sendMessage(chatId, "📭 Tidak ada pengingat aktif.");
            return;
        }

        let message = "📌 *Daftar Pengingat:*\n";
        reminders[chatId].forEach((r, i) => {
            message += `\n${i + 1}. ${r.text} (${r.time})`;
        });
        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
        return;
    }

    if (words[0] === "delete") {
        if (!words[1] || isNaN(words[1])) {
            bot.sendMessage(chatId, "⚠️ Gunakan format: `/reminder delete <ID>`.");
            return;
        }

        let id = parseInt(words[1]) - 1;
        if (!reminders[chatId] || !reminders[chatId][id]) {
            bot.sendMessage(chatId, "⚠️ ID tidak ditemukan.");
            return;
        }

        let removed = reminders[chatId].splice(id, 1);
        saveReminders();
        bot.sendMessage(chatId, `✅ Pengingat *"${removed[0].text}"* telah dihapus.`);
        return;
    }

    if (words[0] === "clear") {
        reminders[chatId] = [];
        saveReminders();
        bot.sendMessage(chatId, "✅ Semua pengingat telah dihapus.");
        return;
    }

    let timeStr = words.shift();
    let text = words.join(" ");
    let timeMs = parseTime(timeStr);

    if (!timeMs || !text) {
        bot.sendMessage(chatId, "⚠️ Format salah! Gunakan `/reminder <waktu> <pesan>`.");
        return;
    }

    if (!reminders[chatId]) reminders[chatId] = [];
    let reminderId = reminders[chatId].length + 1;
    reminders[chatId].push({ id: reminderId, text, time: timeStr });
    saveReminders();

    bot.sendMessage(chatId, `⏳ Pengingat *"${text}"* dalam *${timeStr}* telah disimpan.`);

    setTimeout(() => {
        bot.sendMessage(chatId, `🔔 *Pengingat:*\n${text}`, { parse_mode: "Markdown" });

        // Hapus pengingat setelah dikirim
        reminders[chatId] = reminders[chatId].filter(r => r.text !== text);
        saveReminders();
    }, timeMs);
});