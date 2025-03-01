import TelegramBot from "node-telegram-bot-api";
import { TOKEN } from "./config.js"; // Impor token dari config.js

const bot = new TelegramBot(TOKEN, { polling: true });

export default bot;