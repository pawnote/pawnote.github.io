(function () {
  var $ = function (id) { return document.getElementById(id); };
  var PRODUCT_ID = 'birthday';                       // must match the id in config.js
  var P = ((window.SITE && SITE.products) || []).filter(function (p) { return p.id === PRODUCT_ID; })[0];
  if (P) { $('title').textContent = P.name; document.title = P.name + ' | ' + SITE.name; $('priceSlot').appendChild(PawnotePriceBox(P)); }

  /* pack what the customer typed into the link, and read it back */
  function encode(o) { var b = new TextEncoder().encode(JSON.stringify(o)), s = ''; b.forEach(function (x) { s += String.fromCharCode(x); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function decode(t) { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var s = atob(t), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return JSON.parse(new TextDecoder().decode(b)); }

  var m = /^#l=([A-Za-z0-9_-]+)$/.exec(location.hash || '');
  if (m) {                                           // opened from a paid link
    try { var d = decode(m[1]); $('make').hidden = true; $('view').hidden = false; $('vTo').textContent = 'For ' + d.to; $('vMsg').textContent = d.msg; } catch (e) {}
  }
  $('pay').addEventListener('click', function () {   // the pay button hands over to the shared checkout page
    var to = $('toName').value.trim(), msg = $('msg').value.trim();
    if (!to || !msg) { $('note').textContent = 'Add their name and your message first.'; return; }
    var r = PawnoteCheckout.start({ product: PRODUCT_ID, code: encode({ to: to, msg: msg }), summary: 'Gift for ' + to, details: { 'For': to, 'Message': msg } });
    $('note').textContent = r.opened ? 'Checkout opened in a new tab.' : 'Could not open a new tab. Allow pop-ups and try again.';
  });
})();
