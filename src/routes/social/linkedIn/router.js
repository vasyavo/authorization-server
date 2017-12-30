const co = require('co');
const passport = require('passport');
const {Strategy: LinkedInStrategy} = require('passport-linkedin-oauth2');
const express = require('express');
const mongo = require('mongodb');
const ObjectID = mongo.ObjectID;
const {
    genAccessToken,
} = require('../../../utils/encryptionHelper');
const {
    websiteUrl,
    thirdParty: {
        linkedIn: config,
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

passport.use(new LinkedInStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['r_emailaddress', 'r_basicprofile'],
    state: true,
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
            emailAddress: email,
            firstName,
            lastName,
            id,
            summary,
            location: {
                name: country,
            },
        } = data;

        if (!email) {
            logger.log({
                level: 'error',
                message: 'Email field is required for LinkedIn account',
            });
            return cb(generateError('Email is required field, so you must to set it up in your LinkedIn account'));
        }

        try {
            const result = yield UserCollection.findOneAndUpdate({
                email,
            }, {
                $set: {
                    email,
                    'meta.firstName': firstName,
                    'meta.lastName': lastName,
                    'meta.bio': summary,
                    'meta.country': country,
                    'social.linkedInId': id,
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

router.get('/', passport.authenticate('linkedin'));

router.get('/callback', passport.authenticate('linkedin', {
    failureRedirect: '/v1/oauth/linkedIn/failureCallback',
    successRedirect: '/v1/oauth/linkedIn/successCallback',
}));

router.get('/successCallback', (req, res) => {
    co(function* () {
        let TokenCollection;
        try {
            TokenCollection = yield TokenConnection;
        } catch (err) {
            logger.error('Error occurred during connection to TokenCollection', err);
            return res.redirect(`${websiteUrl}?failureMessage=Can't sign in with LinkedIn`);
        }
        let user = _.get(req, 'session.passport.user');
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
                userId: ObjectID(user.user_id),
                version: 1,
            });
        } catch (err) {
            logger.error('Error occurred during creation token', err);
            return res.redirect(`${websiteUrl}?failureMessage=Can't sign in with LinkedIn`);
        }
        user.token_info = JSON.stringify({
            token_type: 'Bearer',
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresIn,
        });

        const queryStr = queryString.stringify(user);
        res.redirect(`${websiteUrl}?${queryStr}`);
    });
});

router.get('/failureCallback', (req, res) => {
    logger.error('Can\'t sign in with LinkedIn', generateError());
    res.redirect(`${websiteUrl}?failureMessage=Can't sign in with LinkedIn`);
});

module.exports = router;
