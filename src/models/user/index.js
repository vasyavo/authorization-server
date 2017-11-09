const contentType = require('../../constants/contentType').USER;
const db = require('../../utils/mongo');

db.createCollection(contentType,
    {
        validator: {
            $and: [{
                email: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    },
                    ],
                },
            }, {
                password: {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    },
                    ],
                },
            }, {
                'meta.gender': {
                    $or: [{
                        $in: ['male', 'female'],
                    }, {
                        $exists: false,
                    },
                    ],
                },
            }, {
                'meta.firstName': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    },
                    ],
                },
            }, {
                'meta.lastName': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    },
                    ],
                },
            }, {
                'social.facebookId': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    },
                    ],
                },
            }, {
                'meta.linkedInId': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
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
        email: 1,
    }, {
        unique: true,
    },
);

module.exports = db.collection(contentType);