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

    html = html || null; // causes basic document to be created
    var level = null; // defaults to 3
    var options = {};

    doc = jsdom(html, level, options);
    window = doc.parentWindow;

    // Allow modules to use console to log to STDOUT/ERR
    window.console = console;

    // @todo set require.js options before init
    window.require = requireOptions;

    // @todo use npm module
    var requirePath = path.resolve(__dirname, './require.js');

    var scriptEl = window.document.createElement("script");
    scriptEl.src = requirePath;

    scriptEl.onload = function() {
        window.require([ module ], function(exported) {
            callback(window, exported);
        });
    }

    window.document.body.appendChild(scriptEl);
}

module.exports = load
