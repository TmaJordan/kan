require('dotenv').config();
var fs = require('fs');
var https = require('https');
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var passport = require('passport');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

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
app.use(express.static(__dirname + '/apidoc'));
//Initialise passport middleware
app.use(passport.initialize());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/api', function(req, res) {
  res.sendFile(path.join(__dirname + '/apidoc/index.html'));
});

//Nothing matches so send index file
app.use('*', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.ENVIRONMENT === 'dev') {
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

var httpsServer = https.createServer(credentials, app);

//ADd comment to deploy app
var port = process.env.PORT || 3000
httpsServer.listen(port, function () {
  console.log('Server listening on port: ' + port);
});
