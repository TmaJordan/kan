var express = require('express');
var router = express.Router();

var passport = require('passport');
var jwt = require('express-jwt');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

//User Routes
router.get('/', auth, function(req, res, next) {
  User.find(function(err, users) {
    if (err) {return next(err);}
    
    res.json(users);
  })
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

module.exports = router;