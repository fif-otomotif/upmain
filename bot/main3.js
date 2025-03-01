import bot from './bot.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import fs from "fs";
import axios from "axios";
import schedule from "node-schedule";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import path from "path";
import { fileURLToPath } from "url";
import FormData from "form-data";
import { exec } from "child_process";
import cloudscraper from 'cloudscraper';
import moment from "moment-timezone";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMGBB_API_KEY = "9a6c7db46a74e55dbdd80b0e0620087d";

const FILE_USERS = path.join(__dirname, "users.json");
const FILE_FORUM = "forum_users.json";
const FILE_CODES = "admin_codes.json";
const userMessages = {};
const DEFAULT_VIDEO = path.join(__dirname, "pagi.mp4");
const FILE_SCHEDULE = path.join(__dirname, "schedule.json"); // ✅ Tambahkan ini
const caption = "SeLaMat PaGi TemAn TemAn Qu";
const ADMIN_ID = "6202819748";
const TELEGRAM_USER_ID = 6202819748;
const games = new Map();
const awaitingOpponent = new Map();
const waitingForImage = new Map();
const jamAktif = new Map();
const userSessions = {};
const ytsSessions = {};
const aiSessions = {};
const userState = {};
const uploadStatus = {};
const activeClock = {};
let autoAI = {};
let promptAI = {};
let bratData = {};
let kbbiData = {};
let kalkulatorData = {};
let userSearchResults = {};
let stopMotionData = {};
const settingsFile = "settings.json";

// Debugging polling error
bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

let tempSchedule = {};

let scheduledJob = null; // Simpan jadwal saat ini

// Load database
let users = fs.existsSync(FILE_USERS) ? JSON.parse(fs.readFileSync(FILE_USERS)) : {};
let forumUsers = fs.existsSync(FILE_FORUM) ? JSON.parse(fs.readFileSync(FILE_FORUM)) : {};
let adminCodes = fs.existsSync(FILE_CODES) ? JSON.parse(fs.readFileSync(FILE_CODES)) : {};

// Simpan database
function simpanData() {
    fs.writeFileSync(FILE_USERS, JSON.stringify(users, null, 2));
    fs.writeFileSync(FILE_FORUM, JSON.stringify(forumUsers, null, 2));
    fs.writeFileSync(FILE_CODES, JSON.stringify(adminCodes, null, 2));
}

// Daftar perintah yang valid
const validCommands = [
    "/register", "/profile", "/logout", "/forum on", "/forum off",
    "/addkode", "/pluskode", "/deladmin", "/wikipedia", "/nulis", "/stalker", "/addmsg", "/listmsg", "/delmsg", "/start", "/help", "/ngl", "/tts", "/report", "/kbbi", "/jadwalpagi", "/senduser", "/tourl", "/aiimg", "/aiimgf", "/kalender", "/suit", "/webrec", "/shai", "/rmbg", "/selfie", "/ai", "/yts", "/sendb", "/igdm", "/pin", "/artime", "/editrole", "/robloxstalk", "/autoai", "/promptai", "/getpp", "/brat", "/spy", "/igstalk", "/cuaca", "/tourl2", "/text2binary", "/binary2text", "/ping", "/ttstalk", "/gempa", "/dewatermark", "/ttt", "/hd", "/spy2", "/up", "/itung", "/aideck", "/translate", "/stopmotion", "/rngyt", "/menu", "/teksanim", "/jam",
];

// 🔹 Handle pesan yang tidak dikenal
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Jika pesan adalah perintah dan tidak ada dalam daftar perintah valid
    if (text && text.startsWith("/") && !validCommands.some(cmd => text.startsWith(cmd))) {
        bot.sendMessage(chatId, `❌ Perintah *${text}* tidak ditemukan. Berikut daftar perintah yang tersedia:\n\n`
            + `📌 *Daftar Perintah:*\n`
            + `/register - Daftar akun\n`
            + `/profile - Lihat profil\n`
            + `/logout - Keluar dari akun\n`
            + `/forum on - Masuk forum chat\n`
            + `/forum off - Keluar forum\n`
            + `/addkode - Tambah kode admin\n`
            + `/pluskode - Gunakan kode admin\n`
            + `/deladmin - Hapus admin\n`
            + `/wikipedia - Cari artikel di Wikipedia\n`
            + `/nulis - Menulis di canvas\n`
            + `/stalker - Cari informasi pengguna\n`
            + `/addmsg - menambahkan msg\n`
            + `/listmsg - melihat daftar msg\n`
            + `/delmsg - menghapus msg\n`
            + `/ngl - kirim pesan ke ngl\n`
            + `/tts - mengubah text ke audio\n`
            + `/aiimg - membuat gambar\n`
            + `/kalender - melihat kelender\n`
            + `/webrec - merekam website\n`
            + `/yts - YouTube search\n`
            + `/ai - bertanya ke ai\n`
            + `/autoai - ngobrol dengan ai\n`
            + `/shai - gemini img\n`
            + `/pin - cari gambar di pin\n`
            + `/artime - cari arti nama\n`
            + `/getpp - ambil pp user\n`
            + `/brat - buat brat\n`
            + `/igstalk - stalker instagram\n`
            + `/cuaca - cek cuaca daerah anda\n`
            + `/ttstalk - stalker tiktok\n`
            + `/dewatermark - hapus watermark`,
            { parse_mode: "Markdown" }
        );
    }
});

bot.onText(/\/teksanim/, async (msg) => {
    const chatId = msg.chat.id;

    // Minta user mengirimkan teks
    bot.sendMessage(chatId, "Silakan kirimkan teks yang ingin dianimasikan:").then(() => {
        bot.once("message", async (response) => {
            let text = response.text;
            if (!text || text.length === 0) return bot.sendMessage(chatId, "Teks tidak valid!");

            let animMessage = await bot.sendMessage(chatId, "...");
            let animationSteps = [];

            // Gunakan non-breaking space agar Telegram tetap menampilkan spasi
            let fixedText = text.replace(/ /g, "\u00A0"); // Non-breaking space

            // Buat array animasi huruf satu per satu termasuk spasi
            for (let i = 1; i <= fixedText.length; i++) {
                animationSteps.push(fixedText.substring(0, i));
            }

            // Animasi dengan editMessageText
            let index = 0;
            let interval = setInterval(() => {
                if (index >= animationSteps.length) {
                    clearInterval(interval);
                } else {
                    bot.editMessageText(animationSteps[index], {
                        chat_id: chatId,
                        message_id: animMessage.message_id,
                    }).catch(() => clearInterval(interval));
                    index++;
                }
            }, 1000); // Edit setiap 1 detik
        });
    });
});

bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;

    // Kirim pesan awal "okey, wait"
    const sentMessage = await bot.sendMessage(chatId, "Okey, wait...");

    // Tunggu 2 detik sebelum mengedit pesan menjadi menu
    setTimeout(() => {
        bot.editMessageText(
            `📌 *MENU BOT*  

/addkode  
/addmsg  
/ai  
/aiimg  
/aideck  
/artime  
/binary2text  
/brat  
/deladmin  
/delmsg  
/dewatermark  
/forumoff  
/forumon  
/gempa  
/getpp  
/hd  
/igstalk  
/igdm  
/itung  
/jam
/autoai  
/kbbi  
/kalender  
/listmsg  
/logout  
/nulis  
/ngl  
/pin  
/pluskode  
/profile  
/promptai  
/register  
/report  
/rngyt  
/rmbg  
/sendb  
/shai  
/spy  
/spy2  
/stalker  
/stopmotion
/teksanim
/text2binary  
/tourl  
/tourl2  
/translate  
/tts  
/ttstalk  
/webrec  
/wikipedia  
/yts`,  
            {
                chat_id: chatId,
                message_id: sentMessage.message_id,
                parse_mode: "Markdown",
            }
        );
    }, 2000); // Tunggu 2 detik (2000 ms)
});

// Pastikan folder 'downloads' ada sebelum menyimpan file
const downloadDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

bot.onText(/^\/spy2$/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Silakan masukkan judul lagu yang ingin dicari:");
  userSearchResults[chatId] = { results: [], index: 0, messageId: null };
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (!userSearchResults[chatId] || userSearchResults[chatId].results.length > 0) return;

  const query = encodeURIComponent(msg.text);
  const apiUrl = `https://fastrestapis.fasturl.cloud/music/spotify?name=${query}`;

  try {
    const response = await axios.get(apiUrl);
    const results = response.data.result;

    if (results.length === 0) {
      return bot.sendMessage(chatId, "Lagu tidak ditemukan.");
    }

    userSearchResults[chatId] = { results, index: 0, messageId: null };
    sendSongDetails(chatId, results[0], 0);
  } catch (error) {
    bot.sendMessage(chatId, "Terjadi kesalahan saat mencari lagu.");
  }
});

async function sendSongDetails(chatId, song, index) {
  let keyboard = [
    [{ text: "Download", callback_data: `spy2_download_${index}` }],
    [{ text: "Keluar", callback_data: "spy2_exit" }],
  ];

  if (index > 0) {
    keyboard.unshift([{ text: "<<", callback_data: `spy2_prev_${index - 1}` }]);
  }
  if (index < userSearchResults[chatId].results.length - 1) {
    keyboard.push([{ text: ">>", callback_data: `spy2_next_${index + 1}` }]);
  }

  const text = `🎵 *${song.title}*\n👨‍🎤 *Artist:* ${song.artist}\n⏱ *Duration:* ${song.duration}\n🔗 [Spotify Link](${song.url})`;

  if (userSearchResults[chatId].messageId) {
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: userSearchResults[chatId].messageId,
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: keyboard },
    });
  } else {
    bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: keyboard },
    }).then((sentMessage) => {
      userSearchResults[chatId].messageId = sentMessage.message_id;
    });
  }
}

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (!userSearchResults[chatId]) return;

  if (data.startsWith("spy2_next_")) {
    const index = parseInt(data.split("_")[2]);
    userSearchResults[chatId].index = index;
    sendSongDetails(chatId, userSearchResults[chatId].results[index], index);
  }

  if (data.startsWith("spy2_prev_")) {
    const index = parseInt(data.split("_")[2]);
    userSearchResults[chatId].index = index;
    sendSongDetails(chatId, userSearchResults[chatId].results[index], index);
  }

  if (data.startsWith("spy2_download_")) {
    const index = parseInt(data.split("_")[2]);
    const song = userSearchResults[chatId].results[index];

    const downloadUrl = `https://fastrestapis.fasturl.cloud/downup/spotifydown?url=${encodeURIComponent(song.url)}`;
    bot.sendMessage(chatId, "🔄 Sedang mendownload lagu...");

    try {
      const response = await axios.get(downloadUrl);
      const songLink = response.data.result.link;

      if (!songLink) return bot.sendMessage(chatId, "Gagal mendapatkan link download.");

      const filePath = path.join(__dirname, "downloads", `${song.title}.mp3`);
      const writer = fs.createWriteStream(filePath);

      const songResponse = await axios({
        url: songLink,
        method: "GET",
        responseType: "stream",
      });

      songResponse.data.pipe(writer);

      writer.on("finish", () => {
        bot.sendAudio(chatId, filePath, {
          title: song.title,
          performer: song.artist,
        }).then(() => {
          fs.unlinkSync(filePath); // Hapus file setelah dikirim
        });
      });

      writer.on("error", () => {
        bot.sendMessage(chatId, "Gagal mengunduh lagu.");
      });
    } catch (error) {
      bot.sendMessage(chatId, "Terjadi kesalahan saat mengunduh lagu.");
    }
  }

  if (data === "spy2_exit") {
    delete userSearchResults[chatId];
    bot.editMessageText("Pencarian lagu telah dihentikan.", {
      chat_id: chatId,
      message_id: query.message.message_id,
    });
  }
});

