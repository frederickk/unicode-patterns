'use strict';

/**!
 * unicode-patterns
 * localize.js
 *
 * http://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension
 *
 */


// ------------------------------------------------------------------------
//
// Properties
//
// ------------------------------------------------------------------------
const data = document.querySelectorAll('[data-localize]');



// ------------------------------------------------------------------------
//
// Methods
//
// ------------------------------------------------------------------------
(function() {
    for (let i in data) {
        if (data.hasOwnProperty(i)) {
            let obj = data[i];
            let tag = obj.getAttribute('data-localize').toString();

            replace_i18n(obj, tag);
        }
    }
})();

// ------------------------------------------------------------------------
function replace_i18n(obj, tag) {
    let msg = tag.replace(/__MSG_(.+)_/g, function(match, $1) {
        return $1
            ? chrome.i18n.getMessage($1)
            : '';
    });

    if (msg != tag) {
        obj.innerHTML = msg;
    }
}
