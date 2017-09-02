var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../../models/model.user');

passport.serializeUser(function(user, done){
	done(null, user._id)
})

passport.deserializeUser(function(id,done){
	User.findOne({_id: id}, function(err, user){
		done(err,user);
	})
})

passport.use(new FacebookStrategy({
    clientID: 1827699127243530,
    clientSecret: "227d0d881735ba7358f1c4add9d660af",
    callbackURL: "https://voting-app-free.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
     
     
     var providerId = profile.id;
     var displayName = profile.displayName;
     
     User.findOne({providerId: providerId}, (err, user) => {
       
       if(err) done(err);

       if(user) {
       	 done(null, user);
       }
       if(!user){
          var newUser = new User({
          	 providerId: providerId,
          	 displayName: displayName
          });

          newUser.save(function(err){
          	if(err) throw err;

          	done(null, newUser);
          })
       }
     })
  }
));
