exports.FrameworkError = require('./lib/error').FrameworkError;
exports.ErrorCode = require('./lib/error').ErrorCode;
exports.ErrorDomain = require('./lib/error').ErrorDomain;

exports.Crossweb = require('./lib/crossweb').Crossweb;
exports.Router = require('./lib/router').Router;
exports.Render = require('./lib/render');

exports.FormFilter = require('./lib/filters/FormFilter').FormFilter;
exports.GuardFilter = require('./lib/filters/GuardFilter').GuardFilter;
exports.FileHandler = require('./lib/handlers/FileHandler').FileHandler;
exports.GuardHandler = require('./lib/handlers/GuardHandler').GuardHandler;

exports.Guard = require('./lib/modules/guard');

exports.Test = {
  MockRequestResponse: require('./test/MockRequestResponse'),
  MockRequest: require('./test/MockRequestResponse').MockRequest,
  MockResponse: require('./test/MockRequestResponse').MockResponse
}