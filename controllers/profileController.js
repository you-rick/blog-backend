const express = require('express');
const passport = require('passport');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const jwtHelper = require('../config/jwtHelper');
const {fileImageHandler} = require('../config/imageUpload');
const _ = require('lodash');

let router = express.Router();
let {User} = require('../models/user.model');


router.post('/register', fileImageHandler.single('photo'), async (req, res, next) => {
    let photoURL = 'static/images/default-avatar.png';
    let registerDate = new Date();

    req.fileValidationError && res.send({status: false, message: req.fileValidationError});

    if (req.file) {
        const {filename: image} = req.file;

        sharp(req.file.path)
            .resize(500)
            .jpeg({quality: 100})
            .toFile(path.resolve(req.file.destination, 'resized', image)
            ).then(data => {
            fs.unlinkSync(req.file.path);
        }).catch(err => {
            console.log(err);
        });

        photoURL = `uploads/resized/${image}`;
    }


    let user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        about: req.body.about,
        photo: photoURL,
        linkedin: req.body.linkedin,
        facebook: req.body.facebook,
        categories: req.body.categories,
        following: [],
        followers: [],
        saved: [],
        liked: [],
        date: registerDate.toString()
    });

    user.save((err, doc) => {
        if (!err) {
            return res.status(200).json({status: true, message: "successful registration"});
        } else {
            if (err.code === 11000) {
                return res.status(422).json({status: false, message: 'Duplicate email address found.'});
            } else {
                return res.status(400).json(err);
            }
        }
    });
});

router.put('/update', jwtHelper.verifyJwtToken, fileImageHandler.single('photo'), (req, res, next) => {
    let user = {
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
    };

    user.save((err, doc) => {
        if (!err) {
            return res.status(200).json({
                status: true,
                user: _.pick(doc, [
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
                    'categories',
                    'date'
                ])
            });
        } else {
            if (err.code === 11000) {
                res.status(422).json({message: 'Duplicate email address found.'});
            } else {
                return res.status(400).json(err);
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

            return res.status(200).json({status: true, 'token': user.generateJwt(user._id)});
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
                    'categories',
                    'date'
                ])
            });
        }
    });
});


module.exports = router;
