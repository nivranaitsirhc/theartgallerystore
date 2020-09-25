// modules
const	express 	= require('express'),
		mongoose 	= require('mongoose'),
		axios 		= require('axios'),
		bodyParser 	= require('body-parser'),
		passport 	= require('passport'),
		methodOverride = require('method-override'),
		localStrategy = require('passport-local'),
		flash		= require('connect-flash'),
		moment		= require('moment');

// models
const	User 		= require('./models/user'),
		Campground 	= require('./models/artgallery'),
		Comment 	= require('./models/comment');

// routes
const 	artgalleryRoutes	= require('./routes/artgallery'),
		commentsRoutes 		= require('./routes/comments'),
		indexRoutes			= require('./routes/index');

// middlewares
const 	middleware 	= require('./middleware');

// config connect to mongodb 
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/artgallery_db'
mongoose.connect(MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

// express 
const app = express();

// express config to view ejs
app.set('view engine', 'ejs');
// express - use moment
app.locals.moment = moment;

// express use the bodyparser module
app.use(bodyParser.urlencoded({extended:true}));
// express serve static files
app.use(express.static(__dirname+'/public'));



// passport-configuration
app.use(require('express-session')({
	secret: 'a picture is worth a thousand words',
	resave: false,
	saveUninitialized: false
}));
// express - use passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// express - use method-override
app.use(methodOverride('_method'));

// express - use flash
app.use(flash());


// clean and seed the database 
//seedDB();

// meddleware to make available of our currentUser in all routes. used in header.ejs
app.use((req,res,next)=>{
	res.locals.currentUser	= req.user;
	res.locals.msg_error	= req.flash('error');
	res.locals.msg_success 	= req.flash('success');
	next();
});


 // Routes
app.use('/',indexRoutes);
app.use('/artgallery',artgalleryRoutes);
app.use('/artgallery/:id/comments',commentsRoutes);


// express listen
let port = process.env.PORT || 3000
app.listen(port, ()=> {
	console.log("Art Store Gallery Server is Listening...")
});
