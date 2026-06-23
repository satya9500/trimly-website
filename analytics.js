// Trimly analytics — Google Analytics 4 with Consent Mode v2 + a lightweight
// consent banner. Loaded on every page. No data is collected until the visitor
// accepts. No build step, no dependencies.
(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────
  // Your GA4 Measurement ID. Find it in GA4 → Admin → Data Streams → Web.
  // Until this is set to a real "G-…" id, analytics stays dormant (the consent
  // banner and event wiring still run, but nothing is loaded or sent).
  var GA_MEASUREMENT_ID = 'G-13017HRGYT';

  var CONSENT_KEY = 'trimly_analytics_consent'; // 'granted' | 'denied'
  var configured =
    GA_MEASUREMENT_ID.indexOf('G-') === 0 && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';

  // ── gtag bootstrap ──────────────────────────────────────────────────────
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // Consent Mode v2 — deny storage by default until the visitor opts in.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  var stored = null;
  try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) { /* no storage */ }
  if (stored === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted' });
  }

  // Load GA4 (it respects the consent state set above).
  if (configured) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function setConsent(value) {
    var granted = value === 'granted';
    try { localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied'); } catch (e) {}
    gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
  }

  // ── Event tracking ──────────────────────────────────────────────────────
  function track(name, params) { gtag('event', name, params || {}); }

  function storeFromText(text) {
    text = (text || '').toLowerCase();
    if (text.indexOf('app store') !== -1 || text.indexOf('apple') !== -1) return 'app_store';
    if (text.indexOf('google play') !== -1 || text.indexOf('play') !== -1) return 'google_play';
    return 'unknown';
  }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
    if (!el) return;

    // App Store / Google Play badges (hero + CTA band).
    var badge = el.closest('.store-badge');
    if (badge) {
      var label = badge.getAttribute('aria-label') || badge.textContent || '';
      track('store_click', {
        store: storeFromText(label),
        location: badge.closest('.cta-band') ? 'cta_band' : 'hero',
        link_text: label.trim()
      });
      return;
    }

    // "Get the app" primary CTAs (header + footer).
    var txt = (el.textContent || '').trim();
    if (el.matches('a.btn-primary') && txt.toLowerCase().indexOf('get the app') !== -1) {
      track('get_app_click', { link_text: txt });
    }
  }, true);

  // ── Consent banner ──────────────────────────────────────────────────────
  if (stored !== 'granted' && stored !== 'denied') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderBanner);
    } else {
      renderBanner();
    }
  }

  function renderBanner() {
    var banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Privacy consent');
    banner.innerHTML =
      '<p class="consent-text">We use Google Analytics to understand how people use Trimly. ' +
      'Nothing is collected until you accept. See our <a href="/privacy.html">Privacy Policy</a>.</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn btn-ghost consent-decline">Decline</button>' +
      '<button type="button" class="btn btn-primary consent-accept">Accept</button>' +
      '</div>';

    function dismiss(value) {
      setConsent(value);
      banner.classList.remove('show');
      window.setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 300);
    }

    banner.querySelector('.consent-accept').addEventListener('click', function () { dismiss('granted'); });
    banner.querySelector('.consent-decline').addEventListener('click', function () { dismiss('denied'); });

    document.body.appendChild(banner);
    // Next frame → trigger the slide-in transition.
    window.requestAnimationFrame(function () { banner.classList.add('show'); });
  }
})();
