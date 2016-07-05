var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());    

// Serve static files
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

//Nothing matches so send index file
app.use('*', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(3000, function () {
  console.log('Server listening on port 3000');
});
