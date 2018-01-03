module.exports = async function(req, res, next) {
    const xOauthScopes = req.query['X-0Auth-Scopes'];

    req.headers['x-oauth-scopes'] = xOauthScopes;

    next();
};
