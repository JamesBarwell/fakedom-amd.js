var fs    = require('fs');
var path  = require('path');
var jsdom = require('jsdom').jsdom;

var doc;
var window;

function load(html, requireOptions, callback) {
    if (arguments.length === 2) {
        callback = requireOptions;
        requireOptions = {};
    } else if (arguments.length === 1) {
        callback = html;
        html = null;
        requireOptions = {};
    }

    window = getWindow(html);

    initRequire(requireOptions, function(err) {
        callback(err, window);
    });
}

function amdrequire(deps, callback) {
    deps = Array.isArray(deps) ? deps : [ deps ];

    if (!window) {
        return callback(new Error(
            'Could not require module because load() has not been run'
        ));
    }

    window.require(deps, function(module) {
        callback(null, module);
    });
}

function reset() {
    doc = undefined;
    window = undefined;
}

function getWindow(html) {
    html        = html || null; // causes basic document to be created
    var level   = null; // defaults to 3
    var options = {};

    doc = jsdom(html, level, options);
    window = doc.parentWindow;

    // Allow AMD modules to use console to log to STDOUT/ERR
    window.console = console;

    return window;
}

function initRequire(options, onRequireLoad) {
    // Set require.js options
    window.require = options;

    var requirePath = path.resolve(__dirname, './node_modules/requirejs/require.js');
    fs.exists(requirePath, function(exists) {
        if (!exists) {
            var err = new Error(
                'Could not load require.js at path ' + requirePath
            );
            return onRequireLoad(err);
        }

        var scriptEl = window.document.createElement('script');
        scriptEl.src = requirePath;
        scriptEl.onload = function() {
            onRequireLoad();
        }
        window.document.body.appendChild(scriptEl);
    });
}

module.exports = {
    load:       load,
    amdrequire: amdrequire,
    reset:      reset
}
