var MockSessionModule = {

  verify: function (request, response, config) {
    response.writeHead(200, {});
    response.end('Session verify');
  }
  
};

exports.verify = MockSessionModule.verify;