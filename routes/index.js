// modules
const 	express 	= require('express'),
        passport 	= require('passport');

const 	router		 = express.Router(),
        User	     = require('../models/user');

//middleware
const   middleware = require('../middleware');


//root route
router.get("/", (req, res)=>{
    res.render("landing",{page:'landing'});
});

// show register form
router.get("/signup", (req, res)=>{
    res.render("auth/signup",{page:'signup'});
});

//handle sign up logic
router.post("/signup", (req, res)=>{
  req.body.password = req.body.newUser.password
  req.body.username = req.body.newUser.username
  User.register(new User(req.body.newUser), req.body.password, (err, user)=>{
    console.log(user)
    if(err){
        console.log(err);
        return res.render("auth/signup",{page:'signup',msg_error:err.message});
    } else {
      passport.authenticate("local")(req,res,()=>{
        req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.newUser.firstName);
        res.redirect('/artgallery');
      });
    };
  });
});

//show login form
router.get("/login", (req, res)=>{
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
    req.flash('success', 'Welcome back ' + req.body.username);
    res.redirect('/artgallery');
    delete req.session.returnTo;
});

// logout route
router.get("/logout", (req, res)=>{
   req.logout();
   req.flash("success", "Logout sucessfully..");
   res.redirect("/artgallery");
});


module.exports = router;