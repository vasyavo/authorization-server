const co = require('co');
const collectionName = require('../constants/contentType').USER;
const connection = require('../utils/connection');

module.exports = co(function * () {
    const db = yield connection;

    const collection = yield db.createCollection(collectionName, {
        validator: {
            $or: [
                {
                    version: 1,
                    email: {
                        $exists: true,
                        $type: 'string',
                    },
                    password: {
                        $exists: true,
                        $type: 'string',
                    },
                    $or: [
                        { meta: {
                            $type: 'object',
                        } },
                        { 'meta.gender': {
                            $in: ['male', 'female'],
                            $type: 'string',
                        } },
                        { 'meta.firstName': {
                            $type: 'string',
                        } },
                        { 'meta.lastName': {
                            $type: 'string',
                        } },
                        { 'meta.bio': {
                            $type: 'string',
                        } },
                        { 'meta.country': {
                            $type: 'string',
                        } },
                    ],
                },
                {
                    version: 1,
                    'social.facebookId': {
                        $exists: true,
                        $type: 'string',
                    },
                    $or: [
                        { email: {
                            $type: 'string',
                        } },
                        { meta: {
                            $type: 'object',
                        } },
                        { 'meta.gender': {
                            $in: ['male', 'female'],
                            $type: 'string',
                        } },
                        { 'meta.firstName': {
                            $type: 'string',
                        } },
                        { 'meta.lastName': {
                            $type: 'string',
                        } },
                    ],
                },
                {
                    version: 1,
                    'social.linkedInId': {
                        $exists: true,
                        $type: 'string',
                    },
                    $or: [
                        { email: {
                            $type: 'string',
                        } },
                        { meta: {
                            $type: 'object',
                        } },
                        { 'meta.firstName': {
                            $type: 'string',
                        } },
                        { 'meta.lastName': {
                            $type: 'string',
                        } },
                        { 'meta.bio': {
                            $type: 'string',
                        } },
                        { 'meta.country': {
                            $type: 'string',
                        } },
                    ],
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
