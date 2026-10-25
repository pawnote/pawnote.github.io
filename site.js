(function () {
  var S = window.SITE || {};
  var sym = S.symbol || '₹';
  function money(n) { return sym + Number(n).toLocaleString('en-IN'); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var page = (location.pathname.split('/').pop() || 'index.html');

  var PAW = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="10" fill="#7a5ce0"/><path fill="#fff" d="M16 25.5c-4.6-3.3-7-5.6-7-8.6 0-2 1.5-3.4 3.4-3.4 1.4 0 2.8.8 3.6 2 .8-1.2 2.2-2 3.6-2 1.9 0 3.4 1.4 3.4 3.4 0 3-2.4 5.3-7 8.6z"/><circle cx="9.5" cy="10" r="2.2" fill="#ffb0c8"/><circle cx="14" cy="7.3" r="2.2" fill="#ffb0c8"/><circle cx="18.5" cy="7.3" r="2.2" fill="#ffb0c8"/><circle cx="23" cy="10" r="2.2" fill="#ffb0c8"/></svg>';
  var TICK = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="currentColor" opacity=".18"/><path d="M5.5 10.3l3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* header + footer */
  var h = document.getElementById('site-header');
  if (h) {
    var links = [['./', 'Gifts', 'index.html'], ['how-it-works.html', 'How it works', 'how-it-works.html'], ['support.html', 'Support', 'support.html']];
    var nav = links.map(function (l) { return '<a href="' + l[0] + '"' + (page === l[2] || (l[2] === 'index.html' && page === '') ? ' aria-current="page"' : '') + '>' + l[1] + '</a>'; }).join('');
    h.className = 'site-header';
    h.innerHTML = '<div class="wrap"><a class="brand" href="./">' + PAW + '<span></span></a><nav class="nav" aria-label="Main">' + nav + '</nav></div>';
    h.querySelector('.brand span').textContent = S.name || 'Pawnote';
  }
  var f = document.getElementById('site-footer');
  if (f) {
    f.className = 'site-footer';
    f.innerHTML = '<div class="wrap"><div><div class="foot-name"></div><div>Prices in ' + (S.currency || 'INR') + ' (' + sym + ')</div></div>' +
      '<nav aria-label="Footer"><a href="how-it-works.html">How it works</a><a href="support.html">Support</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="refunds.html">Refund policy</a></nav></div>';
    f.querySelector('.foot-name').textContent = '© ' + new Date().getFullYear() + ' ' + (S.name || 'Pawnote');
  }
  document.querySelectorAll('[data-site-name]').forEach(function (n) { n.textContent = S.name || 'Pawnote'; });
  document.querySelectorAll('[data-support-email]').forEach(function (n) {
    n.textContent = S.supportEmail || ''; if (n.tagName === 'A') n.href = 'mailto:' + (S.supportEmail || '');
  });
  document.querySelectorAll('[data-tick]').forEach(function (n) { n.insertAdjacentHTML('afterbegin', TICK); });

  /* price box (shared by cards and the product page) */
  function priceBox(p) {
    var save = Math.max(0, p.regular - p.price);
    var box = el('div', 'price');
    var now = el('div'); var l = el('span', 'lbl', 'New price'); now.appendChild(l); now.appendChild(el('div', 'now', money(p.price)));
    var meta = el('div', 'meta');
    var was = el('span', 'was'); was.appendChild(document.createTextNode('Regular price ')); was.appendChild(el('s', '', money(p.regular)));
    meta.appendChild(was);
    if (save > 0) meta.appendChild(el('span', 'save', 'Save ' + money(save)));
    box.appendChild(now); box.appendChild(meta); return box;
  }
  window.PawnotePriceBox = priceBox;

  /* product grids */
  function card(p) {
    var c = el('article', 'card'), live = p.status === 'live';
    var cover = live ? el('a', 'cover') : el('div', 'cover soon');
    if (live) {
      cover.href = p.url; cover.setAttribute('aria-label', p.name);
      var im = el('img'); im.src = p.image; im.alt = p.name + ' preview'; im.loading = 'lazy'; cover.appendChild(im);
    } else { cover.appendChild(el('span', '', 'Coming soon')); }
    if (p.tag) cover.appendChild(el('span', 'tagline', p.tag));
    var body = el('div', 'body');
    body.appendChild(el('h3', '', p.name)); body.appendChild(el('p', '', p.blurb)); body.appendChild(priceBox(p));
    var here = live && location.pathname.split('/').pop() === String(p.url).split('#')[0].split('?')[0].split('/').pop();
    var b = el('a', 'btn btn-primary btn-wide', here ? 'You are here' : (live ? 'Make it yours' : 'Coming soon'));
    if (live && !here) b.href = p.url; else b.setAttribute('aria-disabled', 'true');
    body.appendChild(b); c.appendChild(cover); c.appendChild(body); return c;
  }
  document.querySelectorAll('[data-products]').forEach(function (g) {
    var want = g.getAttribute('data-products');
    (S.products || []).filter(function (p) { return p.status === want; }).forEach(function (p) { g.appendChild(card(p)); });
    if (!g.children.length) g.parentNode.hidden = true;
  });
  document.querySelectorAll('[data-count]').forEach(function (n) {
    var want = n.getAttribute('data-count');
    var k = (S.products || []).filter(function (p) { return p.status === want; }).length;
    n.textContent = k + (k === 1 ? ' design' : ' designs');
  });
})();
