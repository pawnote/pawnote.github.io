/* Shared by every product page. A product page calls PawnoteCheckout.start(...) from its pay button.
   The checkout page reads the product's name, image and price from config.js, so a new product
   needs no change to checkout.html.

   PawnoteCheckout.start({
     product: 'id-from-config',        // the id of the product in config.js
     code: 'text-your-page-reads',     // whatever your page needs to rebuild the customer's gift from the link (after #l=)
     summary: 'Letter for Anna',       // one short line shown in the order summary
     details: { 'Label': 'value', ... } // what the customer filled in; saved to your Google Sheet (Orders tab)
   })
   Returns { opened: true/false }. */
(function () {
  function newOrderId() {
    var a = new Uint8Array(8), ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = 'PN-';
    try { crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < 8; i++) a[i] = Math.floor(Math.random() * 256); }
    for (var j = 0; j < 8; j++) out += ch.charAt(a[j] % ch.length);
    return out;
  }
  window.PawnoteCheckout = {
    start: function (o) {
      var order = { id: newOrderId(), product: o.product, code: o.code, summary: o.summary || '', details: o.details || {}, letter: o.letter || null, t: Date.now() };
      try { localStorage.setItem('pawnote-order-v1', JSON.stringify(order)); } catch (e) { return { opened: false, error: 'storage' }; }
      // var w = null; try { w = window.open('checkout.html', '_blank'); } catch (e) {}
      // return { opened: !!w };
      window.location.href = 'checkout.html';
      return { opened: true };
    }
  };
})();
