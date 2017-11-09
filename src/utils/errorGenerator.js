module.exprts = (message = 'Bad Request', status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
};
