const osprey = require('osprey');
const ramlParser = require('raml-1-parser');
const mockService = require('osprey-mock-service');
const { compose } = require('compose-middleware');
const config = require('./../config');

const ospreyConfig = {
    server: {
        notFoundHandler: false,
    },
    disableErrorInterception: true,
};

module.exports = function * () {
    const ramlApi = yield ramlParser.loadRAML(config.raml, { rejectOnErrors: true });
    const raml = ramlApi.expand(true).toJSON({
        serializeMetadata: false,
    });
    const middleware = [];
    const handler = osprey.server(Object.assign({}, raml, {
        RAMLVersion: ramlApi.RAMLVersion(),
    }, ospreyConfig.server));
    const error = osprey.errorHandler(ospreyConfig.errorHandler);

    if (ospreyConfig.security) {
        middleware.push(osprey.security(raml, ospreyConfig.security));
    }

    middleware.push(handler);

    if (!ospreyConfig.disableErrorInterception) {
        middleware.push(error);
    }

    const result = compose(middleware);

    result.ramlUriParameters = handler.ramlUriParameters;

    return {
        middleware: result,
        mockService: mockService(raml),
    };
};
