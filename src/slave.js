const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const co = require('co');
const addRequestId = require('express-request-id')();

const config = require('./config');
const logger = require('./utils/logger');
const osprey = require('./utils/osprey');

process.on('unhandledRejection', (reason, p) => {
    logger.error(p, reason);
});

process.on('uncaughtException', (error) => {
    logger.error(error);
});

const app = express();

co(function * () {
    app.use(addRequestId);
    app.use(compress());
    app.disable('x-powered-by');
    app.use(bodyParser.json({ extended: true }));

    {
        const {
            middleware,
            mockService,
        } = yield* osprey();

        app.use('/v1', middleware);
        app.use('/v1', mockService);
    }

    app.use(require('./utils/notFound'));
    app.use(require('./utils/errorHandler'));

    app.listen(3000, () => {
        logger.info(`Server started at port ${config.port} in ${config.env} environment:`, config);
    });
});

module.exports = app;
