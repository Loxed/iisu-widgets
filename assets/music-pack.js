// Music pack builder for the Hourly music widget.
// iiSU's web view has no file picker, so music gets onto the handheld inside a "music pack": an HTML
// file built here from the user's own files. Added to iiSU as a web widget and opened once, it saves
// the tracks in the storage all widgets share, where the Hourly music widget finds them.
// The files never leave this browser: the pack is built locally and downloaded.
(function () {
  var PART_BYTES = 20 * 1024 * 1024;   // a pack file holds at most this much music, bigger sets are split
  var EXT_TYPES = { mp3: 'audio/mpeg', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', flac: 'audio/flac', webm: 'audio/webm' };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') {
        n.textContent = attrs[k];
      } else if (k === 'class') {
        n.className = attrs[k];
      } else {
        n.setAttribute(k, attrs[k]);
      }
    });
    (kids || []).forEach(function (c) {
      n.appendChild(c);
    });
    return n;
  }

  function isAudio(f) {
    return /^audio\//.test(f.type) || !!EXT_TYPES[extOf(f.name)];
  }

  function extOf(name) {
    var m = /\.([a-z0-9]+)$/i.exec(name);
    return m ? m[1].toLowerCase() : '';
  }

  function hourName(h) {
    return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM');
  }

  // Hour (0 to 23) from a file name: "5 PM", "05pm", "5 a.m.", "17h", "17:00", "hour 17", or a name
  // that is just a number. Track numbers ("01 12 AM") are skipped because AM/PM wins.
  function hourFromName(name) {
    var base = name.replace(/\.[^.]+$/, '');
    var m = /(\d{1,2})\s*(?:[:h]\s*00)?\s*([ap])\.?\s*m\b\.?/i.exec(base);
    if (m) {
      var h = +m[1] % 12;
      return m[2].toLowerCase() === 'p' ? h + 12 : h;
    }
    m = /(?:^|\D)(\d{1,2})\s*(?:h|:00|00h)(?:\D|$)/i.exec(base) || /hour\D*(\d{1,2})/i.exec(base) || /^\s*(\d{1,2})\s*$/.exec(base);
    if (m && +m[1] < 24) {
      return +m[1];
    }
    return null;
  }

  function readBase64(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        resolve(String(r.result).replace(/^data:[^,]*,/, ''));
      };
      r.onerror = function () {
        reject(r.error);
      };
      r.readAsDataURL(file);
    });
  }

  function saveFile(name, text) {
    var url = URL.createObjectURL(new Blob([text], { type: 'text/html' }));
    var a = el('a', { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 30000);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ---------- The pack page ----------
  // It stores each track in IndexedDB (same layout as widgets/shared/music-db.js), then says so.
  var INSTALLER = function () {
    var box = document.getElementById('msg');
    var bar = document.getElementById('fill');
    var nodes = Array.prototype.slice.call(document.querySelectorAll('script.track'));
    var game = document.body.getAttribute('data-game');
    function say(t) {
      box.textContent = t;
    }
    var req = indexedDB.open('iisu-widgets-music', 1);
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains('tracks')) {
        db.createObjectStore('tracks');
      }
      if (!db.objectStoreNames.contains('games')) {
        db.createObjectStore('games');
      }
    };
    req.onerror = function () {
      say('Could not open storage: ' + req.error);
    };
    req.onsuccess = function () {
      var db = req.result;
      var i = 0;
      function next() {
        if (i >= nodes.length) {
          return finish();
        }
        var n = nodes[i];
        var slot = n.getAttribute('data-slot');
        fetch('data:' + n.getAttribute('data-type') + ';base64,' + n.textContent.trim()).then(function (r) {
          return r.blob();
        }).then(function (blob) {
          n.textContent = '';
          var tx = db.transaction('tracks', 'readwrite');
          tx.objectStore('tracks').put({ game: game, slot: slot, name: n.getAttribute('data-name'), blob: blob }, game + '/' + slot);
          tx.oncomplete = function () {
            i++;
            bar.style.width = Math.round(i / nodes.length * 100) + '%';
            say('Installing ' + game + ': ' + i + ' of ' + nodes.length + ' tracks');
            next();
          };
          tx.onerror = function () {
            say('Could not save a track: ' + tx.error);
          };
        }).catch(function (e) {
          say('Could not read a track: ' + e);
        });
      }
      function finish() {
        var tx = db.transaction(['tracks', 'games'], 'readwrite');
        var keys = tx.objectStore('tracks').getAllKeys();
        keys.onsuccess = function () {
          var count = keys.result.filter(function (k) {
            return String(k).indexOf(game + '/') === 0;
          }).length;
          tx.objectStore('games').put({ game: game, count: count, updated: Date.now() }, game);
          tx.oncomplete = function () {
            say(game + ' is installed: ' + count + ' of 24 hours. The Hourly music widget can play it now. You can remove this pack from iiSU.');
          };
        };
      }
      next();
    };
  };

  function packHtml(game, part, parts, tracks) {
    var title = 'Music pack: ' + game + (parts > 1 ? ' (' + part + ' of ' + parts + ')' : '');
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + escapeHtml(title) + '</title>\n' +
      '<style>html,body{margin:0;height:100%;background:#15171c;color:#f2f2f2;font:14px/1.4 system-ui,sans-serif}' +
      '#root{box-sizing:border-box;height:100%;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:14px}' +
      'h1{margin:0;font-size:16px}#bar{height:6px;border-radius:3px;background:#2a2e37;overflow:hidden}' +
      '#fill{width:0;height:100%;background:#7bd88f;transition:width .2s}</style>\n</head>\n' +
      '<body data-game="' + escapeHtml(game) + '">\n<div id="root"><h1>' + escapeHtml(title) + '</h1>' +
      '<div id="bar"><div id="fill"></div></div><div id="msg">Starting…</div></div>\n' +
      tracks.map(function (t) {
        return '<script class="track" type="text/plain" data-slot="' + t.slot + '" data-type="' + t.type + '" data-name="' + escapeHtml(t.name) + '">' + t.b64 + '</script>';
      }).join('\n') +
      '\n<script>(' + INSTALLER.toString() + ')();</script>\n</body>\n</html>\n';
  }

  // ---------- The panel on the Hourly music card ----------
  window.MusicPackPanel = function () {
    var slots = {};    // "0".."23" -> File
    var nameInput = el('input', { type: 'text', class: 'mp-name', placeholder: 'Game name, for example New Horizons', 'aria-label': 'Game name' });
    var filesInput = el('input', { type: 'file', accept: 'audio/*', multiple: '', class: 'hidden' });
    var dirInput = el('input', { type: 'file', webkitdirectory: '', multiple: '', class: 'hidden' });
    var oneInput = el('input', { type: 'file', accept: 'audio/*', class: 'hidden' });
    var pickFiles = el('button', { type: 'button', class: 'btn', text: 'Choose files' });
    var pickDir = el('button', { type: 'button', class: 'btn', text: 'Choose folder' });
    var grid = el('div', { class: 'mp-grid' });
    var summary = el('p', { class: 'mp-summary' });
    var make = el('button', { type: 'button', class: 'btn primary', text: 'Download music pack' });
    var oneSlot = null;

    function refresh() {
      grid.innerHTML = '';
      var bytes = 0;
      var count = 0;
      for (var h = 0; h < 24; h++) {
        (function (h) {
          var f = slots[h];
          if (f) {
            bytes += f.size;
            count++;
          }
          var cell = el('button', { type: 'button', class: 'mp-cell' + (f ? ' on' : ''), title: f ? f.name : 'No track: tap to choose one' }, [
            el('span', { class: 'mp-h', text: hourName(h) }),
            el('span', { class: 'mp-f', text: f ? f.name.replace(/\.[^.]+$/, '') : '·' })
          ]);
          cell.addEventListener('click', function () {
            oneSlot = h;
            oneInput.click();
          });
          grid.appendChild(cell);
        })(h);
      }
      var parts = Math.max(1, Math.ceil(bytes / PART_BYTES));
      summary.textContent = count ? count + ' of 24 hours, ' + (bytes / 1048576).toFixed(1) + ' MB' + (parts > 1 ? ', split into ' + parts + ' pack files' : '') + '.' +
        (bytes > 40 * 1048576 ? ' That is a lot for the handheld: ogg or opus files around 64 kbps are about 5 times smaller.' : '') : 'No tracks yet.';
      make.disabled = !count;
    }

    function addFiles(list) {
      var files = Array.prototype.slice.call(list || []).filter(isAudio).sort(function (a, b) {
        return (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name, undefined, { numeric: true });
      });
      if (!files.length) {
        return;
      }
      var unmatched = [];
      files.forEach(function (f) {
        var h = hourFromName(f.name);
        if (h === null) {
          unmatched.push(f);
        } else {
          slots[h] = f;
        }
      });
      // 24 files and no hour in their names: take them in order, midnight first.
      if (unmatched.length === 24 && files.length === 24) {
        unmatched.forEach(function (f, i) {
          slots[i] = f;
        });
      }
      if (!nameInput.value && files[0].webkitRelativePath) {
        nameInput.value = files[0].webkitRelativePath.split('/')[0];
      }
      refresh();
    }

    pickFiles.addEventListener('click', function () {
      filesInput.click();
    });
    pickDir.addEventListener('click', function () {
      dirInput.click();
    });
    filesInput.addEventListener('change', function () {
      addFiles(filesInput.files);
      filesInput.value = '';
    });
    dirInput.addEventListener('change', function () {
      addFiles(dirInput.files);
      dirInput.value = '';
    });
    oneInput.addEventListener('change', function () {
      if (oneInput.files[0] && oneSlot !== null) {
        slots[oneSlot] = oneInput.files[0];
        refresh();
      }
      oneInput.value = '';
    });

    make.addEventListener('click', function () {
      var game = nameInput.value.trim() || 'My music';
      var hours = Object.keys(slots).map(Number).sort(function (a, b) { return a - b; });
      // Split into parts of at most PART_BYTES.
      var parts = [[]];
      var size = 0;
      hours.forEach(function (h) {
        if (size && size + slots[h].size > PART_BYTES) {
          parts.push([]);
          size = 0;
        }
        parts[parts.length - 1].push(h);
        size += slots[h].size;
      });
      make.disabled = true;
      make.textContent = 'Building…';
      var safe = game.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'music';
      var chain = Promise.resolve();
      parts.forEach(function (list, i) {
        chain = chain.then(function () {
          return Promise.all(list.map(function (h) {
            var f = slots[h];
            return readBase64(f).then(function (b64) {
              return { slot: h, name: f.name, type: f.type || EXT_TYPES[extOf(f.name)] || 'audio/mpeg', b64: b64 };
            });
          }));
        }).then(function (tracks) {
          saveFile('music-pack-' + safe + (parts.length > 1 ? '-' + (i + 1) + 'of' + parts.length : '') + '.html', packHtml(game, i + 1, parts.length, tracks));
        });
      });
      chain.then(function () {
        make.textContent = 'Download music pack';
        make.disabled = false;
      }, function (e) {
        make.textContent = 'Failed: ' + e;
        make.disabled = false;
      });
    });

    refresh();
    return el('div', { class: 'music-pack' }, [
      el('h3', { text: 'Music pack' }),
      el('p', { class: 'mp-note', text: 'Choose a game\'s hourly tracks from your own files. Names like "5 PM" or "17h" are matched to hours; tap an hour to set it by hand. Add the downloaded pack to iiSU as a web widget and open it once: it installs the music for this widget, then you can remove it. Your files stay on this device.' }),
      nameInput,
      el('div', { class: 'actions' }, [pickFiles, pickDir]),
      grid,
      summary,
      make,
      filesInput, dirInput, oneInput
    ]);
  };

  window.MusicPack = { hourFromName: hourFromName };
})();
