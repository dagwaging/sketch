var http = require('http');
var url = require('url');

module.exports = function(req, res) {
    var proxyUrl = url.parse(req.params.url);
	
	var headers = req.headers;
	headers['host'] = proxyUrl.host;
    
    var proxyReq = http.request({
        host: proxyUrl.host,
        path: proxyUrl.path,
        method: req.method,
		headers: headers
    }, function(proxyRes) {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        
        proxyRes.on('data', function(chunk) {
            res.write(chunk);
        }).on('end', function() {
            res.end();
        })
    }).on('error', function(e) {
        res.writeHead(503);
        res.end();
    });
	
	req.on('data', function(chunk) {
        proxyReq.write(chunk);
    }).on('end', function() {
        proxyReq.end();
    });
};