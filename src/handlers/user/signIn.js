const UserModel = require('../../models/user');
const ClientModel = require('../../models/client');
const TokenModel = require('../../models/token');
const generateError = require('../../utils/errorGenerator');
const {encryptPassword, genAccessToken} = require('../../utils/encryptionHelper');

async function signIn(req, res, next) {
    const {client_id: clientId, client_secret: clientSecret, password, username: email, scope} = req.body;
    let userId;

    try {
        const client = await ClientModel.findOne({clientId, clientSecret});

        if (!client) {
            return next(generateError('You can\'t sign in through your application'));
        }
    } catch (e) {
        return next(e);
    }

    try {
        const user = await UserModel.findOne({
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
        const {hash: accessToken, expiresIn} = genAccessToken(8640);
        const {hash: refreshToken} = genAccessToken(8640);

        await TokenModel.findOneAndUpdate({
            userId,
        }, {
            $set: {
                scope,
                accessToken,
                refreshToken,
                expiresIn,
                userId,
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

module.exports = signIn;
