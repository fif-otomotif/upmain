const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");

// Ganti dengan token bot kamu
const TOKEN = "7827504152:AAFR5DFPf7QY836WQOQoUgmqZf8ye7_sUcY";
const bot = new TelegramBot(TOKEN, { polling: true });

// Status remote Termux per user
const termuxStatus = {};
const userRequests = {};

// 🖥️ Perintah /termux untuk kontrol remote Termux
bot.onText(/\/termux/, (msg) => {
    const chatId = msg.chat.id;
    const status = termuxStatus[chatId] || "OFF";

    bot.sendMessage(chatId, `🔹 Remote Termux saat ini: *${status}*`, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: status === "OFF" ? "🟢 ON" : "🔴 OFF", callback_data: "toggle_termux" }]
            ]
        }
    });
});

// 🔄 Proses tombol ON/OFF
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === "toggle_termux") {
        termuxStatus[chatId] = termuxStatus[chatId] === "ON" ? "OFF" : "ON";
        const status = termuxStatus[chatId];

        bot.answerCallbackQuery(query.id, { text: `✅ Remote Termux ${status}` });
        bot.editMessageText(`🔹 Remote Termux saat ini: *${status}*`, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: status === "OFF" ? "🟢 ON" : "🔴 OFF", callback_data: "toggle_termux" }]
                ]
            }
        });
    }
});

// 🖥️ Menjalankan perintah di Termux
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.startsWith("/") || termuxStatus[chatId] !== "ON") return;

    bot.sendMessage(chatId, `⏳ Menjalankan perintah: \`${text}\``, { parse_mode: "Markdown" });

    exec(text, (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(chatId, `❌ Error:\n\`${stderr}\``, { parse_mode: "Markdown" });
        } else {
            bot.sendMessage(chatId, `✅ Output:\n\`${stdout || "(tidak ada output)"}\``, { parse_mode: "Markdown" });
        }
    });
});

// 🎥 Fitur Brat Video Generator
bot.onText(/\/brat (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];
    const encodedText = encodeURIComponent(text);
    const videoUrl = `https://api.sycze.my.id/bratvid?text=${encodedText}`;

    bot.sendMessage(chatId, "⏳ Sedang memproses video...");

    try {
        const response = await axios({
            url: videoUrl,
            method: "GET",
            responseType: "stream",
        });

        const videoPath = `bratvid_${chatId}.mp4`;
        const writer = fs.createWriteStream(videoPath);
        response.data.pipe(writer);

        writer.on("finish", () => {
            bot.sendVideo(chatId, videoPath, { caption: "🎥 Ini videonya!" }).then(() => {
                fs.unlinkSync(videoPath);
            });
        });

    } catch (error) {
        bot.sendMessage(chatId, "❌ Gagal mengambil video.");
        console.error(error);
    }
});

// 📸 Perintah /ssweb dengan validasi URL
bot.onText(/\/ssweb (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    let url = match[1].trim();

    // Tambahkan protokol jika tidak ada
    if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
    }

    // Validasi format URL
    try {
        new URL(url);
    } catch (e) {
        return bot.sendMessage(
            chatId,
            "❌ Format URL tidak valid. Contoh penggunaan:\n/ssweb google.com"
        );
    }

    userRequests[chatId] = { url };

    bot.sendMessage(chatId, "🔹 Pilih tema & perangkat:", {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🌞 Light", callback_data: "light" },
                    { text: "🌙 Dark", callback_data: "dark" }
                ],
                [
                    { text: "🖥️ Desktop", callback_data: "desktop" },
                    { text: "📱 Mobile", callback_data: "mobile" }
                ]
            ]
        }
    });
});

// 📌 Proses tombol SSWeb yang ditingkatkan
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!userRequests[chatId]) {
        return bot.answerCallbackQuery(query.id, { text: "❌ Sesuatu salah! Coba lagi." });
    }

    // Simpan pilihan user
    if (["light", "dark"].includes(data)) {
        userRequests[chatId].theme = data;
        bot.answerCallbackQuery(query.id, { text: `🎨 Tema: ${data}` });
    } else if (["desktop", "mobile"].includes(data)) {
        userRequests[chatId].device = data;
        bot.answerCallbackQuery(query.id, { text: `📱 Perangkat: ${data}` });
    }

    // Proses jika semua pilihan sudah dipilih
    const { url, theme, device } = userRequests[chatId];
    if (theme && device) {
        let filename;
        try {
            // Konfigurasi API
            const encodedUrl = encodeURIComponent(url);
            const apiUrl = `https://api.siputzx.my.id/api/tools/ssweb?url=${encodedUrl}&theme=${theme}&device=${device}`;
            
            // Kirim pesan progres
            const { message_id: progressMsgId } = await bot.sendMessage(chatId, "⏳ Mengambil screenshot...");

            // Fetch gambar
            const response = await axios({
                url: apiUrl,
                method: "GET",
                responseType: "arraybuffer",
                timeout: 30000, // Timeout 30 detik
                validateStatus: status => status === 200
            });

            // Validasi tipe konten
            const contentType = response.headers['content-type'];
            if (!contentType.startsWith('image/')) {
                throw new Error(`Respons API invalid: ${contentType}`);
            }

            // Simpan gambar
            const ext = contentType.split('/')[1] || 'png';
            filename = `ss_${chatId}_${Date.now()}.${ext}`;
            fs.writeFileSync(filename, response.data);

            // Kirim hasil
            await bot.sendPhoto(
                chatId,
                fs.createReadStream(filename),
                { caption: `📸 Screenshot dari: ${url}\nTema: ${theme} | Perangkat: ${device}` }
            );

            // Hapus pesan progres
            await bot.deleteMessage(chatId, progressMsgId);

        } catch (error) {
            console.error('[SSWEB ERROR]', error);
            
            // Edit pesan error
            const errorText = "❌ Gagal mengambil screenshot. Kemungkinan penyebab:\n1. Website tidak diizinkan\n2. Server down\n3. Format tidak didukung";
            if (error.response) {
                errorText += `\nKode error: ${error.response.status}`;
            }
            
            await bot.editMessageText(errorText, {
                chat_id: chatId,
                message_id: progressMsgId
            });
        } finally {
            // Bersihkan data
            delete userRequests[chatId];
            if (filename) fs.unlinkSync(filename);
        }
    }
});

// 📌 Perintah /qr untuk membuat QR Code dari teks
bot.onText(/\/qr (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];
    const encodedText = encodeURIComponent(text);
    const qrUrl = `https://api.siputzx.my.id/api/tools/text2qr?text=${encodedText}`;

    bot.sendMessage(chatId, "⏳ Membuat QR Code...");

    try {
        const response = await axios({
            url: qrUrl,
            method: "GET",
            responseType: "arraybuffer",
        });

        const qrPath = `qr_${chatId}.png`;
        fs.writeFileSync(qrPath, response.data);

        bot.sendPhoto(chatId, qrPath, { caption: `📌 QR Code untuk: \`${text}\`` })
            .then(() => {
                setTimeout(() => fs.unlinkSync(qrPath), 60000);
            });

    } catch (error) {
        bot.sendMessage(chatId, "❌ Gagal membuat QR Code.");
        console.error(error);
    }
});

// Jalankan bot
console.log("✅ Bot Telegram aktif...");