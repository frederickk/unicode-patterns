'use strict';

/**!
 * unicode-patterns
 * Preferences.js
 *
 * Ken Frederick
 * ken.frederick@gmx.de
 *
 * http://kenfrederick.de/
 * http://blog.kenfrederick.de/
 *
 *
 * Wrapper class for FPreferences to handle UnicodePatterns specific prefrences
 *
 * Requires
 * - FPreferences.js
 */


class Preferences {
  // ------------------------------------------------------------------------
  //
  // Constructor
  //
  // ------------------------------------------------------------------------
  constructor() {
    this._containerPreferences = document.getElementById('preferences');

    this._paletteSource = document.getElementById('patternsPalette');
    this._patternInput = document.getElementById('patternsListInput');
    this._patternOptions = document.getElementById('patternsList');
    this._patternTypeface = document.getElementById('patternsTypeface');

    this._fpreferences = new FPreferences([
      'patternsPalette',
      'isMonochrome',
      'isRefresh',
      'refreshTiming',
      'patternsList',
      'patternsTypeface'
    ]);

    this._init();
    this._initEvents();
  }



  // ------------------------------------------------------------------------
  //
  // Methods
  //
  // ------------------------------------------------------------------------
  _init() {
    this._fpreferences.load('patternsList').then((result) => {
      this.updateTypefaceInfo(this._fpreferences.get('patternsTypeface'));

      result['patternsList'].forEach((str) => {
        // TODO: fix the order of these functions,
        // it currently matters... and it shouldn't
        this.updateList(this._patternOptions, str);
        this.updateDict(PATTERNS, str);
      });
    }).catch((error) => {
      // console.error(error);
    });

  }


  // ------------------------------------------------------------------------
  updateList(element, str, index=null) {
    let option = document.createElement('option');
    option.text = str.replace(/ /g, '\xA0');
    option.dataset.index = index || Object.keys(PATTERNS).length;
    element.appendChild(option);
    return option;
  }

  updateDict(dict, str, index=null) {
    let len = index || Object.keys(dict).length;
    dict[len.toString()] = {
      'scheme': (str)
    };
    return len;
  }

  updateTypefaceInfo(val) {
    let info = document.getElementById('patternsTypefaceInfo');
    if (val === 'unscii') {
      info.href = 'http://pelulamu.net/unscii/';
    }
    else if (val === 'roboto') {
      info.href = 'https://fonts.google.com/specimen/Roboto+Mono';
    }
    else if (val === 'space') {
      info.href = 'https://fonts.google.com/specimen/Space+Mono';
    }
    else if (val === 'cutive') {
      info.href = 'https://fonts.google.com/specimen/Cutive+Mono';
    }
  }

  get(id) {
    return this._fpreferences.get(id);
  }



  // ------------------------------------------------------------------------
  //
  // Events
  //
  // ------------------------------------------------------------------------
  _initEvents() {
    document.getElementById('preferences-return').addEventListener('click', (event) => {
      bs.css.removeClass(this._containerPreferences, 'bs-invisible');
    });

    document.getElementById('close').addEventListener('click', () => {
      this._closeHandler();
    });
    this._containerPreferences.addEventListener('click', (event) => {
      if (this._patternInput.dataset.isFocused === 'true') {
        this._patternInput.dataset.isFocused = false;
      }
      else if (this._paletteSource.dataset.isFocused === 'true') {
        this._paletteSource.dataset.isFocused = false;
      }
      else if (this._patternTypeface.dataset.isFocused === 'true') {
        this._patternTypeface.dataset.isFocused = false;
      }
      else {
        this._closeHandler();
      }
    });


    // palette sources
    this._paletteSource.addEventListener('click', (event) => {
      this._focusHandler(event, true);
    });
    this._paletteSource.addEventListener('change', (event) => {
      this._focusHandler(event, false);
      let val = bs.html.getSelectValue(this).value;

      chrome.storage.sync.set({
        'patternsPalette': val
      });
    });


    // pattern inputs
    this._patternInput.addEventListener('click', (event) => {
      this._focusHandler(event, true);
    });
    this._patternInput.addEventListener('input', (event) => {
      this._focusHandler(event, false);
    });


    // pattern typeface
    this._patternTypeface.addEventListener('click', (event) => {
      this._focusHandler(event, true);
    });
    this._patternTypeface.addEventListener('change', (event) => {
      this._focusHandler(event, false);
      let val = bs.html.getSelectValue(event.srcElement).value;

      this.updateTypefaceInfo(val);

      chrome.storage.sync.set({
        'patternTypeface': val
      }, (items) => {
        let chars = document.querySelectorAll('.pattern-char');
        chars.forEach(element => {
          element.classList = [];
          element.classList.add('pattern-char', val);
        });
      });
    });


    // TODO: can all of this be folded into FPreferences
    // in a scalable/future-usage way?
    document.getElementById('patterns-add').addEventListener('click', () => {
      if (this._patternInput.value !== '') {
        let patternsArr = [this._patternInput.value];

        this._fpreferences.load('patternsList').then((result) => {
          let patternsList = result['patternsList'];

          if (typeof patternsList === 'array' || typeof patternsList === 'object') {
            patternsArr = patternsArr.concat(patternsList);
          }

          chrome.storage.sync.set({
            'patternsList': patternsArr
          }, (items) => {
            // TODO: fix the order of these functions,
            // it currently matters... and it shouldn't
            this.updateList(this._patternOptions, this._patternInput.value);
            this.updateDict(PATTERNS, this._patternInput.value);
            this._patternInput.value = '';
          });
        });
      }

      event.stopPropagation();
    });


    // pattern minus
    document.getElementById('patterns-minus').addEventListener('click', () => {
      if (this._patternInput.value !== '') {
        let patternsArr;
        let patternsList = this._patternOptions.options;

        for (let i = 0; i < patternsList.length; i++) {
          if (patternsList[i].text.toLowerCase() === this._patternInput.value) {
            delete PATTERNS[patternsList[i].dataset.index];
            patternsList[i].remove();
            break;
          }
        }

        patternsArr = Array.apply(null, this._patternOptions.options).map((event) => {
          return event.text;
        });

        chrome.storage.sync.set({
          'patternsList': patternsArr
        }, (items) => {
          this._patternInput.value = '';
        });
      }

      event.stopPropagation();
    });


    // TODO: fix character encoding
    // should look into encodeURI (on sender) and decodeURI (on receiever)
    document.getElementById('patterns-test').addEventListener('click', (event) => {
      if (this._patternInput.value !== '') {
        const href = event.target.parentNode.getAttribute('href');
        if (href) {
          location.href = href + `?scheme=${escape(this._patternInput.value)}`;
          event.preventDefault();
        }
      }
    });
  }

  // ------------------------------------------------------------------------
  _closeHandler(event) {
    bs.css.addClass(this._containerPreferences, 'bs-invisible');
  }

  _focusHandler(event, isFocused) {
    event.srcElement.dataset.isFocused = isFocused;
    event.stopPropagation();
  }

}
