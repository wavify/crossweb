var events = require('events'),
    util = require('util');

var MockRequest = function (method, url, headers) {
  this.method = method;
  this.url = url;
  this.headers =  headers || {};
  
  if (headers && headers.session) {
    this.session = headers.session;
  }
  
  events.EventEmitter.call(this);
};

util.inherits(MockRequest, events.EventEmitter);

MockRequest.prototype.setEncoding = function (encoding) { 
  this.encoding = encoding; 
};

MockRequest.prototype.pause = function () {}
MockRequest.prototype.resume = function () {}

MockRequest.prototype.write = function (data) {
  this.emit('data', data);
}

MockRequest.prototype.end = function () {
  this.emit('end');
}

var MockResponse = function (callback) {
  this.statusCode = -1;
  this.header = {};
  
  this.message = '';
  
  this.callback = callback || function () {};
};

MockResponse.prototype.setHeader = function (key, value) {
  this.header[key] = value;
}

MockResponse.prototype.writeHead = function (code, header) {
  this.statusCode = code;
  
  for (var key in header) {
    this.header[key] = header[key];
  }
  
};

MockResponse.prototype.write = function (message) {
  this.message += message;
};

MockResponse.prototype.end = function (message) {
  if (message) {
    this.message += message;
  }
  
  this.callback();
};

exports.MockRequest = MockRequest;
exports.MockResponse = MockResponse;