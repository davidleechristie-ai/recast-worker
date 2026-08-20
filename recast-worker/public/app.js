// =====================================================================
// STRIPE CONFIG — tryrecast.app
//
// SETUP CHECKLIST (do this in your Stripe Dashboard, not in this file):
//   1. Stripe Dashboard -> Product catalog -> Add product
//        "Recast Pro"  — £9.00/month recurring, and a second price £90.00/year
//        "Recast API"  — £29.00/month recurring, and a second price £290.00/year
//        "Recast Day Pass" — £2.99, ONE-TIME (not recurring) — a single price only
//   2. For each of the 5 prices: Product page -> Create payment link
//        Payment page settings -> After payment -> "Don't show confirmation page"
//        -> redirect to:
//        https://tryrecast.app/?upgraded=1&plan=pro_monthly&session_id={CHECKOUT_SESSION_ID}
//        (swap plan=pro_monthly for pro_yearly / api_monthly / api_yearly / day_pass on each link)
//   3. Copy each payment link's URL (looks like https://buy.stripe.com/xxxxx)
//      into STRIPE.links below.
//   4. Add the Day Pass price's ID (starts price_..., found on the Price's
//      own page in Stripe) to PRICE_MAP in the Worker's wrangler.jsonc,
//      mapped to "day_pass" — same as the other four prices.
//   5. Deploy the companion Cloudflare Worker (see /recast-worker in this
//      project) for REAL server-side subscription enforcement. Until that's
//      deployed, this still collects real payment correctly (every genuine
//      customer gets Pro) — it just can't yet detect a cancellation or
//      block someone from setting the unlock flag by hand in devtools.
//      Once the Worker is live, entitlement is checked against a real
//      Stripe subscription on every page load, and cancellations are
//      caught automatically. The Day Pass specifically ALWAYS needs the
//      Worker, since its 24-hour expiry is computed and enforced there —
//      without the Worker deployed, a Day Pass purchase falls back to
//      granting ordinary (non-expiring) Pro access instead, same as any
//      other plan would in that fallback path.
// =====================================================================
// =====================================================================
// ANALYTICS — thin wrapper around gtag() for product usage events.
//
// Page-level traffic (which tool page got visited, bounce, etc.) is
// already covered for free by each page's own GA4 pageview — every
// /tools/*.html has its own <title>/canonical and its own gtag config
// call, so GA4's own "Pages and screens" report already answers "which
// converter pages get visited." This layer is for the things GA4 can't
// infer from a URL alone: which conversion mode someone actually RAN
// (as opposed to just landing on the page), whether it succeeded, and
// revenue-funnel events (checkout started / completed) that live inside
// this single-page app rather than as separate URLs.
//
// Every event is best-effort: if gtag isn't loaded (ad blocker, GA not
// configured yet, etc.) this silently no-ops rather than breaking the
// tool.
function track(eventName, params) {
  try {
    if (typeof gtag === 'function') gtag('event', eventName, params || {});
  } catch (e) { /* analytics must never break the actual tool */ }
}

const STRIPE = {
  links: {
    pro_monthly: 'https://buy.stripe.com/6oU28jez7ayf8sRg5y4c800',
    pro_yearly:  'https://buy.stripe.com/14AcMX2Qp7m310paLe4c801',
    api_monthly: 'https://buy.stripe.com/14A00bfDb6hZdNbg5y4c803',
    api_yearly:  'https://buy.stripe.com/aFa00bcqZcGn7oNbPi4c804',
    day_pass:    'https://buy.stripe.com/eVq3cn2QpeOv7oN2eI4c802', // one-time, non-recurring — 24 hours of full Pro access, £2.99
  },
  // Fallback only — used if the Worker's dynamic /api/portal call fails or
  // the Worker isn't deployed yet. Settings -> Billing -> Customer portal.
  customerPortalUrl: 'https://billing.stripe.com/REPLACE_CUSTOMER_PORTAL',
};

function isLinkConfigured(url) { return !!url && !url.includes('REPLACE'); }

// Same-origin: works automatically once this site is served by the Worker
// (see /recast-worker). If the Worker isn't deployed, these calls simply
// fail and every code path below falls back gracefully.
const API_BASE = '';

let accountState = { entitled: false, plan: null, status: null, token: null, expiresAt: null };
try {
  accountState.token = localStorage.getItem('recast_access_token') || null;
  const cached = JSON.parse(localStorage.getItem('recast_account_cache') || 'null');
  if (cached) Object.assign(accountState, cached);
} catch (e) { /* corrupt/blocked storage — proceed with defaults */ }

function saveAccountCache() {
  try {
    localStorage.setItem('recast_account_cache', JSON.stringify({ entitled: accountState.entitled, plan: accountState.plan, status: accountState.status, expiresAt: accountState.expiresAt }));
    if (accountState.token) localStorage.setItem('recast_access_token', accountState.token);
  } catch (e) { /* storage unavailable — entitlement just won't persist across reloads */ }
}

const isPro = () => accountState.entitled === true;

/** Calls the Worker to confirm a just-completed Stripe Checkout session and issue a real access token. Returns true on success. */
async function verifySessionWithBackend(sessionId) {
  try {
    const res = await fetch(API_BASE + '/api/verify-session?session_id=' + encodeURIComponent(sessionId));
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.token) return false;
    accountState.token = data.token;
    accountState.plan = data.plan;
    accountState.status = data.status;
    accountState.expiresAt = data.expiresAt || null;
    accountState.entitled = !!data.entitled;
    saveAccountCache();
    return true;
  } catch (e) {
    return false; // Worker not deployed / offline — caller falls back
  }
}

/** Re-checks current entitlement against the backend. This is the call that actually catches a cancellation — nothing is trusted forever. Also what catches a day pass running out. */
async function refreshEntitlement() {
  if (!accountState.token) return;
  try {
    const res = await fetch(API_BASE + '/api/verify-token?token=' + encodeURIComponent(accountState.token));
    if (!res.ok) return; // transient failure — keep last cached state
    const data = await res.json();
    accountState.entitled = !!data.entitled;
    accountState.plan = data.plan;
    accountState.status = data.status;
    accountState.expiresAt = data.expiresAt || null;
    saveAccountCache();
    updateAccountUI();
  } catch (e) { /* offline / Worker not deployed — keep last cached state */ }
}

function startCheckout(planKey) {
  const url = STRIPE.links[planKey];
  if (!isLinkConfigured(url)) {
    alert(
      'Stripe is not connected yet for this plan.\n\n' +
      '1. Create the product + price in your Stripe Dashboard\n' +
      '2. Create a Payment Link for it\n' +
      '3. Set its "after payment" redirect to:\n' +
      '   https://tryrecast.app/?upgraded=1&plan=' + planKey + '&session_id={CHECKOUT_SESSION_ID}\n' +
      '4. Paste the payment link URL into STRIPE.links.' + planKey + ' in app.js'
    );
    return;
  }
  track('checkout_start', { plan: planKey, from_mode: currentMode });
  window.location.href = url;
}
['btnProMonthly','btnProYearly','btnApiMonthly','btnApiYearly'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', (e) => { e.preventDefault(); startCheckout(el.dataset.plan); });
});

// Handle the return trip from Stripe Checkout. Always clean the URL
// immediately; verification (real, via the Worker, or a trusting fallback
// if the Worker isn't deployed) happens async and updates the UI when done.
const returnParams = new URLSearchParams(location.search);
if (returnParams.get('upgraded') === '1') {
  const sessionId = returnParams.get('session_id') || '';
  const fallbackPlan = returnParams.get('plan') || 'pro';
  history.replaceState({}, '', location.pathname);
  track('checkout_complete', { plan: fallbackPlan, verified: !!sessionId });

  const applyFallback = () => {
    // No backend reachable — trust the redirect, same as before the Worker
    // existed. Real customers still get Pro; it just isn't server-verified
    // until the Worker is deployed.
    accountState.entitled = true;
    accountState.plan = fallbackPlan;
    accountState.status = 'active';
    saveAccountCache();
    updateAccountUI();
  };

  if (sessionId) {
    verifySessionWithBackend(sessionId).then(ok => { if (!ok) applyFallback(); else updateAccountUI(); });
  } else {
    applyFallback();
  }
} else if (accountState.token) {
  // Returning visit with a previously-issued token: re-check in the
  // background so a cancellation since the last visit gets caught.
  refreshEntitlement();
}

async function openManageSubscription(e) {
  if (e) e.preventDefault();
  if (accountState.token) {
    try {
      const res = await fetch(API_BASE + '/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accountState.token }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) { window.location.href = data.url; return; }
      }
    } catch (err) { /* fall through to static portal link below */ }
  }
  if (isLinkConfigured(STRIPE.customerPortalUrl)) window.location.href = STRIPE.customerPortalUrl;
  else alert('Subscription management isn\'t connected yet \u2014 email support to cancel or change your plan.');
}

function formatTimeRemaining(expiresAt) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'expired';
  const totalMins = Math.floor(ms / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
}

function updateApiKeyDisplay() {
  const box = document.getElementById('apiKeyBox');
  const cta = document.getElementById('apiActionsCTA');
  if (!box || !cta) return;
  const onApiPlan = isPro() && (accountState.plan === 'api_monthly' || accountState.plan === 'api_yearly') && accountState.token;
  if (onApiPlan) {
    document.getElementById('apiKeyValue').textContent = accountState.token;
    box.style.display = 'flex';
    cta.style.display = 'none';
  } else {
    box.style.display = 'none';
    cta.style.display = '';
  }
}
document.getElementById('apiKeyCopyBtn')?.addEventListener('click', () => {
  if (!accountState.token) return;
  navigator.clipboard?.writeText(accountState.token);
  const btn = document.getElementById('apiKeyCopyBtn');
  const original = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => { btn.textContent = original; }, 1500);
});

function updateAccountUI() {
  updateApiKeyDisplay();
  const upgradeBtn = document.getElementById('accountBtn');
  if (!upgradeBtn) return;
  if (isPro() && accountState.plan === 'day_pass' && accountState.expiresAt) {
    // A day pass isn't a real Stripe subscription — nothing to "manage,"
    // it just runs out. Show a countdown instead of a portal link.
    upgradeBtn.textContent = 'Pro pass \u00b7 ' + formatTimeRemaining(accountState.expiresAt);
    upgradeBtn.href = '#pricing';
    upgradeBtn.onclick = null;
  } else if (isPro()) {
    upgradeBtn.textContent = 'Manage subscription';
    upgradeBtn.href = '#';
    upgradeBtn.onclick = openManageSubscription;
  } else {
    upgradeBtn.textContent = 'Upgrade to Pro';
    upgradeBtn.href = '#pricing';
    upgradeBtn.onclick = null;
  }
}
updateAccountUI();

// ---------------- Thin aliases onto the shared, tested engine ----------------
const E = RecastEngine;
const flattenObj = E.flattenObj;
const unflattenObj = E.unflattenObj;

function getDelim() {
  const sel = document.getElementById('csvDelimiter');
  if (!sel) return ',';
  const v = sel.value;
  return v === '\\t' ? '\t' : v;
}
function getInferTypes() {
  const el = document.getElementById('inferTypes');
  return el ? el.checked : true;
}

