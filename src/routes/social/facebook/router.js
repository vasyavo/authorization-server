const co = require('co');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const express = require('express');
const {
    websiteUrl,
    thirdParty: {
        facebook: config,
    },
    security: {
        expiresIn: ttl,
    },
} = require('../../../config/');
const logger = require('../../../utils/logger');
const generateError = require('../../../utils/errorGenerator');
const UserConnection = require('../../../models/user');
const TokenConnection = require('../../../models/token');
const queryString = require('querystring');
const _ = require('lodash');
const {
    genAccessToken,
} = require('../../../utils/encryptionHelper');

passport.use(new FacebookStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    profileFields: ['id', 'email', 'gender', 'name'],
    enableProof: true,
}, (accessToken, refreshToken, profile, cb) => {
    co(function* () {
        let UserCollection;
        try {
            UserCollection = yield UserConnection;
        } catch (err) {
            logger.error('Error occurred during connection to UserCollection', err);
            return cb(err);
        }
        const data = (profile && profile._json) || {};
        const {
            email, first_name, last_name, gender, id,
        } = data;

        if (!email) {
            logger.log({
                level: 'error',
                message: 'Email field is required for Facebook account',
            });
            return cb(generateError('Email is required field, so you must to set it up in your Facebook account'));
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
                    version: 1,
                },
            }, {
                upsert: true,
                returnOriginal: false,
            });

            const meta = _.get(result, 'value.meta');
            const user = {
                firstName: meta.firstName,
                lastName: meta.lastName,
                email,
            };
            user.user_id = _.get(result, 'value._id');
            cb(null, user);
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

router.get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/v1/oauth/facebook/failureCallback',
    successRedirect: '/v1/oauth/facebook/successCallback',
}));

router.get('/successCallback', (req, res) => {
    co(function* () {
        let TokenCollection;
        try {
            TokenCollection = yield TokenConnection;
        } catch (err) {
            logger.error('Error occurred during connection to TokenCollection', err);
            return res.redirect(`${websiteUrl}?failureMessage=Can't sign in with Facebook`);
        }
        let user = req.user;
        let scope;
        if (req.header('x-oauth-scopes')) {
            scope = req.header('x-oauth-scopes').split(',');
        }
        const dictionary = {
            firstName: 'first_name',
            lastName: 'last_name',
        };

        user = _.mapKeys(user, (value, key) => {
            return dictionary[key] || key;
        });

        const {
            hash: accessToken,
            expiresIn,
        } = genAccessToken(ttl);
        const {
            hash: refreshToken,
        } = genAccessToken(ttl);

        try {
            yield TokenCollection.insertOne({
                accessToken,
                refreshToken,
                expiresIn,
                scope,
                userId: user.user_id,
                version: 1,
            });
        } catch (err) {
            logger.error('Error occurred during creation token', err);
            return res.redirect(`${websiteUrl}?failureMessage=Can't sign in with Facebook`);
        }

        user.token_info = JSON.stringify({
            token_type: 'Bearer',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresIn,
        });
        user.user_id = user.user_id.toString();
        const queryStr = queryString.stringify(user);

        res.redirect(`${websiteUrl}?${queryStr}`);
    });
});

router.get('/failureCallback', (req, res) => {
    logger.error('Error occurred during creation token', err);
    res.redirect(`${websiteUrl}?failureMessage=Can't sign in with Facebook`);
});

module.exports = router;
