// const request = require('request');
const express = require('express');
const app = express();
const rp = require('request-promise');
const fs = require('fs');
const moment = require('moment');
const util = require('util');
// const cache = require('./cache.json');
const config = require('./config.json');
const dailyNoteUrl = `https://api-takumi.mihoyo.com/game_record/app/genshin/api/dailyNote?role_id=%s&server=%s`;

var cache;
require('./lib/global').init();

const init = async function() {

	if(!fs.existsSync('./cache.json')) {
		await fs.writeFileSync('./cache.json',"{}");
	}
	cache = require('./cache.json');

	if (cache['region'] == undefined || cache['game_uid'] == undefined) {
		console.log("玩家数据不存在，正在尝试获取...");
		await refPlayer();
	}
	app.get('/resin', function (req, res) {
		console.log('[%s][Get] /resin ',moment().utcOffset('+08:00').format());
		if (cache['last_update'] == undefined || Math.floor(Date.now() / 1000) - cache['last_update'] > config.cache_time) {
			console.log('Updating Data ...');
			var apiService = util.format(dailyNoteUrl,cache['game_uid'],cache['region']);
			rp({
				headers: getHeader(apiService),
				resolveWithFullResponse: true,
				method: 'GET',
				uri: apiService,
			}).then(function (response) {
				if (response.statusCode != 200) {
					console.log('failed.')
					res.status(404);
				} else {
					let feedback = JSON.parse(response.body).data;
					cache['current_resin'] = feedback['current_resin'];
					cache['max_resin'] = feedback['max_resin'];
					cache['resin_recovery_time'] = feedback['resin_recovery_time'];
					cache['finished_task_num'] = feedback['finished_task_num'];
					cache['total_task_num'] = feedback['total_task_num'];
					cache['is_extra_task_reward_received'] = feedback['is_extra_task_reward_received'],
					cache['max_expedition_num'] = feedback['max_expedition_num'];
					var finished_expedition_num = 0;
					feedback.expeditions.forEach(element => {
						if (element.status == 'Finished') {
							finished_expedition_num = finished_expedition_num + 1;
						}
					});
					cache['finished_expedition_num'] = finished_expedition_num;
					cache['last_update'] = Math.floor(Date.now() / 1000);
					cache['last_update_format'] = moment().utcOffset('+08:00').format();
					
					var cacheStr = JSON.stringify(cache);
					fs.writeFile('./cache.json', cacheStr, function (err) {
						if (err) {
							console.log(err);
						} else {
							console.log('Resin cache update -',Math.floor(Date.now() / 1000));
							genResult(res);
						}
					});
			
				}
			}).catch(function (error) {
				console.log(error);
				res.status(404);
			});
		} else {
			console.log('Sending Data from cache...');
			genResult(res);
		}
	});

	app.listen(config.port, '0.0.0.0', function () {
		console.log('Application is listening on port ' + config.port + '!')
	});
}
init();

function genResult(res) {
	var result = {};
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
}

const refPlayer = async function() {
	await rp({
		headers: getHeaderOld(),
		resolveWithFullResponse: true,
		method: 'GET',
		uri:"https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByStoken"
	}).then(function(response){
		// console.log(response.body);
		var pList = JSON.parse(response.body);
		pList.data.list.forEach(playerData => {
			// console.log('GetDeafultRegion [%s] %s',playerData.game_biz,playerData);
			var cache = {};
			if (playerData.game_biz == config.game_biz && playerData.is_chosen) {
				cache['last_update'] = 0;
				cache['region'] = playerData.region;
				cache['game_uid'] = playerData.game_uid;
				fs.writeFileSync('./cache.json',JSON.stringify(cache));
				console.log('Refresh player info [%s - %s]',cache['region'],cache['game_uid']);	
			}
		  });
	});
}