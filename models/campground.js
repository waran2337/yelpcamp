const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { Schema } = mongoose;

const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
})

module.exports = mongoose.model('Campground', CampgroundSchema);

