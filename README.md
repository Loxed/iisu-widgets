# iiSU Widgets

Web widgets and mini games for the iiSU launcher, with a configurator page to set them up. English only for now.

| Group | Widgets |
|---|---|
| Essentials | Clock (classic, digital, split dial, LCD, Roman, wavy), Calendar (numbers or dots), Weather (classic, bold, card), DS clock and calendar |
| Device | Battery (level, charging, time left from measured drain, history chart), Devices (battery pills for the handheld and connected controllers), Hourly chime, Hourly music |
| Decor | Scene (layered landscape that follows the time of day and the handheld's tilt), Page music (a picture or GIF with its own music loop) |
| Games | Snake, 2048, Fire, Chef, Manhole (Game & Watch rules) |

Themes: light, dark, aurora (the iiSU logo gradient, sky blue `#68ccff` to violet `#c56eff`, with film grain), transparent and custom (a top left and a bottom right color, iiSU blue and violet by default, plus a text color).

The Scene widget moves its layers with the handheld's motion sensor. The global tilt effect is disabled in the configurator; the code stays in `runtime.js` and can still be tried with `?tilt=true`.

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
| `external.html`, `assets/external.js` | Catalog of external widgets (pages that already live online) |
| `widgets/*.html` | One file per widget |
| `widgets/shared/base.css` | Themes and shared styles (sizes in `cqmin`, so a widget scales with its tile) |
| `widgets/shared/runtime.js` | Settings, theme, font, storage, network helpers |
| `widgets/shared/fonts.js` | Font list, used by the widgets and the configurator |
| `widgets/shared/icons.js` | Lucide icons (ISC license) |
| `widgets/shared/input.js` | Controller, touch and keyboard input for games (controller only in the focused view) |
| `widgets/shared/sound.js` | Synthesized chimes and game sounds (Web Audio, no sound files) |
| `widgets/shared/gw.js` | Game & Watch engine: LCD segments, score digits, misses, clock mode, skins |
| `fonts/` | Font files |
| `tools/widget-probe.html` | Test widget that reports what the iiSU web view allows |

## Settings

Settings are read in this order, later ones win:

1. the defaults in `runtime.js` (`theme`, `bg`, `fg`, `font`, `tilt`, `resize`) and in the widget
2. the JSON in `<script id="widget-config">` (written on download)
3. the page address: `widgets/weather.html?theme=dark&tempUnit=fahrenheit`

## Resize animation

iiSU resizes a widget when it is focused (tile to full view) and back. `runtime.js` watches the size with a `ResizeObserver` and applies the `resize` setting:

- `none`: the layout switches straight away.
- `fade` (default): the content (every child of `#root`) fades out in 100 ms, the widget resizes showing only its background, and the content fades back in over 260 ms once the size has not changed for 160 ms. The timings are in `RESIZE` in `runtime.js`.

Widgets can also react to a resize with `W.onResize(function (size) { ... })`.

## DS clock and calendar

`widgets/ds.html` wraps the `<ds-clock>` and `<ds-calendar>` web components from [ds.css](https://github.com/spiritov/ds.css) by spiritov (MIT, see `widgets/vendor/ds/LICENSE`). The components have a fixed pixel size (clock 198×198, calendar 234×226); the widget scales them to fit, in half steps when "crisp pixels" is on. Their fonts are Latin subsets in woff2: `fonts/ds-clock.woff2` ("Nintendo DS - Clock Numbers Font" by zigaudrey, FontStruct Non-Commercial License) and `fonts/ds-system.woff2` (the Nitro DS font).

On download, stylesheets marked `data-inline` get their `url(...)` files (fonts, images) embedded, and `type="module"` scripts stay modules.

## External widgets and credits

`external.html` catalogs pages other people made that already live online (for example the [DVD screensaver](https://github.com/bemxio/dvd-screensaver) by bemxio). They are listed in `assets/external.js`: address, options passed in the page's own query string, and credits. Their cards use `widgets/embed.html`, which lays the page out at a fixed width (`viewport`, 1024 px by default) and scales it down to the widget, so a page made for a full screen fits a 198 px tile. A download is a small file that loads the page, so it needs an internet connection.

Any card can show a **Credits** bubble: add `credits: [{ name, by, url, byUrl, license, note }]` to its entry in `assets/app.js` or `assets/external.js`.

## Game & Watch games

`fire.html`, `chef.html` and `manhole.html` follow the rules of the 1980 and 1981 Game & Watch games. The graphics are new drawings, the originals are not included.

- The screen is a fixed set of segments that are either on or off. Unlit segments stay faintly visible, like on the LCD. Everything moves in steps, one step per tick, and the tick gets shorter as the score grows.
- The tile shows the clock and the game playing itself, like the originals when nobody plays. Focus the widget and press A (or tap) to play.
- Fire: three net positions, jumpers bounce three times into the ambulance, 1 point per bounce, misses cleared at 200 and 500. Game B: jumpers from two floors.
- Chef: 1 point per flip, the cat's fork holds the leftmost food for a moment, the mouse eats what falls, misses cleared at 200 and 500. Game A: 3 foods, Game B: 4.
- Manhole: four holes, up, down, left and right (or a tap on the hole) move the lid, 1 point per crossing. At 300 points: double points until the next miss if there are no misses, otherwise the misses are cleared. Game B: more walkers.
- New jumpers, flights and walkers are only let in when the player can reach every landing in time.

**Skins.** Each game has a `skin` setting: the address of a JSON file with a sprite sheet.

```json
{
  "image": "fire-sheet.png",
  "background": "fire-screen.png",
  "ghosts": false,
  "segments": { "men-0": [0, 0, 68, 46], "net-0": [68, 0, 22, 22] }
}
```

`segments` maps a segment id to its rectangle in `image` (x, y, width, height). It is drawn in the segment's box on the 320×200 screen; segments left out keep the built-in drawing. `background` replaces the LCD panel and `ghosts: false` hides the unlit segments. Open a game with `?outline=true` to see every segment's box and id. Image addresses are relative to the JSON file; use data URIs for a skin that works offline.

A skin can also bring its own screen layout, for sprites drawn for a different screen:

- `"size": [160, 144]`: the skin's screen size (usually the background's size).
- A segment as `[sx, sy, sw, sh, dx, dy]`: cut from the sheet and drawn unscaled at (dx, dy) on the skin's screen. With a `size`, built-in segments the skin leaves out are not drawn.
- `"hud": { "digits": [x, y], "scale": 0.5, "misses": [x, y], "missStep": 12, "label": [x, y], "missLabel": [x, y] }`: where the score, misses and GAME A/B label go.
- `"@miss"`, `"@miss-label"`, `"@game-a"`, `"@game-b"` in `segments`: sprites for the miss icon, the MISS word and the game label.
- `"pixelated": true` keeps pixel art sharp when it is scaled up.

Fire uses the Game & Watch Gallery sprites by default (`skin: 'gallery'`, credits: Nintendo, ripped by Mario Gamer, shaded and recolored by Grynz). They live in `skins/fire-gallery/`: `sheet.png`, `background.png` and `skin.json` are the sources, and `skin.js` is the same skin with the images embedded, loaded with `data-inline` so downloads work offline. After changing the sources, rebuild `skin.js` (it sets `GW.skins.gallery`). `skin: 'none'` goes back to the redrawn LCD, and any other value is read as the address of a skin JSON file.

Chef uses the Game & Watch Gallery sprites the same way (`skins/chef-gallery/`, ripped by Classic Jack). Its Game A uses the three left columns of the four. Manhole too (`skins/manhole-gallery/`, ripped by Classic Jack): its walkways have ten steps with the holes on the 4th and 7th, and a fall plays as eight frames (four tumbling, four splashing). A skin's `ghostSkip` lists segment ids that get no ghost, used there for the overlapping fall frames.

## Hourly music

`widgets/music.html` plays a game's track for the current hour (Animal Crossing style), loops it and crossfades to the next one on the hour. It plays while iiSU shows the widget, lowers iiSU's own music (see `Sound.duck`), and pauses its audio when the page is hidden.

iiSU's web view has no file picker and cannot read files next to a widget (iiSU copies each widget to `https://localhost/web-widgets/<id>`), so the music arrives in a **music pack**:

1. On the Hourly music card, choose a game's tracks from your own files. Names like `5 PM`, `05pm` or `17h` are matched to hours, and any hour can be set by hand.
2. **Download music pack**: an HTML file with the tracks inside (split into several files above 20 MB). It is built in the browser; the music is not uploaded anywhere.
3. Add the pack to iiSU as a web widget and open it once. It stores the tracks in IndexedDB (`iisu-widgets-music`, shared by all widgets, see `widgets/shared/music-db.js`) and can then be removed.

Tracks are looped with an 8 second overlap, which hides the fade-out most rips end with. Smaller files load faster: `ffmpeg -i in.mp3 -c:a libopus -b:a 48k out.ogg` makes a 3 minute track about 1.2 MB. Music files and packs are listed in `.gitignore`, so they stay out of the repo.

## Page music

iiSU only runs a widget while its page is on screen, and stops its sound when the page goes away. `widgets/pagemusic.html` uses that: a picture or GIF with one music loop, so each iiSU page can have its own music. On the card, choose the music and the picture; the download carries both inside (a 3 minute track is 1 to 5 MB), so there is nothing else to install. It fades in when the page shows up, continues where it stopped, loops with a crossfade (or exactly, for tracks made to loop), and lowers iiSU's own music.

Since iiSU may reload the widget each time its page comes back, it is built to start fast: the music plays through an `<audio>` element (it starts within a fraction of a second, where Web Audio would first decode the whole track), the downloaded files sit in `#media-*` blocks at the end of the file and are copied to IndexedDB (`iisu-widgets-media`) on the first run, so later runs play from there before the page has finished loading, and the position is saved every second. The audio element also takes Android's audio focus, which is what lowers iiSU's music.

Cards can use `type: 'file'` options: the chosen file stays in memory on the page (never in saved settings), the preview gets a `blob:` address and the download gets the file as a `data:` URI in a `<script type="text/plain" id="media-<key>">` block at the end of the file, with `"#media-<key>"` in the settings. Previews get `preview: true`, so music waits for a tap there.

The Hourly music widget has a test mode (`debug`): it shows the hour, the track, the position in the loop and the pass number, up and down step through the hours, and `cycle` runs a whole hour in 20 or 60 seconds.

## Mii 3D

`widgets/mii3d.html` shows the Mii of a Nintendo Network ID (or Pretendo Network ID) in 3D with [three.js](https://threejs.org/) (r147, MIT, see `widgets/vendor/three/LICENSE`). The head is the real 3D head from [ariankordi's Mii renderer](https://mii-unsecure.ariankordi.net/), one model per expression, kept in the Cache API once seen. The body is the Mii body model in `models/Mii (Default)/` (ripped by Centrixe at The Models Resource), on a small skeleton (waist, neck, arms with elbows, legs with knees and ankles) that plays baked animations: walk, run, wave, jump, two dances, nod, head shake, thumbs up, chat, sit on a stool, nap, roll, eat. Each movement changes the face along the way (surprised on takeoff, a wink at the end of a wave, chewing between bites). The same folder gives the default Mii head, shown without an ID or until the real head has loaded.

It is also a small pet. Food, fun and energy (0 to 100) go down over real time and are kept in the handheld's storage per Mii (`mii3d-pet:<network>:<id>`), with the time of the last update, so the time the widget spends closed counts too. Asleep, energy comes back instead. The mood (happy, fine, hungry, sleepy, bored, grumpy, asleep) sets the face and what the Mii does on its own. Focused view: Feed (three bites of an apple, a rice ball or a donut), Play (a random dance, jump, run or roll), Chat, Sleep (lights out until it wakes up); tapping the Mii pets it. It refuses food when full and play when exhausted, goes to bed by itself when exhausted or between 22:00 and 7:00, and wakes up rested in the morning. "Needs" sets the pace (Normal, Relaxed at half speed, or Off). For testing, the URL parameter `petSpeed` makes time go faster (for example `petSpeed=120`, one hour in 30 seconds).

The widget reads the body from `widgets/shared/mii-body.js`. After changing the models, rebuild it with `python tools/mii-body-build.py` (needs Pillow).

The skeleton is in `widgets/shared/mii-rig.js`. The movements are baked in `widgets/shared/mii-anims.js` by `tools/mii-anim-build.html`, which retargets animations from `models/animations/` onto that skeleton: the [Universal Animation Library](https://quaternius.com/packs/universalanimationlibrary.html) by Quaternius and [RobotExpressive](https://threejs.org/examples/models/gltf/RobotExpressive/) by Tomás Laulhé, both CC0. Limbs copy the direction of each source segment, so different proportions work; pelvis, chest, head and feet copy the source's rotation. To change the moves, edit `CLIPS` in the tool, serve the repository (`python -m http.server`), open `http://localhost:8000/tools/mii-anim-build.html` (it previews each animation next to the Mii) and click "Download mii-anims.js", then put the file in `widgets/shared/`.

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
- Bluetooth devices: a web view cannot list paired Bluetooth devices or read their battery (no Web Bluetooth in Android WebView). The Devices widget shows the handheld's battery, the controllers the Gamepad API reports, and headphones found by name (`enumerateDevices`, when the web view shares names) or by the extra delay of Bluetooth audio (`AudioContext.outputLatency` above `btLatency`, 120 ms by default). None of them has a battery level. The Audio page of `tools/widget-probe.html` shows the raw readings, to calibrate `btLatency`.
- The widget is 198×198 as a tile and fills most of the screen when focused. Games use this to know when they can take the controller: on the tile, the same buttons move around the iiSU menu.

## Not tested on the handheld yet

- Whether iiSU also reacts to the D-pad and A while a game widget is focused (both would get the presses).
- Whether sound plays and timers run while a game is open (the chime is silent then by default anyway).
- The motion sensor's axes on the Retroid, so the tilt direction may need flipping.