// ---------- Friendly JSON error helper ----------
function friendlyJsonError(raw, text) {
  const msg = String(raw || '');
  let pos = null;
  const posMatch = msg.match(/position\s+(\d+)/i) || msg.match(/at position (\d+)/i);
  if (posMatch) pos = parseInt(posMatch[1], 10);

  const trimmed = text.trim();
  if (!trimmed) return 'Input is empty. Paste a JSON value (object, array, string, number, boolean, or null).';
  if (/^[\{\[]/.test(trimmed) && /,\s*[\}\]]/.test(trimmed)) {
    return 'Trailing comma detected. JSON does not allow a comma after the last item in an object or array.\n\nExample fix:\n  { "a": 1, "b": 2 }   \u2713\n  { "a": 1, "b": 2, }  \u2715';
  }
  if (/'/.test(trimmed) && !/"/.test(trimmed.replace(/\\'/g, ''))) {
    return 'Single quotes are not valid in JSON. Use double quotes for strings and property names.\n\nExample:\n  { "name": "Ada" }  \u2713\n  { \'name\': \'Ada\' }  \u2715';
  }
  if (/^\s*\{[^"]*[a-zA-Z_][a-zA-Z0-9_]*\s*:/.test(trimmed)) {
    return 'Property names must be double-quoted in JSON.\n\nExample:\n  { "name": "Ada" }  \u2713\n  { name: "Ada" }    \u2715';
  }
  if (/undefined/.test(trimmed)) return 'JSON does not support `undefined`. Use `null` instead, or omit the property.';
  if (/\bNaN\b|\bInfinity\b/.test(trimmed)) return 'JSON does not support NaN or Infinity. Use `null` or a string instead.';
  if (/\/\/|\/\*|\*\//.test(trimmed)) return 'Comments are not allowed in standard JSON. Remove // or /* */ comments.';

  let location = '';
  if (pos != null && pos >= 0 && pos <= text.length) {
    const upto = text.slice(0, pos);
    const line = upto.split('\n').length;
    const col = upto.length - upto.lastIndexOf('\n');
    const lineText = text.split('\n')[line - 1] || '';
    const marker = ' '.repeat(Math.max(0, col - 1)) + '^';
    location = `\n\nAt line ${line}, column ${col}:\n  ${lineText}\n  ${marker}`;
  }
  return (msg.replace(/^JSON\.parse:\s*/i, '').replace(/^Unexpected token.*$/i, m => m) || 'Syntax error') + location;
}

function countJsonStats(obj, depth = 0) {
  const stats = { depth: depth, objects: 0, arrays: 0, nulls: 0, strings: 0, numbers: 0, bools: 0 };
  function walk(v, d) {
    stats.depth = Math.max(stats.depth, d);
    if (v === null) { stats.nulls++; return; }
    const t = typeof v;
    if (t === 'string') stats.strings++;
    else if (t === 'number') stats.numbers++;
    else if (t === 'boolean') stats.bools++;
    else if (Array.isArray(v)) { stats.arrays++; v.forEach(x => walk(x, d + 1)); }
    else if (t === 'object') { stats.objects++; Object.values(v).forEach(x => walk(x, d + 1)); }
  }
  walk(obj, depth);
  return stats;
}

function validateJson(text) {
  if (text == null || !String(text).trim()) throw new Error('Input is empty. Paste JSON to validate.');
  let obj;
  try { obj = JSON.parse(text); }
  catch (e) { throw new Error('Invalid JSON\n\n' + friendlyJsonError(e.message, text)); }
  try { JSON.stringify(obj); }
  catch (e) { throw new Error('Invalid JSON — value cannot be serialized (' + e.message + '). Circular references are not allowed.'); }

  const stats = countJsonStats(obj);
  const type = obj === null ? 'null'
    : Array.isArray(obj) ? `array (${obj.length} item${obj.length === 1 ? '' : 's'})`
    : typeof obj === 'object' ? `object (${Object.keys(obj).length} key${Object.keys(obj).length === 1 ? '' : 's'})`
    : typeof obj;

  const lines = [
    '\u2713 Valid JSON', '',
    'Type:     ' + type,
    'Size:     ' + new Blob([text]).size + ' bytes',
    'Depth:    ' + stats.depth,
    'Objects:  ' + stats.objects,
    'Arrays:   ' + stats.arrays,
    'Strings:  ' + stats.strings,
    'Numbers:  ' + stats.numbers,
    'Booleans: ' + stats.bools,
    'Nulls:    ' + stats.nulls,
  ];
  if (typeof obj !== 'object' || obj === null) {
    lines.push('', 'Note: root value is a ' + (obj === null ? 'null' : typeof obj) + ', not an object or array. That is valid JSON.');
  }
  return lines.join('\n');
}

function validateXml(text) {
  if (text == null || !String(text).trim()) throw new Error('Input is empty. Paste XML to validate.');
  const trimmed = text.trim();
  if (!trimmed.startsWith('<')) throw new Error('Invalid XML\n\nInput does not look like XML (expected content starting with "<").');

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const err = doc.querySelector('parsererror');
  if (err) {
    const raw = err.textContent.replace(/\s+/g, ' ').trim();
    let hint = raw.slice(0, 240);
    if (/not well-formed|unclosed|mismatched/i.test(raw)) hint += '\n\nTip: Check that every opening tag has a matching closing tag, and that attributes use quotes.';
    if (/entity/i.test(raw)) hint += '\n\nTip: Escape special characters as &amp; &lt; &gt; &quot; &apos;';
    throw new Error('Invalid XML\n\n' + hint);
  }
  const root = doc.documentElement;
  if (!root) throw new Error('Invalid XML\n\nNo root element found.');

  let elements = 0, attributes = 0, textNodes = 0;
  function walk(node) {
    if (node.nodeType === 1) { elements++; attributes += node.attributes?.length || 0; Array.from(node.childNodes).forEach(walk); }
    else if (node.nodeType === 3 && node.textContent.trim()) textNodes++;
  }
  walk(root);

  return [
    '\u2713 Valid XML', '',
    'Root:       <' + root.tagName + '>',
    'Elements:   ' + elements,
    'Attributes: ' + attributes,
    'Text nodes: ' + textNodes,
    'Size:       ' + new Blob([text]).size + ' bytes',
  ].join('\n');
}

function formatJson(text, pretty = true) { return JSON.stringify(JSON.parse(text), null, pretty ? 2 : 0); }
function formatXml(text, pretty = true) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid XML');
  if (!pretty) return new XMLSerializer().serializeToString(doc).replace(/>\s+</g, '><');
  let xml = new XMLSerializer().serializeToString(doc);
  let formatted = '', indent = 0;
  xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3').split('\n').forEach(line => {
    if (line.match(/^<\/\w/)) indent = Math.max(0, indent - 1);
    formatted += '  '.repeat(indent) + line.trim() + '\n';
    if (line.match(/^<\w[^>]*[^\/]>.*$/)) indent++;
  });
  return formatted.trim();
}

function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === 'object') return Object.keys(obj).sort().reduce((acc, k) => { acc[k] = sortKeys(obj[k]); return acc; }, {});
  return obj;
}

function jsonPathQuery(obj, path) {
  path = path.trim();
  if (!path) throw new Error('Enter a JSONPath expression');
  if (path.startsWith('$.')) path = path.slice(2);
  else if (path.startsWith('$')) path = path.slice(1);
  if (path.startsWith('.')) path = path.slice(1);
  const parts = [];
  path.replace(/([^.\[\]]+)|\[(\d+)\]|\[\*\]/g, (_, key, idx) => {
    if (key !== undefined) parts.push(key);
    else if (idx !== undefined) parts.push(Number(idx));
    else parts.push('*');
  });
  let current = [obj];
  for (const part of parts) {
    const next = [];
    for (const node of current) {
      if (part === '*') {
        if (Array.isArray(node)) node.forEach(v => next.push(v));
        else if (node && typeof node === 'object') Object.values(node).forEach(v => next.push(v));
      } else if (node != null && typeof node === 'object') {
        next.push(node[part]);
      }
    }
    current = next.filter(v => v !== undefined);
  }
  return current.length === 1 ? current[0] : current;
}

// ---------------- Diff rendering ----------------
function escHtml(s) { return RecastHighlight.escapeHtml(s === undefined ? '(missing)' : String(s)); }

function renderTreeDiff(changes) {
  const added = changes.filter(c => c.type === 'added').length;
  const removed = changes.filter(c => c.type === 'removed').length;
  const changed = changes.filter(c => c.type === 'changed').length;
  const summaryEl = document.getElementById('diffSummary');
  summaryEl.innerHTML = changes.length === 0
    ? '<span>No differences \u2014 documents are equal \u2713</span>'
    : `<span class="added">${added} <b>added</b></span><span class="removed">${removed} <b>removed</b></span><span class="changed">${changed} <b>changed</b></span>`;

  const rowsEl = document.getElementById('diffRows');
  if (changes.length === 0) { rowsEl.innerHTML = '<div class="diff-empty">No differences found.</div>'; return; }
  rowsEl.innerHTML = changes.map(c => {
    if (c.type === 'added') return `<div class="diff-row added"><span class="badge">add</span><span class="path">${escHtml(c.path)}</span><span class="vals"><span class="new">${escHtml(JSON.stringify(c.newVal))}</span></span></div>`;
    if (c.type === 'removed') return `<div class="diff-row removed"><span class="badge">del</span><span class="path">${escHtml(c.path)}</span><span class="vals"><span class="old">${escHtml(JSON.stringify(c.oldVal))}</span></span></div>`;
    return `<div class="diff-row changed"><span class="badge">chg</span><span class="path">${escHtml(c.path)}</span><span class="vals"><span class="old">${escHtml(JSON.stringify(c.oldVal))}</span> \u2192 <span class="new">${escHtml(JSON.stringify(c.newVal))}</span></span></div>`;
  }).join('');
}

function renderCompareTable() {
  const cd = lastCsvDiffResult;
  if (!cd) return;
  const summaryEl = document.getElementById('compareSummary');
  const unchangedCount = cd.rows.length - cd.added.length - cd.removed.length - cd.changed.length;
  summaryEl.innerHTML = `<span class="added">${cd.added.length} <b>added</b></span><span class="removed">${cd.removed.length} <b>removed</b></span><span class="changed">${cd.changed.length} <b>changed</b></span><span>${unchangedCount} unchanged \u00b7 matched by <b>${escHtml(cd.keyColumn)}</b></span>`;

  document.getElementById('cntAll').textContent = cd.rows.length;
  document.getElementById('cntAdded').textContent = cd.added.length;
  document.getElementById('cntRemoved').textContent = cd.removed.length;
  document.getElementById('cntChanged').textContent = cd.changed.length;
  document.getElementById('cntUnchanged').textContent = unchangedCount;

  document.querySelectorAll('.compare-filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === compareFilterStatus));

  const searchText = document.getElementById('compareSearch').value;
  document.getElementById('compareTableWrap').innerHTML = RecastCompare.buildTableHtml(cd, { statusFilter: compareFilterStatus, searchText });
  currentDiffNavIndex = -1;
  updateDiffNavPosition();
}

document.querySelectorAll('.compare-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    compareFilterStatus = btn.dataset.filter;
    renderCompareTable();
  });
});
document.getElementById('compareSearch')?.addEventListener('input', () => renderCompareTable());
document.getElementById('compareIgnoreWs')?.addEventListener('change', () => { if (currentMode === 'diffCsv') runCurrentMode(); });

// ---------------- Next/previous difference navigation ----------------
// The one interaction Beyond Compare is built around: jump straight to the
// next thing that changed, without scanning the whole table by eye. Works
// against whatever's currently visible (respects the active filter/search),
// so "Next diff" inside "Changed only" jumps only through changed rows.
let currentDiffNavIndex = -1;

function getVisibleDiffRows() {
  return Array.from(document.querySelectorAll('#compareTableWrap tr[data-status]'))
    .filter(tr => tr.dataset.status !== 'unchanged');
}

function updateDiffNavPosition() {
  const posEl = document.getElementById('compareDiffPos');
  if (!posEl) return;
  const total = getVisibleDiffRows().length;
  posEl.textContent = total ? `${currentDiffNavIndex + 1 > 0 ? currentDiffNavIndex + 1 : '–'} / ${total}` : '0 / 0';
}

function jumpToDiff(direction) {
  const rows = getVisibleDiffRows();
  if (!rows.length) return;
  currentDiffNavIndex = direction === 'next'
    ? Math.min(currentDiffNavIndex + 1, rows.length - 1)
    : Math.max(currentDiffNavIndex - 1, 0);
  const target = rows[currentDiffNavIndex];
  target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  target.classList.remove('diff-row-flash');
  void target.offsetWidth; // restart the CSS animation if the same row is jumped to twice in a row
  target.classList.add('diff-row-flash');
  updateDiffNavPosition();
}
document.getElementById('compareDiffNext')?.addEventListener('click', () => jumpToDiff('next'));
document.getElementById('compareDiffPrev')?.addEventListener('click', () => jumpToDiff('prev'));
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('comparePanel')?.classList.contains('show')) return;
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
  if (e.key === 'n' || e.key === 'N') jumpToDiff('next');
  if (e.key === 'p' || e.key === 'P') jumpToDiff('prev');
});

