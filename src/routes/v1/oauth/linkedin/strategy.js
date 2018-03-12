const co = require('co');
const _ = require('lodash');
const { Strategy: LinkedInStrategy } = require('passport-linkedin-oauth2');
const {
    thirdParty: {
        linkedIn: config,
    },
} = require('../../../../config');

const logger = require('../../../../utils/logger');
const UserConnectionPromise = require('../../../../models/user');

module.exports = new LinkedInStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['r_emailaddress', 'r_basicprofile'],
}, (accessToken, refreshToken, profile, cb) => {
    co(function * () {
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

        let user;

        try {
            const UserCollection = yield UserConnectionPromise;
            const query = {
                'social.linkedInId': id,
            };
            const update = {
                $set: {
                    email,
                    'meta.firstName': firstName,
                    'meta.lastName': lastName,
                    'meta.bio': summary,
                    'meta.country': country,
                    version: 1,
                },
            };
            const options = {
                upsert: true,
                returnOriginal: false,
            };

            const result = yield UserCollection.findOneAndUpdate(query, update, options);

            const meta = _.get(result, 'value.meta');

            user = {
                firstName: meta.firstName,
                lastName: meta.lastName,
                email,
                user_id: _.get(result, 'value._id')
            };
        } catch (error) {
            logger.error('Error occurred during authorization using LinkedIn strategy', error);

            cb(error);
        }

        cb(null, user);
    });
});
