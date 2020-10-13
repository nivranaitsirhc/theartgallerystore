// modules
const 	express 	= require('express'),
		moment 		= require('moment');


//models
const	Artwork		= require('../models/artwork');
let 	router 		= express.Router();

// sitemap
router.get('/sitemap.xml', async (req,res)=>{
	try {
		//build the package
		let artgallery = [];
		(await Artwork.find({})).forEach(x=>{
			artgallery.push({
				loc 		: x.slug,
				lastmod 	: moment(x.modified).format('YYYY-MM-DD'),
				changefreq 	: 'weekly',
				priority 	: 0.9
			})
		});
		let sitemap = {
			host		: req.headers.host,
			artgallery
		}
		res.set('Content-Type', 'text/xml');
		res.render('sitemap/sitemap',{sitemap});
	}
	catch(e) {
		req.flash('error',e.message);
		res.redirect('/artgallery');
	}
})

module.exports = router;