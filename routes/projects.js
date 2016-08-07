var express = require('express');
var router = express.Router();

var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Task = mongoose.model('Task');
var Action = mongoose.model('Action');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

/* Routes for projects */
router.get('/', auth, function(req, res, next) {
    Project.find(function(err, projects) {
        if (err) {return next(err);}
    
        res.json(projects);
    })
});

router.post('/', auth, function(req, res, next) {
  var project = new Project(req.body);
  project.owner = req.payload.username;
  
  project.save(function(err, project) {
    if (err) {return next(err);}

    new Action({
      user: req.payload.username,
      action: "CREATE",
      actionDescription: "Create: " + project.name,
      target: project._id,
      targetType: 'Project'
    }).save();
    
    res.json(project);
  })
});

router.get('/:project', auth, function(req, res, next) {
    res.json(req.project);
});

router.put('/:project', auth, function(req, res, next) {
    //var updateTask = Object.assign({}, req.task, req.body);
    for (var attrname in req.body) { 
      req.project[attrname] = req.body[attrname];
      if (req.project[attrname] != req.body[attrname]) {
        new Action({
          user: req.payload.username,
          action: attrname + "_UPDATED",
          actionDescription: req.project[attrname] + " -> " + req.body[attrname],
          target: req.project._id,
          targetType: 'Project'
        }).save();

        req.project[attrname] = req.body[attrname];
      } 
    }
    
    req.project.save(function(err, project) {
        if (err) {return next(err);}
        
        res.json(project);
    });
});

router.delete('/:project', auth, function(req, res, next) {
    req.project.remove(function(err) {
        if (err) {return next(err);}
        new Action({
          user: req.payload.username,
          action: "DELETE",
          actionDescription: "DELETE: " + req.project.name,
          target: req.project._id,
          targetType: 'Project'
        }).save();
        
        res.json(req.project);
    });
});


/*Param method intercepts :project for above requests */
router.param('project', function (req, res, next, id) {
  var query = Project.findById(id);
  
  query.exec(function(err, project) {
    if (err) {return next(err);}
    
    if (!project) {return next(new Error("Can't find project"));}

    Task.find({project: project._id}).exec(function(err, tasks) {
      if (err) {return next(err);}
      project.tasks = tasks;
      req.project = project;
      return next(); 
    }); 
    
  }); 
});

module.exports = router;