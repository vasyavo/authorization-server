const qs = require('qs');

const {
    thirdParty: {
        facebook: {
            callbackURLThirdParty,
        },
    },
} = require('../../../../config');

module.exports = async (req, res, next) => {
    const queryString = qs.stringify({
        failure_message: 'Something went wrong',
    });

    res.redirect(`${callbackURLThirdParty}?${queryString}`);
};
