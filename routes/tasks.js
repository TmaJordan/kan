var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var Comment = mongoose.model('Comment');
var Link = mongoose.model('Link');

router.get('/', function(req, res, next) {
  Task.find(function(err, tasks) {
    if (err) {return next(err);}
    
    res.json(tasks);
  })
});

module.exports = router;