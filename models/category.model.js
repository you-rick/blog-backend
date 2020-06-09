const mongoose = require('mongoose');


let CategorySchema = new mongoose.Schema({
    title:  {type: String}
});

let Category = mongoose.model('Category', CategorySchema);


module.exports = {
    Category: Category
};
