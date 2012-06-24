var path = require('path');

var HoganRender = require('../lib/render').HoganRender;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

exports.test = {
  
  'before all': function (test) {
    HoganRender._root = path.join(__dirname, 'client');
  },
  
  'test render object': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    
    var renderer = new HoganRender(path.join(__dirname, 'sample.tmpl'), { name: 'llun' });
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(200, response.statusCode);
        test.assertEqual('text/html', response.header['Content-Type']);
        test.assertEqual('<h1>llun</h1>', response.message);
      });
  },
  
  'test render null': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    
    var renderer = new HoganRender(path.join(__dirname, 'sample.tmpl'));
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(503, response.statusCode);
      });
  },
  
  'test render not an object': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    
    var renderer = new HoganRender(path.join(__dirname, 'sample.tmpl'), 'llun');
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(503, response.statusCode);
      });
  },
  
  'test render not found template file': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    
    var renderer = new HoganRender(path.join(__dirname, 'notfound.tmpl'), { name: 'llun' });
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(503, response.statusCode);
      });
  }

};
