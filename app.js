const _ = require('lodash');
const express = require('express');
const moment = require('moment');
const app = express();
const fs = require('fs');
const utils = require('./lib/utils.js');
const logger = require('./lib/logger.js');
const refPlayer = require('./lib/mihoyo/refPlayer.js');
const getDailyNote = require('./lib/mihoyo/genshin/getDailyNote.js');
const config = require('./lib/config.js').config;
const getDailyReward = require('./lib/mihoyo/bh3/getDailyReward.js');
const { rest } = require('lodash');

var cache;
require('./lib/global').init();

const init = async function() {

	await require('./lib/config.js').init();
	await logger.init();

	if(!fs.existsSync(config['cache_file'])) {
		fs.writeFileSync(config['cache_file'],"{}");
	}
	cache = require(config['cache_file']);

	if (cache['userData'] == undefined || cache['userData'][config['game_biz']] == undefined) {
		logger.i("缓存中未包含玩家信息，正在尝试获取...");
		if (!await refPlayer()) {
			process.exit(-10003);
		}
	}
	reloadCache();
	var genshinData = cache['userData'][config['game_biz']];
	while (genshinData['game_uid'] == undefined) {
		logger.i('读取缓存失败，等待缓存写出到文件...');
		await utils.randomSleepAsync();
		reloadCache();
	}
	app.get('/resin',async function (req, res) {
		logger.i('[Get] /resin');
		if (cache['last_update'] == undefined || Math.floor(Date.now() / 1000) - cache['last_update'] > config.cache_time) {
			logger.i('本地缓存未找到或已过期，从远程更新数据中...');
			let ret = await getDailyNote(genshinData['region'],genshinData['game_uid']);
			if (ret != 0) {
				genErrorResponse(res,"获取数据失败，请检查log输出");
				return;
			}
		} else {
			logger.i('从本地缓存发送数据...');
		}
		genFormatedResponse(res);
	});

	app.get('/resin/all',async function(req,res) {
		logger.i('[Get] /resin/all');
		if (cache['last_update'] == undefined || Math.floor(Date.now() / 1000) - cache['last_update'] > config.cache_time) {
			logger.i('本地缓存未找到或已过期，从远程更新数据中...');
			let ret = await getDailyNote(genshinData['region'],genshinData['game_uid']);
			if (ret != 0) {
				genErrorResponse(res,"获取数据失败，请检查log输出");
				return;
			}
		} else {
			logger.i('从本地缓存发送数据...');
		}
		res.status(200);
		reloadCache();
		res.send(cache);
		logger.i('数据已发送');
	});

	app.get('/resin/force_refresh',async function(req,res) {
		logger.i('[Get] /resin/force_refresh');
		logger.i('开始强制刷新缓存...');
		await getDailyNote(genshinData['region'],genshinData['game_uid']);
		res.status(200);
		reloadCache();
		res.send('{"msg":"OK"}');
		logger.i('强制刷新完成');
	});

	app.get('/bh3/sign',async function(req,res) { 
		logger.i('[Get] /bh3/sign');
		if (!config['bh3_sign']) {
			logger.i("崩坏3签到模块未启用！");
			res.status(200);
			res.send("该模块未启用!");
			return;
		}
		reloadCache();
		if (!cache['bh3_signed'] || cache['bh3_last_sign'] != moment().format('YYYYMMDD')) {
			var bh3Data = cache['userData']['bh3_cn'];
			var retcode = await getDailyReward("ea20211026151532",bh3Data['game_uid'],bh3Data['region']);
			if (retcode == -1) {
				res.status(200);
				res.send('{"msg":"签到失败！请查看日志来获取详细信息！"}')
			}
		} else {
			logger.i('今日已经签到了');
		}
		res.status(200);
		var bh3Reward = cache['bh3_sign_reward'];
		if (bh3Reward == undefined) {
			res.send('{"msg":"今天的签到不是由脚本执行的哦"}');
			return;
		}
		var retmsg = '今日奖励：'+ bh3Reward['name'] + ' x ' + bh3Reward['cnt'];
		res.send('{"msg":"'+retmsg+'"}');
	});


	app.get('/',async function(req,res) {
		logger.i('[Get] /');
		res.status(200);
		reloadCache();
		res.send('{"msg":"请访问正确的API!"}');
	});

	let server = app.listen(config.port, config.ip, function () {
		logger.i('初始化完成！开始在 '+ config.ip + ":" + config.port + ' 监听请求！')
	});
	if (config.is_SCF) {
		server.timeout = 0; // never timeout
		server.keepAliveTimeout = 0; // keepalive, never timeout
		logger.i('云函数模式 服务端超时时间已设置为无限')
	}
}

function reloadCache() {
	// logger.i("重新载入缓存...");
	delete require.cache[require.resolve(config['cache_file'])];
	cache = require(config['cache_file']);
}

function genErrorResponse(res,msg) {
	let result = {};
	result['msg'] = msg;
	result['retcode'] = -404;
	res.status(200);
	res.send(JSON.stringify(result));
}

function genFormatedResponse(res) {
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
	res.status(200);
	res.send(JSON.stringify(result));
	logger.i('数据已发送');
}

init();
