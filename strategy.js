function suggestCashout(history){

    if(history.length < 10){
        return 1.5
    }

    const sum = history.reduce((a,b)=>a+b,0)

    const avg = sum / history.length

    if(avg < 2){
        return 1.4
    }

    if(avg < 3){
        return 1.7
    }

    return 2.0

}

module.exports = { suggestCashout }
