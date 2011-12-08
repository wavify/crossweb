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
  },
  
  authenticate: function (request, response) {
  }
  
}

exports.authenticate = GuardHandler.authenticate;