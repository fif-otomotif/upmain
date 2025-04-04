import { bot } from './bot.js';
import { fileURLToPath } from "url";
import { dirname } from "path";
import axios from "axios";
import fs from "fs";

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

async function translateText(text, targetLang = 'id') {
    try {
        const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
            params: {
                client: 'gtx',
                sl: 'en',
                tl: targetLang,
                dt: 't',
                q: text
            }
        });
        return response.data[0].map(t => t[0]).join("");
    } catch (error) {
        return "❌ Gagal menerjemahkan teks.";
    }
}

bot.onText(/\/fact/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        const factEnglish = response.data.text;
        const factIndo = await translateText(factEnglish, 'id');

        bot.sendMessage(chatId, `🔍 *Fakta Menarik* 🔍\n\n${factIndo}`, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔄 Fakta Lagi!", callback_data: "fact_again" }],
                    [{ text: "❌ Berhenti", callback_data: "fact_stop" }]
                ]
            }
        });

    } catch (error) {
        bot.sendMessage(chatId, "❌ Gagal mengambil fakta. Coba lagi nanti.");
    }
});

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === "fact_again") {
        try {
            const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            const factEnglish = response.data.text;
            const factIndo = await translateText(factEnglish, 'id');

            bot.editMessageText(`🔍 *Fakta Menarik* 🔍\n\n${factIndo}`, {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔄 Fakta Lagi!", callback_data: "fact_again" }],
                        [{ text: "❌ Berhenti", callback_data: "fact_stop" }]
                    ]
                }
            });

        } catch (error) {
            bot.answerCallbackQuery(callbackQuery.id, { text: "Gagal mengambil fakta!", show_alert: true });
        }
    } else if (data === "fact_stop") {
        bot.deleteMessage(chatId, callbackQuery.message.message_id);
    }
});

bot.onText(/\/faktaharian/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await axios.get("https://id.wikipedia.org/api/rest_v1/page/random/summary");
        const data = response.data;
        
        // Ambil data penting
        const judul = data.title;
        const fakta = data.extract;
        const sumber = data.content_urls.desktop.page;
        const gambar = data.originalimage ? data.originalimage.source : null;

        if (gambar) {
            bot.sendPhoto(chatId, gambar, { 
                caption: `📌 *${judul}*\n\n${fakta}\n\n🔗 [Sumber](${sumber})`, 
                parse_mode: "Markdown",
                disable_web_page_preview: true
            });
        } else {
            bot.sendMessage(chatId, `📌 *${judul}*\n\n${fakta}\n\n🔗 [Sumber](${sumber})`, { 
                parse_mode: "Markdown",
                disable_web_page_preview: true
            });
        }
    } catch (error) {
        bot.sendMessage(chatId, "❌ Gagal mengambil fakta. Coba lagi nanti.", { 
            disable_web_page_preview: true 
        });
    }
});