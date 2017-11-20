const passport = require('passport');
const {Strategy: LinkedInStrategy} = require('passport-linkedin-oauth2');
const express = require('express');
const {websiteUrl, thirdParty: {linkedIn: config}} = require('../../../../config/index');

const logger = require('../../../../utils/logger');
const UserConnection = require('../../../../models/user');
const queryString = require('querystring');
const _ = require('lodash');

passport.use(new LinkedInStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['r_emailaddress', 'r_basicprofile'],
}, (accessToken, refreshToken, profile, cb) => {
    (async () => {
        const UserCollection = await UserConnection;

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
            return cb(new Error('Email is required field, so you must to set it up in your LinkedIn account'));
        }

        try {
            const result = await UserCollection.findOneAndUpdate({email}, {
                $set: {
                    email,
                    'meta.firstName': firstName,
                    'meta.lastName': lastName,
                    'meta.bio': summary,
                    'meta.country': country,
                    'social.linkedId': id,
                },
            }, {upsert: true});

            cb(null, result && result.value && result.value.meta);
        } catch (error) {
            cb(error);
        }
    })();
}));

const router = new express.Router();

router.get('/', passport.authenticate('linkedin'));

router.get('/callback', passport.authenticate('linkedin', {
    failureRedirect: '/v1/oauth/linkedIn/failureCallback',
    successRedirect: '/v1/oauth/linkedIn/successRedirect',
}));

router.get('/successRedirect', (req, res) => {
    let user = req.user;
    const dictionary = {
        firstName: 'first_name',
        lastName: 'last_name',
    };

    user = _.mapKeys(user, (value, key) => {
        return dictionary[key] || key;
    });

    const queryStr = queryString.stringify(user);

    res.redirect(`${websiteUrl}?${queryStr}`);
});

router.get('/failureCallback', (req, res) => {
    res.redirect(`${websiteUrl}?failureMessage`);
});

module.exports = router;
