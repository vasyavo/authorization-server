const TokenConnection = require('../../../models/token');

async function signIn(req, res, next) {
    const TokenCollection = await TokenConnection;

    const { access_token: accessToken } = req.query;

    let userId;

    try {
        const tokenInfo = await TokenCollection.findOne({ accessToken });

        if (!tokenInfo) {
            return next(new Error('Invalid access token.'));
        }

        userId = tokenInfo.userId;
    } catch (error) {
        return next(error);
    }

    res.status(200).send({
        user_id: userId,
    });
}

module.exports = signIn;
