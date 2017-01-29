'use strict';

/**!
 * unicode-patterns
 * newtab.js
 *
 * TODO: make this into a class?
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
let mouseMoveTimeout;



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
    let patternsPalette = preferences.get('patternsPalette');
    let isMonochrome = preferences.get('isMonochrome');

    if (patternsPalette === 'generative') {
        getColorGenerative(setColor, isMonochrome);
    }
    else {
        getColorPaletteDefined(setColor, isMonochrome);
    }


    // and trigger refresh
    refreshTiming = preferences.get('refreshTiming');
    triggerRefresh();
}

// ------------------------------------------------------------------------
function triggerRefresh() {
    let refresh = window.setTimeout(function() {
        let isRefresh = preferences.get('isRefresh');
        if (isRefresh) {
            // console.log(`refreshing every ${refreshTiming} seconds`);
            container.innerHTML = '';
            init();
        }
        else {
            // window.clearTimeout(refresh);
        }
    }, refreshTiming * 1000);
}


// ------------------------------------------------------------------------
function setPattern(container, scheme) {
    container.innerHTML = '';
    const patternTypeface = getTypeface();

    let len = scheme.length;
    for (let i = 0; i < 45 * 16; i++) {
        let div = document.createElement('div');
        // div.classList.add('pattern-char', 'bs-invisible', 'unscii');
        div.classList.add('pattern-char', 'bs-invisible', patternTypeface);
        div.innerHTML = scheme[i % len];

        container.appendChild(div);
    }

    document.getElementById('patternsListInput').setAttribute('placeholder', `create pattern e.g. ${scheme}`);
}

// ------------------------------------------------------------------------
function revealCharacters(element) {
    const characters = shuffleNodeList(element.childNodes);
    const len = characters.length;
    const speed = parseInt(45 * 16 * 0.0125);

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
    const pattern = getRandomProperty(PATTERNS);
    return pattern.scheme;
}


// ------------------------------------------------------------------------
function setColor(colArray) {
    inputColors.forEach((col, index) => {
        col.value = colArray[index % colArray.length];
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
function getColorGenerative(callback, isMonochrome=false) {
    let hue = parseInt(((new Date().getHours() * new Date().getMinutes() * new Date().getSeconds()) / (24 * 60 * 60)) * 360) + 1;
    let saturation = 100;
    let lightness = 50;
    let mode = 'analogic-complement';

    if (isMonochrome) {
        mode = 'monochrome'; // monochrome-light || monochrome-dark
    }

    bs.data.loadURL(`http://www.thecolorapi.com/scheme?hsl=${hue},${saturation}%,${lightness}%&mode=${mode}&count=4&format=json`).then(function(response) {
        let json = JSON.parse(response);
        let colArray = [];
        json.colors.forEach((item) => {
            colArray.push(item.hex.value);
        });
        callback(colArray);
    });
}

function getColorPaletteDefined(callback, isMonochrome=false) {
    let palette = getRandomProperty(PALETTES);

    if (isMonochrome) {
        let col = palette[parseInt(Math.random() * palette.length)];
        palette = shuffleNodeList([
            getColorContrast(col),
            getColorShade(col, 0.33),
            col,
        ]);
    }
    else {
        palette = shuffleNodeList(palette);
    }

    callback(palette);
}


// ------------------------------------------------------------------------
function getTypeface() {
    return preferences.get('patternsTypeface');
}

// ------------------------------------------------------------------------
function shuffleNodeList(list) {
    let arr = [];
    for (let i = list.length; i--; arr.unshift(list[i]));
    for (let j, x, k = arr.length; k; j = parseInt(Math.random() * k), x = arr[--k], arr[k] = arr[j], arr[j] = x);
    return arr;
}


function getColorContrast(hex) {
    // hex = hex.replace('#', '');
    let R = parseInt(hex.substr(1, 2), 16);
    let G = parseInt(hex.substr(2, 2), 16);
    let B = parseInt(hex.substr(4, 2), 16);
    let brightness = ((R * 299) + (G * 587) + (B * 114)) / 1000;

    return (brightness >= 162)
        // ? '#1e140f'
        // : #ffffff;
        ? getColorShade(hex, -0.66)
        : getColorShade(hex, 0.66);
}

/**
 * return the shade of color
 * http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 *
 * @param  {String} hex     HEX color value (e.g. #4285f4)
 * @param  {Number} percent float percentage of shade; positive = lighter, negative = darker
 *
 * @return {String} hex of colors shade
 */
function getColorShade(hex, percent) {
    let f = parseInt(hex.slice(1), 16);
    let t = percent < 0
        ? 0
        : 255;
    let p = percent < 0
        ? percent * -1
        : percent;

    let R = f >> 16;
    let G = f >> 8 & 0x00FF;
    let B = f & 0x0000FF;

    return `#${(0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1)}`;
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

// ------------------------------------------------------------------------
window.addEventListener('mousemove', function(event) {
    const app = document.getElementById('app-return');
    const pref = document.getElementById('preferences-return');

    if (app.dataset.hover === 'true' || pref.dataset.hover === 'true') {
        app.style = pref.style = '';
        window.clearTimeout(mouseMoveTimeout);
    }
    else {
        app.style.opacity = pref.style.opacity = 0.3;

        if (mouseMoveTimeout !== undefined) {
            window.clearTimeout(mouseMoveTimeout);
        }
        mouseMoveTimeout = window.setTimeout(function() {
            app.style.opacity = pref.style.opacity = 0.0;
        }, 200);
    }
});

// ------------------------------------------------------------------------
// TODO: feels a bit bootleg and functionality is a bit janky
function mouseOverHandler(event) {
    this.dataset.hover = 'true';
    event.preventDefault();
    event.stopPropagation();
}
document.getElementById('app-return').addEventListener('mouseover', mouseOverHandler);
document.getElementById('preferences-return').addEventListener('mouseover', mouseOverHandler);

// ------------------------------------------------------------------------
function mouseOutHandler(event) {
    this.dataset.hover = null;
    event.preventDefault();
    event.stopPropagation();
}
document.getElementById('app-return').addEventListener('mouseout', mouseOutHandler);
document.getElementById('preferences-return').addEventListener('mouseout', mouseOutHandler);
