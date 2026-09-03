import assert from 'node:assert/strict';
import seoWorker from './worker-seo.js';

async function testExtensionlessToolCanonicalRedirect() {
  const request = new Request('https://tryrecast.app/tools/json-to-csv?utm_source=test', { redirect: 'manual' });
  const response = await seoWorker.fetch(request, {}, {});
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://tryrecast.app/tools/json-to-csv.html?utm_source=test');
}

async function testUnknownExtensionlessToolStillCanonicalises() {
  const request = new Request('https://tryrecast.app/tools/example-transform', { redirect: 'manual' });
  const response = await seoWorker.fetch(request, {}, {});
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://tryrecast.app/tools/example-transform.html');
}

await testExtensionlessToolCanonicalRedirect();
await testUnknownExtensionlessToolStillCanonicalises();

for (const [from, to] of [
  ['/index.html', '/'],
  ['/tools/index.html', '/tools/'],
  ['/api/index.html', '/api/'],
  ['/automation/index.html', '/automation/']
]) {
  const response = await seoWorker.fetch(new Request('https://tryrecast.app' + from + '?ref=test', { redirect:'manual' }), {}, {});
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://tryrecast.app' + to + '?ref=test');
}
console.log('worker-seo tests passed');
