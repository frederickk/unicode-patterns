'use strict';

/**
 * @fileoverview Wrapper class for FPreferences to handle UnicodePatterns
 * specific prefrences
 */



// NOTE: This polyfill allows for compatibility between Chrome Extension and
// Firefox Add-on API calls
const browser = require('webextension-polyfill');

const Utils = require('utils');
const FPreferences = require('fpreferences');



class Preferences {
  constructor() {
    /**
     * Wrapper/container element for preferences
     * @private
     * @type {HTMLElement}
     */
    this.containerPreferences_ = document.querySelector('#preferences');

    /**
     * Source of colors for palette
     * @private
     * @type {HTMLElement}
     */
    this.paletteSource_ = document.querySelector('#patternsPalette');

    /**
     * Input (select) list for patterns
     * @type {HTMLElement}
     */
    this.patternInput_ = document.querySelector('#patternsListInput');

    /**
     * Input (select) list for pattern options
     * @private
     * @type {HTMLElement}
     */
    this.patternOptions_ = document.querySelector('#patternsList');

    /**
     * Input (select) list for typeface options
     * @private
     * @type {HTMLElement}
     */
    this.patternTypeface_ = document.querySelector('#patternsTypeface');

    /**
     * @private
     * @type {FPreferences}
     */
    this.fpreferences_ = new FPreferences([
      'patternsPalette',
      'isMonochrome',
      'isForceWhiteBackground',
      'isRefresh',
      'refreshTiming',
      'patternsList',
      'patternsTypeface'
    ]);

    this.init_();
    this.attach_();
  }


  /**
   * Initilialize class
   * @private
   */
  init_() {
    this.fpreferences_.load('patternsList').then((result) => {
      this.updateTypefaceInfo(this.fpreferences_.get('patternsTypeface'));

      result['patternsList'].forEach((str) => {
        // TODO(frederickk): fix the order of these functions,
        // it currently matters... and it shouldn't
        this.updateList(this.patternOptions_, str);
        this.updateDict(PATTERNS, str);
      });
    }).catch((error) => {
      // console.error(error);
    });

  }

  /**
   * [updateList description]
   * @param  {HTMLElement} element
   * @param  {string} str
   * @param  {number} [index=null]
   */
  updateList(element, str, index=null) {
    let option = document.createElement('option');
    option.text = str.replace(/ /g, '\xA0');
    option.dataset.index = index || Object.keys(PATTERNS).length;
    element.appendChild(option);
    return option;
  }

  /**
   * [updateDict description]
   * @param  {[type]} dict         [description]
   * @param  {[type]} str          [description]
   * @param  {[type]} [index=null] [description]
   * @return {[type]}              [description]
   */
  updateDict(dict, str, index=null) {
    let len = index || Object.keys(dict).length;
    dict[len.toString()] = {
      'scheme': (str)
    };
    return len;
  }

  /**
   * Update information link based on selected typeface
   * @param  {string} cls CSS class for a given typeface
   */
  updateTypefaceInfo(cls) {
    let info = document.querySelector('#patternsTypefaceInfo');

    if (cls === 'evolventa') {
      info.href = 'https://evolventa.github.io/';
    }
    else if (cls === 'plex') {
      info.href = 'https://fonts.google.com/specimen/IBM+Plex+Mono';
    }
    else if (cls === 'roboto') {
      info.href = 'https://fonts.google.com/specimen/Roboto+Mono';
    }
    else if (cls === 'space') {
      info.href = 'https://fonts.google.com/specimen/Space+Mono';
    }
    else if (cls === 'unscii') {
      info.href = 'http://pelulamu.net/unscii/';
    }
  }

  /**
   * Set (save) value as a preference
   * @param {string} id
   * @param {string} val
   */
  set(id, val) {
    this.fpreferences_.set(id, val);
  }

  /**
   * Get (load) preference value based on given id
   * @param {string} id
   * @return {string|Object}
   */
  get(id) {
    return this.fpreferences_.get(id);
  }

