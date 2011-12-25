var fs = require('fs'),
    log4js = require('log4js');

var logger = log4js.getLogger('crossweb');

var FrameworkError = require('../error.js').FrameworkError;

var Guard = require('../modules/guard.js');

var _guard = null;
var _sessionKey = 'session';
var _security = null;

var GuardFilter = {
  
  /**
   * Setup GuardFilter with configuration
   *
   * @param {String} configPath
   */
  setup: function (configPath) {
    _guard = Guard.instance(configPath);
    
    var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    var guardConfig = config.guard;
    var encryptionConfig = guardConfig.encryption;
    
    _sessionKey = guardConfig.session;
    _security = new Guard.Security(encryptionConfig.method, 
                                   encryptionConfig.key, encryptionConfig.iv);
    
  },
  
  /**
   * Check authorization with Guard.
   *
   * @param {Object} request, Incoming HTTP request
   * @param {Function(error, Boolean)} callback
   */
  check: function (request, callback) {
    // Parse cookie and set it to request.cookie
    if (request.headers['cookie']) {
      request.cookies = {};
      var cookie = request.headers['cookie'];
      var cookies = cookie.match(/[\w\d-]+=[^\s;,]+/ig);
      logger.trace (cookies);
      for (var index in cookies) {
        
        var splitPosition = cookies[index].indexOf('=');
        
        var key = cookies[index].substring(0, splitPosition).toLowerCase();
        var value = cookies[index].substring(splitPosition + 1);
        
        request.cookies[key] = value;
        logger.trace (key + ' : ' + value);
      }
    }
    
    var cryptedSession = null;
    if (request.cookies && request.cookies[_sessionKey]) {
      cryptedSession = request.cookies[_sessionKey];
    } else if (request.body && request.body[_sessionKey]) {
      cryptedSession = request.body[_sessionKey];
    }
    
    if (cryptedSession !== null) {
      var output = _security.decrypt(cryptedSession);
      try {
        var session = JSON.parse(output);
        request.session = session;
      } catch (e) {
        logger.debug (e);
        logger.debug ('CryptedSession: ' + cryptedSession);
        logger.error ('Invalid session');
      }
    }
    
    var guard = _guard;
    if (guard) {
      var resource = Guard.Resource.fromRequest(request);
      guard.authorize(resource, request.session, callback);
    } else {
      callback(new Error(FrameworkError.MODULE_NOT_INITIALIZE), false);
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