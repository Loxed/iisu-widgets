(function () {
  var THEMES = [['light', 'Light'], ['dark', 'Dark'], ['aurora', 'Aurora'], ['transparent', 'Transparent'], ['custom', 'Custom']];

  var HOURS = [];
  for (var hr = 0; hr < 24; hr++) {
    HOURS.push([hr, (hr < 10 ? '0' : '') + hr + ':00']);
  }
  var FORMAT = { key: 'hours', label: 'Format', type: 'seg', def: '24', choices: [['24', '24 h'], ['12', '12 h']] };

  var GROUPS = [
    ['essentials', 'Essentials'],
    ['device', 'Device'],
    ['decor', 'Decor'],
    ['games', 'Games', 'Focus a game in iiSU to play it: D-pad, stick or swipe to move, A (or a tap) to start. On the small tile the buttons keep controlling iiSU.']
  ];

  // One entry per widget. Each option's `def` must match the default inside the widget file,
  // with the same type (number, boolean or string).
  var WIDGETS = [
    {
      id: 'clock',
      group: 'essentials',
      name: 'Clock',
      desc: 'Six faces: classic hands, digital, split dial, LCD segments, Roman numerals or a wavy disc.',
      options: [
        { key: 'style', label: 'Face', type: 'select', def: 'analog', choices: [['analog', 'Classic'], ['digital', 'Digital'], ['split', 'Split dial'], ['lcd', 'LCD'], ['roman', 'Roman'], ['wavy', 'Wavy']] },
        FORMAT,
        { key: 'seconds', label: 'Seconds', type: 'switch', def: true }
      ]
    },
    {
      id: 'calendar',
      group: 'essentials',
      name: 'Calendar',
      desc: 'This month, with today highlighted.',
      options: [
        { key: 'style', label: 'Style', type: 'seg', def: 'grid', choices: [['grid', 'Numbers'], ['dots', 'Dots']] },
        { key: 'weekStart', label: 'Week starts on', type: 'seg', def: 'monday', choices: [['monday', 'Monday'], ['sunday', 'Sunday']] }
      ]
    },
    {
      id: 'weather',
      group: 'essentials',
      name: 'Weather',
      desc: 'Current weather, today\'s range and a 5-day forecast in the focused view. Bold takes its colors from the weather.',
      options: [
        { key: 'style', label: 'Style', type: 'seg', def: 'classic', choices: [['classic', 'Classic'], ['bold', 'Bold'], ['card', 'Card']] },
        { key: 'location', label: 'Location', type: 'seg', def: 'ip', choices: [['ip', 'Automatic'], ['fixed', 'Choose a city']] },
        { key: 'place', type: 'place', showIf: { location: 'fixed' } },
        { key: 'tempUnit', label: 'Temperature', type: 'seg', def: 'celsius', choices: [['celsius', '°C'], ['fahrenheit', '°F']] },
        { key: 'windUnit', label: 'Wind', type: 'select', def: 'kmh', choices: [['kmh', 'km/h'], ['mph', 'mph'], ['ms', 'm/s'], ['kn', 'knots']] }
      ],
      extra: { lat: 48.8566, lon: 2.3522, city: 'Paris', country: 'France' }
    },
    {
      id: 'battery',
      group: 'device',
      name: 'Battery',
      desc: 'Level, charging state and an estimate of the time left, measured from your own use. The focused view adds a history chart.',
      options: [
        { key: 'lowAt', label: 'Low warning at', type: 'select', def: 20, choices: [[10, '10%'], [15, '15%'], [20, '20%'], [30, '30%']] },
        { key: 'history', label: 'Chart shows', type: 'seg', def: 12, choices: [[6, '6 h'], [12, '12 h'], [24, '24 h']] }
      ]
    },
    {
      id: 'devices',
      group: 'device',
      name: 'Devices',
      desc: 'Battery pills for the handheld and the controllers connected to it. Controllers appear after you press one of their buttons.',
      options: [
        { key: 'fill', label: 'Fill color', type: 'seg', def: 'yellow', choices: [['yellow', 'Yellow'], ['green', 'Green'], ['theme', 'Theme']] },
        { key: 'controllers', label: 'Show controllers', type: 'switch', def: true },
        { key: 'builtIn', label: 'Include built-in controls', type: 'switch', def: false, showIf: { controllers: true } }
      ]
    },
    {
      id: 'chime',
      group: 'device',
      name: 'Hourly chime',
      desc: 'A short chime on the hour. Tap the widget to hear it.',
      options: [
        { key: 'sound', label: 'Sound', type: 'seg', def: 'bell', choices: [['bell', 'Bell'], ['chiptune', 'Chiptune'], ['soft', 'Soft']] },
        { key: 'volume', label: 'Volume', type: 'seg', def: 0.5, choices: [[0.25, 'Low'], [0.5, 'Medium'], [1, 'High']] },
        { key: 'every', label: 'Chime', type: 'seg', def: 60, choices: [[60, 'Every hour'], [30, 'Every 30 min']] },
        { key: 'countHours', label: 'Ring the hour count', type: 'switch', def: false },
        { key: 'quiet', label: 'Quiet hours', type: 'switch', def: true },
        { key: 'quietFrom', label: 'Quiet from', type: 'select', def: 22, choices: HOURS, showIf: { quiet: true } },
        { key: 'quietTo', label: 'Quiet until', type: 'select', def: 8, choices: HOURS, showIf: { quiet: true } },
        { key: 'onlyOnScreen', label: 'Silent while playing', type: 'switch', def: true },
        { key: 'vibrate', label: 'Vibrate', type: 'switch', def: false },
        FORMAT
      ]
    },
    {
      id: 'scene',
      group: 'decor',
      name: 'Scene',
      desc: 'Layered landscape that follows the time of day and moves with the handheld\'s tilt (it sways gently here).',
      options: [
        { key: 'landscape', label: 'Landscape', type: 'seg', def: 'meadow', choices: [['meadow', 'Meadow'], ['desert', 'Desert'], ['snow', 'Snow']] },
        { key: 'motion', label: 'Tilt motion', type: 'switch', def: true },
        { key: 'showTime', label: 'Show time', type: 'switch', def: true },
        FORMAT
      ]
    },
    {
      id: 'snake',
      group: 'games',
      name: 'Snake',
      desc: 'Eat, grow, don\'t bite yourself. Best scores are kept on the device.',
      options: [
        { key: 'speed', label: 'Speed', type: 'seg', def: 'normal', choices: [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']] },
        { key: 'walls', label: 'Walls', type: 'seg', def: 'solid', choices: [['solid', 'Solid'], ['wrap', 'Wrap around']] },
        { key: 'sound', label: 'Sound effects', type: 'switch', def: true }
      ]
    },
    {
      id: '2048',
      group: 'games',
      name: '2048',
      desc: 'Slide and merge tiles to reach 2048. Your game is saved, so you can leave and come back.',
      options: [
        { key: 'sound', label: 'Sound effects', type: 'switch', def: true }
      ]
    }
  ];

  var SAVE_KEY = 'iisu-configurator';
  var DEFAULT_FONT = 'cal-sans';
  var state = { theme: 'dark', font: DEFAULT_FONT, tilt: false, bg: '#414344', fg: '#ffffff', view: 'tile', widgets: {} };
  var fontAvailable = { 'cal-sans': true };

  WIDGETS.forEach(function (w) {
    var s = {};
    w.options.forEach(function (o) {
      if (o.def !== undefined) {
        s[o.key] = o.def;
      }
    });
    Object.keys(w.extra || {}).forEach(function (k) {
      s[k] = w.extra[k];
    });
    state.widgets[w.id] = s;
  });

  try {
    var saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (saved) {
      ['theme', 'font', 'tilt', 'bg', 'fg', 'view'].forEach(function (k) {
        if (saved[k] !== undefined) {
          state[k] = saved[k];
        }
      });
      Object.keys(saved.widgets || {}).forEach(function (id) {
        // Only keep settings that still exist (older versions had more).
        Object.keys(saved.widgets[id] || {}).forEach(function (k) {
          if (state.widgets[id] && k in state.widgets[id]) {
            state.widgets[id][k] = saved.widgets[id][k];
          }
        });
      });
    }
  } catch (e) {}

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') {
        n.textContent = attrs[k];
      } else if (k.indexOf('on') === 0) {
        n.addEventListener(k.slice(2), attrs[k]);
      } else {
        n.setAttribute(k, attrs[k]);
      }
    });
    (children || []).forEach(function (c) {
      if (c) {
        n.appendChild(c);
      }
    });
    return n;
  }

  function segmented(choices, value, onPick) {
    var box = el('div', { class: 'seg', role: 'group' });
    choices.forEach(function (c) {
      var b = el('button', { type: 'button', 'aria-pressed': String(String(c[0]) === String(value)), text: c[1] });
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(box.children, function (x) {
          x.setAttribute('aria-pressed', 'false');
        });
        b.setAttribute('aria-pressed', 'true');
        onPick(c[0]);
      });
      box.appendChild(b);
    });
    return box;
  }

  function currentFont() {
    return fontAvailable[state.font] ? state.font : DEFAULT_FONT;
  }

  // Full settings for a widget: look (theme, font) plus the widget's own options.
  function settingsFor(w) {
    var cfg = { theme: state.theme, font: currentFont() };
    if (state.tilt) {
      cfg.tilt = true;
    }
    if (state.theme === 'custom') {
      cfg.bg = state.bg;
      cfg.fg = state.fg;
    }
    Object.keys(state.widgets[w.id]).forEach(function (k) {
      cfg[k] = state.widgets[w.id][k];
    });
    if (w.id === 'weather' && cfg.location !== 'fixed') {
      delete cfg.lat;
      delete cfg.lon;
      delete cfg.city;
      delete cfg.country;
    }
    return cfg;
  }

  // Only the values that differ from the defaults go in the link, to keep it short.
  function query(w) {
    var cfg = settingsFor(w);
    var defs = { font: DEFAULT_FONT, tilt: false };
    w.options.forEach(function (o) {
      defs[o.key] = o.def;
    });
    return Object.keys(cfg).filter(function (k) {
      return k === 'theme' || defs[k] === undefined || String(defs[k]) !== String(cfg[k]);
    }).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(cfg[k]);
    }).join('&');
  }

  function widgetUrl(w) {
    return new URL('widgets/' + w.id + '.html?' + query(w), location.href).href;
  }

  var frames = {};

  function refreshPreview(w) {
    var f = frames[w.id];
    if (f) {
      f.src = 'widgets/' + w.id + '.html?' + query(w);
    }
  }

  function refreshAll() {
    WIDGETS.forEach(refreshPreview);
    save();
  }

  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) {
        throw new Error(url + ': HTTP ' + r.status);
      }
      return r.text();
    });
  }

  function toDataUri(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) {
        throw new Error(url + ': HTTP ' + r.status);
      }
      return r.blob();
    }).then(function (blob) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
  }

  // Builds one self-contained file: shared CSS/JS inlined, font embedded, settings written in.
  // Everything happens in the browser, so the site stays fully static.
  function buildFile(w) {
    var pageUrl = new URL('widgets/' + w.id + '.html', location.href);
    return fetchText(pageUrl.href).then(function (html) {
      var parts = [];
      var re = /<link rel="stylesheet" href="([^"]+)" data-inline>|<script src="([^"]+)" data-inline><\/script>/g;
      var m;
      while ((m = re.exec(html))) {
        parts.push({ tag: m[0], css: !!m[1], url: new URL(m[1] || m[2], pageUrl).href });
      }
      return Promise.all(parts.map(function (p) {
        return fetchText(p.url);
      })).then(function (texts) {
        parts.forEach(function (p, i) {
          var code = texts[i].replace(/<\/(script|style)/gi, '<\\/$1');
          var inline = p.css ? '<style>\n' + code + '</style>' : '<script>\n' + code + '<\/script>';
          html = html.replace(p.tag, function () {
            return inline;
          });
        });
        var font = FONTS[currentFont()];
        return Promise.all(font.files.map(function (file) {
          return toDataUri('fonts/' + file.src);
        }));
      }).then(function (uris) {
        var i = 0;
        var css = fontFaceCss(currentFont(), function () {
          return uris[i++];
        });
        html = html.replace('</head>', function () {
          return '<style id="widget-fonts">\n' + css + '\n</style>\n</head>';
        });
        var json = JSON.stringify(settingsFor(w), null, 2).replace(/</g, '\\u003c');
        var marker = /<script id="widget-config" type="application\/json">[\s\S]*?<\/script>/;
        if (!marker.test(html)) {
          throw new Error('config block not found');
        }
        return html.replace(marker, function () {
          return '<script id="widget-config" type="application/json">\n' + json + '\n<\/script>';
        });
      });
    });
  }

  function fileName(w) {
    return w.id + '-' + state.theme + (currentFont() !== DEFAULT_FONT ? '-' + currentFont() : '') + '.html';
  }

  function download(w, button) {
    var label = button.textContent;
    button.textContent = 'Preparing…';
    buildFile(w).then(function (html) {
      var blob = new Blob([html], { type: 'text/html' });
      var a = el('a', { href: URL.createObjectURL(blob), download: fileName(w) });
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1000);
      button.textContent = 'Downloaded';
    }).catch(function (e) {
      button.textContent = 'Download failed';
      if (window.console) {
        console.log('download failed', e);
      }
    }).then(function () {
      setTimeout(function () {
        button.textContent = label;
      }, 1800);
    });
  }

  function copyLink(w, button) {
    var link = widgetUrl(w);
    var done = function () {
      button.textContent = 'Copied';
      setTimeout(function () {
        button.textContent = 'Copy link';
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(done, function () {
        window.prompt('Copy this link', link);
      });
    } else {
      window.prompt('Copy this link', link);
    }
  }

  function placePicker(w, s, onChange) {
    var current = el('div', { class: 'place-current' });
    var input = el('input', { type: 'text', placeholder: 'Search a city', 'aria-label': 'City' });
    var results = el('div', { class: 'results' });

    function showCurrent() {
      current.textContent = 'Selected: ' + s.city + ' (' + (+s.lat).toFixed(2) + ', ' + (+s.lon).toFixed(2) + ')';
    }

    function search() {
      var q = input.value.trim();
      if (!q) {
        return;
      }
      results.innerHTML = '';
      results.appendChild(el('div', { class: 'place-current', text: 'Searching…' }));
      fetch('https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&name=' + encodeURIComponent(q)).then(function (r) {
        return r.json();
      }).then(function (data) {
        results.innerHTML = '';
        var list = data.results || [];
        if (!list.length) {
          results.appendChild(el('div', { class: 'place-current', text: 'No city found.' }));
        }
        list.forEach(function (p) {
          var label = [p.name, p.admin1, p.country].filter(Boolean).join(', ');
          results.appendChild(el('button', {
            type: 'button',
            text: label,
            onclick: function () {
              s.lat = Math.round(p.latitude * 10000) / 10000;
              s.lon = Math.round(p.longitude * 10000) / 10000;
              s.city = p.name;
              s.country = p.country || '';
              results.innerHTML = '';
              input.value = '';
              showCurrent();
              onChange();
            }
          }));
        });
      }).catch(function () {
        results.innerHTML = '';
        results.appendChild(el('div', { class: 'place-current', text: 'Search failed, check your connection.' }));
      });
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        search();
      }
    });
    showCurrent();
    return el('div', { class: 'place' }, [
      el('div', { class: 'place-search' }, [input, el('button', { type: 'button', class: 'btn small', text: 'Search', onclick: search })]),
      results,
      current
    ]);
  }

  function buildCard(w) {
    var s = state.widgets[w.id];
    var frame = el('iframe', { title: w.name + ' preview', loading: 'lazy' });
    frames[w.id] = frame;

    var rows = [];
    var conditional = [];

    function changed() {
      conditional.forEach(function (c) {
        var show = Object.keys(c.cond).every(function (k) {
          return s[k] === c.cond[k];
        });
        c.node.classList.toggle('hidden', !show);
      });
      refreshPreview(w);
      save();
    }

    w.options.forEach(function (o) {
      var control;
      if (o.type === 'seg') {
        control = segmented(o.choices, s[o.key], function (v) {
          s[o.key] = v;
          changed();
        });
      } else if (o.type === 'select') {
        control = el('select', { 'aria-label': o.label });
        o.choices.forEach(function (c) {
          var opt = el('option', { value: c[0], text: c[1] });
          if (String(c[0]) === String(s[o.key])) {
            opt.selected = true;
          }
          control.appendChild(opt);
        });
        control.addEventListener('change', function () {
          s[o.key] = o.choices[control.selectedIndex][0];
          changed();
        });
      } else if (o.type === 'switch') {
        control = el('button', { type: 'button', class: 'switch', role: 'switch', 'aria-checked': String(!!s[o.key]), 'aria-label': o.label });
        control.addEventListener('click', function () {
          s[o.key] = !s[o.key];
          control.setAttribute('aria-checked', String(s[o.key]));
          changed();
        });
      } else if (o.type === 'place') {
        var picker = placePicker(w, s, changed);
        conditional.push({ node: picker, cond: o.showIf });
        rows.push(picker);
        return;
      }
      var row = el('div', { class: 'opt' }, [el('span', { text: o.label }), control]);
      if (o.showIf) {
        conditional.push({ node: row, cond: o.showIf });
      }
      rows.push(row);
    });

    var dl = el('button', { type: 'button', class: 'btn primary', text: 'Download' });
    dl.addEventListener('click', function () {
      download(w, dl);
    });
    var cp = el('button', { type: 'button', class: 'btn', text: 'Copy link' });
    cp.addEventListener('click', function () {
      copyLink(w, cp);
    });

    var card = el('article', { class: 'card' }, [
      el('div', { class: 'preview' }, [frame]),
      el('div', { class: 'body' }, [el('h2', { text: w.name }), el('p', { class: 'desc', text: w.desc })].concat(rows).concat([el('div', { class: 'actions' }, [dl, cp])]))
    ]);

    changed();
    return card;
  }

  // Global controls
  var customBox = document.getElementById('custom-colors');
  document.getElementById('theme-seg').replaceWith((function () {
    var seg = segmented(THEMES, state.theme, function (v) {
      state.theme = v;
      customBox.classList.toggle('hidden', v !== 'custom');
      refreshAll();
    });
    seg.id = 'theme-seg';
    return seg;
  })());
  customBox.classList.toggle('hidden', state.theme !== 'custom');

  ['bg', 'fg'].forEach(function (k) {
    var input = document.getElementById(k);
    input.value = state[k];
    var timer;
    input.addEventListener('input', function () {
      state[k] = input.value;
      clearTimeout(timer);
      timer = setTimeout(refreshAll, 250);
    });
  });

  // Fonts: show each option in its own typeface, and disable the ones whose file is not in /fonts yet.
  var fontCss = Object.keys(FONTS).map(function (id) {
    return fontFaceCss(id, function (file) {
      return 'fonts/' + file.src;
    });
  }).join('\n');
  document.head.appendChild(el('style', { text: fontCss }));

  var fontNote = document.getElementById('font-note');
  var fontSeg = segmented(Object.keys(FONTS).map(function (id) {
    return [id, FONTS[id].name];
  }), currentFont(), function (v) {
    state.font = v;
    fontNote.textContent = FONTS[v].note;
    refreshAll();
  });
  fontSeg.id = 'font-seg';
  document.getElementById('font-seg').replaceWith(fontSeg);
  // With a single font there is nothing to pick.
  if (Object.keys(FONTS).length < 2) {
    document.getElementById('font-field').classList.add('hidden');
  }
  fontNote.textContent = FONTS[currentFont()].note;
  Array.prototype.forEach.call(fontSeg.children, function (b, i) {
    var id = Object.keys(FONTS)[i];
    b.style.fontFamily = "'" + FONTS[id].family + "', system-ui, sans-serif";
    if (fontAvailable[id]) {
      return;
    }
    b.disabled = true;
    b.title = 'Font file not added yet';
    fetch('fonts/' + FONTS[id].files[0].src, { method: 'HEAD' }).then(function (r) {
      if (r.ok) {
        fontAvailable[id] = true;
        b.disabled = false;
        b.title = '';
        if (state.font === id) {
          b.click();
        }
      }
    }).catch(function () {});
  });

  document.getElementById('view-seg').replaceWith((function () {
    var seg = segmented([['tile', 'Tile'], ['focused', 'Focused']], state.view, function (v) {
      state.view = v;
      document.body.classList.toggle('focused', v === 'focused');
      save();
    });
    seg.id = 'view-seg';
    return seg;
  })());
  document.body.classList.toggle('focused', state.view === 'focused');

  var cards = document.getElementById('cards');
  GROUPS.forEach(function (g) {
    var list = WIDGETS.filter(function (w) {
      return w.group === g[0];
    });
    if (!list.length) {
      return;
    }
    var grid = el('div', { class: 'grid' });
    list.forEach(function (w) {
      grid.appendChild(buildCard(w));
    });
    cards.appendChild(el('section', { class: 'group' }, [
      el('h2', { class: 'group-title', text: g[1] }),
      g[2] ? el('p', { class: 'group-note', text: g[2] }) : null,
      grid
    ]));
  });
})();
