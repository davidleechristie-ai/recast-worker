import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.RECAST_VISUAL_BASE_URL || 'https://tryrecast.app';
const widths = [1920, 1440, 1280, 1024, 768, 430, 390];
const routes = ['/', '/demo/', '/tools/json-diff.html', '/app/#workflowBuilder', '/automation/', '/api/', '/#pricing', '/how-to/'];
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 1000 } });
  for (const route of routes) {
    const page = await context.newPage();
    const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response || !response.ok()) failures.push(`${width}px ${route}: HTTP ${response?.status() ?? 'no response'}`);
    await page.waitForTimeout(250);
    const result = await page.evaluate(() => {
      const visible = el => {
        const s = getComputedStyle(el); const r = el.getBoundingClientRect();
        return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 1 && r.height > 1;
      };
      const overlap = (a,b) => Math.min(a.right,b.right)-Math.max(a.left,b.left) > 2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top) > 2;
      const offenders = [];
      for (const el of document.querySelectorAll('main *, header *, nav *, section *')) {
        if (!visible(el) || el === document.documentElement || el === document.body) continue;
        const r = el.getBoundingClientRect();
        if (r.right > innerWidth + 3 || r.left < -3) offenders.push(`${el.tagName}.${el.className || ''}`.slice(0,120));
      }
      const header = document.querySelector('header, .site-header, .recast-global-header, .titleblock');
      const main = document.querySelector('main, .main, #app, .page-content');
      const navItems = [...document.querySelectorAll('header a, header button, .site-header a, .site-header button, .recast-global-header a, .recast-global-header button')].filter(visible);
      const siblingOverlaps = [];
      for (let i=0;i<navItems.length;i++) for (let j=i+1;j<navItems.length;j++) {
        if (navItems[i].parentElement === navItems[j].parentElement && overlap(navItems[i].getBoundingClientRect(), navItems[j].getBoundingClientRect())) siblingOverlaps.push(`${navItems[i].textContent?.trim()} <> ${navItems[j].textContent?.trim()}`);
      }
      const cssLoaded = [...document.styleSheets].some(s => (s.href || '').includes('ui-consistency.css'));
      const jsLoaded = [...document.scripts].some(s => (s.src || '').includes('ui-consistency.js'));
      const chevrons = [...document.querySelectorAll('.recast-nav-chevron')].filter(visible).length;
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
        offenders: offenders.slice(0,10),
        siblingOverlaps: siblingOverlaps.slice(0,10),
        cssLoaded, jsLoaded, chevrons,
        headerWidth: header?.getBoundingClientRect().width ?? null,
        mainWidth: main?.getBoundingClientRect().width ?? null
      };
    });
    if (result.scrollWidth > result.viewport + 3) failures.push(`${width}px ${route}: horizontal overflow ${result.scrollWidth}>${result.viewport}`);
    if (result.offenders.length) failures.push(`${width}px ${route}: visible elements outside viewport: ${result.offenders.join(', ')}`);
    if (result.siblingOverlaps.length) failures.push(`${width}px ${route}: overlapping header siblings: ${result.siblingOverlaps.join(', ')}`);
    if (!result.cssLoaded || !result.jsLoaded) failures.push(`${width}px ${route}: shared UI assets missing css=${result.cssLoaded} js=${result.jsLoaded}`);
    if (result.mainWidth !== null && result.mainWidth < Math.min(280, width * .55)) failures.push(`${width}px ${route}: unexpectedly narrow primary content ${Math.round(result.mainWidth)}px`);
    await page.close();
  }
  await context.close();
}
await browser.close();
assert.equal(failures.length, 0, `Rendered visual integrity failures:\n${failures.join('\n')}`);
console.log(`rendered visual integrity passed: ${routes.length} routes x ${widths.length} viewports`);
