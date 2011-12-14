var path = require('path');

var TestIt = require('test_it');

var GuardHandler = require('../lib/handlers/GuardHandler').GuardHandler;
var MockRequest = require('./MockRequestResponse').MockRequest;
var MockResponse = require('./MockRequestResponse').MockResponse;

var timeout = 1000;

TestIt('TestGuardHandler', {
  
  'before all': function (test) {
    GuardHandler.setup(path.join(__dirname, 'MockConfig.json'));
  },
  
  'test authenticate with valid user': function (test) {
    
    var done = false;
    var request = new MockRequest('POST', '/authenticate');
    request.body = {
      username: 'admin@sample',
      password: '1password;',
      type: 'plain'
    };
    
    var response = new MockResponse(
      function () {
        done = true;
      });
      
    GuardHandler.authenticate(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(302, response.statusCode, 
          'Response should redirect to somewhere');
        test.assertEqual('/index', response.header.Location,
          'GuardHandler should redirect to index after authenticate success');
          
        test.assert(response.header['Set-Cookie'], 
          'GuardHandler should set cookie after authenticate success');
        test.assertEqual(
          [
            'user=admin@sample; Path=/;',
            'role=role1; Path=/;'
          ], 
          response.header['Set-Cookie'],
          'Cookie mismatch');

        test.assert(response.header['P3P'], 'Response header should have P3P header');
        test.assertEqual(
          'CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR',
          response.header['P3P']);
      });
    
  },
  
  'test authenticate with invalid user': function (test) {
    
    var done = false;
    var request = new MockRequest('POST', '/authenticate');
    request.body = {
      username: 'admin@sample',
      password: 'wrongpassword',
      type: 'plain'
    };
    
    var response = new MockResponse(
      function () {
        done = true;
      });
      
    GuardHandler.authenticate(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(403, response.statusCode, 
          'Response should return forbidden');
          
        test.assertEqual(
          JSON.stringify({
            message: 'Invalid password',
            domain: 30,
            code: 1011
            }), 
          response.message,
          'Authenticate fail message should response JSON object');
        
        test.assert(!response.header['Set-Cookie'], 
          'GuardHandler should not set cookie after authenticate fail');
        test.assert(!response.header['P3P'],
          'GuardHandler should not set P3P after authenticate fail');
      });
    
  },
  
});