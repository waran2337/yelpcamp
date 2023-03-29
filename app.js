const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const engine = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')

// <------------Requiring ERROR Functions Paths ---------------->
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
// <------------Requiring MODEL and SCHEMA Paths ---------------->
const Campground = require('./models/campground')
const Review = require('./models/review')
const Joi = require('joi')
const {campgroundSchema, reviewSchema } = require('./schemas')

// <------------Requiring Router Paths ---------------->
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'))
app.engine('ejs', engine)
app.use(express.static(path.join(__dirname, 'public')))

// <------------Using Session ---------------->
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

// <------------Mongoose Connection Code ---------------->
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
// const { Schema } = mongoose;

main().catch(err => console.log(`HO NO MOGO CONNECTION ERROR ${err} `));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
    console.log("MONGO Connection open!!");
}
// <------------------------JOI DATA VALIDATION----------------------------->

// <---------------------------------------------------------------------------->
app.use('/campgrounds', campgrounds)

app.use('/campgrounds/:id/reviews' , reviews)


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

app.listen(3000, () => {
    console.log('Serving on port 3000')
})