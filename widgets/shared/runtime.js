// Shared widget runtime: settings, theme, font, storage, network, icons.
// Settings are read in this order, later ones win:
//   1. the shared defaults below, then the widget's own defaults
//   2. the JSON inside <script id="widget-config"> (written by the configurator on download)
//   3. the page URL, ?key=value or #key=value (for hosted links)
var W = (function () {
  // Storage is shared by every widget in iiSU, so every key gets this prefix.
  var PREFIX = 'iisu-widgets:';
  // Address of this file when the widget is hosted; empty once inlined into a download.
  var SCRIPT_SRC = (document.currentScript && document.currentScript.src) || '';
  var COMMON = {
    theme: 'light',       // light, dark, transparent, custom
    bg: '#414344',        // custom theme only
    fg: '#ffffff',        // custom theme only
    font: 'cal-sans',     // see fonts.js
    tilt: false,          // move the widget's content slightly when the handheld tilts
    resize: 'fade'        // animation when iiSU resizes the widget: none or fade
  };

  function log() {
    try {
      if (window.console && typeof console.log === 'function') {
        console.log.apply(console, ['[widget]'].concat(Array.prototype.slice.call(arguments)));
      }
    } catch (e) {}
  }

  function readEmbedded() {
    try {
      var el = document.getElementById('widget-config');
      var text = el ? el.textContent.trim() : '';
      return text ? JSON.parse(text) : {};
    } catch (e) {
      log('bad embedded config', String(e));
      return {};
    }
  }

  function readUrl() {
    var out = {};
    var parts = (location.search.slice(1) + '&' + location.hash.slice(1)).split('&');
    parts.forEach(function (p) {
      if (!p) {
        return;
      }
      var i = p.indexOf('=');
      try {
        var k = decodeURIComponent(i < 0 ? p : p.slice(0, i));
        var v = i < 0 ? '' : decodeURIComponent(p.slice(i + 1).replace(/\+/g, ' '));
        out[k] = v;
      } catch (e) {}
    });
    return out;
  }

  // Converts a value to the type of the default (URL values are always strings).
  function coerce(value, def) {
    if (typeof def === 'number') {
      var n = parseFloat(value);
      return isNaN(n) ? def : n;
    }
    if (typeof def === 'boolean') {
      return value === true || value === 'true' || value === '1' || value === 'on';
    }
    return value === null || value === undefined ? def : String(value);
  }

  function config(widgetDefaults) {
    var cfg = {};
    var defaults = {};
    Object.keys(COMMON).forEach(function (k) {
      defaults[k] = COMMON[k];
    });
    Object.keys(widgetDefaults).forEach(function (k) {
      defaults[k] = widgetDefaults[k];
    });
    var sources = [readEmbedded(), readUrl()];
    Object.keys(defaults).forEach(function (k) {
      cfg[k] = defaults[k];
      sources.forEach(function (src) {
        if (Object.prototype.hasOwnProperty.call(src, k) && src[k] !== '') {
          cfg[k] = coerce(src[k], defaults[k]);
        }
      });
    });
    applyTheme(cfg);
    applyFont(cfg.font);
    if (cfg.tilt) {
      tilt();
    }
    watchResize(cfg.resize);
    return cfg;
  }

  // ---------- Resize animation ----------
  // iiSU resizes a widget when it is focused (tile to full view) and back.
  // fade: the content fades out, the widget resizes with only its background showing,
  // and the content fades back in once the size has settled.
  var RESIZE = {
    fadeOut: 100,   // ms to hide the content
    settle: 160,    // ms without a size change before the resize counts as finished
    fadeIn: 260     // ms to show the content again
  };
  var resizeHandlers = [];

  function onResize(handler) {
    resizeHandlers.push(handler);
  }

  function watchResize(mode) {
    var root = document.getElementById('root');
    if (!root || !window.ResizeObserver) {
      return;
    }
    var last = null;
    var settleTimer = null;
    var restoreTimer = null;
    var hidden = false;

    function content() {
      return Array.prototype.slice.call(root.children);
    }

    function hide() {
      clearTimeout(restoreTimer);
      if (hidden) {
        return;
      }
      hidden = true;
      document.documentElement.classList.add('resizing');
      content().forEach(function (el) {
        el.style.transition = 'opacity ' + RESIZE.fadeOut + 'ms ease-out';
        el.style.opacity = '0';
      });
    }

    function show() {
      hidden = false;
      document.documentElement.classList.remove('resizing');
      content().forEach(function (el) {
        el.style.transition = 'opacity ' + RESIZE.fadeIn + 'ms ease-in';
        el.style.opacity = '';
      });
      // Give back the widget's own transitions once the fade is done.
      restoreTimer = setTimeout(function () {
        content().forEach(function (el) {
          el.style.transition = '';
        });
      }, RESIZE.fadeIn + 50);
    }

    new ResizeObserver(function (entries) {
      var box = entries[0].contentRect;
      var size = { w: Math.round(box.width), h: Math.round(box.height) };
      // The first report is the starting size, not a resize.
      if (!last) {
        last = size;
        return;
      }
      if (Math.abs(size.w - last.w) < 2 && Math.abs(size.h - last.h) < 2) {
        return;
      }
      last = size;
      resizeHandlers.forEach(function (h) {
        try {
          h(size);
        } catch (e) {
          log('resize handler failed', String(e));
        }
      });
      if (mode !== 'fade') {
        return;
      }
      hide();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(show, Math.max(RESIZE.settle, RESIZE.fadeOut));
    }).observe(document.documentElement);
  }

  // Tilt parallax. Sets --tilt-x and --tilt-y (from -1 to 1) on the page, smoothed.
  // The resting angle slowly becomes the new neutral, so holding the handheld at any angle works.
  // With idle: true, a slow sway is used when the device has no motion sensor (desktop previews).
  var tiltStarted = false;

  function tilt(opts) {
    if (tiltStarted) {
      return;
    }
    tiltStarted = true;
    opts = opts || {};
    var root = document.documentElement;
    root.classList.add('tilt');
    var target = { x: 0, y: 0 };
    var cur = { x: 0, y: 0 };
    var base = null;
    var lastEvent = 0;
    var start = Date.now();

    function clamp(v) {
      return Math.max(-1, Math.min(1, v));
    }

    function screenAngle() {
      var a = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      return ((a % 360) + 360) % 360;
    }

    window.addEventListener('deviceorientation', function (e) {
      if (e.beta === null || e.gamma === null) {
        return;
      }
      lastEvent = Date.now();
      var a = screenAngle();
      var x = e.gamma;
      var y = e.beta;
      if (a === 90) {
        x = e.beta;
        y = -e.gamma;
      } else if (a === 270) {
        x = -e.beta;
        y = e.gamma;
      } else if (a === 180) {
        x = -e.gamma;
        y = -e.beta;
      }
      if (!base) {
        base = { x: x, y: y };
      }
      base.x += (x - base.x) * 0.01;
      base.y += (y - base.y) * 0.01;
      target.x = clamp((x - base.x) / 15);
      target.y = clamp((y - base.y) / 15);
    });

    function frame() {
      if (opts.idle && Date.now() - lastEvent > 2000) {
        var t = (Date.now() - start) / 1000;
        target.x = Math.sin(t * 0.5) * 0.6;
        target.y = Math.sin(t * 0.37) * 0.35;
      }
      var dx = target.x - cur.x;
      var dy = target.y - cur.y;
      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        cur.x += dx * 0.12;
        cur.y += dy * 0.12;
        root.style.setProperty('--tilt-x', cur.x.toFixed(3));
        root.style.setProperty('--tilt-y', cur.y.toFixed(3));
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Downloads carry the font inside <style id="widget-fonts">. Hosted widgets load it from /fonts.
  function applyFont(id) {
    var f = FONTS[id] || FONTS['cal-sans'];
    document.documentElement.style.setProperty('--font', "'" + f.family + "'");
    if (document.getElementById('widget-fonts') || !SCRIPT_SRC) {
      return;
    }
    try {
      var base = new URL('../../fonts/', SCRIPT_SRC).href;
      var style = document.createElement('style');
      style.textContent = fontFaceCss(id in FONTS ? id : 'cal-sans', function (file) {
        return base + file.src;
      });
      document.head.appendChild(style);
    } catch (e) {
      log('font not loaded', String(e));
    }
  }

  function applyTheme(cfg) {
    var root = document.documentElement;
    var theme = cfg.theme || 'light';
    root.setAttribute('data-theme', theme);
    if (theme === 'custom') {
      var bg = cfg.bg || '#414344';
      var fg = cfg.fg || '#ffffff';
      root.style.setProperty('--bg', bg);
      root.style.setProperty('--fg', fg);
      root.style.setProperty('--muted', fg);
      root.style.setProperty('--subtle', fg);
      root.style.setProperty('--strong', fg);
      root.style.setProperty('--on-strong', bg);
    }
  }

  // Storage is shared by every widget on the device, so keys are prefixed.
  var store = {
    get: function (key, maxAgeMs) {
      try {
        var raw = localStorage.getItem(PREFIX + key);
        if (!raw) {
          return null;
        }
        var item = JSON.parse(raw);
        if (maxAgeMs && Date.now() - item.t > maxAgeMs) {
          return null;
        }
        return item.v;
      } catch (e) {
        return null;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
      } catch (e) {}
    }
  };

  function fetchJson(url, timeoutMs) {
    return Promise.race([
      fetch(url).then(function (r) {
        if (!r.ok) {
          throw new Error('HTTP ' + r.status);
        }
        return r.json();
      }),
      new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('timeout'));
        }, timeoutMs || 10000);
      })
    ]);
  }

  function icon(name) {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  function $(id) {
    return document.getElementById(id);
  }

  return { log: log, config: config, store: store, fetchJson: fetchJson, icon: icon, tilt: tilt, onResize: onResize, $: $ };
})();
