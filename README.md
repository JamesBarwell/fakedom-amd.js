fakedom-require.js
======

Provides a simple interface to bring up a fake DOM and require.js.

This wrapper currently uses jsdom to provide the fake DOM implementation.

## Example
```js
var fakedomrequire = require('fakedom-require');

var window;
var module;

var dom = new fakedomrequire('<h1>Test</h1>', { baseUrl: 'test' }, function(err, w) {
    if (err) throw err;
    window = w;
    loadModule()
});

function loadModule() {
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
