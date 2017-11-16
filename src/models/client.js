const collectionName = require('../constants/contentType').CLIENT;
const connection = require('../utils/connection');

module.exports = (async () => {
    const db = await connection;
    const collection = await db.createCollection(collectionName, {
        validator: {
            $and: [{
                clientId: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    }],
                },
            }, {
                clientSecret: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    }],
                },
            }, {
                name: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    }],
                },
            },
            ],
        },

        validationLevel: 'strict',
        validationAction: 'error',
    });

    await collection.createIndex({
        clientId: 1,
        clientSecret: 1,
        name: 1,
    }, {
        unique: true,
    });

    return collection;
})();
