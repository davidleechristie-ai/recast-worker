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
console.log('worker-seo tests passed');