bot.onText(/^\/jam$/, async (msg) => {
    const chatId = msg.chat.id;

    // Jika jam sudah berjalan, beri tahu user
    if (jamAktif.has(chatId)) {
        return bot.sendMessage(chatId, "⏳ Jam sudah berjalan!");
    }

    jamAktif.set(chatId, { running: true, toggle: false }); // Menyimpan status update jam

    const getJam = () => {
        return `🕰 *Jam WIB*\n⏳ ${moment().tz("Asia/Jakarta").format("HH:mm:ss")}`;
    };

    const getTombol = (toggle) => {
        const icon = toggle ? "♪┌|∵|┘♪" : "└|∵|┐♪";
        return {
            inline_keyboard: [[{ text: `🛑 Hapus ${icon}`, callback_data: `hapus_jam_${chatId}` }]]
        };
    };

    // Kirim pesan awal
    const sentMsg = await bot.sendMessage(chatId, getJam(), {
        parse_mode: "Markdown",
        reply_markup: getTombol(false)
    });

    // Fungsi untuk memperbarui jam setiap detik
    const updateJam = async () => {
        const jamData = jamAktif.get(chatId);
        if (!jamData?.running) return; // Jika sudah dihentikan, berhenti

        jamData.toggle = !jamData.toggle; // Ubah tombol setiap detik

        try {
            await bot.editMessageText(getJam(), {
                chat_id: chatId,
                message_id: sentMsg.message_id,
                parse_mode: "Markdown",
                reply_markup: getTombol(jamData.toggle)
            });

            setTimeout(updateJam, 1000); // Jalankan update lagi dalam 1 detik
        } catch (err) {
            jamAktif.delete(chatId); // Hentikan jika terjadi error (misalnya pesan dihapus)
        }
    };

    setTimeout(updateJam, 1000); // Mulai update setelah 1 detik
});

// Fungsi untuk menangani tombol "Hapus"
bot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data.startsWith("hapus_jam_")) {
        jamAktif.delete(chatId); // Hentikan update jam
        await bot.deleteMessage(chatId, callbackQuery.message.message_id);
        await bot.answerCallbackQuery(callbackQuery.id, { text: "🛑 Jam dihentikan!" });
    }
});

bot.onText(/\/stopmotion/, (msg) => {
    const chatId = msg.chat.id;
    stopMotionData[chatId] = { frames: [], totalFrames: null, messageId: null };

    bot.sendMessage(chatId, "Masukkan jumlah frame yang diinginkan:").then((sent) => {
        stopMotionData[chatId].messageId = sent.message_id;
    });
});

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    if (!stopMotionData[chatId]) return;
    if (msg.text.startsWith("/")) return; // Hindari gangguan dari perintah lain

    let userInput = msg.text.trim();
    let data = stopMotionData[chatId];

    if (data.totalFrames === null) {
        let frameCount = parseInt(userInput);
        if (isNaN(frameCount) || frameCount <= 0) {
            return bot.editMessageText("Jumlah frame harus angka positif! Masukkan ulang:", {
                chat_id: chatId,
                message_id: data.messageId,
            });
        }
        data.totalFrames = frameCount;
        data.frames = [];
        return bot.editMessageText(`Masukkan teks untuk frame ke-1:`, {
            chat_id: chatId,
            message_id: data.messageId,
        });
    } else if (data.frames.length < data.totalFrames) {
        data.frames.push(userInput);
        let nextFrame = data.frames.length + 1;

        if (data.frames.length < data.totalFrames) {
            bot.editMessageText(`Masukkan teks untuk frame ke-${nextFrame}:`, {
                chat_id: chatId,
                message_id: data.messageId,
            });
        } else {
            bot.editMessageText("Semua frame sudah terkumpul! Tekan **Play** untuk mulai animasi.", {
                chat_id: chatId,
                message_id: data.messageId,
                reply_markup: {
                    inline_keyboard: [[{ text: "▶️ Play", callback_data: `play_${chatId}` }]],
                },
            });
        }
    }
});

bot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = stopMotionData[chatId];

    if (!data || !data.frames.length) return;

    if (callbackQuery.data === `play_${chatId}`) {
        let messageId = data.messageId;

        for (let i = 0; i < data.frames.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay 1 detik antar frame
            bot.editMessageText(data.frames[i], { chat_id: chatId, message_id: messageId });
        }

        // Tunggu 3 detik sebelum menampilkan pesan selesai
        await new Promise((resolve) => setTimeout(resolve, 3000));
        bot.editMessageText("🎬 Animasi selesai!", {
            chat_id: chatId,
            message_id: messageId,
        });

        bot.answerCallbackQuery(callbackQuery.id);
    }
});

bot.onText(/^\/rngyt$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Kirimkan URL video YouTube yang ingin dianalisis.");
    
    bot.once("message", async (msg) => {
        const url = msg.text.trim();
        if (!url.startsWith("http")) {
            return bot.sendMessage(chatId, "URL tidak valid! Harap kirimkan URL YouTube yang benar.");
        }

        bot.sendMessage(chatId, "🔍 Mengambil data, mohon tunggu...");

        try {
            const response = await fetch(`https://fastrestapis.fasturl.cloud/aiexperience/ytpoint?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.status !== 200 || !data.result || !data.result.keyPoints) {
                return bot.sendMessage(chatId, "⚠️ Gagal mengambil data. Pastikan URL valid!");
            }

            const { short_title, keyPoints } = data.result;
            let resultText = `🎯 *Ringkasan Video*: ${short_title}\n\n📌 *Poin Penting*:\n`;

            keyPoints.forEach((item, index) => {
                resultText += `${index + 1}️⃣ *${item.point}*\n   - ${item.summary}\n\n`;
            });

            bot.sendMessage(chatId, resultText, { parse_mode: "Markdown" });

        } catch (error) {
            bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengambil data.");
            console.error(error);
        }
    });
});

bot.onText(/\/aideck/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "🔍 Kirimkan teks yang ingin dianalisis:");
  
    bot.once("message", async (msg) => {
        if (msg.text.startsWith("/")) return; // Abaikan jika user kirim perintah lain
        const text = encodeURIComponent(msg.text);
        const url = `https://fastrestapis.fasturl.cloud/aiexperience/aitextdetector?text=${text}`;
      
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.status === 200) {
                const result = data.result;
                const responseText = `
🔍 Hasil Analisis AI
📌 Answer:\n${result.answer}
👤 Made By: ${result.madeBy}
🔢 AI Probability: ${result.probabilityAi}
                `;
                bot.sendMessage(chatId, responseText);
            } else {
                bot.sendMessage(chatId, "⚠️ Gagal mendapatkan hasil. Coba lagi.");
            }
        } catch (error) {
            bot.sendMessage(chatId, "❌ Terjadi kesalahan. Pastikan teks valid dan coba lagi.");
        }
    });
});

bot.onText(/\/translate/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Silakan kirim teks yang ingin diterjemahkan.");

    bot.once("message", async (msg) => {
        if (msg.text.startsWith("/")) return; // Hindari menangkap perintah lain

        const userInput = encodeURIComponent(msg.text);
        const apiUrl = `https://fastrestapis.fasturl.cloud/tool/translate?text=${userInput}&target=id`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status === 200) {
                bot.sendMessage(chatId, `**Hasil Terjemahan:**\n\n${data.result.translatedText}`, { parse_mode: "Markdown" });
            } else {
                bot.sendMessage(chatId, "Terjadi kesalahan saat menerjemahkan.");
            }
        } catch (error) {
            bot.sendMessage(chatId, "Gagal menghubungi API terjemahan.");
        }
    });
});

bot.onText(/\/itung/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Masukkan angka yang ingin dihitung:")
        .then(sentMessage => {
            bot.once("message", (response) => {
                const number = parseInt(response.text);
                if (isNaN(number) || number < 0) {
                    return bot.sendMessage(chatId, "Harap masukkan angka yang valid.");
                }

                let count = 0;
                const interval = setInterval(() => {
                    if (count > number) {
                        clearInterval(interval);
                        bot.editMessageText("Hitungan selesai!", {
                            chat_id: chatId,
                            message_id: sentMessage.message_id
                        });
                        return;
                    }

                    bot.editMessageText(`Menghitung: ${count}`, {
                        chat_id: chatId,
                        message_id: sentMessage.message_id
                    }).catch(() => clearInterval(interval)); // Hentikan jika ada error

                    count++;
                }, 1000); // Update setiap 1 detik
            });
        });
});

bot.onText(/\/hd/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    bot.sendMessage(chatId, "Kirimkan URL gambar yang ingin di-upscale.");

    const handler = async (responseMsg) => {
        if (responseMsg.chat.id !== chatId || responseMsg.from.id !== userId) return;

        if (!responseMsg.text || !responseMsg.text.startsWith("http")) {
            bot.sendMessage(chatId, "Harap kirimkan URL gambar yang valid.");
            return bot.removeListener("message", handler);
        }

        const imageUrl = encodeURIComponent(responseMsg.text);
        const apiUrl = `https://api.siputzx.my.id/api/iloveimg/upscale?image=${imageUrl}`;

        bot.sendMessage(chatId, "Memproses gambar, harap tunggu...");
        bot.removeListener("message", handler);

        try {
            const response = await axios({
                url: apiUrl,
                method: "GET",
                responseType: "arraybuffer",
            });

            const filePath = `upscaled_${Date.now()}.jpg`;
            fs.writeFileSync(filePath, response.data);

            bot.sendPhoto(chatId, fs.createReadStream(filePath), { caption: "Berhasil di-upscale!" })
                .then(() => fs.unlinkSync(filePath)) // Hapus file setelah dikirim
                .catch(() => bot.sendMessage(chatId, "Gagal mengirim gambar."));
        } catch (error) {
            bot.sendMessage(chatId, "Terjadi kesalahan saat memproses gambar.");
        }
    };

    bot.on("message", handler);
});

bot.onText(/\/dewatermark/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Kirimkan URL gambar yang ingin dihapus watermarknya.");

    bot.once("message", async (msg) => {
        if (!msg.text.startsWith("http")) {
            return bot.sendMessage(chatId, "❌ URL tidak valid. Silakan kirim ulang perintah.");
        }

        const imageUrl = msg.text;
        const apiUrl = `https://api.siputzx.my.id/api/tools/dewatermark?url=${encodeURIComponent(imageUrl)}`;

        bot.sendMessage(chatId, "⏳ Sedang memproses gambar...");

        try {
            // Unduh gambar dari API
            const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
            
            // Pastikan direktori penyimpanan ada
            const outputDir = path.join(__dirname, "downloads");
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

            // Path file hasil
            const jpgPath = path.join(outputDir, "hasil_dewatermark.jpg");

            // Simpan langsung sebagai .jpg
            fs.writeFileSync(jpgPath, response.data);

            // Cek apakah file benar-benar ada
            if (!fs.existsSync(jpgPath)) {
                throw new Error("File hasil tidak ditemukan setelah penyimpanan.");
            }

            // Kirim hasil ke user
            bot.sendPhoto(chatId, jpgPath, { caption: "✅ Gambar tanpa watermark" });

            // Hapus file setelah dikirim
            setTimeout(() => fs.unlinkSync(jpgPath), 5000);
        } catch (error) {
            console.error("Error:", error.message);
            bot.sendMessage(chatId, "❌ Gagal memproses gambar. Coba lagi nanti.");
        }
    });
});

// Daftar nama bulan dalam bahasa Indonesia
const bulanIndonesia = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

bot.onText(/\/kalender/, async (msg) => {
    const chatId = msg.chat.id;

    // Mengatur waktu ke WIB (GMT+7)
    const now = new Date();
    now.setHours(now.getHours() + 7); // Tambah 7 jam agar sesuai WIB
    const bulanSekarang = now.getMonth() + 1; // getMonth() dimulai dari 0
    const namaBulan = bulanIndonesia[bulanSekarang - 1];

    const apiUrl = `https://fastrestapis.fasturl.cloud/maker/calendar/advanced?month=${bulanSekarang}&year=2025`;

    bot.sendMessage(chatId, `Mengambil kalender bulan ${namaBulan} 2025...`);

    try {
        // Mengunduh gambar kalender dari API
        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
        const imgPath = `kalender_${chatId}.jpg`;

        // Simpan gambar sementara
        fs.writeFileSync(imgPath, response.data);

        // Kirim gambar ke user
        await bot.sendPhoto(chatId, fs.createReadStream(imgPath), { caption: `Kalender bulan ${namaBulan} 2025` });

        // Hapus file setelah dikirim
        fs.unlinkSync(imgPath);
    } catch (error) {
        bot.sendMessage(chatId, "Gagal mengambil kalender. Coba lagi nanti.");
        console.error("Error fetching calendar image:", error);
    }
});

