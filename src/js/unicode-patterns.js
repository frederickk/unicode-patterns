'use strict';

/**
 * @fileoverview The main class for unicode-patterns
 */



/**
 * Predefined color palettes
 * @constant
 * @type {Array}
 */
const PALETTES = require('palettes');

/**
 * Predefined patterns
 * @constant
 * @type {Object}
 */
const PATTERNS = require('patterns');

// NOTE: This polyfill allows for compatibility between Chrome Extension and
// Firefox Add-on API calls
const browser = require('webextension-polyfill');

const Utils = require('utils');
const Preferences = require('preferences');



class UnicodePatterns {
  constructor() {
    /**
     * @private
     * @type {Preferences}
     */
    this.preferences_ = new Preferences();

    /**
     * Wrapper/container for patterns
     * @private
     * @type {HTMLElement}
     */
    this.container_ = document.querySelector('#pattern-container');

    /**
     * [_inputColors description]
     * @private
     * @type {[type]}
     */
    this.inputColors_ = document.querySelectorAll('input[type="color"]');

    /**
     * [_refreshTiming description]
     * @private
     * @type {number}
     */
    this.refreshTiming_ = 15; // in seconds

    /**
     * [_mouseMoveTimeout description]
     * @private
     * @type {[type]}
     */
    this.mouseMoveTimeout_ = null;

    this.attach_();
  }

  /**
   * Initilialize class
   * @private
   */
  init_() {
    const row = document.createElement('div');

    // update pattern
    this.setPattern_(row, this.getRandomPattern_());
    this.container_.appendChild(row);

    // reveal nodes
    this.revealCharacters_(row);

    // ...and set initial colors
    let patternsPalette = this.preferences_.get('patternsPalette');
    let isMonochrome = this.preferences_.get('isMonochrome');

    if (patternsPalette === 'generative') {
      this.getColorGenerative_((colArray) => {
        this.setColor_(colArray);
      }, isMonochrome);
    }
    else {
      this.getColorPaletteDefined_((colArray) => {
        this.setColor_(colArray);
      }, isMonochrome);
    }

    // ...and trigger refresh
    this.refreshTiming_ = this.preferences_.get('refreshTiming');
    this.triggerRefresh_();
  }

  /**
   * Trigger refresh (redraw) of pattern
   * @private
   */
  triggerRefresh_() {
    let refresh = window.setTimeout(() => {
      const isRefresh = this.preferences_.get('isRefresh');
      if (isRefresh) {
        // console.log(`refreshing every ${this.refreshTiming_} seconds`);
        this.container_.innerHTML = '';
        this.init_();
      }
      else {
        // window.clearTimeout(refresh);
      }
    }, this.refreshTiming_ * 1000);
  }

