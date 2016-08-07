var mongoose = require('mongoose');

var ActionSchema = new mongoose.Schema({
    user: String,
    action: String,
    actionDescription: String,
    actionDate: {type: Date, default: Date.now},
    target: mongoose.Schema.Types.ObjectId,
    targetType: String,
    extraInfo: String
});

mongoose.model('Action', ActionSchema);