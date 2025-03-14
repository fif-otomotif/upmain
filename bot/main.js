import { bot } from './bot.js';
import axios from "axios";
import { exec } from "child_process";
import fs from "fs";

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
    const text = msg.text || "";
if (!text || text.startsWith("/") || termuxStatus[chatId] !== "ON") return;

    bot.sendMessage(chatId, `⏳ Menjalankan perintah: \`${text}\``, { parse_mode: "Markdown" });

    exec(text, (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(chatId, `❌ Error:\n\`${stderr}\``, { parse_mode: "Markdown" });
        } else {
            bot.sendMessage(chatId, `✅ Output:\n\`${stdout || "(tidak ada output)"}\``, { parse_mode: "Markdown" });
        }
    });
});