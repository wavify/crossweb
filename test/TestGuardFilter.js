var fs = require('fs'),
    path = require('path'),
    TestIt = require('test_it');

var GuardFilter = require('../lib/filters/GuardFilter').GuardFilter;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

TestIt('TestGuardFilter', {
  
  'before all': function (test) {
    GuardFilter.setup(path.resolve('MockConfig.json'));
  },
  
  'test guard parse config': function (test) {
    var output = GuardFilter.parse(path.resolve('MockConfig.json'));
    
    test.assert(output.methods, 'Output should have methods map');
    
    var getMethod = output.methods.get;
    
    var firstResource = getMethod['/resource/1'];
    test.assert(firstResource['role1'], 'First resource should have role1');
    test.assert(firstResource['role2'], 'First resource should not have role2');
    test.assertEqual(firstResource.length, 2, 'First resource should have two elements');
    
    var fifthResource = getMethod['/resource/5'];
    test.assertEqual(fifthResource.length, 0, 'Fifth resource should have empty array');
    
    var postMethod = output.methods.post;
    var verifyResource = postMethod['/verifySession'];
    test.assertEqual(verifyResource.length, 0, 'Verify resource should have empty array');
  },
  
  'test access resource 1': function (test) {
    
    var done1 = false;
    var done2 = false;
    var done3 = false;
    
    var output1 = null;
    var output2 = null;
    var output3 = null;
    
    var passRequest = new MockRequest('GET', '/resource/1', { session: { role: 'role1' }});
    GuardFilter.check(passRequest, function (error, output) {
      output1 = output;
      done1 = true;
    });
    
    var failRequest = new MockRequest('GET', '/resource/1', { session: { role: 'role2' }});
    GuardFilter.check(failRequest, function (error, output) {
      output2 = output;
      done2 = true;
    });
    
    var anonymouseRequest = new MockRequest('GET', '/resource/1');
    GuardFilter.check(anonymouse, function (error, output) {
      output3 = output;
      done3 = true;
    });
    
    test.waitFor(
      function (time) {
        return (done1 && done2 && done3) || time > timeout;
      },
      function () {
        test.assert(output1 === true, 'Role1 should have permission to get resource');
        test.assert(output2 === false, 'Role2 should not have permission to get resource');
        test.assert(output3 === false, 'Anonymous should not have permission to get resource');
      });
    
  },
  
  'test access resource 2': function (test) {
    
    var done1 = false;
    var done2 = false;
    var done3 = false;
    
    var output1 = null;
    var output2 = null;
    var output3 = null;
    
    var passRequest = new MockRequest('GET', '/resource/2', { session: { role: 'role1' }});
    GuardFilter.check(passRequest, function (error, output) {
      output1 = output;
      done1 = true;
    });
    
    var failRequest = new MockRequest('GET', '/resource/2', { session: { role: 'role2' }});
    GuardFilter.check(failRequest, function (error, output) {
      output2 = output;
      done2 = true;
    });
    
    var anonymouseRequest = new MockRequest('GET', '/resource/2');
    GuardFilter.check(anonymouse, function (error, output) {
      output3 = output;
      done3 = true;
    });
    
    test.waitFor(
      function (time) {
        return (done1 && done2 && done3) || time > timeout;
      },
      function () {
        test.assert(output1 === true, 'Role1 should have permission to get resource');
        test.assert(output2 === true, 'Role2 should have permission to get resource');
        test.assert(output3 === false, 'Anonymous should not have permission to get resource');
      });
    
  },
  
  'test access resource 3': function (test) {
    
    var done1 = false;
    var done2 = false;
    var done3 = false;
    
    var output1 = null;
    var output2 = null;
    var output3 = null;
    
    var passRequest = new MockRequest('GET', '/resource/3', { session: { role: 'role1' }});
    GuardFilter.check(passRequest, function (error, output) {
      output1 = output;
      done1 = true;
    });
    
    var failRequest = new MockRequest('GET', '/resource/3', { session: { role: 'role2' }});
    GuardFilter.check(failRequest, function (error, output) {
      output2 = output;
      done2 = true;
    });
    
    var anonymouseRequest = new MockRequest('GET', '/resource/1');
    GuardFilter.check(anonymouse, function (error, output) {
      output3 = output;
      done3 = true;
    });
    
    test.waitFor(
      function (time) {
        return (done1 && done2 && done3) || time > timeout;
      },
      function () {
        test.assert(output1 === false, 'Role1 should not have permission to get resource');
        test.assert(output2 === true, 'Role2 should have permission to get resource');
        test.assert(output3 === false, 'Anonymous should not have permission to get resource');
      });
    
  },
  
  'test access resource 4': function (test) {
    
    var done1 = false;
    var done2 = false;
    
    var output1 = null;
    var output2 = null;
    
    var passRequest = new MockRequest('GET', '/resource/4', { session: { role: 'role1' }});
    GuardFilter.check(passRequest, function (error, output) {
      output1 = output;
      done1 = true;
    });
    
    var anonymouseRequest = new MockRequest('GET', '/resource/4');
    GuardFilter.check(anonymouse, function (error, output) {
      output2 = output;
      done2 = true;
    });
    
    test.waitFor(
      function (time) {
        return (done1 && done2) || time > timeout;
      },
      function () {
        test.assert(output1 === true, 'Role1 should have permission to get resource');
        test.assert(output2 === true, 'Anonymous should have permission to get resource');
      });
    
  },
  
  'test access resource 5': function (test) {
    
    var done1 = false;
    var done2 = false;
    
    var output1 = null;
    var output2 = null;
    
    var passRequest = new MockRequest('GET', '/resource/5', { session: { role: 'role1' }});
    GuardFilter.check(passRequest, function (error, output) {
      output1 = output;
      done1 = true;
    });
    
    var anonymouseRequest = new MockRequest('GET', '/resource/5');
    GuardFilter.check(anonymouse, function (error, output) {
      output2 = output;
      done2 = true;
    });
    
    test.waitFor(
      function (time) {
        return (done1 && done2) || time > timeout;
      },
      function () {
        test.assert(output1 === true, 'Role1 should have permission to get resource');
        test.assert(output2 === true, 'Anonymous should have permission to get resource');
      });
    
  }
  
});
