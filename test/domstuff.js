var assert = require('assert');
var mocha = require('mocha');
var domloader = require('../domloader');

describe('$ess', function() {

    context('when the module has been loaded with amd', function() {

        var window;
        var module;

        beforeEach(function(done) {
            var requireOpts = {
                paths: {
                    bonzo: 'fixture/bonzo',
                    bean: 'fixture/bean',
                    ess: 'fixture/ess'
                }
            };

            domloader.load(null, requireOpts, function(w) {
                window = w;
                domloader.require('fixture/ess-bonzo-bean', function(m) {
                    module = m;
                    done();
                });
            });
        });

        context('and the body element has a class added', function() {

            beforeEach(function() {
                var $body = module('body');
                $body.addClass('foo');
            });

            it('should have have the class on the body element', function() {
                var bodyClasses = window.document.body.getAttribute('class');
                assert.ok(bodyClasses.indexOf('foo') !== -1);
            });

        });

    });

});
