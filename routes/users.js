var express = require('express');
var router = express.Router();

var passport = require('passport');
var jwt = require('express-jwt');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Action = mongoose.model('Action');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

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

//Login and register functions left with no auth intentionally
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;
  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    var token = user.generateJWT();
    console.log(token);
    return res.json({token: token})
  });
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

module.exports = router;