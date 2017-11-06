const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const express = require('express');
const config = require('../../../config/index').thirdParty.facebook;

passport.use(new FacebookStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: 'https://yhxxhzdmwu.localtunnel.me/v1/oauth/facebook/callback',
    profileFields: ['id', 'email', 'gender', 'name'],
    enableProof: true,
}, (accessToken, refreshToken, profile, cb) => {
    // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    //     return cb(err, user);
    // });
    // todo if user has no email than say him "Good bye!"
    cb();
}));

const router = new express.Router();

router.get('/', passport.authenticate('facebook', {
    authType: 'rerequest',
    scope: ['public_profile', 'email'],
    return_scopes: true,
}));

router.get('/callback', passport.authenticate('facebook', {failureRedirect: '/v1/oauth/facebook/failureCallback'}),
    (req, res) => {
        /*
        * 1. Check existing account by email
        * 2.
        * */
        console.log();
        res.redirect('/');
    });

router.get('/failureCallback', (req, res) => {
    res.redirect('/');
});

module.exports = router;
