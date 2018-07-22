'use strict';

/**
 * @fileoverview Class for handling preference within a Chrome Extension
 */



// NOTE: This polyfill allows for compatibility between Chrome Extension and
// Firefox Add-on API calls
const browser = require('webextension-polyfill');



class FPreferences {
  /**
   * @param  {Array} ids
   */
  constructor(ids) {
    /**
     * List of selectors/HTMLElements
     * @type {Object}
     */
    this.selectors = {};

    /**
     * preference defaults
     * @type {Object}
     */
    this.defaults = {};

    /**
     * browser.storage values
     * @type {Object}
     */
    this.storage = {};

    this.init_(ids);
    this.attach_();
  }

  /**
   * Initilialize class
   * @private
   * @param  {Array} ids
   */
  init_(ids) {
    ids.forEach((val, index) => {
      // 1.
      // set selectors
      this.selectors[val] = document.getElementById(val);

      let inputHandler = (event) => {
        let self = event.srcElement || event.target;

        this.getElementValue_(self, (val) => {
          this.storage[self.id] = val;
        });
        this.save();
        event.stopPropagation();
      }
      this.selectors[val].addEventListener('change', inputHandler);
      this.selectors[val].addEventListener('input', inputHandler);
      this.selectors[val].addEventListener('click', (event) => {
        event.stopPropagation();
      });

      // 2.
      // set defaults
      // TODO(frederickk): probably not very scalable
      this.getElementValue_(this.selectors[val], (v) => {
        this.defaults[val] = v;
      });
    });

    // 3
    // listen for when storage is updated
    browser.storage.onChanged.addListener(this.onChange);

    // 4.
    // check if saved values exist
    this.load().then((result) => {
      if (Object.keys(result).length) {
        this.storage = result;

        // 4.1
        // if there are saved values update selectors
        updateAllSelectors();
      }
      else {
        // 4.2
        // if there are no saved values, set storage to defaults
        this.storage = this.defaults;
      }

      // 5
      // Save regardless...
      this.save();

      // 6
      // craate and dispatch preferences loaded event
      let event = new Event('FPreferencesLoaded');
      window.dispatchEvent(event);
    });

    let updateAllSelectors = (obj=this.storage) => {
      for (let id in this.selectors) {
        updateSelector(this.selectors[id], obj[id]);
      }
    }

    let updateSelector = (ele, val=null) => {
      if (ele.type === 'checkbox') {
        ele.checked = val;
      }
      else if (ele.tagName.toLowerCase() === 'datalist') {
        // ele.op
        // type = ele.tagName.toLowerCase();
      }
      else {
        ele.value = val;
      }
    }
  }

  /**
   * Saves options to browser.storage
   */
  save() {
    browser.storage.sync.set(this.storage).then((item) => {
      console.log('FPreferences save', item, this.storage);
    });
    // browser.storage.sync.set(this.storage, () => {
    //   // console.log('FPreferences save', this.storage);
    //   // setTimeout(() => {
    //   // }, 1000);
    // });
  }

  /**
   * Load options from browser.storage
   * @param  {Object} [val=null]
   * @return {Promise}
   */
  load(val=null) {
    return browser.storage.sync.get(val);
    // return new Promise((resolve, reject) => {
      // browser.storage.sync.get(val, (item) => {
      //   if (item) {
      //     resolve(item);
      //     return;
      //   }
      //   else {
      //     reject(null);
      //     return;
      //   }
      // });
    // });
  }

  /**
   * Reset values to original/default values
   */
  reset() {
    browser.storage.sync.get(this.defaults).then(item => {
      // pass sync values to selectors
      try {
        for (let val in this.selectors) {
          if (this.selectors[val].type === 'checkbox') {
            this.selectors[val].checked = this.defaults[val];
          }
          else {
            this.selectors[val].value = this.defaults[val];
          }
        }
      } catch (err) {
        console.error('FPreferences', 'browser.storage.sync.get() error', err);
      }
    }, (err) => {
      console.error('FPreferences', 'browser.storage.sync.get() error', err);
    });

    // browser.storage.sync.get(this.defaults, (items) => {
    //   // pass sync values to selectors
    //   try {
    //     for (let val in this.selectors) {
    //       if (this.selectors[val].type === 'checkbox') {
    //         this.selectors[val].checked = this.defaults[val];
    //       }
    //       else {
    //         this.selectors[val].value = this.defaults[val];
    //       }
    //     }
    //   }
    //   catch (exception) {
    //     // console.error('FPreferences', 'browser.storage.sync.get() error', exception);
    //     // throw new Error('Selector elements are undefined');
    //   }
    // });
  }

