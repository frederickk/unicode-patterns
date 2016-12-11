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
const patternInput = document.getElementById('patternsListInput');
const patternOptions = document.getElementById('patternsList');

let preferences;



// ------------------------------------------------------------------------
//
// Methods
//
// ------------------------------------------------------------------------
(function() {
    // // populate form
    // for (let p in patterns) {
    //     updateList(patternOptions, patterns[p].scheme);
    // }

    preferences = new FPreferences([
       'isMonochrome',
       'isRefresh',
       'refreshTiming',
       'patternsList'
   ]);

   preferences.load('patternsList').then((result) => {
       result['patternsList'].forEach(function(str) {
           updateList(patternOptions, str);
       });
   });
})();

// ------------------------------------------------------------------------
function updateList(ele, str) {
    let option = document.createElement('option');
    option.text = str.replace(/ /g, '\xA0');
    ele.appendChild(option);
}


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

// ------------------------------------------------------------------------
document.getElementById('patterns-add').addEventListener('click', function() {
    if (patternInput.value !== '') {
        let patternsArr = [patternInput.value];

        preferences.load('patternsList').then((result) => {
            let patternsList = result['patternsList'];

            if (typeof patternsList === 'array' || typeof patternsList === 'object') {
                patternsArr = patternsArr.concat(patternsList);
            }

            chrome.storage.sync.set({
                'patternsList': patternsArr
            }, function(items) {
                updateList(patternOptions, patternInput.value);
                patternInput.value = '';
            });
        });
    }
});

document.getElementById('patterns-minus').addEventListener('click', function() {
    console.log('minus', patternInput.value);

    if (patternInput.value !== '') {
        console.log(preferences.get('patternsList'));
    }
});
