const moment = require('moment');
const fs = require('fs');
const util = require('util');
const config = require('./config.js').config;

const i = (msg) => {
    var logMsg = util.format('[%s][INFO] %s',moment().utcOffset('+08:00').format(),msg);
    console.log(logMsg);
    if (!config.is_SCF) {
        fs.appendFileSync('./logs/latest.log',logMsg+'\n');
    }
}

const w = (msg) => {
    var logMsg = util.format('[%s][WARN] %s',moment().utcOffset('+08:00').format(),msg);
    console.log(logMsg);
    if (!config.is_SCF) {
        fs.appendFileSync('./logs/latest.log',logMsg+'\n');
    }
}

const init = async function() {
    console.log('开始初始化日志系统...');
    if (!config.is_SCF) {
        
        if (fs.existsSync('./logs/latest.log')){
            console.log('正在处理旧的日志文件...');
            fs.renameSync('./logs/latest.log', ('./logs/' + moment(fs.statSync('./logs/latest.log').birthtime).format() + ".log").replace(/:/g, "_"));
            // fs.rmSync('./logs/latest.log');
        }
        if (!fs.existsSync('./logs/')) {
            fs.mkdirSync('./logs/');
        }
    } else {
        i('检测到云函数模式，将不写出日志到文件');
    }
    i('日志系统初始化完成');
}

module.exports = {
    i,
    init,
    w
}