  /**
   * Reveal the characters (i.e. randomly fade-in characters)
   * @private
   * @param  {HTMLElement} element
   */
  revealCharacters_(element) {
    const characters = Utils.shuffleNodeList(element.childNodes);
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
          characters[(index + speed) % len].classList.remove('invisible');
          index++;
        }
      }
      animate = window.requestAnimationFrame(reveal);
    })();
  }

  /**
   * Update the color of characters
   * @private
   * @param  {Object} col color value {name: '', value: ''}
   * @return {null}
   */
  updateColorChars_(col) {
    let index = parseInt(col.name);
    let selector = `.pattern-char:nth-child(${index}n)`;

    if (index === 0) {
      // TODO: this is a little sloppy... but whatever
      if (this.preferences_.get('isForceWhiteBackground')) {
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

    const chars = document.querySelectorAll(selector);
    chars.forEach(element => {
      element.style.color = col.value;
    });
  }

  /**
   * [setColor_ description]
   * @param {Array} colArray
   */
  setColor_(colArray) {
    this.inputColors_.forEach((col, index) => {
      col.value = colArray[index % colArray.length];
      this.updateColorChars_(col);
    });
  }

  /**
   * [setPattern_ description]
   * @param {HTMLElement} container
   * @param {[type]} scheme    [description]
   */
  setPattern_(container, scheme) {
    const patternTypeface = this.getTypeface_();

    container.innerHTML = '';
    container.classList.add(patternTypeface);

    const len = scheme.length;
    for (let i = 0; i < 45 * 16; i++) {
      let div = document.createElement('div');
      // div.classList.add('pattern-char', 'invisible', 'unscii');
      div.classList.add('pattern-char', 'invisible');
      div.innerHTML = scheme[i % len];

      container.appendChild(div);
    }

    document.querySelector('#patternsListInput').setAttribute('placeholder', `create pattern e.g. ${scheme}`);
  }

  /**
   * Read value from select#patternsTypeface
   * @private
   * @return {string} CSS class; default 'space'
   */
  getTypeface_() {
    const typeface = this.preferences_.get('patternsTypeface');
    if (typeface == null || typeface == undefined || typeface === '') {
      this.preferences_.set('patternsTypeface', 'space');
    }
    return this.preferences_.get('patternsTypeface');
  }

  /**
   * Get random pattern scheme
   * @private
   * @return {string}
   */
  getRandomPattern_() {
    const pattern = Utils.getRandomProperty(PATTERNS);
    return pattern.scheme;
  }

  /**
   * [getColorGenerative_ description]
   * @private
   * @param  {Function} callback
   * @param  {boolean}  [isMonochrome=false]
   */
  getColorGenerative_(callback, isMonochrome=false) {
    const hue = parseInt(((new Date().getHours() * new Date().getMinutes() * new Date().getSeconds()) / (24 * 60 * 60)) * 360) + 1;
    const saturation = 100;
    const lightness = 50;
    const mode = 'analogic-complement';

    if (isMonochrome) {
      mode = 'monochrome'; // monochrome-light || monochrome-dark
    }

    Utils.request('GET', `http://www.thecolorapi.com/scheme?hsl=${hue},${saturation}%,${lightness}%&mode=${mode}&count=4&format=json`).then((response) => {
      let json = JSON.parse(response);
      let colArray = [];
      json.colors.forEach((item) => {
        colArray.push(item.hex.value);
      });
      callback(colArray);
    });
  }

  /**
   * [getColorPaletteDefined_ description]
   * @private
   * @param  {Function} callback
   * @param  {boolean}  [isMonochrome=false]
   */
  getColorPaletteDefined_(callback, isMonochrome=false) {
    let palette = Utils.getRandomProperty(PALETTES);

    if (isMonochrome) {
      const col = palette[parseInt(Math.random() * palette.length)];
      palette = Utils.shuffleNodeList([
        Utils.getColorContrast(col),
        Utils.getColorShade(col, 0.33),
        col,
      ]);
    }
    else {
      palette = Utils.shuffleNodeList(palette);
    }

    callback(palette);
  }

  /**
   * Attach event listeners
   * @private
   */
  attach_() {
    window.addEventListener('FPreferencesLoaded', () => {
      this.init_();
    }, false);

    window.addEventListener('beforeunload', this.unloadHandler_);
    window.addEventListener('unload', () => {
      this.unloadHandler_();
    });

    window.addEventListener('mousemove', (event) => {
      const app = document.querySelector('#app-return');
      const pref = document.querySelector('#preferences-return');

      if (app.dataset.hover === 'true' || pref.dataset.hover === 'true') {
        app.style = pref.style = '';
        window.clearTimeout(this.mouseMoveTimeout_);
      }
      else {
        app.style.opacity = pref.style.opacity = 1.0;

        if (this.mouseMoveTimeout_ !== undefined) {
          window.clearTimeout(this.mouseMoveTimeout_);
        }
        this.mouseMoveTimeout_ = window.setTimeout(() => {
          app.style.opacity = pref.style.opacity = 0.0;
        }, 200);
      }
    });

    document.querySelector('#app-return').addEventListener('click', (event) => {
      event.preventDefault();
      browser.tabs.update({
        url: 'chrome://apps'
      });
    });
    document.querySelector('#app-return').addEventListener('mouseover', this.mouseOverHandler_);
    document.querySelector('#app-return').addEventListener('mouseout', this.mouseOutHandler_);

    document.querySelector('#preferences-return').addEventListener('mouseover', this.mouseOverHandler_);
    document.querySelector('#preferences-return').addEventListener('mouseout', this.mouseOutHandler_);
  }

  /**
   * mouse over/hover Handler
   * @private
   * @param  {Event} event
   */
  mouseOverHandler_(event) {
    this.dataset.hover = 'true';
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * mouse out/unfocus Handler
   * @private
   * @param  {Event} event
   */
  mouseOutHandler_(event) {
    this.dataset.hover = null;
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * mouse over/hover Handler
   * @private
   * @param  {Event} event
   */
  unloadHandler_(event) {
    document.querySelector('#preferences').classList.add('invisible');
    this.container_.classList.add('invisible');
  }
}



module.exports = UnicodePatterns;
