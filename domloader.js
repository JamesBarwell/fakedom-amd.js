var path = require('path');
var jsdom = require('jsdom').jsdom;
var amdloader = require('./amdloader');

var doc;
var window;

function load(html, module, callback) {

    var html = null; // causes basic document to be created
    var level = null; // defaults to 3
    var options = { }

    doc = jsdom(html, level, options);
    window = doc.parentWindow;
    window.console = console;

    // Set require options
    var baseUrl = path.resolve(__dirname);
    console.log('setting base', baseUrl);
    window.require = {
        baseUrl: baseUrl
    }

    var requirePath = path.resolve(__dirname, './require.js');

    var scriptEl = window.document.createElement("script");
    scriptEl.src = requirePath;

    scriptEl.onload = function() {
        console.log('rjs loaded, require module', module);
        window.require([ module ], function(exported) {
            console.log('module loaded', exported);
            callback(window, exported);
        });
    }

    window.document.body.appendChild(scriptEl);
}

module.exports = load
