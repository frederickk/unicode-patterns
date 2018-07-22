'use strict';

/**
 * @fileoverview Static class to handle localization of content
 * http://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension
 */



// NOTE: This polyfill allows for compatibility between Chrome Extension and
// Firefox Add-on API calls
const browser = require('webextension-polyfill');



class Localize {
  /**
   * Execute localization
   */
  static run() {
    const data = document.querySelectorAll('[data-localize]');

    for (let i in data) {
      if (data.hasOwnProperty(i)) {
        let obj = data[i];
        let tag = obj.getAttribute('data-localize').toString();

        this.replace_i18n(obj, tag);
      }
    }
  }

  /**
   * Replace strings with localized copy
   * @param  {Object} obj
   * @param  {string} tag
   */
  static replace_i18n(obj, tag) {
    let msg = tag.replace(/__MSG_(.+)_/g, (match, $1) => {
      return $1
      ? browser.i18n.getMessage($1)
      : '';
    });

    if (msg != tag) {
      obj.innerHTML = msg;
    }
  }
}



module.exports = Localize;
