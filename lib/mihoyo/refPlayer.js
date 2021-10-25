const superagent = require('superagent');
const logger = require('./../logger.js');
const fs = require('fs');
const util = require('util');
const async = require('async');
const config = require('./../../config.json');

const URL = "https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByStoken";

module.exports = async () => {

  let res = await superagent.get(URL).set(getHeaderOld());
  if (res.body.retcode != 0 ) {
    logger.w('获取玩家数据失败！');
    return false;
  }
  await async.eachSeries(res.body.data.list, async (playerData) => {
    var cache = {};
    if (playerData.game_biz == config.game_biz && playerData.is_chosen) {
      cache['last_update'] = 0;
      cache['region'] = playerData.region;
      cache['game_uid'] = playerData.game_uid;
      fs.writeFileSync('/tmp/cache.json',JSON.stringify(cache));
      logger.i(util.format('玩家数据已更新 region:%s uid:%s',cache['region'],cache['game_uid']));	
    }
  });
  return true;
}
    