var log4js = require('log4js'),
    path = require('path');

var Error = require('../lib/error.js').ErrorCode;
var Guard = require('../lib/modules/guard.js').Guard;
var Resource = require('../lib/modules/guard.js').Resource;
var Session = require('../lib/modules/guard.js').Session;

var timeout = 1000;

exports.test = {
  
  'before each': function (test) {
    test.guard = new Guard(path.join(__dirname, 'MockConfig.json'));
  },
  
  'test authenticate with correct user': function (test) {
    var done = false;
    var output = null;
    
    var guard = test.guard;
    guard.authenticate({ 
      username: 'admin@sample', 
      password: '1password;', 
      type: 'plain' },
      function (error, session) {
        output = session;
                         
        done = true;
      });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(output, 'Authenticate should return session object');
        
        test.assert(output.id, 'Session object should have an id');
        test.assert(output.user, 'Session object should have an user property');
        test.assert(output.roles, 'Session object should have roles');
        
        test.assertEqual('admin@sample', output.user.username, 
          'User object username should be the same as input');
        test.assertEqual(1, output.roles.length,
          'User object should have 1 role');
        test.assertEqual('role1', output.roles[0],
          'User should have role1');
          
      });
    
  },
  
  'test authenticate with incorrect user': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    guard.authenticate({ 
      username: 'nouser',
      password: 'wrongpassword',
      type: 'plain' },
      function (error, user) {
        unexpect = error;
        output = user;
                         
        done = true;
      });
                       
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(unexpect, 'Guard should return error');
        test.assert(!output, 'Guard should not return any output');
        test.assertEqual(Error.AUTHENTICATE_NO_USER, unexpect.code,
          'Guard should return no user');
      });
    
  },
  
  'test authenticate with incorrect password': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    guard.authenticate({
      username: 'admin@sample',
      password: 'wrongpassword', 
      type: 'plain' },
      function (error, user) {
        unexpect = error;
        output = user;
        
        done = true;
      });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(unexpect, 'Guard should return error');
        test.assert(!output, 'Guard should not return any output');
        test.assertEqual(Error.AUTHENTICATE_WRONG_PASSWORD, unexpect.code,
          'Guard should return wrong password');
      });
    
  },
  
  'test authorize resource1 with admin': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var user = { username: 'admin@sample', roles: [ 'role1' ]};
    var resource = new Resource('get', '/resource/1');
    guard.authorize(resource, user, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === true, 'Guard should allow admin use resource1');
      });
  },
  
  'test authorize resource1 with anonymous': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var resource = new Resource('get', '/resource/1');
    guard.authorize(resource, null, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === false, 'Guard should not allow anonymous use resource1');
      });
  },
  
  'test authorize resource2 with admin': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var user = { username: 'admin@sample', roles: [ 'role1' ]};
    var resource = new Resource('get', '/resource/2');
    guard.authorize(resource, user, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === true, 'Guard should allow admin use resource2');
      });
  },
  
  'test authorize resource3 with admin': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var user = { username: 'admin@sample', role: ['role1']};
    var resource = new Resource('get', '/resource/3');
    guard.authorize(resource, user, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === false, 'Guard should not allow admin to use resource3');
      });
  },
  
  'test authorize resource4 with admin': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var user = { username: 'admin@sample', role: ['role1']};
    var resource = new Resource('get', '/resource/4');
    guard.authorize(resource, user, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === true, 'Guard should allow admin to use resource4');
      });
  },
  
  'test authorize resource4 with anonymous': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var resource = new Resource('get', '/resource/4');
    guard.authorize(resource, null, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === true, 'Guard should allow anonymous to use resource4');
      });
  },
  
  'test authorize resource5 with admin': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var user = { username: 'admin@sample', role: ['role1']};
    var resource = new Resource('get', '/resource/5');
    guard.authorize(resource, user, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === true, 'Guard should allow admin to use resource5');
      });
  },
  
  'test authorize resource5 with anonymous': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var resource = new Resource('get', '/resource/5');
    guard.authorize(resource, null, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === true, 'Guard should allow anonymous to use resource5');
      });
  },
  
  'test authorize no resource with anonymous': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var resource = new Resource('get', '/no/resource');
    guard.authorize(resource, null, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === true, 'Guard should allow anonymous to use no resource');
      });
  },
  
  'test authorize no method with anonymous': function (test) {
    var done = false;
    var unexpect = null;
    var output = null;
    
    var guard = test.guard;
    
    var resource = new Resource('put', '/resource/1');
    guard.authorize(resource, null, function (error, result) {
      unexpect = error;
      output = result;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(!unexpect, 'Guard should not return any unexpect');
        test.assert(output === true, 'Guard should allow anonymous to use no method');
      });
  },
  
  'test resume session': function (test) {
    var done = false;
    var output = null;
    
    var now = new Date('October 13, 1975 11:13:00').getTime();
    
    var guard = test.guard;
    var id = 'C3/RQ10dWiBsjttNQZkSP4jSE1LJd+LishJ9kgMw0AEonIfejuHg4k2aclH8Gn+kJOjUMb6hqGkx1Ae2KsPSEcTnY3LbtXVUDxV3F4nfBR6/5uK4lg5TckwoZi12gr5Q';
    
    guard.resume(id, function (error, updatedSession) {
      output = updatedSession;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(output.id, 'Session should have an id');
        test.assert(output.id !== id, 'Session id should changed');
        test.assert(output.timestamp > now, 'Session timestamp should updated');
      });
  },
  
  'test validate session': function (test) {
    var done = false;
    var output = null;
    
    var guard = test.guard;
    var id = 'C3/RQ10dWiBsjttNQZkSP4jSE1LJd+LishJ9kgMw0AEonIfejuHg4k2aclH8Gn+kJOjUMb6hqGkx1Ae2KsPSEcTnY3LbtXVUDxV3F4nfBR6/5uK4lg5TckwoZi12gr5Q';
    
    guard.validate(id, function (error, session) {
      output = session;
      
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(output.id, 'Session should have an id');
        test.assertEqual(id, output.id, 'Session should have the same id as input');
        test.assertEqual('sample', output.user.username);
        test.assert(output.roles, 'Session should have roles');
      });
  }
  
};
