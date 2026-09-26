// Game & Watch style engine: an LCD screen made of fixed segments that are either on or off.
// Unlit segments stay faintly visible ("ghosts"), like on the real LCD screens.
//
// A game gives:
//   id, title, size: [w, h] (logical screen size), hud: { digits: [x, y], misses: [x, y] }
//   segments(S, cfg): registers the screen, S.seg(id, x, y, w, h, draw) and S.print(draw)
//   create(api): returns one game with tick(), move(dir), tap(x, y), auto(), render(on, blink),
//                interval(score), afterMiss()
//
// Graphics can be replaced with a skin (cfg.skin: address of a JSON file):
//   { "image": "sheet.png", "background": "screen.png",
//     "segments": { "segment id": [sx, sy, sw, sh], ... } }
// Each listed segment is cut from the sheet and drawn in its box on the screen. Segments missing
// from the skin keep the built-in drawing. Open a game with ?outline=true to see every box and id.
// A skin can also bring its own screen layout:
//   "size": [w, h]                 screen size in pixels (the background's size)
//   "segments": { id: [sx, sy, sw, sh, dx, dy] }   drawn at (dx, dy), unscaled
//   "hud": { "digits": [x, y], "scale": 0.5, "misses": [x, y], "missStep": 12, "label": [x, y], "missLabel": [x, y] }
//   "@miss", "@miss-label", "@game-a", "@game-b" in segments: sprites for the miss icon, the MISS
//   word (shown after a miss) and the GAME A / GAME B label.
// With a size, built-in segments the skin leaves out are not drawn. "pixelated": true keeps pixel art sharp.
var GW = (function () {
  var LOOKS = {
    lcd: { panel: '#c4cab1', panel2: '#b3baa0', ink: '#1a1e15', ghost: 0.075, print: 0.3 },
    theme: { panel: null, ink: null, ghost: 0.08, print: 0.3 }
  };

  // Seven segment digit inside a 12 x 22 box.
  var SEG7 = {
    a: [[1.4, 0], [10.6, 0], [8.8, 2.2], [3.2, 2.2]],
    b: [[11.2, 0.7], [11.2, 10.3], [9.6, 9.5], [9.6, 2.6]],
    c: [[11.2, 11.7], [11.2, 21.3], [9.6, 19.4], [9.6, 12.5]],
    d: [[3.2, 19.8], [8.8, 19.8], [10.6, 22], [1.4, 22]],
    e: [[0.8, 11.7], [2.4, 12.5], [2.4, 19.4], [0.8, 21.3]],
    f: [[0.8, 0.7], [2.4, 2.6], [2.4, 9.5], [0.8, 10.3]],
    g: [[1.4, 11], [3.2, 10.1], [8.8, 10.1], [10.6, 11], [8.8, 11.9], [3.2, 11.9]]
  };
  var DIGITS = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };

  function poly(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
    ctx.fill();
  }

  // ---------- Drawing helpers for the built-in graphics ----------
  var draw = {
    poly: poly,
    circle: function (ctx, x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    },
    line: function (ctx, x1, y1, x2, y2, width) {
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    rect: function (ctx, x, y, w, h, r) {
      ctx.beginPath();
      r = Math.min(r || 0, w / 2, h / 2);
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    },
    // A person, about s tall, centered on (x, y). pose: { arms, legs, rot, flip, hat }
    // arms: down, up, out, forward, wave; legs: stand, walk1, walk2, spread, kneel
    figure: function (ctx, x, y, s, pose) {
      pose = pose || {};
      ctx.save();
      ctx.translate(x, y);
      if (pose.rot) {
        ctx.rotate(pose.rot);
      }
      ctx.scale(pose.flip ? -s : s, s);
      var ARMS = {
        down: [[-0.17, 0.06], [0.17, 0.06]],
        up: [[-0.2, -0.5], [0.2, -0.5]],
        out: [[-0.34, -0.22], [0.34, -0.22]],
        forward: [[0.3, -0.14], [0.34, -0.24]],
        wave: [[-0.3, -0.3], [0.3, 0]]
      };
      var LEGS = {
        stand: [[-0.1, 0.5], [0.1, 0.5]],
        walk1: [[-0.24, 0.48], [0.2, 0.48]],
        walk2: [[-0.08, 0.5], [0.12, 0.5]],
        spread: [[-0.28, 0.42], [0.28, 0.42]],
        kneel: [[-0.2, 0.34], [0.22, 0.46]]
      };
      var arms = ARMS[pose.arms || 'down'];
      var legs = LEGS[pose.legs || 'stand'];
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      draw.circle(ctx, 0, -0.37, 0.13);
      if (pose.hat === 'chef') {
        draw.rect(ctx, -0.11, -0.66, 0.22, 0.2, 0.03);
        ctx.beginPath();
        ctx.ellipse(0, -0.68, 0.19, 0.11, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (pose.hat === 'helmet') {
        poly(ctx, [[-0.2, -0.4], [0.2, -0.4], [0.12, -0.54], [-0.12, -0.54]]);
      } else if (pose.hat === 'cap') {
        poly(ctx, [[-0.13, -0.44], [0.24, -0.44], [0.13, -0.53], [-0.13, -0.53]]);
      }
      draw.line(ctx, 0, -0.22, 0, 0.1, 0.22);
      arms.forEach(function (a) {
        draw.line(ctx, 0, -0.17, a[0], a[1], 0.12);
      });
      legs.forEach(function (l) {
        draw.line(ctx, 0, 0.08, l[0], l[1], 0.13);
      });
      ctx.restore();
    },
    // Wavy water line from x1 to x2.
    waves: function (ctx, x1, x2, y, amp, width) {
      ctx.lineWidth = width || 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      for (var x = x1; x <= x2; x += 2) {
        ctx.lineTo(x, y + Math.sin((x - x1) / 5) * (amp || 2));
      }
      ctx.stroke();
    }
  };

  function run(game, cfg) {
    var look = LOOKS[cfg.look] || LOOKS.lcd;
    var size = game.size || [320, 200];
    var hud = game.hud;
    var canvas = W.$('board');
    var ctx = canvas.getContext('2d');
    var ghostCanvas = document.createElement('canvas');
    var gctx = ghostCanvas.getContext('2d');
    var segs = [];
    var byId = {};
    var prints = [];
    var skin = null;
    var scale = 1;
    var offX = 0;
    var offY = 0;
    var dpr = 1;
    var ink = look.ink;
    var BEST_KEY = game.id + ':best:' + cfg.mode + ':' + cfg.speed;
    var best = W.store.get(BEST_KEY) || 0;

    // ---------- Screen description ----------
    var S = {
      seg: function (id, x, y, w, h, fn) {
        var s = { id: id, x: x, y: y, w: w, h: h, draw: fn };
        segs.push(s);
        byId[id] = s;
      },
      print: function (fn) {
        prints.push(fn);
      },
      draw: draw
    };
    game.segments(S, cfg);

    function readColors() {
      if (!look.panel) {
        ink = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#ffffff';
      }
    }

    // cfg.skin: a skin bundled with the widget (a name in GW.skins), the address of a skin JSON
    // file, or none (the built-in drawings).
    function loadSkin() {
      if (!cfg.skin || cfg.skin === 'none') {
        return;
      }
      if (GW.skins[cfg.skin]) {
        applySkin(GW.skins[cfg.skin], location.href);
        return;
      }
      W.fetchJson(cfg.skin).then(function (data) {
        applySkin(data, cfg.skin);
      }).catch(function (e) {
        W.log('skin failed', String(e));
      });
    }

    function applySkin(data, base) {
      function img(src) {
        if (!src) {
          return null;
        }
        var im = new Image();
        im.onload = function () {
          buildGhosts();
          dirty = true;
        };
        try {
          im.src = new URL(src, new URL(base, location.href)).href;
        } catch (e) {
          im.src = src;
        }
        return im;
      }
      skin = {
        sheet: img(data.image),
        background: img(data.background),
        segments: data.segments || {},
        ghosts: data.ghosts !== false,
        layout: !!data.size,
        pixelated: !!data.pixelated
      };
      if (data.size) {
        size = data.size;
      }
      if (data.hud) {
        hud = {};
        Object.keys(game.hud).forEach(function (k) {
          hud[k] = game.hud[k];
        });
        Object.keys(data.hud).forEach(function (k) {
          hud[k] = data.hud[k];
        });
      }
      layout();
    }

    function sheetReady() {
      return skin && skin.sheet && skin.sheet.complete && skin.sheet.naturalWidth > 0;
    }

    // Draws a skin sprite by name; (x, y) is its top left corner, or its center when centered.
    function sprite(c, name, x, y, centered) {
      var cut = sheetReady() && skin.segments[name];
      if (!cut) {
        return false;
      }
      c.imageSmoothingEnabled = !skin.pixelated;
      c.drawImage(skin.sheet, cut[0], cut[1], cut[2], cut[3], centered ? x - cut[2] / 2 : x, centered ? y - cut[3] / 2 : y, cut[2], cut[3]);
      return true;
    }

    function paintSeg(c, s, alpha) {
      var cut = sheetReady() && skin.segments[s.id];
      if (!cut && skin && skin.layout) {
        return;
      }
      c.save();
      c.globalAlpha = alpha;
      if (cut) {
        c.imageSmoothingEnabled = !skin.pixelated;
        if (cut.length >= 6) {
          c.drawImage(skin.sheet, cut[0], cut[1], cut[2], cut[3], cut[4], cut[5], cut[2], cut[3]);
        } else {
          c.drawImage(skin.sheet, cut[0], cut[1], cut[2], cut[3], s.x, s.y, s.w, s.h);
        }
      } else {
        c.translate(s.x, s.y);
        c.fillStyle = ink;
        c.strokeStyle = ink;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        s.draw(c, s.w, s.h);
      }
      c.restore();
    }

    // ch: the digit to light, or null to draw all seven segments as ghosts.
    function hudScale() {
      return hud.scale || 1;
    }

    // Position of digit i (0 to 3) of the score display.
    function digitX(i) {
      return hud.digits[0] + (i * 15 + (i > 1 ? 6 : 0)) * hudScale();
    }

    function digit(c, x, y, ch) {
      c.save();
      c.translate(x, y);
      c.scale(hudScale(), hudScale());
      c.transform(1, 0, -0.1, 1, 0, 0);
      c.fillStyle = ink;
      var on = ch === null ? 'abcdefg' : DIGITS[ch] || '';
      c.globalAlpha = ch === null ? look.ghost : 1;
      for (var i = 0; i < on.length; i++) {
        poly(c, SEG7[on.charAt(i)]);
      }
      c.restore();
    }

    function missX(m) {
      return hud.misses[0] + m * (hud.missStep || 16 * hudScale());
    }

    function missIcon(c, x, y) {
      if (sprite(c, '@miss', x, y, true)) {
        return;
      }
      if (hudScale() !== 1) {
        c.save();
        c.translate(x, y);
        c.scale(hudScale(), hudScale());
        x = 0;
        y = 0;
      }
      if (game.missIcon) {
        game.missIcon(c, x, y, draw);
      } else {
        draw.figure(c, x, y + 1, 13, { arms: 'up', legs: 'spread' });
      }
      if (hudScale() !== 1) {
        c.restore();
      }
    }

    // Unlit segments and printed decor never change, so they are drawn once into a cache.
    function buildGhosts() {
      ghostCanvas.width = canvas.width;
      ghostCanvas.height = canvas.height;
      gctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
      gctx.clearRect(-offX / scale, -offY / scale, canvas.width, canvas.height);
      var fill = tile ? fillColor() : null;
      if (fill) {
        gctx.fillStyle = fill;
        gctx.fillRect(-offX / scale, -offY / scale, canvas.width / dpr / scale, canvas.height / dpr / scale);
      }
      if (skin && skin.background && skin.background.complete) {
        gctx.imageSmoothingEnabled = !skin.pixelated;
        gctx.drawImage(skin.background, 0, 0, size[0], size[1]);
      } else if (look.panel) {
        var g = gctx.createLinearGradient(0, 0, 0, size[1]);
        g.addColorStop(0, look.panel);
        g.addColorStop(1, look.panel2);
        gctx.fillStyle = g;
        draw.rect(gctx, -4, -4, size[0] + 8, size[1] + 8, 10);
      }
      var hasBackground = skin && skin.background && skin.background.complete;
      gctx.save();
      gctx.globalAlpha = hasBackground ? 0 : look.print;
      gctx.fillStyle = ink;
      gctx.strokeStyle = ink;
      gctx.lineCap = 'round';
      gctx.lineJoin = 'round';
      prints.forEach(function (fn) {
        fn(gctx, draw);
      });
      gctx.restore();
      if (cfg.ghosts !== false && (!skin || skin.ghosts)) {
        segs.forEach(function (s) {
          paintSeg(gctx, s, look.ghost);
        });
        for (var i = 0; i < 4; i++) {
          digit(gctx, digitX(i), hud.digits[1], null);
        }
        gctx.save();
        gctx.globalAlpha = look.ghost;
        gctx.fillStyle = ink;
        gctx.strokeStyle = ink;
        for (var m = 0; m < 3; m++) {
          missIcon(gctx, missX(m), hud.misses[1]);
        }
        colon(gctx);
        gctx.restore();
      }
      if (cfg.outline) {
        gctx.save();
        gctx.strokeStyle = '#e0245e';
        gctx.fillStyle = '#e0245e';
        gctx.lineWidth = 0.5;
        gctx.font = '4px sans-serif';
        segs.forEach(function (s) {
          var cut = skin && skin.segments[s.id];
          var box = cut && cut.length >= 6 ? [cut[4], cut[5], cut[2], cut[3]] : [s.x, s.y, s.w, s.h];
          if (skin && skin.layout && !(cut && cut.length >= 6)) {
            return;
          }
          gctx.strokeRect(box[0], box[1], box[2], box[3]);
          gctx.fillText(s.id, box[0] + 0.5, box[1] + 4);
        });
        gctx.restore();
      }
    }

    function colon(c) {
      var d = hud.digits;
      var k = hudScale();
      draw.rect(c, d[0] + 30.5 * k, d[1] + 5 * k, 2.6 * k, 2.6 * k, 0.6 * k);
      draw.rect(c, d[0] + 29.5 * k, d[1] + 14 * k, 2.6 * k, 2.6 * k, 0.6 * k);
    }

    // Corner radius of the game screen, in CSS pixels.
    var CORNER = 12;
    var tile = false;

    // Color around the screen on the tile, where the screen fills the whole widget:
    // the skin's "fill", else the background image's top right pixel, else the LCD panel color.
    function fillColor() {
      if (skin && skin.fill) {
        return skin.fill;
      }
      if (skin && skin.background && skin.background.complete && skin.background.naturalWidth) {
        try {
          var c = document.createElement('canvas');
          c.width = 1;
          c.height = 1;
          var cx = c.getContext('2d');
          cx.drawImage(skin.background, skin.background.naturalWidth - 1, 0, 1, 1, 0, 0, 1, 1);
          var p = cx.getImageData(0, 0, 1, 1).data;
          return 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')';
        } catch (e) {}
      }
      return look.panel2 || null;
    }

    function layout() {
      // The tile shows only the game screen: the page hides the header with this class.
      tile = !focused();
      document.documentElement.classList.toggle('gw-tile', tile);
      var stage = W.$('stage');
      var w = stage.clientWidth;
      var h = stage.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      var pad = look.panel && !tile ? 5 : 0;
      scale = Math.min((w - pad * 2) / size[0], (h - pad * 2) / size[1]);
      offX = (w - size[0] * scale) / 2;
      offY = (h - size[1] * scale) / 2;
      readColors();
      buildGhosts();
      dirty = true;
    }

    // ---------- Game state ----------
    var g = null;
    var real = false;        // false: demo (clock mode), true: a game the player controls
    var phase = 'run';       // run, miss, freeze, paused, over
    var score = 0;
    var misses = 0;
    var nextTick = 0;
    var phaseEnd = 0;
    var blink = false;
    var nextBlink = 0;
    var dirty = true;

    function beep(kind) {
      if (!cfg.sound || !real) {
        return;
      }
      if (kind === 'tick') {
        Sound.blip(1320, 0.025, 0.12);
      } else if (kind === 'move') {
        Sound.blip(990, 0.02, 0.1);
      } else if (kind === 'point') {
        Sound.blip(1760, 0.05, 0.25);
      } else if (kind === 'miss') {
        Sound.blip(220, 0.25, 0.4);
        setTimeout(function () {
          Sound.blip(165, 0.35, 0.4);
        }, 260);
      } else if (kind === 'bonus') {
        [1047, 1319, 1568, 2093].forEach(function (f, i) {
          setTimeout(function () {
            Sound.blip(f, 0.08, 0.3);
          }, i * 110);
        });
      }
    }

    var api = {
      mode: cfg.mode,
      cfg: cfg,
      score: function () {
        return score;
      },
      misses: function () {
        return misses;
      },
      demo: function () {
        return !real;
      },
      addScore: function (n) {
        var before = score;
        score += n || 1;
        beep('point');
        return before;
      },
      clearMisses: function () {
        misses = 0;
      },
      // Stops the game for ms (bonus jingle, for example).
      freeze: function (ms) {
        phase = 'freeze';
        phaseEnd = performance.now() + ms;
        beep('bonus');
      },
      // A miss: the game stops while the lost character blinks.
      miss: function () {
        if (real) {
          misses++;
        } else {
          W.log('demo miss', game.id, score);
        }
        phase = 'miss';
        phaseEnd = performance.now() + 1600;
        blink = true;
        nextBlink = performance.now() + 220;
        beep('miss');
      },
      beep: beep
    };

    function start(isReal) {
      real = isReal;
      score = 0;
      misses = 0;
      g = game.create(api);
      phase = 'run';
      nextTick = performance.now() + (real ? 700 : 300);
      dirty = true;
      overlay();
    }

    function focused() {
      return Input.isFocusedView();
    }

    function overlay() {
      var big = '';
      var small = '';
      var show = false;
      var modeName = 'Game ' + cfg.mode.toUpperCase();
      if (focused()) {
        if (!real) {
          show = true;
          big = game.title;
          small = modeName + ' · Press A or tap to start';
        } else if (phase === 'paused') {
          show = true;
          big = 'Paused';
          small = 'Press A to continue';
        } else if (phase === 'over') {
          show = true;
          big = 'Score ' + score;
          small = (score >= best && score > 0 ? 'New best! ' : '') + 'Press A to play again';
        }
      }
      W.$('msg-big').textContent = big;
      W.$('msg-small').textContent = small;
      W.$('overlay').classList.toggle('hidden', !show);
      W.$('best').textContent = focused() ? modeName + ' · Best ' + best : (best ? 'Best ' + best : 'Focus to play');
    }

    function clockDigits() {
      var d = new Date();
      var h = d.getHours();
      if (H12) {
        h = h % 12 || 12;
      }
      var hh = (h < 10 ? ' ' : '') + h;
      var mm = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
      return { text: hh + mm, colon: d.getSeconds() % 2 === 0, pm: d.getHours() >= 12 };
    }

    var H12 = false;
    try {
      var hc = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions();
      H12 = hc.hour12 === true || /h1[12]/.test(hc.hourCycle || '');
    } catch (e) {}

    function render() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Everything is clipped to the screen with rounded corners.
      ctx.save();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      // On the tile the whole widget is the screen; in the focused view, only the screen itself.
      var r = Math.min(CORNER, size[0] * scale / 4) * dpr;
      var x0 = tile ? 0 : offX * dpr;
      var y0 = tile ? 0 : offY * dpr;
      var x1 = tile ? canvas.width : x0 + size[0] * scale * dpr;
      var y1 = tile ? canvas.height : y0 + size[1] * scale * dpr;
      ctx.moveTo(x0 + r, y0);
      ctx.arcTo(x1, y0, x1, y1, r);
      ctx.arcTo(x1, y1, x0, y1, r);
      ctx.arcTo(x0, y1, x0, y0, r);
      ctx.arcTo(x0, y0, x1, y0, r);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(ghostCanvas, 0, 0);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offX, dpr * offY);
      if (g) {
        g.render(function (id) {
          var s = byId[id];
          if (s) {
            paintSeg(ctx, s, 1);
          }
        }, blink);
      }
      var text;
      var showColon = false;
      if (real) {
        var n = String(score % 10000);
        text = '    '.slice(n.length) + n;
      } else {
        var c = clockDigits();
        text = c.text;
        showColon = c.colon;
      }
      for (var i = 0; i < 4; i++) {
        digit(ctx, digitX(i), hud.digits[1], text.charAt(i));
      }
      ctx.save();
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      if (showColon) {
        colon(ctx);
      }
      var shown = phase === 'miss' && real && !blink ? misses - 1 : misses;
      for (var m = 0; m < Math.min(3, shown); m++) {
        missIcon(ctx, missX(m), hud.misses[1]);
      }
      if (shown > 0 && hud.missLabel) {
        sprite(ctx, '@miss-label', hud.missLabel[0], hud.missLabel[1]);
      }
      if (real && hud.label && sprite(ctx, '@game-' + cfg.mode, hud.label[0], hud.label[1])) {
        // GAME A / GAME B from the skin.
      } else if (real || !focused()) {
        var k = hudScale();
        ctx.font = '600 ' + (7 * k) + 'px ' + (getComputedStyle(W.$('root')).fontFamily || 'sans-serif');
        ctx.textAlign = 'right';
        var label = real ? 'GAME ' + cfg.mode.toUpperCase() : (H12 ? (clockDigits().pm ? 'PM' : 'AM') : '');
        ctx.fillText(label, hud.digits[0] - 4 * k, hud.digits[1] + 21 * k);
      }
      ctx.restore();
      ctx.restore();
    }

    var lastClock = '';

    function loop(now) {
      requestAnimationFrame(loop);
      if (document.visibilityState !== 'visible' || !g) {
        return;
      }
      if (real && phase !== 'paused' && phase !== 'over' && !focused()) {
        phase = 'paused';
        overlay();
        dirty = true;
      }
      if (phase === 'run' && now >= nextTick) {
        if (!real) {
          g.auto();
          if (score >= 180) {
            start(false);
            return;
          }
        }
        g.tick();
        beep('tick');
        nextTick = now + g.interval(score);
        dirty = true;
      } else if (phase === 'miss' || phase === 'freeze') {
        if (now >= nextBlink) {
          blink = !blink;
          nextBlink = now + 220;
          dirty = true;
        }
        if (now >= phaseEnd) {
          var wasMiss = phase === 'miss';
          blink = false;
          phase = 'run';
          if (wasMiss) {
            g.afterMiss();
            if (real && misses >= 3) {
              phase = 'over';
              if (score > best) {
                best = score;
                W.store.set(BEST_KEY, best);
              }
              overlay();
            }
          }
          nextTick = now + 500;
          dirty = true;
        }
      }
      if (!real) {
        var c = clockDigits();
        var key = c.text + c.colon;
        if (key !== lastClock) {
          lastClock = key;
          dirty = true;
        }
      }
      if (dirty) {
        dirty = false;
        render();
      }
    }

    // Screen position (client coordinates) to the game's own screen coordinates
    // (scaled back from a skin's screen size when it has one).
    function toLogical(x, y) {
      var r = canvas.getBoundingClientRect();
      var base = game.size || [320, 200];
      return { x: (x - r.left - offX) / scale * base[0] / size[0], y: (y - r.top - offY) / scale * base[1] / size[1] };
    }

    Input.on(function (a) {
      if (!focused()) {
        return;
      }
      if (!real || phase === 'over') {
        if (a.type === 'a' || a.type === 'start') {
          start(true);
        }
        return;
      }
      if (phase === 'paused') {
        if (a.type === 'a' || a.type === 'start') {
          phase = 'run';
          nextTick = performance.now() + 400;
          overlay();
          dirty = true;
        }
        return;
      }
      if (a.type === 'start') {
        phase = 'paused';
        overlay();
        dirty = true;
        return;
      }
      if (phase !== 'run' && phase !== 'freeze') {
        return;
      }
      var moved = false;
      if (a.type === 'dir') {
        moved = g.move(a.dir);
      } else if (a.type === 'a' && typeof a.x === 'number') {
        var p = toLogical(a.x, a.y);
        moved = g.tap(p.x, p.y);
      }
      if (moved) {
        beep('move');
        dirty = true;
      }
    });

    function onSize() {
      layout();
      if (!focused() && real && phase === 'over') {
        start(false);
      }
      overlay();
    }

    layout();
    loadSkin();
    start(false);
    window.addEventListener('resize', onSize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(onSize);
    }
    requestAnimationFrame(loop);
  }

  // Tick length in ms: starts at the speed setting's value and shortens as the score grows.
  function pace(cfg, score, base) {
    var start = base[cfg.speed] || base.normal;
    return Math.max(start * 0.45, start * Math.pow(0.9965, score));
  }

  // Skins bundled with a widget register here: GW.skins.name = { ...same fields as a skin JSON }.
  return { run: run, draw: draw, pace: pace, skins: {} };
})();
