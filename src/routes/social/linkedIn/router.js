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
    thirdParty: {
        linkedIn: config,
        linkedIn: {
            callbackURLThirdParty,
        },
    },
    security: {
        expiresIn: ttl,
    },
} = require('../../../config');

const logger = require('../../../utils/logger');
const generateError = require('../../../utils/errorGenerator');
const UserConnection = require('../../../models/user');
const TokenConnection = require('../../../models/token');
const qs = require('qs');
const _ = require('lodash');

passport.use(new LinkedInStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['r_emailaddress', 'r_basicprofile'],
}, (accessToken, refreshToken, profile, cb) => {
    co(function* () {
        let UserCollection;
        try {
            UserCollection = yield UserConnection;
        } catch (err) {
            const message = 'Error occurred during connection to UserCollection';
            logger.error(message, err);
            return cb(generateError(message, null, callbackURLThirdParty));
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
            return cb(generateError('Email is required field, so you must to set it up in your LinkedIn account', null, callbackURLThirdParty));
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
            const message = 'Error occurred during creation User by LinkedIn';
            logger.error(message, error);
            cb(generateError(message, null, callbackURLThirdParty));
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
            const queryParams = qs.stringify({
                failure_message: 'Something went wrong',
            });

            return res.redirect(`${callbackURLThirdParty}?${queryParams}`);
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
            const queryParams = qs.stringify({
                failure_message: 'Something went wrong',
            });

            return res.redirect(`${callbackURLThirdParty}?${queryParams}`);
        }

        const queryParams = qs.stringify({
            user_id: user.user_id.toString(),
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            phone_number: user.phoneNumber,
            country: user.country,
            token_info: {
                token_type: 'Bearer',
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: expiresIn,
            },
        });

        res.redirect(`${callbackURLThirdParty}?${queryParams}`);
    });
});

router.get('/failureCallback', (req, res) => {
    const queryParams = qs.stringify({
        failure_message: 'Something went wrong',
    });

    res.redirect(`${callbackURLThirdParty}?${queryParams}`);
});

module.exports = router;
