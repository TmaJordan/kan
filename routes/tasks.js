var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var Comment = mongoose.model('Comment');
var Link = mongoose.model('Link');

/* Routes for tasks */
router.get('/', function(req, res, next) {
  Task.find(function(err, tasks) {
    if (err) {return next(err);}
    
    res.json(tasks);
  })
});

router.get('/:task', function(req, res) {
  req.task.populate('comments', function(err, task) {
    if (err) {return next(err);}
    
    res.json(req.task);
  });
});

router.put('/:task', function(req, res) {
    //var updateTask = Object.assign({}, req.task, req.body);
    for (var attrname in req.body) { req.task[attrname] = req.body[attrname]; }

    req.task.save(function(err, task) {
        if (err) {return next(err);}
        
        res.json(task);
    });
});

router.post('/', function(req, res, next) {
  var task = new Task(req.body);
  
  task.save(function(err, task) {
    if (err) {return next(err);}
    
    res.json(task);
  })
});

/*Comment object routes */
router.post('/:task/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.task = req.task;
  
  comment.save(function(err, comment) {
    if (err) {return next(err);}
    
    req.task.comments.push(comment);
    req.task.save(function(err, post) {
      if (err) {return next(err);}
      
      res.json(comment);
    })
  });
});

/*Param method intercepts :post for above requests */
router.param('task', function (req, res, next, id) {
  var query = Task.findById(id);
  
  query.exec(function(err, task) {
    if (err) {return next(err);}
    
    if (!task) {return next(new Error("Can't find task"));}
    
    req.task = task;
    return next(); 
  }); 
});

module.exports = router;