const getKeyboard = (chatId) => {
    const currentInput = kalkulatorData[chatId] || "0";
    return {
        reply_markup: {
            inline_keyboard: [
                [{ text: "7", callback_data: "calc_7" }, { text: "8", callback_data: "calc_8" }, { text: "9", callback_data: "calc_9" }, { text: "÷", callback_data: "calc_/" }],
                [{ text: "4", callback_data: "calc_4" }, { text: "5", callback_data: "calc_5" }, { text: "6", callback_data: "calc_6" }, { text: "×", callback_data: "calc_*" }],
                [{ text: "1", callback_data: "calc_1" }, { text: "2", callback_data: "calc_2" }, { text: "3", callback_data: "calc_3" }, { text: "−", callback_data: "calc_-" }],
                [{ text: "0", callback_data: "calc_0" }, { text: "C", callback_data: "calc_clear" }, { text: "⌫", callback_data: "calc_back" }, { text: "+", callback_data: "calc_+" }],
                [{ text: "=", callback_data: "calc_equal" }, { text: "❌ Keluar", callback_data: "calc_exit" }]
            ]
        }
    };
};

// Menangani perintah /kalkulator
bot.onText(/\/kalkulator/, (msg) => {
    const chatId = msg.chat.id;
    kalkulatorData[chatId] = ""; // Reset input kalkulator
    bot.sendMessage(chatId, "Kalkulator\n\n0", getKeyboard(chatId));
});

// Menangani input dari tombol kalkulator
bot.on("callback_query", (query) => {
    if (!query.data.startsWith("calc_")) return; // Filter agar hanya menangani tombol kalkulator

    const chatId = query.message.chat.id;
    let currentInput = kalkulatorData[chatId] || "";
    const action = query.data.replace("calc_", ""); // Menghapus prefix "calc_"

    if (action === "clear") {
        currentInput = "";
    } else if (action === "back") {
        currentInput = currentInput.slice(0, -1);
    } else if (action === "equal") {
        try {
            currentInput = eval(currentInput).toString(); // Menghitung hasil
        } catch (error) {
            currentInput = "Error";
        }
    } else if (action === "exit") {
        bot.deleteMessage(chatId, query.message.message_id);
        return;
    } else {
        currentInput += action;
    }

    kalkulatorData[chatId] = currentInput;
    bot.editMessageText(`Kalkulator\n\n${currentInput || "0"}`, {
        chat_id: chatId,
        message_id: query.message.message_id,
        ...getKeyboard(chatId),
    });

    bot.answerCallbackQuery(query.id);
});

bot.onText(/\/gempa/, async (msg) => {
    const chatId = msg.chat.id;
    const url = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";

    try {
        const { data } = await axios.get(url);
        const gempa = data.Infogempa.gempa;

        // Ambil gambar Shakemap
        const shakemapUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`;

        // Format caption
        const caption = `📢 *Info Gempa BMKG* 📢

📅 *Tanggal:* ${gempa.Tanggal}  
🕗 *Waktu:* ${gempa.Jam}  
📍 *Koordinat:* ${gempa.Coordinates}  
📏 *Magnitude:* ${gempa.Magnitude}  
🌊 *Kedalaman:* ${gempa.Kedalaman}  
📌 *Wilayah:* ${gempa.Wilayah}  
⚠️ *Potensi:* ${gempa.Potensi}  
👥 *Dirasakan:* ${gempa.Dirasakan}`;

        // Kirim gambar dengan caption
        await bot.sendPhoto(chatId, shakemapUrl, { caption, parse_mode: "Markdown" });

    } catch (error) {
        console.error("Error mengambil data gempa:", error);
        bot.sendMessage(chatId, "⚠️ Gagal mengambil data gempa. Coba lagi nanti.");
    }
});

bot.onText(/\/ttstalk/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Silakan kirimkan username TikTok yang ingin Anda stalk:");
  
  bot.once("message", async (response) => {
    const username = response.text.trim();
    if (!username.startsWith("/")) {
      try {
        const apiUrl = `https://api.siputzx.my.id/api/stalk/tiktok?username=${username}`;
        const { data } = await axios.get(apiUrl);

        if (data.status && data.data.user) {
          const user = data.data.user;
          const stats = data.data.stats;

          const caption = `👤 *Profil TikTok: ${user.nickname}* (@${user.uniqueId})\n\n` +
            `✅ *Terverifikasi:* ${user.verified ? "Ya" : "Tidak"}\n` +
            `📍 *Region:* ${user.region}\n` +
            `💬 *Bio:* ${user.signature || "-"}\n\n` +
            `📊 *Statistik:*\n` +
            `👥 *Followers:* ${stats.followerCount.toLocaleString()}\n` +
            `🎥 *Video:* ${stats.videoCount.toLocaleString()}\n` +
            `❤️ *Likes:* ${stats.heartCount.toLocaleString()}`;

          bot.sendPhoto(chatId, user.avatarMedium, { caption, parse_mode: "Markdown" });
        } else {
          bot.sendMessage(chatId, "❌ Username tidak ditemukan atau akun private.");
        }
      } catch (error) {
        bot.sendMessage(chatId, "⚠️ Terjadi kesalahan saat mengambil data.");
      }
    } else {
      bot.sendMessage(chatId, "❌ Username tidak valid.");
    }
  });
});

bot.onText(/^\/tourl2$/, (msg) => {
  const chatId = msg.chat.id;
  uploadStatus[chatId] = "waiting_for_photo"; // Set status user
  bot.sendMessage(chatId, "Kirimkan file foto yang ingin diupload.");
});

bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;

  // Cek apakah user sedang dalam mode upload
  if (uploadStatus[chatId] !== "waiting_for_photo") return;

  const fileId = msg.photo[msg.photo.length - 1].file_id;

  try {
    // Mendapatkan URL file dari Telegram
    const file = await bot.getFile(fileId);
    const filePath = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

    // Unduh file dari Telegram
    const response = await axios.get(filePath, { responseType: "stream" });
    const fileName = `temp_${Date.now()}.jpg`;
    const fileStream = fs.createWriteStream(fileName);
    response.data.pipe(fileStream);

    fileStream.on("finish", async () => {
      // Buat form data untuk upload ke Catbox
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(fileName));

      // Upload ke Catbox.moe
      const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders(),
      });

      // Kirim link hasil upload tanpa preview
      bot.sendMessage(chatId, `✅ Foto berhasil diupload!\n🔗 ${uploadResponse.data}`, {
        disable_web_page_preview: true,
      });

      // Hapus file lokal setelah upload selesai
      fs.unlinkSync(fileName);

      // Reset status user setelah upload selesai
      delete uploadStatus[chatId];
    });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Gagal mengupload foto.");
    delete uploadStatus[chatId]; // Reset status jika terjadi error
  }
});

bot.onText(/\/cuaca/, (msg) => {
    const chatId = msg.chat.id;
    
    // Pemberitahuan awal
    bot.sendMessage(chatId, "Jika Anda tidak tahu kode daerah Anda, silakan kunjungi kodewilayah.id\nMasukkan kode daerah (contoh: 35.78.08.1002):");

    bot.once("message", async (msg) => {
        const kodeDaerah = msg.text.trim();

        if (!kodeDaerah) {
            return bot.sendMessage(chatId, "Kode daerah tidak boleh kosong!");
        }

        const apiUrl = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${kodeDaerah}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;
            
            if (!data || !data.data || data.data.length === 0) {
                return bot.sendMessage(chatId, "Data cuaca tidak ditemukan untuk kode daerah ini.");
            }

            const lokasi = data.lokasi;
            const cuacaHariIni = data.data[0].cuaca.slice(0, 5); // Ambil 5 data pertama

            let pesan = `📍 *Cuaca di ${lokasi.kotkab}, ${lokasi.provinsi}*\n\n`;
            cuacaHariIni.forEach((cuaca) => {
                pesan += `🕒 *${cuaca.local_datetime.split(" ")[1]} WIB*\n`;
                pesan += `🌦️ *${cuaca.weather_desc}*\n`;
                pesan += `🌡️ Suhu: ${cuaca.t}°C\n`;
                pesan += `💨 Kecepatan angin: ${cuaca.ws} km/jam (${cuaca.wd})\n`;
                pesan += `💧 Kelembaban: ${cuaca.hu}%\n\n`;
            });

            bot.sendMessage(chatId, pesan, { parse_mode: "Markdown" });
        } catch (error) {
            bot.sendMessage(chatId, "Terjadi kesalahan saat mengambil data cuaca.");
        }
    });
});

function escapeMarkdown(text) {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

bot.onText(/\/igstalk/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Masukkan username Instagram yang ingin dicari:");

    bot.once("message", async (response) => {
        const username = response.text.trim();
        if (!username) return bot.sendMessage(chatId, "Username tidak boleh kosong.");

        const apiUrl = `https://api.siputzx.my.id/api/stalk/Instagram?user=${username}`;

        try {
            const { data } = await axios.get(apiUrl);
            if (!data.status) return bot.sendMessage(chatId, "Username tidak ditemukan.");

            const userInfo = data.data.user;
            const caption = `🔍 *Instagram Profile* 🔍\n\n` +
                `👤 *Username:* ${escapeMarkdown(userInfo.username)}\n` +
                `📛 *Nama Lengkap:* ${escapeMarkdown(userInfo.full_name)}\n` +
                `📖 *Bio:* ${escapeMarkdown(userInfo.biography)}\n` +
                `👥 *Followers:* ${userInfo.follower_count}\n` +
                `👤 *Following:* ${userInfo.following_count}\n` +
                `📸 *Total Postingan:* ${userInfo.media_count}`;

            bot.sendPhoto(chatId, userInfo.profile_pic_url, { caption, parse_mode: "MarkdownV2" });
        } catch (error) {
            bot.sendMessage(chatId, "Terjadi kesalahan saat mengambil data.");
        }
    });
});

bot.onText(/^\/spy$/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Masukkan judul lagu yang ingin dicari:");

    bot.once("message", async (msg) => {
        const query = msg.text;
        const searchUrl = `https://fastrestapis.fasturl.cloud/music/spotify?name=${encodeURIComponent(query)}`;

        try {
            const response = await axios.get(searchUrl);
            const result = response.data.result;

            if (!result || result.length === 0) {
                return bot.sendMessage(chatId, "❌ Lagu tidak ditemukan.");
            }

            const lagu = result[0]; // Ambil lagu pertama
            const songInfo = `🎵 *Judul:* ${lagu.title}\n🎤 *Artis:* ${lagu.artist}\n⏳ *Durasi:* ${lagu.duration}\n🔗 [Spotify Link](${lagu.url})`;

            bot.sendMessage(chatId, songInfo, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "⬇ Download", callback_data: `download_${lagu.url}` }]
                    ]
                }
            });

        } catch (error) {
            bot.sendMessage(chatId, "⚠ Terjadi kesalahan saat mencari lagu.");
        }
    });
});

// Handle tombol download
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith("download_")) {
        const songUrl = data.replace("download_", "");
        const downloadUrl = `https://fastrestapis.fasturl.cloud/downup/spotifydown?url=${encodeURIComponent(songUrl)}`;

        bot.sendMessage(chatId, "⏳ Sedang mengunduh lagu, harap tunggu...");

        try {
            const response = await axios.get(downloadUrl);
            const result = response.data.result;

            if (!result || !result.link) {
                return bot.sendMessage(chatId, "❌ Gagal mengunduh lagu.");
            }

            bot.sendAudio(chatId, result.link, {
                caption: `🎵 *${result.metadata.title}* - ${result.metadata.artists}`,
                parse_mode: "Markdown"
            });

        } catch (error) {
            bot.sendMessage(chatId, "⚠ Terjadi kesalahan saat mengunduh lagu.");
        }
    }
});

