// modules
const 	express 		= require('express'),
		htmlSanitizer	= require('sanitize-html');

const 	router 			= express.Router({mergeParams:true}), // mergeParams so that we can use the app.js params
		Artgallery 		= require('../models/artwork'),
		Comment 		= require('../models/comment');

//middleware
const 	middleware 		= require('../middleware');

//utilities
const 	htmlSanitizerOptions 	= require('../utils/htmlSanitizerOptions');

// new -- create new comments
router.get('/new',middleware.isLoggedIn, async (req, res)=>{
	try {
		let artgallery = await Artgallery.findOne({slug:req.params.slug});
		res.render('comments/new',{
			page 	: {
				name 		: 'newcoment',
				title 		: `Add comment to ${artgallery.title}`,
				description : `Write something beautiful about ${artgallery.title}`
			},
			artgallery
		});
	}
	catch(e){
		console.log(e);
		req.flash("error", e.message);
	}
});

// create -- create new comment
router.post('/new',middleware.isLoggedIn, async (req,res)=>{
	try {
		req.body.comment.text = (htmlSanitizer(req.body.comment.text,htmlSanitizerOptions));

		let artgallery = await Artgallery.findOne({slug:req.params.slug});
		let comment = await Comment.create(req.body.comment);

		comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		comment.author.fullName = req.user.fullName;
		comment.art.id = artgallery._id;
		comment.art.title = artgallery.title;
		comment.save();
		artgallery.comments.push(comment);
		artgallery = await Artgallery.findByIdAndUpdate(artgallery._id,artgallery);
		req.flash('success', 'Successfully added comment!')
		res.redirect(`/artgallery/${artgallery.slug}`);
	}
	catch(e){
		console.log(e);
		req.flash('error',e.message);
		res.redirect('back');
	}
});


// edt -- edit comment
router.get('/:comment_id/edit',middleware.checkCommentOwnership, async (req,res)=>{
	try {
		let comment = await Comment.findById(req.params.comment_id);
		res.render('comments/edit',{
			page 	: {
				name 		: 'editcomment',
				title 		: `Edit comment on ${comment.art.title}`,
				description : `Write something more heartful about ${comment.art.title}`
			},
			comment,
			artgallery_slug:req.params.slug
		});
	}
	catch(e){
		console.log(e);
		req.flash("error", e.message);
		res.send('back')
	}
});

// update -- update comment
router.put('/:comment_id',middleware.checkCommentOwnership, async (req,res)=>{
	try {
		req.body.comment.text = (htmlSanitizer(req.body.comment.text,htmlSanitizerOptions));
		await Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment);
		req.flash('success', 'Successfully updated comment!')
		res.redirect(`/artgallery/${req.params.slug}`);
	}
	catch(e){
		console.log(e);
		req.flash("error", e.message);
		res.redirect('back');
	}
});

// destroy -- delete comment
router.delete('/:comment_id',middleware.checkCommentOwnership,async (req,res)=>{
	try {
		await Comment.findByIdAndRemove(req.params.comment_id)
		req.flash('success', 'Successfully deleted comment!')
		res.redirect(`/artgallery/${req.params.slug}`);
	}
	catch(e){
		console.log(e);
		req.flash("error", e.message);
		redirect('back')
	}
});

module.exports = router;
