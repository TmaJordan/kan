require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var passport = require('passport');

require('./models/Tasks');
require('./models/Comments');
require('./models/Links');
require('./models/Users');
require('./models/Projects');
require('./models/Actions');

require('./config/passport');

mailer = require('./config/mailer');

var taskRoutes = require('./routes/tasks');
var userRoutes = require('./routes/users');
var projectRoutes = require('./routes/projects');
var reportRoutes = require('./routes/reports');

mongoose.connect(process.env.DB_HOST)

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reports', reportRoutes);

// Serve static files
app.use(express.static(__dirname + '/public'));
//Initialise passport middleware
app.use(passport.initialize());

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
    console.log(err.message);
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err.message);
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

var port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('Server listening on port: ' + port);
});
