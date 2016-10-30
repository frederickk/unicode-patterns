console.log('ascii-patterns Loaded');
'use strict';

/**!
 * ascii-patterns
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
}
init();

let refresh = window.setInterval(function() {
    console.log('refreshing...');
    container.innerHTML = '';
    init();
    // window.clearInterval(refresh);
}, 15 * 1000);


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
            for (var i = 0; i < speed; i++) {
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
    const palette = getRandomProperty(palettes);
    inputColors.forEach(col => {
        col.value = palette[parseInt(col.name)];
        updateColorChars(col);
    });
}

// ------------------------------------------------------------------------
function shuffleNodeList(list) {
    var arr = [];
    for (var i = list.length; i--; arr.unshift(list[i]));
    for (var j, x, k = arr.length; k; j = parseInt(Math.random() * k), x = arr[--k], arr[k] = arr[j], arr[j] = x);
    return arr;
}



// ------------------------------------------------------------------------
//
// Events
//
// ------------------------------------------------------------------------
document.getElementById('app-return').addEventListener('click', function(event) {
    event.preventDefault();
    chrome.tabs.update({
        url:'chrome://apps'
    });
});
