const UserConnection = require('../../../models/user');
const ClientConnection = require('../../../models/client');
const logger = require('./../../../utils/logger');
const generateError = require('../../../utils/errorGenerator');
const {
    encryptPassword,
} = require('../../../utils/encryptionHelper');

const signIn = async (req, res, next) => {
    const UserCollection = await UserConnection;
    const ClientCollection = await ClientConnection;

    const {
        client_id: clientId,
        password,
        email,
    } = req.body;

    try {
        const credentials = {
            clientId,
        };

        const client = await ClientCollection.findOne(credentials);

        if (!client) {
            logger.error('Try to access using application credentials:', credentials);

            return next(generateError('You can\'t sign in through your application'));
        }
    } catch (error) {
        return next(error);
    }

    let userId;

    try {
        const result = await UserCollection.findOneAndUpdate({
            email,
        }, {
            $set: {
                password: encryptPassword(password),
            },
        }, {
            projection: {
                _id: 1,
            },
            returnOriginal: false,
        });

        const user = result.value;

        if (!user) {
            return next(generateError('User with such credentials doesn\'t exist'));
        }

        userId = user._id;
    } catch (error) {
        return next(error);
    }

    res.status(200).send({
        user_id: userId,
    });
}

module.exports = signIn;
