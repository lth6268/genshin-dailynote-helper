'use strict';
const express = require('express');
const app = express();
const fs = require('fs');
const utils = require('./lib/utils.js');
const logger = require('./lib/logger.js');
const refPlayer = require('./lib/mihoyo/refPlayer.js');
const getDailyNote = require('./lib/mihoyo/getDailyNote.js');

// const config = require('./config.json');

var cache;

const init = async (event,context) => {

	await logger.init();

	require('./lib/global').init();

	cache = {};

	if (cache['region'] == undefined || cache['game_uid'] == undefined) {
		logger.i("缓存中未包含玩家信息，正在尝试获取...");
		cache = await refPlayer();
		
	}
	// reloadCache();
	// while (cache['game_uid'] == undefined) {
	// 	logger.i('读取缓存失败，等待缓存写出到文件...');
	// 	await utils.randomSleepAsync();
	// 	reloadCache();
	// }
	// app.get('/resin',async function (req, res) {
	logger.i('[Get] /resin');
	if (cache['last_update'] == undefined || Math.floor(Date.now() / 1000) - cache['last_update'] > config.cache_time) {
		logger.i('本地缓存未找到或已过期，从远程更新数据中...');
		cache = await getDailyNote(cache['region'],cache['game_uid'],true);
	} else {
		logger.i('从本地缓存发送数据...');
	}
	return genFormatedResponse();
	// });

}

function genFormatedResponse() {
	var result = {};
	// reloadCache();
	result['resin'] = cache['current_resin'] + ' / ' + cache['max_resin'];
	if (parseInt(cache['resin_recovery_time']) > 0) {
		var recHour = parseInt(cache['resin_recovery_time'] / 60 / 60);
		var recMin = parseInt((cache['resin_recovery_time'] - recHour * 60 * 60) / 60);
		var recSec = cache['resin_recovery_time'] - recHour *60 * 60 - recMin * 60;
		result['resin'] = result['resin'] + ' (' +recHour+'h '+recMin+"m "+recSec+"s)";
	}
	result['task'] = cache['finished_task_num'] + ' / ' + cache['total_task_num'];
	if (cache['finished_task_num'] == cache['total_task_num'] ){
		if (cache['is_extra_task_reward_received']) {
			result['task'] = result['task'] + '  (额外奖励已领取)';
		} else {
			result['task'] = result['task'] + '  (额外奖励未领取)';
		}
	}
	result['expedition'] = cache['finished_expedition_num'] + ' / ' + cache['current_expedition_num'] +  ' / ' + cache['max_expedition_num'];
	var max_expedition_time = 0;
	if (cache['finished_expedition_num'] != cache['current_expedition_num']) {	
		cache.expeditions.forEach(element => {
			if (element.status != 'Finished') {
				var remained_time = parseInt(element.remained_time);
				if (remained_time > max_expedition_time) {
					max_expedition_time = remained_time;
				}
			}
		});
		var expHour = parseInt(max_expedition_time / 60 / 60);
		max_expedition_time = max_expedition_time - expHour * 60 * 60;
		var expMin = parseInt(max_expedition_time / 60);
		max_expedition_time = max_expedition_time - expMin * 60;
		result['expedition'] = result['expedition'] + ' (' + expHour + 'h ' + expMin + 'm ' + max_expedition_time + 's)'; 
	}
	result['last_update'] = cache['last_update_format'];
	logger.i('数据已生成');
	return JSON.stringify(result);
}

// init();