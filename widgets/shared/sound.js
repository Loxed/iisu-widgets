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

  return {
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
