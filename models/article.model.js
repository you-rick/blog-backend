const mongoose = require('mongoose');

let ArticleSchema = new mongoose.Schema({
    title: String,
    slug: String,
    image: String,
    body: String,
    date: String,
    editedAt: String,
    category: String,
    likes: Number,
    author: String
});

let Article = mongoose.model('Article', ArticleSchema);

module.exports = {
    Article: Article
};
