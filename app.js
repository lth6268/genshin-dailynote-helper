const express = require('express');
const app = express();
const fs = require('fs');
const utils = require('./lib/utils.js');
const logger = require('./lib/logger.js');
const refPlayer = require('./lib/mihoyo/refPlayer.js');
const getDailyNote = require('./lib/mihoyo/getDailyNote.js');

const config = require('./config.json');

var cache;
require('./lib/global').init();

const init = async function() {

	if(!fs.existsSync('./cache.json')) {
		fs.writeFileSync('./cache.json',"{}");
	}
	cache = require('./cache.json');

	if (cache['region'] == undefined || cache['game_uid'] == undefined) {
		logger.i("缓存中未包含玩家信息，正在尝试获取...");
		await refPlayer();
	}
	reloadCache();
	while (cache['game_uid'] == undefined) {
		logger.i('读取缓存失败，等待缓存写出到文件...');
		await utils.randomSleepAsync();
		reloadCache();
	}
	app.get('/resin',async function (req, res) {
		logger.i('[Get] /resin');
		if (cache['last_update'] == undefined || Math.floor(Date.now() / 1000) - cache['last_update'] > config.cache_time) {
			logger.i('本地缓存未找到或已过期，从远程更新数据中...');
			await getDailyNote(cache['region'],cache['game_uid']);
		} else {
			logger.i('从本地缓存发送数据...');
		}
		genResult(res);
	});

	app.get('/resin/all',async function(req,res) {
		logger.i('[Get] /resin/all');
		if (cache['last_update'] == undefined || Math.floor(Date.now() / 1000) - cache['last_update'] > config.cache_time) {
			logger.i('本地缓存未找到或已过期，从远程更新数据中...');
			await getDailyNote(cache['region'],cache['game_uid']);
		} else {
			logger.i('从本地缓存发送数据...');
		}
		res.status(200);
		reloadCache();
		res.send(cache);
		logger.i('数据已发送');
	});


	app.listen(config.port, '0.0.0.0', function () {
		logger.i('初始化完成！开始在端口 ' + config.port + ' 监听请求！')
	});
}

function reloadCache() {
	// logger.i("重新载入缓存...");
	delete require.cache[require.resolve('./cache.json')];
	cache = require('./cache.json');
}

function genResult(res) {
	var result = {};
	reloadCache();
	result['resin'] = cache['current_resin'] + ' / ' + cache['max_resin'];
	if (parseInt(cache['resin_recovery_time']) > 0) {
		var recHour = parseInt(cache['resin_recovery_time'] / 60 / 60);
		var recMin = parseInt((cache['resin_recovery_time'] - recHour * 60 * 60) / 60);
		var recSec = cache['resin_recovery_time'] - recHour *60 * 60 - recMin * 60;
		result['resin'] = result['resin'] + ' (' +recHour+'h '+recMin+"m "+recSec+"s)";
	}
	result['task'] = cache['finished_task_num'] + ' / ' + cache['total_task_num'];
	if (cache['finished_task_num'] == cache['total_task_num'] && cache['is_extra_task_reward_received']) {
		result['task'] = '已全部完成';
	}
	result['expedition'] = cache['finished_expedition_num'] + ' / ' + cache['max_expedition_num'];
	result['last_update'] = cache['last_update_format'];
	res.status(200);
	res.send(JSON.stringify(result));
	logger.i('数据已发送');
}

init();
