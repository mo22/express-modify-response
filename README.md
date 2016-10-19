#express-modify-response

## Example Usage

    var expressModifyResponse = require('express-modify-response');
    var app = ...

    app.use(expressModifyResponse(
        (req, res) => {
            // return true if you want to modify the response later
            if (res.getHeader('Content-Type').startsWith('text/html')) return true;
            return false;
        },
        (req, res, body) => {
            // body is a Buffer with the current response; return Buffer or string with the modified response
            // can also return a Promise.
            return body.toString() + '<script>console.log("hello");</script>';
        }
    ));

