const mongoose = require('mongoose');


let CategorySchema = new mongoose.Schema({
    title: String,
    slug: String
});

let Category = mongoose.model('Category', CategorySchema, 'categories');


module.exports = {
    Category: Category
};
