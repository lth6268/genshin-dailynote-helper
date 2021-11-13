const superagent = require('superagent');
const moment = require('moment');
const logger = require('../../logger.js');
const config = require('../../config.js').config;
const util = require('util');
const fs = require('fs');
const async = require('async');
const URL = "https://api-takumi.mihoyo.com/common/eutheniav2/sign";

module.exports = async (act_id,uid,region) => {

  let post = util.format('{"act_id":"%s","region":"%s","uid":"%s"}',act_id,region,uid);
  let res = await superagent.post(URL).set(getHeaderOld()).send(post);

  delete require.cache[require.resolve(config['cache_file'])];
  let cache = require(config['cache_file']);
  cache['bh3_signed'] = true;
  cache['bh3_last_sign'] = moment().format('YYYYMMDD');

  if (res.body.retcode != 0) {
    if (res.body.retcode = -5003) {
      logger.i("今日已签到!");
      var cacheStr = JSON.stringify(cache);
      fs.writeFileSync(config['cache_file'], cacheStr);
      logger.i('本地数据已更新');
      return 1;
    } else {
      logger.w("签到失败!");
      logger.w(res.body.message);
      return -1;
    }
  }


  await async.eachSeries(res.body.data.list, async (sign_reward) => {

    if (sign_reward.day == res.body.data.sign_cnt) {
      cache['bh3_sign_reward'] = sign_reward;
    }
    
  });
  
  var cacheStr = JSON.stringify(cache);
  fs.writeFileSync(config['cache_file'], cacheStr);
  logger.i('本地数据已更新');
  return 0;
}
