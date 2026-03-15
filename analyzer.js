function analyze(history){

    if(history.length < 10){
        return "Collecting more data..."
    }

    let high = 0
    let low = 0

    history.forEach(v => {

        if(v > 2){
            high++
        }else{
            low++
        }

    })

    if(high > low){
        return "High multiplier trend"
    }else{
        return "Low multiplier trend"
    }

}

module.exports = { analyze }
