# US$2.99 人生纪念礼包执行与发布报告

日期：2026-10-20。分支 codex/keepsake-299。基线为最新 origin/main：6f54de32905f03db5f98d41c0eb8bd7d194be8dc（v1.8.1）。本批 v1.9.0。用户确认暂无 Stripe 测试环境，先完成预览和本地集成测试；提供客服 support@1in8billion.live。两份 USD2.99 最终版文档已按 A 分析、B 执行顺序读取。

## 阶段结果

| 阶段 | 结果 | 范围 |
|---|---|---|
| P0-A | 本地 PASS，生产验收待发布回执 | 四语真实预览、实际PDF和3款海报、免费优先、意向测量、SEO及兼容测试 |
| P0-B | BLOCKED；独立本地模拟 PASS | Worker/D1订单、验签、幂等、权益绑定、交付准备完成；没有真实 Stripe Test Mode 环境及交易 |
| P0-C | BLOCKED | 真实收款关闭，未获单独 Live Mode 批准，缺商户/卖家/退款/税务规则 |

不将本地模拟、兴趣点击、成功页或文件演示称为支付成功。checkout=false、preview=true、fulfillment=true；无真实订单/D1迁移/Stripe配置。

## 交付与来源

新增 /keepsake/、/ja/keepsake/、/ko/keepsake/、/zh-tw/keepsake/，保留原62个canonicalURL，共66页。私密 /keepsake/success/ 和 /keepsake/cancel/ 不入sitemap，noindex,nofollow/no-referrer，清理查询参数，不加载GA4；不能凭URL解锁。客服邮箱显示在商品及联络页面。

premium-keepsake/ 包含completed-only快照白名单、canonical/hash、IndexedDB写入及读回校验、真实PDF/3款海报、四语预览、结局可选入口、本地订单恢复及权益检查。src/worker.js、migrations/0001_keepsake.sql 为关闭状态的支付后端准备。scripts/build-premium.mjs 静态输出四语商品；scripts/analytics.js 细分 keepsake 页面及跨页入口。scripts/build.mjs 清理确定的dist再构建，避免残留旧字体文件。公共源代码不含生产密钥。

没有改172国模型、seed/RNG、Replay格式、旧savekey、免费PNG和免费游戏规则。app.js 仅改版本号。免费结局行动在前，纪念礼包在后；历史摘要不冒充包含完整事件的可售作品。新快照仅保存在独立本地数据库，私有人生全文/seed/家庭对象不发给GA4或Stripe。

样本 content/premium-samples.json 来自12次真实跑完的虚构模拟（四语×日本/美国/印度），不是顾客故事。scripts/premium-samples.cjs 可重新生成。原样本姓名不因国家/语言被替换；源模型异常事件仅如实保留，并声明非真实社会史或个人预测。

## 实物及性能证据

- audit/premium-files/en-USA.pdf：11页，10,336,650 bytes；audit/premium-files/zh-TW-USA.pdf：10页，10,333,516 bytes。另10份样本均10–12页，详见同目录 manifest.json。
- audit/premium-files/edge-short-long-name.pdf：0岁短人生、120字CJK姓名，5页；没有捏造未来里程碑。
- audit/premium-files/zh-TW-poster-0.png：1800×2400；poster-1.png：2400×1600；poster-2.png：1800×2400。各语3款实际生成，独立故事场景/时间线/肖像布局。16张商品WebP是实际文件的展示衍生图，均有origin sidecar，扫描40张全站rasters、0缺失。
- pypdf逐份打开/文字提取，Poppler渲染CJK封面、事件正文及短人生长姓名，人工视查；未用纯文本提取替代图像验收。audit/premium-ja-body-final.png、premium-edge-final.png 为最终有效渲染；早期名称带fixed/subset的中间失败图不是通过证据。
- 自托管重命名OFL字体 KeepsakeSans-Regular.ttf：18,285,032 bytes。为避免已实测的subset缺字，PDF全嵌入，约10.3MB。导出库约1.28MB。均在明确打开作品预览/导出后加载，不进入首页初始资源；手机首次预览需下载较大字体，低内存真机仍待验。PDF生成是本地，不上传人生。
- 资源预算首页454267B、compare109657B、quick-play14831B；实际首页等待/模拟12组结果不变。PDF及海报离线生成依赖此前缓存；不承诺无网络首次导出。
- pdf-lib MIT、fontkit MIT、Noto OFL来源说明在 vendor/premium/；字体转换脚本 scripts/prepare-premium-font.py，FontTools4.67.0，原Noto源commit f8d157532fbfaeda587e826d4cd5b21a49186f7c。没有把字体作为单独商品销售。

## 实测矩阵

