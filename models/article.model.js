const mongoose = require('mongoose');

let articleSchema = new mongoose.Schema({
    title: String,
    slug: String,
    description: String,
    image: String,
    content: String,
    date: String,
    editedAt: String,
    category: String,
    liked: [{
        type: String
    }],
    saved: [{
        type: String
    }],
    author: String
});


articleSchema.pre('save', function(next) {
  let id = this._id;
  this.slug = this.slug + '-' + id;
  next();
});



let Article = mongoose.model('Article', articleSchema, 'articles');

module.exports = {
    Article: Article
};
