var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use('/', function(req, res, next) {
  console.log(new Date() + ": " + req.ip + "(" + req.headers['x-forwarded-for'] + ")] " + req.url);
  
  next();
});
app.use(bodyParser.urlencoded());
app.post('/download/:filename', function(req, res) {
  var regex = /^data:(?:(.+\/.+);)?base64,(.*)$/;
  var matches = regex.exec(req.body.data);
    
  if(!req.params.filename || !matches) {
    res.status(400).end();
  }
  else {
    var contentType = matches[1];
    var content = new Buffer(matches[2], 'base64');
    
    res.set('Content-Disposition', 'attachment; filename="' + req.params.filename + '"')
    .set('Content-Type', contentType)
    .set('Content-Transfer-Encoding', 'binary')
    .status(200).send(content);
  }
});

app.use(express.static(path.resolve(__dirname, 'sketch')));

app.listen(process.env.PORT || 80, process.env.IP || "0.0.0.0", function(){
});
