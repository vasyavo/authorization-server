const qs = require('qs');
const _ = require('lodash');
const mongodb = require('mongodb');

const {
    genAccessToken,
} = require('../../../../utils/encryptionHelper');
const {
    thirdParty: {
        facebook: {
            callbackURLThirdParty,
        },
    },
    security: {
        expiresIn: ttl,
    },
    xOauthScopes,
} = require('../../../../config');

const ObjectID = mongodb.ObjectID;

const logger = require('../../../../utils/logger');
const TokenCollectionPromise = require('../../../../models/token');

module.exports = async (req, res, next) => {
    let user = _.get(req, 'session.passport.user');
    let scope = xOauthScopes && xOauthScopes.split(',');
    if (req.header('x-oauth-scopes')) {
        scope = req.header('x-oauth-scopes').split(',');
    }

    const {
        hash: accessToken,
        expiresIn,
    } = genAccessToken(ttl);
    const {
        hash: refreshToken,
    } = genAccessToken(ttl);

    try {
        const TokenCollection = await TokenCollectionPromise;
        const data = {
            accessToken,
            refreshToken,
            expiresIn,
            scope,
            userId: ObjectID(user.user_id),
            version: 1,
        };

        await TokenCollection.insertOne(data);
    } catch (error) {
        logger.error('Error occurred while processing success callback', error);

        const queryString = qs.stringify({
            failure_message: 'Something went wrong',
        });

        return res.redirect(`${callbackURLThirdParty}?${queryString}`);
    }

    const queryString = qs.stringify({
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

    res.redirect(`${callbackURLThirdParty}?${queryString}`);
};
