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
      cookie: 'user=admin@sample; session=HFk/Rh6Asdx6J5LqNyaKJuy/Yqb7KiKKFOlLyetcXefWPegtLb7cixtOQK9qs6P7; expireTime=1325240582559'
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
        test.assert(result === true, 'Guard should allow admin use resource1');
        test.assert(request.session, 'Guard should create session from cookie');
        test.assertEqual('admin@sample', request.session.user, 'Session should have user attribute');
        test.assertEqual('role1', request.session.roles[0], 'Admin should have role1');
      });
  },
  
  'test authorize resource1 with invalid cookie session': function (test) {
    var done = false;
    var result = null;
    
    var request = new MockRequest('GET', '/resource/1', {
      cookie: 'user=admin@sample; session=invalidsession; expireTime=1325240582559'
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
        test.assert(result === false, 'Guard should not allow anonymous use resource1');
      });
  },
  
  'test authorize resource1 with query session': function (test) {
    var done = false;
    var result = null;
    
    var request = new MockRequest('GET', '/resource/1?session=HFk/Rh6Asdx6J5LqNyaKJuy/Yqb7KiKKFOlLyetcXefWPegtLb7cixtOQK9qs6P7');
    request.body = {
      session: 'HFk/Rh6Asdx6J5LqNyaKJuy/Yqb7KiKKFOlLyetcXefWPegtLb7cixtOQK9qs6P7'
    };
    
    GuardFilter.check(request, function (error, output) {
      result = output;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(result === true, 'Guard should allow admin use resource1');
        test.assert(request.session, 'Guard should create session from cookie');
        test.assertEqual('admin@sample', request.session.user, 'Session should have user attribute');
        test.assertEqual('role1', request.session.roles[0], 'Admin should have role1');
      });
  }
  
});