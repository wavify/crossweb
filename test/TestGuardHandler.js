var path = require('path');

var ErrorDomain = require('../lib/error').ErrorDomain;
var ErrorCode = require('../lib/error').ErrorCode;

var GuardHandler = require('../lib/handlers/GuardHandler').GuardHandler;
var MockRequest = require('./MockRequestResponse').MockRequest;
var MockResponse = require('./MockRequestResponse').MockResponse;

var Security = require('../lib/modules/guard').Security;
var cipher = new Security('aes128', '5F4DCC3B5AA765D61D8327DEB882CF99', 
                          '2B95990A9151374ABD8FF8C5A7A0FE08');

var timeout = 1000;

exports.test = {
  
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
        test.assert(response.header['Set-Cookie'][1].indexOf('session=') == 0, 'Cookie should have session');
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
            domain: ErrorDomain.FRAMEWORK,
            code: ErrorCode.AUTHENTICATE_WRONG_PASSWORD
            }), 
          response.message,
          'Authenticate fail message should response JSON object');

        test.assert(!response.header['Set-Cookie'], 
          'GuardHandler should not set cookie after authenticate fail');
      });
    
  },
  
  'test authenticate with session': function (test) {
    var done = false;
    var request = new MockRequest('POST', '/authenticate', {
      session: {
        id: 'HFk/Rh6Asdx6J5LqNyaKJuy/Yqb7KiKKFOlLyetcXefupMAhr71r7KrmA/W9aRu+6kyCbwBiDE8S79ycen5EWMJRdiPpZYklZYVtcr200Xk=',
        user: { username: 'admin@sample' },
        roles: ['role1']
      }
    });
    request.body = {
      username: 'admin@sample',
      password: 'wrongpassword',
      type: 'plain'
    };
    
    var response = new MockResponse(
      function () {
        done = true;
      });
      
    var expect = Date.parse(new Date(new Date().getTime() + 1314000000).toUTCString());
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
          
        var expiresPattern = /(Sun|Mon|Tue|Wed|Thu|Fri|Sat).*GMT/;
        var actual = Date.parse(response.header['Set-Cookie'][0].match(expiresPattern)[0]);
        
        test.assert(actual == expect, 'Cookie expire time should extend');
      });
  },
  
  'test logout': function (test) {
    var done = false;
    var request = new MockRequest('GET', '/logout');
    
    var response = new MockResponse(
      function () {
        done = true;
      });
      
    GuardHandler.logout(request, response);
    
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
          
        var expiresPattern = /(Sun|Mon|Tue|Wed|Thu|Fri|Sat).*GMT/;
        var actual = Date.parse(response.header['Set-Cookie'][0].match(expiresPattern)[0]);
        var expect = new Date(0).getTime();
        
        test.assert(actual == expect, 'Cookie expire time should reset');
      });
  }
  
};