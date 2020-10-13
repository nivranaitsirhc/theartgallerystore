//modules
const	express			= require('express'),
		htmlSanitizer	= require('sanitize-html'),
		mongoose 		= require('mongoose'),
		request			= require('request'),
		cloudinary 		= require('cloudinary').v2,
		streamifier 	= require('streamifier'),
		multer			= require('multer'),
		moment			= require('moment');

//models
const 	router 		= express.Router(),
		Artwork	= require('../models/artwork');
		
//middlewares
const 	middleware 	= require('../middleware');

const 	artGalleryStatusList	= require('../utils/artGalleryStatusList'),
		artGalleryType			= require('../utils/artGalleryType'),
		htmlSanitizerOptions 	= require('../utils/htmlSanitizerOptions');


let storage = multer.diskStorage({
	filename: function(req,file,cb){
		cb(null,`${moment(Date.now()).format('YYYY-MM-DD_HH-MM-SS')}_${file.originalname}`);
	}
});
let fileFilter = function(req,file,cb){
	if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed'), false);
	}
	cb(null,true);
}
let upload = multer({storage,fileFilter});


cloudinary.config({
	cloud_name 	: process.env.CLOUDINARY_cloudname,
	api_key 	: process.env.CLOUDINARY_api_key,
	api_secret 	: process.env.CLOUDINARY_api_secret
});



// index -- Display a list of artgallerys
router.get('/', async (req,res)=>{
	try {
		if(req.query.search){
			const regex = new RegExp(escapeRegex(req.query.search), 'gi');
			let artgallery = await Artwork.find({"title":regex}).sort('-modified');
			let queryNullMatch = artgallery.length > 1 ? "" : req.query.search;
		res.render("artgallery/index",{
			page 			: {
				name 		: 'artgallery',
				title 		: 'Search Art Gallery',
				description : 'Find the one that calm\' the soul.'
			},
			artgallery,
			msg_success		: `Found ${artgallery.length} matching title(s)..`,
			emptyQueryMsg 	: queryNullMatch
		});
		} else {
			let artgallery = await Artwork.find({}).sort('-modified');
			res.render("artgallery/index",{
				page 		: {
					name 		: 'artgallery',
					title 		: 'Art Gallery',
					description : 'Enjoy! the best of the best Artwork out there.'
				},
				artgallery 
			});
		}
	}
	catch(e){
		console.log(e);
		res.render('artgallery/index',{
			page 	: 'artgallery',
			err_msg : e.message
		});
	}
});

// new -- Display a form to add new artgallerys
router.get('/new',middleware.isLoggedIn,(req,res)=>{
	res.render("artgallery/new",{
		page 		: {
			name 		: 'artCreate',
			title 		: 'New Artwork',
			description : 'Upload the finest creation made with love and soul.'
		},
		statusList 	: artGalleryStatusList,
		artType 	: artGalleryType
	});
});

// create -- Add new  artgallery to DB
router.post('/new', middleware.isLoggedIn,upload.single('imageUpload'), async (req,res)=>{
	try {
		let artType = JSON.parse(req.body.artType);

		if(artType.index === 3){
			artType.name = req.body.artTypeOtherName;
		}
		let newartgallery = {
			title 		: req.body.title,
			price 		: req.body.price,
			status 		: JSON.parse(req.body.status),
			artType 	: artType,
			image 		: {},
			description : htmlSanitizer(req.body.description,htmlSanitizerOptions),
			author 		: {
				id 			: req.user._id,
				username 	: req.user.username,
				fullName 	: req.user.fullName
			}
		};
		let imgPath;
		switch (req.body.selectUploadType) {
			case 'upload':
				imgPath = req.file.path;
				break;
			case 'url' :
				imgPath = req.body.imageUrl;
				break;
			default:
				throw {message:`unhandled error, unrecognized selectUploadType ${req.body.selectUploadType}`};
		}
		newartgallery.image = await cloudinary.uploader.upload(imgPath,
			{
				use_filename	:true,
				folder 			: `artgallery/post/${req.user.username}/${req.body.title}`,
				tags 			: [
					'post',
					`${req.user.username}`,
					`${req.body.title}`
				],
				quality : "auto:good"
			}
		);
		newartgallery.image.uploadType 		= req.body.imageType;
		newartgallery.image.thumb_url 		= await cloudinary.url(newartgallery.image.public_id,{secure:true,crop:'thumb',quality:30});
		newartgallery.image.placeholder_url = await cloudinary.url(newartgallery.image.public_id,{secure:true,effect:{blur:1000},quality:10});
		let newlyCreated = await Artwork.create(newartgallery);
		req.flash('success',`Added ${newlyCreated.title}`);
		res.redirect(`/artgallery/${newlyCreated.slug}`);
	}
	catch(e){
		console.log(e)
		req.flash('error',e.message);
		res.redirect('back');
	}
});



