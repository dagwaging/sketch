var path = require('path');
var express = require('express');
var proxy = require('./proxy');

var app = express();

app.use(express.static(path.resolve(__dirname, 'sketch')));
app.use('/proxy/:url', proxy);

app.listen(process.env.PORT || 80, process.env.IP || "0.0.0.0", function(){
});
