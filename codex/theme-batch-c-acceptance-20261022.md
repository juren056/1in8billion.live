# 全站四主题改版 · 第三批本地验收 · 2026-10-22

发布候选 v1.17.0。A/B已完成分批验收；此处记录C01–C03、C05。C04 Git发布与正式域名验收另记上线回执，本文件不能单独证明已上线。

| 范围 | 实际结果 | 证据（audit/theme-batch-c/） |
|---|---|---|
| 正文迁移 | 226公开路由全部归入新版模板；私有订单与404也有完整导航/九语入口；标题、导语、展开目录、正文、表格、图表、搜索、空状态和工具整体迁移 | route-coverage.json、publication-report.json |
| 四主题/多语 | 首页180组合（9语×4主题×5宽度）；8类内页128组合（英/简中×4主题×2宽度）；九语实际对比选择、切主题不丢参数、交换与CSV下载通过 | browser-report.json、reading-report.json |
| 功能与兼容 | 72/72；12条完整旧样例回放匹配；待答/稍后/重开/单次提交、暂停/保存/继续、缺图可玩、反复重抽/跳过/取消、实际免费PNG通过 | verify.log、replay-proof-test.log、workspace-report.json、flow-report.json、reveal-report.json |
| 纪念与交付 | B中18本地化视口、54模板/样例/比例、18高清PNG、4PDF及真实Stripe沙盒/Webhook验收保留；C最终回调模拟再验pending重试、5格式真实导出、中文/刷新/失败关闭、无purchase事件 | B验收文件；C order-test.log明确为UI模拟 |
| SEO | 226唯一规范公开页、H1、标题描述、hreflang、本地资源及静态可达；sitemap排除订单、私人内容、404、研究预览与主题参数；圆形favicon保留 | check-seo、既有测试、publication-report.json |
| 数据规则 | 统计JSON与基线相同（规范checkout行尾后）；app模拟源码只改APP_VERSION；年月/旧回放测试通过 | publication-report.json、72测试、12回放 |
| 资源预算 | 未放宽旧上限：首页447074B、compare108005B、guide18512B | dist/performance-assets.json |
| 独立终审 | 32内页全页图＋34整合主流程图；唯一修正为文档状态与字号规范；同评审给fix1 resolved / ship | finish-review.md、finish-verdict.md、documentation.md |

正常生产构建包含四主题，不生成`__design`或design-preview.json，不携带预览全局noindex。额外研究页仅显式本地预览生成。旧指南图片已换成实际新版游戏截图，日期与版本更新；统计观测年份不变。

浏览器合成测试屏蔽GA4/Clarity。C检测14条均为字号/半径规范advisory，已按实际读写角色补充文档，未跑第二次检测。最终揭晓脚本早期仍写B路径，结果复制到C；相关图/报告属于最终候选验证，不再声称B原始证据未经修改。

性能为本机Chrome CPU4倍减速；首页额外延后旧可选CSS两秒。首页LCP最大1504ms、CLS最大0.00449；内页明细见reading-loading-report.json，所有案例LCP≤2500ms、CLS≤0.1。这不是公开Lighthouse或CrUX用户百分位。全资源解码量和主题图请求另有记录，不把静态关键预算当作全资源覆盖。

## 真实GA4基线

2026-10-22通过Chrome读取本站属性559735136，明确日期2026-10-19至20：125会话、87参与会话、69.6%参与率、平均互动1分14秒、2912事件。Direct56会话，v2ex52（另edge2），Google organic1；codex_validation/internal_test明确出现1会话/61事件。截图与AX留在本地`ga4-baseline-20261019-20.*`。

这些是未排除内部访问的来源报表总计，不能当作自然用户转化漏斗；关键事件数0不证明购买转化率0%。本次未改GA4配置、同意提示或Clarity。上线后以release=1.17.0、设备、新/老/恢复/回放分组，排除内部campaign，比较等长真实会话漏斗：开始→首次事件可见→首个选择→完成→个人作品→沙盒结账→授权下载。沙盒不计真实营收。上线当刻没有足够的改版后窗口，不预填增长或转化结论，也不为等待未来数据阻塞发布。

## 发布保留与回滚

发布前主域名确认为v1.16.9、da8941e0155ccd5c12bedfdebc9bfcf0facfcdf1；checkout=true且testOnly=true。部署列表最新活动版本7d3cb0ba-9267-4219-a842-1d8ea6e69977；此前acf63603是历史素材版本。仅回滚代码/静态资源，不回滚D1，不重置Secret。精确Git、CI、Cloudflare版本和生产旧订单下载将记录在最终上线回执。
