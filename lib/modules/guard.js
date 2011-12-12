var url = require('url');

var _instance = null;

var Guard = function (configPath) {
  
}

/**
 * Authenticate with credential
 *
 * @param {Object} credential
 * @param {Function(error, output)} callback, authenticate result
 */
Guard.prototype.authenticate = function (credential, callback) {
  
}

/**
 * Check authorize user on resource
 *
 * @param {Object} resource, method and path object
 * @param {Object} user, user object from authenticate method
 * @param {Function(error, output)} callback, callback function
 */
Guard.prototype.authorize = function (resource, user, callback) {
  
}

/**
 * Guard resource constructor.
 *
 * @param {String} method, HTTP Method
 * @param {String} path, HTTP request path
 */
Guard.Resource = function (method, path) {
  this.method = method;
  this.path = path;
}

/**
 * Get Guard resource from HTTP request
 *
 * @param {Object} request, HTTP Request
 * @return {Object} resource for use in guard
 */
Guard.Resource.fromRequest = function (request) {
  var method = request.method;
  var path = url.parse(request.url).pathname;
  
  var output = new Guard.Resource(method, path);
  return output;
}

/**
 * Get guard instance
 *
 * @param {String} configPath, configuration path
 *
 * @return {Object} guard instance
 */
exports.instance = function (configPath) {
  if (!_instance) {
    _instance = new Guard(configPath);
  }
  
  return _instance;
}

exports.Guard = Guard;