var fs = require('fs'),
    log4js = require('log4js'),
    path = require('path');

var Router = require('../').Router;
var FileHandler = require('../lib/handlers/FileHandler').FileHandler;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

exports.test = {
  
  'before all': function (test) {
    //Set log level
    var logger = log4js.getLogger('crossweb');
    logger.setLevel('OFF');
  },
  
  'before each': function (test) {
    var configPath = path.join(__dirname, 'MockConfig.json');
    
    test.store = {
      router: new Router(configPath, FileHandler),
      config: JSON.parse(fs.readFileSync(configPath, 'utf8')) 
    };
  },
  
  'test parse initial': function (test) {
    var done = false;
    
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
        test.assert(output.modules, 'Router.parse should return module');
        test.assert(output.modules[0].store.called, 'setup method in SampleModule should called');
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
  
  'test parse model': function (test) {
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
        var models = output.models;
        
        var getMethod = methods.get;
        test.assert(getMethod['/test6'], 'get should have test6');
        
        var postMethod = methods.post;
        test.assert(postMethod['/test7'], 'post should have test7');
        
        var putMethod = methods.put;
        test.assert(putMethod['/test7'], 'put should have test7');
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
  
  'test get test6': function(test) { 
    
    var store = test.store;
    var router = store.router;
    
    var done = false;
    
    var action = router.request('GET', '/test6');
    var request = new MockRequest('GET', '/test6');
    var response = new MockResponse(
      function() {
        done = true;
      });
      
    action (request, response);
    
    test.waitFor(
      function(time) { 
        return done || time > timeout;
      },
      function() { 
        test.assertEqual(200, response.statusCode);
        test.assertEqual(JSON.stringify({ action: true, message: 'success' }), response.message);
      });
    
  },
  
  'test invoke': function (test) {
    
    var store = test.store;
    var router = store.router;
    
    var done = false;
    
    var request = new MockRequest('GET', '/sample.txt');
    request.connection = { remoteAddress: '127.0.0.1' };
    
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
    request.connection = { remoteAddress: '127.0.0.1' };
    
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
  
  'test invoke empty config': function (test) {
    var router = new Router(path.join(__dirname, 'MockEmptyConfig.json'), FileHandler);
    var done = false;
    
    var request = new MockRequest('GET', '/sample.txt');
    request.connection = { remoteAddress: '127.0.0.1' };
    
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
    request.connection = { remoteAddress: '127.0.0.1' };
    
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
  
};
