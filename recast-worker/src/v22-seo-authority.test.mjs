import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const workerUi = await readFile(new URL('./worker-ui.js', import.meta.url), 'utf8');

assert(!sitemap.includes('https://tryrecast.app/seo/'), 'sitemap must not advertise removed /seo/ URLs');
assert(sitemap.includes('https://tryrecast.app/tools/compare-csv-files-by-id.html'), 'CSV-by-ID intent page must remain in sitemap');
assert(sitemap.includes('https://tryrecast.app/tools/api-response-to-csv.html'), 'API-response-to-CSV intent page must remain in sitemap');
assert(sitemap.includes('https://tryrecast.app/tools/compare-api-responses.html'), 'Compare API responses intent page must remain in sitemap');
assert(sitemap.includes('https://tryrecast.app/tools/'), 'tools hub canonical URL must remain in sitemap');
assert(!sitemap.includes('https://tryrecast.app/tools/index.html'), 'redirecting /tools/index.html must not be in sitemap');

assert(workerUi.includes("const TOOLS_HUB_URL = 'https://tryrecast.app/tools/'"), 'worker must define the preferred tools hub URL');
assert(workerUi.includes('link[rel="canonical"]'), 'worker must reconcile tools hub canonical');
assert(workerUi.includes('meta[property="og:url"]'), 'worker must reconcile tools hub Open Graph URL');

console.log('V22 SEO authority checks passed');
