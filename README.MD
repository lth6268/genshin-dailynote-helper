# Genshin DailyNote Helper | 原神每日助手
基于 KWGT 的 原神个人信息 显示  
此仓库为服务端实现

## Usage | 使用说明
- Clone 本仓库到本地
- 安装运行库 `Node JS`
- 复制 `config.json.example` 为 `config.json`
- 修改 `config.json` 的内容
- 运行主程序
```bash
yarn | npm install
node app.js
```
- 至此服务端部署完成 

## Notice | 注意事项
- 需要开启米游社－我的－我的角色－实时便笺（jian）功能
- 请不要将你的cookie分享给任何人(config.json)
- 查询的角色为米游社中选择的默认角色 理论支持所有国内渠道 暂不支持国际服(欢迎pr)

## API | 可用接口
- `/resin` 获取格式化每日数据
- `/resin/all` 获取官方接口完整数据
- `/resin/force_refresh` 强制刷新缓存数据 **(只会返回刷新是否成功！)**
## KWGT sample | KWGT 参考代码
![Yife_Playte的小部件](./pic/kwgt_yife.jpg)
[Yife_Playte的小部件](https://github.com/YifePlayte/genshin-dailynote-helper/blob/main/GenshinInfo.kwgt)  
![TextOnly](./pic/kwgt_text.jpg)  
> **注意：仅包含文字部分 背景请自行设置**

纯文本格式:
```
原粹树脂：$wg(your.url/resin, json, .resin)$ 
每日委托：$wg(your.url/resin, json, .task)$ 
探索派遣：$wg(your.url/resin, json, .expedition)$
最后更新：$wg(your.url/resin, json, .last_update)$
```

## Get cookie | 获取 Cookie 
Cookie 获取参考 
- 访问 [https://user.mihoyo.com](https://user.mihoyo.com) 并登录账号 如果已经登陆请退出后重新登录
- 获取 `cookie` 中 `login_ticket` 项
- 确认已经复制好 `config.json`
- 运行 `node cookie.js <login_ticket>`  注意：将 `<login_ticket>` 替换为上一步获取的值
- 接下来程序将自动修改 `config.json` 的值 如果修改失败可以从输出中获取内容并手动修改

## Update Log | 更新日志
[2021.10.20]
- 重构并拆分部分代码 便于后期维护
- 合并完整数据请求接口
- 添加强制刷新接口
- 更改默认格式化文本
- 迁移 request 到 superagent
- 完善文档

[2021.10.19] 
- 增加自适应角色获取
- 修复cache不存在的报错
- 修复首次启动时cache错误的缓存导致的无法正常运行
- 添加其他优秀的KWGT小部件地址
- 添加cookie的获取说明
- 开始记录更新日志
## Thanks | 感谢名单
@Azure99 @2314933036 提供了 `DS` 字段的算法和所用的 `salt`  
部分源码基于 `jianggaocheng/mihoyo-signin` 项目修改而来  
@YifePlayte 积极反馈bug 和 设计了好看的kwgt部件  
给予star支持的你  