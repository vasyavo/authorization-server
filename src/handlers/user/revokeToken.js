const ClientModel = require('../../models/client');
const TokenModel = require('../../models/token');
const generateError = require('../../utils/errorGenerator');

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

    } catch (e) {
        return next(e);
    }

    try {
        await TokenModel.findOneAndDelete({
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
