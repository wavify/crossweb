var fs = require('fs'),
    log4js = require('log4js'),
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
    var options = GuardFilter.parse(configPath);
    
    this.methods = options.methods;
    this.locations = options.locations;
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
    
    var permit = true;
    var methods = this.methods;
    
    var path = url.parse(request.url).pathname;
    var method = methods[request.method.toLowerCase()];
    
    if (method) {
      var resource = method[path];
      if (resource && resource.length > 0) {
        permit = false;

        if (role && resource[role]) {
          permit = true;
        }
      }
    } 
    
    if (permit) {
      callback(null, true);
    } else {
      callback(null, false);
    }
    
  },
  
  /**
   * Filter response on fail request.
   *
   * @param {Object} request, http request
   * @param {Object} response, filter will render error here.
   */
  fail: function (request, response) {
    
    if (request.session) {
      // Authenticated, show unauthorized
      response.writeHead(401, {});
    } else {
      // Redirect to login
      response.writeHead(302, {
        'Location': this.locations.login
      });
    }
    
    response.end();
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
    methods: {},
    locations: {}
  };
  
  var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Parse location map
  var locations = configObject.guard.locations;
  if (locations) {
    output.locations = locations;
  }
  
  // Parse route map for allow option
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