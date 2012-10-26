var fs = require('fs'),
    http = require('http'),
    log4js = require('log4js'),
    optimist = require('optimist'),
    util = require('util');
    
var Router = require('./router').Router;
var FileHandler = require('./handlers/FileHandler').FileHandler;

var logger = log4js.getLogger('crossweb');

var Crossweb = function (configPath) {
  
  var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  this.configPath = configPath;
  this.config = config;
  
  log4js.configure(config.log);
  
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
  
  logger.info ('Starting ' + config.name);
  
  var argv = optimist.alias('a', 'address')
                     .alias('p', 'port').argv;
  
  // To support heroku, we need to read port from environment.
  var address = argv.address || config.address;
  var port = argv.port || process.env.PORT || config.port;
  
  this.instance = http.createServer(function (request, response) {
    self.router.invoke(request, response);
  });

  this.router = new Router(this.configPath, FileHandler, function () {
    self.instance.listen(port, address, function () {
      logger.info (config.name + ' is started on ' + config.address + ':' + port);
      self.start = true;
      
      // After node Domain exit experimental, will move to node.js Domain
      process.on('uncaughtException', function (error) {
        logger.error('Something wrong and we can\'t handle it.\n%s', util.inspect(error, false, 3));
        if (!config.immortal) {
          log4js.flushAllLoggers(function () {
            process.exit(1);
          });
        }
      });
      
    });
  });

};


exports.Crossweb = Crossweb;