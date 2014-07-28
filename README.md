fakedom-require.js
======

Provides a simple interface to bring up a fake DOM and require.js.

This wrapper currently uses jsdom to provide the fake DOM implementation.

## Example
```js
var fakedomrequire = require('fakedom-require');

var window;
var module;

// The module will automatically wrap this in <body>, if it is missing
var html = '<h1>test</h1>';

var requireOptions = {
    baseUrl: 'test'
};

var dom = new fakedomrequire(html, requireOptions, function(err, w) {
    if (err) throw err;
    window = w;
    loadModule();
});

function loadModule() {
    // Stub out a dependency of the AMD module under test
    var stub = {};
    dom.stub('some-dependency', stub);

    // Load module at test/my-amd-module.js
    dom.amdrequire('my-amd-module', function(err, m) {
        if (err) throw err;
        module = m;
        useModule()
    });
}

function useModule() {
    module.doStuff();
}
```

For more examples please see the test directory.