bot.onText(/\/artime/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Masukkan nama untuk mencari arti nama:');

    bot.once('message', async (nameMsg) => {
        const userName = nameMsg.text;
        try {
            const response = await axios.get(`https://api.siputzx.my.id/api/primbon/artinama?nama=${userName}`);
            const result = response.data.data;
            if (result) {
                const message = `Nama: ${result.nama}\n\nArti: ${result.arti}\n\nCatatan: ${result.catatan}`;
                bot.sendMessage(chatId, message);
            } else {
                bot.sendMessage(chatId, 'Tidak ditemukan arti untuk nama tersebut.');
            }
        } catch (error) {
            bot.sendMessage(chatId, 'Terjadi kesalahan saat mengambil arti nama.');
        }
    });
});

async function fetchRobloxData(userId) {
    const endpoints = {
        userInfo: `https://users.roblox.com/v1/users/${userId}`,
        userSocials: `https://users.roblox.com/v1/users/${userId}/social`,
        userInventory: `https://inventory.roblox.com/v1/users/${userId}/inventory`,
        userPresence: "https://presence.roblox.com/v1/presence/users",
        userGroups: `https://groups.roblox.com/v1/users/${userId}/groups/roles`
    };
    
    try {
        const [userInfo, userSocials, userInventory, userGroups] = await Promise.all([
            cloudscraper.get(endpoints.userInfo).then(JSON.parse).catch(() => null),
            cloudscraper.get(endpoints.userSocials).then(JSON.parse).catch(() => null),
            cloudscraper.get(endpoints.userInventory).then(JSON.parse).catch(() => null),
            cloudscraper.get(endpoints.userGroups).then(JSON.parse).catch(() => null)
        ]);
        
        const userPresence = await cloudscraper.post(endpoints.userPresence, {
            json: { userIds: [userId] }
        }).then(JSON.parse).catch(() => null);

        return { userInfo, userSocials, userInventory, userPresence, userGroups };
    } catch (error) {
        return null;
    }
}

// **Cek apakah file pengaturan ada**
if (fs.existsSync(settingsFile)) {
    const data = JSON.parse(fs.readFileSync(settingsFile));
    autoAI = data.autoAI || {};
    promptAI = data.promptAI || {};
}

// **Fungsi menyimpan pengaturan**
function saveSettings() {
    fs.writeFileSync(settingsFile, JSON.stringify({ autoAI, promptAI }, null, 2));
}

// **Tombol ON/OFF AutoAI**
bot.onText(/\/autoai/, (msg) => {
    const chatId = msg.chat.id;
    const status = autoAI[chatId] ? "ON" : "OFF";
    
    bot.sendMessage(chatId, `⚙️ AutoAI saat ini: *${status}*`, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: autoAI[chatId] ? "🔴 OFF" : "🟢 ON", callback_data: `toggle_autoai_${chatId}` }]
            ]
        }
    });
});

bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith("toggle_autoai_")) {
        autoAI[chatId] = !autoAI[chatId];
        saveSettings();
        const status = autoAI[chatId] ? "ON" : "OFF";
        
        bot.answerCallbackQuery(query.id, { text: `AutoAI ${status}` });
        bot.editMessageText(`⚙️ AutoAI saat ini: *${status}*`, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: autoAI[chatId] ? "🔴 OFF" : "🟢 ON", callback_data: `toggle_autoai_${chatId}` }]
                ]
            }
        });
    }
});

// **Atur Prompt AI Per User**
bot.onText(/\/promptai/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "📝 Silakan kirim prompt baru untuk AI:");
    promptAI[chatId] = promptAI[chatId] || {};
    promptAI[chatId].waitingForPrompt = true;
    saveSettings();
});

// **Simpan Prompt yang Dikirim User**
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (promptAI[chatId]?.waitingForPrompt && text && !text.startsWith("/")) {
        promptAI[chatId] = { style: text }; // Set style unik per user
        saveSettings();
        bot.sendMessage(chatId, `✅ Prompt AI diperbarui:\n*${text}*`, { parse_mode: "Markdown" });
    }
});

// **Respon AI Otomatis**
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith("/") || !autoAI[chatId]) return;
    
    // **Gunakan sessionId dan style per user**
    const userSessionId = chatId;
    const userPrompt = promptAI[chatId]?.style || "Gunakan bahasa Indonesia";

    const apiUrl = `https://fastrestapis.fasturl.cloud/aillm/superqwen?ask=${encodeURIComponent(text)}&style=${encodeURIComponent(userPrompt)}&sessionId=${userSessionId}&model=qwen-max-latest&mode=search`;

    try {
        const response = await axios.get(apiUrl);
        const result = response.data.result.replace(/\n+/g, "\n");
        bot.sendMessage(chatId, result);
    } catch (error) {
        bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengambil respon dari AI.");
    }
});

bot.onText(/\/text2binary/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Kirimkan teks yang ingin dikonversi ke biner.")
        .then(() => {
            bot.once("message", async (msg) => {
                if (msg.text.startsWith("/")) return; // Abaikan jika user mengirim command lain

                const userInput = encodeURIComponent(msg.text);
                const apiUrl = `https://api.siputzx.my.id/api/tools/text2binary?content=${userInput}`;

                try {
                    const response = await fetch(apiUrl);
                    const result = await response.json();

                    if (result.status && result.data) {
                        bot.sendMessage(chatId, `Hasil biner:\n\`${result.data}\``, { parse_mode: "Markdown" });
                    } else {
                        bot.sendMessage(chatId, "Terjadi kesalahan dalam konversi.");
                    }
                } catch (error) {
                    bot.sendMessage(chatId, "Gagal mengambil data dari API.");
                }
            });
        });
});

bot.onText(/\/binary2text/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Kirimkan kode biner yang ingin dikonversi ke teks.")
        .then(() => {
            bot.once("message", async (msg) => {
                if (msg.text.startsWith("/")) return; // Abaikan jika user mengirim command lain

                const userInput = encodeURIComponent(msg.text);
                const apiUrl = `https://api.siputzx.my.id/api/tools/binary2text?content=${userInput}`;

                try {
                    const response = await fetch(apiUrl);
                    const result = await response.json();

                    if (result.status && result.data) {
                        bot.sendMessage(chatId, `Hasil teks:\n\`${result.data}\``, { parse_mode: "Markdown" });
                    } else {
                        bot.sendMessage(chatId, "Terjadi kesalahan dalam konversi.");
                    }
                } catch (error) {
                    bot.sendMessage(chatId, "Gagal mengambil data dari API.");
                }
            });
        });
});

bot.onText(/\/getpp/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Silakan kirimkan username Telegram yang ingin diambil foto profilnya tanpa "@".`);

    bot.once("message", async (msg) => {
        const username = msg.text.trim();
        if (!username) return bot.sendMessage(chatId, "Username tidak boleh kosong.");

        const apiUrl = `https://fastrestapis.fasturl.cloud/stalk/telegram?username=${username}`;
        
        try {
            const response = await axios.get(apiUrl);
            if (response.data.status !== 200 || !response.data.result.imageUrl) {
                return bot.sendMessage(chatId, "Gagal mengambil foto profil. Pastikan username benar.");
            }

            const imageUrl = response.data.result.imageUrl;
            const filePath = path.join(__dirname, "profile.jpg");

            const downloadImage = async (url, filepath) => {
                const writer = fs.createWriteStream(filepath);
                const res = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream',
                });
                res.data.pipe(writer);
                return new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
            };

            await downloadImage(imageUrl, filePath);
            bot.sendPhoto(chatId, filePath, { caption: `Foto profil ${username}` });

            // Hapus file setelah dikirim
            setTimeout(() => fs.unlinkSync(filePath), 5000);
        } catch (error) {
            bot.sendMessage(chatId, "Terjadi kesalahan saat mengambil foto profil.");
        }
    });
});

bot.onText(/\/pin/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Masukkan query untuk mencari gambar di Pinterest:');
    
    bot.once('message', async (msg) => {
        const query = msg.text;
        const apiUrl = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data.status || !data.data.length) {
                return bot.sendMessage(chatId, 'Gambar tidak ditemukan! Coba dengan query lain.');
            }

            // Pilih gambar secara acak dari hasil
            const randomImage = data.data[Math.floor(Math.random() * data.data.length)].images_url;
            
            // Unduh gambar
            const imagePath = path.join(__dirname, 'pinterest_image.jpg');
            const writer = fs.createWriteStream(imagePath);
            const imageResponse = await axios({
                url: randomImage,
                method: 'GET',
                responseType: 'stream',
            });
            
            imageResponse.data.pipe(writer);
            writer.on('finish', () => {
                bot.sendPhoto(chatId, imagePath, { caption: 'Berikut hasil dari Pinterest!' });
            });
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, 'Terjadi kesalahan saat mengambil gambar. Coba lagi nanti.');
        }
    });
});


bot.onText(/\/yts/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    ytsSessions[userId] = { step: 1 };
    bot.sendMessage(chatId, "Masukkan judul video YouTube yang ingin Anda cari:");
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userInput = msg.text?.trim();

    if (!ytsSessions[userId]) return;
    if (userInput.startsWith('/')) return;

    const session = ytsSessions[userId];

    if (session.step === 1) {
        session.title = userInput;
        session.step = 2;

        bot.sendMessage(chatId, "Pilih kualitas video:", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '360p', callback_data: `yts_quality_360_${userId}` }],
                    [{ text: '480p', callback_data: `yts_quality_480_${userId}` }],
                    [{ text: '720p', callback_data: `yts_quality_720_${userId}` }],
                    [{ text: '1080p', callback_data: `yts_quality_1080_${userId}` }]
                ]
            }
        });
    }
});

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;
    const session = ytsSessions[userId];

    if (!session) return;

    if (data.startsWith(`yts_quality_`)) {
        if (!data.endsWith(`_${userId}`)) return;

        session.quality = data.split('_')[2];
        fetchYouTubeVideo(chatId, userId);
    } else if (data === `yts_confirm_${userId}`) {
        bot.sendMessage(chatId, "📥 Mengunduh video, harap tunggu...");
        downloadAndSendVideo(chatId, userId);
    } else if (data === `yts_cancel_${userId}`) {
        bot.sendMessage(chatId, "Pencarian dibatalkan.");
        delete ytsSessions[userId];
    }
});

async function fetchYouTubeVideo(chatId, userId) {
    const session = ytsSessions[userId];
    if (!session) return;

    const apiUrl = `https://fastrestapis.fasturl.cloud/downup/ytdown-v2?name=${encodeURIComponent(session.title)}&format=mp4&quality=${session.quality}`;
    
    try {
        const response = await axios.get(apiUrl);
        if (response.data.status !== 200) {
            bot.sendMessage(chatId, "⚠️ Gagal mengambil data video.");
            delete ytsSessions[userId];
            return;
        }

        const result = response.data.result;
        session.title = result.title;
        session.thumbnail = result.metadata.thumbnail;
        session.mediaUrl = result.media;

        bot.sendPhoto(chatId, session.thumbnail, {
            caption: `🔍 *Apakah ini video yang Anda cari?*\n\n📌 *Judul:* ${result.title}\n👤 *Channel:* ${result.author.name}\n👁️ *Views:* ${result.metadata.views}\n\nPilih opsi:`,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✅ Ya', callback_data: `yts_confirm_${userId}` }],
                    [{ text: '❌ Tidak', callback_data: `yts_cancel_${userId}` }]
                ]
            }
        });

    } catch (error) {
        bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengambil data.");
        delete ytsSessions[userId];
    }
}

async function downloadAndSendVideo(chatId, userId) {
    const session = ytsSessions[userId];
    if (!session) return;

    const videoUrl = session.mediaUrl;
    const fileName = `yts_${userId}.mp4`;
    const filePath = path.join(__dirname, fileName);

    try {
        const response = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            bot.sendVideo(chatId, filePath, { caption: `🎬 *${session.title}*\n\n✅ Unduhan berhasil!`, parse_mode: "Markdown" });

            setTimeout(() => {
                fs.unlinkSync(filePath);
            }, 30000); // Hapus file setelah 30 detik

            delete ytsSessions[userId];
        });

        writer.on('error', () => {
            bot.sendMessage(chatId, "❌ Gagal mengunduh video.");
            delete ytsSessions[userId];
        });

    } catch (error) {
        bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengunduh video.");
        delete ytsSessions[userId];
    }
}

