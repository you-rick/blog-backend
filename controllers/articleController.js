const express = require('express');
// Mongo ID validation
const ObjectId = require('mongoose').Types.ObjectId;
const router = express.Router();
const jwtHelper = require('../config/jwtHelper');
const {Article} = require('../models/article.model');

router.get('/', async (req, res) => {
    // destructure page and limit and set default values
    const {page = 1, limit = 10} = req.query;


    try {
        // execute query with page and limit values
        const posts = await Article.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // get total documents in the Posts collection
        const count = await Article.countDocuments();

        // return response with posts, total pages, and current page
        res.json({
            posts,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        console.error(err.message);
    }
});


router.get('/:id', (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Article.findById(req.params.id, (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
            response.json({message: err});
            console.log("Damn it! Error in Retrieving Article by ID :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.post('/', jwtHelper.verifyJwtToken, (req, response) => {
    let article = new Article({
        title: req.body.title,
        body: req.body.body,
        date: req.body.date,
        editedAt: req.body.editedAt,
        category: req.body.category,
        tags: req.body.tags,
        claps: eq.body.claps,
        author: req._id
    });

    article.save((err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            response.json({message: err});
            console.log("Fuck! Error in Article POST :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.put('/:id', jwtHelper.verifyJwtToken, (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    let article = {
        title: req.body.title,
        body: req.body.body,
        date: req.body.date,
        editedAt: req.body.editedAt,
        category: req.body.category,
        tags: req.body.tags,
        claps: eq.body.claps,
        author: req._id
    };

    article.findByIdAndUpdate(req.params.id,
        {$set: article},
        {author: req._id, new: false, useFindAndModify: false},
        (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
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
