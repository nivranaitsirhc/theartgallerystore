// modules
const 	express 	= require('express'),
        passport 	= require('passport'),
        async     = require('async'),
        nodemailer = require('nodemailer'),
        crypto    = require('crypto');

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
    res.render("auth/signup",{page:'auth'});
});

//handle sign up logic
router.post("/signup", (req, res)=>{
  req.body.password = req.body.newUser.password
  req.body.username = req.body.newUser.username
  req.body.newUser.fullName  = req.body.newUser.firstName + ' ' + req.body.newUser.middleName + ' ' + req.body.newUser.lastName;
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
  res.render("auth/login",{page: 'auth'});
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
});

// logout route
router.get("/logout", (req, res)=>{
   req.logout();
   req.flash("success", "Logout sucessfully..");
   res.redirect("/artgallery");
});

// forgot password
router.get("/forgot", (req,res)=>{
res.render('./auth/forgot',{page:'auth'});
});

// forgot password - send email
router.post("/forgot",(req,res,next)=>{
  async.waterfall([
    function(done){
      crypto.randomBytes(20,(err,buf)=>{
        let token = buf.toString('hex');
        done(err,token);
      });
    },
    function(token,done){
      User.find({email:req.body.email})
      .then(foundUser=>{
        user=foundUser[0]
        if(!user){
          req.flash('error','No account exist with that email address');
          return res.redirect('/forgot');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 360000 //1hour

        user.save(err=>{
          done(err,token,user);
        });
      })
      .catch(err=>{
        req.flash('error', err.message);
        res.redirect('/forgot');
      })
    },
    function(token,user,done){
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.NODE_MAILER_user,
          pass: process.env.NODE_MAILER_pass
        }
      });
      let mailOptions = {
        to: user.email,
        from: process.env.NODE_MAILER_user,
        subject: 'The App Store Gallery - Password Reset',
        text: 'Hi '+user.firstName+',\n\n'+
              'You are receiving this because you (or someone else) have requested to reset your password at '+ req.headers.host +'\n'+
              'Please click  on the following link, or paste this into your browser to complete the process '+
               'https://' + req.headers.host + '/reset/' + token + '\n\n'+
              'If you did not request this, please ignore this email..'
      };
      smtpTransport.sendMail(mailOptions)
      .then(()=>{
        req.flash('success','An e-mail has been sent to '+ user.email + '. Please follow the instructions on the email your receive.');
        return res.redirect('/forgot');    
      })
      .catch((err)=>{
        req.flash('error',err.message);
        return res.redirect('/forgot');
      })
    },

  ],err=>{
    if(err) return next(err);
    res.redirect('/forgot');
  });
});

// reset password - new password
router.get('/reset/:token', (req,res)=>{
  User.findOne({resetPasswordToken: req.params.token,resetPasswordExpires: {$gt:Date.now()}})
  .then((user)=>{
    res.render('./auth/reset',{page:'auth',token:req.params.token})
  })
  .catch((err)=>{
    console.log(err);
    req.flash('error',err.message);
    return res.redirect('/forgot');
  });
});

// reset password - update password
router.post('/reset/:token', (req,res)=>{
  User.findOne({resetPasswordToken:req.params.token,resetPasswordExpires: {$gt:Date.now()}})
  .then((user)=>{
    if(req.body.newpassword === req.body.confirmpassword){
      user.setPassword(req.body.newpassword)
      .then(()=>{
        user.setPasswordToken = undefined;
        user.setPasswordTokenExpires = undefined;
        user.save()
        .then(()=>{
          req.logIn(user,(err)=>{
            if(err){              
              console.log(err)
              req.flash('error',err.message);
              return res.redirect('back');
            };
            req.flash('success','You have successfully change your password..')
            res.redirect('/artgallery');
          });
        });
      })
      .catch((err)=>{
        console.log(err)
        req.flash('error',err.message);
        return res.redirect('back');
      });
    }else{
      req.flash('error','Password do not match..')
      return res.redirect('back');
    }
  })
  .catch((err)=>{
    console.log(err)
    req.flash('error',err.message);
    res.redirect('back');
  })
});


module.exports = router;