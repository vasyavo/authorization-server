const contentType = require('../../constants/contentType').TOKEN;
const db = require('../../utils/mongo');

db.createCollection(contentType,
    {
        validator: {
            $and: [{
                clientId: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    },
                    ],
                },
            }, {
                clientSecret: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    },
                    ],
                },
            }, {
                name: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    },
                    ],
                },
            },
            ],
        },

        validationLevel : 'strict',
        validationAction: 'error',
    }
);

db.collection(contentType).createIndex({
        clientId    : 1,
        clientSecret: 1,
        name        : 1,
    }, {
        unique: true,
    },
);

module.exports = db.collection(contentType);