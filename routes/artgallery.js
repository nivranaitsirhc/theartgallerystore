// modules
const	express		= require('express');

const 	router 		= express.Router(),
		Artgallery	= require('../models/artgallery');
		
//middlewares
const 	middleware 	= require('../middleware');

const 	artGalleryStatusList = require('../utils/artGalleryStatusList');


// index -- Display a list of artgallerys
router.get('/', async (req,res)=>{
	try {
		if(req.query.search){
			const regex = new RegExp(escapeRegex(req.query.search), 'gi');
			let allartgallery = await Artgallery.find({"title":regex}).sort('-modified');
			let queryNullMatch = allartgallery.length > 1 ? "" : req.query.search;
		res.render("artgallery/index",{artgallery:allartgallery,page:'artgallery',msg_success:`Found ${allartgallery.length} matching title(s)..`,emptyQueryMsg:queryNullMatch});
		} else {
			let allartgallery = await Artgallery.find().sort('-modified');
			res.render("artgallery/index",{artgallery:allartgallery,page:'artgallery'});
		}
	}
	catch(err){
		console.log(err);
		res.render('artgallery/index',{err_msg:err.message});
	}
});

// new -- Display a form to add new artgallerys
router.get('/new',middleware.isLoggedIn,(req,res)=>{
	res.render("artgallery/new",{page:'artCreate',statusList:artGalleryStatusList});
});

// create -- Add new  artgallery to DB
router.post('/', middleware.isLoggedIn, async (req,res)=>{
	try {
		let title	= req.body.title,
			price	= req.body.price,
			image	= req.body.image,
			status 	= JSON.parse(req.body.status),
			desc 	= req.body.description,
			author 	= {
				id: req.user._id,
				username: req.user.username,
				fullName: req.user.fullName
			};
		let newartgallery = {title:title,price:price,image:image,status:status,description:desc,author:author};
		// create new artgallery and save to DB
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
		res.render('artgallery/edit',{page:'artEdit',artgallery:foundartgallery,statusList:artGalleryStatusList});
	})
	.catch((err)=>{
		console.log(err);
		req.flash('error',err.message);
		redirect('/artgallery/'+req.parms.id)
	});
});

// // Update -- update artgallery
router.put('/:id',middleware.checkArtgalleryOwnership, async (req,res)=>{
	try {
		let title 	= req.body.title,
			price 	= req.body.price,
			image 	= req.body.image,
			status 	= JSON.parse(req.body.status),
			desc 	= req.body.description;
		let newartgallery = {title:title,price:price,image:image,status:status,description:desc};
		let updatedartgallery = await Artgallery.findByIdAndUpdate(req.params.id,newartgallery);
		req.flash('success', `Updated ${updatedartgallery.title}`);
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
		let updatedartgallery = await Artgallery.findByIdAndDelete(req.params.id,req.body.artgallery);
		req.flash('success','You have successfully deleted '+updatedartgallery.title);
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