'use strict';

/**
 * @fileoverview Utility class.
 */



class Utils {
  /**
   * Promisify-ed XHR request
   * http://stackoverflow.com/questions/30008114/how-do-i-promisify-native-xhr
   * @param  {string} method
   * @param  {string} url
   * @return {Promise}
   */
  static request(method, url) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = err => {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

  /**
   * Randomize a given array.
   * @param  {Array} list
   * @return {Array}
   */
  static shuffleNodeList(list) {
    let arr = [];
    for (let i = list.length; i--; arr.unshift(list[i]));
    for (let j, x, k = arr.length; k; j = parseInt(Math.random() * k), x = arr[--k], arr[k] = arr[j], arr[j] = x);
    return arr;
  }

  /**
   * Get random value from a given object
   * @param  {Object} obj
   * @return {Object|string|number|null}
   */
  static getRandomProperty(obj) {
    const keys = Object.keys(obj)
    return obj[keys[keys.length * Math.random() << 0]];
  }

  /**
   * Calculate contrast of color
   * @param  {[type]} hex [description]
   * @return {[type]}     [description]
   */
  static getColorContrast(hex) {
    // hex = hex.replace('#', '');
    const R = parseInt(hex.substr(1, 2), 16);
    const G = parseInt(hex.substr(2, 2), 16);
    const B = parseInt(hex.substr(4, 2), 16);
    const brightness = ((R * 299) + (G * 587) + (B * 114)) / 1000;

    return (brightness >= 162)
    // ? '#1e140f'
    // : #ffffff;
      ? Utils.getColorShade(hex, -0.66)
      : Utils.getColorShade(hex, 0.66);
  }

  /**
   * return the shade of color
   * http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
   * @param  {string} hex     HEX color value (e.g. #4285f4)
   * @param  {number} percent float percentage of shade; positive = lighter, negative = darker
   * @return {string} hex of colors shade
   */
  static getColorShade(hex, percent) {
    const f = parseInt(hex.slice(1), 16);
    const t = percent < 0
      ? 0
      : 255;
    const p = percent < 0
      ? percent * -1
      : percent;

    const R = f >> 16;
    const G = f >> 8 & 0x00FF;
    const B = f & 0x0000FF;

    return `#${(0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1)}`;
  }

  /**
   * Add CSS class to element
   * @param  {HTMLElement|null}  element
   * @param  {string}  cls
   * @return {boolean} true if added, false otherwise
   */
  static addClass(element, cls) {
    if (element !== null) {
      if (!element.classList.contains(cls)) {
        element.classList.add(cls);
        return true;
      }
      return false;
    }
    return false;
  }

  /**
   * Remove CSS class from element
   * @param  {HTMLElement|null}  element
   * @param  {string}  cls
   * @return {boolean} true if removed, false otherwise
   */
  static removeClass(element, cls) {
    if (element !== null) {
      if (element.classList.contains(cls)) {
        element.classList.remove(cls);
        return true;
      }
      return false;
    }
    return false;
  }

  /**
   * Get value of <select> element
   * @param  {HTMLElement|null}  element
   * @param  {number}    index (optional) index of option to get
   * @return {object} {innerHTML, value} of current selected item in select
   */
  static getSelectValue(element, index = element.selectedIndex) {
    return {
      innerHTML: element.options[index].text,
      value: element.options[index].value
    };
  }
}



module.exports = Utils;
