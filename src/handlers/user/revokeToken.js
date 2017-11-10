const ClientModel = require('../../models/client');
const TokenModel = require('../../models/token');
const generateError = require('../../utils/errorGenerator');
const {genAccessToken} = require('../../utils/encryptionHelper');
const {security: {expiresIn: timeToAlive}} = require('../../config');

async function refreshToken(req, res, next) {
    const {client_id: clientId, client_secret: clientSecret, token: refreshToken,} = req.body;

    try {
        const client = await ClientModel.findOne({clientId, clientSecret});

        if (!client) {
            return next(generateError('You can\'t revoke tokens through your application'));
        }
    } catch (e) {
        return next(e);
    }

    try {
        const token = await TokenModel.findOne({
            refreshToken,
        });

        if (!token) {
            return next(generateError('Token with such refresh token doesn\'t exist'));
        }

         /* TODO There are 3 cases if the access_token is invalid:  1)We refresh and revoke just refreshed token    2)We send message that client must refresh this token   3)We only revoke it*/
    } catch (e) {
        return next(e);
    }
}

module.exports = refreshToken;
