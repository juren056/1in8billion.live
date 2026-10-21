# 四主题遗漏补齐 · 上线验收回执

2026-10-22。版本 v1.17.1。产品修复提交 `36c1fdbc793007912237516b548d62ddbbe7edb5`，测试就绪等待修正提交 `fbfe2f9ee7da4163833b9f5db1672880bfda1d40`。均已非强制推送 origin/main。

## 完成的遗漏

恢复六个真实游戏工具入口；四主题辅助页面与可读对比；九语批量结果/存档单位；缺日期旧记录的精确匹配与真实缺失提示；键盘存档、焦点/Escape与具名删除确认；图片失败重试与取消弹窗后的底栏恢复；工具加载提示与正确版本号。

未改人口统计输入、模拟/随机规则、CalendarCore、个人寄语、存储格式或支付后端。蓝色默认、四主题、默认展开、九语言与沙盒支付保留。

## 验收证据

- 本地：72 项单元测试；216 组辅助页面布局；9 语实际 v2 完成人生、缺日期边界、原生比较结果与存储不改写；12 个原回放结果；226 页 SEO、172 国数据及资源预算。
- 本地性能：Chrome CPU 4×、可选旧 CSS 延迟 2 秒，四组最大 LCP 1344ms、CLS 0.00632。这是本地模拟，不作为现场核心指标。
- 独立设计评审：基于实际浏览器截图，首次因失败图片截图不完整要求 recapture；补完整证据后的 full review 要求两项细节修复，同评审 verdict resolved/ship。图像终审为无浏览器的 degraded finish-reviewer 角色替代，已披露；没有伪称独立评审另跑浏览器。
- 文档核对：本轮普通扩展复用现有设计系统；保留 PRODUCT/DESIGN/sidecar，报告其既有候选时间线措辞，不擅自重写。
- 正式站产品提交 `36c1fdb`：226 页 200、226 条规范 sitemap、404/noindex、研究页面 404、关键图标/原创素材字节、九语四主题两尺寸 72 组首页无错误；比较选择随主题保留；九语实际已完成人生/缺日期/原生批量比较均通过。
- 自动化最初两项失败来自测试过早操作：比较数据 fetch 前、工具模块安装前。增加可观察就绪等待后上述正式检查通过；将等待修正单独提交，没有产品代码变更。
- 支付 health 为 preview=true、checkout=true、testOnly=true。此次未新建支付交易；既有真实沙盒 PNG/PDF 交付见 v1.17.0 回执，当前后端未变。

## 最终提交正式复验

最终提交 `fbfe2f9ee7da4163833b9f5db1672880bfda1d40` 已由 Git 自动部署。GitHub CI [39663618751](https://github.com/juren056/1in8billion.live/actions/runs/39663618751) 为 completed/success。主域名 `/release.json` 返回该精确提交及 v1.17.1。Cloudflare 活动版本 `f53ee26d-12f0-4bb0-a3cd-f46ffa84f0ba`、部署 `4b7ee092-da4e-4aef-8106-d5d4e9442087`，100%。未人工补发。

该精确提交再次通过线上 226 公开路由、226 条 sitemap、404/noindex 与研究路由隔离、6 项关键资源字节一致、72 组首页组合及比较交互检查，脚本错误 0；支付 health 仍为测试模式。九语辅助工具完整验收于产品修复提交完成，最终提交只修正测试等待，没有改变产品源码。当前复核列出的实现遗漏均已处理。

回滚参考：前稳定版本 v1.17.0 提交 `22c22ee716e1aab03ec6f13403869cca3fafdfa1`、Cloudflare 版本 `48d033c4-283e-477d-b011-59b69411a301`。不要通过强制推送或更换数据库回滚。

详细记录：`audit/theme-followup/production-report.json`、`production-tools/records-report.json`、`finish-verdict.md`、`documenter.md`。此前所有计划的当前补丁范围见 `theme-followup-acceptance-20261022.md`。Google 抓取/收录和后续真实流量效果仍属外部观察，不能由本次 UI 验收保证。
