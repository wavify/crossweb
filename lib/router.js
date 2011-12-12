var fs = require('fs'),
    log4js = require('log4js'),
    path = require('path');

var logger = log4js.getLogger('crossweb');
var danger = log4js.getLogger('danger');

/**
 * Router constructor
 *
 * @param {String} configPath, path from path.resolve which will automatically 
 *                 parse by Router.parse
 * @param {Object} defaultHandler, Handler that will request if no handler can
 *                 perform or match request.
 */
var Router = function (configPath, defaultHandler) {
  // Parse config
  this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  var output = Router.parse(configPath);
  this.methods = output.methods || {};
  this.handlers = output.handlers || {};
  this.filters = output.filters || [];
  
  // Setup cycle for default handler.
  this.defaultHandler = defaultHandler;
  defaultHandler.setup(configPath);
};

/**
 * Invoke handler
 *
 * @param {Object} request, HTTP request object
 * @param {Object} response, HTTP response object
 */
Router.prototype.invoke = function (request, response) {
  
  try {
    var blockFilter = null;

    var self = this;
    
    var index = 0;
    var filter = self.filters[index];
    
    var callback = function (error, output) {
      index++;

      if (error || !output) {
        logger.debug (error || 'Filter fail');
        filter.fail(request, response);
      } else if (index < self.filters.length) {
        filter = self.filters[index];
        filter.check(request, callback);
      } else {
        var action = self.request(request.method, request.url);
        action(request, response);
      }
    };

    if (filter) {
      filter.check(request, callback);
    } else {
      var action = self.request(request.method, request.url);
      action(request, response);
    }
  } catch (uncaught) {
    danger.error (uncaught);
    
    response.writeHead(503, {});
    response.end();
  }
  
};

/**
 * Find action from HTTP method and request resource
 *
 * @param {String} method, HTTP method name which will lower case
 * @param {String} resource, HTTP request e.g. http://sample.com/resource
 *
 * @return {Function(request, response, config)} method for current resource
 */
Router.prototype.request = function (method, resource) {
  var action = null;
  
  var methodObject = this.methods[method.toLowerCase()];
  if (methodObject) {
    action = methodObject[resource];
  } 
  
  if (!action) {
    action = this.defaultHandler.request;
  }
  
  return action;
};

Router.defaultMethods = [ 'get', 'post' ];
Router.pattern = /^([a-z]+|\*)\:\/[\w\/]+$/;

/**
 * Parse config file for url map.
 *
 * @param {String} configPath, path from path.resolve(config file name)
 *
 * @return {Object} output contains 2 object, methods which contain path and
                    list of handlers.
 */
Router.parse = function (configPath) {
  var output = {
    methods: {},
    handlers: {},
    filters: []
  };
  
  var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Parse filters
  var filters = configObject.filters;
  for (var filterIndex = 0; filterIndex < filters.length; filterIndex++) {
    
    var filterPath = path.join(path.dirname(configPath), 'filters', filters[filterIndex] + '.js');
    if (!path.existsSync(filterPath)) {
      filterPath = path.join(__dirname, 'filters', filters[filterIndex] + '.js');
      if (!path.existsSync(filterPath)) {
        logger.error ('Filter ' + filters[filterIndex] + ' does not exists');
        continue;
      }
    }
    
    try {
      var filter = require(filterPath)[filters[filterIndex]];
      
      // Validate filter object
      if (filter.check && filter.fail) {
        if (filter.setup) {
          filter.setup(configPath);
        }
        
        output.filters.push(filter);
      } else {
        logger.error (filters[filterIndex] + ' is not filter object');
      }
      
    } catch (filterError) {
      logger.debug (filterError);
      logger.error ('Cannot load filter ' + filters[filterIndex]);
    }
    
  }

  // Parse handlers
  var route = configObject.routes;
  var defaultMethods = Router.defaultMethods;
  var pattern = Router.pattern;
  for (var url in route) {
    if (pattern.test(url)) {
      var fragments = url.split(':');
      var method = fragments[0].toLowerCase();
      var resource = fragments[1];
      
      var action = route[url];
      var target = action.handler;
      var parts = target.split('.');
      
      var handlerPath = path.join(path.dirname(configPath), 'handlers', parts[0]);
      var handlerJSPath = handlerPath + '.js';
      
      if (!path.existsSync(handlerPath) && !path.existsSync(handlerJSPath)) {
        handlerPath = path.join(__dirname, 'handlers', parts[0]);
      }
      
      try {
        
        var handler = require(handlerPath);
        if (!output.handlers[parts[0]]) {
          output.handlers[parts[0]] = handler;

          // Init method life cycle.
          if (handler.setup) {
            handler.setup(configPath);
          }
        }
        
        if (handler[parts[1]]) {
          if (method === '*') {
            for (var methodIndex = 0; methodIndex < defaultMethods.length; methodIndex++ ) {
              var defaultMethod = defaultMethods[methodIndex];
              if (!output.methods[defaultMethod]) {
                output.methods[defaultMethod] = {};
              }
              
              output.methods[defaultMethod][resource] = handler[parts[1]];
            }
          } else {
            if (!output.methods[method]) {
              output.methods[method] = {};
            }
            
            output.methods[method][resource] = handler[parts[1]];
            
          }
        } else {
          logger.error ('Handler ' + parts[0] + ' has no method ' + parts[1]);
        }
        
      } catch (handlerError) {
        logger.debug (handlerError);
        logger.error ('No handler ' + parts[0] + ' live in handlers directory');
      }
      
    } else {
      logger.error ('Invalid path ' + url);
    }
    
  }
  
  return output;
};

exports.Router = Router;