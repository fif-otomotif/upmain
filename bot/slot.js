import { bot } from './bot.js';
import fs from "fs";

const SALDO_FILE = "saldo.json";
const fruits = ["🍒", "🍊", "🍉", "🍌", "🍎", "🍍", "🍇", "🍋", "🍓"];

// Load data saldo dari file
let saldoData = loadSaldo();

// Setiap jam 00:00, beri semua user bonus Rp5.000
setInterval(beriBonusHarian, 60 * 60 * 1000);

bot.onText(/\/slot/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Berikan saldo awal jika user baru
    if (!saldoData[userId]) {
        saldoData[userId] = 25000;
        saveSaldo();
    }

    let saldo = saldoData[userId];

    // Cek jika saldo kurang dari Rp5.000, langsung keluar
    if (saldo < 5000) {
        return bot.sendMessage(chatId, "⚠️ Saldo Anda kurang dari Rp5.000. Tidak bisa bermain slot.");
    }

    bot.sendMessage(chatId, `💰 Saldo Anda: Rp${saldo.toLocaleString()}\n🎰 Klik Spin untuk bermain!`, {
        reply_markup: { inline_keyboard: [[{ text: "Spin 🎰", callback_data: `slot_spin_${userId}` }]] }
    });
});

bot.on("callback_query", async (callbackQuery) => {
    const { message, data } = callbackQuery;
    const chatId = message.chat.id;
    const userId = callbackQuery.from.id;

    if (data.startsWith("slot_spin_")) {
        if (!saldoData[userId] || saldoData[userId] < 5000) {
            bot.answerCallbackQuery(callbackQuery.id, { text: "Saldo tidak cukup!", show_alert: true });
            return bot.editMessageText("⚠️ Saldo Anda tidak cukup untuk bermain. Sesi slot ditutup.", { chat_id: chatId, message_id: message.message_id });
        }

        saldoData[userId] -= 5000;
        saveSaldo();
        await spinSlot(chatId, message.message_id, userId);
    } else if (data === "slot_exit") {
        bot.deleteMessage(chatId, message.message_id);
    }
});

async function spinSlot(chatId, messageId, userId) {
    let slotAnimation = `🎰 | 🔄 | 🔄 | 🔄 |\n⏳ Mengacak...`;
    await editMessageSafely(chatId, messageId, slotAnimation);

    for (let i = 0; i < 6; i++) {
        let rolling = generateRandomSlots();
        await new Promise(resolve => setTimeout(resolve, 400));
        await editMessageSafely(chatId, messageId, rolling + `\n⏳ Mengacak...`);
    }

    let result = generateFinalSlots();
    let isJackpot = checkJackpot(result);

    if (isJackpot) {
        saldoData[userId] += 20000;
    } else {
        saldoData[userId] -= 10000;
    }

    saveSaldo();

    let saldoSekarang = saldoData[userId];

    let finalMessage = result + (isJackpot ? `\n🎉 **JACKPOT!** 🎉` : `\n❌ **Rungkad!** ❌`) +
        `\n💰 Saldo Anda: Rp${saldoSekarang.toLocaleString()}`;

    if (saldoSekarang < 5000) {
        finalMessage += `\n⚠️ Saldo Anda kurang dari Rp5.000. Sesi slot ditutup.`;
        await bot.editMessageText(finalMessage, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown" });
        return;
    }

    await editMessageSafely(chatId, messageId, finalMessage, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "Spin Lagi 🎰", callback_data: `slot_spin_${userId}` }],
                [{ text: "Keluar ❌", callback_data: "slot_exit" }]
            ]
        }
    });
}

async function editMessageSafely(chatId, messageId, newText, extraOptions = {}) {
    try {
        await bot.editMessageText(newText, { chat_id: chatId, message_id: messageId, ...extraOptions });
    } catch (error) {
        if (error.response && error.response.body.description.includes("message is not modified")) return;
        console.error("Error saat mengedit pesan:", error);
    }
}

function generateRandomSlots() {
    let row = [];
    for (let i = 0; i < 3; i++) {
        row.push(getRandomFruit());
    }
    return `🎰 | ${row.join(" | ")} |`;
}

function generateFinalSlots() {
    if (Math.random() < 0.35) {
        let jackpotFruit = fruits[Math.floor(Math.random() * fruits.length)];
        return `🎰 | ${jackpotFruit} | ${jackpotFruit} | ${jackpotFruit} |`;
    } else {
        return generateRandomSlots();
    }
}

function checkJackpot(slotText) {
    let parts = slotText.split("|").map(e => e.trim()).slice(1, 4);
    return (parts[0] === parts[1] && parts[1] === parts[2]);
}

function getRandomFruit() {
    return fruits[Math.floor(Math.random() * fruits.length)];
}

function saveSaldo() {
    fs.writeFileSync(SALDO_FILE, JSON.stringify(saldoData, null, 2));
}

function loadSaldo() {
    if (fs.existsSync(SALDO_FILE)) {
        return JSON.parse(fs.readFileSync(SALDO_FILE));
    }
    return {};
}

function beriBonusHarian() {
    let now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        for (let userId in saldoData) {
            saldoData[userId] += 5000;
        }
        saveSaldo();
        console.log("Bonus harian telah diberikan!");
    }
}