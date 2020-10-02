const   parseUrl  = require('parse-url');

const	Artgallery 	= require('../models/artgallery'),
		Comment 	= require('../models/comment');

const middlewareObj = {};


middlewareObj.isLoggedIn = async (req, res, next) => {
	try {
		if(req.isAuthenticated()) {
			return next();
		}
		req.session.returnTo = req.originalUrl;
		req.flash('error','You need to be login First!');
		res.redirect('/login')
	}
	catch(e){
		console.log(e);
		req.flash('error',e.message);
		res.redirect('back');
	}
}

middlewareObj.checkArtgalleryOwnership = async (req, res, next) => {
	try {
		if(req.isAuthenticated()){
			let foundArtgallery = await Artgallery.findById(req.params.id);
			if(foundArtgallery.author.id.equals(req.user._id)){
				next();
			} else {
				req.flash('error', 'You dont have permission to do that');
				res.redirect('back')
			}
		} else {
			req.flash('error', 'You need to be login..');
			res.redirect('back');
		}
	}
	catch(e){
		console.log(e);
		req.flash('error',e.message);
		res.redirect('back');
	}
}

middlewareObj.checkCommentOwnership = async (req, res, next) => {
	try {
		if(req.isAuthenticated()) {
			let foundComment = await Comment.findById(req.params.comment_id);
			if(foundComment.author.id.equals(req.user._id)){
				next();
			} else {
				req.flash('error', 'You dont have permission to do that');
				res.redirect('back')
			}
		} else {
			req.flash('error', 'You need to be login..');
			res.redirect('back');
		}
	}
	catch(e){
		console.log(e);
		req.flash('error',e.message);
		res.redirect('back');
	}
}


module.exports = middlewareObj;