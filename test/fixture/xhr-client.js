define(function() {

    function post(url, type, data, callback) {
        var clientRequest = new XMLHttpRequest();
        clientRequest.open('POST', url, true);
        clientRequest.setRequestHeader('Content-Type', type);

        clientRequest.onload = function() {
            return callback(
                clientRequest.status,
                clientRequest.responseText
            );
        }

        clientRequest.send(data);
    }

    return {
        post: post
    }

});
