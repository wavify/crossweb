var fs = require('fs'),
    log4js = require('log4js');

var logger = log4js.getLogger('crossweb');

var Guard = require('../modules/guard.js');

var _guard = null;
var _locations = null;
var _sessionKey = 'session';

var GuardHandler = {
  
  /**
   * Setup GuardHandler to get guard
   *
   * @param {String} configPath, configuration path.
   * @param {Function} callback
   */
  setup: function (configPath, callback) {
    callback = callback || function () {};
    
    _guard = Guard.instance(configPath);
    
    var configObject = JSON.parse(fs.readFileSync(configPath));
    var guardConfig = configObject.guard;
    
    _locations = guardConfig.locations;
    _sessionKey = guardConfig.session;
    
    callback();
  },
  
  /**
   * Authenticate request
   *
   * @param {Object} request, HTTP Request
   * @param {Object} response, HTTP Response
   */
  authenticate: function (request, response, callback) {
    callback = callback || function () {};
    
    var guard = _guard;
    var locations = _locations;
    
    if (guard) {
      
      if (request.session) {
        
        var session = request.session;
        guard.resume(session.id, function (error, updatedSession) {
          if (error) {
            var output = {
              message: error.message,
              domain: error.domain,
              code: error.code
            };

            response.writeHead(403, {});
            response.end(JSON.stringify(output));
          }
          else {
            var expiresText = GuardHandler.cookieTime(updatedSession.timestamp + 1314000000);

            // Redirect to index immediatly
            response.writeHead(302, {
              'Location': locations.index + '?time=' + new Date().getTime(),
              'Set-Cookie': [
                _sessionKey + '=' + updatedSession.id + '; Expires=' + expiresText + '; Path=/;'
              ]
            });
            response.end(JSON.stringify({ 
              action: 'authenticate',
              success: true 
            }));
          }

          callback();
          
        });

        
      } else {
        
        //Extract credential from request body
        var credential = request.body;

        if (credential) {
          
          // Append ip to credential to detect connection in authenticator.
          credential.ip = request.ip;
          
          for (var key in credential) {
            credential[key] = unescape(credential[key]);
          }

          guard.authenticate(
            credential,
            function (error, session) {
              
              if (!error) {
                var expiresText = GuardHandler.cookieTime(session.timestamp + 1314000000);

                response.writeHead(302, {
                  'Location': locations.index + '?time=' + new Date().getTime(),
                  'Set-Cookie': [
                    'user=' + JSON.stringify(session.user) + '; Expires=' + expiresText + '; Path=/;',
                    _sessionKey + '=' + session.id + '; Expires=' + expiresText +'; Path=/;'
                  ]
                });
                response.end(JSON.stringify({ 
                  action: 'authenticate',
                  success: true 
                }));
                
              } else {

                var output = {
                  message: error.message,
                  domain: error.domain,
                  code: error.code
                };

                response.writeHead(403, {});
                response.end(JSON.stringify(output));

              }
              
              callback();

            });

        } else {
          response.writeHead(503, {});
          response.end();
          
          callback();
        }
        
      }
      
    } else {
      response.writeHead(503, {});
      response.end();
      
      callback();
    }
  },
  
  /**
   * Signout from system and destroy their session and cookies.
   *
   * @param {Object} request, HTTP Request
   * @param {Object} response, HTTP REsponse
   */
  logout: function (request, response, callback) {
    callback = callback || function () {};
    
    var locations = _locations;
    var expiresText = GuardHandler.cookieTime(0);
    response.writeHead(302, {
      'Location': locations.index + '?time=' + new Date().getTime(),
      'Set-Cookie': [
        'user=; Expires=' + expiresText + '; Path=/;',
        _sessionKey + '=; Expires=' + expiresText +'; Path=/;'
      ]
    });
    response.end(JSON.stringify({ 
      action: 'logout',
      success: true 
    }));
    
    callback();
  },
  
  /**
   * Change date timestamp to cookies time text.
   *
   * @param {Number} timestamp
   *
   * @return time string for use in cookies expire header
   */
  cookieTime: function (timestamp) {
    var expires = new Date(timestamp);
	
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
    return expiresText;
  }
  
}

exports.GuardHandler = GuardHandler;

exports.setup = GuardHandler.setup;
exports.authenticate = GuardHandler.authenticate;
exports.logout = GuardHandler.logout;