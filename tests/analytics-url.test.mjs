import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../analytics-url.js';
test('only safe campaign labels survive analytics URLs',()=>{
 assert.equal(safeAnalyticsUrl('https://1in8billion.live/?utm_source=v2ex&utm_medium=community&utm_campaign=launch_oct&country=JPN&analytics_debug=1#run=v1.secret'), 'https://1in8billion.live/?utm_source=v2ex&utm_medium=community&utm_campaign=launch_oct');
 assert.equal(safeAnalyticsUrl('https://1in8billion.live/ja/?name=private#run=secret'),'https://1in8billion.live/ja/');
 for(const value of ['a@b.com','https://private.test','<script>','x'.repeat(101),'bad\nlabel'])assert.equal(safeAnalyticsUrl('https://1in8billion.live/?utm_source='+encodeURIComponent(value)),'https://1in8billion.live/');
 assert.equal(safeAnalyticsUrl('https://1in8billion.live/?utm_source=a&utm_source=b'),'https://1in8billion.live/');
 const output=fs.readFileSync('dist/analytics-config.js','utf8');assert.ok(output.includes('safeAnalyticsUrl(location.href)'));assert.ok(output.includes('function safeAnalyticsUrl'));
});
