const Schema = require('mongoose').Schema;
const CONTENT_TYPES = require('../../constants/contentType');

const ObjectId = Schema.Types.ObjectId;

const schema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
    },
    meta: {
        firstName: {
            type: String,
            default: '',
        },
        lastName: {
            type: String,
            default: '',
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
        },
    },
    social: {
        facebookId: {
            type: String,
            default: null,
        },
        linkedInId: {
            type: String,
            default: null,
        },
    },
}, {
    autoIndex: false,
    collection: `${CONTENT_TYPES.USER}s`,
    versionKey: false,
});

schema.virtual('fullName').get(function() {
    return `${this.meta.firstName} ${this.meta.lastName}`;
});

schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });
schema.index({ email: 1 }, { unique: true });

module.exports = schema;
