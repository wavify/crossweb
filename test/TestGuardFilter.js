var path = require('path');

var TestIt = require('test_it');

var GuardFilter = require('../lib/filters/GuardFilter').GuardFilter;
var MockRequest = require('./MockRequestResponse').MockRequest;
var MockResponse = require('./MockRequestResponse').MockResponse;

var Security = require('../lib/modules/guard').Security;

var timeout = 1000;

TestIt('TestGuardFilter', {
  
  'before all': function (test) {
    GuardFilter.setup(path.join(__dirname, 'MockConfig.json'));
  },
  
  'test authorize resource1 with admin': function (test) {
    
    var done = false;
    var result = null;
    
    var request = new MockRequest('GET', '/resource/1', {
      session: {
        user: 'admin@sample',
        roles: [ 'role1' ]
      }
    });
    
    GuardFilter.check(request, function (error, output) {
      result = output;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(result === true, 'Guard should allow admin use resource1')
      });
    
  },
  
  'test authorize resource1 with anonymous': function (test) {
    var done = false;
    var result = null;
    
    var request = new MockRequest('GET', '/resource/1');
    
    GuardFilter.check(request, function (error, output) {
      result = output;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(result === false, 'Guard should not allow anonymous use resource1');
      });
  },
  
  'test authorize resource1 with cookie': function (test) {
    var done = false;
    var result = null;
    
    var request = new MockRequest('GET', '/resource/1', {
      cookie: ''
    });
  }
  
});