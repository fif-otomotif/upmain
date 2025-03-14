import { bot } from "./bot.js";
import * as main from "./main3.js";
import * as spam from "./spam.js";
import * as up from "./up.js";
import * as sc from "./sc.js";
import * as slot from "./slot.js";
import * as chatlog from "./chatlog.js";
import * as info from "./info.js";
import * as dasboard from "./dasboard.js";
import * as menu from "./menu.js"
import * as stbot from "./stbot.js"
import * as termux from "./main.js"
import * as menuinfo from "./menuinfo.js"
import * as qr from "./qr.js";
import * as mtk from "./mtk.js";

// Warna ANSI
const cyan = "\x1b[36m";
const yellow = "\x1b[33m";
const green = "\x1b[32m";
const reset = "\x1b[0m";

// Header Bot
console.log(`${cyan}╔═══════════════════════════════════╗`);
console.log(`${cyan}║  ${yellow}🤖 Bot berjalan...  ${cyan}`);
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