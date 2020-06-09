const mongoose = require('mongoose');

let ArticleSchema = new mongoose.Schema({
    title: String,
    body: String,
    date: String,
    editedAt: String,
    category: String,
    tags: [{
        type: String
    }],
    claps: Number,
    author: String
});

let Article = mongoose.model('Article', ArticleSchema);

module.exports = {
    Article: Article
};
