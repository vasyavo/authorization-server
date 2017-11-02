const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const express = require('express');
const config = require('./../../config').thirdParty.facebook;

passport.use(new FacebookStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
}, (accessToken, refreshToken, profile, cb) => {
    // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    //     return cb(err, user);
    // });
    console.log();
    cb();
}));

const router = new express.Router();

router.get('/', passport.authenticate('facebook'));

router.get('/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        /*
        * 1. Check existing account by email
        * 2.
        * */
        console.log();
        res.redirect('/');
    });

module.exports = router;
