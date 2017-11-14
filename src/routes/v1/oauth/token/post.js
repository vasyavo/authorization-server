const UserConnection = require('../../../../models/user');
const ClientConnection = require('../../../../models/client');
const TokenConnection = require('../../../../models/token');
const generateError = require('../../../../utils/errorGenerator');
const {
    encryptPassword,
    genAccessToken,
} = require('../../../../utils/encryptionHelper');
const ttl = require('../../../../config').security.expiresIn;

async function signIn(req, res, next) {
    const UserCollection = await UserConnection;
    const ClientCollection = await ClientConnection;
    const TokenCollection = await TokenConnection;

    const {
        client_id: clientId,
        client_secret: clientSecret,
        password,
        username: email,
        scope,
    } = req.body;

    let userId;

    try {
        const client = await ClientCollection.findOne({clientId, clientSecret});

        if (!client) {
            return next(generateError('You can\'t sign in through your application'));
        }
    } catch (error) {
        return next(error);
    }

    try {
        const user = await UserCollection.findOne({
            email,
            password: encryptPassword(password),
        });

        if (!user) {
            return next(generateError('User with such credentials doesn\'t exist'));
        }

        userId = user._id;
    } catch (error) {
        return next(error);
    }

    try {
        const {
            hash: accessToken,
            expiresIn,
        } = genAccessToken(ttl);
        const {
            hash: refreshToken,
        } = genAccessToken(ttl);

        await TokenCollection.findOneAndUpdate({
            userId,
        }, {
            $set: {
                scope,
                accessToken,
                refreshToken,
                expiresIn,
                userId,
            }
        }, {
            upsert: true,
        });

        res.status(200).send({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresIn,
            token_type: 'Bearer',
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = signIn;
