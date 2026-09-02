import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../public/ui-consistency.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/ui-consistency.js', import.meta.url), 'utf8');
const wrapper = await readFile(new URL('./worker-ui.js', import.meta.url), 'utf8');
const wrangler = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');

for (const label of ['Tools','Workflows','Automation','API','Guides','Pricing']) assert.ok(js.includes(`'${label}'`) || js.includes(`>${label}<`), `missing shared nav label ${label}`);
assert.match(js, /normalizeBranding/);
assert.match(js, /\/assets\/brand\/recast-logo\.png/);
assert.match(js, /recast-brand-logo/);
assert.match(js, /normalizeUseCaseNav/);
assert.match(js, /normalizeTechnicalNav/);
assert.match(js, /ensureGlobalShell/);
assert.match(js, /buildGlobalHeader/);
assert.match(js, /buildGlobalFooter/);
assert.match(js, /recast-menu-toggle/);
assert.match(js, /aria-expanded/);
assert.match(js, /event\.key === 'Escape'/);
assert.doesNotMatch(js, /inputEl\.value|outputEl\.value|textarea\.value|localStorage\.setItem/);
assert.match(css, /--recast-purple:#9164ff/);
assert.match(css, /--recast-space-8:72px/);
assert.match(css, /\.site-header,.titleblock,.uc-nav/);
assert.match(css, /\.recast-global-header/);
assert.match(css, /\.recast-global-footer/);
assert.match(css, /\.recast-global-nav\[data-open="true"\]/);
assert.match(css, /focus-visible/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /@media\(max-width:640px\)/);
assert.match(wrapper, /worker-release4\.js/);
assert.match(wrapper, /ui-consistency\.css/);
assert.match(wrapper, /ui-consistency\.js/);
assert.match(wrapper, /ui-consistency\.css\?v=7/);
assert.match(wrapper, /ui-consistency\.js\?v=7/);
assert.match(wrapper, /recast-favicon-64\.png/);
assert.match(wrapper, /app\.js\?v=87/);
assert.match(wrapper, /release4Worker\.fetch/);
assert.match(wrangler, /"main": "src\/worker-ui\.js"/);
for (const route of ['/blog/*','/how-to/*','/demo/*','/tools/*','/automation/*','/use-cases/*','/contact.html','/index.html']) {
  assert.ok(wrangler.includes(`"${route}"`), `Worker UI wrapper must cover ${route}`);
}
const serviceWorker = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
assert.match(serviceWorker, /CACHE_VERSION = 'recast-v92'/);
assert.match(css, /\.minimal-hero-copy h1 \.hero-accent,\.hero h1>span,\.section h2>span\{display:inline-block!important;padding-bottom:\.12em!important;margin-bottom:-\.12em!important\}/,
  'all gradient hero and section headings must reserve paint space for descenders such as g, p, q and y');
assert.match(serviceWorker, /assets\/brand\/recast-logo\.png/);

console.log('site-wide UI consistency tests passed');
