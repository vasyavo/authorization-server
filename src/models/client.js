const co = require('co');
const collectionName = require('../constants/contentType').CLIENT;
const connection = require('../utils/connection');

module.exports = co(function * () {
    const db = yield connection;

    const collection = yield db.createCollection(collectionName, {
        validator: {
            $and: [
                { clientId: {
                    $exists: true,
                    $type: 'string',
                } },
                { clientSecret: {
                    $exists: true,
                    $type: 'string',
                } },
                { name: {
                    $exists: true,
                    $type: 'string',
                } },
            ],
        },
        validationLevel: 'strict',
        validationAction: 'error',
    });

    yield collection.createIndex({
        clientId: 1,
        clientSecret: 1,
        name: 1,
    }, {
        unique: true,
    });

    return collection;
});
