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
    
    var expires = new Date(new Date().getTime() + 1314000000);
	
    var dayOfWeek = expires.getUTCDay() == 0 ? 'Sun' :
                    expires.getUTCDay() == 1 ? 'Mon' :
                    expires.getUTCDay() == 2 ? 'Tue' :
                    expires.getUTCDay() == 3 ? 'Wed' : 
                    expires.getUTCDay() == 4 ? 'Thu' :
                    expires.getUTCDay() == 5 ? 'Fri' : 'Sat';
    var monthOfYear = expires.getUTCMonth() == 0 ? 'Jan' :
                      expires.getUTCMonth() == 1 ? 'Feb' :
                      expires.getUTCMonth() == 2 ? 'Mar' :
                      expires.getUTCMonth() == 3 ? 'Apr' :
                      expires.getUTCMonth() == 4 ? 'May' :
                      expires.getUTCMonth() == 5 ? 'Jun' :
                      expires.getUTCMonth() == 6 ? 'Jul' :
                      expires.getUTCMonth() == 7 ? 'Aug' :
                      expires.getUTCMonth() == 8 ? 'Sep' :
                      expires.getUTCMonth() == 9 ? 'Oct' :
                      expires.getUTCMonth() == 10 ? 'Nov' : 'Dec';
    var expiresText = dayOfWeek + ', ' + 
                      (expires.getUTCDate() < 10 ? '0' + expires.getUTCDate() : expires.getUTCDate()) + '-' + 
                      monthOfYear + '-' +
                      expires.getUTCFullYear() + ' ' +
                      (expires.getUTCHours() < 10 ? '0' + expires.getUTCHours() : expires.getUTCHours()) + ':' +
                      (expires.getUTCMinutes() < 10 ? '0' + expires.getUTCMinutes() : expires.getUTCMinutes()) + ':' +
                      (expires.getUTCSeconds() < 10 ? '0' + expires.getUTCSeconds() : expires.getUTCSeconds()) + ' GMT';
                      
	
    if (guard) {
      
      if (request.session) {

        var session = request.session;

        // Redirect to index immediatly
        response.writeHead(302, {
          'Location': locations.index,
          'P3P': 'CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR',
          'Set-Cookie': [
            'user=' + session.user + '; Expires=' + expiresText + '; Path=/;',
            'session=' + security.encrypt(JSON.stringify(session)) + '; Expires=' + expiresText + '; Path=/;'
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
                    'user=' + user.username + '; Expires=' + expiresText + '; Path=/;',
                    _sessionKey + '=' + security.encrypt(JSON.stringify(session)) + '; Expires=' + expiresText +'; Path=/;'
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