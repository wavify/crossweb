var MockDefaultModule = {
  
  'compress': function (request, response, config) {
    response.writeHead(200, {});
    response.end('compress');
  },
  'static': function (request, response, config) {
    response.writeHead(200, {});
    response.end('static');
  },
  'post': function (request, response, config) {
    response.writeHead(200, {});
    response.end('post');
  },
  'default': function (request, response, config) {
    response.writeHead(200, {});
    response.end('default');
  }
  
}

exports.compress = MockDefaultModule.compress;
exports.static = MockDefaultModule.static;
exports.post = MockDefaultModule.post;
exports.default = MockDefaultModule.default;