const mongoose = require('mongoose');
const {campgroundSchema} = require("../schemas");
mongoose.set('strictQuery', true);
const { Schema } = mongoose;
const Review = require('./review')

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
    type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
},
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})
// <--------------------Mongoose middleware---------------------------->
CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({_id: {$in: doc.reviews}})
    }
})
module.exports = mongoose.model('Campground', CampgroundSchema);

