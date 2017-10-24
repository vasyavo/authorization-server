const logger = require('./logger');

module.exports = (err, req, res, next) => {
    const {
        status = 500,
        stack: stackTrace = '',
        message = 'unhandled_error',
        requestErrors = [],
        description,
    } = err;
    const { id: requestId } = req;

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
