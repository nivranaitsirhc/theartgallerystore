// modules
const	express		= require('express'),
		mongoose 	= require('mongoose'),
		request		= require('request'),
		cloudinary 	= require('cloudinary').v2,
		streamifier = require('streamifier'),
		multer		= require('multer'),
		moment		= require('moment');

const 	router 		= express.Router(),
		Artgallery	= require('../models/artgallery');
		
//middlewares
const 	middleware 	= require('../middleware');

const 	artGalleryStatusList	= require('../utils/artGalleryStatusList'),
		artGalleryType			= require('../utils/artGalleryType');


let storage = multer.diskStorage({
	filename: function(req,file,cb){
		cb(null,`${moment(Date.now()).format('YYYY-MM-DD_HH:MM:SS')}_${file.originalname}`);
	}
});

let imageFilter = function(req,file,cb){
	if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed'), false);
	}
	cb(null,true);
}

let upload = multer({storage:storage,fileFilter:imageFilter});


cloudinary.config({
	cloud_name: process.env.CLOUDINARY_cloudname,
	api_key: process.env.CLOUDINARY_api_key,
	api_secret: process.env.CLOUDINARY_api_secret
});



// index -- Display a list of artgallerys
router.get('/', async (req,res)=>{
	try {
		if(req.query.search){
			const regex = new RegExp(escapeRegex(req.query.search), 'gi');
			let allartgallery = await Artgallery.find({"title":regex}).sort('-modified');
			let queryNullMatch = allartgallery.length > 1 ? "" : req.query.search;
		res.render("artgallery/index",{
			artgallery 		: allartgallery,
			page 			: 'artgallery',
			msg_success		: `Found ${allartgallery.length} matching title(s)..`,
			emptyQueryMsg 	: queryNullMatch
		});
		} else {
			let allartgallery = await Artgallery.find().sort('-modified');
			res.render("artgallery/index",{
				page 		: 'artgallery',
				artgallery 	: allartgallery
			});
		}
	}
	catch(err){
		console.log(err);
		res.render('artgallery/index',{err_msg:err.message});
	}
});

// new -- Display a form to add new artgallerys
router.get('/new',middleware.isLoggedIn,(req,res)=>{
	res.render("artgallery/new",{
		page 		: 'artCreate',
		statusList 	: artGalleryStatusList,
		artType 	: artGalleryType
	});
});

// create -- Add new  artgallery to DB
router.post('/', middleware.isLoggedIn,upload.single('imageUpload'), async (req,res)=>{
	try {
		let uI = await cloudinary.uploader.upload(req.file.path,
			{
				use_filename	:true,
				folder 			: `artgallery/post/${req.user.username}/${req.body.title}`,
				tags 			: [
					'post',
					`${req.user.username}`,
					`${req.body.title}`
				],
				quality : "auto:best"
			}
		);
		uI.thumb_url = await cloudinary.url(uI.public_id,{secure:true,crop:"thumb"});
		let artType = JSON.parse(req.body.artType);
		if(artType.index === 3){
			artType.name = req.body.artTypeOthers;
		}
		let newartgallery = {
			title 		: req.body.title,
			price 		: req.body.price,
			image 		: uI,
			status 		: JSON.parse(req.body.status),
			artType 	: artType,
			description : req.body.description,
			author 		: {
				id 			: req.user._id,
				username 	: req.user.username,
				fullName 	: req.user.fullName
			}
		};
		let newlyCreated = await Artgallery.create(newartgallery);
		req.flash('success',`Added ${newlyCreated.title}`);
		res.redirect(`/artgallery/${newlyCreated._id}`);
	}
	catch(err){
		console.log(err)
		req.flash('error',err.message);
		res.redirect('back');
	}
});



// show -- Show more info about artgallery
router.get('/:id',(req, res)=>{
	Artgallery.findById(req.params.id).populate("comments")
	.then((foundartgallery)=>{
		res.render('artgallery/show',{artgallery:foundartgallery});
	})
	.catch((err)=>{
		console.log(err)
		req.flash('error',err.message);
		res.redirect('/artgallery');
	});
});


// Edit -- edit artgallery
router.get('/:id/edit', middleware.checkArtgalleryOwnership,(req,res)=>{
	Artgallery.findById(req.params.id)
	.then((foundartgallery)=>{
		res.render('artgallery/edit',{
			page 		: 'artEdit',
			artgallery 	: foundartgallery,
			statusList 	: artGalleryStatusList,
			artType 	: artGalleryType
		});
	})
	.catch((err)=>{
		console.log(err);
		req.flash('error',err.message);
		redirect('/artgallery/'+req.parms.id)
	});
});

// // Update -- update artgallery
router.put('/:id',middleware.checkArtgalleryOwnership,upload.single('imageUpload'), async (req,res)=>{
	try {
		let foundartgallery = await Artgallery.findById(req.params.id);
		if(req.file){
			if(foundartgallery.image.public_id){
				await cloudinary.uploader.destroy(foundartgallery.image.public_id);
			}
			foundartgallery.image = await cloudinary.uploader.upload(req.file.path,
				{
					use_filename	:true,
					folder 			: `artgallery/post/${req.user.username}/${req.body.title}`,
					tags 			: [
						'post',
						`${req.user.username}`,
						`${req.body.title}`
					],
					quality : "auto:best"
				}
			);
			foundartgallery.image.thumb_url = await cloudinary.url(foundartgallery.image.public_id,{secure:true,crop:"thumb"});
		}

		let artType = JSON.parse(req.body.artType);
		if(artType.index === 3){
			artType.name = req.body.artTypeOthers;
		}
		foundartgallery.title 			= req.body.title;
		foundartgallery.price 			= req.body.price;
		foundartgallery.status 			= JSON.parse(req.body.status);
		foundartgallery.artType 		= artType;
		foundartgallery.description 	= req.body.description;
		foundartgallery.author.id 		= req.user._id;
		foundartgallery.author.username = req.user.username;
		foundartgallery.author.fullName = req.user.fullName;
		foundartgallery.save();
		req.flash('success', `Updated ${foundartgallery.title}`);
		res.redirect(`/artgallery/${req.params.id}`);
	}
	catch(err){
		console.log(err);
		req.flash('error',err.message);
		res.redirect('back');
	}
});

// // destroy -- artgallery
router.delete('/:id',middleware.checkArtgalleryOwnership, async (req,res)=>{
	try {
		let deleteartgallery = await Artgallery.findById(req.params.id);
		if(deleteartgallery.image.public_id) {
			await cloudinary.uploader.destroy(deleteartgallery.image.public_id);
		}
		deleteartgallery.remove();
		req.flash('success',`You have successfully deleted ${deleteartgallery.title}`);
		res.redirect('/artgallery');
	}
	catch(err){
		console.log(err);
		req.flash('error',err.message);
		res.redirect('back')
	};
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;