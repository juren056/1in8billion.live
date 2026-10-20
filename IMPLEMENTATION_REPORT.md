# 上线执行与验收记录 — 2026-10-20

## 项目和范围

- 产品：独立免费人生模拟器；无账号、支付或云数据库。主域：https://1in8billion.live/。
- 仓库：juren056/1in8billion.live；初始 main/86de90a，接手时工作区干净。当前 codex/initial-launch-seo-geo。
- 现有平台：Cloudflare Worker 1in8billion-live，GitHub main 已连接；未另建 Pages。
- Root /；部署 npx wrangler deploy；wrangler build 先执行 npm run verify；产物 dist。
- 授权：本轮编辑、测试、目标仓库推送、部署、GSC/GA4。未涉及付费、账号、推广。

## 页面与任务

四语首页、how-it-works、birth-odds、countries 共16页；英文 About、Sources、Privacy、Terms、Contact 共5页。逐URL清单及metadata见 PAGE_COVERAGE.md。
国家事实页暂缓：原数据缺逐条年份和原始来源，两次官方API请求失败。依任务书质量例外，不凑8页、不编数据。

## 14 步进度与证据

|步骤|状态|证据|
|---|---|---|
|1 身份、域名、仓库|完成|目标远端与Worker绑定核对；保留上游remote但不推送|
|2 页面与优先级|完成|21个真实静态URL；P1重放和比较页暂缓|
|3 来源与竞品|部分完成|读取两份附件；数据来源缺口公开；MIT保留；未搬原站素材|
|4 页面与工具|本地通过|国家搜索、实际权重计算器、引擎完整生涯|
|5 UI与图标|本地完成|用户点阵地球图、多尺寸PNG/ICO、Apple touch、原创SVG简化标识、1200×630 OG；原创出生卡及结局时间线图|
|6 SEO/GA4|SEO本地通过；GA4待接通|canonical、hreflang、robots、sitemap、JSON-LD、可配置ID、opt-in|
|7 本地测试|通过|见下方真实测试结果|
|8 Cloudflare/域名|待最终部署验证|已有Worker与HTTPS主域200；直连失败，显式本机代理可访问|
|9 Git自动发布|待最终验证|已有Git连接；面板提示读取GitHub组织信息错误，待推送验证|
|10 GSC/统计|阻碍|GSC ERR_CONNECTION_CLOSED；GA4当前其他站资源，不误用；未提交收录|
|11 媒体|完成|使用用户提供素材衍生；重写证书输出，不引用竞品媒体|
|12 批量生图|不适用|本轮图标来自用户附件，无批量配图需求|
|13 最终上线|待验收|后续部署结果追加到本报告|
|14 推广|不适用|用户未要求推广|

## 本地验收

- npm run verify 通过：21页唯一title、1个H1、self-canonical、实际存在hreflang和内链；172国唯一ID、正且有限权重；两模式概率和为1。
- 实际chooseCountry函数：遍历172国在出生/人口两种模式中的区间中点，边界及空数据检查通过。
- Chrome headless完整自然生涯：出生→确认→自动→自然结局→PNG下载成功；暂停期间年龄不变；九种界面语言切换正常。
- 360/375/390/768/1440px无横向溢出；概率工具日本结果0.5684%、约1/176（模型份额）；未知路径HTTP404；控制台0异常。
- 修复自动模式仍弹财务对话框导致卡住、出生确认重新生成不同角色、复制链接未写入也报成功、旧HTML缓存问题。
- 新增version=1本地当前生涯保存及继续；沿用旧存储键；没有专属seed重放声明。
- 未运行Lighthouse，不宣称性能分数或CWV达标。完整日韩动态游戏内容仍有继承的中文回退；四语静态SEO正文独立本地化。

## 来源、版权与数据

见 ATTRIBUTIONS.md、DATA_SOURCES.md、SOURCE_AUDIT.md。保留MIT版权；原README的移植说法与代码头独立重写说法有差异，不能据此认证原站版权授权。未发现/引入原站图像文件。高相似出生证书及PNG布局已自主重写，来源未核实的数据不生成权威国家事实页。

## 搜索和统计

GSC未验证所有权、sitemap未提交、收录未确认。GA4无本站真实measurement ID，标签未启用，后台接收未确认。代码支持GA4_MEASUREMENT_ID/GSC_VERIFICATION构建变量。Google浏览器网络恢复后需继续后台接入，而非拿别站ID代替。

## 发布与回滚

旧活动版本 a4486ec1-7f66-449a-8eeb-458518d5176c（CLI读取）。旧版本为实际回滚候选，但未执行回滚演练。未修改DNS；www跳转仍待验证。最终生产信息以追加验收记录为准。

## 剩余项

GSC/GA4网络恢复后完成后台验证、sitemap提交与Realtime接收；审核正式统计来源后发布国家事实页；P1比较页和真正可复现分享；性能测量及少数动态内容本地化。
