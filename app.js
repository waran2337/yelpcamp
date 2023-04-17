if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}



const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const engine = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

// <------------Requiring ERROR Functions Paths ---------------->
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
// <------------Requiring MODEL and SCHEMA Paths ---------------->
const Campground = require('./models/campground')
const Review = require('./models/review')
const User = require('./models/user')
const Joi = require('joi')
const {campgroundSchema, reviewSchema } = require('./schemas')

// <------------Requiring Router Paths ---------------->
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'))
app.engine('ejs', engine)
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

// <------------Using Session ---------------->
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoStore({
    mongoUrl: dbUrl,  // 'mongodb://127.0.0.1:27017/yelp-camp'
    touchAfter: 24 * 3600 , // 24 hr
    crypto: {
        secret   // before deploying---> secret: 'thisshouldbeabettersecret!'
    }
})

store.on("error", function (e) {
    console.log("SESSION STORE ERROR" , e)
})
const sessionConfig = {
    store,
    name: "YASE",
    secret,  // before deploying---> secret: 'thisshouldbeabettersecret!'
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());
// <------------Helmet URL abd SRC Config ---------------->
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dyquncffs/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
// <------------Passport Session ---------------->
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// <-------------------------------------------------->
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user;
    next();
})

// <------------Mongoose Connection Code ---------------->
// const dbUrl = process.env.DB_URL;

const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
// const { Schema } = mongoose;

main().catch(err => console.log(`HO NO MOGO CONNECTION ERROR ${err} `));
async function main() {
    await mongoose.connect(dbUrl);      //'mongodb://127.0.0.1:27017/yelp-camp'
    console.log("MONGO Connection open!!");
}
// <------------------------JOI DATA VALIDATION----------------------------->

// <---------------------------------------------------------------------------->
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews' , reviewRoutes)
app.use('/', userRoutes)


app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// <------------------------CUSTOM ERROR HANDLER----------------------------->
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No Something Went Wrong!'
    res.status(statusCode).render('error.ejs', { err })
})
const port = process.env.PORT || 3000;
app.listen(3000, () => {
    console.log('Serving on port 3000')
})