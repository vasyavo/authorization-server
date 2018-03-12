const TokenConnection = require('../../../models/token');
const contentTypes = require('../../../constants/contentType');

async function signIn(req, res, next) {
    const TokenCollection = await TokenConnection;

    const { access_token: accessToken } = req.query;

    let user;

    try {
        const pipeline = [
            {
                $match: {
                    accessToken,
                },
            },
            {
                $project: {
                    user: '$userId',
                },
            },
            {
                $lookup: {
                    from: contentTypes.USER,
                    foreignField: '_id',
                    localField: 'user',
                    as: 'users',
                },
            },
            {
                $unwind: {
                    path: '$users',
                },
            },
            {
                $replaceRoot: {
                    newRoot: '$users',
                },
            },
            {
                $project: {
                    email: 1,
                },
            },
        ];

        [user] = await TokenCollection
            .aggregate(pipeline, { allowDiskUse: true })
            .toArray();
    } catch (error) {
        return next(error);
    }

    res.status(200).send({
        user_id: user._id,
        email: user.email,
    });
}

module.exports = signIn;
