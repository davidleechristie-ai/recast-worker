(function () {
  'use strict';

  var landingKey = 'recast_release3_landing_path_v1';
  var internalKey = 'recast_release3_internal_path_v1';

  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (_) {}
  }

  function pathOnly(value) {
    try { return new URL(value, location.origin).pathname; } catch (_) { return ''; }
  }

  function captureLanding() {
    try {
      if (!sessionStorage.getItem(landingKey)) {
        sessionStorage.setItem(landingKey, location.pathname);
        track('source_landing_page', { landing_path: location.pathname });
      }
    } catch (_) {}
  }

  function capturePageIntent() {
    if (/^\/tools\/[^/]+(?:\.html)?$/.test(location.pathname) && !/\/tools\/?(?:index\.html)?$/.test(location.pathname)) {
      track('tool_opened', { tool_path: location.pathname });
    }
    if (/^\/api(?:\/|$)/.test(location.pathname)) {
      track('api_documentation_viewed', { source_path: location.pathname });
    }
  }

  function setupPricingView() {
    var pricing = document.getElementById('pricing');
    if (!pricing || typeof IntersectionObserver !== 'function') return;
    var seen = false;
    var observer = new IntersectionObserver(function (entries) {
      if (seen || !entries.some(function (entry) { return entry.isIntersecting; })) return;
      seen = true;
      track('pricing_viewed', { source_path: location.pathname, reason: 'section_view' });
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(pricing);
  }

  function setupClickPaths() {
    document.addEventListener('click', function (event) {
      var el = event.target && event.target.closest ? event.target.closest('a,button') : null;
      if (!el) return;
      var id = el.id || '';
      var href = el.tagName === 'A' ? (el.getAttribute('href') || '') : '';
      var checkoutIds = new Set(['btnProMonthly','btnProYearly','btnApiMonthly','btnApiYearly','btnAutomationMonthly','btnAutomationYearly']);
      if (checkoutIds.has(id)) track('checkout_started', { plan_control: id, source_path: location.pathname });
      if (href.indexOf('#pricing') !== -1) track('pricing_viewed', { source_path: location.pathname, reason: 'pricing_link' });

      var destination = pathOnly(href);
      if (!destination || destination === location.pathname) return;
      if (/^\/(?:app|automation|api)(?:\/|$)/.test(destination)) {
        var payload = { from_path: location.pathname, to_path: destination };
        track('internal_conversion_path', payload);
        try { sessionStorage.setItem(internalKey, JSON.stringify(payload)); } catch (_) {}
      }
    }, true);
  }

  function instrumentVerifiedPurchase() {
    if (typeof window.fetch !== 'function') return;
    var originalFetch = window.fetch.bind(window);
    window.fetch = function () {
      var args = arguments;
      var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
      return originalFetch.apply(window, args).then(function (response) {
        if (String(url).indexOf('/api/verify-session') !== -1 && response && response.ok) {
          try {
            response.clone().json().then(function (data) {
              if (data && data.token && data.entitled) {
                track('purchase_entitlement_confirmed', { plan: data.plan || 'paid', status: data.status || 'active' });
              }
            }).catch(function () {});
          } catch (_) {}
        }
        return response;
      });
    };
  }

  instrumentVerifiedPurchase();
  captureLanding();
  capturePageIntent();
  setupClickPaths();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupPricingView);
  else setupPricingView();
})();
