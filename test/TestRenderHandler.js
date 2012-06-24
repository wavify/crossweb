var log4js = require('log4js'),
    path = require('path');

var RenderHandler = require('../lib/handlers/RenderHandler').RenderHandler;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

exports.test = {

  'before all': function (test) {
    // Set log level to info
    var logger = log4js.getLogger('crossweb');
    logger.setLevel('INFO');
  
    // Setup before test.
    RenderHandler.setup(path.join(__dirname, 'MockConfig.json'));
  },

  'test parse': function (test) {
    var done = false;
    var output = null;
  
    RenderHandler.parse(path.join(__dirname, 'MockConfig.json'),
      function (option) {
        output = option;
      
        done = true;
      });
      
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var get = output.methods['get'];
        var post = output.methods['post'];
        
        test.assert(get['/test3'], 'Get method should have test3 path');
        test.assert(post['/test3'], 'Post method should have test3 path');
        
        test.assertEqual('sample', get['/test3'].model);
        test.assertEqual('get', get['/test3'].action);
        
        test.assertEqual('sample', post['/test3'].model);
        test.assertEqual('post', post['/test3'].action);
      });
  },
  
  'test request module': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/test3', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    RenderHandler.request(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(200, response.statusCode);
        test.assertEqual('application/json', response.header['Content-Type']);
        test.assertEqual(JSON.stringify({ action: true, message: 'success' }), response.message);
      });
  },
  
  'test post module': function (test) {
    var done = false;
    
    var request = new MockRequest('POST', '/test3', {});
    var response = new MockResponse(
      function () { 
        done = true;
      });
      
    RenderHandler.request(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(200, response.statusCode);
        test.assertEqual('application/json', response.header['Content-Type']);
        test.assertEqual(JSON.stringify({ action: true, message: 'hello' }), response.message);
      });
  },
  
  'test request notfound module': function (test) {
    var done = false;
  
    var request = new MockRequest('GET', '/test4', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
      
      RenderHandler.request(request, response);
      
      test.waitFor(
        function (time) {
          return done || time > timeout;
        },
        function () {
          test.assertEqual(404, response.statusCode);
        });
  },
  
  'test request notfound method': function (test) {
    var done = false;
  
    var request = new MockRequest('GET', '/test5', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
      
      RenderHandler.request(request, response);
      
      test.waitFor(
        function (time) {
          return done || time > timeout;
        },
        function () {
          test.assertEqual(404, response.statusCode);
        });
  }

}