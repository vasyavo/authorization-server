const co = require('co');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook');
const express = require('express');
const {
    thirdParty: {
        facebook: config,
        callbackURLThirdParty,
    },
    security: {
        expiresIn: ttl,
    },
} = require('../../../config');
const logger = require('../../../utils/logger');
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
        const UserCollection = yield UserConnection;

        const data = (profile && profile._json) || {};
        const {
            email, first_name, last_name, gender, id,
        } = data;

        if (!email) {
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

router.get('/callback', passport.authenticate('facebook', {failureRedirect: '/v1/oauth/facebook/failureCallback'}),
    (req, res) => {
        co(function* () {
            const TokenCollection = yield TokenConnection;
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

            yield TokenCollection.insertOne({
                accessToken,
                refreshToken,
                expiresIn,
                scope,
                userId: user.user_id,
                version: 1,
            });
            user.token_info = JSON.stringify({
                token_type: 'Bearer',
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: expiresIn,
            });
            user.user_id = user.user_id.toString();

            const queryParams = queryString.stringify(user);

            res.redirect(`${callbackURLThirdParty}?${queryParams}`);
        });
    });

router.get('/failureCallback', (req, res) => {
    const queryParams = queryString.stringify({
        failure_message: 'Something went wrong',
    });

    res.redirect(`${callbackURLThirdParty}?${queryParams}`);
});

module.exports = router;
