const ClientConnection = require('../../models/client');
const TokenConnection = require('../../models/token');
const generateError = require('../../utils/errorGenerator');

async function refreshToken(req, res, next) {
    const ClientCollection = await ClientConnection;
    const TokenCollection = await TokenConnection;

    const { client_id: clientId, client_secret: clientSecret, token: refreshToken } = req.body;

    try {
        const client = await ClientCollection.findOne({ clientId, clientSecret });

        if (!client) {
            return next(generateError('You can\'t revoke tokens through your application'));
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
        await TokenCollection.findOneAndDelete({
            refreshToken,
        });

        res.status(200).send({
            refresh_token: refreshToken,
        });
    } catch (e) {
        return next(e);
    }
}

module.exports = refreshToken;
