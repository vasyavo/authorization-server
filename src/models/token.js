const co = require('co');
const collectionName = require('../constants/contentType').TOKEN;
const connection = require('../utils/connection');

module.exports = co(function * () {
    const db = yield connection;

    const collection = yield db.createCollection(collectionName, {
        validator: {
            $and: [
                { accessToken: {
                    $exists: true,
                    $type: 'string',
                } },
                { refreshToken: {
                    $exists: true,
                    $type: 'string',
                } },
                { expiresIn: {
                    $exists: true,
                    $type: 'number',
                } },
                { scope: {
                    $exists: true,
                    $type: 'array',
                } },
                { userId: {
                    $exists: true,
                    $type: 'objectId',
                } },
                { createdAt: {
                    $exists: true,
                    $type: 'date',
                } },
            ],
        },
        validationLevel: 'strict',
        validationAction: 'error',
    });

    yield collection.createIndex({
        accessToken: 1,
    }, {
        unique: true,
    });

    return collection;
});