function triggerDownload(text, filename, mime) {
  const blob = new Blob([text], { type: mime + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
document.getElementById('compareDownloadCsv')?.addEventListener('click', () => {
  if (!lastCsvDiffResult) return;
  triggerDownload(RecastCompare.toReportCsv(lastCsvDiffResult), 'recast-compare-report.csv', 'text/csv');
});
document.getElementById('compareDownloadHtml')?.addEventListener('click', () => {
  if (!lastCsvDiffResult) return;
  triggerDownload(RecastCompare.toReportHtml(lastCsvDiffResult, { title: 'Recast CSV Comparison Report' }), 'recast-compare-report.html', 'text/html');
});

function flatTextFromChanges(changes) {
  if (!changes.length) return '\u2713 No differences \u2014 documents are equal';
  return changes.map(c => {
    if (c.type === 'added') return `+ ADD ${c.path} = ${JSON.stringify(c.newVal)}`;
    if (c.type === 'removed') return `- DEL ${c.path} (was ${JSON.stringify(c.oldVal)})`;
    return `~ CHG ${c.path}: ${JSON.stringify(c.oldVal)} -> ${JSON.stringify(c.newVal)}`;
  }).join('\n');
}
function flatTextFromCsvDiff(cd) {
  const lines = [`Key column: ${cd.keyColumn}`, `${cd.added.length} added, ${cd.removed.length} removed, ${cd.changed.length} changed`];
  cd.added.forEach(r => lines.push('+ ADD ' + JSON.stringify(r)));
  cd.removed.forEach(r => lines.push('- DEL ' + JSON.stringify(r)));
  cd.changed.forEach(c => c.cellChanges.forEach(cc => lines.push(`~ CHG [${cd.keyColumn}=${c.key}].${cc.col}: ${JSON.stringify(cc.from)} -> ${JSON.stringify(cc.to)}`)));
  return lines.join('\n');
}

function formatSchemaValidationReport(result) {
  if (result.valid) return '\u2713 Valid \u2014 data matches the schema';
  const lines = [`\u2715 Invalid \u2014 ${result.errors.length} violation${result.errors.length===1?'':'s'} found`, ''];
  result.errors.forEach(e => lines.push(`  ${e.path || '(root)'}: ${e.message}`));
  return lines.join('\n');
}

// ---------------- Mode config ----------------
function getLimitBytes() { return isPro() ? 25 * 1024 * 1024 : 3 * 1024 * 1024; }
const CSV_COMPARE_FREE_ROW_LIMIT = 50; // free tier: CSV compare capped at this many data rows per file; unlimited on Pro

const modeConfig = {
  json2csv:  { inFmt:'JSON', outFmt:'CSV', dual:false, path:false, showDelim:true, showBom:true, showPretty:false, showInfer:false, btn:'Convert', hl:'json', hlOut:'csv',
    task: () => ({ task:'convert', payload:{ op:'json2csv', text: inputEl.value, options:{ delimiter:getDelim(), excelBom: document.getElementById('excelBom')?.checked } } }) },
  csv2json:  { inFmt:'CSV', outFmt:'JSON', dual:false, path:false, showDelim:true, showBom:false, showPretty:true, showInfer:true, btn:'Convert', hl:'csv', hlOut:'json',
    task: () => ({ task:'convert', payload:{ op:'csv2json', text: inputEl.value, options:{ delimiter:getDelim(), inferTypes:getInferTypes(), pretty: document.getElementById('prettyPrint')?.checked } } }) },
  json2xml:  { inFmt:'JSON', outFmt:'XML', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Convert', hl:'json', hlOut:'xml',
    task: () => ({ task:'convert', payload:{ op:'json2xml', text: inputEl.value } }) },
  xml2json:  { inFmt:'XML', outFmt:'JSON', dual:false, path:false, showDelim:false, showBom:false, showPretty:true, showInfer:false, btn:'Convert', hl:'xml', hlOut:'json',
    task: () => ({ task:'convert', payload:{ op:'xml2json', text: inputEl.value, options:{ pretty: document.getElementById('prettyPrint')?.checked } } }) },
  json2yaml: { inFmt:'JSON', outFmt:'YAML', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Convert', hl:'json', hlOut:'plain',
    task: () => ({ task:'convert', payload:{ op:'json2yaml', text: inputEl.value } }) },
  yaml2json: { inFmt:'YAML', outFmt:'JSON', dual:false, path:false, showDelim:false, showBom:false, showPretty:true, showInfer:false, btn:'Convert', hl:'plain', hlOut:'json',
    task: () => ({ task:'convert', payload:{ op:'yaml2json', text: inputEl.value, options:{ pretty: document.getElementById('prettyPrint')?.checked } } }) },
  json2markdown: { inFmt:'JSON', outFmt:'Markdown table', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Convert', hl:'json', hlOut:'plain',
    task: () => ({ task:'convert', payload:{ op:'json2markdown', text: inputEl.value } }) },
  markdown2json: { inFmt:'Markdown table', outFmt:'JSON', dual:false, path:false, showDelim:false, showBom:false, showPretty:true, showInfer:true, btn:'Convert', hl:'plain', hlOut:'json',
    task: () => ({ task:'convert', payload:{ op:'markdown2json', text: inputEl.value, options:{ inferTypes:getInferTypes(), pretty: document.getElementById('prettyPrint')?.checked } } }) },
  flatten:   { inFmt:'JSON', outFmt:'JSON (flat)', dual:false, path:false, showDelim:false, showBom:false, showPretty:true, showInfer:false, btn:'Flatten', hl:'json', hlOut:'json',
    task: () => ({ task:'convert', payload:{ op:'flatten', text: inputEl.value, options:{ pretty: document.getElementById('prettyPrint')?.checked } } }) },
  unflatten: { inFmt:'JSON (flat)', outFmt:'JSON', dual:false, path:false, showDelim:false, showBom:false, showPretty:true, showInfer:false, btn:'Unflatten', hl:'json', hlOut:'json',
    task: () => ({ task:'convert', payload:{ op:'unflatten', text: inputEl.value, options:{ pretty: document.getElementById('prettyPrint')?.checked } } }) },
  validateJson: { inFmt:'JSON', outFmt:'Report', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Validate', hl:'json', hlOut:'plain',
    sync: t => validateJson(t) },
  validateXml: { inFmt:'XML', outFmt:'Report', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Validate', hl:'xml', hlOut:'plain',
    sync: t => validateXml(t) },
  formatJson: { inFmt:'JSON', outFmt:'JSON', dual:false, path:false, showDelim:false, showBom:false, showPretty:true, showInfer:false, btn:'Format', hl:'json', hlOut:'json',
    sync: t => formatJson(t, document.getElementById('prettyPrint')?.checked !== false) },
  formatXml: { inFmt:'XML', outFmt:'XML', dual:false, path:false, showDelim:false, showBom:false, showPretty:true, showInfer:false, btn:'Format', hl:'xml', hlOut:'xml',
    sync: t => formatXml(t, document.getElementById('prettyPrint')?.checked !== false) },
  sortJson: { inFmt:'JSON', outFmt:'JSON', dual:false, path:false, showDelim:false, showBom:false, showPretty:true, showInfer:false, btn:'Sort keys', hl:'json', hlOut:'json',
    sync: t => JSON.stringify(sortKeys(JSON.parse(t)), null, document.getElementById('prettyPrint')?.checked ? 2 : 0) },
  diffJson: { inFmt:'JSON A / B', outFmt:'Diff', dual:true, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Compare', hl:'json', hlOut:'plain', isDiff:true, diffKind:'tree',
    task: () => ({ task:'diff', payload:{ op:'diffJson', textA: document.getElementById('inputA').value, textB: document.getElementById('inputB').value } }) },
  diffXml: { inFmt:'XML A / B', outFmt:'Diff', dual:true, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Compare', hl:'xml', hlOut:'plain', isDiff:true, diffKind:'tree',
    task: () => ({ task:'diff', payload:{ op:'diffXml', textA: document.getElementById('inputA').value, textB: document.getElementById('inputB').value } }) },
  diffCsv: { inFmt:'CSV A / B', outFmt:'Diff', dual:true, path:false, showDelim:true, showBom:false, showPretty:false, showInfer:false, btn:'Compare', hl:'csv', hlOut:'plain', isDiff:true, diffKind:'csv',
    task: () => ({ task:'diff', payload:{ op:'diffCsv', textA: document.getElementById('inputA').value, textB: document.getElementById('inputB').value, options:{ delimiter:getDelim(), ignoreWhitespace: document.getElementById('compareIgnoreWs')?.checked } } }) },
  jsonPath: { inFmt:'JSON', outFmt:'Result', dual:false, path:true, showDelim:false, showBom:false, showPretty:true, showInfer:false, btn:'Query', hl:'json', hlOut:'json',
    sync: t => JSON.stringify(jsonPathQuery(JSON.parse(t), document.getElementById('jsonPathInput').value), null, document.getElementById('prettyPrint')?.checked ? 2 : 0) },
  jsonSchema: { inFmt:'JSON (sample)', outFmt:'JSON Schema', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Generate schema', hl:'json', hlOut:'json', batchSupported:true, outExt:'json',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ title: '' } } }) },
  jsonStructure: { inFmt:'JSON', outFmt:'Structure summary', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Summarize structure', hl:'json', hlOut:'plain', batchSupported:true, outExt:'txt',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ render:'structure' } } }) },
  json2ts: { inFmt:'JSON (sample)', outFmt:'TypeScript', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, showRootName:true, btn:'Generate types', hl:'json', hlOut:'plain', batchSupported:true, outExt:'ts',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ render:'typescript', rootName: document.getElementById('schemaRootName')?.value || 'Root' } } }) },
  json2zod: { inFmt:'JSON (sample)', outFmt:'Zod schema', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, showRootName:true, btn:'Generate Zod schema', hl:'json', hlOut:'plain', batchSupported:true, outExt:'ts',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ render:'zod', rootName: document.getElementById('schemaRootName')?.value || 'Root' } } }) },
  json2python: { inFmt:'JSON (sample)', outFmt:'Python dataclasses', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, showRootName:true, btn:'Generate dataclasses', hl:'json', hlOut:'plain', batchSupported:true, outExt:'py',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ render:'python', rootName: document.getElementById('schemaRootName')?.value || 'Root' } } }) },
  json2pydantic: { inFmt:'JSON (sample)', outFmt:'Pydantic model', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, showRootName:true, btn:'Generate Pydantic model', hl:'json', hlOut:'plain', batchSupported:true, outExt:'py',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ render:'pydantic', rootName: document.getElementById('schemaRootName')?.value || 'Root' } } }) },
  json2go: { inFmt:'JSON (sample)', outFmt:'Go structs', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, showRootName:true, btn:'Generate Go structs', hl:'json', hlOut:'plain', batchSupported:true, outExt:'go',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ render:'go', rootName: document.getElementById('schemaRootName')?.value || 'Root' } } }) },
  json2kotlin: { inFmt:'JSON (sample)', outFmt:'Kotlin data classes', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, showRootName:true, btn:'Generate Kotlin classes', hl:'json', hlOut:'plain', batchSupported:true, outExt:'kt',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ render:'kotlin', rootName: document.getElementById('schemaRootName')?.value || 'Root' } } }) },
  json2rust: { inFmt:'JSON (sample)', outFmt:'Rust structs', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, showRootName:true, btn:'Generate Rust structs', hl:'json', hlOut:'plain', batchSupported:true, outExt:'rs',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ render:'rust', rootName: document.getElementById('schemaRootName')?.value || 'Root' } } }) },
  jsonMock: { inFmt:'JSON (sample)', outFmt:'Mock data', dual:false, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, showMockCount:true, btn:'Generate mock data', hl:'json', hlOut:'json', batchSupported:true, outExt:'json',
    task: () => ({ task:'schema', payload:{ text: inputEl.value, options:{ render:'mock', count: parseInt(document.getElementById('mockCount')?.value, 10) || 3 } } }) },
  validateSchema: { inFmt:'Schema / Data', outFmt:'Validation report', dual:true, path:false, showDelim:false, showBom:false, showPretty:false, showInfer:false, btn:'Validate against schema', hl:'json', hlOut:'plain', isSchemaCheck:true,
    dualLabels: ['Paste the JSON Schema here\u2026', 'Paste the data to validate here\u2026'],
    task: () => ({ task:'validateSchema', payload:{ schemaText: document.getElementById('inputA').value, dataText: document.getElementById('inputB').value } }) },
};

const samples = {
  json2csv: JSON.stringify([
    { id: 1, name: "Ada Lovelace", role: "Engineer", address: { city: "London", country: "UK" } },
    { id: 2, name: "Grace Hopper", role: "Engineer", address: { city: "New York", country: "US" } }
  ], null, 2),
  csv2json: `id,name,score,active,address.city\n1,Ada Lovelace,98.5,true,London\n2,Grace Hopper,100,true,New York`,
  json2xml: JSON.stringify({ id: 1, name: "Ada Lovelace", tags: ["math","computing"] }, null, 2),
  xml2json: `<root>\n  <id>1</id>\n  <name>Ada Lovelace</name>\n  <tags>math</tags>\n  <tags>computing</tags>\n</root>`,
  json2yaml: JSON.stringify({ id: 1, name: "Ada Lovelace", tags: ["math","computing"], address: { city: "London", country: "UK" } }, null, 2),
  yaml2json: `id: 1\nname: Ada Lovelace\ntags:\n  - math\n  - computing\naddress:\n  city: London\n  country: UK`,
  json2markdown: JSON.stringify([
    { id: 1, name: "Ada Lovelace", role: "Engineer" },
    { id: 2, name: "Grace Hopper", role: "Engineer" }
  ], null, 2),
  markdown2json: `| id | name | role |\n| --- | --- | --- |\n| 1 | Ada Lovelace | Engineer |\n| 2 | Grace Hopper | Engineer |`,
  flatten: JSON.stringify({ user: { name: "Ada", tags: ["dev","math"], addr: { city: "London" } } }, null, 2),
  unflatten: JSON.stringify({ "user.name": "Ada", "user.tags[0]": "dev", "user.tags[1]": "math", "user.addr.city": "London" }, null, 2),
  validateJson: JSON.stringify({ id: 1, name: "Ada", active: true }, null, 2),
  validateXml: `<root>\n  <id>1</id>\n  <name>Ada</name>\n</root>`,
  formatJson: `{"id":1,"name":"Ada","tags":["math","computing"],"address":{"city":"London"}}`,
  formatXml: `<root><id>1</id><name>Ada</name><tags>math</tags><tags>computing</tags></root>`,
  sortJson: JSON.stringify({ z: 1, a: { c: 3, b: 2 }, m: [3,1,2] }, null, 2),
  jsonPath: JSON.stringify({ users: [{ name: "Ada", role: "Engineer" }, { name: "Grace", role: "Admiral" }], meta: { count: 2 } }, null, 2),
  jsonSchema: JSON.stringify({ id: 1, name: "Ada Lovelace", active: true, tags: ["math","computing"], address: { city: "London", zip: null } }, null, 2),
  jsonStructure: JSON.stringify([
    { id: 1, name: "Ada Lovelace", role: "Engineer", address: { city: "London", country: "UK" }, tags: ["math","computing"] },
    { id: 2, name: "Grace Hopper", role: "Admiral", address: { city: "New York", country: "US" }, tags: ["navy"], nickname: "Amazing Grace" }
  ], null, 2),
  json2ts: JSON.stringify({ id: 1, name: "Ada Lovelace", active: true, tags: ["math","computing"], address: { city: "London", zip: null } }, null, 2),
  json2kotlin: JSON.stringify({ id: 1, name: "Ada Lovelace", active: true, tags: ["math","computing"], address: { city: "London", zip: null } }, null, 2),
  json2rust: JSON.stringify({ id: 1, name: "Ada Lovelace", active: true, tags: ["math","computing"], address: { city: "London", zip: null } }, null, 2),
  jsonMock: JSON.stringify({ id: 1, name: "Ada Lovelace", email: "ada@example.com", city: "London", joinedDate: "2020-01-01", active: true }, null, 2),
  json2zod: JSON.stringify({ id: 1, name: "Ada Lovelace", active: true, tags: ["math","computing"], address: { city: "London", zip: null } }, null, 2),
};
const diffSamples = {
  diffJson: {
    a: JSON.stringify([{ id: 1, name: "Ada", role: "Engineer" }, { id: 2, name: "Bob", role: "Analyst" }, { id: 3, name: "Cy", role: "Intern" }], null, 2),
    b: JSON.stringify([{ id: 2, name: "Bob", role: "Analyst" }, { id: 1, name: "Ada Lovelace", role: "Engineer" }, { id: 4, name: "Zoe", role: "Lead" }], null, 2)
  },
  diffXml: {
    a: `<person>\n  <id>1</id>\n  <name>Ada</name>\n  <role>Engineer</role>\n</person>`,
    b: `<person>\n  <id>1</id>\n  <name>Ada Lovelace</name>\n  <role>Mathematician</role>\n</person>`
  },
  diffCsv: {
    a: `id,name,city\n1,Ada,London\n2,Bob,Paris\n3,Cy,Rome`,
    b: `id,name,city\n1,Ada Lovelace,London\n2,Bob,Berlin\n4,Zoe,Oslo`
  },
  validateSchema: {
    a: JSON.stringify({ type: 'object', properties: { id: { type: 'integer', minimum: 1 }, name: { type: 'string', minLength: 1 }, role: { type: 'string', enum: ['admin','user','guest'] } }, required: ['id','name'] }, null, 2),
    b: JSON.stringify({ id: 0, name: '', role: 'superuser' }, null, 2)
  }
};

