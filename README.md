fakedom-amd.js
======

[![Build Status](https://travis-ci.org/JamesBarwell/fakedom-amd.js.svg?branch=master)](https://travis-ci.org/JamesBarwell/fakedom-amd.js)
[![NPM version](https://badge.fury.io/js/fakedom-amd.svg)](http://badge.fury.io/js/fakedom-amd)

Provides a simple interface to bring up a fake DOM with AMD support.

This wrapper currently uses jsdom to provide the fake DOM implementation, and require.js to provide AMD support.

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
