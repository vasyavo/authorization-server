const passport = require('passport');
const {Strategy: LinkedInStrategy} = require('passport-linkedin-oauth2');
const express = require('express');
const config = require('../../../config/index').thirdParty.linkedIn;
const logger = require('../../../utils/logger');
const UserModel = require('../../../models/user');

passport.use(new LinkedInStrategy({
    clientID    : config.clientId,
    clientSecret: config.clientSecret,
    callbackURL : config.callbackURL,
    scope       : ['r_emailaddress', 'r_basicprofile'],
}, (accessToken, refreshToken, profile, cb) => {
    const data = (profile && profile._json) || {};
    const {emailAddress : email, firstName, lastName, id} = data;

    if (!data.email) {
        logger.log({
            level  : 'error',
            message: 'Email field is required for LinkedIn account',
        });
        return cb(new Error('Email is required field, so you must to set it up in your LinkedIn account'));
    }

    UserModel.findOneAndUpdate({email}, {
        $set: {
            email,
            'meta.firstName' : firstName,
            'meta.lastName'  : lastName,
            'social.linkedId': id,
        }
    }, {upsert: true}, (err, result) => {
        if (err) {
            return cb(err);
        }

        cb(null, result);
    });
}));

const router = new express.Router();

router.get('/', passport.authenticate('linkedin', {
    state: 'SOME STATE',
}));

router.get('/callback', passport.authenticate('linkedin', {failureRedirect: '/v1/oauth/linkedIn/failureCallback'}),
    (req, res) => {
        console.log();
        res.redirect('/');
    });

router.get('/failureCallback', (req, res) => {
    res.redirect('/');
});

module.exports = router;
