import TelegramBot from "node-telegram-bot-api";
import { handleJamCommand } from "./jam.js";

const TOKEN = "7827504152:AAG8mfWl81w2n5E7NWCJlaEwLyQrd8KKqfM"; // Ganti dengan token bot-mu
const bot = new TelegramBot(TOKEN, { polling: true });

handleJamCommand(bot);

export default bot;