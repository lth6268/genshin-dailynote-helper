const utils = require('./utils');
const md5 = require('md5');
const config = require('./../config.json')

const init = () => {

  global.getHeader = (URL) => {
    let randomStr = utils.randomString(6);
    let timestamp = Math.floor(Date.now() / 1000);
    let queryStr = '';
    if (URL.split('?').length > 1) {
      queryStr = URL.split('?')[1];
    }
    // iOS sign
    let sign = md5(`salt=xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs&t=${timestamp}&r=${randomStr}&b=&q=${queryStr}`);

    return {
      'Host': 'api-takumi.mihoyo.com',
      'Connection': 'keep-alive',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://webstatic.mihoyo.com',
      'x-rpc-app_version': '2.12.1',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; MI 6 Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.158 Mobile Safari/537.36 miHoYoBBS/2.12.1',
      'x-rpc-client_type': 5,
      'Referer': 'https://webstatic.mihoyo.com/app/community-game-records/index.html?v=6',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-CN,en-US;q=0.9',
      'X-Requested-With': 'com.mihoyo.hyperion',
      'Cookie': config.cookie,
      'Content-Type': 'application/json',
      'DS': `${timestamp},${randomStr},${sign}`
    }
  }
}

module.exports = {
  init
}