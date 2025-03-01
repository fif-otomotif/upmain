import './bot.js';   // Hanya menjalankan koneksi bot
import * as main from './main3.js';  // Impor semua fitur dari main3.js

// Warna ANSI
const cyan = "\x1b[36m";
const yellow = "\x1b[33m";
const green = "\x1b[32m";
const reset = "\x1b[0m";

// Header Bot
console.log(`${cyan}╔═══════════════════════════════════╗`);
console.log(`${cyan}║  ${yellow}🤖 Bot sedang berjalan...  ${cyan}`);
console.log(`${cyan}╚═══════════════════════════════════╝${reset}\n`);

// Mengeksekusi semua fungsi yang ada di main3.js, jika ada
Object.values(main).forEach(fn => {
    if (typeof fn === "function") {
        console.log(`${green}[✔] Menjalankan fungsi: ${fn.name || 'Anonim'}...${reset}`);
        fn();
    }
});