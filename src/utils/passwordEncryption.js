const crypto = require('crypto');
const encryptPassword = (password) => {
    const shaSum = crypto.createHash('sha256');
    shaSum.update(password);
    return shaSum.digest('hex');
};

module.exports = encryptPassword;