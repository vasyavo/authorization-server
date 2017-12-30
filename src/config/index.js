const path = require('path');
const cluster = require('cluster');

const config = {};

// for example NODE_ENV is development
config.env = process.env.NODE_ENV;
config.logLevel = process.env.LOG_LEVEL || 'info';
config.isTest = process.env.NODE_ENV === 'test';

// at this moment environment variables will be imported from .env.development
// if NODE_ENV not provided then dotenv will import variables from .env
require('dotenv').config({
    path: path.join(__dirname, `.env${config.env ? `.${config.env}` : ''}`).normalize(),
});

config.workingDirectory = path.join(__dirname, '../../');

config.port = parseInt(process.env.PORT, 10) || 3000;
config.debug = process.env.DEBUG_DEV || false;

/* Database configurations */
config.mongodbUri = process.env.MONGODB_URI;
/* Database configurations */

/* AWS S3 configurations begin */

config.webConcurrency = process.env.WEB_CONCURRENCY || 1;
config.isMaster = cluster.isMaster;
config.security = {
    expiresIn: process.env.TOKEN_EXPIRES_IN || 60 * 60 * 24 * 2 * 1000, // 2 days
};

config.raml = path.join(config.workingDirectory, 'raml/api.raml');
config.ramlDoc = path.join(config.workingDirectory, 'docs/api.html');

config.thirdParty = {
    facebook: {
        clientId: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        callbackURLThirdParty: process.env.FACEBOOK_CALLBACK_URL_THIRD_PARTY,
    },
    linkedIn: {
        clientId: process.env.LINKED_IN_APP_ID,
        clientSecret: process.env.LINKED_IN_APP_SECRET,
        callbackURL: process.env.LINKED_IN_CALLBACK_URL,
        callbackURLThirdParty: process.env.LINKED_IN_CALLBACK_URL_THIRD_PARTY,
    },
};

config.websiteUrl = process.env.WEBSITE_URL;

// import this file at begin of server.js
module.exports = config;
