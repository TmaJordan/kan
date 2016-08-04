var express = require('express');
var router = express.Router();

var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Task = mongoose.model('Task');

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
    
    res.json(project);
  })
});

router.get('/:project', auth, function(req, res, next) {
    req.project.populate('tasks', function(err, project) {
        if (err) {return next(err);}

        res.json(req.project);
    });
});

/*Param method intercepts :project for above requests */
router.param('project', function (req, res, next, id) {
  var query = Project.findById(id);
  
  query.exec(function(err, project) {
    if (err) {return next(err);}
    
    if (!project) {return next(new Error("Can't find project"));}
    
    req.project = project;
    return next(); 
  }); 
});

module.exports = router;