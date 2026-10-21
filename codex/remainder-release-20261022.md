# 遗漏补齐 · v1.17.2 上线回执

产品与验收提交：`908abf9f48cd55d97ed5ae4ed3a8256a48e5866b`，已非强制推送 origin/main。CI [39665871706](https://github.com/juren056/1in8billion.live/actions/runs/39665871706) completed/success。

## 本轮已补齐

- 比较页从初始HTML起禁用未就绪控件；原表、来源和原始进入游戏链接仍可读可用。15秒超时或请求失败后，选择器前直接提供九语说明和原地重试。恢复后启用选择、交换、分享和CSV；保留query，避免同一事件重复绑定。
- 本机存档封面直接显示实际已记录的出生/结束年月；缺失时说明未记录。读取既有精确身份日期适配器，不改存档或补造月份。
- 更正总计划中把历史C04执行状态误作当前待办的措辞，区分主版本发布、补丁范围与外部效果观察。

## 本地与独立验收

72项单元测试、226页SEO与资源、172国输入通过；原模拟源码除版本字串外不变。九语失败/重试/真实CSV/交换与原生文案通过；四主题180组尺寸/根字号检查、45个比较页初始禁用、真实15秒超时/500/错误JSON/第4次恢复通过；九语实际v2存档封面和详情日期、缺日期边界及存储保持通过。慢网CPU4x本地检查LCP最大764ms、CLS最大0.0234，不作为现场CWV。

独立评审以无浏览器的degraded finish-reviewer角色查看49张实际浏览器截图和源码，disposition: ship，仅覆盖本轮两项本地交付。独立documenter确认普通扩展复用现有系统，未改全局规范。机械检测格式参数未按预期生效，仅有空输出和额外路径警告，已披露在detector-note.md，未冒充完整机器报告或再次扫描。

## 正式站验收

Git触发的Cloudflare自动发布已完成，没有人工补发。主域名 `/release.json` 返回精确提交 `908abf9f48cd55d97ed5ae4ed3a8256a48e5866b`、版本v1.17.2。活动版本 `ac88df0f-5c7d-4598-bdd5-20062c570364`，部署 `7d40b76d-64db-45af-a6cf-18cc48b37e6c`，100%。

正式验收全部通过：226公开路由、226条sitemap、404/noindex与研究页隔离、关键图标/素材字节一致、九语四主题两尺寸72组合、比较选择保留，脚本错误0。九语请求失败→原地重试→交换/CSV实际下载及慢请求禁用也在正式域名通过。九语实际v2存档封面和详情年月、缺日期边界、存储不改写与批量比较通过。health仍为preview=true、checkout=true、testOnly=true。

对应证据：`production-report.json`、`production-recovery/recovery-report.json`、`production-tools/records-report.json`及`production-deployments.json`。以上为本轮实际修复范围的完成，不意味着所有未知问题、未来Google收录或增长效果都已解决。

## 保持不变与外部事项

四主题、蓝色默认、九语、默认展开、圆形图标、模拟与统计输入、年月/旧回放语义、本机存储和个人文字均保留。Stripe/D1/Secret/分析配置未改动；真实收款保持关闭。本轮不重复新建支付交易，旧沙盒订单交付证据见此前上线回执。

GSC抓取/全页收录及改版后真实GA4效果仍需外部观察；本轮技术SEO验收不等于已被Google全部收录。原GSC人工索引受reCAPTCHA连接影响的事项没有在本轮伪报完成。

证据目录：`audit/remainder-20261022/`；本轮实现明细：`codex/remainder-acceptance-20261022.md`。回滚参考为上一稳定Git提交 `fbfe2f9ee7da4163833b9f5db1672880bfda1d40` 和Cloudflare版本 `f53ee26d-12f0-4bb0-a3cd-f46ffa84f0ba`，不更换数据库或强制推送。
