/* Heart-shaped QR code. The real, scannable QR code sits in the middle of the heart.
   The rest of the heart is filled with decorative dots, kept clear of the code by a quiet margin.
   PawnoteQR.make({ link, company, item }) -> { draw(canvas), svg(), size, modules, ecc } */
(function () {
  var POLY = null;
  function heart() {
    if (POLY) return POLY;
    var pts = [], i, t, x, y, minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (i = 0; i < 360; i++) {
      t = i / 360 * 2 * Math.PI;
      x = 16 * Math.pow(Math.sin(t), 3);
      y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));   // y points down
      pts.push([x, y]); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    POLY = { pts: pts, minX: minX, maxX: maxX, minY: minY, maxY: maxY };
    return POLY;
  }
  function inside(x, y) {
    var p = heart().pts, c = false, j = p.length - 1;
    for (var i = 0; i < p.length; j = i++) {
      if (((p[i][1] > y) !== (p[j][1] > y)) && (x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])) c = !c;
    }
    return c;
  }
  function squareFits(cy, h) {
    for (var k = 0; k <= 20; k++) {
      var s = -h + (2 * h) * k / 20;
      if (!inside(s, cy - h) || !inside(s, cy + h) || !inside(-h, cy + s) || !inside(h, cy + s)) return false;
    }
    return true;
  }
  /* the biggest square that fits inside the heart */
  function bestSquare() {
    var best = { h: 0, cy: 0 };
    for (var cy = -6; cy <= 6; cy += 0.25) {
      var lo = 0, hi = 14;
      for (var it = 0; it < 14; it++) { var mid = (lo + hi) / 2; if (squareFits(cy, mid)) lo = mid; else hi = mid; }
      if (lo > best.h) best = { h: lo, cy: cy };
    }
    return best;
  }
  function seeded(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h += 0x6D2B79F5; var t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function make(o) {
    var qr = null, ecc = '';
    ['H', 'Q', 'M', 'L'].some(function (lv) {
      try { var q = qrcode(0, lv); q.addData(o.link); q.make(); qr = q; ecc = lv; return true; } catch (e) { return false; }
    });
    if (!qr) throw new Error('too long');
    var n = qr.getModuleCount(), Q = 2, hp = heart(), sq = bestSquare();
    var L = sq.h * 2 * 0.97, M = L / (n + 2 * Q), x0 = -L / 2, y0 = sq.cy - L / 2;
    var rnd = seeded(o.link), core = [], decor = [];
    var r, c;
    for (r = 0; r < n; r++) for (c = 0; c < n; c++) if (qr.isDark(r, c)) core.push([x0 + (c + Q) * M, y0 + (r + Q) * M]);
    var ix0 = Math.floor((hp.minX - x0) / M), ix1 = Math.ceil((hp.maxX - x0) / M), iy0 = Math.floor((hp.minY - y0) / M), iy1 = Math.ceil((hp.maxY - y0) / M);
    var e = M * 0.22;
    for (var iy = iy0; iy <= iy1; iy++) for (var ix = ix0; ix <= ix1; ix++) {
      if (ix >= 0 && ix < n + 2 * Q && iy >= 0 && iy < n + 2 * Q) continue;      // the code and its quiet margin
      var X = x0 + ix * M, Y = y0 + iy * M;
      if (!(inside(X + e, Y + e) && inside(X + M - e, Y + e) && inside(X + e, Y + M - e) && inside(X + M - e, Y + M - e))) continue;
      if (rnd() < 0.5) decor.push([X + M / 2, Y + M / 2]);
    }
    var hw = hp.maxX - hp.minX, hh = hp.maxY - hp.minY;
    var S = Math.min(4000 / (hw * 1.12), Math.max(1500 / (hw * 1.12), 8 / M));      // pixels per unit
    var pad = hw * 0.06 * S, W = Math.round(hw * S + pad * 2), top = pad, heartH = hh * S;
    var company = String(o.company || '').trim().slice(0, 40), item = String(o.item || '').trim().slice(0, 50);
    var fs1 = W * 0.075, fs2 = W * 0.052, fs3 = W * 0.036;
    var Ht = Math.round(top + heartH + pad * 0.7 + fs1 * 1.25 + fs2 * 1.35 + fs3 * 1.8 + pad * 0.6);
    function PX(u) { return Math.round((u - hp.minX) * S + pad); }
    function PY(u) { return Math.round((u - hp.minY) * S + top); }
    var cx = W / 2, ty1 = top + heartH + pad * 0.7 + fs1, ty2 = ty1 + fs2 * 1.35, ty3 = ty2 + fs3 * 1.8;
    var FONT = '"Baloo 2","Trebuchet MS",system-ui,sans-serif';
    var GA = '#e0245e', GB = '#5b3fc4';

    function drawTo(ctx) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, Ht);
      var g = ctx.createLinearGradient(PX(hp.minX), PY(hp.minY), PX(hp.maxX), PY(hp.maxY)); g.addColorStop(0, GA); g.addColorStop(1, GB);
      ctx.beginPath(); hp.pts.forEach(function (p, i) { if (i) ctx.lineTo(PX(p[0]), PY(p[1])); else ctx.moveTo(PX(p[0]), PY(p[1])); }); ctx.closePath();
      ctx.fillStyle = '#fff5f9'; ctx.fill(); ctx.lineWidth = Math.max(4, W * 0.01); ctx.strokeStyle = g; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.fillStyle = g;
      core.forEach(function (m) { var a = PX(m[0]), b = PY(m[1]); ctx.fillRect(a, b, PX(m[0] + M) - a, PY(m[1] + M) - b); });
      var rr = M * S * 0.34; ctx.beginPath();
      decor.forEach(function (m) { var a = PX(m[0]), b = PY(m[1]); ctx.moveTo(a + rr, b); ctx.arc(a, b, rr, 0, 6.2832); });
      ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#241f3d';
      ctx.font = '800 ' + fs1 + 'px ' + FONT; if (company) ctx.fillText(company, cx, ty1, W * 0.9);
      ctx.fillStyle = '#4a4470'; ctx.font = '700 ' + fs2 + 'px ' + FONT; if (item) ctx.fillText(item, cx, ty2, W * 0.9);
      ctx.fillStyle = '#7a74a0'; ctx.font = '600 ' + fs3 + 'px ' + FONT; ctx.fillText('Scan to open your gift', cx, ty3, W * 0.9);
    }
    function svg() {
      var d = '', f = function (v) { return Math.round(v * 100) / 100; };
      core.forEach(function (m) { var a = PX(m[0]), b = PY(m[1]), w = PX(m[0] + M) - a, h = PY(m[1] + M) - b; d += 'M' + a + ' ' + b + 'h' + w + 'v' + h + 'h-' + w + 'z'; });
      var rr = f(M * S * 0.34);
      decor.forEach(function (m) { var a = PX(m[0]), b = PY(m[1]); d += 'M' + f(a - rr) + ' ' + b + 'a' + rr + ' ' + rr + ' 0 1 0 ' + f(2 * rr) + ' 0a' + rr + ' ' + rr + ' 0 1 0 -' + f(2 * rr) + ' 0z'; });
      var outline = hp.pts.map(function (p, i) { return (i ? 'L' : 'M') + PX(p[0]) + ' ' + PY(p[1]); }).join('') + 'Z';
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + Ht + '" width="' + W + '" height="' + Ht + '">' +
        '<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="' + PX(hp.minX) + '" y1="' + PY(hp.minY) + '" x2="' + PX(hp.maxX) + '" y2="' + PY(hp.maxY) + '"><stop offset="0" stop-color="' + GA + '"/><stop offset="1" stop-color="' + GB + '"/></linearGradient></defs>' +
        '<rect width="' + W + '" height="' + Ht + '" fill="#fff"/><path d="' + outline + '" fill="#fff5f9" stroke="url(#g)" stroke-width="' + Math.max(4, Math.round(W * 0.01)) + '" stroke-linejoin="round"/>' +
        '<path d="' + d + '" fill="url(#g)"/>' +
        (company ? '<text x="' + cx + '" y="' + f(ty1) + '" text-anchor="middle" font-family="Baloo 2,Trebuchet MS,sans-serif" font-weight="800" font-size="' + f(fs1) + '" fill="#241f3d">' + esc(company) + '</text>' : '') +
        (item ? '<text x="' + cx + '" y="' + f(ty2) + '" text-anchor="middle" font-family="Baloo 2,Trebuchet MS,sans-serif" font-weight="700" font-size="' + f(fs2) + '" fill="#4a4470">' + esc(item) + '</text>' : '') +
        '<text x="' + cx + '" y="' + f(ty3) + '" text-anchor="middle" font-family="Baloo 2,Trebuchet MS,sans-serif" font-weight="600" font-size="' + f(fs3) + '" fill="#7a74a0">Scan to open your gift</text></svg>';
    }
    return {
      width: W, height: Ht, modules: n, ecc: ecc, modulePx: Math.round(M * S * 10) / 10,
      draw: function (canvas) { canvas.width = W; canvas.height = Ht; drawTo(canvas.getContext('2d')); return canvas; },
      svg: svg
    };
  }
  window.PawnoteQR = { make: make };
})();
