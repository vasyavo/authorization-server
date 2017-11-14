const co = require('co');
const collectionName = require('../constants/contentType').TOKEN;
const connection = require('../utils/connection');

module.exports = co(function * () {
    const db = yield connection;

    const collection = yield db.createCollection(collectionName, {
        validator: {
            $and: [{
                accessToken: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    }],
                },
            }, {
                refreshToken: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    }],
                },
            }, {
                expiresIn: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'number',
                    }],
                },
            }, {
                scope: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    }],
                },
            }, {
                userId: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'objectId',
                    }],
                },
            },
            ],
        },

        validationLevel: 'strict',
        validationAction: 'error',
    });

    yield collection.createIndex({
        userId: 1,
    }, {
        unique: true,
    });

    return collection;
});
