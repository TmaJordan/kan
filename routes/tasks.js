var express = require('express');
var router = express.Router();

var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Task = mongoose.model('Task');
var Comment = mongoose.model('Comment');
var Link = mongoose.model('Link');
var Project = mongoose.model('Project');
var Action = mongoose.model('Action');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

/**
 * @api {get} /api/tasks Get all tasks
 * @apiName GetTasks
 * @apiGroup Tasks
 *
 * @apiSuccess {Tasks[]} Tasks[] List of Tasks.
 */
router.get('/', auth, function(req, res, next) {
  Task.find(function(err, tasks) {
    if (err) {return next(err);}
    
    res.json(tasks);
  })
});

/**
 * @api {get} /api/tasks/:task Get task
 * @apiName GetTask
 * @apiGroup Tasks
 * 
 * @apiParam {task} task._id ID of task
 *
 * @apiSuccess {Task} Task
 */
router.get('/:task', auth, function(req, res, next) {
  req.task.populate('comments', function(err, task) {
    if (err) {return next(err);}
    req.task.populate('links', function(err, task) {
        if (err) {return next(err);}
        req.task.populate('dependency', function(err, task) {
          if (err) {return next(err);}
          req.task.populate('project', function(err, task) {
            if (err) {return next(err);}
            res.json(req.task);
          });
        });
    });
  });
});

/**
 * @api {delete} /api/tasks/:task Delete task
 * @apiName DeleteTask
 * @apiGroup Tasks
 * 
 * @apiParam {task} task._id ID of task
 *
 * @apiSuccess {Task} Task
 */
router.delete('/:task', auth, function(req, res, next) {
    req.task.remove(function(err) {
        if (err) {return next(err);}
        new Action({
          user: req.payload.username,
          action: "DELETE",
          actionDescription: "DELETE: " + req.task.title,
          target: req.task._id,
          targetType: 'Task'
        }).save();
        res.json(req.task);
    });
});

/**
 * @api {put} /api/tasks/:task Update task
 * @apiName UpdateTask
 * @apiGroup Tasks
 * 
 * @apiParam {task} task._id ID of task
 * @apiParam {task} task Task with updated info
 *
 * @apiSuccess {Task} Task
 */
router.put('/:task', auth, function(req, res, next) {
    //var updateTask = Object.assign({}, req.task, req.body);
    for (var attrname in req.body) {
      if (req.task[attrname] != req.body[attrname]) {
        new Action({
          user: req.payload.username,
          action: attrname + "_UPDATED",
          actionDescription: req.task[attrname] + " -> " + req.body[attrname],
          target: req.task._id,
          targetType: 'Task'
        }).save();

        req.task[attrname] = req.body[attrname];

        //Send mail for assignment
        if (attrname == 'assignee' && req.task.assignee != req.payload.username) {
          console.log('Sending assign mail to: ' + req.body.assignee);
          mailer.sendTaskMail(req.body.assignee, req.body.title + ' has been assigned to you', req.body);
        }
      } 
    }
    
    req.task.save(function(err, task) {
        if (err) {return next(err);}
        
        res.json(task);
    });
});

/**
 * @api {post} /api/tasks Create new task
 * @apiName CreateTask
 * @apiGroup Tasks
 * 
 * @apiParam {task} task New task to create
 *
 * @apiSuccess {Tasks} Tasks Newly created task
 */
router.post('/', auth, function(req, res, next) {
  var task = new Task(req.body);
  task.createdBy = req.payload.username;
  
  task.save(function(err, task) {
    if (err) {return next(err);}
    
    new Action({
      user: req.payload.username,
      action: "CREATE",
      actionDescription: "Create: " + task.title,
      target: task._id,
      targetType: 'Task'
    }).save();

    res.json(task);
  })
});

/**
 * @api {post} /api/tasks/:task/comments Add comment to task
 * @apiName AddComment
 * @apiGroup Tasks
 * 
 * @apiParam {task} task._id ID of task
 * @apiParam {comment} comment Comment to add to task
 *
 * @apiSuccess {Comment} Comment
 */
router.post('/:task/comments', auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.task = req.task;
  comment.author = req.payload.username;

  comment.save(function(err, comment) {
    if (err) {return next(err);}
    
    req.task.comments.push(comment);
    req.task.save(function(err, task) {
      if (err) {return next(err);}

      new Action({
        user: req.payload.username,
        action: "ADD_COMMENT",
        actionDescription: "Add Comment: " + task.title,
        target: task._id,
        targetType: 'Task'
      }).save();
      
      //Send mail for assignment
      if (req.task.assignee != req.payload.username) {
        console.log('Sending comment notification mail to: ' + req.task.assignee);
        mailer.sendCommentMail(req.task.assignee, req.payload.username + ' has commented on your task', comment);
      }

      res.json(comment);
    })
  });
});

/**
 * @api {put} /api/tasks/:task/links Add link to task
 * @apiName AddLink
 * @apiGroup Tasks
 * 
 * @apiParam {task} task._id ID of task
 * @apiParam {link} link Link to add to task
 *
 * @apiSuccess {Link} Link
 */
router.post('/:task/links', auth, function(req, res, next) {
  var link = new Link(req.body);
  
  link.save(function(err, link) {
    if (err) {return next(err);}
    
    req.task.links.push(link);
    req.task.save(function(err, task) {
      if (err) {return next(err);}
      
      new Action({
        user: req.payload.username,
        action: "ADD_LINK",
        actionDescription: "Add Link: " + task.title,
        target: task._id,
        targetType: 'Task'
      }).save();

      res.json(link);
    })
  });
});

/**
 * @api {delete} /api/tasks/:task/links/:link Delete link to task
 * @apiName DeleteLink
 * @apiGroup Tasks
 * 
 * @apiParam {task} task._id ID of task
 * @apiParam {link} link._id ID of link to delete
 *
 * @apiSuccess {Link} Link
 */
router.delete('/:task/links/:link', auth, function(req, res, next) {
  var linkId = req.link._id;
  req.link.remove(function(err) {
    if (err) {return next(err);}

    for (var i = 0; i < req.task.links.length; i++) {
        if (req.task.links[i] == linkId) {
            req.task.links.splice(i, 1);
        }
    }
    req.task.save(function(err, task) {
      if (err) {return next(err);}
      
      new Action({
        user: req.payload.username,
        action: "DELETE_LINK",
        actionDescription: "Delete Link: " + task.title,
        target: task._id,
        targetType: 'Task'
      }).save();

      res.json(req.link);
    });
  });
});

/*Param method intercepts :task for above requests */
router.param('task', function (req, res, next, id) {
  var query = Task.findById(id);
  
  query.exec(function(err, task) {
    if (err) {return next(err);}
    
    if (!task) {return next(new Error("Can't find task"));}
    
    req.task = task;
    return next(); 
  }); 
});

/*Param method intercepts :link for above requests */
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