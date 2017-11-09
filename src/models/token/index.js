const contentType = require('../../constants/contentType').TOKEN;
const db = require('../../utils/mongo');

db.createCollection(contentType,
    {
        validator: {
            $and: [{
                accessToken: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    },
                    ],
                },
            }, {
                refreshToken: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    },
                    ],
                },
            }, {
                expiresIn: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'number',
                    },
                    ],
                },
            }, {
                scope: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    },
                    ],
                },
            }, {
                userId: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'objectId',
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
    userId: 1,
}, {
    unique: true,
});

module.exports = db.collection(contentType);