const _ = require('lodash');
const utils = require('./utils');
const md5 = require('md5');
// const config = require('./../config.json')
const logger = require('./logger.js');
const APP_VERSION = "2.2.0";
const DEVICE_ID = utils.randomString(32).toUpperCase();
const DEVICE_NAME = utils.randomString(_.random(1, 10));

var cookie;

const init = () => {
  if (!_.isEmpty(process.env.SCF)) {
    logger.i('检测到云函数模式已启用!');
    if (!_.isEmpty(process.env.COOKIE)) {
      cookie = process.env.COOKIE;
    } else {
      logger.w('云函数环境变量未配置，进程退出...');
    }
  } else {
    cookie = require('./../config.json').cookie;
  }

  global.getHeaderOld = () => {
    let randomStr = utils.randomString(6);
    let timestamp = Math.floor(Date.now() / 1000)
  
    // iOS sign
    let sign = md5(`salt=b253c83ab2609b1b600eddfe974df47b&t=${timestamp}&r=${randomStr}`);

    return {
      'Cookie': cookie,
      'Content-Type': 'application/json',
      'User-Agent': 'Hyperion/67 CFNetwork/1128.0.1 Darwin/19.6.0',
      'Referer': 'https://app.mihoyo.com',
      'x-rpc-channel': 'appstore',
      'x-rpc-device_id': DEVICE_ID,
      'x-rpc-app_version': APP_VERSION,
      'x-rpc-device_model': 'iPhone11,8',
      'x-rpc-device_name': DEVICE_NAME,
      'x-rpc-client_type': '1', // 1 - iOS, 2 - Android, 4 - Web
      'DS': `${timestamp},${randomStr},${sign}`
      // 'DS': `1602569298,k0xfEh,07f4545f5d88eac59cb1257aef74a570`
    }
  }
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
      'Cookie': cookie,
      'Content-Type': 'application/json',
      'DS': `${timestamp},${randomStr},${sign}`
    }
  }
}

module.exports = {
  init
}