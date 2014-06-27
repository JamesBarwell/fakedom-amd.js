var path = require('path');
var jsdom = require('jsdom').jsdom;
var amdloader = require('./amdloader');

var doc;
var window;

function load(html, module, requireOptions, callback) {
    if (arguments.length === 3) {
        callback = requireOptions;
        requireOptions = {};
    }

    window = getWindow(html);

    initRequire(requireOptions, function() {
        window.require([ module ], function(exported) {
            callback(window, exported);
        });
    });
}

function getWindow(html) {
    html = html || null; // causes basic document to be created
    var level = null; // defaults to 3
    var options = {};

    doc = jsdom(html, level, options);
    window = doc.parentWindow;

    // Allow modules to use console to log to STDOUT/ERR
    window.console = console;

    return window;
}

function initRequire(options, onRequireLoad) {
    // Set require.js options
    window.require = options;

    var requirePath = path.resolve(__dirname, './node_modules/requirejs/require.js');

    var scriptEl = window.document.createElement("script");
    scriptEl.src = requirePath;
    scriptEl.onload = onRequireLoad;
    window.document.body.appendChild(scriptEl);
}

module.exports = load
