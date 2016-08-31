var express = require('express');
var router = express.Router();

var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var Task = mongoose.model('Task');
var Action = mongoose.model('Action');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

/**
 * @api {get} /api/projects Get all projects
 * @apiName GetProjects
 * @apiGroup Projects
 *
 * @apiSuccess {Project[]} Projects[] List of Projects.
 */
router.get('/', auth, function(req, res, next) {
    Project.find().lean().exec(function(err, projects) {
        if (err) {return next(err);}
    
        //Add in high level stats for project
        for (var i = 0; i < projects.length; i++) {
            projects[i].completed = 0;
            projects[i].total = 0;
            projects[i].open = 0;
            projects[i].totalLoe = 0;
            for (var j = 0; j < projects[i].tasks.length; j++) {
                
                projects[i].total++;
                if (projects[i].tasks[j].completed) {
                    projects[i].completed++;
                }
                else {
                    projects[i].open++;
                    if (projects[i].tasks[j].status != "On Hold") {
                        projects[i].totalLoe += projects[i].tasks[j].loe;
                    }
                }
            }
            console.log(projects[i].total + ' Tasks in Project ' + i);
        }

        console.log(projects[0]);
        res.json(projects);
    })
});

/**
 * @api {post} /api/projects Create new project
 * @apiName CreateProject
 * @apiGroup Projects
 * 
 * @apiParam {project} project Project to create
 *
 * @apiSuccess {Project} Project Newly created project
 */
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

/**
 * @api {get} /api/projects/:project/export Export project to csv file
 * @apiName ExportProject
 * @apiGroup Projects
 * 
 * @apiParam {project} project._id ID of Project to export
 *
 * @apiSuccess {url} URL Link to exported project CSV file 
 */
router.get('/:project/export', auth, function(req, res, next) {
  console.log(req.project._id + " Export");
  
  res.send(process.env.SERVER_LOC + "export/" + "App Survey.csv");
});

/**
 * @api {get} /api/projects/:project Get project
 * @apiName GetProject
 * @apiGroup Projects
 * 
 * @apiParam {project} project._id ID of project
 *
 * @apiSuccess {Project} Project
 */
router.get('/:project', auth, function(req, res, next) {
    res.json(req.project);
});

/**
 * @api {put} /api/projects/:project Update project
 * @apiName UpdateProject
 * @apiGroup Projects
 * 
 * @apiParam {project} project._id ID of project
 * @apiParam {project} project Project with updated info
 *
 * @apiSuccess {Project} Project
 */
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

/**
 * @api {delete} /api/projects/:project Delete project
 * @apiName DeleteProject
 * @apiGroup Projects
 * 
 * @apiParam {project} project._id ID of project
 *
 * @apiSuccess {Project} Project
 */
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