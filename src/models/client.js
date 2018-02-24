const collectionName = require('../constants/contentType').CLIENT;
const connection = require('../utils/connection');

module.exports = (async () => {
    const db = await connection;
    const collection = await db.createCollection(collectionName);

    yield db.command({
        collMod: collectionName,
        validator: {
            $or: [
                {
                    version: 1,
                    $and: [
                        {
                            clientId: {
                                $exists: true,
                                $type: 'string',
                            }
                        },
                        {
                            clientSecret: {
                                $exists: true,
                                $type: 'string',
                            }
                        },
                        {
                            name: {
                                $exists: true,
                                $type: 'string',
                            }
                        },
                    ],
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
