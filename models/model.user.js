var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
	displayName: String,
	providerId: String
})


module.exports = mongoose.model('User', UserSchema);