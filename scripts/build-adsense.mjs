import fs from 'node:fs';

// Explicit public-content inventory; game, keepsake, payment and utility pages stay ad-free.
export function buildAdSense({ directory = 'dist', publisherId, adsEnabled=false, contentSlot } = {}) {
  if (!/^ca-pub-\d{16}$/.test(publisherId || '')) throw new Error('Invalid AdSense publisher ID');
  const tag = `<meta name="google-adsense-account" content="${publisherId}">`;
  if(adsEnabled&&!/^\d{10}$/.test(contentSlot||''))throw Error('Invalid AdSense content slot');
  if(adsEnabled)for(const file of ['advertising-privacy.js','content-ads-bootstrap.js','play-ads-layout.js','content-ads.js','content-ads-copy.js','content-ads.css'])fs.copyFileSync(file,`${directory}/${file}`);
  const servingPrivacy=`<section id="google-advertising"><h2>Google advertising and privacy choices</h2><p>Google AdSense display ads may appear on the home page, in a separate region outside the simulator and within public guides and country articles. Home pages contain up to four placements, the simulator one, and long articles up to two. Choice dialogs, private records, keepsake editor and downloads, creator support, payment and legal pages carry no ads. Auto ads, interstitials and floating ads are not enabled.</p><p>Eligible visitors receive non-personalized advertising directly, without a custom permission popup. Existing advertising opt-outs are respected. Google and advertising providers may place or read cookies, use web beacons, and process IP addresses, device identifiers and interaction information for advertising, measurement and fraud prevention. We request non-personalized ads with restricted data processing; this does not mean cookie-free advertising.</p><p>Advertising opt-outs are remembered in this browser for up to 180 days. Advertising loads automatically without play-page switches. You can change your browser advertising preference only here on the Privacy page; the setting takes effect on subsequent page loads. Ads are requested only for visible placements on an active page and are not automatically refreshed by game years or new lives. Global Privacy Control is respected. <button type="button" id="advertisingPrivacyChoice">Advertising privacy preference</button> Ad blockers or declining ads do not restrict the content.</p><p>Advertising is currently withheld in the EEA, UK, Switzerland and Russia, and when the edge cannot determine a country. No custom permission popup substitutes for a certified CMP: these regions remain excluded while account CMP configuration cannot be verified. The server uses Cloudflare's country code for this eligibility decision without storing it in an advertising profile. No fictional biographies, character names, religion, health values, family records, private notes or imported family trees are sent for advertising targeting. Pages with query strings or fragments do not request ads.</p><p>Review <a href="https://policies.google.com/technologies/partner-sites">how Google uses information from sites that use its services</a>, <a href="https://myadcenter.google.com/">Google My Ad Center</a> and <a href="https://policies.google.com/technologies/ads">Google's advertising policy</a>. Contact: <a href="mailto:support@1in8billion.live">support@1in8billion.live</a>.</p></section>`;
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
        if (/(?:^|\/)privacy\/index\.html$/.test(file)){html=html.replace('</main>',`${adsEnabled?servingPrivacy:privacy}</main>`);if(adsEnabled)html=html.replace('</head>','<script type="module" src="/advertising-privacy.js"></script></head>');}
        const route=file.slice(directory.length+1).replaceAll('\\','/');
        if(adsEnabled&&/^(?:(?:ja|ko|zh-tw|zh-cn|es|pt-br|fr|de|ru)\/)?(?:guides\/[^/]+|countries\/[^/]+|how-it-works)\/index\.html$/.test(route)&&/<main\b/.test(html)){
          html=html.replace('</head>','<script type="module" src="/content-ads-bootstrap.js"></script></head>');
          const slot=`<aside class="content-ad" style="min-height:1px" data-content-ad data-publisher="${publisherId}" data-slot="${contentSlot}"></aside>`;
          const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'',headings=[...main.matchAll(/<h2\b/g)];
          if(main.replace(/<[^>]*>/g,'').replace(/\s/g,'').length>=1200&&headings.length>=4){const at=html.indexOf(main)+headings[Math.floor(headings.length/2)].index;html=html.slice(0,at)+slot+html.slice(at);}
          html=html.replace('</main>',slot+'</main>');
        }
        if(adsEnabled&&html.includes('id="view-intro"')&&html.includes('id="view-life"')){
          const zone=(name,view)=>`<div class="play-ad-zone" data-ad-view="${view}" hidden><aside class="content-ad" style="min-height:1px" data-content-ad data-placement="${name}" data-publisher="${publisherId}" data-slot="${contentSlot}"></aside></div>`;
          html=html.replace(/(<section id="view-intro"[^>]*>)/,'$1'+zone('home-top','intro')+zone('home-lower','intro')+zone('home-world','intro')+zone('home-stories','intro'));
          const start=html.indexOf('<section id="view-life"'),tags=/<\/?section\b[^>]*>/g;tags.lastIndex=start;let depth=0,match;
          while((match=tags.exec(html))){depth+=match[0].startsWith('</')?-1:1;if(depth===0){html=html.slice(0,tags.lastIndex)+zone('simulator','life')+html.slice(tags.lastIndex);break;}}
          if(depth!==0)throw Error('Cannot locate simulator boundary');
        }
        fs.writeFileSync(file, html);
        count++;
      }
    }
  }
  visit(directory);
  fs.writeFileSync(`${directory}/ads.txt`, `google.com, ${publisherId.slice(3)}, DIRECT, f08c47fec0942fa0\n`);
  return count;
}
