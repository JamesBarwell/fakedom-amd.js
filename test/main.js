var assert = require('assert');
var mocha  = require('mocha');

var fakedomamd = require('../fakedom-amd');

describe('fakedom-amd', function() {

    var dom;

    describe('Constructor', function() {
        var err;
        var window;

        var html = '<html><body><h1>test</h1></body></html>';
        var options = { };

        context('when given HTML, require options and a callback', function() {
            beforeEach(function(done) {
                dom = new fakedomamd(html, options, function(e, w) {
                    err = e;
                    window = w;
                    done();
                });
            });

            it('should load the given HTML', function() {
                assert.ok(window.document.innerHTML.indexOf('<h1>test</h1>') !== -1);
            });

            it('should initialise require.js', function() {
                assert.ok(window.require);
            });

            it('should pass the given options to require.js');

            it('should not pass an error to the callback', function() {
                assert.ok(!err);
            });
        });

        context('when given html and a callback', function() {
            beforeEach(function(done) {
                dom = new fakedomamd(html, function(e, w) {
                    err = e;
                    window = w;
                    done();
                });
            });

            it('should load the given HTML', function() {
                assert.ok(window.document.innerHTML.indexOf('<h1>test</h1>') !== -1);
            });

            it('should initialise require.js', function() {
                assert.ok(window.require);
            });

            it('should not pass an error to the callback', function() {
                assert.ok(!err);
            });
        });

        context('when given options and a callback', function() {
            beforeEach(function(done) {
                dom = new fakedomamd({ baseUrl: 'test' }, function(e, w) {
                    err = e;
                    window = w;
                    done();
                });
            });

            it('should load default HTML', function() {
                assert.ok(window.document.innerHTML.indexOf('<h1>test</h1>') === -1);
            });

            it('should initialise require.js', function() {
                assert.ok(window.require);
            });

            it('should not pass an error to the callback', function() {
                assert.ok(!err);
            });
        });

        context('when given a callback', function() {
            beforeEach(function(done) {
                dom = new fakedomamd(function(e, w) {
                    err = e;
                    window = w;
                    done();
                });
            });

            it('should load default HTML', function() {
                assert.ok(window.document.innerHTML.indexOf('<h1>test</h1>') === -1);
            });

            it('should initialise require.js', function() {
                assert.ok(window.require);
            });

            it('should not pass an error to the callback', function() {
                assert.ok(!err);
            });
        });
    });

    describe('amdrequire()', function() {
        var err;
        var window;
        var module;

        var html = '<html><body><h1>test</h1></body></html>';
        var options = { };

        context('when it has been constructed', function() {
            beforeEach(function(done) {
                dom = new fakedomamd({ baseUrl: 'test' }, function(e, w) {
                    window = w;
                    done();
                });
            });

            context('and amdrequire() is given a module name and callback', function() {
                beforeEach(function(done) {
                    dom.amdrequire('fixture/standalone', function(e, m) {
                        err = e;
                        module = m;
                        done();
                    });
                });

                it('should not pass an error to the callback', function() {
                    assert.ok(!err);
                });

                it('should pass the module to the callback', function() {
                    assert.ok(module);
                    assert.equal(module.foo(), 'standalone-foo');
                });

                context('and amdrequire() is run again with the same module name', function() {
                    beforeEach(function(done) {
                        dom.amdrequire('fixture/standalone', function(e, m) {
                            err = e;
                            module = m;
                            done();
                        });
                    });

                    it('should not pass an error to the callback', function() {
                        assert.ok(!err);
                    });

                    it('should pass the module to the callback', function() {
                        assert.ok(module);
                        assert.equal(module.foo(), 'standalone-foo');
                    });
                });
            });

            context('and amdrequire() loads a module that has a dependency', function() {
                beforeEach(function(done) {
                    dom.amdrequire('fixture/dependency-a', function(e, m) {
                        err = e;
                        module = m;
                        done();
                    });
                });

                it('should not pass an error to the callback', function() {
                    assert.ok(!err);
                });

                it('should pass the module to the callback with depdency fulfilled', function() {
                    assert.ok(module);
                    assert.equal(module.foo(), 'foo');
                    assert.equal(module.bar(), 'bar');
                });
            });
        });
    });

    describe('DOM manipulation', function() {
        var window;
        var module;

        context('with an AMD module loaded that reaches into the DOM', function() {
            beforeEach(function(done) {
                var dom = new fakedomamd({ baseUrl: 'test' }, function(e, w) {
                    err = e;
                    window = w;
                    loadModule()
                });

                function loadModule() {
                    dom.amdrequire('fixture/dom-manipulator', function(e, m) {
                        err = e;
                        module = m;
                        done();
                    });
                }
            });

            context('when the module tries to add a class to the DOM body element', function() {
                beforeEach(function() {
                    module.addClassToBody('foo');
                });

                it('should have added the class', function() {
                    var actual = window.document.body.getAttribute('class');
                    assert.ok(actual.indexOf('foo') !== -1);
                });
            });
        });
    });

    describe('stub()', function() {
        var window;
        var module;

        context('when it has been constructed', function() {
            beforeEach(function(done) {
                dom = new fakedomamd({ baseUrl: 'test' }, function(e, w) {
                    window = w;
                    done();
                });
            });

            context('and an existing module is stubbed', function() {
                beforeEach(function() {
                    var stub = {
                        bar: function() {
                            return 'stub'
                        }
                    }
                    dom.stub('fixture/dependency-b', stub);
                });

                context('and amdrequire() loads a module that has the stub dependency', function() {
                    beforeEach(function(done) {
                        dom.amdrequire('fixture/dependency-a', function(e, m) {
                            err = e;
                            module = m;
                            done();
                        });
                    });

                    it('should use the stub instead of the real dependency', function() {
                        assert.equal(module.foo(), 'foo');
                        assert.equal(module.bar(), 'stub');
                    });
                });
            });
        });
    });


});
