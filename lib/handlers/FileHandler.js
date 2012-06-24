var fs = require('fs'),
    log4js = require('log4js'),
    mime = require('mime'),
    path = require('path'),
    url = require('url');

var logger = log4js.getLogger('crossweb');

var FileRender = require('../render.js').FileRender;

/**
 * Static file handler object
 */
var FileHandler = {
  
  /**
   * Setup method for FileHandler which will set base client file if it
   * specified in configuration.
   *
   * @param {String} configuration file path which may or may not have _base
   * @param {Function} callback
   */
  setup: function (configPath, callback) {
    callback = callback || function () {};
    
    var base = path.resolve(configPath, '..', '../client');

    var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (configObject._base) {
      base = path.resolve(configPath, '..', configObject._base);
    }
    logger.debug ('Static base: ' + base);
    
    FileHandler.base = base;
    
    callback();
  },
  
  request: function (request, response, callback) {
    callback = callback || function () {};
    
    logger.debug ('Request: ' + request.url);
    
    var resource = url.parse(request.url);
    var resourcePath = path.join(FileHandler.base, resource.pathname);
    
    logger.trace ('Deep request: ' + resourcePath);
    
    var renderer = new FileRender(resourcePath);
    renderer.render(request, response, callback);
  }
  
};

exports.FileHandler = FileHandler;

exports.setup = FileHandler.setup;
exports.request = FileHandler.request;