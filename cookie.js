const superagent = require('superagent');
const util = require('util');
const _ = require('lodash');
const cookie = require('cookie');

const URL_LOGIN_TICKET = "https://webapi.account.mihoyo.com/Api/cookie_accountinfo_by_loginticket?login_ticket=%s";
const URL_QUERY_SIGN_IN_STATUS = "https://api-takumi.mihoyo.com/apihub/api/querySignInStatus?gids=1";
const URL_GET_MULTI_TOKEN = "https://api-takumi.mihoyo.com/auth/api/getMultiTokenByLoginTicket?login_ticket=%s&token_types=3&uid=%s";

const arguments = process.argv.splice(2);
console.log("Arguments: %s", arguments);

const init = async (loginTicket) => {
  if (loginTicket == undefined) {
    console.log('未找到LoginTicket!');
    return;
  }
  console.log("LoginTicket: ", loginTicket);
  

  // Step1
  let res = await superagent.get(util.format(URL_LOGIN_TICKET, loginTicket)).timeout(10000);
  // console.log(res.text);
  let resData = JSON.parse(res.text);
  let cookieInfo = {};
  if (resData.data.msg === "成功") {
    cookieInfo = resData.data["cookie_info"];
    console.log("Login success, cookie_token: %s", cookieInfo["cookie_token"]);
  } else {
    console.error("Login failed, %s", resData.data.msg);
    return;
  }

  // Step2
  res = await superagent
    .get(URL_QUERY_SIGN_IN_STATUS)
    .set("Cookie", `account_id=${cookieInfo["account_id"]}; cookie_token=${cookieInfo["cookie_token"]}`)
    .timeout(10000);
  resData = JSON.parse(res.text);

  // Append ltoken and luid
  let uid = parseCookie(res.header['set-cookie']).ltuid;

  // Step3
  res = await superagent
    .get(util.format(URL_GET_MULTI_TOKEN, loginTicket, cookieInfo["account_id"]))
    .timeout(10000);
  resData = JSON.parse(res.text);

  // Append token
  let cookieData = {
    'stuid': uid,
    'stoken': resData.data.list[0].token,
    'ltuid': uid,
    'ltoken': resData.data.list[1].token,
    'account_id': uid,
    'login_ticket': loginTicket,
    'cookie_token': cookieInfo["cookie_token"]
  };

  console.log(`cookie:'${stringifyCookie(cookieData)}'`);
  config = require('./config.json');
  config['cookie'] = stringifyCookie(cookieData);
  fs = require('fs');
  fs.writeFile('./config.json',JSON.stringify(config),(err) => {
    if (err) {
      console.log('写入失败，请手动编辑config文件');
    } else {
      console.log('已自动写入config.json');
    }
  });
};

init(arguments[0]);

const parseCookie = (cookies) => {
  let cookieObj = {};
  _.each(cookies, (cookieStr) => {
    cookieStr = _.split(cookieStr, ";")[0];
    Object.assign(cookieObj, cookie.parse(cookieStr));
  });

  return cookieObj;
}

const stringifyCookie = (obj) => {
  let cookieStr = "";
  _.each(obj, (value, key) => {
    cookieStr += key + "=" + value + ";";
  })
  return cookieStr;
}


