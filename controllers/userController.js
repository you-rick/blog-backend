const express = require('express');
const passport = require('passport');
const jwtHelper = require('../config/jwtHelper');
const _ = require('lodash');

let router = express.Router();
let {User} = require('../models/user.model');


router.post('/register', (req, res, next) => {
    let user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        about: "",
        photo: "",
        linkedin: "",
        facebook: "",
        following: [],
        likedPosts: []
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


router.post('/authenticate', (req, res, next) => {
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
                    'likedPosts'
                ])
            });
        }
    });
});


module.exports = router;
