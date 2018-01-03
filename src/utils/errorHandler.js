const logger = require('./logger');
const config = require('../config/');

module.exports = (err, req, res, next) => {
    const {
        status = 500,
        stack: stackTrace = '',
        message = 'unhandled_error',
        requestErrors = [],
        description,
        redirect,
    } = err;
    const {
        id: requestId,
    } = req;

    if (redirect) {
        logger.error(`${message}. Stack trace: ${stackTrace}`);
        return res.redirect(`${config.websiteUrl}?failureMessage=${message}`);
    }

    const body = {
        requestId,
        statusCode: status,
        message,
        errors: requestErrors,
        description,
    };

    logger.error(body, `Stack trace: ${stackTrace}`);

    res.status(status).send(body);
};
