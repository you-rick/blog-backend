const mongoose = require('mongoose');


let CategorySchema = new mongoose.Schema({
    title: String,
    slug: String
});

let Category = mongoose.model('Category', CategorySchema);


module.exports = {
    Category: Category
};
