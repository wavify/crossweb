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
    this.methods = GuardFilter.parse(configPath);
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
    
    var role = null;
    if (request.session) {
      role = request.session.role;
    }
    
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

/**
 * Parse authorization from main configuration file.
 *
 * @param {String} configPath, configuration file path.
 * 
 * @return {Object} configuration object which contains method maps.
 */
GuardFilter.parse = function (configPath) {
  var output = {
    methods: {}
  };
  
  var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  var routes = configObject.routes;
  var pattern = /^([a-z]+|\*)\:\/[\w\/]+$/;
  var defaultMethods = [ 'get', 'post' ];
  
  for (var path in routes) {
    if (pattern.test(path)) {
      var fragments = path.split(':');
      var method = fragments[0];
      var resource = fragments[1];
      
      var allow = {};
      var list = routes[path].allow;
      if (!list) {
        list = [];
      }
      
      for (var index = 0; index < list.length; index++) {
        allow[list[index]] = true;
      }
      allow.length = list.length;
      
      if (method === '*') {
        for (var index = 0; index < defaultMethods.length; index++ ) {
          var defaultMethod = defaultMethods[index];
          if (!output.methods[defaultMethod]) {
            output.methods[defaultMethod] = {};
          }
          
          output.methods[defaultMethod][resource] = [];
        }
      } else {
        if (!output.methods[method]) {
          output.methods[method] = {};
        }
        
        output.methods[method][resource] = allow;
      }
      
    } else {
      logger.error ('Cannot add ' + path + ' to GuardFilter.');
    }
  }
  
  return output;
}

exports.GuardFilter = GuardFilter;