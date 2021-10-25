const superagent = require('superagent');
const moment = require('moment');
const logger = require('../logger.js');
const util = require('util');
const fs = require('fs');

const URL = `https://api-takumi.mihoyo.com/game_record/app/genshin/api/dailyNote?role_id=%s&server=%s`;

module.exports = async (region,uid) => {

  let currUrl = util.format(URL,uid,region);
  let res = await superagent.get(currUrl).set(getHeader(currUrl));
  // let feedback = res.body.data;
  if (res.body.retcode != 0 ) {
    logger.w('获取Daily Note失败！');
    return res.body.retcode;
  }
  delete require.cache[require.resolve('/tmp/cache.json')];
  let cache = require('/tmp/cache.json');
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
  fs.writeFileSync('/tmp/cache.json', cacheStr);
  logger.i('本地数据已更新')
  return 0;
}
    