var fs    = require('fs');
var path  = require('path');
var jsdom = require('jsdom').jsdom;

module.exports = jsdomrequire;
/**
 * Options
 * Callback
 */
function jsdomrequire(options, onInit) {
    if (arguments.length === 1) {
        onInit = options;
        options = {};
    }

    var window = getWindow(options.html);

    var self = this;
    initRequire(window, options.requireOptions, function(err) {
        if (options.module) {
           self.amdrequire(options.module, function(err, module) {
                if (err) {
                    return onInit(err);
                }
                return onInit(null, window, module);
           });
        } else {
            onInit(err, window);
        }
    });

    this.amdrequire = function(deps, onAmdLoad) {
        deps = Array.isArray(deps) ? deps : [ deps ];

        if (!window) {
            return onAmdLoad(new Error(
                'Could not require module because load() has not been run'
            ));
        }

        window.require(deps, function() {
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
            var stub = name[moduleName];
            window.define(moduleName, stub);
        });

        return this;
    }
}

function getWindow(html) {
    html = html || '';
    if (html.indexOf('<body>') === -1) {
        html = '<html><head></head><body>' + html + '</body></html>';
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