let currentMode = 'json2csv';
let lastCsvDiffResult = null; // full engine.csvDiff() result, re-filtered locally on each toolbar interaction
let compareFilterStatus = 'all';
const $ = id => document.getElementById(id);
const inputEl = $('input'), outputEl = $('output'), statusEl = $('status');

function renderHl(layerEl, taEl, kind) {
  if (!layerEl || !taEl) return;
  const opts = { delimiter: getDelim() };
  layerEl.innerHTML = RecastHighlight.highlightFor(kind, taEl.value, opts) + (taEl.value.slice(-1) === '\n' ? ' ' : '');
}
function updateHighlightLayers() {
  const cfg = modeConfig[currentMode];
  renderHl($('hlInput'), inputEl, cfg.hl);
  renderHl($('hlInputA'), $('inputA'), cfg.hl);
  renderHl($('hlInputB'), $('inputB'), cfg.hl);
  renderHl($('hlOutput'), outputEl, cfg.hlOut);
}
function wireHighlightSync(taEl, layerEl) {
  if (!taEl || !layerEl) return;
  taEl.addEventListener('scroll', () => { layerEl.scrollTop = taEl.scrollTop; layerEl.scrollLeft = taEl.scrollLeft; });
}
wireHighlightSync(inputEl, $('hlInput'));
wireHighlightSync($('inputA'), $('hlInputA'));
wireHighlightSync($('inputB'), $('hlInputB'));
wireHighlightSync(outputEl, $('hlOutput'));

function setMode(mode) {
  if (!modeConfig[mode]) return;
  currentMode = mode;
  const cfg = modeConfig[mode];
  const chip = document.querySelector(`.mode-chip[data-mode="${mode}"]`);
  const group = chip?.dataset.group;
  if (group) {
    document.querySelectorAll('.mode-group-btn').forEach(b => b.classList.toggle('active', b.dataset.group === group));
    document.querySelectorAll('.mode-chip[data-group]').forEach(c => c.classList.toggle('hidden', c.dataset.group !== group));
  }
  document.querySelectorAll('.mode-chip').forEach(c => c.classList.toggle('active', c.dataset.mode === mode));
  $('inFmt').textContent = cfg.inFmt;
  $('outFmt').textContent = cfg.outFmt;
  outputEl.value = '';
  statusEl.textContent = '';
  $('diffPanel').classList.remove('show');
  $('diffKeyNote').style.display = 'none';
  $('comparePanel')?.classList.remove('show');

  const dual = $('dualInput');
  const singleWrap = $('singleInputWrap');
  if (cfg.dual) { dual?.classList.add('show'); singleWrap?.classList.add('hide'); }
  else { dual?.classList.remove('show'); singleWrap?.classList.remove('hide'); }
  if ($('inputA')) $('inputA').placeholder = (cfg.dualLabels && cfg.dualLabels[0]) || 'Original / left side\u2026';
  if ($('inputB')) $('inputB').placeholder = (cfg.dualLabels && cfg.dualLabels[1]) || 'Modified / right side\u2026';

  // Table/graph view are reading aids — drop them on any mode switch so
  // they don't linger showing stale/irrelevant data in an unrelated mode.
  if (inputTableActive) { inputTableActive = false; singleWrap?.classList.remove('table-active'); $('inputTableBtn')?.classList.remove('active'); if ($('inputTableBtn')) $('inputTableBtn').title = 'Toggle table view'; }
  if (outputTableActive) { outputTableActive = false; $('outputTableWrap')?.closest('.ta-wrap')?.classList.remove('table-active'); $('outputTableBtn')?.classList.remove('active'); if ($('outputTableBtn')) $('outputTableBtn').title = 'Toggle table view'; }
  tableSortState = { input: null, output: null };
  if (typeof setGraphActive === 'function') { setGraphActive('input', false); setGraphActive('output', false); }

  if (typeof liveValidateIfApplicable === 'function') liveValidateIfApplicable();

  const pathRow = $('pathRow');
  if (cfg.path) pathRow?.classList.add('show'); else pathRow?.classList.remove('show');

  if ($('prettyLabel')) $('prettyLabel').style.display = cfg.showPretty ? '' : 'none';
  if ($('bomLabel')) $('bomLabel').style.display = cfg.showBom ? '' : 'none';
  if ($('rootNameLabel')) $('rootNameLabel').style.display = cfg.showRootName ? '' : 'none';
  if ($('mockCountLabel')) $('mockCountLabel').style.display = cfg.showMockCount ? '' : 'none';
  if ($('delimLabel')) $('delimLabel').style.display = cfg.showDelim ? '' : 'none';
  if ($('inferLabel')) $('inferLabel').style.display = cfg.showInfer ? '' : 'none';

  const btn = $('convertBtn');
  if (btn) btn.textContent = cfg.btn || 'Convert';
  updateCounts();
  updateHighlightLayers();

  // Batch support: hide the toggle entirely for modes that can't batch
  // either as single-file conversion or as paired-file diff (JSONPath and
  // schema-validation need a query alongside each file, so batch doesn't
  // make sense for those).
  const batchToggle = $('batchToggleBtn');
  if (batchToggle) {
    const supported = RecastBatch.isBatchSupported(mode) || RecastBatch.isBatchDiffSupported(mode);
    batchToggle.style.display = supported ? '' : 'none';
    if (!supported) $('batchPanel')?.classList.remove('show');
  }
  updateBatchPanelForMode(mode);
}

function setGroup(group) {
  document.querySelectorAll('.mode-group-btn').forEach(b => b.classList.toggle('active', b.dataset.group === group));
  document.querySelectorAll('.mode-chip[data-group]').forEach(chip => chip.classList.toggle('hidden', chip.dataset.group !== group));
  const currentChip = document.querySelector(`.mode-chip[data-mode="${currentMode}"]`);
  if (!currentChip || currentChip.dataset.group !== group) {
    const first = document.querySelector(`.mode-chip[data-group="${group}"]`);
    if (first) setMode(first.dataset.mode);
  }
}
document.querySelectorAll('.mode-group-btn').forEach(btn => btn.addEventListener('click', () => setGroup(btn.dataset.group)));
document.querySelectorAll('.mode-chip[data-mode]').forEach(chip => chip.addEventListener('click', () => { setMode(chip.dataset.mode); track('select_tool', { mode: chip.dataset.mode }); }));
document.querySelectorAll('.qs-card[data-mode]').forEach(card => card.addEventListener('click', () => {
  setMode(card.dataset.mode);
  $('inputPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  track('quick_start_select', { mode: card.dataset.mode });
}));

function updateCounts() {
  const cfg = modeConfig[currentMode];
  const inLen = cfg?.dual ? (($('inputA')?.value.length || 0) + ($('inputB')?.value.length || 0)) : inputEl.value.length;
  $('inCount').textContent = inLen + ' chars';
  $('outCount').textContent = outputEl.value.length + ' chars';
  const src = cfg?.dual ? (($('inputA')?.value || '') + ($('inputB')?.value || '')) : inputEl.value;
  const bytes = new Blob([src]).size;
  const limit = getLimitBytes();
  const pct = Math.min(100, (bytes / limit) * 100);
  $('capFill').style.width = pct + '%';
  $('capFill').style.background = pct > 90 ? '#F2846B' : '#7FE7D0';
  $('capLabel').textContent = isPro() ? `${Math.round(bytes/1024)} KB \u00b7 Pro` : `${(bytes/1024/1024).toFixed(2)} / 3 MB free limit`;
  const nudge = $('upgradeNudge');
  if (nudge) { if (pct > 80) nudge.classList.add('show'); else nudge.classList.remove('show'); }
}
inputEl.addEventListener('input', () => { updateCounts(); renderHl($('hlInput'), inputEl, modeConfig[currentMode].hl); });
$('inputA')?.addEventListener('input', () => { updateCounts(); renderHl($('hlInputA'), $('inputA'), modeConfig[currentMode].hl); liveValidateIfApplicable(); });
$('inputB')?.addEventListener('input', () => { updateCounts(); renderHl($('hlInputB'), $('inputB'), modeConfig[currentMode].hl); liveValidateIfApplicable(); });

// ---------------- Live inline schema validation ----------------
// Updates a small valid/invalid badge as you type against a schema,
// instead of only reporting on button-click — closer to how an IDE
// behaves. Debounced and length-guarded so it can't jank typing on a
// large paste; skipped entirely outside the schema-validation mode.
let liveValidateTimer = null;
const LIVE_VALIDATE_MAX_BYTES = 200 * 1024;

function liveValidateIfApplicable() {
  const cfg = modeConfig[currentMode];
  const badge = $('liveValidateBadge');
  if (!badge) return;
  if (!cfg?.isSchemaCheck) { badge.style.display = 'none'; return; }
  clearTimeout(liveValidateTimer);
  liveValidateTimer = setTimeout(runLiveValidate, 400);
}

function runLiveValidate() {
  const badge = $('liveValidateBadge');
  const schemaText = $('inputA')?.value || '';
  const dataText = $('inputB')?.value || '';
  if (!schemaText.trim() || !dataText.trim()) { badge.style.display = 'none'; return; }
  if (new Blob([schemaText, dataText]).size > LIVE_VALIDATE_MAX_BYTES) {
    badge.className = 'live-validate-badge wait';
    badge.textContent = 'Too large for live validation \u2014 use the button';
    badge.style.display = 'block';
    return;
  }
  let schema, data;
  try { schema = JSON.parse(schemaText); data = JSON.parse(dataText); }
  catch (e) {
    badge.className = 'live-validate-badge wait';
    badge.textContent = '\u22ef waiting for valid JSON';
    badge.style.display = 'block';
    return;
  }
  try {
    const result = RecastEngine.validateAgainstSchema(data, schema);
    badge.className = 'live-validate-badge ' + (result.valid ? 'ok' : 'err');
    badge.textContent = result.valid ? '\u2713 Valid' : `\u2715 ${result.errors.length} issue${result.errors.length === 1 ? '' : 's'}`;
    badge.style.display = 'block';
  } catch (e) {
    badge.className = 'live-validate-badge wait';
    badge.textContent = '\u22ef ' + (e.message || 'checking\u2026');
    badge.style.display = 'block';
  }
}


function setWorking(on) { $('workerStatus').classList.toggle('show', on); }

async function runCurrentMode() {
  const cfg = modeConfig[currentMode];
  const sourceText = cfg.dual ? ($('inputA').value + $('inputB').value) : inputEl.value;
  const bytes = new Blob([sourceText]).size;
  if (bytes > getLimitBytes()) {
    statusEl.innerHTML = '<span class="status-err">\u2715 File exceeds the free limit \u2014 <a href="#pricing" style="color:#F2C14E">upgrade to Pro</a> for files up to 25 MB.</span>';
    $('upgradeNudge')?.classList.add('show');
    track('limit_hit', { mode: currentMode, reason: 'file_size' });
    recordPaywallHit('file_size');
    return;
  }
  if (currentMode === 'diffCsv' && !isPro()) {
    const delim = getDelim();
    const rowsA = RecastEngine.csvRowCount($('inputA').value, delim);
    const rowsB = RecastEngine.csvRowCount($('inputB').value, delim);
    if (Math.max(rowsA, rowsB) > CSV_COMPARE_FREE_ROW_LIMIT) {
      statusEl.innerHTML = `<span class="status-err">\u2715 Free tier compares up to ${CSV_COMPARE_FREE_ROW_LIMIT} rows per file \u2014 <a href="#pricing" style="color:#F2C14E">upgrade to Pro</a>, or <a href="#" onclick="startCheckout('day_pass');return false;" style="color:#F2C14E">get a 24-hour pass \u2014 \u00a32.99</a> for just this one.</span>`;
      $('upgradeNudge')?.classList.add('show');
      track('limit_hit', { mode: currentMode, reason: 'row_count' });
      recordPaywallHit('row_count');
      return;
    }
  }
  try {
    if (cfg.sync) {
      const result = cfg.sync(inputEl.value);
      outputEl.value = result;
      $('diffPanel').classList.remove('show');
      const okLabel = cfg.btn === 'Validate' ? '\u2713 Valid' : '\u2713 Done';
      statusEl.innerHTML = `<span class="status-ok">${okLabel}</span>`;
    } else {
      setWorking(true);
      const { task, payload } = cfg.task();
      const result = await RecastWorkerClient.runTask(task, payload);
      setWorking(false);

      if (cfg.isDiff) {
        if (cfg.diffKind === 'csv') {
          lastCsvDiffResult = result.result;
          compareFilterStatus = 'all';
          $('compareSearch').value = '';
          renderCompareTable();
          outputEl.value = flatTextFromCsvDiff(result.result);
          $('diffPanel').classList.remove('show');
          $('comparePanel').classList.add('show');
        } else {
          renderTreeDiff(result.result);
          outputEl.value = flatTextFromChanges(result.result);
          $('comparePanel').classList.remove('show');
          $('diffPanel').classList.add('show');
        }
        statusEl.innerHTML = '<span class="status-ok">\u2713 Compared</span>';
      } else if (cfg.isSchemaCheck) {
        outputEl.value = formatSchemaValidationReport(result);
        $('diffPanel').classList.remove('show');
        $('comparePanel').classList.remove('show');
        statusEl.innerHTML = result.valid
          ? '<span class="status-ok">\u2713 Valid against schema</span>'
          : `<span class="status-err">\u2715 ${result.errors.length} violation${result.errors.length===1?'':'s'} found</span>`;
      } else {
        outputEl.value = result;
        $('diffPanel').classList.remove('show');
        $('comparePanel').classList.remove('show');
        statusEl.innerHTML = '<span class="status-ok">\u2713 Done</span>';
      }
    }
    updateCounts();
    renderHl($('hlOutput'), outputEl, cfg.hlOut);
    if (outputTableActive) renderCsvTableInto($('outputTableWrap'), outputEl.value, getDelim());
    if (outputGraphActive) RecastGraph.render($('outputGraphWrap'), outputEl.value);

    RecastHistory.add(cfg.dual
      ? { mode: currentMode, inputA: $('inputA').value, inputB: $('inputB').value }
      : { mode: currentMode, input: inputEl.value });
    renderHistoryList();
    track('convert_run', { mode: currentMode, success: true, is_pro: isPro() });
  } catch (e) {
    setWorking(false);
    const msg = e.message || String(e);
    if (cfg.btn === 'Validate') { outputEl.value = '\u2715 ' + msg; statusEl.innerHTML = '<span class="status-err">\u2715 Invalid \u2014 see report</span>'; }
    else { statusEl.innerHTML = '<span class="status-err">\u2715 ' + msg.split('\n')[0] + '</span>'; }
    updateCounts();
    track('convert_run', { mode: currentMode, success: false, is_pro: isPro() });
  }
}
$('convertBtn').addEventListener('click', runCurrentMode);

// ---------------- Expand to full screen + pop out into a separate window ----------------
// Two ways to get more screen real estate for large datasets, since the
// panels otherwise cap out at whatever fits in the page layout:
// - "Expand" keeps everything in this tab but overlays the panel/workbench/
//   playground across the full viewport (Escape or the button again exits).
// - "Pop out" opens a genuinely separate browser window with a live,
//   two-way-synced mirror of the field, so it can be dragged to another
//   monitor. Editing in either window updates the other; output/read-only
//   fields sync one-way since there's nothing to type back.
let currentFullscreenEl = null;
function setExpandIcon(btn, expanded) {
  const use = btn?.querySelector('use');
  if (use) use.setAttribute('href', expanded ? '#ico-collapse' : '#ico-expand');
  if (btn) btn.title = expanded ? 'Exit full screen' : 'Expand to full screen';
}
function toggleFullscreen(el, btn) {
  if (!el) return;
  if (currentFullscreenEl && currentFullscreenEl !== el) {
    currentFullscreenEl.classList.remove('wb-fullscreen');
    document.querySelectorAll('.win-btn[title="Exit full screen"]').forEach(b => setExpandIcon(b, false));
  }
  const nowExpanded = !el.classList.contains('wb-fullscreen');
  el.classList.toggle('wb-fullscreen', nowExpanded);
  document.body.classList.toggle('wb-lock', nowExpanded);
  currentFullscreenEl = nowExpanded ? el : null;
  setExpandIcon(btn, nowExpanded);
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentFullscreenEl) {
    const btn = document.querySelector('.win-btn[title="Exit full screen"]');
    toggleFullscreen(currentFullscreenEl, btn);
  }
});
$('inputExpandBtn')?.addEventListener('click', (e) => toggleFullscreen($('inputPanel'), e.currentTarget));
$('outputExpandBtn')?.addEventListener('click', (e) => toggleFullscreen($('outputPanel') || e.currentTarget.closest('.panel'), e.currentTarget));
$('workbenchExpandBtn')?.addEventListener('click', (e) => toggleFullscreen(document.querySelector('.workbench'), e.currentTarget));
$('playgroundExpandBtn')?.addEventListener('click', (e) => toggleFullscreen($('apiPlayground'), e.currentTarget));

