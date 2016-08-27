var express = require('express');
var router = express.Router();

var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Action = mongoose.model('Action');
var Task = mongoose.model('Task');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

/**
 * @api {get} /api/reports Get all actions
 * @apiName GetActions
 * @apiGroup Reports
 *
 * @apiSuccess {Action[]} List of Actions.
 */
router.get('/actions', auth, function(req, res, next) {
    Action.find(function(err, actions) {
        if (err) {return next(err);}
    
        res.json(actions);
    })
});

/**
 * @api {get} /api/reports/users/:username Get all stats for user
 * @apiName GetUserStats
 * @apiGroup Reports
 * 
 * @apiParam {username} username username of user
 *
 * @apiSuccess {Stats} Stats User Stats
 */
router.get('/users/:username', auth, function(req, res, next) {
    var stats = {
        tasks: {
            total: 0,
            completed: 0,
            open: 0,
            overdue: 0,
            totalEffort: 0,
            statuses: {},
            types: {}
        },
        actions: {}
    }

    for (var i = 0; i < req.tasks.length; i++) {
        if (!stats.tasks.statuses[req.tasks[i].status]) stats.tasks.statuses[req.tasks[i].status] = 0;
        if (!stats.tasks.types[req.tasks[i].type]) stats.tasks.types[req.tasks[i].type] = 0;

        stats.tasks.total++;
        if (req.tasks[i].completed) {
            stats.tasks.completed++;
        }
        else {
            stats.tasks.open++;
            stats.tasks.statuses[req.tasks[i].status]++;
            stats.tasks.types[req.tasks[i].type]++;
            stats.tasks.totalEffort += req.tasks[i].loe;
            if (req.tasks[i].dueDate < Date.now()) {
                stats.tasks.overdue++;
            }
        }
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