const   parseUrl  = require('parse-url');

const	Artgallery 	= require('../models/artgallery'),
		Comment 	= require('../models/comment');

const middlewareObj = {};

middlewareObj.parseReturnUrl = function(req, res,next){
	console.log('middleware - parseReturnUrl');
	if(!req.session.returnTo) {
		req.session.returnTo = parseUrl(req.headers.referer).pathname;
		console.log('parseReturnUrl change returnTo ',req.session.returnTo)
	}
	next()
}

middlewareObj.isLoggedIn = function(req, res, next){
	console.log('middleware - isLoggedIn');
	if(req.isAuthenticated()) {
		return next();
	}
	req.session.returnTo = req.originalUrl;
	console.log('isLoggedIn: our returnTo ',req.session.returnTo)
	req.flash('error','You need to be login First!');
	res.redirect('/login')
}

middlewareObj.checkArtgalleryOwnership = function(req, res, next){
	if(req.isAuthenticated()) {
		Artgallery.findById(req.params.id, (err, foundArtgallery)=>{
			if(err){
				req.flash("error", err.message);
            	console.log(err);
				res.redirect('/Artgallerys');
			} else {
				if(foundArtgallery.author.id.equals(req.user._id)){
					next();
				} else {
					req.flash('error', 'You dont have permission to do that');
					res.redirect('back')
				}
			}
		});
	} else {
		req.flash('error', 'You need to be login..');
		res.redirect('back');
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment)=>{
			if(err){
				req.flash("error", err.message);
            	console.log(err);
				res.redirect('back');
			} else {
				if(foundComment.author.id.equals(req.user._id)){
					next();
				} else {
					req.flash('error', 'You dont have permission to do that');
					res.redirect('back')
				}
			}
		});
	} else {
		req.flash('error', 'You need to be login..');
		res.redirect('back');
	}
}


module.exports = middlewareObj;