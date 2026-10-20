# v1.10.0 三批执行与发布记录

日期：2026-10-21。上线前基线：8334d285557cfa250a3b154949ac348120eabe5b（v1.9.0）。本轮用户明确授权三批完成、测试后自动部署。

## 三批交付

| 批次 | 实现 | 验证 |
| --- | --- | --- |
| 一：播放与选择 | 新人生默认阅读5秒/年；可选观看1秒/年、逐年推进；暂停、自动选择、播放节奏独立；18/25/35/50岁手动财务选择明确等待；快进逐年执行完整引擎；保存暂停/节奏/选择状态，旧存档安全恢复 | 真实5.5秒仅前进一年、真实20秒不越过待选年龄；正常/快进完整人生JSON一致；一次选择仅生效一次；两模式展示/完成事件各一次；旧存档、损坏记录、写入失败与非法配置恢复 |
| 二：手机与结局 | 当前事件、必选项先于场景与完整身份；选项直接说明影响；音乐留在独立入口；阅读实际暂停；弹窗关闭恢复先前暂停和焦点；结局区分重要时刻与数据，自由再玩/PNG仍优先 | 四语言×390/1440的暂停/等待截图；键盘、Esc、焦点、取消；四语实际结局与免费PNG；重现接收者入口与本地记录 |
| 三：说明、统计与性能 | 四语帮助/指南按实际流程更新，替换9张实际界面截图；期望寿命标明国家模型参考值；阅读/等待/恢复事件仅发送粗粒度参数；海报与PDF共用一次延迟字体下载；失败显示真实重试入口与加载反馈 | 23项Node测试、SEO/数据/资产预算；12组完整历史结果摘要不变；字体首次失败→重试成功→实际PDF与3张海报，无首屏字体请求；统计无名字/种子/笔记 |

## 必须保留的内容

- 过去／现在／未来出生年仍为1990／2024／2080；取消“全部改2026”的旧要求。
- 国家统计与观察年不改。countries.json按Git的LF换行校验SHA256：3d1efffd059811e3315e54e311e9bfbb86a24ebd1e81761b21fc2f0df18cb072；Windows原始CRLF字节哈希为dfa553558debc42292981170d1e8f97e07c48e9e0c70d17308689a7b83beaa37。正式站已存在的JSON压缩产物哈希为ae41bd754f991448e898fabac762fdcfdef51affb8535cf30aea57339512ac3f，发布验收据此比较；172国；12个既有Replay v1结果摘要全通过。
- 66个canonical页面、已有URL、蓝色品牌、温暖原创像素场景、免费PNG/分享/本地记录和GA4默认收集保留。
- 保留全量中日韩字体（不做曾造成缺字的subset）；共享请求减少重复下载，没有宣称缩小原字体文件。
- 真实收款保持关闭。未配置Stripe测试环境；回调验证为本地模拟，不能当成Stripe沙盒或真实支付成功。
- 保留本轮开始前已修改的历史报告、README、audit等文件，不混入本轮提交。

## 验证证据

本地命令：npm run verify；tests/playback-{browser,failure-browser,events-browser,loading-browser}.cjs；release-browser（PROOF_ONLY=1）；keepsake、return、replay-entry、premium-local、premium-callback、premium-failure、ux-flow、ux-funnel、p1、batch23、growth（PROOF_ONLY=1）、utm、experience、retention-edge浏览器回归。

证据位于audit/playback-release/：browser.json、failures.json、events.json、loading.json、final-tests.log、focused-tests.log、content-tests.log。旧测试随意图调整：新的主按钮文案；阅读暂停后的显式恢复；Chrome闭合details内按钮用checkVisibility判定；PROOF_ONLY避免测试覆盖已审阅的指南资产。没有删除业务断言来获得通过。

独立设计复核：finish-review.md disposition为ship，仅覆盖16张指定暂停/等待截图与9张指南图；PLAYBACK_DESIGN_FINISH.md记录普通扩展与既有系统的一致性。一次静态detector结果保留为detector.json，其中既有样式问题未冒充本轮全部修复。40张发布位图的来源元数据扫描无缺失。

## 发布与验收

沿用GitHub main→Cloudflare自动构建，只推送一次最终版本，不另手动上传同一产物。发布后运行tests/playback-production.cjs，核对主域名release.json为实际提交、66URL/404、数据字节哈希、preview-only API、真实5秒节奏、四语等待/单次选择、计时器自然完成68岁样例、免费PNG与本地记录。结果分别写入production-http.json、production.json；只有实际生成成功记录才视为线上验收通过。

首次a0f3d42构建未发布：新增测试错误地比较Windows CRLF原始哈希，Linux Git checkout使用LF，导致CI与Cloudflare构建失败；日志first-ci-failure.log有实际/期望哈希证据。修正测试为仅统一换行后比较Git原始文本，不修改数据文件。生产产物另按既有压缩JSON字节哈希核对。随后通过同一Git链发布修正提交，旧版本在失败期间继续服务。

回滚代码目标为已存在的基线8334d285557cfa250a3b154949ac348120eabe5b；本轮没有数据库迁移、扣款或DNS变更。

范围限制：本轮Chrome实测，不声称真实iOS/Safari均验证；既有日/韩文事件正文仍可能混入中文，新增操作说明已四语化。本轮未读取GA4后台实时接收或重新申请GSC收录；QA屏蔽Google统计网络，不把测试流量当增长。真实上线接收与搜索索引仍须分别以Google后台证据判断。
