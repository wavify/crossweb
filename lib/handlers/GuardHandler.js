var fs = require('fs');

var Guard = require('../modules/guard.js');

var GuardHandler = {
  
  /**
   * Setup GuardHandler to get guard
   *
   * @param {String} configPath, configuration path.
   */
  setup: function (configPath) {
    this.guard = Guard.instance(configPath);
    
    var configObject = JSON.parse(fs.readFileSync(configPath));
    var guardConfig = configObject.guard;
    var encryptionConfig = guardConfig.encryption;
    
    this.locations = guardConfig.locations;
    this.security = new Guard.Security(encryptionConfig.method, 
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
    var guard = this.guard;
    var locations = this.locations;
    var security = this.security;
    
    if (guard) {
      
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
                  'session=' + security.encrypt(JSON.stringify(session)) + '; Path=/;',
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

      
    } else {
      response.writeHead(503, {});
      response.end();
    }
  }
  
}

exports.GuardHandler = GuardHandler;

exports.setup = GuardHandler.setup;
exports.authenticate = GuardHandler.authenticate;