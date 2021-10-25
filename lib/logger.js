const moment = require('moment');
const fs = require('fs');
const util = require('util');
const config = require('./../config.json');

const i = (msg) => {
    var logMsg = util.format('[%s][INFO] %s',moment().utcOffset('+08:00').format(),msg);
    console.log(logMsg);
    if (!config.is_SCF) {
        fs.appendFileSync('./logs/latest.log',logMsg);
    }
}

const w = (msg) => {
    var logMsg = util.format('[%s][WARN] %s',moment().utcOffset('+08:00').format(),msg);
    console.log(logMsg);
    if (!config.is_SCF) {
        fs.appendFileSync('./logs/latest.log',logMsg);
    }
}

const init = async function() {
    if (!config.is_SCF) {
        
        if (fs.existsSync('./logs/latest.log')){

            fs.copyFileSync('./logs/latest.log','./logs/'+moment(fs.statSync('./logs/latest.log').birthtime).format()+".log");
            fs.rmSync('./logs/latest.log');
        }
        if (!fs.existsSync('./logs/')) {
            fs.mkdirSync('./logs/');
        }
    }
}

module.exports = {
    i,
    init,
    w
}