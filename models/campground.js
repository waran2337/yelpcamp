const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { Schema } = mongoose;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
})

module.exports = mongoose.model('Campground', CampgroundSchema);

