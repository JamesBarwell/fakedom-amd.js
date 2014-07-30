var assert = require('assert');
var mocha  = require('mocha');

var fakedomamd = require('../fakedom-amd');

describe('fakedom-amd', function() {

    var dom;

    describe('Constructor', function() {
        var err;
        var window;

        var requireJsLoaded = false;

        var html = '<html><body><h1>test</h1></body></html>';
        var options = {
            baseUrl: 'test',
            callback: function() { requireJsLoaded = true; }
        };

        context('when given HTML, require options, a module name and a callback', function() {
            var module;

            beforeEach(function(done) {
                dom = new fakedomamd({
                    html:           html,
                    requireOptions: options,
                    module:         'fixture/standalone'
                }, function(e, w, m) {
                    err = e;
                    window = w;
                    module = m;
                    done();
                });
            });

            it('should load the given HTML', function() {
                assert.ok(window.document.innerHTML.indexOf('<h1>test</h1>') !== -1);
            });

            it('should initialise require.js', function() {
                assert.ok(window.require);
            });

            it('should pass the given options to require.js', function() {
                assert.ok(requireJsLoaded);
            });

            it('should pass the module to the callback', function() {
                assert.ok(module);
                assert.equal(module.foo(), 'standalone-foo');
            });

            it('should not pass an error to the callback', function() {
                assert.ok(!err);
            });
        });

        context('when given HTML, require options and a callback', function() {
            beforeEach(function(done) {
                dom = new fakedomamd({ html: html, requireOptions: options }, function(e, w) {
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

            it('should pass the given options to require.js', function() {
                assert.ok(requireJsLoaded);
            });

            it('should not pass an error to the callback', function() {
                assert.ok(!err);
            });
        });

        context('when given html and a callback', function() {
            beforeEach(function(done) {
                dom = new fakedomamd({ html: html }, function(e, w) {
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
                dom = new fakedomamd({ requireOptions: { baseUrl: 'test' }}, function(e, w) {
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
                dom = new fakedomamd({ requireOptions: { baseUrl: 'test' }}, function(e, w) {
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

            context('and amdrequire() loads a module that it cannot find', function() {
                beforeEach(function(done) {
                    dom.amdrequire('fixture/does-not-exist', function(e, m) {
                        err = e;
                        module = m;
                        done();
                    });
                });

                it('should pass an error to the callback', function() {
                    assert.ok(err);
                });

                it('should not have loaded the module', function() {
                    assert.ok(!module);
                });
            });
        });
    });

    describe('DOM manipulation', function() {
        var window;
        var module;

        context('with an AMD module loaded that reaches into the DOM', function() {
            beforeEach(function(done) {
                var dom = new fakedomamd({ requireOptions: { baseUrl: 'test' }}, function(e, w) {
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
                dom = new fakedomamd({ requireOptions: { baseUrl: 'test' }}, function(e, w) {
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

            context('and an existing module is stubbed with a map', function() {
                beforeEach(function() {
                    var stub = {
                        bar: function() {
                            return 'stub'
                        }
                    }
                    dom.stub({ 'fixture/dependency-b': stub });
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
