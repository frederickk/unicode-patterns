'use strict';

/**!
 * unicode-patterns
 * preferences.js
 *
 * Ken Frederick
 * ken.frederick@gmx.de
 *
 * http://kennethfrederick.de/
 * http://blog.kennethfrederick.de/
 *
 */


// ------------------------------------------------------------------------
//
// Properties
//
// ------------------------------------------------------------------------
const containerPreferences = document.getElementById('preferences');
const select = document.getElementsByTagName('datalist')[0];

let preferences;



// ------------------------------------------------------------------------
//
// Methods
//
// ------------------------------------------------------------------------
(function() {
    preferences = new FPreferences([
       'isMonochrome',
       'isRefresh',
       'refreshTiming',
       'patternsList'
   ]);

   // populate form
   for (let p in patterns) {
       let option = document.createElement('option');
       option.text = patterns[p].scheme.replace(/ /g, '\xA0');
       select.appendChild(option);
   }

   console.log(document.getElementById('patternsList').options[0]);
   console.log(document.getElementById('patternsList').options.length);


})();


// ------------------------------------------------------------------------
//
// Events
//
// ------------------------------------------------------------------------
document.getElementById('preferences-return').addEventListener('click', function(event) {
    bs.css.removeClass(containerPreferences, 'bs-invisible');
});

// ------------------------------------------------------------------------
function closeHandler(event) {
    bs.css.addClass(containerPreferences, 'bs-invisible');
}
document.getElementById('close').addEventListener('click', closeHandler);
// containerPreferences.addEventListener('click', closeHandler);

document.getElementById('patterns-add').addEventListener('click', function() {
    console.log(this, preferences.get('patternsList'));
});
