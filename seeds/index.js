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
    for(let i=0; i<300; i++) {
        const random1000 = Math.floor(Math.random()*400);
        // console.log(output[random1000]);
        const camp = new Campground({
            location: `${output[random1000].city}, ${output[random1000].country}`,
            // location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'It is a long established fact that a reader will be distracted by the readable ' +
                'content of a page when looking at its layout. The point of using Lorem ' +
                'Ipsum is that it has a more-or-less normal distribution of letters,',
            price: random1000,
            author: '6428707e65b845f2471e6308', //your User id called waran
            geometry: { type: 'Point', coordinates: [ output[random1000].lng, output[random1000].lat  ] },
            images: [
                {
                    url: 'https://res.cloudinary.com/dyquncffs/image/upload/v1681354863/YelpCamp/rzjcxjhua5nkrlmrmn78.jpg',
                    filename: 'YelpCamp/ydzbimrdb4pbquk1gwah',
                },
                {
                    url: 'https://res.cloudinary.com/dyquncffs/image/upload/v1681354861/YelpCamp/rb84trxubfvmmdi2w0qf.jpg',
                    filename: 'YelpCamp/sl9nz63hif4lwtgzfqr6',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});


