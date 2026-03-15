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

    const browser = await puppeteer.launch({
        headless:false,
        defaultViewport:null
    })

    const page = await browser.newPage()

    console.log("Opening SportyBet...")

    await page.goto("https://www.sportybet.com",{
        waitUntil:"networkidle2"
    })

    console.log("Login and open Aviator game")

    let history = loadHistory()

    let lastValue = null

    setInterval(async()=>{

        try{

            const value = await page.evaluate(()=>{

                const el = document.querySelector(".multiplier")

                if(!el) return null

                return el.innerText

            })

            if(!value) return

            const num = parseFloat(value.replace("x",""))

            if(!num) return

            if(lastValue !== num){

                lastValue = num

                history.push(num)

                if(history.length > 200){
                    history.shift()
                }

                saveHistory(history)

                console.log("Crash:",num)

                const pattern = analyze(history)

                console.log("Pattern:",pattern)

                const cashout = suggestCashout(history)

                console.log("Suggested Cashout:",cashout,"x")

                console.log("----------------")

            }

        }catch(e){

            console.log("Error:",e.message)

        }

    },2000)

})()
