const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//const mongoose = require('mongoose');

let {User} = require('../models/user.model');

passport.use(
    // change default usernameField to email
    new LocalStrategy({usernameField: 'email'}, (username, password, done) => {
        // Check if there is relevant user in db
        User.findOne({email: username}, (err, user) => {

            if (err) {
                done(err);
            }
            // there is no this user in system
            else if (!user) {
                return done(null, false, {message: 'Email is not registered'});
            }
            // password is not correct
            else if (!user.verifyPassword(password, user.password)) {
                return done(null, false, {message: 'Password is not correct'});
            } else {
                return done(null, user);
            }
        });
    })
);
