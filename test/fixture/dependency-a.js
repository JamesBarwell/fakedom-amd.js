define([
    'fixture/dependency-b'
], function(
    B
) {

    function foo() {
        return 'foo';
    }

    return {
        foo: foo,
        bar: B.bar
    }

});