function openPopoutMirror(sourceEl, label, opts) {
  opts = opts || {};
  const isPre = sourceEl.tagName === 'PRE';
  const readOnly = opts.readOnly || isPre;
  const w = window.open('', 'recast_popout_' + (opts.id || label.replace(/\s+/g, '_')), 'width=900,height=700');
  if (!w) { showToast('Pop-out blocked \u2014 allow pop-ups for this site'); return; }
  const doc = w.document;
  doc.title = 'Recast \u2014 ' + label;
  const style = doc.createElement('style');
  style.textContent =
    "html,body{margin:0;height:100%;background:#0E2338;color:#EDF3F8;font-family:'IBM Plex Mono',ui-monospace,monospace;}" +
    ".head{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid rgba(140,182,214,0.32);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#B9CBDA;}" +
    ".head button{font-family:inherit;font-size:11px;background:transparent;border:1px solid rgba(140,182,214,0.32);color:#EDF3F8;border-radius:2px;padding:5px 10px;cursor:pointer;}" +
    ".head button:hover{border-color:#F2C14E;color:#F2C14E;}" +
    "textarea{box-sizing:border-box;width:100%;height:calc(100% - 41px);border:none;outline:none;background:transparent;color:#EDF3F8;font-family:inherit;font-size:13px;line-height:1.6;padding:16px;resize:none;}";
  doc.head.appendChild(style);

  const head = doc.createElement('div');
  head.className = 'head';
  const title = doc.createElement('span');
  title.textContent = label + (readOnly ? ' \u2014 read-only, live-synced' : ' \u2014 synced with the main tab');
  const btnGroup = doc.createElement('div');
  btnGroup.style.display = 'flex';
  btnGroup.style.gap = '6px';
  const fsBtn = doc.createElement('button');
  fsBtn.textContent = 'Full screen';
  const copyBtn = doc.createElement('button');
  copyBtn.textContent = 'Copy';
  btnGroup.appendChild(fsBtn);
  btnGroup.appendChild(copyBtn);
  head.appendChild(title);
  head.appendChild(btnGroup);
  doc.body.appendChild(head);

  const ta = doc.createElement('textarea');
  ta.spellcheck = false;
  ta.value = sourceEl.value !== undefined ? sourceEl.value : sourceEl.textContent;
  if (readOnly) ta.readOnly = true;
  doc.body.appendChild(ta);

  // Full screen inside the pop-out itself — same "more room for large
  // datasets" option as the in-tab Expand button, just applied to this
  // separate window instead (useful once it's already been dragged to
  // another monitor). Requires a real user gesture, which this click is.
  const docEl = doc.documentElement;
  function updateFsBtn() {
    const isFs = !!doc.fullscreenElement;
    fsBtn.textContent = isFs ? 'Exit full screen' : 'Full screen';
  }
  fsBtn.addEventListener('click', () => {
    if (doc.fullscreenElement) {
      doc.exitFullscreen?.();
    } else if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => showToast('Full screen isn\u2019t available for this window'));
    } else {
      showToast('Full screen isn\u2019t supported in this browser');
    }
  });
  doc.addEventListener('fullscreenchange', updateFsBtn);

  copyBtn.addEventListener('click', () => {
    ta.select();
    doc.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1200);
  });

  let syncing = false;

  if (!readOnly) {
    ta.addEventListener('input', () => {
      if (syncing) return;
      syncing = true;
      sourceEl.value = ta.value;
      sourceEl.dispatchEvent(new Event('input', { bubbles: true }));
      syncing = false;
    });
  }

  function pushToPopout() {
    if (w.closed) { cleanup(); return; }
    if (syncing) return;
    const val = sourceEl.value !== undefined ? sourceEl.value : sourceEl.textContent;
    if (ta.value !== val) { syncing = true; ta.value = val; syncing = false; }
  }
  function onSourceInput() { pushToPopout(); }
  if (sourceEl.value !== undefined) sourceEl.addEventListener('input', onSourceInput);
  // Programmatic updates (e.g. outputEl.value = result after Convert) don't
  // fire 'input' events, so poll as a cheap, reliable fallback for those.
  const poll = setInterval(pushToPopout, 400);
  function cleanup() {
    clearInterval(poll);
    if (sourceEl.value !== undefined) sourceEl.removeEventListener('input', onSourceInput);
  }
  w.addEventListener('beforeunload', cleanup);
  track('popout_open', { field: opts.id || label });
}
// ---------------- CSV table preview ----------------
// A read view of whatever's currently in a panel, rendered as an actual
// sortable table rather than raw delimited text — for eyeballing or
// re-ordering tabular data without needing a spreadsheet app open.
let inputTableActive = false;
let outputTableActive = false;
let tableSortState = { input: null, output: null }; // { col, dir } | null

function renderCsvTableInto(wrapEl, text, delimiter, side) {
  if (!wrapEl) return;
  wrapEl.innerHTML = '';
  let parsed;
  try { parsed = RecastEngine.csvToRows(text || '', delimiter || ','); }
  catch (e) { parsed = { headers: [], rows: [] }; }
  if (!parsed.headers.length || !parsed.rows.length) {
    const empty = document.createElement('div');
    empty.className = 'csv-table-empty';
    empty.textContent = text && text.trim() ? "This doesn't look like CSV \u2014 nothing to show as a table." : 'Nothing to preview yet.';
    wrapEl.appendChild(empty);
    return;
  }
  let rows = parsed.rows.slice();
  const sort = tableSortState[side];
  if (sort) {
    const col = sort.col;
    const allNumeric = rows.every(r => r[col] === '' || !isNaN(parseFloat(r[col])));
    rows.sort((a, b) => {
      const av = a[col], bv = b[col];
      let cmp;
      if (allNumeric) cmp = (parseFloat(av) || 0) - (parseFloat(bv) || 0);
      else cmp = String(av).localeCompare(String(bv));
      return sort.dir === 'desc' ? -cmp : cmp;
    });
  }
  const table = document.createElement('table');
  table.className = 'csv-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  parsed.headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    if (sort && sort.col === h) {
      const arrow = document.createElement('span');
      arrow.className = 'sort-arrow';
      arrow.textContent = sort.dir === 'desc' ? '\u2193' : '\u2191';
      th.appendChild(arrow);
    }
    th.addEventListener('click', () => {
      const cur = tableSortState[side];
      tableSortState[side] = (cur && cur.col === h && cur.dir === 'asc') ? { col: h, dir: 'desc' } : { col: h, dir: 'asc' };
      renderCsvTableInto(wrapEl, text, delimiter, side);
    });
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  rows.forEach(r => {
    const tr = document.createElement('tr');
    parsed.headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = r[h] !== undefined ? r[h] : '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrapEl.appendChild(table);
}

let inputGraphActive = false;
let outputGraphActive = false;

function toggleTableView(side) {
  const taWrap = side === 'input' ? $('singleInputWrap') : $('outputTableWrap').closest('.ta-wrap');
  const btn = $(side === 'input' ? 'inputTableBtn' : 'outputTableBtn');
  const el = side === 'input' ? inputEl : outputEl;
  const wrap = $(side === 'input' ? 'inputTableWrap' : 'outputTableWrap');
  if (side === 'input') inputTableActive = !inputTableActive; else outputTableActive = !outputTableActive;
  const active = side === 'input' ? inputTableActive : outputTableActive;
  if (active) setGraphActive(side, false); // mutually exclusive with graph view on the same panel
  taWrap.classList.toggle('table-active', active);
  btn.classList.toggle('active', active);
  btn.title = active ? 'Back to text view' : 'Toggle table view';
  if (active) renderCsvTableInto(wrap, el.value, getDelim(), side);
  track('table_view_toggle', { mode: currentMode, side, active });
}
$('inputTableBtn')?.addEventListener('click', () => toggleTableView('input'));
$('outputTableBtn')?.addEventListener('click', () => toggleTableView('output'));
inputEl.addEventListener('input', () => {
  if (inputTableActive) renderCsvTableInto($('inputTableWrap'), inputEl.value, getDelim(), 'input');
  if (inputGraphActive) RecastGraph.render($('inputGraphWrap'), inputEl.value);
});

function setGraphActive(side, active) {
  const taWrap = side === 'input' ? $('singleInputWrap') : $('outputGraphWrap').closest('.ta-wrap');
  const btn = $(side === 'input' ? 'inputGraphBtn' : 'outputGraphBtn');
  if (side === 'input') inputGraphActive = active; else outputGraphActive = active;
  taWrap.classList.toggle('graph-active', active);
  btn.classList.toggle('active', active);
  btn.title = active ? 'Back to text view' : 'Toggle graph view';
}
function toggleGraphView(side) {
  const active = side === 'input' ? !inputGraphActive : !outputGraphActive;
  if (active) { // mutually exclusive with table view on the same panel
    if (side === 'input' && inputTableActive) toggleTableView('input');
    if (side === 'output' && outputTableActive) toggleTableView('output');
  }
  setGraphActive(side, active);
  const el = side === 'input' ? inputEl : outputEl;
  const wrap = $(side === 'input' ? 'inputGraphWrap' : 'outputGraphWrap');
  if (active) RecastGraph.render(wrap, el.value);
  track('graph_view_toggle', { mode: currentMode, side, active });
}
$('inputGraphBtn')?.addEventListener('click', () => toggleGraphView('input'));
$('outputGraphBtn')?.addEventListener('click', () => toggleGraphView('output'));
inputEl.addEventListener('input', () => { if (inputGraphActive) RecastGraph.render($('inputGraphWrap'), inputEl.value); });

$('inputPopoutBtn')?.addEventListener('click', () => openPopoutMirror(inputEl, modeConfig[currentMode]?.inFmt ? modeConfig[currentMode].inFmt + ' input' : 'Input', { id: 'input' }));
$('outputPopoutBtn')?.addEventListener('click', () => openPopoutMirror(outputEl, modeConfig[currentMode]?.outFmt ? modeConfig[currentMode].outFmt + ' output' : 'Output', { id: 'output', readOnly: true }));
$('playgroundPopoutBtn')?.addEventListener('click', () => openPopoutMirror($('playgroundInput'), 'API playground request', { id: 'playground_request' }));
$('playgroundOutputPopoutBtn')?.addEventListener('click', () => openPopoutMirror($('playgroundOutput'), 'API playground response', { id: 'playground_response', readOnly: true }));

$('swapBtn').addEventListener('click', () => {
  const cfg = modeConfig[currentMode];
  if (cfg && cfg.isDiff) {
    // Swap A/B for diff modes — common need when the two files got loaded
    // in the wrong order, without re-selecting/re-pasting anything.
    const inputA = $('inputA'), inputB = $('inputB');
    const tmp = inputA.value;
    inputA.value = inputB.value;
    inputB.value = tmp;
    updateCounts();
    renderHl($('hlInputA'), inputA, cfg.hl);
    renderHl($('hlInputB'), inputB, cfg.hl);
    statusEl.innerHTML = '<span class="status-ok">\u2713 Swapped A / B</span>';
    return;
  }
  const swapMap = { json2csv:'csv2json', csv2json:'json2csv', json2xml:'xml2json', xml2json:'json2xml', flatten:'unflatten', unflatten:'flatten', json2yaml:'yaml2json', yaml2json:'json2yaml', json2markdown:'markdown2json', markdown2json:'json2markdown' };
  const next = swapMap[currentMode];
  if (next) {
    const oldOutput = outputEl.value;
    setMode(next);
    if (oldOutput) inputEl.value = oldOutput;
    updateCounts();
    renderHl($('hlInput'), inputEl, modeConfig[currentMode].hl);
  } else {
    statusEl.innerHTML = '<span class="status-err">\u2715 Swap not available in this mode</span>';
  }
});

$('loadSample').addEventListener('click', () => {
  const cfg = modeConfig[currentMode];
  if (cfg?.dual && diffSamples[currentMode]) {
    $('inputA').value = diffSamples[currentMode].a;
    $('inputB').value = diffSamples[currentMode].b;
    renderHl($('hlInputA'), $('inputA'), cfg.hl);
    renderHl($('hlInputB'), $('inputB'), cfg.hl);
  } else {
    inputEl.value = samples[currentMode] || '';
    if (currentMode === 'jsonPath') $('jsonPathInput').value = '$.users[*].name';
    renderHl($('hlInput'), inputEl, cfg.hl);
  }
  updateCounts();
});

$('clearInputBtn')?.addEventListener('click', () => { inputEl.value = ''; updateCounts(); statusEl.textContent = ''; renderHl($('hlInput'), inputEl, modeConfig[currentMode].hl); });
$('clearOutputBtn')?.addEventListener('click', () => { outputEl.value = ''; updateCounts(); renderHl($('hlOutput'), outputEl, modeConfig[currentMode].hlOut); $('diffPanel').classList.remove('show'); $('comparePanel')?.classList.remove('show'); });

$('fileInput')?.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const ok = await loadFileIntoTextarea(file, inputEl, modeConfig[currentMode].hl);
  if (ok) statusEl.innerHTML = `<span class="status-ok">\u2713 Loaded ${file.name}</span>`;
  e.target.value = '';
});

