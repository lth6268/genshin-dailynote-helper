# Genshin DailyNote Helper
基于 KWGT 的 原神个人信息 显示  
此仓库为服务端实现

## Usage 使用说明
- Clone 本仓库到本地
- 复制 `config.json.example` 为 `config.json`
- 修改 `config.json` 的内容
- 运行主程序
```bash
yarn
node app.js
```
- 编写 `KWGT` 小部件 

```
KWGT 参考代码（文本）
-------------------------------------------
原粹树脂：$wg(your.url/resin, json, .resin)$ 
每日委托：$wg(your.url/resin, json, .task)$ 
探索派遣：$wg(your.url/resin, json, .expedition)$
最后更新：$wg(your.url/resin, json, .last_update)$
```
## Notice　注意事项
- 请不要将你的cookie分享给任何人(config.json)
- 查询的账号为米游社的默认账号 理论支持所有国内渠道 暂不支持国际服(欢迎pr)
## Thanks 感谢名单
@Azure99 @2314933036 提供了 `DS` 字段的算法和所用的 `salt`　　
部分源码基于 `jianggaocheng/mihoyo-signin` 项目修改而来