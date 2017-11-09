const UserModel = require('../../models/user');
const ClientModel = require('../../models/client');
const generateError = require('../../utils/errorGenerator');
const encryptPassword = require('../../utils/passwordEncryption');

async function signUp(req, res) {
    const {client_id: clientId, email, password, user_metadata: meta} = req.body;

    try {
        const client = await ClientModel.findOne({clientId});

        if (!client) {
            throw generateError('You can\'t sign up through your application');
        }
    } catch (e) {
        throw e;
    }

    try {
        const user = await UserModel.findOne({email});

        if (user) {
            throw generateErrornew('User with such credentials already exists');
        }
    } catch (e) {
        throw e;
    }

    try {
        const newUser = await UserModel.save({
            email,
            encryptPassword(password),
            meta,
        });

        res.status(200).send(newUser);
    } catch (e) {
        throw e;
    }
}

module.exports = signUp;