// ---------------- Drag-and-drop file upload ----------------
// Drop 1 file onto the input panel to load it directly, same as clicking
// Upload — or drop several at once and it routes straight to Batch instead
// of silently keeping only the first one. Diff mode gets its own drop zone
// per side (a file dropped on the left shouldn't land on the right). The
// batch panel accepts drops too, appending to whatever's already queued.
async function loadFileIntoTextarea(file, textareaEl) {
  if (file.size > getLimitBytes()) {
    statusEl.innerHTML = '<span class="status-err">\u2715 File exceeds the free limit \u2014 <a href="#pricing" style="color:#F2C14E">upgrade to Pro</a>.</span>';
    $('upgradeNudge')?.classList.add('show');
    return false;
  }
  const text = await file.text();
  textareaEl.value = text;
  textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

function wireDropZone(containerEl, zoneEl, onDrop, opts) {
  opts = opts || {};
  if (!containerEl || !zoneEl) return;
  function isRelevant(e) {
    if (!e.dataTransfer?.types?.includes('Files')) return false;
    if (opts.enabled && !opts.enabled()) return false;
    return true;
  }
  ['dragenter', 'dragover'].forEach(evt => containerEl.addEventListener(evt, (e) => {
    if (!isRelevant(e)) return;
    e.preventDefault(); e.stopPropagation();
    zoneEl.classList.add('active');
  }));
  ['dragleave', 'drop'].forEach(evt => containerEl.addEventListener(evt, (e) => {
    if (!isRelevant(e)) return;
    e.preventDefault(); e.stopPropagation();
    zoneEl.classList.remove('active');
  }));
  containerEl.addEventListener('drop', (e) => {
    if (!isRelevant(e) || !e.dataTransfer?.files?.length) return;
    onDrop(Array.from(e.dataTransfer.files));
  });
}

// Main input panel.
wireDropZone($('inputPanel'), $('dropZone'), async (files) => {
  track('file_drop', { mode: currentMode, count: files.length });
  if (files.length === 1) {
    const ok = await loadFileIntoTextarea(files[0], inputEl);
    if (ok) statusEl.innerHTML = `<span class="status-ok">\u2713 Loaded ${files[0].name}</span>`;
    return;
  }
  // Multiple files dropped where only one field can hold text — route to Batch.
  if (!isPro()) {
    showBatchLocked();
    const ok = await loadFileIntoTextarea(files[0], inputEl);
    if (ok) showToast(`Loaded ${files[0].name} \u2014 batch convert (all ${files.length} files) needs Pro`);
    return;
  }
  const panel = $('batchPanel');
  $('batchHeadSingle').style.display = '';
  panel.classList.add('show');
  await addFilesToBatch(files);
  showToast(`Added ${files.length} files to batch`);
}, { enabled: () => !modeConfig[currentMode]?.dual });

// Diff mode — one drop zone per side, so a file lands on the correct side.
wireDropZone($('inputA')?.closest('.ta-wrap'), $('dropZoneA'), async (files) => {
  const ok = await loadFileIntoTextarea(files[0], $('inputA'));
  if (ok) statusEl.innerHTML = `<span class="status-ok">\u2713 Loaded ${files[0].name}</span>`;
  track('file_drop', { mode: currentMode, side: 'A', count: 1 });
});
wireDropZone($('inputB')?.closest('.ta-wrap'), $('dropZoneB'), async (files) => {
  const ok = await loadFileIntoTextarea(files[0], $('inputB'));
  if (ok) statusEl.innerHTML = `<span class="status-ok">\u2713 Loaded ${files[0].name}</span>`;
  track('file_drop', { mode: currentMode, side: 'B', count: 1 });
});

// Batch panel — append dropped files to the existing queue. Diff mode has
// two separate sides (original/modified), so a generic drop is ambiguous
// there; only single-file batch modes get this shortcut, matching the
// "enabled" pattern used for the main input drop zone above.
wireDropZone($('batchPanel'), $('batchDropZone'), async (files) => {
  if (!isPro()) { showBatchLocked(); return; }
  await addFilesToBatch(files);
  track('file_drop', { mode: currentMode, batch: true, count: files.length });
  showToast(`Added ${files.length} file${files.length === 1 ? '' : 's'} to batch`);
}, { enabled: () => !(modeConfig[currentMode]?.dual && RecastBatch.isBatchDiffSupported(currentMode)) });

document.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); $('convertBtn')?.click(); } });

