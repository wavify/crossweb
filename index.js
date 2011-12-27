exports.FrameworkError = require('./lib/error').FrameworkError;

exports.Crossweb = require('./lib/crossweb').Crossweb;
exports.Router = require('./lib/router').Router;

exports.Test = {
  MockRequestResponse: require('./test/MockRequestResponse'),
  MockRequest: require('./test/MockRequestResponse').MockRequest,
  MockResponse: require('./test/MockRequestResponse').MockResponse
}