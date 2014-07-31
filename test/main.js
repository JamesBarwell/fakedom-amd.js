var assert = require('assert');
var mocha  = require('mocha');

var fakedomamd = require('../fakedom-amd');

describe('fakedom-amd', function() {

    var env;

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
                env = new fakedomamd({
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
                env = new fakedomamd({ html: html, requireOptions: options }, function(e, w) {
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
                env = new fakedomamd({ html: html }, function(e, w) {
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
                env = new fakedomamd({ requireOptions: { baseUrl: 'test' }}, function(e, w) {
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
                env = new fakedomamd(function(e, w) {
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
                env = new fakedomamd({ requireOptions: { baseUrl: 'test' }}, function(e, w) {
                    window = w;
                    done();
                });
            });

            context('and amdrequire() is given a module name and callback', function() {
                beforeEach(function(done) {
                    env.amdrequire('fixture/standalone', function(e, m) {
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
                        env.amdrequire('fixture/standalone', function(e, m) {
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

            context('and amdrequire() is given an array of module names and callback', function() {
                var modules;

                beforeEach(function(done) {
                    modules = [];

                    env.amdrequire(['fixture/standalone', 'fixture/standalone2'], function(e, m, m2) {
                        err = e;
                        modules.push(m);
                        modules.push(m2);
                        done();
                    });
                });

                it('should not pass an error to the callback', function() {
                    assert.ok(!err);
                });

                it('should pass two modules to the callback', function() {
                    assert.equal(modules.length, 2);
                    assert.equal(modules[0].foo(), 'standalone-foo');
                    assert.equal(modules[1].foo(), 'standalone2-foo');
                });
            });

            context('and amdrequire() loads a module that has a dependency', function() {
                beforeEach(function(done) {
                    env.amdrequire('fixture/dependency-a', function(e, m) {
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
                    env.amdrequire('fixture/does-not-exist', function(e, m) {
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
                var env = new fakedomamd({ requireOptions: { baseUrl: 'test' }}, function(e, w) {
                    err = e;
                    window = w;
                    loadModule()
                });

                function loadModule() {
                    env.amdrequire('fixture/dom-manipulator', function(e, m) {
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
                env = new fakedomamd({ requireOptions: { baseUrl: 'test' }}, function(e, w) {
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
                    env.stub('fixture/dependency-b', stub);
                });

                context('and amdrequire() loads a module that has the stub dependency', function() {
                    beforeEach(function(done) {
                        env.amdrequire('fixture/dependency-a', function(e, m) {
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
                    env.stub({ 'fixture/dependency-b': stub });
                });

                context('and amdrequire() loads a module that has the stub dependency', function() {
                    beforeEach(function(done) {
                        env.amdrequire('fixture/dependency-a', function(e, m) {
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

    describe('Fake XHR', function() {
        var err;
        var window;

        var html = '<html><body><h1>test</h1></body></html>';
        var options = {
            baseUrl: 'test',
        };

        context('when given HTML, require options, a module name and a callback', function() {
            var module;

            beforeEach(function(done) {
                env = new fakedomamd({
                    html:           html,
                    requireOptions: options,
                    module:         'fixture/xhr-client'
                }, function(e, w, m) {
                    err = e;
                    window = w;
                    module = m;
                    done();
                });
            });

            context('and an XHR request is made', function() {
                var requests;

                var responseStatus;
                var responseBody;

                beforeEach(function() {
                    var data = JSON.stringify({ foo: 'bar' });
                    module.post('/test', 'application/json', data, function(status, body) {
                        responseStatus = status;
                        responseBody   = body;
                    });

                    requests = env.requests;
                });

                it('should have counted one request', function() {
                    assert.equal(requests.length, 1);
                });

                it('should make the request data available', function() {
                    var request = requests[0];
                    assert.equal(request.url, '/test');
                    assert.equal(request.requestBody, '{"foo":"bar"}');

                    var contentType = request.requestHeaders['Content-Type'];
                    assert.ok(contentType.indexOf('application/json' !== -1));
                });

                context('and the server responds to the request', function() {
                    beforeEach(function() {
                        var request = requests[0];
                        request.respond(200, {}, 'success');
                    });

                    it('should fulfil the request', function() {
                        assert.equal(responseStatus, 200);
                        assert.equal(responseBody, 'success');
                    });
                });
            });
        });
    });

});
