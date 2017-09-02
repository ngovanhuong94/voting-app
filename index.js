var express = require('express');
var engine = require('ejs-mate');
require('dotenv').config();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var passport = require('passport');
var mongoose = require('mongoose')
var app = express();

//set up ejs-mate for have  function in ejs layout()
app.engine('ejs', engine);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

require('./config/database');

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
  secret: 'thisismysecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection})
}))

app.use(cookieParser())
app.use(flash())
app.use(passport.initialize())
app.use(passport.session());

require('./config/passport/auth-facebook');
app.use('/', require('./routes/router.index'));



app.listen(process.env.PORT || 3000, () => console.log('Server is running'));