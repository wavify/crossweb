var path = require('path');

var GuardFilter = require('../lib/filters/GuardFilter').GuardFilter;
var MockRequest = require('./MockRequestResponse').MockRequest;
var MockResponse = require('./MockRequestResponse').MockResponse;

var Security = require('../lib/modules/guard').Security;

var timeout = 1000;

exports.test = {
  
  'before all': function (test) {
    GuardFilter.setup(path.join(__dirname, 'MockConfig.json'));
  },
  
  'test authorize resource1 with admin': function (test) {
    
    var done = false;
    var result = null;
    
    var request = new MockRequest('GET', '/resource/1', {
      session: {
        info: { username: 'admin@sample' },
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
      cookie: 'user={"username":"admin@sample"}; session=w/GJFcri6nRLkc6pMh4LIlSceYqkRIaYvtyZDn4FVmDD5fOakKezGGpT1OrNRHmTi+WNnfnoY3jqiVQG0Ve8Gw==; expireTime=1325240582559'
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
        test.assertEqual('admin@sample', request.session.user.username, 'Session should have user attribute');
        test.assertEqual('role1', request.session.roles[0], 'Admin should have role1');
      });
  },
  
  'test authorize resource1 with invalid cookie session': function (test) {
    var done = false;
    var result = null;
    
    var request = new MockRequest('GET', '/resource/1', {
      cookie: 'user={"username":"admin@sample"}; session=invalidsession; expireTime=1325240582559'
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
    
    var request = new MockRequest('GET', '/resource/1?session=w/GJFcri6nRLkc6pMh4LIlSceYqkRIaYvtyZDn4FVmDD5fOakKezGGpT1OrNRHmTi+WNnfnoY3jqiVQG0Ve8Gw==');
    request.body = {
      session: 'w/GJFcri6nRLkc6pMh4LIlSceYqkRIaYvtyZDn4FVmDD5fOakKezGGpT1OrNRHmTi+WNnfnoY3jqiVQG0Ve8Gw=='
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
        test.assertEqual('admin@sample', request.session.user.username, 'Session should have user attribute');
        test.assertEqual('role1', request.session.roles[0], 'Admin should have role1');
      });
  },
  
  'test authorize cluster resource with cluster admin user': function (test) {
    var done = false;
    var result = null;
    
    var request = new MockRequest('GET', '/resource/cluster');
    request.body = {
      session: 'w/GJFcri6nRLkc6pMh4LIrWWzSyas8am8re0CK08GpZ8lM/i2kSZFRl6II6EhJmOPk612JjY22gyVsPsKHU6hNHLL9qpzLbd5azOHHvylts='
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
        test.assert(result === true, 'Guard should allow llun use cluster');
        test.assert(request.session, 'Guard should create session from cookie');
        test.assertEqual('llun@crossflow.ws', request.session.user.username, 'Session should have user attribute');
        test.assertEqual('clusteradmin', request.session.roles[0], 'llun should have clusteradmin');
      });
 	}
  
};