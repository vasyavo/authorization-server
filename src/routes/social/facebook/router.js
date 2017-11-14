const co = require('co');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const express = require('express');
const config = require('../../../config/index').thirdParty.facebook;
const logger = require('../../../utils/logger');
const UserConnection = require('../../../models/user');

passport.use(new FacebookStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    profileFields: ['id', 'email', 'gender', 'name'],
    enableProof: true,
}, (accessToken, refreshToken, profile, cb) => {
    co(function * () {
        const UserCollection = yield UserConnection;

        const data = (profile && profile._json) || {};
        const {
            email, first_name, last_name, gender, id,
        } = data;

        if (!data.email) {
            logger.log({
                level: 'error',
                message: 'Email field is required for Facebook account',
            });
            return cb(new Error('Email is required field, so you must to set it up in your Facebook account'));
        }

        try {
            const result = yield UserCollection.findOneAndUpdate({
                email,
            }, {
                $set: {
                    email,
                    'meta.firstName': first_name,
                    'meta.lastName': last_name,
                    'meta.gender': gender,
                    'social.facebookId': id,
                },
            }, { upsert: true });

            cb(null, result);
        } catch (error) {
            cb(error);
        }
    });
}));

const router = new express.Router();

router.get('/', passport.authenticate('facebook', {
    authType: 'rerequest',
    scope: ['public_profile', 'email'],
    return_scopes: true,
}));

router.get('/callback', passport.authenticate('facebook', {failureRedirect: '/v1/oauth/facebook/failureCallback'}),
    (req, res) => {
        res.redirect('/');
    });

router.get('/failureCallback', (req, res) => {
    res.redirect('/');
});

module.exports = router;
