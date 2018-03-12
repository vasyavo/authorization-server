const logger = require('./logger');
const qs = require('qs');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    const {
        status = 500,
        stack: stackTrace = '',
        message = 'unhandled_error',
        requestErrors = [],
        description,
        redirectUrl,
    } = err;
    const {
        id: requestId,
    } = req;

    if (redirectUrl) {
        const queryParams = qs.stringify({
            failure_message: 'Something went wrong',
        });
        logger.error(`${message}. Stack trace: ${stackTrace}`);
        return res.redirect(`${redirectUrl}?${queryParams}`);
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
