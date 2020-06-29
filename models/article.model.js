const mongoose = require('mongoose');

let ArticleSchema = new mongoose.Schema({
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

let Article = mongoose.model('Article', ArticleSchema, 'articles');

module.exports = {
    Article: Article
};
