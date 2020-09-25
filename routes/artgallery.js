// modules
const	express		= require('express');

const 	router 		= express.Router(),
		Artgallery	= require('../models/artgallery');
		
//middlewares
const 	middleware 	= require('../middleware');

const 	artGalleryStatusList = require('../utils/artGalleryStatusList');


// index -- Display a list of artgallerys
router.get('/', (req,res)=>{
	// get akk artgallerys from DB
	Artgallery.find().then((allartgallery)=>{
		res.render("artgallery/index",{artgallery:allartgallery,page:'artgallery'});
	}).catch(err=>{
		req.flash('error',err.message)
		console.log(err);
	});
});

// new -- Display a form to add new artgallerys
router.get('/new',middleware.isLoggedIn,(req,res)=>{
	res.render("artgallery/new",{page:'artCreate',statusList:artGalleryStatusList});
});

// create -- Add new  artgallery to DB
router.post('/', middleware.isLoggedIn,(req,res)=>{
	let title = req.body.title,
		price = req.body.price,
		image = req.body.image,
		status = JSON.parse(req.body.status),
		desc = req.body.description,
		author = {
			id: req.user._id,
			username: req.user.username
		};
	let newartgallery = {title:title,price:price,image:image,status:status,description:desc, author:author};
	// create new artgallery and save to DB
	console.log(newartgallery)
	Artgallery.create(newartgallery).then((newlyCreated)=> {
		req.flash('success','Added '+newlyCreated.title);
		res.redirect('/artgallery/'+newlyCreated._id);
	}).catch((err) => {
		if(err){
			req.flash('error',err.message);
			res.redirect('/artgallery/new');
		}
	});
});



// show -- Show more info about artgallery
router.get('/:id',(req, res)=>{
	// Show artgallery by id
	Artgallery.findById(req.params.id).populate("comments").then((foundartgallery)=>{
		res.render('artgallery/show',{artgallery:foundartgallery});
	}).catch((err)=>{
		req.flash('error',err.message);
		console.log(err)
		res.redirect('/artgallery');
	});
});


// Edit -- edit artgallery
router.get('/:id/edit', middleware.checkArtgalleryOwnership,(req,res)=>{
	Artgallery.findById(req.params.id).then((foundartgallery)=>{
		res.render('artgallery/edit',{page:'artEdit',artgallery:foundartgallery,statusList:artGalleryStatusList});
	}).catch((err)=>{
		req.flash('error',err.message);
		console.log(err)
		redirect('/artgallery/'+req.parms.id)
	});
});

// // Update -- update artgallery
router.put('/:id',middleware.checkArtgalleryOwnership,(req,res)=>{
	let title = req.body.title,
		price = req.body.price,
		image = req.body.image,
		status = JSON.parse(req.body.status),
		desc = req.body.description;
	let newartgallery = {title:title,price:price,image:image,status:status,description:desc};
	Artgallery.findByIdAndUpdate(req.params.id,newartgallery).then((updatedartgallery)=>{
		req.flash('success', 'Updated '+updatedartgallery.title);
		res.redirect('/artgallery/'+req.params.id);
	}).catch((err)=>{
		req.flash('error',err.message);
		console.log(err)
		res.redirect('/artgallery');
	});
});

// // destroy -- artgallery
router.delete('/:id',middleware.checkArtgalleryOwnership,(req,res)=>{
	Artgallery.findByIdAndDelete(req.params.id,req.body.artgallery).then((updatedartgallery)=>{
		req.flash('success','You have successfully deleted '+updatedartgallery.title);
		res.redirect('/artgallery');
	}).catch((err)=>{
		req.flash('error',err.message);
		console.log(err)
		res.redirect('/artgallery')
	});
});

module.exports = router;