const config = require('./../config');

// eslint-disable-next-line no-unused-vars
module.exports = (req, res, next) => {
    res.sendFile(config.ramlDoc);
};
