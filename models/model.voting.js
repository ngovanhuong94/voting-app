var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PollSchema = new Schema({
 title: {type: String, required: true},
 created: {
 	type: Schema.ObjectId,
 	ref: 'User'
 },
 chooses: [
  {
  	text: {type: String, required: true},
  	voted: {type: Number, default: 0},
  	votedBy: [{ipAddress: String}]
  }
 ]  
})


module.exports = mongoose.model('Poll', PollSchema);
