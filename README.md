fakedom-amd.js
======

[![Build Status](https://travis-ci.org/JamesBarwell/fakedom-amd.js.svg?branch=master)](https://travis-ci.org/JamesBarwell/fakedom-amd.js)
[![NPM version](https://badge.fury.io/js/fakedom-amd.svg)](http://badge.fury.io/js/fakedom-amd)

Provides a simple interface to bring up a fake DOM with XHR and AMD support.

This wrapper currently uses:
- [jsdom](https://github.com/tmpvar/jsdom) for fake DOM
- [requirejs](https://github.com/jrburke/requirejs) for AMD support
- [Sinon.JS](https://github.com/cjohansen/Sinon.JS) for fake XHR

## Installation

via [npm (node package manager)](http://github.com/isaacs/npm)

    $ npm install fakedom-amd

## API

### constructor([options,] onLoad)
Instantiates a new DOM sandbox with the given options.
* options: Optional configuration object with the following optional keys:
  * html: An HTML string to create the fake DOM. Will be wrapped with in html, head and body tags if not already.
  * requireOptions: [requirejs configuration options](http://requirejs.org/docs/api.html#config).
  * stubs: An object mapping module names to modules; useful for defining stubs.
  * module: The name of a module to be required initially, and given back in the callback.
* onLoad: A function to run on initialisationation, given the arguments: error, window and module (module is only given if a module was specified in the options).

### amdrequire(depenendencies, onLoad)
Requires a given module or array of modules
* dependencies: string or array of strings specifying the module names to be loaded
* onLoad: a callback to be run once dependencies are loaded, given the arguments: error, module1, module2... etc.

### stub([moduleMap, ] name, module)
Used to define modules; useful for stubbing out modules that will be required. Can take either a module name and definition, or an object mapping names to definitions.
* map: Optional object map where the keys are the module names, and the values are their definition.
* name: Name of module to define.
* module: Definition of module to be defined.

### requests
An array of XHR requests that have been sent to the server. These can be examined and responses can be issued. See the [Sinon.JS FakeXMLHttpRequest documentation](http://sinonjs.org/docs/#FakeXMLHttpRequest) for further details.

## Example
```js
var fakedom = require('fakedom-amd');

var window;
var module;

// Specify HTML; this will automatically be wrapped in <body> if neccessary
var html = '<h1>test</h1>';

// Pass config options to AMD loader
var requireOptions = {
    baseUrl: 'test'
};

// Stub out a dependency of the AMD module under test
var stubs = {
    'some-dependency': {}
}

// Load module at test/my-amd-module.js immediately
var initialModuleName = 'test/my-amd-module';

// The options object passed to the constructor, and all of its keys, are optional. The callback is mandatory.

var dom = new fakedom(
    {
        html:           html,
        requireOptions: requireOptions,
        stubs:          stubs,
        module:         'test/my-amd-module'
    },
    function(err, w, m) {
        if (err) throw err;
        window = w;
        module = m; // will be undefined if no 'module' option was given
        useModule();
    }
);

function useModule() {
    module.doStuff();
}
```

For more examples please see the test directory.
