var assert    = require('assert');
var mocha     = require('mocha');

var jsdomrequire = require('../jsdom-require');

describe('test-module', function() {

    context('when the module has been loaded', function() {

        var window;
        var module;

        beforeEach(function(done) {
            jsdomrequire.load(function(err, w) {
                window = w;
                jsdomrequire.require('fixture/test-module', function(m) {
                    module = m;
                    done();
                });
            });
        });

        it('should greet me anonymously', function() {
            assert.equal(module.greet(), 'Hello, anonymous!');
        });

        context('when I identity as "world"', function() {

            beforeEach(function() {
                module.setName('world');
            });

            it('should greet me as me', function() {
                assert.equal(module.greet(), 'Hello, WORLD!');
            });

        });

    });

});
