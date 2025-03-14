import { bot } from './bot.js';
import axios from "axios";

let visitProcesses = {}; // Menyimpan proses kunjungan untuk tiap user

bot.onText(/\/stbot/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Masukkan URL website yang ingin dikunjungi terus-menerus:");
    bot.once('message', async (urlMsg) => {
        const url = urlMsg.text.trim();
        if (!url.startsWith("http")) {
            return bot.sendMessage(chatId, "URL tidak valid! Harus dimulai dengan http atau https.");
        }

        let count = 0;
        const message = await bot.sendMessage(chatId, `Proses ke: 0`, {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Hentikan", callback_data: `stop_${chatId}` }]]
            }
        });

        visitProcesses[chatId] = setInterval(async () => {
            try {
                await axios.get(url);
                count++;
                bot.editMessageText(`Proses ke: ${count}`, {
                    chat_id: chatId,
                    message_id: message.message_id,
                    reply_markup: {
                        inline_keyboard: [[{ text: "❌ Hentikan", callback_data: `stop_${chatId}` }]]
                    }
                });
            } catch (error) {
                bot.editMessageText(`Gagal mengunjungi website! Proses dihentikan.`, {
                    chat_id: chatId,
                    message_id: message.message_id
                });
                clearInterval(visitProcesses[chatId]);
                delete visitProcesses[chatId];
            }
        }, 1000); // Kunjungi setiap 5 detik
    });
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    if (query.data === `stop_${chatId}`) {
        if (visitProcesses[chatId]) {
            clearInterval(visitProcesses[chatId]);
            delete visitProcesses[chatId];
            bot.editMessageText("Proses dihentikan!", { chat_id: chatId, message_id: query.message.message_id });
        }
    }
});