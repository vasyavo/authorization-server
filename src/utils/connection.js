const MongoDB = require('mongodb');

const pkg = require('./../../package.json');
const config = require('./../config');
const logger = require('./logger');

const dbUri = config.mongodbUri;

module.exports = (async () => {
    const db = await MongoDB.MongoClient.connect(dbUri, {
        poolSize: 5,
        checkServerIdentity: true,
        autoReconnect: true,
        noDelay: true,
        appname: pkg.name,
    });

    // Successfully connected
    db.on('fullsetup', () => {
        logger.info(`Driver default connection open to ${dbUri}`);
    });

    // If the connection throws an error
    db.on('error', (err) => {
        logger.error(`Driver default connection error: ${dbUri}`, err);
        this.throw(err);
    });

    // When the connection is closed
    db.on('close', () => {
        logger.error('Driver default connection disconnected');
    });

    // If the Node process ends, close the db connection
    process.on('SIGINT', () => {
        db.close(() => {
            logger.info('Driver default connection disconnected through app termination');
            process.exit(0);
        });
    });

    return db;
})();
