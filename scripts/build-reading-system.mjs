import fs from 'node:fs';

// Presentation only: keep canonical content, tool IDs, anchors and data intact.
export function migrateReadingPages(routes) {
  for (const route of [...routes, '/404.html']) {
    const path = route === '/404.html' ? 'dist/404.html' : 'dist' + route + 'index.html';
    let html = fs.readFileSync(path, 'utf8');
    if (html.includes('id="view-intro"') || route.includes('/keepsake/')) continue;
    const type = /\/compare\//.test(route) ? 'comparison' : /\/birth-odds\//.test(route) ? 'calculator' : /\/countries\/$/.test(route) ? 'directory' : /\/countries\/.+/.test(route) ? 'country' : 'article';
    html = html.replace(/<main class="article">([\s\S]*?)<\/main>/, (_, body) => {
      const contents = body.match(/<nav class="reading-navigation"[\s\S]*?<\/nav>/)?.[0] || '';
      body = body.replace(contents, '');
      const title = body.match(/^[\s\S]*?<\/h1>/)?.[0] || '';
      body = body.slice(title.length);
      const lead = body.match(/^\s*<p\b[\s\S]*?<\/p>/)?.[0] || '';
      body = body.slice(lead.length);
      return `<main class="article reading-page reading-${type}"><div class="page-intro">${title}${lead}</div><div class="reading-layout${contents ? ' has-contents' : ''}">${contents}<div class="reading-flow">${body}</div></div></main>`;
    });
    // Replace the discarded page-level visual system instead of overriding it.
    html = html.replace(/<link rel="stylesheet" href="\/(?:launch|content|experience-upgrade)\.css"[^>]*>/g, '').replace(/<noscript>\s*<\/noscript>/g, '');
    html = html.replace(/<div class="table-scroll">/g, '<div class="table-scroll" tabindex="0">');
    html = html.replace('</head>', '<link rel="stylesheet" href="/reading-system.css"></head>');
    fs.writeFileSync(path, html);
  }
}
