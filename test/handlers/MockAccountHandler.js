var MockAccountModule = {

  getVerify: function (request, response, config) {
    response.writeHead(200, {});
    response.end('Account get verify');
  },
  postVerify: function (request, response, config) {
    response.writeHead(200, {});
    response.end('Account post verify');
  }
  
}

exports.getVerify = MockAccountModule.getVerify;
exports.postVerify = MockAccountModule.postVerify;
