var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Poll = require('../models/model.voting');




router.get('/', function(req,res,next){
  Poll.find({}, function(err, polls){
  	res.json(polls)
  })
  
})

router.get('/:id', function(req,res,next){
	var id = req.params.id;

	Poll.findOne({_id: id}, function(err, poll){
		res.json(poll)
	})
})

router.post('/addnewpoll',function(req,res,next){
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
		res.json(newPoll)
	})
})


router.post('/:id/votechoose', function(req,res,next){
  var choose = req.body.choose;
  Poll.findOne({_id: req.params.id}, function(err, poll){
  	if(err) throw err;
    var chooses = poll.chooses;
    var index = 0;
    for(var i =0; i< chooses.length; i++){
    	if(chooses[i].text == choose) {
    		index = i;
    		break;
    	}
    }

    chooses[index].voted++;
    var ipAddress = req.headers['x-forwarded-for']||req.connection.remoteAddress ||req.socket.remoteAddress ||req.connection.socket.remoteAddress;
    chooses[index].votedBy.push({ipAddress: ipAddress});
    poll.chooses = chooses;
    poll.save(function(err){
    	if(err) throw err;
    	res.json(poll)
    })
  })

})

module.exports = router;
