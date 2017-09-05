'use strict';

/**!
 * unicode-patterns
 * background.js
 *
 * Ken Frederick
 * ken.frederick@gmx.de
 *
 * http://kenfrederick.de/
 * http://blog.kenfrederick.de/
 */


class Background {
  // ------------------------------------------------------------------------
  //
  // Constructor
  //
  // ------------------------------------------------------------------------
  constructor(event) {
    chrome.runtime.onInstalled.addListener((event) => {
      this._init(event);
    });
  }



  // ------------------------------------------------------------------------
  //
  // Methods
  //
  // ------------------------------------------------------------------------
  _init(event) {

  }

}


// immediately invoke
new Background();
