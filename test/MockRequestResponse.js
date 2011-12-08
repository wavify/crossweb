var MockRequest = function (method, url, headers) {
  this.method = method;
  this.url = url;
  this.headers =  headers;
  
  if (headers && headers.session) {
    this.session = headers.session;
  }
};

var MockResponse = function (callback) {
  this.statusCode = -1;
  this.header = {};
  
  this.message = '';
  
  this.callback = callback || function () {};
};

MockResponse.prototype.writeHead = function (code, header) {
  this.statusCode = code;
  this.header = header;
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