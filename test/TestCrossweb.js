var fs = require('fs'),
    path = require('path'),
    TestIt = require('test_it');

var Router = require('../').Router;
var FileHandler = require('../').FileHandler;

var MockFilter = require('./MockFilter.js').MockFilter;
var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

TestIt('TestRouter', {
  
  'before each': function (test) {
    
    var filters = [ new MockFilter('mock1', true), new MockFilter('mock2', true) ];
    
    test.store = {
      filters: filters,
      router: new Router(path.resolve('MockConfig.json'), FileHandler, filters),
      config: JSON.parse(fs.readFileSync('MockConfig.json', 'utf8')) 
    }
    
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
  }
  
});
