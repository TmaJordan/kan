var express = require('express');
var router = express.Router();

var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Action = mongoose.model('Action');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

/* Routes for projects */
router.get('/actions', auth, function(req, res, next) {
    Action.find(function(err, actions) {
        if (err) {return next(err);}
    
        res.json(actions);
    })
});

module.exports = router;