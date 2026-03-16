const puppeteer = require("puppeteer")
const fs = require("fs")

const { analyze } = require("./analyzer")
const { suggestCashout } = require("./strategy")

const HISTORY_FILE = "history.json"

function loadHistory(){
    try{
        const data = fs.readFileSync(HISTORY_FILE)
        return JSON.parse(data)
    }catch{
        return []
    }
}

function saveHistory(history){
    fs.writeFileSync(
        HISTORY_FILE,
        JSON.stringify(history,null,2)
    )
}

(async()=>{

    console.log("Bot started...") // Debug log added

    const browser = await puppeteer.launch({
        headless: "new",  // Launch in headless mode, works on GitHub Actions
        defaultViewport: null,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        timeout: 300000 // Updated browser launch timeout to 5 minutes (300,000 ms)
    })

    console.log("Puppeteer browser launched") // Debug log added

    const page = await browser.newPage()

    console.log("Opening SportyBet...")

    await page.goto("https://www.sportybet.com",{
        waitUntil:"networkidle2",
        timeout: 300000 // Updated page navigation timeout to 5 minutes (300,000 ms)
    })

    console.log("Login and open Aviator game")

    let history = loadHistory()

    let lastValue = null

    setInterval(async()=>{

        try{
            const value = await page.evaluate(()=>{

                const el = document.querySelector(".multiplier")

                if(!el) return null

                // Fix: parse float and remove 'x' from multiplier string
                return parseFloat(el.innerText.replace("x",""))
            })

            // Debug log: show fetched value
            console.log("Fetched multiplier:", value)

            if(value && value !== lastValue){
                lastValue = value
                history.push(value)
                saveHistory(history)

                // Debug logs for analysis and suggestion
                const analysis = analyze(history)
                console.log("Analysis result:", analysis)

                const safeCashout = suggestCashout(analysis)
                console.log("Suggested cashout:", safeCashout)
            }

        }catch(err){
            console.error("Error in interval loop:", err)
        }

    }, 5000) // Check every 5 seconds

})()
