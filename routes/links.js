var express = require('express');
var http = require('http');
var router = express.Router();

var mongoose = require('mongoose');
var Link = mongoose.model('Link');

router.get('/:url', function(req, res) {
  res.json(req.link);
});

/*Param method intercepts :url for above requests and gets title & full url */
router.param('url', function (req, res, next, url) {
    console.log("Fetching URL: " + url);
    console.log("Protocol: " + url.substring(0, 4));
    if (url.substring(0, 4) !== "http") {
        url = "http://" + url;
    }
    http.get(url, function (response) {
        response.on('data', function (chunk) {
            var str=chunk.toString();
            var re = new RegExp("(<\s*title[^>]*>(.+?)<\s*/\s*title)\>!i", "g")
            var title = str.match(re);
            var link = new Link({
                title: title,
                link: url
            });

            req.link = link;
            return next();
        });
    });
});

module.exports = router;