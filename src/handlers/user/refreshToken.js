const ClientModel = require('../../models/client');
const TokenModel = require('../../models/token');
const generateError = require('../../utils/errorGenerator');
const {genAccessToken} = require('../../utils/encryptionHelper');
const {security: {expiresIn: timeToAlive}} = require('../../config');

async function refreshToken(req, res, next) {
    const {client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken,} = req.body;

    try {
        const client = await ClientModel.findOne({clientId, clientSecret});

        if (!client) {
            return next(generateError('You can\'t refresh token through your application'));
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
    } catch (e) {
        return next(e);
    }

    try {
        const {hash: accessToken, expiresIn} = genAccessToken(timeToAlive);
        const {hash: refreshToken} = genAccessToken(timeToAlive);

        await TokenModel.findOneAndUpdate({
            refreshToken,
        }, {
            $set: {
                accessToken,
                refreshToken,
                expiresIn,
            }
        });

        res.status(200).send({
            access_token : accessToken,
            refresh_token: refreshToken,
            expires_in   : expiresIn,
        });
    } catch (e) {
        return next(e);
    }
}

module.exports = refreshToken;