// show -- Show more info about artgallery
router.get('/:slug', async (req, res)=>{
	try {
		let artgallery = await Artwork.findOne({slug:req.params.slug}).populate('comments');//.populate({path: "comments",options:{sort: {'modified': -1}}}) //|| await Artwork.findById(req.params.id).populate("comments")
			res.render('artgallery/show',{
				page 		: {
					name 		: 'artwork',
					title 		: artgallery.title,
					description : `${artgallery.title} - ${artgallery.description.substring(0,135)}`
				},
				artgallery
			});
	}
	catch(e){
		console.log(e)
		req.flash('error',e.message);
		res.redirect('/artgallery');
	}
});


// Edit -- edit artgallery
router.get('/:slug/edit', middleware.checkArtgalleryOwnership, async (req,res)=>{
	try {
		let artgallery = await Artwork.findOne({slug:req.params.slug})//||await Artwork.findById(req.params.id)
		res.render('artgallery/edit',{
			page 		: {
				name 		: 'artEdit',
				title 		: artgallery.title,
				description : `Edit your creation - ${artgallery.title}`
			},
			artgallery,
			statusList 	: artGalleryStatusList,
			artType 	: artGalleryType
		});
	}
	catch(e){
		console.log(e);
		req.flash('error',e.message);
		redirect(`/artgallery/${req.parms.slug}`)
	};
});

// // Update -- update artgallery
router.put('/:slug',middleware.checkArtgalleryOwnership,upload.single('imageUpload'), async (req,res)=>{
	try {
		let artwork = await Artwork.findOne({slug:req.params.slug});//||await Artwork.findById(req.params.id);

		if(req.body.selectUploadType !== 'none'){
			let imgPath;
			switch (req.body.selectUploadType) {
				case 'upload':
					imgPath = req.file.path;
					break;
				case 'url' :
					imgPath = req.body.imageUrl;
					break;
				default:
					throw {message:`unhandled error, unrecognized selectUploadType ${req.body.selectUploadType}`};
			}


			if(artwork.image.public_id){
				await cloudinary.uploader.destroy(artwork.image.public_id,{invalidate:true});
			}
			artwork.image = await cloudinary.uploader.upload(imgPath,
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
			artwork.image.uploadType 		= req.body.imageType;
			artwork.image.thumb_url 		= await cloudinary.url(artwork.image.public_id,{secure:true,crop:'thumb',quality:30});
			artwork.image.placeholder_url 	= await cloudinary.url(artwork.image.public_id,{secure:true,effect:{blur:1000},quality:10});
		}

		let artType = JSON.parse(req.body.artType);
		if(artType.index === 3){
			artType.name = req.body.artTypeOtherName;
		}
		artwork.title 			= req.body.title;
		artwork.price 			= req.body.price;
		artwork.status 			= JSON.parse(req.body.status);
		artwork.artType 		= artType;
		artwork.description 	= htmlSanitizer(req.body.description,htmlSanitizerOptions);
		artwork.author.id 		= req.user._id;
		artwork.author.username = req.user.username;
		artwork.author.fullName = req.user.fullName;

		artwork = await Artwork.findByIdAndUpdate(artwork._id,artwork);
		req.flash('success', `Updated ${artwork.title}`);
		res.redirect(`/artgallery/${artwork.slug}`);
	}
	catch(e){
		console.log(e);
		req.flash('error',e.message);
		res.redirect('back');
	}
});

// // destroy -- artgallery
router.delete('/:slug',middleware.checkArtgalleryOwnership, async (req,res)=>{
	try {
		let deleteartgallery =  await Artwork.findOne({slug:req.params.slug});//|| await Artwork.findById(req.params.id);
		if(deleteartgallery.image.public_id) {
			await cloudinary.uploader.destroy(deleteartgallery.image.public_id,{invalidate:true});
		}
		deleteartgallery.remove();
		req.flash('success',`You have successfully deleted ${deleteartgallery.title}`);
		res.redirect('/artgallery');
	}
	catch(e){
		console.log(e);
		req.flash('error',e.message);
		res.redirect('back')
	};
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;