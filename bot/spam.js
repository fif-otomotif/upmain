import { bot } from './bot.js';

const spamData = new Map(); // Menggunakan Map untuk menyimpan sesi spamming

// Perintah /spamming
bot.onText(/\/spamming/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Masukkan ID Telegram target:");

    bot.once("message", async (msg) => {
        const targetId = msg.text.trim();
        if (isNaN(targetId)) return bot.sendMessage(chatId, "ID tidak valid!");

        bot.sendMessage(chatId, "Masukkan teks yang akan dikirim:");

        bot.once("message", async (msg) => {
            const spamText = msg.text;
            bot.sendMessage(chatId, "Spamming dimulai...", {
                reply_markup: {
                    inline_keyboard: [[{ text: "🛑 Stop Spamming", callback_data: `stop_spam_${chatId}` }]]
                }
            }).then((statusMsg) => {
                startSpamming(chatId, targetId, spamText, statusMsg.message_id);
            });
        });
    });
});

// Fungsi memulai spamming tanpa delay
async function startSpamming(userId, targetId, text, statusMsgId) {
    let count = 0;
    spamData.set(userId, true);

    const spamLoop = async () => {
        while (spamData.get(userId)) {
            try {
                await bot.sendMessage(targetId, text);
                count++;

                await bot.editMessageText(`📢 Spamming berjalan...\n🔹 Target: ${targetId}\n🔹 Pesan terkirim: ${count}`, {
                    chat_id: userId,
                    message_id: statusMsgId,
                    reply_markup: {
                        inline_keyboard: [[{ text: "🛑 Stop Spamming", callback_data: `stop_spam_${userId}` }]]
                    }
                });
            } catch (err) {
                bot.sendMessage(userId, "⚠️ Gagal mengirim pesan! Mungkin ID target tidak valid atau bot diblokir.");
                stopSpamming(userId);
                break;
            }
        }
    };

    spamLoop();
}

// Fungsi menghentikan spamming
function stopSpamming(userId) {
    if (spamData.has(userId)) {
        spamData.set(userId, false);
        bot.sendMessage(userId, "✅ Spamming dihentikan.");
    }
}

// Menangani tombol stop
bot.on("callback_query", (query) => {
    if (query.data.startsWith("stop_spam_")) {
        const userId = query.data.split("_")[2];
        stopSpamming(userId);
        bot.editMessageText("❌ Spamming dihentikan.", {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        });
    }
});