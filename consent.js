/* SEEON consent banner.
   Google Analytics loads only after explicit consent (Art. 6(1)(a) GDPR, § 25 TDDDG).
   Without consent no analytics script is loaded and no cookie is set.
   The choice itself is kept in localStorage (strictly necessary). */
(function () {
  var GA_ID = 'G-7R87QZLWT5';
  var KEY = 'seeon_consent_v1';
  var consented = false;
  var gaLoaded = false;

  window.dataLayer = window.dataLayer || [];
  // Calls made by the pages before or without consent are discarded.
  window.gtag = function () { if (consented) window.dataLayer.push(arguments); };

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var TEXTS = {};
  function pageLang() { var l = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2); return TEXTS[l] ? l : 'en'; }
  function T() { return TEXTS[pageLang()]; }
  TEXTS.de = {
    text: 'Wir möchten mit Google Analytics sehen, wie diese Website genutzt wird. Dafür werden Cookies gesetzt, Daten können in die USA übermittelt werden. Nur mit Ihrer Zustimmung, jederzeit widerrufbar.',
    privacy: 'Datenschutzerklärung',
    accept: 'Akzeptieren',
    decline: 'Ablehnen',
    label: 'Cookie-Einwilligung'
  };
  TEXTS.en = {
    text: 'We would like to use Google Analytics to see how this website is used. This sets cookies and may transfer data to the USA. Only with your consent, which you can withdraw at any time.',
    privacy: 'Privacy policy',
    accept: 'Accept',
    decline: 'Decline',
    label: 'Cookie consent'
  };

  TEXTS.fr = {
    text: 'Nous aimerions utiliser Google Analytics pour comprendre comment ce site est utilisé. Des cookies sont alors déposés et des données peuvent être transférées aux États-Unis. Uniquement avec votre consentement, révocable à tout moment.',
    privacy: 'Politique de confidentialité',
    accept: 'Accepter',
    decline: 'Refuser',
    label: 'Consentement aux cookies'
  };
  TEXTS.es = {
    text: 'Nos gustaría usar Google Analytics para ver cómo se utiliza este sitio web. Para ello se instalan cookies y los datos pueden transferirse a EE. UU. Solo con su consentimiento, que puede retirar en cualquier momento.',
    privacy: 'Política de privacidad',
    accept: 'Aceptar',
    decline: 'Rechazar',
    label: 'Consentimiento de cookies'
  };
  TEXTS.pt = {
    text: 'Gostaríamos de usar o Google Analytics para perceber como este site é utilizado. Para isso são definidos cookies e os dados podem ser transferidos para os EUA. Apenas com o seu consentimento, que pode retirar a qualquer momento.',
    privacy: 'Política de privacidade',
    accept: 'Aceitar',
    decline: 'Recusar',
    label: 'Consentimento de cookies'
  };
  TEXTS.it = {
    text: 'Vorremmo usare Google Analytics per capire come viene utilizzato questo sito. In questo modo vengono impostati cookie e i dati possono essere trasferiti negli Stati Uniti. Solo con il suo consenso, revocabile in qualsiasi momento.',
    privacy: 'Informativa sulla privacy',
    accept: 'Accetta',
    decline: 'Rifiuta',
    label: 'Consenso ai cookie'
  };

  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    consented = true;
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearGACookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_ga/.test(name) || /^_gid$/.test(name)) {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  var css =
    '#seeon-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:760px;margin:0 auto;' +
    'background:#fff;color:#111;border:1px solid rgba(17,17,17,.14);border-radius:6px;box-shadow:0 12px 40px rgba(17,17,17,.14);' +
    'padding:20px 22px;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif}' +
    '#seeon-consent p{margin:0 0 14px}' +
    '#seeon-consent a{color:#405e8d;text-decoration:underline}' +
    '#seeon-consent .sc-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}' +
    '#seeon-consent button{min-height:44px;padding:0 22px;border-radius:4px;font:inherit;font-weight:650;cursor:pointer;' +
    'border:1px solid #405e8d;background:#f4f5f8;color:#405e8d}' +
    '#seeon-consent button:hover{background:#e9edf3}' +
    '@media (max-width:560px){#seeon-consent .sc-row button{flex:1 1 0}}' +
    '.consent-link{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}';

  function injectCSS() {
    if (document.getElementById('seeon-consent-css')) return;
    var st = document.createElement('style');
    st.id = 'seeon-consent-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function hide() { var b = document.getElementById('seeon-consent'); if (b) b.remove(); }

  function show() {
    injectCSS();
    hide();
    var b = document.createElement('div');
    b.id = 'seeon-consent';
    b.setAttribute('role', 'dialog');
    var t = T();
    b.setAttribute('aria-label', t.label);
    b.innerHTML =
      '<p>' + t.text + ' <a href="/privacy/#' + (pageLang() === 'de' ? 'de' : 'en') + '">' + t.privacy + '</a></p>' +
      '<div class="sc-row">' +
      '<button type="button" data-c="0">' + t.decline + '</button>' +
      '<button type="button" data-c="1">' + t.accept + '</button>' +
      '</div>';
    b.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute('data-c');
      if (v === null || v === undefined) return;
      if (v === '1') { write('granted'); hide(); loadGA(); }
      else {
        var wasOn = gaLoaded;
        write('denied'); consented = false; hide(); clearGACookies();
        if (wasOn) location.reload();
      }
    });
    document.body.appendChild(b);
  }

  window.seeonConsent = {
    open: show,
    refresh: function () { if (document.getElementById('seeon-consent')) show(); }
  };

  var state = read();
  if (state === 'granted') loadGA();

  function init() {
    injectCSS();
    document.querySelectorAll('[data-consent-open]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); show(); });
    });
    if (state !== 'granted' && state !== 'denied') show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
