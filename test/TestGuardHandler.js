var path = require('path');

var TestIt = require('test_it');

var GuardHandler = require('../lib/handlers/GuardHandler').GuardHandler;
var MockRequest = require('./MockRequestResponse').MockRequest;
var MockResponse = require('./MockRequestResponse').MockResponse;

var Security = require('../lib/modules/guard').Security;
var cipher = new Security('aes128', '5F4DCC3B5AA765D61D8327DEB882CF99', 
                          '2B95990A9151374ABD8FF8C5A7A0FE08');

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
        
        var session = cipher.encrypt(JSON.stringify({
          user: 'admin@sample',
          roles: ['role1']
        }));
        var expect = [
          'user=admin@sample; Path=/;',
          'session=' + session + '; Path=/;',
          'expireTime=' + (new Date().getTime() + 1314000000) + '; Path=/;'
        ];
        
        test.assert(response.header['Set-Cookie'], 
          'GuardHandler should set cookie after authenticate success');
          
        test.assertEqual(expect[0],  response.header['Set-Cookie'][0]);
        test.assertEqual(expect[1],  response.header['Set-Cookie'][1]);

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