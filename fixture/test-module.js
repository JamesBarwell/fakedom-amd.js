define([], function() {

    var name = 'anonymous';

    function setName(value) {
        name = value;
    }

    function greet() {
        return 'Hello, ' + name + '!';
    }

    return {
        greet: greet,
        setName: setName
    }

});
