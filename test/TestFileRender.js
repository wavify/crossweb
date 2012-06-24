var fs = require('fs'),
    path = require('path');

var FileRender = require('../lib/render').FileRender;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

exports.test = {
  
  'test render path': function (test) {
    var done = false;
    var file = path.join(__dirname, 'sample.txt');

    var request = new MockRequest('GET', '/sample.txt', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var renderer = new FileRender(file);
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var output = fs.readFileSync(file, 'utf8');
        test.assertEqual(200, response.statusCode);
        test.assertEqual(output, response.message);
      });
  },
  
  'test render invalid file': function (test) {
    var done = false;
    var file = path.join(__dirname, 'notfound.txt');

    var request = new MockRequest('GET', '/notfound.txt', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var renderer = new FileRender(file);
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(404, response.statusCode);
        test.assertEqual('', response.message);
      });
  },
  
  'test render null': function (test) {
    var done = false;

    var request = new MockRequest('GET', '/', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var renderer = new FileRender(null);
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(404, response.statusCode);
        test.assertEqual('', response.message);
      });
  },
  
  'test render directory that have index.html': function (test) {
    var done = false;
    var directory = path.join(__dirname, 'client');

    var request = new MockRequest('GET', '/client', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var renderer = new FileRender(directory);
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var output = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
        test.assertEqual(301, response.statusCode);
        test.assertEqual('/index.html', response.header['Location']);
      });
  },
  
  'test render directory that doesn\'t have index.html': function (test) {
    var done = false;
    var directory = path.join(__dirname, 'sample');

    var request = new MockRequest('GET', '/client/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    var renderer = new FileRender(directory);
    renderer.render(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(404, response.statusCode);
        test.assertEqual('', response.message);
      });
  }
  
};
