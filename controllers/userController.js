const express = require('express');
// Mongo ID validation
const ObjectId = require('mongoose').Types.ObjectId;
const router = express.Router();
const jwtHelper = require('../config/jwtHelper');
const {User} = require('../models/user.model');
const _ = require('lodash');

router.get('/', async (req, res) => {
    console.log("here!");
    // destructure page and limit and set default values
    const {page = 1, limit = 10} = req.query;


    try {
        // execute query with page and limit values
        let users = await User.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        users = users.map(usr => {
            return _.pick(usr, [
                '_id',
                'fullName',
                'photo',
                'about',
                'linkedin',
                'facebook',
                'followers',
                'following',
            ])
        });

        // get total documents in the Posts collection
        const count = await User.countDocuments();

        // return response with posts, total pages, and current page
        res.json({
            users: users,
            status: true,
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

    console.log(req.params);

    User.findById(req.params.id, (err, doc) => {
        if (!err) {
            return res.status(200).json({
                status: true,
                user: _.pick(doc, [
                    '_id',
                    'fullName',
                    'photo',
                    'about',
                    'linkedin',
                    'facebook',
                    'followers',
                    'following'
                ])
            });
        } else {
            res.json({message: err});
            console.log("Damn it! Error in Retrieving Users by ID :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.put('/:id/follow', jwtHelper.verifyJwtToken, (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`No users with given id: ${req.params.id}`);
    }

    User.updateOne({_id: req._id}, {$push: {following: req.params.id}}, (err, profileData) => {
        if (err) res.status(400).json(err);

        User.updateOne({_id: req.params.id}, {$push: {followers: req._id}}, (err, userData) => {
            if (err) {
                return res.status(400).json(err);
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Follow success',
                    user: req._id
                });
            }


        });
    });
});


router.put('/:id/unfollow', jwtHelper.verifyJwtToken, (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`No users with given id: ${req.params.id}`);
    }

    User.updateOne({_id: req._id}, {$pull: {following: req.params.id}}, (err, profileData) => {
        if (err) res.status(400).json(err);

        User.updateOne({_id: req.params.id}, {$pull: {followers: req._id}}, (err, userData) => {
            if (err) {
                return res.status(400).json(err);
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Unfollow success',
                    user: req._id
                });
            }
        });
    });
});


module.exports = router;
