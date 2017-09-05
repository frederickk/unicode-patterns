'use strict';

/**!
 * unicode-patterns
 * UnicodePatterns.js
 *
 * Ken Frederick
 * ken.frederick@gmx.de
 *
 * http://kenfrederick.de/
 * http://blog.kenfrederick.de/
 *
 *
 * The main class for unicode-patterns
 *
 * Requires
 * - Preferences.js
 */


class UnicodePatterns {
  // ------------------------------------------------------------------------
  //
  // Constructor
  //
  // ------------------------------------------------------------------------
  constructor() {
    console.log('UnicodePatterns');

    this._preferences = new Preferences();

    this._container = document.getElementById('pattern-container');
    this._inputColors = document.querySelectorAll('input[type="color"]');

    this._refreshTiming = 15; // in seconds
    this._mouseMoveTimeout = null;

    this._initEvents();
  }



  // ------------------------------------------------------------------------
  //
  // Methods
  //
  // ------------------------------------------------------------------------
  _init() {
    const row = document.createElement('div');
    row.classList.add('bs-row');

    // update pattern
    this._setPattern(row, this._getRandomPattern());
    this._container.appendChild(row);

    // reveal nodes
    this._revealCharacters(row);

    // ...and set initial colors
    let patternsPalette = this._preferences.get('patternsPalette');
    let isMonochrome = this._preferences.get('isMonochrome');

    if (patternsPalette === 'generative') {
      this._getColorGenerative((colArray) => {
        this._setColor(colArray);
      }, isMonochrome);
    }
    else {
      this._getColorPaletteDefined((colArray) => {
        this._setColor(colArray);
      }, isMonochrome);
    }

    // ...and trigger refresh
    this._refreshTiming = this._preferences.get('refreshTiming');
    this._triggerRefresh();
  }


  // ------------------------------------------------------------------------
  _triggerRefresh() {
    let refresh = window.setTimeout(() => {
      let isRefresh = this._preferences.get('isRefresh');
      if (isRefresh) {
        // console.log(`refreshing every ${this._refreshTiming} seconds`);
        this._container.innerHTML = '';
        this._init();
      }
      else {
        // window.clearTimeout(refresh);
      }
    }, this._refreshTiming * 1000);
  }

  _shuffleNodeList(list) {
    let arr = [];
    for (let i = list.length; i--; arr.unshift(list[i]));
    for (let j, x, k = arr.length; k; j = parseInt(Math.random() * k), x = arr[--k], arr[k] = arr[j], arr[j] = x);
    return arr;
  }


  // ------------------------------------------------------------------------
  /**
   * Reveal the characters (i.e. randomly fade-in characters)
   *
   * @param  {node} element
   *
   * @return {null}
   */
  _revealCharacters(element) {
    const characters = this._shuffleNodeList(element.childNodes);
    const len = characters.length;
    const speed = parseInt(45 * 16 * 0.0125);

    let animate;
    let index = 0;

    (function reveal() {
      if (index > len) {
        window.cancelAnimationFrame(animate);
        return;
      }
      else {
        for (let i = 0; i < speed; i++) {
          characters[(index + speed) % len].classList.remove('bs-invisible');
          index++;
        }
      }
      animate = window.requestAnimationFrame(reveal);
    })();
  }

  /**
   * Update the color of characters
   *
   * @param  {object} col color value {name: '', value: ''}
   *
   * @return {null}
   */
  _updateColorChars(col) {
    let index = parseInt(col.name);
    let selector = `.pattern-char:nth-child(${index}n)`;

    if (index === 0) {
      // TODO: this is a little sloppy... but whatever
      if (this._preferences.get('isForceWhiteBackground')) {
        document.body.style.backgroundColor = '#fff';
      }
      else {
        document.body.style.backgroundColor = col.value;
      }
      return;
    }
    else if (index === 1) {
      selector = `.pattern-char:nth-child(${index}n):not(:nth-child(2n)):not(:nth-child(3n))`;
    }

    let chars = document.querySelectorAll(selector);
    chars.forEach(element => {
      element.style.color = col.value;
    });
  }


  // ------------------------------------------------------------------------
  _setColor(colArray) {
    this._inputColors.forEach((col, index) => {
      col.value = colArray[index % colArray.length];
      this._updateColorChars(col);
    });
  }

  _setPattern(container, scheme) {
    container.innerHTML = '';
    const patternTypeface = this._getTypeface();

    let len = scheme.length;
    for (let i = 0; i < 45 * 16; i++) {
      let div = document.createElement('div');
      // div.classList.add('pattern-char', 'bs-invisible', 'unscii');
      div.classList.add('pattern-char', 'bs-invisible', patternTypeface);
      div.innerHTML = scheme[i % len];

      container.appendChild(div);
    }

    document.getElementById('patternsListInput').setAttribute('placeholder', `create pattern e.g. ${scheme}`);
  }


