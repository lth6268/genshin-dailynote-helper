const _ = require("lodash");
//const configJson = require('./../config.json');
const config = {};
let configJson = {};

const init = async () =>{
    console.log('开始初始化配置...');
    try {
	configJson = require('./../config.json');
    } catch {}
    config['cache_file'] = get('cache_file','/tmp/cache.json');
    config['cache_time'] = get('cache_time',300);
    config['cookie'] = getCookie();
    config['port'] = get('port',9000);
    config['is_SCF'] = getSCF();
    config['ip'] = get('ip','0.0.0.0');
    config['game_biz'] = get('game_biz','hk4e_cn');
    config['bh3_sign'] = get('bh3_sign',false);
    console.log('配置初始化完成');
}

const get = (key,default_value) => {
    if (configJson[key] !== undefined) {
        return configJson[key];
    } else {
        return default_value;
    }
}
const getSCF = () => {
    if (!_.isEmpty(process.env.SCF)) {
        return process.env.SCF;
    } 
    if (configJson['is_SCF'] !== undefined) {
        return configJson['is_SCF'];
    }
    return false;
}

const getCookie = () => {
    let result = undefined;
    if (!_.isUndefined(get('cookie',undefined))) {
        result = get('cookie','');
    }
    if (!_.isEmpty(process.env.COOKIE)) {
        result = process.env.COOKIE;
    }
    if (!_.isUndefined(result) && result != 'none') {
        return result;
    } 
    console.warn('cookie未设置！请检查环境变量或配置文件！');
    process.exit(-10002);
}

module.exports = {
    init,
    config
}
