const co = require('co');
const collectionName = require('../constants/contentType').USER;
const connection = require('../utils/connection');

module.exports = co(function * () {
    const db = yield connection;

    const collection = yield db.createCollection(collectionName, {
        validator: {
            $and: [{
                email: {
                    $and: [{
                        $exists: true,
                    }, {
                        $type: 'string',
                    }],
                },
            }, {
                password: {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    }],
                },
            }, {
                'meta.gender': {
                    $or: [{
                        $in: ['male', 'female'],
                    }, {
                        $exists: false,
                    }],
                },
            }, {
                'meta.firstName': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    }],
                },
            }, {
                'meta.lastName': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    }],
                },
            }, {
                'social.facebookId': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    }],
                },
            }, {
                'meta.linkedInId': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    }],
                },
            }, {
                'meta.bio': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    }],
                },
            }, {
                'meta.country': {
                    $or: [{
                        $type: 'string',
                    }, {
                        $exists: false,
                    }],
                },
            },
            ],
        },

        validationLevel: 'strict',
        validationAction: 'error',
    });

    yield collection.createIndex({
        email: 1,
    }, {
        unique: true,
    });

    return collection;
});
