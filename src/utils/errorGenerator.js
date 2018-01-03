module.exports = (message = 'Bad Request', status = 400, redirect = false) => {
    const error = new Error(message);
    error.status = status;
    error.redirect = redirect;
    return error;
};