bot.onText(/\/brat/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Silakan kirimkan teks untuk digunakan dalam BRAT.");
    
    bot.once('message', async (msg) => {
        if (msg.chat.id !== chatId) return;
        
        const userInput = encodeURIComponent(msg.text);
        const apiUrl = `https://fastrestapis.fasturl.link/maker/brat/animated?text=${userInput}&mode=image`;

        bot.sendMessage(chatId, "Memproses... Mohon tunggu");

        try {
            const response = await axios({
                url: apiUrl,
                method: 'GET',
                responseType: 'arraybuffer'
            });

            const filePath = `brat_${chatId}.jpg`;
            fs.writeFileSync(filePath, response.data);

            bot.sendPhoto(chatId, filePath).then(() => {
                fs.unlinkSync(filePath); // Hapus file setelah dikirim
            });
        } catch (error) {
            bot.sendMessage(chatId, "Gagal mengambil hasil BRAT. Coba lagi nanti.");
        }
    });
});

// 🔹 Handle /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!users[chatId]) {
        bot.sendMessage(chatId, "🔐 Anda belum punya akun! Gunakan `/register`.");
        return;
    }
    bot.sendMessage(chatId, "✅ Selamat datang kembali!");
});

// 🔹 Handle /register
const OWNER_ID = "6202819748"; // Ganti dengan ID Telegram Pengembang (Admin Utama)

bot.onText(/\/kbbi/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Silakan kirimkan kata yang ingin dicari di KBBI:");

    bot.once("message", async (msg) => {
        const word = msg.text.trim();
        const url = `https://fastrestapis.fasturl.cloud/search/kbbi?word=${encodeURIComponent(word)}`;

        try {
            const response = await axios.get(url);
            const data = response.data;

            if (data.status !== 200 || !data.result || !data.result.definitions.length) {
                bot.sendMessage(chatId, `❌ Kata *"${word}"* tidak ditemukan dalam KBBI.`, { parse_mode: "Markdown" });
                return;
            }

            kbbiData[chatId] = {
                word: word,
                definitions: data.result.definitions,
                index: 0
            };

            sendDefinition(chatId);

        } catch (error) {
            bot.sendMessage(chatId, "⚠️ Terjadi kesalahan saat mengambil data dari KBBI.");
            console.error(error);
        }
    });
});

bot.on("callback_query", (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (!kbbiData[chatId]) return;

    if (data === "kbbi_next") {
        kbbiData[chatId].index++;
    } else if (data === "kbbi_prev") {
        kbbiData[chatId].index--;
    } else if (data === "kbbi_exit") {
        bot.deleteMessage(chatId, callbackQuery.message.message_id);
        delete kbbiData[chatId];
        return;
    }

    sendDefinition(chatId, callbackQuery.message.message_id);
});

function sendDefinition(chatId, messageId = null) {
    const { word, definitions, index } = kbbiData[chatId];
    const def = definitions[index];

    let hasil = `📖 *KBBI: ${word}*\n\n`;
    hasil += `📌 *${def.term}*\n`;
    hasil += `🔹 Pengucapan: _${def.pronunciation}_\n`;
    hasil += `🔹 Kelas Kata: _${def.class}_\n`;
    hasil += `🔹 Arti: ${def.meaning}\n\n`;
    hasil += `(${index + 1}/${definitions.length})`;

    let buttons = [];
    if (index > 0) buttons.push({ text: "«", callback_data: "kbbi_prev" });
    if (index < definitions.length - 1) buttons.push({ text: "»", callback_data: "kbbi_next" });
    buttons.push({ text: "❌ Exit", callback_data: "kbbi_exit" });

    const options = {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [buttons] }
    };

    if (messageId) {
        bot.editMessageText(hasil, { chat_id: chatId, message_id: messageId, ...options });
    } else {
        bot.sendMessage(chatId, hasil, options);
    }
}

bot.onText(/^\/ai$/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    aiSessions[userId] = { step: 1 };

    bot.sendMessage(chatId, "🔍 Pilih mode AI:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Search', callback_data: `ai_mode_search_${userId}` }],
                [{ text: 'T2T', callback_data: `ai_mode_t2t_${userId}` }]
            ]
        }
    });
});

bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (data.startsWith("ai_mode_search_")) {
        if (!data.endsWith(`_${userId}`)) return;
        aiSessions[userId] = { mode: "search" };
        bot.sendMessage(chatId, "💬 Silakan kirimkan pertanyaan Anda.");
    } else if (data.startsWith("ai_mode_t2t_")) {
        if (!data.endsWith(`_${userId}`)) return;
        aiSessions[userId] = { mode: "t2t" };
        bot.sendMessage(chatId, "💬 Silakan kirimkan pertanyaan Anda.");
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!aiSessions[userId] || msg.text.startsWith('/')) return;

    const userInput = encodeURIComponent(msg.text);
    const mode = aiSessions[userId].mode;
    delete aiSessions[userId]; // Hapus sesi setelah digunakan

    const apiUrl = `https://fastrestapis.fasturl.cloud/aillm/superqwen?ask=${userInput}&style=Provide%20a%20detailed%20explanation&sessionId=408645&model=qwen-max-latest&mode=${mode}`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.result) {
            const cleanedText = response.data.result.replace(/\n+/g, '\n').trim();
            bot.sendMessage(chatId, cleanedText);
        } else {
            bot.sendMessage(chatId, "⚠️ Gagal mengambil hasil dari AI.");
        }
    } catch (error) {
        bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengambil data.");
    }
});

bot.onText(/\/rmbg/, async (msg) => {
    const chatId = msg.chat.id;

    // Minta URL gambar dari user
    bot.sendMessage(chatId, "🖼️ Kirimkan URL gambar yang ingin dihapus latar belakangnya (gunakan /tourl untuk mendapatkan URL gambar)\n>>>").then(() => {
        bot.once("message", async (msg) => {
            if (!msg.text || msg.text.startsWith("/")) return;
            const imageUrl = msg.text.trim();

            // Pilihan untuk menggunakan custom background atau tidak
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🎨 Gunakan BG Custom", callback_data: "use_bg_custom" }],
                        [{ text: "🚫 Tanpa BG", callback_data: "no_bg" }]
                    ]
                }
            };

            bot.sendMessage(chatId, "❓ Apakah ingin menggunakan background kustom?", options);

            bot.once("callback_query", async (callbackQuery) => {
                const choice = callbackQuery.data;
                bot.answerCallbackQuery(callbackQuery.id);

                let apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/removebg?imageUrl=${encodeURIComponent(imageUrl)}&type=auto&shadow=false`;

                if (choice === "use_bg_custom") {
                    bot.sendMessage(chatId, "🖼️ Kirimkan URL gambar untuk background baru:").then(() => {
                        bot.once("message", async (msg) => {
                            if (!msg.text || msg.text.startsWith("/")) return;
                            const bgImageUrl = msg.text.trim();

                            apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/removebg?imageUrl=${encodeURIComponent(imageUrl)}&type=auto&bgimageUrl=${encodeURIComponent(bgImageUrl)}&shadow=false`;

                            processImage(apiUrl, chatId);
                        });
                    });
                } else {
                    processImage(apiUrl, chatId);
                }
            });
        });
    });
});

// Fungsi untuk mengambil gambar dari API dan mengirim ke user
async function processImage(apiUrl, chatId) {
    bot.sendMessage(chatId, "⏳ Memproses gambar...");

    try {
        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

        if (response.status === 200) {
            const filePath = `rmbg_result.png`;
            fs.writeFileSync(filePath, response.data);

            bot.sendDocument(chatId, filePath, { caption: "✅ Background berhasil dihapus!" })
                .then(() => fs.unlinkSync(filePath)) // Hapus file setelah dikirim
                .catch(err => console.error("Error sending file:", err));
        } else {
            bot.sendMessage(chatId, "⚠️ Gagal menghapus background. Silakan coba lagi.");
        }
    } catch (error) {
        console.error("Error Remove BG:", error);
        bot.sendMessage(chatId, "❌ Terjadi kesalahan saat memproses gambar.");
    }
}

bot.onText(/^\/report$/, (msg) => {
    const chatId = msg.chat.id;
    const supportLink = "https://wa.me/62881036711862"; // Ganti dengan link support yang sesuai

    bot.sendMessage(chatId, `📢 Jika butuh bantuan, silakan kunjungi: [Klik di sini](${supportLink})`, {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
    });
});

