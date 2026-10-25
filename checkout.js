(function () {
  'use strict';
  var S = window.SITE || {}, sym = S.symbol || '₹';
  var API = String(S.apiBase || '').replace(/\/+$/, '');
  function $(id) { return document.getElementById(id); }
  function fm(n) { return sym + Number(n).toLocaleString('en-IN'); }
  var ORDER_KEY = 'pawnote-order-v1', PAID_KEY = 'pawnote-paid-v1', BUYER_KEY = 'pawnote-buyer-v1';

  var order = null;
  try { order = JSON.parse(localStorage.getItem(ORDER_KEY) || 'null'); } catch (e) {}
  var product = order && (S.products || []).filter(function (p) { return p.id === order.product && p.status === 'live'; })[0];
  if (!order || !product || !order.code || !/^PN-[A-Z2-9]{8}$/.test(order.id || '')) { $('empty').hidden = false; return; }
  $('co').hidden = false;

  /* ---- talking to the API ---- */
  function api(path, body) {
    if (!API) return Promise.resolve({ ok: false, status: 0, data: { error: 'not-configured' } });
    return fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, data: j }; }); })
      .catch(function () { return { ok: false, status: 0, data: { error: 'network' } }; });
  }

  /* ---- order summary. The amount that is charged is always the server's number. ---- */
  $('sumImg').src = product.image || ''; $('sumName').textContent = product.name; $('sumFor').textContent = order.summary || '';
  var quote = null;   // { coupon, discount, total, label } from the server
  function totals() {
    var offer = Math.max(0, product.regular - product.price);
    var cd = quote ? quote.discount : 0, total = quote ? quote.total : product.price;
    return { regular: product.regular, offer: offer, coupon: cd, total: total, saved: offer + cd };
  }
  function li(label, value, cls) {
    var l = document.createElement('li'); if (cls) l.className = cls;
    var a = document.createElement('span'), b = document.createElement('span');
    if (label && label.nodeType) a.appendChild(label); else a.textContent = label;
    if (value && value.nodeType) b.appendChild(value); else b.textContent = value;
    l.appendChild(a); l.appendChild(b); return l;
  }
  function setMsg(t, kind) { var m = $('couponMsg'); m.textContent = t; m.className = 'coupon-msg' + (kind ? ' ' + kind : ''); }
  function render() {
    var t = totals(), rows = $('rows'); rows.textContent = '';
    var s = document.createElement('s'); s.textContent = fm(t.regular);
    rows.appendChild(li('Regular price', s));
    if (t.offer > 0) rows.appendChild(li('Launch offer', '−' + fm(t.offer), 'minus'));
    if (quote && quote.coupon) {
      var lab = document.createElement('span'); lab.appendChild(document.createTextNode('Coupon ' + quote.coupon + ' '));
      var rm = document.createElement('button'); rm.type = 'button'; rm.className = 'linkbtn'; rm.textContent = 'Remove';
      rm.addEventListener('click', function () { quote = null; $('couponInput').value = ''; setMsg('Coupon removed.'); render(); });
      lab.appendChild(rm); rows.appendChild(li(lab, '−' + fm(t.coupon), 'minus'));
    }
    rows.appendChild(li('Total', fm(t.total), 'total'));
    var sv = $('savedAll'); sv.hidden = t.saved <= 0; sv.textContent = 'You save ' + fm(t.saved) + ' in total';
    $('payBtn').textContent = t.total > 0 ? 'Pay ' + fm(t.total) : 'Get my link (free)';
  }
  $('couponForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var code = $('couponInput').value.trim().toUpperCase(); if (!code) { setMsg('Enter a coupon code first.', 'err'); return; }
    setMsg('Checking…'); $('couponApply').disabled = true;
    api('/api/quote', { product: product.id, coupon: code }).then(function (r) {
      $('couponApply').disabled = false;
      if (!r.ok) { setMsg(r.data && r.data.error && r.data.error !== 'network' && r.data.error !== 'not-configured' ? r.data.error : 'Coupons are not available right now. Please try again in a moment.', 'err'); return; }
      quote = { coupon: r.data.coupon, discount: r.data.discount, total: r.data.total, label: r.data.label };
      setMsg((quote.label ? quote.label + ' applied. ' : 'Coupon applied. ') + 'You save ' + fm(quote.discount) + '.', 'ok'); render();
    });
  });

  /* ---- buyer details ---- */
  var E = { name: $('bName'), email: $('bEmail'), phone: $('bPhone'), agree: $('bAgree'), updates: $('bUpdates') };
  try {
    var bs = JSON.parse(localStorage.getItem(BUYER_KEY) || '{}');
    E.name.value = bs.name || ''; E.email.value = bs.email || ''; E.phone.value = bs.phone || ''; E.updates.checked = !!bs.updates; E.agree.checked = !!bs.agree;
  } catch (e) {}
  function buyer() {
    var p = E.phone.value.replace(/[^\d+]/g, '').replace(/^\+/, '');
    if (/^\d{10}$/.test(p)) p = '91' + p;
    return { name: E.name.value.trim(), email: E.email.value.trim(), phone: p ? '+' + p : '', agree: E.agree.checked, updates: E.updates.checked };
  }
  function say(t, err) { var m = $('payMsg'); m.textContent = t; m.className = 'msg' + (err ? ' err' : ''); }
  function checkBuyer() {
    var b = buyer(), bad = null, msg = '';
    [E.name, E.email, E.phone].forEach(function (i) { i.removeAttribute('aria-invalid'); });
    if (b.name.length < 2) { bad = E.name; msg = 'Enter your full name.'; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.email)) { bad = E.email; msg = 'Enter a valid email address, like you@example.com.'; }
    else if (!/^\+\d{10,14}$/.test(b.phone)) { bad = E.phone; msg = 'Enter a valid mobile number with 10 digits.'; }
    else if (!b.agree) { bad = E.agree; msg = 'Please tick the box to agree to the Terms and Privacy policy.'; }
    if (bad) { if (bad.type !== 'checkbox') bad.setAttribute('aria-invalid', 'true'); say(msg, true); bad.focus(); return null; }
    try { localStorage.setItem(BUYER_KEY, JSON.stringify({ name: b.name, email: b.email, phone: E.phone.value.trim(), agree: b.agree, updates: b.updates })); } catch (e) {}
    return b;
  }

  /* ---- after payment ---- */
  function linkUrl() { var u = new URL(product.url, location.href); u.hash = (order.hashKey || 'l') + '=' + order.code; return u.href; }
  function paidMap() { try { return JSON.parse(localStorage.getItem(PAID_KEY) || '{}'); } catch (e) { return {}; } }
  function markPaid(id) { var m = paidMap(); m[order.id] = id; try { localStorage.setItem(PAID_KEY, JSON.stringify(m)); } catch (e) {} }
  function showDone(payId, again) {
    var href = linkUrl();
    $('doneUrl').value = href; $('doneOpen').href = href;
    $('doneOrder').textContent = 'Order ID: ' + order.id + '. Quote it if you ever need help finding your letter.';
    $('doneNote').textContent = again ? 'You already paid for this letter (' + payId + '). Here is its link again.' : (String(payId).indexOf('FREE') === 0 ? 'Your coupon covered the full price. Copy your link and send it.' : 'Payment confirmed (' + payId + '). Copy your link and send it.');
    $('detailsPanel').hidden = true; $('couponForm').style.display = 'none'; $('done').hidden = false; $('qrPanel').hidden = false;
    $('coSub').textContent = 'All done. Send the link or the heart code to the person it is for.';
    $('qrCompany').value = S.name || ''; $('qrItem').value = product.name;
    buildQR(); $('doneUrl').focus({ preventScroll: true });
  }
  $('doneNew').addEventListener('click', function () {
    try { localStorage.removeItem(ORDER_KEY); } catch (e) {}
    location.href = product.url;
   });
  $('doneCopy').addEventListener('click', function () {
    var inp = $('doneUrl'), b = $('doneCopy');
    var ok = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
    var fb = function () { inp.focus(); inp.select(); try { document.execCommand('copy'); } catch (e) {} ok(); };
    try { navigator.clipboard.writeText(inp.value).then(ok, fb); } catch (e) { fb(); }
  });

  /* ---- heart QR code ---- */
  var qrObj = null, qrTimer = null, qrFull = null;
  function slug(s) { return String(s || 'code').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'code'; }
  function qrNote(t, err) { var m = $('qrMsg'); m.textContent = t; m.className = 'msg' + (err ? ' err' : ''); }
  function buildQR() {
    if (!window.PawnoteQR || !window.qrcode) { qrNote('The QR code could not load. Your link above still works.', true); return; }
    try { qrObj = PawnoteQR.make({ link: $('doneUrl').value, company: $('qrCompany').value, item: $('qrItem').value }); }
    catch (e) { qrObj = null; qrNote('This letter is too long to fit in a QR code. Shorten it a little and make a new one, or share the link above.', true); $('qrCanvas').hidden = true; return; }
    var run = function () {
      qrFull = document.createElement('canvas'); qrObj.draw(qrFull);
      var pv = $('qrCanvas'), w = 620, h = Math.round(w * qrFull.height / qrFull.width);
      pv.width = w; pv.height = h; pv.hidden = false; pv.getContext('2d').drawImage(qrFull, 0, 0, w, h);
      qrNote('Scan it with a phone camera to test it before you print.');
    };
    if (document.fonts && document.fonts.load) { document.fonts.load('800 80px "Baloo 2"').then(run, run); } else { run(); }
  }
  function onLabel() { clearTimeout(qrTimer); qrTimer = setTimeout(buildQR, 350); }
  $('qrCompany').addEventListener('input', onLabel); $('qrItem').addEventListener('input', onLabel);
  function save(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function fileBase() { return slug($('qrCompany').value) + '-' + slug($('qrItem').value) + '-heart-qr'; }
  $('qrPng').addEventListener('click', function () {
    if (!qrFull) return; qrFull.toBlob(function (b) { if (b) save(b, fileBase() + '.png'); else qrNote('Could not create the image.', true); }, 'image/png');
  });
  $('qrSvg').addEventListener('click', function () { if (qrObj) save(new Blob([qrObj.svg()], { type: 'image/svg+xml' }), fileBase() + '.svg'); });
  if (navigator.share) {
    $('qrShare').hidden = false;
    $('qrShare').addEventListener('click', function () {
      if (!qrFull) return;
      qrFull.toBlob(function (b) {
        var file = b && new File([b], fileBase() + '.png', { type: 'image/png' });
        var data = { title: ($('qrCompany').value || 'Gift') + ' - ' + $('qrItem').value, text: 'Scan to open your gift', url: $('doneUrl').value };
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
        navigator.share(data).catch(function () {});
      }, 'image/png');
    });
  }

  /* ---- pay: create order on the server, open Razorpay, verify the signature on the server ---- */
  function details() { return order.details || {}; }
  function loadRazorpay(cb) {
    if (window.Razorpay) { cb(true); return; }
    var sc = document.createElement('script'); sc.src = 'https://checkout.razorpay.com/v1/checkout.js';
    sc.onload = function () { cb(!!window.Razorpay); }; sc.onerror = function () { cb(false); };
    document.head.appendChild(sc);
  }
  function fail(btn, text) { btn.disabled = false; say(text, true); }
  $('payBtn').addEventListener('click', function () {
    var b = checkBuyer(); if (!b) return;
    var btn = $('payBtn');
    if (!API) { say('Payments are not set up yet. Add your API address as apiBase in config.js.', true); return; }
    btn.disabled = true; say('Starting your order…');
    var coupon = quote ? quote.coupon : '';
    api('/api/create-order', { product: product.id, coupon: coupon, orderId: order.id, buyer: { name: b.name, email: b.email, phone: b.phone, updates: b.updates } }).then(function (r) {
      if (!r.ok) { fail(btn, r.status === 0 ? 'Could not reach the payment service. Check your connection and try again.' : (r.data.error || 'Could not start the payment.')); return; }
      if (r.data.free) {
        api('/api/claim-free', { product: product.id, coupon: coupon, orderId: order.id, buyer: { name: b.name, email: b.email, phone: b.phone, updates: b.updates }, link: linkUrl(), details: details() }).then(function (c) {
          btn.disabled = false;
          if (!c.ok) { say(c.data.error || 'Could not complete your order.', true); return; }
          markPaid('FREE-' + coupon); showDone('FREE-' + coupon, false);
        });
        return;
      }
      loadRazorpay(function (ok) {
        if (!ok) { fail(btn, 'Could not load the payment window. Check your connection and try again.'); return; }
        var o = r.data;
        var rz = new window.Razorpay({
          key: o.key_id, order_id: o.order_id, amount: o.amount, currency: o.currency, name: S.name || 'Pawnote', description: product.name,
          prefill: { name: b.name, email: b.email, contact: b.phone },
          theme: { color: '#7a5ce0' },
          handler: function (res) {
            say('Confirming your payment…');
            api('/api/verify-payment', { razorpay_order_id: res.razorpay_order_id, razorpay_payment_id: res.razorpay_payment_id, razorpay_signature: res.razorpay_signature, orderId: order.id, link: linkUrl(), details: details() }).then(function (v) {
              btn.disabled = false;
              if (!v.ok) { say('We could not confirm your payment. If you were charged, write to support with order ID ' + order.id + ' and payment ID ' + res.razorpay_payment_id + '.', true); return; }
              markPaid(res.razorpay_payment_id); showDone(res.razorpay_payment_id, false);
            });
          },
          modal: { ondismiss: function () { btn.disabled = false; say('Payment cancelled. Nothing was charged.'); } }
        });
        rz.on('payment.failed', function (resp) { btn.disabled = false; say('The payment did not go through' + (resp && resp.error && resp.error.description ? ': ' + resp.error.description : '') + '. You can try again.', true); });
        rz.open();
      });
    });
  });

  render();
  var already = paidMap()[order.id];
  if (already) showDone(already, true);
})();
