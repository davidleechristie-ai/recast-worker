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
assert.match(js, /normalizeMarketingNav/);
assert.match(js, /marketingNavMarkup/);
assert.match(js, /bindMarketingSubmenus/);
assert.match(js, /recast-nav-chevron/);
assert.match(js, /aria-controls="recast-nav-\$\{key\}"/,
  'first-load marketing navigation groups must expose accessible submenu controls');
for (const group of ['Tools', 'Automation', 'Guides']) {
  assert.match(js, new RegExp(`marketingNavGroup\\('${group}'`), `${group} must be expandable on the initial navigation`);
}
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
assert.match(css, /\.site-header \.recast-nav-chevron/,
  'mobile submenu chevrons must be drawn by shared CSS and visible on first render');
assert.match(css, /\.site-header \.recast-nav-group\.is-open \.recast-nav-submenu/,
  'marketing submenus must have a deterministic expanded state');
assert.match(css, /focus-visible/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /@media\(max-width:640px\)/);
assert.match(wrapper, /worker-release4\.js/);
assert.match(wrapper, /ui-consistency\.css/);
assert.match(wrapper, /ui-consistency\.js/);
assert.match(wrapper, /ui-consistency\.css\?v=14/);
assert.match(wrapper, /ui-consistency\.js\?v=14/);
assert.match(wrapper, /localStorage\.getItem\("recast_theme"\)/);
assert.match(wrapper, /recast-favicon-64\.png/);
assert.match(wrapper, /app\.js\?v=87/);
assert.match(wrapper, /release4Worker\.fetch/);
assert.match(wrangler, /"main": "src\/worker-ui\.js"/);
for (const route of ['/blog/*','/how-to/*','/demo/*','/tools/*','/automation/*','/use-cases/*','/contact.html','/index.html']) {
  assert.ok(wrangler.includes(`"${route}"`), `Worker UI wrapper must cover ${route}`);
}
const serviceWorker = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
assert.match(serviceWorker, /CACHE_VERSION = 'recast-v101'/);
assert.match(css, /:root:not\(\[data-theme="light"\]\)\{--bg:var\(--recast-bg\)/,
  'all page families must share the canonical dark background unless the user explicitly selects light mode');
assert.match(css, /--recast-header-max:1360px/);
assert.match(css, /\.uc-nav,\.recast-global-header\{display:flex!important\}/,
  'marketing, technical and generated shells must share left-grouped desktop navigation geometry');
assert.match(js, /normalizeThemeDefault/);
assert.match(js, /removeLiveExamplePanels/);
assert.match(js, /querySelectorAll\('\.hero-preview'\)/);
assert.match(css, /\.hero-preview\{display:none!important\}/,
  'live-example panels must be hidden before the shared script removes them from the DOM');
assert.match(js, /focusDedicatedToolPage/);
assert.match(js, /recast-dedicated-tool/);
assert.match(js, /dedicated-breadcrumb/);
assert.match(js, /dedicated-tool-label/);
assert.match(js, /dedicated-related/);
assert.match(js, /hero\.querySelector\('\.quick-start'\)\?\.remove\(\)/,
  'dedicated tool pages must remove the generic quick-start cards');
assert.match(js, /hero\.querySelector\('\.mode-nav'\)\?\.remove\(\)/,
  'dedicated tool pages must remove the generic mode chooser');
assert.match(css, /@media\(min-width:1101px\)\{\s*\.site-header\{display:flex!important\}/,
  'wide acquisition header must use a left-grouped flex layout rather than the legacy centred grid');
assert.match(css, /\.site-header nav,\.tb-nav,\.recast-global-nav,\.nav-group-btn,\.nav-plain-link,\.nav-dropdown-item\{text-align:left!important\}/,
  'all shared navigation headings and dropdown items must be left aligned');
assert.match(css, /\.titleblock \.tb-row>nav\.tb-nav\{flex:0 1 auto!important;margin-left:32px!important;margin-right:auto!important\}/,
  'desktop primary navigation must sit directly after the brand');
assert.match(css, /\.minimal-hero-copy h1 \.hero-accent,\.hero h1>span,\.section h2>span\{display:inline-block!important;padding-bottom:\.2em!important;margin-bottom:-\.2em!important\}/,
  'all gradient hero and section headings must reserve paint space for descenders such as g, p, q and y');
assert.match(serviceWorker, /assets\/brand\/recast-logo\.png/);

console.log('site-wide UI consistency tests passed');
