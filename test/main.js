var assert = require('assert');
var mocha = require('mocha');
var amd = require('../amdloader');

describe('test-module', function() {

    context('when the module has been loaded', function() {

        var module;

        beforeEach(function() {
            module = amd('fixture/test-module');
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
