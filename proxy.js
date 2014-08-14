var http = require('follow-redirects').http;
var url = require('url');

module.exports = function(req, res) {
    var proxyUrl = url.parse(req.params.url);
    
    var proxyReq = http.request({
        host: proxyUrl.host,
        path: proxyUrl.path,
        method: req.method
    }, function(proxyRes) {
        var headers = proxyRes.headers;
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Headers'] = 'X-Requested-With';
        
        res.writeHead(proxyRes.statusCode, headers);
        
        proxyRes.on('data', function(chunk) {
            res.write(chunk);
        }).on('end', function() {
            res.end();
        })
    }).on('error', function(e) {
        res.writeHead(503);
        res.end();
    }).end();
};