$('copyBtn').addEventListener('click', () => { if (!outputEl.value) return; navigator.clipboard.writeText(outputEl.value).then(() => { statusEl.innerHTML = '<span class="status-ok">\u2713 Copied to clipboard</span>'; track('copy_output', { mode: currentMode }); }); });
$('downloadBtn').addEventListener('click', () => {
  if (!outputEl.value) return;
  const ext = { json2csv:'csv', csv2json:'json', json2xml:'xml', xml2json:'json', flatten:'json', unflatten:'json', jsonSchema:'json', jsonStructure:'txt', json2yaml:'yaml', yaml2json:'json', json2markdown:'md', markdown2json:'json', json2python:'py', json2pydantic:'py', json2go:'go', json2kotlin:'kt', json2rust:'rs', jsonMock:'json' }[currentMode] || 'txt';
  const mime = { csv:'text/csv', json:'application/json', xml:'application/xml' }[ext] || 'text/plain';
  const blob = new Blob([outputEl.value], { type: mime + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `recast-output.${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
  track('download_output', { mode: currentMode, ext: ext });
});

// ---------------- History panel ----------------
function renderHistoryList() {
  const items = RecastHistory.load();
  const list = $('historyList');
  if (!items.length) { list.innerHTML = '<div class="history-empty">No recent conversions yet.</div>'; return; }
  list.innerHTML = items.map((it, idx) => {
    const snip = RecastHighlight.escapeHtml((it.input || it.inputA || '').slice(0, 60).replace(/\n/g, ' '));
    return `<div class="history-item" data-idx="${idx}"><span class="h-time">${RecastHistory.timeAgo(it.ts)}</span><div class="h-mode">${it.mode}</div><div class="h-snip">${snip || '(empty)'}</div></div>`;
  }).join('');
  list.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const it = items[parseInt(el.dataset.idx, 10)];
      setMode(it.mode);
      if (modeConfig[it.mode].dual) { $('inputA').value = it.inputA || ''; $('inputB').value = it.inputB || ''; }
      else { inputEl.value = it.input || ''; }
      updateCounts();
      updateHighlightLayers();
      $('historyPanel').classList.remove('show');
    });
  });
}
$('historyBtn').addEventListener('click', () => { $('historyPanel').classList.toggle('show'); if ($('historyPanel').classList.contains('show')) renderHistoryList(); });
$('historyClearBtn').addEventListener('click', () => { RecastHistory.clear(); renderHistoryList(); });
document.addEventListener('click', (e) => { if (!e.target.closest('.header-actions')) $('historyPanel')?.classList.remove('show'); });

// ---------------- Share links ----------------
function showToast(msg) {
  const t = $('shareToast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
$('shareBtn').addEventListener('click', async () => {
  const cfg = modeConfig[currentMode];
  const state = cfg.dual
    ? { mode: currentMode, inputA: $('inputA').value, inputB: $('inputB').value }
    : { mode: currentMode, input: inputEl.value };
  try {
    const url = await RecastShare.buildShareUrl(location.href.split('#')[0], state);
    await navigator.clipboard.writeText(url);
    showToast('Share link copied \u2014 data is compressed into the URL, nothing was uploaded');
  } catch (e) {
    showToast('Could not build share link in this browser');
  }
});

async function restoreFromShareLink() {
  const state = await RecastShare.readShareStateFromLocation(location).catch(() => null);
  if (!state || !modeConfig[state.mode]) return;
  setMode(state.mode);
  if (modeConfig[state.mode].dual) { $('inputA').value = state.inputA || ''; $('inputB').value = state.inputB || ''; }
  else { inputEl.value = state.input || ''; }
  updateCounts();
  updateHighlightLayers();
  runCurrentMode();
}

// ---------------- Batch conversion (Pro) ----------------
let batchFiles = []; // { name, text }
let batchFilesA = []; let batchFilesB = []; // dual-mode (diff) staging, paired by matching filename
let batchDiffPairs = [];
let batchDiffResults = null;

function updateBatchPanelForMode(mode) {
  const cfg = modeConfig[mode];
  const isDiff = cfg?.dual && RecastBatch.isBatchDiffSupported(mode);
  $('batchHeadSingle').style.display = isDiff ? 'none' : '';
  $('batchHeadDual').style.display = isDiff ? '' : 'none';
  $('batchDiffHint').style.display = isDiff ? '' : 'none';
  const chip = document.querySelector(`.mode-chip[data-mode="${mode}"]`);
  if (isDiff) $('batchModeLabelDual').textContent = 'Batch diff: ' + (chip ? chip.textContent : mode);
  else if ($('batchModeLabel')) $('batchModeLabel').textContent = 'Batch: ' + (chip ? chip.textContent : mode);
}
let batchResults = null;

function currentOptionsSnapshot() {
  return {
    delimiter: getDelim(),
    excelBom: $('excelBom') ? $('excelBom').checked : false,
    inferTypes: $('inferTypes') ? $('inferTypes').checked !== false : true,
    pretty: $('prettyPrint') ? $('prettyPrint').checked !== false : true,
  };
}
function applyOptionsSnapshot(opts) {
  if (!opts) return;
  const sel = $('csvDelimiter');
  if (sel && opts.delimiter !== undefined) {
    const match = Array.from(sel.options).find(o => (o.value === '\\t' ? '\t' : o.value) === opts.delimiter);
    if (match) sel.value = match.value;
  }
  if ($('excelBom')) $('excelBom').checked = !!opts.excelBom;
  if ($('inferTypes')) $('inferTypes').checked = opts.inferTypes !== false;
  if ($('prettyPrint')) $('prettyPrint').checked = opts.pretty !== false;
}

function renderBatchFileList() {
  const cfg = modeConfig[currentMode];
  const isDiff = cfg?.dual && RecastBatch.isBatchDiffSupported(currentMode);
  const listEl = $('batchFileList');
  if (isDiff) {
    if (!batchDiffPairs.length && !batchFilesA.length && !batchFilesB.length) {
      listEl.innerHTML = '<div class="batch-empty">Add original files and modified files \u2014 they\'ll be paired by matching filename.</div>';
      return;
    }
    const paired = RecastBatch.pairBatchFiles(batchFilesA, batchFilesB);
    batchDiffPairs = paired.pairs;
    let html = paired.pairs.map((p, i) => {
      const r = batchDiffResults && batchDiffResults[i];
      const statusClass = !r ? 'pending' : (r.ok ? 'ok' : 'err');
      const statusText = !r ? 'pending' : (r.ok ? 'done' : 'error');
      return `<div class="batch-file-row" data-idx="${i}">
        <span class="fname">${RecastHighlight.escapeHtml(p.nameA)} \u2194 ${RecastHighlight.escapeHtml(p.nameB)}</span>
        <span class="fstatus ${statusClass}">${statusText}</span>
      </div>`;
    }).join('');
    const unmatched = paired.unmatchedA.concat(paired.unmatchedB);
    if (unmatched.length) {
      html += `<div class="batch-empty">Unmatched, not compared: ${unmatched.map(n => RecastHighlight.escapeHtml(n)).join(', ')}</div>`;
    }
    listEl.innerHTML = html;
    return;
  }
  if (!batchFiles.length) { listEl.innerHTML = '<div class="batch-empty">No files added yet \u2014 tap "Add files" to select several at once.</div>'; return; }
  listEl.innerHTML = batchFiles.map((f, i) => {
    const r = batchResults && batchResults[i];
    const statusClass = !r ? 'pending' : (r.ok ? 'ok' : 'err');
    const statusText = !r ? 'pending' : (r.ok ? 'done' : 'error');
    return `<div class="batch-file-row" data-idx="${i}">
      <span class="fname">${RecastHighlight.escapeHtml(f.name)}</span>
      <span class="fstatus ${statusClass}">${statusText}</span>
      <button class="fremove" data-remove="${i}" title="Remove">\u2715</button>
    </div>`;
  }).join('');
  listEl.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.remove, 10);
      batchFiles.splice(idx, 1);
      batchResults = null;
      renderBatchFileList();
      $('batchSummary').style.display = 'none';
      $('batchDownloadBtn').style.display = 'none';
    });
  });
}

async function addFilesToBatch(fileList) {
  for (const file of Array.from(fileList)) {
    const text = await file.text();
    batchFiles.push({ name: file.name, text });
  }
  batchResults = null;
  $('batchSummary').style.display = 'none';
  $('batchDownloadBtn').style.display = 'none';
  renderBatchFileList();
}

async function addFilesToBatchSide(fileList, side) {
  const target = side === 'A' ? batchFilesA : batchFilesB;
  for (const file of Array.from(fileList)) {
    const text = await file.text();
    target.push({ name: file.name, text });
  }
  batchDiffResults = null;
  $('batchSummary').style.display = 'none';
  $('batchDownloadBtn2').style.display = 'none';
  renderBatchFileList();
}

// ---------------- Usage-triggered upgrade prompts ----------------
// Tracks locally (never sent anywhere — this is separate from the GA
// event) how many times someone's actually hit a free-tier wall this
// browser. The generic banner shows every time; this escalates to a
// specific, contextual one every 3rd hit rather than repeating the same
// message endlessly, which is closer to what actually moves a repeat
// visitor to upgrade than a static banner.
const PAYWALL_HITS_KEY = 'recast_paywall_hits_v1';
function loadPaywallHits() {
  try { return JSON.parse(localStorage.getItem(PAYWALL_HITS_KEY)) || { reasons: {}, lastEscalation: 0 }; }
  catch (e) { return { reasons: {}, lastEscalation: 0 }; }
}
function savePaywallHits(state) {
  try { localStorage.setItem(PAYWALL_HITS_KEY, JSON.stringify(state)); } catch (e) { /* fail silently */ }
}
const PAYWALL_REASON_COPY = {
  file_size: 'the file size limit',
  row_count: 'the CSV compare row limit',
  batch_locked: 'batch conversion being Pro-only',
};
function recordPaywallHit(reason) {
  const state = loadPaywallHits();
  state.reasons[reason] = (state.reasons[reason] || 0) + 1;
  const total = Object.values(state.reasons).reduce((a, b) => a + b, 0);
  savePaywallHits(state);
  if (total >= 3 && total % 3 === 0 && total !== state.lastEscalation) {
    state.lastEscalation = total;
    savePaywallHits(state);
    const topReason = Object.keys(state.reasons).sort((a, b) => state.reasons[b] - state.reasons[a])[0];
    const reasonText = PAYWALL_REASON_COPY[topReason] || 'a free-tier limit';
    $('paywallEscalationText').textContent = `You've hit ${reasonText} ${total} time${total === 1 ? '' : 's'} \u2014 Pro removes that entirely.`;
    $('paywallEscalation').style.display = 'flex';
    track('paywall_escalation_shown', { total, top_reason: topReason });
  }
}
$('paywallEscalationClose')?.addEventListener('click', () => { $('paywallEscalation').style.display = 'none'; });

function showBatchLocked() {
  $('batchFileList').innerHTML = '';
  const panel = $('batchPanel');
  panel.classList.add('show');
  $('batchHeadSingle').style.display = 'none';
  $('batchHeadDual').style.display = 'none';
  $('batchDiffHint').style.display = 'none';
  $('batchSummary').style.display = 'block';
  $('batchSummary').innerHTML = `<div class="batch-locked"><p>Batch conversion is a Pro feature \u2014 convert up to 100 files at once instead of one at a time.</p><a href="#pricing" class="btn btn-gold">Upgrade to Pro \u2014 \u00a39/mo</a></div>`;
  recordPaywallHit('batch_locked');
}

$('batchToggleBtn')?.addEventListener('click', () => {
  const panel = $('batchPanel');
  $('recipePanel')?.classList.remove('show');
  if (!isPro()) {
    if (panel.classList.contains('show')) { panel.classList.remove('show'); return; }
    showBatchLocked();
    return;
  }
  updateBatchPanelForMode(currentMode);
  $('batchSummary').style.display = (batchResults || batchDiffResults) ? 'block' : 'none';
  panel.classList.toggle('show');
  if (panel.classList.contains('show')) renderBatchFileList();
});

$('batchFileInput')?.addEventListener('change', async (e) => {
  if (e.target.files && e.target.files.length) await addFilesToBatch(e.target.files);
  e.target.value = '';
});

$('batchFileInputA')?.addEventListener('change', async (e) => {
  if (e.target.files && e.target.files.length) await addFilesToBatchSide(e.target.files, 'A');
  e.target.value = '';
});
$('batchFileInputB')?.addEventListener('change', async (e) => {
  if (e.target.files && e.target.files.length) await addFilesToBatchSide(e.target.files, 'B');
  e.target.value = '';
});

$('batchRunBtn')?.addEventListener('click', async () => {
  if (!isPro()) { showBatchLocked(); return; }
  if (!batchFiles.length) { showToast('Add files first'); return; }
  setWorking(true);
  const opts = currentOptionsSnapshot();
  batchResults = await RecastBatch.runBatch(batchFiles, currentMode, opts, () => renderBatchFileList());
  setWorking(false);
  renderBatchFileList();
  const okCount = batchResults.filter(r => r.ok).length;
  const errCount = batchResults.length - okCount;
  $('batchSummary').style.display = 'block';
  $('batchSummary').textContent = `${okCount} converted, ${errCount} failed`;
  $('batchDownloadBtn').style.display = okCount ? '' : 'none';
  track('batch_convert', { mode: currentMode, file_count: batchResults.length, ok_count: okCount, err_count: errCount });
});

$('batchDownloadBtn')?.addEventListener('click', async () => {
  if (!batchResults) return;
  const ok = batchResults.filter(r => r.ok);
  if (!ok.length) return;
  if (typeof JSZip === 'undefined') { showToast('Zip library failed to load \u2014 check your connection and retry'); return; }
  const zip = new JSZip();
  ok.forEach(r => zip.file(r.outName, r.output));
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'recast-batch.zip';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('batchClearBtn')?.addEventListener('click', () => {
  batchFiles = [];
  batchResults = null;
  renderBatchFileList();
  $('batchSummary').style.display = 'none';
  $('batchDownloadBtn').style.display = 'none';
});

$('batchRunDiffBtn')?.addEventListener('click', async () => {
  if (!isPro()) { showBatchLocked(); return; }
  const paired = RecastBatch.pairBatchFiles(batchFilesA, batchFilesB);
  batchDiffPairs = paired.pairs;
  if (!batchDiffPairs.length) { showToast('Add original and modified files first'); return; }
  setWorking(true);
  const opts = currentOptionsSnapshot();
  batchDiffResults = await RecastBatch.runBatchDiff(batchDiffPairs, currentMode, opts, () => renderBatchFileList());
  setWorking(false);
  renderBatchFileList();
  const okCount = batchDiffResults.filter(r => r.ok).length;
  const errCount = batchDiffResults.length - okCount;
  $('batchSummary').style.display = 'block';
  $('batchSummary').textContent = `${okCount} compared, ${errCount} failed`;
  $('batchDownloadBtn2').style.display = okCount ? '' : 'none';
  track('batch_convert', { mode: currentMode, batch_diff: true, file_count: batchDiffResults.length, ok_count: okCount, err_count: errCount });
});

$('batchDownloadBtn2')?.addEventListener('click', async () => {
  if (!batchDiffResults) return;
  const ok = batchDiffResults.filter(r => r.ok);
  if (!ok.length) return;
  if (typeof JSZip === 'undefined') { showToast('Zip library failed to load \u2014 check your connection and retry'); return; }
  const zip = new JSZip();
  ok.forEach(r => zip.file(r.outName, r.output));
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'recast-batch-diff.zip';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('batchClearBtn2')?.addEventListener('click', () => {
  batchFilesA = [];
  batchFilesB = [];
  batchDiffPairs = [];
  batchDiffResults = null;
  renderBatchFileList();
  $('batchSummary').style.display = 'none';
  $('batchDownloadBtn2').style.display = 'none';
});

// ---------------- Recipes ----------------
// Chain several single-input transforms into one saved, reusable pipeline.
// Free feature, unlike Batch/Presets — a recipe with N steps run once is
// meaningfully different from "convert 100 files," so it doesn't compete
// with the same upgrade trigger.
let recipeSteps = [];

function recipeStepLabel(mode) {
  const chip = document.querySelector(`.mode-chip[data-mode="${mode}"]`);
  return chip ? chip.textContent.trim() : mode;
}

function populateRecipeStepDropdown() {
  const sel = $('recipeAddStep');
  if (!sel || !window.RecastBatch) return;
  const modes = Object.keys(RecastBatch.BATCH_OPS);
  sel.innerHTML = '<option value="">+ Add step\u2026</option>' +
    modes.map(m => `<option value="${m}">${RecastHighlight.escapeHtml(recipeStepLabel(m))}</option>`).join('');
}

function renderRecipeSteps() {
  const listEl = $('recipeStepList');
  if (!recipeSteps.length) {
    listEl.innerHTML = '<div class="batch-empty">No steps yet \u2014 add one below. Each step\'s output feeds into the next.</div>';
    return;
  }
  listEl.innerHTML = recipeSteps.map((s, i) => `
    <div class="batch-file-row" data-idx="${i}">
      <span class="recipe-step-num">${i + 1}</span>
      <span class="fname">${RecastHighlight.escapeHtml(recipeStepLabel(s.mode))}</span>
      <div class="recipe-step-btns">
        <button data-up="${i}" ${i === 0 ? 'disabled' : ''} title="Move up">\u2191</button>
        <button data-down="${i}" ${i === recipeSteps.length - 1 ? 'disabled' : ''} title="Move down">\u2193</button>
        <button data-remove="${i}" title="Remove">\u2715</button>
      </div>
    </div>
  `).join('');
  listEl.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => {
    recipeSteps.splice(parseInt(btn.dataset.remove, 10), 1);
    renderRecipeSteps();
  }));
  listEl.querySelectorAll('[data-up]').forEach(btn => btn.addEventListener('click', () => {
    const i = parseInt(btn.dataset.up, 10);
    [recipeSteps[i - 1], recipeSteps[i]] = [recipeSteps[i], recipeSteps[i - 1]];
    renderRecipeSteps();
  }));
  listEl.querySelectorAll('[data-down]').forEach(btn => btn.addEventListener('click', () => {
    const i = parseInt(btn.dataset.down, 10);
    [recipeSteps[i + 1], recipeSteps[i]] = [recipeSteps[i], recipeSteps[i + 1]];
    renderRecipeSteps();
  }));
}

function renderSavedRecipes() {
  const recipes = RecastRecipes.load();
  const wrap = $('recipeSavedWrap');
  const listEl = $('recipeSavedList');
  if (!recipes.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  listEl.innerHTML = recipes.map(r => `
    <div class="recipe-saved-row" data-name="${RecastHighlight.escapeHtml(r.name)}">
      <span class="rname" data-load="${RecastHighlight.escapeHtml(r.name)}">${RecastHighlight.escapeHtml(r.name)}</span>
      <span class="rsteps">${r.steps.map(s => recipeStepLabel(s.mode)).join(' \u2192 ')}</span>
      <button class="fremove" data-delete="${RecastHighlight.escapeHtml(r.name)}" title="Delete">\u2715</button>
    </div>
  `).join('');
  listEl.querySelectorAll('[data-load]').forEach(el => el.addEventListener('click', () => {
    const r = recipes.find(x => x.name === el.dataset.load);
    if (r) { recipeSteps = r.steps.map(s => ({ mode: s.mode })); renderRecipeSteps(); showToast(`Loaded recipe "${r.name}"`); }
  }));
  listEl.querySelectorAll('[data-delete]').forEach(el => el.addEventListener('click', () => {
    RecastRecipes.remove(el.dataset.delete);
    renderSavedRecipes();
  }));
}

populateRecipeStepDropdown();
renderRecipeSteps();
renderSavedRecipes();

$('recipeToggleBtn')?.addEventListener('click', () => {
  $('batchPanel')?.classList.remove('show');
  $('recipePanel').classList.toggle('show');
  if ($('recipePanel').classList.contains('show')) { renderRecipeSteps(); renderSavedRecipes(); }
});
$('recipeAddStep')?.addEventListener('change', (e) => {
  if (!e.target.value) return;
  if (recipeSteps.length >= RecastRecipes.MAX_STEPS) { showToast(`Recipes are capped at ${RecastRecipes.MAX_STEPS} steps`); e.target.value = ''; return; }
  recipeSteps.push({ mode: e.target.value });
  e.target.value = '';
  renderRecipeSteps();
});
$('recipeClearBtn')?.addEventListener('click', () => {
  recipeSteps = [];
  renderRecipeSteps();
  $('recipeSummary').style.display = 'none';
});
$('recipeRunBtn')?.addEventListener('click', () => {
  if (!recipeSteps.length) { showToast('Add at least one step first'); return; }
  const result = RecastRecipes.runRecipe(inputEl.value, recipeSteps, currentOptionsSnapshot());
  $('recipeSummary').style.display = 'block';
  if (result.ok) {
    outputEl.value = result.finalOutput;
    updateCounts();
    renderHl($('hlOutput'), outputEl, 'plain');
    $('recipeSummary').innerHTML = `<span class="status-ok">\u2713 ${result.stepResults.length} step${result.stepResults.length===1?'':'s'} ran successfully</span>`;
  } else {
    const failedIdx = result.stepResults.length - 1;
    const failedStep = result.stepResults[failedIdx];
    $('recipeSummary').innerHTML = `<span class="status-err">\u2715 Failed at step ${failedIdx + 1} (${RecastHighlight.escapeHtml(recipeStepLabel(failedStep.mode))}): ${RecastHighlight.escapeHtml(failedStep.error)}</span>`;
  }
  track('recipe_run', { steps: recipeSteps.length, success: result.ok });
});
$('recipeSaveBtn')?.addEventListener('click', () => {
  if (!recipeSteps.length) { showToast('Add at least one step first'); return; }
  const name = (prompt('Name this recipe:') || '').trim();
  if (!name) return;
  RecastRecipes.upsert({ name, steps: recipeSteps });
  renderSavedRecipes();
  showToast(`Saved recipe "${name}"`);
  track('recipe_save', { steps: recipeSteps.length });
});


function renderPresetsList() {
  const presets = RecastPresets.load();
  const listEl = $('presetsList');
  if (!presets.length) { listEl.innerHTML = '<div class="history-empty">No saved presets yet.</div>'; return; }
  listEl.innerHTML = presets.map((p, i) => `
    <div class="presets-list-item" data-idx="${i}">
      <span class="pmode">${RecastHighlight.escapeHtml(p.mode)}</span>
      <span class="pname">${RecastHighlight.escapeHtml(p.name)}</span>
      <button class="pdel" data-del="${RecastHighlight.escapeHtml(p.name)}" title="Delete">\u2715</button>
    </div>`).join('');
  listEl.querySelectorAll('.presets-list-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.pdel')) return;
      const p = presets[parseInt(el.dataset.idx, 10)];
      setMode(p.mode);
      applyOptionsSnapshot(p.options);
      $('presetsPanel').classList.remove('show');
      showToast(`Applied preset "${p.name}"`);
    });
  });
  listEl.querySelectorAll('.pdel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      RecastPresets.remove(btn.dataset.del);
      renderPresetsList();
    });
  });
}

