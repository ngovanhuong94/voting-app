var mongoose = require('mongoose');

mongoose.Promise  = global.Promise;
mongoose.connect('mongodb://huong:123456@ds123084.mlab.com:23084/voting-app-freecc');

