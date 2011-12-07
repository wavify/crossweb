var fs = require('fs'),
    log4js = require('log4js'),
    mime = require('mime'),
    path = require('path'),
    url = require('url');

var logger = log4js.getLogger('framework');

/**
 * Guard filter is Security filter for crossweb project.
 */
var GuardFilter = {
  
  name: 'Guard Filter',
  
  /**
   * Setup method for GuardHandler which will scan all path
   *
   * @param {String} configuration file
   */
  setup: function (configPath) {
    
  },
  
  /**
   * Check incoming request and told caller is it pass or false
   *
   * @param {Object} request, HTTP request
   * @param {Function(error, Boolean)} callback, filter result
   * 
   * @return {Boolean} true, if request is pass this filter, otherwise false
   */
  check: function (request, callback) {
    callback(null, true);
  },
  
  /**
   * Filter response on fail request.
   *
   * @param {Object} response, filter will render error here.
   */
  fail: function (response) {
    
  }
  
}

GuardFilter.parse = function (configPath) {
  var output = {};
  
  var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  return output;
}

exports.GuardFilter = GuardFilter;