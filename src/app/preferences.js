// chrome.storage.sync.clear();

/**!
* FTab
* preferences.js
*
* Ken Frederick
* ken.frederick@gmx.de
*
* http://kennethfrederick.de/
* http://blog.kennethfrederick.de/
*
*
* Replace new tab page with inspiration from select Instagram and/or Tumblr feeds
*
*/


/**
 * Class for handling preferences
 *
 */
var Preferences = function() {
    // ------------------------------------------------------------------------
    //
    // Properties
    //
    // ------------------------------------------------------------------------
    var defaults = {
        globalSaveStatus          : '',

        globalRandom              : true,
        globalTitle               : true,
        globalCaption             : true,
        globalColorForeground     : 'rgba(0, 0, 0, 0.6)',
        globalColorBackground     : '#ffffff',

        globalSlideshow           : true,
        globalSlideshowTiming     : 16,

        serviceInstagramActive    : true,
        // serviceInstagramUsers : [
        //     'graphilately',
        //     'thisisdisplay'
        // ],
        serviceInstagramUsers     : [
            'thisisdisplay',
            'oldgermanbooks',
            'andotherbooks',
            'vitsoe',
            'aigadesign',
            'beautifulpages',
            'mastbooks',
            'bibliothequeldn',
            'coverjunkie',
            'vormplatform',
            'graphilately',
            're_issue_',
            'natgeo',
            'nasa',
            'designfortoday',
            'nytimes',
            'itsnicethat'
        ],
        serviceInstagramRes        : 'standard_resolution',

        serviceTumblrActive        : true,
        serviceTumblrUsers         : ['kenfrederick'],
        serviceTumblrNum           : 50,
        serviceTumblrRes           : -1,

        serviceWeatherActive       : true,
        serviceWeatherUnit         : 'F'
    };

    var selectors = {
        globalSaveStatus           : document.getElementById('save-status'),
        globalSaveButton           : document.getElementById('save-button'),

        globalRandom               : document.getElementById('global-random'),
        globalTitle                : document.getElementById('global-title'),
        globalCaption              : document.getElementById('global-caption'),
        globalColorForeground      : document.getElementById('global-color-foreground'),
        globalColorBackground      : document.getElementById('global-color-background'),

        globalSlideshow            : document.getElementById('global-slideshow'),
        globalSlideshowTiming      : document.getElementById('global-slideshow-timing'),

        serviceInstagramActive     : document.getElementById('service-instagram'),
        serviceInstagramAccess     : document.getElementById('service-instagram-access'),
        serviceInstagramClientId   : document.getElementById('service-instagram-client-id'),
        serviceInstagramUsers      : document.getElementById('service-instagram-users'),
        serviceInstagramRes        : document.getElementById('service-instagram-res'),

        serviceTumblrActive        : document.getElementById('service-tumblr'),
        serviceTumblrConsumerKey   : document.getElementById('service-tumblr-consumer'),
        serviceTumblrUsers         : document.getElementById('service-tumblr-users'),
        serviceTumblrNum           : document.getElementById('service-tumblr-num'),
        serviceTumblrRes           : document.getElementById('service-tumblr-res'),

        serviceWeatherActive       : document.getElementById('service-weather'),
        serviceWeatherUnit         : document.getElementById('service-weather-unit'),
        test         : 'service-weather-unit'
    };



    // ------------------------------------------------------------------------
    //
    // Methods
    //
    // ------------------------------------------------------------------------
    (function init() {
        // console.log('Preferences', this);
    })();


    //
    // Sets
    //

    /**
     * Saves options to chrome.storage
     */
    function setSelectors() {
        chrome.storage.sync.set({
            globalRandom             : selectors.globalRandom.checked,
            globalTitle              : selectors.globalTitle.checked,
            globalCaption            : selectors.globalCaption.checked,
            globalColorForeground    : selectors.globalColorForeground.value,
            globalColorBackground    : selectors.globalColorBackground.value,

            globalSlideshow          : selectors.globalSlideshow.checked,
            globalSlideshowTiming    : parseInt(selectors.globalSlideshowTiming.value),

            serviceInstagramActive   : selectors.serviceInstagramActive.checked,
            serviceInstagramAccess   : selectors.serviceInstagramAccess.value,
            serviceInstagramClientId : selectors.serviceInstagramClientId.value,
            serviceInstagramUsers    : selectors.serviceInstagramUsers.value,
            serviceInstagramRes      : selectors.serviceInstagramRes.selectors[selectors.serviceInstagramRes.selectedIndex].value,

            serviceTumblrActive      : selectors.serviceTumblrActive.checked,
            serviceTumblrConsumerKey : selectors.serviceTumblrConsumerKey.value,
            serviceTumblrUsers       : selectors.serviceTumblrUsers.value,
            serviceTumblrNum         : parseInt(selectors.serviceTumblrNum.value),
            serviceTumblrRes         : parseInt(selectors.serviceTumblrRes.selectors[selectors.serviceTumblrRes.selectedIndex].value),

            serviceWeatherActive     : selectors.serviceWeatherActive.checked,
            serviceWeatherUnit       : selectors.serviceWeatherUnit.selectors[selectors.serviceWeatherUnit.selectedIndex].value
        },
        function() {
            selectors.globalSaveStatus.setAttribute('class', 'show');
            selectors.globalSaveStatus.innerHTML = 'Saved!';
            setTimeout(function() {
                selectors.globalSaveStatus.setAttribute('class', 'hide');
                selectors.globalSaveStatus.innerHTML = 'Waiting...';
            }, 1000);
        });

    }

    // ------------------------------------------------------------------------
    function resetSelectors() {
        chrome.storage.sync.get({
            // set sync values to defaults
            globalRandom           : defaults.globalRandom,
            globalTitle            : defaults.globalTitle,
            globalCaption          : defaults.globalCaption,
            globalColorForeground  : defaults.globalColorForeground,
            globalColorBackground  : defaults.globalColorBackground,

            globalSlideshow        : defaults.globalSlideshow,
            globalSlideshowTiming  : defaults.globalSlideshowTiming,

            serviceInstagramActive : defaults.serviceInstagramActive,
            serviceInstagramUsers  : defaults.serviceInstagramUsers,
            serviceInstagramRes    : defaults.serviceInstagramRes,

            serviceTumblrActive    : defaults.serviceTumblrActive,
            serviceTumblrUsers     : defaults.serviceTumblrUsers,
            serviceTumblrNum       : defaults.serviceTumblrNum,
            serviceTumblrRes       : defaults.serviceTumblrRes,

            serviceWeatherActive   : defaults.serviceWeatherActive,
            serviceWeatherUnit     : defaults.serviceWeatherUnit
        },
        function(items) {
            // pass sync values to selectors
            try {
                selectors.globalRandom.checked = items.globalRandom;
                selectors.globalTitle.checked = items.globalTitle;
                selectors.globalCaption.checked = items.globalCaption;
                selectors.globalColorForeground.value = items.globalColorForeground;
                selectors.globalColorBackground.value = items.globalColorBackground;

                selectors.globalSlideshow.checked = items.globalSlideshow;
                selectors.globalSlideshowTiming.value = items.globalSlideshowTiming;

                selectors.serviceInstagramActive.checked = items.serviceInstagramActive;
                selectors.serviceInstagramAccess.value = items.serviceInstagramAccess;
                selectors.serviceInstagramClientId.value = items.serviceInstagramClientId;
                selectors.serviceInstagramUsers.value = items.serviceInstagramUsers;
                selectors.serviceInstagramRes.value = items.serviceInstagramRes;

                selectors.serviceTumblrActive.checked = items.serviceTumblrActive;
                selectors.serviceTumblrConsumerKey.value = items.serviceTumblrConsumerKey;
                selectors.serviceTumblrUsers.value = items.serviceTumblrUsers;
                selectors.serviceTumblrNum.value = items.serviceTumblrNum;
                selectors.serviceTumblrRes.value = items.serviceTumblrRes;

                selectors.serviceWeatherActive.checked = items.serviceWeatherActive;
                selectors.serviceWeatherUnit.value = items.serviceWeatherUnit;
            }
            catch (exception) {
                // console.log(exception);

                // throw new Error('Selector elements are undefined');
            }
        });

    }

    // ------------------------------------------------------------------------
    function clear() {
        chrome.storage.sync.clear();
    }

    // ------------------------------------------------------------------------
    function setList(val) {
        // return val.replace(/[\s\n\r]|(\,\s)|(\,+.)/g, '\,\n');
        return val;
    }

    // ------------------------------------------------------------------------
    function setMinMax(val, min, max) {
        val = (val < min || val == null)
            ? min
            : (val > max)
                ? max
                : val;
        return val;
    }


    //
    // Gets
    //
    function get(val) {
        return new Promise(function(resolve, reject) {
            chrome.storage.sync.get(val, function(item) {
                if (item[val]) {
                    resolve(item[val]);
                    return;
                }
                else if(item && val === null) {
                    resolve(item);
                    return;
                }
                reject();
            });
        });
    }



    // ------------------------------------------------------------------------
    //
    // Events
    //
    // ------------------------------------------------------------------------
    function setOptionsEvents(doc) {
        console.log('doc', doc);
        console.log(doc.getElementById(selectors.test));
        // console.log('document', document);

        // FIX: move to options.js?
        // console.log('setOptionsEvents', 'preferences\tsetOptionsEvents()' );

        // selectors.globalSaveButton.addEventListener('click', setSelectors);
        // console.log('selectors.length', selectors);

        for (var opt in selectors) {
            // console.log(opt);
            // console.log(selectors[opt]);

            if (opt === 'serviceInstagramUsers' ||
                opt === 'serviceTumblrUsers') {
                selectors[opt].addEventListener('blur', function() {
                    // this.value = setList();
                    setSelectors();
                });
            }
            else if (opt === 'serviceTumblrNum') {
                selectors[opt].addEventListener('blur', function() {
                    this.value = setMinMax(this.value, 1, 100);
                    setSelectors();
                });
            }
            else if (opt === 'globalSlideshowTiming') {
                selectors[opt].addEventListener('blur', function() {
                    this.value = setMinMax(this.value, 5, 60 * 60 * 1000);
                    setSelectors();
                });
            }
            else {
                // selectors[opt].addEventListener('change', setSelectors);
            }
        }
    }

    // ------------------------------------------------------------------------
    function onChange(changes, namespace) {
        console.log( 'preferences\tonChange' );

        for (var key in changes) {
            var storageChange = changes[key];
            console.log(
                'preferences\tStorage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue
            );
        }
    }

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        onChange(changes, namespace);
    });


    // ------------------------------------------------------------------------
    return {
        selectors : selectors,

        defaults  : defaults,

        save      : setSelectors,
        reset     : resetSelectors,
        clear     : clear,

        set       : null,
        get       : get,

        setEvents : setOptionsEvents,
        onChange  : onChange
    };

};
