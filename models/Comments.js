var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    body: String,
    author: String,
    dateCreated: {type: Date, default: Date.now},
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
});

mongoose.model('Comment', CommentSchema);