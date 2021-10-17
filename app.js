const request = require('request');
const express = require('express');
const app = express();
const rp = require('request-promise');
const fs = require('fs');
const moment = require('moment');
const cache = require('./cache.json');
const port = 12583;
const config = require('./config.json')
const uid = config['uid']
const apiService = `https://api-takumi.mihoyo.com/game_record/app/genshin/api/dailyNote?role_id=${uid}&server=cn_gf01`;

require('./lib/global').init();

app.get('/resin', function (req, res) {
	console.log('[%s][Get] /resin ',moment().utcOffset('+08:00').format());
	if (Math.floor(Date.now() / 1000) - cache['last_update'] > 300) {
		console.log('Updating Data ...');
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

app.listen(port, '0.0.0.0', function () {
	console.log('Application is listening on port ' + port + '!')
})

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