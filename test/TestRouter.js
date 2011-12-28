var fs = require('fs'),
    path = require('path'),
    TestIt = require('test_it');

var Router = require('../').Router;
var FileHandler = require('../lib/handlers/FileHandler').FileHandler;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

TestIt('TestRouter', {
  
  'before each': function (test) {
    var configPath = path.join(__dirname, 'MockConfig.json');
    
    test.store = {
      router: new Router(configPath, FileHandler),
      config: JSON.parse(fs.readFileSync(configPath, 'utf8')) 
    };
  },
  
  'test parse initial': function (test) {
    var done = false;
    
    
    Router.parse(path.join(__dirname, 'MockConfig.json'), function (options) {
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var SampleModule = require('./modules/SampleModule.js');
        test.assert(SampleModule.isCall, 'SampleModule setup should call after parse config');
      });
  },
  
  'test parse handler': function (test) {
    var done = false;
    
    var store = test.store;
    var router = store.router;
    
    var output = null;

    Router.parse(path.join(__dirname, 'MockConfig.json'), function (options) {
      output = options;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var methods = output.methods;
        var handlers = output.handlers;

        test.assert(methods.get, 'methods should have "get" property');
        test.assert(methods.post, 'methods should have "post" property');

        test.assert(!methods.GET, 'methods should not have "GET" property');
        test.assert(!methods.POST, 'methods should not have "POST" property');

        var getMethod = methods.get;
        test.assert(getMethod['/verifySession'], 'get list should have verifySession path');
        test.assert(!getMethod['/test'], 'get list should not have test path');
        test.assert(!getMethod['/test2'], 'get list should not have test2 path');

        test.assert(!getMethod['/image/*'], 'get list should have image path');

        var key;
        // Count handlers
        var handlerCount = 0;
        for (key in handlers) {
          handlerCount++;
        }

        test.assert(handlerCount > 0, 'Handler in output should not empty');

        // Count router handlers
        var routerHandlerCount = 0;
        for (key in router.handlers) {
          routerHandlerCount++;
        }
        test.assertEqual(routerHandlerCount, handlerCount, 'Router handler should equal to parser handler.');
      });
  },

  'test parse filter': function (test) {
    
    var done = false;
    
    var store = test.store;
    var router = store.router;
    
    var output = null;
    
    Router.parse(path.join(__dirname, 'MockConfig.json'), function (options) {
      output = options;
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var filters = output.filters;
        test.assertEqual(2, filters.length, 'Router should have two filters');
      });
    
  },
  
  'test get verifySession': function (test) {
    
    var store = test.store;
    var router = store.router;
    
    var action = router.request('GET', '/verifySession');
    
    var request = new MockRequest('GET', '/verifySession');
    var response = new MockResponse();
    
    action(request, response);
    
    test.assertEqual('Session verify', response.message);
    
  },
  
  'test post verifySession': function (test) {
    
    var store = test.store;
    var router = store.router;
    
    var action = router.request('POST', '/verifySession');
    
    var request = new MockRequest('POST', '/verifySession');
    var response = new MockResponse();
    
    action(request, response);
    
    test.assertEqual('Session verify', response.message);
    
  },
  
  'test get file via router': function (test) {
    
    var store = test.store;
    var router = store.router;
    
    var done = false;
    
    var action = router.request('GET', '/sample.txt');
    
    var request = new MockRequest('GET', '/sample.txt');
    var response = new MockResponse(
      function () {
        done = true;
      });
      
    action(request, response);
      
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        
        var samplePath = path.join(__dirname, 'client', 'sample.txt');
        var sample = fs.readFileSync(samplePath, 'utf8');
        test.assertEqual(200, response.statusCode);
        test.assertEqual(sample, response.message);
        
      });
    
  },
  
  'test invoke': function (test) {
    
    var store = test.store;
    var router = store.router;
    
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
        var samplePath = path.join(__dirname, 'client', 'sample.txt');
        var sample = fs.readFileSync(samplePath, 'utf8');
        test.assertEqual(200, response.statusCode);
        test.assertEqual(sample, response.message);
        
        var filters = router.filters;
        test.assert(filters[1].invoke, 'Router should invoke filter');
        
      });
    
  },
  
  'test invoke on no filter config': function (test) {
    
    var router = new Router(path.join(__dirname, 'MockNoFilterConfig.json'), FileHandler);
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
        var samplePath = path.join(__dirname, 'client', 'sample.txt');
        var sample = fs.readFileSync(samplePath, 'utf8');
        test.assertEqual(200, response.statusCode);
        test.assertEqual(sample, response.message);
      });
    
  },
  
  'test invoke unsupport method': function (test) {
    var store = test.store;
    var router = store.router;
    
    var done = false;
    
    var request = new MockRequest('HEAD', '/verifySession');
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
        test.assertEqual(404, response.statusCode);
      });
  }
  
});
