var mongoose = require('mongoose');

var LinkSchema = new mongoose.Schema({
    title: String,
    link: String
});

mongoose.model('Link', LinkSchema);