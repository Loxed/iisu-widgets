# iiSU Widgets

Web widgets and mini games for the iiSU launcher, with a configurator page to set them up. English only for now.

| Group | Widgets |
|---|---|
| Essentials | Clock (classic, digital, split dial, LCD, Roman, wavy), Calendar (numbers or dots), Weather (classic, bold, card) |
| Device | Battery (level, charging, time left from measured drain, history chart), Devices (battery pills for the handheld and connected controllers), Hourly chime |
| Decor | Scene (layered landscape that follows the time of day and the handheld's tilt) |
| Games | Snake, 2048 |

Themes: light, dark, aurora (gradient with film grain), transparent and custom colors.

Every widget can use the **tilt effect** (content moves slightly with the motion sensor), set once for all widgets.

Open the configurator on GitHub Pages, pick a theme, set up each widget and press **Download**. The downloaded file contains everything: settings, font, icons and code. It needs no editing and works offline.

## Fully static

There is no server and no build step. GitHub Pages serves the files as they are:

- The widgets in `widgets/` run as they are (hosted links, live previews).
- On **Download**, the configurator does everything in the browser: it fetches the widget, inlines the `data-inline` files, embeds the chosen font, writes the settings into `<script id="widget-config">`, and saves the result as one .html file.

To publish: push to GitHub, then go to Settings > Pages and deploy from the `main` branch, root folder.

## Layout

| Path | What it is |
|---|---|
| `index.html`, `assets/` | The configurator |
| `widgets/*.html` | One file per widget |
| `widgets/shared/base.css` | Themes and shared styles (sizes in `cqmin`, so a widget scales with its tile) |
| `widgets/shared/runtime.js` | Settings, theme, font, storage, network helpers |
| `widgets/shared/fonts.js` | Font list, used by the widgets and the configurator |
| `widgets/shared/icons.js` | Lucide icons (ISC license) |
| `widgets/shared/input.js` | Controller, touch and keyboard input for games (controller only in the focused view) |
| `widgets/shared/sound.js` | Synthesized chimes and game sounds (Web Audio, no sound files) |
| `fonts/` | Font files |
| `tools/widget-probe.html` | Test widget that reports what the iiSU web view allows |

## Settings

Settings are read in this order, later ones win:

1. the defaults in `runtime.js` (`theme`, `bg`, `fg`, `font`, `tilt`) and in the widget
2. the JSON in `<script id="widget-config">` (written on download)
3. the page address: `widgets/weather.html?theme=dark&tempUnit=fahrenheit`

## Fonts

Widgets use Cal Sans, iiSU's default font (SIL Open Font License, see `fonts/Cal-Sans-OFL.txt`). It is embedded in every download, so it works offline.

To add another font: put its file in `fonts/` (only if its license allows redistribution) and add an entry to `widgets/shared/fonts.js`. The configurator shows a font picker as soon as there are two fonts or more.

## Adding a widget

1. Copy `widgets/clock.html` and keep the parts every widget needs: the `shared/base.css` link, the `widget-config` block, and the `shared/fonts.js`, `icons.js` and `runtime.js` scripts, all with `data-inline`. Add `shared/input.js` and `shared/sound.js` if the widget needs them.
2. Call `W.config({ ...your defaults })` at the start of the widget script.
3. Add an entry to the `WIDGETS` list in `assets/app.js` with its options. Each option's `def` must match the widget's default.

## What iiSU allows (tested on a Retroid Pocket)

- Android WebView 109, pages served from `https://localhost`. Avoid CSS and JS features newer than Chrome 109.
- Storage (localStorage, IndexedDB, Cache API) survives widget reloads, iiSU restarts and console restarts.
- Storage is **shared by all widgets**, so every key is prefixed with `iisu-widgets:`. Widgets load left to right in the iiSU menu.
- Touch reaches the widget whether it is focused or not. The controller is readable through the Gamepad API. Keyboard events do not arrive.
- Geolocation is denied: automatic weather uses IP location (GeoJS).
- Sound, vibration, motion sensor and battery level are available. Battery time remaining is not.
- Bluetooth devices: a web view cannot list paired Bluetooth devices or read their battery (no Web Bluetooth in Android WebView). The Devices widget shows the handheld's battery and the controllers the Gamepad API reports, without their battery level.
- The widget is 198×198 as a tile and fills most of the screen when focused. Games use this to know when they can take the controller: on the tile, the same buttons move around the iiSU menu.

## Not tested on the handheld yet

- Whether iiSU also reacts to the D-pad and A while a game widget is focused (both would get the presses).
- Whether sound plays and timers run while a game is open (the chime is silent then by default anyway).
- The motion sensor's axes on the Retroid, so the tilt direction may need flipping.