  /**
   * Attach event listeners
   * @private
   */
  attach_() {
    document.querySelector('#preferences-return').addEventListener('click', (event) => {
      Utils.removeClass(this.containerPreferences_, 'invisible');
    });

    document.querySelector('#close').addEventListener('click', () => {
      this.closeHandler_();
    });

    this.containerPreferences_.addEventListener('click', (event) => {
      if (this.patternInput_.dataset.isFocused === 'true') {
        this.patternInput_.dataset.isFocused = false;
      }
      else if (this.paletteSource_.dataset.isFocused === 'true') {
        this.paletteSource_.dataset.isFocused = false;
      }
      else if (this.patternTypeface_.dataset.isFocused === 'true') {
        this.patternTypeface_.dataset.isFocused = false;
      }
      else {
        this.closeHandler_();
      }
    });

    // palette sources
    this.paletteSource_.addEventListener('click', (event) => {
      this.focusHandler_(event, true);
    });

    this.paletteSource_.addEventListener('change', (event) => {
      this.focusHandler_(event, false);
      let self = event.srcElement || event.target;
      let val = Utils.getSelectValue(self).value;

      browser.storage.sync.set({
        'patternsPalette': val
      });
    });

    // pattern inputs
    this.patternInput_.addEventListener('click', (event) => {
      this.focusHandler_(event, true);
    });

    this.patternInput_.addEventListener('input', (event) => {
      this.focusHandler_(event, false);
    });

    // pattern typeface
    this.patternTypeface_.addEventListener('click', (event) => {
      this.focusHandler_(event, true);
    });

    this.patternTypeface_.addEventListener('change', (event) => {
      this.focusHandler_(event, false);
      let self = event.srcElement || event.target;
      let val = Utils.getSelectValue(self).value;

      this.updateTypefaceInfo(val);

      browser.storage.sync.set({
        'patternTypeface': val
      }).then((items) => {
        let row = document.querySelector('#pattern-container > div');
        row.classList = [];
        row.classList.add(val);
        // let chars = document.querySelectorAll('.pattern-char');
        // chars.forEach(element => {
        //   element.classList = [];
        //   element.classList.add('pattern-char', val);
        // });
      });
    });


    // TODO(frederickk): can all of this be folded into FPreferences
    // in a scalable/future-usage way?
    document.querySelector('#patterns-add').addEventListener('click', () => {
      if (this.patternInput_.value !== '') {
        let patternsArr = [this.patternInput_.value];

        this.fpreferences_.load('patternsList').then((result) => {
          let patternsList = result['patternsList'];

          if (typeof patternsList === 'array' || typeof patternsList === 'object') {
            patternsArr = patternsArr.concat(patternsList);
          }

          browser.storage.sync.set({
            'patternsList': patternsArr
          }).then((items) => {
            // TODO(frederickk): fix the order of these functions,
            // it currently matters... and it shouldn't
            this.updateList(this.patternOptions_, this.patternInput_.value);
            this.updateDict(PATTERNS, this.patternInput_.value);
            this.patternInput_.value = '';
          });
        });
      }

      event.stopPropagation();
    });


    // button for handling custom pattern removal
    document.querySelector('#patterns-minus').addEventListener('click', () => {
      if (this.patternInput_.value !== '') {
        let patternsArr;
        let patternsList = this.patternOptions_.options;

        for (let i = 0; i < patternsList.length; i++) {
          if (patternsList[i].text.toLowerCase() === this.patternInput_.value) {
            delete PATTERNS[patternsList[i].dataset.index];
            patternsList[i].remove();
            break;
          }
        }

        patternsArr = Array.apply(null, this.patternOptions_.options).map((event) => {
          return event.text;
        });

        browser.storage.sync.set({
          'patternsList': patternsArr
        }).then((items) => {
          this.patternInput_.value = '';
        });
      }

      event.stopPropagation();
    });


    // TODO(frederickk): fix character encoding
    // should look into encodeURI (on sender) and decodeURI (on receiever)
    document.querySelector('#patterns-test').addEventListener('click', (event) => {
      if (this.patternInput_.value !== '') {
        const href = event.target.parentNode.getAttribute('href');
        if (href) {
          location.href = href + `?scheme=${escape(this.patternInput_.value)}`;
          event.preventDefault();
        }
      }
    });
  }

  /**
   * Handler for closing preference pane
   * @private
   * @param  {Event} event
   */
  closeHandler_(event) {
    Utils.addClass(this.containerPreferences_, 'invisible');
  }

  /**
   * Handler for keeping focus of preference pane
   * @private
   * @param  {Event}  event
   * @param  {Boolean} isFocused
   */
  focusHandler_(event, isFocused) {
    let self = event.srcElement || event.target;
    self.dataset.isFocused = isFocused;
    event.stopPropagation();
  }
}



module.exports = Preferences;
