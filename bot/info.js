import { bot } from './bot.js';
import fs from "fs";
const path = "./listpc.txt";

// Fungsi mencatat pengguna yang chat dengan bot
function saveUser(username, id) {
    let data = {};
    
    if (fs.existsSync(path)) {
        let rawData = fs.readFileSync(path, "utf8");
        rawData.split("\n").forEach(line => {
            let match = line.match(/^(\d+)\. (.*?) \| (\d+) = (\d+)$/);
            if (match) {
                data[match[3]] = {
                    username: match[2],
                    id: match[3],
                    count: parseInt(match[4])
                };
            }
        });
    }

    if (data[id]) {
        data[id].count += 1;
    } else {
        data[id] = { username, id, count: 1 };
    }

    let newData = Object.values(data)
        .map((user, index) => `${index + 1}. [${user.username}] | [${user.id}] = (${user.count})`)
        .join("\n");

    fs.writeFileSync(path, newData, "utf8");
}

// Event menangkap semua chat ke bot
bot.on("message", async (msg) => {
    if (msg.chat.type === "private") {
        let username = msg.from.username || "NoUsername";
        let id = msg.from.id;
        saveUser(username, id);
    }
});

// Perintah /listpc untuk mengirimkan file daftar pengguna
bot.onText(/\/listpc/, async (msg) => {
    let chatId = msg.chat.id;
    
    if (fs.existsSync(path)) {
        await bot.sendDocument(chatId, path, { caption: "Daftar pengguna yang pernah chat dengan bot." });
    } else {
        bot.sendMessage(chatId, "Belum ada pengguna yang chat dengan bot.");
    }
});