// Small sound synthesizer (Web Audio). No sound files needed, so it works offline and inside downloads.
var Sound = (function () {
  var ctx = null;

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        return null;
      }
      ctx = new AC();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  // One note: frequency (Hz), start delay and duration (s), waveform, peak volume (0 to 1).
  function tone(freq, at, dur, type, vol) {
    var c = audio();
    if (!c) {
      return;
    }
    var t = c.currentTime + at;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // A struck bell: a few inharmonic partials that fade out.
  function bell(freq, at, vol) {
    [[1, 1, 2.4], [2, 0.5, 1.6], [2.76, 0.35, 1.2], [5.4, 0.15, 0.6]].forEach(function (p) {
      tone(freq * p[0], at, p[2], 'sine', vol * p[1]);
    });
  }

  var CHIMES = {
    bell: { gap: 1.1, play: function (at, v) { bell(659.25, at, v); bell(523.25, at + 0.45, v); } },
    chiptune: {
      gap: 0.6,
      play: function (at, v) {
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
          tone(f, at + i * 0.09, 0.12, 'square', v * 0.35);
        });
      }
    },
    soft: { gap: 1.2, play: function (at, v) { tone(392, at, 1.2, 'sine', v * 0.8); tone(587.33, at + 0.35, 1.4, 'sine', v * 0.6); } }
  };

  // ---------- Lowering iiSU's music ----------
  // A silent track playing in an audio element asks Android for audio focus, and iiSU lowers its
  // background music while it plays (tested on a Retroid Pocket). Web Audio alone does not do this.
  var duckEl = null;
  var duckOn = false;
  var duckWaiting = false;

  // One second of silence as a WAV blob address.
  function silentWav() {
    var n = 8000;
    var buf = new ArrayBuffer(44 + n);
    var v = new DataView(buf);
    var head = 'RIFF....WAVEfmt ';
    for (var i = 0; i < head.length; i++) {
      v.setUint8(i, head.charCodeAt(i));
    }
    v.setUint32(4, 36 + n, true);
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);      // PCM
    v.setUint16(22, 1, true);      // mono
    v.setUint32(24, 8000, true);   // sample rate
    v.setUint32(28, 8000, true);   // bytes per second
    v.setUint16(32, 1, true);
    v.setUint16(34, 8, true);      // 8-bit
    'data'.split('').forEach(function (ch, j) {
      v.setUint8(36 + j, ch.charCodeAt(0));
    });
    v.setUint32(40, n, true);
    for (var k = 0; k < n; k++) {
      v.setUint8(44 + k, 128);     // 8-bit silence
    }
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  }

  function duckPlay() {
    var p = duckEl.play();
    if (p && p.catch) {
      p.catch(function () {
        // Blocked until the player touches the screen: try again on the next tap.
        if (!duckWaiting) {
          duckWaiting = true;
          document.addEventListener('pointerdown', function retry() {
            document.removeEventListener('pointerdown', retry, true);
            duckWaiting = false;
            if (duckOn) {
              duckPlay();
            }
          }, true);
        }
      });
    }
  }

  // on: true while a game is being played, false otherwise. Calling it again with the same value does nothing.
  function duck(on) {
    on = !!on;
    if (on === duckOn) {
      return;
    }
    duckOn = on;
    try {
      if (on) {
        if (!duckEl) {
          duckEl = new Audio();
          duckEl.loop = true;
          duckEl.src = silentWav();
        }
        duckPlay();
      } else if (duckEl) {
        duckEl.pause();
      }
    } catch (e) {}
  }

  return {
    // Lowers iiSU's background music while on is true (see above).
    duck: duck,
    // style: bell, chiptune or soft. volume: 0 to 1. times: repeat (for example the hour count).
    chime: function (style, volume, times) {
      var c = CHIMES[style] || CHIMES.bell;
      for (var i = 0; i < (times || 1); i++) {
        c.play(i * c.gap, volume);
      }
    },
    // Short game sound effects.
    blip: function (freq, dur, volume, type) {
      tone(freq, 0, dur || 0.08, type || 'square', (volume || 0.3) * 0.4);
    },
    styles: Object.keys(CHIMES)
  };
})();
