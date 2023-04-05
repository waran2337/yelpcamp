const output = require('./output');//-----------Indian cities and state names
// const cities = require('./cities'); //-----------Us city and state names
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

// <------------Mongoose Connection Code ---------------->
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
// const { Schema } = mongoose;

main().catch(err => console.log(`HO NO MOGO CONNECTION ERROR ${err} `));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
    console.log("MONGO Connection open!!");
}

// <------------Random city and Title Uploader Logic-------------->
const sample = array => array[Math.floor(Math.random()  * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<50; i++) {
        const random1000 = Math.floor(Math.random()*400);
        // console.log(output[random1000]);
        const camp = new Campground({
            location: `${output[random1000].city}, ${output[random1000].admin_name}`,
            // location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
