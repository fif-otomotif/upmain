import { bot } from './bot.js';

let userStatus = {}; // Menyimpan data user (ID, waktu pesan, jumlah pesan, status blokir)

// Fungsi untuk memeriksa spam
const checkSpam = (chatId) => {
  const currentTime = Date.now();
  const timeLimit = 5000; // 5 detik
  const spamLimit = 5;    // 5 pesan

  if (!userStatus[chatId]) {
    userStatus[chatId] = { messages: [], blocked: false };
  }

  const userMessages = userStatus[chatId].messages;
  const blocked = userStatus[chatId].blocked;

  // Hapus pesan yang lebih lama dari 5 detik
  userStatus[chatId].messages = userMessages.filter(timestamp => currentTime - timestamp <= timeLimit);

  if (userMessages.length >= spamLimit) {
    if (!blocked) {
      // Jika spam melebihi batas, blokir user untuk 10 detik
      userStatus[chatId].blocked = true;
      bot.sendMessage(chatId, 'Anda sedang diblokir sementara karena spam. Harap tunggu 10 detik.');
      
      // Set timer untuk membuka blokir setelah 10 detik
      setTimeout(() => {
        userStatus[chatId].blocked = false;
        bot.sendMessage(chatId, 'Anda dapat menggunakan bot kembali!');
      }, 10000);
    }
    return false; // Spam terdeteksi
  }

  // Tambah timestamp pesan baru
  userStatus[chatId].messages.push(currentTime);
  return true; // Tidak ada spam
};

// Menangani pesan masuk
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (userStatus[chatId] && userStatus[chatId].blocked) {
    return; // Jika user diblokir, tidak akan diproses
  }

  // Periksa apakah user mengirim spam
  if (checkSpam(chatId)) {
    bot.sendMessage(chatId, 'Pesan Anda diterima!');
  }
});