var MockDefaultModule = {
  
  'compressAction': function (request, response, config) {
    response.writeHead(200, {});
    response.end('compress');
  },
  'staticAction': function (request, response, config) {
    response.writeHead(200, {});
    response.end('static');
  },
  'postAction': function (request, response, config) {
    response.writeHead(200, {});
    response.end('post');
  },
  'defaultAction': function (request, response, config) {
    response.writeHead(200, {});
    response.end('default');
  },
  
  'resourceAction': function (request, response, config) {
    response.writeHead(200, {});
    response.end('resource');
  }
  
};

exports.compress = MockDefaultModule.compressAction;
exports.staticfile = MockDefaultModule.staticAction;
exports.post = MockDefaultModule.postAction;
exports.defaultaction = MockDefaultModule.defaultAction;