var fs = require('fs'),
    path = require('path'),
    TestIt = require('test_it');

var Router = require('../').Router;
var FileHandler = require('../').FileHandler;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var config = null;
var router = null;

var timeout = 1000;

TestIt('TestRouter', {
  
  'before all': function (test) {
    
    router = new Router(path.resolve('MockConfig.json'), FileHandler);
    config = JSON.parse(fs.readFileSync('MockConfig.json', 'utf8'));
    
  },
  
  'test parse config': function (test) {
    var output = Router.parse(path.resolve('MockConfig.json'));
    
    var methods = output.methods;
    var modules = output.modules;
    
    test.assert(methods.get);
    test.assert(methods.post);
    
    test.assert(!methods['GET']);
    test.assert(!methods['POST']);
    
    var getMethod = methods.get;
    test.assert(getMethod['/verifySession']);
    test.assert(!getMethod['/test']);
    test.assert(!getMethod['/test2']);
    
    test.assert(!getMethod['/image/*']);
  },
  
  'test get verifySession': function (test) {
    
    var action = router.request('GET', '/verifySession');
    
    var request = new MockRequest('GET', '/verifySession');
    var response = new MockResponse();
    
    action(request, response, config);
    
    test.assertEqual('Session verify', response.message);
    
  },
  
  'test post verifySession': function (test) {
    
    var action = router.request('POST', '/verifySession');
    
    var request = new MockRequest('POST', '/verifySession');
    var response = new MockResponse();
    
    action(request, response, config);
    
    test.assertEqual('Session verify', response.message);
    
  },
  
  'test get file via router': function (test) {
    
    var done = false;
    
    var action = router.request('GET', '/sample.txt');
    
    var request = new MockRequest('GET', '/sample.txt');
    var response = new MockResponse(
      function () {
        done = true;
      });
      
    action(request, response, config);
      
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        
        var sample = fs.readFileSync('client/sample.txt', 'utf8');
        test.assertEqual(200, response.statusCode);
        test.assertEqual(sample, response.message);
        
      });
    
  },
  
  'test invoke': function (test) {
    
    var done = false;
    
    var request = new MockRequest('GET', '/sample.txt');
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    router.invoke(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var sample = fs.readFileSync('client/sample.txt', 'utf8');
        test.assertEqual(200, response.statusCode);
        test.assertEqual(sample, response.message);
      });
    
  }
  
});
