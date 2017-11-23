const ClientConnection = require('../../../../models/client');
const TokenConnection = require('../../../../models/token');
const generateError = require('../../../../utils/errorGenerator');
const {
    encryptPassword,
    genAccessToken,
} = require('../../../../utils/encryptionHelper');
const ttl = require('../../../../config').security.expiresIn;

async function signIn(req, res, next) {
    const body = req.body;

    const ClientCollection = await ClientConnection;
    const TokenCollection = await TokenConnection;

    const tokenInfo = {
        clientId: body.client_id,
        clientSecret: body.client_secret,
        accessToken: body.access_token,
        scope: body.scope,
    };

    try {
        const client = await ClientCollection.findOne({
            clientId: tokenInfo.clientId,
            clientSecret: tokenInfo.clientSecret,
        });

        if (!client) {
            return next(generateError('You can\'t sign in through your application'));
        }
    } catch (error) {
        return next(error);
    }

    const newTokenInfo = {
        token_type: 'Bearer',
    };

    try {
        const {
            hash: accessToken,
            expiresIn,
        } = genAccessToken(ttl);
        const {
            hash: refreshToken,
        } = genAccessToken(ttl);
        const timestamp = Date.now();

        const query = {
            accessToken: tokenInfo.accessToken,
            scope: {
                $in: tokenInfo.scope,
            },
            expiresIn: {
                $lt: timestamp,
            },
        };
        const options = {
            projection: {
                accessToken: 1,
                refreshToken: 1,
                expiresIn: 1,
            },
            returnOriginal: false,
        };

        const result = await TokenCollection.findOneAndUpdate(query, {
            $set: {
                accessToken,
                refreshToken,
                expiresIn,
            }
        }, options);

        if (!result.value) {
            return next(new Error('Invalid access token.'));
        }

        newTokenInfo.access_token = result.value.accessToken;
        newTokenInfo.refresh_token = result.value.refreshToken;
        newTokenInfo.expires_in = result.value.expiresIn;
    } catch (error) {
        return next(error);
    }

    res.status(200).send(newTokenInfo);
}

module.exports = signIn;
