import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildAdSense } from '../scripts/build-adsense.mjs';

test('AdSense ownership setup does not enable ads and adds accurate privacy disclosure', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'adsense-build-'));
  try {
    fs.mkdirSync(`${directory}/privacy`);
    fs.writeFileSync(`${directory}/index.html`, '<html><head></head><body><main>Game</main></body></html>');
    fs.writeFileSync(`${directory}/privacy/index.html`, '<html><head></head><body><main>Privacy</main></body></html>');
    fs.writeFileSync(`${directory}/404.html`, '<html><head><meta name="robots" content="noindex"></head></html>');
    assert.equal(buildAdSense({ directory, publisherId: 'ca-pub-2031710024449901' }), 2);
    const home = fs.readFileSync(`${directory}/index.html`, 'utf8');
    const privacy = fs.readFileSync(`${directory}/privacy/index.html`, 'utf8');
    assert(home.includes('<meta name="google-adsense-account" content="ca-pub-2031710024449901">'));
    assert(!/adsbygoogle|googlesyndication/.test(home + privacy));
    assert(privacy.includes('Google ads are not currently enabled'));
    assert(privacy.includes('Google-certified consent management platform'));
    assert(privacy.includes('fictional biographies'));
    assert.equal(fs.readFileSync(`${directory}/ads.txt`, 'utf8'), 'google.com, pub-2031710024449901, DIRECT, f08c47fec0942fa0\n');
    assert(!fs.readFileSync(`${directory}/404.html`, 'utf8').includes('google-adsense-account'));
    assert.throws(() => buildAdSense({ directory, publisherId: 'wrong' }), /Invalid/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
