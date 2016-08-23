var express = require('express');
var router = express.Router();
var multer  = require('multer');

var passport = require('passport');
var jwt = require('express-jwt');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Action = mongoose.model('Action');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

//checks for list of common passwords
var checkPassword = require('../config/passwords');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    console.log(req);
    cb(null, req.payload.username + '-' + file.originalname);
  }
})

//User Routes
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

router.get('/:username', auth, function(req, res, next) {
  res.json(req.user);
});

router.put('/:user', auth, function(req, res, next) {
    console.log('file info: ', JSON.stringify(req.files));

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

router.post('/upload', auth, multer({storage: storage}).single('file'), function(req, res, next) {
    //console.log(req);
    console.log(req.body);
    console.log(req.file.filename);
    console.log(req.file.path);
    res.json(req.file);
});

//Login and register functions left with no auth intentionally
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
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
  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    var token = user.generateJWT();
    console.log(token);
    return res.json({token: token})
  });

  //Need to create onboarding tasks from template
});

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
  var query = User.find({username: username});
  
  query.exec(function(err, user) {
    if (err) {return next(err);}
    
    if (!user) {return next(new Error("Can't find user"));}
    
    req.user = user;
    return next(); 
  }); 
});

module.exports = router;