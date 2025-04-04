const nglsesi = {};
const DEFAULT_DELAY = 2000; // Delay default 2 detik

async function sendNGLMessage(username, message) {
    try {
        const url = "https://ngl.link/api/submit";
        const payload = {
            username: username,
            question: message,
            deviceId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            gameSlug: "",
            referrer: "",
        };

        const response = await axios.post(url, payload, {
            headers: { "Content-Type": "application/json" },
        });

        return response.data.success;
    } catch (error) {
        console.error("❌ Error:", error.message);
        return false;
    }
}

bot.onText(/\/spamngl/, (msg) => {
    const chatId = msg.chat.id;
    nglsesi[chatId] = { step: "awaiting_ngl_link" };
    bot.sendMessage(chatId, "🔗 Masukkan link NGL:");
});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    if (!nglsesi[chatId]) return;

    const session = nglsesi[chatId];

    if (session.step === "awaiting_ngl_link") {
        if (!msg.text.includes("ngl.link")) {
            return bot.sendMessage(chatId, "❌ Link tidak valid! Masukkan link NGL yang benar.");
        }

        session.nglUsername = msg.text.split("/")[3];
        session.step = "awaiting_message";

        bot.sendMessage(chatId, "💬 Masukkan pesan untuk spamming:");
    } else if (session.step === "awaiting_message") {
        session.message = msg.text;
        session.step = "spamming";

        bot.sendMessage(chatId, "⚡ Spamming dimulai! Gunakan /stopngl untuk menghentikan.");

        session.spamInterval = setInterval(async () => {
            await sendNGLMessage(session.nglUsername, session.message);
        }, DEFAULT_DELAY);
    }
});

bot.onText(/\/stopngl/, (msg) => {
    const chatId = msg.chat.id;
    const session = nglsesi[chatId];

    if (session && session.spamInterval) {
        clearInterval(session.spamInterval);
        bot.sendMessage(chatId, "🛑 Spamming dihentikan.");
        delete nglsesi[chatId];
    } else {
        bot.sendMessage(chatId, "❌ Tidak ada spamming yang berjalan.");
    }
});