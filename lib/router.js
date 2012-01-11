var async = require('async'),
    fs = require('fs'),
    log4js = require('log4js'),
    path = require('path'),
    url = require('url');

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
  
  var _self = this;
  var output = Router.parse(configPath,
    function (output) {
      _self.methods = output.methods || {};
      _self.handlers = output.handlers || {};
      _self.filters = output.filters || [];
      
      logger.debug ('parse config end');
    });
  
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
  
  var ip = request.headers['x-forward-for'] || 
           request.connection ? request.connection.remoteAddress : 
           'unknown';
  var resource = url.parse(request.url);
           
  logger.info (ip + ' - ' + request.method + ' ' + request.url);
  logger.debug ('Request resource: ' + resource.pathname);
  
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
        var action = self.request(request.method, resource.pathname);
        action(request, response);
      }
    };

    if (filter) {
      filter.check(request, callback);
    } else {
      var action = self.request(request.method, resource.pathname);
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
 * @param {Function} rootCallback
 *
 * @return {Object} output contains 2 object, methods which contain path and
                    list of handlers.
 */
Router.parse = function (configPath, rootCallback) {
  rootCallback = rootCallback || function () {};
  
  var output = {
    modules: [],
    methods: {},
    handlers: {},
    filters: []
  };
  
  var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Initial modules
  var initial = configObject.initial || [];
  var initialIndex = 0;
  async.whilst(
    function () { return initialIndex < initial.length; },
    function (callback) {
      var module = initial[initialIndex];
      
      var modulePath = path.join(path.dirname(configPath), 'modules', module);
      var modulePathJS = modulePath + '.js';
      
      var frameworkModulePath = path.join(__dirname, 'modules', module);
      var frameworkModulePathJS = frameworkModulePath + '.js';
      
      var loadedModule = null;
      
      try {
        if (path.existsSync(modulePath) || 
            path.existsSync(modulePathJS)) {
          loadedModule = require(modulePath);
        } else if (path.existsSync(frameworkModulePath) ||
                   path.existsSync(frameworkModulePathJS)) {
          loadedModule = require(frameworkModulePath);
        }
        
        if (loadedModule) {
          if (loadedModule.setup) {
            
            loadedModule.setup(configPath, function () {
              output.modules.push(loadedModule);
              
              initialIndex++;
              callback();
            });
            
          } else {
            output.modules.push(loadedModule);
            
            initialIndex++;
            callback();
          }
        } else {
          logger.error (module + ' is not found');
          
          initialIndex++;
          callback();
        }
        
      } catch (moduleError) {
        logger.debug (moduleError);
        logger.error ('Cannot load module ' + module);
        
        initialIndex++;
        callback();
      }
      
    },
    function (err) {
      // Parse filters
      var filterIndex = 0;
      var filters = configObject.filters || [];

      async.whilst(
        function () { return filterIndex < filters.length; },
        function (callback) {

          var isExists = true;
          var filterPath = path.join(path.dirname(configPath), 'filters', filters[filterIndex] + '.js');
          if (!path.existsSync(filterPath)) {
            filterPath = path.join(__dirname, 'filters', filters[filterIndex] + '.js');
            if (!path.existsSync(filterPath)) {
              logger.error ('Filter ' + filters[filterIndex] + ' does not exists');
              isExists = false;
            }
          }

          if (isExists) {
            try {
              var filter = require(filterPath)[filters[filterIndex]];

              // Validate filter object
              if (filter.check && filter.fail) {

                if (filter.setup) {
                  filter.setup(configPath, function () {
                    output.filters.push(filter);
                    filterIndex++;
                    callback();
                  });
                } else {
                  output.filters.push(filter);

                  filterIndex++;
                  callback();
                }

              } else {
                logger.error (filters[filterIndex] + ' is not filter object');

                filterIndex++;
                callback();
              }

            } catch (filterError) {
              logger.debug (filterError);
              logger.error ('Cannot load filter ' + filters[filterIndex]);

              filterIndex++;
              callback();
            }
          } else {
            filterIndex++;
            callback();
          }

        },
        function (err) {

          var routes = configObject.routes;
          var defaultMethods = Router.defaultMethods;
          var pattern = Router.pattern;

          var totalRoute = 0;
          var routeIndex = 0;
          var routeList = [];

          for (var url in routes) {
            totalRoute++;
            routeList.push(url);
          }

          async.whilst(
            function () { 
              logger.trace ('Loaded route: ' + routeIndex + ', ' + totalRoute)
              return routeIndex < totalRoute; 
            },
            function (callback) {
              var url = routeList[routeIndex];
              logger.trace (url);
              if (pattern.test(url)) {
                
                var fragments = url.split(':');
                var method = fragments[0].toLowerCase();
                var resource = fragments[1];

                var action = routes[url];
                var target = action.handler;
                var parts = target.split('.');

                var handlerPath = path.join(path.dirname(configPath), 'handlers', parts[0]);
                var handlerJSPath = handlerPath + '.js';

                if (!path.existsSync(handlerPath) && !path.existsSync(handlerJSPath)) {
                  handlerPath = path.join(__dirname, 'handlers', parts[0]);
                }

                try {
                  var handler = require(handlerPath);

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

                  if (!output.handlers[parts[0]]) {
                    output.handlers[parts[0]] = handler;

                    // Init method life cycle.
                    if (handler.setup) {
                      logger.trace ('Setup handler');
                      handler.setup(configPath, function () {
                        routeIndex++;
                        callback();
                      });
                    } else {
                      routeIndex++;
                      callback();
                    }
                  } else {
                    routeIndex++;
                    callback();
                  }

                } catch (handlerError) {
                  logger.debug (handlerError);
                  logger.error ('No handler ' + parts[0] + ' live in handlers directory');

                  routeIndex++;
                  callback();
                }
              } else {
                logger.error ('Invalid path ' + url);

                routeIndex++;
                callback();
              }

            },
            function (err) {
              rootCallback(output);
            });
        });
    });
  
};

exports.Router = Router;