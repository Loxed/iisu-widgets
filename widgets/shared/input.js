// Controls for interactive widgets: controller (Gamepad API), touch swipes and taps, keyboard.
// Actions: { type: 'dir', dir: 'up' | 'down' | 'left' | 'right' }, { type: 'a' }, { type: 'start' }.
// The controller only counts in the focused (large) view: on the small tile the same buttons
// move around the iiSU menu, and the widget must not react to them.
var Input = (function () {
  var handlers = [];
  var prev = {};
  var polling = false;

  // Button numbers in the standard gamepad layout.
  var BUTTONS = { a: 0, start: 9, up: 12, down: 13, left: 14, right: 15 };

  function emit(action) {
    handlers.forEach(function (h) {
      try {
        h(action);
      } catch (e) {
        W.log('input handler failed', String(e));
      }
    });
  }

  // iiSU shows the tile at 198x198 and the focused view at about 776x412.
  function isFocusedView() {
    return Math.min(window.innerWidth, window.innerHeight) > 260 || window.innerWidth / window.innerHeight > 1.3;
  }

  function pressed(pad, i) {
    var b = pad.buttons[i];
    return !!b && (b.pressed || b.value > 0.5);
  }

  function readPad() {
    var pads = [];
    try {
      pads = navigator.getGamepads ? navigator.getGamepads() : [];
    } catch (e) {
      return null;
    }
    for (var i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected !== false) {
        return pads[i];
      }
    }
    return null;
  }

  function poll() {
    var pad = readPad();
    if (pad && isFocusedView() && document.visibilityState === 'visible') {
      var ax = pad.axes[0] || 0;
      var ay = pad.axes[1] || 0;
      var now = {
        up: pressed(pad, BUTTONS.up) || ay < -0.6,
        down: pressed(pad, BUTTONS.down) || ay > 0.6,
        left: pressed(pad, BUTTONS.left) || ax < -0.6,
        right: pressed(pad, BUTTONS.right) || ax > 0.6,
        a: pressed(pad, BUTTONS.a),
        start: pressed(pad, BUTTONS.start)
      };
      Object.keys(now).forEach(function (k) {
        if (now[k] && !prev[k]) {
          emit(k === 'a' || k === 'start' ? { type: k } : { type: 'dir', dir: k });
        }
      });
      prev = now;
    } else {
      prev = {};
    }
    requestAnimationFrame(poll);
  }

  var KEYS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right'
  };

  document.addEventListener('keydown', function (e) {
    if (KEYS[e.key]) {
      emit({ type: 'dir', dir: KEYS[e.key] });
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      emit({ type: 'a' });
      e.preventDefault();
    } else if (e.key === 'p' || e.key === 'Escape') {
      emit({ type: 'start' });
    }
  });

  // A swipe gives a direction, a short tap counts as A (with the tap position in x and y).
  var touchStart = null;
  document.addEventListener('pointerdown', function (e) {
    touchStart = { x: e.clientX, y: e.clientY };
  });
  document.addEventListener('pointerup', function (e) {
    if (!touchStart) {
      return;
    }
    var dx = e.clientX - touchStart.x;
    var dy = e.clientY - touchStart.y;
    touchStart = null;
    var min = Math.max(24, Math.min(window.innerWidth, window.innerHeight) * 0.08);
    if (Math.abs(dx) < min && Math.abs(dy) < min) {
      emit({ type: 'a', x: e.clientX, y: e.clientY });
    } else if (Math.abs(dx) > Math.abs(dy)) {
      emit({ type: 'dir', dir: dx > 0 ? 'right' : 'left' });
    } else {
      emit({ type: 'dir', dir: dy > 0 ? 'down' : 'up' });
    }
  });
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, { passive: false });

  return {
    on: function (handler) {
      handlers.push(handler);
      if (!polling) {
        polling = true;
        requestAnimationFrame(poll);
      }
    },
    isFocusedView: isFocusedView
  };
})();
