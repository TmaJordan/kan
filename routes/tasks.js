var express = require('express');
var router = express.Router();

var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var Comment = mongoose.model('Comment');
var Link = mongoose.model('Link');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

/* Routes for tasks */
router.get('/', auth, function(req, res, next) {
  Task.find(function(err, tasks) {
    if (err) {return next(err);}
    
    res.json(tasks);
  })
});

router.get('/:task', auth, function(req, res, next) {
  req.task.populate('comments', function(err, task) {
    if (err) {return next(err);}
    req.task.populate('links', function(err, task) {
        if (err) {return next(err);}
        req.task.populate('dependency', function(err, task) {
          if (err) {return next(err);}
          res.json(req.task);
        });
    });
  });
});

router.delete('/:task', auth, function(req, res, next) {
    req.task.remove(function(err) {
        if (err) {return next(err);}
        
        res.json(req.task);
    });
});

router.put('/:task', auth, function(req, res, next) {
    //var updateTask = Object.assign({}, req.task, req.body);
    for (var attrname in req.body) { req.task[attrname] = req.body[attrname]; }

    req.task.save(function(err, task) {
        if (err) {return next(err);}
        
        res.json(task);
    });
});

router.post('/', auth, function(req, res, next) {
  var task = new Task(req.body);
  task.createdBy = req.payload.username;
  
  task.save(function(err, task) {
    if (err) {return next(err);}
    
    res.json(task);
  })
});

/*Comment object routes */
router.post('/:task/comments', auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.task = req.task;
  comment.author = req.payload.username;

  comment.save(function(err, comment) {
    if (err) {return next(err);}
    
    req.task.comments.push(comment);
    req.task.save(function(err, post) {
      if (err) {return next(err);}
      
      res.json(comment);
    })
  });
});

/*Link object routes */
router.post('/:task/links', auth, function(req, res, next) {
  var link = new Link(req.body);
  
  link.save(function(err, link) {
    if (err) {return next(err);}
    
    req.task.links.push(link);
    req.task.save(function(err, post) {
      if (err) {return next(err);}
      
      res.json(link);
    })
  });
});

router.delete('/:task/links/:link', auth, function(req, res, next) {
  var linkId = req.link._id;
  req.link.remove(function(err) {
    if (err) {return next(err);}

    for (var i = 0; i < req.task.links.length; i++) {
        if (req.task.links[i] == linkId) {
            req.task.links.splice(i, 1);
        }
    }
    req.task.save(function(err, post) {
      if (err) {return next(err);}
      
      res.json(req.link);
    });
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

/*Param method intercepts :post for above requests */
router.param('link', function (req, res, next, id) {
  var query = Link.findById(id);
  
  query.exec(function(err, link) {
    if (err) {return next(err);}
    
    if (!link) {return next(new Error("Can't find link"));}
    
    req.link = link;
    return next(); 
  }); 
});

module.exports = router;