import { bot } from './bot.js';
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const TOKEN = "7827504152:AAG8mfWl81w2n5E7NWCJlaEwLyQrd8KKqfM";

const CATBOX_UPLOAD_URL = "https://catbox.moe/user/api.php";
const QR_TEXT_API = "https://api.siputzx.my.id/api/tools/text2qr?text=";
const QR_SCAN_API = "https://api.siputzx.my.id/api/tools/qr2text?url=";

// Handle /text2qr
bot.onText(/^\/text2qr (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = encodeURIComponent(match[1]);

  try {
    const qrUrl = `${QR_TEXT_API}${text}`;
    await bot.sendPhoto(chatId, qrUrl, { caption: "Berikut QR Code-nya!" });
  } catch (error) {
    bot.sendMessage(chatId, "Gagal membuat QR Code.");
  }
});

// Handle /qr2text
bot.onText(/^\/qr2text$/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Silakan kirim gambar QR yang ingin di-scan.");
});

// Handle gambar dari user setelah /qr2text
bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.photo[msg.photo.length - 1].file_id;

  try {
    const file = await bot.getFile(fileId);
    const filePath = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
    const tempFileName = `./temp_${Date.now()}.jpg`;

    // Unduh gambar
    const response = await axios({
      url: filePath,
      responseType: "stream",
    });
    const writer = fs.createWriteStream(tempFileName);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Unggah ke Catbox
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", fs.createReadStream(tempFileName));

    const catboxResponse = await axios.post(CATBOX_UPLOAD_URL, formData, {
      headers: formData.getHeaders(),
    });

    fs.unlinkSync(tempFileName); // Hapus file sementara

    if (!catboxResponse.data.includes("https://files.catbox.moe/")) {
      return bot.sendMessage(chatId, "Gagal mengunggah gambar ke Catbox.");
    }

    const imageUrl = catboxResponse.data.trim();
    console.log("Gambar berhasil diunggah ke Catbox:", imageUrl);

    // Kirim ke API QR Scanner
    const qrResponse = await axios.get(QR_SCAN_API + encodeURIComponent(imageUrl));
    console.log("Respon dari API QR:", qrResponse.data);

    if (qrResponse.data.status) {
      bot.sendMessage(chatId, `Hasil scan: \n\`${qrResponse.data.data.text}\``, { parse_mode: "Markdown" });
    } else {
      bot.sendMessage(chatId, "QR Code tidak dapat dibaca.");
    }
  } catch (error) {
    console.error("Error:", error);
    bot.sendMessage(chatId, "Terjadi kesalahan saat memproses gambar.");
  }
});