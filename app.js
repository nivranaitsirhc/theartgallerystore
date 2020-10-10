// modules
const	express 			= require('express'),
		compression 		= require('compression'),
		cache				= require('cache-control'),
		mongoose 			= require('mongoose'),
		axios 				= require('axios'),
		bodyParser 			= require('body-parser'),
		methodOverride 		= require('method-override'),
		flash				= require('connect-flash'),
		moment				= require('moment'),
		passport 			= require('passport'),
		localStrategy 		= require('passport-local'),
		session 			= require('express-session'),
		MongoDBStore 		= require('connect-mongodb-session')(session);

// models
const	User 		= require('./models/user'),
		Campground 	= require('./models/artgallery'),
		Comment 	= require('./models/comment');

// routes
const 	accountRoutes 		= require('./routes/accounts'),
		artgalleryRoutes	= require('./routes/artgallery'),
		commentsRoutes 		= require('./routes/comments'),
		indexRoutes			= require('./routes/index');

// middlewares
const 	middleware 	= require('./middleware');



// express 
const app = express();
// use compression
app.use(compression({level: 9}));
// express config to view ejs
app.set('view engine', 'ejs');
// express - use moment
app.locals.moment = moment;

//
app.use(express.json());

// express use the bodyparser module
app.use(bodyParser.urlencoded({extended:true}));

// express serve static files
app.use(express.static(__dirname+'/public'));
// express - use flash
app.use(flash());
// express - use method-override
app.use(methodOverride('_method'));
//
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// config connect to mongodb 
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/artgallery_db'
mongoose.connect(MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: true
});

// config mongodbstore
const store = new MongoDBStore({
	uri: MONGODB_URL,
	collection: 'mySessions'
});

// Cache Control
app.use(cache({
	'/assets/css/**' : 'public,no-cache,max-age=0,must-revalidate',
	'/assets/js/**' : 'public,no-cache,max-age=0,must-revalidate',
	'/assets/static/**' : 'public,max-age=604800, immutable',
	'/**' : 'public,no-cache,max-age=856800,must-revalidate'
}));

// session-configuration
let sessionConfig = {
	secret: 'a picture is worth a thousand words',
	cookie : {
		path: '/',
		secure: false,
		httpOnly: true,
		maxAge: 856800, // 1 week
		sameSite: 'strict'
	},
	store: store, // use mongodbstrore
	resave: false,
	saveUninitialized: false
};
// if(app.get('env') === 'production'){
// 	sessionConfig.cookie.secure = true
// 	app.set('trust proxy', 1) // trust first proxy
// 	console.log('running in poduction..')
// }
app.use(session(sessionConfig));

// express passport-configuration
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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
app.use('/user',accountRoutes);

// PAGE NOT FOUND 404
app.get('*',(req,res)=>{
	res.render('./404');
});

// express listen
let port = process.env.PORT || 3000
app.listen(port, ()=> {
	console.log("Art Store Gallery Server is Listening...")
});
