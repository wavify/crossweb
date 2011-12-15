var fs = require('fs'),
    log4js = require('log4js');

var logger = log4js.getLogger('crossweb');

var Guard = require('../modules/guard.js');

var _guard = null;
var _locations = null;
var _security = null;
var _sessionKey = 'session';

var GuardHandler = {
  
  /**
   * Setup GuardHandler to get guard
   *
   * @param {String} configPath, configuration path.
   */
  setup: function (configPath) {
    _guard = Guard.instance(configPath);
    
    var configObject = JSON.parse(fs.readFileSync(configPath));
    var guardConfig = configObject.guard;
    var encryptionConfig = guardConfig.encryption;
    
    _locations = guardConfig.locations;
    _sessionKey = guardConfig.session;
    _security = new Guard.Security(encryptionConfig.method, 
                                       encryptionConfig.key,
                                       encryptionConfig.iv);
    
  },
  
  /**
   * Authenticate request
   *
   * @param {Object} request, HTTP Request
   * @param {Object} response, HTTP Response
   */
  authenticate: function (request, response) {
    var guard = _guard;
    var locations = _locations;
    var security = _security;
    
    if (guard) {
      
      if (request.session) {

        var session = request.session;

        // Redirect to index immediatly
        response.writeHead(302, {
          'Location': locations.index,
          'P3P': 'CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR',
          'Set-Cookie': [
            'user=' + session.user + '; Path=/;',
            'session=' + security.encrypt(JSON.stringify(session)) + '; Path=/;',
            'expireTime=' + (new Date().getTime() + 1314000000) + '; Path=/;'
          ]
        });
        response.end();
        
      } else {
        
        //Extract credential from request body
        var credential = request.body;

        if (credential) {

          guard.authenticate(
            credential,
            function (error, user) {

              if (!error) {

                var session = {
                  user: user.username,
                  roles: user.roles
                };

                response.writeHead(302, {
                  'Location': locations.index,
                  'P3P': 'CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR',
                  'Set-Cookie': [
                    'user=' + user.username + '; Path=/;',
                    _sessionKey + '=' + security.encrypt(JSON.stringify(session)) + '; Path=/;',
                    'expireTime=' + (new Date().getTime() + 1314000000) + '; Path=/;'
                  ]
                });
                response.end();

              } else {

                var output = {
                  message: error.message,
                  domain: error.domain,
                  code: error.code
                };

                response.writeHead(403, {});
                response.end(JSON.stringify(output));

              }

            });

        } else {
          response.writeHead(503, {});
          response.end();
        }
        
      }
      
    } else {
      response.writeHead(503, {});
      response.end();
    }
  }
  
}

exports.GuardHandler = GuardHandler;

exports.setup = GuardHandler.setup;
exports.authenticate = GuardHandler.authenticate;