module.exports = async function(req, res, next) {
    const xOauthScopes = req.query['X-OAuth-Scopes'];

    req.headers['x-oauth-scopes'] = xOauthScopes;

    next();
};
