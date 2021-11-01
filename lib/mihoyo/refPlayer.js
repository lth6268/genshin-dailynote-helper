const superagent = require('superagent');
const logger = require('./../logger.js');
const fs = require('fs');
const util = require('util');
const async = require('async');
const config = require('./../config.js').config;

const URL = "https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByStoken";

module.exports = async () => {

  logger.i('请求玩家数据中...')
  let res = await superagent.get(URL).set(getHeaderOld());
  if (res.body.retcode != 0 ) {
    logger.w('获取玩家数据失败！');
    logger.w(res.body);
    return false;
  }
  var cache = {};
  cache['last_update'] = 0;
  cache['userData'] = {};
  await async.eachSeries(res.body.data.list, async (playerData) => {

    if (playerData.is_chosen) {
      cache['userData'][playerData.game_biz ] = playerData;
      logger.i(util.format('玩家数据已更新 game_biz: %s', playerData.game_biz));	
    }
    
  });
  
  fs.writeFileSync(config['cache_file'],JSON.stringify(cache));
  return true;
}