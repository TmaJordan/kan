var express = require('express');
var router = express.Router();

var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Action = mongoose.model('Action');
var Task = mongoose.model('Task');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

/* Routes for projects */
router.get('/actions', auth, function(req, res, next) {
    Action.find(function(err, actions) {
        if (err) {return next(err);}
    
        res.json(actions);
    })
});

router.get('/users/:username', auth, function(req, res, next) {
    var stats = {
        tasks: {},
        actions: {}
    }

    for (var i = 0; i < req.tasks.length; i++) {
        if (!stats.tasks[req.tasks[i].status]) stats.tasks[req.tasks[i].status] = 0;
        stats.tasks[req.tasks[i].status]++;
    }

    for (var i = 0; i < req.actions.length; i++) {
        if (!stats.actions[req.actions[i].action]) stats.actions[req.actions[i].action] = 0;
        stats.actions[req.actions[i].action]++;
    }

    res.json(stats);
});


/*Param method intercepts :username for above requests */
router.param('username', function (req, res, next, username) {
  var taskQuery = Task.find({assignee: username});
  var actionQuery = Action.find({user: username});

  taskQuery.exec(function(err, tasks) {
    if (err) {return next(err);}
    
    req.tasks = tasks;
    actionQuery.exec(function(err, actions) {
        if (err) {return next(err);}

        req.actions = actions;
        return next();
    }); 
  }); 
});

module.exports = router;