  /**
   * Clear browser.storage
   */
  clear() {
    browser.storage.sync.clear();
  }

  // _setElementValue(ele, callback=null) {
  //     let val = ele.value;
  //     let type = ele.type.toLowerCase();
  //
  //     if (ele.type.toLowerCase() === 'checkbox') {
  //         val = ele.checked;
  //     }
  //     else if (ele.tagName.toLowerCase() === 'datalist') {
  //         type = ele.tagName.toLowerCase();
  //         val = ele.options = val;
  //     }
  //     else if (ele.tagName.toLowerCase() === 'select') {
  //         type = ele.tagName.toLowerCase();
  //         val = ele.options = val;
  //     }
  //
  //     if (callback) {
  //         callback(val, type);
  //     }
  // }

  /**
   * Set value of element, from this.selectors object
   * @param {string} id
   * @param {string|boolean|number|null} val
   */
  set(id, val) {
    if (this.selectors[id].type === 'checkbox') {
      this.selectors[id].checked = val;
    }
    // TODO(frederickk): is this necessary?
    else if (this.selectors[id].type === 'select') {
      this.selectors[id].options[this.selectors[id].selectedIndex].value = val;
    }
    else {
      this.selectors[id].value = val;
    }

  }

  /**
   * Get value of element
   * TODO(frederickk): what is the functional difference between this and this.get(id)?
   * one or the other seems redundant... tsk tsk
   * @private
   * @param  {HTMLElement} ele
   * @param  {Function} [callback=null]
   */
  getElementValue_(ele, callback=null) {
    let val = ele.value;
    let type = ele.type || '';

    if (type.toLowerCase() === 'checkbox') {
      val = ele.checked;
    }
    else if (ele.tagName.toLowerCase() === 'datalist') {
      type = ele.tagName.toLowerCase();
      // http://stackoverflow.com/questions/222841/most-efficient-way-to-convert-an-htmlcollection-to-an-array
      // http://stackoverflow.com/questions/6138042/javascript-selecbox-options-to-array
      val = Array.apply(null, ele.options).map((e) => {
        return e.text;
      });
    }
    // TODO(frederickk): is this necessary?
    else if (type.toLowerCase() === 'select') {
      val = this.selectors[id].options[this.selectors[id].selectedIndex].value;
    }

    if (callback) {
      callback(val, type);
    }
  }

  /**
   * Get value of element, from this.selectors object
   * @param  {string} id
   * @return {boolean|string|object}
   */
  get(id) {
    if (this.selectors[id].type === 'checkbox') {
      return this.selectors[id].checked;
    }
    // TODO(frederickk): is this necessary?
    else if (this.selectors[id].type === 'select') {
      return this.selectors[id].options[this.selectors[id].selectedIndex].value;
    }
    else {
      return this.selectors[id].value;
    }
  }

  /**
   * Attach event listeners
   * @private
   */
  attach_() {
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason == 'install') {
        // console.log('FPreferences', 'This is a first install!');
      }
      else if (details.reason == 'update') {
        let thisVersion = browser.runtime.getManifest().version;
        // console.log('FPreferences', `Updated from ${details.previousVersion} to ${thisVersion}!`);
      }
    });
  }

  /**
   * Handler when storage value changes
   * @param  {Object} changes
   * @param  {string} namespace
   */
  onChange(changes, namespace) {
    for (let key in changes) {
      let storageChange = changes[key];
      // console.log(
      //     'FPreferences',
      //     'Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".',
      //     key,
      //     namespace,
      //     storageChange.oldValue,
      //     storageChange.newValue
      // );
    }
  }
}



module.exports = FPreferences;
