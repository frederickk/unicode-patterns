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
const patternTypeface = document.getElementById('patternsTypeface');

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
        'patternsList',
        'patternsTypeface'
    ]);

    preferences.load('patternsList').then((result) => {
        result['patternsList'].forEach(function(str) {
            // TODO: fix the order of these functions,
            // it currently matters... and it shouldn't
            updateList(patternOptions, str);
            updateDict(PATTERNS, str);
        });
    });
})();


// ------------------------------------------------------------------------
function updateList(ele, str, index=null) {
    let option = document.createElement('option');
    option.text = str.replace(/ /g, '\xA0');
    option.dataset.index = index || Object.keys(PATTERNS).length;
    ele.appendChild(option);
    return option;
}

function updateDict(dict, str, index=null) {
    let len = index || Object.keys(dict).length;
    dict[len.toString()] = {
        'scheme' : (str)
    };
    return len;
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
containerPreferences.addEventListener('click', function(event) {
    if (patternInput.dataset.isFocused === 'true') {
        patternInput.dataset.isFocused = false;
    }
    else if (patternTypeface.dataset.isFocused === 'true') {
        patternTypeface.dataset.isFocused = false;
    }
    else {
        closeHandler();
    }
});


// ------------------------------------------------------------------------
patternInput.addEventListener('click', function() {
    this.dataset.isFocused = true;
    event.stopPropagation();
});
patternInput.addEventListener('input', function() {
    this.dataset.isFocused = false;
});

patternTypeface.addEventListener('click', function() {
    this.dataset.isFocused = true;
    event.stopPropagation();
});
patternTypeface.addEventListener('change', function() {
    this.dataset.isFocused = false;
    let val = bs.html.getSelectValue(this).value;

    chrome.storage.sync.set({
        'patternTypeface': val
    }, function(items) {
        let chars = document.querySelectorAll('.pattern-char');
        chars.forEach(element => {
            element.classList = [];
            element.classList.add('pattern-char', val);
        });
    });

    event.stopPropagation();
});


// ------------------------------------------------------------------------
// TODO: can all of this be folded into FPreferences
// in a scalable/future-usage way?
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
                // TODO: fix the order of these functions,
                // it currently matters... and it shouldn't
                updateList(patternOptions, patternInput.value);
                updateDict(PATTERNS, patternInput.value);
                patternInput.value = '';
            });
        });
    }

    event.stopPropagation();
});

document.getElementById('patterns-minus').addEventListener('click', function() {
    if (patternInput.value !== '') {
        let patternsArr;
        let patternsList = patternOptions.options;

        for (let i = 0; i < patternsList.length; i++) {
            if (patternsList[i].text.toLowerCase() === patternInput.value) {
                delete PATTERNS[patternsList[i].dataset.index];
                patternsList[i].remove();
                break;
            }
        }

        patternsArr = Array.apply(null, patternOptions.options).map(function(e) {
            return e.text;
        });

        chrome.storage.sync.set({
            'patternsList': patternsArr
        }, function(items) {
            patternInput.value = '';
        });
    }

    event.stopPropagation();
});


// ------------------------------------------------------------------------
// TODO: fix character encoding
// should look into encodeURI (on sender) and decodeURI (on receiever)
document.getElementById('patterns-test').addEventListener('click', function(event) {
    if (patternInput.value !== '') {
        const href = event.target.parentNode.getAttribute('href');
        if (href) {
            location.href = href + `?scheme=${escape(patternInput.value)}`;
            event.preventDefault();
        }
    }
});
