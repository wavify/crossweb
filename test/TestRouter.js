var fs = require('fs'),
    log4js = require('log4js'),
    path = require('path'),
    TestIt = require('test_it');

var Router = require('../').Router;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var config = null;
var router = null;

TestIt('TestRouter', {
  
  'before all': function (test) {
    
    router = new Router(path.resolve('MockConfig.json'));
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
    
    var request = new MockRequest();
    var response = new MockResponse();
    
    action(request, response, config);
    
    test.assertEqual('Session verify', response.message);
    
  },
  
  'test post verifySession': function (test) {
    
    var action = router.request('POST', '/verifySession');
    
    var request = new MockRequest();
    var response = new MockResponse();
    
    action(request, response, config);
    
    test.assertEqual('Session verify', response.message);
    
  }
  
});
