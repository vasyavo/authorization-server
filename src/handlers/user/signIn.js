const UserCollection = require('../../models/user');
const ClientCollection = require('../../models/client');
const TokenCollection = require('../../models/token');
const generateError = require('../../utils/errorGenerator');
const {encryptPassword, genAccessToken} = require('../../utils/encryptionHelper');
const {security: {expiresIn: timeToAlive}} = require('../../config');

async function signIn(req, res, next) {
    const {client_id: clientId, client_secret: clientSecret, password, username: email, scope,} = req.body;
    let userId;

    try {
        const client = await ClientCollection.findOne({clientId, clientSecret});

        if (!client) {
            return next(generateError('You can\'t sign in through your application'));
        }
    } catch (e) {
        return next(e);
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
    } catch (e) {
        return next(e);
    }

    try {
        const {hash: accessToken, expiresIn} = genAccessToken(timeToAlive);
        const {hash: refreshToken} = genAccessToken(timeToAlive);

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
            access_token : accessToken,
            refresh_token: refreshToken,
            expires_in   : expiresIn,
        });
    } catch (e) {
        return next(e);
    }
}

module.exports = signIn;
