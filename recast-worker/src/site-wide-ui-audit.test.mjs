import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const publicRoot = new URL('../public/', import.meta.url).pathname;

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === 'public') return [];
    const target = join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

const pages = walk(publicRoot).filter(file => file.endsWith('.html'));
assert.ok(pages.length >= 85, `expected the complete public route set, found ${pages.length}`);

let internalLinkCount = 0;
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const isEmbed = file.includes('/embed/');
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  assert.equal(h1Count, isEmbed ? 0 : 1, `${file} should have one meaningful H1`);
  assert.match(html, /<html[^>]+lang=/i, `${file} needs a language`);
  assert.match(html, /name=["']viewport/i, `${file} needs a viewport meta tag`);
  assert.match(html, /<title>/i, `${file} needs a title`);
  if (!isEmbed) {
    assert.match(html, /<link[^>]+rel=["']canonical/i, `${file} needs a canonical URL`);
    assert.match(html, /<meta[^>]+name=["']description/i, `${file} needs a description`);
  }

  const ids = [...html.matchAll(/\bid=["']([^"']+)/gi)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${file} contains duplicate IDs`);
  for (const image of html.match(/<img\b[^>]*>/gi) || []) assert.match(image, /\balt=/i, `${file} has an image without alt text`);

  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|#|javascript:|data:)/i.test(href) || href.startsWith('?')) continue;
    internalLinkCount += 1;
    const clean = href.split(/[?#]/)[0];
    let target = clean.startsWith('/') ? join(publicRoot, clean) : resolve(dirname(file), clean);
    if (clean.endsWith('/')) target = join(target, 'index.html');
    else if (!extname(target)) target += '.html';
    assert.ok(existsSync(target), `${file} links to missing ${href}`);
  }
}

assert.ok(internalLinkCount >= 2700, `expected the complete internal-link graph, found ${internalLinkCount}`);
console.log(`site-wide UI audit passed: ${pages.length} pages, ${internalLinkCount} internal links`);
