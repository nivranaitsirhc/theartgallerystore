//modules
const 	express 	= require('express'),
		passport 	= require('passport'),
		nodemailer 	= require('nodemailer'),
		crypto    	= require('crypto'),
	 	router		= express.Router();

//models
const 	User	    = require('../models/user');
		//Token 		= require('../models/token');

//middleware
const   middleware = require('../middleware');


//root route
router.get("/", (req, res)=>{
	res.render("landing",{
		page: {
			name 	: 'landing',
			title 	: 'The Art Store Gallery'
		}
	});
});

// show register form
router.get("/signup", (req, res)=>{
	res.render("auth/signup",{
		page: {
			name 		: 'auth',
			title 		: 'Sign-up to ArtStoreGallery!',
			description : 'Sign-up to Art Store Gallery the best Art Gallery out there.'
		}
	});
});

//handle sign up logic
router.post("/signup", async (req, res)=>{
	try {
		if(req.body.newUser.password !== req.body.newUser.passwordConfirm) throw {message:'Server Message: Password does not match'};
		req.body.password = req.body.newUser.password;
		req.body.username = req.body.newUser.username;
		req.body.newUser.fullName  = `${req.body.newUser.firstName} ${req.body.newUser.middleName} ${req.body.newUser.lastName}`;
		let user = await User.register(new User(req.body.newUser), req.body.password);
		passport.authenticate("local")(req,res,()=>{
			req.flash("success", `Successfully Signed Up! Nice to meet you ${req.body.newUser.firstName}`);
			res.redirect('/artgallery');
		});
	}
	catch(err){
		console.log(err);
		req.flash('error',err.message);
		res.redirect('back');
	}
});

//show login form
router.get("/signin", (req, res)=>{
	res.render("auth/signin",{
		page: {
			name 		: 'auth',
			title 		: 'Sign-in to ArtStore Gallery',
			description : 'Welcome back to Art Store Gallery, Please sign-in to see the best Artwork out there'
		}
	});
});

//handling login logic
router.post("/signin",passport.authenticate("local", 
		{
			// successRedirect: "/artgallery"
			failureRedirect: "/signin",
			failureFlash: true
		}
	),
	async (req, res)=>{
		try {
			if (req.body.remember_me){ 
				req.session.cookie.maxAge =  604_800_000 // 7days
			}
			req.flash('success', `Welcome back ${req.body.username}.`);
			req.session.returnTo = !req.session.returnTo ? '/artgallery' : req.session.returnTo;
			res.redirect(req.session.returnTo);
			req.session.returnTo = "";
		}
		catch(e){
			console.log(e);
			res.redirect('back')
		}
	}
);

// logout route
router.get("/logout", (req, res)=>{
	 req.logout();
	 req.flash("success", `${req.body.username} sucessfully..`);
	 res.redirect("/artgallery");
});

// forgot password
router.get("/forgot", (req,res)=>{
	res.render('./auth/forgot',{
		page: {
			name 		: 'auth',
			title 		: 'Forgot password?',
			description : 'Did you forgot your password? No worries! We got you covered, just recovery it with your email.'
		}
	});
});

// forgot password - send email
router.post("/forgot",async (req,res)=>{
	try {
		let token = await crypto.randomBytes(20).toString('hex');
		let user = await User.find({email:req.body.email});
		user = user[0];
		if(!user) throw {message:'No account exist with that email address'};
		user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 360000 * 5;//1hour
		user.save();
		let mailOptions = {
			to: user.email,
			from: process.env.NODE_MAILER_user,
			subject: 'The Art Store Gallery - Password Reset',
			text: `Hi ${user.firstName},\n\n`+
						`You are receiving this email because you (or someone else) have requested to reset your password at ${req.headers.host}.\n\n`+
						`Please click  on the following link, or paste this into your browser to complete the password-reset process.\n`+
						`https://${req.headers.host}/reset/${token}\n\n`+
						`The link will expire in ${user.resetPasswordExpires}\n\n`+
						`Note: If you did not make this request, please disregard and delete this email..\n\n`+
						`Warm Regards,\n\n\n`+
						`The Art Store Gallery Team`
		};
		await smtpTransport.sendMail(mailOptions)
		.then(()=>{
			req.flash('success',`An e-mail has been sent to ${user.email}. Please follow the instructions on the email you receive.`);
			return res.redirect('/forgot');    
		})
	}
	catch(err){
		console.log(err);
		req.flash('error',err.message);
		res.redirect('back');
	}
});

// reset password - new password
router.get('/reset/:token', (req,res)=>{
	User.findOne({resetPasswordToken: req.params.token,resetPasswordExpires: {$gt:Date.now()}})
	.then((user)=>{
		if(!user<1){
			res.render('./auth/reset',{
				page	: {
					name 		: 'auth',
					title 		: 'Change your password!',
					description	: 'Change your password with a valid token.'
				},
				token 	: req.params.token
			});
		} else {
			req.flash('error', 'You accessing an expired page..')
			res.redirect('/artgallery');
		}
	})
	.catch((err)=>{
		console.log(err);
		req.flash('error',err.message);
		return res.redirect('/forgot');
	});
});

// reset password - update password
router.post('/reset/:token', async (req,res)=>{
	try {
		let user = await User.findOne({resetPasswordToken:req.params.token,resetPasswordExpires: {$gt:Date.now()}});
		if(req.body.newpassword !== req.body.confirmpassword) throw {message:'Password does not match.'};
		user.setPassword(req.body.newpassword);
		user.setPasswordToken = undefined;
		user.setPasswordTokenExpires = undefined;
		await user.save();
		req.logIn(user,()=>{})
		req.flash('success','You have successfully change your password..')
		let mailOptions = {
			to: user.email,
			from: process.env.NODE_MAILER_user,
			subject: 'The Art Store Gallery - Password Reset',
			text: `Hi ${user.firstName},\n\n`+
						'Congratulations! You have sucessfully reset your password\n\n'+
						'Warm Regards,\n\n'+
						'The Art Store Gallery Team'
		};
		smtpTransport.sendMail(mailOptions)
		res.redirect('/artgallery');
	}
	catch(err){
		console.log(err);
		req.flash('error',err.message);
		res.redirect('back');
	}
});


//mail transport config
let smtpTransport = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		type :        'OAuth2',
		user:         process.env.NODE_MAILER_user,
		clientSecret: process.env.NODE_MAILER_clientSecret,
		clientId:     process.env.NODE_MAILER_clientId,
		refreshToken: process.env.NODE_MAILER_refreshToken,
		accessToken:  process.env.NODE_MAILER_accessToken
	}
});

module.exports = router;