'use strict';

/**!
 * FPreferences.js
 *
 * Ken Frederick
 * ken.frederick@gmx.de
 *
 * http://kennethfrederick.de/
 * http://blog.kennethfrederick.de/
 *
 *
 * Class for handling preference within a Chrome Extension
 * https://gist.github.com/frederickk/1abc7b58a09522c117c2e5633515aae9
 *
 */


class FPreferences {
    constructor(ids) {
        console.log('FPreferences', 'init', ids);

        this.selectors = {};
        this.defaults = {};
        this.storage = {};

        ids.forEach((val, index) => {
            // 1.
            // set selectors
            this.selectors[val] = document.getElementById(val);

            let inputHandler = (event) => {
                console.log('inputHandler');
                let ele = event.srcElement;
                this.storage[ele.id] = (ele.type === 'checkbox')
                    ? ele.checked
                    : ele.value;
                this.save();
                event.stopPropagation();
            }
            this.selectors[val].addEventListener('change', inputHandler);
            this.selectors[val].addEventListener('input', inputHandler);
            this.selectors[val].addEventListener('click', event => {
                event.stopPropagation();
            });

            // 2.
            // set defaults
            // TODO: probably not very scalable
            this.defaults[val] = (this.selectors[val].type === 'checkbox')
                ? this.selectors[val].checked
                : this.selectors[val].value;
        });

        // 3
        // listen for when storage is updated
        chrome.storage.onChanged.addListener(this.onChange);

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
            else {
                ele.value = val;
            }
        }
    }



    // ------------------------------------------------------------------------
    //
    // Methods
    //
    // ------------------------------------------------------------------------
    /**
     * Saves options to chrome.storage
     */
    save() {
        chrome.storage.sync.set(this.storage, () => {
            console.log('FPreferences save', this.storage);
            // setTimeout(function() {
            // }, 1000);
        });
    }

    load(val=null) {
        return new Promise(function(resolve, reject) {
            chrome.storage.sync.get(val, (item) => {
                if (item) {
                    resolve(item);
                    return;
                }
                else {
                    reject(null);
                    return;
                }
            });
        });
    }

    reset() {
        chrome.storage.sync.get(this.defaults, (items) => {
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
            }
            catch (exception) {
                console.error('FPreferences', 'chrome.storage.sync.get() error', exception);
                // throw new Error('Selector elements are undefined');
            }
        });
    }

    clear() {
        console.log('FPreferences', 'clear');
        chrome.storage.sync.clear();
    }

    // ------------------------------------------------------------------------
    get(id) {
        if (this.selectors[id].type === 'checkbox') {
            return this.selectors[id].checked;
        }
        else {
            return this.selectors[id].value;
        }
    }

    // ------------------------------------------------------------------------
    onChange(changes, namespace) {
        for (let key in changes) {
            let storageChange = changes[key];
            console.log(
                'FPreferences',
                'Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue
            );
        }
    }

}



// ------------------------------------------------------------------------
//
// Chrome Events
//
// ------------------------------------------------------------------------
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason == 'install') {
        console.log('FPreferences', 'This is a first install!');
    }
    else if (details.reason == 'update') {
        let thisVersion = chrome.runtime.getManifest().version;
        console.log('FPreferences', `Updated from ${details.previousVersion} to ${thisVersion}!`);
    }
});
