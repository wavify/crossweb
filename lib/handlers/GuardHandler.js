var fs = require('fs'),
    log4js = require('log4js');

var logger = log4js.getLogger('framework');

/**
 * Guard Handler for authenticate
 */
var GuardHandler = {
  
  /**
   * Setup method for GuardHandler
   *
   * @param {String} configuration file path
   */
  setup: function (configPath) {
    
    var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
  },
  
  authenticate: function (request, response) {
  }
  
};

exports.authenticate = GuardHandler.authenticate;