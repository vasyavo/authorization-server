const passport = require('passport');
const express = require('express');

passport.use(require('./strategy'));

const router = new express.Router();

const strategyOptions = {
    authType: 'rerequest',
    scope: ['public_profile', 'email'],
    return_scopes: true,
};

router.get('/', require('../../../../utils/scopeQueryToHeader'), passport.authenticate('facebook', strategyOptions));
router.get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/v1/oauth/facebook/failure-callback',
    successRedirect: '/v1/oauth/facebook/success-callback',
}));
router.get('/success-callback', require('./success-callback/get'));
router.get('/failure-callback', require('./failure-callback/get'));

module.exports = router;
