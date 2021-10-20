const moment = require('moment');

const i = (msg) => {
    console.log('[%s][INFO] %s',moment().utcOffset('+08:00').format(),msg);
}

const w = (msg) => {
    console.log('[%s][WARN] %s',moment().utcOffset('+08:00').format(),msg);
}

module.exports = {
    i,
    w
}