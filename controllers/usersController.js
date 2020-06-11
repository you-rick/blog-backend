const express = require('express');
// Mongo ID validation
const ObjectId = require('mongoose').Types.ObjectId;
const router = express.Router();
const jwtHelper = require('../config/jwtHelper');
const {Users} = require('../models/user.model');
const _ = require('lodash');

router.get('/', async (req, res) => {
    // destructure page and limit and set default values
    const {page = 1, limit = 10} = req.query;


    try {
        // execute query with page and limit values
        const posts = await Users.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // get total documents in the Posts collection
        const count = await Users.countDocuments();

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


router.get('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Users.findById(req.params.id, (err, doc) => {
        if (!err) {
            return res.status(200).json({
                status: true,
                user: _.pick(user, [
                    '_id',
                    'fullName',
                    'photo',
                    'about',
                    'linkedin',
                    'facebook',
                    'followed',
                ])
            });
        } else {
            res.json({message: err});
            console.log("Damn it! Error in Retrieving Users by ID :" + JSON.stringify(err, undefined, 2));
        }
    });
});



