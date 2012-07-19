var async = require('async'),
    fs = require('fs'),
    log4js = require('log4js'),
    path = require('path'),
    url = require('url');
    
var logger = log4js.getLogger('crossweb');

var _modules = null;
var RenderHandler = {
  setup: function (configPath, callback) {
    callback = callback || function () {};
    RenderHandler.parse(configPath,
      function (output) {
        _modules = output;
        callback();
      });
  },
  
  parse: function (configPath, callback) {
    callback = callback || function () {};
    
    var output = {
      modules: {},
      methods: {}
    };
    
    var routes = JSON.parse(fs.readFileSync(configPath)).routes;
    var prepare = [];
    for (var key in routes) {
      
      var model = routes[key].model;
      if (model) {
        prepare.push({ key: key, model: model });
      }
      
    }
    
    async.forEachSeries(prepare,
      function (item, next) {
        var parts = item.model.split('.');
        var name = parts[0].toLowerCase();
        var method = parts[1];
        
        var modelPath = path.join(path.dirname(configPath), 'modules', name, 'Model.js');
        if (!path.existsSync(modelPath)) {
          var modelName = name.charAt(0).toUpperCase() + name.slice(1);
          modelPath = path.join(path.dirname(configPath), 'modules', modelName + '.js');
        }
		
        try {
          var module = require(modelPath);
          if (module.setup) {
            var key = item.key;
          
            var directions = key.split(':');
            var command = directions[0].toLowerCase();
            var action = directions[1];
            
            if (!output.modules[name]) {
              module.setup(configPath, function (object) {
                output.modules[name] = object;
                
                if (!output.methods[command]) {
                  output.methods[command] = {};
                }
                
                if (object[method]) {
                  output.methods[command][action] = { model: name, action: method };
                }
                
                next();
              });
            }
            else {
              if (!output.methods[command]) {
                output.methods[command] = {};
              }
              
              if (output.modules[name][method]) {
                output.methods[command][action] = { model: name, action: method };
              }
              next();
            }
          }
          else {
            logger.error ('Require setup method to use with RenderHandler.');
            next();
          }
        }
        catch (modelError) {
          logger.debug (modelError);
          logger.error ('Invalid model %s.', name);
          next();
        }
      },
      function (error) {
        callback(output);
      });
    
  },
  
  request: function (request, response, callback) {
    callback = callback || function () {};
  
    var method = request.method.toLowerCase();
    var target = url.parse(request.url).pathname;
    
    var session = request.session;
    var ip = request.ip;
  
    var object = _modules.methods[method][target];
    if (object) {
      var model = _modules.modules[object.model];
      var fn = object.action;
      model[fn]({
        ip: ip,
        session: session,
        data: request.body
      },
      function (renderer) {
        renderer.render(request, response, callback);
      });
    }
    else {
      response.writeHead(404, {});
      response.end();
      callback();
    }
  }
}

exports.RenderHandler = RenderHandler;

exports.setup = RenderHandler.setup;
exports.request = RenderHandler.request;