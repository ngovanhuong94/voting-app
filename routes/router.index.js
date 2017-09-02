var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Poll = require('../models/model.voting');
var User = require('../models/model.user');

function checkUserLogin (req,res,next){
  if(req.isAuthenticated()){
    next()
  } else {
    res.redirect('/')
  }
}

function checkIpInVoted(ipAddress, chooses){
  for(var i =0; i < chooses.length; i++){
  	for(var j =0; j < chooses[i].votedBy.length; j++){
  		if(chooses[i].votedBy[j].ipAddress == ipAddress){
           return true;
  	   }
  	}
  }
  return false;
}


router.get('/', async (req,res) => {
	var polls = await Poll.find({}).exec();
	res.render('index',
       {
       	displayName: req.user ? req.user.displayName : '',
       	polls: polls
       }
		);
})


router.get('/polls/:id', async (req,res) => {

	var id = req.params.id;

	var poll = await Poll.findOne({_id: id}).populate('created').exec();
  
   var pollUserProviderId =  poll.created ? poll.created.providerId : 10011121;
   var reqUserProviderId = req.user ? req.user.providerId : 00000;
   var isAuthor = pollUserProviderId== reqUserProviderId ? true : false;
  
  res.render('view-one', {
		displayName: req.user ? req.user.displayName : '',
		poll: poll,
		message: req.flash('message'),
		pollJSON: JSON.stringify(poll),
    isAuthor: isAuthor
	})
})

router.post('/polls/:id/votechoose', function(req,res,next){
  var choose = req.body.choose;
  Poll.findOne({_id: req.params.id}, function(err, poll){
  	if(err) throw err;
  	var chooses = poll.chooses;
  	var ipAddress = req.headers['x-forwarded-for']||req.connection.remoteAddress ||req.socket.remoteAddress ||req.connection.socket.remoteAddress;
    var checkIp = checkIpInVoted(ipAddress, chooses);
  	console.log(checkIp)
  	if(checkIp){
  	  req.flash('message', 'You was voted');
  	  res.redirect('/polls/'+req.params.id);	

  	} else {


    
    var index = 0;
    for(var i =0; i< chooses.length; i++){
    	if(chooses[i].text == choose) {
    		index = i;
    		break;
    	}
    }

    chooses[index].voted++;
    
    chooses[index].votedBy.push({ipAddress: ipAddress});
    poll.chooses = chooses;
    poll.save(function(err){
    	if(err) throw err;
    	res.redirect('/polls/'+req.params.id);
    })

   }
  })
})

router.get('/polls/:id/delete', checkUserLogin, async function(req,res,next){
 
 var poll = await Poll.findOne({_id: req.params.id}).populate('created').exec();
  var pollUserProviderId =  poll.created ? poll.created.providerId : 10011121;
  if(pollUserProviderId == req.user.providerId){

   poll.remove(function(err){
    if(err) throw err;
    console.log('delete a poll');
    res.redirect('/mypoll');
   })



  } else {
    res.redirect('/mypoll');
  }


})

router.post('/polls/:id/addchoose',function(req,res,next){
  var newChoose = req.body.newChoose;

  Poll.findOne({_id: req.params.id}, function(err, poll){
  	if(err) throw err;
  	var chooses = poll.chooses;
  	var ipAddress = req.headers['x-forwarded-for']||req.connection.remoteAddress ||req.socket.remoteAddress ||req.connection.socket.remoteAddress;
    
    var checkIp = checkIpInVoted(ipAddress, chooses);
  	console.log(checkIp)
  	if(checkIp){
  	  req.flash('message', 'You was voted');
  	  res.redirect('/polls/'+req.params.id);	

  	} else {



  	chooses.push({
  		text: newChoose,
  		voted: 1,
  		votedBy: [{ipAddress: ipAddress}]
  	})
  	poll.chooses = chooses;
  	poll.save(function(err){
  		if(err) throw err;
  		res.redirect('/polls/'+req.params.id);
  	})

   }

  })
})


router.get('/addnew', checkUserLogin,function(req,res,next){
 res.render('add-new', {
 	displayName: req.user ? req.user.displayName : ''
 })
})


router.post('/addnew',checkUserLogin,function(req,res,next){
	var title = req.body.title;
	var chooses = req.body.chooses.split(',');
    var pollChoose = [];
	for(var i =0; i < chooses.length; i++){
         pollChoose.push({
         	text: chooses[i],
         	voted: 0,
         	votedBy: []
         })
	}

	var newPoll = new Poll({
		title: title,
		chooses: pollChoose,
		created: req.user
	})

	newPoll.save(function(err){
		if(err) throw err;
		res.redirect('/');
	})
})


router.get('/mypoll',checkUserLogin, (req,res,next) => {

   Poll.find({created: req.user}, function(err,polls){
     if(err) throw err;
   	 res.render('mypoll', {
   	 	polls: polls,
   	 	displayName: req.user ? req.user.displayName : ''
   	 })
   })

})



router.get('/error', (req,res) => {
	res.send('Error auth with facebook');
})

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
	successRedirect: '/',
	failureRedirect: '/error'
}));

router.get('/logout', (req,res) => {
	req.logout();
	res.redirect('/');
})

module.exports = router;


