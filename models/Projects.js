var mongoose = require('mongoose');

var ProjectSchema = new mongoose.Schema({
    name: String,
    description: String,
    owner: String,
    dateCreated: {type: Date, default: Date.now},
    dueDate: Date,
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}]
});

mongoose.model('Project', ProjectSchema);