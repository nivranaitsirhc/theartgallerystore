// modules
const 	express 	= require('express'),
        passport 	= require('passport');


const 	router		 = express.Router(),
        User	     = require('../models/user');

//middleware
const   middleware = require('../middleware');



//Account
router.get('/:id',(req,res)=>{
	User.findById(req.params.id)
	.then(foundUser=>{
		console.log(foundUser);
		res.render('./account/show',{user:foundUser});
	})
	.catch(err=>{
		console.log(err)
		req.flash('error',err.message)
		res.redirect('/artgallery');
	})
});

module.exports = router;