| ID | 结果 | 证据/边界 |
|---|---|---|
| F01 | PASS | npm run verify：21 Node测试，66页SEO，172国数据与资源预算 |
| F02 | PASS | PROOF_ONLY=1 node tests/release-browser.cjs，12个既有完整人生digest一致 |
| F03 | PASS | keepsake-browser、return-browser、ux-flow-browser：四语免费PNG、again、日常、旧摘要/存档、继续游玩不变 |
| F04 | PASS | 四语title/H1/FAQ/canonical/hreflang/语言互链自动检查 |
| F05 | PASS | 12份真实PDF+文字提取+最终Poppler CJK视查 |
| F06 | PASS | 四语各3款高清海报，短人生/长姓名生成；具体尺寸见manifest |
| F07 | PASS | premium.test、failure-browser：早夭、缺失字段不补写未来故事 |
| F08 | PASS（模拟Chrome） | 390/1440、reduced motion、Esc/焦点恢复，无横向溢出；真实iOS/Safari/屏幕阅读器未验 |
| F09 | PASS（本地） | 无配置时503、无购买按钮/假purchase，生产待发布核验 |
| F10 | BLOCKED | 模拟provider的paid/failed/expired状态通过；未使用真实Stripe Test Mode |
| F11 | 模拟PASS；沙盒BLOCKED | raw验签、旧签名、重复/乱序、金额/price不符、退款后latepaid不复活 |
| F12 | 本地PASS；沙盒BLOCKED | 两tab/刷新快照一致、绑定claim、pending有界重试、明确选订单；mock权限真实导出PDF+3PNG |
| F13 | 本地PASS | IndexedDB禁止不动免费存档；字体失败在创建Session前阻断；Kakao UA受控模拟拦截；非真实内置浏览器验收 |
| F14 | 本地PASS | 白名单排除私密字段，claim/commitment绑定，私密页不收集GA；不宣称客户端DRM |
| F15 | 本地PASS | 62旧URL+4新URL，sitemap66；生产404待核验 |
| F16 | 待发布回执 | audit/premium-production.json 保存实际revision、路由/API和浏览器生产检查 |
| F17 | 模拟PASS；真实BLOCKED | 退款/争议撤权、关闭checkout仍可已购交付；无真实退款或订单可报告 |

浏览器脚本除生产统计读取外均阻断GTM网络，避免验收污染GA。premium-callback-browser是明确mock，不能计入收入。独立impeccable审查最终ship，仅覆盖本地预览/实物；一次预览画面修复已完成，文件见 PREMIUM_DESIGN_FINISH.md。未替换原DESIGN.md。

## GA4观察和已落实的流量措施

2026-10-20在属性559735136今日首页读取90活跃用户、210浏览、1938事件、关键事件0；流量报告随稍后处理显示总计92会话，Direct47、Referral45、Unassigned3，关键事件及收入0。**报告总计与行合计95不一致，存在当日处理/归因差异；不重算比例或据此推断提升。** 没有看到Organic Search行，不等于搜索流量一定为零。截图audit/keepsake-ga4-today-final.jpg、keepsake-ga4-acquisition.jpg。来源/媒介域名尚未取得可靠细分。今日包含可能运营/QA流量，不能视作90位自然新客，更不能按事件总数相除宣称转化率。

本批已执行：四语有实际样本的商品页与sitemap/互链；首页及quick-play/replay-guide底部自然入口；结局免费行动优先；offer仅真正进入视区且每次人生一次；preview渲染成功才计sample_view；intent明确非成交；content_view及跨页事件新增keepsake分类，保持既有GA4默认收集和PII过滤。持续使用已有免费分享/每日人生/工具页承接Direct与Referral，不用付费墙挡新客；保留已有长尾页，未因当天小样本大量造页。

本批未发社区帖、未采购流量、未建定时任务。下一轮先按同一release/语言/设备/source-medium/cohort排除运营与自动测试，核对Referral实际来源和着陆页，再针对真实查询扩内容，不声称已有搜索增长。真实purchase/begin_checkout及其去重验收留到具备Stripe沙盒后，不把预览兴趣替代交易。

## 依赖、上线与回滚

缺少 Stripe商户/测试Secret/测试Price/WebhookSecret、实际D1绑定与测试迁移、稳定ORDER_SIGNING_SECRET、真实卖家名称、退款/税费/下载有效期规则、单独Live批准。客服邮箱已提供，不再列为缺项。B/C均不能宣布完成。私密test回调目前English-only；当前无消费者可进入checkout。

已知基线回滚SHA6f54de32905f03db5f98d41c0eb8bd7d194be8dc，仅在零支付阶段可完整恢复。发生问题先关闭新checkout、保留fulfillment；已有售单后必须保留Worker/D1/秘密及最后payment-capable版本，不得用基线回滚删除订单。部署沿用Git到Cloudflare自动发布，只推送一次最终HEAD到main，不叠加手动wrangler发布。实际前后SHA/生产URL验证在发布回执，最终报告补记。

工作区原先的BATCH23_REPORT、ICON_UPDATE_REPORT、IMPLEMENTATION_REPORT、MEASUREMENT、OPTIMIZATION_REPORT、P1_REPORT、SEO_GROWTH_REPORT及audit/等历史修改保留，不冒充本批提交。

## 7/14/30日复盘模板（没有创建自动任务）

| 时间 | 核对 | 决策标准 |
|---|---|---|
| 7日 | 非QA同cohort完成→offer→preview→intent；字体/存储失败，来源着陆页 | 小样本只定位阻断，不推算全站收入 |
| 14日 | 各语设备参与、复访、免费分享打开、真实GSC查询/收录/CTR | 有独特数据及真实需求才扩页；保留已有有效页 |
| 30日 | 同cohort留存及意向，若沙盒/商户齐备再另审真实收费 | live须另获批准；paid与download按真实订单去重，不混demo |

P0-A源码提交：6b03a185ad8d4dd450dc948ae8985b4c812802fc。P0-B关闭后端/模拟及本报告随下一提交发布；最终发布SHA以生产release.json和audit/premium-production.json核对，不预填尚不存在的自引用SHA。
