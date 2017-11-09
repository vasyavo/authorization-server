const UserModel = require('../../models/user');
const ClientModel = require('../../models/client');
const generateError = require('../../utils/errorGenerator');
const {encryptPassword} = require('../../utils/encryptionHelper');

async function signUp(req, res, next) {
    const {client_id: clientId, email, password, user_metadata: meta} = req.body;

    try {
        const client = await ClientModel.findOne({clientId});

        if (!client) {
            return next(generateError('You can\'t sign up through your application'));
        }
    } catch (e) {
        return next(e);
    }

    try {
        const user = await UserModel.findOne({email});

        if (user) {
            return next(generateError('User with such credentials already exists'));
        }
    } catch (e) {
        return next(e);
    }

    try {
        const newUser = await UserModel.insertOne({
            email,
            password: encryptPassword(password),
            meta,
        });

        res.status(200).send({
            uid: newUser.insertedId,
            email,
        });
    } catch (e) {
        return next(e);
    }
}

module.exports = signUp;
