const co = require('co');
const _ = require('lodash');
const FacebookStrategy = require('passport-facebook');

const {
    thirdParty: {
        facebook: config,
    },
} = require('../../../../config/index');
const logger = require('../../../../utils/logger');
const UserCollectionPromise = require('../../../../models/user');

module.exports = new FacebookStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    profileFields: ['id', 'email', 'gender', 'name'],
    enableProof: true,
}, (accessToken, refreshToken, profile, cb) => {
    co(function * () {
        const data = (profile && profile._json) || {};
        const {
            email,
            first_name,
            last_name,
            id,
            gender,
        } = data;

        let user;

        try {
            const UserCollection = yield UserCollectionPromise;
            const query = {
                'social.facebookId': id,
            };
            const update = {
                $set: {
                    email,
                    'meta.firstName': first_name,
                    'meta.lastName': last_name,
                    'meta.gender': gender,
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
                user_id: _.get(result, 'value._id'),
            };
        } catch (error) {
            logger.error('Error occurred during authorization using Facebook strategy', error);

            cb(error);
        }

        cb(null, user);
    });
});
