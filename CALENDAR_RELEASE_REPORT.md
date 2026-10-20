# v1.13.0 · 实时年月出生模式

本次需求覆盖新的“现在出生”人生及所有相关展示和材料。统计观测年份、文献版本、172 个国家的模型输入不变。旧版 v1 分享链接和存档保留原年份，缺失的月份不补造。

| 范围 | 落实 |
| --- | --- |
| 出生模式 | 改称“实时时间”，新生使用设备日历的当前 YYYY-MM；生成出生卡时冻结，跨月后确认也不漂移 |
| 推进与结局 | 每个模拟年推进一年；结束年月 = 出生年月 + 实际模拟寿命，包含零岁结束 |
| 分享与每日人生 | 新链接为 Replay v2，携带 YYYYMM；每日邀请采用 UTC 日期及月份。旧 v1 链接继续按原 2024 基准运行 |
| 页面与本机记录 | 出生卡、身份记录、当前年月、家谱、结局、本机收藏、重现确认同步使用同一日期逻辑；GEDCOM 保留月份 |
| 导出与示例 | 普通 PNG、纪念包 PDF、三种海报、27 个九语言纪念包示例、12 个公开人生示例更新；示例保留其记录月份 |
| 文案与 SEO | 226 个公开页面补充九语言时间规则，首页描述与分享摘要同步；既有 canonical、hreflang、sitemap URL 保留 |
| 图片资料 | 重新捕获操作/出生/结局截图，重新渲染 36 张纪念包展示图；新增五语言独立展示图引用 |

## 已执行验收

- `npm run verify`：构建、数据校验、226 页 SEO、静态资源预算及 37 项单元测试通过。
- `node tests/calendar-browser.cjs`：九语言跨年跨月、出生卡冻结、刷新续玩、新开人生、结束年月、家谱月份、PNG/GEDCOM/导出快照通过；12 组旧 v1 完整结果摘要一致。
- `node tests/release-browser.cjs`（`PROOF_ONLY=1`）：12 个公开 v2 示例完整结果摘要一致。
- `node tests/task-replay-browser.cjs`：另外五种显示语言的 15 个旧 v1 结果摘要不变。
- `node tests/task-acceptance-browser.cjs`：九语言 × 三种视口的主要路径，以及九语言预览、固定下载栏与页面切换通过。
- `node tests/experience-acceptance.cjs`：九语言 × 三种风格，共 27 份真实 PDF，81 个轻量海报预览，以及原有八种音轨通过。
- `python tests/keepsake-pdf-geometry.py audit/calendar-release/pdf`：27 份实际 PDF 正文均位于页脚以上，实际页数与预览一致。
- 国家数据源的规范 JSON SHA-256 仍为 `dffaecfcf38da7e575f8d15f565a4c3d08cf8da7fe02fefb6bbe6468418e9c62`。

本地证据在 `audit/calendar-release/`。历史发布报告记录各自版本，不批量改写历史事实。真实支付仍保持关闭；本次不改变支付、统计 ID、源数据或存储键。

## 发布与回滚

沿用已授权的 Git → Cloudflare Workers 自动发布，构建命令 `npm run verify`，站点 `https://1in8billion.live/`。发布后核对 `/release.json`、九语言实时出生和结局、月份示例、sitemap、静态素材及 404。前一版本为 `9f71a5c1e853ab3de8afbe4f42378d43b713279b`；本次不迁移或删除用户存档。
