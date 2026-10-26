(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ================= KITTEN (three.js) ================= */
  var kitten = {
    mount: function () {}, halfW: function () { return 4; }, reset: function () {}, setSad: function () {}, setHappy: function () {},
    setCarry: function () {}, setDropped: function () {}, pose: function () {}, sidePose: function () { return { x: 0, sc: 1, look: 0 }; }, hop: function () {}, nudge: function () {},
    walkIn: function (o) { if (o && o.done) setTimeout(o.done, 500); },
    leave: function (o) { if (o && o.done) setTimeout(o.done, 500); }
  };
  if (typeof THREE !== 'undefined') {
    try { kitten = buildKitten(); } catch (err) { if (window.console) console.error(err); }
  }

  function buildKitten() {
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1.6, 0.1, 100);
    var LOOK_Y = 2.3, visH = 6.2;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9ccf5, 0.85));
    var key = new THREE.DirectionalLight(0xffffff, 0.55); key.position.set(-3, 6, 7); scene.add(key);
    var fill = new THREE.DirectionalLight(0xffe3f1, 0.25); fill.position.set(4, 2, 4); scene.add(fill);

    var C = function (h) { return new THREE.Color(h); };
    var M0 = function (c, extra) { return new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 1, metalness: 0 }, extra || {})); };
    var furBase = C(0xfbf8fd), furSad = C(0xe2dff0);
    var mats = {
      fur: M0(0xfbf8fd), pink: M0(0xffb0c8), paw: M0(0xcfb6f6), foot: M0(0xefb6dc),
      ink: M0(0x14101f, { roughness: 0.25 }), white: M0(0xffffff, { roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.6 }),
      nose: M0(0xff8fae, { roughness: 0.5 }), mouth: M0(0x7a2038), tongue: M0(0xff7f9f),
      blush: M0(0xff8fb0, { transparent: true, opacity: 0.5 }), mint: M0(0x8fe3c9), star: M0(0xb79cf2, { roughness: 0.5 }),
      tear: M0(0x9bd9ff, { transparent: true, opacity: 0, roughness: 0.1 }),
      env: M0(0xf8ecd4), envFlap: M0(0xefdcba), heart: M0(0xff6f9a, { roughness: 0.5 }), ribbon: M0(0xb9a2f3)
    };
    var geo = {
      sph: new THREE.SphereGeometry(1, 28, 20), cone: new THREE.ConeGeometry(1, 1, 18), cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
      box: new THREE.BoxGeometry(1, 1, 1), arc: new THREE.TorusGeometry(1, 0.22, 8, 22, Math.PI)
    };
    function add(g, m, pos, scl, parent) {
      var o = new THREE.Mesh(geo[g], m);
      if (pos) o.position.set(pos[0], pos[1], pos[2]);
      if (scl) o.scale.set(scl[0], scl[1], scl[2]);
      parent.add(o); return o;
    }
    function heartShape(s) {
      var h = new THREE.Shape();
      h.moveTo(0, -0.6 * s);
      h.bezierCurveTo(-1.1 * s, 0.1 * s, -0.7 * s, 0.9 * s, 0, 0.35 * s);
      h.bezierCurveTo(0.7 * s, 0.9 * s, 1.1 * s, 0.1 * s, 0, -0.6 * s);
      return h;
    }
    function starShape(R, r) {
      var s = new THREE.Shape();
      for (var i = 0; i < 10; i++) { var a = Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R; var x = Math.cos(a) * rad, y = Math.sin(a) * rad; if (i) s.lineTo(x, y); else s.moveTo(x, y); }
      s.closePath(); return s;
    }

    var root = new THREE.Group(); scene.add(root);
    var shadow = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ color: 0x5a3c8c, transparent: true, opacity: 0.16 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; root.add(shadow);
    var body = new THREE.Group(); root.add(body);

    /* torso */
    add('sph', mats.fur, [0, 1.1, 0], [0.74, 0.78, 0.64], body);
    /* mint bow */
    var bow = new THREE.Group(); bow.position.set(0, 1.64, 0.55); body.add(bow);
    [-1, 1].forEach(function (s) { var w = add('sph', mats.mint, [s * 0.26, 0, 0], [0.27, 0.19, 0.12], bow); w.rotation.z = s * -0.35; });
    add('sph', mats.mint, [0, 0, 0.04], [0.13, 0.13, 0.1], bow);

    /* legs + feet */
    function leg(x) {
      var g = new THREE.Group(); g.position.set(x, 0.5, 0.05); body.add(g);
      add('cyl', mats.fur, [0, -0.15, 0], [0.19, 0.3, 0.19], g);
      add('sph', mats.foot, [0, -0.38, 0.1], [0.27, 0.15, 0.37], g);
      return g;
    }
    var legL = leg(-0.28), legR = leg(0.28);

    /* arms */
    function arm(x) {
      var g = new THREE.Group(); g.position.set(x, 1.5, 0.1); body.add(g);
      add('cyl', mats.fur, [0, -0.3, 0], [0.14, 0.62, 0.14], g);
      add('sph', mats.paw, [0, -0.68, 0], [0.19, 0.19, 0.19], g);
      return g;
    }
    var armL = arm(-0.6), armR = arm(0.6);
    armL.rotation.set(-1.4, 0, 0.35); armR.rotation.set(-1.4, 0, -0.35);

    /* tail */
    var tailBase = new THREE.Group(); tailBase.position.set(0, 0.7, -0.55); body.add(tailBase);
    var tail = [], tp = tailBase;
    for (var i = 0; i < 6; i++) {
      var tg = new THREE.Group(); if (i) tg.position.y = 0.2; tp.add(tg);
      var r = 0.15 - i * 0.008; add('sph', i === 5 ? mats.paw : mats.fur, [0, 0, 0], [r, r * 1.35, r], tg);
      tail.push(tg); tp = tg;
    }
    tailBase.rotation.x = -1.5;

    /* head */
    var head = new THREE.Group(); head.position.set(0, 2.6, 0.1); body.add(head);
    add('sph', mats.fur, [0, 0, 0], [1.1, 0.92, 0.95], head);
    var earL = new THREE.Group(), earR = new THREE.Group();
    earL.position.set(-0.68, 0.66, 0); earR.position.set(0.68, 0.66, 0); head.add(earL); head.add(earR);
    [earL, earR].forEach(function (e) {
      add('cone', mats.fur, [0, 0.24, 0], [0.42, 0.56, 0.32], e);
      add('cone', mats.pink, [0, 0.21, 0.1], [0.26, 0.38, 0.14], e);
    });
    var starMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape(0.2, 0.09), { depth: 0.05, bevelEnabled: false }), mats.star);
    starMesh.position.set(0.66, 0.52, 0.5); starMesh.rotation.z = -0.25; starMesh.rotation.y = 0.5; head.add(starMesh);

    function eye(x) {
      var g = new THREE.Group(); g.position.set(x, -0.02, 0.84); head.add(g);
      var pupil = add('sph', mats.ink, [0, 0, 0], [0.2, 0.26, 0.12], g);
      var h1 = add('sph', mats.white, [0.07, 0.1, 0.1], [0.075, 0.075, 0.05], g);
      var h2 = add('sph', mats.white, [-0.065, -0.09, 0.1], [0.035, 0.035, 0.03], g);
      var lid = add('sph', mats.fur, [0, 0.4, 0.04], [0.27, 0.22, 0.14], g);
      g.userData = { pupil: pupil, h1: h1, h2: h2, lid: lid };
      return g;
    }
    var eyeL = eye(-0.42), eyeR = eye(0.42);
    add('sph', mats.nose, [0, -0.15, 0.93], [0.07, 0.05, 0.05], head);
    var cheekL = add('sph', mats.blush, [-0.7, -0.22, 0.62], [0.2, 0.12, 0.05], head); cheekL.rotation.y = -0.9;
    var cheekR = add('sph', mats.blush, [0.7, -0.22, 0.62], [0.2, 0.12, 0.05], head); cheekR.rotation.y = 0.9;

    var openMouth = new THREE.Group(); openMouth.position.set(0, -0.33, 0.87); head.add(openMouth);
    add('sph', mats.mouth, [0, 0, 0], [0.17, 0.11, 0.07], openMouth);
    add('sph', mats.tongue, [0, -0.04, 0.03], [0.1, 0.055, 0.05], openMouth);
    var catMouth = new THREE.Group(); catMouth.position.set(0, -0.3, 0.9); head.add(catMouth);
    [-0.065, 0.065].forEach(function (x) { var a = add('arc', mats.ink, [x, 0.02, 0], [0.065, 0.065, 0.065], catMouth); a.rotation.z = Math.PI; });
    var frown = add('arc', mats.ink, [0, -0.36, 0.87], [0.12, 0.12, 0.12], head);

    var tears = [-1, 1].map(function (side) {
      var arr = []; for (var t = 0; t < 2; t++) arr.push(add('sph', mats.tear, [side * 0.46, -0.12, 0.8], [0.05, 0.08, 0.04], head)); return arr;
    });

    /* carried envelope */
    var env = new THREE.Group(); env.position.set(0, 1.3, 0.72); env.rotation.z = 0.05; body.add(env);
    add('box', mats.env, [0, 0, 0], [0.95, 0.68, 0.06], env);
    var flap = new THREE.Shape(); flap.moveTo(-0.475, 0.34); flap.lineTo(0.475, 0.34); flap.lineTo(0, -0.04); flap.closePath();
    var flapM = new THREE.Mesh(new THREE.ShapeGeometry(flap), mats.envFlap); flapM.position.z = 0.032; env.add(flapM);
    var hm = new THREE.Mesh(new THREE.ShapeGeometry(heartShape(0.1)), mats.heart); hm.position.set(0, -0.02, 0.04); env.add(hm);
    [-1, 1].forEach(function (s) { var rb = add('sph', mats.ribbon, [s * 0.08, -0.1, 0.04], [0.05, 0.025, 0.02], env); rb.rotation.z = s * 0.6; });

    /* envelope dropped on the floor */
    var floorEnv = new THREE.Group(); floorEnv.position.set(0.1, 0.04, 0.95); floorEnv.rotation.set(-Math.PI / 2, 0, 0.25); root.add(floorEnv);
    add('box', mats.env, [0, 0, 0], [0.95, 0.68, 0.04], floorEnv);
    var hm2 = new THREE.Mesh(new THREE.ShapeGeometry(heartShape(0.1)), mats.heart); hm2.position.set(0, 0, 0.025); floorEnv.add(hm2);

    /* ---------- state ---------- */
    var ks = { mode: 'idle', p: 0, dur: 3, fromX: 0, toX: 0, dir: 1, done: null, x: 0, offX: 0, offXT: 0, sc: 1, scT: 1, lookT: 0, s: 0, sT: 0, h: 0, hT: 0, carry: true, dropped: false, amp: 0, hop: 0, shake: 0 };
    function ease(p) { return 1 - Math.pow(1 - p, 2.2); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function approach(o, k, v, dt) { o[k] += (v - o[k]) * Math.min(1, dt * 8); }
    var host = null, ro = null, camDist = 10, halfWNow = 4, aspect = 1.6, clock = new THREE.Clock(), time = 0;

    function frameCam() {
      visH = Math.max(6.2, 3.5 / aspect);
      camDist = (visH / 2) / Math.tan(15 * Math.PI / 180);
      camera.position.set(0, LOOK_Y + 0.35, camDist); camera.lookAt(0, LOOK_Y, 0);
      halfWNow = visH / 2 * aspect;
    }
    frameCam();
    function resize() {
      if (!host) return;
      var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); aspect = w / h; camera.aspect = aspect; camera.updateProjectionMatrix(); frameCam();
    }

    function update(dt) {
      time += dt;
      ks.s += (ks.sT - ks.s) * Math.min(1, dt * 4);
      ks.h += (ks.hT - ks.h) * Math.min(1, dt * 7);
      var moving = false, faceY = ks.lookT;
      if (ks.mode === 'walkIn' || ks.mode === 'leave') {
        ks.p = Math.min(1, ks.p + dt / ks.dur);
        var e = ks.mode === 'walkIn' ? ease(ks.p) : ks.p;
        ks.x = ks.fromX + (ks.toX - ks.fromX) * e;
        moving = ks.p < 1;
        faceY = (ks.mode === 'walkIn' && ks.p > 0.86) ? ks.lookT : ks.dir * 0.85;
        if (ks.p >= 1) { var cb = ks.done; ks.mode = 'idle'; ks.done = null; if (cb) cb(); }
      }
      ks.offX += (ks.offXT - ks.offX) * Math.min(1, dt * 3.5); ks.sc += (ks.scT - ks.sc) * Math.min(1, dt * 3.5);
      root.position.x = ks.x + ks.offX;
      root.rotation.y += (faceY - root.rotation.y) * Math.min(1, dt * 5);
      ks.amp += ((moving ? 1 : 0) - ks.amp) * Math.min(1, dt * 8);

      var sadN = Math.min(ks.s, 5), sad = sadN / 5, happy = ks.h > 0.5;
      var w = time * (10 - sad * 3.5), amp = ks.amp * (1 - sad * 0.3);
      var jump = 0;
      if (ks.h > 0.05) jump = Math.abs(Math.sin(time * 6.5)) * (reduce ? 0.2 : 0.9) * ks.h;
      if (ks.hop > 0) { ks.hop = Math.max(0, ks.hop - dt * 1.6); jump = Math.max(jump, Math.sin(Math.PI * (1 - ks.hop)) * 0.7); }
      ks.shake = Math.max(0, ks.shake - dt * 2.5);

      var sw = Math.sin(w) * 0.75 * amp;
      legL.rotation.x = sw; legR.rotation.x = -sw;
      body.position.y = Math.abs(Math.sin(w)) * 0.14 * amp + jump + Math.sin(time * 2) * 0.012;
      body.rotation.z = Math.sin(w) * 0.05 * amp + (ks.h > 0.05 ? Math.sin(time * 6.5) * 0.07 * ks.h : 0);
      root.rotation.z = Math.sin(time * 38) * 0.07 * ks.shake;
      root.scale.setScalar(ks.sc * (1 - sad * 0.05));
      shadow.scale.setScalar(1 - Math.min(jump, 1) * 0.3); shadow.material.opacity = 0.16 - Math.min(jump, 1) * 0.07;

      mats.fur.color.copy(furBase).lerp(furSad, Math.min(1, sadN / 4));

      /* arms */
      var tL = [0, 0], tR = [0, 0];
      if (happy) { var wv = Math.sin(time * 10) * 0.3; tL = [-0.15, -2.5 + wv]; tR = [-0.15, 2.5 - wv]; }
      else if (ks.carry) { tL = [-1.4, 0.35]; tR = [-1.4, -0.35]; }
      else {
        var sg = Math.sin(w + Math.PI) * 0.7 * amp;
        tL = [sg - 0.1 * sad, -0.14 - sad * 0.05]; tR = [-sg - 0.1 * sad, 0.14 + sad * 0.05];
      }
      approach(armL.rotation, 'x', tL[0], dt); approach(armL.rotation, 'z', tL[1], dt);
      approach(armR.rotation, 'x', tR[0], dt); approach(armR.rotation, 'z', tR[1], dt);
      env.visible = ks.carry && !happy; floorEnv.visible = ks.dropped && !ks.carry;
      env.position.y = 1.3 + Math.abs(Math.sin(w)) * 0.05 * amp;

      /* head */
      head.position.y = 2.6 - sad * 0.18;
      head.rotation.x = 0.04 + sad * 0.5 - (happy ? 0.12 : 0);
      head.rotation.z = Math.sin(time * 0.9) * 0.04 * (1 - sad) + (sad > 0.15 ? Math.sin(time * 0.7) * 0.04 : 0) + (happy ? Math.sin(time * 6.5) * 0.06 : 0);
      head.rotation.y = Math.sin(time * 0.7) * 0.12 * (1 - sad * 0.7);
      var droop = 0.32 + sad * 0.85 - (happy ? 0.12 : 0);
      earL.rotation.z = droop + Math.sin(time * 3.1) * 0.03; earR.rotation.z = -droop - Math.sin(time * 2.7) * 0.03;
      earL.rotation.x = earR.rotation.x = -sad * 0.3;

      /* eyes */
      var bt = time % 3.9, blink = bt > 3.72 ? Math.sin((bt - 3.72) / 0.18 * Math.PI) : 0;
      var lidAmt = Math.min(1, sad * 0.85 + blink);
      [eyeL, eyeR].forEach(function (g, idx) {
        var u = g.userData, side = idx ? -1 : 1;
        u.lid.visible = lidAmt > 0.06; u.lid.position.y = 0.42 - lidAmt * 0.36;
        u.lid.rotation.z = side * sad * 0.45;
        var sc = 1 + (happy ? 0.1 : 0) + sad * 0.08;
        u.pupil.scale.set(0.2 * sc, 0.26 * sc, 0.12);
        u.h1.scale.setScalar(0.075 + sad * 0.02 + (happy ? 0.01 : 0)); u.h2.scale.setScalar(0.035 + sad * 0.012);
      });
      mats.blush.opacity = happy ? 0.8 : 0.45 + sad * 0.2;

      /* mouth */
      var cheerful = happy || (ks.s < 0.5 && (ks.carry || ks.mode !== 'idle'));
      openMouth.visible = cheerful; frown.visible = !cheerful && ks.s > 0.7; catMouth.visible = !cheerful && ks.s <= 0.7;
      if (frown.visible) { frown.scale.setScalar(0.1 + sad * 0.04); frown.position.y = -0.36 - Math.sin(time * 3) * 0.004 * sadN; }

      /* tears */
      var tearAmt = Math.max(0, Math.min(1, (ks.s - 0.6) / 1.4));
      tears.forEach(function (arr, si) {
        arr.forEach(function (m, ti) {
          var ph = (time * 0.7 + ti * 0.5 + si * 0.2) % 1;
          m.position.y = -0.12 - ph * 0.5; m.position.z = 0.8 - ph * 0.1;
          m.material.opacity = Math.sin(Math.PI * ph) * 0.9 * tearAmt;
          var q = 0.05 + sad * 0.03; m.scale.set(q, q * 1.6, q * 0.8);
        });
      });

      /* tail */
      for (var j = 0; j < tail.length; j++) {
        tail[j].rotation.x = happy ? -0.05 : lerp(-0.2, 0.08, sad);
        tail[j].rotation.z = Math.sin(time * (happy ? 9 : 2.4 - sad) - j * 0.55) * (happy ? 0.32 : 0.16 * (1 - sad * 0.7));
      }
      tailBase.rotation.x = happy ? -1.1 : lerp(-1.4, -2.3, sad);
    }

    function frame() {
      requestAnimationFrame(frame);
      var dt = Math.min(clock.getDelta(), 0.05);
      if (document.hidden || !host) return;
      update(dt); renderer.render(scene, camera);
    }
    frame();

    return {
      mount: function (h) {
        host = h; h.appendChild(renderer.domElement); resize();
        if (window.ResizeObserver) { if (ro) ro.disconnect(); ro = new ResizeObserver(resize); ro.observe(h); }
      },
      halfW: function () { return halfWNow; },
      reset: function (o) {
        o = o || {};
        ks.mode = 'idle'; ks.s = ks.sT = o.sad || 0; ks.h = ks.hT = 0; ks.carry = o.carry !== false; ks.dropped = false; ks.done = null; ks.hop = 0; ks.shake = 0;
        ks.x = o.x || 0; root.position.x = ks.x + ks.offX; root.rotation.y = ks.lookT;
      },
      setSad: function (n) { ks.sT = n; },
      setHappy: function (b) { ks.hT = b ? 1 : 0; if (b) ks.carry = false; },
      setCarry: function (b) { ks.carry = b; },
      setDropped: function (b) { ks.dropped = b; },
      pose: function (o, instant) {
        ks.offXT = o.x; ks.scT = o.sc; ks.lookT = o.look;
        if (instant) { ks.offX = o.x; ks.sc = o.sc; }
      },
      sidePose: function () {
        return aspect > 1.1 ? { x: -halfWNow * 0.52, sc: 1, look: 0.5 } : { x: -halfWNow * 0.4, sc: 0.5, look: 0.45 };
      },
      hop: function () { ks.hop = 1; },
      nudge: function () { ks.shake = 1; },
      walkIn: function (o) {
        ks.mode = 'walkIn'; ks.p = 0; ks.dur = o.dur || 3; ks.fromX = o.from; ks.toX = o.to || 0; ks.dir = ks.toX >= ks.fromX ? 1 : -1; ks.done = o.done || null;
        ks.x = o.from; if (o.carry !== undefined) ks.carry = o.carry;
      },
      leave: function (o) {
        ks.mode = 'leave'; ks.p = 0; ks.dur = o.dur || 3; ks.fromX = ks.x; ks.toX = o.to; ks.dir = ks.toX >= ks.fromX ? 1 : -1; ks.done = o.done || null;
        if (o.carry !== undefined) ks.carry = o.carry;
      }
    };
  }

  /* ================= FORM + DRAFT ================= */
  var F = { to: $('toName'), from: $('fromName'), title: $('title'), body: $('body'), sign: $('signoff'), q: $('question'), yes: $('yesLine') };
  var SAMPLE = {
    to: 'Lily', from: 'Ethan', title: 'A little note before I ask you something',
    body: 'Lily, I have been trying to find the right moment for weeks, so I asked a very small, very serious kitten to help me.\nYou make ordinary days feel like a good song on repeat. I laugh more since I met you, and I catch myself smiling at my phone like an idiot.\nSo here is the thing I have been too nervous to say out loud.',
    sign: 'With love, Ethan', q: 'Will you go out with me?', yes: "Saturday, 6 pm. I'll bring the hot chocolate."
  };
  var DRAFTS = [
    function (d) { return { title: 'I made you a tiny letter', body: 'I know you are busy, so I kept this short.\nThis time of year keeps reminding me of you: warm drinks, early dark, and wanting to tell someone about all of it.\nSo I sent a kitten to ask properly.', sign: 'Yours, ' + (d.from || 'me'), q: 'Will you come to the lantern walk with me on Saturday?', yes: "Saturday, 6 pm. I'll bring the hot chocolate." }; },
    function (d) { return { title: 'A small invitation', body: 'There is a ramen place I keep meaning to try.\nEvery time I picture it, you are across the table, arguing about the best topping.\nI would like to make that real.', sign: 'Hopefully, ' + (d.from || 'me'), q: 'Can I take you to dinner on Friday?', yes: 'Friday at 7. I already booked the corner table.' }; },
    function (d) { return { title: 'I owe you a better sorry', body: 'I should have called back that night, and I did not.\nI have thought about it every day since, and a text did not feel like enough.\nSo here is a letter, and a very sad-looking kitten on standby.', sign: 'Sorry, ' + (d.from || 'me'), q: 'Can we start over with coffee on Sunday?', yes: 'Sunday, 10 am. First round is on me.' }; }
  ];
    var KEY = 'kitty-letter-draft-v2', WEEK = 7 * 24 * 3600 * 1000, draftIdx = 0;

  function read() { var o = {}; for (var k in F) o[k] = F[k].value; return o; }
  function write(o) { for (var k in F) F[k].value = o[k] || ''; }
  function paras(s) { return s.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function nm(d) { return d.to.trim(); }
  function forLine(d) { return nm(d) ? 'for ' + nm(d) + ',' : 'for you,'; }
  function fillMail(root, d) {
    root.querySelector('.p-for').textContent = forLine(d);
    root.querySelector('.p-title').textContent = d.title.trim() || SAMPLE.title;
    var b = root.querySelector('.p-body'); b.textContent = '';
    var ps = paras(d.body); if (!ps.length) ps = paras(SAMPLE.body);
    ps.forEach(function (t) { var p = document.createElement('p'); p.textContent = t; b.appendChild(p); });
    root.querySelector('.p-sign').textContent = d.sign.trim();
  }
  function refresh(save) {
    var d = read();
    /* the preview is always the sample letter, never the customer's own words */
    if (!refresh.shown) { fillMail($('previewMail'), SAMPLE); $('pvQuestion').textContent = SAMPLE.q; $('pvYes').textContent = SAMPLE.to + ' said yes. ' + SAMPLE.yes; refresh.shown = true; }
    var n = paras(d.body).length, chars = d.body.length, c = $('bodyCount');
    c.textContent = n + (n === 1 ? ' paragraph' : ' paragraphs') + ' · ' + chars + '/700';
    c.className = (n > 4 || chars > 560) ? 'warn' : '';
    if (save) { try { localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), d: d })); } catch (e) {} }
  }
  function restore() {
    var loaded = false;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var o = JSON.parse(raw); if (o && o.d && Date.now() - o.ts < WEEK) { write(o.d); loaded = true; } else { localStorage.removeItem(KEY); } }
    } catch (e) {}
    if (!loaded) write(SAMPLE);
  }
  Object.keys(F).forEach(function (k) { F[k].addEventListener('input', function () { refresh(true); }); });
  $('suggest').addEventListener('click', function () {
    var d = read(); var s = DRAFTS[draftIdx % DRAFTS.length](d); draftIdx++;
    d.title = s.title; d.body = s.body; d.sign = s.sign; d.q = s.q; d.yes = s.yes; write(d); refresh(true);
  });
  $('clear').addEventListener('click', function () { write({}); refresh(true); F.to.focus(); });

  /* ================= VIEWS ================= */
  function show(view) {
    $('maker').hidden = view !== 'maker'; $('play-view').hidden = view !== 'play'; $('site-header').hidden = view !== 'maker';
    kitten.mount(view === 'maker' ? $('makerHost') : $('playHost'));
    window.scrollTo(0, 0);
  }

  /* ================= PLAY FLOW ================= */
  var D = null, playData = null, lockedView = false, noCount = 0, timers = [], sideMode = false, CENTER = { x: 0, sc: 1, look: 0 };
  var UIS = ['uiIntro', 'uiOpen', 'uiQ', 'uiAnswers', 'uiYes', 'uiYesBtns', 'uiBye', 'uiByeBtn'];
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function showUI(ids) {
    UIS.forEach(function (id) { $(id).hidden = ids.indexOf(id) < 0; });
    ids.forEach(function (id) { var el = $(id); el.classList.remove('ui-enter'); void el.offsetWidth; el.classList.add('ui-enter'); });
  }
  var MOODS = ['', 'Oh. Are you sure, {n}?', 'The kitten is trying to be brave.', 'Please? It walked all this way.', 'The kitten has stopped smiling.', 'Last chance, {n}. The kitten is trying not to cry.'];
  function who(t) { return nm(D) ? t.replace('{n}', nm(D)) : t.replace(', {n}', '').replace('{n}', 'you'); }
  function applyScales() {
    $('btnNo').style.transform = 'scale(' + Math.max(0.5, 1 - noCount * 0.1) + ')';
    $('btnYes').style.transform = 'scale(' + (1 + noCount * 0.08) + ')';
  }
  function offLeft() { return -(kitten.halfW() + 2.4); }
  function offRight() { return kitten.halfW() + 2.4; }

  function startPlay(data) {
    clearTimers();
    D = data || read(); playData = D; noCount = 0;
    $('back').hidden = lockedView; $('edit2').hidden = lockedView;
    fillMail($('playMail'), D);
    var nmv = nm(D);
    $('playLabel').textContent = nmv ? 'A letter for ' + nmv : 'A letter for you';
    $('introLine').textContent = 'A very small kitten has a letter ' + (nmv ? 'for ' + nmv : 'for you');
    $('qEyebrow').textContent = nmv ? 'A question for ' + nmv : 'A question for you';
    $('qText').textContent = D.q.trim() || SAMPLE.q;
    $('mood').textContent = '';
    $('playMail').className = 'mail'; $('hearts').textContent = '';
    applyScales(); showUI([]);
    sideMode = false; $('play-view').classList.remove('side');
    show('play');
    kitten.pose(CENTER, true);
    kitten.reset({ x: offLeft(), carry: true });
    showUI(['uiIntro']);
    kitten.walkIn({
      from: offLeft(), to: 0, dur: reduce ? 1 : 3.6, carry: true,
      done: function () { kitten.hop(); showUI(['uiOpen']); $('openBtn').focus({ preventScroll: true }); }
    });
  }
  $('form').addEventListener('submit', function (e) { e.preventDefault(); startPlay(SAMPLE); });

  $('openBtn').addEventListener('click', function () {
    showUI([]);
    sideMode = true; $('play-view').classList.add('side');
    kitten.pose(kitten.sidePose());
    later(function () { $('playMail').classList.add('in'); $('turn').focus({ preventScroll: true }); }, reduce ? 200 : 900);
    later(function () { kitten.setCarry(false); kitten.setDropped(true); kitten.hop(); }, reduce ? 300 : 1500);
  });
  window.addEventListener('resize', function () { setTimeout(function () { if (sideMode) kitten.pose(kitten.sidePose(), true); }, 120); });

  function askQuestion(sadLevel) {
    kitten.setSad(sadLevel);
    showUI(['uiQ', 'uiAnswers']);
    $('btnNo').focus({ preventScroll: true });
  }
  $('turn').addEventListener('click', function () {
    $('playMail').classList.add('turned');
    later(function () { kitten.hop(); askQuestion(0); }, reduce ? 200 : 900);
  });

  $('btnNo').addEventListener('click', function () {
    noCount++;
    if (noCount >= 6) { goodbye(); return; }
    kitten.setSad(noCount); kitten.nudge();
    $('mood').textContent = who(MOODS[noCount]);
    applyScales();
  });

  function goodbye() {
    kitten.setSad(5);
    $('byeTitle').textContent = nm(D) ? 'Okay, ' + nm(D) + '. The kitten understands.' : 'Okay. The kitten understands.';
    $('byeSig').textContent = D.from.trim() ? '— ' + D.from.trim() : '';
    kitten.setDropped(false);
    kitten.leave({ to: offLeft(), dur: reduce ? 1 : 5, carry: false });
    showUI(['uiBye']);
    later(function () { showUI(['uiBye', 'uiByeBtn']); $('askAgain').focus({ preventScroll: true }); }, reduce ? 500 : 1800);
  }
  $('askAgain').addEventListener('click', function () {
    noCount = 5; showUI([]);
    $('mood').textContent = 'The kitten came back. It is trying very hard.';
    applyScales();
    kitten.reset({ x: offLeft(), carry: false, sad: 5 });
    kitten.setSad(5); kitten.setDropped(false);
    kitten.walkIn({ from: offLeft(), to: 0, dur: reduce ? 1 : 3, carry: false, done: function () { kitten.setDropped(true); askQuestion(5); } });
  });

  function heartSvg(color) {
    return '<svg viewBox="0 0 24 22" aria-hidden="true"><path fill="' + color + '" d="M12 21.5C5 15.8 1.5 12.3 1.5 7.6 1.5 4.4 3.9 2 7 2c2 0 3.8 1 5 2.8C13.2 3 15 2 17 2c3.1 0 5.5 2.4 5.5 5.6 0 4.7-3.5 8.2-10.5 13.9z"/></svg>';
  }
  function hearts(n) {
    var box = $('hearts'), h = box.clientHeight || 600, w = box.clientWidth || 400;
    var colors = ['#ff6f9a', '#a28bf3', '#ffb3c7', '#ffcf5c'];
    for (var i = 0; i < n; i++) {
      (function (i) {
        later(function () {
          var el = document.createElement('span'), s = 16 + Math.random() * 30;
          el.className = 'heart';
          el.style.cssText = 'left:' + (Math.random() * (w - s)) + 'px;width:' + s + 'px;height:' + s * 0.92 + 'px;--rise:' + (h * (0.55 + Math.random() * 0.45) + 40) + 'px;--drift:' + ((Math.random() - 0.5) * 100) + 'px;--dur:' + (2.8 + Math.random() * 2) + 's';
          el.innerHTML = heartSvg(colors[i % colors.length]);
          box.appendChild(el);
          el.addEventListener('animationend', function () { el.remove(); });
        }, i * 90);
      })(i);
    }
  }
  $('btnYes').addEventListener('click', function () {
    kitten.setSad(0); kitten.setHappy(true); kitten.setDropped(false);
    $('yesTitle').textContent = nm(D) ? nm(D) + ' said yes.' : 'You said yes.';
    $('yesOut').textContent = D.yes.trim();
    showUI(['uiYes', 'uiYesBtns']);
    hearts(reduce ? 8 : 40);
    $('again').focus({ preventScroll: true });
  });
  function toMaker() { if (lockedView) return; clearTimers(); showUI([]); sideMode = false; $('play-view').classList.remove('side'); kitten.pose(CENTER, true); kitten.reset({ x: 0, carry: true }); show('maker'); }
  $('back').addEventListener('click', toMaker);
  $('edit2').addEventListener('click', toMaker);
  $('again').addEventListener('click', function () { startPlay(playData); });

  /* ================= CHECKOUT HAND-OFF ================= */
  var FIELDS = ['to', 'from', 'title', 'body', 'sign', 'q', 'yes'];
  function clean(d) { var o = {}; FIELDS.forEach(function (k) { o[k] = String(d[k] || ''); }); return o; }
  function say(msg, err) { var m = $('saveMsg'); m.textContent = msg; m.className = 'note' + (err ? ' err' : ''); }
  function encode(d) {
    var bytes = new TextEncoder().encode(JSON.stringify(FIELDS.map(function (k) { return d[k]; })));
    var bin = ''; for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var arr = JSON.parse(new TextDecoder().decode(bytes)), o = {};
    FIELDS.forEach(function (k, i) { o[k] = String(arr[i] || ''); });
    return o;
  }
  /* price, name and currency come from config.js so the shop has one place to edit */
  var KP = null, sym = (window.SITE && SITE.symbol) || '\u20b9';
  function fm(n) { return sym + Number(n).toLocaleString('en-IN'); }
  if (window.SITE) {
    KP = (SITE.products || []).filter(function (x) { return x.id === 'kitty'; })[0] || null;
    if (SITE.name) document.title = 'Kitty Letter | ' + SITE.name;
  }
  if (KP) {
    var pb = $('pricebox');
    var nowEl = document.createElement('span'); nowEl.className = 'now'; nowEl.textContent = fm(KP.price);
    var wasEl = document.createElement('span'); wasEl.className = 'was'; wasEl.appendChild(document.createTextNode('Regular price '));
    var st = document.createElement('s'); st.textContent = fm(KP.regular); wasEl.appendChild(st);
    pb.appendChild(nowEl); pb.appendChild(wasEl);
    if (KP.regular > KP.price) { var sv = document.createElement('span'); sv.className = 'save'; sv.textContent = 'Save ' + fm(KP.regular - KP.price); pb.appendChild(sv); }
    pb.hidden = false;
    $('save').textContent = 'Pay ' + fm(KP.price) + ' and get link';
  } else { $('save').textContent = 'Continue to checkout'; }
  /* the pay button saves the letter, then opens the checkout page in a new tab */
  $('save').addEventListener('click', function () {
    var d = clean(read());
    if (!d.to.trim() || !d.body.trim() || !d.q.trim()) { say('Add their name, a letter and a question before paying.', true); return; }
    var res = PawnoteCheckout.start({
      product: 'kitty', code: encode(d), letter: d,
      summary: 'Letter ' + (d.to.trim() ? 'for ' + d.to.trim() : 'for you'),
      details: { 'Letter for': d.to, 'Letter from': d.from, 'Title': d.title, 'Letter text': d.body, 'Sign-off': d.sign, 'Question': d.q, 'Line shown after yes': d.yes }
    });
    if (res.error) { say('Your browser blocked saving the order. Allow site storage and try again.', true); return; }
    say('Taking you to checkout\u2026');
  });
  window.addEventListener('hashchange', function () { location.reload(); });

  /* ================= INIT ================= */
  function begin(shared) {
    restore();
    refresh(false);
    kitten.mount($('makerHost'));
    kitten.reset({ x: 0, carry: true });
    if (shared) {
      $('maker').hidden = true;
      $('back').textContent = 'Make your own';
      $('edit2').textContent = 'Make your own';
      startPlay(shared);
    }
  }
  var hash = location.hash || '', mL = /^#l=([A-Za-z0-9_-]+)$/.exec(hash), mK = /^#k=([A-Za-z0-9]{6,12})$/.exec(hash);
  if (mK) {
    /* short link: fetch the letter from the Pawnote API, then play it */
    var api = String((window.SITE && SITE.apiBase) || '').replace(/\/+$/, '');
    $('maker').hidden = true;
    var wait = document.createElement('p');
    wait.textContent = 'Opening your letter\u2026';
    wait.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;margin:0;font:700 1.3rem var(--font-display);color:var(--ink);background:var(--bg)';
    document.body.appendChild(wait);
    var fail = function () { wait.remove(); $('maker').hidden = false; begin(null); say('This letter link could not be opened. Check the link or ask the sender for a new one.', true); };
    if (!api) { fail(); }
    else {
      fetch(api + '/api/letter/' + mK[1]).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
        var d = decode(j.code); if (!d) throw 0; wait.remove(); begin(d);
      }).catch(fail);
    }
  } else {
    var shared = null;
    try { if (mL) shared = decode(mL[1]); } catch (e) { shared = null; }
    begin(shared);
  }
})();
