// modules
const 	express 	= require('express');

const 	router 		= express.Router({mergeParams:true}), // mergeParams so that we can use the app.js params
		Artgallery 	= require('../models/artgallery'),
		Comment 	= require('../models/comment');

//middleware
const 	middleware 	= require('../middleware');



// new -- create new comments
router.get('/new',middleware.isLoggedIn,(req, res)=>{
	Artgallery.findById(req.params.id,(err,foundartgallery)=>{
		if(err){
			req.flash("error", err.message);
            console.log(err);
		} else {
			res.render('comments/new',{artgallery_id:req.params.id,artgallery:foundartgallery});
		}
	})
	
});

// create -- create new comment
router.post('/',middleware.isLoggedIn,(req,res)=>{
	// lookup artgallery using ID
	Artgallery.findById(req.params.id, (err, artgallery)=>{
		if(err){
			req.flash("error", err.message);
            console.log(err);
			res.redirect('/artgallery');
		} else {
			Comment.create(req.body.comment, (err, comment)=>{
				if(err){
					console.log(err)
				} else {
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.art.id = artgallery._id;
					comment.art.title = artgallery.title;
					comment.save();
					//
					artgallery.comments.push(comment);
					artgallery.save();

					req.flash('success', 'Successfully added comment!')
					res.redirect('/artgallery/'+artgallery._id);
				}
			})
		}
	});
});


// edt -- edit comment
router.get('/:comment_id/edit',middleware.checkCommentOwnership,(req,res)=>{
	Comment.findById(req.params.comment_id,(err,foundComment)=>{
		if(err){
			req.flash("error", err.message);
            console.log(err);
			res.send('back')
		} else {
			res.render('comments/edit',{artgallery_id:req.params.id,comment:foundComment});
		}
	})
});

// update -- update comment
router.put('/:comment_id',middleware.checkCommentOwnership,(req,res)=>{
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,(err)=>{
		if(err){
			req.flash("error", err.message);
            console.log(err);
			res.redirect('back');
		} else {

			req.flash('success', 'Successfully updated comment!')
			res.redirect('/artgallery/'+req.params.id);
		}
	});
});

// destroy -- delete comment
router.delete('/:comment_id',middleware.checkCommentOwnership,(req,res)=>{
	Comment.findByIdAndRemove(req.params.comment_id,(err)=>{
		if(err){
			req.flash("error", err.message);
            console.log(err);
			redirect('back')
		} else {

			req.flash('success', 'Successfully deleted comment!')
			res.redirect('/artgallery/'+req.params.id);
		}
	})
});

module.exports = router;
