var log4js = require('log4js');

var logger = log4js.getLogger('crossweb');

var CPError = require('common').CPError;
var FrameworkError = require('../error.js').FrameworkError;

var Guard = require('../modules/guard.js');

var _guard = null;

var GuardFilter = {
  
  /**
   * Setup GuardFilter with configuration
   *
   * @param {String} configPath
   */
  setup: function (configPath) {
    _guard = Guard.instance(configPath);
  },
  
  /**
   * Check authorization with Guard.
   *
   * @param {Object} request, Incoming HTTP request
   * @param {Function(error, Boolean)} callback
   */
  check: function (request, callback) {
    if (request.cookie) {
      // Parse session from cookie
    }
    
    var guard = _guard;
    if (guard) {
      var resource = Guard.Resource.fromRequest(request);
      guard.authorize(resource, request.session, callback);
    } else {
      callback(new CPError(
        'Guard filter does not setup yet',
        CPError.domain.WEB,
        FrameworkError.MODULE_NOT_INITIALIZE,
        guard), false);
    }
  },
  
  /**
   * Return 403 when got fail result
   */
  fail: function (request, response) {
    response.writeHead(403, {});
    response.end();
  }
  
}

exports.GuardFilter = GuardFilter;