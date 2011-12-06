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
   * 
   * @return {Boolean} true, if request is pass this filter, otherwise false
   */
  check: function (request) {
    return true;
  },
  
  /**
   * Filter response on fail request.
   *
   * @param {Object} response, filter will render error here.
   */
  fail: function (response) {
    
  }
  
}

exports.GuardFilter = GuardFilter;