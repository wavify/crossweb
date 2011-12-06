var fs = require('fs'),
    mime = require('mime'),
    path = require('path'),
    url = require('url');

/**
 * Static file handler object
 */
var FileHandler = {
  
  /**
   * Setup method for FileHandler which will set base client file if it
   * specified in configuration.
   *
   * @param {String} configuration file path which may or may not have _base
   */
  setup: function (configPath) {
    var base = path.resolve(configPath, '..', '../client');

    var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (configObject._base) {
      base = path.resolve(configPath, '..', configObject._base);
    } 
    
    this.base = base;
  },
  
  request: function (request, response, config) {
    
    var resource = url.parse(request.url);
    var resourcePath = path.join(this.base, resource.pathname);
    
    if (path.existsSync(resourcePath)) {
      var stat = fs.statSync(resourcePath);
      if (stat.isDirectory()) {
        response.writeHead(404, {});
        response.end();
      } else {
        
        response.writeHead(200, {
          'Content-Type': mime.lookup(resourcePath),
          'Content-Length': stat.size
        });
        
        var stream = fs.createReadStream(resourcePath);
        stream.on('data', function (data) {
          response.write(data);
        });
        
        stream.on('end', function () {
          response.end();
        });
        
      }
    } else {
      response.writeHead(404, {});
      response.end();
    }
    
  }
  
}

exports.FileHandler = FileHandler;