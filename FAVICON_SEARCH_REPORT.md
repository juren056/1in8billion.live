# v1.14.1 · 搜索图标与摘要修正

2026-10-21，用户反馈 Google 搜索结果显示默认地球图标。

## 发现

- 正式站 /public-assets/icon-96.png：HTTP200、image/png、5107字节，实际96×96，圆形图案、透明四角，与源文件二进制完全相同。
- /favicon.ico：HTTP200、image/vnd.microsoft.icon、49244字节，含16/32/48/64/96/128/256七个有效尺寸，与源文件相同。
- robots.txt 允许全部路径。Googlebot-Image 用户代理兼容性请求也返回200及相同PNG；该模拟请求不等于验证来自Google真实IP的访问。
- GSC 首页网址检查：已收录、Googlebot智能手机版最后抓取为界面显示2026-10-21 08:15:00，允许抓取/索引，抓取成功，规范网址为 https://1in8billion.live/。
- GSC 的已抓取HTML包含ICO、96PNG、SVG三个 rel=icon 声明。Google当前支持的搜索图标格式列表包含PNG/ICO，未列SVG。不能据此证明SVG是唯一原因；搜索缓存/处理时序也仍可能参与。
- 搜索摘要中的“The game could not load”文本实际存在于静态noscript备用内容，动态状态也可能输出相同文字。

## 改动

226个公开页面仅声明同一个稳定PNG：/public-assets/icon-96.png，96×96，image/png。不换URL，不重绘现有圆形蓝色品牌。ICO文件保留；SVG继续用于品牌/PWA。仅移除其 favicon 声明，避免多个候选及不在当前支持列表中的格式。

九语言首页的加载/错误状态容器及noscript备用文字使用受支持的 div data-nosnippet，保留用户可见错误与重试按钮。正文、说明与索引资格不屏蔽；未添加整页nosnippet或noindex。

## 验收

- npm run verify：51项自动测试通过；172国原数据、226页SEO/sitemap及资源体积预算通过。
- tests/favicon-search-browser.cjs：九语言手机首页声明一致，真实解码96PNG、透明四角、正常开始人生；故障注入的重试按钮与禁用JavaScript备用内容正常且受data-nosnippet保护。
- 原图标内容、模拟规则、实时时间与统计数据、用户存档、GA4设置均未修改。

发布通过现有Git→Cloudflare流水线。发布后核对正式站版本、九语言图标声明/响应及GSC实际网址测试，并尝试一次首页请求编入索引；最终结果保存于 audit/favicon-search-20261021/，不预先宣称请求成功或搜索结果已更新。

官方依据：
- https://developers.google.com/search/docs/appearance/favicon-in-search
- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#data-nosnippet-attr

图标展示由Google处理，符合要求也不保证显示。官方说明重新抓取和处理可能需数天至数周，不能保证具体时间；不通过反复更换图标URL或反复提交来催促。
