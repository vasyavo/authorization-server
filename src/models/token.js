const collectionName = require('../constants/contentType').TOKEN;
const connection = require('../utils/connection');

module.exports = (async () => {
    const db = await connection;
    const collection = await db.createCollection(collectionName, {
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
                        $type: 'array',
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

    await collection.createIndex({
        accessToken: 1,
    }, {
        unique: true,
    });

    return collection;
})();
