(function () {
  var $ = function (id) { return document.getElementById(id); };
  var LABELS = ['Letter for', 'Letter from', 'Title', 'Letter text', 'Sign-off', 'Question', 'Line shown after yes'];
  function decode(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  $('go').addEventListener('click', function () {
    var v = $('lnk').value.trim(), m = /#l=([A-Za-z0-9_-]+)/.exec(v) || /^([A-Za-z0-9_-]{20,})$/.exec(v);
    $('out').hidden = true;
    if (!m) { $('msg').textContent = 'That does not look like a letter link. It should contain #l= followed by letters and numbers.'; $('msg').className = 'msg err'; return; }
    try {
      var arr = decode(m[1]), dl = $('dl'); dl.textContent = '';
      LABELS.forEach(function (l, i) {
        var dt = document.createElement('dt'); dt.style.fontWeight = '800'; dt.textContent = l;
        var dd = document.createElement('dd'); dd.style.margin = '0'; dd.style.whiteSpace = 'pre-wrap'; dd.style.overflowWrap = 'anywhere'; dd.textContent = String(arr[i] || '');
        dl.appendChild(dt); dl.appendChild(dd);
      });
      $('out').hidden = false; $('msg').textContent = 'Link read successfully.'; $('msg').className = 'msg';
    } catch (e) { $('msg').textContent = 'This link could not be read. It may have been cut off when it was copied.'; $('msg').className = 'msg err'; }
  });
})();
