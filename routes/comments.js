// modules
const 	express 		= require('express'),
		htmlSanitizer	= require('sanitize-html');

const 	router 		= express.Router({mergeParams:true}), // mergeParams so that we can use the app.js params
		Artgallery 	= require('../models/artgallery'),
		Comment 	= require('../models/comment');

//middleware
const 	middleware 	= require('../middleware');

let htmlSanitizerOptions = {
	allowedTags: [
		"address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4",
		"h5", "h6", "hgroup", "main", "nav", "section", "blockquote", "dd", "div",
		"dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
		"ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
		"em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
		"small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
		"col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr","img"
	],
	disallowedTagsMode: 'discard',
	allowedAttributes: {
		a: [ 'href', 'name', 'target' ],
		// We don't currently allow img itself by default, but this
		// would make sense if we did. You could add srcset here,
		// and if you do the URL is checked for safety
		img: [ 'src' ]
	},
	// Lots of these won't come up by default because we don't allow them
	selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
	// URL schemes we permit
	allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
	allowedSchemesByTag: {},
	allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
	allowProtocolRelative: true,
	enforceHtmlBoundary: false
}

// new -- create new comments
router.get('/new',middleware.isLoggedIn,(req, res)=>{
	Artgallery.findById(req.params.id,(err,foundartgallery)=>{
		if(err){
            console.log(err);
			req.flash("error", err.message);
		} else {
			res.render('comments/new',{artgallery_id:req.params.id,artgallery:foundartgallery});
		}
	})
	
});

// create -- create new comment
router.post('/',middleware.isLoggedIn, async (req,res)=>{
	try {
		let artgallery = await Artgallery.findById(req.params.id);
		let comment = await Comment.create(htmlSanitizer(req.body.comment,htmlSanitizerOptions));
		comment.author.id = req.user._id;
		comment.author.username = req.user.username;
		comment.author.fullName = req.user.fullName;
		comment.art.id = artgallery._id;
		comment.art.title = artgallery.title;
		comment.save();
		artgallery.comments.push(comment);
		artgallery.save();
		req.flash('success', 'Successfully added comment!')
		res.redirect('/artgallery/'+artgallery._id);
	}
	catch(err){
		console.log(err);
		req.flash('error',err.message);
		res.redirect('back');
	}
});


// edt -- edit comment
router.get('/:comment_id/edit',middleware.checkCommentOwnership,(req,res)=>{
	Comment.findById(req.params.comment_id,(err,foundComment)=>{
		if(err){
            console.log(err);
			req.flash("error", err.message);
			res.send('back')
		} else {
			res.render('comments/edit',{artgallery_id:req.params.id,comment:foundComment});
		}
	})
});

// update -- update comment
router.put('/:comment_id',middleware.checkCommentOwnership,(req,res)=>{
	Comment.findByIdAndUpdate(req.params.comment_id,htmlSanitizer(req.body.comment,htmlSanitizerOptions),(err)=>{
		if(err){
            console.log(err);
			req.flash("error", err.message);
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
            console.log(err);
			req.flash("error", err.message);
			redirect('back')
		} else {

			req.flash('success', 'Successfully deleted comment!')
			res.redirect('/artgallery/'+req.params.id);
		}
	})
});

module.exports = router;
