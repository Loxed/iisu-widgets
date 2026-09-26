// Widgets that already live online, listed on external.html.
// Each entry is shown through widgets/embed.html, which scales the page to the widget.
//   site:     address of the page
//   viewport: width (px) the page is laid out at before being scaled down (bigger = smaller content)
//   options:  settings passed to the page in its query string; `param` is the page's own name for it
//   credits:  who made it (shown in the card's Credits bubble)
var EXTERNAL_GROUPS = [
  ['decor', 'Decor', 'Pages made by other people, shown as widgets. They need an internet connection.']
];

var EXTERNAL_WIDGETS = [
  {
    id: 'ext-dvd',
    group: 'decor',
    name: 'DVD screensaver',
    desc: 'The bouncing DVD logo, changing color on every bounce. Will it hit the corner?',
    site: 'https://dvd.bemxio.xyz/',
    viewport: 1024,
    background: '#000000',
    options: [
      { key: 'speed', param: 'speed', label: 'Speed', type: 'seg', def: '1', choices: [['0.5', 'Slow'], ['1', 'Normal'], ['2', 'Fast']] },
      // The page turns color changes off with randomizeColor=0.
      { key: 'randomizeColor', param: 'randomizeColor', label: 'New color on each bounce', type: 'switch', def: true, off: '0' },
      { key: 'initialColor', param: 'initialColor', label: 'Starting color', type: 'colors', def: '#ffffff',
        choices: [['#ffffff', 'White'], ['#30baf3', 'Blue'], ['#fb0018', 'Red'], ['#00fb00', 'Green'], ['#f3e300', 'Yellow'], ['#d300eb', 'Magenta'], ['#fb9200', 'Orange'], ['#8a00d3', 'Purple']] }
    ],
    credits: [
      { name: 'DVD Screensaver', by: 'bemxio', url: 'https://github.com/bemxio/dvd-screensaver', license: 'MIT' }
    ]
  }
];
