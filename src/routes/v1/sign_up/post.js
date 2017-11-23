const UserConnection = require('../../../models/user');
const ClientConnection = require('../../../models/client');
const generateError = require('../../../utils/errorGenerator');
const logger = require('./../../../utils/logger');
const { encryptPassword } = require('../../../utils/encryptionHelper');

async function signUp(req, res, next) {
    const UserCollection = await UserConnection;
    const ClientCollection = await ClientConnection;

    const {
        client_id: clientId,
        email,
        password,
        user_metadata: meta,
    } = req.body;

    try {
        const client = await ClientCollection.findOne({ clientId });

        if (!client) {
            return next(generateError('You can\'t sign up through your application'));
        }
    } catch (error) {
        return next(error);
    }

    try {
        const user = await UserCollection.findOne({ email });

        if (user) {
            return next(generateError('User with such credentials already exists'));
        }
    } catch (error) {
        return next(error);
    }

    try {
        const newUser = await UserCollection.insertOne({
            email,
            password: encryptPassword(password),
            meta: {
                gender: meta.gender,
                firstName: meta.firstName,
                lastName: meta.lastName,
                bio: meta.bio,
                country: meta.country,
            },
            version: 1,
        });

        res.status(200).send({
            uid: newUser.insertedId,
            email,
        });
    } catch (error) {
        logger.error('Error occurred during user registration', error);

        return next(error);
    }
}

module.exports = signUp;
