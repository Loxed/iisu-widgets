// Music storage shared by the Hourly music widget and the music packs that install into it.
// iiSU keeps IndexedDB across restarts and shares it between all widgets, so a pack opened once
// leaves its tracks here for the player.
//   games:  game name -> { game, count, updated }
//   tracks: "game/slot" -> { game, slot, name, blob }   slot: "0" to "23" (hour of the day)
var MusicDB = (function () {
  var NAME = 'iisu-widgets-music';
  var opening = null;

  function open() {
    if (!opening) {
      opening = new Promise(function (resolve, reject) {
        var req = indexedDB.open(NAME, 1);
        req.onupgradeneeded = function () {
          var db = req.result;
          if (!db.objectStoreNames.contains('tracks')) {
            db.createObjectStore('tracks');
          }
          if (!db.objectStoreNames.contains('games')) {
            db.createObjectStore('games');
          }
        };
        req.onsuccess = function () {
          resolve(req.result);
        };
        req.onerror = function () {
          opening = null;
          reject(req.error);
        };
      });
    }
    return opening;
  }

  // Runs fn(store) in a transaction and resolves with the result of the request fn returns.
  function run(storeName, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(storeName, mode);
        var req = fn(tx.objectStore(storeName));
        tx.oncomplete = function () {
          resolve(req ? req.result : undefined);
        };
        tx.onerror = function () {
          reject(tx.error);
        };
      });
    });
  }

  return {
    // [{ game, count, updated }], sorted by name.
    games: function () {
      return run('games', 'readonly', function (s) {
        return s.getAll();
      }).then(function (list) {
        return (list || []).sort(function (a, b) {
          return a.game.localeCompare(b.game);
        });
      });
    },
    // The track for one hour, or undefined.
    track: function (game, slot) {
      return run('tracks', 'readonly', function (s) {
        return s.get(game + '/' + slot);
      });
    },
    // Slots ("0" to "23") a game has.
    slots: function (game) {
      return run('tracks', 'readonly', function (s) {
        return s.getAllKeys();
      }).then(function (keys) {
        return (keys || []).filter(function (k) {
          return String(k).indexOf(game + '/') === 0;
        }).map(function (k) {
          return String(k).slice(game.length + 1);
        });
      });
    }
  };
})();
