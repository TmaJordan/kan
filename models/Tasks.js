var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    completed: {type: Boolean, default: false},
    dateCreated: {type: Date, default: Date.now},
    timeStarted: Date,
    type: String,
    dependency: {type: mongoose.Schema.Types.ObjectId, ref: 'Task'},
    loe: {type: Number, default: 0},
    dueDate: Date,
    assignee: String,
    createdBy: String,
    links: [{type: mongoose.Schema.Types.ObjectId, ref: 'Link'}],
    priority: String,
    status: String,
    project: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
    difficulty: String
});

mongoose.model('Task', TaskSchema);