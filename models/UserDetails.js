var mongoose = require('mongoose');

var UserDetailsSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: String,
    email: String,
    profileImage: String
});

mongoose.model('UserDetail', UserDetailsSchema);