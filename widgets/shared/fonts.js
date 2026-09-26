// Fonts for the widgets. Used by the widgets (hosted links) and by the configurator (downloads).
// Files live in /fonts. To add a font: drop its file(s) there and add an entry below.
// The configurator shows the font picker once there are two fonts or more.
var FONTS = {
  'cal-sans': {
    name: 'Cal Sans',
    note: 'iiSU default',
    family: 'Cal Sans',
    files: [
      { src: 'cal-sans-latin.woff2', range: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' },
      { src: 'cal-sans-latin-ext.woff2', range: 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF' }
    ]
  }
};

var FONT_FORMATS = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' };

// Builds the @font-face rules for a font. urlFor(file) returns the URL (or data: URI) of each file.
function fontFaceCss(id, urlFor) {
  var f = FONTS[id];
  if (!f) {
    return '';
  }
  return f.files.map(function (file) {
    var ext = file.src.split('.').pop().toLowerCase();
    return "@font-face{font-family:'" + f.family + "';src:url('" + urlFor(file) + "') format('" + (FONT_FORMATS[ext] || ext) + "');" +
           'font-display:swap;' + (file.range ? 'unicode-range:' + file.range + ';' : '') + '}';
  }).join('\n');
}