bot.onText(/\/webrec/, async (msg) => {
    const chatId = msg.chat.id;

    // Langkah 1: Minta URL
    bot.sendMessage(chatId, "Silakan masukkan URL website yang ingin direkam:").then(() => {
        bot.once("message", async (msg) => {
            if (!msg.text || msg.text.startsWith("/")) return;
            const url = msg.text.trim();

            // Langkah 2: Pilih device (mobile/desktop)
            bot.sendMessage(chatId, "Pilih device: ketik *mobile* atau *desktop*", { parse_mode: "Markdown" }).then(() => {
                bot.once("message", async (msg) => {
                    const device = msg.text.toLowerCase();
                    if (device !== "mobile" && device !== "desktop") {
                        return bot.sendMessage(chatId, "Pilihan tidak valid. Gunakan *mobile* atau *desktop*.", { parse_mode: "Markdown" });
                    }

                    // Langkah 3: Pilih durasi (maks 30 detik)
                    bot.sendMessage(chatId, "Masukkan durasi rekaman dalam detik (maks 30):").then(() => {
                        bot.once("message", async (msg) => {
                            let time = parseInt(msg.text);
                            if (isNaN(time) || time < 1 || time > 30) {
                                return bot.sendMessage(chatId, "Durasi tidak valid. Masukkan angka antara 1-30.");
                            }

                            // Langkah 4: Pilih FPS (maks 120)
                            bot.sendMessage(chatId, "Masukkan FPS (maks 120):").then(() => {
                                bot.once("message", async (msg) => {
                                    let fps = parseInt(msg.text);
                                    if (isNaN(fps) || fps < 1 || fps > 120) {
                                        return bot.sendMessage(chatId, "FPS tidak valid. Masukkan angka antara 1-120.");
                                    }

                                    // Panggil API untuk merekam website
                                    const apiUrl = `https://fastrestapis.fasturl.cloud/tool/screenrecord?url=${encodeURIComponent(url)}&device=${device}&delay=0&time=${time}&fps=${fps}`;
                                    bot.sendMessage(chatId, "🔄 Sedang merekam... Mohon tunggu beberapa saat.");

                                    try {
                                        const response = await axios.get(apiUrl, { responseType: "stream" });

                                        if (response.status === 200) {
                                            bot.sendVideo(chatId, response.data, { caption: `🎥 Rekaman website: ${url}\n📱 Device: ${device}\n⏳ Durasi: ${time} detik\n🎞️ FPS: ${fps}` });
                                        } else {
                                            bot.sendMessage(chatId, "Gagal merekam website. Coba lagi nanti.");
                                        }
                                    } catch (error) {
                                        console.error("Error recording website:", error);
                                        bot.sendMessage(chatId, "Terjadi kesalahan saat merekam website.");
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

bot.onText(/^\/senduser$/, (msg) => {
    if (!isAdmin(msg)) {
        bot.sendMessage(msg.chat.id, "❌ Anda tidak memiliki izin untuk menggunakan perintah ini.");
        return;
    }

    if (!fs.existsSync(FILE_USERS)) {
        bot.sendMessage(msg.chat.id, "❌ Data pengguna tidak ditemukan.");
        return;
    }

    const users = JSON.parse(fs.readFileSync(FILE_USERS));
    let userList = [];
    let index = 1;

    // Menampilkan user yang bukan admin tambahan & pengembang
    for (const userId in users) {
        const user = users[userId];
        if (user.role !== "Admin Tambahan" && user.role !== "Pengembang") {
            userList.push(`${index}. ID: ${userId}\n   Username: ${user.username || "(tidak ada)"}\n   Role: ${user.role}`);
            index++;
        }
    }

    if (userList.length === 0) {
        bot.sendMessage(msg.chat.id, "✅ Tidak ada pengguna yang tersedia untuk dikirimi pesan.");
        return;
    }

    bot.sendMessage(msg.chat.id, "📋 **Daftar User:**\n" + userList.join("\n\n") + "\n\n> Ketik angka urutan user yang ingin dikirimi pesan.", {
        parse_mode: "Markdown",
    });

    bot.once("message", (msg) => {
        if (!isAdmin(msg)) return;

        const choice = parseInt(msg.text);
        if (isNaN(choice) || choice < 1 || choice > userList.length) {
            bot.sendMessage(msg.chat.id, "❌ Pilihan tidak valid.");
            return;
        }

        const targetUserId = Object.keys(users).filter(uid => users[uid].role !== "Admin Tambahan" && users[uid].role !== "Pengembang")[choice - 1];

        bot.sendMessage(msg.chat.id, "✉ Silakan ketik pesan yang ingin dikirim:");
        
        bot.once("message", (msg) => {
            if (!isAdmin(msg)) return;

            bot.sendMessage(targetUserId, `/[✉️𝚙𝚎𝚜𝚊𝚗 𝚍𝚊𝚛𝚒 𝚊𝚍𝚖𝚒𝚗]/\n${msg.text}`).then(() => {
                bot.sendMessage(msg.chat.id, "✅ Pesan telah dikirim!");
            }).catch(() => {
                bot.sendMessage(msg.chat.id, "❌ Gagal mengirim pesan.");
            });
        });
    });
});

bot.onText(/^\/tourl$/, (msg) => {
    bot.sendMessage(msg.chat.id, "📷 Kirimkan gambar yang ingin diubah menjadi URL.");

    bot.once("photo", async (msg) => {
        const chatId = msg.chat.id;
        const fileId = msg.photo[msg.photo.length - 1].file_id;

        try {
            // Mengambil file path dari Telegram
            const fileUrl = await bot.getFileLink(fileId);

            bot.sendMessage(chatId, "⏳ Mengunggah gambar...");

            // Mengunggah gambar ke ImgBB
            const formData = new FormData();
            formData.append("image", fileUrl);
            formData.append("key", IMGBB_API_KEY);

            const response = await axios.post("https://api.imgbb.com/1/upload", formData, {
                headers: { ...formData.getHeaders() }
            });

            if (response.data.success) {
                const imageUrl = response.data.data.url;
                const encodedUrl = encodeURI(imageUrl); // Encode URL agar tidak ada karakter error

                bot.sendMessage(chatId, `✅ Gambar berhasil diunggah!\n🌐 URL: [Klik di sini](${encodedUrl})`, {
                    parse_mode: "Markdown",
                    disable_web_page_preview: true // Supaya link tidak ada preview
                });
            } else {
                bot.sendMessage(chatId, "❌ Gagal mengunggah gambar.");
            }
        } catch (error) {
            console.error("Error:", error);
            bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengunggah gambar.");
        }
    });
});

// Muat atau buat file jadwal
let scheduleData = { time: "07:00", caption: "Selamat pagi! 🌞", video: DEFAULT_VIDEO };
if (fs.existsSync(FILE_SCHEDULE)) {
    scheduleData = JSON.parse(fs.readFileSync(FILE_SCHEDULE));
} else {
    fs.writeFileSync(FILE_SCHEDULE, JSON.stringify(scheduleData, null, 2));
}

// Fungsi menyimpan perubahan jadwal
const saveSchedule = () => {
    fs.writeFileSync(FILE_SCHEDULE, JSON.stringify(scheduleData, null, 2));
};

// Fungsi validasi admin dari users.json
const isAdmin = (msg) => {
    if (!fs.existsSync(FILE_USERS)) return false;

    const users = JSON.parse(fs.readFileSync(FILE_USERS));
    const userData = users[msg.chat.id];

    if (!userData) return false; // Jika user tidak ada di database, tolak
    return userData.role === "Pengembang" || userData.role === "Admin Tambahan";
};

// Fungsi mengirim video ke semua user
const sendMorningVideo = () => {
    if (!fs.existsSync(scheduleData.video)) {
        bot.sendMessage("6202819748", "❌ File video tidak ditemukan!");
        return;
    }
    if (!fs.existsSync(FILE_USERS)) {
        bot.sendMessage("6202819748", "❌ Daftar user tidak ditemukan!");
        return;
    }

    const users = JSON.parse(fs.readFileSync(FILE_USERS));
    Object.keys(users).forEach((userId) => {
        bot.sendVideo(userId, scheduleData.video, { caption: scheduleData.caption }).catch((err) => {
            bot.sendMessage("6202819748", `❌ Gagal mengirim ke ${userId}: ${err.message}`);
        });
    });

    bot.sendMessage("6202819748", "✅ Video pagi telah dikirim ke semua user.");
};

// Fungsi memperbarui jadwal
const updateSchedule = () => {
    if (!scheduleData.time || !/^\d{2}:\d{2}$/.test(scheduleData.time)) {
        bot.sendMessage("6202819748", "❌ Jadwal tidak valid, menggunakan default 07:00.");
        scheduleData.time = "07:00";
    }

    const [hour, minute] = scheduleData.time.split(":");

    // Hapus jadwal lama sebelum memperbarui
    const existingJob = schedule.scheduledJobs["morningJob"];
    if (existingJob) existingJob.cancel();

    schedule.scheduleJob("morningJob", `0 ${minute} ${hour} * * *`, sendMorningVideo);
    bot.sendMessage("-1002326815334", `✅ Jadwal pengiriman video diatur pada ${scheduleData.time} WIB.`);
};

// Load dan atur jadwal saat bot dijalankan
updateSchedule();

// Perintah utama /jadwalpagi (hanya admin)
bot.onText(/^\/jadwalpagi$/, async (msg) => {
    if (!isAdmin(msg)) {
        bot.sendMessage(msg.chat.id, "❌ Anda tidak memiliki izin untuk menggunakan perintah ini.");
        return;
    }

    bot.sendMessage(msg.chat.id, "Silakan pilih opsi:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🕒 Ubah Jadwal", callback_data: "edit_time" }],
                [{ text: "📝 Ubah Caption", callback_data: "edit_caption" }],
                [{ text: "📹 Unggah Video", callback_data: "edit_video" }],
                [{ text: "❌ Exit", callback_data: "exit" }]
            ]
        }
    });
});

// Handle tombol inline keyboard
bot.on("callback_query", async (callbackQuery) => {
    const msg = callbackQuery.message;
    if (!isAdmin(msg)) return;

    const action = callbackQuery.data;

    if (action === "edit_time") {
        bot.sendMessage(msg.chat.id, "Masukkan jam & menit dalam format HH:MM (contoh: 07:30):");
        bot.once("message", (msg) => {
            if (!isAdmin(msg)) return;

            if (!/^\d{2}:\d{2}$/.test(msg.text)) {
                bot.sendMessage(msg.chat.id, "❌ Format tidak valid. Gunakan format HH:MM.");
                return;
            }
            scheduleData.time = msg.text;
            saveSchedule();
            updateSchedule();
            bot.sendMessage(msg.chat.id, `✅ Jadwal diperbarui ke ${msg.text} WIB.`);
        });
    } else if (action === "edit_caption") {
        bot.sendMessage(msg.chat.id, "Silakan masukkan caption baru:");
        bot.once("message", (msg) => {
            if (!isAdmin(msg)) return;

            scheduleData.caption = msg.text;
            saveSchedule();
            bot.sendMessage(msg.chat.id, "✅ Caption telah diperbarui!");
        });
    } else if (action === "edit_video") {
        bot.sendMessage(msg.chat.id, "Silakan kirim video baru untuk menggantikan video pagi.");
    }
});

// Handle video untuk mengganti video pagi (hanya admin)
bot.on("video", (msg) => {
    if (!isAdmin(msg)) return;

    bot.getFileLink(msg.video.file_id).then((fileUrl) => {
        const videoPath = path.join(__dirname, "custom_morning_video.mp4");

        axios({
            url: fileUrl,
            method: "GET",
            responseType: "stream",
        }).then((response) => {
            const writer = fs.createWriteStream(videoPath);
            response.data.pipe(writer);

            writer.on("finish", () => {
                scheduleData.video = videoPath;
                saveSchedule();
                bot.sendMessage(msg.chat.id, "✅ Video telah diperbarui!");
            });

            writer.on("error", (err) => {
                bot.sendMessage(msg.chat.id, `❌ Gagal menyimpan video: ${err.message}`);
            });
        }).catch((err) => {
            bot.sendMessage(msg.chat.id, `❌ Gagal mengunduh video: ${err.message}`);
        });
    }).catch((err) => {
        bot.sendMessage(msg.chat.id, `❌ Gagal mendapatkan file video: ${err.message}`);
    });
});

const styles = [
    { name: "Hyper-Surreal Escape", id: "hyper" },
    { name: "Neon Fauvism", id: "neon" },
    { name: "Post-Analog Glitchscape", id: "glitch" },
    { name: "AI Dystopia", id: "dystopia" },
    { name: "Vivid Pop Explosion", id: "pop" }
];

bot.onText(/^\/aiimg$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Silakan masukkan prompt untuk gambar AI.")
        .then(() => {
            bot.once("message", async (msg) => {
                if (msg.text.startsWith("/")) return; // Abaikan jika user kirim perintah lain
                const prompt = encodeURIComponent(msg.text);

                // Menampilkan tombol pilihan style
                const keyboard = {
                    inline_keyboard: styles.map((style) => [
                        { text: style.name, callback_data: `aiimg|${style.id}|${prompt}` }
                    ])
                };

                bot.sendMessage(chatId, "Pilih style untuk gambar AI:", { reply_markup: JSON.stringify(keyboard) });
            });
        });
});

// Event handler untuk tombol pilihan style
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!data.startsWith("aiimg|")) return;

    const [, styleId, prompt] = data.split("|");
    const selectedStyle = styles.find((s) => s.id === styleId);

    if (!selectedStyle) {
        return bot.answerCallbackQuery(query.id, { text: "Style tidak ditemukan!" });
    }

    const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/flux/style?prompt=${prompt}&style=${encodeURIComponent(selectedStyle.name)}`;

    bot.answerCallbackQuery(query.id, { text: `Menghasilkan gambar dengan style: ${selectedStyle.name}...` });

    try {
        // Mengunduh gambar dari API
        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
        const imgPath = `ai_image_${chatId}.jpg`;

        // Simpan gambar sementara
        fs.writeFileSync(imgPath, response.data);

        // Kirim gambar ke user
        await bot.sendPhoto(chatId, fs.createReadStream(imgPath), { caption: `Style: ${selectedStyle.name}` });

        // Hapus file setelah dikirim
        fs.unlinkSync(imgPath);
    } catch (error) {
        bot.sendMessage(chatId, "Gagal mengambil gambar. Coba lagi nanti.");
        console.error("Error fetching AI image:", error);
    }
});

bot.onText(/\/register/, async (msg) => {
    const chatId = msg.chat.id;
    if (users[chatId]) {
        bot.sendMessage(chatId, "📌 Anda sudah terdaftar!");
        return;
    }

    bot.sendMessage(chatId, "📝 Silakan masukkan username yang ingin Anda gunakan:");
    bot.once("message", async (response) => {
        const username = response.text.trim();

        // Cek apakah username sudah digunakan
        if (Object.values(users).some((user) => user.username === username)) {
            bot.sendMessage(chatId, "⚠️ Username sudah dipakai, silakan pilih yang lain.");
            return;
        }

        // Simpan data user baru
        users[chatId] = {
            username,
            role: chatId == OWNER_ID ? "Pengembang" : "User",
            joinDate: new Date().toLocaleDateString(),
            messages: 0,
        };

        simpanData(); // Simpan data ke users.json

        // Kirim kata sambutan langsung tanpa gambar API dan musik
        bot.sendMessage(
            chatId,
            `✅ Pendaftaran berhasil!\n🎉 Selamat datang, *${username}*! Semoga betah di sini.`,
            { parse_mode: "Markdown" }
        );
    });
});

bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    if (!users[chatId]) {
        bot.sendMessage(chatId, "🔐 Anda belum terdaftar!");
        return;
    }

    const user = users[chatId];
    const profileCaption = `👤 *Profil Anda:*\n`
        + `🆔 ID: *${chatId}*\n`
        + `📛 Username: *${user.username}*\n`
        + `📌 Role: *${user.role}*\n`
        + `📅 Bergabung: *${user.joinDate || "Tidak diketahui"}*\n`;

    try {
        const photos = await bot.getUserProfilePhotos(chatId);
        if (photos.total_count > 0) {
            const fileId = photos.photos[0][0].file_id; // Ambil foto terbaru
            bot.sendPhoto(chatId, fileId, { caption: profileCaption, parse_mode: "Markdown" });
        } else {
            bot.sendMessage(chatId, profileCaption, { parse_mode: "Markdown" });
        }
    } catch (error) {
        console.error("Gagal mengambil foto profil:", error);
        bot.sendMessage(chatId, profileCaption, { parse_mode: "Markdown" });
    }
});

// 🔹 Handle /logout
bot.onText(/\/logout/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = users[userId]?.username;

    if (!username) {
        return bot.sendMessage(chatId, "⚠️ Kamu belum terdaftar. Gunakan /register untuk mendaftar.");
    }

    delete users[userId];
    simpanData(); // Simpan data ke users.json

    // Kirim pesan perpisahan langsung tanpa gambar API
    bot.sendMessage(chatId, `👋 Selamat tinggal, *${username}*! Semoga kita bertemu lagi.`, { parse_mode: "Markdown" });
});

// 🔹 Handle /help
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, `📌 *Daftar Perintah:*\n`
        + `/register - Daftar akun\n`
        + `/profile - Lihat profil\n`
        + `/logout - Keluar dari akun\n`
        + `/forum on - Masuk forum chat\n`
        + `/forum off - Keluar forum\n`
        + `/addkode - Tambah kode admin\n`
        + `/pluskode - Gunakan kode admin\n`
        + `/deladmin - Hapus admin\n`
        + `/wikipedia - search wikipedia\n`
        + `/stalker - cari informasi user\n`
        + `/nulis - menulis di canvas\n`
        + `/addmsg - menambahkan msg\n`
        + `/listmsg - melihat daftar msg\n`
        + `/delmsg - menghapus msg\n`
        + `/ngl - kirim pesan ke ngl\n`
        + `/tts - mengubah text ke audio\n`
        + `/aiimage - membuat gambar\n`
        + `/kalender - melihat kalender\n`
        + `/webrec - merekam website\n`
        + `/yts - YouTube search\n`
        + `/ai - bertanya ke ai\n`
        + `/autoai - ngobrol dengan ai\n`
        + `/shai - gemini img\n`
        + `/pin - cari gambar di pin\n`
        + `/artime - cari arti nama\n`
        + `/getpp - ambil pp user\n`
        + `/brat - buat brat\n`
        + `/igstalk - stalker instagram\n`
        + `/cuaca - cek cuaca daerah anda\n`
        + `/ttstalk - stalker tiktok\n`
        + `/dewatermark - hapus watermark`,
        { parse_mode: "Markdown" }
    );
});

// 🔹 Handle /forum (on/off)
bot.onText(/\/forum (on|off)/, (msg, match) => {
    const chatId = msg.chat.id;
    if (!users[chatId]) {
        bot.sendMessage(chatId, "🔐 Anda belum terdaftar!");
        return;
    }
    
    if (match[1] === "on") {
        forumUsers[chatId] = users[chatId].username;
        simpanData();
        bot.sendMessage(chatId, "📢 Anda masuk forum!");
    } else {
        delete forumUsers[chatId];
        simpanData();
        bot.sendMessage(chatId, "📢 Anda keluar forum.");
    }
});

// 🔹 Handle pesan di forum
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith("/") || !forumUsers[chatId]) return;

    const username = users[chatId] ? users[chatId].username : "Anonim"; // Cegah error
    Object.keys(forumUsers).forEach(id => {
        if (id !== chatId.toString()) {
            bot.sendMessage(id, `💬 *${username}:* ${text}`, { parse_mode: "Markdown" });
        }
    });
});

bot.onText(/\/shai/, async (msg) => {
    const chatId = msg.chat.id;

    // Minta pertanyaan dari user
    bot.sendMessage(chatId, "✍️ Silakan masukkan pertanyaan untuk AI mengenai gambar ini:").then(() => {
        bot.once("message", async (msg) => {
            if (!msg.text || msg.text.startsWith("/")) return;
            const userQuestion = msg.text.trim();

            // Minta URL gambar dari user
            bot.sendMessage(chatId, "🖼️ Sekarang, kirimkan URL gambar yang ingin dianalisis:").then(() => {
                bot.once("message", async (msg) => {
                    if (!msg.text || msg.text.startsWith("/")) return;
                    const imageUrl = msg.text.trim();

                    bot.sendMessage(chatId, "⏳ Menganalisis gambar... Mohon tunggu.");

                    // Kirim permintaan ke API
                    try {
                        const response = await axios.post(
                            "https://fastrestapis.fasturl.cloud/aillm/gemini/image",
                            { ask: userQuestion, image: imageUrl },
                            { headers: { "Content-Type": "application/json" } }
                        );

                        if (response.data && response.data.result) {
                            const description = response.data.result.replace(/\*\*/g, ""); // Hilangkan bold **

                            // Bagi teks jika terlalu panjang (> 4000 karakter)
                            const MAX_LENGTH = 4000;
                            if (description.length > MAX_LENGTH) {
                                let parts = description.match(new RegExp(`.{1,${MAX_LENGTH}}`, "g"));
                                parts.forEach((part, index) => {
                                    setTimeout(() => {
                                        bot.sendMessage(chatId, part);
                                    }, index * 1000);
                                });
                            } else {
                                bot.sendMessage(chatId, description);
                            }
                        } else {
                            bot.sendMessage(chatId, "⚠️ Tidak ada deskripsi yang tersedia untuk gambar ini.");
                        }
                    } catch (error) {
                        console.error("Error AI response:", error);
                        bot.sendMessage(chatId, "❌ Terjadi kesalahan saat menghubungi AI.");
                    }
                });
            });
        });
    });
});

// 🔹 Handle /wikipedia
bot.onText(/\/wikipedia/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "🔍 Apa yang ingin Anda cari di Wikipedia?");
    
    bot.once("message", async (queryMsg) => {
        const query = queryMsg.text.trim();
        if (!query) {
            return bot.sendMessage(chatId, "❌ Mohon masukkan kata kunci pencarian.");
        }

        try {
            // Cari artikel di Wikipedia
            const searchUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`;
            const searchResponse = await axios.get(searchUrl);
            const searchResults = searchResponse.data.query.search;

            if (searchResults.length === 0) {
                return bot.sendMessage(chatId, "❌ Tidak ditemukan hasil pencarian.");
            }

            // Format hasil pencarian
            let resultText = "🔍 Hasil pencarian:\n\n";
            searchResults.slice(0, 5).forEach((result, index) => {
                resultText += `${index + 1}. ${result.title}\n`;
            });

            // Kirim hasil pencarian dengan tombol pilihan
            const options = {
                reply_markup: {
                    inline_keyboard: searchResults.slice(0, 5).map((result, index) => [
                        { text: `${index + 1}`, callback_data: `wiki:${result.pageid}` }
                    ])
                }
            };

            bot.sendMessage(chatId, resultText + "\nPilih salah satu nomor untuk melihat detail:", options);
        } catch (error) {
            console.error("Gagal mencari di Wikipedia:", error);
            bot.sendMessage(chatId, "❌ Gagal melakukan pencarian. Silakan coba lagi.");
        }
    });
});

// 🔹 Handle callback query (tombol pilihan)
bot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Pastikan hanya menangani callback dari Wikipedia
    if (!data.startsWith("wiki:")) return;

    const pageId = data.split(":")[1];

    try {
        // Ambil konten artikel berdasarkan pageId
        const contentUrl = `https://id.wikipedia.org/w/api.php?action=query&prop=extracts&pageids=${pageId}&explaintext=true&format=json`;
        const contentResponse = await axios.get(contentUrl);
        const page = contentResponse.data.query.pages[pageId];

        if (!page || !page.extract) {
            return bot.sendMessage(chatId, "❌ Gagal mengambil konten artikel.");
        }

        // Potong teks jika terlalu panjang
        const maxLength = 4096; // Batas maksimal pesan Telegram
        const articleText = page.extract;

        // Fungsi untuk membagi teks menjadi beberapa bagian
        const splitMessage = (text, maxLength) => {
            const parts = [];
            while (text.length > 0) {
                parts.push(text.substring(0, maxLength));
                text = text.substring(maxLength);
            }
            return parts;
        };

        // Bagi teks artikel menjadi beberapa bagian
        const messageParts = splitMessage(articleText, maxLength);

        // Kirim judul artikel
        await bot.sendMessage(chatId, `📖 *${page.title}*`, { parse_mode: "Markdown" });

        // Kirim setiap bagian pesan
        for (const part of messageParts) {
            await bot.sendMessage(chatId, part);
        }
    } catch (error) {
        console.error("Gagal mengambil konten artikel:", error);
        bot.sendMessage(chatId, "❌ Gagal mengambil konten artikel. Silakan coba lagi.");
    }
});

bot.onText(/^\/aiimgf$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Silakan masukkan prompt untuk gambar AI.")
        .then(() => {
            bot.once("message", async (msg) => {
                if (msg.text.startsWith("/")) return; // Abaikan jika user kirim perintah lain
                const prompt = encodeURIComponent(msg.text);
                const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/nsfw?prompt=${prompt}`;

                try {
                    // Mengunduh gambar dari API
                    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
                    const imgPath = path.join(__dirname, "ai_image.jpg");

                    // Menyimpan gambar sebagai file sementara
                    fs.writeFileSync(imgPath, response.data);

                    // Mengirimkan gambar ke user
                    await bot.sendPhoto(chatId, fs.createReadStream(imgPath), { caption: "Berikut gambarnya." });

                    // Hapus file setelah dikirim
                    fs.unlinkSync(imgPath);
                } catch (error) {
                    bot.sendMessage(chatId, "Gagal mengambil gambar. Coba lagi nanti.");
                    console.error("Error fetching AI image:", error);
                }
            });
        });
});

// 🔹 Handle /nulis
bot.onText(/\/nulis/, (msg) => {
    const chatId = msg.chat.id;

    // Minta pengguna untuk mengisi nama (opsional)
    bot.sendMessage(chatId, "📝 Silakan masukkan nama Anda (opsional):");
    bot.once("message", (nameMsg) => {
        const name = nameMsg.text.trim();

        // Minta pengguna untuk mengisi kelas (opsional)
        bot.sendMessage(chatId, "📚 Silakan masukkan kelas Anda (opsional):");
        bot.once("message", (classMsg) => {
            const kelas = classMsg.text.trim();

            // Minta pengguna untuk mengisi teks (wajib)
            bot.sendMessage(chatId, "🖋 Silakan masukkan teks yang ingin ditulis:");
            bot.once("message", async (textMsg) => {
                const text = textMsg.text.trim();

                if (!text) {
                    return bot.sendMessage(chatId, "❌ Teks tidak boleh kosong. Silakan coba lagi.");
                }

                // Buat URL API dengan input pengguna
                const apiUrl = `https://api.siputzx.my.id/api/m/nulis?text=${encodeURIComponent(text)}&name=${encodeURIComponent(name)}&class=${encodeURIComponent(kelas)}`;

                try {
                    // Ambil gambar dari API
                    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

                    // Kirim gambar ke pengguna
                    await bot.sendPhoto(chatId, Buffer.from(response.data), {
                        caption: "✅ Berhasil membuat tulisan!",
                    });
                } catch (error) {
                    console.error("Gagal mengambil gambar:", error);
                    bot.sendMessage(chatId, "❌ Gagal membuat tulisan. Silakan coba lagi.");
                }
            });
        });
    });
});

// 🔹 Handle /stalker
bot.onText(/\/stalker/, (msg) => {
    const chatId = msg.chat.id;

    // Minta pengguna untuk memasukkan ID
    bot.sendMessage(chatId, "🔍 Masukkan ID pengguna yang ingin Anda stalk:");
    bot.once("message", async (idMsg) => {
        const userId = idMsg.text.trim();

        if (!userId || isNaN(userId)) {
            return bot.sendMessage(chatId, "❌ ID tidak valid. Silakan masukkan ID yang benar.");
        }

        try {
            // Dapatkan informasi pengguna dari ID
            const userInfo = await bot.getChat(userId);

            // Dapatkan foto profil pengguna
            const photos = await bot.getUserProfilePhotos(userId);

            // Format informasi pengguna
            let userDetails = `👤 *Informasi Pengguna:*\n`
                + `🆔 ID: *${userInfo.id}*\n`
                + `👀 Nama: *${userInfo.first_name} ${userInfo.last_name || ""}*\n`
                + `📛 Username: *${userInfo.username || "Tidak ada"}*\n`
                + `📝 Bio: *${userInfo.bio || "Tidak ada"}*`;

            // Jika pengguna memiliki foto profil
            if (photos.total_count > 0) {
                const fileId = photos.photos[0][0].file_id; // Ambil foto terbaru
                const photoUrl = await bot.getFileLink(fileId);

                // Kirim foto profil dan informasi pengguna
                await bot.sendPhoto(chatId, fileId, {
                    caption: userDetails,
                    parse_mode: "Markdown",
                });
            } else {
                // Kirim hanya informasi pengguna jika tidak ada foto profil
                await bot.sendMessage(chatId, userDetails, { parse_mode: "Markdown" });
            }
        } catch (error) {
            console.error("Gagal mendapatkan informasi pengguna:", error);
            bot.sendMessage(chatId, "❌ Gagal mendapatkan informasi pengguna. Pastikan ID benar dan pengguna tidak membatasi privasi mereka.");
        }
    });
});

// 🔹 Handle /addkode (Pengembang)
bot.onText(/\/addkode/, (msg) => {
    const chatId = msg.chat.id;
    if (!users[chatId] || users[chatId].role !== "Pengembang") {
        bot.sendMessage(chatId, "🚫 Hanya Pengembang yang bisa menambah admin!");
        return;
    }

    bot.sendMessage(chatId, "📝 Masukkan kode unik:")
        .then(() => {
            bot.once("message", (msg) => {
                const kode = msg.text.trim();
                adminCodes[kode] = true;
                simpanData();
                bot.sendMessage(chatId, `✅ Kode berhasil dibuat: \`${kode}\` ✅`, { parse_mode: "Markdown" });
            });
        });
});

// 🔹 Handle /pluskode (User jadi Admin)
bot.onText(/\/pluskode/, (msg) => {
    const chatId = msg.chat.id;
    if (!users[chatId]) {
        bot.sendMessage(chatId, "🔐 Anda belum terdaftar!");
        return;
    }

    bot.sendMessage(chatId, "🔑 Masukkan kode admin:")
        .then(() => {
            bot.once("message", (msg) => {
                const kode = msg.text.trim();
                if (!adminCodes[kode]) {
                    bot.sendMessage(chatId, "❌ Kode salah atau sudah digunakan!");
                    return;
                }
                delete adminCodes[kode];
                users[chatId].role = "Admin";
                simpanData();
                bot.sendMessage(chatId, "✅ Anda sekarang Admin Tambahan!");
            });
        });
});

// 🔹 Handle /deladmin (Pengembang)
bot.onText(/\/deladmin/, (msg) => {
    const chatId = msg.chat.id;
    if (!users[chatId] || users[chatId].role !== "Pengembang") {
        bot.sendMessage(chatId, "🚫 Hanya Pengembang yang bisa menghapus admin!");
        return;
    }

    const adminList = Object.entries(users).filter(([id, user]) => user.role === "Admin Tambahan");
    if (adminList.length === 0) {
        bot.sendMessage(chatId, "⚠️ Tidak ada Admin Tambahan.");
        return;
    }

    bot.sendMessage(chatId, "🗑 Masukkan username Admin yang ingin dihapus:")
        .then(() => {
            bot.once("message", (msg) => {
                const username = msg.text.trim();
                const adminId = adminList.find(([id, user]) => user.username === username)?.[0];

                if (!adminId) {
                    bot.sendMessage(chatId, "❌ Admin tidak ditemukan!");
                    return;
                }

                users[adminId].role = "User";
                simpanData();
                bot.sendMessage(chatId, `✅ Admin *${username}* dihapus!`, { parse_mode: "Markdown" });
            });
        });
});

bot.onText(/^\/tts$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Silakan kirimkan teks yang ingin diubah menjadi suara:");

    bot.once("message", async (msg) => {
        const text = encodeURIComponent(msg.text);
        const apiUrl = `https://api.siputzx.my.id/api/tools/tts?text=${text}&voice=id-ID-ArdiNeural&rate=0%&pitch=0Hz&volume=0%`;

        try {
            const response = await axios({
                url: apiUrl,
                method: "GET",
                responseType: "arraybuffer",
            });

            const audioPath = path.join(__dirname, "tts_audio.ogg");
            fs.writeFileSync(audioPath, response.data);

            bot.sendVoice(chatId, audioPath, { caption: "🎙️ done..." })
                .then(() => fs.unlinkSync(audioPath)); // Hapus file setelah dikirim
        } catch (error) {
            console.error("Error:", error);
            bot.sendMessage(chatId, "❌ Terjadi kesalahan saat menghubungi API atau mengunduh audio.");
        }
    });
});

bot.onText(/^\/ngl/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "✉️ Silakan kirimkan link NGL Anda:");
    
    bot.once("message", (msg) => {
        const nglLink = msg.text;
        if (!nglLink.startsWith("https://")) {
            return bot.sendMessage(chatId, "Link tidak valid. Pastikan menggunakan format yang benar.");
        }

        bot.sendMessage(chatId, "Sekarang kirimkan teks yang ingin dikirim:");
        
        bot.once("message", (msg) => {
            const text = msg.text;
            const apiUrl = `https://api.siputzx.my.id/api/tools/ngl?link=${encodeURIComponent(nglLink)}&text=${encodeURIComponent(text)}`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.status && data.data && data.data.questionId) {
                        bot.sendMessage(chatId, `✅ Pesan berhasil dikirim!\n\n📌 Question ID: \`${data.data.questionId}\``, { parse_mode: "Markdown" });
                    } else {
                        bot.sendMessage(chatId, "❌ Gagal mengirim pesan ke NGL.");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat menghubungi API.");
                });
        });
    });
});

