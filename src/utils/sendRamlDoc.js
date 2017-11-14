const config = require('./../config');

module.exports = (req, res, next) => {
    res.sendFile(config.ramlDoc);
};
