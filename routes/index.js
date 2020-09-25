// modules
const 	express 	= require('express'),
        passport 	= require('passport');

const 	router		 = express.Router(),
        User	     = require('../models/user');

//middleware
const   middleware = require('../middleware');


//root route
router.get("/", (req, res)=>{
    res.render("landing");
});

// show register form
router.get("/signup",middleware.parseReturnUrl, (req, res)=>{
    res.render("auth/signup",{page:'signup'});
});

//handle sign up logic
router.post("/signup", (req, res)=>{
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
            return res.render("auth/signup", {msg_error: err.message});
        }
        passport.authenticate("local")(req, res, ()=>{
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect(req.session.returnTo);
           delete req.session.returnTo;
        });
    });
});

//show login form
router.get("/login",middleware.parseReturnUrl, (req, res)=>{
  res.render("auth/login",{page: 'login'});
});

//handling login logic
router.post("/login",passport.authenticate("local", 
    {
        // successRedirect: "/artgallery"
        failureRedirect: "/login",
        failureFlash: true
    }
    ), (req, res)=>{
    console.log('our baseUrl', req.baseUrl);
    console.log('our originalUrl ',req.originalUrl);
    console.log('our returnTo',req.session.returnTo)
    req.flash('success', 'Welcome back ' + req.body.username);
    res.redirect(req.session.returnTo);
    console.log('deleting returnTo',req.session.returnTo);
    delete req.session.returnTo;
    console.log('current returnTo',req.session.returnTo)
});

// logout route
router.get("/logout", (req, res)=>{
   req.logout();
   req.flash("success", "Logout sucessfully..");
   res.redirect("/artgallery");
});


module.exports = router;