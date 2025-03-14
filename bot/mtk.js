import { bot } from './bot.js';

function hitungStatistik(data) {
  let angka = data.map(Number).sort((a, b) => a - b);

  // Mean (rata-rata)
  let mean = angka.reduce((a, b) => a + b, 0) / angka.length;

  // Median
  let median;
  let tengah = Math.floor(angka.length / 2);
  if (angka.length % 2 === 0) {
    median = (angka[tengah - 1] + angka[tengah]) / 2;
  } else {
    median = angka[tengah];
  }

  // Modus
  let frekuensi = {};
  angka.forEach((num) => (frekuensi[num] = (frekuensi[num] || 0) + 1));
  let maxFreq = Math.max(...Object.values(frekuensi));
  let modus = Object.keys(frekuensi).filter((key) => frekuensi[key] === maxFreq);
  
  return {
    modus: modus.join(", "),
    median: median,
    mean: mean.toFixed(2),
  };
}

bot.onText(/\/mtk/, (msg) => {
  bot.sendMessage(msg.chat.id, "Masukkan angka yang dipisahkan dengan koma (,)");
  
  bot.once("message", (msg) => {
    let input = msg.text.replace(/\s+/g, "").split(",");
    if (input.some((x) => isNaN(x))) {
      return bot.sendMessage(msg.chat.id, "⚠️ Masukkan hanya angka yang dipisahkan koma.");
    }

    let hasil = hitungStatistik(input);
    bot.sendMessage(msg.chat.id, `📊 Hasil Perhitungan:\n• Modus  = ${hasil.modus}\n• Median = ${hasil.median}\n• Mean   = ${hasil.mean}`);
  });
});