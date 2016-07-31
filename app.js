require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var passport = require('passport');

var mongoose = require('mongoose');
require('./models/Tasks');
require('./models/Comments');
require('./models/Links');

var taskRoutes = require('./routes/tasks');

mongoose.connect(process.env.DB_HOST)

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());    

app.use('/api/tasks', taskRoutes);

// Serve static files
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

//Nothing matches so send index file
app.use('*', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(3000, function () {
  console.log('Server listening on port 3000');
});
