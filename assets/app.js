(function () {
  var THEMES = [['light', 'Light'], ['dark', 'Dark'], ['aurora', 'Aurora'], ['transparent', 'Transparent'], ['custom', 'Custom']];

  var HOURS = [];
  for (var hr = 0; hr < 24; hr++) {
    HOURS.push([hr, (hr < 10 ? '0' : '') + hr + ':00']);
  }
  var FORMAT = { key: 'hours', label: 'Format', type: 'seg', def: '24', choices: [['24', '24 h'], ['12', '12 h']] };

  // The 16 favorite colors of the Nintendo DS (values from ds.css).
  var DS_COLORS = [
    ['#61829a', 'Slate'], ['#ba4900', 'Brown'], ['#fb0018', 'Red'], ['#fb8afb', 'Pink'],
    ['#fb9200', 'Orange'], ['#f3e300', 'Yellow'], ['#aafb00', 'Lime'], ['#00fb00', 'Green'],
    ['#00a238', 'Dark green'], ['#49db8a', 'Sea green'], ['#30baf3', 'Turquoise'], ['#0059f3', 'Blue'],
    ['#000092', 'Navy'], ['#8a00d3', 'Purple'], ['#d300eb', 'Magenta'], ['#fb0092', 'Fuchsia']
  ];

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
      credits: [
        { name: 'Open-Meteo', url: 'https://open-meteo.com/', license: 'CC BY 4.0', note: 'weather data' },
        { name: 'GeoJS', url: 'https://www.geojs.io/', note: 'automatic location' }
      ],
      options: [
        { key: 'style', label: 'Style', type: 'seg', def: 'classic', choices: [['classic', 'Classic'], ['bold', 'Bold'], ['card', 'Card']] },
        { key: 'location', label: 'Location', type: 'seg', def: 'ip', choices: [['ip', 'Automatic'], ['fixed', 'Choose a city']] },
        { key: 'place', type: 'place', showIf: { location: 'fixed' } },
        { key: 'tempUnit', label: 'Temperature', type: 'seg', def: 'celsius', choices: [['celsius', '°C'], ['fahrenheit', '°F']] },
        { key: 'windUnit', label: 'Wind', type: 'select', def: 'kmh', choices: [['kmh', 'km/h'], ['mph', 'mph'], ['ms', 'm/s'], ['kn', 'knots']] },
        {
          key: 'preview', label: 'Preview weather', type: 'select', def: '', previewOnly: true,
          choices: [['', 'Live weather'], ['clear-day', 'Sunny'], ['clear-night', 'Clear night'], ['mainly-clear', 'Mainly clear'],
            ['mainly-clear-night', 'Mainly clear, night'], ['partly-day', 'Partly cloudy'], ['partly-night', 'Partly cloudy, night'],
            ['overcast', 'Overcast'], ['windy', 'Windy'], ['fog', 'Fog'], ['freezing-fog', 'Freezing fog'],
            ['light-drizzle', 'Light drizzle'], ['drizzle', 'Drizzle'], ['heavy-drizzle', 'Heavy drizzle'], ['freezing-drizzle', 'Freezing drizzle'],
            ['light-rain', 'Light rain'], ['rain', 'Rain'], ['heavy-rain', 'Heavy rain'], ['freezing-rain', 'Freezing rain'],
            ['showers', 'Showers'], ['heavy-showers', 'Heavy showers'], ['violent-showers', 'Violent showers'],
            ['light-snow', 'Light snow'], ['snow', 'Snow'], ['heavy-snow', 'Heavy snow'], ['snow-grains', 'Snow grains'],
            ['snow-showers', 'Snow showers'], ['thunderstorm', 'Thunderstorm'], ['hail', 'Hailstorm']]
        },
        { key: 'previewNight', label: 'Preview at night', type: 'switch', def: false, previewOnly: true }
      ],
      extra: { lat: 48.8566, lon: 2.3522, city: 'Paris', country: 'France' }
    },
    {
      id: 'ds',
      group: 'essentials',
      name: 'DS clock and calendar',
      desc: 'The Nintendo DS clock and calendar, recreated by ds.css. Auto shows the clock on the tile and both when focused.',
      credits: [
        { name: 'ds.css', by: 'spiritov', url: 'https://github.com/spiritov/ds.css', license: 'MIT', note: 'clock and calendar components' },
        { name: 'Nintendo DS - Clock Numbers Font', by: 'zigaudrey', license: 'FontStruct Non-Commercial', note: 'clock numbers' },
        { name: 'Nitro DS font', note: 'calendar text, shipped with ds.css' }
      ],
      options: [
        { key: 'show', label: 'Show', type: 'seg', def: 'auto', choices: [['auto', 'Auto'], ['clock', 'Clock'], ['calendar', 'Calendar'], ['both', 'Both']] },
        { key: 'color', label: 'Favorite color', type: 'colors', def: '#30baf3', choices: DS_COLORS },
        { key: 'background', label: 'Background', type: 'seg', def: 'grid', choices: [['grid', 'DS grid'], ['theme', 'Theme'], ['none', 'None']] },
        { key: 'frame', label: 'Frame', type: 'switch', def: true },
        { key: 'sharp', label: 'Crisp pixels', type: 'switch', def: true }
      ]
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
      desc: 'Battery pills for the handheld, plus the controllers and headphones connected to it. Controllers appear after you press one of their buttons.',
      options: [
        { key: 'fill', label: 'Fill color', type: 'seg', def: 'yellow', choices: [['yellow', 'Yellow'], ['green', 'Green'], ['theme', 'Theme']] },
        { key: 'controllers', label: 'Show controllers', type: 'switch', def: true },
        { key: 'builtIn', label: 'Include built-in controls', type: 'switch', def: false, showIf: { controllers: true } },
        { key: 'audio', label: 'Show headphones', type: 'switch', def: true }
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
      id: 'music',
      group: 'device',
      name: 'Hourly music',
      desc: 'Plays a game\'s music for the current hour, loops it and crossfades to the next track on the hour, while iiSU shows the widget. The music comes from your own files, through a music pack made below. Tap to play or pause.',
      panel: 'MusicPackPanel',
      options: [
        { key: 'volume', label: 'Volume', type: 'seg', def: 0.7, choices: [[0.4, 'Low'], [0.7, 'Medium'], [1, 'High']] },
        { key: 'fade', label: 'Hour change', type: 'seg', def: 6, choices: [[2, 'Quick'], [6, 'Crossfade'], [15, 'Slow']] },
        { key: 'autoplay', label: 'Start by itself', type: 'switch', def: true },
        { key: 'duck', label: 'Lower iiSU music while playing', type: 'switch', def: true },
        { key: 'hours', label: 'Format', type: 'seg', def: '12', choices: [['24', '24 h'], ['12', '12 h']] }
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
      id: 'fire',
      group: 'games',
      name: 'Game & Watch: Fire',
      desc: 'Move the firemen\'s net so the jumpers bounce three times into the ambulance. Game B adds a second floor. The tile shows the clock while the game plays itself.',
      credits: [
        { name: 'Game & Watch: Fire', by: 'Nintendo', note: 'original game (1980)' },
        { name: 'Game & Watch Gallery sprites', by: 'Mario Gamer', note: 'ripped, shaded and recolored by Grynz (The Spriters Resource)' }
      ],
      options: [
        { key: 'mode', label: 'Game', type: 'seg', def: 'a', choices: [['a', 'Game A'], ['b', 'Game B']] },
        { key: 'speed', label: 'Speed', type: 'seg', def: 'normal', choices: [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']] },
        { key: 'ghosts', label: 'Faint background sprites', type: 'switch', def: true },
        { key: 'color', label: 'Color', type: 'switch', def: false },
        { key: 'sound', label: 'Sound effects', type: 'switch', def: true },
        { key: 'duck', label: 'Lower iiSU music while playing', type: 'switch', def: true }
      ]
    },
    {
      id: 'chef',
      group: 'games',
      name: 'Game & Watch: Chef',
      desc: 'Flip the food with the pan before the mouse gets it, and watch the cat\'s fork. Three pieces of food in Game A, four in Game B. The tile shows the clock while the game plays itself.',
      credits: [
        { name: 'Game & Watch: Chef', by: 'Nintendo', note: 'original game (1981)' },
        { name: 'Game & Watch Gallery sprites', by: 'Classic Jack', note: 'ripped (The Spriters Resource)' }
      ],
      options: [
        { key: 'mode', label: 'Game', type: 'seg', def: 'a', choices: [['a', 'Game A'], ['b', 'Game B']] },
        { key: 'speed', label: 'Speed', type: 'seg', def: 'normal', choices: [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']] },
        { key: 'ghosts', label: 'Faint background sprites', type: 'switch', def: true },
        { key: 'color', label: 'Color', type: 'switch', def: false },
        { key: 'sound', label: 'Sound effects', type: 'switch', def: true },
        { key: 'duck', label: 'Lower iiSU music while playing', type: 'switch', def: true }
      ]
    },
    {
      id: 'manhole',
      group: 'games',
      name: 'Game & Watch: Manhole',
      desc: 'Hold the lid under the manhole people are about to cross. Up, down, left and right pick the hole, or tap it. Double points from 300 with no misses. The tile shows the clock while the game plays itself.',
      credits: [
        { name: 'Game & Watch: Manhole', by: 'Nintendo', note: 'original game (1981)' },
        { name: 'Game & Watch Gallery sprites', by: 'Classic Jack', note: 'ripped (The Spriters Resource)' }
      ],
      options: [
        { key: 'mode', label: 'Game', type: 'seg', def: 'a', choices: [['a', 'Game A'], ['b', 'Game B']] },
        { key: 'speed', label: 'Speed', type: 'seg', def: 'normal', choices: [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']] },
        { key: 'ghosts', label: 'Faint background sprites', type: 'switch', def: true },
        { key: 'color', label: 'Color', type: 'switch', def: false },
        { key: 'sound', label: 'Sound effects', type: 'switch', def: true },
        { key: 'duck', label: 'Lower iiSU music while playing', type: 'switch', def: true }
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
    },
    // {
    //   id: 'dvd',
    //   group: 'decor',
    //   name: 'DVD',
    //   desc: 'The screensaver. The logo drifts and bounces forever, and counts corner hits.',
    //   options: [
    //     { key: 'speed', label: 'Speed', type: 'seg', def: 'normal', choices: [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']] },
    //     { key: 'color', label: 'Logo color', type: 'seg', def: 'theme', choices: [['theme', 'Theme'], ['classic', 'DVD blue']] },
    //     { key: 'corners', label: 'Corner flash', type: 'switch', def: true },
    //     { key: 'sound', label: 'Sound on corner', type: 'switch', def: false }
    //   ]
    // }
  ];

  // external.html lists pages that already live online instead of our own widgets.
  var IS_EXTERNAL = document.body.getAttribute('data-page') === 'external';
  if (IS_EXTERNAL) {
    WIDGETS = window.EXTERNAL_WIDGETS || [];
    GROUPS = window.EXTERNAL_GROUPS || [];
  }

  var SAVE_KEY = 'iisu-configurator';
  var DEFAULT_FONT = 'cal-sans';
  var state = { theme: 'dark', font: DEFAULT_FONT, tilt: false, resize: 'fade', bg: '#68ccff', bg2: '#c56eff', fg: '#ffffff', view: 'tile', widgets: {} };
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
      // 'tilt' is no longer restored: its switch was removed, so a saved 'on' could not be turned off.
      ['theme', 'font', 'resize', 'bg', 'bg2', 'fg', 'view'].forEach(function (k) {
        if (saved[k] !== undefined) {
          state[k] = saved[k];
        }
      });
      // Saved before custom had two colors: keep that flat color.
      if (saved.bg && !saved.bg2) {
        state.bg2 = saved.bg;
      }
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

  // Options that only change the preview on this page (never downloaded or linked).
  function isPreviewOnly(w, key) {
    return w.options.some(function (o) {
      return o.key === key && o.previewOnly;
    });
  }

  // Address of an external page, with its options in its own query string.
  function siteUrl(w) {
    var s = state.widgets[w.id];
    var params = [];
    w.options.forEach(function (o) {
      if (!o.param || s[o.key] === o.def) {
        return;
      }
      var v = o.type === 'switch' ? (s[o.key] ? '1' : (o.off || '0')) : s[o.key];
      params.push(encodeURIComponent(o.param) + '=' + encodeURIComponent(v));
    });
    return w.site + (params.length ? (w.site.indexOf('?') === -1 ? '?' : '&') + params.join('&') : '');
  }

  // The file in widgets/ a card uses: its own, or embed.html for external pages.
  function fileFor(w) {
    return w.site ? 'embed' : w.id;
  }

  // Full settings for a widget: look (theme, font) plus the widget's own options.
  function settingsFor(w, forPreview) {
    if (w.site) {
      return { resize: state.resize, src: siteUrl(w), viewport: w.viewport || 1024, background: w.background || '#000000' };
    }
    var cfg = { theme: state.theme, font: currentFont(), resize: state.resize };
    if (state.tilt) {
      cfg.tilt = true;
    }
    if (state.theme === 'custom') {
      cfg.bg = state.bg;
      cfg.bg2 = state.bg2;
      cfg.fg = state.fg;
    }
    Object.keys(state.widgets[w.id]).forEach(function (k) {
      if (forPreview || !isPreviewOnly(w, k)) {
        cfg[k] = state.widgets[w.id][k];
      }
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
  function query(w, forPreview) {
    var cfg = settingsFor(w, forPreview);
    var defs = { font: DEFAULT_FONT, tilt: false, resize: 'fade' };
    w.options.forEach(function (o) {
      defs[o.key] = o.def;
    });
    return Object.keys(cfg).filter(function (k) {
      return k === 'theme' || defs[k] === undefined || String(defs[k]) !== String(cfg[k]);
    }).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(cfg[k]);
    }).join('&');
  }

  // External pages are linked directly; our widgets carry their settings in the link.
  function widgetUrl(w) {
    if (w.site) {
      return siteUrl(w);
    }
    return new URL('widgets/' + w.id + '.html?' + query(w), location.href).href;
  }

  var frames = {};

  function refreshPreview(w) {
    var f = frames[w.id];
    if (f) {
      f.src = 'widgets/' + fileFor(w) + '.html?' + query(w, true);
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

  // Files referenced by url(...) in an inlined stylesheet (fonts, images) become data: URIs.
  function inlineCssUrls(css, cssUrl) {
    // Quoted values are matched whole, so a url() inside a data: URI is left alone.
    var URL_RE = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^'")\s]+))\s*\)/g;
    var refs = [];
    function isLocal(ref) {
      return ref && !/^(data:|https?:|#)/.test(ref);
    }
    css.replace(URL_RE, function (all, d, sq, bare) {
      var ref = d || sq || bare;
      if (isLocal(ref) && refs.indexOf(ref) === -1) {
        refs.push(ref);
      }
      return all;
    });
    return Promise.all(refs.map(function (ref) {
      return toDataUri(new URL(ref, cssUrl).href);
    })).then(function (uris) {
      return css.replace(URL_RE, function (all, d, sq, bare) {
        var i = refs.indexOf(d || sq || bare);
        return i === -1 ? all : "url('" + uris[i] + "')";
      });
    });
  }

  // Builds one self-contained file: shared CSS/JS inlined, font embedded, settings written in.
  // Everything happens in the browser, so the site stays fully static.
  function buildFile(w) {
    var pageUrl = new URL('widgets/' + fileFor(w) + '.html', location.href);
    return fetchText(pageUrl.href).then(function (html) {
      var parts = [];
      var re = /<link rel="stylesheet" href="([^"]+)" data-inline>|<script( type="module")? src="([^"]+)" data-inline><\/script>/g;
      var m;
      while ((m = re.exec(html))) {
        parts.push({ tag: m[0], css: !!m[1], module: !!m[2], url: new URL(m[1] || m[3], pageUrl).href });
      }
      return Promise.all(parts.map(function (p) {
        return fetchText(p.url).then(function (text) {
          return p.css ? inlineCssUrls(text, p.url) : text;
        });
      })).then(function (texts) {
        parts.forEach(function (p, i) {
          var code = texts[i].replace(/<\/(script|style)/gi, '<\\/$1');
          var inline = p.css ? '<style>\n' + code + '</style>' : '<script' + (p.module ? ' type="module"' : '') + '>\n' + code + '<\/script>';
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
    if (w.site) {
      return w.id.replace(/^ext-/, '') + '.html';
    }
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

  // "Credits" chip on a card, opening a small bubble that lists who made what.
  // Entries: { name, by, url, byUrl, license, note }.
  function creditsBubble(w) {
    if (!w.credits || !w.credits.length) {
      return null;
    }
    var wrap = el('div', { class: 'credits-wrap' });
    var chip = el('button', { type: 'button', class: 'credit-chip', 'aria-expanded': 'false', text: 'Credits' });
    var pop = el('div', { class: 'credits-pop hidden', role: 'dialog', 'aria-label': 'Credits for ' + w.name });
    w.credits.forEach(function (c) {
      var line = el('div', { class: 'credit-line' });
      line.appendChild(c.url ? el('a', { href: c.url, target: '_blank', rel: 'noopener', text: c.name }) : el('strong', { text: c.name }));
      if (c.by) {
        line.appendChild(document.createTextNode(' by '));
        line.appendChild(c.byUrl ? el('a', { href: c.byUrl, target: '_blank', rel: 'noopener', text: c.by }) : el('span', { text: c.by }));
      }
      var meta = [c.license, c.note].filter(Boolean).join(' · ');
      if (meta) {
        line.appendChild(el('span', { class: 'credit-meta', text: meta }));
      }
      pop.appendChild(line);
    });
    chip.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = pop.classList.contains('hidden');
      document.querySelectorAll('.credits-pop').forEach(function (p) {
        p.classList.add('hidden');
      });
      document.querySelectorAll('.credit-chip').forEach(function (c) {
        c.setAttribute('aria-expanded', 'false');
      });
      pop.classList.toggle('hidden', !open);
      chip.setAttribute('aria-expanded', String(open));
    });
    pop.addEventListener('click', function (e) {
      e.stopPropagation();
    });
    wrap.appendChild(chip);
    wrap.appendChild(pop);
    return wrap;
  }

  document.addEventListener('click', function () {
    document.querySelectorAll('.credits-pop').forEach(function (p) {
      p.classList.add('hidden');
    });
    document.querySelectorAll('.credit-chip').forEach(function (c) {
      c.setAttribute('aria-expanded', 'false');
    });
  });

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
      } else if (o.type === 'colors') {
        // A row of color dots, for example the 16 DS favorite colors.
        control = el('div', { class: 'swatches', role: 'radiogroup', 'aria-label': o.label });
        o.choices.forEach(function (c) {
          var b = el('button', { type: 'button', class: 'swatch-dot', role: 'radio', title: c[1], 'aria-label': c[1], 'aria-checked': String(c[0] === s[o.key]) });
          b.style.background = c[0];
          b.addEventListener('click', function () {
            Array.prototype.forEach.call(control.children, function (x) {
              x.setAttribute('aria-checked', 'false');
            });
            b.setAttribute('aria-checked', 'true');
            s[o.key] = c[0];
            changed();
          });
          control.appendChild(b);
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

    // A card can add its own section below the options (w.panel names a function on window).
    if (w.panel && typeof window[w.panel] === 'function') {
      rows.push(window[w.panel](w, s, changed));
    }

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
      el('div', { class: 'body' }, [el('div', { class: 'title-row' }, [el('h2', { text: w.name }), creditsBubble(w)]), el('p', { class: 'desc', text: w.desc })]
        .concat(rows).concat([el('div', { class: 'actions' }, [dl, cp])]))
    ]);

    changed();
    return card;
  }

  // ---------- Custom colors: in-page color picker ----------
  // A picker built into the page (the system color dialog is clumsy on handhelds and differs per browser).
  // Slot 1 and 2 are the background gradient (top left to bottom right), slot 3 the text and icons.
  var SLOTS = [
    { key: 'bg', num: '1', name: 'Background, top left' },
    { key: 'bg2', num: '2', name: 'Background, bottom right' },
    { key: 'fg', num: '3', name: 'Text and icons' }
  ];
  var IISU_DEFAULTS = { bg: '#68ccff', bg2: '#c56eff', fg: '#ffffff' };
  var PRESETS = ['#68ccff', '#5e84ff', '#8258fa', '#c56eff', '#3700da', '#ffffff', '#f2f2f3', '#9a9aa0',
                 '#414344', '#1e2327', '#000000', '#ff4d4d', '#ffb347', '#f2ee1a', '#7bd88f', '#2ab2d6'];

  function clampHex(v) {
    v = String(v || '').trim().toLowerCase();
    if (v[0] !== '#') {
      v = '#' + v;
    }
    if (/^#[0-9a-f]{3}$/.test(v)) {
      v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    }
    return /^#[0-9a-f]{6}$/.test(v) ? v : null;
  }

  function hexToHsv(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var d = max - min;
    var h = 0;
    if (d) {
      if (max === r) {
        h = ((g - b) / d) % 6;
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }
    return { h: h, s: max ? d / max : 0, v: max };
  }

  function hsvToHex(h, s, v) {
    var c = v * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = v - c;
    var rgb = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return '#' + rgb.map(function (n) {
      return ('0' + Math.round((n + m) * 255).toString(16)).slice(-2);
    }).join('');
  }

  function buildColorPicker(panel) {
    var active = 'bg';
    var hsv = hexToHsv(state[active]);
    var refreshTimer = null;

    var mini = el('div', { class: 'cp-mini', 'aria-hidden': 'true' }, [
      el('span', { class: 'cp-mini-time', text: '12:34' }),
      el('span', { class: 'cp-mini-date', text: 'Saturday' }),
      el('b', { class: 'cp-badge b1', text: '1' }),
      el('b', { class: 'cp-badge b2', text: '2' }),
      el('b', { class: 'cp-badge b3', text: '3' })
    ]);

    var slotButtons = {};
    var slots = el('div', { class: 'cp-slots', role: 'radiogroup', 'aria-label': 'Color to edit' });
    SLOTS.forEach(function (slot) {
      var b = el('button', { type: 'button', class: 'cp-slot', role: 'radio' }, [
        el('span', { class: 'cp-num', text: slot.num }),
        el('span', { class: 'cp-swatch' }),
        el('span', { class: 'cp-slot-text' }, [el('span', { class: 'cp-slot-name', text: slot.name }), el('span', { class: 'cp-slot-hex' })])
      ]);
      b.addEventListener('click', function () {
        select(slot.key);
      });
      slotButtons[slot.key] = b;
      slots.appendChild(b);
    });

    var svKnob = el('div', { class: 'cp-knob' });
    var sv = el('div', { class: 'cp-sv', tabindex: '0', role: 'slider', 'aria-label': 'Saturation and brightness' }, [svKnob]);
    var hueKnob = el('div', { class: 'cp-knob' });
    var hue = el('div', { class: 'cp-hue', tabindex: '0', role: 'slider', 'aria-label': 'Hue' }, [hueKnob]);
    var hex = el('input', { type: 'text', class: 'cp-hex', maxlength: '7', spellcheck: 'false', 'aria-label': 'Hex color' });
    var presets = el('div', { class: 'cp-presets' });
    PRESETS.forEach(function (c) {
      var p = el('button', { type: 'button', class: 'cp-preset', title: c, 'aria-label': c });
      p.style.background = c;
      p.addEventListener('click', function () {
        setColor(c, true);
      });
      presets.appendChild(p);
    });
    var swap = el('button', { type: 'button', class: 'btn small', text: 'Swap 1 and 2' });
    swap.addEventListener('click', function () {
      var t = state.bg;
      state.bg = state.bg2;
      state.bg2 = t;
      hsv = hexToHsv(state[active]);
      update(true);
    });
    var reset = el('button', { type: 'button', class: 'btn small', text: 'iiSU colors' });
    reset.addEventListener('click', function () {
      Object.keys(IISU_DEFAULTS).forEach(function (k) {
        state[k] = IISU_DEFAULTS[k];
      });
      hsv = hexToHsv(state[active]);
      update(true);
    });
    var flat = el('button', { type: 'button', class: 'btn small', text: 'Flat (2 = 1)' });
    flat.addEventListener('click', function () {
      state.bg2 = state.bg;
      hsv = hexToHsv(state[active]);
      update(true);
    });

    var editorTitle = el('div', { class: 'cp-editing' });
    panel.appendChild(el('div', { class: 'cp-legend' }, [mini, slots]));
    panel.appendChild(el('div', { class: 'cp-editor' }, [
      editorTitle,
      sv,
      hue,
      el('div', { class: 'cp-row' }, [hex, presets]),
      el('div', { class: 'cp-row cp-actions' }, [swap, flat, reset])
    ]));

    function select(key) {
      active = key;
      hsv = hexToHsv(state[key]);
      update(false);
    }

    function setColor(c, fromOutside) {
      state[active] = c;
      if (fromOutside) {
        hsv = hexToHsv(c);
      }
      update(true);
    }

    function update(changed) {
      var current = state[active];
      SLOTS.forEach(function (slot) {
        var b = slotButtons[slot.key];
        b.setAttribute('aria-checked', String(slot.key === active));
        b.querySelector('.cp-swatch').style.background = state[slot.key];
        b.querySelector('.cp-slot-hex').textContent = state[slot.key];
      });
      var slot = SLOTS.filter(function (s) { return s.key === active; })[0];
      editorTitle.textContent = 'Editing ' + slot.num + ': ' + slot.name;
      mini.style.background = state.bg === state.bg2 ? state.bg : 'linear-gradient(135deg, ' + state.bg + ', ' + state.bg2 + ')';
      mini.style.color = state.fg;
      mini.setAttribute('data-active', slot.num);
      sv.style.backgroundColor = hsvToHex(hsv.h, 1, 1);
      svKnob.style.left = (hsv.s * 100) + '%';
      svKnob.style.top = ((1 - hsv.v) * 100) + '%';
      svKnob.style.background = current;
      hueKnob.style.left = (hsv.h / 360 * 100) + '%';
      hueKnob.style.background = hsvToHex(hsv.h, 1, 1);
      if (document.activeElement !== hex) {
        hex.value = current;
      }
      if (changed) {
        save();
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(refreshAll, 200);
      }
    }

    function fromHsv() {
      setColor(hsvToHex(hsv.h, hsv.s, hsv.v), false);
    }

    // Drag on the saturation/brightness square and the hue bar (mouse, touch and pen).
    function draggable(area, onPoint) {
      area.addEventListener('pointerdown', function (e) {
        area.setPointerCapture(e.pointerId);
        onPoint(e);
        e.preventDefault();
      });
      area.addEventListener('pointermove', function (e) {
        if (area.hasPointerCapture(e.pointerId)) {
          onPoint(e);
        }
      });
    }

    function rel(area, e) {
      var r = area.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
        y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))
      };
    }

    draggable(sv, function (e) {
      var p = rel(sv, e);
      hsv.s = p.x;
      hsv.v = 1 - p.y;
      fromHsv();
    });
    draggable(hue, function (e) {
      hsv.h = Math.min(359.9, rel(hue, e).x * 360);
      fromHsv();
    });

    sv.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 0.1 : 0.02;
      var moves = { ArrowLeft: ['s', -step], ArrowRight: ['s', step], ArrowUp: ['v', step], ArrowDown: ['v', -step] };
      if (moves[e.key]) {
        hsv[moves[e.key][0]] = Math.max(0, Math.min(1, hsv[moves[e.key][0]] + moves[e.key][1]));
        fromHsv();
        e.preventDefault();
      }
    });
    hue.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 15 : 3;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        hsv.h = (hsv.h + (e.key === 'ArrowRight' ? step : -step) + 360) % 360;
        fromHsv();
        e.preventDefault();
      }
    });

    hex.addEventListener('input', function () {
      var c = clampHex(hex.value);
      hex.classList.toggle('invalid', !c);
      if (c) {
        setColor(c, true);
      }
    });
    hex.addEventListener('blur', function () {
      hex.classList.remove('invalid');
      hex.value = state[active];
    });

    update(false);
  }

  // Global controls (external.html only has Preview).
  var customBox = document.getElementById('custom-panel') || el('div');
  if (document.getElementById('custom-panel')) {
    buildColorPicker(customBox);
  }
  if (document.getElementById('theme-seg')) document.getElementById('theme-seg').replaceWith((function () {
    var seg = segmented(THEMES, state.theme, function (v) {
      state.theme = v;
      customBox.classList.toggle('hidden', v !== 'custom');
      refreshAll();
    });
    seg.id = 'theme-seg';
    return seg;
  })());
  customBox.classList.toggle('hidden', state.theme !== 'custom');

  // Fonts: show each option in its own typeface, and disable the ones whose file is not in /fonts yet.
  var fontCss = Object.keys(FONTS).map(function (id) {
    return fontFaceCss(id, function (file) {
      return 'fonts/' + file.src;
    });
  }).join('\n');
  document.head.appendChild(el('style', { text: fontCss }));

  var fontNote = document.getElementById('font-note') || el('span');
  var fontSeg = segmented(Object.keys(FONTS).map(function (id) {
    return [id, FONTS[id].name];
  }), currentFont(), function (v) {
    state.font = v;
    fontNote.textContent = FONTS[v].note;
    refreshAll();
  });
  fontSeg.id = 'font-seg';
  if (document.getElementById('font-seg')) {
    document.getElementById('font-seg').replaceWith(fontSeg);
  }
  // With a single font there is nothing to pick.
  if (Object.keys(FONTS).length < 2 && document.getElementById('font-field')) {
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

  // Resize animation, shared by every widget. Switching Preview between Tile and Focused shows it.
  var resizeSeg = segmented([['none', 'None'], ['fade', 'Fade']], state.resize, function (v) {
    state.resize = v;
    refreshAll();
  });
  resizeSeg.id = 'resize-seg';
  if (document.getElementById('resize-seg')) {
    document.getElementById('resize-seg').replaceWith(resizeSeg);
  }

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
