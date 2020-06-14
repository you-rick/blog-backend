const express = require('express');
// Mongo ID validation
const ObjectId = require('mongoose').Types.ObjectId;
const slugify = require('slugify');
const router = express.Router();
const jwtHelper = require('../config/jwtHelper');
const {Category} = require('../models/category.model');


router.get('/', (req, response) => {
    Category.find((err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Damn it! Error in Retrieving Categories :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.get('/:id', (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Category.findById(req.params.id, (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
            console.log("Damn it! Error in Retrieving Categories by ID :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.post('/', (req, response) => {
    let category = new Category({
        title: req.body.title,
        slug: slugify((req.body.title).toLowerCase())
    });

    category.save((err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Damn it! Error in Categories POST :" + JSON.stringify(err, undefined, 2));
            return response.status(400).json(err);

        }
    });
});


router.put('/:id', (req, response) => {  // /:id <- это то, к чему можно будет стучаться через req.params.id
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    let category = {
        title: req.body.title,
        slug: slugify(req.body.title)
    };

    Category.findByIdAndUpdate(req.params.id,
        {$set: category},
        {new: true, useFindAndModify: false},
        (err, doc) => {
            if (!err) {
                response.send(doc);
            } else {
                console.log("Damn it! Error in Categories PUT :" + JSON.stringify(err, undefined, 2));
            }
        });
});


router.delete('/:id', (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Category.findOneAndDelete({_id: req.params.id}, (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
            console.log("Damn it! Error in Categories DELETE :" + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;
