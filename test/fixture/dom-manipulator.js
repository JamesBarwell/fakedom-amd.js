define(function() {

    function addClassToBody(className) {
        addClass(window.document.body, className);
    }

    function addClass(element, className) {
        element.setAttribute('class', className);
    }

    return {
        addClassToBody: addClassToBody
    }

});
