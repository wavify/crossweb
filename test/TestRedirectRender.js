var RedirectRender = require('../lib/render').RedirectRender;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

exports.test = {
  
  'test permanent redirect': function (test) {
    var done = false;
    
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var request = new MockRequest('GET', '/sample', {});
    var renderer = new RedirectRender('http://google.com', RedirectRender.PERMANENT);
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(301, response.statusCode);
        test.assertEqual('http://google.com', response.header['Location']);
      });
  },
  
  'test temporary redirect': function (test) {
    var done = false;
    
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var request = new MockRequest('GET', '/sample', {});
    var renderer = new RedirectRender('http://google.com', RedirectRender.TEMPORARY);
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(302, response.statusCode);
        test.assertEqual('http://google.com', response.header['Location']);
      });
  },
  
  'test null redirect': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var renderer = new RedirectRender();
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(503, response.statusCode);
      });
  },
  
  'test invalid type': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var renderer = new RedirectRender('http://google.com');
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(301, response.statusCode);
        test.assertEqual('http://google.com', response.header['Location']);
      });
  }

};
