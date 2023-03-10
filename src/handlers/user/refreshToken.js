const ClientConnection = require('../../models/client');
const TokenConnection = require('../../models/token');
const generateError = require('../../utils/errorGenerator');
const { genAccessToken } = require('../../utils/encryptionHelper');
const { security: { expiresIn: timeToAlive } } = require('../../config');

async function refreshToken(req, res, next) {
    const ClientCollection = await ClientConnection;
    const TokenCollection = await TokenConnection;

    const { client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken } = req.body;

    try {
        const client = await ClientCollection.findOne({ clientId, clientSecret });

        if (!client) {
            return next(generateError('You can\'t refresh token through your application'));
        }
    } catch (e) {
        return next(e);
    }

    try {
        const token = await TokenCollection.findOne({
            refreshToken,
        });

        if (!token) {
            return next(generateError('Token with such refresh token doesn\'t exist'));
        }
    } catch (e) {
        return next(e);
    }

    try {
        const { hash: accessToken, expiresIn } = genAccessToken(timeToAlive);
        const { hash: refreshToken } = genAccessToken(timeToAlive);

        await TokenCollection.findOneAndUpdate({
            refreshToken,
        }, {
            $set: {
                accessToken,
                refreshToken,
                expiresIn,
                version: 1,
            },
        }, {
            returnOriginal: false,
        });

        res.status(200).send({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresIn,
        });
    } catch (e) {
        return next(e);
    }
}

module.exports = refreshToken;
