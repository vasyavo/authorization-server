module.exports = (message = 'Bad Request', status = 400, redirectUrl = '') => {
    const error = new Error(message);
    error.status = status;
    error.redirectUrl = redirectUrl;
    return error;
};