// 🔹 Handle /addmsg
bot.onText(/\/addmsg/, (msg) => {
    const chatId = msg.chat.id;

    // Minta pengguna untuk memasukkan judul pesan
    bot.sendMessage(chatId, "📝 Masukkan judul pesan yang ingin Anda simpan:");
    bot.once("message", (titleMsg) => {
        const title = titleMsg.text.trim();

        if (!title) {
            return bot.sendMessage(chatId, "❌ Judul tidak boleh kosong. Silakan coba lagi.");
        }

        // Minta pengguna untuk mengirimkan pesan yang ingin disimpan
        bot.sendMessage(chatId, "📤 Silakan kirim pesan (text, file, audio, foto, video) yang ingin Anda simpan:");
        bot.once("message", (contentMsg) => {
            const content = {
                type: contentMsg.photo ? "photo" :
                      contentMsg.video ? "video" :
                      contentMsg.audio ? "audio" :
                      contentMsg.document ? "file" :
                      "text",
                data: contentMsg.text || contentMsg.photo || contentMsg.video || contentMsg.audio || contentMsg.document
            };

            // Simpan pesan ke database
            if (!userMessages[chatId]) {
                userMessages[chatId] = {};
            }
            userMessages[chatId][title] = content;

            // Simpan database ke file
            fs.writeFileSync("userMessages.json", JSON.stringify(userMessages, null, 2));

            bot.sendMessage(chatId, `✅ Pesan dengan judul *${title}* berhasil disimpan!`, { parse_mode: "Markdown" });
        });
    });
});