  // ------------------------------------------------------------------------
  /**
   * Read value from select#patternsTypeface
   *
   * @return {string} CSS value; default 'space'
   */
  _getTypeface() {
    let typeface = this._preferences.get('patternsTypeface');
    if (typeface == null || typeface == undefined || typeface === '') {
      this._preferences.set('patternsTypeface', 'space');
    }
    return this._preferences.get('patternsTypeface');
  }

  _getRandomProperty(obj) {
    const keys = Object.keys(obj)
    return obj[keys[keys.length * Math.random() << 0]];
  }

  _getRandomPattern() {
    const pattern = this._getRandomProperty(PATTERNS);
    return pattern.scheme;
  }


  // ------------------------------------------------------------------------
  _getColorGenerative(callback, isMonochrome=false) {
    let hue = parseInt(((new Date().getHours() * new Date().getMinutes() * new Date().getSeconds()) / (24 * 60 * 60)) * 360) + 1;
    let saturation = 100;
    let lightness = 50;
    let mode = 'analogic-complement';

    if (isMonochrome) {
      mode = 'monochrome'; // monochrome-light || monochrome-dark
    }

    bs.data.loadURL(`http://www.thecolorapi.com/scheme?hsl=${hue},${saturation}%,${lightness}%&mode=${mode}&count=4&format=json`).then((response) => {
      let json = JSON.parse(response);
      let colArray = [];
      json.colors.forEach((item) => {
        colArray.push(item.hex.value);
      });
      callback(colArray);
    });
  }

  _getColorPaletteDefined(callback, isMonochrome=false) {
    let palette = this._getRandomProperty(PALETTES);

    if (isMonochrome) {
      let col = palette[parseInt(Math.random() * palette.length)];
      palette = this._shuffleNodeList([
        this._getColorContrast(col),
        this._getColorShade(col, 0.33),
        col,
      ]);
    }
    else {
      palette = this._shuffleNodeList(palette);
    }

    callback(palette);
  }

  _getColorContrast(hex) {
    // hex = hex.replace('#', '');
    let R = parseInt(hex.substr(1, 2), 16);
    let G = parseInt(hex.substr(2, 2), 16);
    let B = parseInt(hex.substr(4, 2), 16);
    let brightness = ((R * 299) + (G * 587) + (B * 114)) / 1000;

    return (brightness >= 162)
    // ? '#1e140f'
    // : #ffffff;
      ? this._getColorShade(hex, -0.66)
      : this._getColorShade(hex, 0.66);
  }

  /**
   * return the shade of color
   * http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
   *
   * @param  {String} hex     HEX color value (e.g. #4285f4)
   * @param  {Number} percent float percentage of shade; positive = lighter, negative = darker
   *
   * @return {String} hex of colors shade
   */
  _getColorShade(hex, percent) {
    let f = parseInt(hex.slice(1), 16);
    let t = percent < 0
      ? 0
      : 255;
    let p = percent < 0
      ? percent * -1
      : percent;

    let R = f >> 16;
    let G = f >> 8 & 0x00FF;
    let B = f & 0x0000FF;

    return `#${(0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1)}`;
  }



  // ------------------------------------------------------------------------
  //
  // Events
  //
  // ------------------------------------------------------------------------
  _initEvents() {
    window.addEventListener('FPreferencesLoaded', () => {
      this._init();
    }, false);

    window.addEventListener('mousemove', (event) => {
      const app = document.getElementById('app-return');
      const pref = document.getElementById('preferences-return');

      if (app.dataset.hover === 'true' || pref.dataset.hover === 'true') {
        app.style = pref.style = '';
        window.clearTimeout(this._mouseMoveTimeout);
      }
      else {
        app.style.opacity = pref.style.opacity = 1.0;

        if (this._mouseMoveTimeout !== undefined) {
          window.clearTimeout(this._mouseMoveTimeout);
        }
        this._mouseMoveTimeout = window.setTimeout(() => {
          app.style.opacity = pref.style.opacity = 0.0;
        }, 200);
      }
    });

    document.getElementById('app-return').addEventListener('click', (event) => {
      event.preventDefault();
      chrome.tabs.update({
        url: 'chrome://apps'
      });
    });

    document.getElementById('app-return').addEventListener('mouseover', this._mouseOverHandler);
    document.getElementById('preferences-return').addEventListener('mouseover', this._mouseOverHandler);

    document.getElementById('app-return').addEventListener('mouseout', this._mouseOutHandler);
    document.getElementById('preferences-return').addEventListener('mouseout', this._mouseOutHandler);
  }

  // ------------------------------------------------------------------------
  // TODO: feels a bit bootleg and functionality is a bit janky
  _mouseOverHandler(event) {
    this.dataset.hover = 'true';
    event.preventDefault();
    event.stopPropagation();
  }

  _mouseOutHandler(event) {
    this.dataset.hover = null;
    event.preventDefault();
    event.stopPropagation();
  }

}


// immediately invoke
new UnicodePatterns();
