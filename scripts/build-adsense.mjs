import fs from 'node:fs';

// Ownership verification only: loading or displaying ads is a separate release.
export function buildAdSense({ directory = 'dist', publisherId } = {}) {
  if (!/^ca-pub-\d{16}$/.test(publisherId || '')) throw new Error('Invalid AdSense publisher ID');
  const tag = `<meta name="google-adsense-account" content="${publisherId}">`;
  const privacy = `<section id="google-advertising"><h2>Google advertising and privacy choices</h2><p>We have applied to Google AdSense. This release contains only an account verification meta tag and an ads.txt authorization record. Neither loads advertising scripts or sets advertising cookies, and Google ads are not currently enabled.</p><p>If advertising is enabled in a future release, Google and other third-party advertising providers may place or read cookies, use web beacons, and process IP addresses, device identifiers and interaction information to deliver, measure and prevent fraud in advertising. Personalized advertising may use information from visits to this and other websites. We will provide the required consent choices before enabling advertising for affected visitors, including a Google-certified consent management platform where required in the EEA, UK and Switzerland.</p><p>We do not send fictional biographies, character names, religion, family records, private notes or imported family trees to Google for ad targeting. Fictional game characteristics must not be treated as the visitor's own sensitive personal information.</p><p>You can review <a href="https://policies.google.com/technologies/partner-sites">how Google uses information from sites that use its services</a>, manage personalized advertising through <a href="https://myadcenter.google.com/">Google My Ad Center</a>, or learn about advertising cookies at <a href="https://policies.google.com/technologies/ads">Google's advertising policy</a>. Browser cookie controls remain available. Contact: <a href="mailto:support@1in8billion.live">support@1in8billion.live</a>.</p></section>`;
  let count = 0;
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = `${dir}/${entry.name}`;
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.html')) {
        let html = fs.readFileSync(file, 'utf8');
        if (!/<\/head>/i.test(html) || /name=["']robots["'][^>]*noindex/i.test(html)) continue;
        if (html.includes('name="google-adsense-account"')) throw new Error(`Duplicate AdSense verification: ${file}`);
        html = html.replace(/<\/head>/i, `${tag}</head>`);
        if (/(?:^|\/)privacy\/index\.html$/.test(file)) html = html.replace('</main>', `${privacy}</main>`);
        fs.writeFileSync(file, html);
        count++;
      }
    }
  }
  visit(directory);
  fs.writeFileSync(`${directory}/ads.txt`, `google.com, ${publisherId.slice(3)}, DIRECT, f08c47fec0942fa0\n`);
  return count;
}
