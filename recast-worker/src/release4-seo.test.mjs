import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SEO_PAGES, renderSeoPage, renderSeoIndex } from './seo-pages.js';

const slugs = Object.keys(SEO_PAGES);
assert.ok(slugs.length >= 12, 'expected first high-intent SEO cluster');

const titles = new Set();
const descriptions = new Set();
const h1s = new Set();
const allowedClusters = new Set(['Convert','Transform','Validate','Compare','Automate','API']);

for (const slug of slugs) {
  const page = SEO_PAGES[slug];
  assert.ok(allowedClusters.has(page.cluster), `${slug} has unsupported cluster`);
  assert.ok(page.title.length >= 35 && page.title.length <= 75, `${slug} title length`);
  assert.ok(page.description.length >= 90 && page.description.length <= 180, `${slug} description length`);
  assert.ok(page.intent.length > 70, `${slug} needs unique intent copy`);
  assert.ok(page.example.length > 80, `${slug} needs an example`);
  assert.ok(page.limit.length > 70, `${slug} needs a real limitation`);
  assert.equal(page.steps.length, 3, `${slug} needs three concrete steps`);
  assert.ok(!titles.has(page.title), `${slug} duplicate title`);
  assert.ok(!descriptions.has(page.description), `${slug} duplicate description`);
  assert.ok(!h1s.has(page.h1), `${slug} duplicate H1`);
  titles.add(page.title); descriptions.add(page.description); h1s.add(page.h1);

  const html = renderSeoPage(slug);
  assert.ok(html.length > 1800, `${slug} rendered page is too thin`);
  assert.match(html, new RegExp(`https://tryrecast\\.app/seo/${slug}\\.html`));
  assert.match(html, /BreadcrumbList/);
  assert.match(html, /FAQPage/);
  assert.match(html, /Limitation to understand/);
  assert.match(html, /Choose the right execution path/);
  assert.match(html, /\/tools\/|\/api\/index\.html/);
  assert.match(html, /\/app\/|\/automation\/|\/api\/index\.html/);
  assert.doesNotMatch(html, /search results|best \d+|guaranteed|unlimited API/i);
}

const index = renderSeoIndex();
for (const cluster of ['Convert','Transform','Validate','Compare','Automate','API']) assert.match(index, new RegExp(`<h2>${cluster}<\\/h2>`));
for (const slug of slugs) assert.match(index, new RegExp(`/seo/${slug}\\.html`));

const worker = await readFile(new URL('./worker-release4.js', import.meta.url), 'utf8');
assert.match(worker, /worker-release3/);
assert.match(worker, /\/seo\//);
assert.match(worker, /Response\.redirect/);
const wrangler = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
const mainMatch = wrangler.match(/"main":\s*"src\/([^"]+)"/);
assert.ok(mainMatch, 'Wrangler must declare a Worker entry point');
let active = mainMatch[1];
let reachedRelease4 = active === 'worker-release4.js';
for (let depth = 0; !reachedRelease4 && depth < 6; depth += 1) {
  const source = await readFile(new URL(`./${active}`, import.meta.url), 'utf8');
  const importMatch = source.match(/from ['"]\.\/(worker-[^'"]+\.js)['"]/);
  assert.ok(importMatch, `${active} must delegate to a lower Worker wrapper`);
  active = importMatch[1];
  reachedRelease4 = active === 'worker-release4.js';
}
assert.ok(reachedRelease4, 'Active Worker wrapper chain must preserve worker-release4.js');
assert.match(wrangler, /"\/seo\/\*"/);
const robots = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8');
assert.match(robots, /sitemap-seo\.xml/);
const sitemap = await readFile(new URL('../public/sitemap-seo.xml', import.meta.url), 'utf8');
for (const slug of slugs) assert.match(sitemap, new RegExp(`/seo/${slug}\\.html`));

console.log('release4 programmatic SEO quality gate passed');