$('presetsBtn')?.addEventListener('click', () => {
  if (!isPro()) {
    showToast('Saved presets are a Pro feature \u2014 see Pricing to upgrade');
    return;
  }
  $('presetsPanel').classList.toggle('show');
  if ($('presetsPanel').classList.contains('show')) renderPresetsList();
});
$('presetsCloseBtn')?.addEventListener('click', () => $('presetsPanel').classList.remove('show'));
$('presetSaveBtn')?.addEventListener('click', () => {
  const name = ($('presetNameInput').value || '').trim();
  if (!name) { showToast('Give the preset a name first'); return; }
  RecastPresets.upsert({ name, mode: currentMode, options: currentOptionsSnapshot() });
  $('presetNameInput').value = '';
  renderPresetsList();
  showToast(`Saved preset "${name}"`);
});
document.addEventListener('click', (e) => { if (!e.target.closest('.header-actions')) $('presetsPanel')?.classList.remove('show'); });


const ruler = $('ruler');
for (let i = 0; i < 60; i++) { const s = document.createElement('span'); s.textContent = i % 5 === 0 ? i : ''; ruler.appendChild(s); }

// ---------------- API playground ----------------
// Runs entirely in the browser using the same engine that powers the
// browser tool AND the hosted API — so the output shown here is exactly
// what a real /v1/convert call would return, without needing an API key
// just to try it (and without exposing a way to hit the real endpoint
// unauthenticated). Clearly labeled as a live preview, not a real network
// call, so nobody's misled about what's actually happening.
function runPlaygroundConversion(mode, input) {
  switch (mode) {
    case 'json2csv': return RecastEngine.jsonToCsv(JSON.parse(input), {});
    case 'csv2json': return JSON.stringify(RecastEngine.csvToJson(input, {}), null, 2);
    case 'json2xml': return RecastEngine.jsonToXml(JSON.parse(input), 'root');
    case 'xml2json': return JSON.stringify(RecastEngine.xmlToJson(input), null, 2);
    case 'flatten':  return JSON.stringify(RecastEngine.flattenObj(JSON.parse(input)), null, 2);
    case 'unflatten': return JSON.stringify(RecastEngine.unflattenObj(JSON.parse(input)), null, 2);
    case 'json2yaml': return RecastEngine.jsonToYaml(JSON.parse(input));
    case 'yaml2json': return JSON.stringify(RecastEngine.yamlToJson(input), null, 2);
    case 'json2markdown': return RecastEngine.jsonToMarkdownTable(JSON.parse(input));
    case 'markdown2json': return JSON.stringify(RecastEngine.markdownTableToJson(input, {}), null, 2);
    default: throw new Error('unknown mode: ' + mode);
  }
}

function buildApiSnippet(lang, mode, input) {
  const bodyObj = { mode: mode, input: input };
  const bodyJson = JSON.stringify(bodyObj);
  if (lang === 'curl') {
    return `curl https://tryrecast.app/v1/convert \\\n  -H "Authorization: Bearer rk_live_YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyJson}'`;
  }
  if (lang === 'js') {
    return `const res = await fetch('https://tryrecast.app/v1/convert', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer rk_live_YOUR_KEY',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify(${JSON.stringify(bodyObj, null, 2)})\n});\nconst data = await res.json();\nconsole.log(data.output);`;
  }
  if (lang === 'python') {
    return `import requests\n\nres = requests.post(\n    "https://tryrecast.app/v1/convert",\n    headers={"Authorization": "Bearer rk_live_YOUR_KEY"},\n    json=${bodyJson}\n)\nprint(res.json()["output"])`;
  }
  return '';
}

let playgroundLang = 'curl';
function updatePlaygroundSnippet() {
  const modeEl = $('playgroundMode'), inputEl2 = $('playgroundInput'), codeEl = $('playgroundCode');
  if (!modeEl || !inputEl2 || !codeEl) return;
  codeEl.textContent = buildApiSnippet(playgroundLang, modeEl.value, inputEl2.value);
}
function runPlayground() {
  const modeEl = $('playgroundMode'), inputEl2 = $('playgroundInput'), outputEl2 = $('playgroundOutput');
  if (!modeEl || !inputEl2 || !outputEl2) return;
  try {
    outputEl2.textContent = runPlaygroundConversion(modeEl.value, inputEl2.value);
    outputEl2.classList.remove('playground-error');
    track('api_playground_run', { mode: modeEl.value, success: true });
  } catch (e) {
    outputEl2.textContent = 'Error: ' + e.message;
    outputEl2.classList.add('playground-error');
    track('api_playground_run', { mode: modeEl.value, success: false });
  }
  updatePlaygroundSnippet();
}
$('playgroundRunBtn')?.addEventListener('click', runPlayground);
$('playgroundMode')?.addEventListener('change', updatePlaygroundSnippet);
$('playgroundInput')?.addEventListener('input', updatePlaygroundSnippet);
document.querySelectorAll('.playground-snippet-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    playgroundLang = tab.dataset.lang;
    document.querySelectorAll('.playground-snippet-tab').forEach(t => t.classList.toggle('active', t === tab));
    updatePlaygroundSnippet();
  });
});
$('playgroundCopyBtn')?.addEventListener('click', () => {
  const codeEl = $('playgroundCode');
  if (!codeEl) return;
  navigator.clipboard?.writeText(codeEl.textContent);
  const btn = $('playgroundCopyBtn');
  const original = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => { btn.textContent = original; }, 1500);
});
updatePlaygroundSnippet();

// init
// A tool landing page (/tools/json-to-csv.html etc.) can set
// window.RECAST_DEFAULT_MODE before this script runs to open directly on
// that tool instead of the general default — same engine, same page,
// just a different starting point so each URL matches its search intent.
const initialMode = (typeof window !== 'undefined' && window.RECAST_DEFAULT_MODE && modeConfig[window.RECAST_DEFAULT_MODE]) ? window.RECAST_DEFAULT_MODE : 'json2csv';
// ---------------- Command palette (Cmd/Ctrl+K) ----------------
// Jump straight to any of the 23+ modes by name instead of hunting through
// the group tabs — built for the daily-use crowd Pro is priced for.
const cmdkItems = Array.from(document.querySelectorAll('.mode-chip[data-mode]')).map(chip => ({
  mode: chip.dataset.mode,
  group: chip.dataset.group,
  label: chip.textContent.trim(),
}));
let cmdkActiveIndex = -1;
let cmdkFiltered = [];

function cmdkGroupLabel(group) {
  const btn = document.querySelector(`.mode-group-btn[data-group="${group}"]`);
  return btn ? btn.textContent.trim() : group;
}

function updateCmdkActiveClass() {
  const items = $('cmdkResults').querySelectorAll('.cmdk-item');
  items.forEach((el, i) => el.classList.toggle('active', i === cmdkActiveIndex));
  const activeEl = $('cmdkResults').querySelector('.cmdk-item.active');
  if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
}

function selectCmdkItem(idx) {
  const item = cmdkFiltered[idx];
  if (!item) return;
  closeCmdk();
  setMode(item.mode); // setMode already switches to the item's own group internally
  track('command_palette_select', { mode: item.mode });
}

function renderCmdkResults(query) {
  const q = query.trim().toLowerCase();
  cmdkFiltered = q ? cmdkItems.filter(it => it.label.toLowerCase().includes(q)) : cmdkItems;
  cmdkActiveIndex = cmdkFiltered.length ? 0 : -1;
  const resultsEl = $('cmdkResults');
  if (!cmdkFiltered.length) {
    resultsEl.innerHTML = '<div class="cmdk-empty">No matching tool.</div>';
    return;
  }
  resultsEl.innerHTML = cmdkFiltered.map((it, i) => `
    <div class="cmdk-item${i === 0 ? ' active' : ''}" data-idx="${i}">
      <svg class="ico"><use href="#ico-json"/></svg>
      <span>${RecastHighlight.escapeHtml(it.label)}</span>
      <span class="cmdk-group">${RecastHighlight.escapeHtml(cmdkGroupLabel(it.group))}</span>
    </div>
  `).join('');
  resultsEl.querySelectorAll('.cmdk-item').forEach(el => {
    el.addEventListener('click', () => selectCmdkItem(parseInt(el.dataset.idx, 10)));
    el.addEventListener('mouseenter', () => { cmdkActiveIndex = parseInt(el.dataset.idx, 10); updateCmdkActiveClass(); });
  });
}

function openCmdk() {
  $('cmdkOverlay').classList.add('show');
  $('cmdkInput').value = '';
  renderCmdkResults('');
  setTimeout(() => $('cmdkInput').focus(), 10);
  track('command_palette_open', { mode: currentMode });
}
function closeCmdk() { $('cmdkOverlay').classList.remove('show'); }

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if ($('cmdkOverlay').classList.contains('show')) closeCmdk(); else openCmdk();
  }
});
$('cmdkInput')?.addEventListener('input', (e) => renderCmdkResults(e.target.value));
$('cmdkInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); cmdkActiveIndex = Math.min(cmdkActiveIndex + 1, cmdkFiltered.length - 1); updateCmdkActiveClass(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); cmdkActiveIndex = Math.max(cmdkActiveIndex - 1, 0); updateCmdkActiveClass(); }
  else if (e.key === 'Enter') { e.preventDefault(); selectCmdkItem(cmdkActiveIndex); }
  else if (e.key === 'Escape') { closeCmdk(); }
});
$('cmdkOverlay')?.addEventListener('click', (e) => { if (e.target.id === 'cmdkOverlay') closeCmdk(); });

setMode(initialMode);
inputEl.value = samples[initialMode] || samples.json2csv;
updateCounts();
updateHighlightLayers();
restoreFromShareLink();
renderHistoryList();
