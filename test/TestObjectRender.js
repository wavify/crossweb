var ObjectRender = require('../lib/render').ObjectRender;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

exports.test = {
  
  'test render string': function (test) {
    var done = false;
    
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var request = new MockRequest('GET', '/sample', {});
    var renderer = new ObjectRender('hello, world');
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual('hello, world', response.message);
      });
  },
  
  'test render object': function (test) {
    var done = false;
    var object = {
      message: 'hello, world',
      timestamp: new Date().getTime(),
      children: [ {name: 'a'}, {name: 'b'} ],
      role: { name: 'admin', level: 10 }
    };
    
    var request = new MockRequest('GET', '/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var renderer = new ObjectRender(object);
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(JSON.stringify(object), response.message);
      });
  },
  
  'test null': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var renderer = new ObjectRender(null);
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual('', response.message);
      });
  }

};
