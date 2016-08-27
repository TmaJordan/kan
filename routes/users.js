var express = require('express');
var path = require('path');
var router = express.Router();
var multer  = require('multer');

var passport = require('passport');
var jwt = require('express-jwt');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Action = mongoose.model('Action');
var Task = mongoose.model('Task');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

//checks for list of common passwords
var checkPassword = require('../config/passwords');
var onboardingTasks = require('../config/onboardingTasks');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    console.log(req);
    cb(null, req.payload.username + '-' + file.originalname);
  }
})

/**
 * @api {get} /api/users Get all users
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiSuccess {Users[]} Users[] List of Users.
 */
router.get('/', auth, function(req, res, next) {
  User.find(function(err, users) {
    if (err) {return next(err);}
    
    users = users.map(function(user) {
      user.hash = undefined;
      user.salt = undefined;
      return user;
    });
    res.json(users);
  })
});

/**
 * @api {get} /api/users/:username Get user
 * @apiName GetUser
 * @apiGroup Users
 * 
 * @apiParam {username} username Username of User
 *
 * @apiSuccess {User} User
 */
router.get('/:username', auth, function(req, res, next) {
  res.json(req.user);
});

/**
 * @api {put} /api/users/:user Update user
 * @apiName UpdateUser
 * @apiGroup Users
 * 
 * @apiParam {user} user._id ID of User
 *
 * @apiSuccess {User} User
 */
router.put('/:user', auth, function(req, res, next) {
    for (var attrname in req.body) {
      if (req.user[attrname] != req.body[attrname]) {
        new Action({
          user: req.payload.username,
          action: attrname + "_UPDATED",
          actionDescription: req.user[attrname] + " -> " + req.body[attrname],
          target: req.user._id,
          targetType: 'User'
        }).save();

        req.user[attrname] = req.body[attrname];
      } 
    }
    
    req.user.save(function(err, user) {
        if (err) {return next(err);}
        
        res.json(user);
    });
});

/**
 * @api {delete} /api/users/:user Delete user
 * @apiName DeleteUser
 * @apiGroup Users
 * 
 * @apiParam {user} user._id ID of User
 *
 * @apiSuccess {User} User
 */
router.delete('/:user', auth, function(req, res, next) {
    req.user.remove(function(err) {
        if (err) {return next(err);}
        new Action({
          user: req.payload.username,
          action: "DELETE",
          actionDescription: "DELETE: " + req.user.title,
          target: req.user._id,
          targetType: 'User'
        }).save();
        res.json(req.user);
    });
});

/**
 * @api {post} /api/users/upload Upload image for profile pic
 * @apiName UploadProfilePic
 * @apiGroup Users
 * 
 * @apiParam {file} File image file uploaded with name 'file'
 *
 * @apiSuccess {File} File Returns file info
 */
router.post('/upload', auth, multer({storage: storage}).single('file'), function(req, res, next) {
    //console.log(req);
    console.log(req.body);
    console.log(req.file.filename);
    console.log(req.file.path);
    res.json(req.file);
});

/**
 * @api {post} /api/users/register Register new user
 * @apiName RegisterUser
 * @apiGroup Users
 * 
 * @apiParam {user} user New user to register
 *
 * @apiSuccess {JWT} JWT JSON Web Token used for further authentication
 */
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  if (!req.body.email) {
    return res.status(400).json({message: 'Please enter an email address'});
  }

  if (!req.body.email.endsWith(process.env.ORG_DOMAIN || '')) {
    return res.status(400).json({message: 'This version of Kan is locked down to: ' + process.env.ORG_DOMAIN});
  }

  if (checkPassword(req.body.password)) {
    return res.status(400).json({message: 'You should never choose this password, here or anywhere else.'});
  }

  if (req.body.password.length < 8) {
    return res.status(400).json({message: 'The password must be at least 8 characters long.'});
  }

  var user = new User();

  user.fullname = req.body.fullname;
  user.email = req.body.email;
  user.username = req.body.username;
  user.profileImage = 'https://github.com/identicons/' + req.body.username + '.png'
  user.setPassword(req.body.password);

  for (var i = 0; i < onboardingTasks.length; i++) {
    var task = new Task(onboardingTasks[i]);
    task.createdBy = req.body.username;
    task.assignee = req.body.username;
    task.dueDate = new Date();
    task.save();
  }

  user.save(function (err, user){
    if(err){ return next(err); }

    var token = user.generateJWT();
    console.log(token);
    mailer.sendVerifyMail(user);
    return res.json({token: token})
  });

  //Need to create onboarding tasks from template
});

/**
 * @api {get} /api/users/verify/:user Verify user
 * @apiName VerifyUser
 * @apiGroup Users
 * 
 * @apiParam {user} user._id User ID of User to verify
 *
 * @apiSuccess {Application} App Returns index.html of application
 */
router.get('/verify/:user', function(req, res, next) {
    new Action({
          user: req.user.username,
          action: "USER_VERIFIED",
          actionDescription: req.user.username + " verified",
          target: req.user._id,
          targetType: 'User'
        }).save(); 
    req.user.verified = true;
    req.user.save(function(err, user) {
        if (err) {return next(err);}
        
        res.sendFile(path.resolve(__dirname, '../public/index.html'));
    });
});

/**
 * @api {post} /api/users/login Login user
 * @apiName LoginUser
 * @apiGroup Users
 * 
 * @apiParam {user} user Username and Password for authentication
 *
 * @apiSuccess {JWT} JWT JSON Web Token used for further authentication
 */
router.post('/login', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  
  passport.authenticate('local', function(err, user, info) {
    if (err) {return next(err);}
    
    if (user) {
        var token = user.generateJWT();
        console.log(token);
        return res.json({token: token});
    }
    else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

/*Param method intercepts :user for above requests */
router.param('user', function (req, res, next, id) {
  var query = User.findById(id);
  
  query.exec(function(err, user) {
    if (err) {return next(err);}
    
    if (!user) {return next(new Error("Can't find user"));}
    
    req.user = user;
    return next(); 
  }); 
});

/*Param method intercepts :user for above requests */
router.param('username', function (req, res, next, username) {
  var query = User.findOne({username: username});
  
  query.exec(function(err, user) {
    if (err) {return next(err);}
    
    if (!user) {return next(new Error("Can't find user"));}
    
    req.user = user;
    return next(); 
  }); 
});

module.exports = router;