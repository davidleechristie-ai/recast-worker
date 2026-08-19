/*!
 * Recast share links — gzip-compresses the current mode + input into the
 * URL fragment (#s=...), so a link can be pasted into a PR/Slack thread
 * without any server round-trip. Keeps the "nothing uploaded" promise.
 */
(function (root) {
  'use strict';

  function bufToBase64Url(buf) {
    let binary = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const b64 = root.btoa(binary);
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64UrlToBuf(b64url) {
    let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = root.atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  async function encodeState(stateObj) {
    const json = JSON.stringify(stateObj);
    const stream = new root.Blob([json]).stream().pipeThrough(new root.CompressionStream('gzip'));
    const buf = await new root.Response(stream).arrayBuffer();
    return bufToBase64Url(buf);
  }

  async function decodeState(b64url) {
    const buf = base64UrlToBuf(b64url);
    const stream = new root.Blob([buf]).stream().pipeThrough(new root.DecompressionStream('gzip'));
    const text = await new root.Response(stream).text();
    return JSON.parse(text);
  }

  async function buildShareUrl(baseUrl, stateObj) {
    const encoded = await encodeState(stateObj);
    const url = new root.URL(baseUrl);
    url.hash = 's=' + encoded;
    return url.toString();
  }

  async function readShareStateFromLocation(locationObj) {
    const hash = (locationObj.hash || '').replace(/^#/, '');
    const params = new root.URLSearchParams(hash);
    const s = params.get('s');
    if (!s) return null;
    try { return await decodeState(s); } catch (e) { return null; }
  }

  const api = {
    encodeState: encodeState,
    decodeState: decodeState,
    buildShareUrl: buildShareUrl,
    readShareStateFromLocation: readShareStateFromLocation
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastShare = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
