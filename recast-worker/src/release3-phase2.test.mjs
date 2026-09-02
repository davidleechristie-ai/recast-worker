import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const slugs = [
  'api-response-to-csv',
  'recurring-json-csv-conversion',
  'automated-data-validation',
  'scheduled-data-transformation',
  'webhook-data-processing',
  'batch-file-conversion',
  'api-for-internal-tools',
  'api-for-ci-cd'
];

const titles = new Set();
const descriptions = new Set();
for (const slug of slugs) {
  const html = await readFile(new URL(`../public/use-cases/${slug}.html`, import.meta.url), 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1] || '';
  assert.ok(title.length > 20, `${slug} needs a useful title`);
  assert.ok(description.length > 70, `${slug} needs a useful description`);
  assert.ok(!titles.has(title), `${slug} title must be unique`);
  assert.ok(!descriptions.has(description), `${slug} description must be unique`);
  titles.add(title); descriptions.add(description);
  assert.match(html, new RegExp(`https://tryrecast\\.app/use-cases/${slug}\\.html`));
  assert.match(html, /<h1>[^<]+<\/h1>/i);
  assert.match(html, /\/tools\/|\/app\/|\/automation\/|\/api\/index\.html/);
}

const sitemap = await readFile(new URL('../public/sitemap-use-cases.xml', import.meta.url), 'utf8');
for (const slug of slugs) assert.match(sitemap, new RegExp(`/use-cases/${slug}\\.html`));
const robots = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8');
assert.match(robots, /sitemap-use-cases\.xml/);

const home = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
assert.match(home, /<h3>Free<\/h3><strong>£0<\/strong>/);
assert.match(home, /<h3>Pro<\/h3><strong>£9<small>\/month<\/small><\/strong>/);
assert.match(home, /<h3>Automation<\/h3><strong>£29<small>\/month<\/small><\/strong>/);
assert.match(home, /<h3>API<\/h3><strong>£29<small>\/month<\/small><\/strong>/);
assert.match(home, /href="\/automation\/">Explore automation/);
assert.match(home, /href="\/api\/">Explore API/);

const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
assert.match(app, /pro_monthly:\s*'https:\/\/buy\.stripe\.com\//);
assert.match(app, /pro_yearly:\s*'https:\/\/buy\.stripe\.com\//);
assert.match(app, /api_monthly:\s*'https:\/\/buy\.stripe\.com\//);
assert.match(app, /api_yearly:\s*'https:\/\/buy\.stripe\.com\//);
assert.match(app, /day_pass:\s*'https:\/\/buy\.stripe\.com\//);
assert.match(app, /automation_monthly:\s*'REPLACE_AUTOMATION_MONTHLY_PAYMENT_LINK'/);
assert.match(app, /automation_yearly:\s*'REPLACE_AUTOMATION_YEARLY_PAYMENT_LINK'/);

const wrangler = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
for (const plan of ['pro_monthly','pro_yearly','api_monthly','api_yearly','day_pass']) assert.match(wrangler, new RegExp(`\\\\\"${plan}\\\\\"`));

await access(new URL('../public/app/index.html', import.meta.url));
await access(new URL('../public/automation/index.html', import.meta.url));
await access(new URL('../public/api/index.html', import.meta.url));

console.log('release3 phase2 commercial QA passed');
