var fs = require('fs'),
    http = require('http'),
    log4js = require('log4js');
    
var Router = require('./router').Router;
var FileHandler = require('./handlers/FileHandler').FileHandler;

var logger = log4js.getLogger('crossweb');

var Crossweb = function (configPath) {
  
  var self = this;
  
  var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  this.configPath = configPath;
  this.config = config;
  
  log4js.configure(config.log);
  
  this.router = new Router(configPath, FileHandler);
  this.instance = http.createServer(function (request, response) {
    self.router.invoke(request, response);
  });
  
  this.start = false;
  
  fs.watchFile(configPath, function (current, previous) {
    if (current.mtime.getTime() != previous.mtime.getTime()) {
      logger.info ('Configuration file has been change. Reloading config')
      
      var newConfig = JSON.parse(fs.readFileSync(self.configPath, 'utf8'));
      log4js.configure(newConfig.log);
      
      self.config = newConfig;
    }
  });
  
};

Crossweb.prototype.run = function () {
  
  var self = this;
  
  var config = this.config;
  var instance = this.instance;
  
  logger.info ('Starting ' + config.name);
  
  instance.listen(config.port, config.address, function () {
    logger.info (config.name + ' is start on ' + config.address + ':' + config.port);
    self.start = true;
  });
    
};


exports.Crossweb = Crossweb;