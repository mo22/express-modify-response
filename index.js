module.exports = function expressModifyResponse(checkCallback, modifyCallback)
{
    return function expressModifyResponse(req, res, next) {
        var _end = res.end;
        var _write = res.write;
        var buffers = [];
        var addBuffer = (chunk, encoding) => {
            if (chunk === undefined) return;
            if (typeof chunk === 'string') {
                chunk = new Buffer(chunk, encoding);
            }
            buffers.push(chunk);
        };
        res.write = function write(chunk, encoding) {
            if (!res.headersSent) {
                var hook = checkCallback(req, res);
                if (!hook) {
                    res.end = _end;
                    res.write = _write;
                    res.write(chunk, encoding);
                } else {
                    addBuffer(chunk, encoding);
                }
            } else {
                addBuffer(chunk, encoding);
            }
        };
        res.end = function end(chunk, encoding) {
            addBuffer(chunk, encoding);
            var buffer = Buffer.concat(buffers);
            Promise.resolve(modifyCallback(req, res, buffer)).then((result) => {
                if (res.getHeader('Content-Length')) {
                    res.setHeader('Content-Length', String(result.length));
                }
                res.end = _end;
                res.write = _write;
                res.write(result);
                res.end();
            }).catch((e) => {
                // handle?
                next(e);
            });
        };
        next();
    };
}
