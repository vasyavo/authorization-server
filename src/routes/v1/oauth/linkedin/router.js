const passport = require('passport');
const express = require('express');

passport.use(require('./strategy'));

const router = new express.Router();

router.get('/', require('../../../../utils/scopeQueryToHeader'), passport.authenticate('linkedin'));

router.get('/callback', passport.authenticate('linkedin', {
    failureRedirect: '/v1/oauth/linkedin/failure-callback',
    successRedirect: '/v1/oauth/linkedin/success-callback',
}));
router.get('/success-callback', require('./success-callback/get'));
router.get('/failure-callback', require('./failure-callback/get'));

module.exports = router;
