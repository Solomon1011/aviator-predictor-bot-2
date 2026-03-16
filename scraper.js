const puppeteer = require("puppeteer");
const fs = require("fs");
const TelegramBot = require('node-telegram-bot-api');

// Get Telegram token and chat ID from environment variables (for security)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

const HISTORY_FILE = "history.json";

// Send message to Telegram
function sendTelegramMessage(message) {
    bot.sendMessage(CHAT_ID, message).catch(console.error);
}

function loadHistory() {
    try {
        const data = fs.readFileSync(HISTORY_FILE);
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveHistory(history) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

(async () => {
    console.log("Bot started...");

    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.goto("https://www.sportybet.com", {
        waitUntil: "networkidle2",
    });

    await page.waitForSelector(".multiplier", { visible: true });

    let history = loadHistory();
    let lastValue = null;

    setInterval(async () => {
        try {
            const value = await page.evaluate(() => {
                const el = document.querySelector(".multiplier");
                if (!el) return null;
                return parseFloat(el.innerText.replace("x", "").trim());
            });

            if (value && value !== lastValue) {
                lastValue = value;
                history.push(value);
                saveHistory(history);

                // Analyze here (you can add analysis code)

                // Send signal to Telegram
                sendTelegramMessage(`Multiplier: ${value}`);
                console.log("Sent multiplier:", value);
            }
        } catch (err) {
            console.error("Error:", err);
        }
    }, 5000);
})();
