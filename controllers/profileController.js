const express = require('express');
const passport = require('passport');
const jwtHelper = require('../config/jwtHelper');
const {fileImageHandler} = require('../config/imageUpload');
const _ = require('lodash');

let router = express.Router();
let {User} = require('../models/user.model');


router.post('/register', fileImageHandler.single('photo'), (req, res, next) => {
    let user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        about: req.body.about,
        photo: req.file.path,
        linkedin: req.body.linkedin,
        facebook: req.body.facebook,
        categories: req.body.categories,
        following: [],
        followers: [],
        saved: [],
        liked: []
    });

    user.save((err, doc) => {
        if (!err) {
            return res.status(200).json({message: "Successful Registration"});
        } else {
            if (err.code === 11000) {
                res.status(422).json({message: 'Duplicate email address found.'});
            } else {
                return next(err);
            }
        }
    });
});

router.put('/update', fileImageHandler.single('photo'), (req, res, next) => {
    let user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        about: req.body.about,
        photo: req.file.path,
        linkedin: req.body.linkedin,
        facebook: req.body.facebook,
        categories: req.body.categories,
        following: [],
        followers: [],
        saved: [],
        liked: []
    });

    user.save((err, doc) => {
        if (!err) {
            return res.status(200).json({
                status: true,
                user: _.pick(user, [
                    'fullName',
                    'email',
                    'about',
                    'linkedin',
                    'photo',
                    'facebook',
                    'following',
                    'followers',
                    'liked',
                    'saved',
                    'categories'
                ])
            });
        } else {
            if (err.code === 11000) {
                res.status(422).json({message: 'Duplicate email address found.'});
            } else {
                return next(err);
            }
        }
    });
});

router.post('/login', (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(400).json(err);
        } else if (user) {

            return res.status(200).json({'token': user.generateJwt(user._id)});
        }
        // unknown user or wrong password
        else {
            return res.status(404).json(info);
        }
    })(req, res, next);
});


router.get('/profile', jwtHelper.verifyJwtToken, (req, res, next) => {
    User.findOne({_id: req._id}, (err, user) => {
        if (!user) {
            return res.status(404).json({status: false, message: 'User record not found'});
        } else {
            return res.status(200).json({
                status: true,
                user: _.pick(user, [
                    'fullName',
                    'email',
                    'about',
                    'linkedin',
                    'photo',
                    'facebook',
                    'following',
                    'followers',
                    'liked',
                    'saved',
                    'categories'
                ])
            });
        }
    });
});


module.exports = router;
