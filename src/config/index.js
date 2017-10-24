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

const host = process.env.HOST;

config.port = parseInt(process.env.PORT, 10) || 3000;
config.host = host || 'localhost';
config.localhost = host || `https://${config.host}:${config.port}`;
config.debug = process.env.DEBUG_DEV || false;

/* Database configurations */
config.mongodbUri = process.env.MONGODB_URI;
/* Database configurations */

/* AWS S3 configurations begin */

config.webConcurrency = process.env.WEB_CONCURRENCY || 1;
config.isMaster = cluster.isMaster;

config.raml = path.join(config.workingDirectory, 'raml/api.raml');

// import this file at begin of server.js
module.exports = config;
