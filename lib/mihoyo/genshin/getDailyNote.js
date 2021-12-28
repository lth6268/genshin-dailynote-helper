const superagent = require('superagent');
const moment = require('moment');
const logger = require('../../logger.js');
const config = require('../../config.js').config;
const util = require('util');
const fs = require('fs');

const URL = `https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/dailyNote?role_id=%s&server=%s`;

module.exports = async (region,uid) => {

  let currUrl = util.format(URL,uid,region);
  let res;
  try {
    res = await superagent.get(currUrl).set(getHeader(currUrl));
  } catch (err) {
    console.error(err);
    return -405;
  }
  // let feedback = res.body.data;
  if (res.body.retcode != 0 ) {
    logger.w('获取Daily Note失败！');
    return res.body.retcode;
  }
  delete require.cache[require.resolve(config['cache_file'])];
  let cache = require(config['cache_file']);
  for(let key in res.body.data) {
    cache[key] = res.body.data[key];  
  }
  var finished_expedition_num = 0;
  res.body.data.expeditions.forEach(element => {
    if (element.status == 'Finished') {
      finished_expedition_num = finished_expedition_num + 1;
    }
  });
  cache['finished_expedition_num'] = finished_expedition_num;
  cache['last_update'] = Math.floor(Date.now() / 1000);
  cache['last_update_format'] = moment().utcOffset('+08:00').format();
  
  var cacheStr = JSON.stringify(cache);
  fs.writeFileSync(config['cache_file'], cacheStr);
  logger.i('本地数据已更新');
  return 0;
}
    
