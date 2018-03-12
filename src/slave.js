const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const co = require('co');
const addRequestId = require('express-request-id')();
const passport = require('passport');
const session = require('express-session');

const config = require('./config');
const logger = require('./utils/logger');
const osprey = require('./utils/osprey');

process.on('unhandledRejection', (reason, p) => {
    logger.error(p, reason);
});

process.on('uncaughtException', (error) => {
    logger.error(error);
});

const app = express();

co(function * () {
    app.use(addRequestId);
    app.use(compress());
    app.use(session({
        saveUninitialized: true,
        resave: false,
        rolling: false,
        secret: 'Secret',
    }));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    app.use(passport.initialize());

    app.disable('x-powered-by');
    app.use(bodyParser.json({ extended: true }));

    /* eslint-disable global-require */
    app.get('/v1/api', require('./utils/sendRamlDoc'));

    {
        const {
            middleware,
        } = yield* osprey();

        app.use(middleware);
        app.post('/v1/sign_up', require('./routes/v1/sign_up/post'));
        app.post('/v1/oauth/refresh', require('./handlers/user/refreshToken'));
        app.post('/v1/oauth/revoke', require('./handlers/user/revokeToken'));
        app.post('/v1/oauth/token', require('./routes/v1/oauth/token/post'));
        app.post('/v1/oauth/access_token', require('./routes/v1/oauth/access_token/post'));
        app.get('/v1/user_info', require('./routes/v1/user_info/get'));
        app.post('/v1/change_password', require('./routes/v1/change_password/post'));

        if (config.thirdParty.facebook.clientId) {
            app.use('/v1/oauth/facebook', require('./routes/v1/oauth/facebook/router'));
        }

        if (config.thirdParty.linkedIn.clientId) {
            app.use('/v1/oauth/linkedin', require('./routes/v1/oauth/linkedin/router'));
        }
    }

    app.use(require('./utils/notFound'));
    app.use(require('./utils/errorHandler'));
    /* eslint-enable global-require */

    app.listen(config.port, () => {
        logger.info(`Server started at port ${config.port} in ${config.env} environment:`, config);
    });
});

module.exports = app;
