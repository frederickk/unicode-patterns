console.log('unicode-patterns Loaded');
'use strict';

/**!
 * unicode-patterns
 * newtab.js
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
const container = document.getElementById('pattern-container');
const inputColors = document.querySelectorAll('input[type="color"]');

let refreshTiming;



// ------------------------------------------------------------------------
//
// Methods
//
// ------------------------------------------------------------------------
function init() {
    const row = document.createElement('div');
    row.classList.add('bs-row');

    // update pattern
    setPattern(row, getRandomPattern());
    container.appendChild(row);

    // reveal nodes
    revealCharacters(row);

    // ...and set initial colors
    getRandomColor();
    setColor();

    // and trigger refresh
    refreshTiming = preferences.get('refreshTiming');
    triggerRefresh();
}

// ------------------------------------------------------------------------
function triggerRefresh() {
    let refresh = window.setTimeout(function() {
        let isRefresh = preferences.get('isRefresh');
        if (isRefresh) {
            console.log(`refreshing every ${refreshTiming} seconds`);
            container.innerHTML = '';
            init();
        }
        else {
            // window.clearTimeout(refresh);
        }
    }, refreshTiming * 1000);
}


// ------------------------------------------------------------------------
function setColor() {
    inputColors.forEach(col => {
        updateColorChars(col);
    });
}

function updateColorChars(col) {
    let index = parseInt(col.name);
    let selector = `.pattern-char:nth-child(${index}n)`;

    if (index === 0) {
        // TODO: this is a little sloppy... but whatever
        document.body.style.backgroundColor = col.value;
        return;
    }
    else if (index === 1) {
        selector = `.pattern-char:nth-child(${index}n):not(:nth-child(2n)):not(:nth-child(3n))`;
    }

    let chars = document.querySelectorAll(selector);
    chars.forEach(element => {
        element.style.color = col.value;
    });
}


// ------------------------------------------------------------------------
function setPattern(container, scheme) {
    container.innerHTML = '';

    let len = scheme.length;
    for (let i = 0; i < 45 * 16; i++) {
        let div = document.createElement('div');
        div.classList.add('pattern-char', 'bs-invisible');
        div.innerHTML = scheme[i % len];

        container.appendChild(div);
    }
}

// ------------------------------------------------------------------------
function revealCharacters(element) {
    const characters = shuffleNodeList(element.childNodes);
    const len = characters.length;
    const speed = parseInt(45 * 16 * 0.025);

    let animate;
    let index = 0;

    (function reveal() {
        if (index > len) {
            window.cancelAnimationFrame(animate);
            return;
        }
        else {
            for (let i = 0; i < speed; i++) {
                characters[(index + speed) % len].classList.remove('bs-invisible');
                index++;
            }
        }
        animate = window.requestAnimationFrame(reveal);
    })();

}

// ------------------------------------------------------------------------
function getRandomProperty(obj) {
    const keys = Object.keys(obj)
    return obj[keys[keys.length * Math.random() << 0]];
}

function getRandomPattern() {
    const pattern = getRandomProperty(patterns);
    return pattern.scheme;
}

function getRandomColor() {
    let palette = getRandomProperty(palettes);

    let isMonochrome = preferences.get('isMonochrome');
    if (isMonochrome) {
        let col = palette[parseInt(Math.random() * palette.length)];
        palette = [
            col,
            getColorShade(col, 0.6)
        ];
    }

    inputColors.forEach((col, index) => {
        col.value = palette[parseInt(col.name) % palette.length];
        updateColorChars(col);
    });
}

// ------------------------------------------------------------------------
function shuffleNodeList(list) {
    let arr = [];
    for (let i = list.length; i--; arr.unshift(list[i]));
    for (let j, x, k = arr.length; k; j = parseInt(Math.random() * k), x = arr[--k], arr[k] = arr[j], arr[j] = x);
    return arr;
}

// http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function getColorShade(color, percent) {
    var f = parseInt(color.slice(1), 16);
    let t = percent < 0
        ? 0
        : 255;
    let p = percent < 0
        ? percent * -1
        : percent;

    let R = f >> 16;
    let G = f >> 8&0x00FF;
    let B = f & 0x0000FF;

    return `#${(0x1000000+(Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1)}`;
}


// ------------------------------------------------------------------------
//
// Events
//
// ------------------------------------------------------------------------
window.addEventListener('FPreferencesLoaded', init, false);

document.getElementById('app-return').addEventListener('click', function(event) {
    event.preventDefault();
    chrome.tabs.update({
        url:'chrome://apps'
    });
});