// 🔹 Handle /listmsg
bot.onText(/\/listmsg/, (msg) => {
    const chatId = msg.chat.id;

    // Minta pengguna untuk memasukkan ID mereka
    bot.sendMessage(chatId, "🔐 Masukkan ID Anda untuk melihat pesan yang tersimpan jika tidak tahu ID anda anda bisa mengunjungi '@userinfobot':");
    bot.once("message", (idMsg) => {
        const userId = idMsg.text.trim();

        if (!userMessages[userId]) {
            return bot.sendMessage(chatId, "❌ Tidak ada pesan yang tersimpan untuk ID ini.");
        }

        // Tampilkan daftar pesan yang tersimpan
        const messages = Object.keys(userMessages[userId]);
        let messageList = "📂 Daftar pesan Anda:\n\n";
        messages.forEach((title, index) => {
            messageList += `${index + 1}. ${title}\n`;
        });

        // Kirim daftar pesan
        bot.sendMessage(chatId, messageList + "\nPilih nomor pesan untuk melihat isinya:", {
            reply_markup: {
                inline_keyboard: messages.map((title, index) => [
                    { text: `${index + 1}`, callback_data: `viewmsg_${userId}_${title}` }
                ])
            }
        });
    });
});

// 🔹 Handle callback query untuk melihat pesan
bot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const [action, userId, title] = callbackQuery.data.split("_");

    if (action === "viewmsg") {
        const message = userMessages[userId][title];

        if (!message) {
            return bot.sendMessage(chatId, "❌ Pesan tidak ditemukan.");
        }

        // Kirim pesan sesuai jenisnya
        switch (message.type) {
            case "text":
                bot.sendMessage(chatId, `📝 *${title}*\n\n${message.data}`, { parse_mode: "Markdown" });
                break;
            case "photo":
                bot.sendPhoto(chatId, message.data[0].file_id, { caption: `📷 *${title}*`, parse_mode: "Markdown" });
                break;
            case "video":
                bot.sendVideo(chatId, message.data.file_id, { caption: `🎥 *${title}*`, parse_mode: "Markdown" });
                break;
            case "audio":
                bot.sendAudio(chatId, message.data.file_id, { caption: `🎵 *${title}*`, parse_mode: "Markdown" });
                break;
            case "file":
                bot.sendDocument(chatId, message.data.file_id, { caption: `📄 *${title}*`, parse_mode: "Markdown" });
                break;
            default:
                bot.sendMessage(chatId, "❌ Jenis pesan tidak dikenali.");
        }
    }
});

// 🔹 Handle /delmsg
bot.onText(/\/delmsg/, (msg) => {
    const chatId = msg.chat.id;

    // Minta pengguna untuk memasukkan ID mereka
    bot.sendMessage(chatId, "🔐 Masukkan ID Anda untuk menghapus pesan yang tersimpan:");
    bot.once("message", (idMsg) => {
        const userId = idMsg.text.trim();

        if (!userMessages[userId]) {
            return bot.sendMessage(chatId, "❌ Tidak ada pesan yang tersimpan untuk ID ini.");
        }

        // Tampilkan daftar pesan yang tersimpan
        const messages = Object.keys(userMessages[userId]);
        let messageList = "📂 Daftar pesan Anda:\n\n";
        messages.forEach((title, index) => {
            messageList += `${index + 1}. ${title}\n`;
        });

        // Kirim daftar pesan dengan tombol untuk menghapus
        bot.sendMessage(chatId, messageList + "\nPilih nomor pesan untuk menghapus:", {
            reply_markup: {
                inline_keyboard: messages.map((title, index) => [
                    { text: `${index + 1}`, callback_data: `delmsg_${userId}_${title}` }
                ])
            }
        });
    });
});

// 🔹 Handle callback query untuk menghapus pesan
bot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const [action, userId, title] = callbackQuery.data.split("_");

    if (action === "delmsg") {
        if (!userMessages[userId] || !userMessages[userId][title]) {
            return bot.sendMessage(chatId, "❌ Pesan tidak ditemukan.");
        }

        // Hapus pesan dari database
        delete userMessages[userId][title];

        // Jika tidak ada pesan tersisa, hapus entri pengguna
        if (Object.keys(userMessages[userId]).length === 0) {
            delete userMessages[userId];
        }

        // Simpan database ke file
        fs.writeFileSync("userMessages.json", JSON.stringify(userMessages, null, 2));

        bot.sendMessage(chatId, `✅ Pesan dengan judul *${title}* berhasil dihapus!`, { parse_mode: "Markdown" });
    }
});

// Load database
if (fs.existsSync("userMessages.json")) {
    const data = fs.readFileSync("userMessages.json");
    Object.assign(userMessages, JSON.parse(data));
}