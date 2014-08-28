var fs    = require('fs');
var path  = require('path');
var jsdom = require('jsdom').jsdom;

var sinon = global.sinon = require('sinon');
require("sinon/lib/sinon/util/event");
require("sinon/lib/sinon/util/fake_xml_http_request");


module.exports = fakedom;
/**
 * Options
 * Callback
 */
function fakedom(options, onInit) {
    if (arguments.length === 1) {
        onInit = options;
        options = {};
    }

    var window = getWindow(options.html, options.jsdomOptions);
    augmentWindow.call(
        this,
        window,
        options.disableConsole,
        options.disableXhr
    );

    initRequire(window, options.requireOptions, function(err) {
        if (!options.module) {
            return onInit(err, window);
        }

        this.amdrequire(options.module, function(err, module) {
            if (err) {
                return onInit(err);
            }
            return onInit(null, window, module);
        });
    }.bind(this));


    this.amdrequire = function(deps, onAmdLoad) {
        if (!window) {
            return onAmdLoad(new Error(
                'Could not require module because load() has not been run'
            ));
        }

        if (!window.require || typeof window.require !== 'function') {
            return onAmdLoad(new Error('requirejs failed to initialise'));
        }

        deps = Array.isArray(deps) ? deps : [ deps ];

        makeSetTimeoutSafe(window);

        window.require(deps, function() {
            restoreSetTimeout(window);

            var args = Array.prototype.slice.call(arguments);
            args.unshift(null);
            onAmdLoad.apply(null, args);
        }, function(err) {
            onAmdLoad(err);
        });

        return this;
    }

    this.stub = function(name, module) {
        if (arguments.length === 2 ) {
            var stubs = {};
            stubs[name] = module;
            name = stubs;
        }

        Object.keys(name).forEach(function(moduleName) {
            window.define(moduleName, name[moduleName]);
        });

        return this;
    }
}

function getWindow(html, jsdomOptions) {
    html = html || '';
    if (html.indexOf('<body') === -1) {
        html = '<html><head></head><body>' + html + '</body></html>';
    }

    var level   = null; // defaults to 3
    var options = jsdomOptions || {};

    var doc = jsdom(html, level, options);
    return doc.parentWindow;
}

function augmentWindow(window, disableConsole, disableXhr) {
    // Allow AMD modules to use console to log to STDOUT/ERR
    if (!disableConsole) {
        window.console = console;
    }

    // Provide fake XHR
    if (!disableXhr) {
        this.requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = function(req) {
            this.requests.push(req);
        }.bind(this);
        window.XMLHttpRequest = xhr;
    }
}

function initRequire(window, options, onRequireLoad) {
    // Set require.js options
    window.require = options;

    var requirePath = path.resolve(
        __dirname,
        './node_modules/requirejs/require.js'
    );

    fs.exists(requirePath, function(exists) {
        if (!exists) {
            var err = new Error(
                'Could not load require.js at path ' + requirePath
            );
            return onRequireLoad(err);
        }

        makeSetTimeoutSafe(window);

        var scriptEl = window.document.createElement('script');
        scriptEl.src = requirePath;
        scriptEl.onload = function() {
            restoreSetTimeout(window);
            onRequireLoad();
        }
        window.document.body.appendChild(scriptEl);
    });
}

// Nasty stuff to ensure that requirejs can still load modules even when
// setTimeout has been stubbed
var oldTimeout;

function makeSetTimeoutSafe(window) {
    oldTimeout = window.setTimeout;
    window.setTimeout = function(fn) {
        fn();
    }
}

function restoreSetTimeout(window) {
    window.setTimeout = oldTimeout;
}
