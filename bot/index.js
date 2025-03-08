import { bot } from "./bot.js";   // Impor bot dari bot.js
import * as main from "./main3.js";  // Impor semua fitur dari main3.js
import * as spam from "./spam.js";
import * as up from "./up.js";

// Warna ANSI
const cyan = "\x1b[36m";
const yellow = "\x1b[33m";
const green = "\x1b[32m";
const reset = "\x1b[0m";

// Header Bot
console.log(`${cyan}╔═══════════════════════════════════╗`);
console.log(`${cyan}║  ${yellow}🤖 Bot sedang berjalan...  ${cyan}`);
console.log(`${cyan}╚═══════════════════════════════════╝${reset}\n`);

// Pastikan bot berhasil diimpor sebelum menjalankan fungsi lain
if (!bot) {
  console.error("❌ Bot gagal dijalankan. Periksa kembali token atau bot.js.");
  process.exit(1);
}

// Mengeksekusi semua fungsi yang ada di main3.js, jika ada
Object.values(main).forEach(fn => {
    if (typeof fn === "function") {
        console.log(`${green}[✔] Menjalankan fungsi: ${fn.name || 'Anonim'}...${reset}`);
        fn();
    }
});