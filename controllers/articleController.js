const express = require('express');
// Mongo ID validation
const ObjectId = require('mongoose').Types.ObjectId;
const slugify = require('slugify');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const {fileImageHandler} = require('../config/imageUpload');
const router = express.Router();
const jwtHelper = require('../config/jwtHelper');
const {Article} = require('../models/article.model');
const {User} = require('../models/user.model');

router.get('/', async (req, res) => {
    // destructure page and limit and set default values
    const {page = 1, limit = 10,} = req.query;

    let queryParam = {};
    if (req.query.author) queryParam = {author: req.query.author, ...queryParam};
    if (req.query.category) queryParam = {category: req.query.category, ...queryParam};

    try {
        // execute query with page and limit values
        const articles = await Article.find(queryParam)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // get total documents in the Posts collection
        const count = await Article.countDocuments();

        // return response with posts, total pages, and current page
        res.json({
            articles,
            status: true,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        console.error(err.message);
    }
});


router.get('/:slug', (req, response) => {
    Article.find({slug: req.params.slug}, (err, doc) => {
        if (!err) {
            response.status(200).json({
                status: true,
                article: doc
            });
        } else {
            response.json({message: err});
            console.log("Damn it! Error in Retrieving Article by ID :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.post('/', jwtHelper.verifyJwtToken, fileImageHandler.single('image'), (req, response) => {
    let imageURL = '';
    let postDate = new Date();
    let slug = slugify(req.body.title, {lower: true, remove: /[*+~.()'"!:@?<>;=\/]/g});
    req.fileValidationError && response.send({status: false, message: req.fileValidationError});

    if (req.file) {
        const {filename: image} = req.file;

        sharp(req.file.path)
            .resize(960)
            .jpeg({quality: 100})
            .toFile(path.resolve(req.file.destination, 'resized', image)
            ).then(data => {
            fs.unlinkSync(req.file.path);
        }).catch(err => {
            console.log(err);
        });

        imageURL = `uploads/resized/${image}`;
    }


    let article = new Article({
        title: req.body.title,
        slug: slug,
        image: imageURL,
        description: req.body.description,
        content: req.body.content,
        date: postDate.toString(),
        category: req.body.category,
        likes: req.body.likes,
        author: req._id
    });

    article.save((err, docs) => {
        if (!err) {
            response.send({status: true, message: "Article successfully added", article: docs});
        } else {
            response.json({status: false, message: err});
            console.log("Damn it! Error in Article POST :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.put('/:slug', jwtHelper.verifyJwtToken, fileImageHandler.single('image'), (req, response) => {
    let imageURL = '';
    let editDate = new Date();
    let slug = slugify(req.body.title, {lower: true, remove: /[*+~.()'"!:@?<>;=\/]/g});
    req.fileValidationError && response.send({status: false, message: req.fileValidationError});

    if (req.file) {
        const {filename: image} = req.file;

        sharp(req.file.path)
            .resize(960)
            .jpeg({quality: 100})
            .toFile(path.resolve(req.file.destination, 'resized', image)
            ).then(data => {
            fs.unlinkSync(req.file.path);
        }).catch(err => {
            console.log(err);
        });

        imageURL = `uploads/resized/${image}`;
    }

    let article = {
        title: req.body.title,
        slug: slug,
        description: req.body.description,
        content: req.body.content,
        editedAt: editDate.toString(),
        category: req.body.category,
        author: req._id
    };

    if (imageURL.length) {
        article.image = imageURL;
    }

    Article.updateOne({_id: req.body._id, author: req._id}, {$set: article},
        (err, docs) => {
            if (!err) {
                response.send({status: true, message: "Article successfully updated", article: docs});
            } else {
                response.json({message: err});
                console.log("Damn it! Error in Article PUT :" + JSON.stringify(err, undefined, 2));
            }
        });
});


router.delete('/:id', jwtHelper.verifyJwtToken, (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Article.findOneAndDelete({_id: req.params.id, author: req._id}, (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
            console.log("Damn it! Error in Article DELETE :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.put('/:id/like', jwtHelper.verifyJwtToken, (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`No articles with given id: ${req.params.id}`);
    }

    Article.updateOne({_id: req.params.id}, {$push: {liked: req._id}}, (err, articleData) => {
        if (err) res.status(400).json(err);

        User.updateOne({_id: req._id}, {$push: {liked: req.params.id}}, (err, userData) => {
            if (err) {
                return res.status(400).json(err);
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Article saved in Favorites',
                    article: articleData,
                    user: req._id
                });
            }
        });
    });
});


router.put('/:id/unlike', jwtHelper.verifyJwtToken, (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`No articles with given id: ${req.params.id}`);
    }

    Article.updateOne({_id: req.params.id}, {$pull: {liked: req._id}}, (err, articleData) => {
        if (err) res.status(400).json(err);

        User.updateOne({_id: req._id}, {$pull: {liked: req.params.id}}, (err, userData) => {
            if (err) {
                return res.status(400).json(err);
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Article removed from Favorites',
                    article: articleData,
                    user: req._id
                });
            }
        });
    });
});


router.put('/:id/save', jwtHelper.verifyJwtToken, (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`No articles with given id: ${req.params.id}`);
    }

    Article.updateOne({_id: req.params.id}, {$push: {saved: req._id}}, (err, articleData) => {
        if (err) res.status(400).json(err);

        User.updateOne({_id: req._id}, {$push: {saved: req.params.id}}, (err, userData) => {
            if (err) {
                return res.status(400).json(err);
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Article saved',
                    article: articleData,
                    user: req._id
                });
            }
        });
    });
});


router.put('/:id/unsave', jwtHelper.verifyJwtToken, (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`No articles with given id: ${req.params.id}`);
    }

    Article.updateOne({_id: req.params.id}, {$pull: {saved: req._id}}, (err, articleData) => {
        if (err) res.status(400).json(err);

        User.updateOne({_id: req._id}, {$pull: {saved: req.params.id}}, (err, userData) => {
            if (err) {
                return res.status(400).json(err);
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Article removed from saved',
                    article: articleData,
                    user: req._id
                });
            }
        });
    });
});


module.exports = router;
