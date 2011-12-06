var log4js = require('log4js'),
    http = require('http');
    
var Router = require('./router').Router;
var FileHandler = require('./modules/FileHandler').FileHandler;

var logger = log4js.getLogger('framework');

var Crossweb = function (configPath) {
  
  var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  this.router = new Router(configPath, FileHandler, []);
  this.instance = http.createServer(router.invoke);
  
}

Crossweb.prototype.run = function () {
  
}

exports.Crossweb = Crossweb;