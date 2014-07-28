var fs    = require('fs');
var path  = require('path');
var jsdom = require('jsdom').jsdom;

module.exports = jsdomrequire;
function jsdomrequire(html, requireOptions, callback) {
    var window;

    if (arguments.length === 2) {
        callback = requireOptions;
        if (typeof html === 'string') {
            requireOptions = {};
        } else {
            requireOptions = html;
            html = null;
        }
    } else if (arguments.length === 1) {
        callback = html;
        html = null;
        requireOptions = {};
    }

    window = getWindow(html);

    initRequire(window, requireOptions, function(err) {
        callback(err, window);
    });

    this.amdrequire = function(deps, callback) {
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
}

function getWindow(html) {
    html = html || '';
    if (html.indexOf('<body>') === -1) {
        html = '<html><head></head>' + html + '<body></body></html>';
    }

    var level   = null; // defaults to 3
    var options = {};

    var doc = jsdom(html, level, options);
    window = doc.parentWindow;

    // Allow AMD modules to use console to log to STDOUT/ERR
    window.console = console;

    return window;
}

function initRequire(window, options, onRequireLoad) {
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
