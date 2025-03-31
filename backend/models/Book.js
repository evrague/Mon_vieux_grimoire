const mongoose = require("mongoose");

// Creation du Schema de validation : Book
const BookSchema = new mongoose.Schema({
    userId: {type: String, required: false},
    title: {type: String, required: false},
    author: {type: String, required: false},
    imageUrl: String,
    year: Number,
    genre: String,
    ratings: [
        {
            userId: String,
            grade: Number
        }
    ],
    averageRating: Number

});

module.exports = mongoose.model("Book", BookSchema);
