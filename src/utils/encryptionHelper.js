const crypto = require('crypto');
const uuid = require('uuid');

const encryptPassword = (password) => {
    const shaSum = crypto.createHash('sha256');
    shaSum.update(password);
    return shaSum.digest('hex');
};

const genAccessToken = (expiration) => {
    const token = uuid.v4();
    const tokenHash = crypto.createHash('sha512').update(token).digest('hex');
    const now = Date.now();
    const expiresIn = now + expiration;

    return {
        hash: tokenHash,
        expiresIn,
    };
};

module.exports = {
    encryptPassword,
    genAccessToken,
};

