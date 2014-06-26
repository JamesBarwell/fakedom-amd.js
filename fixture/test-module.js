define([
    'transformer'
], function(
    Transformer
) {

    var name = 'anonymous';

    function setName(value) {
        name = Transformer.toUpperCase(value);
    }

    function greet() {
        return 'Hello, ' + name + '!';
    }

    return {
        greet: greet,
        setName: setName
    }

});
